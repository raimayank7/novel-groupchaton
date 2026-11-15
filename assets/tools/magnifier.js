/* Infinity by GroupChatOn — magnifier. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Magnifier: the back camera as a magnifying glass, using the camera's own zoom where it has one, with torch, freeze and reading filters. */
GCOTools.register('magnifier', function (spot, T) {
  var h = T.h, status = T.status(), stream = null, track = null, caps = {}, frozen = false, torch = false;
  var video = h('video', { playsinline: true, autoplay: true, muted: true, 'aria-label': 'Magnified view', style: 'width:100%;height:100%;object-fit:cover;display:block;transform-origin:center' });
  video.muted = true;
  var box = h('div', { style: 'position:relative;overflow:hidden;border-radius:18px;background:#111;aspect-ratio:4/3;width:100%' }, [video]);
  var idle = h('div', { style: 'position:absolute;inset:0;display:grid;place-items:center;color:#ddd;text-align:center;padding:20px', text: '🔍 Press “Start magnifier” and allow the camera.' });
  box.appendChild(idle);
  var zoom = h('input', { type: 'range', min: '1', max: '8', step: '0.1', value: '2', 'aria-label': 'Zoom' }), read = h('div', { 'data-out': '', style: 'text-align:center;font-weight:700', text: '2× zoom' });
  var FILTERS = { normal: 'none', contrast: 'contrast(1.8) grayscale(1)', invert: 'invert(1) grayscale(1) contrast(1.6)', yellow: 'grayscale(1) contrast(1.6) sepia(1) saturate(4) hue-rotate(5deg)' }, filt = 'normal';
  // how much zoom comes from the camera itself and how much is enlarged on screen
  function plan(c, want) {
    if (c && c.max > 1) { var hw = Math.max(c.min || 1, Math.min(c.max, want)); return { hw: hw, css: Math.round(want / hw * 100) / 100 }; }
    return { hw: 0, css: want };
  }
  function why(e) {
    var n = e && e.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Camera permission was blocked. Allow the camera for this site in your browser settings, then press Start again.';
    if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No camera was found on this device.';
    if (n === 'NotReadableError') return 'The camera is busy in another app. Close that app and try again.';
    return 'The camera could not start: ' + ((e && e.message) || 'unknown problem') + '.';
  }
  function apply() {
    var p = plan(caps.zoom, +zoom.value);
    if (p.hw && track) track.applyConstraints({ advanced: [{ zoom: p.hw }] }).catch(function () {});
    video.style.transform = 'scale(' + p.css + ')'; video.style.filter = FILTERS[filt];
    read.textContent = (+zoom.value).toFixed(1).replace(/\.0$/, '') + '× zoom' + (p.hw ? ' (camera zoom ' + p.hw.toFixed(1).replace(/\.0$/, '') + '×)' : '');
  }
  function stop() { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; track = null; video.srcObject = null; idle.hidden = false; go.textContent = 'Start magnifier'; frozen = false; torch = false; }
  function start() {
    if (stream) { stop(); status.info('Magnifier stopped. The camera is off.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { status.error('This browser cannot open the camera here. Try Chrome, Safari or Edge on a phone.'); return; }
    status.info('Asking for the camera…');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }, audio: false }).then(function (s) {
      stream = s; track = s.getVideoTracks()[0]; caps = (track.getCapabilities && track.getCapabilities()) || {};
      video.srcObject = s; idle.hidden = true; go.textContent = 'Stop'; apply();
      var p = video.play(); if (p && p.catch) p.catch(function () {});
      status.ok('Magnifier is on.' + (caps.torch ? ' Your phone light can be turned on below.' : ''));
    }, function (e) { status.error(why(e)); });
  }
  function light() {
    if (!track) { status.error('Start the magnifier first.'); return; }
    if (!caps.torch) { status.info('This camera or browser cannot switch on the phone light. Try the Screen Light tool or a lamp.'); return; }
    torch = !torch; track.applyConstraints({ advanced: [{ torch: torch }] }).catch(function () { status.error('The light could not be switched on.'); });
  }
  function freeze() { if (!stream) { status.error('Start the magnifier first.'); return; } frozen = !frozen; if (frozen) { video.pause(); status.info('Picture frozen: read it comfortably, then tap Freeze again.'); } else { video.play(); status.clear(); } }
  var go = T.button('Start magnifier', { primary: true, onclick: start });
  zoom.addEventListener('input', apply);
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', function () { if (document.hidden && stream) stop(); });
  spot.appendChild(T.card([box, read, T.field('Zoom', zoom),
    T.seg([['normal', 'Normal'], ['contrast', 'High contrast'], ['invert', 'White on black'], ['yellow', 'Yellow']], 'normal', function (v) { filt = v; apply(); }),
    T.row([go, T.button('Freeze', { small: true, onclick: freeze }), T.button('Light', { small: true, onclick: light })]), status.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['magnifier'] = function () {
    var f = [], a = plan({ min: 1, max: 4 }, 6), b = plan(null, 3), c = plan({ min: 1, max: 10 }, 2.5);
    if (a.hw !== 4 || a.css !== 1.5) f.push('hw ' + JSON.stringify(a));
    if (b.hw !== 0 || b.css !== 3) f.push('digital');
    if (c.hw !== 2.5 || c.css !== 1) f.push('all camera');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
