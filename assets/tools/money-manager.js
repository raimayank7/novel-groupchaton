/* Infinity by GroupChatOn — money-manager. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Daily income and expenses, kept only in this browser. */
GCOTools.register('money-manager', function (spot, T) {
  var h = T.h, V = T.vault('money', { entries: [], budget: 0 });
  var OUT = [['food', '🍛', 'Food & groceries'], ['travel', '⛽', 'Transport & fuel'], ['bills', '💡', 'Bills & recharge'], ['home', '🏠', 'Rent & home'], ['shop', '🛍️', 'Shopping'],
    ['health', '💊', 'Health'], ['edu', '📚', 'Education'], ['fun', '🎬', 'Entertainment'], ['family', '🎁', 'Family & gifts'], ['emi', '🏦', 'EMI & loans'], ['save', '📈', 'Savings & investment'], ['other', '🧾', 'Other']];
  var IN = [['salary', '💼', 'Salary'], ['business', '🏪', 'Business'], ['freelance', '💻', 'Freelance'], ['interest', '💰', 'Interest & dividends'], ['gift', '🎁', 'Gift received'], ['refund', '↩️', 'Refund'], ['other', '🧾', 'Other']];
  var PAY = ['Cash', 'UPI', 'Card', 'Bank', 'Wallet'];
  var db = V.data(), editing = null;
  function catOf(type, id) { return (type === 'in' ? IN : OUT).filter(function (c) { return c[0] === id; })[0] || ['other', '🧾', 'Other']; }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var month = iso(new Date()).slice(0, 7);

  // ---- add / edit form ----
  var type = 'out';
  var typeSeg = T.seg([['out', '− Expense'], ['in', '+ Income']], 'out', function (v) { type = v; fillCats(); });
  var amt = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: '0' });
  var cat = h('select', {});
  var date = h('input', { type: 'date', value: iso(new Date()) });
  var note = h('input', { type: 'text', placeholder: 'e.g. vegetables, petrol, electricity bill' });
  var pay = T.select(PAY, 'UPI');
  function fillCats(sel) { cat.innerHTML = ''; (type === 'in' ? IN : OUT).forEach(function (c) { cat.appendChild(h('option', { value: c[0], selected: c[0] === sel ? true : null }, [c[1] + ' ' + c[2]])); }); }
  fillCats();
  var msg = T.status();
  var addBtn = T.button('Add', { primary: true, onclick: function () { add(); } });
  var cancel = T.button('Cancel', { small: true, onclick: function () { stopEdit(); } }); cancel.hidden = true;
  function add() {
    var a = parseFloat(amt.value);
    if (!(a > 0)) { msg.error('Type an amount.'); amt.focus(); return; }
    var e = { id: editing || Date.now().toString(36) + Math.random().toString(36).slice(2, 6), d: date.value || iso(new Date()), t: type, a: Math.round(a * 100) / 100, c: cat.value, n: note.value.trim(), p: pay.value };
    db.entries = db.entries.filter(function (x) { return x.id !== e.id; });
    db.entries.push(e);
    V.save(db);
    msg.ok(editing ? 'Updated.' : (type === 'in' ? 'Income' : 'Expense') + ' of ' + T.money(e.a) + ' added.');
    month = e.d.slice(0, 7); monthIn.value = month;
    stopEdit(); draw();
  }
  function stopEdit() { editing = null; amt.value = ''; note.value = ''; addBtn.textContent = 'Add'; cancel.hidden = true; }
  function edit(e) {
    editing = e.id; type = e.t; typeSeg.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-pressed', String((i === 0) === (e.t === 'out'))); });
    fillCats(e.c); amt.value = e.a; date.value = e.d; note.value = e.n || ''; pay.value = e.p || 'Cash';
    addBtn.textContent = 'Save changes'; cancel.hidden = false; amt.focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  [amt, note].forEach(function (x) { x.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') add(); }); });
  var form = h('div', { 'class': 'tool-app-opts' }, [typeSeg, h('div', { 'class': 'tgrid2' }, [T.field('Amount (' + T.currency() + ')', amt), T.field('Category', cat), T.field('Date', date), T.field('Paid / received by', pay), T.field('Note (optional)', note)]), T.row([addBtn, cancel]), msg.el]);

  // ---- month view ----
  var monthIn = h('input', { type: 'month', value: month, 'aria-label': 'Month' });
  monthIn.addEventListener('change', function () { if (monthIn.value) { month = monthIn.value; draw(); } });
  function shift(n) { var p = month.split('-').map(Number), d = new Date(p[0], p[1] - 1 + n, 1); month = iso(d).slice(0, 7); monthIn.value = month; draw(); }
  var sum = h('div', { 'class': 'tsum', 'data-out': '' });
  var budgetIn = h('input', { type: 'number', min: '0', step: 'any', value: db.budget || '', placeholder: 'e.g. 30000' });
  budgetIn.addEventListener('change', function () { db.budget = parseFloat(budgetIn.value) || 0; V.save(db); draw(); });
  var budgetBar = h('div', { 'class': 'tprogress' }, [h('span')]), budgetMsg = h('p', { 'class': 'tnote' });
  var cats = h('div', { 'class': 'tlist' });
  var search = h('input', { type: 'search', placeholder: 'Search notes and categories…' });
  search.addEventListener('input', function () { draw(); });
  var list = h('div', { 'class': 'tlist', 'data-out': '' });

  function totals(m) {
    var r = { inc: 0, exp: 0, byCat: {}, all: 0 };
    db.entries.forEach(function (e) {
      r.all += e.t === 'in' ? e.a : -e.a;
      if (m && e.d.slice(0, 7) !== m) return;
      if (e.t === 'in') r.inc += e.a; else { r.exp += e.a; r.byCat[e.c] = (r.byCat[e.c] || 0) + e.a; }
    });
    return r;
  }
  function draw() {
    db = V.data();
    var t = totals(month);
    sum.innerHTML = '';
    [['Income this month', t.inc, 'tin-c'], ['Spent this month', t.exp, 'tout-c'], ['Left this month', t.inc - t.exp, t.inc - t.exp < 0 ? 'tout-c' : 'tin-c'], ['Balance (all time)', t.all, '']].forEach(function (x) {
      sum.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: T.money(x[1]) })]));
    });
    if (db.budget > 0) {
      var p = t.exp / db.budget; budgetBar.hidden = false; budgetBar.firstChild.style.width = Math.min(100, p * 100) + '%';
      budgetBar.firstChild.style.background = p > 1 ? '#dc2626' : p > 0.8 ? '#f59e0b' : '';
      budgetMsg.textContent = p > 1 ? 'Over budget by ' + T.money(t.exp - db.budget) + '.' : T.money(db.budget - t.exp) + ' left of your ' + T.money(db.budget) + ' budget (' + Math.round(p * 100) + '% used).';
    } else { budgetBar.hidden = true; budgetMsg.textContent = 'Set a monthly budget to see how much is left.'; }
    cats.innerHTML = '';
    Object.keys(t.byCat).sort(function (a, b) { return t.byCat[b] - t.byCat[a]; }).forEach(function (c) {
      var k = catOf('out', c), share = t.byCat[c] / t.exp;
      cats.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: k[1] }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: k[2] }), h('span', { 'class': 'tprogress', style: 'display:block;margin-top:6px' }, [h('span', { style: 'width:' + (share * 100).toFixed(1) + '%' })])]),
        h('span', { 'class': 'titem-amt', text: T.money(t.byCat[c]) + ' · ' + Math.round(share * 100) + '%' })]));
    });
    if (!cats.children.length) cats.appendChild(h('p', { 'class': 'tnote', text: 'No expenses this month yet.' }));
    list.innerHTML = '';
    var q = search.value.trim().toLowerCase();
    var rows = db.entries.filter(function (e) { return e.d.slice(0, 7) === month && (!q || ((e.n || '') + ' ' + catOf(e.t, e.c)[2] + ' ' + e.p).toLowerCase().indexOf(q) >= 0); })
      .sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
    var day = '';
    rows.forEach(function (e) {
      if (e.d !== day) {
        day = e.d;
        var dt = rows.filter(function (x) { return x.d === day; }).reduce(function (s, x) { return s + (x.t === 'in' ? x.a : -x.a); }, 0);
        list.appendChild(h('div', { 'class': 'tday' }, [h('span', { text: new Date(day + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) }), h('span', { text: (dt >= 0 ? '+' : '−') + T.money(Math.abs(dt)) })]));
      }
      var k = catOf(e.t, e.c);
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: k[1] }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: e.n || k[2] }), h('small', { text: k[2] + ' · ' + e.p })]),
        h('span', { 'class': 'titem-amt ' + (e.t === 'in' ? 'tin-c' : 'tout-c'), text: (e.t === 'in' ? '+' : '−') + T.money(e.a) }),
        h('button', { type: 'button', 'aria-label': 'Edit', title: 'Edit', text: '✎', onclick: function () { edit(e); } }),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () {
          if (!confirm('Delete this entry?')) return; db.entries = db.entries.filter(function (x) { return x.id !== e.id; }); V.save(db); draw(); } })]));
    });
    if (!rows.length) list.appendChild(h('p', { 'class': 'tnote', text: q ? 'Nothing matches your search.' : 'No entries in this month. Add your first one above.' }));
  }
  function csv(all) {
    var rows = db.entries.filter(function (e) { return all || e.d.slice(0, 7) === month; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    var q = function (s) { s = String(s == null ? '' : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    var text = 'Date,Type,Category,Note,Paid by,Amount\n' + rows.map(function (e) { return [e.d, e.t === 'in' ? 'Income' : 'Expense', catOf(e.t, e.c)[2], e.n, e.p, (e.t === 'in' ? '' : '-') + e.a].map(q).join(','); }).join('\n');
    T.download(new Blob(['﻿' + text], { type: 'text/csv' }), 'money-' + (all ? 'all' : month) + '.csv');
  }
  spot.appendChild(T.card([V.bar(draw), h('h3', { text: 'Add income or expense' }), form,
    h('div', { 'class': 'trow' }, [T.button('‹', { small: true, onclick: function () { shift(-1); } }), monthIn, T.button('›', { small: true, onclick: function () { shift(1); } })]),
    sum, h('h3', { text: 'Monthly budget' }), h('div', { 'class': 'tgrid2' }, [T.field('Budget for each month (' + T.currency() + ')', budgetIn)]), budgetBar, budgetMsg,
    h('h3', { text: 'Where the money went' }), cats, h('h3', { text: 'Entries' }), search, list,
    T.row([T.button('Download this month (CSV / Excel)', { small: true, onclick: function () { csv(false); } }), T.button('Download all (CSV)', { small: true, onclick: function () { csv(true); } })])]));
  V.ready.then(function () { budgetIn.value = V.data().budget || ''; draw(); });

  T.tests['money-manager'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ entries: [], budget: 0 }); db = V.data(); month = '2026-10'; monthIn.value = month;
    [['in', 5000, 'salary', 'October salary'], ['out', 1200, 'food', 'Groceries'], ['out', 300, 'travel', 'Bus pass']].forEach(function (x) {
      type = x[0]; fillCats(x[2]); amt.value = x[1]; note.value = x[3]; date.value = '2026-10-0' + (x[1] % 7 + 1); add();
    });
    var t = totals('2026-10');
    if (t.inc !== 5000) fails.push('income ' + t.inc);
    if (t.exp !== 1500) fails.push('expenses ' + t.exp);
    if (t.byCat.food !== 1200) fails.push('food ' + t.byCat.food);
    if (list.querySelectorAll('.titem').length !== 3) fails.push('list shows ' + list.querySelectorAll('.titem').length);
    if (sum.textContent.indexOf('3,500') < 0) fails.push('summary lacks 3,500: ' + sum.textContent);
    return V.save(keep).then(function () { db = V.data(); month = iso(new Date()).slice(0, 7); monthIn.value = month; draw(); return { ok: !fails.length, n: 5, fails: fails }; });
  };
});
