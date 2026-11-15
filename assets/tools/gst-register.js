/* Infinity by GroupChatOn — gst-register. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* GST sales and purchase register: record invoices, see CGST/SGST/IGST by month and rate, the GSTR-1 and GSTR-3B style totals, and download CSV for your accountant. */
GCOTools.register('gst-register', function (spot, T) {
  var h = T.h;
  var STATES = [['01', 'Jammu and Kashmir'], ['02', 'Himachal Pradesh'], ['03', 'Punjab'], ['04', 'Chandigarh'], ['05', 'Uttarakhand'], ['06', 'Haryana'], ['07', 'Delhi'], ['08', 'Rajasthan'], ['09', 'Uttar Pradesh'], ['10', 'Bihar'],
    ['11', 'Sikkim'], ['12', 'Arunachal Pradesh'], ['13', 'Nagaland'], ['14', 'Manipur'], ['15', 'Mizoram'], ['16', 'Tripura'], ['17', 'Meghalaya'], ['18', 'Assam'], ['19', 'West Bengal'], ['20', 'Jharkhand'], ['21', 'Odisha'],
    ['22', 'Chhattisgarh'], ['23', 'Madhya Pradesh'], ['24', 'Gujarat'], ['26', 'Dadra and Nagar Haveli and Daman and Diu'], ['27', 'Maharashtra'], ['29', 'Karnataka'], ['30', 'Goa'], ['31', 'Lakshadweep'], ['32', 'Kerala'],
    ['33', 'Tamil Nadu'], ['34', 'Puducherry'], ['35', 'Andaman and Nicobar Islands'], ['36', 'Telangana'], ['37', 'Andhra Pradesh'], ['38', 'Ladakh'], ['97', 'Other Territory']];
  var RATES = [0, 0.25, 1, 1.5, 3, 5, 12, 18, 28, 40];
  var V = T.vault('gst-register', { home: '', gstin: '', entries: [] }), db = V.data();
  function r2(n) { return Math.round(n * 100) / 100; }
  function m(n) { return T.money(n, 'INR'); }
  var C36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function gstinCheck(g) {   // the 15th character is a checksum of the first 14
    g = String(g || '').toUpperCase().trim();
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) return false;
    var sum = 0; for (var i = 0; i < 14; i++) { var p = C36.indexOf(g[i]) * (i % 2 ? 2 : 1); sum += Math.floor(p / 36) + p % 36; }
    return C36[(36 - sum % 36) % 36] === g[14];
  }
  // tax for one entry: same state → CGST + SGST, other state → IGST
  function tax(e, home) {
    var st = (e.gstin && /^\d{2}/.test(e.gstin) ? e.gstin.slice(0, 2) : e.state) || home, inter = !!(home && st && st !== home), t = (+e.taxable || 0) * (+e.rate || 0) / 100;
    return { inter: inter, igst: inter ? r2(t) : 0, cgst: inter ? 0 : r2(t / 2), sgst: inter ? 0 : r2(t / 2), cess: r2(+e.cess || 0), total: r2((+e.taxable || 0) + (inter ? r2(t) : 2 * r2(t / 2)) + (+e.cess || 0)) };
  }
  function summary(list, home) {
    var s = { sale: { n: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, b2b: 0, b2c: 0 }, purchase: { n: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }, rates: {} };
    list.forEach(function (e) {
      var x = tax(e, home), k = s[e.kind];
      if (e.kind === 'purchase' && e.itc === false) return;
      k.n++; k.taxable += +e.taxable || 0; k.igst += x.igst; k.cgst += x.cgst; k.sgst += x.sgst; k.cess += x.cess;
      if (e.kind === 'sale') { if (e.gstin) k.b2b++; else k.b2c++; var r = s.rates[e.rate] = s.rates[e.rate] || { taxable: 0, tax: 0 }; r.taxable += +e.taxable || 0; r.tax += x.igst + x.cgst + x.sgst; }
    });
    s.net = {}; ['igst', 'cgst', 'sgst', 'cess'].forEach(function (k) { s.net[k] = r2(s.sale[k] - s.purchase[k]); });
    return s;
  }
  var view = 'add', tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' }), status = T.status();
  var month = h('input', { type: 'month', value: new Date().toISOString().slice(0, 7) });
  month.addEventListener('change', draw);
  var form = { kind: 'sale', date: new Date().toISOString().slice(0, 10), no: '', party: '', gstin: '', state: '', taxable: '', rate: 18, cess: '', itc: true };
  function inMonth(e) { return !month.value || String(e.date).slice(0, 7) === month.value; }
  function drawAdd() {
    var homeSel = T.select([['', 'Choose your state…']].concat(STATES.map(function (s) { return [s[0], s[0] + ' ' + s[1]]; })), db.home);
    homeSel.addEventListener('change', function () { db.home = homeSel.value; V.save(db); draw(); });
    body.appendChild(T.field('Your business’s state (decides CGST + SGST or IGST)', homeSel));
    var preview = h('p', { 'class': 'tnote', 'data-out': '' });
    function pv() {
      var x = tax(form, db.home), g = form.gstin.trim();
      preview.textContent = (+form.taxable > 0 ? (x.inter ? 'IGST ' + m(x.igst) : 'CGST ' + m(x.cgst) + ' + SGST ' + m(x.sgst)) + (x.cess ? ' + cess ' + m(x.cess) : '') + ' · Invoice total ' + m(x.total) : 'Type the taxable value to see the tax.') +
        (g ? (gstinCheck(g) ? ' · GSTIN looks valid ✓' : ' · ⚠ This GSTIN does not look right: check it.') : '');
    }
    function f(label, key, a) {
      a = a || {};
      var el = a.options ? T.select(a.options, String(form[key])) : h('input', { type: a.type || 'text', step: 'any', placeholder: a.ph || '', inputmode: a.type === 'number' ? 'decimal' : null });
      if (!a.options) el.value = form[key];
      function set() { form[key] = a.type === 'number' || key === 'rate' ? el.value : el.value; if (key === 'gstin') form.gstin = el.value.toUpperCase().trim(); pv(); }
      el.addEventListener('input', set); el.addEventListener('change', set);
      return T.field(label, el);
    }
    body.appendChild(T.field('Entry', T.seg([['sale', 'Sale (outward)'], ['purchase', 'Purchase (inward)']], form.kind, function (v) { form.kind = v; draw(); })));
    var itc = h('input', { type: 'checkbox', checked: form.itc ? true : null, onchange: function (e) { form.itc = e.target.checked; } });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [f('Invoice date', 'date', { type: 'date' }), f('Invoice number', 'no'), f(form.kind === 'sale' ? 'Customer' : 'Supplier', 'party'),
      f(form.kind === 'sale' ? 'Customer GSTIN (empty for B2C)' : 'Supplier GSTIN', 'gstin', { ph: '15 characters' }),
      f('State (if no GSTIN)', 'state', { options: [['', 'Same as mine']].concat(STATES.map(function (s) { return [s[0], s[0] + ' ' + s[1]]; })) }),
      f('Taxable value (₹)', 'taxable', { type: 'number' }), f('GST rate', 'rate', { options: RATES.map(function (r) { return [String(r), r + '%']; }) }), f('Cess (₹, optional)', 'cess', { type: 'number' }),
      form.kind === 'purchase' ? h('label', { 'class': 'tcheck' }, [itc, ' Input tax credit can be claimed']) : null]));
    body.appendChild(preview); pv();
    body.appendChild(T.row([T.button(form.id ? 'Save changes' : 'Add to register', { primary: true, onclick: add }), form.id ? T.button('Cancel', { small: true, onclick: function () { form = blankForm(form.kind); draw(); } }) : null,
      db.entries.length ? null : T.button('Try a sample', { small: true, onclick: sample })]));
    body.appendChild(h('p', { 'class': 'tnote', text: 'Tip: invoices you saved in the Invoice Generator on this browser can be added in one go from the Register tab.' }));
  }
  function blankForm(kind) { return { kind: kind || 'sale', date: form.date, no: '', party: '', gstin: '', state: '', taxable: '', rate: form.rate, cess: '', itc: true }; }
  function add() {
    if (!form.no.trim() || !(+form.taxable > 0)) { status.error('Add the invoice number and a taxable value.'); return; }
    if (form.gstin && form.gstin.length !== 15) { status.error('A GSTIN has 15 characters.'); return; }
    var e = { id: form.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kind: form.kind, date: form.date, no: form.no.trim(), party: form.party.trim(), gstin: form.gstin, state: form.state,
      taxable: r2(+form.taxable), rate: +form.rate, cess: r2(+form.cess || 0), itc: form.kind === 'purchase' ? form.itc : undefined };
    db.entries = db.entries.filter(function (x) { return x.id !== e.id; }); db.entries.push(e);
    db.entries.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    V.save(db); status.ok((form.id ? 'Updated ' : 'Added ') + e.no + '.'); form = blankForm(form.kind); draw();
  }
  function sample() {
    var mo = month.value || new Date().toISOString().slice(0, 7);
    if (!db.home) db.home = '03';
    [['sale', '05', 'S-101', 'Gupta General Store', '03AAAPG1234K1Z9', 50000, 18], ['sale', '09', 'S-102', 'Walk-in customers', '', 12000, 5], ['sale', '14', 'S-103', 'Delhi Kitchenware', '07AABCD5678E1Z2', 30000, 18],
      ['purchase', '03', 'P-77', 'Steel Mart', '03AAACS4321L1Z7', 40000, 18], ['purchase', '11', 'P-78', 'Mumbai Plastics', '27AAACM8765N1Z3', 10000, 12]].forEach(function (r, i) {
      db.entries.push({ id: 'demo' + i, demo: true, kind: r[0], date: mo + '-' + r[1], no: r[2], party: r[3], gstin: r[4], state: '', taxable: r[5], rate: r[6], cess: 0, itc: r[0] === 'purchase' ? true : undefined });
    });
    V.save(db); view = 'summary'; draw(); status.ok('Sample entries added for this month. Remove them from the Register tab when you are done.');
  }
  function drawRegister() {
    var kind = T.select([['all', 'Sales and purchases'], ['sale', 'Sales only'], ['purchase', 'Purchases only']], T.store.get('gstr-kind', 'all'));
    kind.addEventListener('change', function () { T.store.set('gstr-kind', kind.value); draw(); });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Month', month), T.field('Show', kind)]));
    var list = db.entries.filter(function (e) { return inMonth(e) && (kind.value === 'all' || e.kind === kind.value); });
    var tb = h('div', { 'class': 'tcalc-scroll' }), rows = list.map(function (e) {
      var x = tax(e, db.home);
      return h('tr', {}, [h('td', { text: e.date }), h('td', { text: (e.kind === 'sale' ? 'Sale ' : 'Purchase ') + e.no }), h('td', { text: e.party + (e.gstin ? ' · ' + e.gstin : '') }), h('td', { text: m(e.taxable) }), h('td', { text: e.rate + '%' }),
        h('td', { text: x.inter ? 'IGST ' + m(x.igst) : m(x.cgst) + ' + ' + m(x.sgst) }), h('td', { text: m(x.total) }),
        h('td', {}, [h('button', { type: 'button', title: 'Edit', 'class': 'tbtn tbtn-sm', text: '✎', onclick: function () { form = JSON.parse(JSON.stringify(e)); form.taxable = String(e.taxable); form.cess = e.cess ? String(e.cess) : ''; view = 'add'; draw(); } }),
          h('button', { type: 'button', title: 'Delete', 'class': 'tbtn tbtn-sm', text: '✕', onclick: function () { if (!confirm('Delete ' + e.no + '?')) return; db.entries = db.entries.filter(function (y) { return y !== e; }); V.save(db); draw(); } })])]);
    });
    tb.appendChild(h('table', {}, [h('thead', {}, [h('tr', {}, ['Date', 'Invoice', 'Party', 'Taxable', 'Rate', 'Tax', 'Total', ''].map(function (x) { return h('th', { text: x }); }))]), h('tbody', {}, rows)]));
    body.appendChild(list.length ? tb : h('p', { 'class': 'tnote', text: 'No entries for this month yet.' }));
    var inv = (T.vault('invoice', { seller: {}, customers: [], docs: [], next: {}, logo: '' }).data().docs || []).filter(function (d) { return d.type === 'tax' || d.type === 'inv'; });
    body.appendChild(T.row([
      list.length ? T.button('Download CSV', { small: true, primary: true, onclick: function () { csv(list); } }) : null,
      inv.length ? T.button('Add sales from my saved invoices', { small: true, onclick: function () {
        var added = 0;
        inv.forEach(function (d) {
          if (db.entries.some(function (e) { return e.kind === 'sale' && e.no === d.no; })) return;
          var by = {};
          (d.items || []).forEach(function (it) { var base = (+it.qty || 0) * (+it.rate || 0) * (1 - (+it.disc || 0) / 100), r = d.taxmode === 'none' ? 0 : +it.tax || 0; by[r] = (by[r] || 0) + base; });
          Object.keys(by).forEach(function (r) { db.entries.push({ id: d.no + '-' + r, kind: 'sale', date: d.date, no: d.no, party: d.buyer.name || '', gstin: (d.buyer.tax || '').toUpperCase(), state: d.taxmode === 'gst-inter' && !d.buyer.tax ? '97' : '', taxable: r2(by[r]), rate: +r, cess: 0 }); added++; });
        });
        db.entries.sort(function (a, b) { return a.date < b.date ? -1 : 1; }); V.save(db); draw(); status.ok(added ? 'Added ' + added + ' rows from your invoices (one row per GST rate). Check the states of B2C sales.' : 'Those invoices are already in the register.');
      } }) : null,
      db.entries.some(function (e) { return e.demo; }) ? T.button('Remove sample entries', { small: true, onclick: function () { db.entries = db.entries.filter(function (e) { return !e.demo; }); V.save(db); draw(); } }) : null]));
  }
  function csv(list) {
    var head = 'Type,Invoice date,Invoice number,Party,GSTIN,Place of supply,Taxable value,Rate %,IGST,CGST,SGST,Cess,Invoice value,ITC eligible';
    var text = head + '\n' + list.map(function (e) { var x = tax(e, db.home), pos = (e.gstin ? e.gstin.slice(0, 2) : e.state) || db.home; return [e.kind === 'sale' ? 'Sale' : 'Purchase', e.date, e.no, '"' + String(e.party).replace(/"/g, '""') + '"', e.gstin, pos, e.taxable, e.rate, x.igst, x.cgst, x.sgst, x.cess, x.total, e.kind === 'purchase' ? (e.itc === false ? 'No' : 'Yes') : ''].join(','); }).join('\n');
    T.download(new Blob(['﻿' + text], { type: 'text/csv' }), 'gst-register-' + (month.value || 'all') + '.csv');
  }
  function drawSummary() {
    body.appendChild(T.field('Month', month));
    var s = summary(db.entries.filter(inMonth), db.home);
    function stat(label, v) { return h('div', { 'class': 'tstat' }, [h('b', { text: v }), h('span', { text: label })]); }
    body.appendChild(h('h3', { text: 'Sales (outward supplies, GSTR-1 / 3B table 3.1)' }));
    body.appendChild(h('div', { 'class': 'tstats', 'data-out': '' }, [stat('Taxable value (' + s.sale.n + ' rows: ' + s.sale.b2b + ' B2B, ' + s.sale.b2c + ' B2C)', m(s.sale.taxable)), stat('IGST', m(s.sale.igst)), stat('CGST', m(s.sale.cgst)), stat('SGST', m(s.sale.sgst))]));
    var rk = Object.keys(s.rates).sort(function (a, b) { return a - b; });
    if (rk.length) body.appendChild(h('div', { 'class': 'tcalc-scroll' }, [h('table', {}, [h('thead', {}, [h('tr', {}, ['Rate', 'Taxable value', 'Tax'].map(function (x) { return h('th', { text: x }); }))]),
      h('tbody', {}, rk.map(function (r) { return h('tr', {}, [h('td', { text: r + '%' }), h('td', { text: m(s.rates[r].taxable) }), h('td', { text: m(s.rates[r].tax) })]); }))])]));
    body.appendChild(h('h3', { text: 'Purchases with input tax credit (GSTR-3B table 4)' }));
    body.appendChild(h('div', { 'class': 'tstats' }, [stat('Taxable value (' + s.purchase.n + ' rows)', m(s.purchase.taxable)), stat('IGST credit', m(s.purchase.igst)), stat('CGST credit', m(s.purchase.cgst)), stat('SGST credit', m(s.purchase.sgst))]));
    body.appendChild(h('h3', { text: 'Tax to pay (rough)' }));
    var total = s.net.igst + s.net.cgst + s.net.sgst + s.net.cess;
    body.appendChild(h('div', { 'class': 'tstats' }, [stat('Output tax minus input credit', m(r2(total))), stat('IGST', m(s.net.igst)), stat('CGST', m(s.net.cgst)), stat('SGST', m(s.net.sgst))]));
    body.appendChild(h('p', { 'class': 'tnote', text: total < 0 ? 'More credit than tax this month: the extra credit carries forward.' : 'The GST portal sets IGST credit off first against IGST, then CGST and SGST, so the final cash amount per head can differ. Always check with your returns and your accountant.' }));
  }
  function draw() {
    db = V.data(); tabs.innerHTML = ''; body.innerHTML = '';
    [['add', form.id ? '✏️ Edit entry' : '➕ Add entry'], ['register', '📒 Register (' + db.entries.length + ')'], ['summary', '📊 Monthly summary']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(view === t[0]), text: t[1], onclick: function () { view = t[0]; draw(); } })); });
    if (view === 'add') drawAdd(); else if (view === 'register') drawRegister(); else drawSummary();
  }
  spot.appendChild(T.card([V.bar(draw), tabs, body, status.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  Promise.all([V.ready, T.vault('invoice', { seller: {}, customers: [], docs: [], next: {}, logo: '' }).ready]).then(function () { db = V.data(); draw(); });

  T.tests['gst-register'] = function () {
    var f = [];
    if (!gstinCheck('27AAPFU0939F1ZV')) f.push('valid GSTIN rejected');
    if (gstinCheck('27AAPFU0939F1ZW')) f.push('bad checksum accepted');
    if (gstinCheck('27AAPFU0939F1Z')) f.push('short GSTIN accepted');
    var a = tax({ taxable: 10000, rate: 18, gstin: '03AAAPG1234K1Z9' }, '03'), b = tax({ taxable: 10000, rate: 18, gstin: '07AABCD5678E1Z2' }, '03'), c = tax({ taxable: 999, rate: 5, state: '27' }, '03');
    if (a.cgst !== 900 || a.sgst !== 900 || a.igst || a.total !== 11800) f.push('intra ' + JSON.stringify(a));
    if (b.igst !== 1800 || b.cgst || !b.inter) f.push('inter ' + JSON.stringify(b));
    if (c.igst !== 49.95 || c.total !== 1048.95) f.push('b2c other state ' + JSON.stringify(c));
    var s = summary([{ kind: 'sale', taxable: 10000, rate: 18, gstin: '03AAAPG1234K1Z9' }, { kind: 'sale', taxable: 5000, rate: 12, state: '07' }, { kind: 'purchase', taxable: 4000, rate: 18, gstin: '03AAACS4321L1Z7' },
      { kind: 'purchase', taxable: 9999, rate: 18, gstin: '03AAACS4321L1Z7', itc: false }], '03');
    if (s.sale.cgst !== 900 || s.sale.igst !== 600 || s.purchase.cgst !== 360 || s.net.cgst !== 540 || s.net.igst !== 600 || s.sale.b2b !== 1 || s.sale.b2c !== 1) f.push('summary ' + JSON.stringify(s));
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
