/* Infinity by GroupChatOn — lic. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'lic', {
  inputs: [{ k: 'sa', label: 'Sum assured', money: true, value: 1000000 }, { k: 't', label: 'Policy term', suffix: 'years', value: 21 },
    { k: 'b', label: 'Bonus per ₹1,000 sum assured, per year', value: 45, hint: 'Find your plan’s latest simple reversionary bonus on licindia.in (it changes every year).' },
    { k: 'fab', label: 'Final additional bonus per ₹1,000 (if any)', value: 0 }, { k: 'prem', label: 'Yearly premium (to see your real return)', money: true, value: 50000 }, { k: 'pt', label: 'Premium paying term', suffix: 'years', value: 21 }],
  calc: function (v, X) {
    var bonus = v.sa / 1000 * v.b * v.t, fab = v.sa / 1000 * (v.fab || 0), mat = v.sa + bonus + fab, paid = (v.prem || 0) * v.pt, irr = NaN;
    if (v.prem > 0) {   // yearly return: premiums at the start of each year, maturity at the end of the term
      var f = function (r) { var s = 0; for (var y = 0; y < v.pt; y++) s -= v.prem / Math.pow(1 + r, y); return s + mat / Math.pow(1 + r, v.t); }, lo = -0.5, hi = 0.5;
      for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } irr = m * 100;
    }
    return { rows: [['Estimated maturity amount', mat, 'money'], ['Bonus added', bonus + fab, 'money'], ['Total premiums paid', paid, 'money'], ['Your yearly return', irr, 'pct', 'compare with PPF ' + '7.1%']],
      note: 'An estimate for endowment-type plans (Jeevan Labh, Jeevan Anand, New Endowment and similar). Bonuses are not guaranteed and are declared each year, so the real amount can differ. Check your policy bond or LIC for exact figures.' };
  },
  test: [{ in: { sa: 1000000, t: 21, b: 45, fab: 0, prem: 50000, pt: 21 }, expect: { 'Estimated maturity amount': 1945000, 'Total premiums paid': 1050000 } }]
});
