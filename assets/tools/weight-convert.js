/* Infinity by GroupChatOn — weight-convert. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('units', 'weight-convert', {
  groups: [{ k: 'mass', label: 'Weight', units: [['kg', 'Kilogram (kg)', 1], ['g', 'Gram (g)', 0.001], ['lb', 'Pound (lb)', 0.45359237], ['oz', 'Ounce (oz)', 0.028349523125], ['st', 'Stone (st)', 6.35029318]] }],
  from: 'kg', to: 'lb', value: 70,
  extra: function (kg) {
    var lb = kg / 0.45359237, st = Math.floor(lb / 14), l = lb - st * 14, L = Math.floor(lb), oz = (lb - L) * 16;
    return [['Stones and pounds', st + ' st ' + (Math.round(l * 10) / 10) + ' lb'], ['Pounds and ounces', L + ' lb ' + (Math.round(oz * 10) / 10) + ' oz']];
  },
  test: [['mass', 70, 'kg', 'lb', 154.323584], ['mass', 1, 'st', 'kg', 6.35029318], ['mass', 70, 'kg', 'lb', '11 st 0.3 lb', 'Stones and pounds'], ['mass', 70, 'kg', 'lb', '154 lb 5.2 oz', 'Pounds and ounces']]
});
