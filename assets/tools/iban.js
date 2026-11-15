/* Infinity by GroupChatOn — iban. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* IBAN validator: country, length and the mod-97 check, with the number shown in groups of four. */
GCOTools.register('iban', function (spot, T) {
  var LEN = { AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27,
    GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24,
    ME: 22, MK: 19, MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23, TN: 24,
    TR: 26, UA: 29, VA: 22, VG: 24, XK: 20 };
  function mod97(s) { var r = 0; for (var i = 0; i < s.length; i++) r = (r * 10 + +s[i]) % 97; return r; }
  function check(raw) {
    var s = raw.replace(/[\s\-]/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s)) return { ok: false, s: s, why: 'should start with 2 letters and 2 digits, then letters and digits' };
    var c = s.slice(0, 2), want = LEN[c];
    if (!want) return { ok: false, s: s, why: c + ' does not use IBANs (or is not a country code)' };
    if (s.length !== want) return { ok: false, s: s, why: 'an IBAN from ' + c + ' has ' + want + ' characters, this has ' + s.length };
    var num = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, function (x) { return String(x.charCodeAt(0) - 55); });
    return mod97(num) === 1 ? { ok: true, s: s } : { ok: false, s: s, why: 'check digits do not match: a character is wrong or two are swapped' };
  }
  var names = window.Intl && Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
  function one(line) {
    if (!line.trim()) return '';
    var r = check(line), g = r.s.replace(/(.{4})(?=.)/g, '$1 '), c = r.s.slice(0, 2), n = names && LEN[c] ? ' · ' + names.of(c) : '';
    return g + ' → ' + (r.ok ? '✓ valid IBAN' + n : '✗ ' + r.why);
  }
  T.transformer(spot, { id: 'iban', inLabel: 'IBANs (one per line)', mono: true, sample: 'GB82 WEST 1234 5698 7654 32\nDE89 3704 0044 0532 0130 00\nAE07 0331 2345 6789 0123 456\nGB82 WEST 1234 5698 7654 33',
    note: function () { return 'Checks the format and check digits only. It does not contact any bank, and it cannot tell if the account exists.'; },
    run: function (t) { return t.split(/\r?\n/).map(one).join('\n'); } });
  T.tests['iban'] = function () {
    var f = [];
    [['GB82WEST12345698765432', true], ['de89 3704 0044 0532 0130 00', true], ['AE070331234567890123456', true], ['GB82WEST12345698765433', false], ['GB82WEST1234569876543', false], ['IN12ABCD', false]].forEach(function (c) {
      if (check(c[0]).ok !== c[1]) f.push(c[0] + ' → ' + JSON.stringify(check(c[0])));
    });
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
