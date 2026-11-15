/* Infinity by GroupChatOn — gpa. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'gpa', {
  inputs: [{ k: 'm', label: 'What do you want?', options: [['gpa', 'GPA from grades and credits (4.0 scale)'], ['ten', 'CGPA from grade points and credits (10-point)'], ['pct', 'CGPA to percentage (× 9.5)']], value: 'gpa', wide: true },
    { k: 'g', label: 'One course per line: grade and credits', type: 'textarea', value: 'A 3\nB+ 4\nA- 3', show: function (v) { return v.m !== 'pct'; }, hint: 'Letters A+ to F, or numbers. Example: “A 3” or “8 4”.' },
    { k: 'c', label: 'Your CGPA', value: 8.2, show: function (v) { return v.m === 'pct'; } }],
  calc: function (v, X) {
    if (v.m === 'pct') return { rows: [['Percentage', v.c * 9.5, 'pct']], note: 'The ×9.5 rule is the CBSE / many Indian universities’ rule. Some universities use their own formula: check your marksheet.' };
    var P = { 'A+': 4, 'A': 4, 'A-': 3.7, 'B+': 3.3, 'B': 3, 'B-': 2.7, 'C+': 2.3, 'C': 2, 'C-': 1.7, 'D+': 1.3, 'D': 1, 'D-': 0.7, 'F': 0, 'O': 10 }, sum = 0, cr = 0;
    String(v.g).split('\n').forEach(function (line) {
      var p = line.trim().split(/[\s,;]+/); if (p.length < 2) return;
      var g = P[p[0].toUpperCase()] !== undefined ? P[p[0].toUpperCase()] : parseFloat(p[0]), c = parseFloat(p[1]);
      if (!isNaN(g) && c > 0) { sum += g * c; cr += c; }
    });
    X.need(cr > 0, 'Add at least one line like “A 3”.');
    return { rows: [[v.m === 'ten' ? 'CGPA' : 'GPA', sum / cr, 2], ['Total credits', cr, 'num'], ['Grade points', sum, 'num']] };
  },
  test: [{ in: { m: 'gpa', g: 'A 3\nB+ 4\nA- 3' }, expect: { 'GPA': 3.63 } }, { in: { m: 'pct', c: 8.2 }, expect: { 'Percentage': 77.9 } }]
});
