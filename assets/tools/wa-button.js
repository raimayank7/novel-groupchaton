/* Infinity by GroupChatOn — wa-button. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* WhatsApp chat button for any website: a floating button with your number and message, as copy-paste HTML. */
GCOTools.register('wa-button', function (spot, T) {
  var h = T.h;
  var num = h('input', { type: 'tel', value: '919876543210', 'aria-label': 'Number with country code' }), msg = h('input', { type: 'text', value: 'Hello! I have a question.' });
  var side = T.select([['right', 'Bottom right'], ['left', 'Bottom left']], 'right'), label = h('input', { type: 'text', value: 'Chat with us', 'aria-label': 'Button text' });
  var color = h('input', { type: 'color', value: '#25D366' }), code = h('textarea', { rows: '8', readonly: true, 'class': 'tmono', 'aria-label': 'Code' }), prev = h('div', { 'class': 'twa-btnprev' });
  var ICON = '<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path fill="#fff" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.8 5.1 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>';
  function make() {
    var n = num.value.replace(/\D/g, ''), href = 'https://wa.me/' + n + (msg.value.trim() ? '?text=' + encodeURIComponent(msg.value.trim()) : ''), s = side.value, t = label.value.trim();
    return '<!-- WhatsApp chat button (made with Infinity by GroupChatOn) -->\n<a href="' + href + '" target="_blank" rel="noopener" aria-label="' + (t || 'Chat on WhatsApp').replace(/"/g, '&quot;') + '" style="position:fixed;' + s + ':20px;bottom:20px;z-index:9999;display:flex;align-items:center;gap:8px;' +
      'padding:' + (t ? '12px 18px 12px 14px' : '14px') + ';border-radius:999px;background:' + color.value + ';color:#fff;font:600 15px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.25)">' + ICON + (t ? '<span>' + t.replace(/</g, '&lt;') + '</span>' : '') + '</a>';
  }
  function draw() { code.value = make(); prev.innerHTML = code.value.replace('position:fixed;', 'position:absolute;'); }
  [num, msg, side, label, color].forEach(function (e) { e.addEventListener('input', draw); e.addEventListener('change', draw); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('WhatsApp number (with country code)', num), T.field('Ready message', msg), T.field('Button text (empty = icon only)', label), T.field('Position', side), T.field('Colour', color)]),
    h('p', { 'class': 'tfield-label', text: 'Preview' }), prev, T.field('Paste this just before </body> on your website', code),
    T.row([T.button('Copy code', { primary: true, onclick: function (e) { T.copy(code.value, e.currentTarget); } })])]));
  draw();
  T.tests['wa-button'] = function () {
    num.value = '+91 98765 43210'; msg.value = 'Hi'; label.value = 'Chat'; side.value = 'left'; draw();
    var c = code.value, fails = [];
    if (c.indexOf('href="https://wa.me/919876543210?text=Hi"') < 0) fails.push('link');
    if (c.indexOf('left:20px') < 0) fails.push('side');
    if (!prev.querySelector('a svg')) fails.push('preview');
    num.value = '919876543210'; msg.value = 'Hello! I have a question.'; label.value = 'Chat with us'; side.value = 'right'; draw();
    return Promise.resolve({ ok: !fails.length, n: 3, fails: fails });
  };
});
