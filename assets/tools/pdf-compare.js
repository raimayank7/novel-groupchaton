/* Infinity by GroupChatOn — pdf-compare. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Compare two PDFs: changed words highlighted page by page, and a picture of every page with the differences marked in red (pdf.js). */
GCOTools.register('pdf-compare', function (spot, T) {
  var h = T.h, status = T.status(), files = [null, null], docs = [null, null], pageNo = 1;
  // word diff → [[op, word]], op: 0 same, -1 only in A, 1 only in B
  function diff(a, b) {
    var s = 0, ea = a.length, eb = b.length, out = [], tail = [];
    while (s < ea && s < eb && a[s] === b[s]) out.push([0, a[s++]]);
    while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) tail.unshift([0, a[--ea]]), eb--;
    var A = a.slice(s, ea), B = b.slice(s, eb), n = A.length, m = B.length;
    if (n * m > 2500000) { A.forEach(function (w) { out.push([-1, w]); }); B.forEach(function (w) { out.push([1, w]); }); return out.concat(tail); }
    var L = []; for (var i = 0; i <= n; i++) L.push(new Uint32Array(m + 1));
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    i = 0; j = 0;
    while (i < n && j < m) { if (A[i] === B[j]) { out.push([0, A[i]]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) out.push([-1, A[i++]]); else out.push([1, B[j++]]); }
    while (i < n) out.push([-1, A[i++]]); while (j < m) out.push([1, B[j++]]);
    return out.concat(tail);
  }
  function words(doc, n) {
    if (n > doc.numPages) return Promise.resolve([]);
    return doc.getPage(n).then(function (p) { return p.getTextContent(); }).then(function (tc) { return tc.items.map(function (i) { return i.str; }).join(' ').split(/\s+/).filter(Boolean); });
  }
  // red marks where two rendered pages differ; returns { canvas, share (0–1) }
  function visual(ca, cb) {
    var w = Math.max(ca.width, cb.width), hh = Math.max(ca.height, cb.height), out = h('canvas'); out.width = w; out.height = hh;
    var g = out.getContext('2d'), A = h('canvas'), B = h('canvas'); A.width = B.width = w; A.height = B.height = hh;
    [[A, ca], [B, cb]].forEach(function (x) { var q = x[0].getContext('2d'); q.fillStyle = '#fff'; q.fillRect(0, 0, w, hh); q.drawImage(x[1], 0, 0); });
    var da = A.getContext('2d').getImageData(0, 0, w, hh).data, db = B.getContext('2d').getImageData(0, 0, w, hh).data, o = g.createImageData(w, hh), d = o.data, bad = 0;
    for (var i = 0; i < da.length; i += 4) {
      var dif = Math.abs(da[i] - db[i]) > 48 || Math.abs(da[i + 1] - db[i + 1]) > 48 || Math.abs(da[i + 2] - db[i + 2]) > 48;
      if (dif) { bad++; d[i] = 235; d[i + 1] = 30; d[i + 2] = 60; d[i + 3] = 255; }
      else { var y = 255 - (255 - (0.3 * db[i] + 0.59 * db[i + 1] + 0.11 * db[i + 2])) * 0.35; d[i] = d[i + 1] = d[i + 2] = y; d[i + 3] = 255; }
    }
    g.putImageData(o, 0, 0);
    return { canvas: out, share: bad / (w * hh) };
  }
  var summary = h('div', { 'class': 'tstats', hidden: true }), view = h('div', { 'class': 'tdiff tdiff-words', 'data-out': '' });
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Page with differences in red' }), prev = h('div', { 'class': 'tfit-prev', hidden: true }, [cv]), lab = h('b');
  var pick = [0, 1].map(function (k) {
    var name = h('small', { text: k ? 'The newer or changed copy' : 'The original copy' });
    return { name: name, el: h('div', { 'class': 'tfit-ctl' }, [T.dropzone({ accept: 'application/pdf,.pdf', icon: k ? '🅱️' : '🅰️', label: k ? 'Choose PDF B' : 'Choose PDF A', hint: 'nothing is uploaded', onFiles: function (fl) { set(k, fl[0]); } }), name]) };
  });
  var go = T.button('Compare', { primary: true, disabled: true, onclick: run });
  function set(k, f) {
    files[k] = f; docs[k] = null; pick[k].name.textContent = f.name + ' · ' + T.bytes(f.size);
    go.disabled = !(files[0] && files[1]);
    return T.openPdf(f).then(function (d) { docs[k] = d; }).catch(status.error);
  }
  function showPage(n) {
    var a = docs[0], b = docs[1]; pageNo = n;
    var max = Math.max(a.numPages, b.numPages);
    lab.textContent = 'Page ' + n + ' of ' + max;
    if (n > a.numPages || n > b.numPages) { prev.hidden = true; lab.textContent += ' · only in ' + (n > a.numPages ? 'B' : 'A'); return Promise.resolve(); }
    return Promise.all([a.getPage(n), b.getPage(n)]).then(function (p) {
      var k = Math.min(1.6, 640 / p[0].getViewport({ scale: 1 }).width);
      return Promise.all([T.renderPage(a, n, k), T.renderPage(b, n, k)]);
    }).then(function (c) { var v = visual(c[0], c[1]); cv.width = v.canvas.width; cv.height = v.canvas.height; cv.getContext('2d').drawImage(v.canvas, 0, 0); prev.hidden = false; lab.textContent += v.share > 0.0001 ? ' · red = different' : ' · looks the same'; });
  }
  function run() {
    if (!docs[0] || !docs[1]) return status.info('Still opening the PDFs, one moment…');
    var a = docs[0], b = docs[1], max = Math.max(a.numPages, b.numPages), n = 0, stats = { pages: 0, added: 0, removed: 0, looks: 0 };
    go.disabled = true; view.innerHTML = '';
    function next() {
      if (n >= max) return;
      n++; status.progress(n / max, 'Comparing page ' + n + ' of ' + max + '…');
      return Promise.all([words(a, n), words(b, n)]).then(function (w) {
        var d = diff(w[0], w[1]), changed = d.some(function (x) { return x[1] && x[0]; });
        if (changed) {
          stats.pages++;
          var box = h('div', {}, [h('b', { text: 'Page ' + n + ': ' })]);
          d.forEach(function (x, i) {
            if (x[0] === -1) stats.removed++; if (x[0] === 1) stats.added++;
            var near = x[0] || d.slice(Math.max(0, i - 6), i + 7).some(function (y) { return y[0]; });   // only the changes and a few words around them
            if (!near) { if (box.lastChild.textContent !== ' … ') box.appendChild(h('span', { 'class': 'tdiff-same', text: ' … ' })); return; }
            box.appendChild(h('span', { 'class': x[0] === 1 ? 'tdiff-add' : x[0] === -1 ? 'tdiff-del' : 'tdiff-same', text: x[1] })); box.appendChild(document.createTextNode(' '));
          });
          view.appendChild(box);
        }
        if (n <= Math.min(a.numPages, b.numPages)) return Promise.all([T.renderPage(a, n, 0.6), T.renderPage(b, n, 0.6)]).then(function (c) { if (visual(c[0], c[1]).share > 0.0005) stats.looks++; });
      }).then(next);
    }
    Promise.resolve().then(next).then(function () {
      summary.innerHTML = ''; summary.hidden = false;
      [[a.numPages + ' / ' + b.numPages, 'pages in A / B'], [stats.pages, 'pages with text changes'], [stats.looks, 'pages that look different'], [stats.removed, 'words removed'], [stats.added, 'words added']].forEach(function (x) {
        summary.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(x[0]) }), h('span', { text: x[1] })]));
      });
      if (!stats.pages && !stats.looks && a.numPages === b.numPages) { view.textContent = ''; status.ok('No differences found: the two PDFs have the same text and look the same.'); }
      else status.ok('Done! Removed words are struck through in red, added words are green. The page picture marks visual changes in red.');
      return showPage(1);
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePair() {
    return T.lib('pdflib').then(function (L) {
      function make(rent, extra) {
        return L.PDFDocument.create().then(function (d) {
          return d.embedFont(L.StandardFonts.Helvetica).then(function (f) {
            var p = d.addPage([595.28, 841.89]);
            p.drawText('Rent agreement', { x: 60, y: 770, size: 22, font: f });
            p.drawText('The monthly rent is ' + rent + ' payable on the 5th.', { x: 60, y: 720, size: 13, font: f });
            p.drawText('The deposit is two months of rent.', { x: 60, y: 696, size: 13, font: f });
            if (extra) p.drawText(extra, { x: 60, y: 672, size: 13, font: f });
            d.addPage([595.28, 841.89]).drawText('Signatures', { x: 60, y: 770, size: 18, font: f });
            return d.save();
          });
        });
      }
      return Promise.all([make('15,000', ''), make('18,000', 'Pets are not allowed.')]);
    });
  }
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [pick[0].el, pick[1].el]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () {
      samplePair().then(function (r) { return Promise.all([set(0, new File([r[0]], 'agreement-old.pdf', { type: 'application/pdf' })), set(1, new File([r[1]], 'agreement-new.pdf', { type: 'application/pdf' }))]); }).then(run);
    } })]), status.el, summary, view, prev,
    T.row([T.button('‹ Previous page', { small: true, onclick: function () { if (docs[1] && pageNo > 1) showPage(pageNo - 1); } }), lab, T.button('Next page ›', { small: true, onclick: function () { if (docs[1] && pageNo < Math.max(docs[0].numPages, docs[1].numPages)) showPage(pageNo + 1); } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['pdf-compare'] = function () {
    var f = [], d = diff('the rent is 15,000 a month'.split(' '), 'the rent is 18,000 a month now'.split(' '));
    var s = d.map(function (x) { return (x[0] > 0 ? '+' : x[0] < 0 ? '-' : '') + x[1]; }).join(' ');
    if (s !== 'the rent is -15,000 +18,000 a month +now') f.push('diff: ' + s);
    if (diff([], ['a']).length !== 1 || diff(['a', 'b'], ['a', 'b']).some(function (x) { return x[0]; })) f.push('edge cases');
    return samplePair().then(function (r) {
      return T.lib('pdfjs').then(function (P) { return Promise.all(r.map(function (b) { return P.getDocument({ data: b.slice(0) }).promise; })); });
    }).then(function (ds) {
      return Promise.all([T.renderPage(ds[0], 1, 1), T.renderPage(ds[1], 1, 1), T.renderPage(ds[0], 2, 1), T.renderPage(ds[1], 2, 1)]).then(function (c) {
        if (!(visual(c[0], c[1]).share > 0.0005)) f.push('page 1 should differ');
        if (visual(c[2], c[3]).share !== 0) f.push('page 2 should match');
        return Promise.all([words(ds[0], 1), words(ds[1], 1)]);
      }).then(function (w) { var dd = diff(w[0], w[1]).filter(function (x) { return x[0]; }).length; if (dd !== 6) f.push('page 1 changed words ' + dd); });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 5, fails: f }; });
  };
});
