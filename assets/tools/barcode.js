/* Infinity by GroupChatOn — barcode. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Barcode generator: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF-14 and Codabar (JsBarcode), with check digits worked out for you and PNG / SVG download. */
GCOTools.register('barcode', function (spot, T) {
  var h = T.h, JSB = 'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js', status = T.status(), timer;
  var FORMATS = [['CODE128', 'Code 128 (letters and numbers)'], ['EAN13', 'EAN-13 (shop products)'], ['EAN8', 'EAN-8 (small products)'], ['UPC', 'UPC-A (USA and Canada)'], ['UPCE', 'UPC-E (small US products)'],
    ['CODE39', 'Code 39 (industry, ID cards)'], ['ITF14', 'ITF-14 (shipping cartons)'], ['codabar', 'Codabar (libraries, labs)']];
  // GS1 check digit: from the right, digits are weighted 3, 1, 3, 1…
  function check(data) { var s = 0; for (var i = 0; i < data.length; i++) s += +data[data.length - 1 - i] * (i % 2 === 0 ? 3 : 1); return (10 - s % 10) % 10; }
  var NEED = { EAN13: 12, EAN8: 7, UPC: 11, ITF14: 13 };
  function prepare(value, fmt) {
    var v = value.trim(), n = NEED[fmt];
    if (!v) return { error: 'Type the number or text to encode.' };
    if (n) {
      if (!/^\d+$/.test(v)) return { error: 'This barcode type takes digits only.' };
      if (v.length === n) return { value: v + check(v), note: 'Check digit ' + check(v) + ' added: ' + v + check(v) };
      if (v.length === n + 1) { var c = check(v.slice(0, n)); return +v[n] === c ? { value: v } : { error: 'The last digit should be ' + c + ' (check digit), not ' + v[n] + '. Correct number: ' + v.slice(0, n) + c }; }
      return { error: 'Type ' + n + ' digits (the check digit is added for you) or all ' + (n + 1) + '.' };
    }
    if (fmt === 'UPCE' && !/^\d{6,8}$/.test(v)) return { error: 'UPC-E takes 6 to 8 digits.' };
    if (fmt === 'CODE39' && !/^[0-9A-Z \-.$\/+%]+$/i.test(v)) return { error: 'Code 39 allows A–Z, 0–9, space and - . $ / + % only.' };
    if (fmt === 'codabar' && !/^[A-D]?[0-9\-$:\/.+]+[A-D]?$/i.test(v)) return { error: 'Codabar allows digits and - $ : / . + (with optional A–D start and stop letters).' };
    if (fmt === 'CODE128' && /[^\x00-\x7F]/.test(v)) return { error: 'Code 128 can only hold English letters, digits and common symbols.' };
    return { value: fmt === 'CODE39' ? v.toUpperCase() : v };
  }
  var val = h('input', { type: 'text', value: '890123456789', 'aria-label': 'Number or text', autocomplete: 'off' });
  var fmt = T.select(FORMATS, 'EAN13'), showText = h('input', { type: 'checkbox', checked: true });
  var width = h('input', { type: 'range', min: '1', max: '4', step: '1', value: '2', 'aria-label': 'Bar width' }), height = h('input', { type: 'range', min: '30', max: '160', step: '5', value: '80', 'aria-label': 'Bar height' });
  var fg = h('input', { type: 'color', value: '#000000' }), bg = h('input', { type: 'color', value: '#ffffff' });
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), box = h('div', { 'class': 'tqr', 'data-out': '' }, [svg]);
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Barcode');
  var last = null;
  function render() {
    var p = prepare(val.value, fmt.value);
    last = null;
    if (p.error) { box.hidden = true; status.error(p.error); return Promise.resolve(null); }
    return T.loadScript(JSB).then(function () {
      var ok = true;
      window.JsBarcode(svg, p.value, { format: fmt.value, displayValue: showText.checked, width: +width.value, height: +height.value, lineColor: fg.value, background: bg.value, margin: 12, fontSize: 18,
        valid: function (v) { ok = v; } });
      if (!ok) { box.hidden = true; status.error('This value cannot be made into a ' + fmt.options[fmt.selectedIndex].text + ' barcode.'); return null; }
      box.hidden = false; svg.style.maxWidth = '100%'; svg.style.height = 'auto';
      last = { value: p.value, svg: new XMLSerializer().serializeToString(svg) };
      status.ok(p.note ? '✓ ' + p.note : '✓ Barcode ready: ' + p.value);
      return last;
    }).catch(function (e) { status.error(e); return null; });
  }
  function soon() { clearTimeout(timer); timer = setTimeout(render, 150); }
  [val, fmt, showText, width, height, fg, bg].forEach(function (x) { x.addEventListener('input', soon); x.addEventListener('change', soon); });
  fmt.addEventListener('change', function () {
    var ex = { EAN13: '890123456789', EAN8: '9638507', UPC: '03600029145', UPCE: '0123456', CODE128: 'INV-2026-0042', CODE39: 'ASSET 1042', ITF14: '1890123456789', codabar: 'A40156B' }[fmt.value];
    if (ex) val.value = ex;
  });
  function png() {
    if (!last) return;
    var img = new Image(), scale = 3;
    img.onload = function () {
      var c = h('canvas'); c.width = img.width * scale; c.height = img.height * scale;
      var x = c.getContext('2d'); x.fillStyle = bg.value; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      T.canvasBlob(c, 'image/png').then(function (b) { T.download(b, 'barcode-' + last.value.replace(/[^\w-]+/g, '_') + '.png'); });
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(last.svg);
  }
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Barcode type', fmt), T.field('Number or text', val)]),
    h('div', { 'class': 'tgrid2' }, [T.field('Bar width', width), T.field('Height', height), T.field('Bars', fg), T.field('Background', bg)]),
    h('label', { 'class': 'tcheck' }, [showText, ' Show the number under the bars']),
    box, status.el,
    T.row([T.button('Download PNG', { primary: true, onclick: png }), T.button('Download SVG', { onclick: function () { if (last) T.download(new Blob([last.svg], { type: 'image/svg+xml' }), 'barcode.svg'); } }),
      T.button('Try a sample', { small: true, onclick: function () { fmt.value = 'EAN13'; val.value = '590123412345'; render(); } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  render();
  T.tests['barcode'] = function () {
    var f = [];
    [['590123412345', 7], ['03600029145', 2], ['9638507', 4], ['400638133393', 1], ['1234567890128'.slice(0, 12), 8]].forEach(function (x) { if (check(x[0]) !== x[1]) f.push('check ' + x[0] + ' → ' + check(x[0])); });
    if (prepare('5901234123457', 'EAN13').value !== '5901234123457') f.push('valid 13');
    if (!/should be 7/.test(prepare('5901234123450', 'EAN13').error || '')) f.push('wrong check digit not caught');
    if (prepare('59012', 'EAN13').error === undefined) f.push('short EAN accepted');
    if (prepare('abc', 'CODE39').value !== 'ABC' || !prepare('a_b', 'CODE39').error) f.push('code39');
    fmt.value = 'EAN13'; val.value = '590123412345';
    return render().then(function (r) {
      if (!r || r.value !== '5901234123457' || (r.svg.match(/<rect/g) || []).length < 20) f.push('render ' + (r ? r.value + ' rects ' + (r.svg.match(/<rect/g) || []).length : 'none'));
      return { ok: !f.length, n: 10, fails: f };
    });
  };
});
