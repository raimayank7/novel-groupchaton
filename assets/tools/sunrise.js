/* Infinity by GroupChatOn — sunrise. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Sunrise, sunset, twilight, golden hour and Islamic prayer times, computed on this device from latitude and longitude (NOAA solar formulas). */
GCOTools.register('sunrise', function (spot, T) {
  var h = T.h, status = T.status(), R = Math.PI / 180;
  var CITIES = [['Makkah', 21.4225, 39.8262, 'Asia/Riyadh'], ['Madinah', 24.4686, 39.6142, 'Asia/Riyadh'], ['Riyadh', 24.7136, 46.6753, 'Asia/Riyadh'], ['Dubai', 25.2048, 55.2708, 'Asia/Dubai'], ['Abu Dhabi', 24.4539, 54.3773, 'Asia/Dubai'],
    ['Doha', 25.2854, 51.531, 'Asia/Qatar'], ['Kuwait City', 29.3759, 47.9774, 'Asia/Kuwait'], ['Muscat', 23.588, 58.3829, 'Asia/Muscat'], ['Cairo', 30.0444, 31.2357, 'Africa/Cairo'], ['Istanbul', 41.0082, 28.9784, 'Europe/Istanbul'],
    ['Tehran', 35.6892, 51.389, 'Asia/Tehran'], ['Karachi', 24.8607, 67.0011, 'Asia/Karachi'], ['Lahore', 31.5204, 74.3587, 'Asia/Karachi'], ['Islamabad', 33.6844, 73.0479, 'Asia/Karachi'], ['New Delhi', 28.6139, 77.209, 'Asia/Kolkata'],
    ['Mumbai', 19.076, 72.8777, 'Asia/Kolkata'], ['Kolkata', 22.5726, 88.3639, 'Asia/Kolkata'], ['Chennai', 13.0827, 80.2707, 'Asia/Kolkata'], ['Bengaluru', 12.9716, 77.5946, 'Asia/Kolkata'], ['Hyderabad', 17.385, 78.4867, 'Asia/Kolkata'],
    ['Lucknow', 26.8467, 80.9462, 'Asia/Kolkata'], ['Ludhiana', 30.901, 75.8573, 'Asia/Kolkata'], ['Srinagar', 34.0837, 74.7973, 'Asia/Kolkata'], ['Dhaka', 23.8103, 90.4125, 'Asia/Dhaka'], ['Kathmandu', 27.7172, 85.324, 'Asia/Kathmandu'],
    ['Colombo', 6.9271, 79.8612, 'Asia/Colombo'], ['Kuala Lumpur', 3.139, 101.6869, 'Asia/Kuala_Lumpur'], ['Singapore', 1.3521, 103.8198, 'Asia/Singapore'], ['Jakarta', -6.2088, 106.8456, 'Asia/Jakarta'], ['Beijing', 39.9042, 116.4074, 'Asia/Shanghai'],
    ['Tokyo', 35.6762, 139.6503, 'Asia/Tokyo'], ['Sydney', -33.8688, 151.2093, 'Australia/Sydney'], ['Melbourne', -37.8136, 144.9631, 'Australia/Melbourne'], ['Moscow', 55.7558, 37.6173, 'Europe/Moscow'], ['Berlin', 52.52, 13.405, 'Europe/Berlin'],
    ['Paris', 48.8566, 2.3522, 'Europe/Paris'], ['London', 51.5074, -0.1278, 'Europe/London'], ['Lagos', 6.5244, 3.3792, 'Africa/Lagos'], ['Nairobi', -1.2921, 36.8219, 'Africa/Nairobi'], ['Johannesburg', -26.2041, 28.0473, 'Africa/Johannesburg'],
    ['New York', 40.7128, -74.006, 'America/New_York'], ['Toronto', 43.6532, -79.3832, 'America/Toronto'], ['Chicago', 41.8781, -87.6298, 'America/Chicago'], ['Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles'],
    ['São Paulo', -23.5505, -46.6333, 'America/Sao_Paulo'], ['Reykjavik', 64.1466, -21.9426, 'Atlantic/Reykjavik'], ['Tromsø', 69.6492, 18.9553, 'Europe/Oslo']];
  var METHODS = { mwl: ['Muslim World League', 18, 17], isna: ['ISNA (North America)', 15, 15], egypt: ['Egyptian General Authority', 19.5, 17.5], karachi: ['Karachi (University of Islamic Sciences)', 18, 18],
    makkah: ['Umm al-Qura, Makkah', 18.5, 'm90'], gulf: ['Gulf region', 19.5, 'm90'], kuwait: ['Kuwait', 18, 17.5], qatar: ['Qatar', 18, 'm90'], muis: ['Singapore (MUIS)', 20, 18], jakim: ['Malaysia (JAKIM)', 20, 18],
    diyanet: ['Turkey (Diyanet)', 18, 17], uoif: ['France (UOIF)', 12, 12] };
  function jd0(y, m, d) { if (m <= 2) { y--; m += 12; } var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; }
  function sun(JD) {   // declination (deg) and equation of time (min), NOAA
    var t = (JD - 2451545) / 36525, L0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360, M = 357.52911 + t * (35999.05029 - 0.0001537 * t), e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    var C = Math.sin(M * R) * (1.914602 - t * (0.004817 + 0.000014 * t)) + Math.sin(2 * M * R) * (0.019993 - 0.000101 * t) + Math.sin(3 * M * R) * 0.000289;
    var om = 125.04 - 1934.136 * t, lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * R);
    var eps = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(om * R);
    var y = Math.tan(eps / 2 * R); y *= y;
    var eq = y * Math.sin(2 * L0 * R) - 2 * e * Math.sin(M * R) + 4 * e * y * Math.sin(M * R) * Math.cos(2 * L0 * R) - 0.5 * y * y * Math.sin(4 * L0 * R) - 1.25 * e * e * Math.sin(2 * M * R);
    return { decl: Math.asin(Math.sin(eps * R) * Math.sin(lam * R)) / R, eq: 4 * eq / R };
  }
  // minutes after 0h UTC of the date: solar noon, and the moment the sun reaches altitude alt(decl) before (-1) or after (+1) noon; NaN = never; 'up' = always above
  function noon(J, lon, base) { var t = base; for (var i = 0; i < 3; i++) t = 720 - 4 * lon - sun(J + t / 1440).eq + (base - (720 - 4 * lon)); return t; }
  function event(J, lat, lon, base, alt, side) {
    var t = noon(J, lon, base);
    for (var i = 0; i < 4; i++) {
      var s = sun(J + t / 1440), a = typeof alt === 'function' ? alt(s.decl) : alt;
      var c = (Math.sin(a * R) - Math.sin(lat * R) * Math.sin(s.decl * R)) / (Math.cos(lat * R) * Math.cos(s.decl * R));
      if (c > 1) return NaN; if (c < -1) return 'up';
      t = noon(J, lon, base) + side * 4 * Math.acos(c) / R;
    }
    return t;
  }
  function offset(tz, d) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return Math.round((Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - Math.floor(d.getTime() / 1000) * 1000) / 60000);
  }
  function times(y, m, d, lat, lon, tz, method, asr) {
    var J = jd0(y, m, d), o = offset(tz, new Date(Date.UTC(y, m - 1, d, 12))), base = 720 - 4 * lon;
    if (base + o < 0) base += 1440; else if (base + o >= 1440) base -= 1440;   // keep solar noon on this local date
    var M = METHODS[method] || METHODS.mwl, k = asr === 'hanafi' ? 2 : 1;
    var r = { noon: noon(J, lon, base), rise: event(J, lat, lon, base, -0.833, -1), set: event(J, lat, lon, base, -0.833, 1),
      dawn: event(J, lat, lon, base, -6, -1), dusk: event(J, lat, lon, base, -6, 1), goldenAm: event(J, lat, lon, base, 6, -1), goldenPm: event(J, lat, lon, base, 6, 1),
      fajr: event(J, lat, lon, base, -M[1], -1), asr: event(J, lat, lon, base, function (dec) { return Math.atan(1 / (k + Math.tan(Math.abs(lat - dec) * R))) / R; }, 1) };
    r.isha = typeof M[2] === 'string' ? (typeof r.set === 'number' ? r.set + +M[2].slice(1) : NaN) : event(J, lat, lon, base, -M[2], 1);
    if (typeof r.rise === 'number' && typeof r.set === 'number' && !isNaN(r.rise) && !isNaN(r.set)) {   // high latitudes: Fajr / Isha from a share of the night
      var night = 1440 - (r.set - r.rise);
      if (typeof r.fajr !== 'number' || isNaN(r.fajr)) { r.fajr = r.rise - M[1] / 60 * night; r.est = true; }
      if (typeof r.isha !== 'number' || isNaN(r.isha)) { r.isha = r.set + (typeof M[2] === 'number' ? M[2] : 18) / 60 * night; r.est = true; }
    }
    r.utc0 = Date.UTC(y, m - 1, d); r.maxAlt = 90 - Math.abs(lat - sun(J + r.noon / 1440).decl);
    return r;
  }
  var city = T.select(CITIES.map(function (c, i) { return [i, c[0]]; }), T.store.get('sun-city', 14)), lat = h('input', { type: 'number', step: 'any', min: '-90', max: '90' }), lon = h('input', { type: 'number', step: 'any', min: '-180', max: '180' });
  var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC', date = h('input', { type: 'date' });
  var method = T.select(Object.keys(METHODS).map(function (k) { return [k, METHODS[k][0]]; }), T.store.get('sun-method', 'mwl')), asr = T.seg([['std', 'Asr: standard'], ['hanafi', 'Asr: Hanafi']], T.store.get('sun-asr', 'std'), draw);
  var h12 = T.seg([['24', '24-hour'], ['12', '12-hour']], T.store.get('sun-12', '24'), draw);
  var out = h('div', { 'class': 'tstats', 'data-out': '' }), pray = h('div', { 'class': 'tstats' }), where = h('p', { 'class': 'tnote' });
  function useCity() { var c = CITIES[+city.value]; lat.value = c[1]; lon.value = c[2]; tz = c[3]; T.store.set('sun-city', +city.value); draw(); }
  city.addEventListener('change', useCity); method.addEventListener('change', function () { T.store.set('sun-method', method.value); draw(); });
  [lat, lon, date].forEach(function (x) { x.addEventListener('input', function () { if (x !== date) tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC'; draw(); }); });
  function clock(r, t) {
    if (t === 'up') return 'Sun stays up'; if (typeof t !== 'number' || isNaN(t)) return 'Does not happen';
    return new Intl.DateTimeFormat(h12.value() === '12' ? 'en-US' : 'en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: h12.value() === '12' }).format(new Date(r.utc0 + Math.round(t) * 60000));
  }
  function stat(box, v, l) { box.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: v }), h('span', { text: l })])); }
  function draw() {
    T.store.set('sun-asr', asr.value()); T.store.set('sun-12', h12.value());
    var a = +lat.value, b = +lon.value; out.innerHTML = ''; pray.innerHTML = '';
    if (lat.value === '' || lon.value === '' || !(a >= -90 && a <= 90 && b >= -180 && b <= 180)) return status.error('Type a latitude (−90 to 90) and longitude (−180 to 180), or pick a city.');
    if (!date.value) return status.error('Pick a date.');
    status.clear();
    var p = date.value.split('-'), r = times(+p[0], +p[1], +p[2], a, b, tz, method.value, asr.value());
    var dayLen = typeof r.rise === 'number' && typeof r.set === 'number' && !isNaN(r.rise + r.set) ? Math.round(r.set - r.rise) : r.rise === 'up' ? 1440 : 0;
    stat(out, clock(r, r.rise), '🌅 Sunrise'); stat(out, clock(r, r.set), '🌇 Sunset'); stat(out, clock(r, r.noon), '☀️ Solar noon');
    stat(out, Math.floor(dayLen / 60) + 'h ' + dayLen % 60 + 'm', 'Daylight'); stat(out, clock(r, r.dawn), 'First light (civil dawn)'); stat(out, clock(r, r.dusk), 'Last light (civil dusk)');
    stat(out, clock(r, r.goldenPm) + ' – ' + clock(r, r.set), '📸 Evening golden hour'); stat(out, Math.round(r.maxAlt * 10) / 10 + '°', 'Sun’s highest angle');
    [['Fajr', r.fajr], ['Sunrise', r.rise], ['Dhuhr', r.noon], ['Asr', r.asr], ['Maghrib', r.set], ['Isha', r.isha]].forEach(function (x) { stat(pray, clock(r, x[1]), x[0]); });
    where.textContent = 'Times for ' + a.toFixed(4) + ', ' + b.toFixed(4) + ' in time zone ' + tz.replace(/_/g, ' ') + '.' + (r.est ? ' Fajr / Isha estimated with the share-of-night rule (the sky does not get dark enough here).' : '') + ' Accurate to about a minute; hills and tall buildings can hide the sun a little earlier.';
  }
  var me = T.button('📍 Use my location', { small: true, onclick: function () {
    if (!navigator.geolocation) return status.error('This browser cannot share its location. Pick a city or type coordinates.');
    status.info('Asking for your location…');
    navigator.geolocation.getCurrentPosition(function (p) { lat.value = p.coords.latitude.toFixed(4); lon.value = p.coords.longitude.toFixed(4); tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC'; draw(); },
      function () { status.error('Location was not shared. Pick a city or type coordinates instead.'); }, { timeout: 15000 });
  } });
  var d0 = new Date(); date.value = d0.getFullYear() + '-' + ('0' + (d0.getMonth() + 1)).slice(-2) + '-' + ('0' + d0.getDate()).slice(-2);
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('City', city), T.field('Date', date), T.field('Latitude', lat), T.field('Longitude', lon)]), T.row([me, h12]), status.el, out,
    h('h3', { text: '🕌 Prayer times' }), h('div', { 'class': 'tgrid2' }, [T.field('Calculation method', method), T.field('Asr', asr)]), pray, where]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  useCity();
  T.tests.sunrise = function () {
    var f = [];
    function hm(r, t, z) { var p = new Intl.DateTimeFormat('en-GB', { timeZone: z, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(r.utc0 + t * 60000)).split(':'); return +p[0] * 60 + +p[1]; }
    var dl = times(2024, 6, 21, 28.6139, 77.209, 'Asia/Kolkata', 'mwl', 'std');
    if (Math.abs(hm(dl, dl.rise, 'Asia/Kolkata') - (5 * 60 + 24)) > 3 || Math.abs(hm(dl, dl.set, 'Asia/Kolkata') - (19 * 60 + 22)) > 3) f.push('Delhi June ' + hm(dl, dl.rise, 'Asia/Kolkata') + '/' + hm(dl, dl.set, 'Asia/Kolkata'));
    var ld = times(2024, 12, 21, 51.5074, -0.1278, 'Europe/London', 'mwl', 'std');
    if (Math.abs(hm(ld, ld.rise, 'Europe/London') - (8 * 60 + 4)) > 3 || Math.abs(hm(ld, ld.set, 'Europe/London') - (15 * 60 + 53)) > 3) f.push('London December');
    if (!(dl.fajr < dl.rise && dl.rise < dl.noon && dl.noon < dl.asr && dl.asr < dl.set && dl.set < dl.isha)) f.push('prayer order');
    var hn = times(2024, 6, 21, 28.6139, 77.209, 'Asia/Kolkata', 'mwl', 'hanafi'); if (!(hn.asr > dl.asr + 30)) f.push('Hanafi Asr later');
    var mk = times(2025, 3, 1, 21.4225, 39.8262, 'Asia/Riyadh', 'makkah', 'std'); if (Math.abs(mk.isha - mk.set - 90) > 0.01) f.push('Umm al-Qura Isha +90');
    var tr = times(2024, 6, 21, 69.6492, 18.9553, 'Europe/Oslo', 'mwl', 'std'); if (tr.rise !== 'up' || tr.set !== 'up') f.push('midnight sun');
    var tk = times(2024, 3, 20, 35.6762, 139.6503, 'Asia/Tokyo', 'mwl', 'std'); if (Math.abs(hm(tk, tk.noon, 'Asia/Tokyo') - (11 * 60 + 48)) > 3) f.push('Tokyo noon ' + hm(tk, tk.noon, 'Asia/Tokyo'));
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
