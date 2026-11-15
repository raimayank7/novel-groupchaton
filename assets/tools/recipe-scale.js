/* Infinity by GroupChatOn — recipe-scale. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'recipe-scale', {
  inputs: [{ k: 'a', label: 'Recipe serves', value: 4 }, { k: 'b', label: 'I want to serve', value: 6 }, { k: 'r', label: 'Ingredients, one per line', type: 'textarea', rows: 7, value: '200 g flour\n2 eggs\n1 1/2 cups milk\n3 tbsp sugar\nSalt to taste' }],
  calc: function (v, X) {
    X.pos(v.a, 'the servings'); var k = v.b / v.a, out = [];
    String(v.r).split('\n').forEach(function (line) {
      var m = line.trim().match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+)\s*(.*)$/); if (!line.trim()) return;
      if (!m) { out.push(line.trim()); return; }
      var q = m[1].indexOf('/') > 0 ? m[1].split(/\s+/).reduce(function (s, p) { var f = p.split('/'); return s + (f[1] ? +f[0] / +f[1] : +f[0]); }, 0) : +m[1];
      var n = q * k, nice = Math.abs(n - Math.round(n)) < 0.05 ? String(Math.round(n)) : X.num(Math.round(n * 100) / 100, 2);
      out.push(nice + ' ' + m[2]);
    });
    return { rows: [['Multiply everything by', k, 3]], note: out.join('<br>'), table: null };
  },
  test: [{ in: { a: 4, b: 6, r: '200 g flour\n1 1/2 cups milk' }, expect: { 'Multiply everything by': 1.5, '_note': '300 g flour' } }]
});
