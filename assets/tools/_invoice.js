/* Infinity invoice toolkit — invoices, quotations, proforma invoices, receipts, delivery challans and purchase orders.
   Your business details, customers and number series are saved only in this browser (T.vault('invoice')).
   Designed & Developed by Nivesh Sahayak. See LICENSE.
   GCOTools.engine('invoice', 'quotation', { type: 'quote' }) — the type shown first; people can switch inside the tool. */
(function () {
  var T = window.GCOTools, h = T.h;
  var TYPES = {
    tax: { name: 'Tax Invoice', pre: 'INV-', party: 'Bill to', due: true, prices: true },
    inv: { name: 'Invoice', pre: 'INV-', party: 'Bill to', due: true, prices: true },
    quote: { name: 'Quotation / Estimate', title: 'Quotation', pre: 'QT-', party: 'Quotation for', due: 'Valid until', prices: true },
    proforma: { name: 'Proforma Invoice', pre: 'PI-', party: 'Bill to', due: 'Valid until', prices: true },
    receipt: { name: 'Payment Receipt', title: 'Receipt', pre: 'RCT-', party: 'Received from', receipt: true },
    challan: { name: 'Delivery Challan', pre: 'DC-', party: 'Deliver to', prices: false },
    po: { name: 'Purchase Order', pre: 'PO-', party: 'Supplier', due: 'Deliver by', prices: true }
  };
  var TAX = [['gst-intra', 'GST: CGST + SGST (same state)'], ['gst-inter', 'GST: IGST (other state)'], ['vat', 'VAT / sales tax'], ['none', 'No tax']];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function iso(n) { var d = new Date(); d.setDate(d.getDate() + (n || 0)); return d.toISOString().slice(0, 10); }
  function r2(n) { return Math.round(n * 100) / 100; }

  // all the money in one place, so the preview and our tests use the same numbers
  function totals(doc) {
    var t = { lines: [], sub: 0, disc: 0, taxable: 0, tax: 0, byRate: {} };
    (doc.items || []).forEach(function (it) {
      var q = +it.qty || 0, rate = +it.rate || 0, gross = q * rate, dsc = gross * (+it.disc || 0) / 100, base = gross - dsc;
      var tx = doc.taxmode === 'none' ? 0 : base * (+it.tax || 0) / 100;
      t.lines.push({ gross: gross, disc: dsc, base: base, tax: tx, total: base + tx });
      t.sub += gross; t.disc += dsc; t.taxable += base; t.tax += tx;
      if (tx) t.byRate[it.tax] = (t.byRate[it.tax] || 0) + tx;
    });
    t.ship = +doc.ship || 0;
    var raw = t.taxable + t.tax + t.ship;
    t.round = doc.roundoff ? Math.round(raw) - raw : 0;
    t.grand = r2(raw + t.round);
    t.paid = +doc.paid || 0;
    t.balance = r2(t.grand - t.paid);
    return t;
  }
  T.invoiceTotals = totals;

  T.engines.invoice = function (spot, T, def, id) {
    var V = T.vault('invoice', { seller: {}, customers: [], docs: [], next: {}, logo: '' });
    var db = V.data();
    function blank(type) {
      var y = TYPES[type];
      return { type: type, no: y.pre + String((db.next[type] || 1)).padStart(3, '0'), date: iso(0), due: y.due ? iso(15) : '', cur: T.currency(),
        taxmode: T.currency() === 'INR' ? 'gst-intra' : T.currency() === 'USD' ? 'none' : 'vat', buyer: { name: '', addr: '', tax: '', phone: '' },
        items: [{ desc: '', hsn: '', qty: 1, unit: 'pcs', rate: 0, disc: 0, tax: T.currency() === 'INR' ? 18 : 0 }], ship: 0, roundoff: T.currency() === 'INR', paid: 0,
        notes: type === 'quote' ? 'Prices are valid until the date above. Taxes as applicable.' : type === 'receipt' ? '' : 'Thank you for your business.',
        mode: 'UPI', ref: '', against: '', place: '' };
    }
    var doc = T.store.get('invoice-draft-' + id, null) || blank(def.type || 'inv');
    var view = 'edit';
    var tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' });
    var paper = h('div', { 'class': 'tpaper', 'data-out': '' });
    function keep() { T.store.set('invoice-draft-' + id, doc); }
    function field(label, obj, key, attrs, onChange) {
      var el = attrs && attrs.options ? T.select(attrs.options, obj[key]) : attrs && attrs.area ? h('textarea', { rows: '3', placeholder: (attrs && attrs.ph) || '' }) :
        h('input', { type: (attrs && attrs.type) || 'text', step: 'any', placeholder: (attrs && attrs.ph) || '' });
      if (el.type === 'checkbox') el.checked = !!obj[key]; else el.value = obj[key] == null ? '' : obj[key];
      el.addEventListener('input', function () { obj[key] = el.type === 'checkbox' ? el.checked : el.value; keep(); render(); if (onChange) onChange(); });
      el.addEventListener('change', function () { obj[key] = el.type === 'checkbox' ? el.checked : el.value; keep(); render(); if (onChange) onChange(); });
      if (el.type === 'checkbox') return h('label', { 'class': 'tcheck' }, [el, ' ' + label]);
      return T.field(label, el);
    }
    function sellerSave() { db.seller = doc.seller || db.seller; V.save(db); }
    function drawEdit() {
      var y = TYPES[doc.type], s = db.seller;
      body.appendChild(h('div', { 'class': 'tgrid2' }, [
        field('Document', doc, 'type', { options: Object.keys(TYPES).map(function (k) { return [k, TYPES[k].name]; }) }, function () {
          var y2 = TYPES[doc.type]; doc.no = y2.pre + String(db.next[doc.type] || 1).padStart(3, '0'); doc.due = y2.due ? (doc.due || iso(15)) : ''; draw(); }),
        field('Number', doc, 'no'), field('Date', doc, 'date', { type: 'date' }),
        y.due ? field(typeof y.due === 'string' ? y.due : 'Due date', doc, 'due', { type: 'date' }) : null,
        field('Currency', doc, 'cur', { options: T.CURRENCIES.map(function (c) { return [c, c]; }) }),
        y.receipt || !y.prices ? null : field('Tax', doc, 'taxmode', { options: TAX }, draw)]));
      body.appendChild(h('h3', { text: 'From (your business, saved for next time)' }));
      var sb = h('div', { 'class': 'tgrid2' }, [
        sfield('Business name', 'name'), sfield('Address', 'addr', { area: 1 }), sfield(doc.cur === 'INR' ? 'GSTIN (optional)' : 'Tax / VAT number (optional)', 'tax'),
        sfield('Phone', 'phone'), sfield('Email', 'email'), sfield('Bank details (optional)', 'bank', { area: 1, ph: 'Bank, account number, IFSC / SWIFT' }),
        doc.cur === 'INR' ? sfield('UPI ID for a pay-now QR (optional)', 'upi', { ph: 'yourname@bank' }) : null]);
      body.appendChild(sb);
      var logoIn = h('input', { type: 'file', accept: 'image/*' });
      logoIn.addEventListener('change', function () {
        var f = logoIn.files[0]; if (!f) return;
        if (f.size > 400000) { alert('Please choose a logo under 400 KB.'); return; }
        T.read(f, 'dataURL').then(function (u) { db.logo = u; V.save(db); render(); });
      });
      body.appendChild(T.row([T.field('Logo (optional)', logoIn), db.logo ? T.button('Remove logo', { small: true, onclick: function () { db.logo = ''; V.save(db); render(); } }) : null]));
      body.appendChild(h('h3', { text: y.party }));
      var saved = db.customers.length ? T.select([['', 'Pick a saved customer…']].concat(db.customers.map(function (c, i) { return [String(i), c.name]; })), '') : null;
      if (saved) saved.addEventListener('change', function () { if (saved.value === '') return; doc.buyer = JSON.parse(JSON.stringify(db.customers[+saved.value])); keep(); draw(); });
      body.appendChild(h('div', { 'class': 'tgrid2' }, [saved ? T.field('Saved customers', saved) : null, field('Name', doc.buyer, 'name'), field('Address', doc.buyer, 'addr', { area: 1 }),
        y.receipt ? null : field(doc.cur === 'INR' ? 'GSTIN (optional)' : 'Tax number (optional)', doc.buyer, 'tax'), field('Phone (optional)', doc.buyer, 'phone'),
        doc.cur === 'INR' && doc.taxmode.indexOf('gst') === 0 && !y.receipt ? field('Place of supply (state)', doc, 'place', { ph: 'e.g. Punjab (03)' }) : null]));
      if (y.receipt) {
        body.appendChild(h('h3', { text: 'Payment' }));
        if (!doc.amount) doc.amount = '';
        body.appendChild(h('div', { 'class': 'tgrid2' }, [field('Amount received', doc, 'amount', { type: 'number' }), field('Paid by', doc, 'mode', { options: ['Cash', 'UPI', 'Bank transfer', 'Cheque', 'Card'].map(function (m) { return [m, m]; }) }),
          field('Reference (UTR / cheque no.)', doc, 'ref'), field('Towards', doc, 'against', { ph: 'e.g. Invoice INV-012 / rent for October' })]));
      } else {
        body.appendChild(h('h3', { text: 'Items' }));
        var box = h('div', { 'class': 'titems-edit' });
        doc.items.forEach(function (it, i) {
          var cells = [field('Item / service', it, 'desc'), field('Qty', it, 'qty', { type: 'number' })];
          if (y.prices) cells.push(field('Rate', it, 'rate', { type: 'number' }), field('Disc. %', it, 'disc', { type: 'number' }), doc.taxmode !== 'none' ? field((doc.taxmode === 'vat' ? 'VAT' : 'GST') + ' %', it, 'tax', { type: 'number' }) : h('span'));
          else cells.push(field('Unit', it, 'unit'), h('span'), h('span'));
          cells.push(T.button('✕', { small: true, onclick: function () { doc.items.splice(i, 1); if (!doc.items.length) doc.items.push(blank(doc.type).items[0]); keep(); draw(); } }));
          if (doc.cur === 'INR' && y.prices) cells[0].appendChild(h('small', {}, [h('input', { type: 'text', placeholder: 'HSN / SAC (optional)', value: it.hsn || '', style: 'margin-top:4px', oninput: function (e) { it.hsn = e.target.value; keep(); render(); } })]));
          box.appendChild(h('div', { 'class': 'trow-item' }, cells));
        });
        body.appendChild(box);
        body.appendChild(T.row([T.button('+ Add item', { small: true, onclick: function () { var last = doc.items[doc.items.length - 1]; doc.items.push({ desc: '', hsn: '', qty: 1, unit: last.unit, rate: 0, disc: 0, tax: last.tax }); keep(); draw(); } })]));
        if (y.prices) body.appendChild(h('div', { 'class': 'tgrid2' }, [field('Shipping / other charges', doc, 'ship', { type: 'number' }), doc.type !== 'quote' && doc.type !== 'po' ? field('Already paid (advance)', doc, 'paid', { type: 'number' }) : null,
          field('Round off the total', doc, 'roundoff', { type: 'checkbox' })]));
      }
      body.appendChild(h('div', { 'class': 'tgrid2' }, [field('Notes / terms', doc, 'notes', { area: 1 })]));
      function sfield(label, key, attrs) {
        db.seller = db.seller || {}; doc.seller = db.seller;
        return field(label, db.seller, key, attrs, sellerSave);
      }
    }
    function drawSaved() {
      var list = h('div', { 'class': 'tlist' });
      db.docs.slice().reverse().forEach(function (d) {
        var t = totals(d);
        list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: TYPES[d.type].receipt ? '🧾' : '📄' }),
          h('span', { 'class': 'titem-main' }, [h('b', { text: d.no + ' · ' + (d.buyer.name || '—') }), h('small', { text: TYPES[d.type].name + ' · ' + d.date })]),
          h('span', { 'class': 'titem-amt', text: T.money(TYPES[d.type].receipt ? +d.amount || 0 : t.grand, d.cur) }),
          h('button', { type: 'button', title: 'Open', text: '✎', onclick: function () { doc = JSON.parse(JSON.stringify(d)); keep(); view = 'edit'; draw(); } }),
          h('button', { type: 'button', title: 'Copy as new', text: '⧉', onclick: function () { var n = JSON.parse(JSON.stringify(d)); var b = blank(n.type); n.no = b.no; n.date = b.date; n.due = b.due; doc = n; keep(); view = 'edit'; draw(); } }),
          h('button', { type: 'button', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete ' + d.no + '?')) { db.docs = db.docs.filter(function (x) { return x !== d; }); V.save(db); draw(); } } })]));
      });
      if (!db.docs.length) list.appendChild(h('p', { 'class': 'tnote', text: 'Documents you save appear here, so you can open, copy or print them again.' }));
      body.appendChild(list);
      if (db.docs.length) body.appendChild(T.row([T.button('Download list (CSV / Excel)', { small: true, onclick: function () {
        var text = 'Type,Number,Date,Customer,Taxable,Tax,Total,Currency\n' + db.docs.map(function (d) { var t = totals(d); return [TYPES[d.type].name, d.no, d.date, '"' + (d.buyer.name || '').replace(/"/g, '""') + '"', r2(t.taxable), r2(t.tax), TYPES[d.type].receipt ? d.amount : t.grand, d.cur].join(','); }).join('\n');
        T.download(new Blob(['﻿' + text], { type: 'text/csv' }), 'documents.csv');
      } })]));
    }
    // the printable document
    function render() {
      var y = TYPES[doc.type], s = db.seller || {}, t = totals(doc), m = function (n) { return T.money(n, doc.cur); }, gst = doc.taxmode.indexOf('gst') === 0;
      var title = (y.title || y.name).toUpperCase();
      var head = '<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start">' +
        '<div>' + (db.logo ? '<img src="' + db.logo + '" alt="" style="max-height:64px;max-width:180px;display:block;margin-bottom:6px">' : '') +
        '<b style="font-size:18px">' + esc(s.name || 'Your Business Name') + '</b><div style="white-space:pre-line">' + esc(s.addr || '') + '</div>' +
        (s.tax ? '<div>' + (doc.cur === 'INR' ? 'GSTIN' : 'Tax no.') + ': ' + esc(s.tax) + '</div>' : '') + (s.phone || s.email ? '<div>' + esc([s.phone, s.email].filter(Boolean).join(' · ')) + '</div>' : '') + '</div>' +
        '<div style="text-align:right"><div style="font-size:22px;font-weight:800;letter-spacing:.04em">' + title + '</div><div>No. <b>' + esc(doc.no) + '</b></div><div>Date: ' + esc(doc.date) + '</div>' +
        (doc.due ? '<div>' + esc(typeof y.due === 'string' ? y.due : 'Due date') + ': ' + esc(doc.due) + '</div>' : '') + '</div></div>';
      var to = '<div style="margin-top:16px;padding:10px 12px;background:#f6f7f9;border-radius:8px"><div style="font-size:12px;color:#555;font-weight:700;text-transform:uppercase">' + esc(y.party) + '</div><b>' + esc(doc.buyer.name || '—') + '</b>' +
        '<div style="white-space:pre-line">' + esc(doc.buyer.addr || '') + '</div>' + (doc.buyer.tax ? '<div>' + (doc.cur === 'INR' ? 'GSTIN' : 'Tax no.') + ': ' + esc(doc.buyer.tax) + '</div>' : '') +
        (doc.buyer.phone ? '<div>' + esc(doc.buyer.phone) + '</div>' : '') + (doc.place && gst ? '<div>Place of supply: ' + esc(doc.place) + '</div>' : '') + '</div>';
      var mid = '';
      if (y.receipt) {
        var a = +doc.amount || 0;
        mid = '<p style="margin-top:18px;font-size:15px;line-height:1.8">Received with thanks from <b>' + esc(doc.buyer.name || '—') + '</b> the sum of <b>' + m(a) + '</b> (' + esc(T.words(a, doc.cur)) + ') by <b>' + esc(doc.mode) + '</b>' +
          (doc.ref ? ' (ref. ' + esc(doc.ref) + ')' : '') + (doc.against ? ' towards <b>' + esc(doc.against) + '</b>' : '') + '.</p>';
        t.grand = a;
      } else {
        var cols = y.prices ? ['#', 'Item', doc.cur === 'INR' ? 'HSN/SAC' : null, 'Qty', 'Rate', t.disc ? 'Disc.' : null, doc.taxmode !== 'none' ? (gst ? 'GST' : 'Tax') : null, 'Amount'].filter(Boolean) : ['#', 'Item', 'Qty', 'Unit'];
        var rows = doc.items.map(function (it, i) {
          var L = t.lines[i];
          if (!y.prices) return [i + 1, esc(it.desc), esc(it.qty), esc(it.unit)];
          return [i + 1, esc(it.desc), doc.cur === 'INR' ? esc(it.hsn || '') : null, esc(it.qty), m(+it.rate || 0), t.disc ? (+it.disc || 0) + '%' : null, doc.taxmode !== 'none' ? (+it.tax || 0) + '%' : null, m(L.base)].filter(function (x) { return x !== null; });
        });
        mid = '<table style="margin-top:16px"><thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
        if (y.prices) {
          var lines = [['Subtotal' + (t.disc ? ' (after discount)' : ''), m(t.taxable)]];
          Object.keys(t.byRate).sort(function (a, b) { return a - b; }).forEach(function (rt) {
            var v = t.byRate[rt];
            if (doc.taxmode === 'gst-intra') lines.push(['CGST @ ' + rt / 2 + '%', m(v / 2)], ['SGST @ ' + rt / 2 + '%', m(v / 2)]);
            else lines.push([(doc.taxmode === 'gst-inter' ? 'IGST' : 'Tax') + ' @ ' + rt + '%', m(v)]);
          });
          if (t.ship) lines.push(['Shipping / other', m(t.ship)]);
          if (t.round) lines.push(['Round off', (t.round > 0 ? '+' : '−') + m(Math.abs(t.round))]);
          lines.push(['<b>Total</b>', '<b>' + m(t.grand) + '</b>']);
          if (t.paid) lines.push(['Paid', m(t.paid)], ['<b>Balance due</b>', '<b>' + m(t.balance) + '</b>']);
          mid += '<table style="margin-top:8px;margin-left:auto;width:auto;min-width:260px"><tbody>' + lines.map(function (l) { return '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td></tr>'; }).join('') + '</tbody></table>' +
            '<p style="margin-top:8px"><b>Amount in words:</b> ' + esc(T.words(t.grand, doc.cur)) + '</p>';
        }
      }
      var upi = s.upi && doc.cur === 'INR' && (y.prices || y.receipt) && !y.receipt && doc.type !== 'po' ? 'upi://pay?pa=' + encodeURIComponent(s.upi) + '&pn=' + encodeURIComponent(s.name || '') + '&am=' + (t.paid ? t.balance : t.grand).toFixed(2) + '&cu=INR&tn=' + encodeURIComponent(doc.no) : '';
      var foot = '<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:18px;align-items:flex-end"><div style="max-width:60%">' +
        (doc.notes ? '<div style="white-space:pre-line">' + esc(doc.notes) + '</div>' : '') + (s.bank && !y.receipt && doc.type !== 'po' ? '<div style="margin-top:8px;white-space:pre-line"><b>Bank details</b>\n' + esc(s.bank) + '</div>' : '') +
        (upi ? '<div style="margin-top:8px;display:flex;gap:8px;align-items:center"><span class="tinv-qr"></span><small>Scan to pay with any UPI app<br>' + esc(s.upi) + '</small></div>' : '') + '</div>' +
        '<div style="text-align:center;min-width:180px"><div style="height:46px"></div><div style="border-top:1px solid #999;padding-top:4px">For ' + esc(s.name || 'Your Business') + '<br><small>Authorised signatory</small></div></div></div>';
      paper.innerHTML = head + to + mid + foot;
      var q = paper.querySelector('.tinv-qr');
      if (q) T.lib('qrcode').then(function (qrcode) { var c = qrcode(0, 'M'); c.addData(upi); c.make(); q.innerHTML = c.createImgTag(3, 2); }).catch(function () {});
      share.href = 'https://wa.me/' + (doc.buyer.phone || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(
        (y.title || y.name) + ' ' + doc.no + ' from ' + (s.name || 'us') + '\nDate: ' + doc.date + '\nAmount: ' + m(t.paid ? t.balance : t.grand) + (doc.due ? '\n' + (typeof y.due === 'string' ? y.due : 'Due') + ': ' + doc.due : '') + (s.upi && doc.cur === 'INR' ? '\nPay by UPI: ' + s.upi : ''));
      return t;
    }
    function print() {
      render();
      var w = window.open('', '_blank'); if (!w) return;
      w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(doc.no) + '</title><style>body{font:13px/1.45 system-ui,"Segoe UI",Arial,sans-serif;color:#111;margin:1.4cm}table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:right}th:nth-child(2),td:nth-child(2){text-align:left}th{background:#f3f4f6}@page{margin:1cm}</style></head><body>' + paper.innerHTML + '</body></html>');
      w.document.close(); setTimeout(function () { w.print(); }, 400);
    }
    function saveDoc() {
      if (!doc.buyer.name) { alert('Add the customer’s name first.'); return; }
      db = V.data();
      db.docs = db.docs.filter(function (d) { return d.no !== doc.no || d.type !== doc.type; });
      db.docs.push(JSON.parse(JSON.stringify(doc)));
      var n = parseInt(String(doc.no).replace(/\D+/g, ''), 10);
      if (n >= (db.next[doc.type] || 1)) db.next[doc.type] = n + 1;
      if (doc.buyer.name && !db.customers.some(function (c) { return c.name === doc.buyer.name; })) db.customers.push(JSON.parse(JSON.stringify(doc.buyer)));
      V.save(db); saved.ok('Saved ' + doc.no + '. The next number will be ' + TYPES[doc.type].pre + String(db.next[doc.type]).padStart(3, '0') + '.');
    }
    var saved = T.status();
    var share = h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', text: 'Send on WhatsApp' });
    function draw() {
      db = V.data();
      tabs.innerHTML = '';
      [['edit', '✏️ Create'], ['saved', '🗂️ Saved (' + db.docs.length + ')']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(view === t[0]), text: t[1], onclick: function () { view = t[0]; draw(); } })); });
      body.innerHTML = '';
      if (view === 'edit') drawEdit(); else drawSaved();
      paper.hidden = view !== 'edit'; actions.hidden = view !== 'edit';
      render();
    }
    var actions = h('div', {}, [T.row([T.button('Print / Save as PDF', { primary: true, onclick: print }), T.button('Save', { onclick: saveDoc }), share,
      T.button('New', { small: true, onclick: function () { doc = blank(doc.type); keep(); saved.clear(); draw(); } })]), saved.el]);
    spot.appendChild(T.card([V.bar(draw), tabs, body, h('h3', { text: 'Preview' }), paper, actions]));
    V.ready.then(function () { db = V.data(); if (!T.store.get('invoice-draft-' + id, null)) doc = blank(def.type || 'inv'); draw(); });

    T.tests[id] = function () { return V.ready.then(test); };
    function test() {
      var fails = [], keepDoc = doc;
      doc = blank(def.type || 'inv'); doc.cur = 'INR'; doc.taxmode = 'gst-intra'; doc.roundoff = false;
      doc.items = [{ desc: 'Notebook', qty: 2, rate: 500, disc: 0, tax: 18 }, { desc: 'Pen set', qty: 1, rate: 1000, disc: 10, tax: 18 }];
      var t = totals(doc);
      if (Math.abs(t.taxable - 1900) > 0.001) fails.push('taxable ' + t.taxable);
      if (Math.abs(t.tax - 342) > 0.001) fails.push('tax ' + t.tax);
      if (t.grand !== 2242) fails.push('total ' + t.grand);
      if (T.words(2242, 'INR') !== 'Rupees Two Thousand Two Hundred Forty-Two Only') fails.push('words: ' + T.words(2242, 'INR'));
      if (T.words(1250000.5, 'INR') !== 'Rupees Twelve Lakh Fifty Thousand and Fifty Paise Only') fails.push('lakh words: ' + T.words(1250000.5, 'INR'));
      if (T.words(1250000, 'USD') !== 'Dollars One Million Two Hundred Fifty Thousand Only') fails.push('usd words: ' + T.words(1250000, 'USD'));
      doc.roundoff = true; doc.items[1].rate = 1000.4; t = totals(doc);
      if (t.grand !== Math.round(t.taxable + t.tax)) fails.push('round off ' + t.grand);
      if (TYPES[doc.type].prices) { render(); if (paper.textContent.indexOf('CGST @ 9%') < 0) fails.push('no CGST line'); }
      doc = keepDoc; render();
      return Promise.resolve({ ok: !fails.length, n: 8, fails: fails });
    };
  };
})();
