/* Infinity by GroupChatOn — sudoku-print. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Printable sudoku: pages of new puzzles (1, 2, 4 or 6 per page) in any level, with an answer page; print, save as PDF or download PNG. */
GCOTools.register('sudoku-print', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function box(i) { return ((i / 27) | 0) * 3 + (((i % 9) / 3) | 0); }
  function solve(g, limit, out, random) {
    var R = [0, 0, 0, 0, 0, 0, 0, 0, 0], C = R.slice(), B = R.slice(), cells = g.slice(), count = 0, i;
    for (i = 0; i < 81; i++) if (cells[i]) { var b = 1 << cells[i]; if ((R[(i / 9) | 0] | C[i % 9] | B[box(i)]) & b) return 0; R[(i / 9) | 0] |= b; C[i % 9] |= b; B[box(i)] |= b; }
    function go() {
      var best = -1, mask = 0, n = 10;
      for (var k = 0; k < 81; k++) if (!cells[k]) {
        var m = ~(R[(k / 9) | 0] | C[k % 9] | B[box(k)]) & 1022, p = 0, q = m;
        while (q) { q &= q - 1; p++; }
        if (p < n) { best = k; mask = m; n = p; if (p < 2) break; }
      }
      if (best < 0) { count++; if (out && count === 1) for (var j = 0; j < 81; j++) out[j] = cells[j]; return count >= limit; }
      if (!n) return false;
      var r = (best / 9) | 0, c = best % 9, x = box(best), s = random ? rnd(9) : 0;
      for (var t = 0; t < 9; t++) {
        var d = (t + s) % 9 + 1, bit = 1 << d;
        if (!(mask & bit)) continue;
        cells[best] = d; R[r] |= bit; C[c] |= bit; B[x] |= bit;
        if (go()) return true;
        R[r] &= ~bit; C[c] &= ~bit; B[x] &= ~bit; cells[best] = 0;
      }
      return false;
    }
    go();
    return count;
  }
  var LEVELS = { easy: [40, 'Easy'], medium: [32, 'Medium'], hard: [27, 'Hard'], expert: [23, 'Expert'] };
  function make(level) {
    var sol = [], zero = [], i, idx = [];
    for (i = 0; i < 81; i++) { zero.push(0); idx.push(i); }
    solve(zero, 1, sol, true);
    var puz = sol.slice(), left = 81;
    shuffle(idx).forEach(function (k) {
      if (left <= LEVELS[level][0]) return;
      var keep = puz[k]; puz[k] = 0;
      if (solve(puz, 2) !== 1) puz[k] = keep; else left--;
    });
    return { puz: puz, sol: sol, level: level };
  }
  // A4 page at 150 dpi: 1240 × 1754
  var W = 1240, H = 1754, LAY = { 1: [1, 1], 2: [1, 2], 4: [2, 2], 6: [2, 3] };
  function grid(g, x, y, size, nums, small, label, ref) {
    var cs = size / 9;
    g.fillStyle = '#fff'; g.fillRect(x, y, size, size);
    g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '600 ' + Math.round(cs * 0.62) + 'px Arial, sans-serif';
    for (var i = 0; i < 81; i++) {
      var v = nums[i]; if (!v) continue;
      g.fillStyle = small && small[i] ? '#111' : small ? '#7a7a7a' : '#111';
      g.fillText(String(v), x + (i % 9 + 0.5) * cs, y + (((i / 9) | 0) + 0.54) * cs);
    }
    for (var k = 0; k <= 9; k++) {
      g.lineWidth = k % 3 ? Math.max(1, size / 400) : Math.max(2.5, size / 110); g.strokeStyle = '#111';
      g.beginPath(); g.moveTo(x + k * cs, y); g.lineTo(x + k * cs, y + size); g.stroke();
      g.beginPath(); g.moveTo(x, y + k * cs); g.lineTo(x + size, y + k * cs); g.stroke();
    }
    g.fillStyle = '#333'; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.font = '600 ' + Math.max(18, Math.round(size / 18)) + 'px Arial, sans-serif';
    g.fillText(label, x, y - 8);
    if (ref) { g.textAlign = 'right'; g.fillStyle = '#888'; g.fillText(ref, x + size, y - 8); }
  }
  function page(list, per, answers, title, start) {
    var cv = h('canvas', { width: String(W), height: String(H) }), g = cv.getContext('2d'), lay = answers ? [3, 4] : LAY[per];
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'top'; g.font = '700 46px Arial, sans-serif';
    g.fillText(title, W / 2, 60);
    g.font = '400 24px Arial, sans-serif'; g.fillStyle = '#555';
    g.fillText(answers ? 'Answers' : 'Fill every row, column and 3 × 3 box with 1 to 9.   Name: ______________   Time: ________', W / 2, 122);
    var top = 190, bottom = 80, side = 90, cols = lay[0], rows = lay[1], cw = (W - side * 2) / cols, rh = (H - top - bottom) / rows, size = Math.min(cw, rh) - (answers ? 50 : 80);
    list.forEach(function (p, i) {
      var cx = side + (i % cols) * cw + (cw - size) / 2, cy = top + ((i / cols) | 0) * rh + (rh - size) / 2 + 20;
      grid(g, cx, cy, size, answers ? p.sol : p.puz, answers ? p.puz : null, '#' + (start + i) + (answers ? '' : ' · ' + LEVELS[p.level][1]), answers ? '' : 'infinity.groupchaton.com');
    });
    g.font = '400 20px Arial, sans-serif'; g.fillStyle = '#999'; g.textAlign = 'center'; g.textBaseline = 'bottom';
    g.fillText('Free printable sudoku · infinity.groupchaton.com', W / 2, H - 30);
    return cv;
  }
  var level = T.select([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard'], ['expert', 'Expert'], ['mixed', 'Mixed (easy → hard)']], T.store.get('sp-level', 'easy'));
  var per = T.select([[1, '1 big puzzle'], [2, '2 per page'], [4, '4 per page'], [6, '6 per page']], T.store.get('sp-per', 4));
  var pages = T.select([1, 2, 3, 4, 5, 10].map(function (n) { return [n, n + (n === 1 ? ' page' : ' pages')]; }), 1);
  var withAns = h('input', { type: 'checkbox', checked: true }), title = h('input', { type: 'text', value: 'Sudoku', maxlength: '40', 'aria-label': 'Title' });
  var prev = h('div', { style: 'display:grid;gap:12px' }), info = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700' }), canvases = [];
  var printBtn = T.button('Print or save as PDF', { primary: true, disabled: true, onclick: function () { print(); } });
  var pngBtn = T.button('Download PNG', { small: true, disabled: true, onclick: function () {
    canvases.forEach(function (c, i) { T.canvasBlob(c, 'image/png').then(function (b) { T.download(b, 'sudoku-page-' + (i + 1) + '.png'); }); });
  } });
  function go() {
    var n = +per.value * +pages.value, lv = level.value, list = [];
    T.store.set('sp-level', lv); T.store.set('sp-per', +per.value);
    status.progress(0, 'Making ' + n + ' puzzles…');
    printBtn.disabled = pngBtn.disabled = true;
    var i = 0;
    (function next() {
      if (i < n) {
        var l = lv === 'mixed' ? ['easy', 'medium', 'hard'][Math.min(2, Math.floor(i * 3 / n))] : lv;
        list.push(make(l)); i++; status.progress(i / n, 'Making puzzle ' + i + ' of ' + n + '…');
        return setTimeout(next, 0);
      }
      canvases = [];
      for (var p = 0; p < +pages.value; p++) { var k = +per.value; canvases.push(page(list.slice(p * k, p * k + k), k, false, title.value.trim() || 'Sudoku', p * k + 1)); }
      if (withAns.checked) for (var a = 0; a < list.length; a += 12) canvases.push(page(list.slice(a, a + 12), 12, true, (title.value.trim() || 'Sudoku') + ': answers', a + 1));
      prev.innerHTML = '';
      canvases.forEach(function (c) { c.style.cssText = 'width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:#fff'; prev.appendChild(c); });
      info.textContent = list.length + (list.length === 1 ? ' puzzle' : ' puzzles') + ' on ' + canvases.length + (canvases.length === 1 ? ' page' : ' pages') + ' (A4), every one with a single answer.';
      status.ok('Ready to print.'); printBtn.disabled = pngBtn.disabled = false;
    })();
  }
  function print() {
    var fr = h('iframe', { style: 'position:fixed;right:0;bottom:0;width:0;height:0;border:0', title: 'print' });
    document.body.appendChild(fr);
    var d = fr.contentDocument;
    d.open(); d.write('<!doctype html><title>' + (title.value || 'Sudoku').replace(/[<&]/g, '') + '</title><style>@page{size:A4;margin:0}body{margin:0}img{width:210mm;height:297mm;display:block;page-break-after:always}</style>' +
      canvases.map(function (c) { return '<img src="' + c.toDataURL('image/png') + '">'; }).join('')); d.close();
    setTimeout(function () { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(function () { fr.remove(); }, 4000); }, 400);
  }
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Level', level), T.field('Puzzles', per), T.field('How many pages', pages), T.field('Title on the page', title)]),
    h('label', { 'class': 'tcheck' }, [withAns, ' Add an answer page at the end']),
    T.row([T.button('Make puzzles', { primary: true, onclick: go }), T.button('Try a sample', { small: true, onclick: function () { per.value = '2'; pages.value = '1'; go(); } })]),
    status.el, info, T.row([printBtn, pngBtn]), prev]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['sudoku-print'] = function () {
    var f = [], m = make('easy'), clues = m.puz.filter(Boolean).length;
    if (solve(m.puz, 2) !== 1) f.push('not unique');
    if (clues < 40 || clues > 46) f.push('easy clues ' + clues);
    var c = page([m, m], 2, false, 'Test', 1);
    if (c.width !== 1240 || c.height !== 1754) f.push('page size');
    var px = c.getContext('2d').getImageData(620, 900, 1, 1).data;
    if (px[3] !== 255) f.push('page not drawn');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
