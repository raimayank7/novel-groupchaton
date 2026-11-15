/* Infinity by GroupChatOn — timer-fullscreen. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Big full-screen clock, countdown timer and stopwatch: huge digits for classrooms, exams, gyms, stages and presentations. */
GCOTools.register('timer-fullscreen', function (spot, T) {
  var h = T.h, status = T.status(), mode = 'clock', tick = 0, lock = null;
  var timer = { total: 300000, left: 300000, end: 0, run: false }, sw = { start: 0, acc: 0, run: false };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ms, tenths) {
    ms = Math.max(0, ms); var s = Math.floor(ms / 1000), hh = Math.floor(s / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60;
    return (hh ? hh + ':' + pad(mm) : mm) + ':' + pad(ss) + (tenths ? '.' + Math.floor(ms % 1000 / 100) : '');
  }
  function parse(t) {
    t = String(t).trim(); if (!t) return 0;
    if (/^\d+(\.\d+)?$/.test(t)) return Math.round(+t * 60000);   // a plain number is minutes
    var p = t.split(':').map(Number);
    if (p.some(function (x) { return !isFinite(x) || x < 0; }) || p.length > 3) throw new Error('Write the time like 5, 1:30 or 1:00:00.');
    while (p.length < 3) p.unshift(0);
    return ((p[0] * 60 + p[1]) * 60 + p[2]) * 1000;
  }
  var face = h('div', { style: 'display:grid;place-items:center;gap:6px;min-height:min(52vh,420px);border-radius:20px;padding:16px;box-sizing:border-box;transition:background-color .3s' });
  var big = h('div', { 'data-out': '', 'aria-live': 'off', style: 'font:800 clamp(56px,18vw,220px)/1 ui-monospace,Consolas,monospace;font-variant-numeric:tabular-nums;letter-spacing:-.02em;text-align:center' });
  var small = h('div', { style: 'font:600 clamp(16px,3vw,28px)/1.3 var(--ui);opacity:.75;text-align:center' });
  face.appendChild(big); face.appendChild(small);
  var THEMES = { dark: ['#0b0f19', '#f8fafc'], light: ['#ffffff', '#0f172a'], green: ['#052e16', '#4ade80'], amber: ['#1c1300', '#fbbf24'] }, theme = T.store.get('bigclock-theme', 'dark');
  var h24 = h('input', { type: 'checkbox', checked: T.store.get('bigclock-24', true) ? true : null }), secs = h('input', { type: 'checkbox', checked: true });
  var tin = h('input', { type: 'text', value: '5:00', 'class': 'tmono', 'aria-label': 'Timer length', inputmode: 'numeric' });
  var tRow = T.row([T.field('Timer length (minutes, or h:mm:ss)', tin)].concat([1, 5, 10, 15, 30, 60].map(function (m) { return T.button(m + ' min', { small: true, onclick: function () { tin.value = m + ':00'; setTimer(); } }); })));
  var bStart = T.button('Start', { primary: true, onclick: startStop }), bReset = T.button('Reset', { onclick: reset }), bLap = T.button('Lap', { small: true, onclick: lap });
  var laps = h('textarea', { rows: '3', 'class': 'tout tmono', readonly: true, 'aria-label': 'Laps', hidden: true }), lapList = [];
  function beep() {
    try { var C = window.AudioContext || window.webkitAudioContext, c = new C(); [0, 0.35, 0.7].forEach(function (d) { var o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(0.0001, c.currentTime + d); g.gain.exponentialRampToValueAtTime(0.4, c.currentTime + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d + 0.3); o.start(c.currentTime + d); o.stop(c.currentTime + d + 0.32); }); setTimeout(function () { c.close(); }, 1500); } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  }
  function paint() {
    var th = THEMES[theme] || THEMES.dark; face.style.backgroundColor = th[0]; face.style.color = th[1];
    var now = new Date();
    if (mode === 'clock') {
      var hr = now.getHours(), ap = '';
      if (!h24.checked) { ap = hr < 12 ? ' AM' : ' PM'; hr = hr % 12 || 12; }
      big.textContent = (h24.checked ? pad(hr) : hr) + ':' + pad(now.getMinutes()) + (secs.checked ? ':' + pad(now.getSeconds()) : '') + ap;
      small.textContent = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (mode === 'timer') {
      if (timer.run) { timer.left = timer.end - Date.now(); if (timer.left <= 0) { timer.left = 0; timer.run = false; bStart.textContent = 'Start'; beep(); status.ok('Time is up!'); face.style.backgroundColor = '#b91c1c'; face.style.color = '#fff'; } }
      big.textContent = fmt(Math.ceil(timer.left / 1000) * 1000);
      small.textContent = timer.left === 0 ? '⏰ Time is up' : timer.run ? 'Ends at ' + new Date(timer.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Timer · ' + fmt(timer.total);
      if (timer.run && timer.left < 10000) face.style.color = '#f87171';
    } else {
      var ms = sw.acc + (sw.run ? Date.now() - sw.start : 0);
      big.textContent = fmt(ms, true); small.textContent = 'Stopwatch' + (lapList.length ? ' · lap ' + (lapList.length + 1) : '');
    }
  }
  function setTimer() { try { var v = parse(tin.value); if (!v) throw new Error('Set a time longer than zero.'); timer = { total: v, left: v, end: 0, run: false }; bStart.textContent = 'Start'; status.clear(); paint(); } catch (e) { status.error(e); } }
  function startStop() {
    awake();
    if (mode === 'timer') {
      if (timer.run) { timer.left = timer.end - Date.now(); timer.run = false; bStart.textContent = 'Resume'; }
      else { if (timer.left <= 0) setTimer(); timer.end = Date.now() + timer.left; timer.run = true; bStart.textContent = 'Pause'; }
    } else if (mode === 'stopwatch') {
      if (sw.run) { sw.acc += Date.now() - sw.start; sw.run = false; bStart.textContent = 'Resume'; }
      else { sw.start = Date.now(); sw.run = true; bStart.textContent = 'Pause'; }
    }
    paint();
  }
  function reset() { if (mode === 'timer') setTimer(); else { sw = { start: 0, acc: 0, run: false }; lapList = []; laps.value = ''; laps.hidden = true; bStart.textContent = 'Start'; } status.clear(); paint(); }
  function lap() { if (mode !== 'stopwatch' || !sw.run) return; var ms = sw.acc + Date.now() - sw.start, prev = lapList.length ? lapList[lapList.length - 1] : 0; lapList.push(ms); laps.hidden = false; laps.value = lapList.map(function (x, i) { return 'Lap ' + (i + 1) + '  ' + fmt(x - (i ? lapList[i - 1] : 0), true) + '   total ' + fmt(x, true); }).reverse().join('\n'); prev = 0; }
  function awake() { if (!lock && navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }, function () {}); }
  function full() {
    awake();
    if (document.fullscreenElement) return document.exitFullscreen();
    if (face.requestFullscreen) face.requestFullscreen().catch(function () { status.info('Full screen is not allowed here.'); });
    else if (face.webkitRequestFullscreen) face.webkitRequestFullscreen();
    else status.info('This browser has no full screen: turn your phone sideways for bigger digits.');
  }
  document.addEventListener('fullscreenchange', function () { var f = document.fullscreenElement === face; face.style.minHeight = f ? '100vh' : 'min(52vh,420px)'; face.style.borderRadius = f ? '0' : '20px'; });
  face.addEventListener('dblclick', full);
  function setMode(m) { mode = m; tRow.hidden = m !== 'timer'; bStart.hidden = bReset.hidden = m === 'clock'; bLap.hidden = m !== 'stopwatch'; laps.hidden = m !== 'stopwatch' || !lapList.length; status.clear(); paint(); }
  tin.addEventListener('change', setTimer);
  h24.addEventListener('change', function () { T.store.set('bigclock-24', h24.checked); paint(); }); secs.addEventListener('change', paint);
  document.addEventListener('keydown', function (e) { if (e.code === 'Space' && mode !== 'clock' && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); startStop(); } });
  spot.appendChild(T.card([T.seg([['clock', 'Clock'], ['timer', 'Timer'], ['stopwatch', 'Stopwatch']], 'clock', setMode), face, tRow,
    T.row([bStart, bReset, bLap, T.button('Full screen', { small: true, onclick: full })]), status.el, laps,
    T.row([T.seg([['dark', 'Dark'], ['light', 'Light'], ['green', 'Green'], ['amber', 'Amber']], theme, function (v) { theme = v; T.store.set('bigclock-theme', v); paint(); }),
      h('label', { 'class': 'tcheck' }, [h24, ' 24-hour']), h('label', { 'class': 'tcheck' }, [secs, ' Seconds'])])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  setMode('clock');
  tick = setInterval(paint, 100);
  window.addEventListener('pagehide', function () { clearInterval(tick); if (lock) lock.release(); });
  T.tests['timer-fullscreen'] = function () {
    var f = [];
    if (fmt(3661000) !== '1:01:01' || fmt(65000) !== '1:05' || fmt(5250, true) !== '0:05.2') f.push('fmt ' + fmt(3661000) + ' ' + fmt(65000) + ' ' + fmt(5250, true));
    if (parse('5') !== 300000 || parse('1:30') !== 90000 || parse('1:00:00') !== 3600000 || parse('0.5') !== 30000) f.push('parse');
    try { parse('a:b'); f.push('bad time accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
