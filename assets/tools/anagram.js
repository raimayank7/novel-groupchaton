/* Infinity by GroupChatOn — anagram. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Anagram solver and word unscrambler: find every English word from your letters (with blanks), check whether two phrases are anagrams. */
GCOTools.register('anagram', function (spot, T) {
  var h = T.h, status = T.status(), WORDS = null;
  var LIST = 'https://cdn.jsdelivr.net/npm/an-array-of-english-words@2.0.0/index.json';
  function count(s) { var c = {}; Array.from(s.toLowerCase().replace(/[^a-z]/g, '')).forEach(function (x) { c[x] = (c[x] || 0) + 1; }); return c; }
  function isAnagram(a, b) { var x = a.toLowerCase().replace(/[^a-z]/g, '').split('').sort().join(''), y = b.toLowerCase().replace(/[^a-z]/g, '').split('').sort().join(''); return !!x && x === y; }
  function solve(letters, words, o) {
    var have = count(letters), blanks = (letters.match(/[?*]/g) || []).length, total = letters.replace(/[^a-z?*]/gi, '').length, out = [];
    words.forEach(function (w) {
      if (w.length < o.min || w.length > total || (o.exact && w.length !== total)) return;
      if (o.start && w.indexOf(o.start) !== 0) return; if (o.has && w.indexOf(o.has) < 0) return; if (o.end && w.slice(-o.end.length) !== o.end) return;
      var need = 0, c = {};
      for (var i = 0; i < w.length; i++) { var ch = w[i]; c[ch] = (c[ch] || 0) + 1; if (c[ch] > (have[ch] || 0)) { need++; if (need > blanks) return; } }
      out.push(w);
    });
    return out.sort(function (a, b) { return b.length - a.length || (a < b ? -1 : 1); });
  }
  function load() {
    if (WORDS) return Promise.resolve(WORDS);
    status.info('Loading the English word list (about 0.8 MB, once)…');
    return fetch(LIST).then(function (r) { if (!r.ok) throw new Error('Could not load the word list. Check your connection.'); return r.json(); }).then(function (w) { WORDS = w.filter(function (x) { return /^[a-z]+$/.test(x); }); return WORDS; });
  }
  var letters = h('input', { type: 'text', placeholder: 'Your letters, e.g. LISTEN or TR?EAS (? = blank tile)', 'class': 'tbig', 'aria-label': 'Letters', style: 'text-transform:uppercase;letter-spacing:2px' });
  var min = h('input', { type: 'number', min: '2', max: '15', value: '3' }), start = h('input', { type: 'text', placeholder: 'e.g. st' }), has = h('input', { type: 'text', placeholder: 'e.g. ea' }), end = h('input', { type: 'text', placeholder: 'e.g. ing' }), exact = h('input', { type: 'checkbox' });
  var out = h('div', { 'data-out': '', style: 'display:grid;gap:10px' });
  function go() {
    var l = letters.value.trim();
    if (l.replace(/[^a-z?*]/gi, '').length < 2) { status.error('Type at least 2 letters.'); return; }
    if (l.replace(/[^a-z?*]/gi, '').length > 15) { status.error('Use up to 15 letters.'); return; }
    load().then(function (w) {
      var r = solve(l.toLowerCase(), w, { min: +min.value || 2, start: start.value.trim().toLowerCase(), has: has.value.trim().toLowerCase(), end: end.value.trim().toLowerCase(), exact: exact.checked });
      out.innerHTML = '';
      var by = {}; r.forEach(function (x) { (by[x.length] = by[x.length] || []).push(x); });
      Object.keys(by).sort(function (a, b) { return b - a; }).forEach(function (n) {
        out.appendChild(h('div', {}, [h('b', { text: n + ' letters (' + by[n].length + ')' }), h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin-top:6px' }, by[n].slice(0, 300).map(function (x) {
          return h('button', { type: 'button', 'class': 'tbtn tbtn-sm', text: x, onclick: function (e) { T.copy(x, e.currentTarget); } }); }))]));
      });
      if (r.length) status.ok(r.length + ' word' + (r.length > 1 ? 's' : '') + ' found. Tap a word to copy it.'); else status.info('No English words use only these letters. Try fewer filters or add a ? blank.');
    }).catch(status.error);
  }
  letters.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  var a = h('input', { type: 'text', value: 'Dormitory' }), b = h('input', { type: 'text', value: 'Dirty room' }), verdict = h('p', { 'class': 'tstatus' });
  function check() { var ok = isAnagram(a.value, b.value); verdict.className = 'tstatus is-' + (ok ? 'ok' : 'error'); verdict.textContent = ok ? '✓ Yes, these are anagrams: they use exactly the same letters.' : '✕ Not anagrams.'; }
  [a, b].forEach(function (x) { x.addEventListener('input', check); });
  spot.appendChild(T.card([T.field('Letters', letters), h('div', { 'class': 'tgrid2' }, [T.field('Shortest word', min), T.field('Starts with', start), T.field('Contains', has), T.field('Ends with', end)]),
    h('label', { 'class': 'tcheck' }, [exact, ' Use all letters (true anagrams only)']), T.row([T.button('Find words', { primary: true, onclick: go })]), status.el, out,
    h('h3', { text: 'Are these two anagrams?' }), h('div', { 'class': 'tgrid2' }, [a, b]), verdict]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  check();
  T.tests['anagram'] = function () {
    var f = [], w = ['listen', 'silent', 'enlist', 'tinsel', 'inlets', 'list', 'tin', 'apple', 'sit', 'lens', 'tile'];
    if (solve('listen', w, { min: 6, exact: true }).join() !== 'enlist,inlets,listen,silent,tinsel') f.push('exact ' + solve('listen', w, { min: 6, exact: true }).join());
    if (solve('lis?', w, { min: 3 }).join() !== 'list,sit') f.push('blank ' + solve('lis?', w, { min: 3 }).join());
    if (solve('listen', w, { min: 3, start: 'li' }).join() !== 'listen,list') f.push('starts');
    if (!isAnagram('Dormitory', 'Dirty room!') || isAnagram('abc', 'abd') || isAnagram('', '')) f.push('isAnagram');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
