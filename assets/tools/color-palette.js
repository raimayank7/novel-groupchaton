/* Infinity by GroupChatOn — color-palette. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Colour palette generator: harmonious palettes (analogous, complementary, triadic…) from a base colour or at random, copy as HEX or CSS variables. */
GCOTools.register('color-palette', function (spot, T) {
  var h = T.h;
  function hex2hsl(x) {
    var n = parseInt(x.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, hh = 0, s = 0;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; if (hh < 0) hh += 360; }
    return [hh, s * 100, l * 100];
  }
  function hsl2hex(hh, s, l) {
    hh = ((hh % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((hh / 60) % 2 - 1)), m = l - c / 2, rgb = hh < 60 ? [c, x, 0] : hh < 120 ? [x, c, 0] : hh < 180 ? [0, c, x] : hh < 240 ? [0, x, c] : hh < 300 ? [x, 0, c] : [c, 0, x];
    return '#' + rgb.map(function (v) { return ('0' + Math.round((v + m) * 255).toString(16)).slice(-2); }).join('');
  }
  function scheme(base, kind) {
    var p = hex2hsl(base), H = p[0], S = p[1], L = p[2];
    var rot = { analogous: [-30, -15, 0, 15, 30], complementary: [0, 180], triadic: [0, 120, 240], tetradic: [0, 90, 180, 270], split: [0, 150, 210] }[kind];
    if (kind === 'mono') return [-30, -15, 0, 15, 30].map(function (d) { return hsl2hex(H, S, Math.max(8, Math.min(92, L + d))); });
    var out = rot.map(function (d) { return hsl2hex(H + d, S, L); });
    if (kind === 'complementary') out = [hsl2hex(H, S, Math.min(92, L + 25)), out[0], hsl2hex(H, S, Math.max(8, L - 25)), out[1], hsl2hex(H + 180, S, Math.min(92, L + 25))];
    return out;
  }
  function ink(x) {   // whichever of dark or white text has the higher contrast (WCAG luminance)
    var n = parseInt(x.slice(1), 16), L = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    L = 0.2126 * L[0] + 0.7152 * L[1] + 0.0722 * L[2];
    return (L + 0.05) / 0.0556 > 1.05 / (L + 0.05) ? '#111' : '#fff';   // 0.0556 = luminance of #111 + 0.05
  }
  var base = h('input', { type: 'color', value: T.store.get('palette-base', '#3b82f6'), style: 'width:64px;height:44px;padding:2px', 'aria-label': 'Base colour' });
  var kind = T.select([['analogous', 'Analogous (calm, side by side)'], ['complementary', 'Complementary (strong contrast)'], ['triadic', 'Triadic (lively, balanced)'],
    ['split', 'Split complementary'], ['tetradic', 'Tetradic (four colours)'], ['mono', 'Monochrome (one colour, light to dark)']], 'analogous');
  var row = h('div', { 'data-out': '', style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px' }), css = h('textarea', { rows: '6', 'class': 'tout tmono', readonly: true, 'aria-label': 'CSS variables' }), cur = [];
  function draw() {
    T.store.set('palette-base', base.value);
    cur = scheme(base.value, kind.value); row.innerHTML = '';
    cur.forEach(function (c) {
      row.appendChild(h('button', { type: 'button', title: 'Copy ' + c, style: 'height:120px;border-radius:14px;border:1px solid var(--line);background:' + c + ';color:' + ink(c) + ';font:700 14px ui-monospace,Consolas,monospace;cursor:pointer',
        text: c.toUpperCase(), onclick: function (e) { T.copy(c.toUpperCase(), e.currentTarget); } }));
    });
    css.value = ':root {\n' + cur.map(function (c, i) { return '  --color-' + (i + 1) + ': ' + c + ';'; }).join('\n') + '\n}';
  }
  base.addEventListener('input', draw); kind.addEventListener('change', draw);
  var copyHex = T.button('Copy HEX list', { onclick: function () { T.copy(cur.join(', '), copyHex); } }), copyCss = T.button('Copy CSS', { onclick: function () { T.copy(css.value, copyCss); } });
  spot.appendChild(T.card([T.row([T.field('Base colour', base), T.field('Harmony', kind)]),
    T.row([T.button('Random palette', { primary: true, onclick: function () { base.value = hsl2hex(Math.random() * 360, 55 + Math.random() * 35, 40 + Math.random() * 25); var o = kind.options; kind.value = o[Math.floor(Math.random() * o.length)].value; draw(); } })]),
    row, h('p', { 'class': 'tstatus', text: 'Tap a colour to copy its code.' }), T.field('CSS variables', css), T.row([copyHex, copyCss])]));
  draw();
  T.tests['color-palette'] = function () {
    var f = [], c = scheme('#ff0000', 'triadic').join(), k = scheme('#ff0000', 'complementary');
    if (c !== '#ff0000,#00ff00,#0000ff') f.push('triadic ' + c);
    if (k[1] !== '#ff0000' || k[3] !== '#00ffff' || k.length !== 5) f.push('complementary ' + k);
    ['#3b82f6', '#123456', '#ffffff', '#000000'].forEach(function (x) { var p = hex2hsl(x); if (hsl2hex(p[0], p[1], p[2]) !== x) f.push('round trip ' + x); });
    if (scheme('#808080', 'mono').length !== 5 || ink('#ffffff') !== '#111') f.push('mono / ink');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
