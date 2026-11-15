/* Infinity by GroupChatOn — salary-register. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Staff salary and advance register: absences, advances, bonus, payments, balance and printable salary slips. */
GCOTools.register('salary-register', function (spot, T) {
  var h = T.h, V = T.vault('salary', { staff: [], months: {}, tx: [], biz: '' }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var KIND = { adv: 'Advance', paid: 'Salary paid', bonus: 'Bonus / overtime', ded: 'Deduction' };
  var month = iso().slice(0, 7), sel = null, body = h('div', { 'class': 'tool-app-opts' });
  function staff(id) { return db.staff.filter(function (s) { return s.id === id; })[0]; }
  function calc(sid, m) {
    var s = staff(sid), days = new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate(), abs = ((db.months[sid + '|' + m] || {}).abs) || 0, worked = Math.max(0, days - abs);
    var earned = s.basis === 'day' ? s.pay * worked : s.pay * worked / days, r = { days: days, abs: abs, worked: worked, earned: Math.round(earned * 100) / 100, adv: 0, paid: 0, bonus: 0, ded: 0 };
    db.tx.forEach(function (x) { if (x.s === sid && x.d.slice(0, 7) === m) r[x.k] += x.a; });
    r.net = r.earned + r.bonus - r.ded - r.adv; r.bal = r.net - r.paid;
    return r;
  }
  function draw() {
    db = V.data(); body.innerHTML = '';
    var mi = h('input', { type: 'month', value: month }); mi.addEventListener('change', function () { if (mi.value) { month = mi.value; draw(); } });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Month', mi)]));
    var tot = { net: 0, paid: 0, bal: 0 };
    var list = h('div', { 'class': 'tlist' });
    db.staff.forEach(function (s) {
      var c = calc(s.id, month); tot.net += c.net; tot.paid += c.paid; tot.bal += c.bal;
      list.appendChild(h('div', { 'class': 'titem', style: 'cursor:pointer' + (sel === s.id ? ';border-color:var(--accent)' : ''), onclick: function () { sel = s.id; draw(); } }, [h('span', { 'class': 'titem-ic', text: '🧑‍🔧' }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: s.name }), h('small', { text: c.worked + ' of ' + c.days + ' days · advance ' + T.money(c.adv) })]),
        h('span', { 'class': 'titem-amt ' + (c.bal > 0 ? 'tout-c' : 'tin-c'), text: c.bal > 0 ? 'To pay ' + T.money(c.bal) : c.bal < 0 ? 'Overpaid ' + T.money(-c.bal) : 'Settled' })]));
    });
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Salary this month', tot.net, ''], ['Paid', tot.paid, 'tin-c'], ['Still to pay', tot.bal, tot.bal > 0 ? 'tout-c' : '']].map(function (x) {
      return h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: T.money(x[1]) })]); })));
    if (!db.staff.length) list.appendChild(h('p', { 'class': 'tnote', text: 'Add your staff below. Then tap a name to record advances, absences and payments.' }));
    body.appendChild(list);
    var s = staff(sel); if (s) drawStaff(s);
    // add staff
    var n = h('input', { type: 'text', placeholder: 'Name' }), pay = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'e.g. 15000' }), ph = h('input', { type: 'tel', placeholder: 'Mobile (optional)' });
    var basis = T.select([['month', 'Monthly salary'], ['day', 'Daily wage']], 'month');
    body.appendChild(h('details', { 'class': 'tcalc-details', open: db.staff.length ? null : true }, [h('summary', { text: '➕ Add staff' }),
      h('div', { 'class': 'tgrid2' }, [T.field('Name', n), T.field('Pay type', basis), T.field('Salary / wage (' + T.currency() + ')', pay), T.field('Mobile', ph)]),
      T.row([T.button('Add staff', { primary: true, onclick: function () {
        if (!n.value.trim() || !(parseFloat(pay.value) > 0)) { (n.value.trim() ? pay : n).focus(); return; }
        var x = { id: uid(), name: n.value.trim(), pay: parseFloat(pay.value), basis: basis.value, phone: ph.value.trim() }; db.staff.push(x); sel = x.id; save(); draw();
      } })])]));
  }
  function drawStaff(s) {
    var c = calc(s.id, month), key = s.id + '|' + month;
    body.appendChild(h('h3', { text: s.name + ' · ' + month }));
    var ab = h('input', { type: 'number', min: '0', max: String(c.days), step: '0.5', value: c.abs || '', placeholder: '0' });
    ab.addEventListener('change', function () { db.months[key] = { abs: Math.min(c.days, Math.max(0, parseFloat(ab.value) || 0)) }; save(); draw(); });
    var amt = h('input', { type: 'number', min: '0', step: 'any', placeholder: '0' }), kind = T.select(Object.keys(KIND).map(function (k) { return [k, KIND[k]]; }), 'adv');
    var d = h('input', { type: 'date', value: month === iso().slice(0, 7) ? iso() : month + '-01' }), note = h('input', { type: 'text', placeholder: 'Note (optional)' });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Days absent this month', ab), T.field('Entry type', kind), T.field('Amount (' + T.currency() + ')', amt), T.field('Date', d), T.field('Note', note)]));
    body.appendChild(T.row([T.button('Save entry', { primary: true, onclick: function () {
      var a = parseFloat(amt.value); if (!(a > 0)) { amt.focus(); return; }
      db.tx.push({ id: uid(), s: s.id, d: d.value || iso(), k: kind.value, a: a, n: note.value.trim() }); if (d.value) month = d.value.slice(0, 7); save(); draw();
    } }), T.button('Salary slip', { small: true, onclick: function () { slip(s); } }),
      T.button('Remove staff', { small: true, onclick: function () { if (confirm('Remove ' + s.name + ' and all their entries?')) { db.staff = db.staff.filter(function (x) { return x !== s; }); db.tx = db.tx.filter(function (x) { return x.s !== s.id; }); sel = null; save(); draw(); } } })]));
    var tb = h('tbody');
    [['Earned (' + c.worked + ' of ' + c.days + ' days at ' + T.money(s.pay) + (s.basis === 'day' ? '/day' : '/month') + ')', c.earned], ['+ Bonus / overtime', c.bonus], ['− Deductions', -c.ded], ['− Advance taken this month', -c.adv], ['= Net salary', c.net], ['− Already paid', -c.paid], ['Balance to pay', c.bal]].forEach(function (r, i) {
      tb.appendChild(h('tr', { style: i === 4 || i === 6 ? 'font-weight:700' : null }, [h('td', { text: r[0], style: 'text-align:left' }), h('td', { text: T.money(r[1]) })]));
    });
    body.appendChild(h('div', { 'class': 'tpaper', 'data-out': '' }, [h('table', {}, [tb])]));
    var list = h('div', { 'class': 'tlist' });
    db.tx.filter(function (x) { return x.s === s.id && x.d.slice(0, 7) === month; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; }).forEach(function (x) {
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: KIND[x.k] }), h('small', { text: x.d + (x.n ? ' · ' + x.n : '') })]),
        h('span', { 'class': 'titem-amt ' + (x.k === 'bonus' ? 'tin-c' : 'tout-c'), text: T.money(x.a) }),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this entry?')) { db.tx = db.tx.filter(function (y) { return y !== x; }); save(); draw(); } } })]));
    });
    body.appendChild(list);
  }
  function slip(s) {
    var c = calc(s.id, month), w = window.open('', '_blank'); if (!w) return;
    var e = function (t) { return String(t).replace(/[&<>]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]; }); };
    var row = function (a, b, bold) { return '<tr' + (bold ? ' style="font-weight:700"' : '') + '><td>' + e(a) + '</td><td style="text-align:right">' + e(T.money(b)) + '</td></tr>'; };
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Salary slip ' + e(s.name) + ' ' + month + '</title><style>body{font:14px/1.5 system-ui,sans-serif;margin:1.5cm;color:#111}table{width:100%;border-collapse:collapse}td{padding:7px;border-bottom:1px solid #ddd}</style></head><body>' +
      '<h2>' + e(db.biz || 'Salary slip') + '</h2><p><b>Salary slip for ' + e(month) + '</b><br>' + e(s.name) + (s.phone ? ' · ' + e(s.phone) : '') + '</p><table>' +
      row('Pay (' + (s.basis === 'day' ? 'per day' : 'per month') + ')', s.pay) + '<tr><td>Days worked</td><td style="text-align:right">' + c.worked + ' of ' + c.days + '</td></tr>' + row('Earned', c.earned) + row('Bonus / overtime', c.bonus) +
      row('Deductions', c.ded) + row('Advance', c.adv) + row('Net salary', c.net, 1) + row('Paid', c.paid) + row('Balance', c.bal, 1) + '</table><p style="margin-top:50px">Employer signature ____________ &nbsp; &nbsp; Employee signature ____________</p></body></html>');
    w.document.close(); setTimeout(function () { w.print(); }, 300);
  }
  var biz = h('input', { type: 'text', placeholder: 'Shop / business name for salary slips' });
  biz.addEventListener('change', function () { db.biz = biz.value.trim(); save(); });
  spot.appendChild(T.card([V.bar(draw), body, h('details', { 'class': 'tcalc-details' }, [h('summary', { text: '⚙️ Business name on slips' }), T.field('Business name', biz)])]));
  V.ready.then(function () { biz.value = V.data().biz || ''; draw(); });

  T.tests['salary-register'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ staff: [{ id: 's1', name: 'Test Staff', pay: 30000, basis: 'month' }], months: { 's1|2026-11': { abs: 3 } }, tx: [], biz: '' }); db = V.data();
    db.tx.push({ id: 'a', s: 's1', d: '2026-11-05', k: 'adv', a: 5000 }, { id: 'b', s: 's1', d: '2026-11-20', k: 'bonus', a: 1000 }, { id: 'c', s: 's1', d: '2026-11-30', k: 'paid', a: 20000 });
    var c = calc('s1', '2026-11');
    if (c.earned !== 27000) fails.push('earned ' + c.earned);
    if (c.net !== 23000) fails.push('net ' + c.net);
    if (c.bal !== 3000) fails.push('balance ' + c.bal);
    db.staff[0].basis = 'day'; db.staff[0].pay = 500; if (calc('s1', '2026-11').earned !== 13500) fails.push('daily wage ' + calc('s1', '2026-11').earned);
    db.staff[0].basis = 'month'; db.staff[0].pay = 30000; month = '2026-11'; sel = 's1'; draw();
    if (body.textContent.indexOf('3,000') < 0) fails.push('balance not shown');
    return V.save(keep).then(function () { sel = null; month = iso().slice(0, 7); draw(); return { ok: !fails.length, n: 5, fails: fails }; });
  }
});
