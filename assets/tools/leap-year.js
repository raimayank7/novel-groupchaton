/* Infinity by GroupChatOn — leap-year. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Leap year checker: is a year a leap year, why (the 4 / 100 / 400 rule), and the leap years before and after it. */
GCOTools.register('leap-year', function (spot, T) {
  function leap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function why(y) {
    return y % 400 === 0 ? 'divisible by 400, so it is a leap year even though it ends in 00' : y % 100 === 0 ? 'divisible by 100 but not by 400, so it is NOT a leap year'
      : y % 4 === 0 ? 'divisible by 4 (and not a century year), so it is a leap year' : 'not divisible by 4, so it is a common year of 365 days';
  }
  function near(y, dir) { var out = []; for (var x = y + dir; out.length < 3; x += dir) if (leap(x)) out.push(x); return out; }
  function one(line) {
    var s = line.trim(); if (!s) return '';
    if (!/^-?\d{1,6}$/.test(s)) return s + ' → type a year like 2028';
    var y = +s;
    return y + (leap(y) ? ' ✓ leap year (366 days, 29 February exists)' : ' ✕ not a leap year (365 days)') + '\n   ' + y + ' is ' + why(y) + '.\n   Before: ' + near(y, -1).reverse().join(', ') + ' · After: ' + near(y, 1).join(', ');
  }
  T.transformer(spot, { id: 'leap-year', inLabel: 'Year (one per line for many)', placeholder: '2028', sample: '2024\n1900\n2000\n2026\n2100', rows: 4, outLabel: 'Answer', download: false,
    run: function (t) { return t.split(/\r?\n/).map(one).filter(Boolean).join('\n\n'); } });
  T.tests['leap-year'] = function () {
    var f = [], c = [[2024, true], [1900, false], [2000, true], [2100, false], [2026, false], [2400, true], [1600, true]];
    c.forEach(function (x) { if (leap(x[0]) !== x[1]) f.push(x[0]); });
    if (near(2026, 1).join() !== '2028,2032,2036' || near(2026, -1).join() !== '2024,2020,2016') f.push('near');
    if (one('1900').indexOf('NOT a leap year') < 0) f.push('why 1900');
    return Promise.resolve({ ok: !f.length, n: 9, fails: f });
  };
});
