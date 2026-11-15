/* Infinity by GroupChatOn — battery-life. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'battery-life', {
  inputs: [{ k: 'c', label: 'Battery capacity', suffix: 'mAh', value: 2000 }, { k: 'v', label: 'Battery voltage', suffix: 'V', value: 3.7 },
    { k: 'l', label: 'Device draws', suffix: 'mA', value: 100 }, { k: 'e', label: 'Usable share of the battery', suffix: '%', value: 85, hint: 'batteries rarely give all their rated capacity' }],
  calc: function (v, X) {
    X.pos(v.l, 'the current the device draws');
    var hrs = v.c / v.l * v.e / 100;
    return { rows: [['Battery life', hrs, function (n) { return X.dur(n * 3600); }], ['Hours', hrs, 2], ['Energy stored', v.c * v.v / 1000, function (n) { return X.num(n, 2) + ' Wh'; }],
      ['Device power', v.l * v.v / 1000, function (n) { return X.num(n, 3) + ' W'; }]],
      note: 'Life = capacity ÷ current × usable share. For a lead-acid battery use about 50%, for lithium 80–90%.' };
  },
  test: [{ in: { c: 2000, v: 3.7, l: 100, e: 85 }, expect: { 'Battery life': 17, 'Energy stored': 7.4 } }]
});
