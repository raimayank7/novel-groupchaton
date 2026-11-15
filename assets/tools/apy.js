/* Infinity by GroupChatOn — apy. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'apy', {
  inputs: [{ k: 'age', label: 'Age when joining (18 to 40)', value: 25, min: 18, max: 40 },
    { k: 'p', label: 'Pension you want from 60', options: [['0', '₹1,000 a month'], ['1', '₹2,000 a month'], ['2', '₹3,000 a month'], ['3', '₹4,000 a month'], ['4', '₹5,000 a month']], value: '4' }],
  calc: function (v, X) {
    // official contribution chart (PFRDA / Atal Pension Yojana FAQ), monthly, ages 18–40
    var C = { 18: [42, 84, 126, 168, 210], 19: [46, 92, 138, 183, 228], 20: [50, 100, 150, 198, 248], 21: [54, 108, 162, 215, 269], 22: [59, 117, 177, 234, 292], 23: [64, 127, 192, 254, 318],
      24: [70, 139, 208, 277, 346], 25: [76, 151, 226, 301, 376], 26: [82, 164, 246, 327, 409], 27: [90, 178, 268, 356, 446], 28: [97, 194, 292, 388, 485], 29: [106, 212, 318, 423, 529],
      30: [116, 231, 347, 462, 577], 31: [126, 252, 379, 504, 630], 32: [138, 276, 414, 551, 689], 33: [151, 302, 453, 602, 752], 34: [165, 330, 495, 659, 824], 35: [181, 362, 543, 722, 902],
      36: [198, 396, 594, 792, 990], 37: [218, 436, 654, 870, 1087], 38: [240, 480, 720, 957, 1196], 39: [264, 528, 792, 1054, 1318], 40: [291, 582, 873, 1164, 1454] };
    var a = Math.round(v.age); X.need(C[a], 'You can join Atal Pension Yojana between 18 and 40.');
    var k = +v.p, c = C[a][k], yrs = 60 - a;
    return { rows: [['Monthly contribution', c, 'money'], ['Pension from age 60', (k + 1) * 1000, 'money', 'a month, for life'], ['Years of contribution', yrs, 'int'], ['Total you pay', c * 12 * yrs, 'money'],
      ['Returned to your nominee', [170000, 340000, 510000, 680000, 850000][k], 'money']],
      table: { caption: 'All contribution amounts for age ' + a, head: ['Pension', 'Monthly', 'Quarterly (about)', 'Half-yearly (about)'], rows: [1, 2, 3, 4, 5].map(function (p, i) { return ['₹' + p + ',000', X.money(C[a][i]), X.money(C[a][i] * 2.97), X.money(C[a][i] * 5.89)]; }), open: true },
      note: 'From the official APY chart. After you, your spouse gets the same pension, and then the nominee gets the corpus. From 1 October 2022 income-tax payers cannot join.' };
  },
  test: [{ in: { age: 18, p: '4' }, expect: { 'Monthly contribution': 210 } }, { in: { age: 40, p: '0' }, expect: { 'Monthly contribution': 291 } }, { in: { age: 39, p: '3' }, expect: { 'Monthly contribution': 1054 } }]
});
