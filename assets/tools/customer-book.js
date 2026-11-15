/* Infinity by GroupChatOn — customer-book. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Customer list and follow-ups (a mini CRM): contacts, stage, notes, next follow-up date, call and WhatsApp. */
GCOTools.register('customer-book', function (spot, T) {
  var h = T.h, V = T.vault('customers', { list: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var STAGES = [['lead', '🌱 New lead'], ['talk', '💬 Talking'], ['won', '🤝 Customer'], ['lost', '💤 Not now']];
  function stageName(s) { return (STAGES.filter(function (x) { return x[0] === s; })[0] || STAGES[0])[1]; }
  function dueList(today) { today = today || iso(); return db.list.filter(function (c) { return c.next && c.next <= today && c.stage !== 'lost'; }).sort(function (a, b) { return a.next < b.next ? -1 : 1; }); }
  function parseCsv(text) {
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    rows = rows.filter(function (r) { return r.join('').trim(); });
    var head = rows.length && /name/i.test(rows[0].join(',')) ? rows.shift().map(function (x) { return x.trim().toLowerCase(); }) : ['name', 'phone', 'email', 'city', 'notes'];
    var col = function (k) { for (var j = 0; j < head.length; j++) if (head[j].indexOf(k) >= 0) return j; return -1; };
    var ix = { name: col('name'), phone: Math.max(col('phone'), col('mobile')), email: col('mail'), city: col('city'), note: col('note') };
    return rows.map(function (r) { var g = function (k) { return ix[k] >= 0 ? (r[ix[k]] || '').trim() : ''; }; return { name: g('name'), phone: g('phone'), email: g('email'), city: g('city'), note: g('note') }; }).filter(function (c) { return c.name; });
  }
  var view = 'due', sel = null, body = h('div', { 'class': 'tool-app-opts' });
  var seg = T.seg([['due', '⏰ Follow-ups'], ['all', '👥 All'], ['add', '➕ Add']], 'due', function (v) { view = v; sel = null; draw(); });
  var search = h('input', { type: 'search', placeholder: 'Search name, phone, city, notes…' });
  search.addEventListener('input', function () { draw(); });
  function row(c) {
    var late = c.next && c.next < iso();
    return h('div', { 'class': 'titem', style: 'cursor:pointer', onclick: function () { sel = c.id; draw(); } }, [h('span', { 'class': 'titem-ic', text: stageName(c.stage).split(' ')[0] }),
      h('span', { 'class': 'titem-main' }, [h('b', { text: c.name }), h('small', { text: [c.phone, c.city, stageName(c.stage).replace(/^\S+ /, '')].filter(Boolean).join(' · ') })]),
      h('span', { 'class': 'titem-amt ' + (late ? 'tout-c' : ''), text: c.next ? (c.next === iso() ? 'Today' : (late ? 'Was ' : '') + c.next) : '' })]);
  }
  function form(c) {
    c = c || {};
    var f = { name: h('input', { type: 'text', value: c.name || '', placeholder: 'Name or company' }), phone: h('input', { type: 'tel', value: c.phone || '', placeholder: 'Mobile' }), email: h('input', { type: 'email', value: c.email || '' }),
      city: h('input', { type: 'text', value: c.city || '', placeholder: 'City / area' }), stage: T.select(STAGES, c.stage || 'lead'), next: h('input', { type: 'date', value: c.next || '' }), note: h('textarea', { rows: '3', placeholder: 'What they want, budget, product, source…' }) };
    f.note.value = c.note || '';
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Name', f.name), T.field('Mobile', f.phone), T.field('Email', f.email), T.field('City', f.city), T.field('Stage', f.stage), T.field('Next follow-up', f.next)]));
    body.appendChild(T.field('Notes', f.note));
    body.appendChild(T.row([T.button(c.id ? 'Save changes' : 'Add customer', { primary: true, onclick: function () {
      if (!f.name.value.trim()) { f.name.focus(); return; }
      var x = c.id ? c : { id: uid(), added: iso(), log: [] };
      ['name', 'phone', 'email', 'city', 'next'].forEach(function (k) { x[k] = f[k].value.trim(); }); x.stage = f.stage.value; x.note = f.note.value.trim();
      if (!c.id) db.list.push(x); save(); sel = x.id; view = 'all'; draw();
    } })]));
  }
  function detail(c) {
    var ph = (c.phone || '').replace(/[^\d+]/g, '');
    body.appendChild(h('h3', { text: c.name }));
    body.appendChild(T.row([ph ? h('a', { 'class': 'tbtn tbtn-sm', href: 'tel:' + ph, text: '📞 Call' }) : null, ph ? h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener', href: 'https://wa.me/' + ph.replace(/\D/g, ''), text: '💬 WhatsApp' }) : null,
      c.email ? h('a', { 'class': 'tbtn tbtn-sm', href: 'mailto:' + c.email, text: '✉️ Email' }) : null, T.button('Back to list', { small: true, onclick: function () { sel = null; draw(); } })]));
    var n = h('input', { type: 'text', placeholder: 'What happened? e.g. Called, wants quote by Friday' }), nx = h('input', { type: 'date', value: c.next || '' });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Add a follow-up note', n), T.field('Next follow-up', nx)]));
    body.appendChild(T.row([T.button('Save note', { primary: true, onclick: function () { if (n.value.trim()) c.log.unshift({ d: iso(), n: n.value.trim() }); c.next = nx.value; save(); draw(); } }),
      T.button('Done, no follow-up', { small: true, onclick: function () { c.next = ''; c.log.unshift({ d: iso(), n: 'Follow-up done' }); save(); draw(); } })]));
    var lg = h('div', { 'class': 'tlist' });
    (c.log || []).forEach(function (l) { lg.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: l.n }), h('small', { text: l.d })])])); });
    body.appendChild(lg);
    body.appendChild(h('h3', { text: 'Details' })); form(c);
    body.appendChild(T.row([T.button('Delete customer', { small: true, onclick: function () { if (confirm('Delete ' + c.name + '?')) { db.list = db.list.filter(function (x) { return x !== c; }); sel = null; save(); draw(); } } })]));
  }
  function draw() {
    db = V.data(); body.innerHTML = '';
    var c = db.list.filter(function (x) { return x.id === sel; })[0];
    if (c) { detail(c); return; }
    if (view === 'add') {
      form();
      var file = h('input', { type: 'file', accept: '.csv,text/csv', hidden: true });
      file.addEventListener('change', function () { if (!file.files[0]) return; T.read(file.files[0], 'text').then(function (t) { var got = parseCsv(t); got.forEach(function (x) { x.id = uid(); x.added = iso(); x.stage = 'lead'; x.log = []; x.next = ''; db.list.push(x); }); save(); alert(got.length + ' customers added.'); view = 'all'; draw(); }); });
      body.appendChild(h('p', { 'class': 'tnote', text: 'Have a list in Excel? Save it as CSV with columns like Name, Phone, Email, City and import it.' }));
      body.appendChild(T.row([T.button('Import CSV', { small: true, onclick: function () { file.click(); } }), file]));
      return;
    }
    var st = {}; db.list.forEach(function (x) { st[x.stage] = (st[x.stage] || 0) + 1; });
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Follow-ups due', dueList().length], ['Customers', st.won || 0], ['Leads', (st.lead || 0) + (st.talk || 0)]].map(function (x) { return h('div', {}, [h('span', { text: x[0] }), h('b', { text: T.num(x[1]) })]); })));
    var q = search.value.trim().toLowerCase(), list = h('div', { 'class': 'tlist' });
    var rows = view === 'due' ? dueList() : db.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    rows.filter(function (x) { return !q || [x.name, x.phone, x.city, x.email, x.note].join(' ').toLowerCase().indexOf(q) >= 0; }).forEach(function (x) { list.appendChild(row(x)); });
    if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: view === 'due' ? (db.list.length ? 'No follow-ups due today. 👍' : 'Add your first customer from ➕ Add.') : 'No customers match.' }));
    body.appendChild(list);
    body.appendChild(T.row([T.button('Download all (CSV / Excel)', { small: true, onclick: function () {
      var qq = function (s) { s = String(s == null ? '' : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      T.download(new Blob(['﻿Name,Phone,Email,City,Stage,Next follow-up,Notes\n' + db.list.map(function (x) { return [x.name, x.phone, x.email, x.city, stageName(x.stage).replace(/^\S+ /, ''), x.next, x.note].map(qq).join(','); }).join('\n')], { type: 'text/csv' }), 'customers.csv');
    } })]));
  }
  spot.appendChild(T.card([V.bar(draw), seg, search, body]));
  V.ready.then(draw);

  T.tests['customer-book'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ list: [{ id: 'a', name: 'Alpha', next: '2026-10-01', stage: 'lead', log: [] }, { id: 'b', name: 'Beta', next: '2026-10-10', stage: 'talk', log: [] }, { id: 'c', name: 'Gamma', next: '2026-12-01', stage: 'won', log: [] }, { id: 'd', name: 'Delta', next: '2026-10-02', stage: 'lost', log: [] }] }); db = V.data();
    var d = dueList('2026-10-10');
    if (d.length !== 2 || d[0].name !== 'Alpha') fails.push('due ' + d.map(function (x) { return x.name; }));
    var p = parseCsv('Name,Mobile,City\nRam,98765,Pune\n"Shah, Jr","99 88",Surat\n');
    if (p.length !== 2 || p[1].name !== 'Shah, Jr' || p[1].phone !== '99 88' || p[0].city !== 'Pune') fails.push('csv ' + JSON.stringify(p));
    if (parseCsv('Asha,123').length !== 1) fails.push('csv without header');
    view = 'all'; draw(); if (body.querySelectorAll('.titem').length !== 4) fails.push('list ' + body.querySelectorAll('.titem').length);
    return V.save(keep).then(function () { view = 'due'; draw(); return { ok: !fails.length, n: 4, fails: fails }; });
  }
});
