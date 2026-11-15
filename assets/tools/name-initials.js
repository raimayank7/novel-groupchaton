/* Infinity by GroupChatOn — name-initials. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Initials and monogram maker: initials in every common style from a full name, and a monogram (circle, square or diamond) to download as a PNG. */
GCOTools.register('name-initials', function (spot, T) {
  var h = T.h, status = T.status();
  var SMALL = ['van', 'von', 'der', 'den', 'de', 'del', 'della', 'di', 'da', 'du', 'la', 'le', 'bin', 'binti', 'bint', 'al', 'el', 'ibn', 'ben', 'y', 'e', 'of', 'the', 'st'];
  function parts(name, skipSmall) {
    var w = name.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean).map(function (x) { return x.replace(/^[^\p{L}]+|[^\p{L}'’-]+$/gu, ''); }).filter(Boolean);
    if (skipSmall && w.length > 2) w = w.filter(function (x, i) { return i === 0 || i === w.length - 1 || SMALL.indexOf(x.toLowerCase()) < 0; });
    return w;
  }
  function cap(s) { return s.charAt(0).toLocaleUpperCase() + s.slice(1); }
  function first(s) { return Array.from(s)[0].toLocaleUpperCase(); }
  function styles(name, skipSmall) {
    var p = parts(name, skipSmall); if (!p.length) return [];
    var ini = p.map(first), last = p[p.length - 1];
    var out = [['Initials', ini.join('')], ['With dots', ini.join('.') + '.'], ['Spaced', ini.join(' ')]];
    if (p.length > 1) {
      out.push(['First initial, surname', ini[0] + '. ' + cap(last)]);
      out.push(['Initials and surname', ini.slice(0, -1).join('. ') + '. ' + cap(last)]);
      out.push(['Surname first', cap(last) + ', ' + ini.slice(0, -1).join('. ') + '.']);
      if (p.length > 2) out.push(['First name and initials', cap(p[0]) + ' ' + ini.slice(1, -1).join('. ') + '. ' + cap(last)]);
      out.push(['Classic monogram', monogram(p)]);
    }
    return out;
  }
  // classic three-letter monogram: first initial left, SURNAME initial large in the middle, middle initial right
  function monogram(p) { var i = p.map(first); return i.length >= 3 ? i[0] + i[i.length - 1] + i[1] : i.length === 2 ? i[0] + i[1] : i[0]; }
  var name = h('input', { type: 'text', value: T.store.get('initials-name', ''), placeholder: 'e.g. Priya Kumari Sharma', 'aria-label': 'Full name', autocomplete: 'name' });
  var skip = h('input', { type: 'checkbox', checked: true }), list = h('div', { 'class': 'tkv', 'data-out': '' });
  var shape = 'circle', cv = h('canvas', { width: '600', height: '600', 'aria-label': 'Monogram', style: 'width:min(260px,100%);aspect-ratio:1;display:block;margin:0 auto;border-radius:12px;background:repeating-conic-gradient(#e5e7eb 0 25%,#fff 0 50%) 0 0/20px 20px' });
  var font = T.select([['Georgia, Times New Roman, serif', 'Classic serif'], ['Arial, Helvetica, sans-serif', 'Modern sans'], ['"Brush Script MT", "Segoe Script", cursive', 'Script'], ['Didot, "Bodoni MT", Georgia, serif', 'Elegant'], ['"Courier New", monospace', 'Typewriter']], 'Georgia, Times New Roman, serif');
  var ink = h('input', { type: 'color', value: '#1f2937', 'aria-label': 'Letter colour' }), bg = h('input', { type: 'color', value: '#f5e6c8', 'aria-label': 'Background colour' }), clear = h('input', { type: 'checkbox' }), classic = h('input', { type: 'checkbox', checked: true });
  function letters() { var p = parts(name.value, skip.checked); if (!p.length) return ''; return classic.checked && p.length >= 3 ? monogram(p) : p.slice(0, 3).map(first).join(''); }
  function drawMono() {
    var g = cv.getContext('2d'), L = Array.from(letters()); g.clearRect(0, 0, 600, 600);
    g.save(); g.fillStyle = bg.value; g.strokeStyle = ink.value; g.lineWidth = 10;
    if (shape === 'circle') { g.beginPath(); g.arc(300, 300, 280, 0, Math.PI * 2); if (!clear.checked) g.fill(); g.stroke(); g.beginPath(); g.arc(300, 300, 258, 0, Math.PI * 2); g.lineWidth = 3; g.stroke(); }
    else if (shape === 'square') { if (!clear.checked) g.fillRect(20, 20, 560, 560); g.strokeRect(20, 20, 560, 560); g.lineWidth = 3; g.strokeRect(42, 42, 516, 516); }
    else if (shape === 'diamond') { g.beginPath(); g.moveTo(300, 15); g.lineTo(585, 300); g.lineTo(300, 585); g.lineTo(15, 300); g.closePath(); if (!clear.checked) g.fill(); g.stroke(); }
    else if (!clear.checked) g.fillRect(0, 0, 600, 600);
    g.fillStyle = ink.value; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (L.length === 3 && classic.checked && parts(name.value, skip.checked).length >= 3) {
      g.font = '600 300px ' + font.value; g.fillText(L[1], 300, 315);
      g.font = '600 170px ' + font.value; g.fillText(L[0], shape === 'diamond' ? 160 : 135, 315); g.fillText(L[2], shape === 'diamond' ? 440 : 465, 315);
    } else if (L.length) {
      var s = L.length === 1 ? 330 : L.length === 2 ? 240 : 180; g.font = '600 ' + s + 'px ' + font.value; g.fillText(L.join(''), 300, 315);
    }
    g.restore();
  }
  function draw() {
    T.store.set('initials-name', name.value);
    var st = styles(name.value, skip.checked); list.innerHTML = '';
    st.forEach(function (x) { var b = T.button('Copy', { small: true, onclick: function () { T.copy(x[1], b); } }); list.appendChild(h('div', {}, [h('b', { text: x[0] }), h('code', { text: x[1] }), b])); });
    if (!st.length) list.appendChild(h('div', {}, [h('b', { text: 'Initials' }), h('code', { text: 'Type a name above' }), h('span')]));
    drawMono();
  }
  [name, skip].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  [font, ink, bg, clear, classic].forEach(function (x) { x.addEventListener('input', drawMono); x.addEventListener('change', drawMono); });
  spot.appendChild(T.card([T.field('Full name', name), h('label', { 'class': 'tcheck' }, [skip, ' Skip small words like van, de, bin, al']), list,
    h('b', { text: 'Monogram' }), T.seg([['circle', 'Circle'], ['square', 'Square'], ['diamond', 'Diamond'], ['none', 'Letters only']], 'circle', function (v) { shape = v; drawMono(); }), cv,
    h('div', { 'class': 'tgrid2' }, [T.field('Font', font), T.field('Letters', ink), T.field('Background', bg)]),
    T.row([h('label', { 'class': 'tcheck' }, [classic, ' Classic order (surname in the middle)']), h('label', { 'class': 'tcheck' }, [clear, ' Transparent background'])]),
    T.row([T.button('Download PNG', { primary: true, onclick: function () { if (!letters()) { status.error('Type a name first.'); return; } T.canvasBlob(cv, 'image/png').then(function (b) { T.download(b, 'monogram-' + letters().toLowerCase() + '.png'); }); } }),
      T.button('Try a sample', { small: true, onclick: function () { name.value = 'Emily Rose Carter'; draw(); } })]), status.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['name-initials'] = function () {
    var f = [], s = styles('mayank kumar rai', true), m = {};
    s.forEach(function (x) { m[x[0]] = x[1]; });
    if (m['Initials'] !== 'MKR' || m['With dots'] !== 'M.K.R.') f.push('basic ' + m['Initials']);
    if (m['Initials and surname'] !== 'M. K. Rai' || m['Surname first'] !== 'Rai, M. K.' || m['First name and initials'] !== 'Mayank K. Rai') f.push('formal');
    if (m['Classic monogram'] !== 'MRK') f.push('monogram ' + m['Classic monogram']);
    if (styles('Ludwig van Beethoven', true)[0][1] !== 'LB' || styles('Ludwig van Beethoven', false)[0][1] !== 'LVB') f.push('particles');
    if (styles('élodie dubois', true)[0][1] !== 'ÉD') f.push('accents');
    if (styles('   ', true).length) f.push('blank');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
