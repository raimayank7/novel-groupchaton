/* Infinity by GroupChatOn — webcam-test. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Webcam test: see your camera live, its real resolution, aspect ratio, frame rate and name; switch cameras, mirror, take a test photo. */
GCOTools.register('webcam-test', function (spot, T) {
  var h = T.h, status = T.status();
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function aspect(w, hh) { if (!w || !hh) return '–'; var r = w / hh, known = [[16 / 9, '16:9'], [4 / 3, '4:3'], [16 / 10, '16:10'], [1, '1:1'], [3 / 2, '3:2'], [21 / 9, '21:9'], [9 / 16, '9:16'], [3 / 4, '3:4']]; for (var i = 0; i < known.length; i++) if (Math.abs(r - known[i][0]) < 0.02) return known[i][1]; var g = gcd(w, hh); return w / g + ':' + hh / g; }
  function mp(w, hh) { return (Math.round(w * hh / 1e5) / 10).toFixed(1) + ' MP'; }
  function label(hh) { return hh >= 2160 ? '4K' : hh >= 1440 ? '1440p' : hh >= 1080 ? '1080p Full HD' : hh >= 720 ? '720p HD' : hh >= 480 ? '480p' : hh + 'p'; }
  var video = h('video', { autoplay: true, playsinline: true, muted: true, style: 'width:100%;max-height:460px;border-radius:12px;background:#111;transform:scaleX(-1)' }); video.muted = true;
  var stats = h('div', { 'class': 'tstats', 'data-out': '' }), dev = h('select', { 'aria-label': 'Camera', hidden: true }), mirror = h('input', { type: 'checkbox', checked: true });
  var stream = null, fps = 0, frames = 0, fpsT = 0, results = (function (r) { var s = r.set; r.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; r.set = function (l, z) { s(l, z); var g = r.el.querySelector('.tresults-grid'); if (g) g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }; return r; })(T.results());
  mirror.addEventListener('change', function () { video.style.transform = mirror.checked ? 'scaleX(-1)' : ''; });
  function draw() {
    stats.innerHTML = '';
    if (!stream) return;
    var t = stream.getVideoTracks()[0], st = t.getSettings ? t.getSettings() : {}, w = video.videoWidth, hh = video.videoHeight;
    [[w + ' × ' + hh, 'Resolution'], [label(hh), 'Quality'], [aspect(w, hh), 'Aspect ratio'], [mp(w, hh), 'Megapixels'], [(fps || Math.round(st.frameRate || 0)) + ' fps', 'Frame rate'], [st.facingMode === 'environment' ? 'Back' : st.facingMode === 'user' ? 'Front' : 'Webcam', 'Camera type']]
      .forEach(function (r) { stats.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: r[0] }), h('span', { text: r[1] })])); });
    stats.appendChild(h('div', { 'class': 'tstat tstat-wide' }, [h('b', { text: t.label || 'Camera', style: 'font-size:16px' }), h('span', { text: 'Camera name' })]));
  }
  function countFps() {
    if (!stream) return;
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(function (now) { frames++; if (!fpsT) fpsT = now; if (now - fpsT > 1000) { fps = Math.round(frames * 1000 / (now - fpsT)); frames = 0; fpsT = now; draw(); } countFps(); });
  }
  function open(id, big) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return status.error('This browser cannot use a camera. Use a recent Chrome, Edge, Firefox or Safari, on a secure (https) page.');
    close(); status.info('Asking for the camera…');
    var v = { width: { ideal: big ? 3840 : 1920 }, height: { ideal: big ? 2160 : 1080 } }; if (id) v.deviceId = { exact: id };
    navigator.mediaDevices.getUserMedia({ video: v, audio: false }).then(function (s) {
      stream = s; video.srcObject = s; fps = 0; frames = 0; fpsT = 0; go.textContent = 'Turn camera off'; snap.disabled = max.disabled = false; status.ok('Your camera works ✓');
      video.onloadedmetadata = draw; countFps();
      navigator.mediaDevices.enumerateDevices().then(function (list) {
        var cams = list.filter(function (d) { return d.kind === 'videoinput'; }), cur = (s.getVideoTracks()[0].getSettings() || {}).deviceId;
        dev.innerHTML = ''; cams.forEach(function (d, i) { dev.appendChild(h('option', { value: d.deviceId, selected: d.deviceId === cur, text: d.label || 'Camera ' + (i + 1) })); }); dev.hidden = cams.length < 2;
      });
    }, function (e) {
      var n = e && e.name;
      status.error(n === 'NotAllowedError' || n === 'SecurityError' ? 'Camera access was blocked. Allow it from the 🔒 icon next to the web address (and in your system privacy settings), then try again.' : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'No camera was found. Connect a webcam or check that it is switched on.' : n === 'NotReadableError' ? 'The camera is in use by another app (a video call?) or blocked by a privacy switch. Close other apps and try again.' : (e && e.message) || 'The camera could not be started.');
    });
  }
  function close() { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; video.srcObject = null; go.textContent = '📷 Test my webcam'; snap.disabled = max.disabled = true; draw(); }
  dev.addEventListener('change', function () { open(dev.value); });
  var go = T.button('📷 Test my webcam', { primary: true, onclick: function () { stream ? close() : open(); } });
  var max = T.button('Try highest resolution', { small: true, disabled: true, onclick: function () { open(dev.value || null, true); } });
  var snap = T.button('Take a test photo', { small: true, disabled: true, onclick: function () {
    var c = h('canvas'); c.width = video.videoWidth; c.height = video.videoHeight; var g = c.getContext('2d'); if (mirror.checked) { g.translate(c.width, 0); g.scale(-1, 1); } g.drawImage(video, 0, 0);
    T.canvasBlob(c, 'image/jpeg', 0.92).then(function (b) { results.set([{ name: 'webcam-test.jpg', blob: b, preview: URL.createObjectURL(b), note: c.width + ' × ' + c.height }]); });
  } });
  spot.appendChild(T.card([video, T.row([go, snap, max]), status.el, dev, h('label', { 'class': 'tcheck' }, [mirror, ' Mirror the picture']), stats, results.el,
    h('p', { 'class': 'tnote', text: 'The camera turns on only when you press the button and off when you press it again or leave. The picture never leaves your device. Black picture? Check the camera’s privacy shutter or the camera key on your laptop.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['webcam-test'] = function () {
    var f = [];
    if (aspect(1920, 1080) !== '16:9' || aspect(640, 480) !== '4:3' || aspect(1280, 800) !== '16:10' || aspect(1000, 700) !== '10:7') f.push('aspect');
    if (mp(1920, 1080) !== '2.1 MP' || mp(3840, 2160) !== '8.3 MP') f.push('megapixels ' + mp(1920, 1080));
    if (label(720) !== '720p HD' || label(2160) !== '4K') f.push('label');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
