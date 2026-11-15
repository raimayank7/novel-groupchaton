/* Infinity by GroupChatOn — password-strength. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Password strength checker: zxcvbn (Dropbox's open-source estimator) spots names, dates, keyboard patterns and common passwords, and shows how long a guesser would need. Runs on the device; nothing is sent or saved. */
GCOTools.register('password-strength', function (spot, T) {
  var h = T.h, ZX = 'https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js', status = T.status();
  var LABELS = [['Very weak', '#dc2626'], ['Weak', '#ea580c'], ['Fair', '#ca8a04'], ['Strong', '#16a34a'], ['Very strong', '#15803d']];
  function rules(p) {
    return [[p.length >= 12, 'At least 12 characters (' + p.length + ' now)'], [/[a-z]/.test(p), 'A small letter'], [/[A-Z]/.test(p), 'A capital letter'], [/\d/.test(p), 'A number'],
      [/[^A-Za-z0-9]/.test(p), 'A symbol or space'], [!/(.)\1\1/.test(p), 'No character three times in a row']];
  }
  function score(p) { return T.loadScript(ZX).then(function () { return window.zxcvbn(p.slice(0, 100)); }); }
  var pw = h('input', { type: 'password', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Password to test', placeholder: 'Type a password to test' });
  var eye = T.button('Show', { small: true, onclick: function () { pw.type = pw.type === 'password' ? 'text' : 'password'; eye.textContent = pw.type === 'password' ? 'Show' : 'Hide'; } });
  var bar = h('span'), meter = h('div', { 'class': 'tmeter', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '4', 'aria-label': 'Strength' }, [bar]);
  var out = h('div', { 'data-out': '', style: 'display:grid;gap:10px;min-width:0' }), seq = 0;
  function draw() {
    var p = pw.value, tok = ++seq;
    out.innerHTML = ''; bar.style.width = '0';
    if (!p) { status.info('Type a password. It is checked on this device and never sent or saved.'); return Promise.resolve(null); }
    if (!window.zxcvbn) status.info('Loading the checker (about 800 KB, only the first time)…');
    return score(p).then(function (r) {
      if (tok !== seq) return null;
      var L = LABELS[r.score];
      bar.style.width = (r.score + 1) * 20 + '%'; bar.style.background = L[1]; meter.setAttribute('aria-valuenow', String(r.score));
      status.clear();
      out.appendChild(h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat' }, [h('b', { text: L[0], style: 'color:' + L[1] }), h('span', { text: 'Strength ' + r.score + ' of 4' })]),
        h('div', { 'class': 'tstat' }, [h('b', { text: r.crack_times_display.offline_slow_hashing_1e4_per_second }), h('span', { text: 'to crack if a site’s data leaks (well protected)' })]),
        h('div', { 'class': 'tstat' }, [h('b', { text: r.crack_times_display.offline_fast_hashing_1e10_per_second }), h('span', { text: 'to crack if badly protected (fast hash)' })]),
        h('div', { 'class': 'tstat' }, [h('b', { text: r.crack_times_display.online_throttled_100_per_hour }), h('span', { text: 'by guessing on a login page' })])]));
      var tips = [];
      if (r.feedback.warning) tips.push('⚠️ ' + r.feedback.warning);
      r.feedback.suggestions.forEach(function (s) { tips.push('💡 ' + s); });
      var pats = r.sequence.filter(function (m) { return m.pattern !== 'bruteforce'; }).map(function (m) {
        return '“' + m.token + '” ' + ({ dictionary: m.l33t ? 'is a common word with letters swapped for symbols' : m.reversed ? 'is a common word written backwards' : 'is in common password and word lists', spatial: 'is a keyboard pattern', repeat: 'is a repeat', sequence: 'is a sequence', regex: 'looks like a year', date: 'looks like a date' }[m.pattern] || 'is a known pattern');
      });
      if (pats.length) tips.push('🔎 ' + pats.slice(0, 4).join('; ') + '.');
      if (tips.length) out.appendChild(h('ul', { 'class': 'tlist', style: 'margin:0;padding-left:20px' }, tips.map(function (t) { return h('li', { text: t }); })));
      out.appendChild(h('div', { 'class': 'tchecks' }, rules(p).map(function (x) { return h('span', { 'class': x[0] ? 'tin-c' : 'tout-c', style: 'display:block', text: (x[0] ? '✓ ' : '✕ ') + x[1] }); })));
      return r;
    }).catch(status.error);
  }
  pw.addEventListener('input', draw);
  spot.appendChild(T.card([T.field('Password', h('div', { 'class': 'tpass' }, [pw, eye])), meter, status.el, out,
    T.row([T.button('Try a sample', { small: true, onclick: function () { pw.value = 'Summer2024!'; pw.type = 'text'; eye.textContent = 'Hide'; draw(); } })]),
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: '🔒 Checked on this device with the open-source zxcvbn library. Nothing you type is sent, saved or logged. Want to know if it was leaked? Use “Was my password leaked?”.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['password-strength'] = function () {
    var f = [], r = rules('aaaBBB111!!!xyz');
    if (r.filter(function (x) { return x[0]; }).length !== 5 || r[5][0]) f.push('rules');
    return Promise.all(['password', 'Summer2024!', 'correct horse battery staple', 'qwerty123', 'k#8Vq!2zL@9wR4p'].map(score)).then(function (s) {
      var sc = s.map(function (x) { return x.score; });
      if (sc[0] !== 0 || sc[1] > 2 || sc[2] < 3 || sc[3] > 1 || sc[4] !== 4) f.push('scores ' + sc.join(','));
      if (!s[3].sequence.some(function (m) { return m.pattern === 'dictionary' || m.pattern === 'spatial'; })) f.push('pattern');
      return { ok: !f.length, n: 4, fails: f };
    });
  };
});
