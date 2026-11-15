/* Infinity by GroupChatOn — robots-txt. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* robots.txt generator: allow or block crawlers, private folders, AI training bots, sitemap, plus a checker for any path. */
GCOTools.register('robots-txt', function (spot, T) {
  var h = T.h;
  var AI = ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'CCBot', 'ClaudeBot', 'PerplexityBot', 'Bytespider', 'Applebot-Extended', 'meta-externalagent'];
  function lines(s) { return s.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { return x.replace(/^https?:\/\/[^/]+/, '') || '/'; }); }
  function build(o) {
    var L = ['User-agent: *'];
    if (o.policy === 'block') L.push('Disallow: /');
    else {
      lines(o.disallow).forEach(function (p) { L.push('Disallow: ' + (p[0] === '/' || p[0] === '*' ? p : '/' + p)); });
      lines(o.allow).forEach(function (p) { L.push('Allow: ' + (p[0] === '/' || p[0] === '*' ? p : '/' + p)); });
      if (L.length === 1) L.push('Allow: /');
    }
    if (+o.delay > 0) L.push('Crawl-delay: ' + (+o.delay));
    if (o.ai) AI.forEach(function (b) { L.push('', 'User-agent: ' + b, 'Disallow: /'); });
    o.sitemap.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (s, i) { if (!i) L.push(''); L.push('Sitemap: ' + s); });
    return L.join('\n');
  }
  // Google's rule: the longest matching path wins; Allow wins a tie. * matches anything, $ ends the path.
  function allowed(txt, path) {
    var groups = [], cur = null, lastUA = false;
    txt.split(/\r?\n/).forEach(function (l) {
      var m = /^\s*([A-Za-z-]+)\s*:\s*(.*?)\s*$/.exec(l.replace(/#.*/, ''));
      if (!m) return;
      var k = m[1].toLowerCase();
      if (k === 'user-agent') { if (!lastUA) groups.push(cur = { ua: [], rules: [] }); cur.ua.push(m[2].toLowerCase()); lastUA = true; return; }
      lastUA = false;
      if (cur && (k === 'allow' || k === 'disallow') && m[2]) cur.rules.push([k === 'allow', m[2]]);
    });
    var g = groups.filter(function (x) { return x.ua.indexOf('*') >= 0; })[0];
    if (!g) return true;
    var best = null;
    g.rules.forEach(function (r) {
      var re = new RegExp('^' + r[1].replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$|\$$/, '$'));
      if (re.test(path) && (!best || r[1].length > best[1].length || (r[1].length === best[1].length && r[0]))) best = r;
    });
    return !best || best[0];
  }
  var policy = T.select([['allow', 'Allow all search engines (recommended)'], ['block', 'Block everything (site not ready yet)']], 'allow');
  var dis = h('textarea', { rows: '4', 'class': 'tmono', placeholder: '/admin/\n/cart\n/search' }), alw = h('textarea', { rows: '2', 'class': 'tmono', placeholder: '/admin/public/' });
  var delay = h('input', { type: 'number', min: '0', max: '60', value: '0' }), sm = h('textarea', { rows: '2', 'class': 'tmono', placeholder: 'https://example.com/sitemap.xml' });
  var ai = h('input', { type: 'checkbox' }), out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, 'aria-label': 'robots.txt' });
  var path = h('input', { type: 'text', 'class': 'tmono', placeholder: '/admin/settings', value: '/' }), verdict = h('p', { 'class': 'tstatus' });
  function o() { return { policy: policy.value, disallow: dis.value, allow: alw.value, delay: delay.value, sitemap: sm.value, ai: ai.checked }; }
  function draw() {
    out.value = build(o());
    var p = path.value.trim() || '/';
    verdict.className = 'tstatus is-' + (allowed(out.value, p) ? 'ok' : 'error');
    verdict.textContent = allowed(out.value, p) ? '✓ Search engines may crawl ' + p : '✕ ' + p + ' is blocked for search engines';
  }
  [policy, dis, alw, delay, sm, ai, path].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  var copy = T.button('Copy', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([T.field('Default', policy), h('div', { 'class': 'tgrid2' }, [T.field('Block these paths (one per line)', dis), T.field('But allow (optional)', alw)]),
    h('div', { 'class': 'tgrid2' }, [T.field('Sitemap URL(s)', sm), T.field('Crawl delay (seconds)', delay, 'Google ignores this; Bing and Yandex follow it. Leave 0 unless your server struggles.')]),
    h('label', { 'class': 'tcheck' }, [ai, ' Block AI training crawlers (' + AI.slice(0, 4).join(', ') + '…)']),
    T.row([T.button('Blogger preset', { small: true, onclick: function () { policy.value = 'allow'; dis.value = '/search'; alw.value = '/'; delay.value = 0; sm.value = 'https://yourblog.blogspot.com/sitemap.xml'; draw(); } }),
      T.button('WordPress preset', { small: true, onclick: function () { policy.value = 'allow'; dis.value = '/wp-admin/'; alw.value = '/wp-admin/admin-ajax.php'; delay.value = 0; sm.value = 'https://example.com/wp-sitemap.xml'; draw(); } }),
      T.button('Shop preset', { small: true, onclick: function () { policy.value = 'allow'; dis.value = '/cart\n/checkout\n/account\n/*?sort=\n/*?filter='; alw.value = ''; sm.value = 'https://example.com/sitemap.xml'; draw(); } })]),
    T.field('robots.txt', out), T.row([copy, T.button('Download', { onclick: function () { T.download(new Blob([out.value], { type: 'text/plain' }), 'robots.txt'); } })]),
    T.field('Check a path', path), verdict]));
  draw();
  T.tests['robots-txt'] = function () {
    var f = [], r = build({ policy: 'allow', disallow: '/admin/\nhttps://x.com/cart', allow: '/admin/public/', delay: '0', sitemap: 'https://x.com/sitemap.xml', ai: true });
    if (r.indexOf('User-agent: *\nDisallow: /admin/\nDisallow: /cart\nAllow: /admin/public/') !== 0) f.push('rules ' + r.slice(0, 80));
    if (r.indexOf('User-agent: GPTBot\nDisallow: /') < 0 || r.indexOf('Sitemap: https://x.com/sitemap.xml') < 0) f.push('ai / sitemap');
    if (allowed(r, '/admin/settings')) f.push('/admin/settings allowed');
    if (!allowed(r, '/admin/public/a.png')) f.push('longest Allow should win');
    if (!allowed(r, '/blog/post')) f.push('/blog blocked');
    if (allowed('User-agent: *\nDisallow: /*.pdf$', '/files/a.pdf') || !allowed('User-agent: *\nDisallow: /*.pdf$', '/files/a.pdf?x=1')) f.push('wildcard / $');
    if (build({ policy: 'block', disallow: '', allow: '', delay: 0, sitemap: '', ai: false }) !== 'User-agent: *\nDisallow: /') f.push('block all');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
