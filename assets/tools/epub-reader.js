/* Infinity by GroupChatOn — epub-reader. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* EPUB reader: open an .epub e-book and read it chapter by chapter with a contents list, font size and day / sepia / night themes. The book is unpacked on the device (JSZip) and shown in a sealed frame; your place is remembered. */
GCOTools.register('epub-reader', function (spot, T) {
  var h = T.h, status = T.status(), book = null, at = 0, size = T.store.get('epub-size', 110), theme = T.store.get('epub-theme', 'light');
  function resolve(base, rel) {
    if (/^[a-z]+:/i.test(rel)) return rel;
    var parts = base.split('/').slice(0, -1).concat(rel.split('#')[0].split('/')), out = [];
    parts.forEach(function (p) { if (p === '..') out.pop(); else if (p && p !== '.') out.push(p); });
    return out.join('/');
  }
  function xml(t) { return new DOMParser().parseFromString(t, 'application/xml'); }
  function byTag(doc, tag) { return [].slice.call(doc.getElementsByTagNameNS('*', tag)); }
  function open(data) {
    return T.lib('jszip').then(function (JSZip) { return JSZip.loadAsync(data); }).then(function (zip) {
      var c = zip.file('META-INF/container.xml');
      if (!c) throw new Error('This is not an EPUB e-book (no META-INF/container.xml inside).');
      return c.async('string').then(function (t) {
        var opfPath = (byTag(xml(t), 'rootfile')[0] || { getAttribute: function () { return ''; } }).getAttribute('full-path');
        var f = zip.file(opfPath);
        if (!f) throw new Error('The book’s table of contents file is missing.');
        return f.async('string').then(function (o) {
          var opf = xml(o), items = {};
          byTag(opf, 'item').forEach(function (it) { items[it.getAttribute('id')] = { href: resolve(opfPath, decodeURIComponent(it.getAttribute('href'))), type: it.getAttribute('media-type') || '', props: it.getAttribute('properties') || '' }; });
          var spine = byTag(opf, 'itemref').map(function (r) { return items[r.getAttribute('idref')]; }).filter(function (x) { return x && /html|xml/.test(x.type); });
          var meta = function (tag) { var e = byTag(opf, tag)[0]; return e ? e.textContent.trim() : ''; };
          var b = { zip: zip, title: meta('title') || 'Untitled book', author: meta('creator'), spine: spine, toc: [] };
          var nav = Object.keys(items).map(function (k) { return items[k]; }).filter(function (x) { return /\bnav\b/.test(x.props); })[0];
          var ncx = Object.keys(items).map(function (k) { return items[k]; }).filter(function (x) { return /ncx/.test(x.type); })[0];
          var tocFile = nav || ncx;
          if (!tocFile || !zip.file(tocFile.href)) return b;
          return zip.file(tocFile.href).async('string').then(function (nt) {
            var d = nav ? new DOMParser().parseFromString(nt, 'text/html') : xml(nt);
            if (nav) { var navEl = [].slice.call(d.querySelectorAll('nav')).filter(function (n) { return /toc/.test(n.getAttribute('epub:type') || n.getAttribute('type') || ''); })[0] || d.querySelector('nav'); if (navEl) [].forEach.call(navEl.querySelectorAll('a[href]'), function (a) { b.toc.push({ label: a.textContent.trim(), href: resolve(tocFile.href, decodeURIComponent(a.getAttribute('href'))) }); }); }
            else byTag(d, 'navPoint').forEach(function (p) { var l = byTag(p, 'text')[0], s = byTag(p, 'content')[0]; if (l && s) b.toc.push({ label: l.textContent.trim(), href: resolve(tocFile.href, decodeURIComponent(s.getAttribute('src'))) }); });
            return b;
          });
        });
      });
    });
  }
  var MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp' };
  function chapterHtml(b, k) {
    var item = b.spine[k], f = b.zip.file(item.href);
    if (!f) return Promise.resolve('<p>This chapter is missing from the file.</p>');
    return f.async('string').then(function (t) {
      var d = new DOMParser().parseFromString(t, /xhtml|xml/.test(item.type) ? 'application/xhtml+xml' : 'text/html');
      if (d.getElementsByTagName('parsererror').length) d = new DOMParser().parseFromString(t, 'text/html');
      [].forEach.call(d.querySelectorAll('script, iframe, object, embed, form'), function (n) { n.remove(); });
      var css = [], jobs = [];
      [].forEach.call(d.querySelectorAll('link[rel~="stylesheet"][href]'), function (l) { var cf = b.zip.file(resolve(item.href, l.getAttribute('href'))); if (cf) jobs.push(cf.async('string').then(function (s) { css.push(s.replace(/@import[^;]+;/g, '').replace(/url\([^)]*\)/g, 'none')); })); });
      [].forEach.call(d.querySelectorAll('style'), function (s) { css.push(s.textContent); });
      [].forEach.call(d.querySelectorAll('img[src], image'), function (im) {
        var attr = im.hasAttribute('src') ? 'src' : im.hasAttribute('href') ? 'href' : 'xlink:href', src = im.getAttribute(attr) || im.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (!src) return;
        var p = resolve(item.href, decodeURIComponent(src)), imf = b.zip.file(p);
        if (imf) jobs.push(imf.async('base64').then(function (b64) { var u = 'data:' + (MIME[(p.split('.').pop() || '').toLowerCase()] || 'image/png') + ';base64,' + b64; if (attr === 'xlink:href') im.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', u); else im.setAttribute(attr, u); }));
      });
      [].forEach.call(d.querySelectorAll('a[href]'), function (a) { if (!/^https?:/i.test(a.getAttribute('href'))) a.removeAttribute('href'); else { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); } });
      return Promise.all(jobs).then(function () { return { body: (d.body || d.documentElement).innerHTML, css: css.join('\n') }; });
    });
  }
  var THEMES = { light: ['#ffffff', '#1f2937'], sepia: ['#f6efe1', '#3b2f20'], dark: ['#111418', '#d6d9de'] };
  var frame = h('iframe', { sandbox: 'allow-popups allow-popups-to-escape-sandbox', title: 'Book page', style: 'width:100%;height:65vh;min-height:360px;border:1px solid var(--line);border-radius:12px;background:#fff' });
  var tocSel = T.select([], ''), info = h('p', { 'class': 'tnote', 'data-out': '' }), prev = T.button('← Previous', { onclick: function () { go(at - 1); } }), next = T.button('Next →', { primary: true, onclick: function () { go(at + 1); } });
  var reader = h('div', { hidden: true, style: 'display:grid;gap:10px;min-width:0' }, [info, T.field('Chapter', tocSel), frame, T.row([prev, next,
    T.button('A−', { small: true, onclick: function () { size = Math.max(70, size - 10); T.store.set('epub-size', size); go(at); } }), T.button('A+', { small: true, onclick: function () { size = Math.min(200, size + 10); T.store.set('epub-size', size); go(at); } }),
    T.seg([['light', 'Day'], ['sepia', 'Sepia'], ['dark', 'Night']], theme, function (v) { theme = v; T.store.set('epub-theme', v); go(at); })])]);
  tocSel.addEventListener('change', function () { go(+tocSel.value); });
  function go(k) {
    if (!book || k < 0 || k >= book.spine.length) return Promise.resolve();
    at = k; prev.disabled = k === 0; next.disabled = k === book.spine.length - 1; tocSel.value = String(k);
    T.store.set('epub-at-' + book.key, k);
    return chapterHtml(book, k).then(function (c) {
      var th = THEMES[theme] || THEMES.light;
      frame.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + c.css + '</style><style>html{background:' + th[0] + '!important}body{background:' + th[0] + '!important;color:' + th[1] + '!important;font-size:' + size + '%;line-height:1.7;max-width:42em;margin:0 auto;padding:18px 20px 60px;font-family:Georgia,"Noto Serif",serif;overflow-wrap:break-word}img,svg{max-width:100%;height:auto}a{color:inherit}</style></head><body>' + c.body + '</body></html>';
      status.info('Chapter ' + (k + 1) + ' of ' + book.spine.length);
    });
  }
  function load(data, name) {
    status.info('Opening ' + name + '…');
    return open(data).then(function (b) {
      book = b; b.key = (b.title + '|' + b.author).slice(0, 120);
      info.innerHTML = ''; info.appendChild(h('b', { text: b.title })); if (b.author) info.appendChild(document.createTextNode(' · ' + b.author));
      tocSel.innerHTML = '';
      b.spine.forEach(function (s, i) {
        var t = b.toc.filter(function (x) { return x.href === s.href; })[0];
        tocSel.appendChild(h('option', { value: String(i), text: (i + 1) + '. ' + (t ? t.label : s.href.split('/').pop().replace(/\.x?html?$/i, '').replace(/[_-]+/g, ' ')) }));
      });
      reader.hidden = false;
      if (!b.spine.length) throw new Error('This book has no readable chapters.');
      return go(Math.min(T.store.get('epub-at-' + b.key, 0), b.spine.length - 1)).then(function () { return b; });
    }).catch(function (e) { status.error(/zip|central directory|End of data/i.test(e.message) ? 'This file is not an EPUB e-book (or it is damaged).' : e.message); });
  }
  function sampleBook() {
    var chap = function (t, body) { return '<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>' + t + '</title><link rel="stylesheet" href="../Styles/book.css"/></head><body><h1>' + t + '</h1>' + body + '</body></html>'; };
    return T.lib('jszip').then(function (JSZip) {
      var z = new JSZip();
      z.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
      z.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
      z.file('OEBPS/content.opf', '<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">sample-1</dc:identifier><dc:title>A Tiny Sample Book</dc:title><dc:creator>Infinity Tools</dc:creator><dc:language>en</dc:language></metadata>' +
        '<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="c1" href="Text/ch%201.xhtml" media-type="application/xhtml+xml"/><item id="c2" href="Text/ch2.xhtml" media-type="application/xhtml+xml"/><item id="css" href="Styles/book.css" media-type="text/css"/><item id="img" href="Images/dot.svg" media-type="image/svg+xml"/></manifest>' +
        '<spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>');
      z.file('OEBPS/nav.xhtml', '<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="Text/ch%201.xhtml">The Beginning</a></li><li><a href="Text/ch2.xhtml#top">The Journey</a></li></ol></nav></body></html>');
      z.file('OEBPS/Styles/book.css', 'h1 { color: #b45309; } p { text-indent: 1.5em; }');
      z.file('OEBPS/Images/dot.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><circle cx="30" cy="30" r="26" fill="#f59e0b"/></svg>');
      z.file('OEBPS/Text/ch 1.xhtml', chap('The Beginning', '<p>Once upon a time, a small file wanted to become a book.</p><p><img src="../Images/dot.svg" alt="An orange dot"/></p>'));
      z.file('OEBPS/Text/ch2.xhtml', chap('The Journey', '<p>It travelled through zip folders and XML, and finally reached your screen.</p><script>alert(1)</script>'));
      return z.generateAsync({ type: 'arraybuffer' });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: '.epub,application/epub+zip', icon: '📚', label: 'Open an EPUB e-book', hint: 'Or drag it here. It stays on your device.', onFiles: function (fs) { T.read(fs[0]).then(function (b) { load(b, fs[0].name); }); } }),
    T.row([T.button('Try a sample', { small: true, onclick: function () { sampleBook().then(function (b) { load(b, 'sample.epub'); }); } })]), status.el, reader]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['epub-reader'] = function () {
    var f = [];
    if (resolve('OEBPS/Text/ch1.xhtml', '../Images/a.png') !== 'OEBPS/Images/a.png' || resolve('content.opf', 'Text/c.xhtml#x') !== 'Text/c.xhtml' || resolve('a/b.opf', './c/../d.html') !== 'a/d.html') f.push('resolve');
    return sampleBook().then(function (b) { return open(b); }).then(function (b) {
      if (b.title !== 'A Tiny Sample Book' || b.author !== 'Infinity Tools' || b.spine.length !== 2 || b.spine[0].href !== 'OEBPS/Text/ch 1.xhtml') f.push('open ' + JSON.stringify({ t: b.title, s: b.spine.map(function (x) { return x.href; }) }));
      if (b.toc.length !== 2 || b.toc[1].label !== 'The Journey' || b.toc[1].href !== 'OEBPS/Text/ch2.xhtml') f.push('toc ' + JSON.stringify(b.toc));
      return Promise.all([chapterHtml(b, 0), chapterHtml(b, 1)]);
    }).then(function (c) {
      if (c[0].body.indexOf('data:image/svg+xml;base64,') < 0 || c[0].css.indexOf('#b45309') < 0) f.push('chapter 1 images / css');
      if (/<script/i.test(c[1].body) || c[1].body.indexOf('finally reached') < 0) f.push('chapter 2 cleanup');
      return { ok: !f.length, n: 5, fails: f };
    });
  };
});
