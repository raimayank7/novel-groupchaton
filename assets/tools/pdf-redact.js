/* Infinity by GroupChatOn — pdf-redact. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Redact a PDF for real: black boxes are burned into a picture of the page, so the hidden words are gone, not just covered (pdf.js + pdf-lib). */
GCOTools.register('pdf-redact', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, pdf = null, bytes = null, boxes = {}, pageNo = 1, base = null;
  function paintPage(P, doc, n, scale) {   // like T.renderPage, but filled-in form fields are drawn too
    return doc.getPage(n).then(function (page) {
      var vp = page.getViewport({ scale: scale }), c = h('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      return page.render({ canvasContext: g, viewport: vp, intent: 'print', annotationMode: P.AnnotationMode.ENABLE }).promise.then(function () { return c; });
    });
  }
  var FIND = { email: /[\w.+-]+@[\w-]+(\.[\w-]+)+/g, phone: /\+?\d[\d ()-]{8,}\d/g, number: /\d{4,}/g };
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  // boxes (fractions of the page as seen, from the top-left) around every match on one page
  function findOn(doc, n, pats) {
    return doc.getPage(n).then(function (page) {
      var vp = page.getViewport({ scale: 1 });
      return page.getTextContent().then(function (tc) {
        var out = [];
        tc.items.forEach(function (it) {
          if (!it.str) return;
          pats.forEach(function (re) {
            re.lastIndex = 0; var m;
            while ((m = re.exec(it.str))) {
              if (!m[0].length) { re.lastIndex++; continue; }
              var t = it.transform, fh = Math.hypot(t[2], t[3]) || it.height || 10, len = it.str.length;
              var x0 = t[4] + it.width * m.index / len, x1 = t[4] + it.width * (m.index + m[0].length) / len;
              var r = vp.convertToViewportRectangle([x0 - 1, t[5] - fh * 0.28, x1 + 1, t[5] + fh * 0.95]);
              var a = Math.min(r[0], r[2]), b = Math.min(r[1], r[3]);
              out.push({ x: a / vp.width, y: b / vp.height, w: Math.abs(r[2] - r[0]) / vp.width, h: Math.abs(r[3] - r[1]) / vp.height });
            }
          });
        });
        return out;
      });
    });
  }
  function patterns(words, kinds) {
    var p = String(words || '').split(/[,\n]+/).map(function (w) { return w.trim(); }).filter(Boolean).map(function (w) { return new RegExp(esc(w), 'gi'); });
    (kinds || []).forEach(function (k) { if (FIND[k]) p.push(new RegExp(FIND[k].source, 'g')); });
    return p;
  }
  // every page with boxes becomes a picture with the boxes painted in; the other pages are copied untouched
  function redact(src, doc, marks, scale, all, prog) {
    return T.lib('pdflib').then(function (L) {
      return Promise.all([L.PDFDocument.load(src), L.PDFDocument.create()]).then(function (r) {
        var orig = r[0], out = r[1], i = 0, n = doc.numPages;
        out.setProducer('Infinity by GroupChatOn'); out.setCreator('Redacted copy');
        function next() {
          if (i >= n) return out.save();
          i++; if (prog) prog(i, n);
          var list = marks[i] || [];
          if (!list.length && !all) return out.copyPages(orig, [i - 1]).then(function (ps) { out.addPage(ps[0]); return next(); });
          return doc.getPage(i).then(function (pg) {
            var vp = pg.getViewport({ scale: 1 });
            return T.lib('pdfjs').then(function (P) { return paintPage(P, doc, i, scale); }).then(function (c) {
              var g = c.getContext('2d'); g.fillStyle = '#000';
              list.forEach(function (b) { g.fillRect(Math.floor(b.x * c.width), Math.floor(b.y * c.height), Math.ceil(b.w * c.width) + 1, Math.ceil(b.h * c.height) + 1); });
              return T.canvasBlob(c, 'image/jpeg', 0.92).then(function (bl) { c.width = 0; return bl.arrayBuffer(); });
            }).then(function (jb) { return out.embedJpg(jb); }).then(function (img) {
              out.addPage([vp.width, vp.height]).drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height }); return next();
            });
          });
        }
        return next();
      });
    });
  }
  var words = h('input', { type: 'text', placeholder: 'e.g. Ravi Kumar, 98765 43210' });
  var kEmail = h('input', { type: 'checkbox' }), kPhone = h('input', { type: 'checkbox' }), kNum = h('input', { type: 'checkbox' });
  var cv = h('canvas', { 'class': 'tfit-canvas', style: 'touch-action:none;cursor:crosshair;box-shadow:0 1px 6px rgba(0,0,0,.25)', 'aria-label': 'Drag on the page to black out an area; tap a box to remove it' });
  var prev = h('div', { 'class': 'tfit-prev', hidden: true }, [cv]), pageLab = h('b', { text: '' });
  var quality = T.select([[2.08, 'Normal (150 dpi)'], [2.78, 'Sharp (200 dpi)'], [4.17, 'Print (300 dpi)']], 2.78), all = h('input', { type: 'checkbox' });
  function count() { var c = 0; Object.keys(boxes).forEach(function (k) { c += boxes[k].length; }); return c; }
  function paint(live) {
    if (!base) return;
    var g = cv.getContext('2d'); g.drawImage(base, 0, 0);
    (boxes[pageNo] || []).concat(live ? [live] : []).forEach(function (b) {
      g.fillStyle = 'rgba(0,0,0,.72)'; g.fillRect(b.x * cv.width, b.y * cv.height, b.w * cv.width, b.h * cv.height);
      g.strokeStyle = '#ef4444'; g.lineWidth = 1.5; g.strokeRect(b.x * cv.width, b.y * cv.height, b.w * cv.width, b.h * cv.height);
    });
    pageLab.textContent = 'Page ' + pageNo + ' of ' + pdf.numPages + ' · ' + (boxes[pageNo] || []).length + ' here · ' + count() + ' in all';
  }
  function show(n) {
    pageNo = n;
    return pdf.getPage(n).then(function (p) { var vp = p.getViewport({ scale: 1 }); return T.renderPage(pdf, n, Math.min(2, 680 / vp.width)); }).then(function (c) { base = c; cv.width = c.width; cv.height = c.height; prev.hidden = false; paint(); });
  }
  var drag = null;
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }; }
  function box(a, b) { return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }; }
  cv.addEventListener('pointerdown', function (e) { if (!base) return; drag = pt(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function (e) { if (drag) paint(box(drag, pt(e))); });
  cv.addEventListener('pointerup', function (e) {
    if (!drag) return; var p = pt(e), b = box(drag, p), list = boxes[pageNo] = boxes[pageNo] || []; drag = null;
    if (b.w * cv.width < 6 && b.h * cv.height < 6) {   // a tap: remove the box under the finger
      for (var i = list.length - 1; i >= 0; i--) { var q = list[i]; if (p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h) { list.splice(i, 1); break; } }
    } else list.push(b);
    paint();
  });
  function mark() {
    if (!pdf) return Promise.resolve();
    var pats = patterns(words.value, [kEmail.checked && 'email', kPhone.checked && 'phone', kNum.checked && 'number'].filter(Boolean));
    if (!pats.length) { status.error('Type words to find, or tick emails, phone numbers or numbers.'); return Promise.resolve(); }
    var found = 0, n = 0;
    status.progress(0, 'Searching…');
    function next() {
      if (n >= pdf.numPages) { paint(); status.ok(found ? 'Marked ' + found + ' matches. Check every page, then press Redact and save.' : 'No matches found. Scanned pages have no text to search: draw boxes by hand.'); return; }
      n++;
      return findOn(pdf, n, pats).then(function (list) { if (list.length) { boxes[n] = (boxes[n] || []).concat(list); found += list.length; } status.progress(n / pdf.numPages); return next(); });
    }
    return next().catch(status.error);
  }
  var go = T.button('Redact and save', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) {
    file = files[0]; boxes = {}; results.clear(); status.info('Opening ' + file.name + '…');
    return T.read(file).then(function (b) { bytes = b; return T.openPdf(file); }).then(function (d) { pdf = d; go.disabled = false; info.textContent = file.name + ' · ' + d.numPages + (d.numPages === 1 ? ' page' : ' pages'); status.info('Drag on the page to black out an area, or search for words below.'); return show(1); }).catch(status.error);
  }
  function run() {
    if (!pdf) return;
    if (!count() && !all.checked) return status.error('Mark something to black out first.');
    go.disabled = true;
    redact(bytes, pdf, boxes, +quality.value, all.checked, function (i, n) { status.progress(i / n, 'Redacting page ' + i + ' of ' + n + '…'); }).then(function (out) {
      results.set([{ name: T.baseName(file.name) + '-redacted.pdf', blob: new Blob([out], { type: 'application/pdf' }), note: count() + ' areas removed' }]);
      status.ok('Done! Marked areas are permanently removed: redacted pages are now pictures, with no hidden text underneath.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf(L) {
    return L.PDFDocument.create().then(function (d) {
      return d.embedFont(L.StandardFonts.Helvetica).then(function (f) {
        var p = d.addPage([595.28, 841.89]);
        p.drawText('Customer record', { x: 60, y: 770, size: 22, font: f });
        ['Name: Ravi Kumar', 'Account number 98765432', 'Email: ravi.kumar@example.com', 'Branch: Model Town, Ludhiana'].forEach(function (t, i) { p.drawText(t, { x: 60, y: 720 - i * 26, size: 14, font: f }); });
        d.addPage([595.28, 841.89]).drawText('Public terms and conditions', { x: 60, y: 770, size: 18, font: f });
        return d.save();
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '⬛', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    T.field('Find and mark words', words, 'Separate several with commas. Capital letters do not matter.'),
    h('div', { 'class': 'tchecks' }, [h('label', { 'class': 'tcheck' }, [kEmail, ' Email addresses']), h('label', { 'class': 'tcheck' }, [kPhone, ' Phone numbers']), h('label', { 'class': 'tcheck' }, [kNum, ' Numbers (4+ digits)'])]),
    T.row([T.button('Find and mark', { small: true, onclick: mark })]),
    prev, T.row([T.button('‹ Previous', { small: true, onclick: function () { if (pdf && pageNo > 1) show(pageNo - 1); } }), pageLab, T.button('Next ›', { small: true, onclick: function () { if (pdf && pageNo < pdf.numPages) show(pageNo + 1); } }),
      T.button('Clear this page', { small: true, onclick: function () { boxes[pageNo] = []; paint(); } })]),
    h('div', { 'class': 'tgrid2' }, [T.field('Quality', quality), h('label', { 'class': 'tcheck' }, [all, ' Turn every page into a picture (safest)'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () {
      T.lib('pdflib').then(samplePdf).then(function (b) { return take([new File([b], 'sample-customer-record.pdf', { type: 'application/pdf' })]); }).then(function () {
        words.value = 'Ravi Kumar'; kEmail.checked = true; kNum.checked = true; return mark();
      }).then(run);
    } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-redact'] = function () {
    var f = [];
    function textOf(b, n) { return T.lib('pdfjs').then(function (P) { return P.getDocument({ data: b.slice(0) }).promise; }).then(function (d) { return d.getPage(n); }).then(function (p) { return p.getTextContent(); }).then(function (tc) { return tc.items.map(function (i) { return i.str; }).join(' '); }); }
    return T.lib('pdflib').then(samplePdf).then(function (src) {
      return T.lib('pdfjs').then(function (P) { return P.getDocument({ data: src.slice(0) }).promise; }).then(function (doc) {
        return findOn(doc, 1, patterns('ravi kumar', ['email', 'number'])).then(function (list) {
          if (list.length !== 3) f.push('found ' + list.length + ' (want 3)');
          return redact(src, doc, { 1: list }, 2, false);
        }).then(function (out) {
          return Promise.all([textOf(out, 1), textOf(out, 2)]).then(function (t) {
            if (/Ravi|98765432|example/.test(t[0])) f.push('hidden text still there: ' + t[0]);
            if (t[1].indexOf('Public terms') < 0) f.push('page 2 should keep its text');
            return T.lib('pdfjs').then(function (P) { return P.getDocument({ data: out.slice(0) }).promise; });
          });
        }).then(function (od) { return T.renderPage(od, 1, 1); }).then(function (c) {
          var px = c.getContext('2d').getImageData(115, Math.round(841.89 - 720 - 4), 1, 1).data;   // inside “Ravi Kumar”
          if (px[0] > 40) f.push('box not black: ' + px[0]);
        });
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
