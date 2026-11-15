/* PDF Organizer — rotate, delete and reorder pages with thumbnails (pdf.js to preview, pdf-lib to save).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('pdf-organize', function (spot, T) {
  var h = T.h, file, bytes, pages = [], loading = false, status = T.status(), results = T.results();
  var grid = h('div', { 'class': 'tpages' });
  var save = T.button('Save PDF', { primary: true, onclick: run });
  save.disabled = true;
  var tools = h('div', { hidden: true }, [
    T.row([T.button('Rotate all ↻', { small: true, onclick: function () { pages.forEach(function (p) { p.rot = (p.rot + 90) % 360; }); draw(); } }),
      T.button('Reverse order', { small: true, onclick: function () { pages.reverse(); draw(); } }),
      T.button('Restore deleted', { small: true, onclick: function () { pages.forEach(function (p) { p.off = false; }); draw(); } })]),
    grid, T.row([save])]);
  spot.appendChild(T.card([
    T.dropzone({ accept: 'application/pdf,.pdf', icon: '🗂️', label: 'Choose a PDF', onFiles: load }),
    tools, status.el, results.el]));

  function load(files) {
    file = files[0]; results.clear(); grid.innerHTML = ''; pages = []; loading = true; save.disabled = true;
    status.info('Loading pages…');
    T.read(file).then(function (b) {
      bytes = b;
      return T.lib('pdfjs').then(function (pdfjs) { return pdfjs.getDocument({ data: new Uint8Array(b.slice(0)) }).promise; });
    }).then(function (pdf) {
      var n = pdf.numPages, i = 0;
      if (n > 300) throw new Error('This PDF has ' + n + ' pages. Use Split PDF first (the organizer handles up to 300).');
      for (var k = 1; k <= n; k++) pages.push({ n: k, rot: 0, off: false, canvas: null });
      tools.hidden = false; draw();
      function next() {
        if (i >= n) { loading = false; draw(); status.ok(n + ' pages loaded. Rotate, delete or move them, then save.'); return; }
        var p = pages.filter(function (x) { return x.n === i + 1; })[0]; i++;
        status.progress(i / n, 'Loading page ' + i + ' of ' + n + '…');
        return T.renderPage(pdf, p.n, 0.3).then(function (c) { p.canvas = c; draw(); return next(); });
      }
      return next();
    }).catch(function (e) { loading = false; status.error(e); });
  }

  function draw() {
    grid.innerHTML = '';
    pages.forEach(function (p, i) {
      var thumb = p.canvas || h('div', { style: 'aspect-ratio:3/4;background:var(--surface-2);border-radius:6px' });
      if (p.canvas) p.canvas.style.transform = 'rotate(' + p.rot + 'deg)';
      grid.appendChild(h('div', { 'class': 'tpage' + (p.off ? ' is-off' : '') }, [
        thumb, h('span', { 'class': 'tpage-n', text: 'Page ' + p.n + (p.off ? ' · removed' : '') }),
        h('div', { 'class': 'tpage-act' }, [
          h('button', { type: 'button', title: 'Move left', 'aria-label': 'Move page ' + p.n + ' earlier', disabled: i === 0, text: '←', onclick: function () { swap(i, i - 1); } }),
          h('button', { type: 'button', title: 'Rotate', 'aria-label': 'Rotate page ' + p.n, text: '↻', onclick: function () { p.rot = (p.rot + 90) % 360; draw(); } }),
          h('button', { type: 'button', title: p.off ? 'Restore' : 'Delete', 'aria-label': (p.off ? 'Restore' : 'Delete') + ' page ' + p.n, text: p.off ? '↺' : '🗑', onclick: function () { p.off = !p.off; draw(); } }),
          h('button', { type: 'button', title: 'Move right', 'aria-label': 'Move page ' + p.n + ' later', disabled: i === pages.length - 1, text: '→', onclick: function () { swap(i, i + 1); } })])]));
    });
    save.disabled = loading || !pages.some(function (p) { return !p.off; });
  }
  function swap(a, b) { var x = pages[a]; pages[a] = pages[b]; pages[b] = x; draw(); }

  function run() {
    var keep = pages.filter(function (p) { return !p.off; });
    if (loading || !keep.length) return status.info(loading ? 'Still loading the pages, one moment…' : 'Choose a PDF first, and keep at least one page.');
    save.disabled = true; status.info('Saving…');
    T.lib('pdflib').then(function (PDFLib) {
      return PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true }).then(function (src) {
        return PDFLib.PDFDocument.create().then(function (out) {
          return out.copyPages(src, keep.map(function (p) { return p.n - 1; })).then(function (copied) {
            copied.forEach(function (pg, i) {
              var r = (pg.getRotation().angle + keep[i].rot) % 360;
              pg.setRotation(PDFLib.degrees(r)); out.addPage(pg);
            });
            return out.save();
          });
        });
      });
    }).then(function (b) {
      results.set([{ name: T.baseName(file.name) + '-organized.pdf', blob: new Blob([b], { type: 'application/pdf' }), note: keep.length + ' pages' }]);
      status.ok('Saved with ' + keep.length + ' pages.');
    }).catch(status.error).then(function () { save.disabled = false; });
  }
});
