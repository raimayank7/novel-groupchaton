/* Infinity by GroupChatOn — multiplication. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Multiplication tables: any number up to 10, 12 or 20, a 1–12 chart, and a quick practice quiz with a score. */
GCOTools.register('multiplication', function (spot, T) {
  var h = T.h, status = T.status();
  function table(n, upto) { var out = []; for (var i = 1; i <= upto; i++) out.push(n + ' × ' + i + ' = ' + n * i); return out; }
  function rnd(n) { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
  function questions(lo, hi, count) {   // distinct a × b with a from lo..hi, b from 1..10 (2..10 when possible)
    var all = [];
    for (var a = lo; a <= hi; a++) for (var b = 2; b <= 10; b++) all.push([a, b]);
    for (var i = all.length - 1; i > 0; i--) { var j = rnd(i + 1), t = all[i]; all[i] = all[j]; all[j] = t; }
    return all.slice(0, count);
  }
  var num = h('input', { type: 'number', min: '1', max: '10000', value: '7', inputmode: 'numeric' }), upto = T.seg([['10', 'to 10'], ['12', 'to 12'], ['20', 'to 20']], '10', draw);
  var out = h('div', { 'data-out': '', style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;font:600 20px/1.4 var(--ui);font-variant-numeric:tabular-nums' });
  function draw() {
    var n = Math.round(+num.value); out.innerHTML = '';
    if (!(n >= 1 && n <= 10000)) return status.error('Type a whole number from 1 to 10,000.');
    status.clear();
    table(n, +upto.value()).forEach(function (l) { out.appendChild(h('div', { style: 'padding:6px 10px;border-radius:10px;background:var(--bg)', text: l })); });
  }
  num.addEventListener('input', draw);
  var chart = h('div', { style: 'overflow-x:auto', hidden: true });
  function drawChart() {
    var rows = []; for (var a = 1; a <= 12; a++) { var r = []; for (var b = 1; b <= 12; b++) r.push(a * b); rows.push(r); }
    chart.innerHTML = '';
    chart.appendChild(h('table', { style: 'min-width:520px' }, [h('thead', {}, [h('tr', {}, [h('th', { text: '×' })].concat(rows[0].map(function (x) { return h('th', { text: String(x), style: 'text-align:center' }); })))]),
      h('tbody', {}, rows.map(function (r, i) { return h('tr', {}, [h('th', { text: String(i + 1) })].concat(r.map(function (x, j) { return h('td', { text: String(x), style: 'text-align:center' + (i === j ? ';background:var(--accent-soft);font-weight:700' : '') }); }))); }))]));
  }
  // practice
  var lo = h('input', { type: 'number', min: '1', max: '100', value: '2' }), hi = h('input', { type: 'number', min: '1', max: '100', value: '9' });
  var qText = h('div', { style: 'font:800 34px/1.2 var(--ui);text-align:center' }), ans = h('input', { type: 'number', inputmode: 'numeric', placeholder: 'Answer', 'aria-label': 'Your answer', style: 'font-size:22px;text-align:center' });
  var fb = h('p', { 'class': 'tnote', style: 'text-align:center;font-weight:600' }), quiz = h('div', { style: 'display:grid;gap:10px', hidden: true }, [qText, ans, T.row([T.button('Check', { primary: true, onclick: check })]), fb]);
  var qs = [], qi = 0, score = 0, t0 = 0;
  function startQuiz() {
    var a = Math.round(+lo.value), b = Math.round(+hi.value); if (!(a >= 1 && b >= a && b <= 100)) return status.error('Choose tables from 1 to 100 (from ≤ to).');
    status.clear(); qs = questions(a, b, 10); qi = 0; score = 0; t0 = Date.now(); quiz.hidden = false; next();
  }
  function next() { if (qi >= qs.length) { var s = Math.round((Date.now() - t0) / 1000); qText.textContent = 'Score: ' + score + ' / ' + qs.length; fb.textContent = (score === qs.length ? '🌟 Perfect! ' : score >= 7 ? '👍 Well done! ' : '💪 Keep practising! ') + 'Time: ' + s + ' seconds.'; ans.hidden = true; return; } ans.hidden = false; qText.textContent = qs[qi][0] + ' × ' + qs[qi][1] + ' = ?'; ans.value = ''; ans.focus(); }
  function check() {
    if (qi >= qs.length || ans.value === '') return;
    var q = qs[qi], ok = +ans.value === q[0] * q[1];
    if (ok) score++; fb.textContent = ok ? '✅ Correct!' : '❌ ' + q[0] + ' × ' + q[1] + ' = ' + q[0] * q[1]; fb.style.color = ok ? '#16a34a' : '#dc2626';
    qi++; setTimeout(next, ok ? 500 : 1400);
  }
  ans.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Table of', num), T.field('Up to', upto)]), status.el, out,
    T.row([T.button('Show 1–12 chart', { small: true, onclick: function () { chart.hidden = !chart.hidden; if (!chart.hidden) drawChart(); } }),
      T.button('Copy table', { small: true, onclick: function (e) { T.copy(table(+num.value, +upto.value()).join('\n'), e.currentTarget); } })]), chart,
    h('h3', { text: 'Practice quiz (10 questions)' }), h('div', { 'class': 'tgrid2' }, [T.field('Tables from', lo), T.field('to', hi)]),
    T.row([T.button('Start quiz', { onclick: startQuiz })]), quiz]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests.multiplication = function () {
    var f = [], t = table(7, 10);
    if (t.length !== 10 || t[9] !== '7 × 10 = 70' || t[0] !== '7 × 1 = 7') f.push('table of 7');
    if (table(13, 12)[11] !== '13 × 12 = 156') f.push('table of 13');
    var q = questions(2, 3, 10), seen = {};
    q.forEach(function (x) { seen[x.join('x')] = 1; if (x[0] < 2 || x[0] > 3 || x[1] < 2 || x[1] > 10) f.push('range ' + x); });
    if (q.length !== 10 || Object.keys(seen).length !== 10) f.push('distinct questions');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
