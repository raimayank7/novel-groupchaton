/* Infinity calculator engine — draws any calculator from a short description.
   Designed & Developed by Nivesh Sahayak. See LICENSE.

   GCOTools.engine('calc', 'emi', {
     inputs: [ { k: 'p', label: 'Loan amount', money: true, value: 500000 },            // number (money: shows the currency)
               { k: 'r', label: 'Interest rate', value: 9, suffix: '% a year', step: 0.1 },
               { k: 'u', label: 'Tenure in', options: [['y', 'Years'], ['m', 'Months']], value: 'y' },   // a select
               { k: 'd', label: 'Date', type: 'date', value: 'today' },                   // date ('today', '+30' days, 'YYYY-MM-DD')
               { k: 't', label: 'Numbers', type: 'textarea', value: '1 2 3' },            // text / textarea
               { k: 'x', label: 'Include tax', type: 'check', value: true },
               { k: 'h', type: 'heading', label: 'Section title' },
               { k: 'ft', label: 'Feet', value: 5, show: function (v) { return v.u === 'imp'; } } ],   // shown only for some choices
     calc: function (v, X) { return { rows: [['Monthly EMI', 10379.18, 'money'], ...], note: '…', table: { head: [], rows: [] }, bars: [[label, n, colour]] }; },
     test: [ { in: { p: 500000, r: 9 }, expect: { 'Monthly EMI': 10379.18 } } ]          // numbers within 0.05%, or text that must appear
   });
   Row formats: 'money', 'num', 'int', 'pct', 'text', a number of decimals, or a function(n) → text. The first row is shown large. */
