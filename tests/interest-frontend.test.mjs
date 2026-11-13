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
 const storage=settings.storage || new Map();
 const listeners={};
 const localStorage={getItem:key=>{if(settings.storageBlocked)throw new Error('Storage blocked');return storage.get(key) ?? null;},setItem:(key,value)=>{if(settings.storageBlocked)throw new Error('Storage blocked');storage.set(key,value);}};
 const countries=[];
 const form={setAttribute:(key,value)=>{attributes[key]=value;},querySelector:s=>s==='fieldset'?fields:button,addEventListener:(event,fn)=>{submit=fn;},reportValidity:()=>true,reset(){},elements:{country:{value:'DE',append(option){countries.push(option);}},website:{value:''}}};
 const context={AbortSignal,document:{querySelector:s=>s==='#interest-form'?form:s==='#interest-consent'?consent:s==='#interest-note'?note:status,createElement:()=>({}),head:{append:s=>{script=s;}}},window:{localStorage,addEventListener:(type,fn)=>{listeners[type]=fn;},turnstile:{render:(selector,config)=>{options=config;return 0;},reset:()=>{resets++;},remove:()=>{removed=true;}}},fetch:async(url,config)=>{calls.push({url,config});if(calls.length>1){if(settings.wait)await settings.wait;if(settings.networkError)throw new Error('Network failed');return settings.postResponse || {ok:true,json:async()=>({message:'Thank you!'})};}return {ok:true,json:async()=>({message:open?'open':'closed'})};}};
 if(settings.language) {
  context.document.documentElement={lang:settings.language};
  vm.runInNewContext(await readFile(new URL(`../public/locales/${settings.language}.js`,import.meta.url),'utf8'),context);
  vm.runInNewContext(await readFile(new URL('../public/i18n.js',import.meta.url),'utf8'),context);
 }
 vm.runInNewContext(source,context);
 await new Promise(resolve=>setImmediate(resolve));
 return {fields,button,status,calls,note,attributes,storage,countries,storageEvent:event=>listeners.storage(event),get script(){return script;},get options(){return options;},get removed(){return removed;},get resets(){return resets;},render:()=>{consent.checked=true;change();context.window.leafchefTurnstileReady();},withdraw:()=>{consent.checked=false;change();},submit:()=>submit({preventDefault(){}})};
}

for(const language of ['de','es','fr']) {
 test(`${language}: translated form states, countries, consent and successful return visit`,async()=>{
  const dictionary=JSON.parse(await readFile(new URL(`../locales/${language}.json`,import.meta.url),'utf8'));
  const runtime=JSON.parse(await readFile(new URL('../locales/runtime.json',import.meta.url),'utf8'));
  const closed=await setup(false,{language});
  assert.equal(closed.status.textContent,dictionary['The interest form is not open yet. Please check back later.']);
  assert.equal(closed.script,undefined);
  const storage=new Map();const app=await setup(true,{language,storage});
  assert.equal(app.script,undefined);app.render();
  assert.equal(app.options.language,language);
  assert.equal(app.countries.find(option=>option.value==='DE').textContent,new Intl.DisplayNames([language],{type:'region'}).of('DE'));
  app.options.callback('token');await app.submit();
  assert.equal(app.status.textContent,runtime["Thank you! Your interest has been sent. You're helping LeafChef grow."][language]);
  const returning=await setup(true,{language,storage});
  assert.equal(returning.status.textContent,runtime["You've already sent your interest. Thank you for helping LeafChef grow."][language]);
  assert.equal(returning.calls.length,0);
 });
 test(`${language}: server errors stay translated and unknown messages use a translated fallback`,async()=>{
  const runtime=JSON.parse(await readFile(new URL('../locales/runtime.json',import.meta.url),'utf8'));
  for(const message of ['The interest form is busy. Please try again later.','Unexpected upstream failure']) {
   const app=await setup(true,{language,postResponse:{ok:false,json:async()=>({message})}});
   app.render();app.options.callback('token');await app.submit();
   assert.equal(app.status.textContent,runtime[message in runtime ? message : 'Your interest could not be sent. Please try again later.'][language]);
  }
 });
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

test('successful submission stores only a completion flag and survives a reload',async()=>{
 const storage=new Map();const app=await setup(true,{storage});
 app.render();app.options.callback('token');await app.submit();
 assert.deepEqual([...storage.entries()],[['leafchef.web.interest.submitted.v1','true']]);
 const returning=await setup(true,{storage});
 assert.equal(returning.fields.hidden,true);assert.equal(returning.button.disabled,true);
 assert.match(returning.status.textContent,/already sent/);
 assert.equal(returning.calls.length,0);assert.equal(returning.script,undefined);
 await returning.submit();assert.equal(returning.calls.length,0);
});
test('provider rejection and uncertain network delivery do not save completion',async()=>{
 for(const settings of [{networkError:true},{postResponse:{ok:false,json:async()=>({message:'Try again later'})}}]){
  const app=await setup(true,settings);app.render();app.options.callback('token');await app.submit();
  assert.equal(app.storage.size,0);assert.equal(app.fields.hidden,false);
 }
});
test('blocked browser storage preserves successful feedback and in-page protection',async()=>{
 const app=await setup(true,{storageBlocked:true});app.render();app.options.callback('token');await app.submit();
 assert.equal(app.status.dataset.state,'success');assert.match(app.status.textContent,/browser couldn't save/);
 await app.submit();assert.equal(app.calls.length,2);assert.equal(app.fields.hidden,true);
});
test('completion in another tab closes the form without sending another request',async()=>{
 const app=await setup(true);app.render();app.options.callback('token');
 app.storageEvent({key:'leafchef.web.interest.submitted.v1',newValue:'true'});
 assert.equal(app.fields.hidden,true);assert.equal(app.removed,true);
 await app.submit();assert.equal(app.calls.length,1);
});
test('rechecks saved status before submitting even if the storage event was missed',async()=>{
 const app=await setup(true);app.render();app.options.callback('token');
 app.storage.set('leafchef.web.interest.submitted.v1','true');
 await app.submit();assert.equal(app.calls.length,1);assert.equal(app.fields.hidden,true);
});
test('unrelated browser storage events do not mark interest submitted',async()=>{
 const app=await setup(true);
 app.storageEvent({key:'unrelated',newValue:'true'});
 app.storageEvent({key:'leafchef.web.interest.submitted.v1',newValue:null});
 assert.equal(app.fields.hidden,false);
});
