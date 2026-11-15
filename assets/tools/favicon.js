/* Infinity by GroupChatOn — favicon. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Favicon generator: favicon.ico, PNG icons, Apple touch icon, Android icons and the web manifest from an image, a letter or an emoji. */
GCOTools.register('favicon', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), src = null;
  var SIZES = [[16, 'favicon-16x16.png'], [32, 'favicon-32x32.png'], [48, 'favicon-48x48.png'], [180, 'apple-touch-icon.png'], [192, 'android-chrome-192x192.png'], [512, 'android-chrome-512x512.png']];
  function ico(pngs) {
    var head = 6 + 16 * pngs.length, total = pngs.reduce(function (s, p) { return s + p.bytes.length; }, head), buf = new Uint8Array(total), dv = new DataView(buf.buffer), off = head;
    dv.setUint16(0, 0, true); dv.setUint16(2, 1, true); dv.setUint16(4, pngs.length, true);
    pngs.forEach(function (p, i) {
      var e = 6 + 16 * i; buf[e] = buf[e + 1] = p.size >= 256 ? 0 : p.size;
      dv.setUint16(e + 4, 1, true); dv.setUint16(e + 6, 32, true); dv.setUint32(e + 8, p.bytes.length, true); dv.setUint32(e + 12, off, true);
      buf.set(p.bytes, off); off += p.bytes.length;
    });
    return buf;
  }
  function shape(g, s, kind) {
    g.beginPath();
    if (kind === 'circle') g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    else if (kind === 'round') { var r = s * 0.22; g.moveTo(r, 0); g.arcTo(s, 0, s, s, r); g.arcTo(s, s, 0, s, r); g.arcTo(0, s, 0, 0, r); g.arcTo(0, 0, s, 0, r); }
    else g.rect(0, 0, s, s);
    g.closePath();
  }
  function draw(s, o, solid) {
    var c = h('canvas'); c.width = c.height = s; var g = c.getContext('2d');
    g.save(); shape(g, s, o.shape); g.clip();
    if (o.bg || solid) { g.fillStyle = o.bg || '#ffffff'; g.fillRect(0, 0, s, s); }
    if (o.mode === 'text') {
      g.fillStyle = o.fg; g.textAlign = 'center'; g.textBaseline = 'middle';
      var t = o.text || 'A', fs = s * (Array.from(t).length > 1 ? 0.5 : 0.68);
      g.font = '800 ' + fs + 'px system-ui,"Segoe UI","Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
      while (g.measureText(t).width > s * 0.86 && fs > 4) { fs *= 0.9; g.font = '800 ' + fs + 'px system-ui,"Segoe UI Emoji",sans-serif'; }
      g.fillText(t, s / 2, s / 2 + s * 0.04);
    } else if (src) {
      var p = s * o.pad / 100, box = s - 2 * p, k = Math.min(box / src.naturalWidth, box / src.naturalHeight), w = src.naturalWidth * k, hh = src.naturalHeight * k;
      g.imageSmoothingQuality = 'high'; g.drawImage(src, (s - w) / 2, (s - hh) / 2, w, hh);
    }
    g.restore();
    return c;
  }
  var mode = T.seg([['image', 'From an image'], ['text', 'From a letter or emoji']], 'text', function () { imgBox.hidden = mode.value() !== 'image'; txtBox.hidden = mode.value() !== 'text'; paint(); });
  var text = h('input', { type: 'text', value: 'G', maxlength: '4', 'aria-label': 'Letters or emoji', style: 'font-size:20px' }), fg = h('input', { type: 'color', value: '#ffffff' }), bgc = h('input', { type: 'color', value: '#0ea5e9' });
  var useBg = h('input', { type: 'checkbox', checked: true }), shp = T.select([['round', 'Rounded square'], ['circle', 'Circle'], ['square', 'Square']], 'round'), pad = h('input', { type: 'range', min: '0', max: '30', value: '8' });
  var name = h('input', { type: 'text', value: 'My Site', 'aria-label': 'Site name' }), row = h('div', { style: 'display:flex;flex-wrap:wrap;gap:14px;align-items:end;justify-content:center;padding:12px;border-radius:14px;background:var(--bg)' });
  var html = h('textarea', { rows: '7', 'class': 'tout tmono', readonly: true, 'aria-label': 'HTML for your site' });
  var imgBox = h('div', { hidden: true, style: 'display:grid;gap:12px' }, [T.dropzone({ accept: 'image/*,.svg', paste: true, icon: '⭐', label: 'Choose your logo', hint: 'A square PNG or SVG of 512 px or more works best',
    onFiles: function (l) { var im = new Image(); im.onload = function () { src = im; paint(); }; im.onerror = function () { status.error('That image could not be opened.'); }; im.src = URL.createObjectURL(l[0]); } }), T.field('Padding', pad)]);
  var txtBox = h('div', { 'class': 'tgrid2' }, [T.field('Letters or emoji', text), T.field('Text colour', fg)]);
  function o() { return { mode: mode.value(), text: text.value.trim(), fg: fg.value, bg: useBg.checked ? bgc.value : '', shape: shp.value, pad: +pad.value }; }
  function paint() {
    row.innerHTML = '';
    [16, 32, 48, 180].forEach(function (s) { var c = draw(s, o()); c.style.cssText = 'width:' + Math.max(s, 16) * (s < 48 ? 2 : 0.5) + 'px;image-rendering:' + (s < 48 ? 'pixelated' : 'auto'); row.appendChild(h('div', { style: 'text-align:center;font-size:12px' }, [c, h('br'), s + ' px'])); });
    html.value = ['<link rel="icon" href="/favicon.ico" sizes="48x48">', '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">', '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png">', '<link rel="manifest" href="/site.webmanifest">', '<meta name="theme-color" content="' + (o().bg || '#ffffff') + '">'].join('\n');
  }
  function manifest() {
    return JSON.stringify({ name: name.value || 'My Site', short_name: (name.value || 'Site').slice(0, 12), icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }, { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }],
      theme_color: o().bg || '#ffffff', background_color: '#ffffff', display: 'standalone' }, null, 2);
  }
  function run() {
    if (mode.value() === 'image' && !src) { status.error('Choose your logo image first.'); return; }
    var op = o(), out = [];
    Promise.all(SIZES.map(function (s) { return T.canvasBlob(draw(s[0], op, s[0] === 180), 'image/png').then(function (b) { return { s: s, b: b }; }); })).then(function (l) {
      l.forEach(function (x) { out.push({ name: x.s[1], blob: x.b, preview: URL.createObjectURL(x.b), note: x.s[0] + ' × ' + x.s[0] }); });
      return Promise.all(l.filter(function (x) { return x.s[0] <= 48; }).map(function (x) { return x.b.arrayBuffer().then(function (a) { return { size: x.s[0], bytes: new Uint8Array(a) }; }); }));
    }).then(function (p) {
      out.unshift({ name: 'favicon.ico', blob: new Blob([ico(p)], { type: 'image/x-icon' }), icon: '⭐', note: '16, 32 and 48 px inside' });
      out.push({ name: 'site.webmanifest', blob: new Blob([manifest()], { type: 'application/manifest+json' }), icon: '📄' });
      results.set(out, 'favicon'); status.ok('Your favicon pack is ready. Upload the files to your site’s main folder and paste the HTML into <head>.');
    }).catch(status.error);
  }
  [text, fg, bgc, useBg, shp, pad, name].forEach(function (x) { x.addEventListener('input', paint); x.addEventListener('change', paint); });
  var copy = T.button('Copy HTML', { onclick: function () { T.copy(html.value, copy); } });
  spot.appendChild(T.card([T.field('Make it', mode), imgBox, txtBox, h('div', { 'class': 'tgrid2' }, [T.field('Background', T.row([useBg, bgc])), T.field('Shape', shp), T.field('Site name (for the manifest)', name)]),
    row, T.row([T.button('Create favicon pack', { primary: true, onclick: run }), T.button('Try a sample', { small: true, onclick: function () { text.value = '🚀'; bgc.value = '#1e293b'; paint(); run(); } })]),
    status.el, results.el, T.field('HTML for your <head>', html), T.row([copy])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  paint();
  T.tests['favicon'] = function () {
    var f = [], b = ico([{ size: 16, bytes: new Uint8Array([1, 2, 3]) }, { size: 256, bytes: new Uint8Array([4, 5]) }]), dv = new DataView(b.buffer);
    if (b.length !== 6 + 32 + 5 || dv.getUint16(2, true) !== 1 || dv.getUint16(4, true) !== 2) f.push('ico header');
    if (b[6] !== 16 || b[22] !== 0 || dv.getUint32(6 + 12, true) !== 38 || dv.getUint32(22 + 12, true) !== 41 || b[38] !== 1 || b[41] !== 4) f.push('ico entries');
    var c = draw(32, { mode: 'text', text: 'A', fg: '#ffffff', bg: '#ff0000', shape: 'circle', pad: 0 }), g = c.getContext('2d');
    if (g.getImageData(0, 0, 1, 1).data[3] !== 0 || g.getImageData(4, 16, 1, 1).data[0] < 200) f.push('circle shape');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
