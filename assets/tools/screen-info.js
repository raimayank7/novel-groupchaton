/* Infinity by GroupChatOn — screen-info. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* My screen: screen and window size, pixel ratio, real pixels, aspect ratio, colour depth, refresh rate, HDR, touch and display preferences. */
GCOTools.register('screen-info', function (spot, T) {
  var h = T.h, fps = null;
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  var NAMED = [[16, 9], [16, 10], [4, 3], [3, 2], [21, 9], [5, 4], [1, 1], [18, 9], [19.5, 9], [20, 9], [32, 9]];
  function aspect(w, hh) {
    if (!w || !hh) return '–';
    var g = gcd(w, hh), exact = (w / g) + ':' + (hh / g), r = Math.max(w, hh) / Math.min(w, hh), best = null, bestR = 0;
    NAMED.forEach(function (n) { var nr = n[0] / n[1]; if (Math.abs(nr - r) / nr < 0.02 && !best) { best = n[0] + ':' + n[1]; bestR = nr; } });
    if (w < hh && best) best = best.split(':').reverse().join(':');
    return best ? (Math.abs(bestR - r) < 1e-9 ? best : '≈ ' + best + ' (' + exact + ')') : exact;
  }
  function mq(q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } }
  var box = h('div', { 'class': 'tkv', 'data-out': '' }), big = h('div', { style: 'text-align:center;font:800 32px/1.2 var(--ui)' });
  function rows() {
    var s = screen, dpr = window.devicePixelRatio || 1, o = (s.orientation && s.orientation.type) || (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    return [
      ['Screen size', s.width + ' × ' + s.height + ' (CSS pixels)'],
      ['Real pixels', Math.round(s.width * dpr) + ' × ' + Math.round(s.height * dpr)],
      ['Pixel ratio', String(Math.round(dpr * 100) / 100)],
      ['Browser window', window.innerWidth + ' × ' + window.innerHeight],
      ['Usable screen', s.availWidth + ' × ' + s.availHeight],
      ['Aspect ratio', aspect(s.width, s.height)],
      ['Orientation', o.replace('-primary', '').replace('-secondary', ' (upside down)')],
      ['Colour depth', s.colorDepth + '-bit'],
      ['Colour range', mq('(color-gamut: rec2020)') ? 'Rec. 2020 (very wide)' : mq('(color-gamut: p3)') ? 'Display P3 (wide)' : 'sRGB (standard)'],
      ['HDR', mq('(dynamic-range: high)') ? 'Yes' : 'No'],
      ['Refresh rate', fps ? '≈ ' + fps + ' Hz' : 'measuring…'],
      ['Touch screen', navigator.maxTouchPoints > 0 ? 'Yes, up to ' + navigator.maxTouchPoints + ' fingers' : 'No'],
      ['Dark mode', mq('(prefers-color-scheme: dark)') ? 'On' : 'Off'],
      ['Reduced motion', mq('(prefers-reduced-motion: reduce)') ? 'On' : 'Off'],
      ['Pointer', mq('(pointer: fine)') ? 'Mouse or trackpad' : mq('(pointer: coarse)') ? 'Finger' : 'None']
    ];
  }
  function draw() {
    big.textContent = screen.width + ' × ' + screen.height;
    box.innerHTML = '';
    rows().forEach(function (r) { box.appendChild(h('div', {}, [h('b', { text: r[0] }), h('code', { text: r[1] }), h('span')])); });
  }
  function measure() {
    var n = 0, t0 = null;
    function f(t) { if (t0 === null) t0 = t; else n++; if (t - t0 < 1000) return requestAnimationFrame(f); var v = n * 1000 / (t - t0), std = [30, 48, 50, 60, 75, 90, 100, 120, 144, 165, 240]; fps = std.reduce(function (a, b) { return Math.abs(b - v) < Math.abs(a - v) ? b : a; }); draw(); }
    requestAnimationFrame(f);
  }
  var cp = T.button('Copy all', { onclick: function () { T.copy(rows().map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'), cp); } });
  window.addEventListener('resize', draw);
  spot.appendChild(T.card([big, h('p', { 'class': 'tnote', style: 'text-align:center', text: 'Your screen size in CSS pixels (what websites see). Rotate or resize to see it update.' }), box,
    T.row([cp, T.button('Measure refresh rate again', { small: true, onclick: function () { fps = null; draw(); measure(); } })]),
    h('p', { 'class': 'tnote', text: 'Refresh rate is measured from how often the browser draws a frame; battery saver can lower it. Nothing about your device is sent anywhere.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw(); measure();
  T.tests['screen-info'] = function () {
    var f = [];
    if (aspect(1920, 1080) !== '16:9') f.push('1080p ' + aspect(1920, 1080));
    if (aspect(1366, 768) !== '≈ 16:9 (683:384)') f.push('1366 ' + aspect(1366, 768));
    if (aspect(1080, 1920) !== '9:16') f.push('portrait');
    if (aspect(1440, 900) !== '16:10') f.push('16:10');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
