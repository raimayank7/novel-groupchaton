/* Infinity by GroupChatOn — currency-profit. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'currency-profit', {
  inputs: [{ k: 'b', label: 'Buy price (per share / coin)', money: true, value: 100 }, { k: 'q', label: 'Quantity', value: 10 }, { k: 's', label: 'Sell price (or price now)', money: true, value: 120 },
    { k: 'f', label: 'Fees and taxes on buy + sell', suffix: '%', value: 0.2 }],
  calc: function (v) { var cost = v.b * v.q, val = v.s * v.q, fee = (cost + val) * (v.f || 0) / 100, p = val - cost - fee;
    return { rows: [[p >= 0 ? 'Profit' : 'Loss', Math.abs(p), 'money'], ['Return', cost ? 100 * p / cost : NaN, 'pct'], ['Bought for', cost, 'money'], ['Value now', val, 'money'], ['Fees', fee, 'money'], ['Break-even sell price', v.q ? (cost * (1 + (v.f || 0) / 100)) / (v.q * (1 - (v.f || 0) / 100)) : NaN, 'money']] }; },
  test: [{ in: { b: 100, q: 10, s: 120, f: 0 }, expect: { 'Profit': 200, 'Return': 20 } }]
});
