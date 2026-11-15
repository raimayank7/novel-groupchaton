/* HTML Entities Encode / Decode — &lt; &amp; &quot; and named or numbered entities, both ways.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('html-entities', function (spot, T) {
  var mode = T.seg([['enc', 'Encode'], ['dec', 'Decode']], 'enc');
  mode.setAttribute('data-opt', 'mode');
  T.transformer(spot, { id: 'html-entities', inLabel: 'Text or HTML', mono: true, rows: 7, sample: '<a href="x">Tom & Jerry’s © 2026 — ₹500</a>',
    options: [mode, T.opt.check('all', 'Also encode every non-English character (&#8377; style)')],
    run: function (t, o) {
      if (o.mode === 'dec') { var d = new DOMParser().parseFromString('<!doctype html><body>' + t.replace(/</g, '&lt;'), 'text/html'); return d.body.textContent; }
      var s = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      return o.all ? Array.from(s).map(function (c) { var k = c.codePointAt(0); return k > 126 ? '&#' + k + ';' : c; }).join('') : s;
    } });
});
