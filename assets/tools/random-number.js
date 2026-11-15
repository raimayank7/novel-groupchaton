/* Infinity by GroupChatOn — random-number. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Random number generator: any range, one or many, no repeats, sorted, using the browser's secure random source. */
GCOTools.register('random-number', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function gen(lo, hi, count, unique) {
    if (!isFinite(lo) || !isFinite(hi) || lo % 1 || hi % 1) throw new Error('Use whole numbers for the lowest and highest values.');
    if (lo > hi) { var t = lo; lo = hi; hi = t; }
    var span = hi - lo + 1;
    if (span > 4294967296) throw new Error('The range is too big (up to about 4 billion numbers).');
    if (count < 1 || count > 10000) throw new Error('Pick between 1 and 10,000 numbers.');
    if (unique && count > span) throw new Error('Only ' + span + ' different numbers exist between ' + lo + ' and ' + hi + ', so ' + count + ' cannot all be different.');
    var out = [], seen = {};
    while (out.length < count) { var v = lo + rnd(span); if (unique) { if (seen[v]) continue; seen[v] = 1; } out.push(v); }
    return out;
  }
  var lo = h('input', { type: 'number', value: String(T.store.get('rn-lo', 1)), 'aria-label': 'Lowest' }), hi = h('input', { type: 'number', value: String(T.store.get('rn-hi', 100)), 'aria-label': 'Highest' });
  var count = h('input', { type: 'number', value: '1', min: '1', max: '10000' }), uniq = h('input', { type: 'checkbox', checked: true }), sort = h('input', { type: 'checkbox' });
  var big = h('div', { 'class': 'tbig', 'data-out': '', style: 'font-size:56px;font-weight:800;text-align:center;padding:12px 0;word-break:break-all', text: '?' });
  var list = h('textarea', { rows: '4', 'class': 'tout tmono', readonly: true, 'aria-label': 'Numbers' });
  function go() {
    try {
      var r = gen(Math.round(+lo.value), Math.round(+hi.value), Math.round(+count.value) || 1, uniq.checked);
      if (sort.checked) r.sort(function (a, b) { return a - b; });
      T.store.set('rn-lo', +lo.value); T.store.set('rn-hi', +hi.value);
      big.textContent = r.length === 1 ? String(r[0]) : r.length <= 6 ? r.join('  ') : r.length + ' numbers';
      list.value = r.join(r.length > 20 ? ', ' : '\n'); status.clear();
    } catch (e) { status.error(e); }
  }
  var copy = T.button('Copy', { onclick: function () { T.copy(list.value, copy); } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('From', lo), T.field('To', hi), T.field('How many', count)]),
    T.row([h('label', { 'class': 'tcheck' }, [uniq, ' No repeats']), h('label', { 'class': 'tcheck' }, [sort, ' Sort from small to big'])]),
    T.row([T.button('Generate', { primary: true, onclick: go })].concat([[1, 10], [1, 100], [1, 1000], [0, 9]].map(function (p) {
      return T.button(p[0] + '–' + p[1], { small: true, onclick: function () { lo.value = p[0]; hi.value = p[1]; go(); } }); }))),
    status.el, big, T.field('All numbers', list), T.row([copy])]));
  T.tests['random-number'] = function () {
    var f = [], p = gen(1, 6, 6, true).sort().join('');
    if (p !== '123456') f.push('1–6 unique ' + p);
    var r = gen(-5, 5, 2000, false), seen = {};
    r.forEach(function (v) { seen[v] = 1; if (v < -5 || v > 5) f.push('out of range ' + v); });
    if (Object.keys(seen).length !== 11) f.push('not all values hit');
    if (gen(10, 1, 1, false)[0] < 1) f.push('swapped range');
    try { gen(1, 5, 6, true); f.push('6 unique from 5 accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
