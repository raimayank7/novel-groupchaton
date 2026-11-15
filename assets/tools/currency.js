/* Infinity by GroupChatOn — currency. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Currency converter with daily rates from ExchangeRate-API's free open endpoint (no key), kept on the device for offline use. */
GCOTools.register('currency', function (spot, T) {
  var h = T.h;
  var names = Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'currency' }) : null;
  function nm(c) { try { return names ? names.of(c) : c; } catch (e) { return c; } }
  var saved = T.store.get('fx', {}), data = T.store.get('fx-rates', null);
  var amt = h('input', { type: 'number', step: 'any', inputmode: 'decimal', value: saved.a || 100, 'aria-label': 'Amount' });
  var from = h('select', { 'aria-label': 'From currency' }), to = h('select', { 'aria-label': 'To currency' });
  var big = h('div', { 'class': 'tu-big', 'aria-live': 'polite' }), status = T.status(), table = h('div', { 'class': 'tu-all' }), when = h('p', { 'class': 'tnote' }), last = {};
  var POP = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'CAD', 'AUD', 'SGD', 'JPY', 'CNY', 'PKR', 'BDT', 'NPR', 'LKR', 'MYR', 'CHF', 'NZD', 'ZAR', 'QAR', 'KWD', 'OMR', 'THB', 'IDR', 'PHP'];
  function fill() {
    var codes = Object.keys(data.rates).sort();
    [from, to].forEach(function (s) { var v = s.value; s.innerHTML = ''; codes.forEach(function (c) { s.appendChild(h('option', { value: c, text: c + ' · ' + nm(c) })); }); if (v) s.value = v; });
    from.value = saved.f || (T.currency && T.currency()) || 'USD'; if (!from.value) from.value = 'USD';
    to.value = saved.t || (from.value === 'USD' ? 'INR' : 'USD');
  }
  function fmt(n, c) { try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: n < 1 ? 6 : 2 }).format(n); } catch (e) { return n.toFixed(2) + ' ' + c; } }
  function run() {
    if (!data) return;
    T.store.set('fx', { a: amt.value, f: from.value, t: to.value });
    var a = parseFloat(amt.value), r = data.rates[to.value] / data.rates[from.value];
    last = { rate: r, result: a * r };
    big.innerHTML = '';
    if (isNaN(a)) { big.textContent = 'Type an amount.'; return; }
    big.appendChild(h('span', { text: fmt(a, from.value) + ' =' })); big.appendChild(h('b', { text: fmt(a * r, to.value) }));
    table.innerHTML = '';
    table.appendChild(h('table', {}, [h('tbody', {}, [h('tr', {}, [h('th', { text: '1 ' + from.value }), h('td', { text: fmt(r, to.value) })]), h('tr', {}, [h('th', { text: '1 ' + to.value }), h('td', { text: fmt(1 / r, from.value) })])]
      .concat(POP.filter(function (c) { return data.rates[c] && c !== from.value && c !== to.value; }).map(function (c) { return h('tr', {}, [h('th', { text: nm(c) + ' (' + c + ')' }), h('td', { text: fmt(a * data.rates[c] / data.rates[from.value], c) })]); })))]));
    when.innerHTML = '';
    when.appendChild(document.createTextNode('Rates updated ' + new Date(data.time).toLocaleString() + (data.cached ? ' (saved copy: you seem to be offline)' : '') + '. Mid-market rates for guidance; banks and card companies add their own margin. '));
    when.appendChild(h('a', { href: 'https://www.exchangerate-api.com', target: '_blank', rel: 'noopener', text: 'Rates by Exchange Rate API' }));
  }
  function load() {
    var fresh = data && Date.now() - data.got < 6 * 3600e3;
    if (fresh) { fill(); run(); return Promise.resolve(); }
    status.info('Getting today’s rates…');
    return fetch('https://open.er-api.com/v6/latest/USD').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) {
      if (j.result !== 'success' || !j.rates) throw new Error('No rates');
      data = { rates: j.rates, time: j.time_last_update_unix * 1000, got: Date.now() };
      T.store.set('fx-rates', data); status.clear(); fill(); run();
    }).catch(function () {
      return fetch('https://api.frankfurter.app/latest?from=USD').then(function (r) { return r.json(); }).then(function (j) {
        j.rates.USD = 1; data = { rates: j.rates, time: Date.parse(j.date), got: Date.now() }; T.store.set('fx-rates', data); status.clear(); fill(); run();
      });
    }).catch(function () {
      if (data) { data.cached = true; status.clear(); fill(); run(); }
      else status.error('Could not get exchange rates. Check your internet connection and try again.');
    });
  }
  [amt, from, to].forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
  var swap = T.button('⇅ Swap', { small: true, onclick: function () { var a = from.value; from.value = to.value; to.value = a; run(); } });
  spot.appendChild(T.card([h('div', { 'class': 'tu-in' }, [T.field('Amount', amt), T.field('From', from), T.field('To', to)]), status.el, big, T.row([swap,
    T.button('Copy result', { small: true, onclick: function (e) { T.copy(big.textContent.replace(/\s+/g, ' ').trim(), e.currentTarget); } })]), table, when]));
  var ready = load();
  T.tests.currency = function () {
    return ready.then(function () {
      var fails = [];
      if (!data || Object.keys(data.rates).length < 30) return { ok: false, n: 1, fails: ['no rates loaded'] };
      amt.value = 100; from.value = 'USD'; to.value = 'INR'; run();
      if (!(Math.abs(last.result - 100 * data.rates.INR) < 1e-9)) fails.push('100 USD → INR wrong');
      if (!(data.rates.INR > 50 && data.rates.INR < 150)) fails.push('INR rate looks wrong: ' + data.rates.INR);
      from.value = 'EUR'; to.value = 'EUR'; run(); if (Math.abs(last.rate - 1) > 1e-12) fails.push('EUR → EUR is not 1');
      from.value = 'GBP'; to.value = 'JPY'; run(); var r1 = last.rate; from.value = 'JPY'; to.value = 'GBP'; run(); if (Math.abs(r1 * last.rate - 1) > 1e-9) fails.push('rates are not reciprocal');
      return { ok: !fails.length, n: 4, fails: fails };
    });
  };
});
