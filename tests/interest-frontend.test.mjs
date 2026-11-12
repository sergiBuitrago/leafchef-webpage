import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/interest.js',import.meta.url),'utf8');
async function setup(open, settings = {}) {
 const fields={disabled:true,hidden:false},button={disabled:true},note={hidden:false},status={textContent:'closed',dataset:{},focused:false,scrolled:false,focus(){this.focused=true;},scrollIntoView(){this.scrolled=true;}};
 let submit,options,script,removed=false,resets=0,change;
 const consent={checked:false,addEventListener:(name,fn)=>{change=fn;}};
 const calls=[];
 const attributes={};
 const form={setAttribute:(key,value)=>{attributes[key]=value;},querySelector:s=>s==='fieldset'?fields:button,addEventListener:(event,fn)=>{submit=fn;},reportValidity:()=>true,reset(){},elements:{country:{value:'DE',append(){}},website:{value:''}}};
 const context={AbortSignal,document:{querySelector:s=>s==='#interest-form'?form:s==='#interest-consent'?consent:s==='#interest-note'?note:status,createElement:()=>({}),head:{append:s=>{script=s;}}},window:{turnstile:{render:(selector,config)=>{options=config;return 0;},reset:()=>{resets++;},remove:()=>{removed=true;}}},fetch:async(url,config)=>{calls.push({url,config});if(calls.length>1){if(settings.wait)await settings.wait;if(settings.networkError)throw new Error('Network failed');return settings.postResponse || {ok:true,json:async()=>({message:'Thank you!'})};}return {ok:true,json:async()=>({message:open?'open':'closed'})};}};
 vm.runInNewContext(source,context);
 await new Promise(resolve=>setImmediate(resolve));
 return {fields,button,status,calls,note,attributes,get script(){return script;},get options(){return options;},get removed(){return removed;},get resets(){return resets;},render:()=>{consent.checked=true;change();context.window.leafchefTurnstileReady();},withdraw:()=>{consent.checked=false;change();},submit:()=>submit({preventDefault(){}})};
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

test('success replaces the controls with a visible focused thank-you panel',async()=>{
 const app=await setup(true);app.render();app.options.callback('token');await app.submit();
 assert.equal(app.status.dataset.state,'success');
 assert.match(app.status.textContent,/Thank you! Your interest has been sent/);
 assert.equal(app.fields.hidden,true);assert.equal(app.note.hidden,true);
 assert.equal(app.status.focused,true);assert.equal(app.status.scrolled,true);
});
test('sending is visible, marks form busy and prevents duplicate requests',async()=>{
 let finish;const wait=new Promise(resolve=>{finish=resolve;});
 const app=await setup(true,{wait});app.render();app.options.callback('token');
 const pending=app.submit();
 assert.equal(app.button.textContent,'Sending...');assert.equal(app.status.dataset.state,'pending');assert.equal(app.attributes['aria-busy'],'true');
 await app.submit();assert.equal(app.calls.length,2);
 finish();await pending;assert.equal(app.attributes['aria-busy'],'false');
});
test('provider rejection shows an error and keeps the form for a new challenge',async()=>{
 const app=await setup(true,{postResponse:{ok:false,json:async()=>({message:'The form is busy. Please try again later.'})}});
 app.render();app.options.callback('token');await app.submit();
 assert.equal(app.status.dataset.state,'error');assert.match(app.status.textContent,/form is busy/);
 assert.equal(app.fields.hidden,false);assert.equal(app.note.hidden,false);assert.equal(app.resets,1);
 assert.equal(app.button.disabled,true);assert.equal(app.status.focused,true);
});
test('network failure never shows success and explains uncertain delivery',async()=>{
 const app=await setup(true,{networkError:true});app.render();app.options.callback('token');await app.submit();
 assert.equal(app.status.dataset.state,'error');assert.match(app.status.textContent,/could not confirm/);
 assert.equal(app.fields.hidden,false);assert.equal(app.resets,1);assert.equal(app.button.disabled,true);
});
