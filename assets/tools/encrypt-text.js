/* Infinity by GroupChatOn — encrypt-text. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Encrypt / decrypt text with a password: AES-256-GCM, key from PBKDF2-SHA-256 (310,000 rounds), all in the browser. */
GCOTools.register('encrypt-text', function (spot, T) {
  var h = T.h, PRE = 'GCO1:', ROUNDS = 310000, te = new TextEncoder(), td = new TextDecoder();
  function b64(u) { var s = ''; for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function key(pw, salt) {
    return crypto.subtle.importKey('raw', te.encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: ROUNDS, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function enc(text, pw) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return key(pw, salt).then(function (k) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, te.encode(text)); }).then(function (ct) {
      var all = new Uint8Array(28 + ct.byteLength); all.set(salt, 0); all.set(iv, 16); all.set(new Uint8Array(ct), 28); return PRE + b64(all);
    });
  }
  function dec(text, pw) {
    var s = text.trim().replace(/\s+/g, '');
    if (s.indexOf(PRE) !== 0) return Promise.reject(new Error('This is not text locked by this tool (it should start with ' + PRE + ').'));
    var all; try { all = unb64(s.slice(PRE.length)); } catch (e) { return Promise.reject(new Error('The locked text is damaged or incomplete.')); }
    if (all.length < 29) return Promise.reject(new Error('The locked text is too short: copy all of it.'));
    return key(pw, all.subarray(0, 16)).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.subarray(16, 28) }, k, all.subarray(28)); })
      .then(function (pt) { return td.decode(pt); }, function () { throw new Error('Wrong password, or the locked text was changed.'); });
  }
  if (!window.crypto || !crypto.subtle) { spot.appendChild(T.card([h('p', { 'class': 'tstatus is-error', text: 'Your browser cannot encrypt here. Open this page over https in an up-to-date browser.' })])); return; }
  var pw = h('input', { type: 'password', 'data-opt': 'pw', autocomplete: 'new-password', placeholder: 'Choose a strong password' });
  var show = h('label', { 'class': 'tcheck' }, [h('input', { type: 'checkbox', onchange: function (e) { pw.type = e.target.checked ? 'text' : 'password'; } }), ' Show password']);
  T.transformer(spot, { id: 'encrypt-text', inLabel: 'Text to lock, or locked text to open', live: false, button: 'Lock / unlock', download: 'locked.txt', mono: true,
    sample: 'Locker code 4471. Wi-Fi password: sunflower-2026',
    options: [T.opt.select('dir', 'Do', [['auto', 'Lock plain text, unlock locked text'], ['enc', 'Lock (encrypt)'], ['dec', 'Unlock (decrypt)']], 'auto'), T.field('Password', pw), show],
    note: function (a, b) { return b.indexOf(PRE) === 0 ? 'Locked. Send this text anywhere; only someone with the password can open it. There is no way to recover a forgotten password.' : 'Unlocked.'; },
    run: function (t, o) {
      if (!o.pw) throw new Error('Type a password first.');
      var d = o.dir === 'auto' ? (t.trim().indexOf(PRE) === 0 ? 'dec' : 'enc') : o.dir;
      return d === 'dec' ? dec(t, o.pw) : enc(t, o.pw);
    } });
  T.tests['encrypt-text'] = function () {
    var f = [], msg = 'नमस्ते 👋 secret 123';
    return enc(msg, 'pass word').then(function (c) {
      if (c.indexOf(PRE) !== 0) f.push('prefix');
      return dec(c, 'pass word').then(function (p) { if (p !== msg) f.push('round trip ' + p); return dec(c, 'wrong'); })
        .then(function () { f.push('wrong password opened it'); }, function (e) { if (!/Wrong password/.test(e.message)) f.push('wrong pw msg ' + e.message); });
    }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
