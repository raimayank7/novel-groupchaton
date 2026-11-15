/* Text Compare — shows what changed between two texts, line by line or word by word.
   Uses the longest common subsequence, so moved and edited lines are found the way a person would read them.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('text-diff', function (spot, T) {
  var h = T.h;
  var a = h('textarea', { rows: '9', 'class': 'tmono', placeholder: 'Original text', 'aria-label': 'Original text' });
  var b = h('textarea', { rows: '9', 'class': 'tmono', placeholder: 'Changed text', 'aria-label': 'Changed text' });
  a.value = T.store.get('diff-a', ''); b.value = T.store.get('diff-b', '');
  var mode = T.seg([['line', 'Lines'], ['word', 'Words']], T.store.get('diff-mode', 'line'), run);
  var ci = h('input', { type: 'checkbox' }), ws = h('input', { type: 'checkbox' });
  var out = h('div', { 'class': 'tdiff', 'aria-live': 'polite' });
  var status = T.status();
  var swap = T.button('Swap', { small: true, onclick: function () { var x = a.value; a.value = b.value; b.value = x; run(); } });
  var sample = T.button('Try a sample', { small: true, onclick: function () {
    a.value = 'The quick brown fox\njumps over the lazy dog.\nThe end.';
    b.value = 'The quick red fox\njumps over the lazy dog!\nA new line here.\nThe end.'; run(); } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Original', a), T.field('Changed', b)]),
    h('div', { 'class': 'topts' }, [mode, h('label', { 'class': 'tcheck' }, [ci, ' Ignore UPPER/lower case']), h('label', { 'class': 'tcheck' }, [ws, ' Ignore extra spaces'])]),
    T.row([swap, sample]), status.el, out]));
  function lcs(x, y, eq) {
    var n = x.length, m = y.length;
    if (n * m > 4e6) throw new Error('These texts are too long to compare in one go. Compare them in smaller parts.');
    var dp = [];
    for (var i = 0; i <= n; i++) { dp.push(new Uint32Array(m + 1)); }
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) dp[i][j] = eq(x[i], y[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    var ops = []; i = 0; j = 0;
    while (i < n && j < m) {
      if (eq(x[i], y[j])) { ops.push(['=', x[i]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push(['-', x[i++]]);
      else ops.push(['+', y[j++]]);
    }
    while (i < n) ops.push(['-', x[i++]]);
    while (j < m) ops.push(['+', y[j++]]);
    return ops;
  }
  function run() {
    T.store.set('diff-a', a.value.slice(0, 100000)); T.store.set('diff-b', b.value.slice(0, 100000)); T.store.set('diff-mode', mode.value());
    out.innerHTML = '';
    if (!a.value && !b.value) { status.clear(); return; }
    var norm = function (s) { if (ws.checked) s = s.replace(/\s+/g, ' ').trim(); return ci.checked ? s.toLowerCase() : s; };
    var eq = function (p, q) { return norm(p) === norm(q); };
    try {
      var byLine = mode.value() === 'line';
      var x = byLine ? a.value.split(/\r?\n/) : a.value.split(/(\s+)/), y = byLine ? b.value.split(/\r?\n/) : b.value.split(/(\s+)/);
      var ops = lcs(x, y, eq), add = 0, del = 0;
      ops.forEach(function (op) {
        if (op[0] === '+') add++; else if (op[0] === '-') del++;
        var cls = op[0] === '+' ? 'tdiff-add' : op[0] === '-' ? 'tdiff-del' : 'tdiff-same';
        out.appendChild(h(byLine ? 'div' : 'span', { 'class': cls }, [byLine ? (op[0] === '=' ? '  ' : op[0] + ' ') + op[1] : op[1]]));
      });
      if (!byLine) out.classList.add('tdiff-words'); else out.classList.remove('tdiff-words');
      status[add || del ? 'info' : 'ok']((add || del) ? add + ' added · ' + del + ' removed' + (byLine ? ' line' + (add + del === 1 ? '' : 's') : ' words') : 'The two texts are the same.');
    } catch (e) { status.error(e); }
  }
  [a, b].forEach(function (t) { t.addEventListener('input', run); });
  [ci, ws].forEach(function (c) { c.addEventListener('change', run); });
  run();
});
