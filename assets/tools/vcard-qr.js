/* Infinity by GroupChatOn — vcard-qr. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Contact QR code (vCard): put your name, phone, email, company and website in a QR code that adds you to the phone's contacts. Also saves a .vcf file. */
GCOTools.register('vcard-qr', function (spot, T) {
  var h = T.h, status = T.status(), timer, last = null;
  var F = [['first', 'First name', 'text'], ['last', 'Last name', 'text'], ['phone', 'Mobile', 'tel'], ['work', 'Work phone', 'tel'], ['email', 'Email', 'email'], ['org', 'Company', 'text'],
    ['title', 'Job title', 'text'], ['url', 'Website', 'url'], ['street', 'Street', 'text'], ['city', 'City', 'text'], ['region', 'State / region', 'text'], ['zip', 'PIN / ZIP code', 'text'], ['country', 'Country', 'text'], ['note', 'Note', 'text']];
  var inp = {};
  F.forEach(function (x) { inp[x[0]] = h('input', { type: x[2], autocomplete: 'off', 'aria-label': x[1] }); });
  function e(s) { return String(s || '').trim().replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }
  function vcard(d, nl) {
    nl = nl || '\n';
    var L = ['BEGIN:VCARD', 'VERSION:3.0', 'N:' + e(d.last) + ';' + e(d.first) + ';;;', 'FN:' + e([d.first, d.last].filter(function (x) { return x && x.trim(); }).join(' ').trim() || d.org)];
    if (d.org) L.push('ORG:' + e(d.org));
    if (d.title) L.push('TITLE:' + e(d.title));
    if (d.phone) L.push('TEL;TYPE=CELL:' + d.phone.trim());
    if (d.work) L.push('TEL;TYPE=WORK,VOICE:' + d.work.trim());
    if (d.email) L.push('EMAIL;TYPE=INTERNET:' + d.email.trim());
    if (d.url) L.push('URL:' + d.url.trim());
    if (d.street || d.city || d.region || d.zip || d.country) L.push('ADR;TYPE=WORK:;;' + [d.street, d.city, d.region, d.zip, d.country].map(e).join(';'));
    if (d.note) L.push('NOTE:' + e(d.note));
    L.push('END:VCARD');
    return L.join(nl);
  }
  function data() { var d = {}; F.forEach(function (x) { d[x[0]] = inp[x[0]].value; }); return d; }
  var view = h('div', { 'class': 'tqr', 'data-out': '' });
  function draw() {
    var d = data();
    view.innerHTML = ''; last = null;
    if (!(d.first || d.last || d.org).trim()) { status.info('Type at least a name to make the code.'); return Promise.resolve(null); }
    var text = vcard(d);
    return T.lib('qrcode').then(function (qrcode) {
      var q = qrcode(0, text.length > 600 ? 'L' : 'M'); q.addData(unescape(encodeURIComponent(text)), 'Byte'); q.make();
      var n = q.getModuleCount(), m = 4, p = '';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) p += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (n + 2 * m) + ' ' + (n + 2 * m) + '" shape-rendering="crispEdges" width="1024" height="1024"><rect width="100%" height="100%" fill="#fff"/><path fill="#000" d="' + p + '"/></svg>';
      view.innerHTML = svg;
      view.firstChild.setAttribute('width', '260'); view.firstChild.setAttribute('height', '260'); view.firstChild.setAttribute('role', 'img'); view.firstChild.setAttribute('aria-label', 'Contact QR code');
      status.ok('✓ Ready. Scan it with a phone camera: it offers to save the contact.' + (n > 69 ? ' The code is dense: leave out the note or address if it is hard to scan.' : ''));
      last = { svg: svg, text: text, name: (d.first + ' ' + d.last).trim() || d.org };
      return last;
    }).catch(function (er) { status.error(/overflow|too long/i.test(er.message) ? 'Too much text for one QR code: shorten the note or address.' : er.message); return null; });
  }
  function soon() { clearTimeout(timer); timer = setTimeout(draw, 250); }
  F.forEach(function (x) { inp[x[0]].addEventListener('input', soon); });
  function png() {
    if (!last) return;
    var img = new Image();
    img.onload = function () { var c = h('canvas'); c.width = c.height = 1024; c.getContext('2d').drawImage(img, 0, 0, 1024, 1024); T.canvasBlob(c).then(function (b) { T.download(b, 'contact-qr.png'); }); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(last.svg);
  }
  var grid = function (keys) { return h('div', { 'class': 'tgrid2' }, keys.map(function (k) { var x = F.filter(function (y) { return y[0] === k; })[0]; return T.field(x[1], inp[k]); })); };
  spot.appendChild(T.card([grid(['first', 'last', 'phone', 'email']),
    h('details', { 'class': 'tcalc-details' }, [h('summary', { text: 'More: company, website, address, note' }), grid(['org', 'title', 'work', 'url', 'street', 'city', 'region', 'zip', 'country', 'note'])]),
    status.el, view,
    T.row([T.button('Download QR (PNG)', { primary: true, onclick: png }), T.button('Save contact (.vcf)', { onclick: function () { if (last) T.download(new Blob([vcard(data(), '\r\n') + '\r\n'], { type: 'text/vcard;charset=utf-8' }), (last.name || 'contact').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '.vcf'); } }),
      T.button('Try a sample', { small: true, onclick: function () { inp.first.value = 'Asha'; inp.last.value = 'Verma'; inp.phone.value = '+91 98765 43210'; inp.email.value = 'asha@example.com'; inp.org.value = 'Verma Bakers'; inp.title.value = 'Owner'; inp.url.value = 'https://example.com'; draw(); } })]),
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: '🔒 Made on this device. Your details are not sent or saved anywhere.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['vcard-qr'] = function () {
    var f = [], v = vcard({ first: 'Asha', last: 'Verma', phone: '+91 98765 43210', email: 'asha@example.com', org: 'Verma Bakers, Pune', note: 'Cakes; cookies\nDaily' });
    var want = 'BEGIN:VCARD\nVERSION:3.0\nN:Verma;Asha;;;\nFN:Asha Verma\nORG:Verma Bakers\\, Pune\nTEL;TYPE=CELL:+91 98765 43210\nEMAIL;TYPE=INTERNET:asha@example.com\nNOTE:Cakes\\; cookies\\nDaily\nEND:VCARD';
    if (v !== want) f.push('vcard → ' + JSON.stringify(v));
    if (vcard({ org: 'Shop Only' }).indexOf('FN:Shop Only') < 0) f.push('company only');
    inp.first.value = 'Ravi'; inp.last.value = ''; inp.phone.value = '+1 555 0100';
    return draw().then(function (r) {
      if (!r || r.svg.indexOf('<path') < 0 || r.text.indexOf('FN:Ravi') < 0) f.push('draw');
      return { ok: !f.length, n: 3, fails: f };
    });
  };
});
