/* Infinity by GroupChatOn — distance-map. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Straight-line distance between two places on a map (OpenStreetMap via Leaflet), by search or coordinates. */
GCOTools.register('distance-map', function (spot, T) {
  var h = T.h, R = 6371.0088;
  function hav(a, b) {
    var p1 = a.lat * Math.PI / 180, p2 = b.lat * Math.PI / 180, dp = p2 - p1, dl = (b.lon - a.lon) * Math.PI / 180;
    var x = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function bearing(a, b) {
    var p1 = a.lat * Math.PI / 180, p2 = b.lat * Math.PI / 180, dl = (b.lon - a.lon) * Math.PI / 180;
    var y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
  var DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  var places = [null, null], out = h('div', { 'class': 'tstats' }), status = T.status(), mapBox = h('div', { 'class': 'tmap' }), map = null, layer = null, last = {};
  function box(n) {
    var input = h('input', { type: 'search', placeholder: n ? 'To: e.g. Mumbai' : 'From: e.g. Delhi', 'aria-label': n ? 'To' : 'From' }), list = h('div', { 'class': 'tplaces' }), timer = 0;
    input.addEventListener('input', function () {
      clearTimeout(timer); timer = setTimeout(function () {
        var s = input.value.trim(), m = s.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
        list.innerHTML = '';
        if (m) { places[n] = { lat: +m[1], lon: +m[2], name: s }; return calc(); }
        if (s.length < 2) return;
        fetch('https://geocoding-api.open-meteo.com/v1/search?count=5&language=en&name=' + encodeURIComponent(s)).then(function (r) { return r.json(); }).then(function (j) {
          (j.results || []).forEach(function (p) {
            var label = p.name + (p.admin1 ? ', ' + p.admin1 : '') + (p.country ? ', ' + p.country : '');
            list.appendChild(h('button', { type: 'button', 'class': 'tbtn tbtn-sm', text: label, onclick: function () { list.innerHTML = ''; input.value = label; places[n] = { lat: p.latitude, lon: p.longitude, name: label }; calc(); } }));
          });
        }).catch(function () { status.error('Could not search places. Check your connection, or type coordinates like 28.61, 77.21.'); });
      }, 350);
    });
    return h('div', {}, [T.field(n ? 'To' : 'From', input, 'a place name, or latitude, longitude'), list]);
  }
  function calc() {
    out.innerHTML = '';
    if (!places[0] || !places[1]) return;
    var a = places[0], b = places[1], km = hav(a, b), br = bearing(a, b);
    last = { km: km, br: br };
    [[km.toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' km', 'Straight-line distance'], [(km / 1.609344).toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' mi', 'In miles'],
      [(km / 1.852).toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' nmi', 'Nautical miles'], [br.toFixed(1) + '° ' + DIRS[Math.round(br / 22.5) % 16], 'Direction from the first place'],
      [Math.round(km / 800 * 60 + 30) + ' min', 'Flight time (about, at 800 km/h + 30 min)']].forEach(function (r) { out.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: r[0] }), h('span', { text: r[1] })])); });
    drawMap();
  }
  function drawMap() {
    if (!places[0] || !places[1]) return;
    if (!document.getElementById('leaflet-css')) document.head.appendChild(h('link', { id: 'leaflet-css', rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css' }));
    T.lib('leaflet').then(function (L) {
      mapBox.hidden = false;
      if (!map) { map = L.map(mapBox, { scrollWheelZoom: false }); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map); }
      if (layer) layer.remove();
      var a = [places[0].lat, places[0].lon], b = [places[1].lat, places[1].lon];
      layer = L.layerGroup([L.marker(a).bindPopup(places[0].name), L.marker(b).bindPopup(places[1].name), L.polyline([a, b], { color: '#8B7CFF', weight: 3, dashArray: '6 6' })]).addTo(map);
      map.fitBounds([a, b], { padding: [30, 30] });
    }).catch(function () { mapBox.hidden = true; });
  }
  mapBox.hidden = true;
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [box(0), box(1)]), status.el, out, mapBox,
    h('p', { 'class': 'tnote', text: 'This is the distance “as the crow flies” over the Earth’s surface (great-circle). Road distance is usually 20–40% longer. Map © OpenStreetMap contributors.' })]));
  T.tests['distance-map'] = function () {
    var fails = [], keep = places.slice();
    places = [{ lat: 28.6139, lon: 77.2090, name: 'Delhi' }, { lat: 19.0760, lon: 72.8777, name: 'Mumbai' }]; calc();
    if (Math.abs(last.km - 1148.096) > 0.01) fails.push('Delhi–Mumbai ' + last.km);
    if (Math.abs(last.br - 203.468) > 0.01) fails.push('bearing ' + last.br);
    places = [{ lat: 0, lon: 0 }, { lat: 0, lon: 180 }]; calc(); if (Math.abs(last.km - Math.PI * R) > 1e-6) fails.push('half the equator ' + last.km);
    places = keep; out.innerHTML = '';
    return Promise.resolve({ ok: !fails.length, n: 3, fails: fails });
  };
});
