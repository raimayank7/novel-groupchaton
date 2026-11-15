/* Infinity by GroupChatOn — wifi-qr. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Wi-Fi QR code: guests scan it to join your Wi-Fi without typing the password. Makes a printable card (PNG) and a plain QR code (SVG). */
GCOTools.register('wifi-qr', function (spot, T) {
  var h = T.h, status = T.status(), timer, last = null;
  function esc(s) { return String(s).replace(/([\\;,:"])/g, '\\$1'); }
  function wifi(ssid, pass, sec, hidden) { return 'WIFI:T:' + sec + ';S:' + esc(ssid) + ';' + (sec === 'nopass' ? '' : 'P:' + esc(pass) + ';') + (hidden ? 'H:true;' : '') + ';'; }
  function matrix(text) { return T.lib('qrcode').then(function (qrcode) { var q = qrcode(0, 'Q'); q.addData(unescape(encodeURIComponent(text)), 'Byte'); q.make(); return q; }); }
  function svgOf(q) {
    var n = q.getModuleCount(), m = 4, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (n + 2 * m) + ' ' + (n + 2 * m) + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path fill="#000" d="' + d + '"/></svg>';
  }
  function card(q, lines, title) {
    var W = 900, n = q.getModuleCount(), s = Math.floor(560 / (n + 8)), size = s * (n + 8), c = h('canvas'), x = c.getContext('2d'), H = 250 + size + lines.length * 70 + 60;
    c.width = W; c.height = H;
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#0f172a'; x.fillRect(0, 0, W, 190);
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = 'bold 64px system-ui, Segoe UI, sans-serif'; x.fillText(title[0], W / 2, 105);
    x.font = '32px system-ui, Segoe UI, sans-serif'; x.fillText(title[1], W / 2, 155);
    var ox = (W - size) / 2, oy = 220;
    x.fillStyle = '#000';
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(ox + (k + 4) * s, oy + (r + 4) * s, s, s);
    lines.forEach(function (l, i) {
      var y = oy + size + 60 + i * 70;
      x.fillStyle = '#64748b'; x.font = '26px system-ui, Segoe UI, sans-serif'; x.fillText(l[0], W / 2, y);
      x.fillStyle = '#0f172a'; x.font = 'bold 38px system-ui, Segoe UI, sans-serif';
      var t = l[1]; while (x.measureText(t).width > W - 80 && t.length > 4) t = t.slice(0, -2);
      x.fillText(t === l[1] ? t : t + '…', W / 2, y + 42);
    });
    return c;
  }
  var ssid = h('input', { type: 'text', placeholder: 'Your Wi-Fi name (SSID)', autocomplete: 'off', 'aria-label': 'Wi-Fi name' });
  var pass = h('input', { type: 'password', placeholder: 'Wi-Fi password', autocomplete: 'off', 'aria-label': 'Wi-Fi password' });
  var sec = T.select([['WPA', 'WPA / WPA2 / WPA3 (most routers)'], ['WEP', 'WEP (old)'], ['nopass', 'No password (open)']], 'WPA');
  var hidden = h('input', { type: 'checkbox' }), printPass = h('input', { type: 'checkbox', checked: true });
  var eye = T.button('Show', { small: true, onclick: function () { pass.type = pass.type === 'password' ? 'text' : 'password'; eye.textContent = pass.type === 'password' ? 'Show' : 'Hide'; } });
  var view = h('div', { 'class': 'tqr', 'data-out': '' });
  function draw() {
    last = null; view.innerHTML = '';
    if (!ssid.value.trim()) { status.info('Type your Wi-Fi name to make the code.'); return Promise.resolve(null); }
    if (sec.value === 'WPA' && pass.value.length && (pass.value.length < 8 || pass.value.length > 63)) status.info('Note: WPA passwords are 8 to 63 characters. Check yours.');
    else if (sec.value !== 'nopass' && !pass.value) status.info('Type the password too, or choose “No password”.');
    else status.ok('✓ Ready. Test it with your phone camera before printing.');
    var text = wifi(ssid.value, pass.value, sec.value, hidden.checked);
    return matrix(text).then(function (q) {
      var lines = [['Network', ssid.value]];
      if (sec.value !== 'nopass' && printPass.checked) lines.push(['Password', pass.value]);
      var c = card(q, lines, ['📶 Free Wi-Fi', 'Scan with your phone camera to connect']);
      c.style.cssText = 'width:100%;max-width:320px;height:auto;border-radius:12px;box-shadow:0 1px 6px rgba(0,0,0,.18)';
      c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Wi-Fi QR card for ' + ssid.value);
      view.appendChild(c);
      last = { canvas: c, svg: svgOf(q), text: text };
      return last;
    });
  }
  function soon() { clearTimeout(timer); timer = setTimeout(draw, 200); }
  [ssid, pass, sec, hidden, printPass].forEach(function (i) { i.addEventListener('input', soon); i.addEventListener('change', soon); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Wi-Fi name', ssid), T.field('Password', h('div', { 'class': 'tpass' }, [pass, eye])), T.field('Security', sec)]),
    h('div', { 'class': 'tchecks' }, [h('label', { 'class': 'tcheck' }, [hidden, ' Hidden network']), h('label', { 'class': 'tcheck' }, [printPass, ' Print the password on the card'])]),
    status.el, view,
    T.row([T.button('Download card (PNG)', { primary: true, onclick: function () { if (last) T.canvasBlob(last.canvas).then(function (b) { T.download(b, 'wifi-qr-card.png'); }); } }),
      T.button('QR only (SVG)', { onclick: function () { if (last) T.download(new Blob([last.svg], { type: 'image/svg+xml' }), 'wifi-qr.svg'); } }),
      T.button('Try a sample', { small: true, onclick: function () { ssid.value = 'Sharma Home 5G'; pass.value = 'chai-time-2026'; sec.value = 'WPA'; draw(); } })]),
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: '🔒 The code is made on this device. Your Wi-Fi name and password are never sent anywhere.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['wifi-qr'] = function () {
    var f = [];
    var a = wifi('My "Home"; Net', 'p:a,s\\s', 'WPA', true);
    if (a !== 'WIFI:T:WPA;S:My \\"Home\\"\\; Net;P:p\\:a\\,s\\\\s;H:true;;') f.push('escape → ' + a);
    if (wifi('Cafe', 'x', 'nopass', false) !== 'WIFI:T:nopass;S:Cafe;;') f.push('open network');
    ssid.value = 'Test Net'; pass.value = 'password123'; sec.value = 'WPA';
    return draw().then(function (r) {
      if (!r || r.text !== 'WIFI:T:WPA;S:Test Net;P:password123;;' || r.canvas.width !== 900 || r.svg.indexOf('<path') < 0) f.push('draw');
      return { ok: !f.length, n: 3, fails: f };
    });
  };
});
