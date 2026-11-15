/* Infinity by GroupChatOn — yes-no. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Yes or no decider: ask a question and get a fair random answer, with an optional "maybe". */
GCOTools.register('yes-no', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function answer(maybe) { var o = maybe ? ['Yes', 'No', 'Maybe'] : ['Yes', 'No']; return o[rnd(o.length)]; }
  var COL = { Yes: '#16a34a', No: '#dc2626', Maybe: '#d97706' };
  var q = h('input', { type: 'text', placeholder: 'e.g. Should I order pizza tonight?', 'aria-label': 'Your question' }), maybe = h('input', { type: 'checkbox' });
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-size:64px;font-weight:900;text-align:center;min-height:84px' }), asked = h('p', { 'class': 'tstatus', style: 'text-align:center' });
  function go() {
    big.textContent = '…'; big.style.color = '';
    setTimeout(function () { var a = answer(maybe.checked); big.textContent = a + (a === 'Yes' ? ' ✓' : a === 'No' ? ' ✕' : ' ?'); big.style.color = COL[a]; asked.textContent = q.value.trim() ? '“' + q.value.trim() + '”' : ''; }, 450);
  }
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  spot.appendChild(T.card([T.field('Your question (optional)', q), T.row([T.button('Ask', { primary: true, onclick: go }), h('label', { 'class': 'tcheck' }, [maybe, ' Allow “Maybe”'])]), big, asked,
    h('p', { 'class': 'tstatus', text: 'Just for fun and small choices. For health, money or legal matters, ask a qualified person.' })]));
  T.tests['yes-no'] = function () {
    var f = [], c = {};
    for (var i = 0; i < 3000; i++) { var a = answer(true); c[a] = (c[a] || 0) + 1; }
    if (Object.keys(c).sort().join() !== 'Maybe,No,Yes') f.push('maybe set ' + Object.keys(c));
    for (var j = 0; j < 500; j++) if (answer(false) === 'Maybe') { f.push('maybe when off'); break; }
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
