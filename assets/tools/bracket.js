/* Infinity by GroupChatOn — bracket. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Tournament bracket maker: single knockout for 2–64 players or teams, fair seeding, automatic byes, tap to pick winners, print or copy. */
GCOTools.register('bracket', function (spot, T) {
  var h = T.h, status = T.status(), picks = {}, names = [], rounds = [];
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  // standard seeding: 1 meets the lowest seed, and 1 and 2 can only meet in the final
  function seeds(n) { var s = [1]; while (s.length < n) { var m = s.length * 2 + 1, nx = []; s.forEach(function (x) { nx.push(x, m - x); }); s = nx; } return s; }
  // null = a bye (nobody), '' = not decided yet
  function build(list, pk) {
    var size = 2; while (size < list.length) size *= 2;
    var order = seeds(size), slots = order.map(function (sd) { return sd <= list.length ? list[sd - 1] : null; }), out = [];
    while (slots.length > 1) {
      var r = out.length, ms = [], next = [];
      for (var i = 0; i < slots.length; i += 2) {
        var a = slots[i], b = slots[i + 1], key = r + '-' + i / 2, w;
        if (a === null && b === null) w = null; else if (b === null && r === 0) w = a; else if (a === null && r === 0) w = b;
        else if (a === null || b === null) w = a === null ? b : a;
        else w = a && b && (pk[key] === a || pk[key] === b) ? pk[key] : '';
        ms.push({ a: a, b: b, w: w, key: key }); next.push(w);
      }
      out.push(ms); slots = next;
    }
    return out;
  }
  function rname(r, n) { var left = n - r; return left === 1 ? 'Final' : left === 2 ? 'Semi-finals' : left === 3 ? 'Quarter-finals' : 'Round ' + (r + 1); }
  var box = h('textarea', { rows: '8', placeholder: 'One player or team per line, best first if you want seeding', 'aria-label': 'Players or teams' });
  box.value = T.store.get('bracket-list', '');
  var shuffle = h('input', { type: 'checkbox' }), title = h('input', { type: 'text', placeholder: 'e.g. Office Carrom Cup 2026', value: T.store.get('bracket-title', ''), 'aria-label': 'Tournament name' });
  var view = h('div', { style: 'overflow-x:auto;padding-bottom:6px' }), champ = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 22px/1.3 var(--ui)' });
  function render() {
    rounds = build(names, picks); view.innerHTML = '';
    if (!rounds.length) { champ.textContent = ''; return; }
    var grid = h('div', { style: 'display:grid;grid-auto-flow:column;grid-auto-columns:minmax(150px,1fr);gap:14px;align-items:stretch;min-width:min-content' });
    rounds.forEach(function (ms, r) {
      var col = h('div', { style: 'display:flex;flex-direction:column;justify-content:space-around;gap:10px' }, [h('b', { style: 'font-size:13px;color:var(--muted);text-align:center', text: rname(r, rounds.length) })]);
      ms.forEach(function (m) {
        if (m.a === null && m.b === null) { col.appendChild(h('div', { style: 'min-height:20px' })); return; }
        function side(v) {
          var bye = v === null, tbd = v === '', won = m.w && m.w === v;
          return h('button', { type: 'button', disabled: bye || tbd || m.a === null || m.b === null ? true : null, title: bye || tbd ? null : 'Tap if ' + v + ' won',
            style: 'display:block;width:100%;text-align:left;padding:7px 10px;border:0;border-bottom:1px solid var(--line);background:' + (won ? 'var(--accent-soft)' : 'transparent') + ';color:' + (bye || tbd ? 'var(--muted)' : 'var(--ink)') + ';font:' + (won ? '700' : '500') + ' 14px var(--ui);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
            text: bye ? 'bye' : tbd ? '…' : (won ? '✓ ' : '') + v, onclick: function () { picks[m.key] = v; save(); render(); } });
        }
        col.appendChild(h('div', { style: 'border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--bg)' }, [side(m.a), side(m.b)]));
      });
      grid.appendChild(col);
    });
    view.appendChild(grid);
    var w = rounds[rounds.length - 1][0].w;
    champ.textContent = w ? '🏆 Champion: ' + w : names.length + ' entries · ' + rounds.length + (rounds.length === 1 ? ' round' : ' rounds') + ' · tap a name to mark the winner';
  }
  function save() { T.store.set('bracket-state', { names: names, picks: picks }); }
  function make() {
    var list = box.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    var seen = {}; list = list.filter(function (s) { var k = s.toLowerCase(); if (seen[k]) return false; seen[k] = 1; return true; });
    if (list.length < 2) { status.error('Type at least two players or teams, one per line.'); return; }
    if (list.length > 64) { status.error('Up to 64 entries fit in one bracket.'); return; }
    if (shuffle.checked) for (var i = list.length - 1; i > 0; i--) { var j = rnd(i + 1), t = list[i]; list[i] = list[j]; list[j] = t; }
    names = list; picks = {}; T.store.set('bracket-list', box.value); T.store.set('bracket-title', title.value); save(); status.clear(); render();
  }
  function asText() {
    var out = [(title.value || 'Tournament') + ' bracket'];
    rounds.forEach(function (ms, r) { out.push('', rname(r, rounds.length)); ms.forEach(function (m) { if (m.a === null && m.b === null) return; out.push('  ' + (m.a === null ? 'bye' : m.a || '…') + ' vs ' + (m.b === null ? 'bye' : m.b || '…') + (m.w ? '  → ' + m.w : '')); }); });
    return out.join('\n');
  }
  function print() {
    if (!rounds.length) { status.error('Make the bracket first.'); return; }
    var w = window.open('', '_blank'); if (!w) { status.error('Allow pop-ups to print, or copy the bracket as text.'); return; }
    w.document.write('<!doctype html><meta charset="utf-8"><title>' + T.h('i', { text: title.value || 'Bracket' }).innerHTML + '</title><style>body{font:14px system-ui;margin:20px}h1{font-size:20px}</style><h1>' + T.h('i', { text: title.value || 'Tournament bracket' }).innerHTML + '</h1>' + view.innerHTML);
    w.document.close(); w.focus(); w.print();
  }
  var copy = T.button('Copy as text', { small: true, onclick: function () { if (rounds.length) T.copy(asText(), copy); } });
  var st = T.store.get('bracket-state', null);
  if (st && st.names && st.names.length > 1) { names = st.names; picks = st.picks || {}; }
  spot.appendChild(T.card([T.field('Tournament name (optional)', title), T.field('Players or teams', box), h('label', { 'class': 'tcheck' }, [shuffle, ' Shuffle the order (random draw instead of seeding)']),
    T.row([T.button('Make bracket', { primary: true, onclick: make }), T.button('Try a sample', { small: true, onclick: function () { box.value = 'Lions\nTigers\nEagles\nSharks\nWolves\nFalcons'; title.value = 'Sample Cup'; shuffle.checked = false; make(); } }),
      copy, T.button('Print', { small: true, onclick: print })]), status.el, champ, view]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  render();
  T.tests['bracket'] = function () {
    var f = [], s = seeds(8).join(',');
    if (s !== '1,8,4,5,2,7,3,6') f.push('seeds ' + s);
    var b = build(['A', 'B', 'C', 'D', 'E'], {});
    if (b.length !== 3 || b[0].length !== 4) f.push('shape');
    if (b[0].filter(function (m) { return m.b === null || m.a === null; }).length !== 3) f.push('byes');
    if (b[1].map(function (m) { return [m.a, m.b].join('/'); }).join(' ') !== 'A/ B/C') f.push('round 2 ' + b[1].map(function (m) { return [m.a, m.b].join('/'); }).join(' '));
    var c = build(['A', 'B', 'C', 'D', 'E'], { '0-1': 'D', '1-0': 'A', '1-1': 'C', '2-0': 'C' });
    if (c[2][0].w !== 'C') f.push('champion ' + c[2][0].w);
    var d = build(['A', 'B'], { '0-0': 'Z' });
    if (d[0][0].w !== '') f.push('bad pick kept');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
