/* Infinity by GroupChatOn — sticky-note. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Sticky notes on screen: colourful notes you can type on, reorder, pin and view full screen, saved on this device. */
GCOTools.register('sticky-note', function (spot, T) {
  var h = T.h, status = T.status();
  var COLORS = ['#fef08a', '#fbcfe8', '#bbf7d0', '#bfdbfe', '#fed7aa', '#ddd6fe', '#ffffff'];
  var notes = T.store.get('sticky', null);
  if (!Array.isArray(notes)) notes = [{ id: 1, t: 'Welcome! Tap here and type. 📝\nNotes save by themselves on this device.', c: 0, p: true }];
  function toText(list) { return list.filter(function (n) { return n.t.trim(); }).map(function (n) { return (n.p ? '📌 ' : '• ') + n.t.trim().replace(/\n/g, '\n  '); }).join('\n\n'); }
  function order(list) { return list.slice().sort(function (a, b) { return (b.p ? 1 : 0) - (a.p ? 1 : 0); }); }
  function move(list, id, d) { var i = list.findIndex(function (n) { return n.id === id; }), j = i + d; if (i < 0 || j < 0 || j >= list.length) return list; var x = list.splice(i, 1)[0]; list.splice(j, 0, x); return list; }
  var board = h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(min(210px,100%),1fr));gap:14px;padding:12px;border-radius:16px;background:var(--bg);border:1px solid var(--line);min-height:200px' });
  var size = T.store.get('sticky-size', 16), saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { T.store.set('sticky', notes); }, 300); }
  function draw() {
    board.innerHTML = '';
    notes = order(notes);
    notes.forEach(function (n) {
      var ta = h('textarea', { 'aria-label': 'Note', rows: '6', style: 'width:100%;border:0;background:transparent;resize:vertical;font:' + size + 'px/1.45 "Segoe Print","Bradley Hand","Comic Sans MS",system-ui,sans-serif;color:#1f2937;outline:none;min-height:120px;box-sizing:border-box' });
      ta.value = n.t; ta.addEventListener('input', function () { n.t = ta.value; save(); });
      var bar = h('div', { style: 'display:flex;gap:2px;justify-content:flex-end;flex-wrap:wrap' }, [
        h('button', { type: 'button', title: n.p ? 'Unpin' : 'Pin to the top', 'aria-label': n.p ? 'Unpin' : 'Pin', text: '📌', style: 'opacity:' + (n.p ? 1 : 0.35) + ';background:none;border:0;cursor:pointer;font-size:16px', onclick: function () { n.p = !n.p; save(); draw(); } }),
        h('button', { type: 'button', title: 'Change colour', 'aria-label': 'Change colour', text: '🎨', style: 'background:none;border:0;cursor:pointer;font-size:16px', onclick: function () { n.c = (n.c + 1) % COLORS.length; save(); draw(); } }),
        h('button', { type: 'button', title: 'Move earlier', 'aria-label': 'Move earlier', text: '◀', style: 'background:none;border:0;cursor:pointer;color:#374151', onclick: function () { notes = move(notes, n.id, -1); save(); draw(); } }),
        h('button', { type: 'button', title: 'Move later', 'aria-label': 'Move later', text: '▶', style: 'background:none;border:0;cursor:pointer;color:#374151', onclick: function () { notes = move(notes, n.id, 1); save(); draw(); } }),
        h('button', { type: 'button', title: 'Delete', 'aria-label': 'Delete note', text: '✕', style: 'background:none;border:0;cursor:pointer;color:#374151;font-size:15px', onclick: function () { if (n.t.trim() && !confirm('Delete this note?')) return; notes = notes.filter(function (x) { return x !== n; }); save(); draw(); } })]);
      board.appendChild(h('div', { style: 'padding:10px 12px 12px;border-radius:4px 4px 14px 4px;background:' + COLORS[n.c % COLORS.length] + ';box-shadow:0 6px 16px rgba(0,0,0,.14);transform:rotate(' + ((n.id % 5) - 2) * 0.6 + 'deg);display:grid;gap:4px' }, [bar, ta]));
    });
    count.textContent = notes.length + (notes.length === 1 ? ' note' : ' notes');
    if (!notes.length) board.appendChild(h('p', { 'class': 'tnote', text: 'No notes. Press “New note” to add one.' }));
  }
  function add(text) { var id = notes.reduce(function (a, n) { return Math.max(a, n.id); }, 0) + 1; notes.push({ id: id, t: text || '', c: id % COLORS.length, p: false }); save(); draw(); var all = board.querySelectorAll('textarea'); var last = Array.prototype.filter.call(all, function (t) { return t.value === (text || ''); }).pop(); if (last && !text) last.focus(); }
  var count = h('span', { 'class': 'tnote', 'data-out': '' });
  function full() { if (document.fullscreenElement) return document.exitFullscreen(); if (board.requestFullscreen) board.requestFullscreen().catch(function () {}); else status.info('Full screen is not available in this browser.'); }
  document.addEventListener('fullscreenchange', function () { board.style.alignContent = document.fullscreenElement === board ? 'start' : ''; board.style.overflow = document.fullscreenElement === board ? 'auto' : ''; });
  var cp = T.button('Copy all', { small: true, onclick: function () { T.copy(toText(notes), cp); } });
  spot.appendChild(T.card([T.row([T.button('New note', { primary: true, onclick: function () { add(''); } }), T.button('Full screen', { small: true, onclick: full }),
    T.button('A−', { small: true, onclick: function () { size = Math.max(12, size - 2); T.store.set('sticky-size', size); draw(); } }), T.button('A+', { small: true, onclick: function () { size = Math.min(28, size + 2); T.store.set('sticky-size', size); draw(); } }), count]),
    board, T.row([cp, T.button('Download as text', { small: true, onclick: function () { T.download(new Blob([toText(notes)], { type: 'text/plain;charset=utf-8' }), 'sticky-notes.txt'); } }),
      T.button('Try a sample', { small: true, onclick: function () { if (!notes.some(function (n) { return /Buy milk/.test(n.t); })) { add('Buy milk, bread and eggs 🥛'); add('Call the electrician at 5 pm'); } } }),
      T.button('Delete all', { small: true, onclick: function () { if (confirm('Delete every note? This cannot be undone.')) { notes = []; save(); draw(); } } })]), status.el,
    h('p', { 'class': 'tnote', text: 'Notes are saved automatically in this browser on this device and stay until you delete them. Pinned notes stay at the front.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  window.addEventListener('pagehide', function () { T.store.set('sticky', notes); });
  T.tests['sticky-note'] = function () {
    var f = [], L = [{ id: 1, t: 'a', p: false }, { id: 2, t: 'b\nc', p: true }, { id: 3, t: '  ', p: false }];
    if (toText(L) !== '• a\n\n📌 b\n  c') f.push('text ' + JSON.stringify(toText(L)));
    if (order(L)[0].id !== 2) f.push('pinned first');
    if (move(L.slice(), 1, 1).map(function (n) { return n.id; }).join('') !== '213') f.push('move');
    if (move(L.slice(), 1, -1).map(function (n) { return n.id; }).join('') !== '123') f.push('move edge');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
