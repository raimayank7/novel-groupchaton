/* PDF to Image — render pages as JPG or PNG (pdf.js). Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('pdf-to-image', function (spot, T) {
  var h = T.h, pdf = null, file, status = T.status(), results = T.results();
  var info = h('p', { 'class': 'tstatus' });
  var fmt = T.seg([['image/jpeg', 'JPG'], ['image/png', 'PNG']], 'image/jpeg');
  var quality = T.select([[1, 'Normal (96 dpi)'], [2, 'High (192 dpi)'], [3, 'Print (288 dpi)']], 2);
  var ranges = h('input', { type: 'text', placeholder: 'All pages' });
  var go = T.button('Convert to images', { primary: true, onclick: run });
  var opts = h('div', { 'class': 'tool-app-opts', hidden: true }, [
    h('div', { 'class': 'tgrid2' }, [T.field('Format', fmt), T.field('Quality', quality), T.field('Pages (optional)', ranges, 'e.g. 1-3, 5. Leave empty for all.')]),
    T.row([go])]);
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🖼️', label: 'Choose a PDF', onFiles: load }), info, opts, status.el, results.el]));

  function load(files) {
    file = files[0]; pdf = null; go.disabled = true; results.clear(); status.info('Opening ' + file.name + '…');
    T.openPdf(file).then(function (d) { pdf = d; go.disabled = false; opts.hidden = false; info.textContent = file.name + ' · ' + d.numPages + ' pages'; status.clear(); }).catch(status.error);
  }
  function run() {
    if (!pdf) return status.info(file ? 'Still opening the PDF, one moment…' : 'Choose a PDF first.');
    var list = ranges.value.trim() ? T.parseRanges(ranges.value, pdf.numPages) : T.parseRanges('1-', pdf.numPages);
    if (!list.length) return status.error('Those pages are not in this PDF.');
    var type = fmt.value(), ext = type === 'image/png' ? 'png' : 'jpg', scale = +quality.value, out = [], i = 0, base = T.baseName(file.name);
    go.disabled = true;
    (function next() {
      if (i >= list.length) {
        results.set(out, base + '-images');
        status.ok(out.length + (out.length === 1 ? ' image is' : ' images are') + ' ready.');
        go.disabled = false; return;
      }
      var n = list[i++];
      status.progress(i / list.length, 'Rendering page ' + n + '…');
      T.renderPage(pdf, n, scale).then(function (c) {
        return T.canvasBlob(c, type, 0.92).then(function (b) {
          var thumb = h('canvas'); thumb.width = 96; thumb.height = Math.round(96 * c.height / c.width);
          thumb.getContext('2d').drawImage(c, 0, 0, thumb.width, thumb.height);
          out.push({ name: base + '-page-' + n + '.' + ext, blob: b, preview: thumb.toDataURL('image/jpeg', 0.7), note: c.width + '×' + c.height });
          next();
        });
      }).catch(function (e) { status.error(e); go.disabled = false; });
    })();
  }
});
