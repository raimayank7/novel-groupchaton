/* Merge PDF — joins PDFs in the chosen order, in the browser (pdf-lib). Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('pdf-merge', function (spot, T) {
  var h = T.h, list, status = T.status(), results = T.results();
  var go = T.button('Merge PDFs', { primary: true, disabled: true, onclick: run });
  list = T.fileList(function (files) { go.disabled = files.length < 2; results.clear(); status.info(files.length === 1 ? 'Add at least one more PDF.' : ''); });
  spot.appendChild(T.card([
    T.dropzone({ accept: 'application/pdf,.pdf', multiple: true, icon: '🧩', label: 'Choose PDF files', hint: 'or drag and drop them here · use ↑ ↓ to set the order',
      filter: function (f) { return /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name); }, onFiles: list.add }),
    list.el, T.row([go]), status.el, results.el]));

  function run() {
    var files = list.files();
    go.disabled = true;
    T.lib('pdflib').then(function (PDFLib) {
      return PDFLib.PDFDocument.create().then(function (out) {
        var i = 0;
        function next() {
          if (i >= files.length) return out.save();
          var f = files[i++];
          status.progress((i - 1) / files.length, 'Adding ' + f.name + '…');
          return T.read(f).then(function (buf) {
            return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
          }).then(function (src) {
            return out.copyPages(src, src.getPageIndices());
          }).then(function (pages) { pages.forEach(function (p) { out.addPage(p); }); return next(); })
            .catch(function (e) { throw new Error(f.name + ': ' + (/encrypt/i.test(e.message) ? 'this PDF is password-protected.' : e.message)); });
        }
        return next().then(function (bytes) {
          var blob = new Blob([bytes], { type: 'application/pdf' });
          results.set([{ name: 'merged.pdf', blob: blob, note: out.getPageCount() + ' pages' }]);
          status.ok('Done! ' + files.length + ' files merged into one PDF with ' + out.getPageCount() + ' pages.');
        });
      });
    }).catch(status.error).then(function () { go.disabled = list.files().length < 2; });
  }
});
