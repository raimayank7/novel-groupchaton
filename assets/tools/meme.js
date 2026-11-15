/* Infinity by GroupChatOn — meme. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Meme generator: classic white top and bottom text with a black outline on your own photo, wrapped and sized to fit. */
GCOTools.register('meme', function (spot, T) {
  var h = T.h, status = T.status(), img = null;
  function wrap(text, max, measure) {
    var lines = [], cur = '';
    text.split(/\s+/).filter(Boolean).forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (cur && measure(t) > max) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    return lines;
  }
  var top = h('input', { type: 'text', placeholder: 'Top text', value: 'WHEN THE TOOL IS FREE', 'aria-label': 'Top text' }), bottom = h('input', { type: 'text', placeholder: 'Bottom text', value: 'AND NOTHING IS UPLOADED', 'aria-label': 'Bottom text' });
  var size = h('input', { type: 'range', min: '4', max: '16', value: '9' }), color = T.select([['#ffffff', 'White'], ['#000000', 'Black'], ['#facc15', 'Yellow']], '#ffffff'), caps = h('input', { type: 'checkbox', checked: true });
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'Meme preview' }), prev = h('div', { 'class': 'tfit-prev' }, [cv]);
  function block(g, text, W, H, atTop, o) {
    if (!text) return;
    var fs = W * o.size / 100, lines, i = 0, measure = function (t) { return g.measureText(t).width; };
    do { g.font = '900 ' + fs + 'px Impact,"Anton","Arial Black","Helvetica Neue",sans-serif'; lines = wrap(text, W * 0.92, measure); if (lines.length > 3 || lines.some(function (l) { return measure(l) > W * 0.96; })) fs *= 0.88; else break; } while (++i < 12);
    g.fillStyle = o.color; g.strokeStyle = o.color === '#000000' ? '#fff' : '#000'; g.lineWidth = Math.max(2, fs / 8); g.lineJoin = 'round'; g.textAlign = 'center'; g.textBaseline = atTop ? 'top' : 'bottom';
    var lh = fs * 1.1, m = H * 0.03;
    lines.forEach(function (l, k) { var y = atTop ? m + k * lh : H - m - (lines.length - 1 - k) * lh; g.strokeText(l, W / 2, y); g.fillText(l, W / 2, y); });
  }
  function paint() {
    var W, H;
    if (img) { var k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight)); W = Math.round(img.naturalWidth * k); H = Math.round(img.naturalHeight * k); }
    else { W = 1000; H = 800; }
    cv.width = W; cv.height = H; var g = cv.getContext('2d');
    if (img) g.drawImage(img, 0, 0, W, H); else { var gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#6366f1'); gr.addColorStop(1, '#ec4899'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.font = '120px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('😎', W / 2, H / 2); }
    var o = { size: +size.value, color: color.value }, f = function (s) { return caps.checked ? s.toUpperCase() : s; };
    block(g, f(top.value.trim()), W, H, true, o); block(g, f(bottom.value.trim()), W, H, false, o);
  }
  [top, bottom, size, color, caps].forEach(function (x) { x.addEventListener('input', paint); x.addEventListener('change', paint); });
  function save(type) { T.canvasBlob(cv, type, 0.92).then(function (b) { T.download(b, 'meme.' + (type === 'image/png' ? 'png' : 'jpg')); status.ok('Saved ' + cv.width + ' × ' + cv.height + ' (' + T.bytes(b.size) + ').'); }); }
  var share = navigator.canShare ? T.button('Share', { onclick: function () {
    T.canvasBlob(cv, 'image/jpeg', 0.9).then(function (b) { var file = new File([b], 'meme.jpg', { type: 'image/jpeg' }); if (navigator.canShare({ files: [file] })) navigator.share({ files: [file] }).catch(function () {}); else save('image/jpeg'); }); } }) : null;
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*', paste: true, icon: '😂', label: 'Choose a picture', hint: 'or use the plain background · nothing is uploaded', filter: function (f) { return /^image\//.test(f.type); },
    onFiles: function (l) { var im = new Image(); im.onload = function () { img = im; paint(); }; im.onerror = function () { status.error('That picture could not be opened.'); }; im.src = URL.createObjectURL(l[0]); } }),
    h('div', { 'class': 'tgrid2' }, [T.field('Top text', top), T.field('Bottom text', bottom), T.field('Text size', size), T.field('Text colour', color)]), h('label', { 'class': 'tcheck' }, [caps, ' CAPITAL LETTERS']),
    prev, T.row([T.button('Download JPG', { primary: true, onclick: function () { save('image/jpeg'); } }), T.button('Download PNG', { onclick: function () { save('image/png'); } }), share]), status.el,
    h('p', { 'class': 'tstatus', text: 'Use your own photos or ones you have the right to use, and keep memes kind.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  paint();
  T.tests['meme'] = function () {
    var f = [], m = function (t) { return t.length * 10; };
    if (wrap('one two three four', 105, m).join('|') !== 'one two|three four') f.push('wrap ' + wrap('one two three four', 105, m).join('|'));
    if (wrap('supercalifragilistic word', 50, m).join('|') !== 'supercalifragilistic|word') f.push('long word');
    if (wrap('  ', 100, m).length) f.push('blank');
    if (cv.width !== 1000 || cv.getContext('2d').getImageData(500, 790, 1, 1).data[3] !== 255) f.push('canvas');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
