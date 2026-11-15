/* Infinity by GroupChatOn — time-zone. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Time Zone Converter and world clock: any time in one zone, shown in every zone on your list (DST handled by the browser's time-zone data).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('time-zone', function (spot, T) {
  var h = T.h;
  var here = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  var ALL = (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC', 'Asia/Kolkata', 'Europe/London', 'America/New_York', 'Asia/Dubai', 'Asia/Singapore', 'Australia/Sydney', 'America/Los_Angeles', 'Asia/Tokyo']).slice();
  // browsers list some zones by their old names (Asia/Calcutta); show today's names, which work the same
  var MODERN = { 'Asia/Calcutta': 'Asia/Kolkata', 'Asia/Saigon': 'Asia/Ho_Chi_Minh', 'Asia/Katmandu': 'Asia/Kathmandu', 'Europe/Kiev': 'Europe/Kyiv', 'Asia/Rangoon': 'Asia/Yangon', 'America/Godthab': 'America/Nuuk' };
  ALL = ALL.map(function (z) { return MODERN[z] || z; });
  here = MODERN[here] || here;
  if (ALL.indexOf('UTC') < 0) ALL.unshift('UTC');
  if (ALL.indexOf(here) < 0) ALL.push(here);
  var saved = T.store.get('tz-list', null);
  var list = Array.isArray(saved) && saved.length ? saved : [here, 'UTC', 'Asia/Kolkata', 'Europe/London', 'America/New_York', 'Asia/Dubai', 'Asia/Singapore', 'Australia/Sydney', 'America/Los_Angeles'];
  list = list.filter(function (z, i) { return list.indexOf(z) === i && (ALL.indexOf(z) >= 0 || z === here); });
  function city(z) { return z === 'UTC' ? 'UTC' : z.split('/').pop().replace(/_/g, ' '); }
  function opts(sel) { return ALL.map(function (z) { return [z, z.replace(/_/g, ' ')]; }); }
  // the zone's offset from UTC (minutes) at an instant
  function offset(zone, ms) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
      .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = +x.value; });
    return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second) - ms) / 60000);
  }
  // wall-clock time in a zone → the instant
  function instant(str, zone) {
    var m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return NaN;
    var guess = Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]);
    var t = guess - offset(zone, guess) * 60000;
    return guess - offset(zone, t) * 60000;
  }
  function off(min) { var s = min < 0 ? '−' : '+', a = Math.abs(min); return 'UTC' + s + Math.floor(a / 60) + (a % 60 ? ':' + ('0' + a % 60).slice(-2) : ''); }
  function localInput(ms, zone) {
    var d = new Date(ms + offset(zone, ms) * 60000);
    return d.toISOString().slice(0, 16);
  }
  var when = h('input', { type: 'datetime-local', 'aria-label': 'Date and time' });
  var from = T.select(opts(), here);
  var live = h('input', { type: 'checkbox', checked: true });
  var add = T.select([['', 'Add a city or time zone…']].concat(opts()), '');
  var out = h('div', { 'class': 'ttz' }), last = {};
  function draw() {
    var ms = live.checked ? Date.now() : instant(when.value, from.value);
    if (live.checked) when.value = localInput(ms, from.value);
    out.innerHTML = ''; last = {};
    if (isNaN(ms)) { out.appendChild(h('p', { 'class': 'tstatus', text: 'Pick a date and time.' })); return; }
    var base = offset(from.value, ms);
    list.forEach(function (z, i) {
      var o = offset(z, ms), t = new Date(ms);
      var time = t.toLocaleTimeString('en-GB', { timeZone: z, hour: '2-digit', minute: '2-digit' }), day = t.toLocaleDateString('en-GB', { timeZone: z, weekday: 'short', day: 'numeric', month: 'short' });
      var hr = +t.toLocaleString('en-GB', { timeZone: z, hour: '2-digit', hourCycle: 'h23' });
      last[z] = time + ' ' + day;
      var diff = (o - base) / 60;
      out.appendChild(h('div', { 'class': 'ttz-row' + (z === from.value ? ' is-from' : '') + (hr >= 9 && hr < 18 ? ' is-work' : hr >= 22 || hr < 6 ? ' is-night' : '') }, [
        h('span', { 'class': 'ttz-city' }, [h('b', { text: city(z) }), h('small', { text: z.replace(/_/g, ' ') + ' · ' + off(o) })]),
        h('span', { 'class': 'ttz-time' }, [h('b', { text: time }), h('small', { text: day + (z === from.value ? '' : ' · ' + (diff === 0 ? 'same time' : (diff > 0 ? '+' : '−') + Math.abs(diff) + ' h')) })]),
        h('button', { type: 'button', 'class': 'tx-x', 'aria-label': 'Remove ' + city(z), text: '✕', onclick: function () { list.splice(i, 1); save(); draw(); } })]));
    });
  }
  function save() { T.store.set('tz-list', list); }
  when.addEventListener('input', function () { live.checked = false; draw(); });
  from.addEventListener('change', function () { if (!live.checked) { /* keep the typed wall time, now read in the new zone */ } draw(); });
  live.addEventListener('change', draw);
  add.addEventListener('change', function () { if (add.value && list.indexOf(add.value) < 0) { list.push(add.value); save(); } add.value = ''; draw(); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Date and time', when), T.field('In time zone', from)]),
    h('label', { 'class': 'tcheck' }, [live, ' Live: show the time now']), out, T.field('Add a place', add),
    h('p', { 'class': 'tnote', text: 'Green rows are office hours (9 am–6 pm), dim rows are night. Daylight saving changes are handled automatically. Your list is saved on this device.' })]));
  draw();
  var tick = setInterval(function () { if (!spot.isConnected) return clearInterval(tick); if (live.checked) draw(); }, 15000);

  T.tests['time-zone'] = function () {
    var fails = [], keep = list.slice(), kf = from.value;
    list = ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
    live.checked = false; from.value = 'Asia/Kolkata'; when.value = '2026-07-01T12:00'; draw();
    [['America/New_York', '02:30'], ['Europe/London', '07:30'], ['Asia/Tokyo', '15:30'], ['Australia/Sydney', '16:30']].forEach(function (c) { if ((last[c[0]] || '').indexOf(c[1]) !== 0) fails.push(c[0] + ' summer: ' + last[c[0]]); });
    when.value = '2026-12-01T12:00'; draw();
    [['America/New_York', '01:30'], ['Europe/London', '06:30'], ['Australia/Sydney', '17:30']].forEach(function (c) { if ((last[c[0]] || '').indexOf(c[1]) !== 0) fails.push(c[0] + ' winter: ' + last[c[0]]); });
    from.value = 'America/New_York'; when.value = '2026-03-08T12:00'; draw();   // the day the US clocks go forward
    if ((last['Asia/Kolkata'] || '').indexOf('21:30') !== 0) fails.push('DST day: ' + last['Asia/Kolkata']);
    list = keep; from.value = kf; live.checked = true; save(); draw();
    return Promise.resolve({ ok: !fails.length, n: 8, fails: fails });
  };
});
