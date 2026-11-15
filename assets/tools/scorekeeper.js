/* Infinity by GroupChatOn — scorekeeper. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Scorekeeper for any game: players, quick +/− buttons or whole rounds, running totals, target score, "lowest wins" option; saved on this device. */
GCOTools.register('scorekeeper', function (spot, T) {
  var h = T.h, status = T.status();
  function totals(g) { return g.players.map(function (p, i) { return g.rounds.reduce(function (s, r) { return s + (+r[i] || 0); }, 0) + (g.live[i] || 0); }); }
  // players in finishing order: [{ i, total, place }], equal totals share a place
  function ranking(g) {
    var t = totals(g), order = t.map(function (v, i) { return { i: i, total: v }; }).sort(function (a, b) { return g.low ? a.total - b.total : b.total - a.total; });
    order.forEach(function (o, k) { o.place = k && o.total === order[k - 1].total ? order[k - 1].place : k + 1; });
    return order;
  }
  function winner(g) {
    if (!g.target) return null;
    var t = totals(g), hit = t.some(function (v) { return v >= g.target; });
    if (!hit) return null;
    var r = ranking(g); return r.filter(function (o) { return o.place === 1; }).map(function (o) { return g.players[o.i]; });
  }
  var blank = function () { return { players: ['Player 1', 'Player 2'], rounds: [], live: [0, 0], target: 0, low: false, title: '' }; };
  var G = T.store.get('sk-game', null) || blank();
  var list = h('div', { style: 'display:grid;gap:8px' }), table = h('div', { style: 'overflow-x:auto' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;min-height:22px' });
  var target = h('input', { type: 'number', min: '0', inputmode: 'numeric', placeholder: 'none', value: G.target ? String(G.target) : '', 'aria-label': 'Target score' });
  var low = h('input', { type: 'checkbox', checked: G.low }), titleIn = h('input', { type: 'text', maxlength: '40', placeholder: 'e.g. Rummy at Grandma’s', value: G.title || '', 'aria-label': 'Game name' });
  var roundBox = h('div', { style: 'display:grid;gap:6px' });
  function save() { T.store.set('sk-game', G); }
  function draw() {
    var t = totals(G), r = ranking(G), place = {}; r.forEach(function (o) { place[o.i] = o.place; });
    list.innerHTML = '';
    G.players.forEach(function (name, i) {
      var nm = h('input', { type: 'text', value: name, maxlength: '20', 'aria-label': 'Player name', style: 'min-width:0;font-weight:700' });
      nm.addEventListener('change', function () { G.players[i] = nm.value.trim() || 'Player ' + (i + 1); save(); draw(); });
      var add = function (d) { return T.button((d > 0 ? '+' : '−') + Math.abs(d), { small: true, onclick: function () { G.live[i] = (G.live[i] || 0) + d; save(); draw(); } }); };
      list.appendChild(h('div', { style: 'display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:10px;border-radius:14px;background:var(--surface-2)' + (place[i] === 1 && t.some(Boolean) ? ';outline:2px solid #f59e0b' : '') }, [
        h('span', { style: 'font:900 20px/1 var(--ui);min-width:30px;text-align:center', text: place[i] === 1 && t.some(Boolean) ? '👑' : '#' + place[i] }),
        h('div', { style: 'display:grid;gap:6px;min-width:0' }, [nm, h('div', { style: 'display:flex;flex-wrap:wrap;gap:4px' }, [add(-1), add(1), add(5), add(10)])]),
        h('b', { style: 'font:900 30px/1 var(--ui);min-width:60px;text-align:right', text: String(t[i]) })]));
    });
    roundBox.innerHTML = '';
    var inputs = G.players.map(function (n) { return h('input', { type: 'number', inputmode: 'numeric', placeholder: '0', 'aria-label': 'Points for ' + n }); });
    roundBox.appendChild(h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px' }, inputs.map(function (inp, i) { return T.field(G.players[i], inp); })));
    roundBox.appendChild(T.row([T.button('Add round ' + (G.rounds.length + 1), { primary: true, onclick: function () {
      var row = inputs.map(function (x) { return Math.round((+x.value || 0) * 100) / 100; });
      if (!inputs.some(function (x) { return x.value.trim(); })) { status.error('Type at least one score for this round.'); return; }
      G.rounds.push(row); status.clear(); save(); draw();
    } }), T.button('Undo last round', { small: true, onclick: function () { if (G.rounds.pop()) { save(); draw(); } } })]));
    table.innerHTML = '';
    if (G.rounds.length || G.live.some(Boolean)) {
      var head = h('tr', {}, [h('th', { text: 'Round' })].concat(G.players.map(function (n) { return h('th', { text: n }); })));
      var body = G.rounds.map(function (r, k) { return h('tr', {}, [h('td', { text: String(k + 1) })].concat(r.map(function (v) { return h('td', { text: String(v) }); }))); });
      if (G.live.some(Boolean)) body.push(h('tr', {}, [h('td', { text: 'Taps' })].concat(G.live.map(function (v) { return h('td', { text: String(v || 0) }); }))));
      body.push(h('tr', { style: 'font-weight:800' }, [h('td', { text: 'Total' })].concat(t.map(function (v) { return h('td', { text: String(v) }); }))));
      table.appendChild(h('table', { 'class': 'tmono', style: 'border-collapse:collapse;width:100%;font-size:14px;text-align:right' }, [h('thead', {}, [head]), h('tbody', {}, body)]));
      Array.prototype.forEach.call(table.querySelectorAll('td,th'), function (c) { c.style.padding = '5px 8px'; c.style.borderBottom = '1px solid var(--line)'; });
    }
    var w = winner(G), lead = r.filter(function (o) { return o.place === 1; }).map(function (o) { return G.players[o.i]; });
    out.textContent = w ? '🏆 ' + w.join(' & ') + (w.length > 1 ? ' share the win' : ' wins') + '! (' + (G.low ? 'lowest score once someone reached ' : 'first to ') + G.target + ')'
      : t.some(Boolean) ? (lead.length > 1 ? 'Tied for the lead: ' + lead.join(', ') : lead[0] + ' leads') + (G.target ? ' · playing to ' + G.target : '') + (G.low ? ' · lowest wins' : '') : 'Add players, then tap the buttons or add a round.';
  }
  function text() {
    var r = ranking(G), t = totals(G);
    return (G.title || 'Scores') + '\n' + r.map(function (o) { return o.place + '. ' + G.players[o.i] + ': ' + t[o.i]; }).join('\n') + '\n(' + G.rounds.length + ' rounds · kept with infinity.groupchaton.com scorekeeper)';
  }
  target.addEventListener('input', function () { G.target = Math.max(0, Math.round(+target.value || 0)); save(); draw(); });
  low.addEventListener('change', function () { G.low = low.checked; save(); draw(); });
  titleIn.addEventListener('input', function () { G.title = titleIn.value; save(); });
  var copyBtn = T.button('Copy results', { small: true, onclick: function () { T.copy(text(), copyBtn); } });
  spot.appendChild(T.card([T.field('Game (optional)', titleIn), list,
    T.row([T.button('+ Add player', { small: true, onclick: function () { if (G.players.length >= 12) return; G.players.push('Player ' + (G.players.length + 1)); G.live.push(0); G.rounds.forEach(function (r) { r.push(0); }); save(); draw(); } }),
      T.button('Remove last player', { small: true, onclick: function () { if (G.players.length <= 1) return; G.players.pop(); G.live.pop(); G.rounds.forEach(function (r) { r.pop(); }); save(); draw(); } })]),
    h('details', {}, [h('summary', { text: 'Score a whole round at once' }), h('div', { style: 'margin-top:8px' }, [roundBox])]),
    h('div', { 'class': 'tgrid2' }, [T.field('Target score (optional)', target), h('label', { 'class': 'tcheck', style: 'align-self:end' }, [low, ' Lowest score wins (golf, rummy…)'])]),
    status.el, out, table,
    T.row([copyBtn, T.button('WhatsApp', { small: true, onclick: function () { window.open('https://wa.me/?text=' + encodeURIComponent(text()), '_blank', 'noopener'); } }),
      T.button('Try a sample', { small: true, onclick: function () { G = { players: ['Asha', 'Ben', 'Chen'], rounds: [[12, 8, 15], [5, 14, 9], [20, 6, 11]], live: [0, 0, 0], target: 50, low: false, title: 'Sample game' }; target.value = '50'; low.checked = false; titleIn.value = G.title; save(); draw(); } }),
      T.button('New game', { small: true, onclick: function () { if (!confirm('Clear all scores and keep the player names?')) return; G.rounds = []; G.live = G.players.map(function () { return 0; }); save(); draw(); } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['scorekeeper'] = function () {
    var f = [], g = { players: ['A', 'B', 'C'], rounds: [[10, 5, 8], [3, 9, 8]], live: [0, 1, 0], target: 0, low: false };
    if (totals(g).join() !== '13,15,16') f.push('totals ' + totals(g).join());
    var r = ranking(g); if (r[0].i !== 2 || r[2].i !== 0) f.push('ranking');
    g.low = true; r = ranking(g); if (r[0].i !== 0) f.push('lowest wins');
    g.live = [0, 0, 0]; g.rounds = [[5, 5, 1]]; g.low = false; r = ranking(g);
    if (r[0].place !== 1 || r[1].place !== 1 || r[2].place !== 3) f.push('shared place ' + JSON.stringify(r));
    g.target = 5; if ((winner(g) || []).join() !== 'A,B') f.push('winner tie');
    g.target = 6; if (winner(g)) f.push('winner before target');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
