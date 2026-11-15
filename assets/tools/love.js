/* Infinity by GroupChatOn — love. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'love', {
  inputs: [{ k: 'a', label: 'Your name', type: 'text', value: 'Romeo' }, { k: 'b', label: 'Their name', type: 'text', value: 'Juliet' }],
  calc: function (v, X) {
    var a = v.a.trim().toLowerCase(), b = v.b.trim().toLowerCase(); X.need(a && b, 'Type both names.');
    var s = [a, b].sort().join('♥'), hsh = 7; for (var i = 0; i < s.length; i++) hsh = (hsh * 31 + s.charCodeAt(i)) % 1000003;
    var p = 40 + hsh % 61, words = p > 90 ? 'Made for each other!' : p > 75 ? 'A lovely match' : p > 60 ? 'Good friends first' : 'Takes a little work';
    return { rows: [['Love score', p, 'pct', words]], note: 'Just for fun: the score comes from the letters in your names, so it is the same every time.' };
  },
  test: [{ in: { a: 'Romeo', b: 'Juliet' }, expect: { '_note': 'Just for fun' } }]
});
