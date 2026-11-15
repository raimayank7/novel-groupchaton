/* Split PDF — extract chosen pages into one PDF, or every page into its own file (pdf-lib). Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('pdf-split', function (spot, T) {
  var h = T.h, src = null, file = null, status = T.status(), results = T.results();
  var info = h('p', { 'class': 'tstatus' });
  var mode = T.seg([['extract', 'Extract pages'], ['each', 'Every page separately'], ['chunks', 'Split every N pages']], 'extract', sync);
  var ranges = h('input', { type: 'text', placeholder: 'e.g. 1-3, 5, 8-10' });
  var chunk = h('input', { type: 'number', min: '1', value: '2' });
  var fRanges = T.field('Pages to keep', ranges, 'Use commas and dashes. “8-” means page 8 to the end.');
  var fChunk = T.field('Pages per file', chunk);
  var go = T.button('Split PDF', { primary: true, disabled: true, onclick: run });
  var opts = h('div', { 'class': 'tool-app-opts', hidden: true }, [mode, fRanges, fChunk, T.row([go])]);
  spot.appendChild(T.card([
    T.dropzone({ accept: 'application/pdf,.pdf', icon: '✂️', label: 'Choose a PDF', onFiles: load }),
    info, opts, status.el, results.el]));
  sync();
  function sync() { var m = mode.value(); fRanges.hidden = m !== 'extract'; fChunk.hidden = m !== 'chunks'; }

  function load(files) {
    file = files[0]; results.clear(); status.info('Reading ' + file.name + '…');
    T.lib('pdflib').then(function (PDFLib) {
      return T.read(file).then(function (b) { return PDFLib.PDFDocument.load(b, { ignoreEncryption: true }); });
    }).then(function (doc) {
      src = doc; opts.hidden = false; go.disabled = false;
      info.textContent = file.name + ' · ' + doc.getPageCount() + ' pages';
      ranges.value = '1-' + Math.min(3, doc.getPageCount());
      status.clear();
    }).catch(function (e) { status.error(/encrypt/i.test(e.message) ? 'This PDF is password-protected.' : e); });
  }

  function run() {
    var total = src.getPageCount(), m = mode.value(), groups = [];
    if (m === 'extract') {
      var pages = T.parseRanges(ranges.value, total);
      if (!pages.length) return status.error('Type the pages you want, e.g. 1-3, 5.');
      groups.push(pages);
    } else {
      var n = m === 'each' ? 1 : Math.max(1, parseInt(chunk.value, 10) || 1);
      for (var p = 1; p <= total; p += n) { var g = []; for (var q = p; q < Math.min(total + 1, p + n); q++) g.push(q); groups.push(g); }
    }
    go.disabled = true;
    var base = T.baseName(file.name), out = [];
    T.lib('pdflib').then(function (PDFLib) {
      var i = 0;
      function next() {
        if (i >= groups.length) return out;
        var g = groups[i++];
        status.progress(i / groups.length, 'Making file ' + i + ' of ' + groups.length + '…');
        return PDFLib.PDFDocument.create().then(function (doc) {
          return doc.copyPages(src, g.map(function (x) { return x - 1; })).then(function (ps) {
            ps.forEach(function (pg) { doc.addPage(pg); }); return doc.save();
          });
        }).then(function (bytes) {
          var label = g.length === 1 ? 'page-' + g[0] : 'pages-' + g[0] + '-' + g[g.length - 1];
          if (m === 'extract') label = 'extracted';
          out.push({ name: base + '-' + label + '.pdf', blob: new Blob([bytes], { type: 'application/pdf' }), note: g.length + (g.length === 1 ? ' page' : ' pages') });
          return next();
        });
      }
      return next();
    }).then(function (files) {
      results.set(files, base + '-split');
      status.ok('Done! ' + files.length + (files.length === 1 ? ' file is' : ' files are') + ' ready.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
});
