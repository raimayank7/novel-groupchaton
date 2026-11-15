/* Infinity by GroupChatOn — line-numbers. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Add line numbers, or any prefix and suffix, to every line. */
GCOTools.register('line-numbers', function (spot, T) {
  function run(t, o) {
    var n = parseInt(o.start, 10); if (isNaN(n)) n = 1;
    var lines = t.split(/\r?\n/), width = String(n + lines.length).length;
    return lines.map(function (l) {
      if (o.skip && !l.trim()) return l;
      var num = '';
      if (o.num === 'dot') num = n + '. ';
      else if (o.num === 'paren') num = n + ') ';
      else if (o.num === 'pad') num = String(n).padStart(width, '0') + ' ';
      else if (o.num === 'tab') num = n + '\t';
      if (o.num !== 'none') n++;
      return num + (o.pre || '') + l + (o.suf || '');
    }).join('\n');
  }
  T.transformer(spot, { id: 'line-numbers', inLabel: 'Your lines', sample: 'Milk\nBread\n\nEggs\nTea', mono: true,
    options: [T.opt.select('num', 'Numbers', [['dot', '1. 2. 3.'], ['paren', '1) 2) 3)'], ['pad', '01 02 03 (same width)'], ['tab', '1 [tab] (for Excel)'], ['none', 'No numbers']], 'dot'),
      T.opt.number('start', 'Start at', 1), T.opt.text('pre', 'Add before each line', '', 'e.g. - or [ ] or ✅ '), T.opt.text('suf', 'Add after each line', '', 'e.g. , or ;'),
      T.opt.check('skip', 'Skip empty lines', true)],
    run: run });
  T.tests['line-numbers'] = function () {
    var f = [], a = run('a\n\nb', { num: 'dot', start: '1', skip: true }), b = run('x\ny', { num: 'none', pre: "'", suf: "'," }), c = run('a\nb', { num: 'pad', start: '9' });
    if (a !== '1. a\n\n2. b') f.push('dot ' + JSON.stringify(a));
    if (b !== "'x',\n'y',") f.push('wrap ' + JSON.stringify(b));
    if (c !== '09 a\n10 b') f.push('pad ' + JSON.stringify(c));
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
