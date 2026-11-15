/* Reverse Text — letters, word order, line order or each word; keeps emoji and accented letters whole.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('reverse-text', function (spot, T) {
  var seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter() : null;
  function chars(s) { return seg ? Array.from(seg.segment(s), function (x) { return x.segment; }) : Array.from(s); }
  T.transformer(spot, { id: 'reverse-text', inLabel: 'Your text', sample: 'Hello world 👋\nSecond line',
    options: [T.opt.select('how', 'Reverse', [['chars', 'Letters (olleH)'], ['words', 'Word order'], ['lines', 'Line order'], ['each', 'Letters in each word']], 'chars')],
    run: function (t, o) {
      if (o.how === 'lines') return t.split(/\r?\n/).reverse().join('\n');
      return t.split(/\r?\n/).map(function (l) {
        if (o.how === 'chars') return chars(l).reverse().join('');
        if (o.how === 'words') return l.split(/(\s+)/).reverse().join('');
        return l.split(/(\s+)/).map(function (w) { return /\s/.test(w) ? w : chars(w).reverse().join(''); }).join('');
      }).join('\n');
    } });
});
