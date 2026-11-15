/* Remove Duplicate Lines — keeps the first copy of every line, in order.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('dedupe', function (spot, T) {
  T.transformer(spot, { id: 'dedupe', inLabel: 'Your list (one item per line)', placeholder: 'apple\nbanana\napple\ncherry',
    sample: 'apple\nBanana\napple\ncherry\nbanana \nCherry',
    options: [T.opt.check('ci', 'Ignore UPPER/lower case'), T.opt.check('trim', 'Ignore spaces at the ends', true), T.opt.check('empty', 'Remove empty lines', true)],
    run: function (t, o) {
      var seen = {}, out = [];
      t.split(/\r?\n/).forEach(function (line) {
        var k = o.trim ? line.trim() : line;
        if (o.empty && !k) return;
        if (o.ci) k = k.toLowerCase();
        if (seen['~' + k]) return;
        seen['~' + k] = 1;
        out.push(o.trim ? line.trim() : line);
      });
      return out.join('\n');
    },
    note: function (a, b) {
      var x = a.split(/\r?\n/).length, y = b ? b.split('\n').length : 0;
      return (x - y) + ' line' + (x - y === 1 ? '' : 's') + ' removed · ' + y + ' left';
    } });
});
