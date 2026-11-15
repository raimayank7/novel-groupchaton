/* Infinity by GroupChatOn — grocery-list. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Grocery and packing lists: several named lists, quantities, tick as you shop, ready-made templates, and share on WhatsApp or copy as text. */
GCOTools.register('grocery-list', function (spot, T) {
  var h = T.h, status = T.status();
  var TEMPLATES = {
    'Weekly groceries': ['Rice', 'Atta / flour', 'Milk', 'Eggs', 'Bread', 'Onions', 'Tomatoes', 'Potatoes', 'Dal / lentils', 'Cooking oil', 'Sugar', 'Tea', 'Salt', 'Fruit', 'Green vegetables', 'Curd / yoghurt'],
    'Trip packing': ['ID / passport', 'Tickets', 'Phone charger', 'Power bank', 'Medicines', 'Toothbrush and paste', 'Clothes', 'Sleepwear', 'Towel', 'Sunscreen', 'Sunglasses', 'Water bottle', 'Snacks', 'Cash and cards', 'Umbrella'],
    'Baby bag': ['Nappies / diapers', 'Wipes', 'Change of clothes', 'Milk / formula', 'Bottle', 'Burp cloth', 'Blanket', 'Nappy cream', 'Toy', 'Sanitiser'],
    'Party': ['Snacks', 'Soft drinks', 'Ice', 'Cake', 'Candles', 'Plates', 'Cups', 'Napkins', 'Balloons', 'Bin bags']
  };
  var data = T.store.get('glist', null) || { cur: 'Groceries', lists: { Groceries: [] } };
  // "2 kg rice" → { q: '2 kg', t: 'rice' }
  function parseItem(s) {
    s = s.trim(); var m = s.match(/^(\d+(?:[.,]\d+)?\s*(?:kg|g|gm|l|ltr|litre|liter|ml|pcs|pc|dozen|doz|packets?|pkts?|x|×)?)\s+(.+)$/i) || s.match(/^(.+?)\s+[x×]\s*(\d+)$/i);
    if (m && /^\d/.test(m[1])) return { q: m[1].replace(/\s+/g, ' ').trim(), t: m[2].trim(), d: false };
    if (m) return { q: m[2], t: m[1].trim(), d: false };
    return { q: '', t: s, d: false };
  }
  function toText(name, items, onlyLeft) {
    var list = items.filter(function (x) { return !onlyLeft || !x.d; });
    return '🛒 ' + name + '\n' + list.map(function (x) { return (x.d ? '✅ ' : '▫️ ') + x.t + (x.q ? ' — ' + x.q : ''); }).join('\n');
  }
  var listSel = h('select', { 'aria-label': 'List' }), add = h('input', { type: 'text', placeholder: 'Add item, e.g. 2 kg rice', 'aria-label': 'New item', enterkeyhint: 'done' });
  var ul = h('div', { 'class': 'tlist', style: 'grid-template-columns:minmax(0,1fr)' }), sum = h('p', { 'class': 'tnote', 'data-out': '' }), hide = h('input', { type: 'checkbox' });
  function items() { return data.lists[data.cur] || (data.lists[data.cur] = []); }
  function save() { T.store.set('glist', data); }
  function draw() {
    listSel.innerHTML = '';
    Object.keys(data.lists).forEach(function (n) { listSel.appendChild(h('option', { value: n, selected: n === data.cur ? true : null, text: n + ' (' + data.lists[n].filter(function (x) { return !x.d; }).length + ')' })); });
    ul.innerHTML = '';
    var it = items();
    it.forEach(function (x, i) {
      if (hide.checked && x.d) return;
      var cb = h('input', { type: 'checkbox', checked: x.d ? true : null, 'aria-label': 'Got ' + x.t, style: 'width:22px;height:22px' });
      cb.addEventListener('change', function () { x.d = cb.checked; save(); draw(); });
      ul.appendChild(h('div', { 'class': 'titem', style: x.d ? 'opacity:.55' : '' }, [cb,
        h('span', { 'class': 'titem-main' }, [h('b', { text: x.t, style: x.d ? 'text-decoration:line-through' : '' }), x.q ? h('small', { text: x.q }) : null]),
        h('button', { type: 'button', 'aria-label': 'Move up', text: '↑', onclick: function () { if (i) { it.splice(i - 1, 0, it.splice(i, 1)[0]); save(); draw(); } } }),
        h('button', { type: 'button', 'aria-label': 'Remove ' + x.t, text: '✕', onclick: function () { it.splice(i, 1); save(); draw(); } })]));
    });
    var left = it.filter(function (x) { return !x.d; }).length;
    sum.textContent = it.length ? left + ' to get · ' + (it.length - left) + ' done' : 'This list is empty. Add items above or start from a template.';
  }
  function addItems(text) { text.split(/[\n,]+/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (s) { items().push(parseItem(s)); }); save(); draw(); }
  add.addEventListener('keydown', function (e) { if (e.key === 'Enter') { addItems(add.value); add.value = ''; } });
  listSel.addEventListener('change', function () { data.cur = listSel.value; save(); draw(); });
  hide.addEventListener('change', draw);
  var tpl = T.select([['', 'Start from a template…']].concat(Object.keys(TEMPLATES).map(function (k) { return [k, k]; })), '');
  tpl.addEventListener('change', function () { if (!tpl.value) return; var n = tpl.value, k = n, j = 2; while (data.lists[k] && data.lists[k].length) k = n + ' ' + j++; data.lists[k] = TEMPLATES[n].map(parseItem); data.cur = k; tpl.value = ''; save(); draw(); status.ok('Added the “' + n + '” template. Remove what you do not need.'); });
  var cp = T.button('Copy', { small: true, onclick: function () { T.copy(toText(data.cur, items(), hide.checked), cp); } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('List', listSel), T.field('Templates', tpl)]),
    T.row([T.button('New list', { small: true, onclick: function () { var n = (prompt('Name of the new list:', 'Packing') || '').trim(); if (!n) return; if (!data.lists[n]) data.lists[n] = []; data.cur = n; save(); draw(); } }),
      T.button('Delete list', { small: true, onclick: function () { if (!confirm('Delete the list “' + data.cur + '”?')) return; delete data.lists[data.cur]; data.cur = Object.keys(data.lists)[0] || 'Groceries'; items(); save(); draw(); } })]),
    T.row([add, T.button('Add', { primary: true, onclick: function () { addItems(add.value); add.value = ''; add.focus(); } })]), sum, ul,
    T.row([h('label', { 'class': 'tcheck' }, [hide, ' Hide ticked items']), T.button('Untick all', { small: true, onclick: function () { items().forEach(function (x) { x.d = false; }); save(); draw(); } }), T.button('Remove ticked', { small: true, onclick: function () { data.lists[data.cur] = items().filter(function (x) { return !x.d; }); save(); draw(); } })]),
    T.row([T.button('Share on WhatsApp', { onclick: function () { window.open('https://wa.me/?text=' + encodeURIComponent(toText(data.cur, items(), true)), '_blank', 'noopener'); } }), cp]), status.el,
    h('p', { 'class': 'tnote', text: 'Your lists are saved only on this device. Tip: add several items at once separated by commas, like “milk, 6 eggs, bread”.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  add.style.flex = '1'; add.style.minWidth = '0';
  draw();
  T.tests['grocery-list'] = function () {
    var f = [], a = parseItem('2 kg rice'), b = parseItem('Eggs x 12'), c = parseItem('bread'), d = parseItem('500 ml curd');
    if (a.q !== '2 kg' || a.t !== 'rice') f.push('qty first ' + JSON.stringify(a));
    if (b.q !== '12' || b.t !== 'Eggs') f.push('x qty ' + JSON.stringify(b));
    if (c.q !== '' || c.t !== 'bread') f.push('plain');
    if (d.q !== '500 ml') f.push('ml');
    var t = toText('Shop', [{ t: 'Milk', q: '1 l', d: false }, { t: 'Tea', q: '', d: true }], true);
    if (t !== '🛒 Shop\n▫️ Milk — 1 l') f.push('text ' + t);
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
