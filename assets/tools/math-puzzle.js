/* Infinity by GroupChatOn — math-puzzle. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Daily maths puzzle: reach the target number with + − × ÷ using the given numbers (each once at most); a new puzzle each day plus practice. */
GCOTools.register('math-puzzle', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function seeded(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  // every whole number reachable from the numbers (each used at most once), with one way to write it
  function reach(nums) {
    var found = {}, seen = {};
    (function go(items) {
      items.forEach(function (it) { if (!(it[0] in found) || it[2] < found[it[0]][1]) found[it[0]] = [it[1], it[2]]; });
      var key = items.map(function (it) { return it[0]; }).sort(function (a, b) { return a - b; }).join(',');
      if (seen[key] || items.length < 2) return; seen[key] = 1;
      for (var i = 0; i < items.length; i++) for (var j = 0; j < items.length; j++) {
        if (i === j) continue;
        var a = items[i], b = items[j], rest = items.filter(function (x, k) { return k !== i && k !== j; }), n = a[2] + b[2], res = [];
        if (i < j) { res.push([a[0] + b[0], '(' + a[1] + ' + ' + b[1] + ')', n]); if (a[0] > 1 && b[0] > 1) res.push([a[0] * b[0], '(' + a[1] + ' × ' + b[1] + ')', n]); }
        if (a[0] > b[0]) res.push([a[0] - b[0], '(' + a[1] + ' − ' + b[1] + ')', n]);
        if (b[0] > 1 && a[0] % b[0] === 0) res.push([a[0] / b[0], '(' + a[1] + ' ÷ ' + b[1] + ')', n]);
        res.forEach(function (r) { go(rest.concat([r])); });
      }
    })(nums.map(function (v) { return [v, String(v), 1]; }));
    Object.keys(found).forEach(function (k) { found[k][0] = found[k][0].replace(/^\((.*)\)$/, '$1'); });
    return found;
  }
  var LEVELS = { easy: [4, 10, 40], medium: [5, 30, 150], hard: [6, 100, 600] };
  function make(level, rand) {
    var L = LEVELS[level], nums = [], big = [10, 15, 20, 25, 50, 75];
    for (var i = 0; i < L[0] - (level === 'easy' ? 0 : 1); i++) nums.push(1 + Math.floor(rand() * 9));
    if (level !== 'easy') nums.push(big[Math.floor(rand() * (level === 'hard' ? 6 : 4))]);
    var all = reach(nums), good = Object.keys(all).filter(function (k) { return +k >= L[1] && +k <= L[2] && all[k][1] >= Math.min(3, L[0]) && nums.indexOf(+k) < 0; });
    if (!good.length) good = Object.keys(all).filter(function (k) { return +k >= L[1]; });
    var t = good[Math.floor(rand() * good.length)];
    return { nums: nums, target: +t, answer: all[t][0], reach: all };
  }
  // reads the player's sum: numbers, + − × ÷ * / x and brackets
  function evaluate(s) {
    var toks = String(s).replace(/[×x*]/g, '*').replace(/[÷/]/g, '/').replace(/[−–]/g, '-').match(/\d+|[-+*/()]|\S/g) || [], p = 0, used = [];
    function num() {
      var t = toks[p++];
      if (t === '(') { var v = add(); if (toks[p++] !== ')') throw new Error('A bracket is not closed.'); return v; }
      if (t === '-') return -num();
      if (!/^\d+$/.test(t || '')) throw new Error(t ? 'Unexpected “' + t + '”.' : 'The sum ends too early.');
      used.push(+t); return +t;
    }
    function mul() { var v = num(); while (toks[p] === '*' || toks[p] === '/') { var o = toks[p++], r = num(); if (o === '/' && r === 0) throw new Error('You cannot divide by zero.'); v = o === '*' ? v * r : v / r; } return v; }
    function add() { var v = mul(); while (toks[p] === '+' || toks[p] === '-') { var o = toks[p++], r = mul(); v = o === '+' ? v + r : v - r; } return v; }
    if (!toks.length) throw new Error('Type a sum, for example (7 + 3) × 5.');
    var v = add(); if (p < toks.length) throw new Error('Unexpected “' + toks[p] + '”.');
    return { value: v, used: used };
  }
  function fits(used, nums) { var pool = nums.slice(); for (var i = 0; i < used.length; i++) { var k = pool.indexOf(used[i]); if (k < 0) return false; pool.splice(k, 1); } return true; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var P = null, level = T.store.get('mp-level', 'medium'), daily = true, solved = false;
  var targetEl = h('div', { 'data-out': '', style: 'font:900 54px/1 var(--ui);text-align:center;color:var(--accent)' }), title = h('h3', { text: '' });
  var chips = h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center' });
  var input = h('input', { type: 'text', inputmode: 'text', autocomplete: 'off', 'class': 'tmono', placeholder: 'e.g. (7 + 3) × 5 − 2', 'aria-label': 'Your sum', style: 'font-size:20px;text-align:center' });
  var live = h('div', { 'aria-live': 'polite', style: 'text-align:center;font-weight:700;min-height:22px' }), out = h('div', { 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var ops = h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center' });
  ['+', '−', '×', '÷', '(', ')'].forEach(function (o) { ops.appendChild(T.button(o, { small: true, onclick: function () { input.value += (/[+−×÷]/.test(o) ? ' ' + o + ' ' : o); check(false); } })); });
  ops.appendChild(T.button('⌫', { small: true, onclick: function () { input.value = input.value.replace(/\s*\S\s*$/, ''); check(false); } }));
  ops.appendChild(T.button('Clear', { small: true, onclick: function () { input.value = ''; check(false); } }));
  var lvSeg = T.seg([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], level, function (v) { level = v; T.store.set('mp-level', v); if (daily) loadDaily(); else practice(); });
  function show(p, label) {
    P = p; solved = false; input.value = ''; out.textContent = ''; status.clear();
    targetEl.textContent = String(p.target); title.textContent = label;
    check(false);
    var done = T.store.get('mp-done', {}); if (daily && done[today() + level]) { out.textContent = '✅ You already solved today’s ' + level + ' puzzle. Try practice puzzles!'; }
  }
  function drawChips(used) {
    chips.innerHTML = '';
    var cnt = {}; (used || []).forEach(function (u) { cnt[u] = (cnt[u] || 0) + 1; });
    P.nums.forEach(function (n) {
      var spent = cnt[n] > 0; if (spent) cnt[n]--;
      chips.appendChild(h('button', { type: 'button', 'class': 'tbtn', disabled: spent ? true : null, style: 'min-width:52px;font:800 22px/1 var(--ui)', onclick: function () { input.value += String(n); check(false); } }, [String(n)]));
    });
  }
  function check(final) {
    var s = input.value.trim();
    if (!s) { live.textContent = ''; drawChips([]); return; }
    try {
      var r = evaluate(s); drawChips(r.used);
      if (!fits(r.used, P.nums)) { live.textContent = 'Use only the numbers shown, each once.'; live.style.color = '#dc2626'; return; }
      var v = Math.round(r.value * 1e9) / 1e9;
      live.style.color = ''; live.textContent = '= ' + (Number.isInteger(v) ? v : v.toFixed(3));
      if (Math.abs(r.value - P.target) < 1e-9 && !solved) {
        solved = true; live.textContent = '= ' + P.target + ' ✓';
        out.textContent = '🎉 Solved! ' + s + ' = ' + P.target;
        if (daily) { var d = T.store.get('mp-done', {}); d[today() + level] = 1; T.store.set('mp-done', d); }
      } else if (final) status.info('That makes ' + (Number.isInteger(v) ? v : v.toFixed(3)) + ', not ' + P.target + '. Keep trying!');
    } catch (e) { live.textContent = ''; drawChips([]); if (final) status.error(e); }
  }
  function loadDaily() { daily = true; show(make(level, seeded(hash('gco-math-' + today() + level))), 'Today’s ' + level + ' puzzle (' + today() + ')'); }
  function practice() { daily = false; show(make(level, function () { return rnd(1e9) / 1e9; }), 'Practice: ' + level); }
  input.addEventListener('input', function () { check(false); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(true); });
  spot.appendChild(T.card([lvSeg, T.row([T.button('Today’s puzzle', { primary: true, onclick: loadDaily }), T.button('Practice puzzle', { small: true, onclick: practice })]),
    title, h('p', { style: 'text-align:center;margin:0', text: 'Make this number:' }), targetEl, h('p', { style: 'text-align:center;margin:0', text: 'using these numbers (each one once, you do not need them all):' }), chips,
    input, ops, live, T.row([T.button('Check', { primary: true, onclick: function () { check(true); } }), T.button('Show a solution', { small: true, onclick: function () { out.textContent = 'One way: ' + P.answer + ' = ' + P.target; solved = true; } })]),
    status.el, out]));
  loadDaily();
  T.tests['math-puzzle'] = function () {
    var f = [], e = evaluate('(7 + 3) × 5 − 2');
    if (e.value !== 48 || e.used.join() !== '7,3,5,2') f.push('evaluate ' + e.value);
    if (evaluate('8 ÷ 4 + 6 x 2').value !== 14) f.push('precedence');
    try { evaluate('(3 + 4'); f.push('open bracket accepted'); } catch (x) {}
    if (fits([3, 3], [3, 4]) || !fits([3, 4], [4, 3, 9])) f.push('fits');
    var r = reach([1, 2, 3, 4]);
    if (!r[24] || evaluate(r[24][0]).value !== 24) f.push('24 from 1 2 3 4');
    ['easy', 'medium', 'hard'].forEach(function (lv) {
      var p = make(lv, seeded(7)), s = evaluate(p.answer);
      if (s.value !== p.target || !fits(s.used, p.nums)) f.push(lv + ' answer does not work: ' + p.answer + ' = ' + p.target);
      if (p.target < LEVELS[lv][1]) f.push(lv + ' target too small');
    });
    return Promise.resolve({ ok: !f.length, n: 8, fails: f });
  };
});
