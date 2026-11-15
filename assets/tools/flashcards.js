/* Infinity by GroupChatOn — flashcards. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Flashcards: type or paste "question | answer" lines, then study with flip cards; cards you miss come back until you know them all. */
GCOTools.register('flashcards', function (spot, T) {
  var h = T.h, status = T.status();
  var SAMPLE = 'France | Paris\nJapan | Tokyo\nIndia | New Delhi\nBrazil | Brasília\nCanada | Ottawa\nAustralia | Canberra\nEgypt | Cairo\nKenya | Nairobi\nGermany | Berlin\nSouth Korea | Seoul';
  function parse(text) {
    return String(text || '').split(/\r?\n/).map(function (l) {
      l = l.trim(); if (!l) return null;
      var seps = ['\t', ' | ', '|', ' = ', ' – ', ' - ', ': ', ';'];
      for (var i = 0; i < seps.length; i++) { var k = l.indexOf(seps[i]); if (k > 0) { var a = l.slice(0, k).trim(), b = l.slice(k + seps[i].length).trim(); if (a && b) return { f: a, b: b }; } }
      return null;
    }).filter(Boolean);
  }
  function rnd(n) { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function answer(q, knew) {   // q: queue of card indexes; returns the new queue
    q = q.slice(); var c = q.shift();
    if (!knew) q.splice(Math.min(3, q.length), 0, c);   // missed cards come back after a few others
    return q;
  }
  var decks = T.store.get('flash-decks', {}), name = h('input', { type: 'text', placeholder: 'Deck name, e.g. Biology chapter 3', value: T.store.get('flash-last', '') });
  var box = h('textarea', { rows: '8', 'class': 'tmono', placeholder: 'One card per line:  question | answer\nAlso works with a tab, “ = ”, “ - ” or “: ” between them.', 'aria-label': 'Cards' });
  box.value = decks[name.value] || '';
  var pickDeck = h('select', { 'aria-label': 'Saved decks' });
  function drawDecks() { pickDeck.innerHTML = ''; pickDeck.appendChild(h('option', { value: '', text: Object.keys(decks).length ? 'Open a saved deck…' : 'No saved decks yet' })); Object.keys(decks).sort().forEach(function (k) { pickDeck.appendChild(h('option', { value: k, text: k })); }); }
  pickDeck.addEventListener('change', function () { if (pickDeck.value) { name.value = pickDeck.value; box.value = decks[pickDeck.value]; T.store.set('flash-last', name.value); status.clear(); } });
  var rev = h('input', { type: 'checkbox' }), cards = [], q = [], known = 0, misses = 0, flipped = false;
  var face = h('div', { 'data-out': '', role: 'button', tabindex: '0', 'aria-live': 'polite', style: 'display:grid;place-items:center;min-height:200px;padding:20px;border-radius:18px;border:2px solid var(--line);background:var(--bg);font:700 clamp(22px,6vw,34px)/1.3 var(--ui);text-align:center;cursor:pointer;overflow-wrap:anywhere;user-select:none' });
  var prog = h('p', { 'class': 'tnote', style: 'text-align:center' });
  var yes = T.button('✓ Knew it', { primary: true, onclick: function () { mark(true); } }), no = T.button('✗ Not yet', { onclick: function () { mark(false); } });
  var study = h('div', { style: 'display:grid;gap:12px', hidden: true }, [face, T.row([no, yes, T.button('Flip', { small: true, onclick: flip })]), prog]);
  function show() {
    if (!q.length) { face.textContent = '🎉 All ' + cards.length + ' cards known!'; prog.textContent = misses ? 'You missed ' + misses + ' times along the way. Press Start to go again.' : 'Perfect round. Press Start to go again.'; yes.disabled = no.disabled = true; return; }
    var c = cards[q[0]]; flipped = false; yes.disabled = no.disabled = false;
    face.textContent = rev.checked ? c.b : c.f; face.style.borderColor = 'var(--line)';
    prog.textContent = 'Known ' + known + ' of ' + cards.length + ' · ' + q.length + ' left · tap the card to flip';
  }
  function flip() { if (!q.length) return; var c = cards[q[0]]; flipped = !flipped; face.textContent = flipped ? (rev.checked ? c.f : c.b) : (rev.checked ? c.b : c.f); face.style.borderColor = flipped ? 'var(--accent)' : 'var(--line)'; }
  function mark(k) { if (!q.length) return; if (k) known++; else misses++; q = answer(q, k); show(); }
  face.addEventListener('click', flip);
  face.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } else if (e.key === 'ArrowRight') mark(true); else if (e.key === 'ArrowLeft') mark(false); });
  function begin() {
    cards = parse(box.value);
    if (!cards.length) return status.error('No cards found. Write one card per line like:  question | answer');
    status.clear(); q = shuffle(cards.map(function (c, i) { return i; })); known = 0; misses = 0; study.hidden = false; show(); face.focus();
  }
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Deck name', name), T.field('Saved decks', pickDeck)]), T.field('Cards', box),
    h('label', { 'class': 'tcheck' }, [rev, ' Show the answer side first']),
    T.row([T.button('Start studying', { primary: true, onclick: begin }), T.button('Save deck', { small: true, onclick: function () {
      if (!parse(box.value).length) return status.error('Add some cards first.');
      var n = name.value.trim() || 'My deck'; name.value = n; decks[n] = box.value; T.store.set('flash-decks', decks); T.store.set('flash-last', n); drawDecks(); status.ok('Deck “' + n + '” saved on this device.');
    } }), T.button('Delete deck', { small: true, onclick: function () { if (!decks[name.value]) return; delete decks[name.value]; T.store.set('flash-decks', decks); drawDecks(); status.ok('Deck deleted.'); } }),
      T.button('Try a sample', { small: true, onclick: function () { name.value = 'World capitals'; box.value = SAMPLE; begin(); } })]), status.el, study]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  drawDecks();
  T.tests.flashcards = function () {
    var f = [], p = parse('a | b\nc\td\ne = f\ng - h\ni: j\nno separator\n\nk|l|m');
    if (p.length !== 6 || p[1].b !== 'd' || p[4].f !== 'i' || p[5].b !== 'l|m') f.push('parse ' + JSON.stringify(p));
    var qq = answer([0, 1, 2, 3, 4], false); if (qq.join('') !== '12304') f.push('miss requeue ' + qq);
    if (answer([0, 1], true).join('') !== '1' || answer([0], false).join('') !== '0') f.push('knew / last');
    var s = shuffle([1, 2, 3, 4, 5]).sort().join(''); if (s !== '12345') f.push('shuffle lost cards');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
