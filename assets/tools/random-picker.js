/* Infinity by GroupChatOn — random-picker. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Random name picker: a spinning wheel or instant pick from your own list, with "remove the winner" for draws. */
GCOTools.register('random-picker', function (spot, T) {
  var h = T.h, status = T.status();
  var COLORS = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6', '#FB923C', '#22D3EE', '#A3E635', '#E879F9'];
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var TAU = Math.PI * 2, TOP = Math.PI * 1.5;
  function segAt(r, n) { var a = TAU / n; return Math.floor((((TOP - r) % TAU) + TAU) % TAU / a) % n; }
  function angleFor(i, n, jitter) { return TOP - (i + 0.5 + (jitter || 0)) * TAU / n; }
  function names() { return box.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean); }
  var box = h('textarea', { rows: '7', placeholder: 'One name or option per line', 'aria-label': 'Names' });
  box.value = T.store.get('picker-list', 'Asha\nRahul\nPriya\nAmit\nSimran\nKaran');
  var cv = h('canvas', { width: '600', height: '600', style: 'width:min(320px,100%);aspect-ratio:1;display:block;margin:0 auto', 'aria-label': 'Name wheel' });
  var pointer = h('div', { 'aria-hidden': 'true', style: 'text-align:center;font-size:28px;line-height:1;margin-bottom:-6px', text: '▼' });
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-size:34px;font-weight:800;text-align:center;min-height:44px' });
  var remove = h('input', { type: 'checkbox' }), rot = 0, busy = false;
  function draw() {
    var n = names(), g = cv.getContext('2d'), R = 300;
    g.clearRect(0, 0, 600, 600);
    if (!n.length) return;
    var a = TAU / n.length;
    n.forEach(function (s, i) {
      g.beginPath(); g.moveTo(R, R); g.arc(R, R, R - 4, rot + i * a, rot + (i + 1) * a); g.closePath();
      g.fillStyle = COLORS[i % COLORS.length]; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
      g.save(); g.translate(R, R); g.rotate(rot + (i + 0.5) * a); g.fillStyle = '#111'; g.font = 'bold ' + (n.length > 16 ? 20 : 28) + 'px system-ui,sans-serif';
      g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(s.length > 16 ? s.slice(0, 15) + '…' : s, R - 24, 0); g.restore();
    });
    g.beginPath(); g.arc(R, R, 26, 0, TAU); g.fillStyle = '#fff'; g.fill();
  }
  function done(i) {
    var n = names(), win = n[i];
    big.textContent = '🎉 ' + win;
    if (remove.checked) { n.splice(i, 1); box.value = n.join('\n'); T.store.set('picker-list', box.value); status.info(win + ' was taken off the list. ' + n.length + ' left.'); }
    else status.clear();
    busy = false; draw();
  }
  function spin() {
    var n = names();
    if (n.length < 2) { status.error('Add at least two names, one per line.'); return; }
    if (busy) return; busy = true; big.textContent = '…';
    var win = rnd(n.length), target = angleFor(win, n.length, (rnd(70) - 35) / 100), base = rot + TAU * 6, end = base + (((target - base) % TAU) + TAU) % TAU, start = rot, t0 = performance.now();
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, dur = reduce ? 1 : 4200;
    (function frame(t) {
      var p = Math.min(1, (t - t0) / dur);
      rot = start + (end - start) * (1 - Math.pow(1 - p, 3)); draw();
      if (p < 1) requestAnimationFrame(frame); else { rot = end % TAU; done(segAt(rot, n.length)); }
    })(t0);
  }
  function quick() { var n = names(); if (!n.length) { status.error('Add some names first.'); return; } done(rnd(n.length)); }
  box.addEventListener('input', function () { T.store.set('picker-list', box.value); draw(); });
  spot.appendChild(T.card([pointer, cv, big, T.row([T.button('Spin the wheel', { primary: true, onclick: spin }), T.button('Pick instantly', { onclick: quick }),
    T.button('Shuffle list', { small: true, onclick: function () { var n = names(); for (var i = n.length - 1; i > 0; i--) { var j = rnd(i + 1), t = n[i]; n[i] = n[j]; n[j] = t; } box.value = n.join('\n'); draw(); } })]),
    status.el, T.field('Names or options', box), h('label', { 'class': 'tcheck' }, [remove, ' Remove the winner after each pick (for prize draws and turn order)'])]));
  draw();
  T.tests['random-picker'] = function () {
    var f = [];
    [2, 3, 7, 12].forEach(function (n) { for (var i = 0; i < n; i++) if (segAt(angleFor(i, n, 0.3) + TAU * 3, n) !== i) f.push('wheel ' + n + '/' + i); });
    var c = {}; for (var k = 0; k < 3000; k++) c[rnd(3)] = (c[rnd(3)] || 0) + 1;
    if (Object.keys(c).length !== 3) f.push('rnd');
    return Promise.resolve({ ok: !f.length, n: 25, fails: f });
  };
});
