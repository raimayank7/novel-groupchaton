/* Infinity by GroupChatOn — text-to-handwriting. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Text to handwriting: write typed text on lined, plain or grid paper in a handwriting font with natural wobble; download the pages as images. */
GCOTools.register('text-to-handwriting', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  var FONTS = [['Caveat', 'Caveat'], ['Kalam', 'Kalam (also Hindi)'], ['Indie Flower', 'Indie Flower'], ['Shadows Into Light', 'Shadows Into Light'], ['Homemade Apple', 'Homemade Apple (cursive)']];
  var W = 1240, H = 1754, M = { top: 170, left: 150, right: 80, bottom: 110 };   // A4 at 150 DPI
  function wrap(text, max, measure) {
    var lines = [];
    text.replace(/\r/g, '').split('\n').forEach(function (para) {
      if (!para.trim()) { lines.push(''); return; }
      var cur = '';
      para.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        var t = cur + w;
        if (measure(t.trimEnd()) > max && cur.trim()) { lines.push(cur.trimEnd()); cur = /^\s+$/.test(w) ? '' : w; }
        else cur = t;
        while (measure(cur.trimEnd()) > max && cur.length > 1) { var k = cur.length - 1; while (k > 1 && measure(cur.slice(0, k)) > max) k--; lines.push(cur.slice(0, k)); cur = cur.slice(k); }
      });
      lines.push(cur.trimEnd());
    });
    return lines;
  }
  function seeded(n) { return function () { n = (n * 9301 + 49297) % 233280; return n / 233280; }; }
  function pages(o) {
    var g0 = h('canvas').getContext('2d'); g0.font = o.size + 'px "' + o.font + '", cursive';
    var lh = Math.round(o.size * 1.55), per = Math.floor((H - M.top - M.bottom) / lh), lines = wrap(o.text, W - M.left - M.right, function (s) { return g0.measureText(s).width; }), out = [], rnd = seeded(7);
    for (var p = 0; p * per < Math.max(1, lines.length); p++) {
      var c = h('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
      g.fillStyle = o.paper === 'yellow' ? '#fff9db' : '#fffefa'; g.fillRect(0, 0, W, H);
      if (o.lines !== 'plain') {
        g.strokeStyle = 'rgba(80,130,200,.35)'; g.lineWidth = 1.5;
        for (var y = M.top + lh * 0.25; y < H - 40; y += lh) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        if (o.lines === 'grid') for (var x = 0; x < W; x += lh) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
        if (o.lines === 'lined') { g.strokeStyle = 'rgba(220,60,60,.5)'; g.beginPath(); g.moveTo(M.left - 24, 0); g.lineTo(M.left - 24, H); g.stroke(); }
      }
      g.fillStyle = o.ink; g.font = o.size + 'px "' + o.font + '", cursive'; g.textBaseline = 'alphabetic';
      lines.slice(p * per, (p + 1) * per).forEach(function (l, i) {
        var yb = M.top + i * lh, xx = M.left;
        if (!o.wobble) { g.fillText(l, xx, yb); return; }
        Array.from(l).forEach(function (ch) { g.save(); g.translate(xx, yb + (rnd() - 0.5) * o.size * 0.06); g.rotate((rnd() - 0.5) * 0.04); g.fillText(ch, 0, 0); g.restore(); xx += g.measureText(ch).width * (0.97 + rnd() * 0.06); });
      });
      out.push(c);
    }
    return out;
  }
  var text = h('textarea', { rows: '8', placeholder: 'Type or paste your assignment, notes or letter…', 'aria-label': 'Text' });
  text.value = T.store.get('handwriting', 'Dear Diary,\nToday I learnt how plants make food from sunlight. This is called photosynthesis.\nTomorrow I will draw a diagram of a leaf.');
  var font = T.select(FONTS, 'Caveat'), ink = T.select([['#1d3fbb', 'Blue pen'], ['#111111', 'Black pen'], ['#4b5563', 'Pencil'], ['#b91c1c', 'Red pen']], '#1d3fbb'), paper = T.select([['lined', 'Ruled notebook'], ['plain', 'Plain'], ['grid', 'Graph paper']], 'lined');
  var tint = T.select([['white', 'White'], ['yellow', 'Yellowish']], 'white'), size = h('input', { type: 'range', min: '28', max: '64', value: '42' }), wobble = h('input', { type: 'checkbox', checked: true });
  var cv = h('canvas', { 'class': 'tfit-canvas', 'aria-label': 'First page preview' }), loaded = null, timer = 0;
  function fontsReady() {
    if (!loaded) {
      document.head.appendChild(h('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Caveat&family=Homemade+Apple&family=Indie+Flower&family=Kalam&family=Shadows+Into+Light&display=swap' }));
      loaded = {};
    }
    if (loaded[font.value]) return Promise.resolve();
    return (document.fonts && document.fonts.load ? document.fonts.load('40px "' + font.value + '"', 'aहa').catch(function () {}) : Promise.resolve()).then(function () { loaded[font.value] = 1; });
  }
  function o() { return { text: text.value, font: font.value, ink: ink.value, lines: paper.value, paper: tint.value, size: +size.value, wobble: wobble.checked }; }
  function preview() {
    T.store.set('handwriting', text.value.slice(0, 20000));
    fontsReady().then(function () { var p = pages(o()); cv.width = p[0].width; cv.height = p[0].height; cv.getContext('2d').drawImage(p[0], 0, 0); status.info(p.length + ' page' + (p.length > 1 ? 's' : '') + ' (A4).'); });
  }
  function save() {
    fontsReady().then(function () {
      var p = pages(o());
      return Promise.all(p.map(function (c) { return T.canvasBlob(c, 'image/jpeg', 0.9); })).then(function (bs) {
        results.set(bs.map(function (b, i) { return { name: 'handwriting-page-' + (i + 1) + '.jpg', blob: b, preview: URL.createObjectURL(b), note: 'A4 · page ' + (i + 1) }; }), 'handwriting');
        status.ok('Ready: ' + bs.length + ' page' + (bs.length > 1 ? 's' : '') + '.');
      });
    });
  }
  [text, font, ink, paper, tint, size, wobble].forEach(function (x) { x.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(preview, 300); }); x.addEventListener('change', preview); });
  spot.appendChild(T.card([T.field('Your text', text), h('div', { 'class': 'tgrid2' }, [T.field('Handwriting', font), T.field('Ink', ink), T.field('Paper', paper), T.field('Paper colour', tint), T.field('Writing size', size)]),
    h('label', { 'class': 'tcheck' }, [wobble, ' Natural wobble (looks hand-written)']), h('div', { 'class': 'tfit-prev' }, [cv]), T.row([T.button('Make pages', { primary: true, onclick: save })]), status.el, results.el,
    h('p', { 'class': 'tstatus', text: 'For practice, notes and fun. Do not hand in work as your own handwriting where that breaks your school’s rules.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  preview();
  T.tests['text-to-handwriting'] = function () {
    var f = [], m = function (s) { return s.length * 10; };
    if (wrap('aa bb cc dd', 55, m).join('|') !== 'aa bb|cc dd') f.push('wrap ' + wrap('aa bb cc dd', 55, m).join('|'));
    if (wrap('one\n\ntwo', 100, m).join('|') !== 'one||two') f.push('paragraphs');
    if (wrap('abcdefghij', 40, m).join('|') !== 'abcd|efgh|ij') f.push('long word ' + wrap('abcdefghij', 40, m).join('|'));
    var p = pages({ text: new Array(31).join('line\n'), font: 'serif', ink: '#000', lines: 'lined', paper: 'white', size: 42, wobble: false });
    if (p.length !== 2 || p[0].width !== 1240) f.push('pages ' + p.length);
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
