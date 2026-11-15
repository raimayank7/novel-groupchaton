/* Infinity by GroupChatOn — qr-scan. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* QR code scanner: read a QR code with the camera or from a photo or screenshot (jsQR, on the device). Links, Wi-Fi, UPI, contacts, email and phone codes are explained before you open them. */
GCOTools.register('qr-scan', function (spot, T) {
  var h = T.h, JSQR = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js', stream = null, raf = 0, status = T.status();
  var video = h('video', { playsinline: '', muted: '', autoplay: '', style: 'width:100%;max-height:360px;border-radius:12px;background:#000', hidden: true, 'aria-label': 'Camera preview' });
  var res = h('div', { 'data-out': '', style: 'display:grid;gap:10px;min-width:0' });
  function decode(c) {
    return T.loadScript(JSQR).then(function () {
      var d = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, c.width, c.height), r = window.jsQR(d.data, d.width, d.height, { inversionAttempts: 'attemptBoth' });
      return r ? r.data : null;
    });
  }
  function draw(src, w, hh, max) {
    var s = Math.min(1, max / Math.max(w, hh)), c = h('canvas');
    c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(hh * s));
    var x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }
  function fromFile(file) {
    var url = URL.createObjectURL(file), img = new Image();
    return new Promise(function (ok, fail) { img.onload = ok; img.onerror = function () { fail(new Error('This file is not a picture the browser can open.')); }; img.src = url; }).then(function () {
      var tries = [1600, 900, 2400];
      function next(k) { if (k >= tries.length) return null; return decode(draw(img, img.naturalWidth, img.naturalHeight, tries[k])).then(function (r) { return r || next(k + 1); }); }
      return next(0);
    }).then(function (r) { URL.revokeObjectURL(url); return r; });
  }
  function fields(text, start) {
    var out = {}, k = '', v = '', key = true, i;
    for (i = start; i < text.length; i++) {
      var c = text[i];
      if (c === '\\' && i + 1 < text.length) { (key ? (k += text[++i]) : (v += text[++i])); continue; }
      if (key && c === ':') { key = false; continue; }
      if (c === ';') { if (k) out[k.toUpperCase()] = v; k = ''; v = ''; key = true; continue; }
      if (key) k += c; else v += c;
    }
    if (k) out[k.toUpperCase()] = v;
    return out;
  }
  function describe(t) {
    var m;
    if (/^WIFI:/i.test(t)) { var w = fields(t, 5); return { kind: 'Wi-Fi network', rows: [['Network', w.S || ''], ['Password', w.P || '(none)'], ['Security', w.T || 'None'], ['Hidden', /true/i.test(w.H || '') ? 'Yes' : 'No']], copy: w.P }; }
    if (/^upi:\/\/pay\?/i.test(t)) {
      var q = new URLSearchParams(t.slice(t.indexOf('?') + 1));
      return { kind: 'UPI payment request', rows: [['Pay to', q.get('pn') || ''], ['UPI ID', q.get('pa') || ''], ['Amount', q.get('am') ? (q.get('cu') || 'INR') + ' ' + q.get('am') : 'You type it'], ['Note', q.get('tn') || '']].filter(function (r) { return r[1]; }),
        warn: 'Check the name and UPI ID before paying. Open your UPI app and scan the code there to pay.' };
    }
    if (/^BEGIN:VCARD/i.test(t)) {
      var get = function (k) { var r = new RegExp('^' + k + '(?:;[^:\\n]*)?:(.*)$', 'gim'), a = [], x; while ((x = r.exec(t))) a.push(x[1].replace(/\\([,;\\])/g, '$1').replace(/\\n/gi, ' ').trim()); return a.join(', '); };
      return { kind: 'Contact card', rows: [['Name', get('FN') || get('N').replace(/;+/g, ' ').trim()], ['Phone', get('TEL')], ['Email', get('EMAIL')], ['Company', get('ORG')], ['Website', get('URL')]].filter(function (r) { return r[1]; }), vcf: t };
    }
    if ((m = /^mailto:([^?]*)/i.exec(t))) return { kind: 'Email', rows: [['To', decodeURIComponent(m[1])]], link: t };
    if ((m = /^tel:(.*)/i.exec(t))) return { kind: 'Phone number', rows: [['Number', m[1]]], link: t };
    if ((m = /^(?:sms|smsto):([^:?]*)(?:[:?](?:body=)?(.*))?/i.exec(t))) return { kind: 'Text message', rows: [['To', m[1]], ['Message', decodeURIComponent(m[2] || '')]].filter(function (r) { return r[1]; }) };
    if ((m = /^geo:([-\d.]+),([-\d.]+)/i.exec(t))) return { kind: 'Map location', rows: [['Latitude', m[1]], ['Longitude', m[2]]], link: 'https://www.openstreetmap.org/?mlat=' + m[1] + '&mlon=' + m[2] + '#map=16/' + m[1] + '/' + m[2] };
    if (/^https?:\/\/\S+$/i.test(t)) { var host = ''; try { host = new URL(t).hostname; } catch (e) {} return { kind: 'Web link', rows: [['Website', host], ['Full address', t]], link: t, warn: 'Make sure you trust ' + host + ' before opening it. Scammers use QR codes too.' }; }
    return { kind: 'Text', rows: [['Text', t]] };
  }
  function show(text) {
    res.innerHTML = '';
    if (!text) { status.error('No QR code found. Try a sharper, closer photo with the whole code in view.'); return; }
    var d = describe(text);
    status.ok('✓ Found a QR code: ' + d.kind + '.');
    res.appendChild(h('div', { 'class': 'tkv' }, d.rows.map(function (r) { return h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] }), T.button('Copy', { small: true, onclick: function (e) { T.copy(r[1], e.currentTarget); } })]); })));
    if (d.warn) res.appendChild(h('p', { 'class': 'tnote', text: '⚠️ ' + d.warn }));
    var acts = [T.button('Copy all text', { onclick: function (e) { T.copy(text, e.currentTarget); } })];
    if (d.link) acts.unshift(h('a', { 'class': 'tbtn tbtn-primary', href: d.link, target: '_blank', rel: 'noopener noreferrer', text: d.kind === 'Web link' ? 'Open link ↗' : 'Open' }));
    if (d.vcf) acts.unshift(T.button('Save contact (.vcf)', { primary: true, onclick: function () { T.download(new Blob([d.vcf], { type: 'text/vcard' }), 'contact.vcf'); } }));
    res.appendChild(T.row(acts));
  }
  function stopCam() { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; video.hidden = true; cam.textContent = '📷 Scan with camera'; }
  function startCam() {
    if (stream) return stopCam();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { status.error('This browser cannot use the camera here. Take a photo and open it below instead.'); return; }
    status.info('Starting the camera…'); res.innerHTML = '';
    Promise.all([T.loadScript(JSQR), navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })]).then(function (r) {
      stream = r[1]; video.srcObject = stream; video.hidden = false; video.play(); cam.textContent = '■ Stop camera';
      status.info('Point the camera at a QR code…');
      var busy = false;
      (function loop() {
        raf = requestAnimationFrame(loop);
        if (busy || video.readyState < 2 || !video.videoWidth) return;
        busy = true;
        var c = draw(video, video.videoWidth, video.videoHeight, 720), d = c.getContext('2d').getImageData(0, 0, c.width, c.height), q = window.jsQR(d.data, d.width, d.height, { inversionAttempts: 'dontInvert' });
        busy = false;
        if (q && q.data) { stopCam(); if (navigator.vibrate) navigator.vibrate(80); show(q.data); }
      })();
    }).catch(function (e) { stopCam(); status.error(/Permission|NotAllowed/i.test(e.name + e.message) ? 'Camera permission was refused. Allow the camera for this site, or open a photo of the code below.' : e.message); });
  }
  var cam = T.button('📷 Scan with camera', { primary: true, onclick: startCam });
  function qrCanvas(text) {
    return T.lib('qrcode').then(function (qrcode) {
      var qr = qrcode(0, 'M'); qr.addData(unescape(encodeURIComponent(text)), 'Byte'); qr.make();
      var n = qr.getModuleCount(), s = 8, m = 4, c = h('canvas'); c.width = c.height = (n + m * 2) * s;
      var x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#000';
      for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (qr.isDark(r, k)) x.fillRect((k + m) * s, (r + m) * s, s, s);
      return c;
    });
  }
  spot.appendChild(T.card([T.row([cam, T.button('Try a sample', { small: true, onclick: function () {
      status.info('Reading a sample code…');
      qrCanvas('WIFI:T:WPA;S:Cafe Guest;P:chai\\;and\\,biscuits;;').then(decode).then(show).catch(status.error);
    } })]), video,
    T.dropzone({ accept: 'image/*', icon: '🖼️', label: 'Or open a photo or screenshot of a QR code', hint: 'Drag it here or paste it (Ctrl + V). It stays on your device.', paste: true, onFiles: function (fs) {
      stopCam(); status.info('Looking for a QR code…'); res.innerHTML = '';
      fromFile(fs[0]).then(show).catch(status.error);
    } }), status.el, res]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['qr-scan'] = function () {
    var f = [], w = describe('WIFI:T:WPA;S:Home \\"5G\\";P:pa\\;ss\\:1;H:true;;');
    if (w.rows[0][1] !== 'Home "5G"' || w.rows[1][1] !== 'pa;ss:1' || w.rows[3][1] !== 'Yes') f.push('wifi ' + JSON.stringify(w.rows));
    var u = describe('upi://pay?pa=asha@okaxis&pn=Asha%20Verma&am=250.00&cu=INR');
    if (u.rows[0][1] !== 'Asha Verma' || u.rows[2][1] !== 'INR 250.00') f.push('upi ' + JSON.stringify(u.rows));
    var v = describe('BEGIN:VCARD\nVERSION:3.0\nN:Verma;Asha;;;\nFN:Asha Verma\nTEL;TYPE=CELL:+91 98765 43210\nEMAIL:asha@example.com\nORG:Asha\\, Sons\nEND:VCARD');
    if (v.rows[0][1] !== 'Asha Verma' || v.rows[1][1] !== '+91 98765 43210' || v.rows[3][1] !== 'Asha, Sons') f.push('vcard ' + JSON.stringify(v.rows));
    if (describe('https://example.com/a?b=1').rows[0][1] !== 'example.com') f.push('link');
    return qrCanvas('Hello QR — नमस्ते 👋').then(decode).then(function (r) {
      if (r !== 'Hello QR — नमस्ते 👋') f.push('encode → decode gave ' + r);
      return { ok: !f.length, n: 5, fails: f };
    });
  };
});
