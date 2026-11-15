/* Infinity by GroupChatOn — bubble-level. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Spirit level: the phone's tilt sensor as a bubble level, lying flat (surface) or standing on its edge (shelf, picture frame). */
GCOTools.register('bubble-level', function (spot, T) {
  var h = T.h, status = T.status(), on = false, mode = 'flat', zero = T.store.get('level-zero', { x: 0, y: 0, r: 0 }), last = null, heard = false;
  var D = Math.PI / 180;
  // the "up" direction seen from the phone (x right, y towards the top edge, z out of the screen), from the browser's beta and gamma angles
  function up(beta, gamma) { var b = beta * D, g = gamma * D; return { x: -Math.cos(b) * Math.sin(g), y: Math.sin(b), z: Math.cos(b) * Math.cos(g) }; }
  function flat(u) { return { x: Math.asin(Math.max(-1, Math.min(1, u.x))) / D, y: Math.asin(Math.max(-1, Math.min(1, u.y))) / D, tilt: Math.acos(Math.max(-1, Math.min(1, u.z))) / D }; }
  // standing on an edge: how far the phone is turned from straight, from the gravity sensor (the same whichever edge it stands on)
  function edge(u) { var r = Math.atan2(u.x, u.y) / D; var off = r - Math.round(r / 90) * 90; return Math.round(off * 10) / 10 === 0 ? 0 : off; }
  var vial = h('div', { 'aria-hidden': 'true', style: 'position:relative;width:min(280px,80vw);aspect-ratio:1;margin:0 auto;border-radius:50%;background:radial-gradient(circle,#e8f7c8,#b6dd6a);border:6px solid #6b8f2a;box-sizing:border-box' });
  var cross = h('div', { style: 'position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border:2px solid rgba(0,0,0,.5);border-radius:50%' });
  var bubble = h('div', { style: 'position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#d8f0ff 60%,#9cc8e6);box-shadow:0 2px 6px rgba(0,0,0,.3);transition:transform .08s linear' });
  vial.appendChild(cross); vial.appendChild(bubble);
  var bar = h('div', { 'aria-hidden': 'true', style: 'position:relative;width:min(320px,86vw);height:56px;margin:0 auto;border-radius:28px;background:linear-gradient(#e8f7c8,#b6dd6a);border:5px solid #6b8f2a;box-sizing:border-box', hidden: true });
  var bbar = h('div', { style: 'position:absolute;left:50%;top:50%;width:70px;height:34px;margin:-17px 0 0 -35px;border-radius:17px;background:radial-gradient(circle at 35% 30%,#fff,#d8f0ff 60%,#9cc8e6);transition:transform .08s linear' });
  bar.appendChild(h('div', { style: 'position:absolute;left:50%;top:6px;bottom:6px;width:80px;margin-left:-40px;border-left:2px solid rgba(0,0,0,.5);border-right:2px solid rgba(0,0,0,.5)' })); bar.appendChild(bbar);
  var read = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 34px/1.2 var(--ui);font-variant-numeric:tabular-nums' });
  var sub = h('p', { 'class': 'tnote', style: 'text-align:center' });
  var grav = null;
  function show(beta, gamma, demo) {
    if (beta != null) last = { b: beta, g: gamma };
    var u = last ? up(last.b, last.g) : { x: 0, y: 0, z: 1 };
    if (mode === 'flat') {
      if (!last) return;
      var a = flat(u), x = a.x - zero.x, y = a.y - zero.y, k = Math.min(1, Math.hypot(x, y) / 15), ang = Math.atan2(y, x);
      bubble.style.transform = 'translate(' + (Math.cos(ang) * k * 100).toFixed(1) + 'px,' + (-Math.sin(ang) * k * 100).toFixed(1) + 'px)';
      var t = Math.hypot(x, y);
      read.textContent = (t < 0.3 ? '0.0° ✓ Level' : t.toFixed(1) + '°'); read.style.color = t < 0.3 ? '#16a34a' : '';
      sub.textContent = (demo ? 'Demo reading. ' : '') + 'Left–right ' + Math.abs(x).toFixed(1) + '°, front–back ' + Math.abs(y).toFixed(1) + '°';
    } else {
      if (demo) grav = { x: -Math.sin(1.6 * D), y: Math.cos(1.6 * D) };
      if (!grav) { read.textContent = '–'; sub.textContent = 'Stand the phone on its edge.'; return; }
      var r = edge(grav) - zero.r;
      bbar.style.transform = 'translateX(' + (Math.max(-1, Math.min(1, r / 10)) * 110).toFixed(1) + 'px)';
      read.textContent = Math.abs(r) < 0.3 ? '0.0° ✓ Level' : Math.abs(r).toFixed(1) + '°'; read.style.color = Math.abs(r) < 0.3 ? '#16a34a' : '';
      sub.textContent = (demo ? 'Demo reading. ' : '') + (Math.abs(r) < 0.3 ? 'Perfectly level.' : 'Raise the ' + (r > 0 ? 'left' : 'right') + ' side.');
    }
  }
  function onEvent(e) {
    if (e.beta == null || e.gamma == null) return;
    heard = true; if (mode === 'flat') show(e.beta, e.gamma); else last = { b: e.beta, g: e.gamma };
  }
  function onMotion(e) {
    var a = e.accelerationIncludingGravity;
    if (!a || a.x == null || a.y == null) return;
    heard = true; grav = { x: a.x, y: a.y }; if (mode === 'edge') show(null);
  }
  function stopAll() { window.removeEventListener('deviceorientation', onEvent); window.removeEventListener('devicemotion', onMotion); }
  function start() {
    if (on) { stopAll(); on = false; go.textContent = 'Start level'; status.info('Level stopped.'); return; }
    if (!('DeviceOrientationEvent' in window)) { status.error('This device or browser has no tilt sensor. Open this page on a phone or tablet.'); return; }
    var ask = Promise.all([typeof DeviceOrientationEvent.requestPermission === 'function' ? DeviceOrientationEvent.requestPermission() : 'granted',
      window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function' ? DeviceMotionEvent.requestPermission() : 'granted']);
    ask.then(function (p) {
      if (p[0] !== 'granted') { status.error('Motion access was not allowed. Allow “Motion & Orientation” for this site and try again.'); return; }
      heard = false; on = true; go.textContent = 'Stop'; window.addEventListener('deviceorientation', onEvent); window.addEventListener('devicemotion', onMotion);
      status.info('Lay the phone on the surface (or stand it on its edge).');
      setTimeout(function () { if (on && !heard) status.error('No tilt sensor answered. This works on phones and tablets, not on most computers.'); }, 2500);
    }, function () { status.error('Motion access could not be asked for here. Open the page directly in Safari or Chrome.'); });
  }
  function calibrate() {
    if (!last && !grav) { status.error('Start the level first, then set the phone on a surface you know is level.'); return; }
    if (mode === 'flat' && last) { var a = flat(up(last.b, last.g)); zero.x = a.x; zero.y = a.y; }
    if (mode === 'edge' && grav) zero.r = edge(grav);
    T.store.set('level-zero', zero); status.ok('Calibrated: this position now reads 0°.'); show(null);
  }
  var go = T.button('Start level', { primary: true, onclick: start });
  window.addEventListener('pagehide', stopAll);
  spot.appendChild(T.card([T.seg([['flat', 'Flat on a surface'], ['edge', 'On its edge']], 'flat', function (v) { mode = v; vial.hidden = v !== 'flat'; bar.hidden = v === 'flat'; show(null); }),
    vial, bar, read, sub,
    T.row([go, T.button('Calibrate here', { small: true, onclick: calibrate }), T.button('Reset calibration', { small: true, onclick: function () { zero = { x: 0, y: 0, r: 0 }; T.store.set('level-zero', zero); status.info('Calibration cleared.'); if (last) show(last.b, last.g); } }),
      T.button('Try a sample', { small: true, onclick: function () { show(2.4, -1.1, true); } })]), status.el]));
  read.textContent = '–'; sub.textContent = 'Press Start level on a phone or tablet.';
  T.tests['bubble-level'] = function () {
    var f = [], u = up(0, 0), v = up(90, 0), a = flat(up(10, 0)), w = flat(up(0, 10));
    if (Math.abs(u.z - 1) > 1e-9 || Math.abs(v.y - 1) > 1e-9) f.push('up vector');
    if (Math.abs(a.tilt - 10) > 1e-6 || Math.abs(a.y - 10) > 1e-6) f.push('front-back ' + a.tilt);
    if (!(w.x < 0) || Math.abs(Math.abs(w.x) - 10) > 1e-6) f.push('left-right ' + w.x);
    if (Math.abs(edge(up(90, 0))) > 1e-6) f.push('edge upright');
    if (Math.abs(edge({ x: Math.sin(5 * D), y: Math.cos(5 * D) }) - 5) > 1e-6) f.push('edge 5°');
    if (Math.abs(edge({ x: -Math.cos(3 * D), y: Math.sin(3 * D) }) - 3) > 1e-6) f.push('edge landscape');
    if (Math.abs(edge({ x: Math.sin(5 * D) * -9.8, y: Math.cos(5 * D) * -9.8 }) - 5) > 1e-6) f.push('edge flipped sensor');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
