/* Infinity by GroupChatOn — keyboard-test. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Keyboard tester: press keys and watch them light up on a full keyboard map; shows key, code and how many keys are held at once (rollover). */
GCOTools.register('keyboard-test', function (spot, T) {
  var h = T.h;
  function keys(s) { return s.split(' ').map(function (c) { return /^[A-Z]$/.test(c) ? ['Key' + c, c] : /^\d$/.test(c) ? ['Digit' + c, c] : [c, c]; }); }
  var ROWS = [
    [['Escape', 'Esc'], ['F1', 'F1'], ['F2', 'F2'], ['F3', 'F3'], ['F4', 'F4'], ['F5', 'F5'], ['F6', 'F6'], ['F7', 'F7'], ['F8', 'F8'], ['F9', 'F9'], ['F10', 'F10'], ['F11', 'F11'], ['F12', 'F12'], ['PrintScreen', 'PrtSc'], ['ScrollLock', 'ScrLk'], ['Pause', 'Pause']],
    [['Backquote', '`']].concat(keys('1 2 3 4 5 6 7 8 9 0'), [['Minus', '-'], ['Equal', '='], ['Backspace', '⌫ Back', 2], ['Insert', 'Ins'], ['Home', 'Home'], ['PageUp', 'PgUp']]),
    [['Tab', 'Tab', 1.5]].concat(keys('Q W E R T Y U I O P'), [['BracketLeft', '['], ['BracketRight', ']'], ['Backslash', '\\', 1.5], ['Delete', 'Del'], ['End', 'End'], ['PageDown', 'PgDn']]),
    [['CapsLock', 'Caps', 1.75]].concat(keys('A S D F G H J K L'), [['Semicolon', ';'], ['Quote', '\''], ['Enter', 'Enter', 2.25]]),
    [['ShiftLeft', 'Shift', 2.25]].concat(keys('Z X C V B N M'), [['Comma', ','], ['Period', '.'], ['Slash', '/'], ['ShiftRight', 'Shift', 2.75], [null, '', 1], ['ArrowUp', '↑'], [null, '', 1]]),
    [['ControlLeft', 'Ctrl', 1.25], ['MetaLeft', 'Win ⌘', 1.25], ['AltLeft', 'Alt', 1.25], ['Space', 'Space', 6.25], ['AltRight', 'Alt', 1.25], ['MetaRight', 'Win ⌘', 1.25], ['ContextMenu', 'Menu', 1.25], ['ControlRight', 'Ctrl', 1.25], ['ArrowLeft', '←'], ['ArrowDown', '↓'], ['ArrowRight', '→']]];
  var el = {}, tested = {}, held = {}, extra = h('div', { 'class': 'trow', style: 'gap:6px' }), total = 0;
  var board = h('div', { tabindex: '0', role: 'application', 'aria-label': 'Keyboard test area: press any key', style: 'display:grid;gap:4px;min-width:860px;padding:10px;border-radius:14px;background:var(--bg);outline:none' });
  ROWS.forEach(function (r) {
    board.appendChild(h('div', { style: 'display:flex;gap:4px' }, r.map(function (k) {
      var b = h('div', { style: 'flex:' + (k[2] || 1) + ' 1 0;min-width:0;height:44px;display:grid;place-items:center;border-radius:8px;border:1px solid var(--line);background:' + (k[0] ? 'var(--surface)' : 'transparent') + ';' + (k[0] ? '' : 'border-color:transparent;') + 'font:600 12px/1 var(--ui);color:var(--ink);transition:background .1s', text: k[1] });
      if (k[0]) { el[k[0]] = b; total++; } return b;
    })));
  });
  var last = h('div', { 'class': 'tkv', 'data-out': '' }), sum = h('p', { 'class': 'tnote', 'aria-live': 'polite' }), hint = h('p', { style: 'margin:0;font-weight:600;text-align:center', text: '👆 Click or tap the keyboard below, then press keys.' });
  function paint(code) { var b = el[code]; if (!b) return; b.style.background = held[code] ? 'var(--accent)' : tested[code] ? 'var(--accent-soft)' : 'var(--surface)'; b.style.color = held[code] ? 'var(--accent-ink)' : 'var(--ink)'; }
  function info(e) {
    last.innerHTML = '';
    [['key', e.key === ' ' ? 'Space' : e.key], ['code', e.code || 'Unidentified'], ['keyCode', String(e.keyCode || 0)], ['Location', ['standard', 'left', 'right', 'numpad'][e.location] || 'standard'], ['Held right now', String(Object.keys(held).length) + ' key(s)']]
      .forEach(function (r) { last.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] })])); });
    var n = Object.keys(tested).filter(function (c) { return el[c]; }).length;
    sum.textContent = 'Tested ' + n + ' of ' + total + ' keys on the map' + (Object.keys(tested).length > n ? ' + ' + (Object.keys(tested).length - n) + ' other keys' : '') + '.';
  }
  function down(e) {
    e.preventDefault(); var c = e.code || ('key:' + e.key);
    held[c] = 1; if (!tested[c] && !el[c]) extra.appendChild(h('span', { 'class': 'tbtn tbtn-sm', text: e.code || e.key })); tested[c] = 1; paint(c); info(e);
  }
  function up(e) { e.preventDefault(); var c = e.code || ('key:' + e.key); delete held[c]; paint(c); info(e); }
  board.addEventListener('keydown', down); board.addEventListener('keyup', up);
  board.addEventListener('blur', function () { held = {}; Object.keys(el).forEach(paint); hint.textContent = '👆 Click or tap the keyboard to test again.'; });
  board.addEventListener('focus', function () { hint.textContent = '⌨ Listening: press any key (Alt+Tab or the Windows key may switch apps).'; });
  function reset() { tested = {}; held = {}; extra.innerHTML = ''; Object.keys(el).forEach(paint); last.innerHTML = ''; sum.textContent = 'Tested 0 of ' + total + ' keys on the map.'; board.focus(); }
  spot.appendChild(T.card([hint, h('div', { style: 'overflow-x:auto' }, [board]), sum, extra, last, T.row([T.button('Reset', { small: true, onclick: reset })]),
    h('p', { 'class': 'tnote', text: 'Light blue = worked at least once, dark = held down now. Hold several keys together to check rollover (how many keys your keyboard reports at once). Number-pad and media keys appear in the list under the map.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  board.addEventListener('mousedown', function () { board.focus(); });
  sum.textContent = 'Tested 0 of ' + total + ' keys on the map.';
  T.tests['keyboard-test'] = function () {
    var f = [];
    board.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a', bubbles: true }));
    board.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft', key: 'Shift', bubbles: true }));
    if (!held.KeyA || !held.ShiftLeft || !/Heldrightnow2/.test(last.textContent.replace(/\s/g, '').replace('key(s)', ''))) f.push('held 2 ' + last.textContent);
    board.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', key: 'a', bubbles: true }));
    if (held.KeyA || !tested.KeyA) f.push('keyup');
    board.dispatchEvent(new KeyboardEvent('keydown', { code: 'Numpad5', key: '5', bubbles: true }));
    if (!/Numpad5/.test(extra.textContent)) f.push('extra key');
    if (total < 80) f.push('map has ' + total);
    reset(); board.blur();
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
