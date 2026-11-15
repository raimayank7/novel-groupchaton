/* Infinity by GroupChatOn — tone-generator. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Tone generator: sine, square, triangle or sawtooth from 20 Hz to 20 kHz, left / right balance, sweeps, musical notes, and WAV download. */
GCOTools.register('tone-generator', function (spot, T) {
  var h = T.h, status = T.status();
  function noteFreq(n) { var m = String(n).match(/^([A-G])(#?)(-?\d)$/); if (!m) return NaN; var midi = 12 * (+m[3] + 1) + [0, 2, 4, 5, 7, 9, 11]['CDEFGAB'.indexOf(m[1])] + (m[2] ? 1 : 0); return Math.round(440 * Math.pow(2, (midi - 69) / 12) * 100) / 100; }
  function toSlider(f) { return Math.round(Math.log(f / 20) / Math.log(1000) * 1000); }
  function fromSlider(v) { return Math.round(20 * Math.pow(1000, v / 1000) * 10) / 10; }
  function gen(type, f, sec, sr, vol) {
    var n = Math.round(sec * sr), x = new Float32Array(n), fade = Math.min(n / 2, Math.round(sr * 0.01));
    for (var i = 0; i < n; i++) {
      var ph = (f * i / sr) % 1, v = type === 'square' ? (ph < 0.5 ? 1 : -1) : type === 'triangle' ? 1 - 4 * Math.abs(ph - 0.5) : type === 'sawtooth' ? 2 * ph - 1 : Math.sin(2 * Math.PI * ph);
      x[i] = v * vol * Math.min(1, i / fade, (n - 1 - i) / fade);
    }
    return x;
  }
  function wav(x, sr) {
    var n = x.length, v = new DataView(new ArrayBuffer(44 + n * 2));
    function str(at, s) { for (var i = 0; i < s.length; i++) v.setUint8(at + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) { var s = Math.max(-1, Math.min(1, x[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Blob([v.buffer], { type: 'audio/wav' });
  }
  var freq = h('input', { type: 'number', min: '1', max: '22000', step: 'any', value: '440' }), slide = h('input', { type: 'range', min: '0', max: '1000', value: String(toSlider(440)), 'aria-label': 'Frequency' });
  var wave = T.seg([['sine', 'Sine'], ['square', 'Square'], ['triangle', 'Triangle'], ['sawtooth', 'Sawtooth']], 'sine', function () { if (osc) osc.type = wave.value(); });
  var vol = h('input', { type: 'range', min: '0', max: '100', value: '25', 'aria-label': 'Volume' }), pan = T.seg([['-1', 'Left'], ['0', 'Both'], ['1', 'Right']], '0', function () { if (pn) pn.pan.value = +pan.value(); });
  var big = h('div', { 'data-out': '', style: 'font:800 clamp(44px,13vw,72px)/1.1 var(--ui);text-align:center;font-variant-numeric:tabular-nums' });
  var ac = null, osc = null, gain = null, pn = null;
  function f() { return Math.max(1, Math.min(22000, +freq.value || 440)); }
  function show() { big.textContent = (f() >= 1000 ? (f() / 1000).toFixed(f() % 1000 ? 2 : 0) + ' kHz' : f() + ' Hz'); }
  function update() { show(); if (osc) osc.frequency.setTargetAtTime(f(), ac.currentTime, 0.01); if (gain) gain.gain.setTargetAtTime(Math.pow(vol.value / 100, 2), ac.currentTime, 0.02); }
  freq.addEventListener('input', function () { slide.value = toSlider(f()); update(); }); slide.addEventListener('input', function () { freq.value = fromSlider(+slide.value); update(); }); vol.addEventListener('input', update);
  function stop() { if (osc) { var o = osc; gain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.02); setTimeout(function () { try { o.stop(); } catch (e) {} }, 120); osc = null; } play.textContent = '▶ Play'; }
  function start(from, to, secs) {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume(); } catch (e) { return status.error('This browser cannot play generated sound.'); }
    stop(); osc = ac.createOscillator(); gain = ac.createGain(); osc.type = wave.value(); osc.frequency.value = from || f();
    gain.gain.value = 0.0001; gain.gain.setTargetAtTime(Math.pow(vol.value / 100, 2), ac.currentTime, 0.02);
    var node = osc; node.connect(gain);
    if (ac.createStereoPanner) { pn = ac.createStereoPanner(); pn.pan.value = +pan.value(); gain.connect(pn); pn.connect(ac.destination); } else gain.connect(ac.destination);
    osc.start();
    if (to) { osc.frequency.setValueAtTime(from, ac.currentTime); osc.frequency.exponentialRampToValueAtTime(to, ac.currentTime + secs); var me = osc; setTimeout(function () { if (osc === me) stop(); }, secs * 1000 + 50); }
    play.textContent = '■ Stop';
  }
  var play = T.button('▶ Play', { primary: true, onclick: function () { osc ? stop() : start(); } });
  var notes = T.row([['A4', 'A 440'], ['C4', 'Middle C'], ['E2', 'Low E'], ['1000', '1 kHz'], ['100', '100 Hz'], ['10000', '10 kHz']].map(function (n) {
    return T.button(n[1], { small: true, onclick: function () { freq.value = /^\d/.test(n[0]) ? n[0] : noteFreq(n[0]); slide.value = toSlider(f()); update(); } });
  }).concat([T.button('½ octave down', { small: true, onclick: function () { freq.value = Math.round(f() / 2 * 100) / 100; slide.value = toSlider(f()); update(); } }), T.button('Octave up', { small: true, onclick: function () { freq.value = Math.round(f() * 2 * 100) / 100; slide.value = toSlider(f()); update(); } })]));
  var sFrom = h('input', { type: 'number', min: '20', max: '20000', value: '20' }), sTo = h('input', { type: 'number', min: '20', max: '20000', value: '20000' }), sSec = h('input', { type: 'number', min: '1', max: '120', value: '20' });
  var secs = h('input', { type: 'number', min: '1', max: '600', value: '10' });
  spot.appendChild(T.card([big, T.field('Frequency (Hz)', freq), slide, notes, T.field('Wave shape', wave), h('div', { 'class': 'tgrid2' }, [T.field('Volume', vol), T.field('Speaker', pan)]), T.row([play]), status.el,
    h('h3', { text: 'Sweep' }), h('div', { 'class': 'tgrid2' }, [T.field('From (Hz)', sFrom), T.field('To (Hz)', sTo), T.field('Over (seconds)', sSec)]),
    T.row([T.button('▶ Play sweep', { small: true, onclick: function () { var a = Math.max(20, +sFrom.value || 20), b = Math.max(20, +sTo.value || 20000); start(a, b, Math.max(1, Math.min(120, +sSec.value || 20))); } })]),
    h('h3', { text: 'Download as WAV' }), h('div', { 'class': 'tgrid2' }, [T.field('Length (seconds)', secs)]),
    T.row([T.button('Download WAV', { small: true, onclick: function () { var s = Math.max(1, Math.min(600, +secs.value || 10)); T.download(wav(gen(wave.value(), f(), s, 44100, Math.pow(vol.value / 100, 2) || 0.1), 44100), 'tone-' + f() + 'hz-' + wave.value() + '-' + s + 's.wav'); } })]),
    h('p', { 'class': 'tnote', text: '⚠ Start with low volume, especially with headphones. Very high and very low tones can be hard to hear but still loud: protect your ears and your speakers.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  show();
  T.tests['tone-generator'] = function () {
    var fl = [];
    if (noteFreq('A4') !== 440 || noteFreq('C4') !== 261.63 || noteFreq('A#3') !== 233.08 || noteFreq('E2') !== 82.41) fl.push('note frequencies');
    if (fromSlider(0) !== 20 || fromSlider(1000) !== 20000 || Math.abs(fromSlider(toSlider(440)) - 440) > 4) fl.push('slider mapping');
    var x = gen('square', 100, 1, 8000, 0.5); if (x.length !== 8000 || x[1050] !== 0.5 || x[1010] !== -0.5) fl.push('square wave ' + x[1050] + '/' + x[1010]);
    var s = gen('sine', 1000, 0.1, 8000, 1); if (Math.abs(s[82] - Math.sin(2 * Math.PI * 1000 * 82 / 8000)) > 1e-6) fl.push('sine value');
    if (wav(new Float32Array(100), 8000).size !== 244) fl.push('wav size');
    return Promise.resolve({ ok: !fl.length, n: 5, fails: fl });
  };
});
