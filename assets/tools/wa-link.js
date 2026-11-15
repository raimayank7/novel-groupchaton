/* Infinity by GroupChatOn — wa-link. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* WhatsApp link + QR: a wa.me link with a ready message, as a QR code to print on cards, menus and shop counters. */
GCOTools.register('wa-link', function (spot, T) {
  var h = T.h, status = T.status();
  var num = h('input', { type: 'tel', inputmode: 'numeric', placeholder: 'e.g. 91 98765 43210', value: T.store.get('wa-link-n', ''), 'aria-label': 'Number with country code' });
  var msg = h('textarea', { rows: '3', placeholder: 'Message that will be typed for them (optional)' }); msg.value = T.store.get('wa-link-m', 'Hi! I saw your QR code and would like to know more.');
  var out = h('input', { type: 'text', readonly: true, 'aria-label': 'Your link' }), qrBox = h('div', { 'class': 'tqr' }), last = { link: '' };
  function link() {
    var n = num.value.replace(/\D/g, '').replace(/^00/, '');
    if (n.length < 8) return '';
    return 'https://wa.me/' + n + (msg.value.trim() ? '?text=' + encodeURIComponent(msg.value.trim()) : '');
  }
  function draw() {
    T.store.set('wa-link-n', num.value); T.store.set('wa-link-m', msg.value);
    var l = link(); out.value = l; last.link = l; qrBox.innerHTML = '';
    if (!l) { qrBox.appendChild(h('p', { 'class': 'tstatus', text: 'Type the number with its country code (91 for India, 971 for UAE, 1 for USA…).' })); return Promise.resolve(); }
    return T.lib('qrcode').then(function (qrcode) {
      var qr = qrcode(0, 'M'); qr.addData(unescape(encodeURIComponent(l)), 'Byte'); qr.make();
      var n = qr.getModuleCount(), px = 8, m = 4, c = h('canvas'); c.width = c.height = (n + 2 * m) * px;
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#075E54';
      for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (qr.isDark(r, k)) g.fillRect((k + m) * px, (r + m) * px, px, px);
      c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'QR code'); qrBox.appendChild(c); last.canvas = c; last.n = n;
    }).catch(status.error);
  }
  var t = 0;
  [num, msg].forEach(function (e) { e.addEventListener('input', function () { clearTimeout(t); t = setTimeout(draw, 200); }); });
  spot.appendChild(T.card([T.field('Your WhatsApp number', num, 'with country code; spaces and + are fine'), T.field('Ready message', msg), T.field('Your chat link', out), qrBox,
    T.row([T.button('Copy link', { primary: true, onclick: function (e) { if (last.link) T.copy(last.link, e.currentTarget); } }),
      T.button('Download QR (PNG)', { onclick: function () { if (last.canvas) T.canvasBlob(last.canvas, 'image/png').then(function (b) { T.download(b, 'whatsapp-qr.png'); }); } }),
      T.button('Test on WhatsApp', { onclick: function () { if (last.link) window.open(last.link, '_blank', 'noopener'); } })]), status.el]));
  draw();
  T.tests['wa-link'] = function () {
    var k = [num.value, msg.value], fails = [];
    num.value = '+91 98765-43210'; msg.value = 'Hello & welcome';
    return draw().then(function () {
      if (last.link !== 'https://wa.me/919876543210?text=Hello%20%26%20welcome') fails.push('link ' + last.link);
      if (!last.canvas || last.canvas.width < 200) fails.push('no QR');
      num.value = '123'; return draw();
    }).then(function () {
      if (last.link !== '') fails.push('short number accepted');
      num.value = k[0]; msg.value = k[1]; draw();
      return { ok: !fails.length, n: 3, fails: fails };
    });
  };
});
