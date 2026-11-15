/* Infinity by GroupChatOn — grade. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'grade', {
  inputs: [{ k: 'cur', label: 'Your grade so far', suffix: '%', value: 85 }, { k: 'w', label: 'The final exam counts for', suffix: '% of the grade', value: 30 }, { k: 'want', label: 'Grade you want', suffix: '%', value: 90 }],
  calc: function (v, X) {
    X.pos(v.w, 'the weight of the final'); var need = (v.want - v.cur * (1 - v.w / 100)) / (v.w / 100);
    return { rows: [['You need on the final', need, 'pct', need > 100 ? 'More than 100%: not possible without extra credit' : need <= 0 ? 'You already have it' : ''],
      ['If you score 100%', v.cur * (1 - v.w / 100) + v.w, 'pct'], ['If you score 50%', v.cur * (1 - v.w / 100) + v.w / 2, 'pct']] };
  },
  test: [{ in: { cur: 85, w: 30, want: 90 }, expect: { 'You need on the final': 101.6667 } }]
});
