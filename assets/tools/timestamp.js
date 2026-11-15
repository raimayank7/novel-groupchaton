/* Unix Timestamp Converter — seconds or milliseconds ↔ date and time, in your time zone, UTC and India time; live clock.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('timestamp', function (spot, T) {
  var h = T.h;
  var now = h('b', { 'class': 'tbig tmono' });
  var copyNow = T.button('Copy', { small: true, onclick: function () { T.copy(String(Math.floor(Date.now() / 1000)), copyNow); } });
  var ts = h('input', { type: 'text', 'class': 'tmono', inputmode: 'numeric', placeholder: 'e.g. 1767225600', 'aria-label': 'Timestamp' });
  var out1 = h('div', { 'class': 'tkv' });
  var dt = h('input', { type: 'datetime-local', step: '1', 'aria-label': 'Date and time' });
  var zone = T.select([['local', 'My time zone'], ['UTC', 'UTC'], ['Asia/Kolkata', 'India (IST)']], 'local');
  var out2 = h('div', { 'class': 'tkv' });
  spot.appendChild(T.card([h('div', { 'class': 'trow' }, [h('span', { text: 'Now: ' }), now, copyNow]),
    h('h3', { text: 'Timestamp → date' }), T.field('Unix timestamp (seconds or milliseconds)', ts), out1,
    h('h3', { text: 'Date → timestamp' }), h('div', { 'class': 'tgrid2' }, [T.field('Date and time', dt), T.field('That time is in', zone)]), out2]));
  function kv(box, rows) {
    box.innerHTML = '';
    rows.forEach(function (r) {
      var b = T.button('Copy', { small: true, onclick: function () { T.copy(r[1], b); } });
      box.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] }), b]));
    });
  }
  function fmt(d, tz) { return d.toLocaleString(undefined, { timeZone: tz, dateStyle: 'full', timeStyle: 'long' }); }
  function one() {
    var v = ts.value.trim();
    if (!/^-?\d+(\.\d+)?$/.test(v)) { out1.innerHTML = v ? '<p class="tstatus is-error">Type digits only, like 1767225600.</p>' : ''; return; }
    var n = +v, ms = Math.abs(n) >= 1e11 ? n : n * 1000, d = new Date(ms);
    if (isNaN(d)) { out1.innerHTML = '<p class="tstatus is-error">That number is out of range.</p>'; return; }
    var diff = (ms - Date.now()) / 1000, rel;
    try { var rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }), a = Math.abs(diff);
      rel = a < 60 ? rtf.format(Math.round(diff), 'second') : a < 3600 ? rtf.format(Math.round(diff / 60), 'minute') : a < 86400 ? rtf.format(Math.round(diff / 3600), 'hour') : a < 2629800 ? rtf.format(Math.round(diff / 86400), 'day') : a < 31557600 ? rtf.format(Math.round(diff / 2629800), 'month') : rtf.format(Math.round(diff / 31557600), 'year'); } catch (e) { rel = ''; }
    kv(out1, [['Read as', Math.abs(n) >= 1e11 ? 'milliseconds' : 'seconds'], ['Your time', fmt(d)], ['UTC', fmt(d, 'UTC')], ['India (IST)', fmt(d, 'Asia/Kolkata')], ['ISO 8601', d.toISOString()], ['Relative', rel]]);
  }
  function two() {
    if (!dt.value) { out2.innerHTML = ''; return; }
    var p = dt.value.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+)(?::(\d+))?/), utc = Date.UTC(+p[1], p[2] - 1, +p[3], +p[4], +p[5], +(p[6] || 0)), ms;
    if (zone.value === 'local') ms = new Date(+p[1], p[2] - 1, +p[3], +p[4], +p[5], +(p[6] || 0)).getTime();
    else if (zone.value === 'UTC') ms = utc;
    else ms = utc - 330 * 60000;   // IST is UTC+5:30 all year (no daylight saving)
    kv(out2, [['Seconds', String(Math.floor(ms / 1000))], ['Milliseconds', String(ms)], ['ISO 8601 (UTC)', new Date(ms).toISOString()]]);
  }
  ts.addEventListener('input', one); dt.addEventListener('input', two); zone.addEventListener('change', two);
  function tick() { now.textContent = Math.floor(Date.now() / 1000); }
  tick(); setInterval(tick, 1000);
  ts.value = String(Math.floor(Date.now() / 1000)); one();
  var d0 = new Date(); d0.setSeconds(0, 0);
  dt.value = new Date(d0.getTime() - d0.getTimezoneOffset() * 60000).toISOString().slice(0, 19); two();
});
