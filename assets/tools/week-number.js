/* Infinity by GroupChatOn — week-number. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Week number: the ISO week (Monday start) and US week (Sunday start) of any date, the week's dates, and weeks in a year. */
GCOTools.register('week-number', function (spot, T) {
  var h = T.h;
  function isoWeek(y, m, d) {
    var t = new Date(Date.UTC(y, m - 1, d)), day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    var y1 = t.getUTCFullYear();
    return { year: y1, week: Math.ceil(((t - Date.UTC(y1, 0, 1)) / 864e5 + 1) / 7) };
  }
  function usWeek(y, m, d) { var jan1 = new Date(Date.UTC(y, 0, 1)), t = Date.UTC(y, m - 1, d); return Math.floor(((t - jan1) / 864e5 + jan1.getUTCDay()) / 7) + 1; }
  function weeksIn(y) { return isoWeek(y, 12, 28).week; }
  function fmt(t) { return new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); }
  var now = new Date(), inp = h('input', { type: 'date', 'aria-label': 'Date', value: now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2) });
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-size:44px;font-weight:800;text-align:center' }), info = h('div', { 'class': 'tstats' });
  function draw() {
    var p = inp.value.split('-').map(Number); info.innerHTML = '';
    if (p.length !== 3 || !p[0]) { big.textContent = 'Pick a date'; return; }
    var w = isoWeek(p[0], p[1], p[2]), t = Date.UTC(p[0], p[1] - 1, p[2]), dow = new Date(t).getUTCDay() || 7, mon = t - (dow - 1) * 864e5;
    big.textContent = 'Week ' + w.week;
    [[fmt(mon) + ' – ' + fmt(mon + 6 * 864e5), 'this week (Monday to Sunday)'], [String(w.year), 'week-year' + (w.year !== p[0] ? ' (belongs to ' + w.year + ')' : '')],
      ['Week ' + usWeek(p[0], p[1], p[2]), 'US style (weeks start Sunday)'], [weeksIn(w.year) + ' weeks', 'in ISO year ' + w.year], [w.year + '-W' + ('0' + w.week).slice(-2) + '-' + dow, 'ISO 8601 code']]
      .forEach(function (x) { info.appendChild(h('div', { 'class': 'tstat tstat-wide' }, [h('b', { text: x[0] }), h('span', { text: x[1] })])); });
  }
  inp.addEventListener('input', draw);
  spot.appendChild(T.card([T.field('Date', inp), big, info]));
  draw();
  T.tests['week-number'] = function () {
    var f = [], c = [[2026, 1, 1, '2026-1'], [2021, 1, 1, '2020-53'], [2024, 12, 30, '2025-1'], [2026, 11, 1, '2026-44'], [2027, 1, 3, '2026-53']];
    c.forEach(function (x) { var w = isoWeek(x[0], x[1], x[2]), s = w.year + '-' + w.week; if (s !== x[3]) f.push(x.slice(0, 3).join('-') + ' ' + s); });
    if (weeksIn(2026) !== 53 || weeksIn(2025) !== 52 || weeksIn(2020) !== 53) f.push('weeks in year');
    if (usWeek(2026, 1, 3) !== 1 || usWeek(2026, 1, 4) !== 2) f.push('us week');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
