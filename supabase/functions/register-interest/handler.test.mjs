import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,configurationChecks} from './handler.mjs';
const env={SUPABASE_URL:'https://database.example',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-key',LEAFCHEF_INTEREST_ENABLED:'true',LEAFCHEF_BREVO_API_KEY:'test',LEAFCHEF_BREVO_SENDER_EMAIL:'sender@example.com',LEAFCHEF_INTEREST_TO_EMAIL:'owner@example.com',LEAFCHEF_SITE_ORIGIN:'https://leaf.example',LEAFCHEF_TURNSTILE_SECRET_KEY:'test'};
const request=(data,origin=env.LEAFCHEF_SITE_ORIGIN)=>new Request('https://function.example',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({consent:true,...data})});
const validChallenge=()=>Response.json({success:true,hostname:'leaf.example',action:'interest'});
test('closed configuration sends nothing',async()=>{
 const handler=createHandler({},()=>assert.fail('no network'));
 assert.equal((await handler(request({country:'DE',token:'token'}))).status,503);
 assert.equal((await (await handler(new Request('https://function.example'))).json()).message,'closed');
});
test('rejects visitor emails and all unrecognised fields before any network call',async()=>{
 const handler=createHandler(env,()=>assert.fail('no network'));
 for(const data of [{email:'visitor@example.com',token:'token'},{country:'DE',to:'attacker@example.com',token:'token'},{country:'invalid',token:'token'},{country:{code:'DE'},token:'token'},{country:'DE',website:'bot',token:'token'}]) {
  assert.equal((await handler(request(data))).status,400);
 }
});
test('rejects foreign origins and oversized bodies',async()=>{
 const handler=createHandler(env,()=>assert.fail('no network'));
 assert.equal((await handler(request({country:'DE'},'https://other.example'))).status,403);
 assert.equal((await handler(request({country:'x'.repeat(5000)}))).status,413);
});
test('wrong captcha hostname never sends a notification',async()=>{
 let calls=0;const handler=createHandler(env,async(url)=>{if(url.includes('/rpc/'))return Response.json(true);calls++;return Response.json({success:true,hostname:'other.example',action:'interest'});});
 assert.equal((await handler(request({country:'DE',token:'token'}))).status,400);assert.equal(calls,1);
});
test('country-only notification has fixed recipient, no reply-to and no visitor identification',async()=>{
 let body;
 const handler=createHandler(env,async(url,options)=>{
  if(url.includes('/rpc/'))return Response.json(true);
  if(url.includes('siteverify'))return validChallenge();
  body=JSON.parse(options.body);return new Response('',{status:201});
 });
 assert.equal((await handler(request({country:'DE',token:'token'}))).status,200);
 assert.deepEqual(body.to,[{email:'owner@example.com'}]);
 assert.equal(Object.hasOwn(body,'replyTo'),false);
 assert.match(body.textContent,/Germany/);
 assert.doesNotMatch(body.textContent,/visitor@example|token|127\.0\.0\.1/);
});
test('location is optional and provider errors remain errors',async()=>{
 let body;let status=201;
 const handler=createHandler(env,async(url,options)=>{
  if(url.includes('/rpc/'))return Response.json(true);
  if(url.includes('siteverify'))return validChallenge();
  body=JSON.parse(options.body);return new Response('',{status});
 });
 assert.equal((await handler(request({country:'',token:'token'}))).status,200);
 assert.match(body.textContent,/Not specified/);
 status=502;assert.equal((await handler(request({token:'token'}))).status,502);
});
test('preflight permits exact origin only',async()=>{
 const handler=createHandler(env);
 for(const [origin,code] of [[env.LEAFCHEF_SITE_ORIGIN,204],['https://other.example',403]]) {
  const response=await handler(new Request('https://function.example',{method:'OPTIONS',headers:{origin}}));
  assert.equal(response.status,code);
 }
});

test('exhausted shared budget blocks captcha and email with 429',async()=>{
 let calls=0;
 const handler=createHandler(env,async url=>{calls++;assert.match(url,/rpc\/leafchef_web_consume_interest_budget$/);return Response.json(false);});
 const response=await handler(request({country:'DE',token:'token'}));
 assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'3600');assert.equal(calls,1);
});
test('unavailable or unexpected budget result fails closed',async()=>{
 for(const mock of [()=>new Response('',{status:500}),()=>Response.json('true')]){
  let calls=0;const handler=createHandler(env,async()=>{calls++;return mock();});
  assert.equal((await handler(request({country:'DE',token:'token'}))).status,503);assert.equal(calls,1);
 }
});
test('budget credentials stay server-side and RPC receives no visitor data',async()=>{
 let calls=0;
 const handler=createHandler(env,async(url,options)=>{
  calls++;
  if(url.includes('/rpc/')){assert.equal(options.headers.apikey,'server-only-test-key');assert.equal(options.body,'{}');return Response.json(false);}
  assert.fail('unexpected provider call');
 });
 const response=await handler(request({country:'DE',token:'token'}));
 assert.equal(calls,1);assert.doesNotMatch(await response.text(),/server-only-test-key/);
});

test('missing affirmative consent blocks all provider calls',async()=>{
 const handler=createHandler(env,()=>assert.fail('no network'));
 assert.equal((await handler(request({country:'DE',token:'token',consent:false}))).status,400);
});

test('configuration diagnostics contain only booleans and identify invalid settings',()=>{
 const checks=configurationChecks({...env,LEAFCHEF_BREVO_SENDER_EMAIL:'LeafChef<sender@example.com>',LEAFCHEF_SITE_ORIGIN:'https://leaf.example/'});
 assert.equal(checks.brevoSenderEmail,false);assert.equal(checks.siteOrigin,false);
 assert.ok(Object.values(checks).every(value=>typeof value==='boolean'));
 assert.doesNotMatch(JSON.stringify(checks),/server-only-test-key|sender@example/);
});
test('runtime settings refresh between requests; closed diagnostics are reported once per state',async()=>{
 let settings={...env,LEAFCHEF_INTEREST_ENABLED:'false'};const reports=[];
 const handler=createHandler(()=>settings,()=>assert.fail('no provider call'),checks=>reports.push(checks));
 const get=()=>handler(new Request('https://function.example'));
 assert.equal((await (await get()).json()).message,'closed');
 await get();assert.equal(reports.length,1);
 settings={...env};assert.equal((await (await get()).json()).message,'open');
});
