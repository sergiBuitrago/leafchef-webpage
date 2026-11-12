import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/interest.js',import.meta.url),'utf8');
async function setup(open) {
 const fields={disabled:true},button={disabled:true},status={textContent:'closed'};
 let submit,options,script,removed=false,resets=0,change;
 const consent={checked:false,addEventListener:(name,fn)=>{change=fn;}};
 const calls=[];
 const form={querySelector:s=>s==='fieldset'?fields:button,addEventListener:(event,fn)=>{submit=fn;},reportValidity:()=>true,reset(){},elements:{country:{value:'DE',append(){}},website:{value:''}}};
 const context={document:{querySelector:s=>s==='#interest-form'?form:s==='#interest-consent'?consent:status,createElement:()=>({}),head:{append:s=>{script=s;}}},window:{turnstile:{render:(selector,config)=>{options=config;return 0;},reset:()=>{resets++;},remove:()=>{removed=true;}}},fetch:async(url,config)=>{calls.push({url,config});return {ok:true,json:async()=>({message:calls.length===1?(open?'open':'closed'):'Thank you!'})};}};
 vm.runInNewContext(source,context);
 await new Promise(resolve=>setImmediate(resolve));
 return {fields,button,status,calls,get script(){return script;},get options(){return options;},get removed(){return removed;},get resets(){return resets;},render:()=>{consent.checked=true;change();context.window.leafchefTurnstileReady();},withdraw:()=>{consent.checked=false;change();},submit:()=>submit({preventDefault(){}})};
}
test('closed form never loads the third-party challenge',async()=>{
 const app=await setup(false);
 assert.equal(app.fields.disabled,true);assert.equal(app.script,undefined);
});
test('open form requires token; expiration disables sending',async()=>{
 const app=await setup(true);app.render();
 assert.equal(app.button.disabled,true);
 assert.equal(app.options.sitekey,'0x4AAAAAAF-R_WrP0qn7H4Ao');
 assert.equal(app.options.action,'interest');
 app.options.callback('token');assert.equal(app.button.disabled,false);
 app.options['expired-callback']();assert.equal(app.button.disabled,true);
 await app.submit();assert.equal(app.calls.length,1);
});
test('valid submission sends token directly to Supabase and closes after success',async()=>{
 const app=await setup(true);app.render();app.options.callback('token');await app.submit();
 assert.equal(app.calls.length,2);
 assert.equal(app.calls[1].url,'https://vjkdmxknbtlrsnsqfayq.supabase.co/functions/v1/register-interest');
 assert.deepEqual(JSON.parse(app.calls[1].config.body),{country:'DE',website:'',consent:true,token:'token'});
 assert.equal(app.fields.disabled,true);assert.equal(app.removed,true);assert.equal(app.button.disabled,true);
});

test('open form does not load challenge before opt-in and withdrawal blocks submission',async()=>{
 const app=await setup(true);assert.equal(app.script,undefined);
 app.render();app.options.callback('token');app.withdraw();
 assert.equal(app.removed,true);assert.equal(app.button.disabled,true);
 await app.submit();assert.equal(app.calls.length,1);
});
