/* Find and Replace — plain words or regular expressions, whole words, match case; counts the changes.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('find-replace', function (spot, T) {
  var count = 0;
  T.transformer(spot, { id: 'find-replace', inLabel: 'Your text', sample: 'The cat sat on the mat. The CAT was happy.',
    options: [T.opt.text('find', 'Find', '', 'word or phrase'), T.opt.text('rep', 'Replace with', '', 'leave empty to delete'),
      T.opt.check('cs', 'Match case'), T.opt.check('word', 'Whole words only'), T.opt.check('rx', 'Use a regular expression ($1 works in Replace)')],
    run: function (t, o) {
      count = 0;
      if (!o.find) return t;
      var src = o.rx ? o.find : o.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (o.word) src = '\\b(?:' + src + ')\\b';
      var re;
      try { re = new RegExp(src, 'g' + (o.cs ? '' : 'i') + 'u'); } catch (e) { throw new Error('That pattern is not valid: ' + e.message); }
      count = (t.match(re) || []).length;
      // with a regular expression, $1 $2 … in Replace mean the groups; otherwise Replace is used exactly as typed
      return t.replace(re, o.rx ? o.rep : function () { return o.rep; });
    },
    note: function () { return count + ' change' + (count === 1 ? '' : 's'); } });
});
