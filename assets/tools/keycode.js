/* Infinity by GroupChatOn — keycode. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* JavaScript key code finder: press any key to see event.key, event.code, keyCode, location and modifiers, with a ready code snippet. */
GCOTools.register('keycode', function (spot, T) {
  var h = T.h, LOC = ['Standard', 'Left', 'Right', 'Number pad'];
  function info(e) {
    var mods = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].filter(function (m) { return e[m]; }).map(function (m) { return { ctrlKey: 'Ctrl', shiftKey: 'Shift', altKey: 'Alt', metaKey: 'Meta (⌘ / ⊞)' }[m]; });
    var k = e.key === ' ' ? '" " (Space)' : JSON.stringify(e.key);
    return [['event.key', k], ['event.code', JSON.stringify(e.code || '')], ['event.keyCode', String(e.keyCode || 0) + ' (old, avoid in new code)'], ['event.location', (e.location || 0) + ' · ' + LOC[e.location || 0]],
      ['Modifiers held', mods.length ? mods.join(' + ') : 'none'], ['Snippet', "if (event.key === " + JSON.stringify(e.key).replace(/^"|"$/g, "'") + ") { … }"]];
  }
  var big = h('div', { 'aria-live': 'polite', style: 'display:grid;place-items:center;min-height:130px;border-radius:16px;background:var(--bg);font:800 44px system-ui;text-align:center;padding:10px', text: 'Press any key' });
  var list = h('div', { 'class': 'tkv', 'data-out': '' }), hist = h('textarea', { rows: '4', 'class': 'tout tmono', readonly: true, 'aria-label': 'Recent keys' }), past = [];
  var mobile = h('input', { type: 'text', placeholder: 'On a phone? Tap here and type', 'aria-label': 'Type here' });
  function show(e) {
    big.textContent = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key : e.key;
    list.innerHTML = '';
    info(e).forEach(function (r) { list.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] }), T.button('Copy', { small: true, onclick: function (x) { T.copy(r[1], x.currentTarget); } })])); });
    past.unshift((e.key === ' ' ? 'Space' : e.key) + '  code=' + e.code + '  keyCode=' + e.keyCode); past = past.slice(0, 20); hist.value = past.join('\n');
  }
  document.addEventListener('keydown', function (e) {
    if (!big.isConnected) return;
    var t = e.target || {};
    if (t !== mobile && /INPUT|TEXTAREA|SELECT/.test(t.tagName || '')) return;
    if (t !== mobile && !/^F\d+$|^(Tab|Escape)$/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
    show(e);
  });
  spot.appendChild(T.card([big, mobile, list, T.field('Recent keys', hist), h('p', { 'class': 'tstatus', text: 'Use event.key for the character and event.code for the physical key (it stays the same on QWERTY, AZERTY and other layouts).' })]));
  T.tests['keycode'] = function () {
    var f = [], r = info({ key: 'Enter', code: 'NumpadEnter', keyCode: 13, location: 3, ctrlKey: true, shiftKey: true });
    if (r[0][1] !== '"Enter"' || r[3][1] !== '3 · Number pad' || r[4][1] !== 'Ctrl + Shift' || r[5][1] !== "if (event.key === 'Enter') { … }") f.push(JSON.stringify(r));
    if (info({ key: ' ', code: 'Space', keyCode: 32, location: 0 })[0][1] !== '" " (Space)') f.push('space');
    show({ key: 'a', code: 'KeyA', keyCode: 65, location: 0 });
    if (big.textContent !== 'a' || list.children.length !== 6) f.push('display');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
