/* Infinity by GroupChatOn — elevation. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Height above sea level for any place (Open-Meteo geocoding and elevation APIs, free, no key) or your current location. */
GCOTools.register('elevation', function (spot, T) {
  var h = T.h;
  var q = h('input', { type: 'search', placeholder: 'Town, city or place, e.g. Shimla', 'aria-label': 'Place', enterkeyhint: 'search' });
  var list = h('div', { 'class': 'tplaces' }), out = h('div', { 'class': 'tstats' }), status = T.status(), last = {};
  function facts(name, m) {
    out.innerHTML = ''; last = { m: m };
    var p = 101325 * Math.pow(1 - 2.25577e-5 * m, 5.25588);
    last.p = p;
    [[name, ''], [Math.round(m).toLocaleString('en-US') + ' m', 'Height above sea level'], [Math.round(m / 0.3048).toLocaleString('en-US') + ' ft', 'In feet'],
      [(p / 100).toFixed(0) + ' hPa', 'Usual air pressure (sea level 1013 hPa)'], [(100 - m / 300).toFixed(1) + ' °C', 'Water boils at (about)'], [Math.round(p / 101325 * 100) + '%', 'Oxygen per breath vs sea level']]
      .forEach(function (r, i) { out.appendChild(h('div', { 'class': 'tstat' + (i === 0 ? ' tstat-wide' : '') }, [h('b', { text: r[0] }), h('span', { text: r[1] })])); });
    if (m > 2500) out.appendChild(h('p', { 'class': 'tnote', text: 'Above about 2,500 m, altitude sickness is possible: climb slowly and drink water.' }));
  }
  function byCoords(lat, lon, name) {
    status.info('Finding the height…');
    return fetch('https://api.open-meteo.com/v1/elevation?latitude=' + lat + '&longitude=' + lon).then(function (r) { return r.json(); }).then(function (j) {
      status.clear(); facts(name || lat.toFixed(4) + ', ' + lon.toFixed(4), j.elevation[0]);
    }).catch(function () { status.error('Could not reach the elevation service. Check your connection.'); });
  }
  var timer = 0;
  function search() {
    var s = q.value.trim(); list.innerHTML = '';
    var m = s.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (m) return byCoords(+m[1], +m[2]);
    if (s.length < 2) return Promise.resolve();
    return fetch('https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=' + encodeURIComponent(s)).then(function (r) { return r.json(); }).then(function (j) {
      (j.results || []).forEach(function (p) {
        var label = p.name + (p.admin1 ? ', ' + p.admin1 : '') + (p.country ? ', ' + p.country : '');
        list.appendChild(h('button', { type: 'button', 'class': 'tbtn tbtn-sm', text: label, onclick: function () { list.innerHTML = ''; q.value = label; if (p.elevation != null) facts(label, p.elevation); else byCoords(p.latitude, p.longitude, label); } }));
      });
      if (!(j.results || []).length) list.appendChild(h('p', { 'class': 'tstatus', text: 'No place found. Try another spelling, or type coordinates like 31.10, 77.17.' }));
    }).catch(function () { status.error('Could not search places. Check your connection.'); });
  }
  q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(search, 350); });
  var me = T.button('📍 Use my location', { small: true, onclick: function () {
    if (!navigator.geolocation) return status.error('Your browser cannot share its location.');
    status.info('Asking for your location…');
    navigator.geolocation.getCurrentPosition(function (p) { byCoords(p.coords.latitude, p.coords.longitude, 'Your location'); }, function () { status.error('Location was not shared. Search for the place instead.'); }, { timeout: 15000 });
  } });
  spot.appendChild(T.card([T.field('Place or coordinates', q), T.row([me]), list, status.el, out,
    h('p', { 'class': 'tnote', text: 'Heights from a 90 m global terrain model via Open-Meteo, accurate to a few metres in most places. Your location is only used to look up the height.' })]));
  T.tests.elevation = function () {
    var fails = [];
    facts('Sea', 0); if (Math.abs(last.p - 101325) > 1e-6) fails.push('sea-level pressure ' + last.p);
    facts('Test', 2200); if (Math.abs(last.p - 77540.88) > 0.5) fails.push('2,200 m pressure ' + last.p);
    return byCoords(31.1048, 77.1734, 'Shimla').then(function () {
      if (!(last.m > 1500 && last.m < 2800)) fails.push('Shimla height ' + last.m);
      out.innerHTML = '';
      return { ok: !fails.length, n: 3, fails: fails };
    });
  };
});
