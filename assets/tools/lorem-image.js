/* Infinity by GroupChatOn — lorem-image. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Placeholder image generator: any size, colours and label, as PNG, JPG, WebP or SVG, for mock-ups and layouts. */
GCOTools.register('lorem-image', function (spot, T) {
  var h = T.h;
  function label(o) { return o.text || (o.w + ' × ' + o.h); }
  function svg(o) {
    var fs = Math.max(10, Math.round(Math.min(o.w, o.h) / 6));
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + o.w + '" height="' + o.h + '" viewBox="0 0 ' + o.w + ' ' + o.h + '"><rect width="100%" height="100%" fill="' + o.bg + '"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="' + fs + '" font-weight="700" fill="' + o.fg + '">' +
      label(o).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text></svg>';
  }
  function draw(o) {
    var c = h('canvas'); c.width = o.w; c.height = o.h; var g = c.getContext('2d'), fs = Math.max(10, Math.round(Math.min(o.w, o.h) / 6));
    g.fillStyle = o.bg; g.fillRect(0, 0, o.w, o.h); g.fillStyle = o.fg; g.font = '700 ' + fs + 'px system-ui,Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    var t = label(o); while (g.measureText(t).width > o.w * 0.9 && fs > 8) { fs *= 0.9; g.font = '700 ' + fs + 'px system-ui,Arial,sans-serif'; }
    g.fillText(t, o.w / 2, o.h / 2); return c;
  }
  var w = h('input', { type: 'number', min: '1', max: '4000', value: '1200' }), hh = h('input', { type: 'number', min: '1', max: '4000', value: '630' }), bg = h('input', { type: 'color', value: '#cbd5e1' }), fg = h('input', { type: 'color', value: '#334155' });
  var text = h('input', { type: 'text', placeholder: 'Default: the size, e.g. 1200 × 630' }), fmt = T.select([['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP'], ['svg', 'SVG']], 'image/png');
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Preview' }), code = h('textarea', { rows: '3', 'class': 'tout tmono', readonly: true, 'aria-label': 'SVG data URL' }), status = T.status();
  var SIZES = [['1200×630', 1200, 630, 'Social share'], ['1080×1080', 1080, 1080, 'Instagram'], ['1280×720', 1280, 720, 'YouTube'], ['1920×1080', 1920, 1080, 'Full HD'], ['300×250', 300, 250, 'Ad box'], ['728×90', 728, 90, 'Banner'], ['512×512', 512, 512, 'Icon']];
  function o() { return { w: Math.max(1, Math.min(4000, Math.round(+w.value) || 1)), h: Math.max(1, Math.min(4000, Math.round(+hh.value) || 1)), bg: bg.value, fg: fg.value, text: text.value.trim() }; }
  function paint() { var op = o(), c = draw(op); cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0); code.value = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(op)); }
  [w, hh, bg, fg, text].forEach(function (x) { x.addEventListener('input', paint); });
  function save() {
    var op = o(), name = 'placeholder-' + op.w + 'x' + op.h;
    if (fmt.value === 'svg') { T.download(new Blob([svg(op)], { type: 'image/svg+xml' }), name + '.svg'); status.ok('Saved ' + name + '.svg'); return; }
    T.canvasBlob(draw(op), fmt.value, 0.9).then(function (b) { T.download(b, name + '.' + { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[fmt.value]); status.ok('Saved ' + op.w + ' × ' + op.h + ' (' + T.bytes(b.size) + ').'); });
  }
  var copy = T.button('Copy SVG data URL', { onclick: function () { T.copy(code.value, copy); } });
  spot.appendChild(T.card([T.field('Common sizes', T.row(SIZES.map(function (s) { return T.button(s[0] + ' · ' + s[3], { small: true, onclick: function () { w.value = s[1]; hh.value = s[2]; paint(); } }); }))),
    h('div', { 'class': 'tgrid2' }, [T.field('Width (px)', w), T.field('Height (px)', hh), T.field('Background', bg), T.field('Text colour', fg), T.field('Text', text), T.field('Format', fmt)]),
    h('div', { 'class': 'tfit-prev' }, [cv]), T.row([T.button('Download', { primary: true, onclick: save }), copy]), status.el, T.field('SVG data URL (use as src="…")', code)]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  paint();
  T.tests['lorem-image'] = function () {
    var f = [], s = svg({ w: 300, h: 150, bg: '#000000', fg: '#ffffff', text: '' });
    if (s.indexOf('width="300" height="150"') < 0 || s.indexOf('>300 × 150</text>') < 0) f.push('svg');
    var c = draw({ w: 40, h: 20, bg: '#ff0000', fg: '#ff0000', text: 'A&B' }), p = c.getContext('2d').getImageData(1, 1, 1, 1).data;
    if (c.width !== 40 || p[0] < 250) f.push('canvas');
    if (svg({ w: 1, h: 1, bg: '#fff', fg: '#000', text: 'A<&' }).indexOf('A&lt;&amp;') < 0) f.push('escape');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
