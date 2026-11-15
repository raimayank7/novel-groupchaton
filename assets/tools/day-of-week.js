/* Infinity by GroupChatOn — day-of-week. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* What day was / will be a date: the weekday of any date, how far it is from today, and that date's weekday in the next years. */
GCOTools.register('day-of-week', function (spot, T) {
  var h = T.h, DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function utc(s) { var p = /^(\d{1,4})-(\d{2})-(\d{2})$/.exec(s); if (!p) return null; var d = new Date(Date.UTC(+p[1], +p[2] - 1, +p[3])); d.setUTCFullYear(+p[1]); return d.getUTCDate() === +p[3] ? d : null; }
  function dow(s) { var d = utc(s); return d ? DAY[d.getUTCDay()] : ''; }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var inp = h('input', { type: 'date', value: iso(new Date()), 'aria-label': 'Date' });
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-size:40px;font-weight:800;text-align:center' }), info = h('div', { 'class': 'tstats' }), next = h('div', { 'class': 'tstats' });
  function draw() {
    var d = utc(inp.value); info.innerHTML = next.innerHTML = '';
    if (!d) { big.textContent = 'Pick a date'; return; }
    big.textContent = DAY[d.getUTCDay()];
    var today = utc(iso(new Date())), diff = Math.round((d - today) / 864e5), start = Date.UTC(d.getUTCFullYear(), 0, 1), doy = Math.round((d - start) / 864e5) + 1;
    [[diff === 0 ? 'Today' : Math.abs(diff).toLocaleString() + ' days', diff === 0 ? '' : diff > 0 ? 'from now' : 'ago'], ['Day ' + doy, 'of the year'],
      [d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }), 'date']]
      .forEach(function (x) { info.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: x[0] }), h('span', { text: x[1] })])); });
    var y0 = Math.max(new Date().getFullYear(), d.getUTCFullYear() + 1), m = inp.value.slice(4);
    for (var y = y0; y < y0 + 8; y++) { var s = ('000' + y).slice(-4) + m, w = dow(s); if (w) next.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: w }), h('span', { text: String(y) })])); }
  }
  inp.addEventListener('input', draw);
  spot.appendChild(T.card([T.field('Date', inp), T.row([['Today', 0], ['Tomorrow', 1], ['In 100 days', 100]].map(function (x) {
    return T.button(x[0], { small: true, onclick: function () { var t = new Date(); t.setDate(t.getDate() + x[1]); inp.value = iso(t); draw(); } }); })), big, info,
    T.field('The same day in coming years (birthdays, anniversaries)', next)]));
  draw();
  T.tests['day-of-week'] = function () {
    var f = [], c = [['1947-08-15', 'Friday'], ['2000-01-01', 'Saturday'], ['2026-11-01', 'Sunday'], ['1969-07-20', 'Sunday'], ['2024-02-29', 'Thursday'], ['0001-01-01', 'Monday']];
    c.forEach(function (x) { if (dow(x[0]) !== x[1]) f.push(x[0] + ' ' + dow(x[0])); });
    if (dow('2025-02-29')) f.push('29 Feb 2025 accepted');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
