/* Infinity by GroupChatOn — 2fa. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* 2FA code generator (TOTP, RFC 6238): the same 6-digit codes as Google Authenticator, from a secret key, made on the device. */
GCOTools.register('2fa', function (spot, T) {
  var h = T.h, status = T.status();
  function b32(s) {
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', bits = '', out = [];
    s = s.toUpperCase().replace(/[\s=\-]/g, '');
    for (var i = 0; i < s.length; i++) { var v = A.indexOf(s[i]); if (v < 0) throw new Error('The secret key can only have letters A–Z and digits 2–7.'); bits += ('00000' + v.toString(2)).slice(-5); }
    for (var j = 0; j + 8 <= bits.length; j += 8) out.push(parseInt(bits.slice(j, j + 8), 2));
    if (out.length < 10) throw new Error('That secret key is too short.');
    return new Uint8Array(out);
  }
  function parse(v) {
    v = v.trim(); var o = { secret: v, digits: 6, period: 30, algo: 'SHA-1', label: '' };
    if (/^otpauth:\/\//i.test(v)) {
      var u = new URL(v), q = u.searchParams;
      o.secret = q.get('secret') || ''; o.digits = +q.get('digits') || 6; o.period = +q.get('period') || 30;
      o.algo = ({ SHA256: 'SHA-256', SHA512: 'SHA-512' })[(q.get('algorithm') || '').toUpperCase()] || 'SHA-1';
      o.label = decodeURIComponent(u.pathname.replace(/^\/+(totp\/)?/i, ''));
    }
    return o;
  }
  function totp(keyBytes, time, digits, period, algo) {
    var ctr = Math.floor(time / period), msg = new Uint8Array(8);
    for (var i = 7; i >= 0; i--) { msg[i] = ctr & 255; ctr = Math.floor(ctr / 256); }
    return crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: algo || 'SHA-1' }, false, ['sign']).then(function (k) { return crypto.subtle.sign('HMAC', k, msg); }).then(function (sig) {
      var b = new Uint8Array(sig), off = b[b.length - 1] & 15;
      var n = ((b[off] & 127) << 24 | b[off + 1] << 16 | b[off + 2] << 8 | b[off + 3]) % Math.pow(10, digits);
      return String(n).padStart(digits, '0');
    });
  }
  if (!window.crypto || !crypto.subtle) { spot.appendChild(T.card([h('p', { 'class': 'tstatus is-error', text: 'Your browser cannot make codes here. Open this page over https in an up-to-date browser.' })])); return; }
  var sec = h('input', { type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'e.g. JBSW Y3DP EHPK 3PXP, or an otpauth:// link', 'class': 'tmono' });
  var code = h('div', { 'class': 'tbig tmono', 'aria-live': 'polite', text: '— — —' }), left = h('div', { 'class': 'tstatus' }), bar = h('div', { 'class': 'tprogress' }, [h('i')]);
  var cur = '', tick = 0;
  function draw() {
    if (!sec.isConnected && tick) { clearInterval(tick); return; }
    var o, key;
    if (!sec.value.trim()) { code.textContent = '— — —'; left.textContent = 'Paste the secret key from the site’s “set up authenticator app” page (often under “Can’t scan the QR code?”).'; return; }
    try { o = parse(sec.value); key = b32(o.secret); } catch (e) { code.textContent = '— — —'; left.textContent = ''; status.error(e); return; }
    status.clear();
    var now = Date.now() / 1000, rest = o.period - Math.floor(now % o.period);
    left.textContent = (o.label ? o.label + ' · ' : '') + 'new code in ' + rest + ' s';
    bar.firstChild.style.width = (100 * rest / o.period) + '%';
    totp(key, now, o.digits, o.period, o.algo).then(function (c) { cur = c; code.textContent = c.replace(/(\d{3})(?=\d)/, '$1 '); }, status.error);
  }
  sec.addEventListener('input', draw);
  spot.appendChild(T.card([T.field('Secret key (setup key)', sec, 'stays on this device; nothing is saved or sent'), code, bar, left,
    T.row([T.button('Copy code', { primary: true, onclick: function (e) { if (cur) T.copy(cur, e.currentTarget); } })]), status.el,
    h('p', { 'class': 'tstatus', text: 'Use this to test or recover your own accounts. For daily sign-ins, a phone authenticator app is safer: anyone with this key can make your codes.' })]));
  tick = setInterval(draw, 1000); draw();
  T.tests['2fa'] = function () {
    var f = [], key = b32('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');   // RFC 6238 test secret "12345678901234567890"
    return Promise.all([totp(key, 59, 8, 30), totp(key, 1111111109, 8, 30), totp(key, 59, 6, 30)]).then(function (r) {
      if (r[0] !== '94287082') f.push('t=59 ' + r[0]);
      if (r[1] !== '07081804') f.push('t=1111111109 ' + r[1]);
      if (r[2] !== '287082') f.push('6 digits ' + r[2]);
      var p = parse('otpauth://totp/Example:me@x.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&digits=8');
      if (p.secret !== 'JBSWY3DPEHPK3PXP' || p.digits !== 8 || p.label !== 'Example:me@x.com') f.push('uri ' + JSON.stringify(p));
      try { b32('ABC1'); f.push('bad key accepted'); } catch (e) {}
      return { ok: !f.length, n: 5, fails: f };
    });
  };
});
