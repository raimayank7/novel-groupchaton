/* Infinity by GroupChatOn — dew-point. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'dew-point', {
  inputs: [{ k: 't', label: 'Air temperature', suffix: '°C', value: 25 }, { k: 'rh', label: 'Relative humidity', suffix: '%', value: 60 }],
  calc: function (v, X) {
    X.need(v.rh > 0 && v.rh <= 100, 'Humidity is between 1 and 100%.');
    var a = 17.62, b = 243.12, g = Math.log(v.rh / 100) + a * v.t / (b + v.t), td = b * g / (a - g);
    var es = 6.112 * Math.exp(a * v.t / (b + v.t)), ah = es * v.rh / 100 * 100 / (461.5 * (v.t + 273.15)) * 1000;
    var feel = td < 10 ? 'Dry and comfortable' : td < 16 ? 'Comfortable' : td < 18 ? 'A little humid' : td < 21 ? 'Humid: sticky' : td < 24 ? 'Very humid: uncomfortable' : 'Oppressive';
    return { rows: [['Dew point', td, function (n) { return X.num(n, 2) + ' °C'; }], ['Dew point in °F', td * 9 / 5 + 32, function (n) { return X.num(n, 1) + ' °F'; }],
      ['How it feels', feel], ['Water in the air', ah, function (n) { return X.num(n, 2) + ' g/m³'; }]],
      note: 'The dew point is the temperature at which the air becomes saturated and dew or condensation forms (Magnus formula).' };
  },
  test: [{ in: { t: 25, rh: 60 }, expect: { 'Dew point': 16.69315, 'How it feels': 'A little humid' } }]
});
