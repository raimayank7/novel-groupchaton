/* Infinity by GroupChatOn — letterhead. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Letterhead and business card maker: your logo and details on an A4 letterhead (print / PDF / Word) and a 3.5 × 2 inch card (PNG, print sheet). */
GCOTools.register('letterhead', function (spot, T) {
  var h = T.h;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var SAMPLE = { name: 'Sunrise Agro Traders', tag: 'Seeds · Fertilisers · Farm tools', addr: 'Shop 12, Grain Market, Ludhiana, Punjab 141001', phone: '+91 98765 43210', email: 'hello@example.com',
    web: 'www.example.com', reg: 'GSTIN: 03ABCDE1234F1Z5', person: 'Harpreet Singh', role: 'Proprietor', color: '#166534', style: 'band', logo: '' };
  var st = T.store.get('letterhead', null) || { name: '', tag: '', addr: '', phone: '', email: '', web: '', reg: '', person: '', role: '', color: '#1d4ed8', style: 'band', logo: '' };
  function keep() { T.store.set('letterhead', st); }
  function col(d) { return /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#1d4ed8'; }

  function letterHead(d) {
    var c = col(d), logo = d.logo ? '<img src="' + d.logo + '" alt="" style="max-height:64px;max-width:150px">' : '';
    var contact = [d.phone, d.email, d.web].filter(Boolean).map(esc).join('<br>');
    if (d.style === 'center') return '<div style="text-align:center;border-bottom:3px double ' + c + ';padding-bottom:10px">' + (logo ? logo + '<br>' : '') +
      '<div style="font-size:26px;font-weight:800;color:' + c + '">' + esc(d.name || 'Your Business Name') + '</div>' + (d.tag ? '<div style="color:#444">' + esc(d.tag) + '</div>' : '') +
      '<div style="font-size:12px;color:#333;margin-top:4px">' + [d.addr, d.phone, d.email, d.web].filter(Boolean).map(esc).join(' · ') + '</div></div>';
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;' + (d.style === 'side' ? 'border-left:10px solid ' + c + ';padding-left:14px' : 'border-bottom:4px solid ' + c + ';padding-bottom:10px') + '">' +
      '<div style="display:flex;gap:12px;align-items:center">' + logo + '<div><div style="font-size:24px;font-weight:800;color:' + c + ';line-height:1.15">' + esc(d.name || 'Your Business Name') + '</div>' +
      (d.tag ? '<div style="color:#444">' + esc(d.tag) + '</div>' : '') + '</div></div><div style="text-align:right;font-size:12px;color:#333">' + contact + '</div></div>';
  }
  function letterFoot(d) {
    var c = col(d), bits = [d.style === 'center' ? '' : d.addr, d.reg].filter(Boolean).map(esc);
    return '<div style="border-top:1px solid ' + c + ';padding-top:6px;text-align:center;font-size:11px;color:#444">' + (bits.join(' · ') || '&nbsp;') + '</div>';
  }
  // the card is drawn at 300 dpi: 3.5 × 2 inches = 1050 × 600 pixels
  function fit(ctx, text, max, size, weight) { do { ctx.font = (weight || '') + ' ' + size + 'px system-ui, "Segoe UI", Arial, sans-serif'; size -= 2; } while (ctx.measureText(text).width > max && size > 14); }
  function loadLogo(d) { return new Promise(function (ok) { if (!d.logo) return ok(null); var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = d.logo; }); }
  function drawCard(cv, d) {
    var ctx = cv.getContext('2d'), W = 1050, H = 600, c = col(d);
    cv.width = W; cv.height = H;
    return loadLogo(d).then(function (img) {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
      function logo(x, y, bw, bh) { if (!img) return 0; var r = Math.min(bw / img.width, bh / img.height); ctx.drawImage(img, x, y + (bh - img.height * r) / 2, img.width * r, img.height * r); return img.width * r; }
      var lines = [d.phone && '☎ ' + d.phone, d.email && '✉ ' + d.email, d.web && '🌐 ' + d.web, d.addr].filter(Boolean);
      ctx.textBaseline = 'alphabetic';
      if (d.style === 'side') {
        ctx.fillStyle = c; ctx.fillRect(0, 0, 400, H);
        var lw = logo(50, 60, 300, 150); ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        fit(ctx, d.name || 'Your Business', 320, 46, '800'); ctx.fillText(d.name || 'Your Business', 200, lw ? 300 : 280);
        if (d.tag) { fit(ctx, d.tag, 330, 26); ctx.fillText(d.tag, 200, lw ? 345 : 330); }
        ctx.textAlign = 'left'; ctx.fillStyle = '#111';
        fit(ctx, d.person || 'Your Name', 580, 50, '700'); ctx.fillText(d.person || 'Your Name', 450, 130);
        ctx.fillStyle = c; fit(ctx, d.role || '', 580, 30, '600'); ctx.fillText(d.role || '', 450, 175);
        ctx.fillStyle = '#333'; lines.forEach(function (l, i) { fit(ctx, l, 570, 28); ctx.fillText(l, 450, 290 + i * 52); });
      } else if (d.style === 'center') {
        ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.strokeRect(24, 24, W - 48, H - 48);
        var w2 = logo(W / 2 - 60, 50, 120, 90); ctx.textAlign = 'center'; ctx.fillStyle = c;
        fit(ctx, d.name || 'Your Business', 900, 54, '800'); ctx.fillText(d.name || 'Your Business', W / 2, w2 ? 200 : 150);
        ctx.fillStyle = '#444'; if (d.tag) { fit(ctx, d.tag, 880, 28); ctx.fillText(d.tag, W / 2, w2 ? 240 : 195); }
        ctx.fillStyle = '#111'; fit(ctx, (d.person || '') + (d.role ? ' · ' + d.role : ''), 880, 36, '700'); ctx.fillText((d.person || '') + (d.role ? ' · ' + d.role : ''), W / 2, 330);
        ctx.fillStyle = '#333'; lines.slice(0, 4).forEach(function (l, i) { fit(ctx, l, 880, 26); ctx.fillText(l, W / 2, 400 + i * 42); });
      } else {
        ctx.fillStyle = c; ctx.fillRect(0, 0, 30, H); ctx.fillRect(30, H - 70, W - 30, 70);
        var w3 = logo(80, 50, 200, 110); ctx.textAlign = 'left'; ctx.fillStyle = c;
        fit(ctx, d.name || 'Your Business', w3 ? 640 : 900, 50, '800'); ctx.fillText(d.name || 'Your Business', w3 ? 100 + w3 : 80, 115);
        ctx.fillStyle = '#444'; if (d.tag) { fit(ctx, d.tag, w3 ? 640 : 900, 26); ctx.fillText(d.tag, w3 ? 100 + w3 : 80, 155); }
        ctx.fillStyle = '#111'; fit(ctx, d.person || 'Your Name', 900, 44, '700'); ctx.fillText(d.person || 'Your Name', 80, 260);
        ctx.fillStyle = c; fit(ctx, d.role || '', 900, 28, '600'); ctx.fillText(d.role || '', 80, 300);
        ctx.fillStyle = '#333'; lines.slice(0, 3).forEach(function (l, i) { fit(ctx, l, 900, 27); ctx.fillText(l, 80, 365 + i * 45); });
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; if (d.reg) { fit(ctx, d.reg, 900, 24); ctx.fillText(d.reg, 540, H - 26); }
      }
      return cv;
    });
  }

  var form = h('div', { 'class': 'tgrid2' }), paper = h('div', { 'class': 'tpaper', 'data-out': '', style: 'aspect-ratio:1/1.414;display:flex;flex-direction:column;justify-content:space-between' });
  var cv = h('canvas', { 'class': 'tfit-canvas', style: 'width:100%;max-width:525px;height:auto;border-radius:10px;box-shadow:0 1px 6px rgba(0,0,0,.2)', 'aria-label': 'Business card preview' });
  function update() {
    paper.innerHTML = letterHead(st) + '<div style="flex:1;padding:22px 4px;color:#9ca3af">Date: …<br><br>Your letter starts here.</div>' + letterFoot(st);
    drawCard(cv, st);
  }
  function inp(key, label, ph) { var el = h('input', { type: 'text', placeholder: ph || '' }); el.value = st[key] || ''; el.addEventListener('input', function () { st[key] = el.value; keep(); update(); }); return T.field(label, el); }
  var colour = h('input', { type: 'color' });
  colour.addEventListener('input', function () { st.color = colour.value; keep(); update(); });
  var logoIn = h('input', { type: 'file', accept: 'image/*', style: 'width:100%;max-width:100%;min-width:0' }), status = T.status();
  logoIn.addEventListener('change', function () {
    var file = logoIn.files[0]; if (!file) return;
    if (file.size > 600000) { status.error('Please choose a logo under 600 KB.'); return; }
    T.read(file, 'dataURL').then(function (u) { st.logo = u; keep(); update(); status.clear(); });
  });
  function draw() {
    form.innerHTML = ''; colour.value = col(st);
    [inp('name', 'Business name'), inp('tag', 'Tagline / what you do'), inp('addr', 'Address'), inp('phone', 'Phone'), inp('email', 'Email'), inp('web', 'Website'),
      inp('reg', 'GSTIN / registration no. (optional)', 'e.g. GSTIN: 03ABCDE1234F1Z5'), inp('person', 'Name on the card'), inp('role', 'Designation')].forEach(function (f) { form.appendChild(f); });
    form.appendChild(T.field('Style', T.seg([['band', 'Band'], ['center', 'Centred'], ['side', 'Side']], st.style, function (v) { st.style = v; keep(); update(); })));
    form.appendChild(T.field('Colour', colour));
    form.appendChild(T.field('Logo (optional)', logoIn));
    update();
  }
  function letterPage(word) {
    var css = 'body{font:12pt/1.5 Arial,sans-serif;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:1.2cm 1.6cm}';
    var body = word ? letterHead(st) + '<p>&nbsp;</p><p>Date:</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>' + letterFoot(st)
      : '<div>' + letterHead(st) + '</div><div style="position:fixed;bottom:0;left:0;right:0">' + letterFoot(st) + '</div>';
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(st.name || 'Letterhead') + '</title><style>' + css + '</style></head><body>' + body + '</body></html>';
  }
  function openPrint(html) { var w = window.open('', '_blank'); if (!w) return; w.document.write(html); w.document.close(); setTimeout(function () { w.print(); }, 500); }
  function slug() { return (st.name || 'my-business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  spot.appendChild(T.card([
    T.row([T.button('Try a sample', { small: true, onclick: function () { if (st.name && st.name !== SAMPLE.name && !confirm('Replace your details with the sample?')) return; st = JSON.parse(JSON.stringify(SAMPLE)); keep(); draw(); } })]),
    form, status.el,
    h('h3', { text: 'Letterhead (A4)' }), paper,
    T.row([T.button('Print / Save as PDF', { primary: true, onclick: function () { openPrint(letterPage()); } }),
      T.button('Word (.doc)', { onclick: function () { T.download(new Blob(['﻿' + letterPage(true)], { type: 'application/msword' }), slug() + '-letterhead.doc'); } }),
      T.button('Remove logo', { small: true, onclick: function () { st.logo = ''; keep(); update(); } })]),
    h('h3', { text: 'Business card (3.5 × 2 in, 300 dpi)' }), cv,
    T.row([T.button('Download card (PNG)', { primary: true, onclick: function () { T.canvasBlob(cv, 'image/png').then(function (b) { T.download(b, slug() + '-card.png'); }); } }),
      T.button('Print 10 on A4', { onclick: function () {
        var u = cv.toDataURL('image/png'), cards = '';
        for (var i = 0; i < 10; i++) cards += '<img src="' + u + '" style="width:3.5in;height:2in;border:0.5px dashed #bbb;box-sizing:border-box">';
        openPrint('<!doctype html><html><head><meta charset="utf-8"><title>Business cards</title><style>@page{size:A4;margin:1cm}body{margin:0}div{display:grid;grid-template-columns:3.5in 3.5in;gap:0;justify-content:center}</style></head><body><div>' + cards + '</div></body></html>');
      } })]),
    h('p', { 'class': 'tnote', text: 'Your details and logo are saved only in this browser. For a print shop, send the PNG: it is 1050 × 600 pixels, the standard 300 dpi size.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();

  T.tests['letterhead'] = function () {
    var f = [], d = JSON.parse(JSON.stringify(SAMPLE)), c = h('canvas');
    if (letterHead(d).indexOf('Sunrise Agro Traders') < 0 || letterFoot(d).indexOf('GSTIN') < 0) f.push('letterhead text');
    d.name = '<i>x</i>'; if (letterHead(d).indexOf('<i>x') >= 0) f.push('not escaped');
    d.name = 'Sunrise Agro Traders';
    return drawCard(c, d).then(function () {
      if (c.width !== 1050 || c.height !== 600) f.push('card size ' + c.width + 'x' + c.height);
      var p = c.getContext('2d').getImageData(10, 300, 1, 1).data;
      if (Math.abs(p[0] - 0x16) > 3 || Math.abs(p[1] - 0x65) > 3 || Math.abs(p[2] - 0x34) > 3) f.push('band colour ' + p[0] + ',' + p[1] + ',' + p[2]);
      var q = c.getContext('2d').getImageData(500, 500, 1, 1).data; if (q[0] + q[1] + q[2] < 700) f.push('card body not white');
      return { ok: !f.length, n: 5, fails: f };
    });
  };
});
