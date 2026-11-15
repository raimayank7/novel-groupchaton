/* Infinity by GroupChatOn — book-keeper. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* A simple khata / ledger: parties, what you gave and got, running balances and printable statements. */
GCOTools.register('book-keeper', function (spot, T) {
  var h = T.h, V = T.vault('books', { biz: { name: '', phone: '' }, parties: [], tx: [] });
  var db = V.data();
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function bal(pid, upto) { return db.tx.reduce(function (s, x) { return x.p === pid && (!upto || x.d < upto) ? s + (x.g || 0) - (x.r || 0) : s; }, 0); }
  function party(pid) { return db.parties.filter(function (p) { return p.id === pid; })[0]; }
  function save() { V.save(db); }
  var tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' }), cur = 'parties', sel = null;
  var TABS = [['parties', '👥 Parties'], ['ledger', '📒 Ledger'], ['statement', '🧾 Statement'], ['cash', '📅 Day book'], ['biz', '⚙️ Your business']];
  function go(t) { cur = t; draw(); }
  function draw() {
    db = V.data();
    tabs.innerHTML = '';
    TABS.forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(cur === t[0]), text: t[1], onclick: function () { go(t[0]); } })); });
    body.innerHTML = '';
    ({ parties: drawParties, ledger: drawLedger, statement: drawStatement, cash: drawCash, biz: drawBiz })[cur]();
  }
  function balText(b) { return b > 0 ? 'You’ll get ' + T.money(b) : b < 0 ? 'You’ll give ' + T.money(-b) : 'Settled'; }

  function drawParties() {
    var get = 0, give = 0;
    db.parties.forEach(function (p) { var b = bal(p.id); if (b > 0) get += b; else give -= b; });
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [h('div', {}, [h('span', { text: 'You will get' }), h('b', { 'class': 'tin-c', text: T.money(get) })]),
      h('div', {}, [h('span', { text: 'You will give' }), h('b', { 'class': 'tout-c', text: T.money(give) })]), h('div', {}, [h('span', { text: 'Net' }), h('b', { text: T.money(get - give) })])]));
    var name = h('input', { type: 'text', placeholder: 'Name of customer, supplier or person' }), phone = h('input', { type: 'tel', placeholder: 'Mobile (optional)' });
    var kind = T.select([['customer', 'Customer'], ['supplier', 'Supplier'], ['other', 'Other (staff, friend, loan…)']], 'customer');
    var addP = function () {
      if (!name.value.trim()) { name.focus(); return; }
      var p = { id: uid(), name: name.value.trim(), phone: phone.value.trim(), k: kind.value }; db.parties.push(p); save(); sel = p.id; go('ledger');
    };
    name.addEventListener('keydown', function (e) { if (e.key === 'Enter') addP(); });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Add a party', name), T.field('Mobile', phone), T.field('Type', kind)]));
    body.appendChild(T.row([T.button('Add party', { primary: true, onclick: addP })]));
    var list = h('div', { 'class': 'tlist' });
    db.parties.slice().sort(function (a, b) { return Math.abs(bal(b.id)) - Math.abs(bal(a.id)); }).forEach(function (p) {
      var b = bal(p.id);
      list.appendChild(h('div', { 'class': 'titem', style: 'cursor:pointer', onclick: function () { sel = p.id; go('ledger'); } }, [h('span', { 'class': 'titem-ic', text: p.k === 'supplier' ? '🚚' : p.k === 'customer' ? '🧑' : '👤' }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: p.name }), h('small', { text: (p.phone || p.k) + ' · ' + db.tx.filter(function (x) { return x.p === p.id; }).length + ' entries' })]),
        h('span', { 'class': 'titem-amt ' + (b > 0 ? 'tin-c' : b < 0 ? 'tout-c' : ''), text: balText(b) })]));
    });
    if (!db.parties.length) list.appendChild(h('p', { 'class': 'tnote', text: 'Add your first customer or supplier above. Tap a party to add what you gave and got.' }));
    body.appendChild(list);
  }
  function pickParty(onPick) {
    var s = h('select', {}, [h('option', { value: '', text: 'Choose a party…' })].concat(db.parties.map(function (p) { return h('option', { value: p.id, selected: p.id === sel ? true : null, text: p.name }); })));
    s.addEventListener('change', function () { sel = s.value; onPick(); });
    return T.field('Party', s);
  }
  function drawLedger() {
    body.appendChild(pickParty(draw));
    var p = party(sel); if (!p) { body.appendChild(h('p', { 'class': 'tnote', text: db.parties.length ? 'Choose a party.' : 'First add a party in the Parties tab.' })); return; }
    var amt = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: '0' }), d = h('input', { type: 'date', value: iso(new Date()) });
    var desc = h('input', { type: 'text', placeholder: 'e.g. Bill 102, goods sold, cash received' });
    function put(kind) {
      var a = parseFloat(amt.value); if (!(a > 0)) { amt.focus(); return; }
      var x = { id: uid(), p: p.id, d: d.value || iso(new Date()), n: desc.value.trim() }; x[kind] = Math.round(a * 100) / 100;
      db.tx.push(x); save(); draw();
    }
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Amount (' + T.currency() + ')', amt), T.field('Date', d), T.field('Details', desc)]));
    body.appendChild(T.row([h('button', { type: 'button', 'class': 'tbtn', style: 'border-color:#dc2626;color:#dc2626', text: 'You gave (they owe you)', onclick: function () { put('g'); } }),
      h('button', { type: 'button', 'class': 'tbtn', style: 'border-color:#16a34a;color:#16a34a', text: 'You got (payment received)', onclick: function () { put('r'); } })]));
    var b = bal(p.id);
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [h('div', {}, [h('span', { text: p.name }), h('b', { 'class': b > 0 ? 'tin-c' : b < 0 ? 'tout-c' : '', text: balText(b) })])]));
    var rows = db.tx.filter(function (x) { return x.p === p.id; }).sort(function (a, c) { return a.d < c.d ? -1 : a.d > c.d ? 1 : 0; }), run = 0;
    var tb = h('tbody');
    rows.forEach(function (x) {
      run += (x.g || 0) - (x.r || 0);
      tb.appendChild(h('tr', {}, [h('td', { text: x.d }), h('td', { text: x.n || '' }), h('td', { text: x.g ? T.money(x.g) : '' }), h('td', { text: x.r ? T.money(x.r) : '' }), h('td', { text: T.money(run) }),
        h('td', {}, [h('button', { type: 'button', 'class': 'tbtn tbtn-sm', text: '✕', 'aria-label': 'Delete entry', onclick: function () { if (confirm('Delete this entry?')) { db.tx = db.tx.filter(function (y) { return y.id !== x.id; }); save(); draw(); } } })])]));
    });
    if (rows.length) body.appendChild(h('div', { 'class': 'tcalc-scroll' }, [h('table', {}, [h('thead', {}, [h('tr', {}, ['Date', 'Details', 'You gave', 'You got', 'Balance', ''].map(function (x) { return h('th', { text: x }); }))]), tb])]));
    var remind = 'Hello ' + p.name + ', your balance with ' + (db.biz.name || 'us') + ' is ' + T.money(Math.abs(b)) + (b > 0 ? ' due to us. Kindly pay at the earliest.' : b < 0 ? ' payable by us.' : '. All settled. Thank you!');
    body.appendChild(T.row([h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener', href: 'https://wa.me/' + (p.phone || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(remind), text: 'Send reminder on WhatsApp' }),
      T.button('Statement', { small: true, onclick: function () { go('statement'); } }),
      T.button('Delete party', { small: true, onclick: function () { if (confirm('Delete ' + p.name + ' and all their entries?')) { db.parties = db.parties.filter(function (q) { return q.id !== p.id; }); db.tx = db.tx.filter(function (q) { return q.p !== p.id; }); sel = null; save(); go('parties'); } } })]));
  }
  // the statement: opening balance, entries in the period, closing balance
  function statement(pid, from, to) {
    var p = party(pid), open = bal(pid, from), run = open, rows = [], g = 0, r = 0;
    db.tx.filter(function (x) { return x.p === pid && x.d >= from && x.d <= to; }).sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; }).forEach(function (x) {
      run += (x.g || 0) - (x.r || 0); g += x.g || 0; r += x.r || 0; rows.push([x.d, x.n || '', x.g || 0, x.r || 0, run]);
    });
    return { p: p, open: open, rows: rows, gave: g, got: r, close: run };
  }
  function drawStatement() {
    body.appendChild(pickParty(draw));
    var p = party(sel); if (!p) { body.appendChild(h('p', { 'class': 'tnote', text: 'Choose a party to make a statement.' })); return; }
    var now = new Date(), f = h('input', { type: 'date', value: iso(new Date(now.getFullYear(), now.getMonth() - 2, 1)) }), t = h('input', { type: 'date', value: iso(now) });
    var paper = h('div', { 'class': 'tpaper', 'data-out': '' });
    function make() {
      var s = statement(p.id, f.value, t.value), m = T.money;
      paper.innerHTML = '';
      paper.appendChild(h('div', { style: 'display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap' }, [
        h('div', {}, [h('b', { style: 'font-size:18px', text: db.biz.name || 'Account Statement' }), h('div', { text: db.biz.phone || '' })]),
        h('div', { style: 'text-align:right' }, [h('b', { text: 'Statement of account' }), h('div', { text: s.p.name + (s.p.phone ? ' · ' + s.p.phone : '') }), h('div', { text: f.value + ' to ' + t.value })])]));
      var tb = h('tbody', {}, [h('tr', {}, [h('td', { text: f.value }), h('td', { text: 'Opening balance' }), h('td'), h('td'), h('td', { text: m(s.open) })])]);
      s.rows.forEach(function (x) { tb.appendChild(h('tr', {}, [h('td', { text: x[0] }), h('td', { text: x[1] }), h('td', { text: x[2] ? m(x[2]) : '' }), h('td', { text: x[3] ? m(x[3]) : '' }), h('td', { text: m(x[4]) })])); });
      tb.appendChild(h('tr', { style: 'font-weight:700' }, [h('td', { text: t.value }), h('td', { text: 'Closing balance' }), h('td', { text: m(s.gave) }), h('td', { text: m(s.got) }), h('td', { text: m(s.close) })]));
      paper.appendChild(h('table', { style: 'margin-top:14px' }, [h('thead', {}, [h('tr', {}, ['Date', 'Details', 'Debit (gave)', 'Credit (got)', 'Balance'].map(function (x) { return h('th', { text: x }); }))]), tb]));
      paper.appendChild(h('p', { style: 'margin-top:12px', text: s.close > 0 ? 'Balance due from ' + s.p.name + ': ' + m(s.close) : s.close < 0 ? 'Balance payable to ' + s.p.name + ': ' + m(-s.close) : 'No balance due.' }));
      paper.appendChild(h('p', { style: 'color:#666;font-size:12px', text: 'Generated on ' + new Date().toLocaleDateString() + ' with Infinity by GroupChatOn.' }));
      return s;
    }
    [f, t].forEach(function (x) { x.addEventListener('change', make); });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('From', f), T.field('To', t)]));
    body.appendChild(paper);
    body.appendChild(T.row([T.button('Print / Save as PDF', { primary: true, onclick: function () {
      var w = window.open('', '_blank'); if (!w) return;
      w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Statement - ' + p.name.replace(/</g, '') + '</title><style>body{font:13px/1.45 system-ui,Segoe UI,sans-serif;margin:1.5cm;color:#111}table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:right}th:nth-child(-n+2),td:nth-child(-n+2){text-align:left}th{background:#f3f4f6}</style></head><body>' + paper.innerHTML + '</body></html>');
      w.document.close(); setTimeout(function () { w.print(); }, 300);
    } }), T.button('Download CSV', { small: true, onclick: function () {
      var s = statement(p.id, f.value, t.value);
      var text = 'Date,Details,Debit (gave),Credit (got),Balance\n' + f.value + ',Opening balance,,,' + s.open + '\n' + s.rows.map(function (x) { return [x[0], '"' + String(x[1]).replace(/"/g, '""') + '"', x[2] || '', x[3] || '', x[4]].join(','); }).join('\n') + '\n' + t.value + ',Closing balance,' + s.gave + ',' + s.got + ',' + s.close;
      T.download(new Blob(['﻿' + text], { type: 'text/csv' }), 'statement-' + p.name.replace(/\W+/g, '-') + '.csv');
    } })]));
    make();
  }
  function drawCash() {
    var day = h('input', { type: 'date', value: iso(new Date()) }), out = h('div', { 'data-out': '' });
    function make() {
      out.innerHTML = '';
      var rows = db.tx.filter(function (x) { return x.d === day.value; }), g = 0, r = 0;
      rows.forEach(function (x) { g += x.g || 0; r += x.r || 0; out.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: (party(x.p) || {}).name || '—' }), h('small', { text: x.n || '' })]),
        h('span', { 'class': 'titem-amt ' + (x.r ? 'tin-c' : 'tout-c'), text: x.r ? '+' + T.money(x.r) : '−' + T.money(x.g) })])); });
      out.insertBefore(h('div', { 'class': 'tsum' }, [h('div', {}, [h('span', { text: 'Received (got)' }), h('b', { 'class': 'tin-c', text: T.money(r) })]), h('div', {}, [h('span', { text: 'Given' }), h('b', { 'class': 'tout-c', text: T.money(g) })])]), out.firstChild);
      if (!rows.length) out.appendChild(h('p', { 'class': 'tnote', text: 'No entries on this day.' }));
    }
    day.addEventListener('change', make);
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Day', day)])); body.appendChild(out); make();
  }
  function drawBiz() {
    var n = h('input', { type: 'text', value: db.biz.name || '', placeholder: 'Your shop or business name' }), ph = h('input', { type: 'tel', value: db.biz.phone || '', placeholder: 'Phone / address line' });
    [n, ph].forEach(function (x) { x.addEventListener('change', function () { db.biz = { name: n.value.trim(), phone: ph.value.trim() }; save(); }); });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Business name (shown on statements)', n), T.field('Phone or address', ph)]));
    body.appendChild(h('p', { 'class': 'tnote', text: 'These details appear at the top of statements and in WhatsApp reminders.' }));
  }
  spot.appendChild(T.card([V.bar(draw), tabs, body]));
  V.ready.then(draw);

  T.tests['book-keeper'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ biz: { name: '', phone: '' }, parties: [], tx: [] }); db = V.data();
    var pid = 'test1'; db.parties.push({ id: pid, name: 'Test Traders', phone: '', k: 'customer' });
    db.tx.push({ id: 'a', p: pid, d: '2026-10-01', g: 1000, n: 'Bill 1' }, { id: 'b', p: pid, d: '2026-10-10', r: 400, n: 'Cash' }, { id: 'c', p: pid, d: '2026-11-01', g: 200, n: 'Bill 2' });
    V.save(db);
    var s = statement(pid, '2026-10-05', '2026-11-30');
    if (s.open !== 1000) fails.push('opening ' + s.open);
    if (s.close !== 800) fails.push('closing ' + s.close);
    if (s.rows.length !== 2) fails.push('rows ' + s.rows.length);
    if (bal(pid) !== 800) fails.push('balance ' + bal(pid));
    sel = pid; go('statement');
    if (body.textContent.indexOf('Test Traders') < 0) fails.push('statement not drawn');
    return V.save(keep).then(function () { sel = null; go('parties'); return { ok: !fails.length, n: 5, fails: fails }; });
  };
});