(function () {
  var T = window.GCOTools, h = T.h;
  var FMT = {
    money: function (n) { return T.money(n); },
    num: function (n) { return T.num(n); },
    int: function (n) { return T.num(Math.round(n), 0); },
    pct: function (n) { return T.num(n, 2) + '%'; },
    text: function (n) { return String(n); }
  };
  function fmt(v, f) {
    if (typeof f === 'function') return f(v);
    if (typeof f === 'number') return T.num(v, f);
    if (typeof v === 'string') return v;
    return (FMT[f] || FMT.num)(v);
  }
  function todayPlus(d) { var t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); }
  function dateVal(v) {
    if (v === 'today') return todayPlus(0);
    if (typeof v === 'string' && /^[+-]\d+$/.test(v)) return todayPlus(+v);
    return v || '';
  }

  T.engines.calc = function (spot, T, def, id) {
    var saved = T.store.get('calc-' + id, {});
    var els = {}, wraps = {}, hasMoney = def.inputs.some(function (i) { return i.money; });
    var fields = [];
    def.inputs.forEach(function (i) {
      if (i.type === 'heading') { fields.push(h('h3', { 'class': 'tcalc-h', text: i.label })); return; }
      var start = saved[i.k] !== undefined && !i.fresh ? saved[i.k] : (i.type === 'date' ? dateVal(i.value) : i.value);
      var el;
      if (i.options) el = T.select(i.options, start);
      else if (i.type === 'textarea') { el = h('textarea', { rows: String(i.rows || 4), placeholder: i.placeholder || '' }); el.value = start == null ? '' : start; }
      else if (i.type === 'check') { el = h('input', { type: 'checkbox', checked: start ? true : null }); }
      else el = h('input', { type: i.type || 'number', step: i.step || 'any', min: i.min, max: i.max, placeholder: i.placeholder || '', value: start == null ? '' : start, inputmode: !i.type ? 'decimal' : null });
      el.setAttribute('data-k', i.k);
      els[i.k] = el;
      var label = i.label + (i.money ? ' (' + T.currency() + ')' : '');
      if (i.type === 'check') fields.push(wraps[i.k] = h('label', { 'class': 'tcheck' + (i.wide ? ' tcalc-wide' : '') }, [el, ' ' + i.label]));
      else {
        var f = T.field(label, i.suffix ? h('span', { 'class': 'tcalc-suffix' }, [el, h('em', { text: i.suffix })]) : el, i.hint);
        if (i.wide || i.type === 'textarea') f.classList.add('tcalc-wide');
        if (i.money) f.setAttribute('data-money', '');
        fields.push(wraps[i.k] = f);
      }
    });
    var cur = hasMoney ? T.select(T.CURRENCIES.map(function (c) { return [c, c]; }), T.currency()) : null;
    var main = h('div', { 'class': 'tcalc-main', 'data-out': '' });
    var rows = h('div', { 'class': 'tstats tcalc-rows', 'data-out': '' });
    var bars = h('div', { 'class': 'tcalc-bars' });
    var note = h('p', { 'class': 'tnote tcalc-note' });
    var table = h('div', { 'class': 'tcalc-table' });
    var status = T.status();
    var last = [];
    var copy = T.button('Copy result', { small: true, onclick: function () { T.copy(text(), copy); } });
    var share = h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener', text: 'Share on WhatsApp' });
    var reset = T.button('Reset', { small: true, onclick: function () {
      T.store.set('calc-' + id, {});
      def.inputs.forEach(function (i) { var el = els[i.k]; if (!el) return; var v = i.type === 'date' ? dateVal(i.value) : i.value; if (i.type === 'check') el.checked = !!v; else el.value = v == null ? '' : v; });
      run();
    } });
    spot.appendChild(T.card([
      cur ? h('div', { 'class': 'tcalc-cur' }, [T.field('Currency', cur)]) : null,
      h('div', { 'class': 'tgrid2 tcalc-in' }, fields),
      status.el,
      h('div', { 'class': 'tcalc-out' }, [main, rows, bars, note]),
      T.row([copy, share, reset]),
      table]));

    function values() {
      var v = {};
      def.inputs.forEach(function (i) {
        var el = els[i.k]; if (!el) return;
        if (i.type === 'check') v[i.k] = el.checked;
        else if (i.options || i.type === 'textarea' || i.type === 'text' || i.type === 'date' || i.type === 'time') v[i.k] = el.value;
        else v[i.k] = el.value === '' ? NaN : parseFloat(el.value);
      });
      return v;
    }
    function text() {
      var title = (document.querySelector('h1') || {}).textContent || '';
      return title.split(':')[0].trim() + '\n' + last.map(function (r) { return r[0] + ': ' + fmt(r[1], r[2]); }).join('\n') + '\n' + location.href.split('#')[0];
    }
    function run() {
      var v = values(), store = {};
      def.inputs.forEach(function (i) { if (els[i.k]) store[i.k] = i.type === 'check' ? els[i.k].checked : els[i.k].value; });
      T.store.set('calc-' + id, store);
      def.inputs.forEach(function (i) { if (i.show && wraps[i.k]) wraps[i.k].hidden = !i.show(v); });   // fields that only apply to some choices
      var out;
      try { out = def.calc(v, X) || {}; status.clear(); }
      catch (e) { out = { rows: [] }; status.error(e); }
      last = (out.rows || []).filter(Boolean);
      main.innerHTML = ''; rows.innerHTML = ''; bars.innerHTML = ''; table.innerHTML = '';
      if (last.length) {
        main.appendChild(h('span', { text: last[0][0] }));
        main.appendChild(h('b', { text: fmt(last[0][1], last[0][2]) }));
        if (last[0][3]) main.appendChild(h('small', { text: last[0][3] }));
      }
      last.slice(1).forEach(function (r) { rows.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: fmt(r[1], r[2]) }), h('span', { text: r[0] + (r[3] ? ' · ' + r[3] : '') })])); });
      rows.hidden = last.length < 2;
      if (out.bars && out.bars.length) {
        var total = out.bars.reduce(function (a, b) { return a + Math.max(0, b[1]); }, 0) || 1;
        var COL = ['var(--accent)', '#F59E0B', '#22D3EE', '#F472B6', '#A3E635', '#A78BFA'];
        var strip = h('div', { 'class': 'tcalc-strip' }), key = h('div', { 'class': 'tcalc-key' });
        out.bars.forEach(function (b, n) {
          var c = b[2] || COL[n % COL.length];
          strip.appendChild(h('i', { style: 'width:' + (100 * Math.max(0, b[1]) / total).toFixed(2) + '%;background:' + c, title: b[0] }));
          key.appendChild(h('span', {}, [h('i', { style: 'background:' + c }), b[0] + ' ' + (100 * b[1] / total).toFixed(1) + '%']));
        });
        bars.appendChild(strip); bars.appendChild(key);
      }
      note.innerHTML = out.note || '';
      note.hidden = !out.note;
      if (out.table && out.table.rows.length) {
        var t = h('table', {}, [h('thead', {}, [h('tr', {}, out.table.head.map(function (x) { return h('th', { text: x }); }))]),
          h('tbody', {}, out.table.rows.map(function (r) { return h('tr', {}, r.map(function (x) { return h('td', { text: x }); })); }))]);
        var d = h('details', { 'class': 'tcalc-details', open: out.table.open ? true : null }, [h('summary', { text: out.table.caption || 'See the full table' }), h('div', { 'class': 'tcalc-scroll' }, [t])]);
        table.appendChild(d);
      }
      share.href = 'https://wa.me/?text=' + encodeURIComponent(text());
      return last;
    }
    // helpers handed to every formula
    var X = {
      money: T.money, num: T.num,
      need: function (cond, msg) { if (!cond) throw new Error(msg); },
      pos: function (n, name) { if (!(n > 0)) throw new Error('Enter ' + name + ' (more than 0).'); return n; },
      nums: function (s) { return String(s || '').split(/[\s,;]+/).map(Number).filter(function (n) { return !isNaN(n) && n !== null; }).filter(function (n, i, a) { return true; }); },
      date: function (s) { var d = new Date(s + 'T00:00:00'); if (isNaN(d)) throw new Error('Choose a date.'); return d; },
      days: function (a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5); },
      fdate: function (d, o) { return d.toLocaleDateString(LANGX(), o || { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }); },
      dur: function (sec) {
        if (!isFinite(sec)) return '—';
        var s = Math.round(Math.abs(sec)), d = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60, o = [];
        if (d) o.push(d + ' d'); if (hh) o.push(hh + ' h'); if (m) o.push(m + ' min'); if (ss || !o.length) o.push(ss + ' s');
        return o.join(' ');
      },
      ym: function (months) { var y = Math.floor(months / 12), m = Math.round(months % 12); if (m === 12) { y++; m = 0; } return (y ? y + (y > 1 ? ' years ' : ' year ') : '') + (m || !y ? m + (m === 1 ? ' month' : ' months') : ''); },
      emi: function (p, annualPct, months) { var r = annualPct / 1200; return r ? p * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1) : p / months; },
      fv: function (monthly, annualPct, months, due) { var r = annualPct / 1200; if (!r) return monthly * months; return monthly * (Math.pow(1 + r, months) - 1) / r * (due ? 1 + r : 1); },
      ymd: function (a, b) {   // whole years, months and days from a to b
        var y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
        if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        return [y, m, d];
      },
      ymdText: function (r) { return r[0] + (r[0] === 1 ? ' year ' : ' years ') + r[1] + (r[1] === 1 ? ' month ' : ' months ') + r[2] + (r[2] === 1 ? ' day' : ' days'); },
      iso: function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); },
      addDays: function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; },
      round: function (n, dp) { var f = Math.pow(10, dp || 0); return Math.round(n * f) / f; }
    };
    function LANGX() { return (navigator.languages && navigator.languages[0]) || 'en-US'; }
    def.inputs.forEach(function (i) { var el = els[i.k]; if (el) { el.addEventListener('input', run); el.addEventListener('change', run); } });
    if (cur) cur.addEventListener('change', function () {
      T.currency(cur.value);
      Array.prototype.forEach.call(spot.querySelectorAll('[data-money] .tfield-label'), function (l) { l.textContent = l.textContent.replace(/\([A-Z]{3}\)$/, '(' + cur.value + ')'); });
      run();
    });
    if (def.extra) def.extra(spot, els, run, X);
    run();

    // our own known-answer checks
    T.tests[id] = function () {
      var fails = [];
      (def.test || []).forEach(function (t, n) {
        def.inputs.forEach(function (i) { var el = els[i.k]; if (!el || !(i.k in t.in)) return; if (i.type === 'check') el.checked = !!t.in[i.k]; else el.value = t.in[i.k]; });
        var got = run(), map = {};
        got.forEach(function (r) { map[r[0]] = r[1]; });
        Object.keys(t.expect).forEach(function (k) {
          var want = t.expect[k], have = map[k];
          if (k === '_note') { if (note.textContent.indexOf(want) < 0) fails.push('#' + n + ' note lacks "' + want + '"'); return; }
          if (k === '_error') { if (status.el.textContent.indexOf(want) < 0) fails.push('#' + n + ' no error "' + want + '"'); return; }
          if (typeof want === 'number') {
            if (typeof have !== 'number' || Math.abs(have - want) > Math.max(Math.abs(want) * 5e-4, 0.006)) fails.push('#' + n + ' ' + k + ': got ' + have + ', want ' + want);
          } else if (String(have).indexOf(want) < 0) fails.push('#' + n + ' ' + k + ': got "' + have + '", want "' + want + '"');
        });
      });
      T.store.set('calc-' + id, {});
      return Promise.resolve({ ok: !fails.length && (def.test || []).length > 0, n: (def.test || []).length, fails: fails });
    };
  };
})();
