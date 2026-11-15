/* Infinity by GroupChatOn — secret-santa. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Secret Santa draw: everyone gets one person to buy for, never themselves, with pairs who must not draw each other, revealed one at a time. */
GCOTools.register('secret-santa', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function draw(names, no) {
    if (names.length < 3) throw new Error('Add at least 3 people.');
    var low = names.map(function (n) { return n.toLowerCase(); });
    if (low.some(function (n, i) { return low.indexOf(n) !== i; })) throw new Error('Two people have the same name. Add a surname or initial to tell them apart.');
    var bad = {};
    no.forEach(function (p) { bad[p[0].toLowerCase() + '>' + p[1].toLowerCase()] = bad[p[1].toLowerCase() + '>' + p[0].toLowerCase()] = 1; });
    for (var tries = 0; tries < 5000; tries++) {
      var r = names.slice();
      for (var i = r.length - 1; i > 0; i--) { var j = rnd(i + 1), t = r[i]; r[i] = r[j]; r[j] = t; }
      if (r.every(function (x, k) { return x !== names[k] && !bad[names[k].toLowerCase() + '>' + x.toLowerCase()]; })) return names.map(function (n, k) { return [n, r[k]]; });
    }
    throw new Error('No draw works with these rules. Remove a “must not draw” pair or add more people.');
  }
  var who = h('textarea', { rows: '7', placeholder: 'One name per line', 'aria-label': 'People' }), not = h('textarea', { rows: '3', placeholder: 'Ravi, Priya\n(one pair per line: they will not draw each other)', 'aria-label': 'Pairs' });
  var budget = h('input', { type: 'text', placeholder: 'e.g. ₹500 or $25' }), list = h('div', { 'class': 'tkv', 'data-out': '' }), last = [];
  who.value = T.store.get('santa-who', ''); not.value = T.store.get('santa-not', '');
  function go() {
    T.store.set('santa-who', who.value); T.store.set('santa-not', not.value);
    var names = who.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    var pairs = not.value.split(/\r?\n/).map(function (l) { return l.split(/\s*[,&+]\s*|\s+and\s+/i).map(function (s) { return s.trim(); }).filter(Boolean); }).filter(function (p) { return p.length === 2; });
    list.innerHTML = '';
    try { last = draw(names, pairs); } catch (e) { status.error(e); return; }
    status.ok('Done! Pass the phone round: each person taps their own name to see who they buy for' + (budget.value.trim() ? ' (budget ' + budget.value.trim() + ')' : '') + '.');
    last.forEach(function (p) {
      var code = h('code', { text: '••••••' }), btn = T.button('Show', { small: true });
      btn.onclick = function () { var hid = code.textContent === '••••••'; code.textContent = hid ? '🎁 ' + p[1] : '••••••'; btn.textContent = hid ? 'Hide' : 'Show'; };
      list.appendChild(h('div', {}, [h('span', { text: p[0] }), code, btn]));
    });
  }
  spot.appendChild(T.card([T.field('Who is taking part?', who), T.field('Must not draw each other (optional)', not), T.field('Gift budget (optional)', budget),
    T.row([T.button('Draw names', { primary: true, onclick: go }), T.button('Try a sample', { small: true, onclick: function () { who.value = 'Ravi\nPriya\nAman\nNeha\nKaran\nSimran'; not.value = 'Ravi, Priya'; go(); } }),
      T.button('Copy all (organiser)', { small: true, onclick: function (e) { if (last.length) T.copy(last.map(function (p) { return p[0] + ' → ' + p[1]; }).join('\n'), e.currentTarget); } })]),
    status.el, list, h('p', { 'class': 'tstatus', text: 'The draw happens on this device and is not saved anywhere. Drawing again makes a new, different draw.' })]));
  T.tests['secret-santa'] = function () {
    var f = [], n = ['A', 'B', 'C', 'D', 'E'];
    for (var k = 0; k < 50; k++) {
      var r = draw(n, [['A', 'B'], ['C', 'D']]), got = r.map(function (p) { return p[1]; }).sort().join('');
      if (got !== 'ABCDE' || r.some(function (p) { return p[0] === p[1] || (p[0] + p[1]).match(/^(AB|BA|CD|DC)$/); })) { f.push('bad draw ' + JSON.stringify(r)); break; }
    }
    try { draw(['A', 'B', 'C'], [['A', 'B'], ['B', 'C']]); f.push('impossible draw accepted'); } catch (e) {}
    try { draw(['A', 'a', 'B'], []); f.push('duplicate names accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 52, fails: f });
  };
});
