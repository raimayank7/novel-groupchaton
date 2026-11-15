/* Infinity by GroupChatOn — land-area. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var F = 0.09290304;   // one square foot in m²
  var LAND = [['sqft', 'Square foot (sq ft)', F], ['sqyd', 'Square yard / gaj (sq yd)', 9 * F], ['sqm', 'Square metre (m²)', 1], ['acre', 'Acre', 43560 * F], ['ha', 'Hectare (ha)', 1e4], ['sqkm', 'Square kilometre (km²)', 1e6],
    ['cent', 'Cent / decimal (= 435.6 sq ft)', 435.6 * F], ['guntha', 'Guntha (= 1,089 sq ft)', 1089 * F], ['ground', 'Ground, Tamil Nadu (= 2,400 sq ft)', 2400 * F],
    ['marla', 'Marla, Punjab (= 272.25 sq ft)', 272.25 * F], ['kanal', 'Kanal (= 20 marla = 5,445 sq ft)', 5445 * F], ['katha', 'Katha, West Bengal (= 720 sq ft)', 720 * F],
    ['bwb', 'Bigha, West Bengal / Assam (14,400 sq ft)', 14400 * F], ['bpb', 'Bigha, Punjab (9,070 sq ft)', 9070 * F], ['bhp', 'Bigha, Himachal (8,712 sq ft)', 8712 * F],
    ['buk', 'Bigha, Uttarakhand (6,804 sq ft)', 6804 * F], ['bup', 'Bigha, Uttar Pradesh (27,000 sq ft)', 27000 * F], ['bbr', 'Bigha, Bihar (27,220 sq ft)', 27220 * F],
    ['brj', 'Bigha, Rajasthan pucca (27,225 sq ft)', 27225 * F], ['brk', 'Bigha, Rajasthan kachha (17,424 sq ft)', 17424 * F], ['bgj', 'Bigha, Gujarat (17,424 sq ft)', 17424 * F],
    ['bmp', 'Bigha, Madhya Pradesh (12,000 sq ft)', 12000 * F]];
  GCOTools.engine('units', 'land-area', {
    groups: [{ k: 'land', label: 'Land area', units: LAND }], from: 'acre', to: 'kanal', value: 1,
    note: 'Bigha, biswa and katha differ from state to state, and sometimes from district to district. Always confirm the local size with the revenue office or your land records (jamabandi, 7/12, khatauni) before buying or selling.',
    test: [['land', 1, 'acre', 'kanal', 8], ['land', 1, 'kanal', 'marla', 20], ['land', 1, 'acre', 'sqft', 43560], ['land', 1, 'ha', 'acre', 2.47105381], ['land', 1, 'bwb', 'katha', 20], ['land', 1, 'acre', 'guntha', 40]]
  });
})();
