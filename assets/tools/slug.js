/* Slug Generator — turns titles into clean web addresses (one per line).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('slug', function (spot, T) {
  T.transformer(spot, { id: 'slug', inLabel: 'Titles (one per line)', sample: 'How to Merge PDF Files – Free & Fast!\nCafé Menu 2026: Crème Brûlée',
    options: [T.opt.select('sep', 'Separator', [['-', 'Hyphen (-)'], ['_', 'Underscore (_)'], ['', 'None']], '-'), T.opt.check('lower', 'lowercase', true),
      T.opt.number('max', 'Max length (0 = no limit)', 0, 0, 200)],
    run: function (t, o) {
      return t.split(/\r?\n/).map(function (line) {
        var s = line.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
        if (o.lower) s = s.toLowerCase();
        var words = s.split(/\s+/).filter(Boolean), max = +o.max || 0;
        s = words.join(o.sep);
        // cut at a word boundary
        while (max && s.length > max && words.length > 1) { words.pop(); s = words.join(o.sep); }
        return max ? s.slice(0, max) : s;
      }).join('\n');
    } });
});
