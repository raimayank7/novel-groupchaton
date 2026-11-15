/* Infinity by GroupChatOn — shift-planner. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Shift and duty roster planner: rotate day, night and off shifts across a team from a repeating pattern, with daily cover, CSV and print. */
GCOTools.register('shift-planner', function (spot, T) {
  var h = T.h, status = T.status();
  var CODES = { D: ['Day', '#fde68a', '#713f12'], N: ['Night', '#1e3a8a', '#ffffff'], M: ['Morning', '#bbf7d0', '#14532d'], E: ['Evening', '#fbcfe8', '#831843'], G: ['General', '#bfdbfe', '#1e3a8a'], O: ['Off', '#f1f5f9', '#64748b'], L: ['Leave', '#e9d5ff', '#581c87'] };
  var PRESETS = [['DDNNOO', '2 days, 2 nights, 2 off'], ['DDDDOOOO', '4 on, 4 off'], ['MMMMMOOEEEEEOONNNNNOO', '3 shifts, weekly rotation (5 on, 2 off)'], ['DDOODDDOODDOOO', 'Pitman 2-2-3 (12-hour)'], ['DDDDDOO', 'Weekdays on, weekends off'], ['DDDNNNOOO', '3 days, 3 nights, 3 off'], ['MEN', 'Morning, evening, night, rotating daily']];
  function clean(p) { return String(p).toUpperCase().replace(/[^A-Z]/g, ''); }
  // each person follows the same pattern, started at a different point so the shifts are spread across the team
  function roster(people, pattern, days, stagger) {
    var L = pattern.length;
    return people.map(function (p, i) {
      var off = stagger ? Math.round(i * L / people.length) % L : 0, row = [];
      for (var d = 0; d < days; d++) row.push(pattern[(d + off) % L]);
      return { name: p, row: row };
    });
  }
  function cover(rows, days) { var out = []; for (var d = 0; d < days; d++) { var c = {}; rows.forEach(function (r) { var x = r.row[d]; if (x !== 'O' && x !== 'L') c[x] = (c[x] || 0) + 1; }); out.push(c); } return out; }
  var people = h('textarea', { rows: '5', placeholder: 'One name per line', 'aria-label': 'Team members' }), pat = h('input', { type: 'text', 'class': 'tmono', 'aria-label': 'Pattern' });
  var st = T.store.get('shift', { people: 'Asha\nRavi\nMeena\nJohn\nFatima\nKaran', pattern: 'DDNNOO' });
  people.value = st.people; pat.value = st.pattern;
  var preset = T.select([['', 'Choose a common pattern…']].concat(PRESETS.map(function (p) { return [p[0], p[1]]; })), '');
  var d0 = new Date(), start = h('input', { type: 'date', value: d0.getFullYear() + '-' + String(d0.getMonth() + 1).padStart(2, '0') + '-' + String(d0.getDate()).padStart(2, '0'), 'aria-label': 'Start date' });
  var days = T.select([[7, '1 week'], [14, '2 weeks'], [28, '4 weeks'], [31, '31 days']], 14), stagger = h('input', { type: 'checkbox', checked: true });
  var view = h('div', { style: 'overflow-x:auto' }), legend = h('div', { 'class': 'trow' }), info = h('p', { 'class': 'tnote', 'data-out': '' }), rows = [], dates = [];
  function make() {
    var list = people.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean), p = clean(pat.value);
    if (!list.length) { status.error('Add at least one name.'); return; }
    if (!p) { status.error('Type a pattern using D (day), N (night), M, E, G and O (off), e.g. DDNNOO.'); return; }
    var bad = p.split('').filter(function (c) { return !CODES[c]; });
    if (bad.length) { status.error('Unknown letter ' + bad[0] + '. Use D, N, M, E, G, O or L.'); return; }
    T.store.set('shift', { people: people.value, pattern: p }); pat.value = p; status.clear();
    var n = +days.value, s = new Date((start.value || '2026-01-01') + 'T12:00:00'); rows = roster(list, p, n, stagger.checked); dates = [];
    for (var i = 0; i < n; i++) { var d = new Date(s); d.setDate(s.getDate() + i); dates.push(d); }
    var cv = cover(rows, n), tbl = h('table', { style: 'border-collapse:collapse;font:13px var(--ui);min-width:100%' });
    var head = h('tr', {}, [h('th', { style: 'position:sticky;left:0;background:var(--surface);text-align:left;padding:6px 8px', text: 'Name' })]);
    dates.forEach(function (d) { head.appendChild(h('th', { style: 'padding:4px;min-width:34px;font-weight:600;color:' + (d.getDay() === 0 || d.getDay() === 6 ? 'var(--accent)' : 'var(--muted)') }, [h('div', { text: d.toLocaleDateString(undefined, { weekday: 'narrow' }) }), h('div', { text: String(d.getDate()) })])); });
    tbl.appendChild(head);
    rows.forEach(function (r) {
      var tr = h('tr', {}, [h('th', { style: 'position:sticky;left:0;background:var(--surface);text-align:left;padding:6px 8px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis', text: r.name })]);
      r.row.forEach(function (c) { var k = CODES[c]; tr.appendChild(h('td', { title: k[0], style: 'text-align:center;padding:6px 2px;border:2px solid var(--surface);border-radius:6px;font-weight:700;background:' + k[1] + ';color:' + k[2], text: c })); });
      tbl.appendChild(tr);
    });
    var ctr = h('tr', {}, [h('th', { style: 'position:sticky;left:0;background:var(--surface);text-align:left;padding:6px 8px;color:var(--muted)', text: 'On duty' })]);
    cv.forEach(function (c) { ctr.appendChild(h('td', { style: 'text-align:center;font-size:11px;color:var(--muted);padding:4px 1px', text: Object.keys(c).sort().map(function (k) { return k + c[k]; }).join(' ') || '0' })); });
    tbl.appendChild(ctr);
    view.innerHTML = ''; view.appendChild(tbl);
    var gaps = cv.filter(function (c) { return !Object.keys(c).length; }).length;
    info.textContent = list.length + ' people · ' + p.length + '-day cycle · ' + n + ' days' + (gaps ? ' · ⚠️ ' + gaps + ' day' + (gaps > 1 ? 's' : '') + ' with nobody on duty' : ' · every day is covered');
    legend.innerHTML = ''; Array.from(new Set(p.split(''))).forEach(function (c) { legend.appendChild(h('span', { style: 'padding:3px 10px;border-radius:999px;font-size:13px;font-weight:600;background:' + CODES[c][1] + ';color:' + CODES[c][2], text: c + ' = ' + CODES[c][0] })); });
  }
  function csv() { var fmt = function (d) { return d.toISOString().slice(0, 10); }; return 'Name,' + dates.map(fmt).join(',') + '\n' + rows.map(function (r) { return '"' + r.name.replace(/"/g, '""') + '",' + r.row.map(function (c) { return CODES[c][0]; }).join(','); }).join('\n'); }
  function print() {
    if (!rows.length) return;
    var w = window.open('', '_blank'); if (!w) { status.error('Allow pop-ups to print, or download the CSV.'); return; }
    w.document.write('<!doctype html><meta charset="utf-8"><title>Duty roster</title><style>body{font:13px system-ui;margin:16px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 6px;text-align:center}th:first-child{text-align:left}@page{size:landscape}</style><h2>Duty roster</h2>' + view.innerHTML);
    w.document.close(); w.focus(); w.print();
  }
  preset.addEventListener('change', function () { if (preset.value) { pat.value = preset.value; make(); } });
  [days, start, stagger].forEach(function (x) { x.addEventListener('change', make); });
  spot.appendChild(T.card([T.field('Team (one per line)', people), h('div', { 'class': 'tgrid2' }, [T.field('Common patterns', preset), T.field('Pattern (D day, N night, M morning, E evening, G general, O off, L leave)', pat)]),
    h('div', { 'class': 'tgrid2' }, [T.field('Start date', start), T.field('Show', days)]), h('label', { 'class': 'tcheck' }, [stagger, ' Stagger people so shifts are spread out']),
    T.row([T.button('Make roster', { primary: true, onclick: make }), T.button('Try a sample', { small: true, onclick: function () { people.value = 'Asha\nRavi\nMeena\nJohn\nFatima\nKaran'; pat.value = 'DDNNOO'; make(); } }),
      T.button('Download CSV', { small: true, onclick: function () { if (rows.length) T.download(new Blob([csv()], { type: 'text/csv;charset=utf-8' }), 'duty-roster.csv'); } }), T.button('Print', { small: true, onclick: print })]),
    status.el, info, legend, view]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['shift-planner'] = function () {
    var f = [], r = roster(['A', 'B', 'C'], 'DNO', 3, true);
    if (r.map(function (x) { return x.row.join(''); }).join(' ') !== 'DNO NOD ODN') f.push('stagger ' + r.map(function (x) { return x.row.join(''); }).join(' '));
    var c = cover(r, 3);
    if (c.some(function (x) { return x.D !== 1 || x.N !== 1; })) f.push('cover');
    if (roster(['A', 'B'], 'DDOO', 2, false)[1].row.join('') !== 'DD') f.push('no stagger');
    if (clean('d d n-n o,o') !== 'DDNNOO') f.push('clean');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
