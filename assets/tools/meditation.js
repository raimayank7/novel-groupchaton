/* Infinity by GroupChatOn — meditation. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Meditation timer: a calm countdown with a settling-in period, a singing-bowl bell at start, end and optional intervals, and a log of your sessions. */
GCOTools.register('meditation', function (spot, T) {
  var h = T.h, status = T.status(), ctx = null, run = false, phase = '', endAt = 0, startAt = 0, nextBells = [], tick = 0, lock = null, paused = 0;
  var log = T.store.get('medit-log', []);
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + pad(s % 60); }
  // bell times in seconds from the start of the sit, every `every` minutes, not at the very end
  function bells(mins, every) { var out = []; if (!every) return out; for (var t = every; t < mins; t += every) out.push(t * 60); return out; }
  function dayKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function streak(list, today) {
    var days = {}; list.forEach(function (x) { days[x.d] = 1; });
    var d = new Date(today + 'T12:00:00'), n = 0;
    if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function bell(strikes) {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      for (var k = 0; k < (strikes || 1); k++) {
        var t = ctx.currentTime + k * 2.2;
        [[1, 0.5], [2.76, 0.25], [5.4, 0.12], [8.93, 0.06]].forEach(function (p) {   // singing-bowl partials
          var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 220 * p[0]; o.connect(g); g.connect(ctx.destination);
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p[1] * 0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 6 / p[0] + 1.5);
          o.start(t); o.stop(t + 6 / p[0] + 1.6);
        });
      }
    } catch (e) {}
  }
  var mins = h('input', { type: 'number', min: '1', max: '180', value: String(T.store.get('medit-mins', 10)), 'aria-label': 'Minutes' });
  var prep = T.select([[0, 'None'], [10, '10 seconds'], [30, '30 seconds'], [60, '1 minute']], 10), every = T.select([[0, 'No interval bells'], [1, 'Every minute'], [2, 'Every 2 minutes'], [5, 'Every 5 minutes'], [10, 'Every 10 minutes'], [15, 'Every 15 minutes']], 0);
  var big = h('div', { 'data-out': '', style: 'text-align:center;font:800 clamp(56px,16vw,120px)/1 ui-monospace,Consolas,monospace;font-variant-numeric:tabular-nums' }), sub = h('p', { 'class': 'tnote', 'aria-live': 'polite', style: 'text-align:center' });
  var stats = h('div', { 'class': 'tstats' });
  function showStats() {
    var tot = log.reduce(function (a, x) { return a + x.m; }, 0), today = dayKey(new Date());
    stats.innerHTML = '';
    [['Sessions', log.length], ['Total minutes', Math.round(tot)], ['Day streak', streak(log, today)], ['Today', Math.round(log.filter(function (x) { return x.d === today; }).reduce(function (a, x) { return a + x.m; }, 0)) + ' min']].forEach(function (x) {
      stats.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(x[1]) }), h('span', { text: x[0] })]));
    });
  }
  function paint() {
    if (!run) { big.textContent = fmt((+mins.value || 10) * 60); return; }
    var now = Date.now();
    if (phase === 'prep') { var l = (startAt - now) / 1000; big.textContent = fmt(l); sub.textContent = 'Settle in… the bell starts your sit'; if (l <= 0) { phase = 'sit'; bell(1); } return; }
    var left = (endAt - now) / 1000, done = (now - startAt) / 1000;
    while (nextBells.length && done >= nextBells[0]) { nextBells.shift(); bell(1); }
    big.textContent = fmt(left); sub.textContent = 'Breathe naturally. Notice, let go, come back.';
    if (left <= 0) finish(true);
  }
  function finish(complete) {
    clearInterval(tick); run = false; go.textContent = 'Begin'; if (lock) { lock.release(); lock = null; }
    if (complete) {
      bell(3); var m = +mins.value || 10;
      log.push({ d: dayKey(new Date()), m: m }); log = log.slice(-1000); T.store.set('medit-log', log);
      status.ok('Session complete: ' + m + ' minutes. 🙏'); sub.textContent = 'Take a moment before you move on.';
    } else { var sat = Math.max(0, (Date.now() - startAt) / 60000); if (phase === 'sit' && sat >= 1) { log.push({ d: dayKey(new Date()), m: Math.round(sat) }); T.store.set('medit-log', log); } status.info('Stopped.'); sub.textContent = ''; }
    showStats(); paint();
  }
  function begin() {
    if (run) { finish(false); return; }
    var m = Math.round(+mins.value); if (!(m >= 1 && m <= 180)) { status.error('Choose between 1 and 180 minutes.'); return; }
    T.store.set('medit-mins', m);
    var p = +prep.value * 1000; startAt = Date.now() + p; endAt = startAt + m * 60000; nextBells = bells(m, +every.value);
    phase = p ? 'prep' : 'sit'; run = true; go.textContent = 'Stop'; status.clear();
    if (!p) bell(1); else { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { lock = l; }, function () {});
    tick = setInterval(paint, 250); paint();
  }
  var go = T.button('Begin', { primary: true, onclick: begin });
  mins.addEventListener('input', paint);
  window.addEventListener('pagehide', function () { clearInterval(tick); if (ctx) ctx.close(); });
  spot.appendChild(T.card([big, sub, T.row([5, 10, 15, 20, 30].map(function (m) { return T.button(m + ' min', { small: true, onclick: function () { if (!run) { mins.value = m; paint(); } } }); })),
    h('div', { 'class': 'tgrid2' }, [T.field('Minutes', mins), T.field('Settling-in time', prep), T.field('Interval bells', every)]),
    T.row([go, T.button('Test the bell', { small: true, onclick: function () { bell(1); } })]), status.el, stats,
    h('p', { 'class': 'tnote', text: 'Your sessions are saved only on this device. Keep this page open (and the phone unlocked) so the bells can ring.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  showStats(); paint();
  T.tests['meditation'] = function () {
    var f = [];
    if (bells(10, 2).join(',') !== '120,240,360,480') f.push('bells ' + bells(10, 2));
    if (bells(10, 0).length || bells(5, 5).length) f.push('no bells');
    if (fmt(600) !== '10:00' || fmt(59.2) !== '1:00' || fmt(-3) !== '0:00') f.push('fmt');
    var L = [{ d: '2026-11-01' }, { d: '2026-10-31' }, { d: '2026-10-30' }, { d: '2026-10-28' }];
    if (streak(L, '2026-11-01') !== 3 || streak(L, '2026-11-02') !== 3 || streak(L, '2026-11-03') !== 0) f.push('streak');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
