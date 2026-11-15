/* Infinity by GroupChatOn — milk-hisab. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Daily milk / newspaper / maid hisab: a month calendar, days off, extra days, the bill and payments. */
GCOTools.register('milk-hisab', function (spot, T) {
  var h = T.h, V = T.vault('hisab', { svc: [], days: {}, pay: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var month = iso().slice(0, 7), sel = null, picked = null, body = h('div', { 'class': 'tool-app-opts' });
  function svc(id) { return db.svc.filter(function (s) { return s.id === id; })[0]; }
  function qOn(s, d) { var k = s.id + '|' + d; return k in db.days ? db.days[k] : s.qty; }
  function bill(sid, m, today) {
    var s = svc(sid), y = +m.slice(0, 4), mo = +m.slice(5, 7), n = new Date(y, mo, 0).getDate(), qty = 0, off = 0, list = [];
    today = today || iso();
    for (var i = 1; i <= n; i++) {
      var d = m + '-' + ('0' + i).slice(-2), on = d >= (s.start || '') && d <= today, q = on ? qOn(s, d) : null;
      list.push({ d: d, q: q }); if (on) { qty += q; if (!q) off++; }
    }
    var amt = Math.round(qty * s.rate * 100) / 100, paid = db.pay.reduce(function (t, p) { return p.s === sid && p.m === m ? t + p.a : t; }, 0);
    return { qty: qty, off: off, amt: amt, paid: paid, due: amt - paid, list: list };
  }
  function allDue(sid, today) {
    var s = svc(sid); if (!s.start) return 0;
    var m = s.start.slice(0, 7), end = (today || iso()).slice(0, 7), due = 0, guard = 0;
    while (m <= end && guard++ < 600) { due += bill(sid, m, today).due; var y = +m.slice(0, 4), mo = +m.slice(5, 7); m = mo === 12 ? (y + 1) + '-01' : y + '-' + ('0' + (mo + 1)).slice(-2); }
    return due;
  }
  function draw() {
    db = V.data(); body.innerHTML = '';
    if (!svc(sel) && db.svc.length) sel = db.svc[0].id;
    if (db.svc.length) {
      var sp = T.select(db.svc.map(function (s) { return [s.id, s.name]; }), sel); sp.addEventListener('change', function () { sel = sp.value; picked = null; draw(); });
      var mi = h('input', { type: 'month', value: month }); mi.addEventListener('change', function () { if (mi.value) { month = mi.value; picked = null; draw(); } });
      body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Hisab of', sp), T.field('Month', mi)]));
      drawMonth(svc(sel));
    }
    var n = h('input', { type: 'text', placeholder: 'e.g. Milk, Newspaper, Maid, Water can' }), r = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'e.g. 60' });
    var q = h('input', { type: 'number', min: '0', step: 'any', value: '1' }), u = h('input', { type: 'text', value: 'litre', placeholder: 'litre, paper, visit' }), st = h('input', { type: 'date', value: iso().slice(0, 8) + '01' });
    body.appendChild(h('details', { 'class': 'tcalc-details', open: db.svc.length ? null : true }, [h('summary', { text: '➕ Add milk, newspaper, maid…' }),
      h('div', { 'class': 'tgrid2' }, [T.field('Name', n), T.field('Rate per unit (' + T.currency() + ')', r), T.field('Usual quantity each day', q), T.field('Unit', u), T.field('Started on', st)]),
      T.row([T.button('Add', { primary: true, onclick: function () {
        if (!n.value.trim() || !(parseFloat(r.value) >= 0) || r.value === '') { (n.value.trim() ? r : n).focus(); return; }
        var x = { id: uid(), name: n.value.trim(), rate: parseFloat(r.value), qty: parseFloat(q.value) || 0, unit: u.value.trim() || 'unit', start: st.value || iso() }; db.svc.push(x); sel = x.id; save(); draw();
      } })])]));
  }
  function drawMonth(s) {
    var b = bill(s.id, month), first = new Date(month + '-01T00:00:00').getDay();
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Total ' + s.unit, T.num(b.qty), ''], ['Bill', T.money(b.amt), ''], ['Paid', T.money(b.paid), 'tin-c'], ['Balance', T.money(b.due), b.due > 0 ? 'tout-c' : 'tin-c']].map(function (x) {
      return h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: x[1] })]); })));
    var grid = h('div', { style: 'display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;text-align:center' });
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (x) { grid.appendChild(h('small', { text: x, style: 'color:var(--muted);font-weight:700' })); });
    for (var i = 0; i < first; i++) grid.appendChild(h('span'));
    b.list.forEach(function (x) {
      var on = x.q !== null, col = !on ? 'var(--surface-2)' : x.q === 0 ? '#fee2e2' : x.q !== s.qty ? '#dbeafe' : '#dcfce7';
      grid.appendChild(h('button', { type: 'button', title: x.d, style: 'min-height:46px;border-radius:9px;border:' + (picked === x.d ? '2px solid var(--accent)' : '1px solid var(--line)') + ';background:' + col + ';color:#111;cursor:pointer;padding:2px;font:600 12px var(--ui)', disabled: !on ? true : null,
        onclick: function () { picked = x.d; draw(); } }, [h('b', { text: String(+x.d.slice(8)), style: 'display:block' }), on ? h('small', { text: x.q ? T.num(x.q) : 'off' }) : null]));
    });
    body.appendChild(grid);
    body.appendChild(h('p', { 'class': 'tnote', text: 'Green = usual ' + T.num(s.qty) + ' ' + s.unit + ', red = day off, blue = changed. Tap a day to change it.' }));
    if (picked) {
      var qi = h('input', { type: 'number', min: '0', step: 'any', value: qOn(s, picked) });
      var set = function (v) { if (v === null || v === s.qty) delete db.days[s.id + '|' + picked]; else db.days[s.id + '|' + picked] = v; save(); draw(); };
      qi.addEventListener('change', function () { set(Math.max(0, parseFloat(qi.value) || 0)); });
      body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Quantity on ' + picked, qi)]));
      body.appendChild(T.row([T.button('Day off', { small: true, onclick: function () { set(0); } }), T.button('Usual', { small: true, onclick: function () { set(null); } }), T.button('Double', { small: true, onclick: function () { set(s.qty * 2); } })]));
    }
    var pa = h('input', { type: 'number', min: '0', step: 'any', value: b.due > 0 ? b.due : '', placeholder: '0' }), pd = h('input', { type: 'date', value: iso() });
    body.appendChild(h('h3', { text: 'Payment for ' + month }));
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Amount paid', pa), T.field('Date', pd)]));
    var all = allDue(s.id), text = s.name + ' hisab for ' + month + ': ' + T.num(b.qty) + ' ' + s.unit + ' × ' + T.money(s.rate) + ' = ' + T.money(b.amt) + (b.off ? ' (' + b.off + ' days off)' : '') + '. Paid ' + T.money(b.paid) + ', balance ' + T.money(b.due) + '.';
    body.appendChild(T.row([T.button('Save payment', { primary: true, onclick: function () { var a = parseFloat(pa.value); if (!(a > 0)) { pa.focus(); return; } db.pay.push({ id: uid(), s: s.id, m: month, d: pd.value || iso(), a: a }); save(); draw(); } }),
      h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener', href: 'https://wa.me/?text=' + encodeURIComponent(text), text: 'Share hisab on WhatsApp' }),
      T.button('Delete ' + s.name, { small: true, onclick: function () { if (confirm('Delete ' + s.name + ' and all its days and payments?')) { db.svc = db.svc.filter(function (x) { return x !== s; }); db.pay = db.pay.filter(function (p) { return p.s !== s.id; }); Object.keys(db.days).forEach(function (k) { if (k.indexOf(s.id + '|') === 0) delete db.days[k]; }); sel = null; save(); draw(); } } })]));
    body.appendChild(h('p', { 'class': 'tnote', text: 'All months together: ' + (all > 0 ? T.money(all) + ' still to pay.' : all < 0 ? T.money(-all) + ' paid in advance.' : 'fully paid.') }));
    var pl = h('div', { 'class': 'tlist' });
    db.pay.filter(function (p) { return p.s === s.id && p.m === month; }).forEach(function (p) {
      pl.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: 'Paid' }), h('small', { text: p.d })]), h('span', { 'class': 'titem-amt tin-c', text: T.money(p.a) }),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this payment?')) { db.pay = db.pay.filter(function (x) { return x !== p; }); save(); draw(); } } })]));
    });
    body.appendChild(pl);
  }
  spot.appendChild(T.card([V.bar(draw), body]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  V.ready.then(draw);

  T.tests['milk-hisab'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ svc: [{ id: 'm', name: 'Milk', rate: 60, qty: 1, unit: 'litre', start: '2026-10-01' }], days: { 'm|2026-10-05': 0, 'm|2026-10-06': 0, 'm|2026-10-07': 2 }, pay: [{ id: 'p', s: 'm', m: '2026-10', d: '2026-11-01', a: 1000 }] }); db = V.data();
    var b = bill('m', '2026-10', '2026-11-15');
    if (b.qty !== 30) fails.push('litres ' + b.qty);
    if (b.amt !== 1800) fails.push('bill ' + b.amt);
    if (b.due !== 800) fails.push('due ' + b.due);
    if (bill('m', '2026-11', '2026-11-15').qty !== 15) fails.push('part month ' + bill('m', '2026-11', '2026-11-15').qty);
    if (allDue('m', '2026-11-15') !== 800 + 900) fails.push('all due ' + allDue('m', '2026-11-15'));
    sel = 'm'; month = '2026-10'; draw();
    if (body.textContent.indexOf('1,800') < 0) fails.push('bill not shown');
    return V.save(keep).then(function () { sel = null; month = iso().slice(0, 7); draw(); return { ok: !fails.length, n: 6, fails: fails }; });
  }
});
