/* Infinity by GroupChatOn — gst. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'gst', {
  inputs: [{ k: 'a', label: 'Amount', money: true, value: 1000 },
    { k: 'r', label: 'GST rate', options: [['0.25', '0.25%'], ['3', '3% (gold, silver)'], ['5', '5%'], ['12', '12%'], ['18', '18%'], ['28', '28%'], ['40', '40%']], value: '18' },
    { k: 'm', label: 'The amount is', options: [['ex', 'Before GST (add GST)'], ['in', 'Including GST (take GST out)']], value: 'ex' },
    { k: 's', label: 'Sale is', options: [['intra', 'Within the same state (CGST + SGST)'], ['inter', 'To another state (IGST)']], value: 'intra' }],
  calc: function (v) {
    var r = +v.r / 100, base = v.m === 'ex' ? v.a : v.a / (1 + r), g = base * r;
    var rows = [['Total with GST', base + g, 'money'], ['GST amount', g, 'money'], ['Price before GST', base, 'money']];
    if (v.s === 'intra') rows.push(['CGST (' + (+v.r / 2) + '%)', g / 2, 'money'], ['SGST (' + (+v.r / 2) + '%)', g / 2, 'money']); else rows.push(['IGST (' + v.r + '%)', g, 'money']);
    return { rows: rows };
  },
  test: [{ in: { a: 1000, r: '18', m: 'ex', s: 'intra' }, expect: { 'GST amount': 180, 'Total with GST': 1180, 'CGST (9%)': 90 } }, { in: { a: 1180, r: '18', m: 'in' }, expect: { 'Price before GST': 1000 } }]
});
