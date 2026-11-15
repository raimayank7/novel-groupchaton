/* Infinity by GroupChatOn — webcam-recorder. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Webcam recorder: record video with sound from your camera, take photos, switch front / back camera, choose 480p to 1080p. All in the browser. */
GCOTools.register('webcam-recorder', function (spot, T) {
  var h = T.h, status = T.status();
  function pickMime(ok, list) { for (var i = 0; i < list.length; i++) if (ok(list[i])) return list[i]; return ''; }
  function ext(m) { return /mp4/.test(m) ? 'mp4' : 'webm'; }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + p2(s % 60); }
  var SIZES = { 480: [640, 480], 720: [1280, 720], 1080: [1920, 1080] };
  function constraints(q, facing, audio) { var s = SIZES[q] || SIZES[720]; return { video: { width: { ideal: s[0] }, height: { ideal: s[1] }, facingMode: facing }, audio: !!audio }; }
  function friendly(e) {
    var n = e && e.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Camera access was blocked. Allow the camera (and microphone) from the 🔒 icon next to the web address, then try again.';
    if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No camera was found. Connect a webcam and try again.';
    if (n === 'NotReadableError') return 'The camera is busy in another app (a video call or another tab). Close it and try again.';
    return (e && e.message) || 'The camera could not be started.';
  }
  var MIMES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4;codecs=avc1,mp4a', 'video/mp4'];
  var video = h('video', { autoplay: true, playsinline: true, muted: true, style: 'width:100%;max-height:440px;border-radius:12px;background:#111;transform:scaleX(-1)' }); video.muted = true;
  var q = T.select([['480', '480p (small file)'], ['720', '720p HD'], ['1080', '1080p Full HD']], '720'), facing = 'user', audio = h('input', { type: 'checkbox', checked: true }), mirror = h('input', { type: 'checkbox', checked: true });
  var big = h('div', { 'data-out': '', style: 'font:700 22px/1.2 var(--ui);text-align:center;font-variant-numeric:tabular-nums', text: 'Camera off' });
  var stream = null, rec = null, chunks = [], t0 = 0, timer = 0, results = (function (r) { var s = r.set; r.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; r.set = function (l, z) { s(l, z); var g = r.el.querySelector('.tresults-grid'); if (g) g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }; return r; })(T.results()), made = [];
  var camB = T.button('Turn camera on', { primary: true, onclick: function () { stream ? off() : on(); } }), recB = T.button('● Record', { disabled: true, onclick: function () { rec ? rec.stop() : record(); } });
  var snapB = T.button('📷 Photo', { disabled: true, onclick: snap }), flipB = T.button('Switch camera', { small: true, disabled: true, onclick: function () { facing = facing === 'user' ? 'environment' : 'user'; off(); on(); } });
  mirror.addEventListener('change', function () { video.style.transform = mirror.checked ? 'scaleX(-1)' : ''; });
  function on() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return status.error('This browser cannot use the camera. Use a recent Chrome, Edge, Firefox or Safari, on a secure (https) page.');
    status.info('Asking for the camera…');
    navigator.mediaDevices.getUserMedia(constraints(q.value, facing, audio.checked)).then(function (s) {
      stream = s; video.srcObject = s; camB.textContent = 'Turn camera off'; recB.disabled = !window.MediaRecorder; snapB.disabled = false; flipB.disabled = false;
      video.onloadedmetadata = function () { big.textContent = 'Live: ' + video.videoWidth + ' × ' + video.videoHeight; };
      status.clear();
    }, function (e) { status.error(friendly(e)); });
  }
  function off() { if (rec) rec.stop(); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; video.srcObject = null; camB.textContent = 'Turn camera on'; recB.disabled = snapB.disabled = flipB.disabled = true; big.textContent = 'Camera off'; }
  function record() {
    var mime = pickMime(function (x) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x); }, MIMES);
    chunks = []; rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function () {
      clearInterval(timer); var type = rec.mimeType || 'video/webm', b = new Blob(chunks, { type: type.split(';')[0] }), secs = (Date.now() - t0) / 1000; rec = null;
      recB.textContent = '● Record'; big.textContent = stream ? 'Live: ' + video.videoWidth + ' × ' + video.videoHeight : 'Camera off';
      made.unshift({ name: 'webcam-video-' + Date.now() + '.' + ext(type), blob: b, icon: '🎬', note: clock(secs) }); results.set(made.slice(), 'webcam');
      status.ok('Video saved (' + clock(secs) + '). Download it below; it is not kept after you close the page.');
    };
    rec.start(1000); t0 = Date.now(); recB.textContent = '■ Stop'; timer = setInterval(function () { big.textContent = '🔴 ' + clock((Date.now() - t0) / 1000); }, 250);
  }
  function snap() {
    var c = h('canvas'); c.width = video.videoWidth; c.height = video.videoHeight; var g = c.getContext('2d');
    if (mirror.checked) { g.translate(c.width, 0); g.scale(-1, 1); }
    g.drawImage(video, 0, 0);
    T.canvasBlob(c, 'image/jpeg', 0.92).then(function (b) { made.unshift({ name: 'webcam-photo-' + Date.now() + '.jpg', blob: b, preview: URL.createObjectURL(b), note: c.width + ' × ' + c.height }); results.set(made.slice(), 'webcam'); });
  }
  spot.appendChild(T.card([video, big, T.row([camB, recB, snapB, flipB]), status.el, h('div', { 'class': 'tgrid2' }, [T.field('Quality', q)]),
    T.row([h('label', { 'class': 'tcheck' }, [audio, ' Record sound']), h('label', { 'class': 'tcheck' }, [mirror, ' Mirror (like a selfie)'])]), results.el,
    h('p', { 'class': 'tnote', text: 'The camera only turns on when you press the button, and turns off when you press it again or close the page. Videos and photos stay on your device until you download them.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  q.addEventListener('change', function () { if (stream) { off(); on(); } });
  T.tests['webcam-recorder'] = function () {
    var f = [], c = constraints('1080', 'environment', false);
    if (c.video.width.ideal !== 1920 || c.video.height.ideal !== 1080 || c.video.facingMode !== 'environment' || c.audio !== false) f.push('constraints');
    if (constraints('x', 'user', 1).video.width.ideal !== 1280) f.push('default 720p');
    if (pickMime(function (m) { return m === 'video/mp4'; }, MIMES) !== 'video/mp4') f.push('mime');
    if (friendly({ name: 'NotAllowedError' }).indexOf('blocked') < 0) f.push('friendly');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
