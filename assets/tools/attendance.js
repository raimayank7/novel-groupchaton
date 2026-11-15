/* Infinity by GroupChatOn — attendance. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Attendance register for staff, students or tuition: mark each day, monthly report with percentages. */
GCOTools.register('attendance', function (spot, T) {
  var h = T.h, V = T.vault('attendance', { people: [], marks: {} }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var KINDS = [['P', 'Present'], ['A', 'Absent'], ['L', 'Leave'], ['H', 'Half day']];
  var tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' }), cur = 'mark', grp = '';
  var day = iso(), month = iso().slice(0, 7);
  function groups() { var g = {}; db.people.forEach(function (p) { if (p.grp) g[p.grp] = 1; }); return Object.keys(g).sort(); }
  function people() { return db.people.filter(function (p) { return !grp || p.grp === grp; }).sort(function (a, b) { return a.name.localeCompare(b.name); }); }
  function mark(d, pid, k) { db.marks[d] = db.marks[d] || {}; if (k) db.marks[d][pid] = k; else delete db.marks[d][pid]; save(); }
  function stats(pid, m) {
    var r = { P: 0, A: 0, L: 0, H: 0, days: 0 };
    Object.keys(db.marks).forEach(function (d) { var k = db.marks[d][pid]; if (d.slice(0, 7) === m && k) { r[k]++; r.days++; } });
    r.pct = r.days ? (r.P + r.H / 2) / r.days * 100 : 0;
    return r;
  }
  function grpPick() {
    var gs = groups(); if (!gs.length) return null;
    var s = T.select([['', 'Everyone']].concat(gs), grp); s.addEventListener('change', function () { grp = s.value; draw(); });
    return T.field('Class / group', s);
  }
  function draw() {
    db = V.data(); tabs.innerHTML = ''; body.innerHTML = '';
    [['mark', '✅ Mark'], ['report', '📊 Monthly report'], ['people', '👥 People']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(cur === t[0]), text: t[1], onclick: function () { cur = t[0]; draw(); } })); });
    ({ mark: drawMark, report: drawReport, people: drawPeople })[cur]();
  }
  function drawMark() {
    var d = h('input', { type: 'date', value: day }); d.addEventListener('change', function () { if (d.value) { day = d.value; draw(); } });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Date', d), grpPick()]));
    var ps = people();
    if (!ps.length) { body.appendChild(h('p', { 'class': 'tnote', text: 'Add names in the People tab first.' })); return; }
    var dm = db.marks[day] || {}, c = { P: 0, A: 0, L: 0, H: 0 };
    ps.forEach(function (p) { if (dm[p.id]) c[dm[p.id]]++; });
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Present', c.P + c.H / 2, 'tin-c'], ['Absent', c.A, 'tout-c'], ['Leave', c.L, ''], ['Not marked', ps.length - c.P - c.A - c.L - c.H, '']].map(function (x) {
      return h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: T.num(x[1]) })]); })));
    body.appendChild(T.row([T.button('Mark all present', { small: true, onclick: function () { ps.forEach(function (p) { if (!(db.marks[day] || {})[p.id]) mark(day, p.id, 'P'); }); draw(); } }),
      T.button('Clear this day', { small: true, onclick: function () { if (confirm('Clear all marks on ' + day + '?')) { ps.forEach(function (p) { mark(day, p.id, null); }); draw(); } } })]));
    var list = h('div', { 'class': 'tlist' });
    ps.forEach(function (p) {
      list.appendChild(h('div', { 'class': 'titem', style: 'flex-wrap:wrap' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: p.name }), h('small', { text: (p.grp || '') + (p.grp ? ' · ' : '') + Math.round(stats(p.id, day.slice(0, 7)).pct) + '% this month' })]),
        T.seg(KINDS.map(function (k) { return [k[0], k[0]]; }), dm[p.id] || '', function (v) { mark(day, p.id, v); draw(); })]));
    });
    body.appendChild(list);
    body.appendChild(h('p', { 'class': 'tnote', text: 'P = present, A = absent, L = leave, H = half day (counts as half present).' }));
  }
  function report(m) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7), n = new Date(y, mo, 0).getDate();
    return { n: n, rows: people().map(function (p) {
      var cells = []; for (var i = 1; i <= n; i++) cells.push(((db.marks[m + '-' + ('0' + i).slice(-2)] || {})[p.id]) || '');
      return { p: p, cells: cells, s: stats(p.id, m) };
    }) };
  }
  function drawReport() {
    var mi = h('input', { type: 'month', value: month }); mi.addEventListener('change', function () { if (mi.value) { month = mi.value; draw(); } });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Month', mi), grpPick()]));
    var r = report(month);
    if (!r.rows.length) { body.appendChild(h('p', { 'class': 'tnote', text: 'No people yet.' })); return; }
    var head = ['Name'].concat(Array.apply(null, Array(r.n)).map(function (_, i) { return String(i + 1); })).concat(['P', 'A', 'L', 'H', '%']);
    var tb = h('tbody');
    r.rows.forEach(function (x) {
      tb.appendChild(h('tr', {}, [h('td', { text: x.p.name, style: 'text-align:left;white-space:nowrap' })].concat(x.cells.map(function (c) {
        return h('td', { text: c, style: 'text-align:center;color:' + (c === 'A' ? '#dc2626' : c === 'P' ? '#16a34a' : 'inherit') }); }))
        .concat([x.s.P, x.s.A, x.s.L, x.s.H].map(function (v) { return h('td', { text: String(v) }); })).concat([h('td', { text: x.s.days ? Math.round(x.s.pct) + '%' : '—' })])));
    });
    body.appendChild(h('div', { 'class': 'tcalc-scroll', 'data-out': '' }, [h('table', { style: 'font-size:13px' }, [h('thead', {}, [h('tr', {}, head.map(function (x) { return h('th', { text: x }); }))]), tb])]));
    body.appendChild(T.row([T.button('Download month (CSV / Excel)', { small: true, onclick: function () {
      var q = function (s) { s = String(s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      var text = head.join(',') + '\n' + r.rows.map(function (x) { return [x.p.name].concat(x.cells).concat([x.s.P, x.s.A, x.s.L, x.s.H, Math.round(x.s.pct)]).map(q).join(','); }).join('\n');
      T.download(new Blob(['﻿' + text], { type: 'text/csv' }), 'attendance-' + month + '.csv');
    } })]));
  }
  function drawPeople() {
    var n = h('input', { type: 'text', placeholder: 'Name (or paste many, one per line)' }), g = h('input', { type: 'text', placeholder: 'e.g. Class 5, Kitchen staff', list: 'att-groups' });
    var dl = h('datalist', { id: 'att-groups' }, groups().map(function (x) { return h('option', { value: x }); }));
    var add = function () {
      var names = n.value.split(/\n|,/).map(function (s) { return s.trim(); }).filter(Boolean); if (!names.length) { n.focus(); return; }
      names.forEach(function (x) { db.people.push({ id: uid(), name: x, grp: g.value.trim() }); }); save(); draw();
    };
    n.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Add a person', n), T.field('Class / group (optional)', g), dl]));
    body.appendChild(T.row([T.button('Add', { primary: true, onclick: add })]));
    var list = h('div', { 'class': 'tlist' });
    people().forEach(function (p) {
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: '👤' }), h('span', { 'class': 'titem-main' }, [h('b', { text: p.name }), h('small', { text: p.grp || 'No group' })]),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Remove ' + p.name + '? Their marks are kept in old reports only until you delete all.')) { db.people = db.people.filter(function (x) { return x !== p; }); save(); draw(); } } })]));
    });
    if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: 'Add staff, students or tuition children. Tip: paste a whole class list, one name per line.' }));
    body.appendChild(list);
  }
  spot.appendChild(T.card([V.bar(draw), tabs, body]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  V.ready.then(draw);

  T.tests['attendance'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ people: [{ id: 'a', name: 'Asha', grp: 'T' }, { id: 'r', name: 'Ravi', grp: 'T' }], marks: {} }); db = V.data();
    mark('2026-10-01', 'a', 'P'); mark('2026-10-02', 'a', 'P'); mark('2026-10-03', 'a', 'A');
    mark('2026-10-01', 'r', 'P'); mark('2026-10-02', 'r', 'H'); mark('2026-10-03', 'r', 'L');
    var a = stats('a', '2026-10'), r = stats('r', '2026-10');
    if (a.P !== 2 || a.A !== 1) fails.push('Asha ' + JSON.stringify(a));
    if (Math.round(a.pct * 10) !== 667) fails.push('Asha % ' + a.pct);
    if (r.pct !== 50) fails.push('Ravi % ' + r.pct);
    month = '2026-10'; cur = 'report'; draw();
    if (body.textContent.indexOf('67%') < 0) fails.push('report lacks 67%');
    return V.save(keep).then(function () { cur = 'mark'; month = iso().slice(0, 7); draw(); return { ok: !fails.length, n: 4, fails: fails }; });
  }
});
