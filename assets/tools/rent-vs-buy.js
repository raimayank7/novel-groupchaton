/* Infinity by GroupChatOn — rent-vs-buy. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'rent-vs-buy', {
  inputs: [{ k: 'price', label: 'Home price', money: true, value: 6000000 }, { k: 'dp', label: 'Down payment', suffix: '%', value: 20 }, { k: 'r', label: 'Loan rate', suffix: '%', value: 8.5 }, { k: 'ly', label: 'Loan years', value: 20 },
    { k: 'mt', label: 'Upkeep, tax, insurance', suffix: '% of price a year', value: 1 }, { k: 'app', label: 'Home value grows', suffix: '% a year', value: 5 },
    { k: 'rent', label: 'Rent for a similar home a month', money: true, value: 20000 }, { k: 'ri', label: 'Rent rises', suffix: '% a year', value: 5 }, { k: 'inv', label: 'Return if you invest instead', suffix: '% a year', value: 10 }, { k: 'h', label: 'Compare over', suffix: 'years', value: 10 }],
  calc: function (v, X) {
    var loan = v.price * (1 - v.dp / 100), n = v.ly * 12, e = X.emi(loan, v.r, n), H = Math.round(v.h * 12), bal = loan, buyOut = v.price * v.dp / 100, rentOut = 0, rent = v.rent, invest = v.price * v.dp / 100, mi = v.inv / 1200;
    for (var m = 1; m <= H; m++) {
      var pay = m <= n ? e : 0; if (m <= n) bal = bal * (1 + v.r / 1200) - e;
      var upkeep = v.price * Math.pow(1 + v.app / 100, (m - 1) / 12) * v.mt / 1200; buyOut += pay + upkeep;
      rentOut += rent; invest = invest * (1 + mi) + Math.max(0, pay + upkeep - rent);   // the renter invests the down payment and any monthly difference
      if (m % 12 === 0) rent *= 1 + v.ri / 100;
    }
    var value = v.price * Math.pow(1 + v.app / 100, v.h), buyWealth = value - Math.max(0, bal), rentWealth = invest;
    return { rows: [['Better after ' + v.h + ' years', buyWealth >= rentWealth ? 'Buying' : 'Renting', null, 'by ' + X.money(Math.abs(buyWealth - rentWealth))],
      ['If you buy: home value minus loan left', buyWealth, 'money'], ['If you rent and invest: your investments', rentWealth, 'money'], ['Monthly EMI', e, 'money'], ['Total rent paid', rentOut, 'money']],
      note: 'A simple comparison that ignores taxes, stamp duty and selling costs. It assumes the renter invests the down payment and whatever buying would have cost above the rent.' };
  },
  test: [{ in: { price: 6000000, dp: 20, r: 8.5, ly: 20, mt: 0, app: 0, rent: 0, ri: 0, inv: 0, h: 1 }, expect: { 'If you rent and invest: your investments': 1699866.18 } }]
});
