/* Infinity by GroupChatOn — us-tax. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'us-tax', {
  inputs: [{ k: 'inc', label: 'Yearly income ($)', value: 80000 }, { k: 'st', label: 'Filing status', options: [['s', 'Single'], ['mfj', 'Married filing jointly'], ['hoh', 'Head of household']], value: 's' },
    { k: 'pre', label: 'Pre-tax deductions: 401(k), HSA… ($)', value: 0 }, { k: 'item', label: 'Itemized deductions, if more than the standard ($)', value: 0 }],
  calc: function (v) {
    var B = { s: [[12400, .10], [50400, .12], [105700, .22], [201775, .24], [256225, .32], [640600, .35], [Infinity, .37]],
      mfj: [[24800, .10], [100800, .12], [211400, .22], [403550, .24], [512450, .32], [768700, .35], [Infinity, .37]],
      hoh: [[17700, .10], [67450, .12], [105700, .22], [201750, .24], [256200, .32], [640600, .35], [Infinity, .37]] }[v.st];
    var std = { s: 16100, mfj: 32200, hoh: 24150 }[v.st], ded = Math.max(std, v.item || 0), ti = Math.max(0, v.inc - (v.pre || 0) - ded), t = 0, prev = 0, marg = 0.10;
    B.forEach(function (b) { if (ti > prev) { t += (Math.min(ti, b[0]) - prev) * b[1]; marg = b[1]; } prev = b[0]; });
    var $ = function (n) { return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }); };
    return { rows: [['Federal income tax', t, $], ['Taxable income', ti, $], ['Deduction used', ded, $], ['Effective rate', v.inc ? 100 * t / v.inc : 0, 'pct'], ['Marginal (top) rate', marg * 100, 'pct']],
      note: 'Tax year 2026 brackets and standard deductions (IRS Rev. Proc. 2025-32). Federal income tax only: no state tax, Social Security, Medicare or credits.' };
  },
  test: [{ in: { inc: 80000, st: 's', pre: 0, item: 0 }, expect: { 'Federal income tax': 8770, 'Taxable income': 63900 } }, { in: { inc: 150000, st: 'mfj', pre: 0, item: 0 }, expect: { 'Federal income tax': 15340 } }]
});
