/* Image to Text (OCR) — reads text in images on the device (tesseract.js). Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('ocr', function (spot, T) {
  var h = T.h, status = T.status(), file = null;
  var lang = T.select([['eng', 'English'], ['hin', 'Hindi'], ['pan', 'Punjabi'], ['kor', 'Korean'], ['jpn', 'Japanese'], ['chi_sim', 'Chinese (Simplified)'],
    ['spa', 'Spanish'], ['fra', 'French'], ['deu', 'German'], ['ara', 'Arabic'], ['eng+hin', 'English + Hindi']], 'eng');
  var prev = h('img', { alt: 'Selected image', hidden: true, style: 'max-height:240px;border-radius:12px;justify-self:center' });
  var out = h('textarea', { 'class': 'tout', 'aria-label': 'Recognised text', placeholder: 'The text will appear here.' });
  var go = T.button('Read text', { primary: true, disabled: true, onclick: run });
  var copy = T.button('Copy', { onclick: function () { T.copy(out.value, copy); } });
  var save = T.button('Download .txt', { onclick: function () { T.download(new Blob([out.value], { type: 'text/plain;charset=utf-8' }), T.baseName(file.name) + '.txt'); } });
  spot.appendChild(T.card([
    T.dropzone({ accept: 'image/*', paste: true, icon: '🔍', label: 'Choose an image', hint: 'photo, scan or screenshot · or paste one',
      filter: function (f) { return /^image\//.test(f.type); }, onFiles: function (f) {
        file = f[0]; prev.src = URL.createObjectURL(file); prev.hidden = false; go.disabled = false; status.clear(); } }),
    prev, h('div', { 'class': 'tgrid2' }, [T.field('Language in the image', lang)]), T.row([go]), status.el, out, T.row([copy, save])]));

  function run() {
    go.disabled = true; status.progress(0, 'Loading the text reader (first time takes a few seconds)…');
    T.lib('tesseract').then(function (Tesseract) {
      return Tesseract.recognize(file, lang.value, { logger: function (m) {
        if (m.status === 'recognizing text') status.progress(m.progress, 'Reading… ' + Math.round(m.progress * 100) + '%');
        else if (/load/.test(m.status)) status.progress(m.progress || 0, 'Loading ' + (m.status.indexOf('language') >= 0 ? 'language data' : 'reader') + '…');
      } });
    }).then(function (r) {
      out.value = r.data.text.trim();
      if (out.value) status.ok('Done! Confidence ' + Math.round(r.data.confidence) + '%. Check names and numbers before using the text.');
      else status.error('No text found. Try a sharper, straighter photo with more light.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
});
