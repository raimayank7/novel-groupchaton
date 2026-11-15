/* Infinity by GroupChatOn — pdf-crop. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Crop PDF pages: trim margins in mm, drag a box on the preview, or find the white margins automatically (pdf.js + pdf-lib). */
GCOTools.register('pdf-crop', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, pdf = null, base = null, k = 1, pageNo = 1, seenSize = { w: 1, h: 1 };
  var MM = 72 / 25.4;
  function spotOn(page, u, v) {
    var b = page.getCropBox(), r = ((page.getRotation().angle % 360) + 360) % 360, W = b.width, H = b.height, x = u, y = v;
    if (r === 90) { x = W - v; y = u; } else if (r === 180) { x = W - u; y = H - v; } else if (r === 270) { x = v; y = H - u; }
    return { x: b.x + x, y: b.y + y };
  }
  function seen(page) { var b = page.getCropBox(); return page.getRotation().angle % 180 ? { w: b.height, h: b.width } : { w: b.width, h: b.height }; }
  // white margins of a rendered page, in points: { t, r, b, l }
  function whiteMargins(c, scale) {
    var g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (var y = 0; y < c.height; y++) for (var x = 0; x < c.width; x++) { var i = (y * c.width + x) * 4; if (d[i] < 235 || d[i + 1] < 235 || d[i + 2] < 235) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    if (x1 < 0) return { t: 0, r: 0, b: 0, l: 0 };
    var pad = 6;
    return { t: Math.max(0, y0 / scale - pad), r: Math.max(0, (c.width - 1 - x1) / scale - pad), b: Math.max(0, (c.height - 1 - y1) / scale - pad), l: Math.max(0, x0 / scale - pad) };
  }
  // m: margins in points as you see the page { t, r, b, l }, or a function(pageNo) → margins
  function crop(bytes, m, pages) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.load(bytes).then(function (doc) {
        if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        var list = pages ? T.parseRanges(pages, doc.getPageCount()) : T.parseRanges('1-', doc.getPageCount());
        if (!list.length) throw new Error('Those pages are not in this PDF.');
        return list.reduce(function (p, n) {
          return p.then(function () { return typeof m === 'function' ? m(n) : m; }).then(function (mm) {
            var page = doc.getPage(n - 1), s = seen(page);
            if (mm.l + mm.r > s.w - 20 || mm.t + mm.b > s.h - 20) throw new Error('The margins are bigger than page ' + n + '.');
            var a = spotOn(page, mm.l, mm.b), c = spotOn(page, s.w - mm.r, s.h - mm.t);
            var x = Math.min(a.x, c.x), y = Math.min(a.y, c.y), w = Math.abs(a.x - c.x), hh = Math.abs(a.y - c.y);
            page.setMediaBox(x, y, w, hh); page.setCropBox(x, y, w, hh); page.setTrimBox(x, y, w, hh); page.setBleedBox(x, y, w, hh); page.setArtBox(x, y, w, hh);
          });
        }, Promise.resolve()).then(function () { return doc.save(); });
      });
    });
  }
  var ins = {}; ['t', 'r', 'b', 'l'].forEach(function (s) { ins[s] = h('input', { type: 'number', min: '0', step: '0.5', value: '10' }); ins[s].addEventListener('input', paint); });
  var pages = h('input', { type: 'text', placeholder: 'All pages' }), each = h('input', { type: 'checkbox' });
  var cv = h('canvas', { 'class': 'tfit-canvas', style: 'touch-action:none;cursor:crosshair;box-shadow:0 1px 6px rgba(0,0,0,.25)', 'aria-label': 'Drag on the page to choose the area to keep' });
  var prev = h('div', { 'class': 'tfit-prev', hidden: true }, [cv]);
  function margins() { var o = {}; ['t', 'r', 'b', 'l'].forEach(function (s) { o[s] = Math.max(0, +ins[s].value || 0) * MM; }); return o; }
  function paint() {
    if (!base) return;
    var g = cv.getContext('2d'), m = margins(), x = m.l * k, y = m.t * k, w = cv.width - (m.l + m.r) * k, hh = cv.height - (m.t + m.b) * k;
    g.drawImage(base, 0, 0); g.fillStyle = 'rgba(15,23,42,.55)'; g.beginPath(); g.rect(0, 0, cv.width, cv.height); g.rect(x, y, w, hh); g.fill('evenodd');
    g.strokeStyle = '#0ea5e9'; g.lineWidth = 2; g.setLineDash([6, 4]); g.strokeRect(x, y, w, hh); g.setLineDash([]);
    status.info('Page ' + pageNo + ' kept area: ' + Math.round((seenSize.w - m.l - m.r) / MM) + ' × ' + Math.round((seenSize.h - m.t - m.b) / MM) + ' mm. Drag on the page to draw a new box.');
  }
  var drag = null;
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
  cv.addEventListener('pointerdown', function (e) { if (!base) return; drag = pt(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return; var p = pt(e), x0 = Math.min(drag.x, p.x), x1 = Math.max(drag.x, p.x), y0 = Math.min(drag.y, p.y), y1 = Math.max(drag.y, p.y);
    if (x1 - x0 < 10 || y1 - y0 < 10) return;
    ins.l.value = (x0 / k / MM).toFixed(1); ins.r.value = ((cv.width - x1) / k / MM).toFixed(1); ins.t.value = (y0 / k / MM).toFixed(1); ins.b.value = ((cv.height - y1) / k / MM).toFixed(1); paint();
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drag = null; }); });
  function show(n) {
    pageNo = n;
    return pdf.getPage(n).then(function (p) { var vp = p.getViewport({ scale: 1 }); seenSize = { w: vp.width, h: vp.height }; k = Math.min(2, 640 / vp.width); return T.renderPage(pdf, n, k); })
      .then(function (c) { base = c; cv.width = c.width; cv.height = c.height; prev.hidden = false; paint(); });
  }
  function auto() {
    if (!base) return;
    var m = whiteMargins(base, k); ins.t.value = (m.t / MM).toFixed(1); ins.r.value = (m.r / MM).toFixed(1); ins.b.value = (m.b / MM).toFixed(1); ins.l.value = (m.l / MM).toFixed(1); paint();
  }
  var go = T.button('Crop PDF', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) {
    file = files[0]; results.clear(); status.info('Opening ' + file.name + '…');
    return T.openPdf(file).then(function (d) { pdf = d; go.disabled = false; info.textContent = file.name + ' · ' + d.numPages + (d.numPages === 1 ? ' page' : ' pages'); return show(1); }).catch(status.error);
  }
  function run() {
    if (!pdf) return;
    go.disabled = true; status.progress(0.2, 'Cropping…');
    var m = each.checked ? function (n) { return T.renderPage(pdf, n, 0.75).then(function (c) { status.progress(n / pdf.numPages, 'Finding the margins of page ' + n + '…'); return whiteMargins(c, 0.75); }); } : margins();
    T.read(file).then(function (b) { return crop(b, m, pages.value.trim()); }).then(function (out) {
      results.set([{ name: T.baseName(file.name) + '-cropped.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      status.ok('Done! The pages are cropped.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf(L) {
    return L.PDFDocument.create().then(function (d) {
      return d.embedFont(L.StandardFonts.HelveticaBold).then(function (f) {
        var p = d.addPage([595.28, 841.89]);
        p.drawRectangle({ x: 100, y: 400, width: 200, height: 200, color: L.rgb(0.95, 0.6, 0.1) });
        p.drawText('Scanned receipt', { x: 110, y: 560, size: 22, font: f });
        p.drawText('Total: 1,250', { x: 110, y: 420, size: 18, font: f });
        return d.save();
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '✂️', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info, prev,
    h('div', { 'class': 'tgrid2' }, [T.field('Top (mm)', ins.t), T.field('Bottom (mm)', ins.b), T.field('Left (mm)', ins.l), T.field('Right (mm)', ins.r)]),
    T.row([T.button('Find white margins', { small: true, onclick: auto })]),
    h('div', { 'class': 'tgrid2' }, [T.field('Pages (optional)', pages, 'e.g. 1-3. Empty = all pages.'), h('label', { 'class': 'tcheck' }, [each, ' Trim each page to its own content (for scans)'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () {
      T.lib('pdflib').then(samplePdf).then(function (b) { return take([new File([b], 'sample-receipt.pdf', { type: 'application/pdf' })]); }).then(function () { auto(); run(); });
    } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-crop'] = function () {
    var f = [], near = function (a, b) { return Math.abs(a - b) < 0.6; };
    return T.lib('pdflib').then(function (L) {
      return samplePdf(L).then(function (src) {
        return crop(src, { t: 10 * MM, r: 10 * MM, b: 10 * MM, l: 10 * MM }, '').then(function (out) { return L.PDFDocument.load(out); }).then(function (d) {
          var b = d.getPage(0).getCropBox();
          if (!near(b.width, 595.28 - 20 * MM) || !near(b.x, 10 * MM) || !near(b.height, 841.89 - 20 * MM)) f.push('crop box ' + JSON.stringify(b));
        }).then(function () { return L.PDFDocument.load(src); }).then(function (d) { d.getPage(0).setRotation(L.degrees(90)); return d.save(); }).then(function (rot) {
          return crop(rot, { t: 20 * MM, r: 0, b: 0, l: 0 }, '');   // sideways page: its top (as seen) is the PDF's left edge
        }).then(function (out) { return L.PDFDocument.load(out); }).then(function (d) {
          var b = d.getPage(0).getCropBox();
          if (!near(b.x, 20 * MM) || !near(b.width, 595.28 - 20 * MM) || !near(b.height, 841.89)) f.push('rotated crop ' + JSON.stringify(b));
        }).then(function () { return T.lib('pdfjs'); }).then(function (P) { return P.getDocument({ data: src.slice(0) }).promise; }).then(function (doc) { return T.renderPage(doc, 1, 1); }).then(function (c) {
          var m = whiteMargins(c, 1);   // the orange box runs from x 100 to 300 and from y 400 to 600 (from the bottom)
          if (Math.abs(m.l - 94) > 3 || Math.abs(m.r - (595.28 - 300 - 6)) > 3 || Math.abs(m.t - (841.89 - 600 - 6)) > 3 || Math.abs(m.b - 394) > 3) f.push('white margins ' + JSON.stringify(m));
        });
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
