/* Infinity by GroupChatOn — seo-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* On-page SEO checker: reads a page's HTML and checks title, description, headings, image alt text, canonical, mobile and social tags, with fixes. */
GCOTools.register('seo-check', function (spot, T) {
  function audit(html) {
    var d = new DOMParser().parseFromString(html, 'text/html'), R = [];
    function add(ok, name, msg, warn) { R.push({ ok: ok, warn: !ok && !!warn, name: name, msg: msg }); }
    var meta = function (sel) { var m = d.querySelector(sel); return m ? (m.getAttribute('content') || '').trim() : ''; };
    var title = (d.querySelector('title') || {}).textContent || '';
    title = title.trim();
    add(title.length >= 20 && title.length <= 65, 'Title', title ? '“' + title.slice(0, 70) + '” (' + title.length + ' characters). ' + (title.length < 20 ? 'Make it longer and more descriptive.' : title.length > 65 ? 'Google may cut it after about 60 characters.' : 'Good length.') : 'Missing. Add a <title> of 50–60 characters with your main keyword.');
    var desc = meta('meta[name="description" i]');
    add(desc.length >= 70 && desc.length <= 165, 'Meta description', desc ? desc.length + ' characters. ' + (desc.length < 70 ? 'Too short: aim for 120–160.' : desc.length > 165 ? 'Too long: it will be cut off.' : 'Good length.') : 'Missing. Write 1–2 sentences (120–160 characters) that make people click.', !!desc);
    var h1 = d.querySelectorAll('h1');
    add(h1.length === 1, 'H1 heading', h1.length === 1 ? '“' + h1[0].textContent.trim().slice(0, 70) + '”' : h1.length ? h1.length + ' H1 headings: use exactly one main heading.' : 'Missing. Add one <h1> with the page topic.', h1.length > 1);
    var hs = Array.prototype.map.call(d.querySelectorAll('h1,h2,h3,h4,h5,h6'), function (x) { return +x.tagName[1]; }), skip = hs.filter(function (l, k) { return k && l > hs[k - 1] + 1; }).length;
    add(!skip && hs.length > 1, 'Heading order', hs.length < 2 ? 'Few headings. Break long text into sections with <h2> headings.' : skip ? skip + ' place(s) skip a level (for example H2 straight to H4).' : hs.length + ' headings in a clean order.', true);
    var imgs = d.querySelectorAll('img'), noAlt = Array.prototype.filter.call(imgs, function (x) { return !x.hasAttribute('alt'); });
    add(!noAlt.length, 'Image alt text', imgs.length ? (noAlt.length ? noAlt.length + ' of ' + imgs.length + ' images have no alt text: describe each image for blind readers and Google Images.' : 'All ' + imgs.length + ' images have alt text.') : 'No images found.', true);
    var canon = d.querySelector('link[rel="canonical" i]');
    add(!!canon, 'Canonical link', canon ? canon.getAttribute('href') : 'Missing. A canonical link tells Google the main address of the page.', true);
    var robots = meta('meta[name="robots" i]').toLowerCase();
    add(robots.indexOf('noindex') < 0, 'Indexing', robots.indexOf('noindex') >= 0 ? 'The page has noindex: Google will NOT show it in search.' : 'The page may appear in search results.');
    add(!!d.querySelector('meta[name="viewport" i]'), 'Mobile viewport', d.querySelector('meta[name="viewport" i]') ? 'Present.' : 'Missing <meta name="viewport" content="width=device-width, initial-scale=1">: the page will look tiny on phones.');
    add(!!(d.documentElement.getAttribute('lang') || '').trim(), 'Language', d.documentElement.getAttribute('lang') ? 'lang="' + d.documentElement.getAttribute('lang') + '"' : 'Add lang="en" (or your language) to the <html> tag.', true);
    var og = ['og:title', 'og:description', 'og:image'].filter(function (p) { return !meta('meta[property="' + p + '"]'); });
    add(!og.length, 'Social sharing', og.length ? 'Missing ' + og.join(', ') + ': links shared on WhatsApp or Facebook will look plain.' : 'Open Graph title, description and image are set.', true);
    var text = (d.body ? d.body.textContent : '').replace(/\s+/g, ' ').trim(), words = text ? text.split(' ').length : 0;
    add(words >= 300, 'Amount of text', words + ' words. ' + (words < 300 ? 'Thin pages rarely rank: aim for 300+ useful words.' : 'Good amount.'), true);
    var links = Array.prototype.map.call(d.querySelectorAll('a[href]'), function (a) { return a.getAttribute('href'); }), ext = links.filter(function (u) { return /^https?:/i.test(u); }).length;
    add(links.length > 0, 'Links', links.length + ' links (' + (links.length - ext) + ' internal or relative, ' + ext + ' full addresses).', true);
    var score = Math.round(R.reduce(function (s, r) { return s + (r.ok ? 1 : r.warn ? 0.5 : 0); }, 0) / R.length * 100);
    return { score: score, items: R };
  }
  function run(t) {
    if (!/<[a-z!]/i.test(t)) throw new Error('Paste the page’s HTML source (open the page, press Ctrl+U or “View source”, copy everything).');
    var a = audit(t);
    return ['SEO score: ' + a.score + ' / 100', ''].concat(a.items.map(function (r) { return (r.ok ? '✓ ' : r.warn ? '! ' : '✕ ') + r.name + ': ' + r.msg; })).join('\n');
  }
  T.transformer(spot, { id: 'seo-check', inLabel: 'Page HTML (view source and paste it all)', mono: true, rows: 10, outLabel: 'Report', download: 'seo-report.txt',
    sample: '<!doctype html><html><head><title>Mango Pickle</title><meta name="viewport" content="width=device-width"></head><body><h1>Mango Pickle Recipe</h1><h3>Ingredients</h3><img src="a.jpg"><p>Raw mangoes, mustard oil and spices.</p><a href="/recipes">More recipes</a></body></html>',
    note: function () { return '✓ good · ! could be better · ✕ fix this'; }, run: run });
  T.tests['seo-check'] = function () {
    var f = [], good = '<html lang="en"><head><title>Homemade Mango Pickle Recipe with Mustard Oil</title><meta name="description" content="' + new Array(11).join('Tasty pickle. ') + '"><link rel="canonical" href="https://x.com/p"><meta name="viewport" content="width=device-width">' +
      '<meta property="og:title" content="a"><meta property="og:description" content="b"><meta property="og:image" content="c"></head><body><h1>Pickle</h1><h2>Steps</h2><img src="a.jpg" alt="jar"><p>' + new Array(320).join('word ') + '</p><a href="/x">x</a></body></html>';
    var g = audit(good), b = audit('<html><head><meta name="robots" content="noindex"></head><body><h1>a</h1><h1>b</h1><h2>c</h2><h4>d</h4><img src=x></body></html>');
    if (g.score !== 100) f.push('good page ' + g.score + ' ' + JSON.stringify(g.items.filter(function (x) { return !x.ok; })));
    var bad = b.items.filter(function (x) { return !x.ok; }).map(function (x) { return x.name; }).join();
    ['Title', 'H1 heading', 'Heading order', 'Image alt text', 'Indexing', 'Mobile viewport'].forEach(function (n) { if (bad.indexOf(n) < 0) f.push('not flagged: ' + n); });
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
