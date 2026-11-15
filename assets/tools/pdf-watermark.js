/* Infinity by GroupChatOn — pdf-watermark. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Add a text or logo watermark to a PDF: diagonal, centred, repeated or in a corner, with colour, size and see-through control (pdf-lib). */
GCOTools.register('pdf-watermark', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, logo = null;
  // a spot measured on the page as you see it (from its bottom-left) → PDF coordinates, plus the turn that keeps marks upright on rotated pages
  function spotOn(L, page, u, v, a) {
    var b = page.getCropBox(), r = ((page.getRotation().angle % 360) + 360) % 360, W = b.width, H = b.height, x = u, y = v;
    if (r === 90) { x = W - v; y = u; } else if (r === 180) { x = W - u; y = H - v; } else if (r === 270) { x = v; y = H - u; }
    return { x: b.x + x, y: b.y + y, rotate: L.degrees(r + (a || 0)) };
  }
  function seen(page) { var b = page.getCropBox(); return page.getRotation().angle % 180 ? { w: b.height, h: b.width } : { w: b.width, h: b.height }; }
  function latin(s) { return /^[\x20-\x7e\xa0-\xff]*$/.test(s); }
  function textPng(text, color) {   // letters the built-in PDF font cannot write (Hindi, Arabic, emoji…) become a picture
    var c = h('canvas'), g = c.getContext('2d'), font = 'bold 160px system-ui, "Segoe UI", "Noto Sans", sans-serif';
    g.font = font; var w = Math.ceil(g.measureText(text).width) + 20;
    c.width = w; c.height = 210; g.font = font; g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(text, 10, 105);
    return T.canvasBlob(c, 'image/png').then(function (b) { return b.arrayBuffer(); });
  }
  function hex(L, s) { var n = parseInt(String(s).slice(1), 16) || 0; return L.rgb((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); }
  // o: { kind: 'text' | 'image', text, color, img (bytes), png, size (% of the page width), opacity (0–1), layout, pages }
  function stamp(bytes, o) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.load(bytes).then(function (doc) {
        if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        var asText = o.kind === 'text' && latin(o.text);
        var prep = o.kind === 'image' ? (o.png ? doc.embedPng(o.img) : doc.embedJpg(o.img)) : asText ? doc.embedFont(L.StandardFonts.HelveticaBold) : textPng(o.text, o.color).then(function (b) { return doc.embedPng(b); });
        return prep.then(function (mark) {
          var n = doc.getPageCount(), list = o.pages ? T.parseRanges(o.pages, n) : T.parseRanges('1-', n);
          if (!list.length) throw new Error('Those pages are not in this PDF.');
          list.forEach(function (pn) {
            var page = doc.getPage(pn - 1), s = seen(page), k = o.size / 100;
            var a = o.layout === 'diag' ? Math.atan2(s.h, s.w) * 180 / Math.PI : o.layout === 'tile' ? 30 : 0;
            var span = o.layout === 'diag' ? Math.hypot(s.w, s.h) * 0.85 * k : o.layout === 'tile' ? s.w * 0.4 * k : o.layout === 'bottom' ? s.w * 0.35 * k : s.w * 0.9 * k;
            var mw, mh, fs = 0;
            if (asText) { fs = span / mark.widthOfTextAtSize(o.text, 1); mw = span; mh = fs * 0.72; } else { mw = span; mh = span * mark.height / mark.width; }
            function put(cx, cy) {   // centre of the mark (as seen) → its corner, turned by a
              var r = a * Math.PI / 180, u = cx - (Math.cos(r) * mw - Math.sin(r) * mh) / 2, v = cy - (Math.sin(r) * mw + Math.cos(r) * mh) / 2, p = spotOn(L, page, u, v, a);
              if (asText) page.drawText(o.text, { x: p.x, y: p.y, size: fs, font: mark, color: hex(L, o.color), opacity: o.opacity, rotate: p.rotate });
              else page.drawImage(mark, { x: p.x, y: p.y, width: mw, height: mh, opacity: o.opacity, rotate: p.rotate });
            }
            if (o.layout === 'tile') {
              var dx = mw * 1.5, dy = Math.max(mh * 4, mw * 0.6), row = 0;
              for (var y = dy / 2; y < s.h + dy; y += dy, row++) for (var x = (row % 2 ? dx / 2 : 0); x < s.w + dx; x += dx) put(x, y);
            } else if (o.layout === 'bottom') put(s.w - mw / 2 - 24, mh / 2 + 24);
            else put(s.w / 2, s.h / 2);
          });
          return doc.save();
        });
      });
    });
  }
  var kind = T.seg([['text', 'Text'], ['image', 'Logo / image']], 'text', sync);
  var text = h('input', { type: 'text', value: 'CONFIDENTIAL', maxlength: '80' }), color = h('input', { type: 'color', value: '#e11d48' });
  var size = h('input', { type: 'range', min: '10', max: '100', value: '70' }), opacity = h('input', { type: 'range', min: '5', max: '100', value: '25' });
  var layout = T.select([['diag', 'Diagonal across the page'], ['center', 'Straight, in the centre'], ['tile', 'Repeated all over'], ['bottom', 'Small, bottom corner']], 'diag');
  var pages = h('input', { type: 'text', placeholder: 'All pages' });
  var logoName = h('small', { text: 'PNG (see-through background is best) or JPG' });
  var logoPick = T.dropzone({ accept: 'image/png,image/jpeg', icon: '🏷️', label: 'Choose your logo', hint: 'PNG or JPG', onFiles: function (f) {
    T.read(f[0]).then(function (b) { logo = { bytes: b, png: /png/i.test(f[0].type) || /\.png$/i.test(f[0].name) }; logoName.textContent = f[0].name + ' ✓'; });
  } });
  var textBox = h('div', { 'class': 'tgrid2' }, [T.field('Watermark text', text), T.field('Colour', color)]), logoBox = h('div', {}, [logoPick, logoName]);
  function sync() { textBox.hidden = kind.value() !== 'text'; logoBox.hidden = kind.value() !== 'image'; }
  var go = T.button('Add watermark', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    if (kind.value() === 'image' && !logo) return status.error('Choose a logo image first.');
    if (kind.value() === 'text' && !text.value.trim()) return status.error('Type the watermark text.');
    go.disabled = true; status.progress(0.3, 'Adding the watermark…');
    T.read(file).then(function (b) {
      return stamp(b, { kind: kind.value(), text: text.value.trim(), color: color.value, img: logo && logo.bytes, png: logo && logo.png, size: +size.value, opacity: +opacity.value / 100, layout: layout.value, pages: pages.value.trim() });
    }).then(function (out) {
      results.set([{ name: T.baseName(file.name) + '-watermarked.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      status.ok('Done! Your watermarked PDF is ready.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function sample() { return T.lib('pdflib').then(function (L) { return samplePdf(L, 2); }).then(function (b) { return new File([b], 'sample-report.pdf', { type: 'application/pdf' }); }); }
  function samplePdf(L, n) {
    return L.PDFDocument.create().then(function (d) {
      return d.embedFont(L.StandardFonts.Helvetica).then(function (f) {
        for (var i = 1; i <= n; i++) {
          var p = d.addPage([595.28, 841.89]);
          p.drawText('Quarterly report, page ' + i, { x: 60, y: 770, size: 24, font: f, color: L.rgb(0.1, 0.2, 0.5) });
          for (var l = 0; l < 18; l++) p.drawText('Line ' + (l + 1) + ': sales, costs and notes for the quarter.', { x: 60, y: 720 - l * 22, size: 12, font: f });
        }
        return d.save();
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '💧', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    T.field('Watermark', kind), textBox, logoBox,
    h('div', { 'class': 'tgrid2' }, [T.field('Layout', layout), T.field('Pages (optional)', pages, 'e.g. 1-3, 5. Empty = all pages.'), T.field('Size', size), T.field('Strength (see-through ↔ solid)', opacity)]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { sample().then(function (f) { take([f]); run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  sync();
  T.tests['pdf-watermark'] = function () {
    var f = [];
    function textOf(bytes, n) { return T.lib('pdfjs').then(function (P) { return P.getDocument({ data: bytes.slice(0) }).promise; }).then(function (pdf) { return pdf.getPage(n); }).then(function (p) { return p.getTextContent(); }).then(function (tc) { return tc.items.map(function (i) { return i.str; }).join(' '); }); }
    return T.lib('pdflib').then(function (L) {
      return samplePdf(L, 3).then(function (src) {
        return stamp(src, { kind: 'text', text: 'TOP SECRET', color: '#ff0000', size: 60, opacity: 0.3, layout: 'diag', pages: '2-3' }).then(function (out) {
          return Promise.all([textOf(out, 1), textOf(out, 2)]).then(function (t) {
            if (t[0].indexOf('TOP SECRET') >= 0) f.push('page 1 should be untouched');
            if (t[1].indexOf('TOP SECRET') < 0) f.push('page 2 has no watermark');
          });
        }).then(function () { return stamp(src, { kind: 'text', text: 'गोपनीय', color: '#0000ff', size: 50, opacity: 0.5, layout: 'tile', pages: '' }); })
          .then(function (out) { return L.PDFDocument.load(out).then(function (d) { if (d.getPageCount() !== 3 || out.length <= src.length) f.push('Hindi watermark'); }); });
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
