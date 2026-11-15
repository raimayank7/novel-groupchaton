/* Word Counter — words, characters, sentences, paragraphs, reading and speaking time, top words.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('word-count', function (spot, T) {
  var h = T.h;
  var text = h('textarea', { rows: '10', placeholder: 'Type or paste your text here…', 'aria-label': 'Text to count' });
  text.value = T.store.get('word-count', '');
  var tiles = {}, names = [['words', 'Words'], ['chars', 'Characters'], ['nospace', 'Characters (no spaces)'], ['sentences', 'Sentences'],
    ['paras', 'Paragraphs'], ['read', 'Reading time'], ['speak', 'Speaking time'], ['avg', 'Avg. word length']];
  var stats = h('div', { 'class': 'tstats' }, names.map(function (n) { tiles[n[0]] = h('b', { text: '0' }); return h('div', { 'class': 'tstat' }, [tiles[n[0]], h('span', { text: n[1] })]); }));
  var top = h('p', { 'class': 'tstatus' });
  var copy = T.button('Copy text', { onclick: function () { T.copy(text.value, copy); } });
  spot.appendChild(T.card([text, stats, h('div', {}, [h('h3', { text: 'Most used words' }), top]), T.row([copy, T.button('Clear', { onclick: function () { text.value = ''; count(); } })])]));
  var STOP = ' the a an and or but of to in on at for with is are was were be been it its this that as by from he she they we you i his her their our your not no so if then there';
  function mins(words, wpm) { var m = words / wpm; return m < 1 ? Math.max(1, Math.round(m * 60)) + ' sec' : Math.round(m) + ' min'; }
  function count() {
    var t = text.value;
    T.store.set('word-count', t.slice(0, 50000));
    var words = (t.match(/[\p{L}\p{N}'’-]+/gu) || []);
    var n = words.length;
    tiles.words.textContent = n.toLocaleString();
    tiles.chars.textContent = t.length.toLocaleString();
    tiles.nospace.textContent = t.replace(/\s/g, '').length.toLocaleString();
    tiles.sentences.textContent = ((t.match(/[^.!?।]+[.!?।]+/g) || []).length || (t.trim() ? 1 : 0)).toLocaleString();
    tiles.paras.textContent = t.split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length.toLocaleString();
    tiles.read.textContent = n ? mins(n, 230) : '0 sec';
    tiles.speak.textContent = n ? mins(n, 140) : '0 sec';
    tiles.avg.textContent = n ? (words.join('').length / n).toFixed(1) : '0';
    var freq = {};
    words.forEach(function (w) { w = w.toLowerCase(); if (w.length > 2 && STOP.indexOf(' ' + w + ' ') < 0) freq[w] = (freq[w] || 0) + 1; });
    var best = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 10);
    top.textContent = best.length ? best.map(function (w) { return w + ' (' + freq[w] + ')'; }).join(' · ') : 'Start typing to see them.';
  }
  text.addEventListener('input', count);
  count();
});
