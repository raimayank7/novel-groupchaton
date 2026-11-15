/* Infinity by GroupChatOn — word-frequency. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Word frequency and keyword density: which words (and two-word phrases) appear most. */
GCOTools.register('word-frequency', function (spot, T) {
  var STOP = ('a an and are as at be but by for from has have he her his i if in into is it its me my no not of on or our she so than that the their them then there they this to too up us was we were what when which who will with you your ' +
    'can do does did just also been being had more most some such only own same any all each few other over very about after again against before below between both down during further here how off once out under until why ' +
    'would could should shall may might must am o\'s isn\'t aren\'t don\'t it\'s i\'m you\'re').split(' ');
  var stop = {}; STOP.forEach(function (w) { stop[w] = 1; });
  function count(t, o) {
    var words = (t.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu) || []).map(function (w) { return w.replace(/’/g, "'").replace(/['\-]+$/, ''); });
    var min = parseInt(o.min, 10) || 1, items = words, c = {};
    if (o.n === '2') items = words.slice(1).map(function (w, i) { return words[i] + ' ' + w; }).filter(function (p) { var x = p.split(' '); return !(o.stop && (stop[x[0]] || stop[x[1]])); });
    else items = words.filter(function (w) { return w.length >= min && !(o.stop && stop[w]); });
    items.forEach(function (w) { c[w] = (c[w] || 0) + 1; });
    var list = Object.keys(c).map(function (k) { return [k, c[k]]; }).sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); });
    return { total: words.length, list: list };
  }
  function run(t, o) {
    var r = count(t, o), top = parseInt(o.top, 10) || 50;
    return r.list.slice(0, top).map(function (x, i) { return (i + 1) + '. ' + x[0] + ' — ' + x[1] + ' (' + (100 * x[1] / r.total).toFixed(1) + '%)'; }).join('\n');
  }
  T.transformer(spot, { id: 'word-frequency', inLabel: 'Your text or article', sample: 'Free online tools are useful. Our free tools work on your phone, and the tools never upload your files. Free, private and fast tools.',
    options: [T.opt.select('n', 'Count', [['1', 'Single words'], ['2', 'Two-word phrases']], '1'), T.opt.check('stop', 'Skip common words (the, and, of…)', true),
      T.opt.number('min', 'Shortest word to count', 2, 1, 20), T.opt.number('top', 'Show the top', 50, 1, 1000)],
    note: function (a) { var w = (a.match(/[\p{L}\p{N}]+/gu) || []).length; return w.toLocaleString() + ' words in total. Keyword density = how often a word appears ÷ all words.'; },
    run: run });
  T.tests['word-frequency'] = function () {
    var f = [], r = count('The cat and the hat. The CAT sat!', { n: '1', stop: true, min: '1' }), p = count('free tools and free tools', { n: '2', stop: true });
    if (r.total !== 8 || r.list[0][0] !== 'cat' || r.list[0][1] !== 2) f.push('words ' + JSON.stringify(r));
    if (!p.list.length || p.list[0][0] !== 'free tools' || p.list[0][1] !== 2) f.push('pairs ' + JSON.stringify(p.list));
    if (run('go go stop', { n: '1', stop: false, min: '1', top: '1' }) !== '1. go — 2 (66.7%)') f.push('format ' + run('go go stop', { n: '1', stop: false, min: '1', top: '1' }));
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
