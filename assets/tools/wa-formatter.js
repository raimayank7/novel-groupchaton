/* Infinity by GroupChatOn — wa-formatter. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* WhatsApp text formatter with a live preview of how the message will look. */
GCOTools.register('wa-formatter', function (spot, T) {
  var h = T.h;
  var text = h('textarea', { rows: '7', 'aria-label': 'Message' }); text.value = T.store.get('wa-fmt', '*Big sale this Sunday!*\n_All shirts_ ~₹999~ now ₹499\n\n- Free delivery\n- Cash on delivery\n> Limited stock\n\nCall `98765 43210`');
  var prev = h('div', { 'class': 'twa-prev', 'aria-live': 'polite' });
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function render(s) {
    var blocks = [];
    s = esc(s).replace(/```([\s\S]+?)```/g, function (m, a) { blocks.push('<code class="pre">' + a + '</code>'); return '\u0000' + (blocks.length - 1) + '\u0000'; });
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/(^|[\s(])\*(\S(?:[^*\n]*\S)?)\*(?=$|[\s.,!?)])/gm, '$1<b>$2</b>')
      .replace(/(^|[\s(])_(\S(?:[^_\n]*\S)?)_(?=$|[\s.,!?)])/gm, '$1<i>$2</i>')
      .replace(/(^|[\s(])~(\S(?:[^~\n]*\S)?)~(?=$|[\s.,!?)])/gm, '$1<s>$2</s>')
      .replace(/^&gt; (.*)$/gm, '<span class="q">$1</span>').replace(/^[-*] (.*)$/gm, '• $1').replace(/\n/g, '<br>');
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return blocks[+i]; });
  }
  function draw() { T.store.set('wa-fmt', text.value); prev.innerHTML = render(text.value) || '<span class="tstatus">Your message preview appears here.</span>'; }
  function wrap(a, b) {
    var s = text.selectionStart, e = text.selectionEnd, v = text.value, sel = v.slice(s, e) || 'text';
    text.value = v.slice(0, s) + a + sel + (b === undefined ? a : b) + v.slice(e); text.focus(); text.setSelectionRange(s + a.length, s + a.length + sel.length); draw();
  }
  function lines(pre) {
    var s = text.selectionStart, e = text.selectionEnd, v = text.value, ls = v.lastIndexOf('\n', s - 1) + 1, chunk = v.slice(ls, e) || 'item';
    var n = 0; text.value = v.slice(0, ls) + chunk.split('\n').map(function (l) { n++; return (pre === '1.' ? n + '. ' : pre) + l; }).join('\n') + v.slice(e); draw();
  }
  text.addEventListener('input', draw);
  var B = function (lab, title, fn) { return h('button', { type: 'button', 'class': 'tbtn tbtn-sm', title: title, onclick: fn }, [lab]); };
  spot.appendChild(T.card([h('div', { 'class': 'trow' }, [B(h('b', { text: 'B' }), 'Bold *text*', function () { wrap('*'); }), B(h('i', { text: 'I' }), 'Italic _text_', function () { wrap('_'); }),
    B(h('s', { text: 'S' }), 'Strikethrough ~text~', function () { wrap('~'); }), B('Mono', 'Monospace ```text```', function () { wrap('```'); }), B('`code`', 'Inline code', function () { wrap('`'); }),
    B('• List', 'Bulleted list', function () { lines('- '); }), B('1. List', 'Numbered list', function () { lines('1.'); }), B('❝ Quote', 'Quote', function () { lines('> '); })]),
    text, h('p', { 'class': 'tfield-label', text: 'How it looks in WhatsApp' }), prev,
    T.row([T.button('Copy message', { primary: true, onclick: function (e) { T.copy(text.value, e.currentTarget); } }),
      h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', href: '#', onclick: function (e) { e.currentTarget.href = 'https://wa.me/?text=' + encodeURIComponent(text.value); }, text: 'Send in WhatsApp' })])]));
  draw();
  T.tests['wa-formatter'] = function () {
    var fails = [], r = render('*bold* _it_ ~gone~ `c` and 2*3*4\n- a\n> q\n```x *y*```');
    ['<b>bold</b>', '<i>it</i>', '<s>gone</s>', '<code>c</code>', '2*3*4', '• a', '<span class="q">q</span>', '<code class="pre">x *y*</code>'].forEach(function (x) { if (r.indexOf(x) < 0) fails.push('missing ' + x); });
    if (render('<script>').indexOf('<script') >= 0) fails.push('not escaped');
    return Promise.resolve({ ok: !fails.length, n: 9, fails: fails });
  };
});
