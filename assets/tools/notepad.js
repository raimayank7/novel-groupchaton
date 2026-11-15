/* Infinity by GroupChatOn — notepad. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Online notepad: many notes, saved as you type in this browser's own storage (IndexedDB), with search, counts, copy, download and backup. */
GCOTools.register('notepad', function (spot, T) {
  var h = T.h, status = T.status(), V = T.vault('study-notepad', { notes: [] }), cur = null, timer = 0;
  function title(text) { var l = String(text || '').split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean)[0] || 'Empty note'; return l.length > 40 ? l.slice(0, 39) + '…' : l; }
  function counts(text) { var t = String(text || ''); return { words: (t.match(/\S+/g) || []).length, chars: t.length, lines: t ? t.split(/\r?\n/).length : 0 }; }
  function uid() { var a = new Uint32Array(2); crypto.getRandomValues(a); return a[0].toString(36) + a[1].toString(36); }
  var pick = h('select', { 'aria-label': 'Your notes' }), find = h('input', { type: 'search', placeholder: 'Search your notes' });
  var pad = h('textarea', { rows: '16', spellcheck: 'true', placeholder: 'Start typing… everything is saved on this device as you type.', 'aria-label': 'Note', style: 'min-height:320px;font-size:16px' });
  var stats = h('div', { 'class': 'tnote', 'data-out': '' });
  var size = T.seg([['15', 'A'], ['18', 'A+'], ['22', 'A++']], String(T.store.get('note-size', 16) >= 22 ? 22 : T.store.get('note-size', 16) >= 18 ? 18 : 15), function (v) { pad.style.fontSize = v + 'px'; T.store.set('note-size', +v); });
  pad.style.fontSize = (T.store.get('note-size', 16) >= 22 ? 22 : T.store.get('note-size', 16) >= 18 ? 18 : 15) + 'px';
  function notes() { return V.data().notes; }
  function note() { return notes().filter(function (n) { return n.id === cur; })[0]; }
  function drawPick() {
    var q = find.value.trim().toLowerCase(), list = notes().slice().sort(function (a, b) { return b.at - a.at; }).filter(function (n) { return !q || n.text.toLowerCase().indexOf(q) >= 0 || n.id === cur; });
    pick.innerHTML = '';
    list.forEach(function (n) { pick.appendChild(h('option', { value: n.id, selected: n.id === cur, text: title(n.text) + ' · ' + new Date(n.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) })); });
  }
  function drawStats(saved) { var c = counts(pad.value); stats.textContent = c.words + ' words · ' + c.chars + ' characters · ' + c.lines + ' lines' + (saved ? ' · Saved ✓' : ''); }
  function open(id) { cur = id; var n = note(); pad.value = n ? n.text : ''; drawPick(); drawStats(true); }
  function create(text) { var n = { id: uid(), text: text || '', at: Date.now() }; notes().push(n); V.save(V.data()); open(n.id); pad.focus(); }
  pad.addEventListener('input', function () {
    drawStats(false); clearTimeout(timer);
    timer = setTimeout(function () { var n = note(); if (!n) return; n.text = pad.value; n.at = Date.now(); V.save(V.data()).then(function () { drawStats(true); drawPick(); }); }, 400);
  });
  pick.addEventListener('change', function () { open(pick.value); });
  find.addEventListener('input', drawPick);
  var copy = T.button('Copy', { small: true, onclick: function () { T.copy(pad.value, copy); } });
  spot.appendChild(T.card([V.bar(function () { V.ready.then(start); }), h('div', { 'class': 'tgrid2' }, [T.field('Open a note', pick), T.field('Search', find)]),
    T.row([T.button('+ New note', { primary: true, small: true, onclick: function () { create(''); } }), T.button('Delete note', { small: true, onclick: function () {
      if (!confirm('Delete this note? This cannot be undone.')) return;
      V.data().notes = notes().filter(function (n) { return n.id !== cur; }); V.save(V.data()); start();
    } }), size]), pad, stats, status.el,
    T.row([copy, T.button('Download .txt', { small: true, onclick: function () { T.download(new Blob([pad.value], { type: 'text/plain;charset=utf-8' }), title(pad.value).replace(/[^\w\- ]+/g, '').trim().slice(0, 40) + '.txt'); } }),
      T.button('Share on WhatsApp', { small: true, onclick: function () { window.open('https://wa.me/?text=' + encodeURIComponent(pad.value.slice(0, 3000)), '_blank', 'noopener'); } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  function start() { if (!notes().length) { notes().push({ id: uid(), text: '', at: Date.now() }); V.save(V.data()); } var l = notes().slice().sort(function (a, b) { return b.at - a.at; }); open(l[0].id); }
  V.ready.then(start);
  T.tests.notepad = function () {
    var f = [];
    if (title('\n  Shopping list  \nmilk') !== 'Shopping list') f.push('title');
    if (title('') !== 'Empty note') f.push('empty title');
    var c = counts('Hello world\nfoo  bar'); if (c.words !== 4 || c.lines !== 2 || c.chars !== 20) f.push('counts ' + JSON.stringify(c));
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
