/* Infinity by GroupChatOn — wa-number-format. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Phone number formatter: cleans a messy list into WhatsApp-ready international numbers, checks lengths and removes duplicates. */
GCOTools.register('wa-number-format', function (spot, T) {
  var h = T.h;
  // country code → [local length(s), pattern for a valid mobile]
  var C = { '91': [[10], /^[6-9]/, 'India'], '92': [[10], /^3/, 'Pakistan'], '880': [[10], /^1/, 'Bangladesh'], '977': [[10], /^9/, 'Nepal'], '94': [[9], /^7/, 'Sri Lanka'],
    '971': [[9], /^5/, 'UAE'], '966': [[9], /^5/, 'Saudi Arabia'], '974': [[8], /^[3567]/, 'Qatar'], '965': [[8], /^[569]/, 'Kuwait'], '968': [[8], /^[79]/, 'Oman'],
    '1': [[10], /^[2-9]/, 'USA / Canada'], '44': [[10], /^7/, 'UK'], '61': [[9], /^4/, 'Australia'], '65': [[8], /^[89]/, 'Singapore'], '60': [[9, 10], /^1/, 'Malaysia'] };
  var cc = T.select(Object.keys(C).map(function (k) { return [k, C[k][2] + ' (+' + k + ')']; }), T.store.get('wa-cc', '91'));
  var list = h('textarea', { rows: '7', 'aria-label': 'Numbers' }); list.value = '098765 43210\n+91-98765-43210\n9876543211\n(971) 50 123 4567\n12345\n+44 7911 123456';
  var plus = h('input', { type: 'checkbox', checked: true }), out = h('textarea', { rows: '7', readonly: true, 'aria-label': 'Clean numbers' }), report = h('div', { 'class': 'tu-all' }), res = [];
  function clean(raw) {
    var intl = /^\s*(\+|00)/.test(raw), n = raw.replace(/\D/g, '');
    if (/^00/.test(n)) n = n.slice(2);
    if (!intl) {
      var local = n.replace(/^0+/, ''), d = C[cc.value];
      if (d[0].indexOf(local.length) >= 0) n = cc.value + local;
      else { var known = Object.keys(C).filter(function (k) { return n.indexOf(k) === 0 && C[k][0].indexOf(n.length - k.length) >= 0; })[0]; if (!known) n = cc.value + local; }
    }
    var code = Object.keys(C).sort(function (a, b) { return b.length - a.length; }).filter(function (k) { return n.indexOf(k) === 0; })[0], why = '';
    if (n.length < 8 || n.length > 15) why = 'wrong length';
    else if (code && C[code][0].indexOf(n.length - code.length) < 0) why = 'wrong length for ' + C[code][2];
    else if (code && !C[code][1].test(n.slice(code.length))) why = 'not a mobile number in ' + C[code][2] + '?';
    return { raw: raw.trim(), num: n, ok: !why, why: why };
  }
  function draw() {
    T.store.set('wa-cc', cc.value);
    var seen = {}; res = [];
    list.value.split(/[\n,;]+/).forEach(function (l) { if (!l.trim()) return; var r = clean(l); if (seen[r.num]) r.dup = true; seen[r.num] = 1; res.push(r); });
    out.value = res.filter(function (r) { return r.ok && !r.dup; }).map(function (r) { return (plus.checked ? '+' : '') + r.num; }).join('\n');
    report.innerHTML = '';
    report.appendChild(h('table', {}, [h('tbody', {}, res.map(function (r) { return h('tr', {}, [h('th', { text: r.raw }), h('td', { text: r.dup ? 'duplicate' : r.ok ? '+' + r.num + ' ✓' : r.why })]); }))]));
  }
  [cc, list, plus].forEach(function (e) { e.addEventListener('input', draw); e.addEventListener('change', draw); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Country for numbers without a code', cc), h('label', { 'class': 'tcheck' }, [plus, ' Start with +'])]),
    T.field('Paste numbers (any format, one per line)', list), T.field('Clean, unique numbers', out),
    T.row([T.button('Copy', { primary: true, onclick: function (e) { T.copy(out.value, e.currentTarget); } }), T.button('Download CSV', { onclick: function () { T.download(new Blob(['Number\n' + out.value], { type: 'text/csv' }), 'numbers.csv'); } })]),
    h('h3', { text: 'Check each number' }), report]));
  draw();
  T.tests['wa-number-format'] = function () {
    cc.value = '91'; plus.checked = true; list.value = '098765 43210\n+91-98765-43210\n9876543211\n+971 50 123 4567\n12345\n+44 7911 123456\n919876543212\n+91 1234567890'; draw();
    var fails = [], want = '+919876543210\n+919876543211\n+971501234567\n+447911123456\n+919876543212';
    if (out.value !== want) fails.push('got ' + JSON.stringify(out.value));
    if (!res[1].dup) fails.push('duplicate not found');
    if (res[4].ok || res[7].ok) fails.push('bad numbers accepted');
    return Promise.resolve({ ok: !fails.length, n: 3, fails: fails });
  };
});
