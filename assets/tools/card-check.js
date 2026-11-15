/* Infinity by GroupChatOn — card-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Card number check: the Luhn checksum and the card network (Visa, Mastercard, RuPay, Amex…), done on the device only. */
GCOTools.register('card-check', function (spot, T) {
  function luhn(d) { var s = 0; for (var i = 0; i < d.length; i++) { var x = +d[d.length - 1 - i]; if (i % 2) { x *= 2; if (x > 9) x -= 9; } s += x; } return s % 10 === 0; }
  function brand(d) {
    var p2 = +d.slice(0, 2), p4 = +d.slice(0, 4), p6 = +d.slice(0, 6);
    if (/^3[47]/.test(d)) return ['American Express', [15]];
    if (/^(508[5-9]|60698[5-9]|60699|607[0-9]|608[0-4]|6521[5-9]|652[2-9]|653[0-1]|81[0-9]{2}|82[0-9]{2})/.test(d)) return ['RuPay', [16]];
    if (/^4/.test(d)) return ['Visa', [13, 16, 19]];
    if ((p2 >= 51 && p2 <= 55) || (p4 >= 2221 && p4 <= 2720)) return ['Mastercard', [16]];
    if (/^(6011|65|64[4-9])/.test(d) || (p6 >= 622126 && p6 <= 622925)) return ['Discover', [16, 19]];
    if (/^35(2[89]|[3-8])/.test(d)) return ['JCB', [16, 19]];
    if (/^(36|38|30[0-5])/.test(d)) return ['Diners Club', [14, 16]];
    if (/^62/.test(d)) return ['UnionPay', [16, 17, 18, 19]];
    if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(d)) return ['Maestro', [12, 13, 14, 15, 16, 17, 18, 19]];
    return ['Unknown network', []];
  }
  function one(line) {
    var d = line.replace(/[\s\-]/g, '');
    if (!d) return '';
    if (!/^\d+$/.test(d)) return line.trim() + ' → only digits, spaces and dashes';
    var b = brand(d), ok = luhn(d), lenOk = !b[1].length || b[1].indexOf(d.length) >= 0;
    var shown = d.replace(/(\d{4})(?=\d)/g, '$1 ');
    return shown + ' → ' + (ok && lenOk && d.length >= 12 ? '✓ valid number' : '✗ not a valid number') + ' · ' + b[0] + ' · ' + d.length + ' digits' + (ok ? '' : ' · checksum fails (a digit is wrong or swapped)') + (lenOk ? '' : ' · wrong length for ' + b[0]);
  }
  T.transformer(spot, { id: 'card-check', inLabel: 'Card numbers (one per line)', mono: true, sample: '4111 1111 1111 1111\n5500 0000 0000 0004\n3782 822463 10005\n4111 1111 1111 1112',
    note: function () { return 'This only checks the number is well-formed. It cannot tell if a card is real, active or has money. Never share your CVV or OTP with anyone.'; },
    run: function (t) { return t.split(/\r?\n/).map(one).join('\n'); } });
  T.tests['card-check'] = function () {
    var f = [];
    [['4111111111111111', '✓', 'Visa'], ['5500000000000004', '✓', 'Mastercard'], ['378282246310005', '✓', 'American Express'], ['4111111111111112', '✗', 'Visa'], ['6521 5000 0000 0008', '', 'RuPay']].forEach(function (c) {
      var r = one(c[0]); if ((c[1] && r.indexOf(c[1]) < 0) || r.indexOf(c[2]) < 0) f.push(c[0] + ' → ' + r);
    });
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
