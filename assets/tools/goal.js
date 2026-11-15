/* Infinity by GroupChatOn — goal. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'goal', {
  inputs: [{ k: 'g', label: 'Goal', options: [['Child’s education', 'Child’s education'], ['Buying a house', 'Buying a house'], ['Wedding', 'Wedding'], ['Car', 'Car'], ['Travel', 'Travel'], ['Other goal', 'Other goal']], value: 'Child’s education' },
    { k: 'c', label: 'Cost today', money: true, value: 2000000 }, { k: 'y', label: 'Years away', value: 10 }, { k: 'inf', label: 'Cost rises by', suffix: '% a year', value: 8 },
    { k: 'r', label: 'Expected return', suffix: '% a year', value: 12 }, { k: 's', label: 'Saved already for it', money: true, value: 0 }],
  calc: function (v, X) {
    var fc = v.c * Math.pow(1 + v.inf / 100, v.y), have = (v.s || 0) * Math.pow(1 + v.r / 100, v.y), gap = Math.max(0, fc - have), n = Math.round(v.y * 12), i = v.r / 1200;
    var sip = gap * i / ((Math.pow(1 + i, n) - 1) * (1 + i)), lump = gap / Math.pow(1 + v.r / 100, v.y);
    return { rows: [['Monthly SIP needed', sip, 'money', v.g], ['Goal will cost', fc, 'money', 'in ' + v.y + ' years'], ['Or one lump sum today', lump, 'money']] };
  },
  test: [{ in: { c: 2000000, y: 10, inf: 8, r: 12, s: 0 }, expect: { 'Goal will cost': 4317849.99, 'Monthly SIP needed': 18584.26 } }]
});
