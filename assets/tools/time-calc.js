/* Infinity by GroupChatOn — time-calc. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'time-calc', {
  inputs: [{ k: 't', label: 'Times to add, one per line (h:mm or h:mm:ss; start with − to subtract)', type: 'textarea', value: '1:30\n2:45\n-0:15' }],
  calc: function (v, X) {
    var total = 0, n = 0;
    String(v.t).split('\n').forEach(function (line) {
      line = line.trim(); if (!line) return;
      var neg = /^[-−]/.test(line), p = line.replace(/^[-+−]\s*/, '').split(':').map(Number);
      X.need(p.every(function (x) { return !isNaN(x); }), 'Could not read “' + line + '”. Use h:mm, like 1:30.');
      var s = (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0); total += neg ? -s : s; n++;
    });
    var a = Math.abs(total), hm = (total < 0 ? '−' : '') + Math.floor(a / 3600) + ':' + ('0' + Math.floor(a % 3600 / 60)).slice(-2) + (a % 60 ? ':' + ('0' + a % 60).slice(-2) : '');
    return { rows: [['Total', hm], ['In hours', total / 3600, 2], ['In minutes', total / 60, 'num'], ['Days, hours, minutes', X.dur(total)]] };
  },
  test: [{ in: { t: '1:30\n2:45\n-0:15' }, expect: { 'Total': '4:00', 'In hours': 4 } }]
});
