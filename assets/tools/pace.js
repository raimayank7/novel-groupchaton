/* Infinity by GroupChatOn — pace. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'pace', {
  inputs: [{ k: 'd', label: 'Distance', value: 10 }, { k: 'u', label: 'Unit', options: [['km', 'Kilometres'], ['mi', 'Miles']], value: 'km' },
    { k: 'h', label: 'Time: hours', value: 0 }, { k: 'm', label: 'minutes', value: 50 }, { k: 's', label: 'seconds', value: 0 }],
  calc: function (v, X) {
    var sec = (v.h || 0) * 3600 + (v.m || 0) * 60 + (v.s || 0); X.pos(v.d, 'the distance'); X.pos(sec, 'the time');
    var km = v.u === 'km' ? v.d : v.d * 1.609344, p = function (s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); };
    var marathon = function (dist) { var t = Math.round(sec * dist / km); return Math.floor(t / 3600) + ':' + ('0' + Math.floor(t % 3600 / 60)).slice(-2) + ':' + ('0' + t % 60).slice(-2); };
    return { rows: [['Pace', p(sec / km) + ' per km'], ['Pace per mile', p(sec / (km / 1.609344)) + ' per mile'], ['Speed', km / sec * 3600, 2, 'km/h'], ['Speed (mph)', km / 1.609344 / sec * 3600, 2],
      ['5K at this pace', marathon(5)], ['10K', marathon(10)], ['Half marathon', marathon(21.0975)], ['Marathon', marathon(42.195)]] };
  },
  test: [{ in: { d: 10, u: 'km', h: 0, m: 50, s: 0 }, expect: { 'Pace': '5:00 per km', 'Speed': 12, 'Marathon': '3:30:59' } }]
});
