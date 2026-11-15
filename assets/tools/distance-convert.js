/* Infinity by GroupChatOn — distance-convert. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('units', 'distance-convert', {
  groups: [{ k: 'len', label: 'Distance', units: [['km', 'Kilometre (km)', 1000], ['m', 'Metre (m)', 1], ['mi', 'Mile (mi)', 1609.344], ['nmi', 'Nautical mile (nmi)', 1852], ['ft', 'Foot (ft)', 0.3048], ['yd', 'Yard (yd)', 0.9144]] }],
  from: 'km', to: 'mi', value: 5,
  extra: function (m) { return [['Walking steps (about, 76 cm a step)', Math.round(m / 0.762).toLocaleString('en-US')], ['Walking time at 5 km/h', dur(m / 5000 * 60)], ['Driving time at 60 km/h', dur(m / 60000 * 60)]];
    function dur(min) { var h = Math.floor(min / 60), mm = Math.round(min % 60); if (mm === 60) { h++; mm = 0; } return (h ? h + ' h ' : '') + mm + ' min'; } },
  test: [['len', 5, 'km', 'mi', 3.10685596], ['len', 1, 'nmi', 'km', 1.852], ['len', 10, 'km', 'mi', '13,123', 'Walking steps (about, 76 cm a step)'], ['len', 10, 'km', 'mi', '2 h 0 min', 'Walking time at 5 km/h']]
});
