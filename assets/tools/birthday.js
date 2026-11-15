/* Infinity by GroupChatOn — birthday. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'birthday', {
  inputs: [{ k: 'd', label: 'Date of birth', type: 'date', value: '2000-01-15' }],
  calc: function (v, X) {
    var d = X.date(v.d), now = new Date(), next = new Date(now.getFullYear(), d.getMonth(), d.getDate()); if (X.days(now, next) < 0) next.setFullYear(now.getFullYear() + 1);
    var md = (d.getMonth() + 1) * 100 + d.getDate(), Z = [[120, 'Capricorn ♑'], [219, 'Aquarius ♒'], [320, 'Pisces ♓'], [420, 'Aries ♈'], [521, 'Taurus ♉'], [621, 'Gemini ♊'], [722, 'Cancer ♋'], [823, 'Leo ♌'], [923, 'Virgo ♍'], [1023, 'Libra ♎'], [1122, 'Scorpio ♏'], [1222, 'Sagittarius ♐'], [1232, 'Capricorn ♑']];
    var zod = Z.filter(function (z) { return md < z[0]; })[0][1], animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
    return { rows: [['You were born on a', d.toLocaleDateString('en', { weekday: 'long' })], ['Next birthday', X.fdate(next), null, 'in ' + X.days(now, next) + ' days'], ['Turning', next.getFullYear() - d.getFullYear(), 'int'],
      ['Star sign', zod], ['Chinese zodiac (by year)', animals[((d.getFullYear() - 4) % 12 + 12) % 12]], ['Days you have lived', X.days(d, now), 'int']],
      note: 'The Chinese zodiac year starts at the Lunar New Year (late January or February), so people born in January may belong to the previous animal.' };
  },
  test: [{ in: { d: '2000-01-15' }, expect: { 'You were born on a': 'Saturday', 'Star sign': 'Capricorn', 'Chinese zodiac (by year)': 'Dragon' } }]
});
