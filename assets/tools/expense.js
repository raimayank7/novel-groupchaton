/* Infinity by GroupChatOn — expense. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Daily expense tracker: log what you spend in a few taps, see today, this week and this month by category, set a daily budget, export CSV. Saved on this device. */
GCOTools.register('expense', function (spot, T) {
  var h = T.h, status = T.status(), V = T.vault('daily-expense', { items: [], budget: 0 });
  var CATS = [['food', '🍽️', 'Food'], ['grocery', '🛒', 'Groceries'], ['travel', '🚌', 'Travel'], ['fuel', '⛽', 'Fuel'], ['bills', '💡', 'Bills'], ['shop', '🛍️', 'Shopping'], ['health', '💊', 'Health'], ['fun', '🎬', 'Fun'], ['kids', '🧸', 'Kids'], ['other', '📦', 'Other']];
  function cat(id) { return CATS.filter(function (c) { return c[0] === id; })[0] || CATS[CATS.length - 1]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function summary(items, today) {
    var t = new Date(today + 'T12:00:00'), wk = new Date(t); wk.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    var wkey = dkey(wk), mkey = today.slice(0, 7), s = { today: 0, week: 0, month: 0, byCat: {} };
    items.forEach(function (x) {
      if (x.d === today) s.today += x.a;
      if (x.d >= wkey && x.d <= today) s.week += x.a;
      if (x.d.slice(0, 7) === mkey) { s.month += x.a; s.byCat[x.c] = (s.byCat[x.c] || 0) + x.a; }
    });
    return s;
  }
  function csv(items) { return 'Date,Category,Amount,Note\n' + items.map(function (x) { return [x.d, cat(x.c)[2], x.a, '"' + String(x.n || '').replace(/"/g, '""') + '"'].join(','); }).join('\n'); }
  var amt = h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', placeholder: 'Amount', 'aria-label': 'Amount' }), note = h('input', { type: 'text', placeholder: 'Note (optional)', 'aria-label': 'Note' });
  var date = h('input', { type: 'date', value: dkey(new Date()), 'aria-label': 'Date' }), pick = 'food', budget = h('input', { type: 'number', min: '0', step: '1', placeholder: 'e.g. 500', 'aria-label': 'Daily budget' });
  var catRow = h('div', { 'class': 'trow' }), sumBox = h('div', { 'class': 'tsum', 'data-out': '' }), bars = h('div', { style: 'display:grid;gap:6px' }), list = h('div', { 'class': 'tlist', style: 'grid-template-columns:minmax(0,1fr)' });
  function drawCats() { catRow.innerHTML = ''; CATS.forEach(function (c) { catRow.appendChild(h('button', { type: 'button', 'class': 'tbtn tbtn-sm', 'aria-pressed': String(c[0] === pick), style: c[0] === pick ? 'background:var(--accent-soft);border-color:var(--accent)' : '', text: c[1] + ' ' + c[2], onclick: function () { pick = c[0]; drawCats(); } })); }); }
  function draw() {
    var d = V.data(), today = dkey(new Date()), s = summary(d.items, today), b = d.budget || 0;
    budget.value = b || '';
    sumBox.innerHTML = '';
    [['Today', s.today, b ? (s.today > b ? 'over budget by ' + T.money(s.today - b) : T.money(b - s.today) + ' left of ' + T.money(b)) : ''], ['This week', s.week, ''], ['This month', s.month, '']].forEach(function (x) {
      sumBox.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { text: T.money(x[1]), style: x[0] === 'Today' && b && s.today > b ? 'color:#dc2626' : '' }), x[2] ? h('small', { style: 'color:var(--muted)', text: x[2] }) : null]));
    });
    bars.innerHTML = '';
    var top = Object.keys(s.byCat).sort(function (a, c) { return s.byCat[c] - s.byCat[a]; });
    top.forEach(function (k) { var c = cat(k), pc = s.month ? s.byCat[k] / s.month * 100 : 0; bars.appendChild(h('div', {}, [h('div', { 'class': 'trow trow-split', style: 'font-size:14px' }, [h('span', { text: c[1] + ' ' + c[2] }), h('b', { text: T.money(s.byCat[k]) + ' · ' + Math.round(pc) + '%' })]), h('div', { 'class': 'tmeter' }, [h('span', { style: 'width:' + pc.toFixed(1) + '%;background-color:var(--accent)' })])])); });
    list.innerHTML = '';
    var last = '', shown = d.items.slice().sort(function (a, c) { return a.d < c.d ? 1 : a.d > c.d ? -1 : c.t - a.t; }).slice(0, 60);
    shown.forEach(function (x) {
      if (x.d !== last) { last = x.d; var tot = d.items.filter(function (y) { return y.d === x.d; }).reduce(function (a, y) { return a + y.a; }, 0); list.appendChild(h('div', { 'class': 'tday' }, [h('span', { text: new Date(x.d + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) }), h('span', { text: T.money(tot) })])); }
      var c = cat(x.c);
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: c[1] }), h('span', { 'class': 'titem-main' }, [h('b', { text: x.n || c[2] }), h('small', { text: c[2] })]), h('span', { 'class': 'titem-amt', text: T.money(x.a) }),
        h('button', { type: 'button', 'aria-label': 'Delete', text: '✕', onclick: function () { if (!confirm('Delete this expense?')) return; d.items.splice(d.items.indexOf(x), 1); V.save(d); draw(); } })]));
    });
    if (!d.items.length) list.appendChild(h('p', { 'class': 'tnote', text: 'No expenses yet. Type an amount, pick a category and press Add.' }));
  }
  function addOne() {
    var a = Math.round(+amt.value * 100) / 100;
    if (!(a > 0)) { status.error('Type an amount above zero.'); amt.focus(); return; }
    var d = V.data(); d.items.push({ d: date.value || dkey(new Date()), c: pick, a: a, n: note.value.trim().slice(0, 80), t: Date.now() }); V.save(d);
    amt.value = ''; note.value = ''; status.ok('Added ' + T.money(a) + ' for ' + cat(pick)[2] + '.'); amt.focus(); draw();
  }
  amt.addEventListener('keydown', function (e) { if (e.key === 'Enter') addOne(); }); note.addEventListener('keydown', function (e) { if (e.key === 'Enter') addOne(); });
  budget.addEventListener('change', function () { var d = V.data(); d.budget = Math.max(0, +budget.value || 0); V.save(d); draw(); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Amount (' + T.currency() + ')', amt), T.field('Date', date)]), catRow, T.field('Note', note),
    T.row([T.button('Add expense', { primary: true, onclick: addOne })]), status.el, sumBox, T.field('Daily budget (optional)', budget),
    h('b', { text: 'This month by category' }), bars, h('b', { text: 'Recent' }), list,
    T.row([T.button('Download CSV', { small: true, onclick: function () { T.download(new Blob([csv(V.data().items)], { type: 'text/csv;charset=utf-8' }), 'expenses-' + dkey(new Date()) + '.csv'); } })]), V.bar(draw)]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  drawCats();
  V.ready.then(draw);
  T.tests['expense'] = function () {
    var f = [], L = [{ d: '2026-11-04', c: 'food', a: 100 }, { d: '2026-11-02', c: 'fuel', a: 500 }, { d: '2026-11-01', c: 'food', a: 50 }, { d: '2026-10-31', c: 'bills', a: 999 }];
    var s = summary(L, '2026-11-04');   // a Wednesday: the week started Monday 2 November
    if (s.today !== 100 || s.week !== 600 || s.month !== 650) f.push('totals ' + JSON.stringify(s));
    if (s.byCat.food !== 150 || s.byCat.bills) f.push('by category');
    if (csv([{ d: '2026-11-01', c: 'food', a: 5, n: 'Tea "cutting"' }]) !== 'Date,Category,Amount,Note\n2026-11-01,Food,5,"Tea ""cutting"""') f.push('csv');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
