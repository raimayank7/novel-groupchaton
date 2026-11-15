/* Infinity by GroupChatOn — shagun-register. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Wedding / function gift (shagun) register: who gave what at each event, what you gave them, and totals. */
GCOTools.register('shagun-register', function (spot, T) {
  var h = T.h, V = T.vault('shagun', { events: [], gifts: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function evTotal(eid) { var r = { cash: 0, n: 0, items: 0 }; db.gifts.forEach(function (g) { if (g.e === eid) { r.cash += g.a || 0; r.n++; if (g.item) r.items++; } }); return r; }
  function person(name) {
    var k = norm(name), r = { got: 0, gave: 0, rows: [] };
    db.gifts.forEach(function (g) { if (norm(g.name) === k) { var e = ev(g.e) || {}; r[e.mine === false ? 'gave' : 'got'] += g.a || 0; r.rows.push([g, e]); } });
    return r;
  }
  function ev(id) { return db.events.filter(function (e) { return e.id === id; })[0]; }
  var tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' }), cur = 'event', sel = null;
  function draw() {
    db = V.data(); tabs.innerHTML = ''; body.innerHTML = '';
    [['event', '🎉 Events'], ['people', '🔎 Look up a person']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(cur === t[0]), text: t[1], onclick: function () { cur = t[0]; draw(); } })); });
    if (cur === 'event') drawEvent(); else drawPeople();
  }
  function drawEvent() {
    if (!ev(sel) && db.events.length) sel = db.events[db.events.length - 1].id;
    if (db.events.length) {
      var s = T.select(db.events.map(function (e) { return [e.id, (e.mine === false ? '🎁 ' : '🏠 ') + e.name + ' · ' + e.d]; }), sel); s.addEventListener('change', function () { sel = s.value; draw(); });
      body.appendChild(T.field('Event', s));
    }
    var e = ev(sel);
    if (e) {
      var t = evTotal(e.id);
      body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [[e.mine === false ? 'You gave (cash)' : 'Shagun received', T.money(t.cash)], ['Entries', T.num(t.n)], ['Gifts (items)', T.num(t.items)]].map(function (x) { return h('div', {}, [h('span', { text: x[0] }), h('b', { text: x[1] })]); })));
      var f = { name: h('input', { type: 'text', placeholder: 'Name', list: 'sg-names' }), place: h('input', { type: 'text', placeholder: 'Relation / village / city' }), a: h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: 'e.g. 1100' }), item: h('input', { type: 'text', placeholder: 'Gift item, if any' }) };
      var names = h('datalist', { id: 'sg-names' }); var seen = {}; db.gifts.forEach(function (g) { if (!seen[norm(g.name)]) { seen[norm(g.name)] = 1; names.appendChild(h('option', { value: g.name })); } });
      var add = function () {
        if (!f.name.value.trim() || !(parseFloat(f.a.value) > 0 || f.item.value.trim())) { (f.name.value.trim() ? f.a : f.name).focus(); return; }
        db.gifts.push({ id: uid(), e: e.id, name: f.name.value.trim(), place: f.place.value.trim(), a: parseFloat(f.a.value) || 0, item: f.item.value.trim() }); save(); draw();
        body.querySelector('input[list="sg-names"]').focus();
      };
      [f.a, f.item].forEach(function (x) { x.addEventListener('keydown', function (ev2) { if (ev2.key === 'Enter') add(); }); });
      body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field(e.mine === false ? 'Given to' : 'From', f.name), T.field('Relation / place', f.place), T.field('Cash (' + T.currency() + ')', f.a), T.field('Gift item', f.item), names]));
      body.appendChild(T.row([T.button('Add (Enter)', { primary: true, onclick: add }), T.button('Print list', { small: true, onclick: function () { print(e); } }), T.button('Delete event', { small: true, onclick: function () {
        if (confirm('Delete ' + e.name + ' and all its entries?')) { db.events = db.events.filter(function (x) { return x !== e; }); db.gifts = db.gifts.filter(function (g) { return g.e !== e.id; }); sel = null; save(); draw(); } } })]));
      var list = h('div', { 'class': 'tlist' });
      db.gifts.filter(function (g) { return g.e === e.id; }).slice().reverse().forEach(function (g) {
        var p = person(g.name);
        list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: g.name + (g.place ? ' · ' + g.place : '') }), h('small', { text: (g.item || '') + (p.rows.length > 1 ? (g.item ? ' · ' : '') + 'got ' + T.money(p.got) + ' / gave ' + T.money(p.gave) + ' in all' : '') })]),
          h('span', { 'class': 'titem-amt', text: g.a ? T.money(g.a) : '🎁' }),
          h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this entry?')) { db.gifts = db.gifts.filter(function (x) { return x !== g; }); save(); draw(); } } })]));
      });
      body.appendChild(list);
    }
    var n = h('input', { type: 'text', placeholder: 'e.g. Priya’s wedding, Griha pravesh, Sharma ji’s son’s wedding' }), d = h('input', { type: 'date', value: iso() });
    var mine = T.select([['1', 'Our function (gifts we received)'], ['0', 'Someone else’s (what we gave)']], '1');
    body.appendChild(h('details', { 'class': 'tcalc-details', open: db.events.length ? null : true }, [h('summary', { text: '➕ New event' }), h('div', { 'class': 'tgrid2' }, [T.field('Event name', n), T.field('Date', d), T.field('Whose function', mine)]),
      T.row([T.button('Create event', { primary: true, onclick: function () { if (!n.value.trim()) { n.focus(); return; } var x = { id: uid(), name: n.value.trim(), d: d.value || iso(), mine: mine.value === '1' }; db.events.push(x); sel = x.id; save(); draw(); } })])]));
  }
  function drawPeople() {
    var q = h('input', { type: 'search', placeholder: 'Type a name…' }), out = h('div', { 'data-out': '' });
    function show() {
      out.innerHTML = '';
      var k = norm(q.value), names = {};
      db.gifts.forEach(function (g) { if (!k || norm(g.name).indexOf(k) >= 0) names[norm(g.name)] = g.name; });
      Object.keys(names).sort().forEach(function (nk) {
        var p = person(names[nk]);
        out.appendChild(h('div', { 'class': 'tday' }, [h('span', { text: names[nk] }), h('span', { text: 'They gave ' + T.money(p.got) + ' · You gave ' + T.money(p.gave) })]));
        p.rows.forEach(function (r) { out.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: r[1].mine === false ? '🎁' : '🏠' }), h('span', { 'class': 'titem-main' }, [h('b', { text: r[1].name || '' }), h('small', { text: (r[1].d || '') + (r[0].item ? ' · ' + r[0].item : '') })]), h('span', { 'class': 'titem-amt', text: r[0].a ? T.money(r[0].a) : '' })])); });
      });
      if (!out.children.length) out.appendChild(h('p', { 'class': 'tnote', text: db.gifts.length ? 'No one by that name.' : 'Entries from your events will show here, so you know what to give back.' }));
    }
    q.addEventListener('input', show);
    body.appendChild(q); body.appendChild(out); show();
  }
  function print(e) {
    var w = window.open('', '_blank'); if (!w) return;
    var x = function (s) { return String(s || '').replace(/[&<>]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]; }); }, t = evTotal(e.id);
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + x(e.name) + '</title><style>body{font:14px/1.45 system-ui,sans-serif;margin:1.5cm}table{width:100%;border-collapse:collapse}td,th{padding:6px;border-bottom:1px solid #ddd;text-align:left}td:last-child{text-align:right}</style></head><body><h2>' + x(e.name) + '</h2><p>' + x(e.d) + '</p><table><tr><th>#</th><th>Name</th><th>Relation / place</th><th>Gift</th><th>Cash</th></tr>' +
      db.gifts.filter(function (g) { return g.e === e.id; }).map(function (g, i) { return '<tr><td>' + (i + 1) + '</td><td>' + x(g.name) + '</td><td>' + x(g.place) + '</td><td>' + x(g.item) + '</td><td>' + (g.a ? x(T.money(g.a)) : '') + '</td></tr>'; }).join('') +
      '<tr><th colspan="4">Total</th><th style="text-align:right">' + x(T.money(t.cash)) + '</th></tr></table></body></html>');
    w.document.close(); setTimeout(function () { w.print(); }, 300);
  }
  spot.appendChild(T.card([V.bar(draw), tabs, body]));
  V.ready.then(draw);

  T.tests['shagun-register'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ events: [{ id: 'w', name: 'Our wedding', d: '2026-02-10', mine: true }, { id: 's', name: 'Sharma son wedding', d: '2026-10-01', mine: false }],
      gifts: [{ id: '1', e: 'w', name: 'Sharma ji', a: 1100 }, { id: '2', e: 'w', name: 'Gupta', a: 501, item: 'Dinner set' }, { id: '3', e: 's', name: ' sharma  JI', a: 2100 }] }); db = V.data();
    var t = evTotal('w'), p = person('Sharma Ji');
    if (t.cash !== 1601 || t.items !== 1) fails.push('event ' + JSON.stringify(t));
    if (p.got !== 1100 || p.gave !== 2100) fails.push('person ' + p.got + '/' + p.gave);
    sel = 'w'; cur = 'event'; draw(); if (body.textContent.indexOf('1,601') < 0) fails.push('total not shown');
    return V.save(keep).then(function () { sel = null; draw(); return { ok: !fails.length, n: 3, fails: fails }; });
  }
});
