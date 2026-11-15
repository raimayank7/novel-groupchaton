/* Infinity by GroupChatOn — time-card. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Time card: clock-in and clock-out times for a week, breaks, overnight shifts, daily or weekly overtime and pay. */
GCOTools.register('time-card', function (spot, T) {
  var h = T.h, status = T.status();
  function mins(t) { if (!t) return null; var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  // hours worked: an end time earlier than the start means the shift ran past midnight
  function hours(a, b, brk) { var s = mins(a), e = mins(b); if (s == null || e == null) return 0; if (e <= s) e += 1440; return Math.max(0, e - s - (+brk || 0)) / 60; }
  function overtime(daily, rule) {
    var tot = daily.reduce(function (x, y) { return x + y; }, 0), ot = 0;
    if (rule === 'week40') ot = Math.max(0, tot - 40);
    else if (rule === 'day8') ot = daily.reduce(function (x, y) { return x + Math.max(0, y - 8); }, 0);
    else if (rule === 'in') ot = Math.max(daily.reduce(function (x, y) { return x + Math.max(0, y - 9); }, 0), tot - 48);
    else if (rule === 'both') ot = Math.max(daily.reduce(function (x, y) { return x + Math.max(0, y - 8); }, 0), tot - 40);
    return { total: tot, ot: Math.min(ot, tot), reg: tot - Math.min(ot, tot) };
  }
  function hm(x) { var m = Math.round(x * 60); return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' m'; }
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var st = T.store.get('timecard', { rows: DAYS.map(function () { return ['', '', '']; }), rate: '', mult: 1.5, rule: 'week40', name: '' });
  var inputs = [], tbl = h('div', { style: 'display:grid;gap:6px' }), sums = h('div', { 'class': 'tsum', 'data-out': '' });
  var rate = h('input', { type: 'number', min: '0', step: '0.01', value: st.rate, placeholder: 'e.g. 15', 'aria-label': 'Hourly rate' }), mult = T.select([[1, 'No extra'], [1.25, '× 1.25'], [1.5, '× 1.5 (time and a half)'], [2, '× 2 (double time)']], st.mult);
  var rule = T.select([['week40', 'Over 40 hours a week (US)'], ['day8', 'Over 8 hours a day'], ['both', 'Over 8 a day or 40 a week (California-style)'], ['in', 'Over 9 a day or 48 a week (India)'], ['none', 'No overtime']], st.rule);
  var name = h('input', { type: 'text', value: st.name, placeholder: 'Employee name (optional)', 'aria-label': 'Name' });
  DAYS.forEach(function (d, i) {
    var a = h('input', { type: 'time', value: st.rows[i][0], 'aria-label': d + ' in' }), b = h('input', { type: 'time', value: st.rows[i][1], 'aria-label': d + ' out' }), c = h('input', { type: 'number', min: '0', step: '5', value: st.rows[i][2], placeholder: '0', 'aria-label': d + ' break minutes' });
    var out = h('b', { style: 'text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap' });
    inputs.push([a, b, c, out]);
    tbl.appendChild(h('div', { style: 'display:grid;grid-template-columns:minmax(42px,.7fr) minmax(0,1.2fr) minmax(0,1.2fr) minmax(52px,.8fr) minmax(64px,.9fr);gap:6px;align-items:center' }, [h('span', { style: 'font-weight:600', text: d.slice(0, 3) }), a, b, c, out]));
  });
  function calc() {
    var daily = inputs.map(function (r) { var x = hours(r[0].value, r[1].value, r[2].value); r[3].textContent = x ? hm(x) : '–'; return x; });
    var o = overtime(daily, rule.value), r = +rate.value || 0, m = +mult.value;
    st = { rows: inputs.map(function (x) { return [x[0].value, x[1].value, x[2].value]; }), rate: rate.value, mult: m, rule: rule.value, name: name.value }; T.store.set('timecard', st);
    sums.innerHTML = '';
    [['Total', hm(o.total)], ['Regular', hm(o.reg)], ['Overtime', hm(o.ot)], ['Decimal hours', o.total.toFixed(2)]].concat(r ? [['Pay', T.money(o.reg * r + o.ot * r * m)]] : [])
      .forEach(function (x) { sums.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { text: x[1] })])); });
    return o;
  }
  function text() {
    var o = calc(), lines = ['Time card' + (name.value ? ' — ' + name.value : '')];
    inputs.forEach(function (r, i) { if (r[0].value && r[1].value) lines.push(DAYS[i].slice(0, 3) + '  ' + r[0].value + '–' + r[1].value + (+r[2].value ? ' (break ' + r[2].value + ' min)' : '') + '  ' + hm(hours(r[0].value, r[1].value, r[2].value))); });
    lines.push('Total ' + hm(o.total) + ' · Regular ' + hm(o.reg) + ' · Overtime ' + hm(o.ot));
    if (+rate.value) lines.push('Pay ' + T.money(o.reg * rate.value + o.ot * rate.value * mult.value));
    return lines.join('\n');
  }
  tbl.addEventListener('input', calc); [rate, mult, rule, name].forEach(function (x) { x.addEventListener('input', calc); x.addEventListener('change', calc); });
  var cp = T.button('Copy', { small: true, onclick: function () { T.copy(text(), cp); } });
  spot.appendChild(T.card([T.field('Name', name),
    h('div', { style: 'display:grid;grid-template-columns:minmax(42px,.7fr) minmax(0,1.2fr) minmax(0,1.2fr) minmax(52px,.8fr) minmax(64px,.9fr);gap:6px;font-size:12.5px;color:var(--muted);font-weight:600' }, [h('span', { text: 'Day' }), h('span', { text: 'In' }), h('span', { text: 'Out' }), h('span', { text: 'Break (min)' }), h('span', { style: 'text-align:right', text: 'Hours' })]),
    tbl, h('div', { 'class': 'tgrid2' }, [T.field('Overtime rule', rule), T.field('Hourly rate (' + T.currency() + ', optional)', rate), T.field('Overtime pay', mult)]), sums,
    T.row([T.button('Try a sample', { small: true, onclick: function () { [['09:00', '17:30', 30], ['09:00', '18:00', 30], ['08:30', '17:00', 30], ['09:00', '19:30', 45], ['09:00', '17:00', 30], ['22:00', '06:00', 30], ['', '', '']].forEach(function (v, i) { inputs[i][0].value = v[0]; inputs[i][1].value = v[1]; inputs[i][2].value = v[2]; }); rate.value = '15'; calc(); } }),
      cp, T.button('Download CSV', { small: true, onclick: function () { calc(); T.download(new Blob(['Day,In,Out,Break (min),Hours\n' + inputs.map(function (r, i) { return [DAYS[i], r[0].value, r[1].value, r[2].value || 0, hours(r[0].value, r[1].value, r[2].value).toFixed(2)].join(','); }).join('\n')], { type: 'text/csv;charset=utf-8' }), 'time-card.csv'); } }),
      T.button('Clear week', { small: true, onclick: function () { if (!confirm('Clear all times for this week?')) return; inputs.forEach(function (r) { r[0].value = r[1].value = r[2].value = ''; }); calc(); } })]), status.el,
    h('p', { 'class': 'tnote', text: 'A shift that ends earlier than it starts (like 22:00 to 06:00) is counted as running past midnight. Overtime rules differ by country, state and contract: check yours.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  calc();
  T.tests['time-card'] = function () {
    var f = [];
    if (hours('09:00', '17:30', 30) !== 8) f.push('day ' + hours('09:00', '17:30', 30));
    if (hours('22:00', '06:00', 0) !== 8) f.push('overnight');
    if (hours('', '17:00', 0) !== 0) f.push('blank');
    var a = overtime([9, 9, 9, 9, 9], 'week40'), b = overtime([10, 8, 9], 'day8'), c = overtime([8, 8, 8, 8, 8, 8, 8], 'in');
    if (a.ot !== 5 || a.reg !== 40) f.push('week40');
    if (b.ot !== 3) f.push('day8');
    if (c.ot !== 8) f.push('india 48 ' + c.ot);
    if (hm(7.5) !== '7 h 30 m') f.push('hm');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
