/* Infinity by GroupChatOn — voice-recorder. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Voice recorder: records the microphone in the browser (MediaRecorder), with pause, a level meter, playback, and download as the browser's format or WAV. */
GCOTools.register('voice-recorder', function (spot, T) {
  var h = T.h, status = T.status();
  function pickMime(ok, list) { for (var i = 0; i < list.length; i++) if (ok(list[i])) return list[i]; return ''; }
  function ext(m) { return /mp4|aac/.test(m) ? 'm4a' : /ogg/.test(m) ? 'ogg' : /wav/.test(m) ? 'wav' : 'webm'; }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + p2(s % 60); }
  function wav(chs, sr) {
    var n = chs[0].length, nc = chs.length, v = new DataView(new ArrayBuffer(44 + n * nc * 2)), o = 44;
    function str(at, s) { for (var i = 0; i < s.length; i++) v.setUint8(at + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + n * nc * 2, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nc, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * nc * 2, true); v.setUint16(32, nc * 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * nc * 2, true);
    for (var i = 0; i < n; i++) for (var c = 0; c < nc; c++) { var x = Math.max(-1, Math.min(1, chs[c][i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); o += 2; }
    return new Blob([v.buffer], { type: 'audio/wav' });
  }
  function friendly(e) {
    var n = e && e.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Microphone access was blocked. Allow it from the 🔒 icon next to the web address, then press Start again.';
    if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No microphone was found. Plug one in (or connect your headset) and try again.';
    if (n === 'NotReadableError') return 'The microphone is busy in another app (a call or another tab). Close it and try again.';
    return (e && e.message) || 'The microphone could not be started.';
  }
  var MIMES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/aac'];
  var stream = null, rec = null, chunks = [], acc = 0, t0 = 0, ac = null, an = null, buf = null, timer = 0, items = [], n = 0;
  var big = h('div', { 'data-out': '', style: 'font:800 clamp(48px,15vw,80px)/1.1 var(--ui);text-align:center;font-variant-numeric:tabular-nums', text: '0:00' });
  var meter = h('div', { style: 'height:12px;border-radius:9px;background:var(--surface-2);overflow:hidden', 'aria-hidden': 'true' }, [h('span', { style: 'display:block;height:100%;width:0;background:linear-gradient(90deg,#22c55e,#eab308 70%,#ef4444);transition:width .08s' })]);
  var ec = h('input', { type: 'checkbox', checked: true }), ns = h('input', { type: 'checkbox', checked: true });
  var startB = T.button('● Start recording', { primary: true, onclick: start }), pauseB = T.button('Pause', { disabled: true, onclick: pause }), stopB = T.button('■ Stop', { disabled: true, onclick: stop });
  var list = h('div', { 'class': 'tlist' });
  function elapsed() { return acc + (rec && rec.state === 'recording' ? (Date.now() - t0) / 1000 : 0); }
  function loop() {
    big.textContent = clock(elapsed());
    if (an) { an.getFloatTimeDomainData(buf); var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i]; var db = 20 * Math.log10(Math.sqrt(s / buf.length) || 1e-5); meter.firstChild.style.width = Math.max(0, Math.min(100, (db + 60) / 60 * 100)) + '%'; }
  }
  function start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) return status.error('This browser cannot record audio. Use a recent Chrome, Edge, Firefox or Safari, on a secure (https) page.');
    status.info('Asking for the microphone…');
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: ec.checked, noiseSuppression: ns.checked, autoGainControl: true } }).then(function (s) {
      stream = s; chunks = []; acc = 0;
      var mime = pickMime(function (m) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m); }, MIMES);
      rec = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = done;
      rec.start(1000); t0 = Date.now();
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); an = ac.createAnalyser(); an.fftSize = 2048; buf = new Float32Array(an.fftSize); ac.createMediaStreamSource(s).connect(an); } catch (e) { an = null; }
      timer = setInterval(loop, 80);
      startB.disabled = true; pauseB.disabled = stopB.disabled = false; pauseB.textContent = 'Pause'; status.info('🔴 Recording… speak now.');
    }, function (e) { status.error(friendly(e)); });
  }
  function pause() {
    if (!rec) return;
    if (rec.state === 'recording') { rec.pause(); acc += (Date.now() - t0) / 1000; pauseB.textContent = 'Resume'; status.info('Paused.'); }
    else if (rec.state === 'paused') { rec.resume(); t0 = Date.now(); pauseB.textContent = 'Pause'; status.info('🔴 Recording…'); }
  }
  function stop() { if (rec && rec.state !== 'inactive') { if (rec.state === 'recording') acc += (Date.now() - t0) / 1000; rec.stop(); } }
  function done() {
    clearInterval(timer); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); if (ac) ac.close(); an = null; meter.firstChild.style.width = '0';
    var type = (rec && rec.mimeType) || 'audio/webm', blob = new Blob(chunks, { type: type }), d = new Date();
    var it = { blob: blob, dur: acc, name: 'recording-' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '-' + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds()) + '.' + ext(type), url: URL.createObjectURL(blob), saved: false };
    items.unshift(it); n++; rec = null; startB.disabled = false; pauseB.disabled = stopB.disabled = true; big.textContent = clock(acc);
    status.ok('Saved recording ' + n + ' (' + clock(acc) + ', ' + T.bytes(blob.size) + '). Download it to keep it: recordings vanish when you close the page.'); draw();
  }
  function toWav(it, btn) {
    btn.disabled = true; btn.textContent = 'Converting…';
    it.blob.arrayBuffer().then(function (ab) { var c = new (window.AudioContext || window.webkitAudioContext)(); return c.decodeAudioData(ab).then(function (b) { c.close(); return b; }); }).then(function (b) {
      var chs = []; for (var i = 0; i < b.numberOfChannels; i++) chs.push(b.getChannelData(i));
      T.download(wav(chs, b.sampleRate), it.name.replace(/\.\w+$/, '.wav')); it.saved = true; btn.textContent = 'Save as WAV'; btn.disabled = false;
    }).catch(function () { btn.textContent = 'Save as WAV'; btn.disabled = false; status.error('This browser could not convert the recording to WAV. Download the original instead.'); });
  }
  function draw() {
    list.innerHTML = '';
    items.forEach(function (it, i) {
      var w = T.button('Save as WAV', { small: true, onclick: function () { toWav(it, w); } });
      list.appendChild(h('div', { style: 'display:grid;gap:8px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--bg)' }, [
        h('b', { text: it.name, style: 'overflow-wrap:anywhere' }), h('small', { text: clock(it.dur) + ' · ' + T.bytes(it.blob.size), style: 'color:var(--muted)' }),
        h('audio', { controls: true, src: it.url, preload: 'metadata', style: 'width:100%' }),
        T.row([T.button('Download', { small: true, primary: true, onclick: function () { T.download(it.blob, it.name); it.saved = true; } }), w,
          T.button('Delete', { small: true, onclick: function () { URL.revokeObjectURL(it.url); items.splice(i, 1); draw(); } })])]));
    });
  }
  window.addEventListener('beforeunload', function (e) { if (items.some(function (x) { return !x.saved; }) || rec) { e.preventDefault(); e.returnValue = ''; } });
  spot.appendChild(T.card([big, meter, T.row([startB, pauseB, stopB]), status.el,
    T.row([h('label', { 'class': 'tcheck' }, [ec, ' Echo cancellation']), h('label', { 'class': 'tcheck' }, [ns, ' Noise reduction'])]), list,
    h('p', { 'class': 'tnote', text: 'Your voice is recorded inside this browser and is never uploaded. Turn off noise reduction for music. The microphone switches off as soon as you press Stop.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['voice-recorder'] = function () {
    var f = [];
    if (pickMime(function (m) { return m === 'audio/mp4'; }, MIMES) !== 'audio/mp4' || pickMime(function () { return false; }, MIMES) !== '') f.push('mime choice');
    if (ext('audio/webm;codecs=opus') !== 'webm' || ext('audio/mp4') !== 'm4a' || ext('audio/ogg;codecs=opus') !== 'ogg') f.push('extensions');
    if (clock(75.9) !== '1:15' || clock(-1) !== '0:00') f.push('clock');
    var b = wav([new Float32Array(8000)], 8000);
    if (b.size !== 16044) f.push('wav size ' + b.size);
    if (friendly({ name: 'NotFoundError' }).indexOf('No microphone') !== 0) f.push('friendly error');
    return b.slice(0, 4).text().then(function (t) { if (t !== 'RIFF') f.push('wav header'); return { ok: !f.length, n: 6, fails: f }; });
  };
});
