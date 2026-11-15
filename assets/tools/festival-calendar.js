/* Infinity by GroupChatOn — festival-calendar. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Festivals and holidays by country: dates worked out for any year (fixed days, Easter-based days, "first Monday" rules, weekend substitutes),
   approximate Islamic dates from the tabular calendar, and an honest list of moon-based festivals to check locally. */
GCOTools.register('festival-calendar', function (spot, T) {
  var h = T.h, status = T.status();
  function U(y, m, d) { return new Date(Date.UTC(y, m - 1, d)); }
  function key(d) { return d.toISOString().slice(0, 10); }
  function add(d, n) { var x = new Date(d.getTime()); x.setUTCDate(x.getUTCDate() + n); return x; }
  // Western Easter (Anonymous Gregorian algorithm)
  function easter(y) { var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), hh = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - hh - k) % 7, m = Math.floor((a + 11 * hh + 22 * l) / 451), mo = Math.floor((hh + l - 7 * m + 114) / 31), da = (hh + l - 7 * m + 114) % 31 + 1; return U(y, mo, da); }
  // Orthodox Easter: Julian computus, moved to the Gregorian calendar (+13 days, valid 1900–2099)
  function orthodox(y) { var a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7, mo = Math.floor((d + e + 114) / 31), da = (d + e + 114) % 31 + 1; return add(U(y, mo, da), 13); }
  // nth weekday of a month (n = -1 for the last); wd 0 = Sunday
  function nth(y, m, wd, n) { if (n > 0) { var d = U(y, m, 1); return add(d, (wd - d.getUTCDay() + 7) % 7 + (n - 1) * 7); } var e = U(y, m + 1, 0); return add(e, -((e.getUTCDay() - wd + 7) % 7)); }
  function onOrBefore(y, m, d, wd) { var x = U(y, m, d); return add(x, -((x.getUTCDay() - wd + 7) % 7)); }
  // tabular (arithmetic) Islamic calendar: usually within a day or two of the moon-sighting date
  function islamicJd(y, m, d) { return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948439.5 - 1; }
  function jdDate(jd) { return new Date(Math.round((jd - 2440587.5) * 86400000)); }
  function islamic(gy, hm, hd) { var out = [], base = Math.floor((gy - 622) * 33 / 32); for (var y = base - 1; y <= base + 2; y++) { var d = jdDate(islamicJd(y, hm, hd)); if (d.getUTCFullYear() === gy) out.push(d); } return out; }
  var R = {
    fixed: function (y, r) { return [U(y, r[2], r[3])]; }, easter: function (y, r) { return [add(easter(y), r[2])]; }, orth: function (y, r) { return [add(orthodox(y), r[2])]; },
    nth: function (y, r) { return [nth(y, r[2], r[3], r[4])]; }, before: function (y, r) { return [onOrBefore(y, r[2], r[3], r[4])]; }, isl: function (y, r) { return islamic(y, r[2], r[3]); },
    brigid: function (y) { var f = U(y, 2, 1); return [f.getUTCDay() === 5 ? f : nth(y, 2, 1, 1)]; }
  };
  // [name, rule, …, kind]: kind p = public holiday, o = observance, r = some regions only
  var EID = [['Ramadan begins (approx.)', 'isl', 9, 1, 'o'], ['Eid al-Fitr (approx.)', 'isl', 10, 1, 'p'], ['Eid al-Adha (approx.)', 'isl', 12, 10, 'p'], ['Islamic New Year (approx.)', 'isl', 1, 1, 'p'], ['Prophet’s Birthday, Mawlid (approx.)', 'isl', 3, 12, 'p']];
  var C = {
    IN: ['India', 'none', [['New Year’s Day', 'fixed', 1, 1, 'o'], ['Makar Sankranti / Pongal (about)', 'fixed', 1, 14, 'r'], ['Republic Day', 'fixed', 1, 26, 'p'], ['Good Friday', 'easter', -2, 'p'], ['Baisakhi / Vaisakhi (about)', 'fixed', 4, 14, 'r'], ['Ambedkar Jayanti', 'fixed', 4, 14, 'p'], ['May Day / Labour Day', 'fixed', 5, 1, 'r'], ['International Yoga Day', 'fixed', 6, 21, 'o'], ['Independence Day', 'fixed', 8, 15, 'p'], ['Teachers’ Day', 'fixed', 9, 5, 'o'], ['Gandhi Jayanti', 'fixed', 10, 2, 'p'], ['Children’s Day', 'fixed', 11, 14, 'o'], ['Christmas', 'fixed', 12, 25, 'p']].concat(EID.slice(1).concat([['Muharram / Ashura (approx.)', 'isl', 1, 10, 'p']])),
      ['Maha Shivaratri: February or March', 'Holi: February or March', 'Ram Navami: March or April', 'Mahavir Jayanti: March or April', 'Buddha Purnima: April or May', 'Raksha Bandhan: August', 'Janmashtami: August or September', 'Ganesh Chaturthi: August or September', 'Onam: August or September', 'Navratri and Dussehra: September or October', 'Karva Chauth: October or November', 'Diwali: October or November', 'Chhath Puja: October or November', 'Guru Nanak Jayanti: November']],
    US: ['United States', 'us', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Martin Luther King Jr. Day', 'nth', 1, 1, 3, 'p'], ['Valentine’s Day', 'fixed', 2, 14, 'o'], ['Presidents’ Day', 'nth', 2, 1, 3, 'p'], ['Easter Sunday', 'easter', 0, 'o'], ['Mother’s Day', 'nth', 5, 0, 2, 'o'], ['Memorial Day', 'nth', 5, 1, -1, 'p'], ['Father’s Day', 'nth', 6, 0, 3, 'o'], ['Juneteenth', 'fixed', 6, 19, 'p'], ['Independence Day', 'fixed', 7, 4, 'p'], ['Labor Day', 'nth', 9, 1, 1, 'p'], ['Columbus Day / Indigenous Peoples’ Day', 'nth', 10, 1, 2, 'p'], ['Halloween', 'fixed', 10, 31, 'o'], ['Veterans Day', 'fixed', 11, 11, 'p'], ['Thanksgiving', 'nth', 11, 4, 4, 'p'], ['Christmas', 'fixed', 12, 25, 'p']],
      ['Lunar New Year: late January or February', 'Passover: March or April', 'Rosh Hashanah and Yom Kippur: September or October', 'Diwali: October or November', 'Hanukkah: late November or December', 'Eid al-Fitr and Eid al-Adha: see the approximate dates above']],
    GB: ['United Kingdom (England & Wales)', 'next', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Mothering Sunday', 'easter', -21, 'o'], ['Good Friday', 'easter', -2, 'p'], ['Easter Monday', 'easter', 1, 'p'], ['Early May bank holiday', 'nth', 5, 1, 1, 'p'], ['Spring bank holiday', 'nth', 5, 1, -1, 'p'], ['Father’s Day', 'nth', 6, 0, 3, 'o'], ['Summer bank holiday', 'nth', 8, 1, -1, 'p'], ['Bonfire Night', 'fixed', 11, 5, 'o'], ['Remembrance Sunday', 'nth', 11, 0, 2, 'o'], ['Christmas Day', 'fixed', 12, 25, 'p'], ['Boxing Day', 'fixed', 12, 26, 'p']],
      ['Scotland and Northern Ireland have some different bank holidays', 'Extra one-off bank holidays are announced by the government', 'Diwali, Eid, Vaisakhi, Hanukkah and Lunar New Year move each year']],
    CA: ['Canada', 'next', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Family Day (most provinces)', 'nth', 2, 1, 3, 'r'], ['Good Friday', 'easter', -2, 'p'], ['Easter Monday (federal staff)', 'easter', 1, 'r'], ['Victoria Day', 'before', 5, 24, 1, 'p'], ['Canada Day', 'fixed', 7, 1, 'p'], ['Civic Holiday (most provinces)', 'nth', 8, 1, 1, 'r'], ['Labour Day', 'nth', 9, 1, 1, 'p'], ['National Day for Truth and Reconciliation', 'fixed', 9, 30, 'r'], ['Thanksgiving', 'nth', 10, 1, 2, 'p'], ['Remembrance Day', 'fixed', 11, 11, 'r'], ['Christmas Day', 'fixed', 12, 25, 'p'], ['Boxing Day', 'fixed', 12, 26, 'r']],
      ['Provinces set some of their own holidays: check yours', 'Lunar New Year, Diwali, Eid and Hanukkah move each year']],
    AU: ['Australia', 'next', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Australia Day', 'fixed', 1, 26, 'p'], ['Good Friday', 'easter', -2, 'p'], ['Easter Saturday (most states)', 'easter', -1, 'r'], ['Easter Monday', 'easter', 1, 'p'], ['Anzac Day', 'fixed', 4, 25, 'p'], ['King’s Birthday (most states)', 'nth', 6, 1, 2, 'r'], ['Christmas Day', 'fixed', 12, 25, 'p'], ['Boxing Day', 'fixed', 12, 26, 'p']],
      ['Labour Day is on different dates in each state', 'Queensland and Western Australia hold the King’s Birthday on other dates', 'Melbourne Cup Day and show days are local holidays']],
    AE: ['United Arab Emirates', 'none', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Arafat Day (approx.)', 'isl', 12, 9, 'p'], ['Commemoration Day', 'fixed', 12, 1, 'p'], ['National Day', 'fixed', 12, 2, 'p'], ['National Day holiday', 'fixed', 12, 3, 'p']].concat(EID),
      ['Islamic holiday dates are confirmed by moon sighting and announced shortly before', 'The government sometimes moves holidays to make long weekends']],
    SA: ['Saudi Arabia', 'none', [['Founding Day', 'fixed', 2, 22, 'p'], ['Arafat Day (approx.)', 'isl', 12, 9, 'p'], ['National Day', 'fixed', 9, 23, 'p']].concat(EID.slice(0, 3)), ['Eid holiday lengths and exact dates are announced by the government']],
    PK: ['Pakistan', 'none', [['Kashmir Solidarity Day', 'fixed', 2, 5, 'p'], ['Pakistan Day', 'fixed', 3, 23, 'p'], ['Labour Day', 'fixed', 5, 1, 'p'], ['Youm-e-Takbeer', 'fixed', 5, 28, 'p'], ['Independence Day', 'fixed', 8, 14, 'p'], ['Iqbal Day', 'fixed', 11, 9, 'p'], ['Quaid-e-Azam Day and Christmas', 'fixed', 12, 25, 'p'], ['Ashura (approx.)', 'isl', 1, 10, 'p']].concat(EID),
      ['Islamic holiday dates are confirmed by the Ruet-e-Hilal committee', 'Holi and Diwali are optional holidays for Hindu citizens']],
    BD: ['Bangladesh', 'none', [['Language Martyrs’ Day', 'fixed', 2, 21, 'p'], ['Independence Day', 'fixed', 3, 26, 'p'], ['Pohela Boishakh (Bengali New Year)', 'fixed', 4, 14, 'p'], ['May Day', 'fixed', 5, 1, 'p'], ['Victory Day', 'fixed', 12, 16, 'p'], ['Christmas', 'fixed', 12, 25, 'p'], ['Ashura (approx.)', 'isl', 1, 10, 'p']].concat(EID),
      ['Durga Puja (Bijoya Dashami): September or October', 'Buddha Purnima: April or May', 'Janmashtami: August or September']],
    NP: ['Nepal', 'none', [['International Women’s Day', 'fixed', 3, 8, 'p'], ['Labour Day', 'fixed', 5, 1, 'p'], ['Christmas', 'fixed', 12, 25, 'p']],
      ['Nepal follows the Bikram Sambat calendar, so most holidays move in the Western calendar', 'Nepali New Year: mid-April', 'Buddha Jayanti: April or May', 'Constitution Day: around 19 September', 'Dashain: September or October', 'Tihar: October or November', 'Chhath: October or November', 'Holi: February or March', 'Maha Shivaratri: February or March']],
    LK: ['Sri Lanka', 'none', [['Tamil Thai Pongal (about)', 'fixed', 1, 14, 'p'], ['Independence Day', 'fixed', 2, 4, 'p'], ['Good Friday', 'easter', -2, 'p'], ['Sinhala and Tamil New Year (about)', 'fixed', 4, 13, 'p'], ['Sinhala and Tamil New Year (about)', 'fixed', 4, 14, 'p'], ['May Day', 'fixed', 5, 1, 'p'], ['Christmas', 'fixed', 12, 25, 'p'], ['Eid al-Fitr (approx.)', 'isl', 10, 1, 'p'], ['Eid al-Adha (approx.)', 'isl', 12, 10, 'p'], ['Prophet’s Birthday (approx.)', 'isl', 3, 12, 'p']],
      ['Every full moon (Poya) day is a public holiday', 'Vesak: May', 'Deepavali: October or November', 'Maha Shivaratri: February or March']],
    SG: ['Singapore', 'sun', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Good Friday', 'easter', -2, 'p'], ['Labour Day', 'fixed', 5, 1, 'p'], ['Hari Raya Puasa (approx.)', 'isl', 10, 1, 'p'], ['Hari Raya Haji (approx.)', 'isl', 12, 10, 'p'], ['National Day', 'fixed', 8, 9, 'p'], ['Christmas Day', 'fixed', 12, 25, 'p']],
      ['Chinese New Year (2 days): late January or February', 'Vesak Day: May', 'Deepavali: October or November', 'The Ministry of Manpower publishes the official dates each year']],
    MY: ['Malaysia', 'none', [['New Year’s Day (most states)', 'fixed', 1, 1, 'r'], ['Labour Day', 'fixed', 5, 1, 'p'], ['Agong’s Birthday', 'nth', 6, 1, 1, 'p'], ['National Day', 'fixed', 8, 31, 'p'], ['Malaysia Day', 'fixed', 9, 16, 'p'], ['Christmas', 'fixed', 12, 25, 'p'], ['Hari Raya Aidilfitri (approx.)', 'isl', 10, 1, 'p'], ['Hari Raya Haji (approx.)', 'isl', 12, 10, 'p'], ['Awal Muharram (approx.)', 'isl', 1, 1, 'p'], ['Prophet’s Birthday (approx.)', 'isl', 3, 12, 'p']],
      ['Chinese New Year: late January or February', 'Wesak Day: May', 'Deepavali: October or November', 'Thaipusam: January or February (some states)', 'Each state has extra holidays']],
    PH: ['Philippines', 'none', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Maundy Thursday', 'easter', -3, 'p'], ['Good Friday', 'easter', -2, 'p'], ['Black Saturday', 'easter', -1, 'r'], ['Araw ng Kagitingan', 'fixed', 4, 9, 'p'], ['Labor Day', 'fixed', 5, 1, 'p'], ['Independence Day', 'fixed', 6, 12, 'p'], ['Ninoy Aquino Day', 'fixed', 8, 21, 'r'], ['National Heroes Day', 'nth', 8, 1, -1, 'p'], ['All Saints’ Day', 'fixed', 11, 1, 'r'], ['Bonifacio Day', 'fixed', 11, 30, 'p'], ['Feast of the Immaculate Conception', 'fixed', 12, 8, 'r'], ['Christmas Day', 'fixed', 12, 25, 'p'], ['Rizal Day', 'fixed', 12, 30, 'p'], ['Eid al-Fitr (approx.)', 'isl', 10, 1, 'p'], ['Eid al-Adha (approx.)', 'isl', 12, 10, 'p']],
      ['Chinese New Year: late January or February (special non-working day)', 'The President proclaims the final list each year and may move some holidays']],
    NG: ['Nigeria', 'none', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Good Friday', 'easter', -2, 'p'], ['Easter Monday', 'easter', 1, 'p'], ['Workers’ Day', 'fixed', 5, 1, 'p'], ['Democracy Day', 'fixed', 6, 12, 'p'], ['Independence Day', 'fixed', 10, 1, 'p'], ['Christmas Day', 'fixed', 12, 25, 'p'], ['Boxing Day', 'fixed', 12, 26, 'p'], ['Eid al-Fitr (approx.)', 'isl', 10, 1, 'p'], ['Eid al-Adha (approx.)', 'isl', 12, 10, 'p'], ['Eid-el-Maulud (approx.)', 'isl', 3, 12, 'p']],
      ['Islamic holiday dates are confirmed by the Federal Government shortly before']],
    ZA: ['South Africa', 'sun', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Human Rights Day', 'fixed', 3, 21, 'p'], ['Good Friday', 'easter', -2, 'p'], ['Family Day', 'easter', 1, 'p'], ['Freedom Day', 'fixed', 4, 27, 'p'], ['Workers’ Day', 'fixed', 5, 1, 'p'], ['Youth Day', 'fixed', 6, 16, 'p'], ['National Women’s Day', 'fixed', 8, 9, 'p'], ['Heritage Day', 'fixed', 9, 24, 'p'], ['Day of Reconciliation', 'fixed', 12, 16, 'p'], ['Christmas Day', 'fixed', 12, 25, 'p'], ['Day of Goodwill', 'fixed', 12, 26, 'p']],
      ['Diwali, Eid and Rosh Hashanah are not public holidays but are widely celebrated']],
    DE: ['Germany', 'none', [['Neujahr (New Year)', 'fixed', 1, 1, 'p'], ['Heilige Drei Könige (some states)', 'fixed', 1, 6, 'r'], ['Karfreitag (Good Friday)', 'easter', -2, 'p'], ['Ostermontag (Easter Monday)', 'easter', 1, 'p'], ['Tag der Arbeit (Labour Day)', 'fixed', 5, 1, 'p'], ['Christi Himmelfahrt (Ascension)', 'easter', 39, 'p'], ['Pfingstmontag (Whit Monday)', 'easter', 50, 'p'], ['Fronleichnam (some states)', 'easter', 60, 'r'], ['Tag der Deutschen Einheit', 'fixed', 10, 3, 'p'], ['Reformationstag (some states)', 'fixed', 10, 31, 'r'], ['Allerheiligen (some states)', 'fixed', 11, 1, 'r'], ['1. Weihnachtstag (Christmas)', 'fixed', 12, 25, 'p'], ['2. Weihnachtstag', 'fixed', 12, 26, 'p']],
      ['Each federal state (Bundesland) adds its own holidays']],
    FR: ['France', 'none', [['Jour de l’An', 'fixed', 1, 1, 'p'], ['Lundi de Pâques (Easter Monday)', 'easter', 1, 'p'], ['Fête du Travail', 'fixed', 5, 1, 'p'], ['Victoire 1945', 'fixed', 5, 8, 'p'], ['Ascension', 'easter', 39, 'p'], ['Lundi de Pentecôte', 'easter', 50, 'p'], ['Fête nationale', 'fixed', 7, 14, 'p'], ['Assomption', 'fixed', 8, 15, 'p'], ['Toussaint', 'fixed', 11, 1, 'p'], ['Armistice 1918', 'fixed', 11, 11, 'p'], ['Noël', 'fixed', 12, 25, 'p']],
      ['Alsace and Moselle also have Good Friday and 26 December']],
    IE: ['Ireland', 'next', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['St Brigid’s Day', 'brigid', 'p'], ['St Patrick’s Day', 'fixed', 3, 17, 'p'], ['Easter Monday', 'easter', 1, 'p'], ['May bank holiday', 'nth', 5, 1, 1, 'p'], ['June bank holiday', 'nth', 6, 1, 1, 'p'], ['August bank holiday', 'nth', 8, 1, 1, 'p'], ['October bank holiday', 'nth', 10, 1, -1, 'p'], ['Christmas Day', 'fixed', 12, 25, 'p'], ['St Stephen’s Day', 'fixed', 12, 26, 'p']],
      ['Good Friday is not a public holiday, though many businesses close']],
    GR: ['Greece', 'none', [['New Year’s Day', 'fixed', 1, 1, 'p'], ['Epiphany', 'fixed', 1, 6, 'p'], ['Clean Monday', 'orth', -48, 'p'], ['Independence Day', 'fixed', 3, 25, 'p'], ['Orthodox Good Friday', 'orth', -2, 'p'], ['Orthodox Easter Sunday', 'orth', 0, 'p'], ['Orthodox Easter Monday', 'orth', 1, 'p'], ['Labour Day', 'fixed', 5, 1, 'p'], ['Whit Monday (Orthodox)', 'orth', 50, 'p'], ['Assumption', 'fixed', 8, 15, 'p'], ['Ochi Day', 'fixed', 10, 28, 'p'], ['Christmas Day', 'fixed', 12, 25, 'p'], ['Synaxis of the Mother of God', 'fixed', 12, 26, 'p']], []],
    WW: ['Worldwide days', 'none', [['New Year’s Day', 'fixed', 1, 1, 'o'], ['Valentine’s Day', 'fixed', 2, 14, 'o'], ['International Women’s Day', 'fixed', 3, 8, 'o'], ['World Water Day', 'fixed', 3, 22, 'o'], ['World Health Day', 'fixed', 4, 7, 'o'], ['Easter Sunday', 'easter', 0, 'o'], ['Orthodox Easter', 'orth', 0, 'o'], ['Earth Day', 'fixed', 4, 22, 'o'], ['International Workers’ Day', 'fixed', 5, 1, 'o'], ['Mother’s Day (most countries)', 'nth', 5, 0, 2, 'o'], ['World Environment Day', 'fixed', 6, 5, 'o'], ['Father’s Day (most countries)', 'nth', 6, 0, 3, 'o'], ['International Yoga Day', 'fixed', 6, 21, 'o'], ['International Day of Peace', 'fixed', 9, 21, 'o'], ['World Teachers’ Day', 'fixed', 10, 5, 'o'], ['Halloween', 'fixed', 10, 31, 'o'], ['Human Rights Day', 'fixed', 12, 10, 'o'], ['Christmas', 'fixed', 12, 25, 'o'], ['New Year’s Eve', 'fixed', 12, 31, 'o']].concat(EID),
      ['Lunar (Chinese) New Year: between 21 January and 20 February', 'Holi: February or March', 'Passover: March or April', 'Vesak / Buddha Purnima: April or May', 'Rosh Hashanah: September or October', 'Diwali: October or November', 'Hanukkah: late November or December']]
  };
  function weekend(d) { var w = d.getUTCDay(); return w === 0 || w === 6; }
  // days off when a holiday falls on a weekend: us = Saturday→Friday, Sunday→Monday; next = next free weekday; sun = Sunday→Monday
  function substitutes(list, mode) {
    var taken = {}; list.forEach(function (x) { if (x.kind === 'p') taken[key(x.d)] = 1; });
    list.slice().sort(function (a, b) { return a.d - b.d; }).forEach(function (x) {
      if (x.kind !== 'p' || /approx/.test(x.name)) return;
      var w = x.d.getUTCDay(), o = null;
      if (mode === 'us' && w === 6) o = add(x.d, -1); else if (mode === 'us' && w === 0) o = add(x.d, 1);
      else if (mode === 'sun' && w === 0) o = add(x.d, 1);
      else if (mode === 'next' && weekend(x.d)) { o = add(x.d, 1); while (weekend(o) || taken[key(o)]) o = add(o, 1); }
      if (o) { x.obs = o; taken[key(o)] = 1; }
    });
    return list;
  }
  function holidays(code, y) {
    var c = C[code], out = [];
    c[2].forEach(function (r) { R[r[1]](y, r).forEach(function (d) { out.push({ name: r[0], d: d, kind: r[r.length - 1] }); }); });
    substitutes(out, c[1]);
    return out.sort(function (a, b) { return a.d - b.d || a.name.localeCompare(b.name); });
  }
  function ics(list, cname) {
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Infinity by GroupChatOn//Festivals//EN', 'CALSCALE:GREGORIAN'];
    list.forEach(function (x, i) { var d = x.obs || x.d, s = key(d).replace(/-/g, ''), e = key(add(d, 1)).replace(/-/g, ''); L.push('BEGIN:VEVENT', 'UID:' + s + '-' + i + '@infinity.groupchaton.com', 'DTSTAMP:' + s + 'T000000Z', 'DTSTART;VALUE=DATE:' + s, 'DTEND;VALUE=DATE:' + e, 'SUMMARY:' + (x.name + (x.obs ? ' (observed)' : '')).replace(/[,;]/g, ' '), 'DESCRIPTION:' + cname, 'END:VEVENT'); });
    L.push('END:VCALENDAR'); return L.join('\r\n');
  }
  var LANG = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-IN', reg = (LANG.split('-')[1] || '').toUpperCase();
  var country = T.select(Object.keys(C).map(function (k) { return [k, C[k][0]]; }), T.store.get('fest-country', C[reg] ? reg : 'IN')), year = h('input', { type: 'number', min: '1900', max: '2099', value: String(new Date().getFullYear()), 'aria-label': 'Year' });
  var showObs = h('input', { type: 'checkbox', checked: true }), list = h('div', { 'class': 'tlist', 'data-out': '', style: 'grid-template-columns:minmax(0,1fr)' }), moving = h('ul', { style: 'margin:0;padding-left:20px;display:grid;gap:4px' }), info = h('p', { 'class': 'tnote' }), cur = [];
  var KIND = { p: ['Public holiday', '#16a34a'], r: ['Some regions', '#d97706'], o: ['Observance', '#6366f1'] };
  function draw() {
    var y = Math.round(+year.value); if (!(y >= 1900 && y <= 2099)) { status.error('Choose a year between 1900 and 2099.'); return; }
    status.clear(); T.store.set('fest-country', country.value);
    var c = C[country.value], today = key(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())));
    cur = holidays(country.value, y).filter(function (x) { return showObs.checked || x.kind !== 'o'; });
    list.innerHTML = ''; var next = null;
    cur.forEach(function (x) {
      var k = key(x.d), days = Math.round((x.d - new Date(today + 'T00:00:00Z')) / 86400000), kd = KIND[x.kind];
      if (!next && days >= 0) next = x;
      list.appendChild(h('div', { 'class': 'titem', style: days < 0 ? 'opacity:.6' : '' }, [
        h('span', { 'class': 'titem-ic', style: 'flex-direction:column;width:46px;height:46px;font:700 15px/1 var(--ui)' }, [h('span', { text: String(x.d.getUTCDate()) }), h('small', { style: 'font-size:10px;font-weight:600', text: x.d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }) })]),
        h('span', { 'class': 'titem-main' }, [h('b', { text: x.name, style: 'white-space:normal' }), h('small', { text: x.d.toLocaleDateString(undefined, { weekday: 'long', timeZone: 'UTC' }) + (x.obs ? ' · day off on ' + x.obs.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) : '') + (days === 0 ? ' · today 🎉' : days > 0 ? ' · in ' + days + (days === 1 ? ' day' : ' days') : '') })]),
        h('span', { style: 'font-size:11.5px;font-weight:700;color:' + kd[1] + ';white-space:nowrap', text: kd[0] })]));
    });
    moving.innerHTML = '';
    c[3].forEach(function (m) { moving.appendChild(h('li', { text: m })); });
    if (!c[3].length) moving.appendChild(h('li', { text: 'All the main holidays above are worked out for you.' }));
    info.textContent = c[0] + ' · ' + y + ' · ' + cur.length + ' dates' + (next && y === new Date().getFullYear() ? ' · next: ' + next.name + ' on ' + next.d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', timeZone: 'UTC' }) : '') + '.';
  }
  [country, year, showObs].forEach(function (x) { x.addEventListener('change', draw); });
  year.addEventListener('input', function () { if (+year.value >= 1900 && +year.value <= 2099) draw(); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Country', country), T.field('Year', year)]), h('label', { 'class': 'tcheck' }, [showObs, ' Include observances (Mother’s Day, Halloween…)']),
    T.row([T.button('Add to my calendar (.ics)', { primary: true, onclick: function () { T.download(new Blob([ics(cur, C[country.value][0])], { type: 'text/calendar;charset=utf-8' }), 'holidays-' + country.value.toLowerCase() + '-' + year.value + '.ics'); } }),
      T.button('Try a sample', { small: true, onclick: function () { country.value = 'US'; year.value = '2026'; draw(); } })]), status.el, info, list,
    h('b', { text: '🌙 Festivals that follow the moon or a local calendar: check the exact date locally' }), moving,
    h('p', { 'class': 'tnote', text: 'Dates marked “approx.” use the standard arithmetic Islamic calendar and can differ by a day or two from the moon-sighting date announced in your country. Governments sometimes add or move holidays, so confirm important dates with an official source.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['festival-calendar'] = function () {
    var f = [];
    [[2024, '2024-03-31'], [2025, '2025-04-20'], [2026, '2026-04-05'], [2027, '2027-03-28'], [2000, '2000-04-23']].forEach(function (x) { if (key(easter(x[0])) !== x[1]) f.push('easter ' + x[0] + ' ' + key(easter(x[0]))); });
    if (key(orthodox(2025)) !== '2025-04-20' || key(orthodox(2026)) !== '2026-04-12') f.push('orthodox ' + key(orthodox(2026)));
    function find(c, y, n) { return holidays(c, y).filter(function (x) { return x.name === n; })[0]; }
    if (key(find('US', 2026, 'Thanksgiving').d) !== '2026-11-26') f.push('thanksgiving');
    if (key(find('US', 2026, 'Memorial Day').d) !== '2026-05-25') f.push('memorial');
    if (key(find('US', 2026, 'Independence Day').obs) !== '2026-07-03') f.push('us observed');
    if (key(find('GB', 2026, 'Spring bank holiday').d) !== '2026-05-25') f.push('uk spring');
    var x = find('GB', 2027, 'Christmas Day'), b = find('GB', 2027, 'Boxing Day');
    if (key(x.obs) !== '2027-12-27' || key(b.obs) !== '2027-12-28') f.push('uk substitutes ' + key(x.obs) + ' ' + key(b.obs));
    if (key(find('CA', 2026, 'Victoria Day').d) !== '2026-05-18') f.push('victoria');
    if (key(find('IE', 2030, 'St Brigid’s Day').d) !== '2030-02-01' || key(find('IE', 2026, 'St Brigid’s Day').d) !== '2026-02-02') f.push('brigid');
    var eid = find('AE', 2025, 'Eid al-Fitr (approx.)').d, gap = Math.abs((eid - U(2025, 3, 30)) / 86400000);
    if (gap > 2) f.push('eid 2025 ' + key(eid));
    if (Math.abs((find('SA', 2026, 'Ramadan begins (approx.)').d - U(2026, 2, 18)) / 86400000) > 2) f.push('ramadan 2026');
    if (islamic(2033, 10, 1).length !== 2) f.push('two Eids in 2033');
    if (ics([{ name: 'Test, day', d: U(2026, 1, 1) }], 'X').indexOf('DTSTART;VALUE=DATE:20260101') < 0) f.push('ics');
    return Promise.resolve({ ok: !f.length, n: 15, fails: f });
  };
});
