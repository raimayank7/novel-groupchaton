/* Infinity by GroupChatOn — speed-distance-time. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  function hm(h) { var t = Math.round(h * 60), H = Math.floor(t / 60), M = t % 60; return H + ' h ' + M + ' min'; }
  GCOTools.engine('calc', 'speed-distance-time', {
    inputs: [{ k: 's', label: 'Speed', suffix: 'km/h (or mph)', value: 60 }, { k: 'd', label: 'Distance', suffix: 'km (or miles)', value: 150 },
      { k: 't', label: 'Time (hours:minutes)', type: 'text', value: '', placeholder: 'e.g. 2:30' }, { k: 'h', type: 'heading', label: 'Leave the one you want to find empty. Use km with km/h, or miles with mph.' }],
    calc: function (v, X) {
      var t = NaN, m = String(v.t || '').trim().match(/^(\d+(?:\.\d+)?)(?::(\d{1,2}))?$/);
      if (m) t = +m[1] + (m[2] ? +m[2] / 60 : 0);
      var ok = function (n) { return n > 0; }, n = [v.s, v.d, t].filter(ok).length;
      X.need(n === 2, 'Fill in exactly two of speed, distance and time.');
      var s = v.s, d = v.d;
      if (!ok(t)) t = d / s; else if (!ok(d)) d = s * t; else s = d / t;
      return { rows: [['Time', hm(t)], ['Speed', s, 2], ['Distance', d, 2], ['Time in minutes', t * 60, 1]], note: 'Speed = distance ÷ time.' };
    },
    test: [{ in: { s: 60, d: 150, t: '' }, expect: { Time: '2 h 30 min', 'Time in minutes': 150 } }, { in: { s: '', d: 100, t: '1:15' }, expect: { Speed: 80 } }, { in: { s: 50, d: '', t: '2:30' }, expect: { Distance: 125 } }]
  });
})();
