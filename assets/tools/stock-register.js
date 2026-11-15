/* Infinity by GroupChatOn — stock-register. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Stock / inventory register: items, stock in and out, live balance and low-stock alerts. Saved only in this browser. */
GCOTools.register('stock-register', function (spot, T) {
  var h = T.h, V = T.vault('stock', { items: [], moves: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function qty(iid) { return db.moves.reduce(function (s, m) { return m.i === iid ? s + m.q : s; }, 0); }
  function item(iid) { return db.items.filter(function (x) { return x.id === iid; })[0]; }
  function low(it) { return it.min > 0 && qty(it.id) <= it.min; }
  var msg = T.status();

  // ---- stock in / out ----
  var pick = h('select', {}), q = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: '0' });
  var mdate = h('input', { type: 'date', value: iso() }), mnote = h('input', { type: 'text', placeholder: 'e.g. Bill 45, sold to Ramesh, damaged' });
  var dir = 'in', dirSeg = T.seg([['in', '+ Stock in'], ['out', '− Stock out']], 'in', function (v) { dir = v; });
  function move(iid, k, n, d, note) {
    if (!item(iid) || !(n > 0)) return false;
    db.moves.push({ id: uid(), i: iid, d: d || iso(), q: k === 'out' ? -n : n, k: k, n: note || '' }); save(); return true;
  }
  function doMove() {
    var n = parseFloat(q.value);
    if (!pick.value) { msg.error('Add an item first, then choose it.'); return; }
    if (!(n > 0)) { msg.error('Type the quantity.'); q.focus(); return; }
    var it = item(pick.value);
    if (dir === 'out' && n > qty(it.id) && !confirm('Only ' + T.num(qty(it.id)) + ' ' + it.unit + ' in stock. Take out ' + T.num(n) + ' anyway?')) return;
    move(it.id, dir, n, mdate.value, mnote.value.trim());
    msg.ok((dir === 'in' ? 'Added ' : 'Took out ') + T.num(n) + ' ' + it.unit + ' of ' + it.name + '. Now in stock: ' + T.num(qty(it.id)) + ' ' + it.unit + '.');
    q.value = ''; mnote.value = ''; draw();
  }
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') doMove(); });

  // ---- add / edit item ----
  var iname = h('input', { type: 'text', placeholder: 'e.g. Basmati rice 5 kg bag' }), iunit = h('input', { type: 'text', value: 'pcs', placeholder: 'pcs, kg, box' });
  var iopen = h('input', { type: 'number', min: '0', step: 'any', placeholder: '0' }), imin = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'e.g. 10' });
  var irate = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Cost per unit' }), editing = null;
  var addBtn = T.button('Add item', { primary: true, onclick: function () { addItem(); } });
  function addItem() {
    var name = iname.value.trim(); if (!name) { iname.focus(); return; }
    if (editing) { var it = item(editing); it.name = name; it.unit = iunit.value.trim() || 'pcs'; it.min = parseFloat(imin.value) || 0; it.rate = parseFloat(irate.value) || 0; save(); msg.ok('Item updated.'); }
    else {
      it = { id: uid(), name: name, unit: iunit.value.trim() || 'pcs', min: parseFloat(imin.value) || 0, rate: parseFloat(irate.value) || 0 };
      db.items.push(it);
      var o = parseFloat(iopen.value); if (o > 0) db.moves.push({ id: uid(), i: it.id, d: iso(), q: o, k: 'open', n: 'Opening stock' });
      save(); msg.ok(name + ' added.');
    }
    editing = null; addBtn.textContent = 'Add item'; iname.value = ''; iopen.value = ''; imin.value = ''; irate.value = ''; iopen.disabled = false;
    pick.value = it.id; draw();
  }
  function edit(it) {
    editing = it.id; iname.value = it.name; iunit.value = it.unit; imin.value = it.min || ''; irate.value = it.rate || ''; iopen.value = ''; iopen.disabled = true;
    addBtn.textContent = 'Save item'; itemBox.open = true; iname.focus();
  }
  var itemBox = h('details', { 'class': 'tcalc-details' }, [h('summary', { text: '➕ Add a new item' }),
    h('div', { 'class': 'tgrid2' }, [T.field('Item name', iname), T.field('Unit', iunit), T.field('Opening stock', iopen), T.field('Alert when stock is at or below', imin), T.field('Cost per unit (' + T.currency() + ', optional)', irate)]),
    T.row([addBtn])]);

  // ---- the register ----
  var sum = h('div', { 'class': 'tsum', 'data-out': '' }), search = h('input', { type: 'search', placeholder: 'Search items…' }), list = h('div', { 'class': 'tlist' });
  var onlyLow = false, lowSeg = T.seg([['all', 'All items'], ['low', '⚠️ Low stock']], 'all', function (v) { onlyLow = v === 'low'; draw(); });
  var hist = h('div', { 'class': 'tlist' });
  search.addEventListener('input', function () { draw(); });
  function totals() {
    var r = { items: db.items.length, low: 0, value: 0 };
    db.items.forEach(function (it) { if (low(it)) r.low++; r.value += Math.max(0, qty(it.id)) * (it.rate || 0); });
    return r;
  }
  function draw() {
    db = V.data();
    var keep = pick.value; pick.innerHTML = '';
    if (!db.items.length) pick.appendChild(h('option', { value: '', text: 'No items yet' }));
    db.items.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (it) { pick.appendChild(h('option', { value: it.id, selected: it.id === keep ? true : null, text: it.name + ' (' + T.num(qty(it.id)) + ' ' + it.unit + ')' })); });
    var t = totals(); sum.innerHTML = '';
    [['Items', T.num(t.items), ''], ['Low stock', T.num(t.low), t.low ? 'tout-c' : 'tin-c'], ['Stock value', T.money(t.value), '']].forEach(function (x) { sum.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: x[1] })])); });
    list.innerHTML = '';
    var s = search.value.trim().toLowerCase();
    db.items.filter(function (it) { return (!s || it.name.toLowerCase().indexOf(s) >= 0) && (!onlyLow || low(it)); }).sort(function (a, b) { return (low(b) - low(a)) || a.name.localeCompare(b.name); }).forEach(function (it) {
      var n = qty(it.id), lw = low(it);
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: lw ? '⚠️' : '📦' }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: it.name }), h('small', { text: (lw ? 'Low stock · ' : '') + (it.min ? 'alert at ' + T.num(it.min) : 'no alert set') + (it.rate ? ' · ' + T.money(it.rate) + '/' + it.unit : '') })]),
        h('span', { 'class': 'titem-amt ' + (lw ? 'tout-c' : ''), text: T.num(n) + ' ' + it.unit }),
        h('button', { type: 'button', 'aria-label': 'Stock in or out', title: 'Stock in / out', text: '±', onclick: function () { pick.value = it.id; q.focus(); } }),
        h('button', { type: 'button', 'aria-label': 'Edit item', title: 'Edit', text: '✎', onclick: function () { edit(it); } }),
        h('button', { type: 'button', 'aria-label': 'Delete item', title: 'Delete', text: '✕', onclick: function () {
          if (!confirm('Delete ' + it.name + ' and its history?')) return; db.items = db.items.filter(function (x) { return x !== it; }); db.moves = db.moves.filter(function (m) { return m.i !== it.id; }); save(); draw(); } })]));
    });
    if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: db.items.length ? 'Nothing matches.' : 'Add your first item above (open “Add a new item”).' }));
    hist.innerHTML = '';
    db.moves.slice().sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; }).slice(0, 60).forEach(function (m) {
      var it = item(m.i) || { name: '—', unit: '' };
      hist.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: it.name }), h('small', { text: m.d + (m.n ? ' · ' + m.n : '') })]),
        h('span', { 'class': 'titem-amt ' + (m.q > 0 ? 'tin-c' : 'tout-c'), text: (m.q > 0 ? '+' : '−') + T.num(Math.abs(m.q)) + ' ' + it.unit }),
        h('button', { type: 'button', 'aria-label': 'Delete entry', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this entry?')) { db.moves = db.moves.filter(function (x) { return x !== m; }); save(); draw(); } } })]));
    });
    if (!hist.children.length) hist.appendChild(h('p', { 'class': 'tnote', text: 'Stock in and out entries will appear here.' }));
  }
  function csv() {
    var q2 = function (s) { s = String(s == null ? '' : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    var text = 'Item,Unit,In stock,Alert level,Cost per unit,Value\n' + db.items.map(function (it) { var n = qty(it.id); return [it.name, it.unit, n, it.min || '', it.rate || '', Math.max(0, n) * (it.rate || 0)].map(q2).join(','); }).join('\n');
    T.download(new Blob(['﻿' + text], { type: 'text/csv' }), 'stock-' + iso() + '.csv');
  }
  spot.appendChild(T.card([V.bar(draw), h('h3', { text: 'Stock in / out' }),
    h('div', { 'class': 'tool-app-opts' }, [dirSeg, h('div', { 'class': 'tgrid2' }, [T.field('Item', pick), T.field('Quantity', q), T.field('Date', mdate), T.field('Note (optional)', mnote)]),
      T.row([T.button('Save entry', { primary: true, onclick: doMove })]), msg.el]),
    itemBox, sum, h('h3', { text: 'Stock register' }), lowSeg, search, list,
    T.row([T.button('Download stock list (CSV / Excel)', { small: true, onclick: csv })]),
    h('h3', { text: 'Recent stock in and out' }), hist]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  V.ready.then(draw);

  T.tests['stock-register'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ items: [], moves: [] }); db = V.data();
    iname.value = 'Test Rice'; iunit.value = 'bag'; iopen.value = '10'; imin.value = '10'; irate.value = '50'; addItem();
    var it = db.items[0];
    move(it.id, 'out', 4); move(it.id, 'in', 2); draw();
    if (qty(it.id) !== 8) fails.push('qty ' + qty(it.id));
    var t = totals();
    if (t.low !== 1) fails.push('low ' + t.low);
    if (t.value !== 400) fails.push('value ' + t.value);
    if (list.textContent.indexOf('Low stock') < 0) fails.push('no low alert shown');
    if (move(it.id, 'out', 0)) fails.push('zero move accepted');
    return V.save(keep).then(function () { db = V.data(); draw(); return { ok: !fails.length, n: 5, fails: fails }; });
  }
});
