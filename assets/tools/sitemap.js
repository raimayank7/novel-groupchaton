/* Infinity by GroupChatOn — sitemap. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* XML sitemap generator: turn a list of page addresses into a valid sitemap.xml with lastmod, change frequency and priority. */
GCOTools.register('sitemap', function (spot, T) {
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function build(t, o) {
    var seen = {}, urls = [], bad = [];
    t.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (u, i) {
      if (o.base && !/^https?:\/\//i.test(u)) u = o.base.replace(/\/+$/, '') + '/' + u.replace(/^\/+/, '');
      var p; try { p = new URL(u); } catch (e) { bad.push(u); return; }
      if (!/^https?:$/.test(p.protocol)) { bad.push(u); return; }
      p.hash = ''; var k = p.href; if (seen[k]) return; seen[k] = 1; urls.push(k);
    });
    if (bad.length) throw new Error('Not full web addresses: ' + bad.slice(0, 3).join(', ') + (bad.length > 3 ? '…' : '') + '. Start them with https:// or fill in “Site address”.');
    if (urls.length > 50000) throw new Error('A sitemap can hold 50,000 addresses. Split them into several files.');
    var home = function (u) { return /^https?:\/\/[^/]+\/?$/.test(u); };
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(function (u) {
      return '  <url>\n    <loc>' + esc(u) + '</loc>\n' + (o.lastmod ? '    <lastmod>' + o.lastmod + '</lastmod>\n' : '') + (o.freq ? '    <changefreq>' + o.freq + '</changefreq>\n' : '') +
        (o.prio ? '    <priority>' + (home(u) ? '1.0' : o.prio) + '</priority>\n' : '') + '  </url>';
    }).join('\n') + '\n</urlset>';
  }
  var d = new Date(), today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  T.transformer(spot, { id: 'sitemap', inLabel: 'Page addresses (one per line)', mono: true, rows: 9, outLabel: 'sitemap.xml', download: 'sitemap.xml', type: 'application/xml',
    sample: 'https://example.com/\nhttps://example.com/about\n/services\n/blog/how-to-save-tax\n/contact?ref=menu&x=1\nhttps://example.com/about',
    options: [T.opt.text('base', 'Site address (for short paths)', 'https://example.com', 'https://yoursite.com'), T.opt.text('lastmod', 'Last changed (YYYY-MM-DD)', today),
      T.opt.select('freq', 'Change frequency', [['', 'Leave out (Google ignores it)'], ['daily', 'daily'], ['weekly', 'weekly'], ['monthly', 'monthly'], ['yearly', 'yearly']], ''),
      T.opt.select('prio', 'Priority', [['', 'Leave out (Google ignores it)'], ['0.8', '0.8 (home page gets 1.0)'], ['0.5', '0.5 (home page gets 1.0)']], '')],
    note: function (a, b) { var n = (b.match(/<url>/g) || []).length; return n ? n + ' address' + (n > 1 ? 'es' : '') + ' (duplicates removed). Upload as /sitemap.xml and submit it in Google Search Console.' : ''; },
    run: function (t, o) { if (o.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(o.lastmod)) throw new Error('Write the date as YYYY-MM-DD, for example ' + today + '.'); return build(t, o); } });
  T.tests['sitemap'] = function () {
    var f = [], s = build('https://x.com/\n/a?b=1&c=2\nhttps://x.com/\nhttps://x.com/p#top', { base: 'https://x.com', lastmod: '2026-11-01', freq: 'weekly', prio: '0.5' });
    if ((s.match(/<url>/g) || []).length !== 3) f.push('dedupe');
    if (s.indexOf('<loc>https://x.com/a?b=1&amp;c=2</loc>') < 0 || s.indexOf('<priority>1.0</priority>') < 0 || s.indexOf('<changefreq>weekly</changefreq>') < 0 || s.indexOf('#top') >= 0) f.push('content');
    try { build('not a url', { base: '' }); f.push('bad url accepted'); } catch (e) {}
    if (new DOMParser().parseFromString(s, 'application/xml').getElementsByTagName('parsererror').length) f.push('not valid xml');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
