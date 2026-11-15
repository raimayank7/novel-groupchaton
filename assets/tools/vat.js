/* Infinity by GroupChatOn — vat. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'vat', {
  inputs: [{ k: 'a', label: 'Amount', money: true, value: 100 },
    { k: 'c', label: 'Country or rate', options: [['20', 'United Kingdom 20%'], ['19', 'Germany 19%'], ['20 ', 'France 20%'], ['22', 'Italy 22%'], ['21', 'Spain / Netherlands 21%'], ['23', 'Ireland / Portugal 23%'],
      ['25', 'Sweden / Denmark / Norway 25%'], ['8.1', 'Switzerland 8.1%'], ['5', 'UAE 5%'], ['15', 'Saudi Arabia / South Africa 15%'], ['10', 'Bahrain / Egypt (14%: use custom) 10%'], ['18', 'Pakistan GST 18%'],
      ['15 ', 'Bangladesh 15%'], ['13', 'Nepal 13%'], ['18 ', 'Sri Lanka 18%'], ['10 ', 'Japan consumption tax 10%'], ['9', 'Singapore GST 9%'], ['12', 'Philippines 12%'], ['7', 'Thailand 7%'],
      ['16', 'Mexico 16%'], ['5 ', 'Canada GST 5%'], ['10  ', 'Australia GST 10%'], ['15  ', 'New Zealand GST 15%'], ['custom', 'Other rate…']], value: '20' },
    { k: 'r', label: 'Your VAT rate', suffix: '%', value: 20, show: function (v) { return v.c === 'custom'; } },
    { k: 'm', label: 'The amount is', options: [['ex', 'Before VAT (add VAT)'], ['in', 'Including VAT (remove VAT)']], value: 'ex' }],
  calc: function (v) {
    var r = (v.c === 'custom' ? v.r : parseFloat(v.c)) / 100, base = v.m === 'ex' ? v.a : v.a / (1 + r), t = base * r;
    return { rows: [['Total with VAT', base + t, 'money'], ['VAT', t, 'money'], ['Net (without VAT)', base, 'money']], note: 'Rates change; check your tax office for reduced rates on food, books and other goods.' };
  },
  test: [{ in: { a: 100, c: '20', m: 'ex' }, expect: { 'VAT': 20, 'Total with VAT': 120 } }, { in: { a: 119, c: '19', m: 'in' }, expect: { 'Net (without VAT)': 100 } }]
});
