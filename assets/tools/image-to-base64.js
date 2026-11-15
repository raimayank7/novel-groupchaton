/* Infinity by GroupChatOn — image-to-base64. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Image to Base64 and back: data URL, HTML img tag, CSS background or raw Base64 from any image; and paste Base64 to see and save the image. */
GCOTools.register('image-to-base64', function (spot, T) {
  var h = T.h, status = T.status();
  var MAGIC = [['89504e47', 'image/png'], ['ffd8ff', 'image/jpeg'], ['474946', 'image/gif'], ['52494646', 'image/webp'], ['3c737667', 'image/svg+xml'], ['3c3f786d', 'image/svg+xml'], ['424d', 'image/bmp'], ['00000100', 'image/x-icon'], ['25504446', 'application/pdf']];
  function sniff(b) { var hx = Array.prototype.map.call(b.slice(0, 4), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); for (var i = 0; i < MAGIC.length; i++) if (hx.indexOf(MAGIC[i][0]) === 0) return MAGIC[i][1]; return 'application/octet-stream'; }
  function decode(s) {
    s = s.trim(); var mime = '', i = s.indexOf(',');
    if (/^data:/i.test(s) && i > 0) { mime = (/^data:([^;,]+)/i.exec(s) || [])[1] || ''; s = s.slice(i + 1); }
    s = s.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin; try { bin = atob(s); } catch (e) { throw new Error('This is not valid Base64. Check that nothing was cut off when copying.'); }
    var b = new Uint8Array(bin.length); for (var k = 0; k < bin.length; k++) b[k] = bin.charCodeAt(k);
    return { bytes: b, mime: mime || sniff(b) };
  }
  function wrap(url, f, kind) {
    var b64 = url.slice(url.indexOf(',') + 1);
    return { url: url, b64: b64, img: '<img src="' + url + '" alt="' + T.baseName(f.name).replace(/"/g, '') + '">', css: 'background-image: url("' + url + '");', md: '![' + T.baseName(f.name) + '](' + url + ')', json: JSON.stringify(url) }[kind];
  }
  var mode = T.seg([['enc', 'Image → Base64'], ['dec', 'Base64 → Image']], 'enc', function () { encBox.hidden = mode.value() !== 'enc'; decBox.hidden = mode.value() !== 'dec'; status.clear(); });
  var kind = T.select([['url', 'Data URL (data:image/…)'], ['b64', 'Base64 only'], ['img', 'HTML <img> tag'], ['css', 'CSS background'], ['md', 'Markdown image'], ['json', 'JSON string']], 'url');
  var out = h('textarea', { rows: '8', 'class': 'tout tmono', readonly: true, 'aria-label': 'Base64 result' }), items = [];
  function show() { out.value = items.map(function (it) { return (items.length > 1 ? '/* ' + it.f.name + ' */\n' : '') + wrap(it.url, it.f, kind.value); }).join('\n\n'); }
  kind.addEventListener('change', show);
  function take(files) {
    Promise.all(files.map(function (f) { return T.read(f, 'dataURL').then(function (u) { return { f: f, url: u }; }); })).then(function (l) {
      items = l; show();
      var a = l.reduce(function (s, x) { return s + x.f.size; }, 0), b = l.reduce(function (s, x) { return s + x.url.length; }, 0);
      status.info(l.length + ' file' + (l.length > 1 ? 's' : '') + ': ' + T.bytes(a) + ' → ' + T.bytes(b) + ' of text (Base64 is about a third bigger).' + (b > 100000 ? ' Large images are better as normal files: Base64 slows pages down.' : ''));
    }, status.error);
  }
  var copy = T.button('Copy', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  var encBox = h('div', { style: 'display:grid;gap:12px' }, [T.dropzone({ accept: 'image/*,.svg,.ico', multiple: true, paste: true, icon: '🧬', label: 'Choose images', hint: 'PNG, JPG, SVG, GIF, WebP, ICO · nothing is uploaded', onFiles: take }),
    T.field('Format', kind), T.field('Result', out), T.row([copy, T.button('Try a sample', { small: true, onclick: function () {
      var c = h('canvas'); c.width = c.height = 16; var g = c.getContext('2d'); g.fillStyle = '#0ea5e9'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#fff'; g.fillRect(4, 4, 8, 8);
      T.canvasBlob(c, 'image/png').then(function (b) { take([new File([b], 'sample-icon.png', { type: 'image/png' })]); }); } })])]);
  var inp = h('textarea', { rows: '6', 'class': 'tin tmono', spellcheck: 'false', placeholder: 'Paste a data:image/… URL or plain Base64', 'aria-label': 'Base64 to decode' });
  var pv = h('img', { alt: 'Decoded image', style: 'max-width:100%;max-height:360px;display:block;margin:auto' }), pvBox = h('div', { 'class': 'tfit-prev is-checker', hidden: true }, [pv]), last = null;
  inp.addEventListener('input', function () {
    pvBox.hidden = true; last = null;
    if (!inp.value.trim()) { status.clear(); return; }
    try { var d = decode(inp.value); last = d; pv.src = URL.createObjectURL(new Blob([d.bytes], { type: d.mime })); pvBox.hidden = !/^image\//.test(d.mime); status.ok(d.mime + ' · ' + T.bytes(d.bytes.length)); }
    catch (e) { status.error(e); }
  });
  var decBox = h('div', { style: 'display:grid;gap:12px', hidden: true }, [T.field('Base64 or data URL', inp), pvBox, T.row([T.button('Download file', { primary: true, onclick: function () {
    if (last) T.download(new Blob([last.bytes], { type: last.mime }), 'decoded.' + ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/bmp': 'bmp', 'image/x-icon': 'ico', 'application/pdf': 'pdf' }[last.mime] || 'bin')); } })])]);
  spot.appendChild(T.card([T.field('Direction', mode), encBox, decBox, status.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['image-to-base64'] = function () {
    var f = [], d = decode('data:text/plain;base64,aGk=');
    if (d.mime !== 'text/plain' || String.fromCharCode.apply(0, d.bytes) !== 'hi') f.push('data url');
    if (String.fromCharCode.apply(0, decode('aGk').bytes) !== 'hi') f.push('no padding');
    if (decode('iVBORw0KGgo=').mime !== 'image/png' || decode('/9j/4AAQ').mime !== 'image/jpeg' || decode('R0lGODlh').mime !== 'image/gif') f.push('sniff');
    try { decode('***'); f.push('junk accepted'); } catch (e) {}
    return T.read(new Blob(['hi'], { type: 'text/plain' }), 'dataURL').then(function (u) {
      if (wrap(u, { name: 'a.png' }, 'b64') !== 'aGk=' || wrap(u, { name: 'a.png' }, 'css') !== 'background-image: url("data:text/plain;base64,aGk=");') f.push('wrap ' + u);
      return { ok: !f.length, n: 5, fails: f };
    });
  };
});
