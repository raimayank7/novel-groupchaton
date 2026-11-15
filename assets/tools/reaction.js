/* Infinity by GroupChatOn — reaction. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Reaction time test: wait for green, tap as fast as you can; five rounds, average and best saved on this device. */
GCOTools.register('reaction', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function summary(list) {
    if (!list.length) return null;
    var s = list.slice().sort(function (a, b) { return a - b; }), sum = list.reduce(function (a, b) { return a + b; }, 0);
    return { avg: Math.round(sum / list.length), best: s[0], median: s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2) };
  }
  function rating(ms) {
    return ms < 200 ? 'Lightning fast ⚡ (top few percent)' : ms < 250 ? 'Very quick: better than most people' : ms < 300 ? 'Good: about average for adults' : ms < 400 ? 'A little slow: try again when fresh' : 'Slow: were you distracted?';
  }
  var ROUNDS = 5, state = 'idle', times = [], t0 = 0, wait = null, best = T.store.get('rt-best', 0), hist = T.store.get('rt-hist', []);
  var pad = h('div', { tabindex: '0', role: 'button', 'aria-live': 'assertive', style: 'display:grid;place-items:center;text-align:center;min-height:260px;border-radius:20px;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;padding:20px;font:800 28px/1.25 var(--ui);color:#fff;transition:background .08s' });
  var round = h('b', { text: '0/' + ROUNDS }), avgEl = h('b', { text: '-' }), bestEl = h('b', { text: best ? best + ' ms' : '-' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' }), histEl = h('div', { 'class': 'tstatus' });
  function show(bg, big, small) { pad.style.background = bg; pad.innerHTML = ''; pad.appendChild(h('div', {}, [h('div', { text: big }), small ? h('div', { style: 'font:600 16px/1.4 var(--ui);margin-top:8px;opacity:.9', text: small }) : null])); }
  function idle() { state = 'idle'; show('#334155', 'Tap here to start', 'When the box turns green, tap as fast as you can. ' + ROUNDS + ' rounds.'); }
  function arm() {
    state = 'wait'; show('#dc2626', 'Wait for green…', 'Do not tap yet');
    wait = setTimeout(function () { state = 'go'; show('#16a34a', 'TAP!'); t0 = performance.now(); }, 1500 + rnd(3500));
  }
  function hit(e) {
    if (e) e.preventDefault();
    if (state === 'idle' || state === 'result' || state === 'early') { if (state !== 'result' || times.length < ROUNDS) arm(); else { times = []; draw(); arm(); } return; }
    if (state === 'wait') { clearTimeout(wait); state = 'early'; show('#f59e0b', 'Too soon!', 'Wait for green. Tap to try this round again.'); return; }
    if (state === 'go') {
      var ms = Math.round(performance.now() - t0); times.push(ms); state = 'result';
      var done = times.length >= ROUNDS;
      show('#2563eb', ms + ' ms', done ? 'Finished! Tap to play again.' : 'Round ' + times.length + ' of ' + ROUNDS + '. Tap for the next one.');
      if (done) finish();
      draw();
    }
  }
  function finish() {
    var s = summary(times);
    if (!best || s.best < best) { best = s.best; T.store.set('rt-best', best); }
    hist.unshift({ d: new Date().toISOString().slice(0, 10), avg: s.avg }); hist = hist.slice(0, 10); T.store.set('rt-hist', hist);
    out.textContent = 'Average ' + s.avg + ' ms (median ' + s.median + ', fastest ' + s.best + '). ' + rating(s.avg) + '.';
  }
  function draw() {
    var s = summary(times);
    round.textContent = times.length + '/' + ROUNDS; avgEl.textContent = s ? s.avg + ' ms' : '-'; bestEl.textContent = best ? best + ' ms' : '-';
    histEl.textContent = hist.length ? 'Your last results: ' + hist.map(function (x) { return x.avg + ' ms'; }).join(', ') : '';
  }
  pad.addEventListener('pointerdown', hit);
  pad.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') hit(e); });
  spot.appendChild(T.card([pad,
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [round, h('span', { text: 'Round' })]), h('div', { 'class': 'tstat' }, [avgEl, h('span', { text: 'Average' })]), h('div', { 'class': 'tstat' }, [bestEl, h('span', { text: 'Your best' })])]),
    out, histEl, T.row([T.button('Restart', { small: true, onclick: function () { clearTimeout(wait); times = []; out.textContent = ''; draw(); idle(); } }),
      T.button('Clear my history', { small: true, onclick: function () { hist = []; best = 0; T.store.set('rt-hist', []); T.store.set('rt-best', 0); draw(); } })])]));
  idle(); draw();
  T.tests['reaction'] = function () {
    var f = [], s = summary([300, 200, 250, 400, 350]);
    if (s.avg !== 300 || s.best !== 200 || s.median !== 300) f.push('summary ' + JSON.stringify(s));
    if (summary([200, 300]).median !== 250 || summary([]) !== null) f.push('median / empty');
    if (rating(180).indexOf('Lightning') !== 0 || rating(320).indexOf('A little') !== 0) f.push('rating');
    var waits = []; for (var i = 0; i < 200; i++) waits.push(1500 + rnd(3500));
    if (Math.min.apply(null, waits) < 1500 || Math.max.apply(null, waits) >= 5000) f.push('random wait out of range');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
