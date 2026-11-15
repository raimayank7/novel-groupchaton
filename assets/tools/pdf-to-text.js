/* PDF to Text — extract the text layer page by page (pdf.js). Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('pdf-to-text', function (spot, T) {
  var h = T.h, status = T.status(), file;
  var out = h('textarea', { 'class': 'tout', readonly: true, 'aria-label': 'Extracted text', placeholder: 'The text will appear here.' });
  var copy = T.button('Copy text', { onclick: function () { T.copy(out.value, copy); } });
  var save = T.button('Download .txt', { primary: true, onclick: function () { T.download(new Blob([out.value], { type: 'text/plain;charset=utf-8' }), T.baseName(file.name) + '.txt'); } });
  var marks = h('input', { type: 'checkbox', checked: true });
  var actions = h('div', { hidden: true }, [T.row([save, copy])]);
  spot.appendChild(T.card([
    T.dropzone({ accept: 'application/pdf,.pdf', icon: '📝', label: 'Choose a PDF', onFiles: run }),
    h('label', { 'class': 'tcheck' }, [marks, 'Mark where each page starts']),
    status.el, out, actions]));

  function run(files) {
    file = files[0]; out.value = ''; actions.hidden = true;
    T.openPdf(file).then(function (pdf) {
      var parts = [], i = 0;
      function next() {
        if (i >= pdf.numPages) return parts;
        var n = ++i;
        status.progress(n / pdf.numPages, 'Reading page ' + n + ' of ' + pdf.numPages + '…');
        return pdf.getPage(n).then(function (p) { return p.getTextContent(); }).then(function (tc) {
          var line = '', lastY = null, text = '';
          tc.items.forEach(function (it) {
            var y = it.transform ? Math.round(it.transform[5]) : null;
            if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) { text += line.trimEnd() + '\n'; line = ''; }
            line += it.str + (it.hasEOL ? '\n' : '');
            lastY = y;
          });
          text += line;
          parts.push((marks.checked ? '--- Page ' + n + ' ---\n' : '') + text.replace(/\n{3,}/g, '\n\n').trim());
          return next();
        });
      }
      return next();
    }).then(function (parts) {
      out.value = parts.join('\n\n');
      actions.hidden = false;
      var empty = !out.value.replace(/--- Page \d+ ---/g, '').trim();
      if (empty) status.error('No text found. This PDF is probably scanned images: try Image to Text (OCR) on its pages.');
      else status.ok('Done! ' + out.value.split(/\s+/).length.toLocaleString() + ' words found.');
    }).catch(status.error);
  }
});
