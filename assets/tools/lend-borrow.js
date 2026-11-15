/* Infinity by GroupChatOn — lend-borrow. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Lend and borrow tracker for friends and family: who owes whom, part repayments, due dates and reminders. */
GCOTools.register('lend-borrow', function (spot, T) {
  var h = T.h, V = T.vault('lend', { items: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function left(x) { return Math.round((x.a - (x.back || []).reduce(function (s, b) { return s + b.a; }, 0)) * 100) / 100; }
  function totals(today) {
    var r = { get: 0, owe: 0, late: 0, people: {} };
    db.items.forEach(function (x) {
      var l = left(x); if (l <= 0) return;
      if (x.k === 'lent') r.get += l; else r.owe += l;
      if (x.due && x.due < (today || iso())) r.late++;
      r.people[x.who] = (r.people[x.who] || 0) + (x.k === 'lent' ? l : -l);
    });
    return r;
  }
  var kind = 'lent', seg = T.seg([['lent', '↗ I gave (lent)'], ['took', '↙ I took (borrowed)']], 'lent', function (v) { kind = v; });
  var who = h('input', { type: 'text', placeholder: 'Name', list: 'lb-names' }), names = h('datalist', { id: 'lb-names' });
  var amt = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: '0' }), d = h('input', { type: 'date', value: iso() }), due = h('input', { type: 'date' });
  var note = h('input', { type: 'text', placeholder: 'e.g. for hospital bill, for new phone' }), msg = T.status();
  function add() {
    var a = parseFloat(amt.value);
    if (!who.value.trim()) { msg.error('Type the person’s name.'); who.focus(); return; }
    if (!(a > 0)) { msg.error('Type the amount.'); amt.focus(); return; }
    db.items.push({ id: uid(), who: who.value.trim(), k: kind, a: a, d: d.value || iso(), due: due.value || '', n: note.value.trim(), back: [] }); save();
    msg.ok((kind === 'lent' ? 'You gave ' : 'You took ') + T.money(a) + (kind === 'lent' ? ' to ' : ' from ') + who.value.trim() + '.');
    amt.value = ''; note.value = ''; due.value = ''; draw();
  }
  amt.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
  var sum = h('div', { 'class': 'tsum', 'data-out': '' }), list = h('div', { 'class': 'tlist' }), showDone = false;
  var doneSeg = T.seg([['open', 'Pending'], ['all', 'All, with settled']], 'open', function (v) { showDone = v === 'all'; draw(); });
  function draw() {
    db = V.data();
    var t = totals(); sum.innerHTML = '';
    [['You will get', t.get, 'tin-c'], ['You have to give', t.owe, 'tout-c'], ['Past due date', t.late, t.late ? 'tout-c' : '']].forEach(function (x, i) { sum.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: i === 2 ? T.num(x[1]) : T.money(x[1]) })])); });
    var all = {}; db.items.forEach(function (x) { all[x.who] = 1; }); names.innerHTML = ''; Object.keys(all).forEach(function (n) { names.appendChild(h('option', { value: n })); });
    list.innerHTML = '';
    var groups = {};
    db.items.forEach(function (x) { if (showDone || left(x) > 0) (groups[x.who] = groups[x.who] || []).push(x); });
    Object.keys(groups).sort(function (a, b) { return Math.abs(t.people[b] || 0) - Math.abs(t.people[a] || 0); }).forEach(function (p) {
      var net = t.people[p] || 0;
      list.appendChild(h('div', { 'class': 'tday' }, [h('span', { text: p }), h('span', { text: net > 0 ? p + ' owes you ' + T.money(net) : net < 0 ? 'You owe ' + T.money(-net) : 'Settled' })]));
      groups[p].sort(function (a, b) { return a.d < b.d ? 1 : -1; }).forEach(function (x) {
        var l = left(x), late = l > 0 && x.due && x.due < iso(), box = h('span');
        list.appendChild(h('div', { 'class': 'titem', style: 'flex-wrap:wrap' }, [h('span', { 'class': 'titem-ic', text: l <= 0 ? '✅' : x.k === 'lent' ? '↗' : '↙' }),
          h('span', { 'class': 'titem-main' }, [h('b', { text: (x.k === 'lent' ? 'Gave ' : 'Took ') + T.money(x.a) + (x.n ? ' · ' + x.n : '') }),
            h('small', { text: x.d + (x.back.length ? ' · returned ' + T.money(x.a - l) : '') + (x.due && l > 0 ? (late ? ' · ⚠️ was due ' : ' · due ') + x.due : '') })]),
          h('span', { 'class': 'titem-amt ' + (l <= 0 ? '' : x.k === 'lent' ? 'tin-c' : 'tout-c'), text: l <= 0 ? 'Settled' : T.money(l) + ' left' }),
          l > 0 ? h('button', { type: 'button', title: 'Money returned', 'aria-label': 'Money returned', text: '↩', onclick: function () {
            var ri = h('input', { type: 'number', min: '0', step: 'any', value: l, style: 'max-width:130px', 'aria-label': 'Amount returned' });
            box.innerHTML = ''; box.appendChild(T.row([ri, T.button('Save', { small: true, primary: true, onclick: function () { var v = parseFloat(ri.value); if (v > 0) { repay(x, v); draw(); } } })]));
          } }) : null,
          l > 0 && x.k === 'lent' ? h('a', { href: 'https://wa.me/?text=' + encodeURIComponent('Hi ' + x.who + ', a gentle reminder about the ' + T.money(l) + ' I gave you on ' + x.d + (x.n ? ' (' + x.n + ')' : '') + '. Please return it when you can. Thanks!'), target: '_blank', rel: 'noopener', 'class': 'tbtn tbtn-sm', title: 'Remind on WhatsApp', 'aria-label': 'Remind on WhatsApp' }) : null,
          h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this record?')) { db.items = db.items.filter(function (y) { return y !== x; }); save(); draw(); } } }), box]));
      });
    });
    if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: db.items.length ? 'Everything is settled. 🎉' : 'Nothing yet. Write down money you gave or took above.' }));
  }
  function repay(x, v) { x.back.push({ id: uid(), d: iso(), a: Math.min(v, left(x)) }); save(); }
  spot.appendChild(T.card([V.bar(draw), h('div', { 'class': 'tool-app-opts' }, [seg, h('div', { 'class': 'tgrid2' }, [T.field('Person', who), T.field('Amount (' + T.currency() + ')', amt), T.field('Date', d), T.field('Return by (optional)', due), T.field('Note (optional)', note), names]),
    T.row([T.button('Save', { primary: true, onclick: add })]), msg.el]), sum, doneSeg, list]));
  V.ready.then(draw);

  T.tests['lend-borrow'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ items: [] }); db = V.data();
    kind = 'lent'; who.value = 'Raj'; amt.value = '5000'; add();
    repay(db.items[0], 2000);
    kind = 'took'; who.value = 'Raj'; amt.value = '1000'; add();
    kind = 'lent'; who.value = 'Sia'; amt.value = '300'; due.value = '2026-01-01'; add();
    var t = totals('2026-06-01');
    if (t.get !== 3300) fails.push('get ' + t.get);
    if (t.owe !== 1000) fails.push('owe ' + t.owe);
    if (t.people.Raj !== 2000) fails.push('Raj net ' + t.people.Raj);
    if (t.late !== 1) fails.push('late ' + t.late);
    draw(); if (list.textContent.indexOf('Raj owes you') < 0) fails.push('list');
    repay(db.items[0], 9999); if (left(db.items[0]) !== 0) fails.push('overpay ' + left(db.items[0]));
    kind = 'lent'; seg.querySelector('button').click();
    return V.save(keep).then(function () { db = V.data(); draw(); return { ok: !fails.length, n: 6, fails: fails }; });
  }
});
