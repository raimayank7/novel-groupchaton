/* Infinity by GroupChatOn — calendar-reminder. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Calendar reminder maker: one form makes an "Add to Google Calendar" link, an .ics file for Apple Calendar, iPhone and Outlook,
   and an Outlook.com link, with repeats, alerts and time zones. Nothing is sent anywhere until you press a button. */
GCOTools.register('calendar-reminder', function (spot, T) {
  var h = T.h, status = T.status();
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var HERE = (window.Intl && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  // how far a time zone is ahead of UTC (ms) at a moment
  function offsetMs(tz, ms) {
    var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
  }
  // a wall-clock date and time in a time zone → the real moment (ms since 1970, UTC)
  function zonedToUtc(date, time, tz) {
    var d = date.split('-').map(Number), t = time.split(':').map(Number), guess = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1]);
    var u = guess - offsetMs(tz, guess); return guess - offsetMs(tz, u);
  }
  function utcStamp(ms) { var d = new Date(ms); return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; }
  function localStamp(date, time) { return date.replace(/-/g, '') + (time ? 'T' + time.replace(':', '') + '00' : ''); }
  function nextDay(date) { var d = date.split('-').map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2] + 1)); return x.toISOString().slice(0, 10); }
  function addMin(date, time, mins) { var d = date.split('-').map(Number), t = time.split(':').map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1] + mins)); return [x.toISOString().slice(0, 10), pad(x.getUTCHours()) + ':' + pad(x.getUTCMinutes())]; }
  function rrule(e) {
    if (!e.repeat) return '';
    var r = e.repeat === 'weekdays' ? 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' : 'FREQ=' + e.repeat.toUpperCase();
    if (e.every > 1 && e.repeat !== 'weekdays') r += ';INTERVAL=' + e.every;
    if (e.ends === 'count' && e.count > 0) r += ';COUNT=' + e.count;
    if (e.ends === 'until' && e.until) r += ';UNTIL=' + e.until.replace(/-/g, '') + 'T235959Z';
    return r;
  }
  // end of the event: all-day events end the next day (calendar rule); timed events add the duration
  function span(e) {
    if (e.allDay) return { s: localStamp(e.date), e: localStamp(nextDay(e.date)) };
    var end = addMin(e.date, e.time, e.mins);
    return { s: localStamp(e.date, e.time), e: localStamp(end[0], end[1]), us: zonedToUtc(e.date, e.time, e.tz), ue: zonedToUtc(end[0], end[1], e.tz) };
  }
  function google(e) {
    var p = span(e), q = ['action=TEMPLATE', 'text=' + encodeURIComponent(e.title), 'dates=' + p.s + '/' + p.e];
    if (!e.allDay) q.push('ctz=' + encodeURIComponent(e.tz));
    if (e.notes) q.push('details=' + encodeURIComponent(e.notes));
    if (e.place) q.push('location=' + encodeURIComponent(e.place));
    if (rrule(e)) q.push('recur=' + encodeURIComponent('RRULE:' + rrule(e)));
    return 'https://calendar.google.com/calendar/render?' + q.join('&');
  }
  function iso(ms, tz) { var o = offsetMs(tz, ms), d = new Date(ms + o), a = Math.abs(o) / 60000; return d.toISOString().slice(0, 19) + (o < 0 ? '-' : '+') + pad(Math.floor(a / 60)) + ':' + pad(a % 60); }
  function outlook(e) {
    var p = span(e), q = ['path=%2Fcalendar%2Faction%2Fcompose', 'rru=addevent', 'subject=' + encodeURIComponent(e.title)];
    if (e.allDay) q.push('startdt=' + e.date, 'enddt=' + nextDay(e.date), 'allday=true');
    else q.push('startdt=' + encodeURIComponent(iso(p.us, e.tz)), 'enddt=' + encodeURIComponent(iso(p.ue, e.tz)));
    if (e.notes) q.push('body=' + encodeURIComponent(e.notes));
    if (e.place) q.push('location=' + encodeURIComponent(e.place));
    return 'https://outlook.live.com/calendar/0/deeplink/compose?' + q.join('&');
  }
  function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  // iCalendar lines may be at most 75 bytes; longer ones continue on the next line after a space
  function fold(line) {
    var out = [], cur = '', n = 0;
    Array.from(line).forEach(function (ch) { var b = new TextEncoder().encode(ch).length; if (n + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; n = 0; } cur += ch; n += b; });
    out.push(cur); return out.join('\r\n ');
  }
  function ics(e) {
    var p = span(e), now = utcStamp(Date.now()), uid = Array.from(crypto.getRandomValues(new Uint8Array(8)), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('') + '@infinity.groupchaton.com';
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Infinity by GroupChatOn//Calendar Reminder//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', 'UID:' + uid, 'DTSTAMP:' + now];
    if (e.allDay) L.push('DTSTART;VALUE=DATE:' + p.s, 'DTEND;VALUE=DATE:' + p.e);
    else if (rrule(e)) L.push('DTSTART;TZID=' + e.tz + ':' + p.s, 'DTEND;TZID=' + e.tz + ':' + p.e);   // repeats keep the same clock time through daylight-saving changes
    else L.push('DTSTART:' + utcStamp(p.us), 'DTEND:' + utcStamp(p.ue));
    if (rrule(e)) L.push('RRULE:' + rrule(e));
    L.push('SUMMARY:' + esc(e.title));
    if (e.notes) L.push('DESCRIPTION:' + esc(e.notes));
    if (e.place) L.push('LOCATION:' + esc(e.place));
    e.alerts.forEach(function (a) { L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(e.title), 'TRIGGER:' + a, 'END:VALARM'); });
    L.push('END:VEVENT', 'END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }
  var TIMED_ALERTS = [['', 'No alert'], ['PT0M', 'At the time'], ['-PT5M', '5 minutes before'], ['-PT10M', '10 minutes before'], ['-PT15M', '15 minutes before'], ['-PT30M', '30 minutes before'], ['-PT1H', '1 hour before'], ['-PT2H', '2 hours before'], ['-P1D', '1 day before'], ['-P7D', '1 week before']];
  var DAY_ALERTS = [['', 'No alert'], ['PT9H', 'On the day at 9 AM'], ['-PT15H', 'The day before at 9 AM'], ['-P2DT15H', '2 days before at 9 AM'], ['-P6DT15H', '1 week before at 9 AM']];
  var today = new Date(), tom = new Date(today.getTime() + 864e5);
  var title = h('input', { type: 'text', placeholder: 'e.g. Pay electricity bill', 'aria-label': 'What to remind you about', maxlength: '200' });
  var date = h('input', { type: 'date', value: tom.getFullYear() + '-' + pad(tom.getMonth() + 1) + '-' + pad(tom.getDate()), 'aria-label': 'Date' }), time = h('input', { type: 'time', value: '09:00', 'aria-label': 'Time' });
  var allDay = h('input', { type: 'checkbox' }), dur = T.select([[15, '15 minutes'], [30, '30 minutes'], [60, '1 hour'], [90, '1½ hours'], [120, '2 hours'], [180, '3 hours'], [480, '8 hours']], 30);
  var zones = (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC', 'Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney']).slice();
  if (zones.indexOf(HERE) < 0) zones.unshift(HERE);
  var tz = T.select(zones.map(function (z) { return [z, z.replace(/_/g, ' ') + (z === HERE ? ' (this device)' : '')]; }), HERE);
  var repeat = T.select([['', 'Does not repeat'], ['daily', 'Every day'], ['weekdays', 'Every weekday (Mon–Fri)'], ['weekly', 'Every week'], ['monthly', 'Every month'], ['yearly', 'Every year']], '');
  var every = h('input', { type: 'number', min: '1', max: '99', value: '1', 'aria-label': 'Repeat every' }), ends = T.select([['never', 'Never ends'], ['count', 'After a number of times'], ['until', 'On a date']], 'never');
  var count = h('input', { type: 'number', min: '1', max: '999', value: '10', 'aria-label': 'Times' }), until = h('input', { type: 'date', 'aria-label': 'End date' });
  var a1 = T.select(TIMED_ALERTS, '-PT15M'), a2 = T.select(TIMED_ALERTS, '');
  var place = h('input', { type: 'text', placeholder: 'Optional: address or meeting link', 'aria-label': 'Location' }), notes = h('textarea', { rows: '3', placeholder: 'Optional notes', 'aria-label': 'Notes' });
  var sum = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'padding:12px 14px;border-radius:14px;background:var(--accent-soft);font-weight:600;overflow-wrap:anywhere' });
  var gBtn = h('a', { 'class': 'tbtn tbtn-primary', target: '_blank', rel: 'noopener', href: '#' }, ['📅 Add to Google Calendar']);
  var oBtn = h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', href: '#' }, ['Outlook.com']);
  var timeRow = h('div', { 'class': 'tgrid2' }, [T.field('Time', time), T.field('Length', dur)]), tzField = T.field('Time zone', tz);
  var repRow = h('div', { 'class': 'tgrid2' }, [T.field('Every (1 = each time)', every), T.field('Ends', ends), T.field('Number of times', count), T.field('Last date', until)]);
  function ev() {
    var A = allDay.checked;
    return { title: title.value.trim() || 'Reminder', date: date.value, time: time.value || '09:00', allDay: A, mins: +dur.value, tz: tz.value, repeat: repeat.value, every: Math.max(1, Math.round(+every.value) || 1),
      ends: ends.value, count: Math.round(+count.value) || 0, until: until.value, place: place.value.trim(), notes: notes.value.trim(), alerts: [a1.value, a2.value].filter(function (x, i, l) { return x && l.indexOf(x) === i; }) };
  }
  function describe(e) {
    var d = e.date.split('-').map(Number), when = new Date(Date.UTC(d[0], d[1] - 1, d[2])).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    var s = '🔔 ' + e.title + ' · ' + when + (e.allDay ? ' · all day' : ' · ' + e.time + '–' + addMin(e.date, e.time, e.mins)[1] + (e.tz !== HERE ? ' (' + e.tz.replace(/_/g, ' ') + ')' : ''));
    var R = { daily: 'every day', weekdays: 'every weekday', weekly: 'every week', monthly: 'every month', yearly: 'every year' };
    if (e.repeat) s += ' · repeats ' + (e.every > 1 && e.repeat !== 'weekdays' ? 'every ' + e.every + ' ' + { daily: 'days', weekly: 'weeks', monthly: 'months', yearly: 'years' }[e.repeat] : R[e.repeat]) + (e.ends === 'count' ? ', ' + e.count + ' times' : e.ends === 'until' && e.until ? ', until ' + e.until : '');
    var lab = (e.allDay ? DAY_ALERTS : TIMED_ALERTS).reduce(function (m, x) { m[x[0]] = x[1]; return m; }, {});
    s += e.alerts.length ? ' · alert: ' + e.alerts.map(function (a) { return (lab[a] || '').toLowerCase(); }).join(' and ') : ' · no alert';
    return s;
  }
  function setAlerts() {
    var list = allDay.checked ? DAY_ALERTS : TIMED_ALERTS;
    [a1, a2].forEach(function (s, i) { var v = s.value; s.innerHTML = ''; list.forEach(function (o) { s.appendChild(h('option', { value: o[0], text: o[1] })); }); s.value = list.some(function (o) { return o[0] === v; }) ? v : (i ? '' : list[allDay.checked ? 2 : 4][0]); });
  }
  function update() {
    if (!date.value) { status.error('Choose a date.'); return; }
    status.clear();
    timeRow.hidden = allDay.checked; tzField.hidden = allDay.checked;
    repRow.hidden = !repeat.value; repRow.children[0].hidden = repeat.value === 'weekdays'; repRow.children[2].hidden = ends.value !== 'count'; repRow.children[3].hidden = ends.value !== 'until';
    var e = ev(); sum.textContent = describe(e); gBtn.href = google(e); oBtn.href = outlook(e);
  }
  allDay.addEventListener('change', function () { setAlerts(); update(); });
  [title, date, time, dur, tz, repeat, every, ends, count, until, a1, a2, place, notes].forEach(function (x) { x.addEventListener('input', update); x.addEventListener('change', update); });
  var PRESETS = [['🎂 Birthday', { title: 'Birthday', allDay: true, repeat: 'yearly', a1: '-PT15H' }], ['💡 Bill due', { title: 'Pay the bill', allDay: true, repeat: 'monthly', a1: '-P2DT15H' }],
    ['💊 Medicine', { title: 'Take medicine', time: '09:00', dur: 15, repeat: 'daily', a1: 'PT0M' }], ['👥 Meeting', { title: 'Meeting', time: '11:00', dur: 60, repeat: '', a1: '-PT10M' }]];
  function preset(p) { title.value = p.title; allDay.checked = !!p.allDay; setAlerts(); if (p.time) time.value = p.time; if (p.dur) dur.value = p.dur; repeat.value = p.repeat; every.value = 1; ends.value = 'never'; a1.value = p.a1; a2.value = ''; update(); title.focus(); }
  // phones do not let websites set alarms or tasks, but both assistants take one spoken (or typed) sentence
  function phrase(e, kind, os, todayKey) {
    var t = e.allDay ? '9 AM' : (function () { var p = e.time.split(':').map(Number), hh = p[0] % 12 || 12; return hh + (p[1] ? ':' + pad(p[1]) : '') + (p[0] < 12 ? ' AM' : ' PM'); })();
    var d = e.date.split('-').map(Number), dt = new Date(Date.UTC(d[0], d[1] - 1, d[2])), wd = dt.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
    var day = e.date === todayKey ? 'today' : e.date === nextDay(todayKey) ? 'tomorrow' : 'on ' + wd + ' ' + dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    var rep = { daily: 'every day', weekdays: 'every weekday', weekly: 'every ' + wd, monthly: 'every month', yearly: 'every year' }[e.repeat] || '';
    var hey = os === 'ios' ? 'Hey Siri, ' : 'Hey Google, ';
    if (kind === 'alarm') return hey + 'set an alarm for ' + t + ' ' + (rep && e.repeat !== 'monthly' && e.repeat !== 'yearly' ? rep : day) + (os === 'ios' ? ' labelled ' : ' called ') + e.title;
    return hey + 'remind me to ' + e.title.replace(/^./, function (c) { return c.toLowerCase(); }) + ' ' + day + ' at ' + t + (rep ? ' ' + rep : '');
  }
  var kind = 'task', os = /iPhone|iPad|Mac/.test(navigator.userAgent) ? 'ios' : 'android', say = h('textarea', { rows: '2', 'class': 'tout', readonly: true, 'aria-label': 'Say or type this to your phone', style: 'min-height:64px' });
  var sayNote = h('p', { 'class': 'tnote' });
  function todayKey() { var n = new Date(); return n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate()); }
  function drawSay() {
    var e = ev(); say.value = phrase(e, kind, os, todayKey());
    sayNote.textContent = kind === 'alarm'
      ? (os === 'ios' ? 'Say it to Siri, or open the Clock app → Alarm → +. ' : 'Say it to Google Assistant or Gemini, or open the Clock app → Alarm → +. ') + 'Phone alarms are for the next 24 hours or for repeating days; for a date further ahead, use a task or the calendar buttons above.'
      : os === 'ios' ? 'Siri adds it to the Apple Reminders app and alerts you at that time. You can also type it: long-press the side button, or open Reminders and tap New Reminder.'
        : 'Google Assistant or Gemini saves it as a reminder in Google Tasks and alerts you at that time. You can also open the Google Tasks app and tap + to add it by hand.';
  }
  var sayCp = T.button('Copy', { small: true, onclick: function () { drawSay(); T.copy(say.value.replace(/^Hey (Siri|Google), /, ''), sayCp); } });
  var phone = h('details', {}, [h('summary', { text: '📱 Phone alarm or task (Android and iPhone)' }),
    h('div', { style: 'display:grid;gap:10px;margin-top:10px' }, [
      h('div', { 'class': 'trow' }, [T.seg([['task', 'Task / reminder'], ['alarm', 'Alarm']], kind, function (v) { kind = v; drawSay(); }), T.seg([['android', 'Android'], ['ios', 'iPhone']], os, function (v) { os = v; drawSay(); })]),
      T.field('Say this to your phone (or type it)', say), T.row([sayCp]), sayNote,
      h('p', { 'class': 'tnote' }, ['Prefer to do it here? Use our ', h('a', { href: '/search?q=Online%20alarm%20clock', 'data-tool-link': 'alarm', text: 'Online Alarm Clock' }), ' or ', h('a', { href: '/search?q=To-do%20list', 'data-tool-link': 'todo', text: 'To-do List' }), ' (they work while the page is open).'])])]);
  [title, date, time, allDay, repeat].forEach(function (x) { x.addEventListener('input', drawSay); x.addEventListener('change', drawSay); });
  var cp = T.button('Copy Google link', { small: true, onclick: function () { update(); T.copy(gBtn.href, cp); } });
  spot.appendChild(T.card([T.row(PRESETS.map(function (p) { return T.button(p[0], { small: true, onclick: function () { preset(p[1]); } }); })),
    T.field('Remind me about', title), h('div', { 'class': 'tgrid2' }, [T.field('Date', date), h('label', { 'class': 'tcheck', style: 'align-self:end;min-height:44px' }, [allDay, ' All day'])]),
    timeRow, tzField, T.field('Repeat', repeat), repRow, h('div', { 'class': 'tgrid2' }, [T.field('Alert', a1), T.field('Second alert', a2)]),
    h('details', {}, [h('summary', { text: 'Place and notes (optional)' }), T.field('Location', place), T.field('Notes', notes)]),
    sum, status.el,
    T.row([gBtn, T.button('🍎 Apple Calendar / iPhone (.ics)', { primary: true, onclick: function () { update(); var e = ev(); T.download(new Blob([ics(e)], { type: 'text/calendar;charset=utf-8' }), (e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'reminder') + '.ics'); status.ok('Calendar file saved. Open it to add the reminder (on iPhone, tap “Add” or “Add All”).'); } })]),
    T.row([oBtn, cp, T.button('Share on WhatsApp', { small: true, onclick: function () { update(); window.open('https://wa.me/?text=' + encodeURIComponent(describe(ev()).replace(/^🔔 /, '') + '\nAdd it to your Google Calendar: ' + gBtn.href), '_blank', 'noopener'); } }),
      T.button('Try a sample', { small: true, onclick: function () { preset(PRESETS[1][1]); title.value = 'Pay electricity bill'; update(); drawSay(); } })]),
    phone,
    h('p', { 'class': 'tnote', text: 'Nothing is sent anywhere until you press a button: the Google and Outlook buttons open their own websites with your reminder filled in, and the .ics file is made on your device. Google’s link uses your usual Google Calendar alert; the .ics file carries the alerts you chose.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  setAlerts(); update(); drawSay();
  T.tests['calendar-reminder'] = function () {
    var f = [], pe = { title: 'Pay bill', date: '2026-11-06', time: '18:30', allDay: false, repeat: '' };
    if (phrase(pe, 'task', 'android', '2026-11-01') !== 'Hey Google, remind me to pay bill on Friday 6 November at 6:30 PM') f.push('task ' + phrase(pe, 'task', 'android', '2026-11-01'));
    if (phrase(pe, 'alarm', 'ios', '2026-11-05') !== 'Hey Siri, set an alarm for 6:30 PM tomorrow labelled Pay bill') f.push('alarm ' + phrase(pe, 'alarm', 'ios', '2026-11-05'));
    pe.repeat = 'weekdays'; pe.time = '06:00';
    if (phrase(pe, 'alarm', 'android', '2026-11-01') !== 'Hey Google, set an alarm for 6 AM every weekday called Pay bill') f.push('repeat alarm');
    if (utcStamp(zonedToUtc('2026-11-05', '09:00', 'Asia/Kolkata')) !== '20261105T033000Z') f.push('india ' + utcStamp(zonedToUtc('2026-11-05', '09:00', 'Asia/Kolkata')));
    if (utcStamp(zonedToUtc('2026-07-01', '09:00', 'America/New_York')) !== '20260701T130000Z') f.push('new york summer');
    if (utcStamp(zonedToUtc('2026-01-15', '09:00', 'America/New_York')) !== '20260115T140000Z') f.push('new york winter');
    if (iso(zonedToUtc('2026-11-05', '09:00', 'Asia/Kolkata'), 'Asia/Kolkata') !== '2026-11-05T09:00:00+05:30') f.push('iso');
    var e = { title: 'Pay bill, now', date: '2026-11-30', time: '23:30', allDay: false, mins: 60, tz: 'Asia/Kolkata', repeat: 'weekdays', every: 1, ends: 'count', count: 10, until: '', place: '', notes: 'Line 1\nLine 2', alerts: ['-PT15M'] };
    if (rrule(e) !== 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=10') f.push('rrule ' + rrule(e));
    var g = google(e);
    if (g.indexOf('dates=20261130T233000/20261201T003000') < 0 || g.indexOf('ctz=Asia%2FKolkata') < 0 || g.indexOf('recur=RRULE%3AFREQ%3DWEEKLY') < 0) f.push('google ' + g);
    var c = ics(e);
    if (c.indexOf('DTSTART;TZID=Asia/Kolkata:20261130T233000') < 0 || c.indexOf('TRIGGER:-PT15M') < 0 || c.indexOf('SUMMARY:Pay bill\\, now') < 0 || c.indexOf('DESCRIPTION:Line 1\\nLine 2') < 0) f.push('ics');
    var d = { title: 'Birthday', date: '2026-12-31', allDay: true, repeat: 'yearly', every: 1, ends: 'never', notes: '', place: '', alerts: ['-PT15H'], tz: 'UTC', mins: 0 }, ci = ics(d);
    if (ci.indexOf('DTSTART;VALUE=DATE:20261231') < 0 || ci.indexOf('DTEND;VALUE=DATE:20270101') < 0 || google(d).indexOf('dates=20261231/20270101') < 0) f.push('all day');
    var one = ics({ title: 'x', date: '2026-11-05', time: '09:00', allDay: false, mins: 30, tz: 'Asia/Kolkata', repeat: '', alerts: [], notes: '', place: '' });
    if (one.indexOf('DTSTART:20261105T033000Z') < 0 || one.indexOf('DTEND:20261105T040000Z') < 0) f.push('single utc');
    if (fold('SUMMARY:' + new Array(100).join('é')).split('\r\n').some(function (l) { return new TextEncoder().encode(l).length > 75; })) f.push('fold');
    if (outlook(e).indexOf('startdt=2026-11-30T23%3A30%3A00%2B05%3A30') < 0) f.push('outlook ' + outlook(e));
    return Promise.resolve({ ok: !f.length, n: 14, fails: f });
  };
});
