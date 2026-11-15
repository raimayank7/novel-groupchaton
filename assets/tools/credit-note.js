/* Infinity by GroupChatOn — credit-note. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Credit note and debit note maker: against an invoice, with GST (CGST/SGST or IGST) or VAT, amount in words and print / PDF.
   Uses your business details and saved invoices from the Invoice Generator (same browser); notes are kept in their own list. */
GCOTools.register('credit-note', function (spot, T) {
  var h = T.h;
  var V = T.vault('credit-note', { seller: {}, notes: [], next: {} }), INV = T.vault('invoice', { seller: {}, customers: [], docs: [], next: {}, logo: '' });
  var KIND = { credit: { name: 'Credit Note', pre: 'CN-', amt: 'Amount credited', reasons: ['Goods returned by the buyer', 'Discount given after the sale', 'Rate charged was too high', 'Deficiency in goods or services', 'Excess tax charged'] },
    debit: { name: 'Debit Note', pre: 'DN-', amt: 'Amount debited', reasons: ['Rate charged was too low', 'Additional charges (freight, packing)', 'Short tax charged', 'Extra quantity supplied'] } };
  var TAX = [['gst-intra', 'GST: CGST + SGST (same state)'], ['gst-inter', 'GST: IGST (other state)'], ['vat', 'VAT / sales tax'], ['none', 'No tax']];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function iso(n) { var d = new Date(); d.setDate(d.getDate() + (n || 0)); return d.toISOString().slice(0, 10); }
  function r2(n) { return Math.round(n * 100) / 100; }
  function totals(doc) {
    var t = { lines: [], taxable: 0, tax: 0, byRate: {} };
    doc.items.forEach(function (it) {
      var base = (+it.qty || 0) * (+it.rate || 0), tx = doc.taxmode === 'none' ? 0 : base * (+it.tax || 0) / 100;
      t.lines.push({ base: base, tax: tx }); t.taxable += base; t.tax += tx; if (tx) t.byRate[it.tax] = (t.byRate[it.tax] || 0) + tx;
    });
    t.grand = r2(t.taxable + t.tax);
    return t;
  }
  var db = V.data();
  function blank(kind) {
    var cur = T.currency();
    return { kind: kind, no: KIND[kind].pre + String(db.next[kind] || 1).padStart(3, '0'), date: iso(0), cur: cur, taxmode: cur === 'INR' ? 'gst-intra' : cur === 'USD' ? 'none' : 'vat',
      reason: KIND[kind].reasons[0], inv: { no: '', date: '' }, buyer: { name: '', addr: '', tax: '', phone: '' }, place: '', items: [{ desc: '', hsn: '', qty: 1, rate: 0, tax: cur === 'INR' ? 18 : 0 }], notes: '' };
  }
  var doc = T.store.get('credit-note-draft', null) || blank('credit'), view = 'edit';
  function keep() { T.store.set('credit-note-draft', doc); }
  var tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' }), paper = h('div', { 'class': 'tpaper', 'data-out': '' }), status = T.status();
  function field(label, obj, key, a, then) {
    a = a || {};
    var el = a.options ? T.select(a.options, obj[key]) : a.area ? h('textarea', { rows: '3', placeholder: a.ph || '' }) : h('input', { type: a.type || 'text', step: 'any', placeholder: a.ph || '' });
    el.value = obj[key] == null ? '' : obj[key];
    function set() { obj[key] = el.value; keep(); render(); if (then) then(); }
    el.addEventListener('input', set); if (a.options || a.type === 'date') el.addEventListener('change', set);
    return T.field(label, el);
  }
  function seller() { var s = db.seller || {}; if (!s.name) { var i = INV.data().seller || {}; if (i.name) { s = JSON.parse(JSON.stringify(i)); db.seller = s; } } return s; }
  function drawEdit() {
    var k = KIND[doc.kind], s = seller(), invs = (INV.data().docs || []).filter(function (d) { return ['tax', 'inv', 'proforma'].indexOf(d.type) >= 0; });
    body.appendChild(T.field('Type', T.seg([['credit', 'Credit note'], ['debit', 'Debit note']], doc.kind, function (v) { doc.kind = v; doc.no = KIND[v].pre + String(db.next[v] || 1).padStart(3, '0'); doc.reason = KIND[v].reasons[0]; keep(); draw(); })));
    if (invs.length) {
      var pick = T.select([['', 'Fill from a saved invoice…']].concat(invs.map(function (d, i) { return [String(i), d.no + ' · ' + (d.buyer.name || '') + ' · ' + d.date]; })), '');
      pick.addEventListener('change', function () {
        if (pick.value === '') return; var d = invs[+pick.value];
        doc.inv = { no: d.no, date: d.date }; doc.buyer = JSON.parse(JSON.stringify(d.buyer)); doc.cur = d.cur; doc.taxmode = d.taxmode; doc.place = d.place || '';
        doc.items = d.items.map(function (it) { return { desc: it.desc, hsn: it.hsn || '', qty: it.qty, rate: r2((+it.rate || 0) * (1 - (+it.disc || 0) / 100)), tax: it.tax }; });
        keep(); draw(); status.ok('Filled from ' + d.no + '. Now change the quantities or rates to only what you are crediting or debiting.');
      });
      body.appendChild(T.field('Against a saved invoice (from the Invoice Generator)', pick));
    }
    body.appendChild(h('div', { 'class': 'tgrid2' }, [field('Number', doc, 'no'), field('Date', doc, 'date', { type: 'date' }), field('Original invoice no.', doc.inv, 'no'), field('Original invoice date', doc.inv, 'date', { type: 'date' }),
      field('Reason', doc, 'reason', { options: k.reasons.map(function (r) { return [r, r]; }).concat([[doc.reason, doc.reason]]).filter(function (x, i, a) { return a.map(function (y) { return y[0]; }).indexOf(x[0]) === i; }) }),
      field('Currency', doc, 'cur', { options: T.CURRENCIES.map(function (c) { return [c, c]; }) }), field('Tax', doc, 'taxmode', { options: TAX }, draw)]));
    body.appendChild(h('h3', { text: 'Your business (saved for next time)' }));
    db.seller = s;
    body.appendChild(h('div', { 'class': 'tgrid2' }, [['name', 'Business name'], ['addr', 'Address', 1], ['tax', doc.cur === 'INR' ? 'GSTIN (optional)' : 'Tax / VAT number (optional)'], ['phone', 'Phone']].map(function (f) {
      return field(f[1], s, f[0], { area: f[2] }, function () { V.save(db); }); })));
    body.appendChild(h('h3', { text: doc.kind === 'credit' ? 'Issued to (the buyer)' : 'Issued to' }));
    body.appendChild(h('div', { 'class': 'tgrid2' }, [field('Name', doc.buyer, 'name'), field('Address', doc.buyer, 'addr', { area: 1 }), field(doc.cur === 'INR' ? 'GSTIN (optional)' : 'Tax number (optional)', doc.buyer, 'tax'),
      doc.cur === 'INR' && doc.taxmode.indexOf('gst') === 0 ? field('Place of supply (state)', doc, 'place', { ph: 'e.g. Punjab (03)' }) : null]));
    body.appendChild(h('h3', { text: 'Items' }));
    var box = h('div', { 'class': 'titems-edit' });
    doc.items.forEach(function (it, i) {
      box.appendChild(h('div', { 'class': 'trow-item' }, [field('Item / service', it, 'desc'), doc.cur === 'INR' ? field('HSN / SAC', it, 'hsn') : h('span'), field('Qty', it, 'qty', { type: 'number' }), field('Rate', it, 'rate', { type: 'number' }),
        doc.taxmode !== 'none' ? field((doc.taxmode === 'vat' ? 'VAT' : 'GST') + ' %', it, 'tax', { type: 'number' }) : h('span'),
        T.button('✕', { small: true, onclick: function () { doc.items.splice(i, 1); if (!doc.items.length) doc.items.push(blank(doc.kind).items[0]); keep(); draw(); } })]));
    });
    body.appendChild(box);
    body.appendChild(T.row([T.button('+ Add item', { small: true, onclick: function () { doc.items.push({ desc: '', hsn: '', qty: 1, rate: 0, tax: doc.items[doc.items.length - 1].tax }); keep(); draw(); } })]));
    body.appendChild(field('Notes', doc, 'notes', { area: 1, ph: 'e.g. Credit will be adjusted against your next invoice.' }));
  }
  function html(d, s) {
    var k = KIND[d.kind], t = totals(d), m = function (n) { return T.money(n, d.cur); }, gst = d.taxmode.indexOf('gst') === 0;
    var lines = [['Taxable value', m(t.taxable)]];
    Object.keys(t.byRate).sort(function (a, b) { return a - b; }).forEach(function (rt) {
      var v = t.byRate[rt];
      if (d.taxmode === 'gst-intra') lines.push(['CGST @ ' + rt / 2 + '%', m(v / 2)], ['SGST @ ' + rt / 2 + '%', m(v / 2)]);
      else lines.push([(d.taxmode === 'gst-inter' ? 'IGST' : 'Tax') + ' @ ' + rt + '%', m(v)]);
    });
    lines.push(['<b>' + k.amt + '</b>', '<b>' + m(t.grand) + '</b>']);
    var cols = ['#', 'Item', d.cur === 'INR' ? 'HSN/SAC' : null, 'Qty', 'Rate', d.taxmode !== 'none' ? (gst ? 'GST' : 'Tax') : null, 'Amount'].filter(Boolean);
    return '<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap"><div><b style="font-size:18px">' + esc(s.name || 'Your Business Name') + '</b><div style="white-space:pre-line">' + esc(s.addr || '') + '</div>' +
      (s.tax ? '<div>' + (d.cur === 'INR' ? 'GSTIN' : 'Tax no.') + ': ' + esc(s.tax) + '</div>' : '') + (s.phone ? '<div>' + esc(s.phone) + '</div>' : '') + '</div>' +
      '<div style="text-align:right"><div style="font-size:22px;font-weight:800;letter-spacing:.04em">' + k.name.toUpperCase() + '</div><div>No. <b>' + esc(d.no) + '</b></div><div>Date: ' + esc(d.date) + '</div>' +
      (d.inv.no ? '<div>Original invoice: <b>' + esc(d.inv.no) + '</b>' + (d.inv.date ? ' dated ' + esc(d.inv.date) : '') + '</div>' : '') + '</div></div>' +
      '<div style="margin-top:14px;padding:10px 12px;background:#f6f7f9;border-radius:8px"><div style="font-size:12px;color:#555;font-weight:700;text-transform:uppercase">Issued to</div><b>' + esc(d.buyer.name || '—') + '</b><div style="white-space:pre-line">' + esc(d.buyer.addr || '') + '</div>' +
      (d.buyer.tax ? '<div>' + (d.cur === 'INR' ? 'GSTIN' : 'Tax no.') + ': ' + esc(d.buyer.tax) + '</div>' : '') + (d.place && gst ? '<div>Place of supply: ' + esc(d.place) + '</div>' : '') + '</div>' +
      '<p style="margin:12px 0 0"><b>Reason:</b> ' + esc(d.reason) + '</p>' +
      '<table style="margin-top:10px"><thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + d.items.map(function (it, i) {
        return '<tr>' + [i + 1, esc(it.desc), d.cur === 'INR' ? esc(it.hsn || '') : null, esc(it.qty), m(+it.rate || 0), d.taxmode !== 'none' ? (+it.tax || 0) + '%' : null, m(t.lines[i].base)].filter(function (x) { return x !== null; }).map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table>' +
      '<table style="margin-top:8px;margin-left:auto;width:auto;min-width:260px"><tbody>' + lines.map(function (l) { return '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<p style="margin-top:8px"><b>Amount in words:</b> ' + esc(T.words(t.grand, d.cur)) + '</p>' + (d.notes ? '<div style="white-space:pre-line;margin-top:8px">' + esc(d.notes) + '</div>' : '') +
      '<div style="text-align:right;margin-top:22px"><div style="height:40px"></div><div style="display:inline-block;border-top:1px solid #999;padding-top:4px;min-width:180px;text-align:center">For ' + esc(s.name || 'Your Business') + '<br><small>Authorised signatory</small></div></div>';
  }
  function render() { paper.innerHTML = html(doc, db.seller || {}); }
  function drawSaved() {
    var list = h('div', { 'class': 'tlist' });
    db.notes.slice().reverse().forEach(function (d) {
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: d.kind === 'credit' ? '↩️' : '➕' }), h('span', { 'class': 'titem-main' }, [h('b', { text: d.no + ' · ' + (d.buyer.name || '—') }), h('small', { text: KIND[d.kind].name + ' · ' + d.date + (d.inv.no ? ' · against ' + d.inv.no : '') })]),
        h('span', { 'class': 'titem-amt', text: T.money(totals(d).grand, d.cur) }),
        h('button', { type: 'button', title: 'Open', text: '✎', onclick: function () { doc = JSON.parse(JSON.stringify(d)); keep(); view = 'edit'; draw(); } }),
        h('button', { type: 'button', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete ' + d.no + '?')) { db.notes = db.notes.filter(function (x) { return x !== d; }); V.save(db); draw(); } } })]));
    });
    if (!db.notes.length) list.appendChild(h('p', { 'class': 'tnote', text: 'Credit and debit notes you save appear here.' }));
    body.appendChild(list);
    if (db.notes.length) body.appendChild(T.row([T.button('Download list (CSV)', { small: true, onclick: function () {
      var text = 'Type,Number,Date,Against invoice,Party,GSTIN,Taxable,Tax,Total,Currency\n' + db.notes.map(function (d) { var t = totals(d); return [KIND[d.kind].name, d.no, d.date, d.inv.no, '"' + (d.buyer.name || '').replace(/"/g, '""') + '"', d.buyer.tax || '', r2(t.taxable), r2(t.tax), t.grand, d.cur].join(','); }).join('\n');
      T.download(new Blob(['﻿' + text], { type: 'text/csv' }), 'credit-debit-notes.csv'); } })]));
  }
  function draw() {
    db = V.data(); tabs.innerHTML = ''; body.innerHTML = '';
    [['edit', '✏️ Create'], ['saved', '🗂️ Saved (' + db.notes.length + ')']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(view === t[0]), text: t[1], onclick: function () { view = t[0]; draw(); } })); });
    if (view === 'edit') drawEdit(); else drawSaved();
    paper.hidden = actions.hidden = view !== 'edit';
    render();
  }
  function save() {
    if (!doc.buyer.name) { status.error('Add who the note is issued to first.'); return; }
    db = V.data(); db.notes = db.notes.filter(function (d) { return d.no !== doc.no || d.kind !== doc.kind; }); db.notes.push(JSON.parse(JSON.stringify(doc)));
    var n = parseInt(String(doc.no).replace(/\D+/g, ''), 10); if (n >= (db.next[doc.kind] || 1)) db.next[doc.kind] = n + 1;
    V.save(db); status.ok('Saved ' + doc.no + '. The next number will be ' + KIND[doc.kind].pre + String(db.next[doc.kind]).padStart(3, '0') + '.');
  }
  function print() { render(); var w = window.open('', '_blank'); if (!w) return; w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(doc.no) + '</title><style>body{font:13px/1.45 system-ui,"Segoe UI",Arial,sans-serif;color:#111;margin:1.4cm}table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:right}th:nth-child(2),td:nth-child(2){text-align:left}th{background:#f3f4f6}@page{margin:1cm}</style></head><body>' + paper.innerHTML + '</body></html>'); w.document.close(); setTimeout(function () { w.print(); }, 400); }
  var actions = h('div', {}, [T.row([T.button('Print / Save as PDF', { primary: true, onclick: print }), T.button('Save', { onclick: save }), T.button('New', { small: true, onclick: function () { doc = blank(doc.kind); keep(); status.clear(); draw(); } }),
    T.button('Try a sample', { small: true, onclick: function () {
      doc = blank('credit'); doc.cur = 'INR'; doc.taxmode = 'gst-intra'; doc.inv = { no: 'INV-041', date: iso(-12) }; doc.reason = 'Goods returned by the buyer';
      doc.buyer = { name: 'Gupta General Store', addr: 'Main Bazaar, Ludhiana', tax: '03AAAPG1234K1Z9', phone: '' }; doc.place = 'Punjab (03)';
      doc.items = [{ desc: 'Steel water bottle 1 L', hsn: '7323', qty: 4, rate: 250, tax: 18 }, { desc: 'Lunch box', hsn: '3924', qty: 2, rate: 300, tax: 18 }];
      if (!(db.seller || {}).name) db.seller = { name: 'Sunrise Traders', addr: 'Grain Market, Ludhiana', tax: '03ABCDE1234F1Z5', phone: '+91 98765 43210' };
      keep(); view = 'edit'; draw(); } })]), status.el]);
  spot.appendChild(T.card([V.bar(draw), tabs, body, h('h3', { text: 'Preview' }), paper, actions]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  Promise.all([V.ready, INV.ready]).then(function () { db = V.data(); if (!T.store.get('credit-note-draft', null)) doc = blank('credit'); draw(); });

  T.tests['credit-note'] = function () {
    return V.ready.then(function () {
      var f = [], d = blank('credit'); d.cur = 'INR'; d.taxmode = 'gst-intra';
      d.items = [{ desc: 'A', qty: 2, rate: 500, tax: 18 }, { desc: 'B', qty: 1, rate: 1000, tax: 12 }];
      var t = totals(d); if (t.taxable !== 2000 || Math.abs(t.tax - 300) > 1e-9 || t.grand !== 2300) f.push('totals ' + t.taxable + ' ' + t.tax + ' ' + t.grand);
      d.inv = { no: 'INV-9', date: '2026-10-01' };
      var x = h('div', { html: html(d, { name: 'Shop' }) }).textContent;
      ['CREDIT NOTE', 'Original invoice: INV-9', 'CGST @ 9%', 'SGST @ 6%', 'Amount credited', 'Rupees Two Thousand Three Hundred Only'].forEach(function (s) { if (x.indexOf(s) < 0) f.push('missing ' + s); });
      d.kind = 'debit'; d.taxmode = 'gst-inter'; x = h('div', { html: html(d, {}) }).textContent;
      if (x.indexOf('DEBIT NOTE') < 0 || x.indexOf('IGST @ 18%') < 0 || x.indexOf('Amount debited') < 0) f.push('debit / IGST');
      return { ok: !f.length, n: 9, fails: f };
    });
  };
});
