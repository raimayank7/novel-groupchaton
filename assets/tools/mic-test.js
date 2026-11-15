/* Infinity by GroupChatOn — mic-test. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Microphone test: live level meter in dB, waveform, which microphone is used and its settings, and a 5-second record-and-play-back check. */
GCOTools.register('mic-test', function (spot, T) {
  var h = T.h, status = T.status();
  function dbfs(rms) { return rms > 0 ? Math.max(-100, Math.round(20 * Math.log10(rms) * 10) / 10) : -100; }
  function word(db) { return db > -6 ? 'Very loud: may distort' : db > -30 ? 'Good level' : db > -50 ? 'Quiet: move closer or speak up' : 'Silent: nothing heard'; }
  var stream = null, ac = null, an = null, buf = null, raf = 0, peak = -100, peakAt = 0, heard = false;
  var level = h('div', { 'data-out': '', style: 'font:800 clamp(40px,12vw,64px)/1.1 var(--ui);text-align:center;font-variant-numeric:tabular-nums', text: 'Mic off' }), wordEl = h('div', { style: 'text-align:center;font-weight:700' });
  var bar = h('div', { style: 'position:relative;height:16px;border-radius:9px;background:var(--surface-2);overflow:hidden' }, [h('span', { style: 'position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,#22c55e,#eab308 75%,#ef4444)' }), h('span', { style: 'position:absolute;top:0;bottom:0;width:3px;left:0;background:var(--ink)' })]);
  var cv = h('canvas', { width: '800', height: '160', style: 'width:100%;height:110px;border-radius:12px;background:var(--bg);border:1px solid var(--line)', 'aria-label': 'Waveform' });
  var dev = h('select', { 'aria-label': 'Microphone', hidden: true }), facts = h('div', { 'class': 'tkv' }), play = h('audio', { controls: true, hidden: true, style: 'width:100%' });
  function friendly(e) { var n = e && e.name; return n === 'NotAllowedError' || n === 'SecurityError' ? 'Microphone access was blocked. Allow it from the 🔒 icon next to the web address (and in your system privacy settings), then try again.' : n === 'NotFoundError' ? 'No microphone was found. Plug one in or connect a headset, then try again.' : n === 'NotReadableError' ? 'The microphone is in use by another app or is disabled. Close other apps and try again.' : (e && e.message) || 'The microphone could not be started.'; }
  function loop() {
    raf = requestAnimationFrame(loop); an.getFloatTimeDomainData(buf);
    var s = 0, i; for (i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    var db = dbfs(Math.sqrt(s / buf.length)), now = performance.now();
    if (db > peak || now - peakAt > 1500) { peak = db; peakAt = now; }
    if (db > -50) heard = true;
    level.textContent = db.toFixed(0) + ' dB'; wordEl.textContent = word(db) + (heard ? ' · ✓ Your microphone works' : '');
    bar.firstChild.style.width = Math.max(0, (db + 70) / 70 * 100) + '%'; bar.lastChild.style.left = Math.max(0, (peak + 70) / 70 * 100) + '%';
    var g = cv.getContext('2d'); g.clearRect(0, 0, 800, 160); g.strokeStyle = '#22c55e'; g.lineWidth = 2; g.beginPath();
    for (i = 0; i < 800; i++) { var v = buf[Math.floor(i * buf.length / 800)]; if (i) g.lineTo(i, 80 - v * 76); else g.moveTo(i, 80 - v * 76); } g.stroke();
  }
  function showFacts() {
    var t = stream.getAudioTracks()[0], st = t.getSettings ? t.getSettings() : {};
    facts.innerHTML = '';
    [['Microphone', t.label || 'Default microphone'], ['Sample rate', (st.sampleRate || (ac && ac.sampleRate) || '?') + ' Hz'], ['Channels', String(st.channelCount || 1)], ['Echo cancellation', st.echoCancellation ? 'On' : 'Off'],
      ['Noise suppression', st.noiseSuppression ? 'On' : 'Off'], ['Auto gain', st.autoGainControl ? 'On' : 'Off']].forEach(function (r) { facts.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: String(r[1]) })])); });
  }
  function open(id) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return status.error('This browser cannot use a microphone. Use a recent Chrome, Edge, Firefox or Safari, on a secure (https) page.');
    close(); status.info('Asking for the microphone…');
    navigator.mediaDevices.getUserMedia({ audio: id ? { deviceId: { exact: id } } : true }).then(function (s) {
      stream = s; heard = false; ac = new (window.AudioContext || window.webkitAudioContext)(); an = ac.createAnalyser(); an.fftSize = 2048; buf = new Float32Array(an.fftSize); ac.createMediaStreamSource(s).connect(an);
      loop(); showFacts(); go.textContent = '■ Stop'; rec.disabled = !window.MediaRecorder; status.info('Say something or tap near the microphone…');
      navigator.mediaDevices.enumerateDevices().then(function (list) {
        var mics = list.filter(function (d) { return d.kind === 'audioinput'; }), cur = (s.getAudioTracks()[0].getSettings() || {}).deviceId;
        dev.innerHTML = ''; mics.forEach(function (d, i) { dev.appendChild(h('option', { value: d.deviceId, selected: d.deviceId === cur, text: d.label || 'Microphone ' + (i + 1) })); }); dev.hidden = mics.length < 2;
      });
    }, function (e) { status.error(friendly(e)); });
  }
  function close() { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); if (ac) ac.close(); stream = null; ac = null; go.textContent = '🎤 Test my microphone'; rec.disabled = true; level.textContent = 'Mic off'; }
  dev.addEventListener('change', function () { open(dev.value); });
  var go = T.button('🎤 Test my microphone', { primary: true, onclick: function () { stream ? close() : open(); } });
  var rec = T.button('Record 5 s and play back', { small: true, disabled: true, onclick: function () {
    var r = new MediaRecorder(stream), ch = []; r.ondataavailable = function (e) { if (e.data.size) ch.push(e.data); };
    r.onstop = function () { play.src = URL.createObjectURL(new Blob(ch, { type: r.mimeType || 'audio/webm' })); play.hidden = false; play.play().catch(function () {}); rec.disabled = false; status.ok('Listen back: this is how others hear you.'); };
    r.start(); rec.disabled = true; var n = 5; status.info('Recording… 5'); var t = setInterval(function () { n--; if (n > 0) status.info('Recording… ' + n); else { clearInterval(t); if (r.state !== 'inactive') r.stop(); } }, 1000);
  } });
  spot.appendChild(T.card([level, wordEl, bar, cv, T.row([go, rec]), status.el, dev, play, facts,
    h('p', { 'class': 'tnote', text: 'Normal speech at arm’s length shows about −30 to −15 dB. Everything is analysed on your device; nothing is recorded unless you press the 5-second test, and that stays on this page.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['mic-test'] = function () {
    var f = [];
    if (dbfs(1) !== 0 || dbfs(0.5) !== -6 || dbfs(0) !== -100 || dbfs(1e-9) !== -100) f.push('dBFS ' + dbfs(0.5));
    if (word(-3).indexOf('loud') < 0 || word(-20) !== 'Good level' || word(-40).indexOf('Quiet') !== 0 || word(-80).indexOf('Silent') !== 0) f.push('words');
    if (friendly({ name: 'NotFoundError' }).indexOf('No microphone') !== 0) f.push('friendly');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
