/* Infinity by GroupChatOn — logic-grid. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Logic grid puzzles: new "who has what" puzzles with written clues and a tick-and-cross grid; each has exactly one answer. */
GCOTools.register('logic-grid', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var NAMES = ['Asha', 'Ben', 'Chen', 'Diya', 'Elena', 'Farid', 'Grace', 'Hiro', 'Ines', 'Jomo', 'Kavya', 'Leo'];
  // category: label, items, verb, verb after "does not", object pattern, "the person who…" phrase
  var CATS = [
    ['Pet', ['cat', 'dog', 'parrot', 'rabbit', 'goldfish', 'turtle'], 'owns', 'does not own', 'the %', 'the % owner'],
    ['Colour', ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], 'likes', 'does not like', '%', 'the person who likes %'],
    ['Drink', ['tea', 'coffee', 'juice', 'milk', 'lassi', 'cocoa'], 'drinks', 'does not drink', '%', 'the % drinker'],
    ['City', ['Delhi', 'Lagos', 'Lima', 'Oslo', 'Seoul', 'Cairo'], 'lives in', 'does not live in', '%', 'the person from %'],
    ['Hobby', ['chess', 'tennis', 'painting', 'cricket', 'cooking', 'cycling'], 'enjoys', 'does not enjoy', '%', 'the % fan'],
    ['Snack', ['mango', 'apple', 'banana', 'grapes', 'popcorn', 'samosa'], 'packed', 'did not pack', 'the %', 'the person with the %']
  ];
  function seq(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function perms(n) { var out = []; (function p(a, k) { if (k === n) { out.push(a.slice()); return; } for (var i = k; i < n; i++) { var t = a[k]; a[k] = a[i]; a[i] = t; p(a, k + 1); t = a[k]; a[k] = a[i]; a[i] = t; } })(seq(n), 0); return out; }
  // sol = [perm1, perm2]: person p has item perm1[p] of category 1 and perm2[p] of category 2
  function who(sol, e) { return e[0] === 0 ? e[1] : sol[e[0] - 1].indexOf(e[1]); }
  function holds(sol, c) {
    var a = who(sol, c.a);
    if (c.t === 'is') return a === who(sol, c.b);
    if (c.t === 'not') return a !== who(sol, c.b);
    if (c.t === 'or') return a === who(sol, c.b) || a === who(sol, c.c);
    if (c.t === 'nor') return a !== who(sol, c.c) && who(sol, c.b) !== who(sol, c.c) && a !== who(sol, c.b);
    return false;
  }
  function count(P, clues, limit) {
    var n = P.n, all = P.all || (P.all = perms(n)), k = 0;
    for (var i = 0; i < all.length; i++) for (var j = 0; j < all.length; j++) {
      var s = [all[i], all[j]];
      if (clues.every(function (c) { return holds(s, c); })) { if (++k >= limit) return k; }
    }
    return k;
  }
  function make(n) {
    var cats = shuffle(seq(CATS.length)).slice(0, 2), people = shuffle(NAMES.slice()).slice(0, n).sort();
    var P = { n: n, people: people, cats: cats.map(function (c) { var C = CATS[c]; return { label: C[0], items: shuffle(C[1].slice()).slice(0, n), verb: C[2], neg: C[3], obj: C[4], noun: C[5] }; }) };
    P.sol = [shuffle(seq(n)), shuffle(seq(n))];
    var ent = function () { var c = rnd(3); return [c, rnd(n)]; }, pool = [];
    for (var t = 0; t < 400; t++) {
      var a = ent(), b = ent(), type = ['is', 'not', 'not', 'or', 'nor'][rnd(5)], c;
      if (a[0] === b[0]) continue;
      if (a[0] > b[0] && a[0] !== 0) { var x = a; a = b; b = x; }
      if (type === 'or') { c = [b[0], rnd(n)]; if (c[1] === b[1]) continue; }
      if (type === 'nor') { c = ent(); if (c[0] === a[0] || c[0] === b[0] || c[0] === 0) continue; }
      var cl = { t: type, a: a, b: b, c: c };
      if (holds(P.sol, cl)) pool.push(cl);
    }
    var clues = [], alive = [], all = P.all || (P.all = perms(n)), i;
    all.forEach(function (x) { all.forEach(function (y) { alive.push([x, y]); }); });
    for (i = 0; i < pool.length && alive.length > 1; i++) {   // keep a clue only if it rules something out
      var left = alive.filter(function (s) { return holds(s, pool[i]); });
      if (left.length < alive.length) { alive = left; clues.push(pool[i]); }
    }
    if (alive.length > 1) return make(n);
    for (i = clues.length - 1; i >= 0; i--) { var rest = clues.slice(0, i).concat(clues.slice(i + 1)); if (count(P, rest, 2) === 1) clues = rest; }
    P.clues = shuffle(clues);
    return P;
  }
  function name(P, e, subject) {
    if (e[0] === 0) return P.people[e[1]];
    var C = P.cats[e[0] - 1], s = C.noun.replace('%', C.items[e[1]]);
    return subject ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
  function obj(P, e) { var C = P.cats[e[0] - 1]; return C.obj.replace('%', C.items[e[1]]); }
  function text(P, c) {
    var C = function (e) { return P.cats[e[0] - 1]; };
    if (c.t === 'is') return name(P, c.a, true) + ' ' + C(c.b).verb + ' ' + obj(P, c.b) + '.';
    if (c.t === 'not') return name(P, c.a, true) + ' ' + C(c.b).neg + ' ' + obj(P, c.b) + '.';
    if (c.t === 'or') return name(P, c.a, true) + ' ' + C(c.b).verb + ' either ' + obj(P, c.b) + ' or ' + obj(P, c.c) + '.';
    return 'Neither ' + name(P, c.a) + ' nor ' + name(P, c.b) + ' ' + C(c.c).verb + ' ' + obj(P, c.c) + '.';
  }
  function css(id, s) { if (!document.getElementById(id)) document.head.appendChild(h('style', { id: id, text: s })); }
  css('tlg-css', '.tlg-wrap{overflow:auto;max-width:100%}.tlg{border-collapse:collapse;margin:0 auto;font:600 13px/1.2 var(--ui)}.tlg th{padding:3px;color:var(--ink)}.tlg th.v{writing-mode:vertical-rl;transform:rotate(180deg);text-align:left;height:76px;white-space:nowrap}' +
    '.tlg th.h{text-align:right;white-space:nowrap;padding-right:6px}.tlg th.cat{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.04em}.tlg td{padding:0;border:1px solid var(--line)}.tlg td.e{border:0}' +
    '.tlg td.end{border-right:2px solid var(--ink)}.tlg tr.end td{border-bottom:2px solid var(--ink)}.tlg button{all:unset;box-sizing:border-box;display:grid;place-items:center;width:30px;height:30px;cursor:pointer;font:800 16px/1 var(--ui);color:var(--muted)}' +
    '.tlg button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}.tlg button.y{color:#16a34a}.tlg button.bad{background:rgba(220,38,38,.18)}' +
    '.tlg-clues{margin:0;padding-left:22px;display:grid;gap:6px}.tlg-clues li{cursor:pointer}.tlg-clues li.x{text-decoration:line-through;color:var(--muted)}');
  var P, marks = {}, done = false, auto = h('input', { type: 'checkbox', checked: true });
  var size = T.select([[3, 'Easy: 3 people'], [4, 'Medium: 4 people'], [5, 'Hard: 5 people']], T.store.get('lg-size', 4));
  var wrap = h('div', { 'class': 'tlg-wrap' }), clueList = h('ol', { 'class': 'tlg-clues' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700' }), intro = h('p', {});
  // the grid's three blocks: [row category, column category]
  var BLOCKS = [[0, 1], [0, 2], [2, 1]];
  function label(c, i) { return c === 0 ? P.people[i] : P.cats[c - 1].items[i]; }
  function key(b, r, c) { return b + ':' + r + ':' + c; }
  function newGame() {
    T.store.set('lg-size', +size.value); status.info('Making a puzzle…');
    setTimeout(function () {
      P = make(+size.value); marks = {}; done = false; out.textContent = ''; status.clear();
      intro.textContent = P.n + ' friends, ' + P.people.join(', ') + ', each have a different ' + P.cats[0].label.toLowerCase() + ' and a different ' + P.cats[1].label.toLowerCase() + '. Use the clues to find out who has what.';
      clueList.innerHTML = '';
      P.clues.forEach(function (c) { var li = h('li', { text: text(P, c), title: 'Tap to cross off', onclick: function () { li.classList.toggle('x'); } }); clueList.appendChild(li); });
      draw();
    }, 20);
  }
  function draw() {
    var n = P.n, tb = h('table', { 'class': 'tlg' }), head = h('tr', {}, [h('th', {}), h('th', {})]), head2 = h('tr', {}, [h('th', {}), h('th', {})]);
    [1, 2].forEach(function (c) {
      head.appendChild(h('th', { 'class': 'cat', colspan: String(n), text: P.cats[c - 1].label }));
      for (var i = 0; i < n; i++) head2.appendChild(h('th', { 'class': 'v', text: label(c, i) }));
    });
    tb.appendChild(head); tb.appendChild(head2);
    [0, 2].forEach(function (rc) {
      for (var r = 0; r < n; r++) {
        var tr = h('tr', { 'class': r === n - 1 ? 'end' : '' });
        if (r === 0) tr.appendChild(h('th', { 'class': 'cat v', rowspan: String(n), text: rc === 0 ? 'Name' : P.cats[1].label }));
        tr.appendChild(h('th', { 'class': 'h', text: label(rc, r) }));
        [1, 2].forEach(function (cc) {
          for (var c = 0; c < n; c++) {
            if (rc === 2 && cc === 2) { tr.appendChild(h('td', { 'class': 'e' })); continue; }
            var b = rc === 0 ? cc - 1 : 2, k = key(b, r, c), v = marks[k] || 0;
            (function (b, r, c, k) {
              tr.appendChild(h('td', { 'class': c === n - 1 && cc === 1 ? 'end' : '' }, [h('button', { type: 'button', 'class': v === 2 ? 'y' : '', 'data-k': k, 'aria-label': label(BLOCKS[b][0], r) + ' and ' + label(BLOCKS[b][1], c) + ': ' + ['unknown', 'no', 'yes'][v], text: ['', '✕', '●'][v], onclick: function () { tap(b, r, c); } })]));
            })(b, r, c, k);
          }
        });
        tb.appendChild(tr);
      }
    });
    wrap.innerHTML = ''; wrap.appendChild(tb);
  }
  function tap(b, r, c) {
    if (done) return;
    var k = key(b, r, c), v = ((marks[k] || 0) + 1) % 3;
    marks[k] = v;
    if (v === 2 && auto.checked) for (var i = 0; i < P.n; i++) { if (i !== c && !marks[key(b, r, i)]) marks[key(b, r, i)] = 1; if (i !== r && !marks[key(b, i, c)]) marks[key(b, i, c)] = 1; }
    draw(); var btn = wrap.querySelector('[data-k="' + k + '"]'); if (btn) btn.focus();
    won();
  }
  function truth(b, r, c) { var s = P.sol; return b === 0 ? s[0][r] === c : b === 1 ? s[1][r] === c : s[0].indexOf(c) === s[1].indexOf(r); }
  function won() {
    for (var b = 0; b < 2; b++) for (var r = 0; r < P.n; r++) for (var c = 0; c < P.n; c++) if ((marks[key(b, r, c)] === 2) !== truth(b, r, c)) return;
    done = true;
    out.textContent = '🎉 Solved! ' + P.people.map(function (p, i) { return p + ': ' + P.cats[0].items[P.sol[0][i]] + ', ' + P.cats[1].items[P.sol[1][i]]; }).join(' · ');
    status.ok('Every match is right.');
  }
  function check() {
    var bad = 0;
    Object.keys(marks).forEach(function (k) { var p = k.split(':').map(Number), v = marks[k]; if ((v === 2 && !truth(p[0], p[1], p[2])) || (v === 1 && truth(p[0], p[1], p[2]))) { bad++; var el = wrap.querySelector('[data-k="' + k + '"]'); if (el) el.classList.add('bad'); } });
    if (bad) status.error(bad + (bad === 1 ? ' mark is' : ' marks are') + ' wrong (shaded red).'); else status.info('No mistakes so far.');
  }
  function hint() {
    if (done) return;
    for (var b = 0; b < 2; b++) for (var r = 0; r < P.n; r++) for (var c = 0; c < P.n; c++) if (truth(b, r, c) && marks[key(b, r, c)] !== 2) {
      marks[key(b, r, c)] = 1; tap(b, r, c); status.info('Hint: ' + label(BLOCKS[b][0], r) + ' goes with ' + label(BLOCKS[b][1], c) + '.'); return;
    }
  }
  spot.appendChild(T.card([T.row([T.field('Level', size), T.button('New puzzle', { primary: true, onclick: newGame })]), intro,
    h('div', {}, [h('b', { text: 'Clues' }), clueList]), wrap,
    h('p', { 'class': 'tstatus', text: 'Tap a square once for ✕ (no), twice for ● (yes), three times to clear.' }),
    h('label', { 'class': 'tcheck' }, [auto, ' When I place ●, cross out the rest of its row and column']),
    T.row([T.button('Check', { small: true, onclick: check }), T.button('Hint', { small: true, onclick: hint }), T.button('Clear grid', { small: true, onclick: function () { marks = {}; done = false; out.textContent = ''; draw(); } })]),
    status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  newGame();
  T.tests['logic-grid'] = function () {
    var f = [];
    [3, 4, 5].forEach(function (n) {
      var p = make(n);
      if (count(p, p.clues, 2) !== 1) f.push(n + ': not exactly one answer');
      p.clues.forEach(function (c) { if (!holds(p.sol, c)) f.push('false clue'); var t = text(p, c); if (/%|undefined/.test(t) || t.length < 10) f.push('bad text ' + t); });
    });
    var q = { n: 3, people: ['A', 'B', 'C'], cats: [{ label: 'Pet', items: ['cat', 'dog', 'fish'], verb: 'owns', neg: 'does not own', obj: 'the %', noun: 'the % owner' }, { label: 'Drink', items: ['tea', 'milk', 'juice'], verb: 'drinks', neg: 'does not drink', obj: '%', noun: 'the % drinker' }], sol: [[0, 1, 2], [2, 0, 1]] };
    if (text(q, { t: 'not', a: [0, 1], b: [2, 0] }) !== 'B does not drink tea.') f.push('text ' + text(q, { t: 'not', a: [0, 1], b: [2, 0] }));
    if (text(q, { t: 'or', a: [0, 0], b: [1, 1], c: [1, 2] }) !== 'A owns either the dog or the fish.') f.push('text ' + text(q, { t: 'or', a: [0, 0], b: [1, 1], c: [1, 2] }));
    if (!holds(q.sol, { t: 'is', a: [1, 2], b: [2, 1] })) f.push('holds');
    if (text(q, { t: 'nor', a: [0, 0], b: [1, 1], c: [2, 2] }) !== 'Neither A nor the dog owner drinks juice.') f.push('text nor');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f.slice(0, 5) });
  };
});
