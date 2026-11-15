/* HTML to Text — strips tags but keeps readable line breaks, list bullets and link addresses.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('html-to-text', function (spot, T) {
  T.transformer(spot, { id: 'html-to-text', inLabel: 'HTML code', mono: true,
    sample: '<h1>Title</h1><p>Hello <b>world</b>. Visit <a href="https://example.com">our site</a>.</p><ul><li>One</li><li>Two</li></ul>',
    options: [T.opt.check('links', 'Keep link addresses', true), T.opt.check('bullets', 'Bullets for list items', true)],
    run: function (t, o) {
      // DOMParser never runs scripts or loads images, so any HTML is safe to read here
      var doc = new DOMParser().parseFromString(t, 'text/html');
      doc.querySelectorAll('script,style,noscript,template').forEach(function (n) { n.remove(); });
      if (o.links) doc.querySelectorAll('a[href]').forEach(function (a) {
        var href = a.getAttribute('href');
        if (href && !/^#|^javascript:/i.test(href) && a.textContent.trim() !== href) a.append(' (' + href + ')');
      });
      if (o.bullets) doc.querySelectorAll('li').forEach(function (li) { li.prepend('• '); });
      doc.querySelectorAll('br').forEach(function (b) { b.replaceWith('\n'); });
      doc.querySelectorAll('p,div,h1,h2,h3,h4,h5,h6,li,tr,section,article,header,footer,blockquote,pre,table').forEach(function (b) { b.append('\n'); });
      doc.querySelectorAll('td,th').forEach(function (c) { c.append('\t'); });
      return (doc.body.textContent || '').replace(/[ \t ]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    } });
});
