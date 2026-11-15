/* Infinity by GroupChatOn — solitaire. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Solitaire (Klondike): draw 1 or 3, tap to select and tap to move (tap a card twice to send it home), unlimited undo and auto-finish. */
GCOTools.register('solitaire', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var SUITS = ['♠', '♥', '♦', '♣'], RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  function red(c) { return c.s === 1 || c.s === 2; }
  function deal() {
    var d = [];
    for (var s = 0; s < 4; s++) for (var r = 1; r <= 13; r++) d.push({ s: s, r: r, up: false });
    for (var i = d.length - 1; i > 0; i--) { var j = rnd(i + 1), t = d[i]; d[i] = d[j]; d[j] = t; }
    var G = { stock: [], waste: [], found: [[], [], [], []], tab: [[], [], [], [], [], [], []], moves: 0 };
    for (var c = 0; c < 7; c++) for (var k = 0; k <= c; k++) { var card = d.pop(); card.up = k === c; G.tab[c].push(card); }
    G.stock = d;
    return G;
  }
  function top(a) { return a[a.length - 1]; }
  function canFound(G, card, f) { var t = top(G.found[f]); return t ? t.s === card.s && card.r === t.r + 1 : card.r === 1; }
  function canTab(G, card, c) { var t = top(G.tab[c]); return t ? t.up && red(t) !== red(card) && card.r === t.r - 1 : card.r === 13; }
  // the cards a selection would carry: { from: 'waste' | 'tab' | 'found', pile, index }
  function cardsOf(G, sel) {
    if (sel.from === 'waste') return G.waste.length ? [top(G.waste)] : [];
    if (sel.from === 'found') return G.found[sel.pile].length ? [top(G.found[sel.pile])] : [];
    return G.tab[sel.pile].slice(sel.index);
  }
  function take(G, sel) {
    if (sel.from === 'waste') G.waste.pop();
    else if (sel.from === 'found') G.found[sel.pile].pop();
    else { G.tab[sel.pile].splice(sel.index); var t = top(G.tab[sel.pile]); if (t) t.up = true; }
  }
  // tries to move the selection to a target { to: 'tab' | 'found', pile }; returns true if it moved
  function move(G, sel, tgt) {
    var cards = cardsOf(G, sel); if (!cards.length || !cards[0].up) return false;
    if (tgt.to === 'found') { if (cards.length !== 1 || !canFound(G, cards[0], tgt.pile) || (sel.from === 'found' && sel.pile === tgt.pile)) return false; }
    else if (!canTab(G, cards[0], tgt.pile) || (sel.from === 'tab' && sel.pile === tgt.pile)) return false;
    take(G, sel);
    (tgt.to === 'found' ? G.found[tgt.pile] : G.tab[tgt.pile]).push.apply(tgt.to === 'found' ? G.found[tgt.pile] : G.tab[tgt.pile], cards);
    G.moves++;
    return true;
  }
  function autoTarget(G, sel) {
    var cards = cardsOf(G, sel);
    if (cards.length === 1 && sel.from !== 'found') for (var f = 0; f < 4; f++) if (canFound(G, cards[0], f)) return { to: 'found', pile: f };
    for (var c = 0; c < 7; c++) if (!(sel.from === 'tab' && sel.pile === c) && canTab(G, cards[0], c) && !(cards[0].r === 13 && sel.from === 'tab' && sel.index === 0)) return { to: 'tab', pile: c };
    return null;
  }
  function draw3(G, n) {
    if (!G.stock.length) { G.waste.reverse().forEach(function (c) { c.up = false; }); G.stock = G.waste; G.waste = []; return 'recycle'; }
    for (var i = 0; i < n && G.stock.length; i++) { var c = G.stock.pop(); c.up = true; G.waste.push(c); }
    G.moves++; return 'draw';
  }
  function won(G) { return G.found.every(function (f) { return f.length === 13; }); }
  function allOpen(G) { return !G.stock.length && !G.waste.length && G.tab.every(function (col) { return col.every(function (c) { return c.up; }); }); }

  var G, sel = null, hist = [], drawN = T.store.get('sol-draw', 1), t0 = 0, timer = null, finishing = false;
  var area = h('div', { style: 'display:grid;gap:10px;width:min(100%,640px);margin:0 auto;user-select:none;-webkit-user-select:none;touch-action:manipulation' });
  var topRow = h('div', { style: 'display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px' }), tabRow = h('div', { style: 'display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;align-items:start' });
  area.appendChild(topRow); area.appendChild(tabRow);
  var mv = h('b', { text: '0' }), clock = h('b', { text: '0:00' }), home = h('b', { text: '0' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var drawSeg = T.seg([[1, 'Draw 1'], [3, 'Draw 3']], drawN, function (v) { drawN = v; T.store.set('sol-draw', v); newGame(); });
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function snap() { hist.push(JSON.stringify(G)); if (hist.length > 300) hist.shift(); }
  function face(c, extra) {
    var col = red(c) ? '#dc2626' : '#111827';
    if (!c.up) return h('div', { style: 'position:absolute;left:0;right:0;aspect-ratio:5/7;border-radius:6px;border:1px solid #1e3a8a;background:repeating-linear-gradient(45deg,#3b82f6 0 5px,#2563eb 5px 10px);box-shadow:0 1px 2px rgba(0,0,0,.3);' + (extra || '') });
    return h('div', { role: 'button', tabindex: '0', 'aria-label': RANKS[c.r] + ' of ' + ['spades', 'hearts', 'diamonds', 'clubs'][c.s], style: 'position:absolute;left:0;right:0;aspect-ratio:5/7;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:' + col + ';box-shadow:0 1px 3px rgba(0,0,0,.3);cursor:pointer;overflow:hidden;' + (extra || '') }, [
      h('span', { style: 'position:absolute;left:3px;top:2px;font:800 clamp(10px,3.4vw,16px)/1 var(--ui);letter-spacing:-.5px', text: RANKS[c.r] + SUITS[c.s] }),
      h('span', { style: 'position:absolute;right:3px;bottom:2px;font:400 clamp(16px,6vw,32px)/1 serif', text: SUITS[c.s] })]);
  }
  function slot(label, onclick) { return h('div', { role: 'button', tabindex: '0', 'aria-label': label, style: 'position:relative;aspect-ratio:5/7;border-radius:6px;border:2px dashed var(--line);display:grid;place-items:center;color:var(--muted);font:700 14px/1 var(--ui);cursor:pointer', onclick: onclick }); }
  function isSel(from, pile, index) { return sel && sel.from === from && sel.pile === pile && (from !== 'tab' || index >= sel.index); }
  function render() {
    topRow.innerHTML = ''; tabRow.innerHTML = '';
    var st = slot('Stock: ' + G.stock.length + ' cards. Tap to turn over.', function () { act({ stock: true }); });
    st.textContent = G.stock.length ? '' : '↻';
    if (G.stock.length) st.appendChild(face({ up: false }, 'top:0'));
    topRow.appendChild(st);
    var wa = slot('Waste', null); wa.style.border = '0';
    var show = G.waste.slice(-Math.min(drawN, 3));
    show.forEach(function (c, i) {
      var isTop = i === show.length - 1, el = face(c, 'top:0;transform:translateX(' + i * 18 + '%);' + (isTop && isSel('waste') ? 'outline:3px solid #f59e0b;' : '') + (isTop ? '' : 'pointer-events:none;'));
      if (isTop) el.addEventListener('click', function (e) { e.stopPropagation(); act({ from: 'waste' }); });
      wa.appendChild(el);
    });
    topRow.appendChild(wa); topRow.appendChild(h('div'));
    G.found.forEach(function (f, i) {
      var s = slot('Foundation ' + (i + 1), function () { act({ to: 'found', pile: i }); }); s.textContent = 'A';
      if (f.length) { var el = face(top(f), 'top:0;' + (isSel('found', i) ? 'outline:3px solid #f59e0b;' : '')); el.addEventListener('click', function (e) { e.stopPropagation(); act({ from: 'found', pile: i }); }); s.appendChild(el); }
      topRow.appendChild(s);
    });
    var cw = (tabRow.clientWidth || 320) / 7, ch = cw * 1.4;
    G.tab.forEach(function (col, i) {
      var s = slot('Column ' + (i + 1), function () { act({ to: 'tab', pile: i }); }), y = 0, maxH = Math.max(ch, 0);
      s.style.border = col.length ? '0' : ''; s.style.aspectRatio = 'auto';
      col.forEach(function (c, k) {
        var el = face(c, 'top:' + y + 'px;' + (c.up && isSel('tab', i, k) ? 'outline:3px solid #f59e0b;z-index:2;' : ''));
        if (c.up) el.addEventListener('click', function (e) { e.stopPropagation(); act({ from: 'tab', pile: i, index: k }); });
        s.appendChild(el); maxH = y + ch; y += c.up ? ch * 0.3 : ch * 0.14;
      });
      s.style.height = Math.max(ch, maxH) + 'px';
      tabRow.appendChild(s);
    });
    mv.textContent = String(G.moves); home.textContent = String(G.found.reduce(function (n, f) { return n + f.length; }, 0));
    Array.prototype.forEach.call(area.querySelectorAll('[role=button]'), function (b) { b.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } }; });
  }
  function act(a) {
    if (finishing || won(G)) return;
    if (a.stock) { snap(); draw3(G, drawN); sel = null; render(); return; }
    if (a.from) {
      var same = sel && sel.from === a.from && sel.pile === a.pile && sel.index === a.index;
      if (sel && !same && a.from !== 'waste') {   // tapping a card on another pile = try to move there
        var tgt = a.from === 'found' ? { to: 'found', pile: a.pile } : { to: 'tab', pile: a.pile };
        snap(); if (move(G, sel, tgt)) { sel = null; after(); return; } hist.pop();
      }
      if (same) { var t = autoTarget(G, sel); if (t) { snap(); move(G, sel, t); sel = null; after(); return; } sel = null; status.info('That card has nowhere to go yet.'); render(); return; }
      sel = { from: a.from, pile: a.pile, index: a.index };
      var quick = autoTarget(G, sel);
      if (quick && quick.to === 'found' && oneTap.checked) { snap(); move(G, sel, quick); sel = null; after(); return; }
      status.clear(); render(); return;
    }
    if (a.to && sel) { snap(); if (move(G, sel, a)) { sel = null; after(); return; } hist.pop(); status.info('That move is not allowed.'); }
    sel = null; render();
  }
  function after() {
    status.clear(); render(); save();
    if (won(G)) { clearInterval(timer); out.textContent = '🎉 You won in ' + G.moves + ' moves and ' + fmt(t0) + '!'; status.ok('All cards are home.'); var w = T.store.get('sol-wins', 0) + 1; T.store.set('sol-wins', w); }
    else if (allOpen(G)) autoFinish();
  }
  function autoFinish() {
    if (finishing) return; finishing = true;
    (function step() {
      for (var c = 0; c < 7; c++) { var card = top(G.tab[c]); if (card) for (var f = 0; f < 4; f++) if (canFound(G, card, f)) { move(G, { from: 'tab', pile: c, index: G.tab[c].length - 1 }, { to: 'found', pile: f }); render(); return setTimeout(step, 70); } }
      finishing = false; after();
    })();
  }
  function save() { T.store.set('sol-game', { G: G, t: t0, d: drawN }); }
  function newGame() {
    G = deal(); sel = null; hist = []; t0 = 0; finishing = false; out.textContent = ''; status.clear(); startClock(); render(); save();
  }
  function startClock() { clearInterval(timer); timer = setInterval(function () { if (G.moves && !won(G) && !document.hidden) { t0++; clock.textContent = fmt(t0); } }, 1000); }
  var oneTap = h('input', { type: 'checkbox', checked: T.store.get('sol-onetap', true) });
  oneTap.addEventListener('change', function () { T.store.set('sol-onetap', oneTap.checked); });
  window.addEventListener('resize', function () { if (G) render(); });
  spot.appendChild(T.card([T.row([drawSeg, T.button('New game', { primary: true, onclick: newGame })]), area,
    h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [mv, h('span', { text: 'Moves' })]), h('div', { 'class': 'tstat' }, [clock, h('span', { text: 'Time' })]), h('div', { 'class': 'tstat' }, [home, h('span', { text: 'Cards home' })])]),
    T.row([T.button('Undo', { small: true, onclick: function () { var s = hist.pop(); if (s) { G = JSON.parse(s); sel = null; render(); save(); } } }),
      T.button('Hint', { small: true, onclick: hint }), T.button('Finish', { small: true, onclick: function () { if (allOpen(G)) autoFinish(); else status.info('Finish works once every card is face up and the stock is empty.'); } })]),
    h('label', { 'class': 'tcheck' }, [oneTap, ' One tap sends a card home when it can go to the foundation']),
    h('p', { 'class': 'tstatus', text: 'Tap a card, then tap where it should go. Tap a card twice to move it to the best place.' }), status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  function hint() {
    var tries = [{ from: 'waste' }];
    for (var c = 0; c < 7; c++) G.tab[c].forEach(function (card, k) { if (card.up) tries.push({ from: 'tab', pile: c, index: k }); });
    for (var i = 0; i < tries.length; i++) {
      var t = cardsOf(G, tries[i]).length && autoTarget(G, tries[i]);
      if (t && !(tries[i].from === 'tab' && t.to === 'tab' && tries[i].index > 0 && G.tab[tries[i].pile][tries[i].index - 1].up)) {
        var card = cardsOf(G, tries[i])[0]; sel = tries[i]; render();
        status.info('Try moving the ' + RANKS[card.r] + SUITS[card.s] + (t.to === 'found' ? ' to the foundation.' : ' onto column ' + (t.pile + 1) + '.')); return;
      }
    }
    status.info(G.stock.length || G.waste.length ? 'Turn over a card from the stock.' : 'No moves left. Try Undo or a new game.');
  }
  var saved = T.store.get('sol-game', null);
  if (saved && saved.G && saved.d === drawN && !won(saved.G)) { G = saved.G; t0 = saved.t || 0; clock.textContent = fmt(t0); startClock(); render(); } else newGame();
  T.tests['solitaire'] = function () {
    var f = [], g = deal(), all = {};
    g.tab.forEach(function (col, i) { if (col.length !== i + 1) f.push('column ' + i); col.forEach(function (c, k) { all[c.s + '-' + c.r] = 1; if (c.up !== (k === i)) f.push('face up/down'); }); });
    g.stock.forEach(function (c) { all[c.s + '-' + c.r] = 1; });
    if (Object.keys(all).length !== 52 || g.stock.length !== 24) f.push('deck');
    var x = { stock: [], waste: [{ s: 1, r: 1, up: true }], found: [[], [], [], []], tab: [[{ s: 0, r: 13, up: true }], [{ s: 1, r: 12, up: true }], [{ s: 0, r: 5, up: false }, { s: 2, r: 12, up: true }], [], [{ s: 3, r: 13, up: true }], [], []], moves: 0 };
    if (!move(x, { from: 'waste' }, { to: 'found', pile: 0 }) || x.found[0].length !== 1) f.push('ace to foundation');
    if (!move(x, { from: 'tab', pile: 1, index: 0 }, { to: 'tab', pile: 0 }) || x.tab[0].length !== 2) f.push('red queen on black king');
    if (move(x, { from: 'tab', pile: 2, index: 1 }, { to: 'tab', pile: 0 })) f.push('queen on queen allowed');
    if (move(x, { from: 'tab', pile: 2, index: 1 }, { to: 'tab', pile: 3 })) f.push('queen onto empty column allowed');
    if (!move(x, { from: 'tab', pile: 2, index: 1 }, { to: 'tab', pile: 4 }) || !x.tab[2][0].up) f.push('move + flip');
    if (!move(x, { from: 'tab', pile: 0, index: 0 }, { to: 'tab', pile: 3 }) || x.tab[3].length !== 2 || x.tab[0].length) f.push('move a run of cards');
    var y = deal(); y.waste = []; var n = y.stock.length; draw3(y, 3);
    if (y.waste.length !== 3 || y.stock.length !== n - 3) f.push('draw 3');
    return Promise.resolve({ ok: !f.length, n: 9, fails: f });
  };
});
