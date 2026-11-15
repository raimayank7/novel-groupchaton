/* Infinity by GroupChatOn — calendar. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Calendar with public holidays (several countries, Easter computed), week start choice, and your own notes per day saved on this device. */
GCOTools.register('calendar', function (spot, T) {
  var h = T.h;
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function key(y, m, d) { return y + '-' + p2(m + 1) + '-' + p2(d); }
  function easter(y) {   // Anonymous Gregorian algorithm → [month 0-11, day]
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
      hh = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - hh - k) % 7, m = Math.floor((a + 11 * hh + 22 * l) / 451),
      mo = Math.floor((hh + l - 7 * m + 114) / 31), da = ((hh + l - 7 * m + 114) % 31) + 1;
    return [mo - 1, da];
  }
  function nth(y, m, wd, n) { var d = new Date(y, m, 1), off = (wd - d.getDay() + 7) % 7; return 1 + off + (n - 1) * 7; }   // nth weekday (0=Sun) of month
  function last(y, m, wd) { var d = new Date(y, m + 1, 0), off = (d.getDay() - wd + 7) % 7; return d.getDate() - off; }
  function holidays(y, c) {
    var out = {}, e = easter(y), ed = new Date(y, e[0], e[1]);
    function add(m, d, n) { var k = key(y, m, d); out[k] = (out[k] ? out[k] + ' · ' : '') + n; }
    function addE(off, n) { var x = new Date(ed); x.setDate(x.getDate() + off); add(x.getMonth(), x.getDate(), n); }
    add(0, 1, 'New Year’s Day'); add(11, 25, 'Christmas Day');
    if (c === 'global') { add(1, 14, 'Valentine’s Day'); add(2, 8, 'International Women’s Day'); add(4, 1, 'Labour Day (many countries)'); addE(0, 'Easter Sunday'); add(5, 21, 'International Yoga Day'); add(9, 31, 'Halloween'); add(11, 31, 'New Year’s Eve'); }
    if (c === 'in') { add(0, 26, 'Republic Day'); add(3, 14, 'Ambedkar Jayanti'); addE(-2, 'Good Friday'); add(4, 1, 'Labour Day / Maharashtra Day'); add(7, 15, 'Independence Day'); add(8, 5, 'Teachers’ Day'); add(9, 2, 'Gandhi Jayanti'); add(10, 14, 'Children’s Day'); }
    if (c === 'us') { add(0, nth(y, 0, 1, 3), 'Martin Luther King Jr. Day'); add(1, nth(y, 1, 1, 3), 'Presidents’ Day'); add(4, last(y, 4, 1), 'Memorial Day'); add(5, 19, 'Juneteenth'); add(6, 4, 'Independence Day'); add(8, nth(y, 8, 1, 1), 'Labor Day'); add(9, nth(y, 9, 1, 2), 'Columbus / Indigenous Peoples’ Day'); add(10, 11, 'Veterans Day'); add(10, nth(y, 10, 4, 4), 'Thanksgiving'); }
    if (c === 'uk') { addE(-2, 'Good Friday'); addE(1, 'Easter Monday'); add(4, nth(y, 4, 1, 1), 'Early May bank holiday'); add(4, last(y, 4, 1), 'Spring bank holiday'); add(7, last(y, 7, 1), 'Summer bank holiday'); add(11, 26, 'Boxing Day'); }
    if (c === 'ca') { addE(-2, 'Good Friday'); add(4, last(y, 4, 1) - (last(y, 4, 1) > 24 ? 7 : 0), 'Victoria Day'); add(6, 1, 'Canada Day'); add(8, nth(y, 8, 1, 1), 'Labour Day'); add(8, 30, 'Truth and Reconciliation Day'); add(9, nth(y, 9, 1, 2), 'Thanksgiving'); add(10, 11, 'Remembrance Day'); add(11, 26, 'Boxing Day'); }
    if (c === 'au') { add(0, 26, 'Australia Day'); addE(-2, 'Good Friday'); addE(1, 'Easter Monday'); add(3, 25, 'Anzac Day'); add(11, 26, 'Boxing Day'); }
    return out;
  }
  var now = new Date(), cur = { y: now.getFullYear(), m: now.getMonth() }, sel = key(now.getFullYear(), now.getMonth(), now.getDate());
  var notes = T.store.get('cal-notes', {});
  var country = T.select([['global', 'Worldwide days'], ['in', 'India'], ['us', 'United States'], ['uk', 'United Kingdom'], ['ca', 'Canada'], ['au', 'Australia'], ['none', 'No holidays']], T.store.get('cal-country', 'global'));
  var start = T.seg([['1', 'Mon first'], ['0', 'Sun first']], T.store.get('cal-start', '1'), function (v) { T.store.set('cal-start', v); draw(); });
  country.addEventListener('change', function () { T.store.set('cal-country', country.value); draw(); });
  var head = h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px' }), grid = h('div', { 'data-out': '' }), info = h('div', { 'class': 'tlist' });
  var note = h('input', { type: 'text', placeholder: 'Add a note for this day (birthday, exam, bill…)' }), dayTitle = h('b');
  note.addEventListener('change', function () { if (note.value.trim()) notes[sel] = note.value.trim(); else delete notes[sel]; T.store.set('cal-notes', notes); draw(); });
  function go(dm) { cur.m += dm; if (cur.m < 0) { cur.m = 11; cur.y--; } if (cur.m > 11) { cur.m = 0; cur.y++; } draw(); }
  function weekNo(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 864e5 + 1) / 7); }
  function cells(y, m, s) { var first = (new Date(y, m, 1).getDay() - s + 7) % 7, n = new Date(y, m + 1, 0).getDate(), out = []; for (var i = 0; i < first; i++) out.push(0); for (var d = 1; d <= n; d++) out.push(d); while (out.length % 7) out.push(0); return out; }
  function draw() {
    var y = cur.y, m = cur.m, s = +start.value(), hol = country.value === 'none' ? {} : holidays(y, country.value), today = new Date(), tk = key(today.getFullYear(), today.getMonth(), today.getDate());
    head.innerHTML = '';
    head.appendChild(T.button('‹', { small: true, onclick: function () { go(-1); } }));
    head.appendChild(h('b', { style: 'font-size:20px;text-align:center', text: new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) }));
    head.appendChild(T.button('›', { small: true, onclick: function () { go(1); } }));
    var names = [], base = new Date(2023, 0, 1 + s);   // 1 Jan 2023 was a Sunday
    for (var i = 0; i < 7; i++) { var dd = new Date(base); dd.setDate(base.getDate() + i); names.push(dd.toLocaleDateString(undefined, { weekday: 'short' })); }
    var rows = [], c = cells(y, m, s);
    for (var r = 0; r < c.length; r += 7) rows.push(c.slice(r, r + 7));
    grid.innerHTML = '';
    grid.appendChild(h('table', { style: 'table-layout:fixed' }, [h('thead', {}, [h('tr', {}, names.map(function (n) { return h('th', { text: n, style: 'text-align:center;padding:6px 2px' }); }))]),
      h('tbody', {}, rows.map(function (row) { return h('tr', {}, row.map(function (d, j) {
        if (!d) return h('td', {});
        var k = key(y, m, d), wd = (j + s) % 7, isH = hol[k], isN = notes[k];
        return h('td', { style: 'text-align:center;padding:2px;white-space:normal' }, [h('button', { type: 'button', title: [isH, isN].filter(Boolean).join(' · ') || null, onclick: function () { sel = k; draw(); },
          style: 'width:100%;min-height:46px;border-radius:10px;border:' + (k === sel ? '2px solid var(--accent)' : '1px solid transparent') + ';background:' + (k === tk ? 'var(--accent-soft)' : 'transparent') + ';color:' + (isH || wd === 0 ? '#dc2626' : 'var(--ink)') + ';font:600 16px/1.2 var(--ui);cursor:pointer' },
          [String(d), h('small', { style: 'display:block;font-size:10px;line-height:1', text: (isH ? '●' : '') + (isN ? '✎' : '') || ' ' })])]);
      })); }))]));
    var sd = sel.split('-'), sdate = new Date(+sd[0], sd[1] - 1, +sd[2]);
    dayTitle.textContent = sdate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · week ' + weekNo(sdate) + ' · day ' + (Math.round((sdate - new Date(sdate.getFullYear(), 0, 1)) / 864e5) + 1) + ' of the year';
    note.value = notes[sel] || '';
    info.innerHTML = '';
    var list = Object.keys(hol).filter(function (k) { return k.slice(0, 7) === key(y, m, 1).slice(0, 7); }).map(function (k) { return [k, '🎉 ' + hol[k]]; })
      .concat(Object.keys(notes).filter(function (k) { return k.slice(0, 7) === key(y, m, 1).slice(0, 7); }).map(function (k) { return [k, '✎ ' + notes[k]]; })).sort();
    if (!list.length) info.appendChild(h('p', { 'class': 'tnote', text: 'No holidays or notes this month.' }));
    list.forEach(function (x) { var p = x[0].split('-'); info.appendChild(h('div', {}, [h('b', { text: new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) + ': ' }), x[1]])); });
  }
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Holidays', country), T.field('Week starts on', start)]), head, grid,
    T.row([T.button('Today', { small: true, onclick: function () { var d = new Date(); cur = { y: d.getFullYear(), m: d.getMonth() }; sel = key(d.getFullYear(), d.getMonth(), d.getDate()); draw(); } })]),
    dayTitle, T.field('Note for this day (saved on this device)', note), h('h3', { text: 'This month' }), info,
    h('p', { 'class': 'tnote', text: 'Festivals that follow the moon (Diwali, Holi, Eid, Chinese New Year, Hanukkah…) move every year and can depend on local moon sighting, so add them as notes. Substitute days off are not shown.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests.calendar = function () {
    var f = [];
    [[2024, 2, 31], [2025, 3, 20], [2026, 3, 5], [2027, 2, 28], [2000, 3, 23]].forEach(function (e) { var r = easter(e[0]); if (r[0] !== e[1] || r[1] !== e[2]) f.push('Easter ' + e[0] + ' ' + r); });
    var us = holidays(2026, 'us'); if (!us['2026-11-26'] || !us['2026-05-25'] || !us['2026-01-19']) f.push('US 2026');
    if (!holidays(2026, 'ca')['2026-05-18']) f.push('Victoria Day 2026');
    if (!holidays(2026, 'uk')['2026-08-31']) f.push('UK summer bank holiday');
    var c = cells(2024, 1, 1); if (c.indexOf(1) !== 3 || c.filter(Boolean).length !== 29) f.push('Feb 2024 grid');
    if (weekNo(new Date(2026, 0, 1)) !== 1 || weekNo(new Date(2027, 0, 1)) !== 53) f.push('ISO week');
    return Promise.resolve({ ok: !f.length, n: 10, fails: f });
  };
});
