/* Infinity by GroupChatOn — wind-chill. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'wind-chill', {
  inputs: [{ k: 'u', label: 'Units', options: [['c', '°C and km/h'], ['f', '°F and mph']], value: 'c' }, { k: 't', label: 'Air temperature', value: 35 },
    { k: 'w', label: 'Wind speed', value: 10 }, { k: 'rh', label: 'Relative humidity', suffix: '%', value: 50 }],
  calc: function (v, X) {
    var C = v.u === 'c', tc = C ? v.t : (v.t - 32) * 5 / 9, tf = tc * 9 / 5 + 32, kmh = C ? v.w : v.w * 1.609344, R = v.rh;
    var out = function (c) { return C ? X.num(c, 1) + ' °C' : X.num(c * 9 / 5 + 32, 1) + ' °F'; };
    var wc = tc <= 10 && kmh > 4.8 ? 13.12 + 0.6215 * tc - 11.37 * Math.pow(kmh, 0.16) + 0.3965 * tc * Math.pow(kmh, 0.16) : null;
    var hi = 0.5 * (tf + 61 + (tf - 68) * 1.2 + R * 0.094);
    if ((hi + tf) / 2 >= 80) {
      hi = -42.379 + 2.04901523 * tf + 10.14333127 * R - 0.22475541 * tf * R - 0.00683783 * tf * tf - 0.05481717 * R * R + 0.00122874 * tf * tf * R + 0.00085282 * tf * R * R - 0.00000199 * tf * tf * R * R;
      if (R < 13 && tf >= 80 && tf <= 112) hi -= (13 - R) / 4 * Math.sqrt((17 - Math.abs(tf - 95)) / 17);
      if (R > 85 && tf >= 80 && tf <= 87) hi += (R - 85) / 10 * ((87 - tf) / 5);
    }
    var hic = tf >= 80 ? (hi - 32) * 5 / 9 : null;
    var feels = wc !== null ? wc : hic !== null ? hic : tc;
    var risk = hic === null ? (wc !== null && wc <= -28 ? 'Frostbite possible within 30 minutes' : wc !== null ? 'Dress warmly' : 'Comfortable range') :
      hic >= 54 ? 'Extreme danger: heat stroke likely' : hic >= 41 ? 'Danger: heat exhaustion likely' : hic >= 32 ? 'Extreme caution' : 'Caution: fatigue possible';
    return { rows: [['Feels like', feels, out], ['Wind chill', wc === null ? 'Only below 10 °C (50 °F) with wind' : wc, wc === null ? 'text' : out],
      ['Heat index', hic === null ? 'Only from 27 °C (80 °F)' : hic, hic === null ? 'text' : out], ['Health advice', risk]],
      note: 'Wind chill: the North American (Environment Canada / US NWS) formula. Heat index: the US National Weather Service formula with its adjustments. Both assume shade.' };
  },
  test: [{ in: { u: 'c', t: 35, w: 10, rh: 50 }, expect: { 'Heat index': 40.67543, 'Feels like': 40.67543 } }, { in: { u: 'c', t: -5, w: 30, rh: 50 }, expect: { 'Wind chill': -12.99672 } }]
});
