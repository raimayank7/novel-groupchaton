/* Infinity by GroupChatOn — pomodoro. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Pomodoro focus timer: focus, short break, long break every N rounds; counts today's sessions on this device. */
GCOTools.register('pomodoro', function (spot, T) {
  var h = T.h, status = T.status();
  var NAMES = { focus: '🎯 Focus', short: '☕ Short break', long: '🌿 Long break' }, COLORS = { focus: '#ef4444', short: '#10b981', long: '#3b82f6' };
  function nextPhase(phase, done, every) { return phase === 'focus' ? (done % every === 0 ? 'long' : 'short') : 'focus'; }   // done = focus rounds finished so far
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function mmss(ms) { var s = Math.ceil(Math.max(0, ms) / 1000); return p2(Math.floor(s / 60)) + ':' + p2(s % 60); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  var set = T.store.get('pomo-set', { focus: 25, short: 5, long: 15, every: 4, auto: true });
  var st = { phase: 'focus', done: 0, run: false, left: set.focus * 60000, end: 0 };
  function len(p) { return Math.max(1, +set[p] || 1) * 60000; }
  var ac = null;
  function chime() {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume();
      [660, 880, 1100].forEach(function (f, i) { var t = ac.currentTime + 0.05 + i * 0.25, o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.85); });
    } catch (e) {}
  }
  var label = h('div', { style: 'text-align:center;font:700 18px/1.3 var(--ui)' }), big = h('div', { 'data-out': '', style: 'font:800 clamp(56px,18vw,96px)/1.05 var(--ui);text-align:center;font-variant-numeric:tabular-nums' });
  var bar = h('div', { style: 'height:8px;border-radius:9px;background:var(--surface-2);overflow:hidden' }, [h('span', { style: 'display:block;height:100%;width:0;transition:width .3s' })]);
  var dots = h('div', { style: 'text-align:center;font-size:20px;letter-spacing:4px', 'aria-label': 'Rounds in this cycle' }), count = h('div', { 'class': 'tstats' });
  var task = h('input', { type: 'text', placeholder: 'What will you work on? (optional)', value: T.store.get('pomo-task', '') });
  task.addEventListener('input', function () { T.store.set('pomo-task', task.value); });
  var go = T.button('Start', { primary: true, onclick: function () {
    if (st.run) { st.left = Math.max(0, st.end - Date.now()); st.run = false; } else { st.end = Date.now() + st.left; st.run = true; chime.unlock = 1; if (!ac) try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    draw();
  } });
  function finish(skip) {
    if (st.phase === 'focus' && !skip) {
      st.done++; var d = T.store.get('pomo-day', {}); if (d.d !== today()) d = { d: today(), n: 0, min: 0 }; d.n++; d.min += +set.focus; T.store.set('pomo-day', d);
    } else if (st.phase === 'focus') st.done++;
    st.phase = nextPhase(st.phase, st.done, Math.max(1, +set.every || 4)); st.left = len(st.phase);
    st.run = !skip && !!set.auto; st.end = Date.now() + st.left;
    if (!skip) { chime(); if (navigator.vibrate) navigator.vibrate([300, 150, 300]); status.ok(st.phase === 'focus' ? 'Break over: time to focus again.' : 'Well done! Take a ' + (st.phase === 'long' ? 'long' : 'short') + ' break.'); }
    draw();
  }
  var skip = T.button('Skip', { onclick: function () { finish(true); } });
  var reset = T.button('Reset', { onclick: function () { st = { phase: 'focus', done: 0, run: false, left: len('focus'), end: 0 }; status.clear(); draw(); } });
  var ins = {};
  [['focus', 'Focus (min)'], ['short', 'Short break (min)'], ['long', 'Long break (min)'], ['every', 'Long break after']].forEach(function (k) {
    ins[k[0]] = h('input', { type: 'number', min: '1', max: '180', value: String(set[k[0]]) });
    ins[k[0]].addEventListener('input', function () { set[k[0]] = Math.max(1, Math.min(180, +ins[k[0]].value || 1)); T.store.set('pomo-set', set); if (!st.run && k[0] === st.phase) { st.left = len(st.phase); draw(); } });
  });
  var auto = h('input', { type: 'checkbox', checked: set.auto ? true : null });
  auto.addEventListener('change', function () { set.auto = auto.checked; T.store.set('pomo-set', set); });
  function draw() {
    var left = st.run ? Math.max(0, st.end - Date.now()) : st.left;
    label.textContent = NAMES[st.phase] + (task.value && st.phase === 'focus' ? ': ' + task.value : '');
    big.textContent = mmss(left); big.style.color = COLORS[st.phase];
    bar.firstChild.style.width = Math.round((1 - left / len(st.phase)) * 100) + '%'; bar.firstChild.style.background = COLORS[st.phase];
    go.textContent = st.run ? 'Pause' : left < len(st.phase) ? 'Resume' : 'Start';
    var every = Math.max(1, +set.every || 4), inCycle = st.done % every;
    dots.textContent = Array.apply(null, Array(every)).map(function (x, i) { return i < inCycle ? '●' : '○'; }).join('');
    var d = T.store.get('pomo-day', {}); if (d.d !== today()) d = { n: 0, min: 0 };
    count.innerHTML = '';
    [[d.n, 'Focus rounds today'], [Math.floor(d.min / 60) + 'h ' + (d.min % 60) + 'm', 'Focused today'], [st.done, 'Rounds this session']].forEach(function (r) { count.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(r[0]) }), h('span', { text: r[1] })])); });
    if (st.run && left <= 0) finish(false);
  }
  setInterval(function () { if (st.run) draw(); }, 250);
  spot.appendChild(T.card([T.field('Task', task), label, big, bar, dots, T.row([go, skip, reset]), status.el, count,
    h('div', { 'class': 'tgrid2' }, [T.field('Focus (min)', ins.focus), T.field('Short break (min)', ins.short), T.field('Long break (min)', ins['long']), T.field('Long break after (rounds)', ins.every)]),
    h('label', { 'class': 'tcheck' }, [auto, ' Start the next round automatically'])]));
  draw();
  T.tests.pomodoro = function () {
    var f = [], ph = 'focus', done = 0, seq = [ph];
    for (var i = 0; i < 8; i++) { if (ph === 'focus') done++; ph = nextPhase(ph, done, 4); seq.push(ph[0]); }
    if (seq.slice(1).join('') !== 'sfsfsflf') f.push('cycle ' + seq.join(''));
    if (mmss(25 * 60000) !== '25:00' || mmss(59001) !== '01:00' || mmss(-3) !== '00:00') f.push('mmss');
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
