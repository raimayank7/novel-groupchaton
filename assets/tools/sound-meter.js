/* Infinity by GroupChatOn — sound-meter. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Sound level meter: an estimate of loudness in decibels from the microphone, with min, max and average, and a scale of everyday sounds. */
GCOTools.register('sound-meter', function (spot, T) {
  var h = T.h, status = T.status(), stream = null, ctx = null, raf = 0, hist = [], stats = null;
  var off = T.store.get('snd-offset', 100);
  var SCALE = [[30, 'Whisper, quiet bedroom'], [40, 'Quiet library'], [50, 'Quiet office, rain'], [60, 'Normal conversation'], [70, 'Busy traffic, vacuum cleaner'], [85, 'Heavy traffic: hearing risk after 8 hours'], [100, 'Motorbike, loud music: limit to minutes'], [110, 'Concert, car horn up close'], [120, 'Thunder, siren: painful']];
  function dbfs(buf) { var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i]; var r = Math.sqrt(s / buf.length); return r > 0 ? 20 * Math.log10(r) : -120; }
  function label(db) { var t = 'Very quiet'; SCALE.forEach(function (x) { if (db >= x[0] - 5) t = x[1]; }); return db >= 85 ? '⚠️ Loud — ' + t : t; }
  function leq(list) { if (!list.length) return 0; var s = 0; list.forEach(function (d) { s += Math.pow(10, d / 10); }); return 10 * Math.log10(s / list.length); }
  var read = h('div', { 'data-out': '', 'aria-live': 'off', style: 'text-align:center;font:800 64px/1.1 var(--ui);font-variant-numeric:tabular-nums', text: '– dB' });
  var what = h('p', { 'class': 'tnote', style: 'text-align:center;font-weight:600' });
  var meter = h('div', { 'class': 'tmeter', style: 'height:14px' }, [h('span')]);
  var graph = h('canvas', { width: '600', height: '120', 'aria-label': 'Loudness over the last minute', style: 'width:100%;height:120px;border-radius:12px;background:var(--bg);border:1px solid var(--line)' });
  var box = h('div', { 'class': 'tstats' });
  var cal = h('input', { type: 'number', value: String(off), step: '1', 'aria-label': 'Calibration offset' });
  function showStats() {
    box.innerHTML = '';
    var s = stats || { min: null, max: null, list: [] };
    [['Now', s.now], ['Lowest', s.min], ['Highest', s.max], ['Average', s.list.length ? leq(s.list) : null]].forEach(function (x) {
      box.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: x[1] == null ? '–' : Math.round(x[1]) + ' dB' }), h('span', { text: x[0] })]));
    });
  }
  function plot() {
    var g = graph.getContext('2d'), W = 600, H = 120; g.clearRect(0, 0, W, H);
    g.strokeStyle = 'rgba(128,128,128,.35)'; g.lineWidth = 1;
    [40, 60, 80, 100].forEach(function (d) { var y = H - (d - 20) / 100 * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); });
    g.strokeStyle = '#0ea5e9'; g.lineWidth = 2; g.beginPath();
    hist.forEach(function (d, i) { var x = W - (hist.length - 1 - i) * (W / 300), y = H - Math.max(0, Math.min(1, (d - 20) / 100)) * H; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    g.stroke();
  }
  function stop() {
    cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null;
    if (ctx) { ctx.close().catch(function () {}); ctx = null; } go.textContent = 'Start measuring';
  }
  function start() {
    if (stream) { stop(); status.info('Stopped. The microphone is off.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) { status.error('This browser cannot use the microphone here. Try Chrome, Safari or Edge.'); return; }
    status.info('Asking for the microphone…');
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false }).then(function (s) {
      stream = s; ctx = new (window.AudioContext || window.webkitAudioContext)();
      var an = ctx.createAnalyser(); an.fftSize = 2048; ctx.createMediaStreamSource(s).connect(an);
      var buf = new Float32Array(an.fftSize), lastT = 0; stats = { min: null, max: null, list: [] }; hist = [];
      go.textContent = 'Stop'; status.ok('Measuring. Nothing is recorded or uploaded.');
      (function loop(t) {
        raf = requestAnimationFrame(loop);
        an.getFloatTimeDomainData(buf);
        var db = Math.max(0, dbfs(buf) + off);
        if (t - lastT < 200) return; lastT = t;
        stats.now = db; stats.min = stats.min == null ? db : Math.min(stats.min, db); stats.max = stats.max == null ? db : Math.max(stats.max, db);
        stats.list.push(db); if (stats.list.length > 3000) stats.list.shift();
        hist.push(db); if (hist.length > 300) hist.shift();
        read.textContent = Math.round(db) + ' dB'; what.textContent = label(db);
        meter.firstChild.style.width = Math.max(0, Math.min(100, (db - 20))) + '%'; meter.firstChild.style.backgroundColor = db >= 85 ? '#dc2626' : db >= 70 ? '#f59e0b' : '#16a34a';
        showStats(); plot();
      })(0);
    }, function (e) {
      var n = e && e.name;
      status.error(n === 'NotAllowedError' || n === 'SecurityError' ? 'Microphone permission was blocked. Allow the microphone for this site in your browser settings, then try again.'
        : n === 'NotFoundError' ? 'No microphone was found on this device.' : 'The microphone could not start: ' + ((e && e.message) || 'unknown problem') + '.');
    });
  }
  cal.addEventListener('change', function () { off = +cal.value || 100; T.store.set('snd-offset', off); });
  var go = T.button('Start measuring', { primary: true, onclick: start });
  window.addEventListener('pagehide', stop);
  spot.appendChild(T.card([read, what, meter, T.row([go, T.button('Reset', { small: true, onclick: function () { stats = stream ? { min: null, max: null, list: [] } : null; hist = []; showStats(); plot(); } })]), status.el, box, graph,
    h('details', {}, [h('summary', { text: 'Calibrate (optional)' }), h('p', { 'class': 'tnote', text: 'Phone microphones are not calibrated, so readings are estimates (often within 5–10 dB). If you have a real sound meter, play a steady sound, then change this number until both match.' }), T.field('Offset added to the microphone level', cal)]),
    h('div', { 'class': 'tkv' }, SCALE.map(function (x) { return h('div', {}, [h('b', { text: x[0] + ' dB' }), h('span', { text: x[1] }), h('span')]); }))]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  showStats(); plot();
  T.tests['sound-meter'] = function () {
    var f = [], n = 4800, s = new Float32Array(n);
    for (var i = 0; i < n; i++) s[i] = Math.sin(2 * Math.PI * 1000 * i / 48000);
    if (Math.abs(dbfs(s) + 3.0103) > 0.01) f.push('sine ' + dbfs(s));
    if (dbfs(new Float32Array(10)) !== -120) f.push('silence');
    if (!/Loud/.test(label(88)) || /Loud/.test(label(60))) f.push('labels');
    if (Math.abs(leq([60, 60]) - 60) > 1e-9 || Math.abs(leq([60, 70]) - 67.4) > 0.05) f.push('average ' + leq([60, 70]));
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
