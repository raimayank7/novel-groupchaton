/* Infinity by GroupChatOn — number-to-words. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Number to words: international (million, billion) or Indian (lakh, crore), plus cheque wording in rupees or dollars. */
GCOTools.register('number-to-words', function (spot, T) {
  var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function two(x) { return x < 20 ? ONES[x] : TENS[Math.floor(x / 10)] + (x % 10 ? '-' + ONES[x % 10] : ''); }
  function three(x, and) { var h = Math.floor(x / 100), r = x % 100; return (h ? ONES[h] + ' hundred' + (r ? (and ? ' and ' : ' ') : '') : '') + (r ? two(r) : ''); }
  function intl(x, and) {
    if (x === 0) return 'zero';
    var out = [];
    [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']].forEach(function (p) { if (x >= p[0]) { out.push(three(Math.floor(x / p[0]), and) + ' ' + p[1]); x %= p[0]; } });
    if (x) out.push((out.length && and && x < 100 ? 'and ' : '') + three(x, and));
    return out.join(' ');
  }
  function indian(x, and) {
    if (x === 0) return 'zero';
    var out = [];
    if (x >= 1e7) { out.push(indian(Math.floor(x / 1e7), and) + ' crore'); x %= 1e7; }
    [[1e5, 'lakh'], [1e3, 'thousand']].forEach(function (p) { if (x >= p[0]) { out.push(two(Math.floor(x / p[0])) + ' ' + p[1]); x %= p[0]; } });
    if (x) out.push((out.length && and && x < 100 ? 'and ' : '') + three(x, and));
    return out.join(' ');
  }
  function casing(s, c) { return c === 'upper' ? s.toUpperCase() : c === 'title' ? s.replace(/(^|[\s-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }) : s; }
  function one(line, o) {
    var s = line.trim().replace(/[,\s_]/g, '');
    if (!s) return '';
    if (!/^-?\d+(\.\d+)?$/.test(s)) return line.trim() + ' → not a number';
    var neg = s[0] === '-', p = s.replace('-', '').split('.'), w = +p[0], fn = o.sys === 'in' ? indian : intl, and = !!o.and;
    if (w >= 1e15) return line.trim() + ' → too big (up to 999 trillion)';
    var words;
    if (o.mode === 'inr' || o.mode === 'usd') {
      var sub = p[1] ? Math.round(+('0.' + p[1]) * 100) : 0;
      if (sub === 100) { w++; sub = 0; }
      var big = o.mode === 'inr' ? 'rupees' : 'dollars', small = o.mode === 'inr' ? 'paise' : 'cents';
      words = big + ' ' + fn(w, and) + (sub ? ' and ' + two(sub) + ' ' + small : '') + ' only';
      if (o.mode === 'usd') words = fn(w, and) + ' ' + (w === 1 ? 'dollar' : 'dollars') + (sub ? ' and ' + two(sub) + ' ' + (sub === 1 ? 'cent' : 'cents') : '') + ' only';
      if (o.case === 'lower') o = { case: 'title' };   // cheques are written in capitals or Title Case
    } else {
      words = fn(w, and) + (p[1] ? ' point ' + Array.from(p[1]).map(function (d) { return ONES[+d]; }).join(' ') : '');
    }
    return casing((neg ? 'minus ' : '') + words, o.case);
  }
  function run(t, o) { return t.split(/\r?\n/).map(function (l) { return one(l, o); }).join('\n'); }
  T.transformer(spot, { id: 'number-to-words', inLabel: 'Numbers (one per line; commas are fine)', sample: '1234567\n15,00,000\n2026\n99.75',
    options: [T.opt.select('sys', 'Number system', [['in', 'Indian: lakh, crore'], ['intl', 'International: million, billion']], T.currency() === 'INR' ? 'in' : 'intl'),
      T.opt.select('mode', 'Write as', [['plain', 'Plain words'], ['inr', 'Cheque: Rupees … Paise Only'], ['usd', 'Cheque: … Dollars and Cents Only']], 'plain'),
      T.opt.select('case', 'Letters', [['lower', 'lower case'], ['title', 'Title Case'], ['upper', 'UPPER CASE']], 'lower'),
      T.opt.check('and', 'Use “and” (one hundred and five)', false)],
    run: run });
  T.tests['number-to-words'] = function () {
    var f = [], c = [
      ['1234567', { sys: 'intl', mode: 'plain', case: 'lower' }, 'one million two hundred thirty-four thousand five hundred sixty-seven'],
      ['1234567', { sys: 'in', mode: 'plain', case: 'lower' }, 'twelve lakh thirty-four thousand five hundred sixty-seven'],
      ['25,00,00,000', { sys: 'in', mode: 'plain', case: 'lower' }, 'twenty-five crore'],
      ['105', { sys: 'intl', mode: 'plain', case: 'lower', and: true }, 'one hundred and five'],
      ['0', { sys: 'intl', mode: 'plain', case: 'lower' }, 'zero'],
      ['-12.05', { sys: 'intl', mode: 'plain', case: 'lower' }, 'minus twelve point zero five'],
      ['1500.5', { sys: 'in', mode: 'inr', case: 'title' }, 'Rupees One Thousand Five Hundred And Fifty Paise Only'],
      ['21.01', { sys: 'intl', mode: 'usd', case: 'upper' }, 'TWENTY-ONE DOLLARS AND ONE CENT ONLY']];
    c.forEach(function (x) { var r = one(x[0], x[1]); if (r !== x[2]) f.push(x[0] + ' → ' + r); });
    return Promise.resolve({ ok: !f.length, n: c.length, fails: f });
  };
});
