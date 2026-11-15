/* Infinity by GroupChatOn — coin-flip. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Coin flip: heads or tails with a flip animation, a running score, and 10 or 100 flips at once. */
GCOTools.register('coin-flip', function (spot, T) {
  var h = T.h, n = { H: 0, T: 0 }, streak = { side: '', len: 0 };
  function flip() { var a = new Uint8Array(1); crypto.getRandomValues(a); return a[0] & 1 ? 'H' : 'T'; }
  function many(k) { var r = { H: 0, T: 0 }; for (var i = 0; i < k; i++) r[flip()]++; return r; }
  var coin = h('div', { 'aria-hidden': 'true', style: 'width:150px;height:150px;margin:8px auto;border-radius:50%;display:grid;place-items:center;font:900 54px system-ui;color:#5b3d00;background:radial-gradient(circle at 35% 30%,#fff3b0,#f5b301 55%,#b07d00);box-shadow:0 8px 24px rgba(0,0,0,.25);transition:transform .6s ease', text: '?' });
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-size:32px;font-weight:800;text-align:center;min-height:42px' }), score = h('div', { 'class': 'tstats' }), turn = 0;
  function show() {
    score.innerHTML = '';
    var all = n.H + n.T;
    [['Heads', n.H + (all ? ' · ' + Math.round(n.H / all * 100) + '%' : '')], ['Tails', n.T + (all ? ' · ' + Math.round(n.T / all * 100) + '%' : '')], ['Flips', all], ['Streak', streak.len ? streak.len + ' × ' + (streak.side === 'H' ? 'heads' : 'tails') : '-']]
      .forEach(function (x) { score.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(x[1]) }), h('span', { text: x[0] })])); });
  }
  function one() {
    var s = flip(); n[s]++;
    streak = streak.side === s ? { side: s, len: streak.len + 1 } : { side: s, len: 1 };
    turn += 1; coin.style.transform = 'rotateY(' + (turn * 1080) + 'deg)';
    big.textContent = '…';
    setTimeout(function () { coin.textContent = s === 'H' ? 'H' : 'T'; big.textContent = s === 'H' ? 'Heads' : 'Tails'; show(); }, 600);
  }
  function batch(k) { var r = many(k); n.H += r.H; n.T += r.T; streak = { side: '', len: 0 }; big.textContent = k + ' flips: ' + r.H + ' heads, ' + r.T + ' tails'; show(); }
  spot.appendChild(T.card([coin, big, T.row([T.button('Flip the coin', { primary: true, onclick: one }), T.button('Flip 10', { small: true, onclick: function () { batch(10); } }),
    T.button('Flip 100', { small: true, onclick: function () { batch(100); } }), T.button('Reset', { small: true, onclick: function () { n = { H: 0, T: 0 }; streak = { side: '', len: 0 }; big.textContent = ''; coin.textContent = '?'; show(); } })]), score]));
  show();
  T.tests['coin-flip'] = function () {
    var f = [], r = many(10000);
    if (r.H + r.T !== 10000) f.push('count');
    if (r.H < 4700 || r.H > 5300) f.push('not fair: ' + r.H + ' heads of 10000');
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
