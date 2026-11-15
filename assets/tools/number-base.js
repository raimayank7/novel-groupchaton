/* Number Base Converter — binary, octal, decimal, hexadecimal and any base 2–36, for numbers of any size.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('number-base', function (spot, T) {
  var h = T.h, DIG = '0123456789abcdefghijklmnopqrstuvwxyz';
  function parse(s, base) {
    s = s.trim().toLowerCase().replace(/[\s_]/g, '');
    var neg = s[0] === '-'; if (neg) s = s.slice(1);
    if (base === 16) s = s.replace(/^0x/, ''); else if (base === 2) s = s.replace(/^0b/, ''); else if (base === 8) s = s.replace(/^0o/, '');
    if (!s) return null;
    var B = BigInt(base), v = 0n;
    for (var i = 0; i < s.length; i++) {
      var d = DIG.indexOf(s[i]);
      if (d < 0 || d >= base) throw new Error('“' + s[i] + '” is not a digit in base ' + base + '.');
      v = v * B + BigInt(d);
    }
    return neg ? -v : v;
  }
  function show(v, base) {
    var neg = v < 0n; if (neg) v = -v;
    var s = v.toString(base);
    return (neg ? '-' : '') + s;
  }
  var fields = [[2, 'Binary (base 2)'], [8, 'Octal (base 8)'], [10, 'Decimal (base 10)'], [16, 'Hexadecimal (base 16)']];
  var inputs = {}, status = T.status();
  var custom = h('input', { type: 'number', min: '2', max: '36', value: '36', style: 'max-width:90px', 'aria-label': 'Custom base' });
  var customOut = h('input', { type: 'text', 'class': 'tmono', 'aria-label': 'Number in custom base' });
  var grid = h('div', { 'class': 'tgrid2' });
  fields.forEach(function (f) {
    var inp = h('input', { type: 'text', 'class': 'tmono', spellcheck: 'false', 'aria-label': f[1] });
    inp.addEventListener('input', function () { from(f[0], inp.value); });
    inputs[f[0]] = inp; grid.appendChild(T.field(f[1], inp));
  });
  customOut.addEventListener('input', function () { from(+custom.value, customOut.value); });
  custom.addEventListener('input', function () { from(10, inputs[10].value); });
  spot.appendChild(T.card([h('p', { 'class': 'tstatus', text: 'Type in any box; the others update.' }), grid,
    h('div', { 'class': 'tgrid2' }, [T.field('Any base (2–36)', custom), T.field('Number in that base', customOut)]), status.el]));
  function from(base, text) {
    var v;
    try { v = parse(text, base); } catch (e) { status.error(e); return; }
    status.clear();
    fields.forEach(function (f) { if (f[0] !== base || document.activeElement !== inputs[f[0]]) inputs[f[0]].value = v == null ? '' : show(v, f[0]); });
    var cb = Math.max(2, Math.min(36, +custom.value || 36));
    if (document.activeElement !== customOut) customOut.value = v == null ? '' : show(v, cb);
    if (v != null) status.info(v.toString(2).replace('-', '').length + ' bits');
  }
  inputs[10].value = '255'; from(10, '255');
});
