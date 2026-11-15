/* Zip & Unzip — pack files or a folder into a ZIP, or open a ZIP and save what's inside (JSZip).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('zip', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), picked = [];
  var mode = T.seg([['zip', 'Make a ZIP'], ['unzip', 'Open a ZIP']], 'zip', sync);
  var name = h('input', { type: 'text', value: 'my-files' });
  var level = T.select([[6, 'Normal'], [9, 'Smallest (slower)'], [1, 'Fastest']], 6);
  var info = h('p', { 'class': 'tstatus' });
  var go = T.button('Create ZIP', { primary: true, disabled: true, onclick: makeZip });
  var zipSide = h('div', { 'class': 'tool-app-opts' }, [
    h('div', { 'class': 'tgrid2' }, [
      T.dropzone({ multiple: true, icon: '📄', label: 'Choose files', onFiles: add }),
      T.dropzone({ multiple: true, folder: true, icon: '📁', label: 'Choose a folder', hint: 'keeps the folder structure', onFiles: add })]),
    info, h('div', { 'class': 'tgrid2' }, [T.field('ZIP name', name), T.field('Compression', level)]), T.row([go])]);
  var unzipSide = h('div', { 'class': 'tool-app-opts' }, [T.dropzone({ accept: '.zip,application/zip', icon: '📦', label: 'Choose a ZIP file', onFiles: unzip })]);
  spot.appendChild(T.card([mode, zipSide, unzipSide, status.el, results.el]));
  sync();
  function sync() { var z = mode.value() === 'zip'; zipSide.hidden = !z; unzipSide.hidden = z; results.clear(); status.clear(); }
  function add(files) {
    picked = picked.concat(files);
    var size = picked.reduce(function (s, f) { return s + f.size; }, 0);
    info.textContent = picked.length + ' files · ' + T.bytes(size) + ' ';
    info.appendChild(h('button', { type: 'button', 'class': 'tbtn tbtn-sm', text: 'Clear', onclick: function () { picked = []; info.textContent = ''; go.disabled = true; } }));
    go.disabled = !picked.length;
  }
  function makeZip() {
    go.disabled = true;
    T.lib('jszip').then(function (JSZip) {
      var z = new JSZip();
      picked.forEach(function (f) { z.file(f.webkitRelativePath || f.name, f); });
      return z.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: +level.value } },
        function (m) { status.progress(m.percent / 100, 'Packing… ' + Math.round(m.percent) + '%'); });
    }).then(function (blob) {
      var total = picked.reduce(function (s, f) { return s + f.size; }, 0);
      results.set([{ name: (name.value.trim() || 'files').replace(/[\\/:*?"<>|]+/g, '') + '.zip', blob: blob, icon: '📦', note: picked.length + ' files' }]);
      status.ok('Done! ' + T.bytes(total) + ' → ' + T.bytes(blob.size) + '.');
    }).catch(status.error).then(function () { go.disabled = !picked.length; });
  }
  function unzip(files) {
    status.info('Opening ' + files[0].name + '…');
    T.lib('jszip').then(function (JSZip) { return JSZip.loadAsync(files[0]); }).then(function (z) {
      var entries = Object.keys(z.files).filter(function (k) { return !z.files[k].dir; }), out = [], i = 0;
      if (entries.length > 500) throw new Error('This ZIP has ' + entries.length + ' files; the tool opens up to 500.');
      function next() {
        if (i >= entries.length) return out;
        var k = entries[i++];
        status.progress(i / entries.length, 'Extracting ' + k + '…');
        return z.files[k].async('blob').then(function (b) {
          out.push({ name: k.split('/').pop(), blob: b, note: k.indexOf('/') > 0 ? k : '', preview: /\.(png|jpe?g|gif|webp)$/i.test(k) ? URL.createObjectURL(b) : null });
          return next();
        });
      }
      return next();
    }).then(function (out) {
      results.set(out, T.baseName(files[0].name));
      status.ok(out.length + ' files inside. Download the ones you need.');
    }).catch(function (e) { status.error(/password|encrypt/i.test(e.message) ? 'This ZIP is password-protected.' : e); });
  }
});
