/* Infinity by GroupChatOn — screenshot-frame. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Screenshot mock-up frames: put a screenshot in a browser window or phone frame on a gradient background with shadow, ready for slides, posts and app stores. */
GCOTools.register('screenshot-frame', function (spot, T) {
  var h = T.h, status = T.status(), results = (function (r) { var s = r.set; r.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; r.set = function (l, z) { s(l, z); var g = r.el.querySelector('.tresults-grid'); if (g) g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }; return r; })(T.results());
  var BGS = { sunset: ['#f093fb', '#f5576c'], ocean: ['#4facfe', '#00f2fe'], violet: ['#667eea', '#764ba2'], mint: ['#43e97b', '#38f9d7'], peach: ['#fa709a', '#fee140'], night: ['#30cfd0', '#330867'] };
  function rr(g, x, y, w, hh, r) { r = Math.max(0, Math.min(r, w / 2, hh / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function dims(iw, ih, o) {
    var bar = /browser/.test(o.style) ? Math.max(28, Math.min(80, Math.round(iw * 0.045))) : 0, bez = o.style === 'phone' ? Math.round(Math.min(iw, ih) * 0.045) + 6 : 0;
    var fw = iw + 2 * bez, fh = ih + bar + 2 * bez, pad = Math.round(Math.max(fw, fh) * o.pad / 100);
    return { bar: bar, bez: bez, fw: fw, fh: fh, pad: pad, W: fw + 2 * pad, H: fh + 2 * pad };
  }
  function render(img, o) {
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, d = dims(iw, ih, o), c = h('canvas'); c.width = d.W; c.height = d.H; var g = c.getContext('2d');
    if (o.bg !== 'none') { if (BGS[o.bg]) { var gr = g.createLinearGradient(0, 0, d.W, d.H); gr.addColorStop(0, BGS[o.bg][0]); gr.addColorStop(1, BGS[o.bg][1]); g.fillStyle = gr; } else g.fillStyle = o.bg; g.fillRect(0, 0, d.W, d.H); }
    var x = d.pad, y = d.pad, rad = o.style === 'phone' ? Math.round(Math.min(d.fw, d.fh) * 0.09) : o.radius, dark = o.style === 'browser-dark';
    g.save(); if (o.shadow && d.pad) { g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = Math.round(d.pad * 0.6); g.shadowOffsetY = Math.round(d.pad * 0.15); }
    rr(g, x, y, d.fw, d.fh, rad); g.fillStyle = o.style === 'phone' ? '#111111' : dark ? '#1f2937' : o.style === 'plain' ? '#ffffff' : '#e5e7eb'; g.fill(); g.restore();
    if (d.bar) {
      var r = Math.round(d.bar * 0.16), cy = y + d.bar / 2;
      ['#ff5f57', '#febc2e', '#28c840'].forEach(function (col, i) { g.fillStyle = col; g.beginPath(); g.arc(x + d.bar * 0.55 + i * r * 3.2, cy, r, 0, Math.PI * 2); g.fill(); });
      var uw = Math.min(d.fw * 0.5, Math.max(d.fw * 0.3, 200)), uh = Math.round(d.bar * 0.56);
      rr(g, x + (d.fw - uw) / 2, cy - uh / 2, uw, uh, uh / 2); g.fillStyle = dark ? '#374151' : '#ffffff'; g.fill();
      if (o.url) { g.fillStyle = dark ? '#d1d5db' : '#4b5563'; g.font = Math.round(uh * 0.55) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.url.length > 60 ? o.url.slice(0, 59) + '…' : o.url, x + d.fw / 2, cy, uw - 20); }
    }
    g.save();
    var sx = x + d.bez, sy = y + d.bar + d.bez;
    if (o.style === 'phone') rr(g, sx, sy, iw, ih, Math.max(0, rad - d.bez));
    else if (d.bar) { g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + iw, sy); g.lineTo(sx + iw, sy + ih - rad); g.arcTo(sx + iw, sy + ih, sx + iw - rad, sy + ih, rad); g.lineTo(sx + rad, sy + ih); g.arcTo(sx, sy + ih, sx, sy + ih - rad, rad); g.closePath(); }
    else rr(g, sx, sy, iw, ih, rad);
    g.clip(); g.drawImage(img, sx, sy, iw, ih); g.restore();
    if (o.style === 'phone') { var nw = Math.round(iw * 0.28), nh = Math.round(d.bez * 0.9 + iw * 0.02); rr(g, x + (d.fw - nw) / 2, sy + Math.round(iw * 0.015), nw, nh, nh / 2); g.fillStyle = '#111111'; g.fill(); }
    return c;
  }
  var img = null, name = 'screenshot';
  var style = T.seg([['browser-light', 'Browser'], ['browser-dark', 'Dark browser'], ['phone', 'Phone'], ['plain', 'Plain']], 'browser-light', draw);
  var bg = T.seg(Object.keys(BGS).map(function (k) { return [k, k[0].toUpperCase() + k.slice(1)]; }).concat([['solid', 'Solid'], ['none', 'Transparent']]), 'violet', draw), solid = h('input', { type: 'color', value: '#f3f4f6', 'aria-label': 'Solid colour' });
  var pad = h('input', { type: 'range', min: '0', max: '25', value: '8', 'aria-label': 'Padding' }), radius = h('input', { type: 'range', min: '0', max: '40', value: '12', 'aria-label': 'Corners' }), shadow = h('input', { type: 'checkbox', checked: true });
  var url = h('input', { type: 'text', value: 'example.com', placeholder: 'Text in the address bar' }), cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Preview' }), prev = h('div', { 'class': 'tfit-prev is-checker' }, [cv]);
  [solid, pad, radius, shadow, url].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  function opts() { var b = bg.value(); return { style: style.value(), bg: b === 'solid' ? solid.value : b, pad: +pad.value, radius: +radius.value, shadow: shadow.checked, url: url.value }; }
  function draw() { if (!img) return; var c = render(img, opts()), k = Math.min(1, 900 / Math.max(c.width, c.height)); cv.width = Math.round(c.width * k); cv.height = Math.round(c.height * k); cv.getContext('2d').drawImage(c, 0, 0, cv.width, cv.height); }
  function open(src, n) { var im = new Image(); im.onload = function () { img = im; name = n || 'screenshot'; go.disabled = false; results.clear(); status.clear(); draw(); if (n === 'sample') save(); }; im.onerror = function () { status.error('This image could not be opened. Try a PNG or JPG screenshot.'); }; im.src = src; }
  function save() { var c = render(img, opts()); return T.canvasBlob(c, 'image/png').then(function (b) { results.set([{ name: name + '-framed.png', blob: b, preview: URL.createObjectURL(b), note: c.width + ' × ' + c.height }]); status.ok('Framed! PNG keeps the transparent and rounded edges.'); }); }
  var go = T.button('Save PNG', { primary: true, disabled: true, onclick: save });
  function sample() {
    var c = h('canvas'); c.width = 1280; c.height = 760; var g = c.getContext('2d'); g.fillStyle = '#f8fafc'; g.fillRect(0, 0, 1280, 760); g.fillStyle = '#0f172a'; g.fillRect(0, 0, 240, 760);
    g.fillStyle = '#334155'; for (var i = 0; i < 6; i++) g.fillRect(28, 90 + i * 56, 180, 28);
    ['#6366f1', '#22c55e', '#f59e0b'].forEach(function (col, i) { g.fillStyle = '#ffffff'; g.fillRect(280 + i * 320, 40, 290, 150); g.fillStyle = col; g.fillRect(300 + i * 320, 140, 120, 24); g.fillStyle = '#0f172a'; g.font = 'bold 44px system-ui,sans-serif'; g.fillText(['1,284', '96%', '42'][i], 300 + i * 320, 110); });
    g.fillStyle = '#ffffff'; g.fillRect(280, 230, 950, 480); g.strokeStyle = '#6366f1'; g.lineWidth = 6; g.beginPath(); g.moveTo(320, 640);
    [560, 600, 480, 520, 380, 420, 300, 340, 280].forEach(function (yy, i) { g.lineTo(320 + (i + 1) * 100, yy); }); g.stroke();
    open(c.toDataURL('image/png'), 'sample');
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', paste: true, icon: '🖥️', label: 'Choose or paste a screenshot', hint: 'PNG or JPG · nothing is uploaded', onFiles: function (f) { open(URL.createObjectURL(f[0]), T.baseName(f[0].name)); } }),
    T.field('Frame', style), prev, T.field('Background', bg), h('div', { 'class': 'tgrid2' }, [T.field('Solid colour', solid), T.field('Space around', pad), T.field('Rounded corners', radius), T.field('Address bar text', url)]),
    h('label', { 'class': 'tcheck' }, [shadow, ' Soft shadow']), T.row([go, T.button('Try a sample', { small: true, onclick: sample })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['screenshot-frame'] = function () {
    var f = [], d = dims(1000, 600, { style: 'browser-light', pad: 10 });
    if (d.bar !== 45 || d.W !== 1200 || d.H !== 845) f.push('browser dims ' + JSON.stringify(d));
    var p = dims(400, 800, { style: 'phone', pad: 0 }); if (p.bez !== 24 || p.W !== 448 || p.H !== 848) f.push('phone dims ' + JSON.stringify(p));
    var im = h('canvas'); im.width = 200; im.height = 100; var ig = im.getContext('2d'); ig.fillStyle = '#00ff00'; ig.fillRect(0, 0, 200, 100);
    var out = render(im, { style: 'browser-light', bg: '#ff0000', pad: 10, radius: 8, shadow: false, url: 'a.com' }), g = out.getContext('2d');
    var bgPx = g.getImageData(2, 2, 1, 1).data, mid = g.getImageData(out.width / 2, out.height - 60, 1, 1).data, barPx = g.getImageData(out.width - 30, 20 + 14, 1, 1).data;
    if (bgPx[0] !== 255 || bgPx[1] !== 0) f.push('background ' + bgPx);
    if (mid[1] !== 255 || mid[0] !== 0) f.push('screenshot area ' + mid);
    if (barPx[0] !== 229 || barPx[1] !== 231) f.push('title bar ' + barPx);
    var tr = render(im, { style: 'plain', bg: 'none', pad: 10, radius: 0, shadow: false }); if (tr.getContext('2d').getImageData(1, 1, 1, 1).data[3] !== 0) f.push('transparent');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
