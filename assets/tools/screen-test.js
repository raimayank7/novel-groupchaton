/* Infinity by GroupChatOn — screen-test. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Dead pixel and screen test: full-screen solid colours, gradients and fine patterns, plus screen size, pixel ratio and refresh rate. */
GCOTools.register('screen-test', function (spot, T) {
  var h = T.h, status = T.status();
  var TESTS = [['#ff0000', 'Red'], ['#00ff00', 'Green'], ['#0000ff', 'Blue'], ['#ffffff', 'White'], ['#000000', 'Black'], ['#808080', 'Grey'], ['#ffff00', 'Yellow'], ['#00ffff', 'Cyan'], ['#ff00ff', 'Magenta'],
    ['linear-gradient(90deg,#000,#fff)', 'Grey gradient (look for bands)'], ['linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)', 'Colour gradient'],
    ['repeating-conic-gradient(#000 0 25%,#fff 0 50%) 0 0/2px 2px', 'Fine checkerboard (sharpness)'], ['repeating-linear-gradient(90deg,#000 0 1px,#fff 1px 3px)', 'Thin lines (focus and flicker)']];
  var COMMON = [30, 50, 60, 72, 75, 90, 100, 120, 144, 165, 170, 180, 200, 240, 360];
  function hz(deltas) {
    var d = deltas.filter(function (x) { return x > 1 && x < 200; }).sort(function (a, b) { return a - b; });
    if (!d.length) return 0;
    var raw = 1000 / d[Math.floor(d.length / 2)], best = COMMON.reduce(function (a, b) { return Math.abs(b - raw) < Math.abs(a - raw) ? b : a; });
    return Math.abs(best - raw) / best < 0.04 ? best : Math.round(raw);
  }
  var ov = null, idx = 0, hideT = 0;
  function paintOv() {
    ov.style.background = TESTS[idx][0];
    ov.firstChild.textContent = (idx + 1) + ' / ' + TESTS.length + ' · ' + TESTS[idx][1] + ' · tap or → for next, ← back, Esc to exit';
    ov.firstChild.style.opacity = '1'; clearTimeout(hideT); hideT = setTimeout(function () { if (ov) ov.firstChild.style.opacity = '0'; }, 2500);
  }
  function key(e) { if (!ov) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft' || e.key === 'Backspace') { idx = (idx + TESTS.length - 1) % TESTS.length; paintOv(); } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); idx = (idx + 1) % TESTS.length; paintOv(); } }
  function close() { if (!ov) return; if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {}); ov.remove(); ov = null; document.removeEventListener('keydown', key); }
  function open(i) {
    idx = i || 0;
    ov = h('div', { style: 'position:fixed;inset:0;z-index:2147483647;cursor:none;user-select:none', role: 'dialog', 'aria-label': 'Screen test' }, [
      h('div', { style: 'position:absolute;left:50%;bottom:24px;transform:translateX(-50%);padding:8px 14px;border-radius:999px;background:rgba(0,0,0,.7);color:#fff;font:14px/1.3 system-ui,sans-serif;transition:opacity .6s;white-space:nowrap;max-width:94vw;overflow:hidden;text-overflow:ellipsis' }),
      h('button', { type: 'button', 'aria-label': 'Exit the screen test', text: '✕', style: 'position:absolute;top:10px;right:10px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(128,128,128,.35);color:#fff;font-size:18px;cursor:pointer', onclick: function (e) { e.stopPropagation(); close(); } })]);
    ov.addEventListener('click', function () { idx = (idx + 1) % TESTS.length; paintOv(); });
    document.body.appendChild(ov); document.addEventListener('keydown', key); paintOv();
    if (ov.requestFullscreen) ov.requestFullscreen().catch(function () {});
    document.addEventListener('fullscreenchange', function fc() { if (!document.fullscreenElement) { document.removeEventListener('fullscreenchange', fc); close(); } });
  }
  var info = h('div', { 'class': 'tstats', 'data-out': '' });
  function drawInfo(rate) {
    var dpr = window.devicePixelRatio || 1, s = window.screen || {};
    info.innerHTML = '';
    [[s.width + ' × ' + s.height, 'Screen size (CSS pixels)'], [Math.round(s.width * dpr) + ' × ' + Math.round(s.height * dpr), 'Real pixels (about)'], [String(Math.round(dpr * 100) / 100), 'Pixel ratio'],
      [window.innerWidth + ' × ' + window.innerHeight, 'Browser window'], [(s.colorDepth || 24) + '-bit', 'Colour depth'], [rate ? rate + ' Hz' : 'Press Measure', 'Refresh rate']].forEach(function (r) {
      info.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: r[0] }), h('span', { text: r[1] })]));
    });
  }
  function measure() {
    status.info('Measuring for 2 seconds: keep this tab in front and do not scroll…');
    var last = 0, d = [], end = performance.now() + 2000;
    (function f(t) { if (last) d.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else { var r = hz(d); drawInfo(r); status.ok(r ? 'Your screen refreshes about ' + r + ' times a second.' : 'Could not measure: the tab was hidden.'); } })(performance.now());
  }
  var sw = h('div', { 'class': 'trow', style: 'gap:6px' }, TESTS.map(function (t, i) { return h('button', { type: 'button', title: t[1], 'aria-label': 'Start with ' + t[1], onclick: function () { open(i); }, style: 'width:40px;height:40px;border-radius:10px;border:1px solid var(--line);cursor:pointer;background:' + t[0] }); }));
  spot.appendChild(T.card([T.row([T.button('▶ Start full-screen test', { primary: true, onclick: function () { open(0); } }), T.button('Measure refresh rate', { small: true, onclick: measure })]), sw, status.el, info,
    h('p', { 'class': 'tnote', text: 'Clean the screen first, then look closely at each colour. A dead pixel stays black on every colour; a stuck pixel stays one bright colour (red, green or blue). Bright dots on black or dark dots on white are easiest to spot.' })]));
  drawInfo(0);
  window.addEventListener('resize', function () { drawInfo(0); });
  T.tests['screen-test'] = function () {
    var f = [], a = [], b = [];
    for (var i = 0; i < 60; i++) { a.push(16.6 + (i % 3) * 0.05); b.push(8.33); }
    if (hz(a) !== 60) f.push('60 Hz ' + hz(a)); if (hz(b) !== 120) f.push('120 Hz ' + hz(b)); if (hz([]) !== 0) f.push('empty');
    if (hz([6.94, 6.95, 6.94]) !== 144) f.push('144 Hz');
    open(3); var bgc = ov && getComputedStyle(ov).backgroundColor; close();
    if (bgc !== 'rgb(255, 255, 255)') f.push('overlay colour ' + bgc);
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
