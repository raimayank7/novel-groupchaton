/* Infinity by GroupChatOn — mirror. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Mirror: the front camera shown mirrored like a real mirror, with zoom, brightness, a light ring and a photo. Nothing is recorded or sent. */
GCOTools.register('mirror', function (spot, T) {
  var h = T.h, status = T.status(), stream = null;
  var video = h('video', { playsinline: true, autoplay: true, muted: true, 'aria-label': 'Mirror', style: 'width:100%;height:100%;object-fit:cover;display:block;transform-origin:center' });
  video.muted = true;
  var box = h('div', { style: 'position:relative;overflow:hidden;border-radius:18px;background:#111;aspect-ratio:3/4;max-height:68vh;margin:0 auto;width:100%;max-width:520px;box-sizing:border-box' }, [video]);
  var idle = h('div', { style: 'position:absolute;inset:0;display:grid;place-items:center;color:#ddd;text-align:center;padding:20px', text: '🪞 Press “Open mirror” and allow the camera.' });
  box.appendChild(idle);
  var zoom = h('input', { type: 'range', min: '1', max: '3', step: '0.1', value: '1', 'aria-label': 'Zoom' });
  var bright = h('input', { type: 'range', min: '0.6', max: '1.8', step: '0.05', value: '1', 'aria-label': 'Brightness' });
  var flip = h('input', { type: 'checkbox', checked: true }), ring = h('input', { type: 'checkbox' });
  function css(mirrored, z, b) { return { transform: (mirrored ? 'scaleX(-1) ' : '') + 'scale(' + z + ')', filter: 'brightness(' + b + ')' }; }
  function why(e) {
    var n = e && e.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Camera permission was blocked. Allow the camera for this site in your browser settings, then press Open mirror again.';
    if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No camera was found on this device.';
    if (n === 'NotReadableError') return 'The camera is busy in another app. Close that app and try again.';
    return 'The camera could not start: ' + ((e && e.message) || 'unknown problem') + '.';
  }
  function apply() { var s = css(flip.checked, +zoom.value, +bright.value); video.style.transform = s.transform; video.style.filter = s.filter; box.style.boxShadow = ring.checked ? '0 0 0 18px #fff, 0 0 60px 30px rgba(255,255,255,.9)' : 'none'; box.style.margin = ring.checked ? '24px auto' : '0 auto'; }
  function stop() { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; video.srcObject = null; idle.hidden = false; startBtn.textContent = 'Open mirror'; }
  function start() {
    if (stream) { stop(); status.info('Mirror closed. The camera is off.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { status.error('This browser cannot open the camera here. Try Chrome, Safari or Edge on a phone or laptop.'); return; }
    status.info('Asking for the camera…');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } }, audio: false }).then(function (s) {
      stream = s; video.srcObject = s; idle.hidden = true; startBtn.textContent = 'Close mirror'; apply();
      var p = video.play(); if (p && p.catch) p.catch(function () {});
      status.ok('Mirror is on. Nothing is recorded or uploaded.');
    }, function (e) { status.error(why(e)); });
  }
  function photo() {
    if (!stream || !video.videoWidth) { status.error('Open the mirror first.'); return; }
    var c = h('canvas'), z = +zoom.value, w = video.videoWidth, hh = video.videoHeight; c.width = w; c.height = hh;
    var g = c.getContext('2d'); g.filter = 'brightness(' + bright.value + ')';
    g.translate(w / 2, hh / 2); if (flip.checked) g.scale(-1, 1); g.scale(z, z); g.drawImage(video, -w / 2, -hh / 2, w, hh);
    T.canvasBlob(c, 'image/jpeg', 0.92).then(function (b) { T.download(b, 'mirror-photo.jpg'); });
  }
  var startBtn = T.button('Open mirror', { primary: true, onclick: start });
  [zoom, bright, flip, ring].forEach(function (x) { x.addEventListener('input', apply); x.addEventListener('change', apply); });
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', function () { if (document.hidden && stream) { stop(); status.info('The mirror closed when you left the page, to keep your camera private.'); } });
  spot.appendChild(T.card([box, T.row([startBtn, T.button('Take a photo', { small: true, onclick: photo })]), status.el,
    h('div', { 'class': 'tgrid2' }, [T.field('Zoom', zoom), T.field('Brightness', bright)]),
    T.row([h('label', { 'class': 'tcheck' }, [flip, ' Mirror view (flip left and right)']), h('label', { 'class': 'tcheck' }, [ring, ' Light ring (lights your face in the dark)'])])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['mirror'] = function () {
    var f = [], a = css(true, 1.5, 1.2), b = css(false, 1, 1);
    if (a.transform !== 'scaleX(-1) scale(1.5)' || a.filter !== 'brightness(1.2)') f.push('css ' + JSON.stringify(a));
    if (b.transform !== 'scale(1)') f.push('plain');
    if (!/blocked/.test(why({ name: 'NotAllowedError' })) || !/No camera/.test(why({ name: 'NotFoundError' }))) f.push('messages');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
