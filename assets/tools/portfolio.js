/* Infinity by GroupChatOn — portfolio. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Investment portfolio tracker (manual): SIPs, mutual funds, stocks, FDs, gold and more; invested, value, gain and mix. */
GCOTools.register('portfolio', function (spot, T) {
  var h = T.h, V = T.vault('portfolio', { list: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var TYPES = [['sip', '🔁', 'SIP (monthly)'], ['mf', '📊', 'Mutual fund (lump sum)'], ['stock', '📈', 'Shares / ETF'], ['fd', '🏦', 'Fixed / recurring deposit'], ['ppf', '🛡️', 'PPF / EPF / NPS'], ['gold', '🪙', 'Gold / silver'], ['re', '🏘️', 'Property'], ['other', '💼', 'Other']];
  function typ(k) { return TYPES.filter(function (t) { return t[0] === k; })[0] || TYPES[7]; }
  function years(a, b) { return Math.max(0, (new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5 / 365); }
  function months(a, b) { return a > b ? 0 : (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7)) + 1; }
  function invested(x, today) { return x.type === 'sip' && x.sip > 0 ? x.sip * months(x.d.slice(0, 7), (x.stop || today || iso()).slice(0, 7)) : x.inv || 0; }
  function value(x, today) {
    today = today || iso();
    if (x.cur > 0) return x.cur;
    if (x.rate > 0 && x.type !== 'sip') { var end = x.mat && x.mat < today ? x.mat : today; return Math.round(x.inv * Math.pow(1 + x.rate / 400, 4 * years(x.d, end)) * 100) / 100; }
    return invested(x, today);
  }
  function totals(today) {
    var r = { inv: 0, cur: 0, mix: {} };
    db.list.forEach(function (x) { var i = invested(x, today), c = value(x, today); r.inv += i; r.cur += c; r.mix[x.type] = (r.mix[x.type] || 0) + c; });
    r.gain = r.cur - r.inv; r.pct = r.inv ? r.gain / r.inv * 100 : 0;
    return r;
  }
  var f = { type: T.select(TYPES.map(function (t) { return [t[0], t[1] + ' ' + t[2]]; }), 'sip'), name: h('input', { type: 'text', placeholder: 'e.g. Parag Parikh Flexi Cap, SBI FD, TCS' }),
    inv: h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Amount invested' }), sip: h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Monthly SIP amount' }),
    d: h('input', { type: 'date', value: iso() }), cur: h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Today’s value (from app / statement)' }),
    rate: h('input', { type: 'number', min: '0', step: 'any', placeholder: 'e.g. 7.1' }), mat: h('input', { type: 'date' }) };
  var flds = { inv: T.field('Amount invested (' + T.currency() + ')', f.inv), sip: T.field('SIP per month (' + T.currency() + ')', f.sip), rate: T.field('Interest % a year (FD, PPF)', f.rate), mat: T.field('Maturity date', f.mat) };
  function shape() { var t = f.type.value; flds.sip.hidden = t !== 'sip'; flds.inv.hidden = t === 'sip'; flds.rate.hidden = flds.mat.hidden = !(t === 'fd' || t === 'ppf' || t === 'other'); }
  f.type.addEventListener('change', shape);
  var editing = null, addBtn = T.button('Add investment', { primary: true, onclick: function () { add(); } }), msg = T.status();
  function add() {
    if (!f.name.value.trim()) { msg.error('Give it a name.'); f.name.focus(); return; }
    var x = editing ? db.list.filter(function (y) { return y.id === editing; })[0] : { id: uid() };
    x.type = f.type.value; x.name = f.name.value.trim(); x.inv = parseFloat(f.inv.value) || 0; x.sip = parseFloat(f.sip.value) || 0; x.d = f.d.value || iso();
    x.cur = parseFloat(f.cur.value) || 0; x.rate = parseFloat(f.rate.value) || 0; x.mat = f.mat.value || ''; x.upd = iso();
    if (!(invested(x) > 0)) { msg.error('Type the amount invested (or the SIP amount).'); return; }
    if (!editing) db.list.push(x);
    msg.ok(editing ? 'Updated.' : 'Added.'); editing = null; addBtn.textContent = 'Add investment';
    ['name', 'inv', 'sip', 'cur', 'rate', 'mat'].forEach(function (k) { f[k].value = ''; }); save(); draw();
  }
  function edit(x) {
    editing = x.id; f.type.value = x.type; ['name', 'inv', 'sip', 'd', 'cur', 'rate', 'mat'].forEach(function (k) { f[k].value = x[k] || ''; }); shape();
    addBtn.textContent = 'Save changes'; f.cur.focus(); form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  var form = h('div', { 'class': 'tool-app-opts' }, [h('div', { 'class': 'tgrid2' }, [T.field('Type', f.type), T.field('Name', f.name), flds.inv, flds.sip, T.field('Start / buy date', f.d), T.field('Current value (optional)', f.cur), flds.rate, flds.mat]),
    h('p', { 'class': 'tnote', text: 'Leave current value empty for deposits with an interest rate: it is worked out (compounded quarterly). Update it for funds and shares from your app or statement now and then.' }), T.row([addBtn]), msg.el]);
  var sum = h('div', { 'class': 'tsum', 'data-out': '' }), mix = h('div', { 'class': 'tlist' }), list = h('div', { 'class': 'tlist' });
  function draw() {
    db = V.data(); var t = totals(); sum.innerHTML = ''; mix.innerHTML = ''; list.innerHTML = '';
    [['Invested', T.money(t.inv), ''], ['Current value', T.money(t.cur), ''], ['Gain / loss', (t.gain >= 0 ? '+' : '−') + T.money(Math.abs(t.gain)) + ' (' + t.pct.toFixed(1) + '%)', t.gain >= 0 ? 'tin-c' : 'tout-c']].forEach(function (x) { sum.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: x[1] })])); });
    Object.keys(t.mix).sort(function (a, b) { return t.mix[b] - t.mix[a]; }).forEach(function (k) {
      var share = t.cur ? t.mix[k] / t.cur : 0, ty = typ(k);
      mix.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: ty[1] }), h('span', { 'class': 'titem-main' }, [h('b', { text: ty[2] }), h('span', { 'class': 'tprogress', style: 'display:block;margin-top:6px' }, [h('span', { style: 'width:' + (share * 100).toFixed(1) + '%' })])]),
        h('span', { 'class': 'titem-amt', text: Math.round(share * 100) + '%' })]));
    });
    db.list.slice().sort(function (a, b) { return value(b) - value(a); }).forEach(function (x) {
      var i = invested(x), c = value(x), g = c - i, y = years(x.d, iso()), cagr = y >= 1 && i > 0 ? (Math.pow(c / i, 1 / y) - 1) * 100 : null;
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: typ(x.type)[1] }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: x.name }), h('small', { text: 'Invested ' + T.money(i) + (x.type === 'sip' ? ' (' + T.money(x.sip) + '/month)' : '') + (cagr !== null && x.type !== 'sip' ? ' · ' + cagr.toFixed(1) + '% a year' : '') + (x.mat ? ' · matures ' + x.mat : '') })]),
        h('span', { 'class': 'titem-amt ' + (g >= 0 ? 'tin-c' : 'tout-c'), text: T.money(c) }),
        h('button', { type: 'button', 'aria-label': 'Edit or update value', title: 'Update', text: '✎', onclick: function () { edit(x); } }),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete ' + x.name + '?')) { db.list = db.list.filter(function (z) { return z !== x; }); save(); draw(); } } })]));
    });
    if (!db.list.length) { list.appendChild(h('p', { 'class': 'tnote', text: 'Add your first SIP, FD, fund or shares above.' })); mix.appendChild(h('p', { 'class': 'tnote', text: 'Your asset mix will show here.' })); }
  }
  spot.appendChild(T.card([V.bar(draw), h('h3', { text: 'Add an investment' }), form, sum, h('h3', { text: 'Asset mix' }), mix, h('h3', { text: 'Holdings' }), list,
    T.row([T.button('Download (CSV / Excel)', { small: true, onclick: function () {
      var q = function (s) { s = String(s == null ? '' : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      T.download(new Blob(['﻿Name,Type,Start,Invested,Current value,Gain\n' + db.list.map(function (x) { return [x.name, typ(x.type)[2], x.d, invested(x), value(x), value(x) - invested(x)].map(q).join(','); }).join('\n')], { type: 'text/csv' }), 'portfolio-' + iso() + '.csv');
    } })])]));
  shape(); V.ready.then(draw);

  T.tests['portfolio'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ list: [{ id: 'f', type: 'fd', name: 'FD', inv: 100000, d: '2025-11-01', rate: 7 }, { id: 's', type: 'stock', name: 'Shares', inv: 50000, cur: 60000, d: '2024-01-01' }, { id: 'p', type: 'sip', name: 'SIP', sip: 5000, d: '2026-01-05', cur: 58000 }] }); db = V.data();
    var fd = value(db.list[0], '2026-11-01');
    if (Math.abs(fd - 107185.9) > 1) fails.push('FD value ' + fd);
    if (invested(db.list[2], '2026-11-01') !== 55000) fails.push('SIP invested ' + invested(db.list[2], '2026-11-01'));
    var t = totals('2026-11-01');
    if (t.inv !== 205000) fails.push('invested ' + t.inv);
    if (Math.abs(t.cur - 225185.9) > 1) fails.push('value ' + t.cur);
    db.list[0].mat = '2026-05-01'; if (value(db.list[0], '2026-11-01') >= fd) fails.push('maturity not capped');
    return V.save(keep).then(function () { db = V.data(); draw(); return { ok: !fails.length, n: 5, fails: fails }; });
  }
});
