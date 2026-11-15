/* Infinity by GroupChatOn — body-fat. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'body-fat', {
  inputs: [{ k: 's', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: 'm' }, { k: 'h', label: 'Height', suffix: 'cm', value: 178 },
    { k: 'n', label: 'Neck', suffix: 'cm', value: 38 }, { k: 'w', label: 'Waist (at the navel)', suffix: 'cm', value: 85 },
    { k: 'hip', label: 'Hips (widest point)', suffix: 'cm', value: 100, show: function (v) { return v.s === 'f'; } }, { k: 'kg', label: 'Weight (optional)', suffix: 'kg', value: 75 }],
  calc: function (v, X) {
    var L = Math.log10, bf;
    if (v.s === 'm') { X.need(v.w > v.n, 'Waist must be bigger than neck.'); bf = 495 / (1.0324 - 0.19077 * L(v.w - v.n) + 0.15456 * L(v.h)) - 450; }
    else { X.need(v.w + v.hip > v.n, 'Check the measurements.'); bf = 495 / (1.29579 - 0.35004 * L(v.w + v.hip - v.n) + 0.22100 * L(v.h)) - 450; }
    var c = v.s === 'm' ? (bf < 6 ? 'Essential fat' : bf < 14 ? 'Athletes' : bf < 18 ? 'Fitness' : bf < 25 ? 'Average' : 'Obese') : (bf < 14 ? 'Essential fat' : bf < 21 ? 'Athletes' : bf < 25 ? 'Fitness' : bf < 32 ? 'Average' : 'Obese');
    var rows = [['Body fat', bf, 'pct', c], ['Category', c]];
    if (v.kg > 0) rows.push(['Fat mass', X.num(v.kg * bf / 100, 1) + ' kg'], ['Lean mass', X.num(v.kg * (1 - bf / 100), 1) + ' kg']);
    return { rows: rows, note: 'U.S. Navy tape-measure method; usually within 3–4% of a lab scan.' };
  },
  test: [{ in: { s: 'm', h: 178, n: 38, w: 85, kg: 75 }, expect: { 'Body fat': 16.436 } }]
});
