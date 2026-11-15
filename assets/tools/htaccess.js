/* Infinity by GroupChatOn — htaccess. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* .htaccess redirect generator: old → new address lines become 301/302 redirects, plus force-https, www and custom 404 rules. */
GCOTools.register('htaccess', function (spot, T) {
  function path(u) { return u.replace(/^https?:\/\/[^/]+/i, '') || '/'; }
  function q(s) { return /\s/.test(s) ? '"' + s + '"' : s; }
  function run(t, o) {
    var L = [], rew = o.https || o.www !== 'keep' || o.html;
    if (rew) L.push('RewriteEngine On');
    if (o.https) L.push('', '# Send every visitor to https', 'RewriteCond %{HTTPS} off', 'RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [L,R=301]');
    if (o.www === 'add') L.push('', '# Add www', 'RewriteCond %{HTTP_HOST} !^www\\. [NC]', 'RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [L,R=301]');
    if (o.www === 'remove') L.push('', '# Remove www', 'RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]', 'RewriteRule ^(.*)$ https://%1/$1 [L,R=301]');
    if (o.html) L.push('', '# /page.html → /page', 'RewriteCond %{THE_REQUEST} \\s/([^.\\s]+)\\.html[\\s?]', 'RewriteRule ^ /%1 [L,R=301]',
      'RewriteCond %{REQUEST_FILENAME}.html -f', 'RewriteRule ^(.+?)/?$ $1.html [L]');
    var bad = [], red = [];
    t.split(/\r?\n/).forEach(function (l, i) {
      l = l.trim(); if (!l || l[0] === '#') return;
      var p = l.split(/\s*(?:->|→|=>|\t|,|\s)\s*/).filter(Boolean);
      if (p.length < 2) { bad.push(i + 1); return; }
      var from = path(p[0]);
      if (from[0] !== '/') from = '/' + from;
      red.push('Redirect ' + o.code + ' ' + q(from) + ' ' + q(/^https?:/i.test(p[1]) ? p[1] : '/' + p[1].replace(/^\//, '')));
    });
    if (red.length) L.push('', '# Moved pages', red.join('\n'));
    if (o.e404) L.push('', '# Your own “page not found” page', 'ErrorDocument 404 ' + (o.e404[0] === '/' ? o.e404 : '/' + o.e404));
    if (bad.length) throw new Error('Line ' + bad.join(', ') + ' needs an old and a new address, like: /old-page https://example.com/new-page');
    return L.join('\n').trim();
  }
  T.transformer(spot, { id: 'htaccess', inLabel: 'Redirects: old address, then new address (one pair per line)', mono: true, rows: 7, download: '.htaccess',
    placeholder: '/old-page.html  https://example.com/new-page\n/blog/2019/offer  /offers',
    sample: '/old-page.html  https://example.com/new-page\n/services.php -> /services\nhttps://example.com/contact-us.html  /contact',
    options: [T.opt.select('code', 'Redirect type', [['301', '301 Permanent (keeps Google ranking)'], ['302', '302 Temporary']], '301'),
      T.opt.select('www', 'www', [['keep', 'Leave as it is'], ['add', 'Always add www'], ['remove', 'Always remove www']], 'keep'),
      T.opt.check('https', 'Force https', true), T.opt.check('html', 'Hide .html from addresses'), T.opt.text('e404', 'Custom 404 page (optional)', '', '/404.html')],
    note: function () { return 'Upload this as .htaccess to your site’s main folder (Apache or LiteSpeed hosting). Keep a copy of the old file first.'; },
    outLabel: '.htaccess', run: run });
  T.tests['htaccess'] = function () {
    var f = [], r = run('/old.html https://x.com/new\nhttps://x.com/a b.html -> /b\n/c, d', { code: '301', www: 'keep', https: false, html: false, e404: '' });
    if (r !== '# Moved pages\nRedirect 301 /old.html https://x.com/new\nRedirect 301 /a b.html /b'.replace('/a b.html /b', '/a /b.html') + '\nRedirect 301 /c /d')
      f.push('redirects: ' + r.replace(/\n/g, ' | '));
    var w = run('', { code: '302', www: 'remove', https: true, html: false, e404: '404.html' });
    if (w.indexOf('RewriteEngine On') !== 0 || w.indexOf('RewriteCond %{HTTPS} off') < 0 || w.indexOf('https://%1/$1') < 0 || w.indexOf('ErrorDocument 404 /404.html') < 0) f.push('rules ' + w.replace(/\n/g, ' | '));
    try { run('/only-one', { code: '301', www: 'keep' }); f.push('single address accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
