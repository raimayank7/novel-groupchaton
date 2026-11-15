/* Infinity by GroupChatOn — medicine-schedule. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Medicine schedule: what to take when, tick doses as taken, adherence, and reminders (on screen and in the phone calendar). */
GCOTools.register('medicine-schedule', function (spot, T) {
  var h = T.h, V = T.vault('meds', { meds: [], taken: {} }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function hm(d) { return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function doses(day) {
    var r = [];
    db.meds.forEach(function (m) { if (m.start <= day && (!m.end || m.end >= day) && (!m.alt || Math.round((new Date(day) - new Date(m.start)) / 864e5) % 2 === 0)) m.times.forEach(function (t) { r.push({ m: m, t: t, key: m.id + '@' + t }); }); });
    return r.sort(function (a, b) { return a.t < b.t ? -1 : 1; });
  }
  function isTaken(day, key) { return !!(db.taken[day] || {})[key]; }
  function take(day, key, on) { db.taken[day] = db.taken[day] || {}; if (on) db.taken[day][key] = hm(new Date()); else delete db.taken[day][key]; save(); }
  function adherence(from, to) {
    var due = 0, got = 0, d = new Date(from + 'T00:00:00');
    while (iso(d) <= to) { doses(iso(d)).forEach(function (x) { due++; if (isTaken(iso(d), x.key)) got++; }); d.setDate(d.getDate() + 1); }
    return { due: due, got: got, pct: due ? got / due * 100 : 0 };
  }
  var day = iso(), today = h('div', { 'class': 'tlist', 'data-out': '' }), sum = h('div', { 'class': 'tsum' }), meds = h('div', { 'class': 'tlist' });
  var f = { name: h('input', { type: 'text', placeholder: 'e.g. Metformin 500' }), dose: h('input', { type: 'text', placeholder: 'e.g. 1 tablet, 5 ml' }), times: h('input', { type: 'text', value: '08:00, 20:00', placeholder: '08:00, 14:00, 21:00' }),
    food: T.select(['After food', 'Before food', 'With food', 'Empty stomach', 'At bedtime', '—'], 'After food'), start: h('input', { type: 'date', value: iso() }), end: h('input', { type: 'date' }), alt: T.select([['0', 'Every day'], ['1', 'Alternate days']], '0') };
  var msg = T.status();
  function parseTimes(s) { return s.split(/[,\s]+/).map(function (x) { var m = x.match(/^(\d{1,2})(?::|\.)?(\d{2})?$/); if (!m || +m[1] > 23 || +(m[2] || 0) > 59) return null; return ('0' + m[1]).slice(-2) + ':' + (m[2] || '00'); }).filter(Boolean).sort(); }
  function addMed() {
    var ts = parseTimes(f.times.value);
    if (!f.name.value.trim()) { msg.error('Type the medicine name.'); f.name.focus(); return; }
    if (!ts.length) { msg.error('Type at least one time, like 08:00.'); f.times.focus(); return; }
    db.meds.push({ id: uid(), name: f.name.value.trim(), dose: f.dose.value.trim(), times: ts, food: f.food.value === '—' ? '' : f.food.value, start: f.start.value || iso(), end: f.end.value || '', alt: f.alt.value === '1' });
    save(); msg.ok(f.name.value.trim() + ' added at ' + ts.join(', ') + '.'); f.name.value = ''; f.dose.value = ''; f.end.value = ''; draw();
  }
  function draw() {
    db = V.data(); today.innerHTML = ''; sum.innerHTML = ''; meds.innerHTML = '';
    var list = doses(day), nowT = hm(new Date());
    list.forEach(function (x) {
      var done = isTaken(day, x.key), late = !done && day === iso() && x.t < nowT;
      today.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: done ? '✅' : late ? '⏰' : '💊' }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: x.t + ' · ' + x.m.name }), h('small', { text: [x.m.dose, x.m.food].filter(Boolean).join(' · ') + (done ? ' · taken at ' + db.taken[day][x.key] : late ? ' · not taken yet' : '') })]),
        T.button(done ? 'Undo' : 'Taken', { small: true, primary: !done, onclick: function () { take(day, x.key, !done); draw(); } })]));
    });
    if (!list.length) today.appendChild(h('p', { 'class': 'tnote', text: db.meds.length ? 'No medicines on this day.' : 'Add your medicines below to build the schedule.' }));
    var wk = adherence(iso(new Date(Date.now() - 7 * 864e5)), iso(new Date(Date.now() - 864e5))), tk = list.filter(function (x) { return isTaken(day, x.key); }).length;
    [['Doses on this day', tk + ' of ' + list.length + ' taken'], ['Last 7 days', wk.due ? Math.round(wk.pct) + '% taken' : '—']].forEach(function (x) { sum.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { text: x[1] })])); });
    db.meds.forEach(function (m) {
      var over = m.end && m.end < iso();
      meds.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: over ? '✔️' : '💊' }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: m.name + (m.dose ? ' · ' + m.dose : '') }), h('small', { text: m.times.join(', ') + (m.alt ? ' · alternate days' : '') + (m.food ? ' · ' + m.food : '') + ' · ' + m.start + (m.end ? ' to ' + m.end : ' onwards') })]),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Remove ' + m.name + '?')) { db.meds = db.meds.filter(function (y) { return y !== m; }); save(); draw(); } } })]));
    });
  }
  var dayIn = h('input', { type: 'date', value: day }); dayIn.addEventListener('change', function () { if (dayIn.value) { day = dayIn.value; draw(); } });
  // reminders while the page is open
  var timer = null, rem = T.button('🔔 Remind me while this page is open', { small: true, onclick: function () {
    if (!('Notification' in window)) { alert('This browser cannot show notifications. Use the calendar reminders instead.'); return; }
    Notification.requestPermission().then(function (p) {
      if (p !== 'granted') { alert('Notifications are blocked for this site. Use the calendar reminders instead.'); return; }
      rem.textContent = '🔔 Reminders on'; if (timer) return;
      var said = {};
      timer = setInterval(function () {
        var d = iso(), t = hm(new Date());
        doses(d).forEach(function (x) { if (x.t === t && !isTaken(d, x.key) && !said[d + x.key]) { said[d + x.key] = 1; try { new Notification('Time for ' + x.m.name, { body: [x.m.dose, x.m.food].filter(Boolean).join(' · ') || x.t }); } catch (e) {} } });
      }, 20000);
    });
  } });
  function ics() {
    if (!db.meds.length) { alert('Add a medicine first.'); return; }
    var stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', esc = function (s) { return String(s).replace(/[\\;,]/g, function (c) { return '\\' + c; }); }, ev = [];
    db.meds.filter(function (m) { return !m.end || m.end >= iso(); }).forEach(function (m) {
      m.times.forEach(function (t) {
        ev.push(['BEGIN:VEVENT', 'UID:' + m.id + '-' + t.replace(':', '') + '@infinity.groupchaton.com', 'DTSTAMP:' + stamp, 'DTSTART:' + m.start.replace(/-/g, '') + 'T' + t.replace(':', '') + '00', 'DURATION:PT10M',
          'RRULE:FREQ=DAILY' + (m.alt ? ';INTERVAL=2' : '') + (m.end ? ';UNTIL=' + m.end.replace(/-/g, '') + 'T235959' : ''), 'SUMMARY:' + esc('💊 ' + m.name + (m.dose ? ' · ' + m.dose : '')), 'DESCRIPTION:' + esc(m.food || ''),
          'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Time for ' + m.name), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'].join('\r\n'));
      });
    });
    T.download(new Blob(['BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//GroupChatOn//Infinity medicines//EN\r\n' + ev.join('\r\n') + '\r\nEND:VCALENDAR\r\n'], { type: 'text/calendar' }), 'medicine-reminders.ics');
  }
  spot.appendChild(T.card([V.bar(draw), h('div', { 'class': 'tgrid2' }, [T.field('Day', dayIn)]), sum, h('h3', { text: 'Doses' }), today,
    T.row([rem, T.button('📅 Add reminders to phone calendar (.ics)', { small: true, onclick: ics })]),
    h('p', { 'class': 'tnote', text: 'Calendar reminders ring from your phone’s calendar app even when this page is closed. On-screen reminders only work while this page stays open.' }),
    h('h3', { text: 'Add a medicine' }), h('div', { 'class': 'tool-app-opts' }, [h('div', { 'class': 'tgrid2' }, [T.field('Medicine', f.name), T.field('Dose', f.dose), T.field('Times (24-hour)', f.times), T.field('How', f.food), T.field('Start', f.start), T.field('Last day (optional)', f.end), T.field('Repeat', f.alt)]),
      T.row([T.button('Add medicine', { primary: true, onclick: addMed })]), msg.el]),
    h('h3', { text: 'All medicines' }), meds,
    h('p', { 'class': 'tnote', text: 'This is a reminder list only. Always follow your doctor’s prescription and ask your doctor or pharmacist before changing a dose.' })]));
  V.ready.then(draw);

  T.tests['medicine-schedule'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    if (parseTimes('8, 14:30 21.00 25:00').join() !== '08:00,14:30,21:00') fails.push('times ' + parseTimes('8, 14:30 21.00 25:00'));
    V.save({ meds: [{ id: 'a', name: 'Test A', times: ['08:00', '20:00'], start: '2026-10-01', end: '2026-10-03' }, { id: 'b', name: 'Test B', times: ['09:00'], start: '2026-10-01', end: '', alt: true }], taken: {} }); db = V.data();
    if (doses('2026-10-02').length !== 2) fails.push('day 2 doses ' + doses('2026-10-02').length);
    if (doses('2026-10-03').length !== 3) fails.push('day 3 doses ' + doses('2026-10-03').length);
    if (doses('2026-10-04').length !== 0) fails.push('after end ' + doses('2026-10-04').length);
    take('2026-10-01', 'a@08:00', true); take('2026-10-01', 'a@20:00', true); take('2026-10-02', 'a@08:00', true);
    var ad = adherence('2026-10-01', '2026-10-02');
    if (ad.due !== 5 || ad.got !== 3) fails.push('adherence ' + JSON.stringify(ad));
    day = '2026-10-01'; draw(); if (today.textContent.indexOf('Test A') < 0) fails.push('schedule not shown');
    return V.save(keep).then(function () { day = iso(); draw(); return { ok: !fails.length, n: 6, fails: fails }; });
  }
});
