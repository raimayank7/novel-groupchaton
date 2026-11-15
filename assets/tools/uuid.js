/* UUID Generator — random version-4 UUIDs (GUIDs), one or thousands, from the browser's secure random generator.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('uuid', function (spot, T) {
  var h = T.h;
  function v4() {
    if (crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var x = Array.from(b, function (n) { return ('0' + n.toString(16)).slice(-2); }).join('');
    return x.slice(0, 8) + '-' + x.slice(8, 12) + '-' + x.slice(12, 16) + '-' + x.slice(16, 20) + '-' + x.slice(20);
  }
  var n = h('input', { type: 'number', min: '1', max: '10000', value: '5' });
  var upper = h('input', { type: 'checkbox' }), dash = h('input', { type: 'checkbox', checked: true }), braces = h('input', { type: 'checkbox' });
  var out = h('textarea', { rows: '10', readonly: true, 'class': 'tmono', 'aria-label': 'UUIDs' });
  var copy = T.button('Copy all', { onclick: function () { T.copy(out.value, copy); } });
  var dl = T.button('Download', { onclick: function () { T.download(new Blob([out.value], { type: 'text/plain' }), 'uuids.txt'); } });
  spot.appendChild(T.card([h('div', { 'class': 'topts' }, [T.field('How many', n), h('label', { 'class': 'tcheck' }, [upper, ' UPPERCASE']),
    h('label', { 'class': 'tcheck' }, [dash, ' With hyphens']), h('label', { 'class': 'tcheck' }, [braces, ' In {braces}'])]),
    T.row([T.button('Generate', { primary: true, onclick: make }), copy, dl]), out]));
  function make() {
    var k = Math.max(1, Math.min(10000, Math.floor(+n.value || 1))), list = [];
    for (var i = 0; i < k; i++) {
      var u = v4();
      if (!dash.checked) u = u.replace(/-/g, '');
      if (upper.checked) u = u.toUpperCase();
      list.push(braces.checked ? '{' + u + '}' : u);
    }
    out.value = list.join('\n');
  }
  [n, upper, dash, braces].forEach(function (x) { x.addEventListener('change', make); });
  make();
});
