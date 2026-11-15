/* Infinity by GroupChatOn — flashlight. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Screen light: fills the screen with any colour and brightness, with full screen, keep-awake, a slow blink and SOS. */
GCOTools.register('flashlight', function (spot, T) {
  var h = T.h, status = T.status(), UNIT = 250;
  var COLORS = [['#ffffff', 'White'], ['#ffe2b0', 'Warm'], ['#ff3030', 'Red'], ['#3ddc84', 'Green'], ['#5aa9ff', 'Blue'], ['#ffb3d9', 'Pink']];
  // SOS in Morse code as on/off times in ms: dot 1 unit, dash 3, gap 1 inside a letter, 3 between letters, 7 before it repeats
  function sos() {
    var out = [];
    ['...', '---', '...'].forEach(function (L, li) { L.split('').forEach(function (c, ci) { out.push(c === '.' ? UNIT : 3 * UNIT); out.push(ci < 2 ? UNIT : li < 2 ? 3 * UNIT : 7 * UNIT); }); });
    return out;
  }
  var color = T.store.get('torch-color', '#ffffff'), level = 100, mode = 'on', timer = 0, lock = null;
  var panel = h('div', { role: 'button', tabindex: '0', 'aria-label': 'Screen light. Tap for full screen.', style: 'height:min(56vh,460px);border-radius:18px;border:1px solid var(--line);cursor:pointer;transition:background-color .15s;display:grid;place-items:end center;padding:12px;box-sizing:border-box' });
  var hint = h('small', { style: 'background:rgba(0,0,0,.45);color:#fff;padding:4px 10px;border-radius:999px', text: 'Tap for full screen' });
  panel.appendChild(hint);
  var pick = h('input', { type: 'color', value: color, 'aria-label': 'Any colour' });
  var bright = h('input', { type: 'range', min: '10', max: '100', value: '100', 'aria-label': 'Brightness' });
  var read = h('div', { 'data-out': '', style: 'text-align:center;font-weight:700' });
  function paint(on) {
    var v = level / 100, c = color.replace('#', ''), r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    panel.style.backgroundColor = on ? 'rgb(' + Math.round(r * v) + ',' + Math.round(g * v) + ',' + Math.round(b * v) + ')' : '#000';
  }
  function label() { var n = COLORS.filter(function (c) { return c[0] === color; })[0]; read.textContent = (n ? n[1] : color.toUpperCase()) + ' light · ' + level + '% · ' + (mode === 'on' ? 'steady' : mode === 'blink' ? 'slow blink' : 'SOS'); }
  function run() {
    clearTimeout(timer);
    if (mode === 'on') { paint(true); return label(); }
    var seq = mode === 'blink' ? [500, 500] : sos(), i = 0;
    (function step() { paint(i % 2 === 0); timer = setTimeout(function () { i = (i + 1) % seq.length; step(); }, seq[i]); })();
    label();
  }
  function setColor(c) { color = c; pick.value = c; T.store.set('torch-color', c); run(); }
  function awake() {
    if (lock || !navigator.wakeLock) return;
    navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }, function () {});
  }
  function full() {
    awake();
    var el = panel;
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (el.requestFullscreen) el.requestFullscreen().catch(function () { status.info('Full screen is not allowed here: turn your screen brightness up instead.'); });
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else status.info('This browser has no full screen. Turn your screen brightness to maximum for the most light.');
  }
  document.addEventListener('fullscreenchange', function () { var f = document.fullscreenElement === panel; panel.style.borderRadius = f ? '0' : '18px'; panel.style.height = f ? '100vh' : 'min(56vh,460px)'; hint.textContent = f ? 'Tap to close' : 'Tap for full screen'; });
  panel.addEventListener('click', full);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); full(); } });
  pick.addEventListener('input', function () { setColor(pick.value); });
  bright.addEventListener('input', function () { level = +bright.value; run(); });
  window.addEventListener('pagehide', function () { clearTimeout(timer); if (lock) lock.release(); });
  spot.appendChild(T.card([panel, read,
    T.row(COLORS.map(function (c) { return h('button', { type: 'button', 'class': 'tbtn tbtn-sm', 'aria-label': c[1], title: c[1], style: 'background:' + c[0] + ';color:#111;border-color:#999', text: c[1], onclick: function () { setColor(c[0]); } }); }).concat([pick])),
    T.field('Brightness', bright),
    T.seg([['on', 'Steady'], ['blink', 'Slow blink'], ['sos', 'SOS']], 'on', function (v) { mode = v; run(); }),
    T.row([T.button('Full screen light', { primary: true, onclick: full }), T.button('Keep screen on', { small: true, onclick: function () { if (!navigator.wakeLock) status.info('This browser cannot keep the screen awake: tap the light now and then.'); else { awake(); status.ok('The screen will stay on while this page is open.'); } } })]),
    status.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  run();
  T.tests['flashlight'] = function () {
    var f = [], s = sos(), sum = s.reduce(function (a, b) { return a + b; }, 0);
    if (s.length !== 18) f.push('sos steps ' + s.length);
    if (sum !== 34 * UNIT) f.push('sos length ' + sum);
    if (s[6] !== 3 * UNIT || s[17] !== 7 * UNIT) f.push('dash or gap');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
