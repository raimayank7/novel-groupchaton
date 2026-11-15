/* Infinity by GroupChatOn — char-limit. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Character limits: one text checked against X, Instagram, Facebook, LinkedIn, YouTube, SMS, Google titles and more, as you type. */
GCOTools.register('char-limit', function (spot, T) {
  var h = T.h;
  var GSM = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà', EXT = '^{}\\[~]|€\f';
  function chars(s) { return Array.from(s).length; }
  // SMS: 160 plain characters (153 per part when split); any emoji or non-Latin letter switches the whole message to 70 (67 per part)
  function sms(s) {
    var gsm = true, n = 0;
    Array.from(s).forEach(function (c) { if (GSM.indexOf(c) >= 0) n++; else if (EXT.indexOf(c) >= 0) n += 2; else gsm = false; });
    if (!gsm) { n = 0; Array.from(s).forEach(function (c) { n += c.codePointAt(0) > 0xFFFF ? 2 : 1; }); }
    var one = gsm ? 160 : 70, per = gsm ? 153 : 67;
    return { gsm: gsm, n: n, parts: n === 0 ? 0 : n <= one ? 1 : Math.ceil(n / per), one: one };
  }
  // X (Twitter) counts Latin, Indian, Arabic and most other scripts as 1 per letter, Chinese, Japanese, Korean and emoji as 2, and every link as 23
  function xcount(s) {
    var n = 0;
    s = s.replace(/https?:\/\/\S+/g, function () { n += 23; return ''; });
    var seg = window.Intl && Intl.Segmenter ? Array.from(new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s), function (x) { return x.segment; }) : Array.from(s);
    seg.forEach(function (g) {
      if (/\p{Extended_Pictographic}/u.test(g)) { n += 2; return; }
      Array.from(g.normalize('NFC')).forEach(function (ch) { var c = ch.codePointAt(0); n += (c <= 4351 || (c >= 8192 && c <= 8205) || (c >= 8208 && c <= 8223) || (c >= 8242 && c <= 8247)) ? 1 : 2; });
    });
    return n;
  }
  var LIMITS = [
    ['X (Twitter) post', 280, 'x'], ['Threads post', 500], ['Bluesky post', 300], ['Mastodon post', 500],
    ['Instagram caption', 2200], ['Instagram bio', 150], ['Facebook post', 63206], ['LinkedIn post', 3000], ['LinkedIn headline', 220],
    ['YouTube title', 100], ['YouTube description', 5000], ['TikTok caption', 4000], ['Pinterest pin title', 100], ['Pinterest description', 500],
    ['WhatsApp status text', 700], ['WhatsApp about', 139], ['SMS', 160, 'sms'],
    ['Google title (about)', 60, 'soft'], ['Meta description (about)', 160, 'soft'], ['Google Business post', 1500], ['Email subject (shows fully)', 50, 'soft']
  ];
  var box = h('textarea', { rows: '6', placeholder: 'Type or paste your post, caption, title or message…', 'aria-label': 'Your text' });
  box.value = T.store.get('charlimit-in', '');
  var stats = h('div', { 'class': 'tstats' }), list = h('div', { style: 'display:grid;gap:8px' });
  function stat(k, v) { return h('div', { 'class': 'tstat' }, [h('b', { text: String(v) }), h('span', { text: k })]); }
  function update() {
    var s = box.value, n = chars(s), m = sms(s);
    T.store.set('charlimit-in', s.slice(0, 70000));
    stats.innerHTML = '';
    [['Characters', n], ['Without spaces', chars(s.replace(/\s/g, ''))], ['Words', (s.match(/\S+/g) || []).length], ['Lines', s ? s.split(/\n/).length : 0], ['X count', xcount(s)], ['SMS parts', m.parts]].forEach(function (x) { stats.appendChild(stat(x[0], x[1])); });
    list.innerHTML = '';
    LIMITS.forEach(function (L) {
      var used = L[2] === 'x' ? xcount(s) : L[2] === 'sms' ? m.n : n, lim = L[2] === 'sms' ? m.one : L[1], left = lim - used, over = left < 0;
      var note = L[2] === 'sms' ? (m.gsm ? 'plain text' : 'emoji or non-Latin text: 70 per message') + (m.parts > 1 ? ' · sent as ' + m.parts + ' parts' : '') : L[2] === 'soft' ? 'longer may be cut off' : '';
      var bar = h('div', { 'class': 'tmeter' }, [h('span', { style: 'width:' + Math.min(100, lim ? used / lim * 100 : 0).toFixed(1) + '%;background-color:' + (over ? '#dc2626' : used / lim > 0.9 ? '#f59e0b' : '#16a34a') })]);
      list.appendChild(h('div', { style: 'display:grid;gap:4px;padding:8px 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg)' }, [
        h('div', { 'class': 'trow trow-split' }, [h('b', { text: L[0] }), h('span', { 'data-out': '', style: 'font-variant-numeric:tabular-nums;font-weight:700;color:' + (over ? '#dc2626' : 'inherit'), text: used + ' / ' + lim + (over ? '  (' + -left + ' over)' : '  (' + left + ' left)') })]),
        bar, note ? h('small', { style: 'color:var(--muted)', text: note }) : null]));
    });
  }
  box.addEventListener('input', update);
  spot.appendChild(T.card([T.field('Your text', box), T.row([T.button('Try a sample', { small: true, onclick: function () { box.value = 'Big news! 🎉 Our new on-device tools are live: 300+ free tools, no sign-up. Try them at https://example.com and tell us what to build next.'; update(); } }),
    T.button('Clear', { small: true, onclick: function () { box.value = ''; update(); box.focus(); } })]), stats, list,
    h('p', { 'class': 'tnote', text: 'Limits change from time to time; these were checked in 2026. Google shows titles by width, so about 60 characters is a guide, not a hard rule.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  update();
  T.tests['char-limit'] = function () {
    var f = [], a = sms('hello'), b = sms(new Array(162).join('a')), c = sms('Price ₹100'), d = sms('a{b');
    if (a.parts !== 1 || a.n !== 5 || !a.gsm) f.push('sms short');
    if (b.n !== 161 || b.parts !== 2) f.push('sms 161 ' + JSON.stringify(b));
    if (c.gsm || c.one !== 70) f.push('unicode sms');
    if (d.n !== 4) f.push('extension chars');
    if (xcount('hi https://example.com/a/very/long/link') !== 26) f.push('x link ' + xcount('hi https://example.com/a/very/long/link'));
    if (xcount('नमस्ते') !== 6 || xcount('你好') !== 4) f.push('x scripts ' + xcount('नमस्ते') + '/' + xcount('你好'));
    if (xcount('ok 👍') !== 5) f.push('x emoji ' + xcount('ok 👍'));
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
