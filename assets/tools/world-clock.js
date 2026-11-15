/* Infinity by GroupChatOn — world-clock. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* World clock: live time in any city, its UTC offset, how far ahead or behind you it is, and a slider to plan calls across time zones. */
GCOTools.register('world-clock', function (spot, T) {
  var h = T.h;
  var CITIES = [['London', 'Europe/London'], ['Dublin', 'Europe/Dublin'], ['Lisbon', 'Europe/Lisbon'], ['Paris', 'Europe/Paris'], ['Berlin', 'Europe/Berlin'], ['Madrid', 'Europe/Madrid'], ['Rome', 'Europe/Rome'],
    ['Amsterdam', 'Europe/Amsterdam'], ['Zurich', 'Europe/Zurich'], ['Stockholm', 'Europe/Stockholm'], ['Athens', 'Europe/Athens'], ['Istanbul', 'Europe/Istanbul'], ['Moscow', 'Europe/Moscow'], ['Kyiv', 'Europe/Kiev'],
    ['Cairo', 'Africa/Cairo'], ['Lagos', 'Africa/Lagos'], ['Nairobi', 'Africa/Nairobi'], ['Johannesburg', 'Africa/Johannesburg'], ['Casablanca', 'Africa/Casablanca'], ['Accra', 'Africa/Accra'],
    ['Dubai', 'Asia/Dubai'], ['Abu Dhabi', 'Asia/Dubai'], ['Doha', 'Asia/Qatar'], ['Riyadh', 'Asia/Riyadh'], ['Kuwait', 'Asia/Kuwait'], ['Muscat', 'Asia/Muscat'], ['Tehran', 'Asia/Tehran'], ['Kabul', 'Asia/Kabul'],
    ['Karachi', 'Asia/Karachi'], ['New Delhi', 'Asia/Kolkata'], ['Mumbai', 'Asia/Kolkata'], ['Colombo', 'Asia/Colombo'], ['Kathmandu', 'Asia/Kathmandu'], ['Dhaka', 'Asia/Dhaka'], ['Yangon', 'Asia/Yangon'],
    ['Bangkok', 'Asia/Bangkok'], ['Jakarta', 'Asia/Jakarta'], ['Singapore', 'Asia/Singapore'], ['Kuala Lumpur', 'Asia/Kuala_Lumpur'], ['Manila', 'Asia/Manila'], ['Hong Kong', 'Asia/Hong_Kong'],
    ['Beijing', 'Asia/Shanghai'], ['Taipei', 'Asia/Taipei'], ['Seoul', 'Asia/Seoul'], ['Tokyo', 'Asia/Tokyo'], ['Perth', 'Australia/Perth'], ['Adelaide', 'Australia/Adelaide'], ['Sydney', 'Australia/Sydney'],
    ['Melbourne', 'Australia/Melbourne'], ['Brisbane', 'Australia/Brisbane'], ['Auckland', 'Pacific/Auckland'], ['Fiji', 'Pacific/Fiji'], ['Honolulu', 'Pacific/Honolulu'], ['Anchorage', 'America/Anchorage'],
    ['Los Angeles', 'America/Los_Angeles'], ['Vancouver', 'America/Vancouver'], ['Phoenix', 'America/Phoenix'], ['Denver', 'America/Denver'], ['Chicago', 'America/Chicago'], ['Mexico City', 'America/Mexico_City'],
    ['Houston', 'America/Chicago'], ['Toronto', 'America/Toronto'], ['New York', 'America/New_York'], ['Bogotá', 'America/Bogota'], ['Lima', 'America/Lima'], ['Santiago', 'America/Santiago'],
    ['Buenos Aires', 'America/Argentina/Buenos_Aires'], ['São Paulo', 'America/Sao_Paulo'], ['Halifax', 'America/Halifax'], ['Reykjavik', 'Atlantic/Reykjavik'], ['UTC (world time)', 'UTC']];
  CITIES = CITIES.filter(function (c) { try { new Intl.DateTimeFormat('en', { timeZone: c[1] }); return true; } catch (e) { return false; } });
  var LOCAL = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  function offset(tz, d) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return Math.round((Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - Math.floor(d.getTime() / 1000) * 1000) / 60000);
  }
  function fmtOff(m) { var s = m < 0 ? '−' : '+'; m = Math.abs(m); return 'UTC' + s + Math.floor(m / 60) + (m % 60 ? ':' + (m % 60 < 10 ? '0' : '') + (m % 60) : ''); }
  function diff(m) { if (!m) return 'Same time as you'; var a = Math.abs(m), t = Math.floor(a / 60) + 'h' + (a % 60 ? ' ' + a % 60 + 'm' : ''); return t + (m > 0 ? ' ahead of you' : ' behind you'); }
  var mine = T.store.get('wc-list', ['London', 'New York', 'Dubai', 'Tokyo', 'Sydney']);
  var pick = T.select(CITIES.map(function (c) { return [c[0], c[0] + ' (' + fmtOff(offset(c[1], new Date())) + ')']; }), 'Singapore');
  var h24 = T.seg([['24', '24-hour'], ['12', '12-hour']], T.store.get('wc-12', '24'), function (v) { T.store.set('wc-12', v); draw(); });
  var shift = h('input', { type: 'range', min: '-720', max: '720', step: '30', value: '0', 'aria-label': 'Shift time' }), shiftLab = h('span', { 'class': 'tnote' });
  shift.addEventListener('input', draw);
  var grid = h('div', { 'class': 'tstats', 'data-out': '', style: 'grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr))' });
  function card(name, tz, d, isLocal) {
    var hr = +new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(d) % 24;
    var time = new Intl.DateTimeFormat(h24.value() === '12' ? 'en-US' : 'en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: +shift.value ? undefined : '2-digit', hour12: h24.value() === '12' }).format(d);
    var day = new Intl.DateTimeFormat(undefined, { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(d);
    var o = offset(tz, d), work = hr >= 9 && hr < 18;
    return h('div', { 'class': 'tstat', style: isLocal ? 'border-color:var(--accent)' : '' }, [
      h('span', { style: 'display:flex;justify-content:space-between;gap:8px' }, [h('span', { text: (hr >= 6 && hr < 18 ? '☀️ ' : '🌙 ') + name }), isLocal ? null : h('button', { type: 'button', 'class': 'tbtn tbtn-sm', style: 'min-height:28px;padding:0 10px', 'aria-label': 'Remove ' + name, text: '✕', onclick: function () { mine = mine.filter(function (x) { return x !== name; }); T.store.set('wc-list', mine); draw(); } })]),
      h('b', { text: time, style: 'font-size:30px' }), h('span', { text: day + ' · ' + fmtOff(o) }),
      h('span', { text: isLocal ? 'Your time zone (' + tz.replace(/_/g, ' ') + ')' : diff(o - offset(LOCAL, d)) + (work ? ' · working hours' : '') })]);
  }
  function draw() {
    var d = new Date(Date.now() + shift.value * 60000);
    shiftLab.textContent = +shift.value ? 'Showing ' + Math.abs(shift.value / 60) + ' hours ' + (shift.value > 0 ? 'from now' : 'ago') + '. Slide back to 0 for the live time.' : 'Live time. Slide to see what time it will be everywhere later.';
    grid.innerHTML = ''; grid.appendChild(card('Your time', LOCAL, d, true));
    mine.forEach(function (n) { var c = CITIES.filter(function (x) { return x[0] === n; })[0]; if (c) grid.appendChild(card(c[0], c[1], d)); });
  }
  spot.appendChild(T.card([T.row([T.field('Add a city', pick), T.button('Add', { primary: true, onclick: function () { if (mine.indexOf(pick.value) < 0) mine.push(pick.value); T.store.set('wc-list', mine); draw(); } })]),
    h24, grid, T.field('Plan a call: move the time', shift), shiftLab]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw(); setInterval(function () { if (!+shift.value) draw(); }, 1000);
  T.tests['world-clock'] = function () {
    var f = [], jan = new Date(Date.UTC(2026, 0, 15, 12)), jul = new Date(Date.UTC(2026, 6, 15, 12));
    if (offset('Asia/Kolkata', jan) !== 330) f.push('India ' + offset('Asia/Kolkata', jan));
    if (offset('America/New_York', jan) !== -300 || offset('America/New_York', jul) !== -240) f.push('New York DST');
    if (offset('Asia/Kathmandu', jan) !== 345) f.push('Nepal');
    if (offset('Australia/Sydney', jan) !== 660) f.push('Sydney summer');
    if (fmtOff(330) !== 'UTC+5:30' || fmtOff(-300) !== 'UTC−5') f.push('format');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
