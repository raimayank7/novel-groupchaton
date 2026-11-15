/* Infinity by GroupChatOn — upi-qr. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* UPI payment QR (India): make a QR code that opens any UPI app (Google Pay, PhonePe, Paytm, BHIM…) ready to pay you, with an optional fixed amount and note. Printable shop card. */
GCOTools.register('upi-qr', function (spot, T) {
  var h = T.h, status = T.status(), timer, last = null;
  function validVpa(v) { return /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,255}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/.test(String(v).trim()); }
  function enc(s) { return encodeURIComponent(String(s).trim()); }
  function upi(d) {
    var q = 'pa=' + String(d.pa).trim() + '&pn=' + enc(d.pn || d.pa);
    if (d.am) q += '&am=' + (+d.am).toFixed(2);
    q += '&cu=INR';
    if (d.tn) q += '&tn=' + enc(d.tn);
    return 'upi://pay?' + q;
  }
  function card(q, d) {
    var W = 900, n = q.getModuleCount(), s = Math.floor(600 / (n + 8)), size = s * (n + 8), c = h('canvas'), x = c.getContext('2d'), H = 230 + size + 240;
    c.width = W; c.height = H;
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#14532d'; x.fillRect(0, 0, W, 170);
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = 'bold 58px system-ui, Segoe UI, sans-serif'; x.fillText('Scan & Pay', W / 2, 92);
    x.font = '30px system-ui, Segoe UI, sans-serif'; x.fillText('with any UPI app', W / 2, 140);
    var ox = (W - size) / 2, oy = 200;
    x.fillStyle = '#000';
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(ox + (k + 4) * s, oy + (r + 4) * s, s, s);
    var y = oy + size + 70;
    function fit(t, font) { x.font = font; while (x.measureText(t).width > W - 80 && t.length > 4) t = t.slice(0, -2) + ''; return t; }
    x.fillStyle = '#0f172a'; x.fillText(fit(d.pn || d.pa, 'bold 46px system-ui, Segoe UI, sans-serif'), W / 2, y);
    x.fillStyle = '#475569'; x.fillText(fit(d.pa, '32px system-ui, Segoe UI, sans-serif'), W / 2, y + 56);
    if (d.am) { x.fillStyle = '#14532d'; x.fillText(fit('Amount: ₹' + (+d.am).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 'bold 40px system-ui, Segoe UI, sans-serif'), W / 2, y + 120); }
    return c;
  }
  var pa = h('input', { type: 'text', placeholder: 'yourname@okaxis', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'UPI ID' });
  var pn = h('input', { type: 'text', placeholder: 'Name shown to the payer', autocomplete: 'off', 'aria-label': 'Payee name' });
  var am = h('input', { type: 'number', min: '1', step: '0.01', placeholder: 'Leave empty to let them type it', inputmode: 'decimal', 'aria-label': 'Amount' });
  var tn = h('input', { type: 'text', maxlength: '50', placeholder: 'For example: Invoice 42', autocomplete: 'off', 'aria-label': 'Note' });
  var view = h('div', { 'class': 'tqr', 'data-out': '' });
  function draw() {
    view.innerHTML = ''; last = null;
    var d = { pa: pa.value.trim(), pn: pn.value.trim(), am: am.value, tn: tn.value.trim() };
    if (!d.pa) { status.info('Type your UPI ID (it looks like name@bank) to make the code.'); return Promise.resolve(null); }
    if (!validVpa(d.pa)) { status.error('“' + d.pa + '” does not look like a UPI ID. It should look like name@okhdfcbank or 9876543210@ybl.'); return Promise.resolve(null); }
    if (d.am && !(+d.am > 0)) { status.error('The amount must be more than zero.'); return Promise.resolve(null); }
    var text = upi(d);
    return T.lib('qrcode').then(function (qrcode) {
      var q = qrcode(0, 'M'); q.addData(text, 'Byte'); q.make();
      var c = card(q, d);
      c.style.cssText = 'width:100%;max-width:320px;height:auto;border-radius:12px;box-shadow:0 1px 6px rgba(0,0,0,.18)';
      c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'UPI payment QR for ' + d.pa);
      view.appendChild(c);
      status.ok('✓ Ready. Scan it once with your own UPI app to check the name before you print it.' + (+d.am > 100000 ? ' Note: many UPI apps limit one payment to ₹1 lakh.' : ''));
      last = { canvas: c, text: text };
      return last;
    });
  }
  function soon() { clearTimeout(timer); timer = setTimeout(draw, 250); }
  [pa, pn, am, tn].forEach(function (i) { i.addEventListener('input', soon); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Your UPI ID', pa), T.field('Your name or shop name', pn), T.field('Amount in ₹ (optional)', am), T.field('Note (optional)', tn)]),
    status.el, view,
    T.row([T.button('Download card (PNG)', { primary: true, onclick: function () { if (last) T.canvasBlob(last.canvas).then(function (b) { T.download(b, 'upi-qr.png'); }); } }),
      T.button('Copy UPI link', { onclick: function (e) { if (last) T.copy(last.text, e.currentTarget); } }),
      T.button('Try a sample', { small: true, onclick: function () { pa.value = 'vermabakers@okaxis'; pn.value = 'Verma Bakers'; am.value = ''; tn.value = ''; draw(); } })]),
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: '🔒 The code is made on this device; nothing is sent to us or to any bank. Money goes straight from the payer’s UPI app to your bank account. You never need your UPI PIN to receive money.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['upi-qr'] = function () {
    var f = [];
    var u = upi({ pa: 'asha.verma@okaxis', pn: 'Asha Verma', am: '250', tn: 'Tiffin May' });
    if (u !== 'upi://pay?pa=asha.verma@okaxis&pn=Asha%20Verma&am=250.00&cu=INR&tn=Tiffin%20May') f.push('link → ' + u);
    if (upi({ pa: '9876543210@ybl', pn: '' }) !== 'upi://pay?pa=9876543210@ybl&pn=9876543210%40ybl&cu=INR') f.push('no name → ' + upi({ pa: '9876543210@ybl', pn: '' }));
    ['asha@okhdfcbank', '9876543210@ybl', 'shop.name-1@paytm'].forEach(function (v) { if (!validVpa(v)) f.push('rejected ' + v); });
    ['asha', '@ybl', 'asha@', 'as ha@ybl', 'asha@1bank'].forEach(function (v) { if (validVpa(v)) f.push('accepted ' + v); });
    pa.value = 'test@upi'; pn.value = 'Test Shop'; am.value = '99.5'; tn.value = '';
    return draw().then(function (r) {
      if (!r || r.text !== 'upi://pay?pa=test@upi&pn=Test%20Shop&am=99.50&cu=INR' || r.canvas.width !== 900) f.push('draw ' + (r && r.text));
      return { ok: !f.length, n: 11, fails: f };
    });
  };
});
