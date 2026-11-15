/* URL Shortener — v.gd (with is.gd as a backup): free, no key, links never expire, and both allow
   requests from other websites. (TinyURL's API now only answers its own site, so it can't be used here.)
   Links made here are kept in the reader's own browser history list.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('shorten', function (spot, T) {
  var h = T.h, status = T.status();
  var SERVICES = ['https://v.gd/create.php', 'https://is.gd/create.php'];
  var long = h('input', { type: 'url', placeholder: 'Paste a long link, e.g. https://…', 'aria-label': 'Long link' });
  var alias = h('input', { type: 'text', placeholder: 'optional, e.g. my_novel', maxlength: '30' });
  var go = T.button('Shorten link', { primary: true, onclick: run });
  var result = h('div', { 'class': 'tresults', hidden: true });
  var hist = h('div', { 'class': 'tresults-grid' });
  var histBox = h('div', { hidden: true }, [h('h3', { text: 'Your recent links (saved in this browser only)' }), hist]);
  spot.appendChild(T.card([T.field('Long link', long), T.field('Custom ending (optional)', alias, 'v.gd/your_word, if it is free. 5–30 letters, numbers or underscores.'),
    T.row([go]), status.el, result, histBox]));
  long.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
  drawHistory();

  function valid(u) { try { var x = new URL(u); return /^https?:$/.test(x.protocol) && /\./.test(x.hostname); } catch (e) { return false; } }
  function ask(i, u, a) {
    var url = SERVICES[i] + '?format=json&logstats=0&url=' + encodeURIComponent(u) + (a ? '&shorturl=' + encodeURIComponent(a) : '');
    return fetch(url, { credentials: 'omit' }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.shorturl) return j.shorturl;
      var msg = j.errormessage || 'The link could not be shortened.';
      if (j.errorcode === 2 && /already/i.test(msg)) msg = 'That custom ending is taken. Try another one.';
      var err = new Error(msg); err.final = true; throw err;         // a real answer: don't try the backup
    }).catch(function (e) {
      if (!e.final && i + 1 < SERVICES.length) return ask(i + 1, u, a);   // network trouble: try the backup
      throw e.final ? e : new Error('The shortening service could not be reached. Check your connection and try again.');
    });
  }
  function run() {
    var u = long.value.trim();
    if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
    if (!valid(u)) return status.error('That doesn’t look like a web link. It should start with https://');
    var a = alias.value.trim();
    if (a && !/^[A-Za-z0-9_]{5,30}$/.test(a)) return status.error('The custom ending needs 5–30 letters, numbers or underscores (no dashes or spaces).');
    go.disabled = true; status.info('Shortening…');
    ask(0, u, a).then(function (short) {
      show(short, u);
      var list = T.store.get('short-links', []);
      list.unshift({ s: short, l: u, t: Date.now() });
      T.store.set('short-links', list.slice(0, 20));
      drawHistory(); status.ok('Done! Your short link is ready.'); long.value = ''; alias.value = '';
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function row(s, l) {
    var copy = T.button('Copy', { small: true, primary: true, onclick: function () { T.copy(s, copy); } });
    return h('div', { 'class': 'tresult' }, [h('span', { 'class': 'tresult-ic', text: '🔗' }),
      h('span', { 'class': 'tresult-name' }, [h('b', {}, [h('a', { href: s, target: '_blank', rel: 'noopener', text: s.replace(/^https?:\/\//, '') })]), h('small', { text: l })]), copy]);
  }
  function show(s, l) { result.hidden = false; result.innerHTML = ''; result.appendChild(row(s, l)); }
  function drawHistory() {
    var list = T.store.get('short-links', []);
    hist.innerHTML = ''; histBox.hidden = !list.length;
    list.forEach(function (x) { hist.appendChild(row(x.s, x.l)); });
    if (list.length) hist.appendChild(T.button('Clear this list', { small: true, onclick: function () { T.store.set('short-links', []); drawHistory(); } }));
  }
});
