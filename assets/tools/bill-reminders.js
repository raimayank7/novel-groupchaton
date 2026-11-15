/* Infinity by GroupChatOn — bill-reminders. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Bills, renewals and recharges: due dates, days left, mark paid (moves to the next due date) and calendar reminders. */
GCOTools.register('bill-reminders', function (spot, T) {
  var h = T.h, V = T.vault('bills', { bills: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var REP = [['0', 'One time'], ['1', 'Every month'], ['2', 'Every 2 months'], ['3', 'Every 3 months'], ['6', 'Every 6 months'], ['12', 'Every year']];
  var CATS = [['💡', 'Electricity'], ['💧', 'Water'], ['🔥', 'Gas'], ['📱', 'Mobile recharge'], ['🌐', 'Internet / DTH'], ['💳', 'Credit card'], ['🏦', 'EMI / loan'], ['🛡️', 'Insurance'], ['🏠', 'Rent / maintenance'], ['🎓', 'School fees'], ['📺', 'Subscription'], ['🚗', 'Vehicle (PUC, insurance)'], ['🧾', 'Other']];
  function addMonths(d, n, day) {
    var y = +d.slice(0, 4), m = +d.slice(5, 7) - 1 + n; y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    var dim = new Date(y, m + 1, 0).getDate();
    return y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + Math.min(day || +d.slice(8), dim)).slice(-2);
  }
  function daysLeft(d, today) { return Math.round((new Date(d + 'T00:00:00') - new Date((today || iso()) + 'T00:00:00')) / 864e5); }
  function when(n) { return n < 0 ? 'Overdue by ' + (-n) + (n === -1 ? ' day' : ' days') : n === 0 ? 'Due today' : n === 1 ? 'Due tomorrow' : 'In ' + n + ' days'; }
  function pay(b, amount) {
    b.paid = b.paid || []; b.paid.push({ d: iso(), a: amount == null ? b.a : amount, for: b.due });
    if (+b.rep) b.due = addMonths(b.due, +b.rep, b.day); else b.done = true;
    save();
  }
  function monthly() { return db.bills.reduce(function (s, b) { return !b.done && +b.rep ? s + b.a / +b.rep : s; }, 0); }
  var f = { name: h('input', { type: 'text', placeholder: 'e.g. Jio recharge, HDFC card, Car insurance' }), cat: T.select(CATS.map(function (c) { return [c[0], c[0] + ' ' + c[1]]; }), '💡'),
    a: h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Amount (if fixed)' }), due: h('input', { type: 'date', value: iso() }), rep: T.select(REP, '1'), n: h('input', { type: 'text', placeholder: 'Account no., how to pay… (optional)' }) };
  var editing = null, addBtn = T.button('Add bill', { primary: true, onclick: function () { add(); } });
  function add() {
    if (!f.name.value.trim()) { f.name.focus(); return; }
    var b = editing ? db.bills.filter(function (x) { return x.id === editing; })[0] : { id: uid(), paid: [] };
    b.name = f.name.value.trim(); b.ic = f.cat.value; b.a = parseFloat(f.a.value) || 0; b.due = f.due.value || iso(); b.day = +b.due.slice(8); b.rep = f.rep.value; b.n = f.n.value.trim(); b.done = false;
    if (!editing) db.bills.push(b);
    editing = null; addBtn.textContent = 'Add bill'; f.name.value = ''; f.a.value = ''; f.n.value = ''; save(); draw();
  }
  function edit(b) { editing = b.id; f.name.value = b.name; f.cat.value = b.ic; f.a.value = b.a || ''; f.due.value = b.due; f.rep.value = b.rep; f.n.value = b.n || ''; addBtn.textContent = 'Save changes'; f.name.focus(); }
  var sum = h('div', { 'class': 'tsum', 'data-out': '' }), list = h('div', { 'class': 'tlist' }), paidList = h('div', { 'class': 'tlist' });
  function draw() {
    db = V.data(); sum.innerHTML = ''; list.innerHTML = ''; paidList.innerHTML = '';
    var open = db.bills.filter(function (b) { return !b.done; }).sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
    var week = open.filter(function (b) { return daysLeft(b.due) <= 7; }), late = open.filter(function (b) { return daysLeft(b.due) < 0; });
    [['Overdue', T.num(late.length), late.length ? 'tout-c' : 'tin-c'], ['Due in 7 days', T.money(week.reduce(function (s, b) { return s + b.a; }, 0)), ''], ['Regular bills a month', T.money(monthly()), '']].forEach(function (x) { sum.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: x[1] })])); });
    open.forEach(function (b) {
      var n = daysLeft(b.due);
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: b.ic || '🧾' }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: b.name }), h('small', { text: new Date(b.due + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + (REP.filter(function (r) { return r[0] === b.rep; })[0] || REP[0])[1] + (b.n ? ' · ' + b.n : '') })]),
        h('span', { 'class': 'titem-amt ' + (n < 0 ? 'tout-c' : n <= 3 ? '' : 'tin-c'), style: n <= 3 && n >= 0 ? 'color:#d97706' : null, text: when(n) + (b.a ? ' · ' + T.money(b.a) : '') }),
        h('button', { type: 'button', title: 'Mark paid', 'aria-label': 'Mark paid', text: '✔', onclick: function () { pay(b); draw(); } }),
        h('button', { type: 'button', title: 'Edit', 'aria-label': 'Edit', text: '✎', onclick: function () { edit(b); } }),
        h('button', { type: 'button', title: 'Delete', 'aria-label': 'Delete', text: '✕', onclick: function () { if (confirm('Delete ' + b.name + '?')) { db.bills = db.bills.filter(function (x) { return x !== b; }); save(); draw(); } } })]));
    });
    if (!open.length) list.appendChild(h('p', { 'class': 'tnote', text: 'No bills due. Add electricity, recharge, card or insurance dates above.' }));
    var hist = []; db.bills.forEach(function (b) { (b.paid || []).forEach(function (p) { hist.push([b, p]); }); });
    hist.sort(function (a, b) { return a[1].d < b[1].d ? 1 : -1; }).slice(0, 20).forEach(function (x) {
      paidList.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: x[0].ic || '🧾' }), h('span', { 'class': 'titem-main' }, [h('b', { text: x[0].name }), h('small', { text: 'Paid ' + x[1].d + ' · was due ' + x[1].for })]), h('span', { 'class': 'titem-amt', text: x[1].a ? T.money(x[1].a) : '' })]));
    });
    if (!hist.length) paidList.appendChild(h('p', { 'class': 'tnote', text: 'Bills you mark paid will show here.' }));
  }
  function ics() {
    var stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', esc = function (s) { return String(s).replace(/[\\;,]/g, function (c) { return '\\' + c; }); };
    var ev = db.bills.filter(function (b) { return !b.done; }).map(function (b) {
      return ['BEGIN:VEVENT', 'UID:' + b.id + '@infinity.groupchaton.com', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + b.due.replace(/-/g, ''), 'SUMMARY:' + esc((b.ic || '') + ' ' + b.name + (b.a ? ' ' + T.money(b.a) : '') + ' due'),
        +b.rep ? 'RRULE:FREQ=MONTHLY;INTERVAL=' + b.rep : null, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(b.name + ' is due'), 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT'].filter(Boolean).join('\r\n');
    });
    if (!ev.length) { alert('Add a bill first.'); return; }
    T.download(new Blob(['BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//GroupChatOn//Infinity bills//EN\r\n' + ev.join('\r\n') + '\r\nEND:VCALENDAR\r\n'], { type: 'text/calendar' }), 'bill-reminders.ics');
  }
  spot.appendChild(T.card([V.bar(draw), h('div', { 'class': 'tool-app-opts' }, [h('div', { 'class': 'tgrid2' }, [T.field('Bill or renewal', f.name), T.field('Type', f.cat), T.field('Amount (' + T.currency() + ')', f.a), T.field('Next due date', f.due), T.field('Repeats', f.rep), T.field('Note', f.n)]), T.row([addBtn])]),
    sum, h('h3', { text: 'Coming up' }), list,
    T.row([T.button('Add reminders to my phone calendar (.ics)', { small: true, onclick: ics })]),
    h('p', { 'class': 'tnote', text: 'The calendar file adds every bill (repeating ones repeat) with an alert one day before. Open it on your phone or computer and your calendar app will ring even when this page is closed.' }),
    h('h3', { text: 'Recently paid' }), paidList]));
  V.ready.then(draw);

  T.tests['bill-reminders'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    if (addMonths('2026-01-31', 1, 31) !== '2026-02-28') fails.push('Jan 31 + 1 = ' + addMonths('2026-01-31', 1, 31));
    if (addMonths('2026-02-28', 1, 31) !== '2026-03-31') fails.push('keeps day 31: ' + addMonths('2026-02-28', 1, 31));
    if (addMonths('2026-11-15', 3, 15) !== '2027-02-15') fails.push('year wrap ' + addMonths('2026-11-15', 3, 15));
    if (daysLeft('2026-11-10', '2026-11-01') !== 9) fails.push('days left');
    V.save({ bills: [] }); db = V.data();
    f.name.value = 'Recharge'; f.a.value = '600'; f.due.value = '2026-01-31'; f.rep.value = '1'; add();
    f.name.value = 'Insurance'; f.a.value = '1200'; f.due.value = '2026-03-10'; f.rep.value = '12'; add();
    if (monthly() !== 700) fails.push('monthly ' + monthly());
    pay(db.bills[0]); if (db.bills[0].due !== '2026-02-28') fails.push('next due ' + db.bills[0].due);
    f.rep.value = '1';
    return V.save(keep).then(function () { db = V.data(); draw(); return { ok: !fails.length, n: 6, fails: fails }; });
  }
});
