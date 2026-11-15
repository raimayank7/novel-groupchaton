/* Infinity by GroupChatOn — temperature. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('units', 'temperature', {
  groups: [{ k: 'temp', label: 'Temperature', units: [['c', 'Celsius (°C)', function (x) { return x; }, function (x) { return x; }], ['f', 'Fahrenheit (°F)', function (f) { return (f - 32) * 5 / 9; }, function (c) { return c * 9 / 5 + 32; }],
    ['k', 'Kelvin (K)', function (k) { return k - 273.15; }, function (c) { return c + 273.15; }], ['r', 'Rankine (°R)', function (r) { return (r - 491.67) * 5 / 9; }, function (c) { return (c + 273.15) * 9 / 5; }],
    ['re', 'Réaumur (°Ré)', function (r) { return r * 1.25; }, function (c) { return c * 0.8; }]] }],
  from: 'c', to: 'f', value: 37,
  extra: function (c) { return [['Feels', c >= 40 ? 'Very hot' : c >= 30 ? 'Hot' : c >= 20 ? 'Warm' : c >= 10 ? 'Mild' : c >= 0 ? 'Cold' : 'Freezing'], ['Body temperature check', c >= 38 ? 'Fever (38 °C and over)' : c >= 36.1 && c < 37.5 ? 'Normal body range (36.1–37.2 °C)' : '—']]; },
  note: 'Quick rule: °F = °C × 1.8 + 32. Water freezes at 0 °C (32 °F) and boils at 100 °C (212 °F) at sea level.',
  test: [['temp', 37, 'c', 'f', 98.6], ['temp', 0, 'k', 'c', -273.15], ['temp', 212, 'f', 'c', 100], ['temp', 38.5, 'c', 'f', 'Fever', 'Body temperature check']]
});
