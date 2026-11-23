const translateSite = window.leafchefTranslate || (text => text);
const tabs = [...document.querySelectorAll('[data-tab]')];
const panels = [...document.querySelectorAll('[data-panel]')];
const captions = {plan:'The weekly plan, arranged by day.',pantry:'Pantry shelves, filters and ingredient quantities.',shopping:'Try checking an item. Bought items leave the To buy list.'};
function selectTab(tab, focus = false) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  for (const panel of panels) panel.hidden = panel.dataset.panel !== tab.dataset.tab;
  document.querySelector('#preview-caption').textContent = translateSite(captions[tab.dataset.tab]);
  for (const item of document.querySelectorAll('[data-app-nav]')) item.classList.toggle('selected', item.dataset.appNav === tab.dataset.tab);
  document.querySelector('#reset-shopping').hidden = tab.dataset.tab !== 'shopping';
  if (focus) tab.focus();
}
for (const tab of tabs) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(tab);
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
  });
}
const shopping = document.querySelector('#demo-shopping');
function updateShopping(event) {
  const focusedInput = event?.target === document.activeElement ? event.target : null;
  const inputs = [...shopping.querySelectorAll('input')];
  const remaining = inputs.filter(input => !input.checked).length;
  document.querySelector('#shopping-number').textContent = String(remaining);
  document.querySelector('#shopping-count').textContent = translateSite(remaining === 1 ? 'ingredient to buy' : 'ingredients to buy');
  for (const input of inputs) input.closest('label').hidden = input.checked;
  for (const group of shopping.querySelectorAll('[data-shopping-group]')) {
    group.hidden = [...group.querySelectorAll('input')].every(input => input.checked);
  }
  document.querySelector('#shopping-empty').hidden = remaining !== 0;
  if (focusedInput?.checked) {
    const next = inputs.find(input => !input.checked);
    (next || document.querySelector('#reset-shopping')).focus();
  }
}
shopping.addEventListener('change', updateShopping);
document.querySelector('#reset-shopping').addEventListener('click', () => { shopping.reset(); updateShopping(); });

// Illustrative weekly routine only: no persistence or app/backend connection.
const routineExample = document.querySelector('#routine-example');
const routineMeals = [...routineExample.querySelectorAll('[data-routine-state]')];
const routineStates = ['unplanned', 'cook', 'leftovers'];
const routineStateLabels = {unplanned: 'Unplanned', cook: 'Cook', leftovers: 'Leftovers'};
for (const meal of routineMeals) {
  const label = meal.querySelector('.routine-meal-label');
  const mealName = label.textContent;
  const accessibleName = meal.getAttribute('aria-label');
  function renderMeal() {
    const state = meal.dataset.routineState;
    meal.setAttribute('aria-checked', state === 'leftovers' ? 'mixed' : String(state === 'cook'));
    meal.setAttribute('aria-label', `${accessibleName}: ${translateSite(routineStateLabels[state])}`);
    label.textContent = state === 'leftovers'
      ? translateSite('{meal} leftovers').replace('{meal}', mealName) : mealName;
  }
  renderMeal();
  meal.addEventListener('click', () => {
    meal.dataset.routineState = routineStates[(routineStates.indexOf(meal.dataset.routineState) + 1) % routineStates.length];
    renderMeal();
    updateRoutineSummary();
  });
}
function updateRoutineSummary() {
  const selected = routineMeals.filter(meal => meal.dataset.routineState !== 'unplanned');
  const days = new Set(selected.map(input => input.dataset.routineDay)).size;
  document.querySelector('#routine-summary').textContent = translateSite('{meals} {mealLabel} across {days} {dayLabel}')
    .replace('{meals}', selected.length).replace('{mealLabel}', translateSite(selected.length === 1 ? 'meal' : 'meals'))
    .replace('{days}', days).replace('{dayLabel}', translateSite(days === 1 ? 'day' : 'days'));
}
updateRoutineSummary();
