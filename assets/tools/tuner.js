/* Infinity by GroupChatOn — tuner. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Instrument tuner: listens to the microphone and shows the note and how many cents sharp or flat (YIN pitch detection); guitar, bass, ukulele, violin and chromatic, with reference tones. */
GCOTools.register('tuner', function (spot, T) {
  var h = T.h, status = T.status();
  var NOTE = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  var INST = { chromatic: ['Chromatic (any note)', []], guitar: ['Guitar (E A D G B E)', ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']], bass: ['Bass (E A D G)', ['E1', 'A1', 'D2', 'G2']], ukulele: ['Ukulele (G C E A)', ['G4', 'C4', 'E4', 'A4']],
    violin: ['Violin (G D A E)', ['G3', 'D4', 'A4', 'E5']], dropd: ['Guitar drop D (D A D G B E)', ['D2', 'A2', 'D3', 'G3', 'B3', 'E4']], cello: ['Cello (C G D A)', ['C2', 'G2', 'D3', 'A3']] };
  function midiOf(name) { var m = String(name).match(/^([A-G])([♯#]?)(-?\d)$/); if (!m) return NaN; return 12 * (+m[3] + 1) + [0, 2, 4, 5, 7, 9, 11]['CDEFGAB'.indexOf(m[1])] + (m[2] ? 1 : 0); }
  function freqOf(midi, a4) { return (a4 || 440) * Math.pow(2, (midi - 69) / 12); }
  function noteOf(f, a4) { var n = 12 * Math.log2(f / (a4 || 440)) + 69, r = Math.round(n); return { midi: r, name: NOTE[(r % 12 + 12) % 12] + (Math.floor(r / 12) - 1), cents: Math.round((n - r) * 100) }; }
  function detect(buf, sr) {   // YIN
    var n = buf.length, rms = 0, i, t;
    for (i = 0; i < n; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / n) < 0.01) return -1;
    var maxT = Math.min(Math.floor(n / 2), Math.floor(sr / 27)), minT = Math.max(2, Math.floor(sr / 1500)), W = n - maxT - 1, c = new Float32Array(maxT + 2), run = 0;
    c[0] = 1;
    for (t = 1; t <= maxT + 1; t++) { var s = 0; for (i = 0; i < W; i++) { var x = buf[i] - buf[i + t]; s += x * x; } run += s; c[t] = run ? s * t / run : 1; }
    var tau = -1;
    for (t = minT; t <= maxT; t++) if (c[t] < 0.12) { while (t + 1 <= maxT && c[t + 1] < c[t]) t++; tau = t; break; }
    if (tau < 0) { var best = minT; for (t = minT; t <= maxT; t++) if (c[t] < c[best]) best = t; if (c[best] > 0.3) return -1; tau = best; }
    var a = c[tau - 1], b = c[tau], d = c[tau + 1], den = a + d - 2 * b, better = den ? tau + (a - d) / (2 * den) : tau;
    return sr / better;
  }
  var inst = T.select(Object.keys(INST).map(function (k) { return [k, INST[k][0]]; }), T.store.get('tuner-inst', 'guitar')), a4 = h('input', { type: 'number', min: '415', max: '466', value: String(T.store.get('tuner-a4', 440)) });
  var noteEl = h('div', { 'data-out': '', style: 'font:800 clamp(56px,18vw,96px)/1 var(--ui);text-align:center', text: '–' }), hz = h('div', { style: 'text-align:center;color:var(--ink-soft);font-variant-numeric:tabular-nums', text: 'Press Start and play a note' });
  var needle = h('span', { style: 'position:absolute;top:-6px;bottom:-6px;width:4px;left:calc(50% - 2px);border-radius:4px;background:var(--ink);transition:left .12s' });
  var scale = h('div', { style: 'position:relative;height:18px;border-radius:9px;background:linear-gradient(90deg,#ef4444,#f59e0b 35%,#22c55e 45%,#22c55e 55%,#f59e0b 65%,#ef4444)' }, [needle, h('span', { style: 'position:absolute;left:50%;top:-10px;bottom:-10px;border-left:2px dashed rgba(0,0,0,.5)' })]);
  var hint = h('div', { style: 'text-align:center;font:700 18px/1.3 var(--ui);min-height:24px' }), strings = h('div', { 'class': 'trow' });
  var stream = null, ac = null, an = null, buf = null, raf = 0, hist = [], frame = 0;
  var ref = null;
  function tone(f) {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume(); } catch (e) { return; }
    if (ref) try { ref.stop(); } catch (e) {}
    var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 2.3); ref = o;
  }
  function drawStrings(active) {
    strings.innerHTML = '';
    INST[inst.value][1].forEach(function (s) {
      var m = midiOf(s);
      strings.appendChild(h('button', { type: 'button', 'class': 'tbtn tbtn-sm' + (m === active ? ' tbtn-primary' : ''), title: 'Play a ' + s + ' reference tone', text: s.replace(/\d/, '') + '‎' + s.slice(-1).replace(/[^\d]/, ''), onclick: function () { tone(freqOf(m, +a4.value)); } }));
    });
  }
  function nearest(f) { var list = INST[inst.value][1]; if (!list.length) return null; var best = null; list.forEach(function (s) { var m = midiOf(s), d = Math.abs(12 * Math.log2(f / freqOf(m, +a4.value))); if (!best || d < best.d) best = { m: m, s: s, d: d }; }); return best; }
  function show(f) {
    var A = +a4.value || 440, near = nearest(f), target = near ? near.m : noteOf(f, A).midi, cents = Math.round(1200 * Math.log2(f / freqOf(target, A)));
    var nm = near ? near.s : noteOf(f, A).name, ok = Math.abs(cents) <= 5;
    noteEl.textContent = nm.replace(/-?\d+$/, ''); noteEl.style.color = ok ? '#16a34a' : 'var(--ink)';
    hz.textContent = f.toFixed(1) + ' Hz · ' + nm + ' · ' + (cents > 0 ? '+' : '') + cents + ' cents';
    needle.style.left = 'calc(' + (50 + Math.max(-50, Math.min(50, cents))) + '% - 2px)';
    hint.textContent = ok ? '✓ In tune' : Math.abs(cents) > 50 ? (cents > 0 ? 'Much too high: loosen' : 'Much too low: tighten') : cents > 0 ? '↓ A little sharp: loosen slightly' : '↑ A little flat: tighten slightly';
    drawStrings(near ? near.m : -1);
  }
  function loop() {
    raf = requestAnimationFrame(loop);
    if (++frame % 3) return;
    an.getFloatTimeDomainData(buf);
    var f = detect(buf, ac.sampleRate);
    if (f > 0) { hist.push(f); hist = hist.slice(-5); var s = hist.slice().sort(function (a, b) { return a - b; }); show(s[Math.floor(s.length / 2)]); }
  }
  var go = T.button('🎤 Start tuner', { primary: true, onclick: function () {
    if (stream) { cancelAnimationFrame(raf); stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; go.textContent = '🎤 Start tuner'; hint.textContent = ''; return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return status.error('This browser cannot use the microphone. Use a recent Chrome, Edge, Firefox or Safari, on a secure (https) page.');
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (s) {
      stream = s; ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume();
      an = ac.createAnalyser(); an.fftSize = 4096; buf = new Float32Array(an.fftSize); ac.createMediaStreamSource(s).connect(an);
      go.textContent = '■ Stop'; status.clear(); hz.textContent = 'Listening… play one string at a time.'; loop();
    }, function (e) { status.error(e && e.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it from the 🔒 icon next to the web address, then press Start again.' : e && e.name === 'NotFoundError' ? 'No microphone was found.' : (e && e.message) || 'The microphone could not be started.'); });
  } });
  inst.addEventListener('change', function () { T.store.set('tuner-inst', inst.value); drawStrings(-1); });
  a4.addEventListener('change', function () { T.store.set('tuner-a4', +a4.value || 440); });
  spot.appendChild(T.card([noteEl, hz, scale, hint, T.row([go]), status.el, h('div', { 'class': 'tgrid2' }, [T.field('Instrument', inst), T.field('Reference A4 (Hz)', a4)]),
    h('div', {}, [h('span', { 'class': 'tfield-label', text: 'Tap a string to hear its note' }), strings]),
    h('p', { 'class': 'tnote', text: 'Hold the phone or laptop close to the instrument in a quiet room. The sound is analysed on your device and never recorded or uploaded.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  drawStrings(-1);
  T.tests.tuner = function () {
    var f = [], sr = 44100;
    function wave(fr, kind) { var b = new Float32Array(4096); for (var i = 0; i < b.length; i++) { var ph = (fr * i / sr) % 1; b[i] = 0.5 * (kind === 'saw' ? 2 * ph - 1 : Math.sin(2 * Math.PI * ph)); } return b; }
    var a = noteOf(440); if (a.name !== 'A4' || a.cents !== 0) f.push('A4');
    var e = noteOf(82.41); if (e.name !== 'E2' || Math.abs(e.cents) > 1) f.push('E2 ' + e.name + e.cents);
    if (noteOf(445).cents !== 20) f.push('445 Hz cents ' + noteOf(445).cents);
    if (midiOf('A4') !== 69 || midiOf('C♯4') !== 61 || Math.abs(freqOf(midiOf('E2')) - 82.41) > 0.01) f.push('midi');
    [[196, 'sine'], [110, 'saw'], [82.41, 'sine'], [659.26, 'sine']].forEach(function (w) { var d = detect(wave(w[0], w[1]), sr); if (Math.abs(d / w[0] - 1) > 0.005) f.push('detect ' + w[0] + ' got ' + d); });
    if (detect(new Float32Array(4096), sr) !== -1) f.push('silence');
    return Promise.resolve({ ok: !f.length, n: 9, fails: f });
  };
});
