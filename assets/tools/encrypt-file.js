/* Infinity by GroupChatOn — encrypt-file. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Encrypt any file with a password: AES-256-GCM with a key from PBKDF2-SHA-256 (310,000 rounds), done in the browser. The file name is locked inside too. */
GCOTools.register('encrypt-file', function (spot, T) {
  var h = T.h, MAGIC = new TextEncoder().encode('GCOENC1'), ROUNDS = 310000, te = new TextEncoder(), td = new TextDecoder();
  function key(pw, salt) {
    return crypto.subtle.importKey('raw', te.encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: ROUNDS, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function isLocked(b) { for (var i = 0; i < MAGIC.length; i++) if (b[i] !== MAGIC[i]) return false; return b.length >= MAGIC.length + 28 + 16; }
  // locked file = "GCOENC1" + salt (16) + iv (12) + AES-GCM of [name length (2)][name][file bytes]
  function lock(bytes, name, pw) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), nm = te.encode(String(name).slice(0, 200));
    var plain = new Uint8Array(2 + nm.length + bytes.length); plain[0] = nm.length >> 8; plain[1] = nm.length & 255; plain.set(nm, 2); plain.set(bytes, 2 + nm.length);
    return key(pw, salt).then(function (k) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, plain); }).then(function (ct) {
      var out = new Uint8Array(MAGIC.length + 28 + ct.byteLength); out.set(MAGIC, 0); out.set(salt, MAGIC.length); out.set(iv, MAGIC.length + 16); out.set(new Uint8Array(ct), MAGIC.length + 28); return out;
    });
  }
  function unlock(bytes, pw) {
    if (!isLocked(bytes)) return Promise.reject(new Error('This file was not locked with this tool.'));
    var o = MAGIC.length;
    return key(pw, bytes.subarray(o, o + 16)).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(o + 16, o + 28) }, k, bytes.subarray(o + 28)); })
      .then(function (p) { var u = new Uint8Array(p), n = u[0] << 8 | u[1]; return { name: td.decode(u.subarray(2, 2 + n)) || 'unlocked-file', bytes: u.subarray(2 + n) }; }, function () { throw new Error('Wrong password, or the locked file was changed or damaged.'); });
  }
  if (!window.crypto || !crypto.subtle) { spot.appendChild(T.card([h('p', { 'class': 'tstatus is-error', text: 'Your browser cannot encrypt here. Open this page over https in an up-to-date browser.' })])); return; }
  var pw = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'Choose a strong password' }), pw2 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'Type it again' });
  var showPw = h('label', { 'class': 'tcheck' }, [h('input', { type: 'checkbox', onchange: function (e) { pw.type = pw2.type = e.target.checked ? 'text' : 'password'; } }), ' Show password']);
  var again = T.field('Confirm password (to lock)', pw2), res = T.results(), status = T.status(), file = null, fileNote = h('p', { 'class': 'tnote' });
  // the shared results box has an auto-width column that is too wide for phones: keep it inside the card
  function fit() {
    [res.el].concat([].slice.call(res.el.querySelectorAll('.tresults-grid'))).forEach(function (e) { e.style.gridTemplateColumns = 'minmax(0, 1fr)'; });
    [].slice.call(res.el.querySelectorAll('.tresult-name')).forEach(function (e) { e.style.minWidth = '0'; e.style.overflowWrap = 'anywhere'; e.style.flex = '1'; });
    [].slice.call(res.el.querySelectorAll('.tresults-head')).forEach(function (e) { e.style.flexWrap = 'wrap'; });
  }
  function go() {
    if (!file) { status.error('Choose a file first.'); return; }
    if (!pw.value) { status.error('Type a password first.'); return; }
    if (file.size > 1.5e9) { status.error('Files over 1.5 GB are too big to encrypt in a browser.'); return; }
    res.clear(); status.progress(0.2, 'Working… (the password is stretched 310,000 times, so this takes a moment)');
    T.read(file).then(function (buf) {
      var b = new Uint8Array(buf);
      if (isLocked(b)) return unlock(b, pw.value).then(function (r) { res.set([{ name: r.name, blob: new Blob([r.bytes]), icon: '🔓' }]); fit(); status.ok('Unlocked: here is ' + r.name + '.'); });
      if (pw.value !== pw2.value) throw new Error('The two passwords do not match.');
      if (pw.value.length < 8) status.info('Tip: a password of 12+ characters (or 4 random words) is much harder to guess.');
      return lock(b, file.name, pw.value).then(function (out) { res.set([{ name: file.name + '.locked', blob: new Blob([out], { type: 'application/octet-stream' }), icon: '🔒' }]); fit(); status.ok('Locked. Only someone with the password can open it. There is no way to recover a forgotten password.'); });
    }).catch(function (e) { status.error(e); });
  }
  function take(fs) {
    file = fs[0]; res.clear(); status.clear();
    T.read(file.slice(0, 64)).then(function (b) { var locked = isLocked(new Uint8Array(b)) || file.size < 64 && /\.locked$/.test(file.name); again.hidden = locked; btn.textContent = locked ? 'Unlock file' : 'Lock file'; fileNote.textContent = file.name + ' · ' + T.bytes(file.size) + (locked ? ' · locked file: type its password to unlock' : ''); });
  }
  var btn = T.button('Lock file', { primary: true, onclick: go });
  spot.appendChild(T.card([T.dropzone({ label: 'Choose a file to lock or unlock', icon: '🔐', onFiles: take }), fileNote, h('div', { 'class': 'tgrid2' }, [T.field('Password', pw), again]), showPw,
    T.row([btn, T.button('Try a sample', { small: true, onclick: function () { pw.value = pw2.value = 'sample-pass-2026'; take([new File(['Locker code 4471. Spare key is with Riya.'], 'secret-note.txt', { type: 'text/plain' })]); setTimeout(go, 50); } })]),
    status.el, res.el, h('p', { 'class': 'tnote', text: 'Locked files end in .locked and can be opened only here (on any device) with the password. Your file and password never leave this browser.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';

  T.tests['encrypt-file'] = function () {
    var f = [], data = te.encode('नमस्ते 👋 file body ' + 'x'.repeat(500));
    return lock(data, 'रिपोर्ट 2026.pdf', 'pass word').then(function (enc) {
      if (!isLocked(enc)) f.push('magic');
      if (enc.length !== MAGIC.length + 28 + 2 + te.encode('रिपोर्ट 2026.pdf').length + data.length + 16) f.push('length ' + enc.length);
      return unlock(enc, 'pass word').then(function (r) {
        if (r.name !== 'रिपोर्ट 2026.pdf') f.push('name ' + r.name);
        if (td.decode(r.bytes) !== td.decode(data)) f.push('round trip');
        return unlock(enc, 'wrong');
      }).then(function () { f.push('wrong password opened it'); }, function (e) { if (!/Wrong password/.test(e.message)) f.push('wrong pw msg ' + e.message); })
        .then(function () { var bad = enc.slice(); bad[bad.length - 5] ^= 1; return unlock(bad, 'pass word'); }).then(function () { f.push('tampered file opened'); }, function () {});
    }).then(function () { return unlock(te.encode('plain file that is long enough to pass the size check, really long'), 'x').then(function () { f.push('plain accepted'); }, function (e) { if (!/not locked/.test(e.message)) f.push('plain msg'); }); })
      .then(function () { return { ok: !f.length, n: 6, fails: f }; });
  };
});
