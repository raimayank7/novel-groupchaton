/* Infinity by GroupChatOn — breach-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Was my password leaked? Checks a password against the Have I Been Pwned list of hundreds of millions of leaked passwords using k-anonymity: only the first 5 characters of its SHA-1 hash leave the device. */
GCOTools.register('breach-check', function (spot, T) {
  var h = T.h, API = 'https://api.pwnedpasswords.com/range/', status = T.status();
  function sha1(text) {
    return crypto.subtle.digest('SHA-1', new TextEncoder().encode(text)).then(function (b) { return [].map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').toUpperCase(); });
  }
  function count(body, suffix) {
    var lines = body.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) { var p = lines[i].split(':'); if (p[0].trim().toUpperCase() === suffix) return +p[1] || 0; }
    return 0;
  }
  function check(pw) {
    return sha1(pw).then(function (hash) {
      var prefix = hash.slice(0, 5), suffix = hash.slice(5);
      return fetch(API + prefix, { headers: { 'Add-Padding': 'true' }, credentials: 'omit', cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('The leak database answered ' + r.status + '. Try again in a minute.');
        return r.text();
      }).then(function (body) { return { hash: hash, prefix: prefix, n: count(body, suffix), ranges: body.split('\n').length }; });
    });
  }
  var pw = h('input', { type: 'password', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Password to check', placeholder: 'Type the password to check' });
  var eye = T.button('Show', { small: true, onclick: function () { pw.type = pw.type === 'password' ? 'text' : 'password'; eye.textContent = pw.type === 'password' ? 'Show' : 'Hide'; } });
  var out = h('div', { 'data-out': '', style: 'display:grid;gap:10px;min-width:0' });
  function run() {
    out.innerHTML = '';
    if (!pw.value) { status.error('Type a password first.'); return Promise.resolve(); }
    if (!window.crypto || !crypto.subtle) { status.error('This browser cannot make the secure hash here. Open the page over https.'); return Promise.resolve(); }
    status.info('Checking…');
    return check(pw.value).then(function (r) {
      if (r.n) {
        status.error('⚠️ Leaked! This password appears ' + r.n.toLocaleString() + ' time' + (r.n === 1 ? '' : 's') + ' in known data breaches.');
        out.appendChild(h('p', { 'class': 'tnote', text: 'Stop using it everywhere, now. Attackers try leaked passwords first on email, banking and social media. Change it on every account where you used it, and turn on two-step verification.' }));
      } else {
        status.ok('✓ Good news: this password is not in any known breach.');
        out.appendChild(h('p', { 'class': 'tnote', text: 'That does not make it strong: check its strength too, and use a different password for every account.' }));
      }
      out.appendChild(h('div', { 'class': 'tkv' }, [h('div', {}, [h('span', { text: 'Sent to the database' }), h('code', { text: r.prefix + ' (first 5 of 40 hash characters)' }), h('span')]),
        h('div', {}, [h('span', { text: 'Kept on your device' }), h('code', { text: r.hash.slice(0, 5) + '·' + r.hash.slice(5) }), h('span')]),
        h('div', {}, [h('span', { text: 'Matches compared here' }), h('code', { text: r.ranges.toLocaleString() + ' leaked hashes start with ' + r.prefix }), h('span')])]));
      return r;
    }).catch(function (e) { status.error(/fetch|network/i.test(e.message) ? 'Could not reach the leak database. Check your connection.' : e.message); });
  }
  pw.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
  spot.appendChild(T.card([T.field('Password', h('div', { 'class': 'tpass' }, [pw, eye])),
    T.row([T.button('Check for leaks', { primary: true, onclick: run }), T.button('Try a sample', { small: true, onclick: function () { pw.value = 'password123'; pw.type = 'text'; eye.textContent = 'Hide'; run(); } })]),
    status.el, out,
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: '🔒 Your password never leaves this device. It is turned into a SHA-1 hash here, and only the first 5 characters of that hash are sent to Have I Been Pwned (api.pwnedpasswords.com). The answer is a list of hundreds of similar hashes, and the match is checked on your device, so nobody learns your password or even whether it was found.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['breach-check'] = function () {
    var f = [];
    if (count('0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:3861493\r\nFFFFF0000000000000000000000000000AB:0', '1E4C9B93F3F0682250B6CF8331B7EE68FD8') !== 3861493) f.push('count');
    if (count('ABC:0\nDEF:2', 'XYZ') !== 0 || count('abc:4', 'ABC') !== 4) f.push('count missing / case');
    return Promise.all([sha1('password'), sha1(''), sha1('नमस्ते')]).then(function (x) {
      if (x[0] !== '5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8' || x[1] !== 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709' || x[2].length !== 40) f.push('sha1 ' + x.join(' '));
      return { ok: !f.length, n: 3, fails: f };
    });
  };
});
