'use strict';
/* global ajaxify */
(function () {
  const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  let serial = 0;
  function enhance(select) {
    if (select.dataset.searchReady) { return; }
    select.dataset.searchReady = '1';
    const wrapper = document.createElement('div'); wrapper.className = 'vvjob-search-select';
    select.before(wrapper); wrapper.append(select);
    const input = document.createElement('input'); input.type = 'text'; input.className = 'form-control'; input.autocomplete = 'off';
    input.id = `${select.id || 'vvjob-select'}-search-${++serial}`;
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false');
    const list = document.createElement('div'); list.id = `${input.id}-list`; list.className = 'vvjob-select-options'; list.setAttribute('role', 'listbox'); list.hidden = true;
    input.setAttribute('aria-controls', list.id);
    const label = [...document.querySelectorAll('label')].find(label => label.htmlFor === select.id);
    if (label) { label.htmlFor = input.id; list.setAttribute('aria-label', label.textContent.trim()); } else { input.setAttribute('aria-label', select.getAttribute('aria-label') || 'Tìm và chọn'); }
    select.hidden = true; select.tabIndex = -1; select.setAttribute('aria-hidden', 'true');
    wrapper.append(input, list);
    let active = -1, items = [];
    const sync = () => { input.value = select.selectedOptions[0]?.textContent.trim() || ''; };
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; sync(); }
    function choose(option) { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); close(); }
    function mark(index) {
      active = Math.max(0, Math.min(index, items.length - 1));
      items.forEach((item, i) => { item.classList.toggle('active', i === active); item.setAttribute('aria-selected', i === active ? 'true' : 'false'); });
      if (items[active]) { input.setAttribute('aria-activedescendant', items[active].id); items[active].scrollIntoView({ block: 'nearest' }); }
    }
    function render(query = '') {
      const search = fold(query); list.replaceChildren(); active = -1; input.removeAttribute('aria-activedescendant');
      const visible = [...select.options].filter(option => !option.hidden && !option.disabled && (!search || fold(`${option.textContent} ${option.dataset.aliases || ''}`).includes(search)));
      if (!visible.length) {
        const empty = document.createElement('p'); empty.textContent = 'Chưa có kết quả phù hợp.'; list.append(empty);
        const other = [...select.options].find(option => option.value === 'other'); if (other) { visible.push(other); }
      }
      items = visible.map((option, i) => {
        const item = document.createElement('div'); item.id = `${list.id}-${i}`; item.setAttribute('role', 'option'); item.setAttribute('aria-selected', 'false'); item.className = 'vvjob-select-option'; item.textContent = option.textContent.trim();
        item.addEventListener('mousedown', event => event.preventDefault()); item.addEventListener('click', () => choose(option)); list.append(item); return item;
      });
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    input.addEventListener('focus', () => { render(); input.select(); });
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); if (list.hidden) { render(); } mark(active + (event.key === 'ArrowDown' ? 1 : -1)); }
      if (event.key === 'Enter' && !list.hidden) { event.preventDefault(); if (active >= 0) { items[active]?.click(); } else if (items.length === 1) { items[0].click(); } }
      if (event.key === 'Escape') { event.preventDefault(); close(); }
    });
    input.addEventListener('blur', () => { setTimeout(close, 0); });
    select.addEventListener('change', sync); select.addEventListener('vvjob:refresh', close); sync();
  }
  function init() { document.querySelectorAll('select[data-searchable]').forEach(enhance); }
  $(window).on('action:ajaxify.end.vvjobSelect', init); $(init);
})();
