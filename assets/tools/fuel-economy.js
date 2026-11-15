/* Infinity by GroupChatOn — fuel-economy. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('units', 'fuel-economy', {
  groups: [{ k: 'fuel', label: 'Fuel economy', units: 'FUEL' }], from: 'kml', to: 'l100', value: 15,
  extra: function (kml) { return [['Fuel for 100 km', kml > 0 ? GCOTools.unitsNice(100 / kml) + ' litres' : '—'], ['Distance on a full 40 L tank', kml > 0 ? GCOTools.unitsNice(40 * kml) + ' km' : '—']]; },
  note: 'km/l is used in India and much of Asia; L/100 km in Europe, Australia and Canada; mpg in the US (US gallon) and UK (imperial gallon).',
  test: [['fuel', 30, 'mpgus', 'l100', 7.84048611], ['fuel', 15, 'kml', 'l100', 6.6666667], ['fuel', 40, 'mpguk', 'mpgus', 33.30699], ['fuel', 20, 'kml', 'l100', '800 km', 'Distance on a full 40 L tank']]
});
