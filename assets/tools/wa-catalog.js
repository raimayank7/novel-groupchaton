/* Infinity by GroupChatOn — wa-catalog. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Price list / catalogue maker: your items as a neat WhatsApp message and a shareable picture. Saved on this device. */
GCOTools.register('wa-catalog', function (spot, T) {
  var h = T.h, V = T.vault('wa-catalog', { shop: 'Sharma Sweets', phone: '919876543210', note: 'Free home delivery above ₹500', items: [{ n: 'Kaju Katli', p: '900', u: 'per kg', d: '' }, { n: 'Gulab Jamun', p: '300', u: 'per kg', d: 'Fresh every morning' }, { n: 'Samosa', p: '20', u: 'each', d: '' }] });
  var shop = h('input', { type: 'text', 'aria-label': 'Shop name' }), phone = h('input', { type: 'tel', 'aria-label': 'WhatsApp number' }), note = h('input', { type: 'text', 'aria-label': 'Note' });
  var cur = h('input', { type: 'text', value: '₹', style: 'max-width:80px', 'aria-label': 'Currency symbol' }), rows = h('div', { 'class': 'tcat-rows' }), out = h('textarea', { rows: '10', readonly: true, 'aria-label': 'Message' }), pic = h('div', { 'class': 'tcat-pic' });
  var d = null;
  function text() {
    var lines = ['*' + (d.shop || 'Price list') + '*', '_Price list_', ''];
    d.items.filter(function (i) { return i.n; }).forEach(function (i) { lines.push('• *' + i.n + '* — ' + (i.p ? cur.value + i.p : '') + (i.u ? ' ' + i.u : '') + (i.d ? '\n   _' + i.d + '_' : '')); });
    if (d.note) lines.push('', d.note);
    if (d.phone) lines.push('', '📲 Order on WhatsApp: wa.me/' + d.phone.replace(/\D/g, ''));
    return lines.join('\n');
  }
  function drawRows() {
    rows.innerHTML = '';
    d.items.forEach(function (it, i) {
      var f = function (k, ph, w) { var e = h('input', { type: 'text', value: it[k] || '', placeholder: ph, style: w ? 'max-width:' + w : null, 'aria-label': ph }); e.addEventListener('input', function () { it[k] = e.value; save(); }); return e; };
      rows.appendChild(h('div', { 'class': 'tcat-row' }, [f('n', 'Item'), f('p', 'Price', '110px'), f('u', 'per…', '110px'), f('d', 'Note (optional)'),
        h('button', { type: 'button', 'class': 'tx-x', 'aria-label': 'Remove', text: '✕', onclick: function () { d.items.splice(i, 1); save(); drawRows(); } })]));
    });
  }
  function picture() {   // a tall image of the price list to share as a photo
    var W = 1080, list = d.items.filter(function (i) { return i.n; }), H = 330 + list.length * 110 + (d.note ? 90 : 0);
    var c = h('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d'); g.fillStyle = '#0B3D2E'; g.fillRect(0, 0, W, H); g.fillStyle = '#25D366'; g.fillRect(0, 0, W, 12);
    g.fillStyle = '#fff'; g.font = '700 64px system-ui, sans-serif'; g.fillText(d.shop || 'Price list', 70, 130);
    g.fillStyle = '#A7F3D0'; g.font = '500 34px system-ui, sans-serif'; g.fillText('Price list', 70, 185);
    list.forEach(function (it, k) {
      var y = 270 + k * 110; g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(50, y - 60, W - 100, 96);
      g.fillStyle = '#fff'; g.font = '600 40px system-ui, sans-serif'; g.fillText(it.n, 80, y);
      if (it.d) { g.fillStyle = '#A7F3D0'; g.font = '400 26px system-ui, sans-serif'; g.fillText(it.d, 80, y + 30); }
      g.textAlign = 'right'; g.fillStyle = '#FDE68A'; g.font = '700 40px system-ui, sans-serif'; g.fillText((it.p ? cur.value + it.p : '') + (it.u ? ' ' + it.u : ''), W - 80, y); g.textAlign = 'left';
    });
    g.fillStyle = '#fff'; g.font = '500 32px system-ui, sans-serif';
    if (d.note) g.fillText(d.note, 70, H - 110);
    if (d.phone) { g.fillStyle = '#25D366'; g.fillText('WhatsApp: +' + d.phone.replace(/\D/g, ''), 70, H - 50); }
    return c;
  }
  function save() { d.shop = shop.value; d.phone = phone.value; d.note = note.value; out.value = text(); V.save(); }
  [shop, phone, note, cur].forEach(function (e) { e.addEventListener('input', save); });
  spot.appendChild(T.card([V.bar(function () { d = V.data(); fill(); }), h('div', { 'class': 'tgrid2' }, [T.field('Shop name', shop), T.field('WhatsApp number (with country code)', phone), T.field('Note at the bottom', note), T.field('Currency', cur)]),
    h('h3', { text: 'Items' }), rows, T.row([T.button('+ Add item', { small: true, onclick: function () { d.items.push({ n: '', p: '', u: '', d: '' }); save(); drawRows(); rows.lastChild.querySelector('input').focus(); } })]),
    h('h3', { text: 'Your WhatsApp message' }), out,
    T.row([T.button('Copy message', { primary: true, onclick: function (e) { T.copy(out.value, e.currentTarget); } }), h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', href: '#', onclick: function (e) { e.currentTarget.href = 'https://wa.me/?text=' + encodeURIComponent(out.value); }, text: 'Send / share' }),
      T.button('Download as picture', { onclick: function () { T.canvasBlob(picture(), 'image/png').then(function (b) { T.download(b, 'price-list.png'); }); } })]), pic]));
  function fill() { shop.value = d.shop || ''; phone.value = d.phone || ''; note.value = d.note || ''; drawRows(); out.value = text(); }
  V.ready.then(function () { d = V.data(); fill(); });
  T.tests['wa-catalog'] = function () {
    return V.ready.then(function () {
      var fails = [], t = text();
      if (t.indexOf('*' + d.shop + '*') !== 0) fails.push('title');
      if (d.items.length && t.indexOf('• *' + d.items[0].n + '*') < 0) fails.push('items');
      var c = picture(); if (c.width !== 1080 || c.height < 330) fails.push('picture');
      return { ok: !fails.length, n: 3, fails: fails };
    });
  };
});
