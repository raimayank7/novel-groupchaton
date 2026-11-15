/* Hash Generator — MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of text or any file, plus a "does it match?" check.
   SHA uses the browser's own Web Crypto; MD5 (which Web Crypto lacks) is computed here.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('hash', function (spot, T) {
  var h = T.h;
  /* MD5 (RFC 1321) on bytes */
  function md5(bytes) {
    var K = [], S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21], i;
    for (i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
    var n = bytes.length, total = ((n + 8) >>> 6) + 1, w = new Int32Array(total * 16);
    for (i = 0; i < n; i++) w[i >> 2] |= bytes[i] << ((i % 4) * 8);
    w[n >> 2] |= 0x80 << ((n % 4) * 8);
    w[total * 16 - 2] = (n * 8) | 0; w[total * 16 - 1] = Math.floor(n / 536870912);
    var a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
    for (var blk = 0; blk < total * 16; blk += 16) {
      var A = a0, B = b0, C = c0, D = d0;
      for (i = 0; i < 64; i++) {
        var F, g;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        var tmp = D; D = C; C = B;
        var x = (A + F + K[i] + w[blk + g]) | 0, s = S[(i >> 4) * 4 + (i % 4)];
        B = (B + ((x << s) | (x >>> (32 - s)))) | 0; A = tmp;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    return [a0, b0, c0, d0].map(function (v) { var s = ''; for (var j = 0; j < 4; j++) s += ('0' + ((v >>> (j * 8)) & 255).toString(16)).slice(-2); return s; }).join('');
  }
  function hex(buf) { return Array.from(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  var ALGOS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
  var input = h('textarea', { rows: '5', 'class': 'tmono', placeholder: 'Type or paste text', 'aria-label': 'Text to hash' });
  var upper = h('input', { type: 'checkbox' });
  var check = h('input', { type: 'text', 'class': 'tmono', placeholder: 'Paste a hash to check (optional)', 'aria-label': 'Hash to compare' });
  var rows = h('div', { 'class': 'thashes' }), status = T.status(), file = null;
  var fileName = h('small', { 'class': 'tstatus' });
  var drop = T.dropzone({ label: 'Or choose a file', hint: 'any file, any size your device can hold · nothing is uploaded', icon: '#️⃣',
    onFiles: function (f) { file = f[0]; fileName.textContent = 'File: ' + file.name + ' (' + T.bytes(file.size) + ')'; run(); } });
  spot.appendChild(T.card([T.field('Text', input), drop, fileName, h('div', { 'class': 'topts' }, [h('label', { 'class': 'tcheck' }, [upper, ' UPPERCASE']), T.field('Compare with', check)]), status.el, rows]));
  var seq = 0;
  function run() {
    var tok = ++seq;
    rows.innerHTML = '';
    var src = file ? T.read(file) : Promise.resolve(new TextEncoder().encode(input.value).buffer);
    if (!file && !input.value) { status.clear(); return; }
    status.info('Working…');
    src.then(function (buf) {
      return Promise.all(ALGOS.map(function (a) { return a === 'MD5' ? md5(new Uint8Array(buf)) : crypto.subtle.digest(a, buf).then(hex); }));
    }).then(function (out) {
      if (tok !== seq) return;
      var want = check.value.trim().toLowerCase(), hit = '';
      out.forEach(function (v, i) {
        if (upper.checked) v = v.toUpperCase();
        if (want && v.toLowerCase() === want) hit = ALGOS[i];
        var b = T.button('Copy', { small: true, onclick: function () { T.copy(v, b); } });
        rows.appendChild(h('div', { 'class': 'thash' + (want && v.toLowerCase() === want ? ' is-match' : '') }, [h('b', { text: ALGOS[i] }), h('code', { text: v }), b]));
      });
      if (want) status[hit ? 'ok' : 'error'](hit ? '✓ It matches the ' + hit + ' hash.' : 'No match: this hash is different from all five.');
      else status.clear();
    }).catch(function (e) { if (tok === seq) status.error(e); });
  }
  input.addEventListener('input', function () { file = null; fileName.textContent = ''; run(); });
  [upper, check].forEach(function (x) { x.addEventListener('input', run); x.addEventListener('change', run); });
  if (!window.crypto || !crypto.subtle) status.error('This browser cannot make SHA hashes here. Open the page over https in a recent browser.');
});
