/* HTML to PDF — live preview in a sandboxed frame; save as a picture PDF (html2canvas + jsPDF) or print to a
   sharp, selectable PDF with the browser. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('html-to-pdf', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), timer;
  var code = h('textarea', { spellcheck: 'false', 'aria-label': 'HTML code', rows: '10', style: 'font-family:ui-monospace,Consolas,monospace;font-size:13.5px' });
  code.value = T.store.get('html-to-pdf', '<h1>Hello!</h1>\n<p>Paste or write your <b>HTML</b> here. The preview updates as you type.</p>\n<ul><li>Images must be online links (https://…)</li><li>Scripts are not run</li></ul>');
  // no scripts run in the preview: it only needs same-origin access so the page can be captured, and modals for printing
  var frame = h('iframe', { 'class': 'tframe', title: 'Preview', sandbox: 'allow-same-origin allow-modals' });
  var paper = T.select([['a4', 'A4'], ['letter', 'Letter']], 'a4');
  var pdfBtn = T.button('Download PDF', { primary: true, onclick: run });
  var printBtn = T.button('Print / Save as PDF', { onclick: function () { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) { status.error(e); } } });
  spot.appendChild(T.card([
    T.field('HTML code', code), T.field('Preview', frame),
    h('div', { 'class': 'tgrid2' }, [T.field('Paper', paper)]),
    T.row([pdfBtn, printBtn]),
    h('p', { 'class': 'tstatus', text: 'Tip: “Print / Save as PDF” keeps text sharp and selectable. Choose “Save as PDF” as the printer.' }),
    status.el, results.el]));
  function preview() {
    T.store.set('html-to-pdf', code.value.slice(0, 100000));
    frame.srcdoc = '<!doctype html><meta charset="utf-8"><style>body{font:15px/1.6 system-ui,sans-serif;margin:24px;color:#111;background:#fff}img{max-width:100%}</style>' + code.value;
  }
  code.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(preview, 300); });
  preview();

  function run() {
    pdfBtn.disabled = true; status.info('Capturing the page…');
    Promise.all([T.lib('html2canvas'), T.lib('jspdf')]).then(function (libs) {
      var d = frame.contentDocument;
      return libs[0](d.body, { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 794 }).then(function (canvas) {
        var pdf = new libs[1].jsPDF({ unit: 'pt', format: paper.value });
        var W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight();
        var pxPerPage = Math.floor(canvas.width * H / W), y = 0, first = true;
        while (y < canvas.height) {
          var slice = h('canvas'); slice.width = canvas.width; slice.height = Math.min(pxPerPage, canvas.height - y);
          slice.getContext('2d').drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
          if (!first) pdf.addPage();
          pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, W, slice.height * W / canvas.width);
          y += pxPerPage; first = false;
        }
        results.set([{ name: 'page.pdf', blob: pdf.output('blob'), note: pdf.getNumberOfPages() + ' pages' }]);
        status.ok('Done!');
      });
    }).catch(status.error).then(function () { pdfBtn.disabled = false; });
  }
});
