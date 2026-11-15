/* Infinity by GroupChatOn — nato. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* NATO phonetic alphabet: spell any text as Alfa, Bravo, Charlie… for phone calls and bookings. */
GCOTools.register('nato', function (spot, T) {
  var N = { A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
    P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
    '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Niner', '.': 'Stop', '-': 'Dash', '@': 'At', '/': 'Slash' };
  function run(t, o) {
    return t.split(/\r?\n/).map(function (l) {
      var words = l.trim().split(/\s+/).filter(Boolean).map(function (w) {
        return Array.from(w).map(function (c) { var u = c.toUpperCase(), n = N[u]; if (!n) return c; return o.show ? u + ' as in ' + n : n; }).join(o.show ? ', ' : ' ');
      });
      return words.join(o.show ? '\n(space)\n' : ' · ');
    }).join('\n');
  }
  T.transformer(spot, { id: 'nato', inLabel: 'Text to spell out', sample: 'PNR 4XK2Q',
    options: [T.opt.check('show', 'Write “A as in Alfa” (one letter per line style)', false)], run: run });
  T.tests['nato'] = function () {
    var f = [], a = run('Hi 9', {}), b = run('ab', { show: true });
    if (a !== 'Hotel India · Niner') f.push('plain ' + a);
    if (b !== 'A as in Alfa, B as in Bravo') f.push('show ' + b);
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
