/* Infinity by GroupChatOn — pdf-sign. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Sign a PDF: draw, type or upload a signature, tap where it goes on the page, and save (pdf.js preview + pdf-lib). */
GCOTools.register('pdf-sign', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, pdf = null, pageNo = 1, base = null, sig = null, upImg = null;
  var place = { fx: 0.72, fy: 0.86, fw: 0.28 };   // centre (fractions of the page as seen, from the top-left) and width
  function spotOn(L, page, u, v) {
    var b = page.getCropBox(), r = ((page.getRotation().angle % 360) + 360) % 360, W = b.width, H = b.height, x = u, y = v;
    if (r === 90) { x = W - v; y = u; } else if (r === 180) { x = W - u; y = H - v; } else if (r === 270) { x = v; y = H - u; }
    return { x: b.x + x, y: b.y + y, rotate: L.degrees(r) };
  }
  function seen(page) { var b = page.getCropBox(); return page.getRotation().angle % 180 ? { w: b.height, h: b.width } : { w: b.width, h: b.height }; }
  function trim(c) {   // cut the empty border around the ink
    var g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (var y = 0; y < c.height; y++) for (var x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    var o = h('canvas'); o.width = x1 - x0 + 9; o.height = y1 - y0 + 9; o.getContext('2d').drawImage(c, x0 - 4, y0 - 4, o.width, o.height, 0, 0, o.width, o.height);
    return o;
  }
  // sign(bytes, png bytes, aspect (w/h), { pages: [1-based], fx, fy, fw }, date text or '')
  function sign(bytes, png, aspect, at, date) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.load(bytes).then(function (doc) {
        if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        return Promise.all([doc.embedPng(png), doc.embedFont(L.StandardFonts.Helvetica)]).then(function (r) {
          at.pages.forEach(function (n) {
            var page = doc.getPage(n - 1), s = seen(page), w = at.fw * s.w, hh = w / aspect, u = at.fx * s.w - w / 2, v = (1 - at.fy) * s.h - hh / 2, p = spotOn(L, page, u, v);
            page.drawImage(r[0], { x: p.x, y: p.y, width: w, height: hh, rotate: p.rotate });
            if (date) { var q = spotOn(L, page, u, v - 11); page.drawText(date, { x: q.x, y: q.y, size: 9, font: r[1], color: L.rgb(0.2, 0.2, 0.2), rotate: q.rotate }); }
          });
          return doc.save();
        });
      });
    });
  }
  /* --- the signature --- */
  var mode = T.seg([['draw', 'Draw'], ['type', 'Type'], ['upload', 'Upload']], 'draw', function () { sync(); makeSig(); });
  var pad = h('canvas', { width: '600', height: '200', style: 'width:100%;max-width:600px;height:auto;aspect-ratio:3/1;background:#fff;border:1px dashed #94a3b8;border-radius:12px;touch-action:none;cursor:crosshair', 'aria-label': 'Draw your signature here' });
  var ink = T.select([['#1e3a8a', 'Blue ink'], ['#111111', 'Black ink']], '#1e3a8a');
  var name = h('input', { type: 'text', placeholder: 'Your name', value: '' });
  var FONTS = [['"Segoe Script","Brush Script MT","Lucida Handwriting","Snell Roundhand",cursive', 'Handwriting'], ['italic 600 1em Georgia,serif', 'Elegant'], ['600 1em "Segoe Print","Comic Sans MS",cursive', 'Casual']];
  var style = T.select(FONTS.map(function (x, i) { return [i, x[1]]; }), 0);
  var white = h('input', { type: 'checkbox', checked: true });
  var drawBox = h('div', { 'class': 'tfit-ctl' }, [pad, T.row([ink, T.button('Clear', { small: true, onclick: function () { pad.getContext('2d').clearRect(0, 0, 600, 200); makeSig(); } })])]);
  var typeBox = h('div', { 'class': 'tgrid2' }, [T.field('Type your name', name), T.field('Style', style)]);
  var upBox = h('div', { 'class': 'tfit-ctl' }, [T.dropzone({ accept: 'image/png,image/jpeg', icon: '🖼️', label: 'Choose a photo of your signature', hint: 'sign on white paper, take a photo, crop it close', onFiles: function (fl) {
    var im = new Image(); im.onload = function () { upImg = im; makeSig(); }; im.src = URL.createObjectURL(fl[0]);
  } }), h('label', { 'class': 'tcheck' }, [white, ' Make the white paper see-through'])]);
  function sync() { drawBox.hidden = mode.value() !== 'draw'; typeBox.hidden = mode.value() !== 'type'; upBox.hidden = mode.value() !== 'upload'; }
  var drawing = false, last = null;
  function pt(e) { var r = pad.getBoundingClientRect(); return { x: (e.clientX - r.left) * 600 / r.width, y: (e.clientY - r.top) * 200 / r.height }; }
  pad.addEventListener('pointerdown', function (e) { drawing = true; last = pt(e); pad.setPointerCapture(e.pointerId); });
  pad.addEventListener('pointermove', function (e) {
    if (!drawing) return; var p = pt(e), g = pad.getContext('2d');
    g.strokeStyle = ink.value; g.lineWidth = 3.2; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); last = p;
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) { pad.addEventListener(ev, function () { if (drawing) { drawing = false; makeSig(); } }); });
  [name, style, white].forEach(function (x) { x.addEventListener('input', makeSig); x.addEventListener('change', makeSig); });
  function makeSig() {
    var c = h('canvas'), g = c.getContext('2d'), m = mode.value();
    if (m === 'draw') { c = pad; }
    else if (m === 'type') {
      if (!name.value.trim()) { sig = null; return paint(); }
      var f = FONTS[+style.value][0], font = /\dem /.test(f) ? f.replace('1em', '90px') : '90px ' + f;
      c.width = 1400; c.height = 220; g.font = font; g.fillStyle = ink.value; g.textBaseline = 'middle'; g.fillText(name.value.trim(), 20, 110);
    } else {
      if (!upImg) { sig = null; return paint(); }
      var k = Math.min(1, 1400 / upImg.naturalWidth); c.width = Math.round(upImg.naturalWidth * k); c.height = Math.round(upImg.naturalHeight * k); g.drawImage(upImg, 0, 0, c.width, c.height);
      if (white.checked) { var id = g.getImageData(0, 0, c.width, c.height), d = id.data; for (var i = 0; i < d.length; i += 4) { var lum = (d[i] + d[i + 1] + d[i + 2]) / 3; if (lum > 200) d[i + 3] = 0; else if (lum > 150) d[i + 3] = Math.round((200 - lum) * 5); } g.putImageData(id, 0, 0); }
    }
    sig = trim(c); paint();
  }
  /* --- the page preview: tap or drag to place --- */
  var cv = h('canvas', { 'class': 'tfit-canvas', style: 'touch-action:none;cursor:move;box-shadow:0 1px 6px rgba(0,0,0,.25)', 'aria-label': 'Page preview: tap where the signature goes' });
  var prev = h('div', { 'class': 'tfit-prev', hidden: true }, [cv]);
  var pageIn = h('input', { type: 'number', min: '1', value: '1' }), sz = h('input', { type: 'range', min: '8', max: '70', value: '28' });
  var where = T.select([['this', 'This page only'], ['last', 'Last page'], ['all', 'Every page']], 'this'), addDate = h('input', { type: 'checkbox' });
  sz.addEventListener('input', function () { place.fw = +sz.value / 100; paint(); });
  pageIn.addEventListener('change', function () { if (pdf) showPage(Math.max(1, Math.min(pdf.numPages, parseInt(pageIn.value, 10) || 1))); });
  function showPage(n) {
    pageNo = n; pageIn.value = n;
    return pdf.getPage(n).then(function (p) { var vp = p.getViewport({ scale: 1 }); return T.renderPage(pdf, n, Math.min(2, 700 / vp.width)); }).then(function (c) { base = c; cv.width = c.width; cv.height = c.height; prev.hidden = false; paint(); });
  }
  function paint() {
    if (!base) return;
    var g = cv.getContext('2d'); g.drawImage(base, 0, 0);
    if (!sig) return;
    var w = place.fw * cv.width, hh = w * sig.height / sig.width;
    g.drawImage(sig, place.fx * cv.width - w / 2, place.fy * cv.height - hh / 2, w, hh);
    g.strokeStyle = 'rgba(14,165,233,.9)'; g.setLineDash([5, 4]); g.strokeRect(place.fx * cv.width - w / 2, place.fy * cv.height - hh / 2, w, hh); g.setLineDash([]);
  }
  var dragging = false;
  function move(e) { var r = cv.getBoundingClientRect(); place.fx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); place.fy = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)); paint(); }
  cv.addEventListener('pointerdown', function (e) { dragging = true; cv.setPointerCapture(e.pointerId); move(e); });
  cv.addEventListener('pointermove', function (e) { if (dragging) move(e); });
  ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { dragging = false; }); });
  var go = T.button('Sign and save', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) {
    file = files[0]; results.clear(); status.info('Opening ' + file.name + '…');
    return T.openPdf(file).then(function (d) { pdf = d; go.disabled = false; pageIn.max = d.numPages; info.textContent = file.name + ' · ' + d.numPages + (d.numPages === 1 ? ' page' : ' pages'); status.info('Tap or drag on the page to place your signature.'); return showPage(1); }).catch(status.error);
  }
  function run() {
    if (!file || !pdf) return;
    if (!sig) return status.error(mode.value() === 'draw' ? 'Draw your signature in the white box first.' : mode.value() === 'type' ? 'Type your name first.' : 'Choose a photo of your signature first.');
    var w = where.value, n = pdf.numPages, list = w === 'all' ? T.parseRanges('1-', n) : w === 'last' ? [n] : [pageNo];
    var d = new Date(), date = addDate.checked ? 'Signed ' + d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).replace(/[^\x20-\x7e]/g, ' ') : '';
    go.disabled = true; status.progress(0.4, 'Signing…');
    Promise.all([T.read(file), T.canvasBlob(sig, 'image/png').then(function (b) { return b.arrayBuffer(); })]).then(function (r) {
      return sign(r[0], r[1], sig.width / sig.height, { pages: list, fx: place.fx, fy: place.fy, fw: place.fw }, date);
    }).then(function (out) {
      results.set([{ name: T.baseName(file.name) + '-signed.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      status.ok('Signed ' + (list.length === 1 ? 'page ' + list[0] : list.length + ' pages') + '. Download your PDF below.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf(L) {
    return L.PDFDocument.create().then(function (d) {
      return d.embedFont(L.StandardFonts.Helvetica).then(function (f) {
        var p = d.addPage([595.28, 841.89]);
        p.drawText('Rent agreement (sample)', { x: 60, y: 770, size: 24, font: f });
        ['This agreement is made between the owner and the tenant.', 'Monthly rent: 15,000. Deposit: two months.', 'Both parties agree to the terms above.'].forEach(function (t, i) { p.drawText(t, { x: 60, y: 720 - i * 24, size: 13, font: f }); });
        p.drawText('Signature: ______________________', { x: 300, y: 130, size: 12, font: f });
        return d.save();
      });
    });
  }
  function scribble(c) {
    var g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.strokeStyle = '#1e3a8a'; g.lineWidth = 3.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 140);
    for (var x = 40; x < 540; x += 6) g.lineTo(x, 110 + Math.sin(x / 18) * 38 * Math.cos(x / 70));
    g.stroke();
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '✍️', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    T.field('Your signature', mode), drawBox, typeBox, upBox, prev,
    h('div', { 'class': 'tgrid2' }, [T.field('Page shown', pageIn), T.field('Signature size', sz), T.field('Put it on', where), h('label', { 'class': 'tcheck' }, [addDate, ' Add today’s date under it'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () {
      T.lib('pdflib').then(samplePdf).then(function (b) { scribble(pad); return take([new File([b], 'sample-agreement.pdf', { type: 'application/pdf' })]); }).then(function () { place = { fx: 0.68, fy: 0.82, fw: 0.3 }; makeSig(); run(); });
    } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  sync();
  T.tests['pdf-sign'] = function () {
    var f = [], c = h('canvas'); c.width = 600; c.height = 200; scribble(c);
    var t = trim(c);
    if (!t || t.width > 520 || t.height > 120) f.push('trim ' + (t && t.width + 'x' + t.height));
    return T.lib('pdflib').then(function (L) {
      return Promise.all([samplePdf(L).then(function (b) { return L.PDFDocument.load(b).then(function (d) { d.addPage([595.28, 841.89]); return d.save(); }); }), T.canvasBlob(t, 'image/png').then(function (b) { return b.arrayBuffer(); })]).then(function (r) {
        return sign(r[0], r[1], t.width / t.height, { pages: [2], fx: 0.5, fy: 0.5, fw: 0.3 }, 'Signed 1 Jan 2026');
      }).then(function (out) { return L.PDFDocument.load(out); }).then(function (d) {
        var xo = function (i) { var r = d.getPage(i).node.Resources(), x = r && r.lookup(L.PDFName.of('XObject')); return x ? x.keys().length : 0; };
        if (xo(1) < 1) f.push('page 2 has no signature');
        if (xo(0) > 0) f.push('page 1 should be untouched');
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
