import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const pages = ['index', 'legal', 'impressum', 'privacy', 'terms'];
for (const language of ['de', 'es', 'fr']) {
  test(`${language}: equivalent-page language links, localized legal links and metadata`, async () => {
    for (const page of pages) {
      const html = await read(`public/${page}.${language}.html`);
      assert.ok(html.includes(`<html lang="${language}">`));
      const nav = html.match(/<nav class="language-switcher[^]*?<\/nav>/)[0];
      for (const locale of ['en','de','es','fr']) {
        assert.ok(nav.includes(`href="${page}${locale==='en'?'':'.'+locale}.html" lang="${locale}" hreflang="${locale}"`));
      }
      assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
      assert.ok(nav.includes(`hreflang="${language}" aria-current="page"`));
      const otherLinks = html.replace(nav,'').replace(/<link rel="alternate"[^>]+>/g,'');
      assert.doesNotMatch(otherLinks,/href="(?:index|legal|impressum|privacy|terms)\.html"/);
      assert.doesNotMatch(html,/\uFFFD|Espa\?ol|Fran\?ais|[A-Za-z]\?[a-z]/);
    }
  });

  test(`${language}: tab captions, shopping counts and routine plural forms stay localized`, async () => {
    const context = {window:{},document:{documentElement:{lang:language},activeElement:null}};
    vm.runInNewContext(await read(`public/locales/${language}.js`),context);
    vm.runInNewContext(await read('public/i18n.js'),context);
    const translate = context.window.leafchefTranslate;
    const node = () => ({hidden:false,textContent:'',dataset:{},handlers:{},setAttribute(){},classList:{toggle(){}},addEventListener(event,fn){this.handlers[event]=fn;},focus(){}});
    const tabs = ['plan','pantry','shopping'].map(key => Object.assign(node(),{dataset:{tab:key}}));
    const panels = ['plan','pantry','shopping'].map(key => Object.assign(node(),{dataset:{panel:key}}));
    const selectors = Object.fromEntries(['#preview-caption','#reset-shopping','#shopping-number','#shopping-count','#shopping-empty','#routine-summary'].map(key => [key,node()]));
    const inputs = [0,1,2].map(()=>({checked:false,closest:()=>node()}));
    const shopping = Object.assign(node(),{querySelectorAll:selector=>selector==='input'?inputs:[],reset(){inputs.forEach(input=>{input.checked=false;});}});
    const routine = Object.assign(node(),{selected:[],querySelectorAll(){return this.selected;}});
    context.document.querySelector = selector => selector==='#demo-shopping'?shopping:selector==='#routine-example'?routine:selectors[selector];
    context.document.querySelectorAll = selector => selector==='[data-tab]'?tabs:selector==='[data-panel]'?panels:[];
    vm.runInNewContext(await read('public/site.js'),context);
    tabs[1].handlers.click();
    assert.equal(selectors['#preview-caption'].textContent,translate('Pantry shelves, filters and ingredient quantities.'));
    assert.equal(panels[1].hidden,false);
    tabs[2].handlers.click();
    assert.equal(selectors['#preview-caption'].textContent,translate('Try checking an item. Bought items leave the To buy list.'));
    inputs[0].checked=inputs[1].checked=true;
    shopping.handlers.change();
    assert.equal(selectors['#shopping-count'].textContent,translate('ingredient to buy'));
    inputs[2].checked=true;shopping.handlers.change();
    assert.equal(selectors['#shopping-empty'].hidden,false);
    selectors['#reset-shopping'].handlers.click();
    assert.equal(selectors['#shopping-number'].textContent,'3');
    const format=(meals,days)=>translate('{meals} {mealLabel} across {days} {dayLabel}').replace('{meals}',meals).replace('{mealLabel}',translate(meals===1?'meal':'meals')).replace('{days}',days).replace('{dayLabel}',translate(days===1?'day':'days'));
    assert.equal(selectors['#routine-summary'].textContent,format(0,0));
    routine.selected=[{dataset:{routineDay:'Monday'}}];routine.handlers.change();
    assert.equal(selectors['#routine-summary'].textContent,format(1,1));
    routine.selected.push({dataset:{routineDay:'Tuesday'}});routine.handlers.change();
    assert.equal(selectors['#routine-summary'].textContent,format(2,2));
  });
}
