/* Infinity by GroupChatOn — inverter. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'inverter', {
  inputs: [{ k: 'w', label: 'Total load to run (fans, lights, TV, router)', suffix: 'watts', value: 500 }, { k: 'h', label: 'Backup needed', suffix: 'hours', value: 3 },
    { k: 'v', label: 'Battery voltage', options: [['12', '12 V (one battery)'], ['24', '24 V (two batteries)'], ['48', '48 V']], value: '12' },
    { k: 't', label: 'Battery type', options: [['0.5', 'Lead-acid / tubular (use 50%)'], ['0.9', 'Lithium (use 90%)']], value: '0.5' }],
  calc: function (v, X) {
    X.pos(v.w, 'the load'); var ah = v.w * v.h / (+v.v * 0.85 * +v.t), sizes = [100, 120, 150, 180, 200, 220], each = ah / (+v.v / 12);
    var pick = sizes.filter(function (s) { return s >= each; })[0];
    return { rows: [['Battery capacity needed', ah, 'int', 'Ah at ' + v.v + ' V'], ['Inverter size', Math.ceil(v.w / 0.8 / 100) * 100, 'int', 'VA'],
      ['Suggested batteries', (+v.v / 12) + ' × ' + (pick ? pick + ' Ah' : Math.ceil(each) + ' Ah (or more in parallel)')], ['Energy stored needed', v.w * v.h / 1000, 2, 'kWh']],
      note: 'Allows 85% inverter efficiency and the safe depth of discharge for the battery type. Fridges, pumps and ACs need extra capacity for start-up.' };
  },
  test: [{ in: { w: 500, h: 3, v: '12', t: '0.9' }, expect: { 'Battery capacity needed': 163.399, 'Inverter size': 700 } }]
});
