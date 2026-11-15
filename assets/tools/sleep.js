/* Infinity by GroupChatOn — sleep. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'sleep', {
  inputs: [{ k: 'm', label: 'I want to', options: [['wake', 'Wake up at…'], ['bed', 'Go to bed now / at…']], value: 'wake' }, { k: 't', label: 'Time', type: 'time', value: '07:00' }, { k: 'f', label: 'Minutes to fall asleep', value: 15 }],
  calc: function (v, X) {
    var p = String(v.t || '07:00').split(':'), base = (+p[0]) * 60 + (+p[1] || 0), f = v.f || 0, out = [];
    var hm = function (min) { min = ((min % 1440) + 1440) % 1440; return ('0' + Math.floor(min / 60)).slice(-2) + ':' + ('0' + min % 60).slice(-2); };
    [6, 5, 4, 3].forEach(function (c) { out.push([(v.m === 'wake' ? 'Go to bed at' : 'Wake up at') + ' (' + c + ' cycles, ' + c * 1.5 + ' h)', v.m === 'wake' ? hm(base - c * 90 - f) : hm(base + f + c * 90), null, c === 6 ? 'best for most adults' : '']); });
    return { rows: out, note: 'Sleep comes in cycles of about 90 minutes. Waking at the end of a cycle helps you feel fresh. Adults need 7–9 hours.' };
  },
  test: [{ in: { m: 'wake', t: '07:00', f: 15 }, expect: { 'Go to bed at (6 cycles, 9 h)': '21:45', 'Go to bed at (5 cycles, 7.5 h)': '23:15' } }]
});
