/* Infinity by GroupChatOn — white-noise. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* White, pink and brown noise, rain, fan and ocean sounds made live in the browser (no audio files), with volume and a sleep timer. */
GCOTools.register('white-noise', function (spot, T) {
  var h = T.h, status = T.status(), ctx = null, src = null, gain = null, kind = T.store.get('noise-kind', 'brown'), sleepT = 0, fadeT = 0, endAt = 0, lfo = null;
  var KINDS = [['white', 'White'], ['pink', 'Pink'], ['brown', 'Brown'], ['rain', 'Rain'], ['fan', 'Fan'], ['ocean', 'Ocean']];
  // noise recipes: white is flat, pink falls 3 dB per octave (Paul Kellet's filter), brown is integrated white noise
  function makeNoise(type, n, rand) {
    rand = rand || Math.random;
    var d = new Float32Array(n), b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (var i = 0; i < n; i++) {
      var w = rand() * 2 - 1;
      if (type === 'white') d[i] = w * 0.5;
      else if (type === 'pink') { b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; }
      else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3; }
    }
    return d;
  }
  var vol = h('input', { type: 'range', min: '0', max: '100', value: String(T.store.get('noise-vol', 50)), 'aria-label': 'Volume' });
  var sleep = T.select([[0, 'Play until I stop'], [15, '15 minutes'], [30, '30 minutes'], [45, '45 minutes'], [60, '1 hour'], [120, '2 hours'], [480, '8 hours']], 0);
  var read = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:700 20px/1.3 var(--ui)', text: 'Stopped' });
  function level() { return Math.pow(+vol.value / 100, 2) * 0.9; }
  function build() {
    var rate = ctx.sampleRate, len = rate * 6, base = kind === 'pink' ? 'pink' : kind === 'white' ? 'white' : 'brown';
    if (kind === 'rain') base = 'pink';
    var buf = ctx.createBuffer(2, len, rate);
    [0, 1].forEach(function (ch) { buf.getChannelData(ch).set(makeNoise(base, len)); });
    if (kind === 'rain') { [0, 1].forEach(function (ch) { var d = buf.getChannelData(ch); for (var k = 0; k < len / 600; k++) { var at = Math.floor(Math.random() * (len - 400)), a = 0.3 + Math.random() * 0.5; for (var j = 0; j < 300; j++) d[at + j] += (Math.random() * 2 - 1) * a * Math.exp(-j / 40); } }); }
    var s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    var node = s;
    if (kind === 'fan') { var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; node.connect(lp); node = lp; var hum = ctx.createOscillator(), hg = ctx.createGain(); hum.frequency.value = 50; hg.gain.value = 0.02; hum.connect(hg); hg.connect(gain); hum.start(); s.extra = hum; }
    if (kind === 'rain') { var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400; node.connect(hp); node = hp; }
    if (kind === 'ocean') {
      var wave = ctx.createGain(); wave.gain.value = 0.55; node.connect(wave); node = wave;
      lfo = ctx.createOscillator(); var lg = ctx.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 0.45; lfo.connect(lg); lg.connect(wave.gain); lfo.start(); s.extra = lfo;
    }
    node.connect(gain);
    return s;
  }
  function stop(msg) {
    clearTimeout(sleepT); clearInterval(fadeT);
    if (src) { try { src.stop(); if (src.extra) src.extra.stop(); } catch (e) {} src = null; }
    if (ctx) { ctx.close().catch(function () {}); ctx = null; }
    play.textContent = 'Play'; read.textContent = msg || 'Stopped';
  }
  function start() {
    if (src) { stop(); return; }
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) { status.error('This browser cannot make sound here. Try Chrome, Safari, Edge or Firefox.'); return; }
    ctx = new C(); gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination);
    src = build(); src.start();
    gain.gain.setTargetAtTime(level(), ctx.currentTime, 0.6);
    play.textContent = 'Stop'; status.clear(); label();
    var m = +sleep.value;
    if (m) { endAt = Date.now() + m * 60000; sleepT = setTimeout(fadeOut, Math.max(0, m * 60000 - 30000)); }
  }
  function fadeOut() { if (!ctx) return; gain.gain.setTargetAtTime(0, ctx.currentTime, 8); setTimeout(function () { stop('Sleep timer finished. Good night 🌙'); }, 30000); }
  function label() { var k = KINDS.filter(function (x) { return x[0] === kind; })[0][1]; read.textContent = (src ? '▶ Playing ' : '') + k + ' noise' + (src && endAt && +sleep.value ? ' · stops at ' + new Date(endAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''); }
  var play = T.button('Play', { primary: true, onclick: start });
  vol.addEventListener('input', function () { T.store.set('noise-vol', +vol.value); if (ctx) gain.gain.setTargetAtTime(level(), ctx.currentTime, 0.1); });
  window.addEventListener('pagehide', function () { stop(); });
  spot.appendChild(T.card([T.seg(KINDS, kind, function (v) { kind = v; T.store.set('noise-kind', v); if (src) { stop(); start(); } else label(); }), read,
    T.field('Volume', vol), T.field('Sleep timer (fades out gently)', sleep), T.row([play]), status.el,
    h('p', { 'class': 'tnote', text: 'Keep the volume comfortable, especially for babies: place the phone at least 2 metres from a cot and keep the sound quieter than a shower. On phones, the sound may pause if the screen locks.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  label();
  T.tests['white-noise'] = function () {
    var f = [], seed = 1, rand = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    ['white', 'pink', 'brown'].forEach(function (t) {
      var d = makeNoise(t, 48000, rand), mx = 0, s = 0;
      for (var i = 0; i < d.length; i++) { mx = Math.max(mx, Math.abs(d[i])); s += d[i] * d[i]; }
      if (!(mx < 1) || !(mx > 0.05)) f.push(t + ' peak ' + mx.toFixed(2));
      if (!(s > 0)) f.push(t + ' silent');
    });
    var w = makeNoise('white', 4800, rand), b = makeNoise('brown', 4800, rand), dw = 0, db = 0;
    for (var i = 1; i < 4800; i++) { dw += Math.abs(w[i] - w[i - 1]); db += Math.abs(b[i] - b[i - 1]); }
    if (!(db < dw / 5)) f.push('brown not smoother than white');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
