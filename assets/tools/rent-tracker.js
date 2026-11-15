/* Infinity by GroupChatOn — rent-tracker. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Rent tracker for landlords: tenants, monthly dues, payments and printable rent receipts. */
GCOTools.register('rent-tracker', function (spot, T) {
  var h = T.h, V = T.vault('rent', { tenants: [], pays: [], owner: { name: '', phone: '' } }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function mlabel(m) { return new Date(m + '-01T00:00:00').toLocaleDateString(undefined, { month: 'short', year: 'numeric' }); }
  function months(a, b) { return a > b ? 0 : (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7)) + 1; }
  function ten(id) { return db.tenants.filter(function (t) { return t.id === id; })[0]; }
  function paidFor(tid, m) { return db.pays.reduce(function (s, p) { return p.t === tid && (!m || p.m === m) ? s + p.a : s; }, 0); }
  function dues(tid, upto) { var t = ten(tid), end = t.left && t.left < upto ? t.left : upto, exp = months(t.start, end) * t.rent; return { expected: exp, paid: paidFor(tid), due: exp - paidFor(tid) }; }
  function status(tid, m) { var t = ten(tid), p = paidFor(tid, m); return p >= t.rent ? 'Paid' : p > 0 ? 'Part paid' : 'Unpaid'; }
  var tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' }), cur = 'list', sel = null, rcpt = null, month = iso().slice(0, 7);
  function go(t) { cur = t; draw(); }
  function draw() {
    db = V.data(); tabs.innerHTML = ''; body.innerHTML = '';
    [['list', '🏠 Tenants'], ['tenant', '💵 Payments'], ['receipt', '🧾 Receipt'], ['owner', '⚙️ Owner']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(cur === t[0]), text: t[1], onclick: function () { go(t[0]); } })); });
    ({ list: drawList, tenant: drawTenant, receipt: drawReceipt, owner: drawOwner })[cur]();
  }
  function drawList() {
    var mi = h('input', { type: 'month', value: month }); mi.addEventListener('change', function () { if (mi.value) { month = mi.value; draw(); } });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Month', mi)]));
    var act = db.tenants.filter(function (t) { return t.start <= month && (!t.left || t.left >= month); }), rent = 0, got = 0, due = 0;
    act.forEach(function (t) { rent += t.rent; got += Math.min(t.rent, paidFor(t.id, month)); });
    db.tenants.forEach(function (t) { due += Math.max(0, dues(t.id, iso().slice(0, 7)).due); });
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Rent for ' + mlabel(month), rent, ''], ['Collected', got, 'tin-c'], ['Total due till today', due, due > 0 ? 'tout-c' : 'tin-c']].map(function (x) {
      return h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: T.money(x[1]) })]); })));
    var list = h('div', { 'class': 'tlist' });
    db.tenants.forEach(function (t) {
      var st = t.start <= month && (!t.left || t.left >= month) ? status(t.id, month) : 'Not renting', d = dues(t.id, iso().slice(0, 7)).due;
      list.appendChild(h('div', { 'class': 'titem', style: 'cursor:pointer', onclick: function () { sel = t.id; go('tenant'); } }, [h('span', { 'class': 'titem-ic', text: st === 'Paid' ? '✅' : st === 'Unpaid' ? '⏳' : st === 'Part paid' ? '🟡' : '🚪' }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: t.name + (t.prop ? ' · ' + t.prop : '') }), h('small', { text: st + ' · rent ' + T.money(t.rent) + (d > 0 ? ' · due ' + T.money(d) : '') })]),
        h('span', { 'class': 'titem-amt ' + (d > 0 ? 'tout-c' : 'tin-c'), text: d > 0 ? T.money(d) : 'No dues' })]));
    });
    if (!db.tenants.length) list.appendChild(h('p', { 'class': 'tnote', text: 'Add your first tenant below.' }));
    body.appendChild(list);
    var f = { name: h('input', { type: 'text', placeholder: 'Tenant name' }), phone: h('input', { type: 'tel', placeholder: 'Mobile' }), prop: h('input', { type: 'text', placeholder: 'e.g. Shop 2, Flat 101, Room 3' }),
      rent: h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Monthly rent' }), start: h('input', { type: 'month', value: iso().slice(0, 7) }), dep: h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Security deposit (optional)' }) };
    body.appendChild(h('details', { 'class': 'tcalc-details', open: db.tenants.length ? null : true }, [h('summary', { text: '➕ Add a tenant' }),
      h('div', { 'class': 'tgrid2' }, [T.field('Name', f.name), T.field('Mobile', f.phone), T.field('Property / unit', f.prop), T.field('Monthly rent (' + T.currency() + ')', f.rent), T.field('Rent starts from', f.start), T.field('Deposit', f.dep)]),
      T.row([T.button('Add tenant', { primary: true, onclick: function () {
        if (!f.name.value.trim() || !(parseFloat(f.rent.value) > 0)) { (f.name.value.trim() ? f.rent : f.name).focus(); return; }
        var t = { id: uid(), name: f.name.value.trim(), phone: f.phone.value.trim(), prop: f.prop.value.trim(), rent: parseFloat(f.rent.value), start: f.start.value || iso().slice(0, 7), dep: parseFloat(f.dep.value) || 0, left: '' };
        db.tenants.push(t); sel = t.id; save(); go('tenant');
      } })])]));
  }
  function pickT() {
    var s = h('select', {}, [h('option', { value: '', text: 'Choose a tenant…' })].concat(db.tenants.map(function (t) { return h('option', { value: t.id, selected: t.id === sel ? true : null, text: t.name + (t.prop ? ' · ' + t.prop : '') }); })));
    s.addEventListener('change', function () { sel = s.value; draw(); }); return T.field('Tenant', s);
  }
  function drawTenant() {
    body.appendChild(pickT());
    var t = ten(sel); if (!t) { body.appendChild(h('p', { 'class': 'tnote', text: db.tenants.length ? 'Choose a tenant.' : 'Add a tenant first.' })); return; }
    var d = dues(t.id, iso().slice(0, 7));
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Rent so far', d.expected, ''], ['Paid so far', d.paid, 'tin-c'], [d.due >= 0 ? 'Due' : 'Advance', Math.abs(d.due), d.due > 0 ? 'tout-c' : 'tin-c']].map(function (x) {
      return h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: T.money(x[1]) })]); })));
    var next = t.start, guard = 0; while (paidFor(t.id, next) >= t.rent && guard++ < 600) { var y = +next.slice(0, 4), mo = +next.slice(5, 7); next = mo === 12 ? (y + 1) + '-01' : y + '-' + ('0' + (mo + 1)).slice(-2); }
    var a = h('input', { type: 'number', min: '0', step: 'any', value: t.rent - paidFor(t.id, next) }), m = h('input', { type: 'month', value: next }), dt = h('input', { type: 'date', value: iso() });
    var mode = T.select(['Cash', 'UPI', 'Bank transfer', 'Cheque'], 'UPI');
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Amount received', a), T.field('Rent for month', m), T.field('Date received', dt), T.field('Paid by', mode)]));
    var remind = 'Hello ' + t.name + ', this is a reminder that rent of ' + T.money(Math.max(0, d.due)) + (t.prop ? ' for ' + t.prop : '') + ' is due. Kindly pay at the earliest. Thank you.' + (db.owner.name ? ' - ' + db.owner.name : '');
    body.appendChild(T.row([T.button('Save payment', { primary: true, onclick: function () {
      var v = parseFloat(a.value); if (!(v > 0)) { a.focus(); return; }
      var p = { id: uid(), t: t.id, a: v, m: m.value || next, d: dt.value || iso(), mode: mode.value }; db.pays.push(p); rcpt = p.id; save(); go('receipt');
    } }), h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener', href: 'https://wa.me/' + (t.phone || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(remind), text: 'Rent reminder on WhatsApp' }),
      T.button(t.left ? 'Still renting' : 'Tenant moved out', { small: true, onclick: function () { t.left = t.left ? '' : iso().slice(0, 7); save(); draw(); } }),
      T.button('Delete tenant', { small: true, onclick: function () { if (confirm('Delete ' + t.name + ' and all payments?')) { db.tenants = db.tenants.filter(function (x) { return x !== t; }); db.pays = db.pays.filter(function (p) { return p.t !== t.id; }); sel = null; save(); go('list'); } } })]));
    if (t.dep) body.appendChild(h('p', { 'class': 'tnote', text: 'Security deposit held: ' + T.money(t.dep) + '. Since ' + mlabel(t.start) + (t.left ? ', moved out ' + mlabel(t.left) : '') + '.' }));
    var list = h('div', { 'class': 'tlist' });
    db.pays.filter(function (p) { return p.t === t.id; }).sort(function (x, y) { return x.d < y.d ? 1 : -1; }).forEach(function (p) {
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: 'Rent for ' + mlabel(p.m) }), h('small', { text: p.d + ' · ' + p.mode })]), h('span', { 'class': 'titem-amt tin-c', text: T.money(p.a) }),
        h('button', { type: 'button', 'aria-label': 'Receipt', title: 'Receipt', text: '🧾', onclick: function () { rcpt = p.id; go('receipt'); } }),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this payment?')) { db.pays = db.pays.filter(function (x) { return x !== p; }); save(); draw(); } } })]));
    });
    body.appendChild(list);
  }
  function drawReceipt() {
    var p = db.pays.filter(function (x) { return x.id === rcpt; })[0], t = p && ten(p.t);
    if (!t) { body.appendChild(h('p', { 'class': 'tnote', text: 'Save a payment (or tap 🧾 next to one) to make its receipt.' })); return; }
    var no = 'R-' + p.d.replace(/-/g, '').slice(2) + '-' + (db.pays.filter(function (x) { return x.t === t.id && x.d <= p.d; }).length);
    var paper = h('div', { 'class': 'tpaper', 'data-out': '' }, [
      h('div', { style: 'display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap' }, [h('b', { style: 'font-size:18px', text: 'RENT RECEIPT' }), h('span', { text: 'No. ' + no + ' · ' + p.d })]),
      h('p', { style: 'margin-top:14px', text: 'Received with thanks from ' + t.name + ' the sum of ' + T.money(p.a) + ' (' + T.words(p.a) + ') by ' + p.mode + ' towards rent' + (t.prop ? ' of ' + t.prop : '') + ' for the month of ' + mlabel(p.m) + '.' }),
      h('p', { style: 'margin-top:40px;text-align:right', text: (db.owner.name || 'Landlord') + (db.owner.phone ? ' · ' + db.owner.phone : '') }),
      h('p', { style: 'text-align:right;color:#666;font-size:12px', text: 'Signature' })]);
    body.appendChild(paper);
    body.appendChild(T.row([T.button('Print / Save as PDF', { primary: true, onclick: function () {
      var w = window.open('', '_blank'); if (!w) return;
      w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Rent receipt ' + no + '</title><style>body{font:15px/1.6 system-ui,sans-serif;margin:2cm;color:#111}div,p{max-width:640px}</style></head><body style="border:1px solid #999;padding:24px">' + paper.innerHTML + '</body></html>');
      w.document.close(); setTimeout(function () { w.print(); }, 300);
    } }), h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener', href: 'https://wa.me/' + (t.phone || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(paper.textContent.replace('RENT RECEIPT', 'Rent receipt ')), text: 'Send on WhatsApp' })]));
  }
  function drawOwner() {
    var n = h('input', { type: 'text', value: db.owner.name || '', placeholder: 'Your name' }), ph = h('input', { type: 'tel', value: db.owner.phone || '', placeholder: 'Phone (optional)' });
    [n, ph].forEach(function (x) { x.addEventListener('change', function () { db.owner = { name: n.value.trim(), phone: ph.value.trim() }; save(); }); });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Landlord name (on receipts)', n), T.field('Phone', ph)]));
  }
  spot.appendChild(T.card([V.bar(draw), tabs, body]));
  V.ready.then(draw);

  T.tests['rent-tracker'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ tenants: [{ id: 't', name: 'Test Tenant', phone: '', prop: 'Shop 1', rent: 10000, start: '2026-08', dep: 0, left: '' }], pays: [{ id: 'p1', t: 't', a: 10000, m: '2026-08', d: '2026-08-05', mode: 'UPI' }, { id: 'p2', t: 't', a: 10000, m: '2026-09', d: '2026-09-04', mode: 'Cash' }], owner: { name: 'Owner', phone: '' } }); db = V.data();
    var d = dues('t', '2026-10');
    if (d.expected !== 30000 || d.due !== 10000) fails.push('dues ' + JSON.stringify(d));
    if (status('t', '2026-10') !== 'Unpaid' || status('t', '2026-09') !== 'Paid') fails.push('status');
    db.tenants[0].left = '2026-09'; if (dues('t', '2026-12').due !== 0) fails.push('moved out ' + dues('t', '2026-12').due); db.tenants[0].left = '';
    rcpt = 'p2'; go('receipt');
    if (body.textContent.indexOf('Test Tenant') < 0 || body.textContent.indexOf('Shop 1') < 0) fails.push('receipt');
    return V.save(keep).then(function () { rcpt = null; sel = null; go('list'); return { ok: !fails.length, n: 4, fails: fails }; });
  }
});
