/* Infinity by GroupChatOn — income-tax-in. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'income-tax-in', {
  inputs: [{ k: 'inc', label: 'Total yearly income (salary + other)', money: true, value: 1500000 }, { k: 'sal', label: 'I am salaried or a pensioner (standard deduction)', type: 'check', value: true, wide: true },
    { k: 'ded', label: 'Deductions in the old regime (80C, 80D, HRA, home-loan interest…)', money: true, value: 200000 },
    { k: 'age', label: 'Age (old regime)', options: [['n', 'Below 60'], ['s', '60 to 79'], ['ss', '80 or above']], value: 'n' }],
  calc: function (v, X) {
    function slabs(x, list) { var t = 0, prev = 0; list.forEach(function (s) { if (x > prev) t += (Math.min(x, s[0]) - prev) * s[1]; prev = s[0]; }); return t; }
    function sur(x, tax, cap) { var r = x > 5e7 ? (cap || 0.37) : x > 2e7 ? 0.25 : x > 1e7 ? 0.15 : x > 5e6 ? 0.10 : 0; return tax * r; }
    var nT = Math.max(0, v.inc - (v.sal ? 75000 : 0));
    var nTax = slabs(nT, [[400000, 0], [800000, .05], [1200000, .10], [1600000, .15], [2000000, .20], [2400000, .25], [Infinity, .30]]);
    if (nT <= 1200000) nTax = 0; else nTax = Math.min(nTax, nT - 1200000);   // rebate up to ₹12 lakh, with marginal relief just above it
    nTax += sur(nT, nTax, 0.25);
    var oT = Math.max(0, v.inc - (v.sal ? 50000 : 0) - (v.ded || 0)), ex = v.age === 'ss' ? 500000 : v.age === 's' ? 300000 : 250000;
    var oTax = slabs(oT, [[ex, 0], [500000, .05], [1000000, .20], [Infinity, .30]]);
    if (oT <= 500000) oTax = 0;
    oTax += sur(oT, oTax, 0.37);
    var n = nTax * 1.04, o = oTax * 1.04, best = n <= o ? 'New regime' : 'Old regime';
    return { rows: [['Tax in the new regime', n, 'money', 'including 4% cess'], ['Tax in the old regime', o, 'money', 'including 4% cess'], ['Better for you', best, null, 'saves ' + X.money(Math.abs(n - o))],
      ['Taxable income (new)', nT, 'money'], ['Taxable income (old)', oT, 'money']],
      note: 'For FY 2025-26 and FY 2026-27 (Budget 2026 kept the slabs). New regime: nil up to ₹4 lakh, then 5% to 30%, no tax up to ₹12 lakh of taxable income, ₹75,000 standard deduction. Surcharge is included without marginal relief, so very high incomes may differ slightly. A guide only: check with a tax professional.' };
  },
  test: [{ in: { inc: 1500000, sal: true, ded: 0, age: 'n' }, expect: { 'Tax in the new regime': 97500, 'Tax in the old regime': 257400, 'Better for you': 'New' } },
         { in: { inc: 1275000, sal: true, ded: 0, age: 'n' }, expect: { 'Tax in the new regime': 0 } }, { in: { inc: 1300000, sal: true, ded: 0, age: 'n' }, expect: { 'Tax in the new regime': 26000 } }]
});
