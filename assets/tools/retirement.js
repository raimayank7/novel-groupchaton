/* Infinity by GroupChatOn — retirement. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'retirement', {
  inputs: [{ k: 'age', label: 'Your age now', value: 30 }, { k: 'ret', label: 'Retire at', value: 60 }, { k: 'life', label: 'Plan until age', value: 85 },
    { k: 'exp', label: 'Monthly expenses today', money: true, value: 50000 }, { k: 'inf', label: 'Inflation', suffix: '% a year', value: 6 },
    { k: 'pre', label: 'Return before retirement', suffix: '% a year', value: 11 }, { k: 'post', label: 'Return after retirement', suffix: '% a year', value: 7 }, { k: 'sav', label: 'Savings you already have', money: true, value: 500000 }],
  calc: function (v, X) {
    var yrs = v.ret - v.age, life = v.life - v.ret; X.need(yrs > 0 && life > 0, 'Check the ages.');
    var E = v.exp * 12 * Math.pow(1 + v.inf / 100, yrs), rr = (1 + v.post / 100) / (1 + v.inf / 100) - 1;
    var corpus = rr ? E * (1 - Math.pow(1 + rr, -life)) / rr * (1 + rr) : E * life;
    var have = (v.sav || 0) * Math.pow(1 + v.pre / 100, yrs), gap = Math.max(0, corpus - have);
    var i = v.pre / 1200, n = yrs * 12, sip = gap ? gap * i / ((Math.pow(1 + i, n) - 1) * (1 + i)) : 0;
    return { rows: [['Money needed at retirement', corpus, 'money'], ['Monthly saving needed (SIP)', sip, 'money'], ['Monthly expenses when you retire', E / 12, 'money'], ['Your current savings will grow to', have, 'money']],
      note: 'Assumes expenses rise with inflation every year of retirement and withdrawals are made at the start of each year.' };
  },
  test: [{ in: { age: 30, ret: 60, life: 85, exp: 50000, inf: 6, pre: 11, post: 7, sav: 500000 }, expect: { 'Money needed at retirement': 77148478.3, 'Monthly saving needed (SIP)': 23214.5 } }]
});
