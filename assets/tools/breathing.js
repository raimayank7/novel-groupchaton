/* Infinity by GroupChatOn — breathing. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Guided breathing: box breathing, 4-7-8, calm 4-6 and coherent 5.5-5.5, with an animated circle, counts, rounds and a soft tone. */
GCOTools.register('breathing', function (spot, T) {
  var h = T.h, status = T.status();
  var PATTERNS = {
    box: ['Box breathing (4-4-4-4)', [['Breathe in', 4], ['Hold', 4], ['Breathe out', 4], ['Hold', 4]]],
    relax: ['4-7-8 relax', [['Breathe in', 4], ['Hold', 7], ['Breathe out', 8]]],
    calm: ['Calm (4-6)', [['Breathe in', 4], ['Breathe out', 6]]],
    coherent: ['Coherent (5.5-5.5)', [['Breathe in', 5.5], ['Breathe out', 5.5]]],
    energise: ['Wake up (6-2-2)', [['Breathe in', 6], ['Hold', 2], ['Breathe out', 2]]]
  };
  // where in the cycle we are after t seconds: the phase, seconds left in it, how full the lungs are (0–1) and the round number
  function phaseAt(steps, t) {
    var cycle = steps.reduce(function (a, s) { return a + s[1]; }, 0), round = Math.floor(t / cycle), x = t - round * cycle, size = 0;
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      if (x < s[1]) {
        var p = x / s[1];
        size = /in/.test(s[0]) ? p : /out/.test(s[0]) ? 1 - p : (i > 0 && /in/.test(steps[i - 1][0]) ? 1 : 0);
        return { name: s[0], left: s[1] - x, size: size, round: round + 1, index: i };
      }
      x -= s[1];
    }
    return { name: steps[0][0], left: steps[0][1], size: 0, round: round + 2, index: 0 };
  }
  var key = 'box', run = false, t0 = 0, raf = 0, lastIdx = -1, lim = 0, ctx = null;
  var sel = T.select(Object.keys(PATTERNS).map(function (k) { return [k, PATTERNS[k][0]]; }), key), mins = T.select([[1, '1 minute'], [2, '2 minutes'], [3, '3 minutes'], [5, '5 minutes'], [10, '10 minutes'], [0, 'No limit']], 3);
  var tone = h('input', { type: 'checkbox' });
  var circle = h('div', { 'aria-hidden': 'true', style: 'width:200px;height:200px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#c7f9e5,#34d399 55%,#0f766e);box-shadow:0 0 50px rgba(52,211,153,.45);transform:scale(.45);transition:transform .1s linear' });
  var ring = h('div', { style: 'display:grid;place-items:center;height:260px;border-radius:20px;background:var(--bg);border:1px solid var(--line)' }, [circle]);
  var word = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 30px/1.2 var(--ui)', text: 'Ready' }), sub = h('p', { 'class': 'tnote', style: 'text-align:center' });
  function chime(f) { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2); o.start(); o.stop(ctx.currentTime + 1.3); } catch (e) {} }
  function frame() {
    var t = (performance.now() - t0) / 1000, steps = PATTERNS[key][1], p = phaseAt(steps, t);
    if (lim && t >= lim && p.index === 0) { stop(true); return; }
    circle.style.transform = 'scale(' + (0.45 + 0.55 * p.size).toFixed(3) + ')';
    word.textContent = p.name + ' · ' + Math.ceil(p.left);
    sub.textContent = 'Round ' + p.round + (lim ? ' · ' + Math.max(0, Math.ceil((lim - t) / 60)) + ' min left' : '');
    if (p.index !== lastIdx) { lastIdx = p.index; if (tone.checked) chime(/in/.test(p.name) ? 528 : /out/.test(p.name) ? 396 : 440); if (navigator.vibrate && /in/.test(p.name)) navigator.vibrate(40); }
    raf = requestAnimationFrame(frame);
  }
  function stop(done) { cancelAnimationFrame(raf); run = false; go.textContent = 'Start'; lastIdx = -1; circle.style.transform = 'scale(.45)'; word.textContent = done ? 'Well done 🌿' : 'Ready'; sub.textContent = done ? 'Notice how you feel. Breathe normally for a moment before you get up.' : ''; if (done) status.ok('Session complete.'); }
  function start() { if (run) { stop(false); return; } key = sel.value; lim = (+mins.value) * 60; t0 = performance.now(); run = true; go.textContent = 'Stop'; status.clear(); frame(); }
  var go = T.button('Start', { primary: true, onclick: start });
  window.addEventListener('pagehide', function () { cancelAnimationFrame(raf); if (ctx) ctx.close(); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Pattern', sel), T.field('Length', mins)]), ring, word, sub,
    T.row([go, h('label', { 'class': 'tcheck' }, [tone, ' Soft tone at each change'])]), status.el,
    h('p', { 'class': 'tnote', text: 'Breathe gently through your nose if you can. If you feel dizzy or short of breath, stop and breathe normally. This is a relaxation aid, not medical treatment.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['breathing'] = function () {
    var f = [], box = PATTERNS.box[1], a = phaseAt(box, 1), b = phaseAt(box, 5), c = phaseAt(box, 9), d = phaseAt(box, 17), e = phaseAt(PATTERNS.relax[1], 13);
    if (a.name !== 'Breathe in' || Math.abs(a.left - 3) > 1e-9 || Math.abs(a.size - 0.25) > 1e-9) f.push('in ' + JSON.stringify(a));
    if (b.name !== 'Hold' || b.size !== 1) f.push('hold full');
    if (c.name !== 'Breathe out' || Math.abs(c.size - 0.75) > 1e-9) f.push('out');
    if (d.round !== 2 || d.name !== 'Breathe in') f.push('round 2');
    if (e.name !== 'Breathe out' || Math.abs(e.left - 6) > 1e-9) f.push('4-7-8 ' + JSON.stringify(e));
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
