/* Sort Lines — A→Z, Z→A, by length, reverse or shuffle; numbers sort naturally (2 before 10).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('sort-lines', function (spot, T) {
  var coll = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  T.transformer(spot, { id: 'sort-lines', inLabel: 'Your lines', sample: 'item 10\nItem 2\nbanana\napple\nitem 1\nCherry',
    options: [T.opt.select('how', 'Order', [['az', 'A → Z'], ['za', 'Z → A'], ['short', 'Shortest first'], ['long', 'Longest first'], ['reverse', 'Reverse current order'], ['shuffle', 'Shuffle randomly']], 'az'),
      T.opt.check('empty', 'Remove empty lines', true), T.opt.check('trim', 'Trim spaces', true)],
    run: function (t, o) {
      var lines = t.split(/\r?\n/);
      if (o.trim) lines = lines.map(function (l) { return l.trim(); });
      if (o.empty) lines = lines.filter(Boolean);
      if (o.how === 'az') lines.sort(coll.compare);
      else if (o.how === 'za') lines.sort(function (a, b) { return coll.compare(b, a); });
      else if (o.how === 'short') lines.sort(function (a, b) { return a.length - b.length || coll.compare(a, b); });
      else if (o.how === 'long') lines.sort(function (a, b) { return b.length - a.length || coll.compare(a, b); });
      else if (o.how === 'reverse') lines.reverse();
      else for (var i = lines.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = lines[i]; lines[i] = lines[j]; lines[j] = x; }
      return lines.join('\n');
    } });
});
