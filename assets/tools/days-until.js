/* Infinity by GroupChatOn — days-until. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Days until: a live countdown to any date (birthday, exam, festival, New Year) in days, weeks and working days; events saved on the device. */
GCOTools.register('days-until', function (spot, T) {
  var h = T.h;
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function days(a, b) { var p = a.split('-'), q = b.split('-'); return Math.round((Date.UTC(q[0], q[1] - 1, q[2]) - Date.UTC(p[0], p[1] - 1, p[2])) / 864e5); }
  function workdays(a, b) {   // Monday–Friday from the day after a up to and including b
    var n = days(a, b), p = a.split('-'), start = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(), full = Math.floor(n / 7), c = full * 5;
    for (var i = 1; i <= n % 7; i++) { var d = (start + full * 7 + i) % 7; if (d && d !== 6) c++; }
    return c;
  }
  function nextOn(m, d, from) { var y = +from.slice(0, 4), s = y + '-' + m + '-' + d; return days(from, s) >= 0 ? s : (y + 1) + '-' + m + '-' + d; }
  var today = ymd(new Date());
  var PRESETS = [['New Year', '01-01'], ['Valentine’s Day', '02-14'], ['Independence Day (India)', '08-15'], ['Independence Day (US)', '07-04'], ['Halloween', '10-31'], ['Christmas', '12-25']];
  var name = h('input', { type: 'text', placeholder: 'e.g. My birthday, Board exam, Trip to Goa', 'aria-label': 'Event name' }), date = h('input', { type: 'date', 'aria-label': 'Event date' });
  var yearly = h('input', { type: 'checkbox' });
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-size:48px;font-weight:900;text-align:center;line-height:1.1' }), sub = h('div', { style: 'text-align:center;font-weight:600' });
  var clock = h('div', { style: 'text-align:center;font:700 22px ui-monospace,Consolas,monospace' }), info = h('div', { 'class': 'tstats' }), saved = h('div', { 'class': 'tkv' }), tick = 0;
  var ev = T.store.get('days-until', []);
  function target() { if (!date.value) return ''; return yearly.checked ? nextOn(date.value.slice(5, 7), date.value.slice(8), ymd(new Date())) : date.value; }
  function draw() {
    if (!big.isConnected && tick) { clearInterval(tick); return; }
    today = ymd(new Date()); info.innerHTML = '';
    var t = target();
    if (!t) { big.textContent = 'Pick a date'; sub.textContent = clock.textContent = ''; return; }
    var n = days(today, t), label = name.value.trim() || 'your date';
    big.textContent = n === 0 ? 'Today! 🎉' : Math.abs(n).toLocaleString() + (Math.abs(n) === 1 ? ' day' : ' days');
    sub.textContent = n === 0 ? label + ' is today' : n > 0 ? 'until ' + label + ' (' + new Date(t + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ')' : 'since ' + label;
    if (n > 0) {
      var ms = new Date(t + 'T00:00') - new Date(), s = Math.max(0, Math.floor(ms / 1000));
      clock.textContent = Math.floor(s / 86400) + 'd ' + ('0' + Math.floor(s % 86400 / 3600)).slice(-2) + 'h ' + ('0' + Math.floor(s % 3600 / 60)).slice(-2) + 'm ' + ('0' + s % 60).slice(-2) + 's';
      [[Math.floor(n / 7) + ' weeks ' + (n % 7) + ' days', 'in weeks'], [workdays(today, t).toLocaleString(), 'working days (Mon–Fri)'], [Math.round(n / 30.44 * 10) / 10 + '', 'months (about)'],
        [(n * 24).toLocaleString(), 'hours']].forEach(function (x) { info.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: x[0] }), h('span', { text: x[1] })])); });
    } else clock.textContent = '';
  }
  function drawSaved() {
    saved.innerHTML = '';
    ev.forEach(function (e, i) {
      var t = e.yearly ? nextOn(e.date.slice(5, 7), e.date.slice(8), ymd(new Date())) : e.date, n = days(ymd(new Date()), t);
      saved.appendChild(h('div', {}, [h('span', { text: e.name }), h('code', { text: n === 0 ? 'today' : n > 0 ? n + ' days to go' : -n + ' days ago' }),
        T.row([T.button('Open', { small: true, onclick: function () { name.value = e.name; date.value = e.date; yearly.checked = e.yearly; draw(); } }),
          T.button('✕', { small: true, onclick: function () { ev.splice(i, 1); T.store.set('days-until', ev); drawSaved(); } })])]));
    });
  }
  [name, date, yearly].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('What are you counting down to?', name), T.field('Date', date)]),
    h('label', { 'class': 'tcheck' }, [yearly, ' Every year (birthdays, anniversaries, festivals on a fixed date)']),
    T.row(PRESETS.map(function (p) { return T.button(p[0], { small: true, onclick: function () { name.value = p[0]; date.value = nextOn(p[1].slice(0, 2), p[1].slice(3), ymd(new Date())); yearly.checked = true; draw(); } }); })),
    big, sub, clock, info, T.row([T.button('Save this countdown', { primary: true, onclick: function () { if (!date.value) return; ev.push({ name: name.value.trim() || 'My date', date: date.value, yearly: yearly.checked }); T.store.set('days-until', ev); drawSaved(); } })]),
    T.field('Saved on this device', saved)]));
  draw(); drawSaved(); tick = setInterval(draw, 1000);
  T.tests['days-until'] = function () {
    var f = [];
    if (days('2026-11-01', '2026-12-25') !== 54) f.push('54 days');
    if (days('2026-12-31', '2027-01-01') !== 1 || days('2024-02-28', '2024-03-01') !== 2) f.push('year / leap');
    if (workdays('2026-11-01', '2026-11-08') !== 5 || workdays('2026-11-06', '2026-11-09') !== 1 || workdays('2026-11-01', '2026-12-25') !== 40) f.push('workdays ' + workdays('2026-11-01', '2026-12-25'));
    if (nextOn('01', '01', '2026-11-01') !== '2027-01-01' || nextOn('12', '25', '2026-11-01') !== '2026-12-25' || nextOn('11', '01', '2026-11-01') !== '2026-11-01') f.push('next yearly');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
