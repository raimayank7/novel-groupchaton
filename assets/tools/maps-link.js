/* Infinity by GroupChatOn — maps-link. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Map and directions link maker: one place or address → links that open Google Maps, Apple Maps, Waze and OpenStreetMap on any phone, with directions and a QR code. */
GCOTools.register('maps-link', function (spot, T) {
  var h = T.h, status = T.status();
  // "30.9010, 75.8573", "30.9010° N 75.8573° E" or a pasted Google Maps address with @lat,lng → { lat, lng }
  function coords(s) {
    s = String(s || '').trim();
    var m = s.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) || s.match(/[?&](?:q|ll|query|destination)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i);
    var lat, lng;
    if (m) { lat = +m[1]; lng = +m[2]; }
    else {
      m = s.match(/^(-?\d+(?:\.\d+)?)\s*°?\s*([NS])?\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EW])?$/i);
      if (!m) return null;
      lat = +m[1] * (/s/i.test(m[2] || '') ? -1 : 1); lng = +m[3] * (/w/i.test(m[4] || '') ? -1 : 1);
    }
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat: lat, lng: lng } : null;
  }
  function q(s) { var c = coords(s); return c ? c.lat + ',' + c.lng : s.trim(); }
  var MODES = { driving: ['d', 'driving'], walking: ['w', 'walking'], transit: ['r', 'transit'], bicycling: ['d', 'bicycling'] };
  function links(o) {
    var dest = q(o.to), from = o.from ? q(o.from) : '', c = coords(o.to), e = encodeURIComponent, out = {};
    if (o.dir) {
      out.google = 'https://www.google.com/maps/dir/?api=1' + (from ? '&origin=' + e(from) : '') + '&destination=' + e(dest) + '&travelmode=' + MODES[o.mode][1];
      out.apple = 'https://maps.apple.com/?' + (from ? 'saddr=' + e(from) + '&' : '') + 'daddr=' + e(dest) + '&dirflg=' + MODES[o.mode][0];
      out.waze = 'https://waze.com/ul?' + (c ? 'll=' + e(c.lat + ',' + c.lng) : 'q=' + e(dest)) + '&navigate=yes';
    } else {
      out.google = 'https://www.google.com/maps/search/?api=1&query=' + e(dest);
      out.apple = 'https://maps.apple.com/?' + (c ? 'll=' + e(dest) + '&q=' + e(o.label || 'Pin') : 'q=' + e(dest));
      out.waze = 'https://waze.com/ul?' + (c ? 'll=' + e(c.lat + ',' + c.lng) : 'q=' + e(dest));
    }
    out.osm = c ? 'https://www.openstreetmap.org/?mlat=' + c.lat + '&mlon=' + c.lng + '#map=17/' + c.lat + '/' + c.lng : 'https://www.openstreetmap.org/search?query=' + e(dest);
    return out;
  }
  var to = h('input', { type: 'text', placeholder: 'Place, full address, or 30.9010, 75.8573', 'aria-label': 'Place or address', autocomplete: 'street-address' });
  var label = h('input', { type: 'text', placeholder: 'Optional: name shown on the pin, e.g. Sharma Sweets', 'aria-label': 'Name of the place' });
  var from = h('input', { type: 'text', placeholder: 'Leave empty to start from where the person is', 'aria-label': 'Start from' });
  var dir = false, mode = 'driving', last = null;
  var dirBox = h('div', { style: 'display:grid;gap:12px', hidden: true }, [T.field('Start from (optional)', from), T.seg([['driving', '🚗 Car'], ['walking', '🚶 Walk'], ['transit', '🚌 Transit'], ['bicycling', '🚲 Cycle']], 'driving', function (v) { mode = v; draw(); })]);
  var out = h('div', { 'class': 'tkv', 'data-out': '' }), qrBox = h('div', { style: 'text-align:center' });
  function row(name, url) {
    var b = T.button('Copy', { small: true, onclick: function () { T.copy(url, b); } });
    return h('div', {}, [h('b', { text: name }), h('a', { href: url, target: '_blank', rel: 'noopener', style: 'overflow-wrap:anywhere;font-size:13px', text: url.replace(/^https:\/\//, '') }), b]);
  }
  function message() {
    var L = last; if (!L) return '';
    return (label.value.trim() ? label.value.trim() + '\n' : '') + (coords(to.value) ? '' : to.value.trim() + '\n') + '📍 Google Maps: ' + L.google + '\n🍎 Apple Maps: ' + L.apple;
  }
  function draw() {
    qrBox.innerHTML = '';
    if (!to.value.trim()) { out.innerHTML = ''; last = null; status.clear(); return; }
    last = links({ to: to.value, from: from.value, dir: dir, mode: mode, label: label.value.trim() });
    out.innerHTML = '';
    [['Google Maps', last.google], ['Apple Maps', last.apple], ['Waze', last.waze], ['OpenStreetMap', last.osm]].forEach(function (x) { out.appendChild(row(x[0], x[1])); });
    var c = coords(to.value); status.info(c ? 'Using exact coordinates: ' + c.lat + ', ' + c.lng + ' (most accurate).' : 'Using the address as text: maps apps will search for it. For an exact spot, use “Use my location” or paste coordinates.');
  }
  function here() {
    if (!navigator.geolocation) { status.error('This browser cannot share your location. Type the address instead.'); return; }
    status.info('Asking for your location…');
    navigator.geolocation.getCurrentPosition(function (p) {
      to.value = p.coords.latitude.toFixed(6) + ', ' + p.coords.longitude.toFixed(6); draw();
      status.ok('Location found (accurate to about ' + Math.round(p.coords.accuracy) + ' m). It is only used to make the link.');
    }, function (e) { status.error(e.code === 1 ? 'Location permission was blocked. Allow location for this site in your browser settings, or type the address.' : 'Your location could not be found. Go near a window or type the address.'); }, { enableHighAccuracy: true, timeout: 15000 });
  }
  function qr() {
    if (!last) { status.error('Type a place or address first.'); return; }
    T.lib('qrcode').then(function (qrcode) {
      var g = qrcode(0, 'M'); g.addData(unescape(encodeURIComponent(last.google)), 'Byte'); g.make();
      var src = g.createDataURL(6, 3); qrBox.innerHTML = '';
      qrBox.appendChild(h('img', { src: src, alt: 'QR code for the Google Maps link', style: 'width:min(220px,70%);image-rendering:pixelated;background:#fff;border-radius:8px' }));
      qrBox.appendChild(h('div', {}, [T.button('Download QR', { small: true, onclick: function () { fetch(src).then(function (r) { return r.blob(); }).then(function (b) { T.download(b, 'map-qr.gif'); }); } })]));
    }, function (e) { status.error(e); });
  }
  [to, from, label].forEach(function (x) { x.addEventListener('input', draw); });
  var cp = T.button('Copy message', { small: true, onclick: function () { if (last) T.copy(message(), cp); } });
  spot.appendChild(T.card([T.seg([['place', 'Show a place'], ['dir', 'Directions']], 'place', function (v) { dir = v === 'dir'; dirBox.hidden = !dir; draw(); }),
    T.field('Place or address', to), T.row([T.button('📍 Use my location', { small: true, onclick: here }), T.button('Try a sample', { small: true, onclick: function () { to.value = 'India Gate, New Delhi'; label.value = ''; draw(); } })]),
    T.field('Name of the place (optional)', label), dirBox, status.el, out,
    T.row([T.button('Share on WhatsApp', { primary: true, onclick: function () { if (!last) { status.error('Type a place or address first.'); return; } window.open('https://wa.me/?text=' + encodeURIComponent(message()), '_blank', 'noopener'); } }), cp, T.button('QR code', { small: true, onclick: qr })]), qrBox,
    h('p', { 'class': 'tnote', text: 'Google Maps links open the Google Maps app on Android and iPhone (or the website). Apple Maps links open Apple Maps on iPhone, iPad and Mac, and Google Maps in a browser elsewhere. Your location is used only if you press “Use my location”, and only to make the link.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['maps-link'] = function () {
    var f = [], a = coords('30.9010, 75.8573'), b = coords('33.8688° S, 151.2093° E'), c = coords('https://www.google.com/maps/place/X/@28.6129,77.2295,17z');
    if (!a || a.lat !== 30.901 || a.lng !== 75.8573) f.push('plain');
    if (!b || b.lat !== -33.8688 || b.lng !== 151.2093) f.push('hemispheres ' + JSON.stringify(b));
    if (!c || c.lat !== 28.6129) f.push('google url');
    if (coords('India Gate, New Delhi') || coords('95, 20')) f.push('false coordinates');
    var p = links({ to: 'India Gate, New Delhi', dir: false });
    if (p.google !== 'https://www.google.com/maps/search/?api=1&query=India%20Gate%2C%20New%20Delhi' || p.apple !== 'https://maps.apple.com/?q=India%20Gate%2C%20New%20Delhi') f.push('place links');
    var d = links({ to: '30.9010, 75.8573', from: '', dir: true, mode: 'walking' });
    if (d.google.indexOf('destination=30.901%2C75.8573&travelmode=walking') < 0 || d.apple.indexOf('daddr=30.901%2C75.8573&dirflg=w') < 0 || d.waze.indexOf('navigate=yes') < 0) f.push('directions ' + d.google);
    if (d.osm.indexOf('mlat=30.901&mlon=75.8573') < 0) f.push('osm');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
