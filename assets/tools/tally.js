/* Infinity by GroupChatOn — tally. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Tally counter: one or many named counters with + / − buttons, keyboard keys, a step size, saved on the device. */
GCOTools.register('tally', function (spot, T) {
  var h = T.h;
  function add(c, d, neg) { var v = c.n + d; c.n = neg ? v : Math.max(0, v); return c.n; }
  var list = T.store.get('tally', null) || [{ name: 'Count', n: 0 }], step = h('input', { type: 'number', value: '1', min: '1', style: 'max-width:90px' }), neg = h('input', { type: 'checkbox' });
  var wrap = h('div', { style: 'display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))' });
  function save() { T.store.set('tally', list); }
  function draw() {
    wrap.innerHTML = '';
    list.forEach(function (c, i) {
      var num = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font:800 64px/1.1 system-ui;text-align:center;font-variant-numeric:tabular-nums', text: String(c.n) });
      var name = h('input', { type: 'text', value: c.name, 'aria-label': 'Counter name', style: 'text-align:center;font-weight:700' });
      name.addEventListener('input', function () { c.name = name.value; save(); });
      function bump(d) { add(c, d * (+step.value || 1), neg.checked); num.textContent = String(c.n); save(); if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) {} }
      wrap.appendChild(h('div', { style: 'padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--bg);display:grid;gap:10px' }, [name, num,
        h('div', { style: 'display:grid;grid-template-columns:1fr 2fr;gap:8px' }, [h('button', { type: 'button', 'class': 'tbtn', style: 'font-size:28px;min-height:64px', 'aria-label': 'Minus', text: '−', onclick: function () { bump(-1); } }),
          h('button', { type: 'button', 'class': 'tbtn tbtn-primary', style: 'font-size:32px;min-height:64px', 'aria-label': 'Plus', text: '+', onclick: function () { bump(1); } })]),
        T.row([T.button('Reset', { small: true, onclick: function () { if (c.n === 0 || confirm('Set “' + c.name + '” back to 0?')) { c.n = 0; draw(); save(); } } }),
          list.length > 1 ? T.button('Remove', { small: true, onclick: function () { list.splice(i, 1); draw(); save(); } }) : null])]));
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!wrap.isConnected || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '')) return;
    if (e.key === ' ' || e.key === '+' || e.key === 'ArrowUp') { e.preventDefault(); add(list[0], +step.value || 1, neg.checked); draw(); save(); }
    if (e.key === '-' || e.key === 'ArrowDown') { e.preventDefault(); add(list[0], -(+step.value || 1), neg.checked); draw(); save(); }
  });
  spot.appendChild(T.card([wrap, T.row([T.button('+ Add counter', { onclick: function () { list.push({ name: 'Counter ' + (list.length + 1), n: 0 }); draw(); save(); } }),
    T.field('Step', step), h('label', { 'class': 'tcheck' }, [neg, ' Allow below zero'])]),
    h('p', { 'class': 'tstatus', text: 'Keyboard: Space or ↑ adds to the first counter, − or ↓ takes away. Counts are saved on this device.' })]));
  draw();
  T.tests['tally'] = function () {
    var f = [], c = { n: 0 };
    add(c, 1); add(c, 5); add(c, -2);
    if (c.n !== 4) f.push('4 ≠ ' + c.n);
    add(c, -10);
    if (c.n !== 0) f.push('went below 0');
    add(c, -3, true);
    if (c.n !== -3) f.push('negative allowed');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
