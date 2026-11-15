/* Infinity by GroupChatOn — prime. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'prime', {
  inputs: [{ k: 'n', label: 'Number', value: 360 }],
  calc: function (v, X) {
    var n = v.n; X.need(n >= 2 && n % 1 === 0 && n <= 9007199254740991, 'Enter a whole number from 2 up.');
    var f = {}, m = n, p = 2; while (p * p <= m) { while (m % p === 0) { f[p] = (f[p] || 0) + 1; m /= p; } p += p === 2 ? 1 : 2; } if (m > 1) f[m] = (f[m] || 0) + 1;
    var ks = Object.keys(f), isP = ks.length === 1 && f[ks[0]] === 1, nd = ks.reduce(function (s, k) { return s * (f[k] + 1); }, 1);
    var nx = n + 1, isPr = function (q) { if (q < 2) return false; for (var d = 2; d * d <= q; d++) if (q % d === 0) return false; return true; }; while (!isPr(nx)) nx++;
    var divs = []; if (n <= 1e7) for (var d = 1; d <= n; d++) if (n % d === 0) divs.push(d);
    return { rows: [['Prime?', isP ? 'Yes, ' + n + ' is prime' : 'No'], ['Prime factors', ks.map(function (k) { return k + (f[k] > 1 ? '^' + f[k] : ''); }).join(' × ')], ['Number of divisors', nd, 'int'], ['Next prime', nx, 'int'],
      divs.length ? ['Divisors', divs.length > 60 ? divs.slice(0, 60).join(', ') + '…' : divs.join(', ')] : null] };
  },
  test: [{ in: { n: 360 }, expect: { 'Prime factors': '2^3 × 3^2 × 5', 'Number of divisors': 24, 'Next prime': 367 } }, { in: { n: 97 }, expect: { 'Prime?': 'Yes' } }]
});
