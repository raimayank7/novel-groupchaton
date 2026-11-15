/* Lorem Ipsum Generator — paragraphs, sentences or words of placeholder text, plain or as HTML.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('lorem', function (spot, T) {
  var h = T.h;
  var WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam ' +
    'quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla ' +
    'pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nunc ' +
    'pulvinar sapien vitae mauris faucibus ornare suspendisse sed nisi lacus viverra accumsan facilisis morbi tristique senectus netus malesuada fames ac turpis egestas').split(' ');
  var n = h('input', { type: 'number', min: '1', max: '500', value: '3' });
  var what = T.seg([['p', 'Paragraphs'], ['s', 'Sentences'], ['w', 'Words']], 'p', make);
  var start = h('input', { type: 'checkbox', checked: true }), asHtml = h('input', { type: 'checkbox' });
  var out = h('textarea', { rows: '10', readonly: true, 'aria-label': 'Placeholder text' });
  var copy = T.button('Copy', { onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([h('div', { 'class': 'topts' }, [T.field('How many', n), what,
    h('label', { 'class': 'tcheck' }, [start, ' Start with “Lorem ipsum dolor sit amet”']), h('label', { 'class': 'tcheck' }, [asHtml, ' As HTML (<p> tags)'])]),
    T.row([T.button('Generate new text', { primary: true, onclick: make }), copy]), out]));
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function words(k) { var w = []; for (var i = 0; i < k; i++) w.push(WORDS[rnd(0, WORDS.length - 1)]); return w; }
  function sentence() {
    var w = words(rnd(7, 15));
    if (w.length > 8) w[rnd(3, w.length - 4)] += ',';
    var s = w.join(' ');
    return s.charAt(0).toUpperCase() + s.slice(1) + '.';
  }
  function para() { var s = []; for (var i = rnd(4, 7); i > 0; i--) s.push(sentence()); return s.join(' '); }
  function make() {
    var k = Math.max(1, Math.min(500, Math.floor(+n.value || 1))), kind = what.value(), parts = [], i;
    if (kind === 'w') parts = [words(k).join(' ')];
    else if (kind === 's') { var s = []; for (i = 0; i < k; i++) s.push(sentence()); parts = [s.join(' ')]; }
    else for (i = 0; i < k; i++) parts.push(para());
    if (start.checked) {
      var lead = 'Lorem ipsum dolor sit amet' + (kind === 'w' ? '' : ', consectetur adipiscing elit.');
      if (kind === 'w') { var ws = parts[0].split(' '); parts[0] = lead.split(' ').concat(ws).slice(0, Math.max(k, 1)).join(' '); }
      else parts[0] = lead + ' ' + parts[0].replace(/^[^.]*\.\s*/, '');
    }
    if (kind === 'w') parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    out.value = asHtml.checked ? parts.map(function (p) { return '<p>' + p + '</p>'; }).join('\n') : parts.join('\n\n');
  }
  [n, start, asHtml].forEach(function (x) { x.addEventListener('change', make); });
  make();
});
