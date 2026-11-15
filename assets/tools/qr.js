/* QR Code Generator — link, text, Wi-Fi or WhatsApp; colours; PNG and SVG download (qrcode-generator).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('qr', function (spot, T) {
  var h = T.h, status = T.status(), timer;
  var kind = T.seg([['url', 'Link'], ['text', 'Text'], ['wifi', 'Wi-Fi'], ['wa', 'WhatsApp']], 'url', function () { sync(); draw(); });
  var url = h('input', { type: 'url', placeholder: 'https://example.com', value: 'https://www.groupchaton.com/' });
  var text = h('textarea', { rows: '3', placeholder: 'Any text' });
  var ssid = h('input', { type: 'text', placeholder: 'Network name' }), pass = h('input', { type: 'text', placeholder: 'Password' });
  var sec = T.select([['WPA', 'WPA/WPA2'], ['WEP', 'WEP'], ['nopass', 'No password']], 'WPA');
  var phone = h('input', { type: 'tel', placeholder: 'Number with country code, e.g. 919876543210' }), msg = h('input', { type: 'text', placeholder: 'Message (optional)' });
  var fields = {
    url: T.field('Link', url), text: T.field('Text', text),
    wifi: h('div', { 'class': 'tgrid2' }, [T.field('Wi-Fi name', ssid), T.field('Password', pass), T.field('Security', sec)]),
    wa: h('div', { 'class': 'tgrid2' }, [T.field('WhatsApp number', phone), T.field('Message', msg)])
  };
  var fg = h('input', { type: 'color', value: '#111111' }), bg = h('input', { type: 'color', value: '#ffffff' });
  var size = T.select([[256, 'Small (256 px)'], [512, 'Medium (512 px)'], [1024, 'Large (1024 px)']], 512);
  var ecl = T.select([['L', 'Low'], ['M', 'Medium'], ['Q', 'High'], ['H', 'Highest (for printing)']], 'M');
  var box = h('div', { 'class': 'tqr', 'aria-live': 'polite' });
  var png = T.button('Download PNG', { primary: true, onclick: function () { savePng(); } });
  var svg = T.button('Download SVG', { onclick: function () { if (last) T.download(new Blob([last.svg], { type: 'image/svg+xml' }), 'qr-code.svg'); } });
  spot.appendChild(T.card([kind, fields.url, fields.text, fields.wifi, fields.wa,
    h('div', { 'class': 'tgrid2' }, [T.field('Colour', fg), T.field('Background', bg), T.field('Size', size), T.field('Error correction', ecl)]),
    box, T.row([png, svg]), status.el]));
  [url, text, ssid, pass, sec, phone, msg, fg, bg, size, ecl].forEach(function (i) { i.addEventListener('input', soon); i.addEventListener('change', soon); });
  function soon() { clearTimeout(timer); timer = setTimeout(draw, 200); }
  function sync() { Object.keys(fields).forEach(function (k) { fields[k].hidden = k !== kind.value(); }); }
  function esc(s) { return String(s).replace(/([\\;,:"])/g, '\\$1'); }
  function data() {
    var k = kind.value();
    if (k === 'url') return url.value.trim();
    if (k === 'text') return text.value;
    if (k === 'wifi') return ssid.value ? 'WIFI:T:' + sec.value + ';S:' + esc(ssid.value) + ';' + (sec.value === 'nopass' ? '' : 'P:' + esc(pass.value) + ';') + ';' : '';
    var n = phone.value.replace(/\D/g, '');
    return n ? 'https://wa.me/' + n + (msg.value ? '?text=' + encodeURIComponent(msg.value) : '') : '';
  }
  var last = null;
  function draw() {
    var d = data();
    box.innerHTML = ''; last = null;
    png.disabled = svg.disabled = !d;
    if (!d) { box.appendChild(h('p', { 'class': 'tstatus', text: 'Fill in the details to see your QR code.' })); return; }
    T.lib('qrcode').then(function (qrcode) {
      var qr = qrcode(0, ecl.value);
      qr.addData(unescape(encodeURIComponent(d)), 'Byte');   // UTF-8 so Hindi/Korean/emoji text works
      qr.make();
      var n = qr.getModuleCount(), m = 4, cells = [];
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) cells.push('M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z');
      var dim = n + m * 2;
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + ' ' + dim + '" shape-rendering="crispEdges" width="' + size.value + '" height="' + size.value + '">' +
        '<rect width="100%" height="100%" fill="' + bg.value + '"/><path fill="' + fg.value + '" d="' + cells.join('') + '"/></svg>';
      last = { svg: s, px: +size.value };
      box.innerHTML = s;
      box.firstChild.setAttribute('width', Math.min(280, +size.value)); box.firstChild.setAttribute('height', Math.min(280, +size.value));
      box.firstChild.setAttribute('role', 'img'); box.firstChild.setAttribute('aria-label', 'QR code');
      status.clear();
    }).catch(status.error);
  }
  function savePng() {
    if (!last) return;
    var img = new Image();
    img.onload = function () {
      var c = h('canvas'); c.width = c.height = last.px;
      c.getContext('2d').drawImage(img, 0, 0, last.px, last.px);
      T.canvasBlob(c, 'image/png').then(function (b) { T.download(b, 'qr-code.png'); });
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(last.svg);
  }
  sync(); draw();
});
