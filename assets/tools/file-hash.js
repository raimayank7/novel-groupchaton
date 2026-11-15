/* Infinity by GroupChatOn — file-hash. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* File checksum: MD5, SHA-1, SHA-256, SHA-512 and CRC32 of any file, worked out on your device, with a box to compare against the published checksum. */
GCOTools.register('file-hash', function (spot, T) {
  var h = T.h;
  var K = [], SH = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  for (var i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
  // MD5, fed in pieces so big files do not need a second copy in memory
  function MD5() { this.s = [0x67452301, 0xefcdab89 | 0, 0x98badcfe | 0, 0x10325476]; this.buf = new Uint8Array(64); this.bl = 0; this.len = 0; this.x = new Int32Array(16); }
  MD5.prototype.block = function (b, o) {
    var x = this.x, s = this.s, a = s[0], bb = s[1], c = s[2], d = s[3];
    for (var j = 0; j < 16; j++) x[j] = b[o + 4 * j] | b[o + 4 * j + 1] << 8 | b[o + 4 * j + 2] << 16 | b[o + 4 * j + 3] << 24;
    for (var i = 0; i < 64; i++) {
      var f, g, r = i >> 4;
      if (r === 0) { f = (bb & c) | (~bb & d); g = i; } else if (r === 1) { f = (d & bb) | (~d & c); g = (5 * i + 1) & 15; } else if (r === 2) { f = bb ^ c ^ d; g = (3 * i + 5) & 15; } else { f = c ^ (bb | ~d); g = (7 * i) & 15; }
      var sh = SH[r * 4 + (i & 3)]; f = (f + a + K[i] + x[g]) | 0; a = d; d = c; c = bb; bb = (bb + (f << sh | f >>> (32 - sh))) | 0;
    }
    s[0] = s[0] + a | 0; s[1] = s[1] + bb | 0; s[2] = s[2] + c | 0; s[3] = s[3] + d | 0;
  };
  MD5.prototype.update = function (u) {
    var i = 0, n = u.length; this.len += n;
    if (this.bl) { while (i < n && this.bl < 64) this.buf[this.bl++] = u[i++]; if (this.bl === 64) { this.block(this.buf, 0); this.bl = 0; } }
    for (; i + 64 <= n; i += 64) this.block(u, i);
    while (i < n) this.buf[this.bl++] = u[i++];
    return this;
  };
  MD5.prototype.hex = function () {
    var bits = this.len * 8, pad = new Uint8Array((this.bl < 56 ? 56 : 120) - this.bl + 8); pad[0] = 0x80;
    var lo = bits >>> 0, hi = Math.floor(bits / 4294967296), e = pad.length - 8;
    for (var j = 0; j < 4; j++) { pad[e + j] = lo >>> (8 * j) & 255; pad[e + 4 + j] = hi >>> (8 * j) & 255; }
    var keep = this.len; this.update(pad); this.len = keep;
    return this.s.map(function (w) { var o = ''; for (var j = 0; j < 4; j++) o += ('0' + (w >>> (8 * j) & 255).toString(16)).slice(-2); return o; }).join('');
  };
  var CT = (function () { var t = new Int32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
  function crc32(u, c) { c = c === undefined ? -1 : c; for (var i = 0; i < u.length; i++) c = CT[(c ^ u[i]) & 255] ^ (c >>> 8); return c; }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  // all checksums of a byte array; onStep(fraction) for progress
  function sums(bytes, onStep) {
    var m = new MD5(), c = -1, step = 4 << 20, at = 0;
    return new Promise(function (ok) {
      (function next() {
        var part = bytes.subarray(at, Math.min(bytes.length, at + step)); m.update(part); c = crc32(part, c); at += step;
        if (onStep) onStep(Math.min(1, at / Math.max(1, bytes.length)) * 0.5);
        if (at < bytes.length) setTimeout(next, 0); else ok();
      })();
    }).then(function () {
      var out = { 'MD5': m.hex(), 'CRC32': ('00000000' + ((c ^ -1) >>> 0).toString(16)).slice(-8) };
      return ['SHA-1', 'SHA-256', 'SHA-512'].reduce(function (p, alg) { return p.then(function () { return crypto.subtle.digest(alg, bytes).then(function (d) { out[alg] = hex(d); if (onStep) onStep(1); }); }); }, Promise.resolve()).then(function () { return out; });
    });
  }
  var cmp = h('input', { type: 'text', placeholder: 'Paste the checksum from the website (optional)', spellcheck: 'false' }), status = T.status(), list = h('div', { 'class': 'tlist' }), last = [];
  function mark() {
    var want = cmp.value.trim().toLowerCase().replace(/^.*?([0-9a-f]{8,128}).*$/, '$1'), any = false;
    Array.prototype.forEach.call(list.querySelectorAll('.thash'), function (row) { var on = want && row.getAttribute('data-v') === want; row.style.borderColor = on ? '#16a34a' : ''; row.style.boxShadow = on ? '0 0 0 2px #16a34a55' : ''; if (on) any = true; });
    if (!want) status.clear(); else if (!last.length) status.info('Choose a file to compare.'); else if (any) status.ok('✓ Match: the file is exactly the one that was published.'); else status.error('✗ No match: the file is different, damaged or incomplete. Download it again.');
  }
  cmp.addEventListener('input', mark);
  function run(files) {
    list.innerHTML = ''; last = [];
    files.reduce(function (p, f, n) {
      return p.then(function () {
        if (f.size > 2e9) { status.error(f.name + ' is larger than 2 GB, too big to check in a browser.'); return; }
        status.progress(0, 'Reading ' + f.name + '…');
        return T.read(f).then(function (buf) { return sums(new Uint8Array(buf), function (x) { status.progress(x, 'Checking ' + f.name + '…'); }); }).then(function (s) {
          last.push(s);
          var box = h('div', { 'class': 'thashes', 'data-out': '' });
          ['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'CRC32'].forEach(function (k) { var b = T.button('Copy', { small: true, onclick: function () { T.copy(s[k], b); } }); box.appendChild(h('div', { 'class': 'thash', 'data-v': s[k] }, [h('b', { text: k }), h('code', { text: s[k] }), b])); });
          list.appendChild(h('div', {}, [h('p', {}, [h('b', { text: f.name }), ' · ' + T.bytes(f.size)]), box]));
          status.ok(files.length > 1 ? 'Checked ' + (n + 1) + ' of ' + files.length + '.' : 'Done. Nothing was uploaded.');
        });
      });
    }, Promise.resolve()).then(mark, function (e) { status.error(e); });
  }
  spot.appendChild(T.card([T.dropzone({ label: 'Choose files to check', icon: '🔍', multiple: true, onFiles: run }), T.field('Compare with', cmp),
    T.row([T.button('Try a sample', { small: true, onclick: function () { cmp.value = '6cd3556deb0da54bca060b4c39479839'; run([new File(['Hello, world!'], 'hello.txt', { type: 'text/plain' })]); } })]), status.el, list]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';

  T.tests['file-hash'] = function () {
    var f = [], te = new TextEncoder();
    function md5s(s) { return new MD5().update(te.encode(s)).hex(); }
    if (md5s('') !== 'd41d8cd98f00b204e9800998ecf8427e') f.push('md5 empty');
    if (md5s('abc') !== '900150983cd24fb0d6963f7d28e17f72') f.push('md5 abc ' + md5s('abc'));
    if (md5s('The quick brown fox jumps over the lazy dog') !== '9e107d9d372bb6826bd81d3542a419d6') f.push('md5 fox');
    var big = 'x'.repeat(1000), m = new MD5(); m.update(te.encode(big.slice(0, 333))); m.update(te.encode(big.slice(333, 600))); m.update(te.encode(big.slice(600)));
    if (m.hex() !== md5s(big)) f.push('md5 in pieces');
    if (((crc32(te.encode('The quick brown fox jumps over the lazy dog')) ^ -1) >>> 0).toString(16) !== '414fa339') f.push('crc32');
    return sums(te.encode('abc')).then(function (s) {
      if (s['SHA-256'] !== 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad') f.push('sha256');
      if (s['SHA-1'] !== 'a9993e364706816aba3e25717850c26c9cd0d89d') f.push('sha1');
      if (s.CRC32 !== '352441c2') f.push('crc32 abc ' + s.CRC32);
      return { ok: !f.length, n: 8, fails: f };
    });
  };
});
