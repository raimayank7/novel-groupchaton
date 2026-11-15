/* Infinity by GroupChatOn — sound. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'sound', {
  inputs: [{ k: 'mode', label: 'I want to', options: [['add', 'Add sound levels together'], ['dist', 'Find the level farther away'], ['ratio', 'Turn a power or voltage ratio into decibels']], value: 'add', wide: true },
    { k: 'list', label: 'Sound levels (dB)', type: 'textarea', value: '80 80', show: function (v) { return v.mode === 'add'; }, rows: 2 },
    { k: 'l1', label: 'Level measured', suffix: 'dB', value: 100, show: function (v) { return v.mode === 'dist'; } },
    { k: 'r1', label: 'At distance', suffix: 'm', value: 1, show: function (v) { return v.mode === 'dist'; } },
    { k: 'r2', label: 'New distance', suffix: 'm', value: 10, show: function (v) { return v.mode === 'dist'; } },
    { k: 'p1', label: 'Reference value', value: 1, show: function (v) { return v.mode === 'ratio'; } },
    { k: 'p2', label: 'Measured value', value: 100, show: function (v) { return v.mode === 'ratio'; } }],
  calc: function (v, X) {
    function like(db) { return db >= 120 ? 'pain threshold, jet engine' : db >= 100 ? 'motorbike, rock concert' : db >= 85 ? 'heavy traffic: hearing damage over hours' : db >= 70 ? 'vacuum cleaner' : db >= 60 ? 'normal conversation' : db >= 40 ? 'quiet library' : 'whisper'; }
    if (v.mode === 'add') {
      var L = X.nums(v.list); X.need(L.length, 'Type the levels to add, e.g. 80 80.');
      var s = 10 * Math.log10(L.reduce(function (a, x) { return a + Math.pow(10, x / 10); }, 0));
      return { rows: [['Combined level', s, function (n) { return X.num(n, 2) + ' dB'; }], ['About as loud as', like(s)]], note: 'Decibels add on a log scale: two equal sources are 3 dB louder, not double.' };
    }
    if (v.mode === 'dist') {
      X.pos(v.r1, 'the first distance'); X.pos(v.r2, 'the new distance');
      var l2 = v.l1 - 20 * Math.log10(v.r2 / v.r1);
      return { rows: [['Level at the new distance', l2, function (n) { return X.num(n, 2) + ' dB'; }], ['Change', l2 - v.l1, function (n) { return X.num(n, 2) + ' dB'; }], ['About as loud as', like(l2)]],
        note: 'Outdoors, sound from a small source drops about 6 dB each time the distance doubles (inverse square law).' };
    }
    X.pos(v.p1, 'the reference'); X.pos(v.p2, 'the measured value');
    return { rows: [['Power ratio in dB', 10 * Math.log10(v.p2 / v.p1), function (n) { return X.num(n, 3) + ' dB'; }], ['Voltage / pressure ratio in dB', 20 * Math.log10(v.p2 / v.p1), function (n) { return X.num(n, 3) + ' dB'; }]],
      note: 'Power: dB = 10 log(P2/P1). Voltage, current or sound pressure: dB = 20 log(V2/V1).' };
  },
  test: [{ in: { mode: 'add', list: '80 80' }, expect: { 'Combined level': 83.0103 } }, { in: { mode: 'dist', l1: 100, r1: 1, r2: 10 }, expect: { 'Level at the new distance': 80 } },
    { in: { mode: 'ratio', p1: 1, p2: 100 }, expect: { 'Power ratio in dB': 20, 'Voltage / pressure ratio in dB': 40 } }]
});
