/* Infinity by GroupChatOn — hearing-test. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Hearing frequency check: pure tones from 125 Hz to 20 kHz, one ear at a time, to find the highest pitch you can hear. A screening aid, not a hearing test. */
GCOTools.register('hearing-test', function (spot, T) {
  var h = T.h, status = T.status(), ctx = null, osc = null, gain = null, pan = null, WARN = 'margin:0;padding:10px 12px;border-radius:12px;background:#fef3c7;color:#713f12;font-weight:600';
  var FREQS = [125, 250, 500, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 15000, 16000, 17000, 18000, 19000, 20000];
  // rough guide: the highest tone most people of an age group can still hear
  var AGE = [[17400, 'Most people under about 24 can hear this'], [16000, 'Typical up to about age 30'], [15000, 'Typical up to about age 40'], [12000, 'Typical up to about age 50'], [10000, 'Typical up to about age 60'], [8000, 'Most adults hear this']];
  function highest(res) { var hi = 0; Object.keys(res).forEach(function (f) { if (res[f] && +f > hi) hi = +f; }); return hi; }
  function band(hz) { if (!hz) return 'No tones were heard: check your volume and headphones.'; for (var i = 0; i < AGE.length; i++) if (hz >= AGE[i][0]) return AGE[i][1] + '.'; return 'Lower than typical for adults: worth a proper hearing check.'; }
  function fmtHz(f) { return f >= 1000 ? (f / 1000) + ' kHz' : f + ' Hz'; }
  var ear = 'both', res = { left: {}, right: {}, both: {} }, idx = 0, playing = false;
  var vol = h('input', { type: 'range', min: '1', max: '100', value: '25', 'aria-label': 'Volume' });
  var cur = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 40px/1.2 var(--ui)' }), sub = h('p', { 'class': 'tnote', style: 'text-align:center' });
  var table = h('div', { 'class': 'tkv' }), verdict = h('p', { style: 'font-weight:700' });
  function level() { return Math.pow(+vol.value / 100, 2) * 0.3; }
  function tone(on) {
    if (on) {
      if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) { status.error('This browser cannot play tones here.'); return; } ctx = new C(); }
      tone(false);
      osc = ctx.createOscillator(); gain = ctx.createGain(); osc.frequency.value = FREQS[idx]; gain.gain.value = 0;
      var node = gain;
      if (ctx.createStereoPanner) { pan = ctx.createStereoPanner(); pan.pan.value = ear === 'left' ? -1 : ear === 'right' ? 1 : 0; gain.connect(pan); node = pan; }
      osc.connect(gain); node.connect(ctx.destination); osc.start(); gain.gain.setTargetAtTime(level(), ctx.currentTime, 0.05);
      playing = true; play.textContent = 'Stop tone';
    } else {
      if (osc) { try { gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03); var o = osc; setTimeout(function () { try { o.stop(); } catch (e) {} }, 150); } catch (e) {} osc = null; }
      playing = false; play.textContent = 'Play tone';
    }
  }
  function draw() {
    cur.textContent = fmtHz(FREQS[idx]); sub.textContent = (ear === 'both' ? 'Both ears' : ear === 'left' ? 'Left ear only' : 'Right ear only') + ' · tone ' + (idx + 1) + ' of ' + FREQS.length;
    table.innerHTML = '';
    ['left', 'right', 'both'].forEach(function (e) {
      var hi = highest(res[e]); if (!Object.keys(res[e]).length) return;
      table.appendChild(h('div', {}, [h('b', { text: e === 'both' ? 'Both ears' : e === 'left' ? 'Left ear' : 'Right ear' }), h('span', { text: hi ? 'Highest heard: ' + fmtHz(hi) : 'Nothing heard yet' }), h('span')]));
    });
    var all = ['left', 'right', 'both'].map(function (e) { return highest(res[e]); }).filter(Boolean);
    verdict.textContent = all.length ? band(Math.max.apply(null, all)) : '';
  }
  function answer(heard) {
    res[ear][FREQS[idx]] = heard; tone(false);
    if (idx < FREQS.length - 1) { idx++; } else status.ok('All tones done for this ear. Switch ears to compare.');
    draw();
  }
  var play = T.button('Play tone', { primary: true, onclick: function () { tone(!playing); } });
  vol.addEventListener('input', function () { if (gain && ctx) gain.gain.setTargetAtTime(level(), ctx.currentTime, 0.05); });
  window.addEventListener('pagehide', function () { tone(false); if (ctx) ctx.close(); });
  spot.appendChild(T.card([h('p', { style: WARN, text: '⚠️ Not a medical hearing test. Phone and laptop speakers, earphones and room noise all change the result. If you notice hearing loss, ringing or ear pain, see a doctor or audiologist.' }),
    h('p', { 'class': 'tnote', text: 'Use headphones in a quiet room. Start with the volume LOW and raise it slowly: high tones can seem silent and then suddenly be loud. Never play tones loudly.' }),
    T.seg([['both', 'Both ears'], ['left', 'Left'], ['right', 'Right']], 'both', function (v) { ear = v; idx = 0; tone(false); status.clear(); draw(); }),
    cur, sub, T.field('Volume (keep it low)', vol),
    T.row([play, T.button('I hear it ✓', { onclick: function () { answer(true); } }), T.button('I can’t hear it', { onclick: function () { answer(false); } })]),
    T.row([T.button('◀ Lower', { small: true, onclick: function () { tone(false); idx = Math.max(0, idx - 1); draw(); } }), T.button('Higher ▶', { small: true, onclick: function () { tone(false); idx = Math.min(FREQS.length - 1, idx + 1); draw(); } }),
      T.button('Start again', { small: true, onclick: function () { tone(false); res = { left: {}, right: {}, both: {} }; idx = 0; status.clear(); draw(); } })]),
    status.el, table, verdict]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['hearing-test'] = function () {
    var f = [];
    if (highest({ 8000: true, 12000: true, 15000: false }) !== 12000) f.push('highest');
    if (!/50/.test(band(12000)) || !/24/.test(band(18000)) || !/No tones/.test(band(0))) f.push('bands');
    if (fmtHz(500) !== '500 Hz' || fmtHz(15000) !== '15 kHz') f.push('fmt');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
