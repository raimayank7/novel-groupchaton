/* Infinity by GroupChatOn — concrete. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'concrete', {
  inputs: [{ k: 'l', label: 'Length', suffix: 'm', value: 3 }, { k: 'w', label: 'Width', suffix: 'm', value: 3 }, { k: 'd', label: 'Thickness', suffix: 'm', value: 0.15 },
    { k: 'mix', label: 'Mix (cement : sand : aggregate)', options: [['1:1.5:3', 'M20 (1 : 1.5 : 3) slabs, beams'], ['1:2:4', 'M15 (1 : 2 : 4) floors, footings'], ['1:3:6', 'M10 (1 : 3 : 6) levelling, PCC'], ['1:1:2', 'M25 (1 : 1 : 2)']], value: '1:1.5:3', wide: true }],
  calc: function (v) {
    var vol = v.l * v.w * v.d, dry = vol * 1.54, r = v.mix.split(':').map(Number), t = r[0] + r[1] + r[2], cem = dry * r[0] / t;
    return { rows: [['Cement bags (50 kg)', cem / 0.0347, 1], ['Concrete volume', vol, 3, 'm³'], ['Sand', dry * r[1] / t, 3, 'm³'], ['Aggregate (gravel)', dry * r[2] / t, 3, 'm³'], ['Cement in kg', cem * 1440, 'int'], ['In cubic feet', vol * 35.3147, 1]],
      note: 'Nominal mix with the usual 1.54 dry-volume factor; one 50 kg bag is about 0.0347 m³. Add 5–10% for wastage. For structural work follow your engineer’s design mix.' };
  },
  test: [{ in: { l: 3, w: 3, d: 0.15, mix: '1:1.5:3' }, expect: { 'Concrete volume': 1.35, 'Cement bags (50 kg)': 10.8934 } }]
});
