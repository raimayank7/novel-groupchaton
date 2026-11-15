/* Infinity by GroupChatOn — speed-pace. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  function mmss(min) { if (!isFinite(min) || min <= 0) return '—'; var m = Math.floor(min), s = Math.round((min - m) * 60); if (s === 60) { m++; s = 0; } return m + ':' + (s < 10 ? '0' : '') + s; }
  function hms(min) { var s = Math.round(min * 60), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h + ':' + (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x; }
  GCOTools.engine('calc', 'speed-pace', {
    inputs: [{ k: 'mode', label: 'I know my', options: [['pace', 'Pace (minutes per km or mile)'], ['speed', 'Speed (km/h or mph)']], value: 'pace', wide: true },
      { k: 'p', label: 'Pace (min:sec)', type: 'text', value: '5:30', show: function (v) { return v.mode === 'pace'; } },
      { k: 'pu', label: 'Pace per', options: [['km', 'kilometre'], ['mi', 'mile']], value: 'km', show: function (v) { return v.mode === 'pace'; } },
      { k: 's', label: 'Speed', value: 10, show: function (v) { return v.mode === 'speed'; } },
      { k: 'su', label: 'Speed in', options: [['kmh', 'km/h'], ['mph', 'mph']], value: 'kmh', show: function (v) { return v.mode === 'speed'; } }],
    calc: function (v, X) {
      var minPerKm;
      if (v.mode === 'pace') {
        var m = String(v.p || '').trim().match(/^(\d+)(?::(\d{1,2}(?:\.\d+)?))?$/);
        X.need(m, 'Type the pace as minutes:seconds, e.g. 5:30.');
        var mins = +m[1] + (m[2] ? +m[2] / 60 : 0);
        X.need(mins > 0, 'Type a pace above 0.');
        minPerKm = v.pu === 'km' ? mins : mins / 1.609344;
      } else { X.pos(v.s, 'the speed'); minPerKm = 60 / (v.su === 'kmh' ? v.s : v.s * 1.609344); }
      var kmh = 60 / minPerKm;
      return { rows: [['Speed', kmh, function (n) { return X.num(n, 2) + ' km/h'; }], ['Speed in mph', kmh / 1.609344, function (n) { return X.num(n, 2) + ' mph'; }],
        ['Pace per km', mmss(minPerKm)], ['Pace per mile', mmss(minPerKm * 1.609344)], ['5 km', hms(minPerKm * 5)], ['10 km', hms(minPerKm * 10)],
        ['Half marathon', hms(minPerKm * 21.0975)], ['Marathon', hms(minPerKm * 42.195)]] };
    },
    test: [{ in: { mode: 'pace', p: '5:30', pu: 'km' }, expect: { Speed: 10.90909, 'Pace per mile': '8:51', Marathon: '3:52:04' } }, { in: { mode: 'speed', s: 12, su: 'kmh' }, expect: { 'Pace per km': '5:00', '10 km': '0:50:00' } },
      { in: { mode: 'pace', p: 'abc', pu: 'km' }, expect: { _error: 'minutes:seconds' } }]
  });
})();
