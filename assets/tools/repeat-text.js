/* Text Repeater — repeat any text many times, with a separator and optional numbering.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('repeat-text', function (spot, T) {
  T.transformer(spot, { id: 'repeat-text', inLabel: 'Text to repeat', rows: 4, sample: 'Happy birthday! 🎉',
    options: [T.opt.number('n', 'How many times', 10, 1, 10000),
      T.opt.select('sep', 'Between copies', [['nl', 'New line'], ['sp', 'Space'], ['none', 'Nothing'], ['comma', 'Comma'], ['blank', 'Blank line']], 'nl'),
      T.opt.check('num', 'Number each copy')],
    run: function (t, o) {
      var SEP = { nl: '\n', sp: ' ', none: '', comma: ', ', blank: '\n\n' };
      var n = Math.max(1, Math.min(10000, Math.floor(+o.n || 1))), out = [];
      for (var i = 1; i <= n; i++) out.push((o.num ? i + '. ' : '') + t);
      return out.join(SEP[o.sep] == null ? '\n' : SEP[o.sep]);
    },
    note: function (a, b) { return b.length.toLocaleString() + ' characters'; } });
});
