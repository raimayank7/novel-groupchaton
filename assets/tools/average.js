/* Infinity by GroupChatOn — average. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'average', {
  inputs: [{ k: 'x', label: 'Numbers (spaces, commas or new lines)', type: 'textarea', value: '2 4 4 4 5 5 7 9' }],
  calc: function (v, X) {
    var a = X.nums(v.x).sort(function (p, q) { return p - q; }), n = a.length; X.need(n, 'Type some numbers.');
    var sum = a.reduce(function (p, q) { return p + q; }, 0), mean = sum / n, med = n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
    var cnt = {}, best = 0; a.forEach(function (q) { cnt[q] = (cnt[q] || 0) + 1; best = Math.max(best, cnt[q]); });
    var modes = Object.keys(cnt).filter(function (k) { return cnt[k] === best; });
    var ss = a.reduce(function (p, q) { return p + (q - mean) * (q - mean); }, 0);
    return { rows: [['Average (mean)', mean], ['Median', med], ['Mode', best > 1 ? modes.join(', ') : 'none (every number appears once)'], ['Standard deviation (population)', Math.sqrt(ss / n)],
      ['Standard deviation (sample)', n > 1 ? Math.sqrt(ss / (n - 1)) : NaN], ['Count', n, 'int'], ['Sum', sum], ['Smallest', a[0]], ['Largest', a[n - 1]], ['Range', a[n - 1] - a[0]]] };
  },
  test: [{ in: { x: '2 4 4 4 5 5 7 9' }, expect: { 'Average (mean)': 5, 'Median': 4.5, 'Mode': '4', 'Standard deviation (population)': 2, 'Standard deviation (sample)': 2.13809 } }]
});
