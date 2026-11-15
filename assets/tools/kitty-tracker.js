/* Infinity by GroupChatOn — kitty-tracker. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Kitty / committee (BC) fund tracker: members, monthly contributions, who has paid, and a fair draw for the winner. */
GCOTools.register('kitty-tracker', function (spot, T) {
  var h = T.h, V = T.vault('kitty', { groups: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function addM(m, n) { var y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1 + n; y += Math.floor(mo / 12); mo = ((mo % 12) + 12) % 12; return y + '-' + ('0' + (mo + 1)).slice(-2); }
  function mlabel(m) { return new Date(m + '-01T00:00:00').toLocaleDateString(undefined, { month: 'short', year: 'numeric' }); }
  function rounds(g) { var r = []; for (var i = 0; i < g.members.length; i++) r.push(addM(g.start, i)); return r; }
  function round(g, m) { var paid = (g.paid[m] || {}), n = g.members.filter(function (x) { return paid[x.id]; }).length; return { pot: g.amt * g.members.length, got: n * g.amt, pending: g.members.length - n, winner: g.win[m] }; }
  function won(g) { var w = {}; Object.keys(g.win).forEach(function (m) { w[g.win[m]] = m; }); return w; }
  function draw1(g, m) {
    var w = won(g), pool = g.members.filter(function (x) { return !w[x.id] || g.win[m] === x.id; });
    if (!pool.length) return null;
    var r = new Uint32Array(1), lim = Math.floor(4294967296 / pool.length) * pool.length;
    do { crypto.getRandomValues(r); } while (r[0] >= lim);   // no modulo bias
    return pool[r[0] % pool.length].id;
  }
  var sel = null, month = null, body = h('div', { 'class': 'tool-app-opts' });
  function grp(id) { return db.groups.filter(function (g) { return g.id === id; })[0]; }
  function draw() {
    db = V.data(); body.innerHTML = '';
    if (!grp(sel) && db.groups.length) sel = db.groups[0].id;
    var g = grp(sel);
    if (g) {
      var rs = rounds(g); if (rs.indexOf(month) < 0) { month = rs.filter(function (m) { return m <= iso().slice(0, 7); }).pop() || rs[0]; }
      var gs = T.select(db.groups.map(function (x) { return [x.id, x.name]; }), g.id); gs.addEventListener('change', function () { sel = gs.value; month = null; draw(); });
      var ms = T.select(rs.map(function (m, i) { return [m, 'Round ' + (i + 1) + ' · ' + mlabel(m)]; }), month); ms.addEventListener('change', function () { month = ms.value; draw(); });
      body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Kitty / committee', gs), T.field('Month', ms)]));
      var r = round(g, month), w = won(g), win = g.members.filter(function (x) { return x.id === r.winner; })[0];
      body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Pot this month', T.money(r.pot), ''], ['Collected', T.money(r.got), 'tin-c'], ['Yet to pay', T.num(r.pending) + ' of ' + g.members.length, r.pending ? 'tout-c' : 'tin-c'], ['Winner', win ? win.name : 'Not drawn yet', '']].map(function (x) {
        return h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: x[1] })]); })));
      var list = h('div', { 'class': 'tlist' });
      g.members.forEach(function (x) {
        var paid = (g.paid[month] || {})[x.id];
        list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: r.winner === x.id ? '🏆' : paid ? '✅' : '⏳' }),
          h('span', { 'class': 'titem-main' }, [h('b', { text: x.name }), h('small', { text: w[x.id] ? 'Won in ' + mlabel(w[x.id]) : 'Not won yet' })]),
          T.button(paid ? 'Paid ✓' : 'Mark paid', { small: true, primary: !paid, onclick: function () { g.paid[month] = g.paid[month] || {}; if (paid) delete g.paid[month][x.id]; else g.paid[month][x.id] = iso(); save(); draw(); } })]));
      });
      body.appendChild(list);
      var pick = T.select([['', 'Choose winner…']].concat(g.members.filter(function (x) { return !w[x.id] || x.id === r.winner; }).map(function (x) { return [x.id, x.name]; })), r.winner || '');
      pick.addEventListener('change', function () { if (pick.value) g.win[month] = pick.value; else delete g.win[month]; save(); draw(); });
      var unpaid = g.members.filter(function (x) { return !(g.paid[month] || {})[x.id]; }).map(function (x) { return x.name; });
      var text = g.name + ' · ' + mlabel(month) + '\nPot: ' + T.money(r.pot) + ' · Collected: ' + T.money(r.got) + (unpaid.length ? '\nPending: ' + unpaid.join(', ') : '\nEveryone has paid 🎉') + (win ? '\nWinner: ' + win.name + ' 🏆' : '');
      body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Winner this month (by bid or draw)', pick)]));
      body.appendChild(T.row([T.button('🎲 Fair lucky draw', { primary: true, onclick: function () { var id = draw1(g, month); if (!id) { alert('Everyone has already won.'); return; } g.win[month] = id; save(); draw(); } }),
        h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener', href: 'https://wa.me/?text=' + encodeURIComponent(text), text: 'Share status on WhatsApp' }),
        T.button('Delete kitty', { small: true, onclick: function () { if (confirm('Delete ' + g.name + '?')) { db.groups = db.groups.filter(function (x) { return x !== g; }); sel = null; save(); draw(); } } })]));
      body.appendChild(h('p', { 'class': 'tnote', text: 'The draw only picks among members who have not won yet, using your device’s secure random numbers, so every remaining member has an equal chance.' }));
    }
    var n = h('input', { type: 'text', placeholder: 'e.g. Ladies kitty, Office BC' }), a = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Each member pays per month' }), st = h('input', { type: 'month', value: iso().slice(0, 7) });
    var mem = h('textarea', { rows: '4', placeholder: 'Member names, one per line' });
    body.appendChild(h('details', { 'class': 'tcalc-details', open: db.groups.length ? null : true }, [h('summary', { text: '➕ New kitty / committee' }),
      h('div', { 'class': 'tgrid2' }, [T.field('Name', n), T.field('Amount per member per month (' + T.currency() + ')', a), T.field('First month', st)]), T.field('Members', mem),
      T.row([T.button('Create', { primary: true, onclick: function () {
        var ms2 = mem.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        if (!n.value.trim() || !(parseFloat(a.value) > 0) || ms2.length < 2) { alert('Give a name, the monthly amount and at least two members.'); return; }
        var g2 = { id: uid(), name: n.value.trim(), amt: parseFloat(a.value), start: st.value || iso().slice(0, 7), members: ms2.map(function (x) { return { id: uid(), name: x }; }), paid: {}, win: {} };
        db.groups.push(g2); sel = g2.id; month = null; save(); draw();
      } })])]));
  }
  spot.appendChild(T.card([V.bar(draw), body]));
  V.ready.then(draw);

  T.tests['kitty-tracker'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    var g = { id: 'g', name: 'Test kitty', amt: 1000, start: '2026-01', members: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }, { id: 'd', name: 'D' }], paid: { '2026-01': { a: 1, b: 1, c: 1 } }, win: { '2026-01': 'a' } };
    V.save({ groups: [g] }); db = V.data();
    var r = round(g, '2026-01');
    if (r.pot !== 4000 || r.got !== 3000 || r.pending !== 1) fails.push('round ' + JSON.stringify(r));
    if (rounds(g)[3] !== '2026-04') fails.push('rounds ' + rounds(g));
    for (var i = 0; i < 60; i++) if (draw1(g, '2026-02') === 'a') { fails.push('past winner drawn again'); break; }
    g.win = { '2026-01': 'a', '2026-02': 'b', '2026-03': 'c', '2026-04': 'd' }; if (draw1(g, '2026-05') !== null) fails.push('draw when all won');
    g.win = { '2026-01': 'a' }; sel = 'g'; month = '2026-01'; draw(); if (body.textContent.indexOf('4,000') < 0 && body.textContent.indexOf('4000') < 0) fails.push('pot not shown');
    return V.save(keep).then(function () { sel = null; month = null; draw(); return { ok: !fails.length, n: 5, fails: fails }; });
  }
});
