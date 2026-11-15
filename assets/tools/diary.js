/* Infinity by GroupChatOn — diary. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* A private diary, encrypted on this device with your password (AES-256-GCM, key from PBKDF2). Without the password nobody can read it, not even us. */
GCOTools.register('diary', function (spot, T) {
  var h = T.h, V = T.vault('diary', { v: 1, salt: '', iv: '', ct: '', hint: '' }), db = V.data();
  var ITER = 250000, key = null, entries = [], editing = null, idle = null;
  var enc = new TextEncoder(), dec = new TextDecoder();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function b64(u) { var s = ''; for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function rnd(n) { var u = new Uint8Array(n); crypto.getRandomValues(u); return u; }
  function derive(pw, salt) {
    return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: ITER, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function seal() {   // encrypt every entry with a fresh IV and save
    var iv = rnd(12);
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(JSON.stringify(entries))).then(function (ct) {
      db = V.data(); db.iv = b64(iv); db.ct = b64(new Uint8Array(ct)); return V.save(db);
    });
  }
  function create(pw, hint) {
    var salt = rnd(16);
    return derive(pw, salt).then(function (k) { key = k; entries = []; db = { v: 1, salt: b64(salt), iv: '', ct: '', hint: hint || '' }; V.save(db); return seal(); });
  }
  function unlock(pw) {
    db = V.data();
    return derive(pw, unb64(db.salt)).then(function (k) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(db.iv) }, k, unb64(db.ct)).then(function (pt) { key = k; entries = JSON.parse(dec.decode(pt)); }, function () { throw new Error('Wrong password.'); });
    });
  }
  function lock() { key = null; entries = []; editing = null; draw(); }
  function poke() { clearTimeout(idle); if (key) idle = setTimeout(lock, 10 * 60 * 1000); }   // locks itself after 10 minutes without use
  var body = h('div', { 'class': 'tool-app-opts' }), msg = T.status();
  body.addEventListener('input', poke); body.addEventListener('click', poke);
  function pwInput(ph) { return h('input', { type: 'password', autocomplete: 'off', placeholder: ph || 'Password' }); }
  function draw() {
    db = V.data(); body.innerHTML = ''; msg.clear();
    if (!key && !db.salt) {
      var p1 = pwInput('Choose a password'), p2 = pwInput('Type it again'), hint = h('input', { type: 'text', placeholder: 'A hint only you understand (optional, not encrypted)' });
      body.appendChild(h('p', { text: 'Set a password to start your private diary. Every entry is encrypted on this device before it is saved.' }));
      body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Password', p1), T.field('Confirm password', p2), T.field('Password hint', hint)]));
      body.appendChild(h('p', { 'class': 'tnote', text: '⚠️ There is no “forgot password”. Nobody, including us, can open the diary without it. Write it down somewhere safe.' }));
      body.appendChild(T.row([T.button('Create my diary', { primary: true, onclick: function () {
        if (p1.value.length < 6) { msg.error('Use at least 6 characters.'); return; }
        if (p1.value !== p2.value) { msg.error('The two passwords do not match.'); return; }
        msg.info('Locking it up…'); create(p1.value, hint.value.trim()).then(function () { draw(); poke(); }, msg.error);
      } })]));
      body.appendChild(msg.el); return;
    }
    if (!key) {
      var pw = pwInput(), go = function () { msg.info('Unlocking…'); unlock(pw.value).then(function () { draw(); poke(); }, function (e) { msg.error(e); pw.select(); }); };
      pw.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      body.appendChild(h('p', { text: '🔒 Your diary is locked.' }));
      body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Password', pw, db.hint ? 'Hint: ' + db.hint : null)]));
      body.appendChild(T.row([T.button('Unlock', { primary: true, onclick: go })])); body.appendChild(msg.el); return;
    }
    var e = entries.filter(function (x) { return x.id === editing; })[0] || {};
    var d = h('input', { type: 'date', value: e.d || iso() }), t = h('input', { type: 'text', value: e.t || '', placeholder: 'Title (optional)' }), x = h('textarea', { rows: '8', placeholder: 'Dear diary…' });
    var mood = e.m || '🙂', ms = T.seg(['😄', '🙂', '😐', '😔', '😠'].map(function (m) { return [m, m]; }), mood, function (v) { mood = v; });
    x.value = e.x || '';
    body.appendChild(T.row([T.button('🔒 Lock now', { small: true, onclick: lock }), T.button('Change password', { small: true, onclick: function () { changePw(); } })]));
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Date', d), T.field('Title', t)])); body.appendChild(T.field('Mood', ms)); body.appendChild(x);
    body.appendChild(T.row([T.button(editing ? 'Save changes' : 'Save entry', { primary: true, onclick: function () {
      if (!x.value.trim()) { x.focus(); return; }
      var n = editing ? e : { id: uid() }; n.d = d.value || iso(); n.t = t.value.trim(); n.x = x.value; n.m = mood; n.u = Date.now();
      if (!editing) entries.push(n);
      editing = null; seal().then(function () { draw(); msg.ok('Saved and encrypted.'); });
    } }), editing ? T.button('Cancel', { small: true, onclick: function () { editing = null; draw(); } }) : null]));
    body.appendChild(msg.el);
    var q = h('input', { type: 'search', placeholder: 'Search your diary…' }), list = h('div', { 'class': 'tlist', 'data-out': '' });
    function show() {
      list.innerHTML = ''; var s = q.value.trim().toLowerCase();
      entries.filter(function (y) { return !s || (y.t + ' ' + y.x).toLowerCase().indexOf(s) >= 0; }).sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : b.u - a.u; }).forEach(function (y) {
        var open = false, full = h('p', { style: 'white-space:pre-wrap;margin:8px 0 0;width:100%', hidden: true, text: y.x });
        list.appendChild(h('div', { 'class': 'titem', style: 'flex-wrap:wrap' }, [h('span', { 'class': 'titem-ic', text: y.m || '📝' }),
          h('span', { 'class': 'titem-main', style: 'cursor:pointer', onclick: function () { open = !open; full.hidden = !open; } }, [h('b', { text: y.t || y.x.split('\n')[0].slice(0, 60) }), h('small', { text: new Date(y.d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) })]),
          h('button', { type: 'button', 'aria-label': 'Edit', title: 'Edit', text: '✎', onclick: function () { editing = y.id; draw(); } }),
          h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this entry?')) { entries = entries.filter(function (z) { return z !== y; }); seal().then(draw); } } }), full]));
      });
      if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: entries.length ? 'Nothing matches.' : 'Your entries will appear here, newest first.' }));
    }
    q.addEventListener('input', show); body.appendChild(h('h3', { text: entries.length + (entries.length === 1 ? ' entry' : ' entries') })); body.appendChild(q); body.appendChild(list); show();
    body.appendChild(T.row([T.button('Download as text (not encrypted)', { small: true, onclick: function () {
      if (!confirm('This saves your diary as a plain text file that anyone with the file can read. Continue?')) return;
      T.download(new Blob([entries.slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; }).map(function (y) { return y.d + ' ' + (y.m || '') + (y.t ? ' · ' + y.t : '') + '\n' + y.x; }).join('\n\n---\n\n')], { type: 'text/plain' }), 'my-diary.txt');
    } })]));
  }
  function changePw() {
    body.innerHTML = '';
    var p1 = pwInput('New password'), p2 = pwInput('Type it again');
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('New password', p1), T.field('Confirm', p2)]));
    body.appendChild(T.row([T.button('Change password', { primary: true, onclick: function () {
      if (p1.value.length < 6 || p1.value !== p2.value) { msg.error(p1.value.length < 6 ? 'Use at least 6 characters.' : 'The two passwords do not match.'); return; }
      var keepE = entries, salt = rnd(16);
      derive(p1.value, salt).then(function (k) { key = k; entries = keepE; db = V.data(); db.salt = b64(salt); V.save(db); return seal(); }).then(function () { draw(); msg.ok('Password changed.'); });
    } }), T.button('Cancel', { small: true, onclick: draw })]));
    body.appendChild(msg.el);
  }
  spot.appendChild(T.card([V.bar(function () { lock(); }), body,
    h('p', { 'class': 'tnote', text: 'Encrypted with AES-256-GCM using a key made from your password (PBKDF2, 250,000 rounds). Backups stay encrypted. The diary locks itself after 10 minutes without use.' })]));
  if (!(window.crypto && crypto.subtle)) { body.appendChild(h('p', { 'class': 'tstatus is-error', text: 'This browser cannot encrypt here. Open the page over https in an up-to-date browser.' })); }
  else V.ready.then(draw);

  T.tests['diary'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ v: 1, salt: '', iv: '', ct: '', hint: '' });
    return create('test-pass-123', '').then(function () {
      entries.push({ id: 'x', d: '2026-10-01', t: 'Secret', x: 'The hidden words', m: '🙂', u: 1 }); return seal();
    }).then(function () {
      var raw = JSON.stringify(V.data());
      if (raw.indexOf('hidden words') >= 0 || raw.indexOf('Secret') >= 0) fails.push('saved text is readable');
      key = null; entries = [];
      return unlock('wrong-pass').then(function () { fails.push('wrong password opened it'); }, function () {});
    }).then(function () { return unlock('test-pass-123'); }).then(function () {
      if (entries.length !== 1 || entries[0].x !== 'The hidden words') fails.push('decrypted ' + JSON.stringify(entries));
    }, function (e) { fails.push('right password failed: ' + e.message); }).then(function () {
      return V.save(keep).then(function () { lock(); return { ok: !fails.length, n: 3, fails: fails }; });
    });
  }
});
