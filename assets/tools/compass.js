/* Infinity by GroupChatOn — compass. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Compass: the phone's magnetic sensor as a compass with 16 directions, a bearing you can lock, and honest notes on accuracy. */
GCOTools.register('compass', function (spot, T) {
  var h = T.h, status = T.status(), on = false, heard = false, lockAt = null, evName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
  var NAMES = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  var LONG = { N: 'North', E: 'East', S: 'South', W: 'West', NE: 'North-east', SE: 'South-east', SW: 'South-west', NW: 'North-west' };
  function card(deg) { return NAMES[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16]; }
  function fromAlpha(alpha, screenAngle) { return ((360 - alpha + (screenAngle || 0)) % 360 + 360) % 360; }
  function turn(from, to) { var d = ((to - from) % 360 + 540) % 360 - 180; return d; }
  var cv = h('canvas', { width: '560', height: '560', 'aria-label': 'Compass dial', style: 'width:min(280px,80vw);aspect-ratio:1;display:block;margin:0 auto' });
  var read = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 38px/1.2 var(--ui);font-variant-numeric:tabular-nums' }), sub = h('p', { 'class': 'tnote', style: 'text-align:center' });
  function draw(hd) {
    var g = cv.getContext('2d'), R = 280; g.clearRect(0, 0, 560, 560);
    g.save(); g.translate(R, R);
    g.beginPath(); g.arc(0, 0, R - 6, 0, Math.PI * 2); g.fillStyle = '#f8fafc'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#334155'; g.stroke();
    g.rotate(-hd * Math.PI / 180);
    for (var d = 0; d < 360; d += 5) { g.save(); g.rotate(d * Math.PI / 180); g.beginPath(); g.moveTo(0, -R + 10); g.lineTo(0, -R + (d % 30 ? 24 : 40)); g.lineWidth = d % 30 ? 2 : 4; g.strokeStyle = '#334155'; g.stroke(); g.restore(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    ['N', 'E', 'S', 'W'].forEach(function (n, i) { g.save(); g.rotate(i * Math.PI / 2); g.font = 'bold 54px system-ui,sans-serif'; g.fillStyle = n === 'N' ? '#dc2626' : '#0f172a'; g.fillText(n, 0, -R + 84); g.restore(); });
    g.restore();
    g.save(); g.translate(R, R);   // the needle points to where the phone's top faces
    g.beginPath(); g.moveTo(0, -R + 110); g.lineTo(20, 0); g.lineTo(-20, 0); g.closePath(); g.fillStyle = '#dc2626'; g.fill();
    g.beginPath(); g.moveTo(0, R - 110); g.lineTo(20, 0); g.lineTo(-20, 0); g.closePath(); g.fillStyle = '#94a3b8'; g.fill();
    g.beginPath(); g.arc(0, 0, 14, 0, Math.PI * 2); g.fillStyle = '#0f172a'; g.fill(); g.restore();
  }
  function show(hd, demo) {
    draw(hd);
    var c = card(hd); read.textContent = Math.round(hd) % 360 + '° ' + c;
    var s = (demo ? 'Demo reading. ' : '') + 'Facing ' + (LONG[c] || c) + '.';
    if (lockAt != null) { var t = turn(hd, lockAt); s += Math.abs(t) < 3 ? ' On your locked bearing ✓' : ' Turn ' + Math.round(Math.abs(t)) + '° ' + (t > 0 ? 'right' : 'left') + ' for ' + Math.round(lockAt) + '°.'; }
    sub.textContent = s; current = hd;
  }
  var current = null;
  function onEvent(e) {
    var hd = null, ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    if (typeof e.webkitCompassHeading === 'number') hd = (e.webkitCompassHeading + ang) % 360;
    else if (e.alpha != null && (e.absolute || evName === 'deviceorientationabsolute')) hd = fromAlpha(e.alpha, ang);
    if (hd == null) return;
    heard = true; show(hd);
  }
  function start() {
    if (on) { window.removeEventListener(evName, onEvent); on = false; go.textContent = 'Start compass'; status.info('Compass stopped.'); return; }
    if (!('DeviceOrientationEvent' in window)) { status.error('This device or browser has no compass sensor. Open this page on a phone.'); return; }
    var ask = typeof DeviceOrientationEvent.requestPermission === 'function' ? DeviceOrientationEvent.requestPermission() : Promise.resolve('granted');
    ask.then(function (p) {
      if (p !== 'granted') { status.error('Motion access was not allowed. Allow “Motion & Orientation” for this site and try again.'); return; }
      heard = false; on = true; go.textContent = 'Stop'; window.addEventListener(evName, onEvent);
      status.info('Hold the phone flat, away from magnets, speakers and metal.');
      setTimeout(function () { if (on && !heard) status.error('No compass reading arrived. Most computers have no compass; on a phone, wave it in a figure-8 to wake the sensor.'); }, 3000);
    }, function () { status.error('Motion access could not be asked for here. Open the page directly in Safari or Chrome.'); });
  }
  var go = T.button('Start compass', { primary: true, onclick: start });
  window.addEventListener('pagehide', function () { window.removeEventListener(evName, onEvent); });
  spot.appendChild(T.card([cv, read, sub,
    T.row([go, T.button('Lock this bearing', { small: true, onclick: function () { if (current == null) { status.error('Start the compass first.'); return; } lockAt = current; status.ok('Bearing ' + Math.round(lockAt) + '° locked: follow the arrows to keep it.'); show(current); } }),
      T.button('Unlock', { small: true, onclick: function () { lockAt = null; if (current != null) show(current); } }), T.button('Try a sample', { small: true, onclick: function () { show(237, true); } })]), status.el]));
  draw(0); read.textContent = '–'; sub.textContent = 'Press Start compass on a phone.';
  T.tests['compass'] = function () {
    var f = [];
    [[0, 'N'], [22.5, 'NNE'], [45, 'NE'], [225, 'SW'], [350, 'N'], [348, 'NNW'], [-90, 'W']].forEach(function (x) { if (card(x[0]) !== x[1]) f.push(x[0] + '→' + card(x[0])); });
    if (fromAlpha(90) !== 270 || fromAlpha(0) !== 0 || fromAlpha(270, 90) !== 180) f.push('alpha');
    if (turn(350, 10) !== 20 || turn(10, 350) !== -20) f.push('turn');
    return Promise.resolve({ ok: !f.length, n: 9, fails: f });
  };
});
