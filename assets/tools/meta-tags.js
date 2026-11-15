/* Infinity by GroupChatOn — meta-tags. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Meta and Open Graph tag generator: title, description, social preview tags and a Google result preview with length checks. */
GCOTools.register('meta-tags', function (spot, T) {
  var h = T.h;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function build(o) {
    var L = [];
    function m(attr, k, v) { if (v) L.push('<meta ' + attr + '="' + k + '" content="' + esc(v) + '">'); }
    if (o.title) L.push('<title>' + esc(o.title) + '</title>');
    m('name', 'description', o.desc);
    if (o.robots && o.robots !== 'index, follow') m('name', 'robots', o.robots);
    if (o.url) L.push('<link rel="canonical" href="' + esc(o.url) + '">');
    if (L.length) L.push('');
    m('property', 'og:type', o.type); m('property', 'og:title', o.title); m('property', 'og:description', o.desc); m('property', 'og:url', o.url);
    m('property', 'og:image', o.image); m('property', 'og:site_name', o.site);
    L.push('');
    m('name', 'twitter:card', o.image ? 'summary_large_image' : 'summary'); m('name', 'twitter:site', o.handle ? '@' + o.handle.replace(/^@/, '') : '');
    m('name', 'twitter:title', o.title); m('name', 'twitter:description', o.desc); m('name', 'twitter:image', o.image);
    return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  var f = {}, out = h('textarea', { rows: '12', 'class': 'tout tmono', readonly: true, 'aria-label': 'Meta tags' });
  function inp(k, label, ph, hint, area) {
    f[k] = area ? h('textarea', { rows: '3', placeholder: ph }) : h('input', { type: 'text', placeholder: ph });
    f[k].value = T.store.get('meta-' + k, '');
    f[k].addEventListener('input', draw);
    var fl = T.field(label, f[k], hint); f[k].fieldEl = fl; return fl;
  }
  f.type = T.select([['website', 'Website / home page'], ['article', 'Article / blog post'], ['product', 'Product']], 'website');
  f.robots = T.select([['index, follow', 'Show in search (default)'], ['noindex, follow', 'Hide from search (noindex)'], ['noindex, nofollow', 'Hide and do not follow links']], 'index, follow');
  [f.type, f.robots].forEach(function (s) { s.addEventListener('change', draw); });
  var gp = h('div', { style: 'padding:14px;border:1px solid var(--line);border-radius:14px;background:#fff;color:#202124;font-family:Arial,sans-serif;overflow-wrap:anywhere' });
  function count(k, lo, hi) {
    var n = f[k].value.length, el = f[k].fieldEl.querySelector('small');
    el.textContent = n + ' characters · ' + (!n ? 'aim for ' + lo + '–' + hi : n < lo ? 'a little short: aim for ' + lo + '–' + hi : n > hi ? 'too long: Google may cut it after about ' + hi : 'good length');
  }
  function vals() { var o = {}; Object.keys(f).forEach(function (k) { o[k] = f[k].value.trim(); }); return o; }
  function draw() {
    var o = vals();
    Object.keys(f).forEach(function (k) { if (f[k].tagName !== 'SELECT') T.store.set('meta-' + k, f[k].value); });
    count('title', 30, 60); count('desc', 70, 160);
    out.value = build(o);
    gp.innerHTML = '';
    gp.appendChild(h('div', { style: 'font-size:13px;color:#4d5156', text: (o.url || 'https://example.com/page').replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\//g, ' › ') }));
    gp.appendChild(h('div', { style: 'font-size:19px;color:#1a0dab;margin:2px 0', text: (o.title || 'Your page title').slice(0, 60) + (o.title.length > 60 ? '…' : '') }));
    gp.appendChild(h('div', { style: 'font-size:14px;line-height:1.5;color:#4d5156', text: (o.desc || 'Your description shows here. Write one or two sentences that make people want to click.').slice(0, 160) + (o.desc.length > 160 ? '…' : '') }));
  }
  var copy = T.button('Copy tags', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([inp('title', 'Page title', 'e.g. Free Online PDF Tools – Merge, Split, Compress', ' '), inp('desc', 'Description', 'One or two sentences about the page', ' ', true),
    h('div', { 'class': 'tgrid2' }, [inp('url', 'Page URL', 'https://example.com/page'), inp('image', 'Share image URL', 'https://example.com/cover.jpg', '1200 × 630 px works everywhere'),
      inp('site', 'Site name', 'e.g. GroupChatOn'), inp('handle', 'X (Twitter) handle', '@yourname'), T.field('Page type', f.type), T.field('Search engines', f.robots)]),
    T.row([T.button('Try a sample', { small: true, onclick: function () {
      var s = { title: 'Homemade Mango Pickle Recipe (Aam ka Achar)', desc: 'A simple, step-by-step mango pickle recipe with mustard oil and spices that keeps for a year. Ready in 7 days.', url: 'https://example.com/mango-pickle', image: 'https://example.com/img/mango-pickle.jpg', site: 'Desi Kitchen', handle: 'desikitchen' };
      Object.keys(s).forEach(function (k) { f[k].value = s[k]; }); f.type.value = 'article'; draw(); } })]),
    T.field('Google preview', gp), T.field('Your tags (paste inside <head>)', out), T.row([copy])]));
  draw();
  T.tests['meta-tags'] = function () {
    var fl = [], r = build({ title: 'A "quoted" title', desc: 'Desc', url: 'https://x.com/', image: 'https://x.com/i.jpg', site: 'X', handle: '@me', type: 'article', robots: 'index, follow' });
    ['<title>A &quot;quoted&quot; title</title>', '<meta property="og:type" content="article">', '<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:site" content="@me">', '<link rel="canonical" href="https://x.com/">']
      .forEach(function (x) { if (r.indexOf(x) < 0) fl.push('missing ' + x); });
    if (r.indexOf('name="robots"') >= 0) fl.push('robots tag for default');
    if (build({ title: 'T', robots: 'noindex, follow', desc: '', url: '', image: '', site: '', handle: '', type: '' }).indexOf('content="noindex, follow"') < 0) fl.push('noindex');
    return Promise.resolve({ ok: !fl.length, n: 7, fails: fl });
  };
});
