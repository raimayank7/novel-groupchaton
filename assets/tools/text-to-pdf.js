/* Text to PDF — typed or uploaded text, wrapped onto pages (jsPDF). Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('text-to-pdf', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  var text = h('textarea', { placeholder: 'Type or paste your text here…', 'aria-label': 'Text', rows: '10' });
  text.value = T.store.get('text-to-pdf', '');
  text.addEventListener('input', function () { T.store.set('text-to-pdf', text.value.slice(0, 50000)); });
  var title = h('input', { type: 'text', placeholder: 'Optional title at the top' });
  var font = T.select([['helvetica', 'Sans (Helvetica)'], ['times', 'Serif (Times)'], ['courier', 'Monospace (Courier)']], 'helvetica');
  var size = T.select([[10, '10 pt'], [11, '11 pt'], [12, '12 pt'], [14, '14 pt'], [16, '16 pt']], 12);
  var paper = T.select([['a4', 'A4'], ['letter', 'Letter']], 'a4');
  var nums = h('input', { type: 'checkbox', checked: true });
  var upload = h('input', { type: 'file', accept: '.txt,text/plain,.md,.csv', hidden: true, onchange: function () {
    if (upload.files[0]) T.read(upload.files[0], 'text').then(function (t) { text.value = t; title.value = title.value || T.baseName(upload.files[0].name); });
  } });
  var go = T.button('Make PDF', { primary: true, onclick: run });
  spot.appendChild(T.card([
    T.field('Title', title), T.field('Text', text),
    T.row([T.button('Open a .txt file', { small: true, onclick: function () { upload.click(); } }), upload]),
    h('div', { 'class': 'tgrid2' }, [T.field('Font', font), T.field('Size', size), T.field('Paper', paper)]),
    h('label', { 'class': 'tcheck' }, [nums, 'Page numbers']),
    T.row([go]), status.el, results.el]));

  function run() {
    if (!text.value.trim()) return status.error('Type or paste some text first.');
    go.disabled = true;
    T.lib('jspdf').then(function (lib) {
      var pdf = new lib.jsPDF({ unit: 'pt', format: paper.value });
      var W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight(), M = 56, fs = +size.value, lh = fs * 1.45, y = M;
      pdf.setFont(font.value, 'normal');
      if (title.value.trim()) {
        pdf.setFont(font.value, 'bold'); pdf.setFontSize(fs + 6);
        pdf.splitTextToSize(title.value.trim(), W - M * 2).forEach(function (l) { pdf.text(l, M, y + fs); y += (fs + 6) * 1.4; });
        y += fs * 0.6; pdf.setFont(font.value, 'normal');
      }
      pdf.setFontSize(fs);
      // jsPDF's built-in fonts only cover Latin text: replace typographic quotes and dashes it cannot draw
      var clean = text.value.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...');
      clean.split(/\r?\n/).forEach(function (para) {
        var lines = para ? pdf.splitTextToSize(para, W - M * 2) : [''];
        lines.forEach(function (l) {
          if (y + lh > H - M) { pdf.addPage(); y = M; }
          pdf.text(l, M, y + fs); y += lh;
        });
      });
      if (nums.checked) {
        var n = pdf.getNumberOfPages();
        for (var i = 1; i <= n; i++) { pdf.setPage(i); pdf.setFontSize(9); pdf.setTextColor(140); pdf.text(i + ' / ' + n, W / 2, H - 24, { align: 'center' }); }
      }
      var name = (T.baseName(title.value.trim()) || 'document').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) + '.pdf';
      results.set([{ name: name, blob: pdf.output('blob'), note: pdf.getNumberOfPages() + ' pages' }]);
      status.ok('Done! ' + pdf.getNumberOfPages() + (pdf.getNumberOfPages() === 1 ? ' page.' : ' pages.') +
        (/[^\x00-\xFF]/.test(clean) ? ' Note: letters outside the Latin alphabet (e.g. Hindi, Korean) may not show. Use HTML to PDF for those.' : ''));
    }).catch(status.error).then(function () { go.disabled = false; });
  }
});
