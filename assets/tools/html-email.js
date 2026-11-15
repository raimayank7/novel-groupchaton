/* Infinity by GroupChatOn — html-email. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Email-safe HTML checker: flags code that Gmail, Outlook and Apple Mail strip or break (scripts, flexbox, external CSS, big size…), before you send a newsletter. */
GCOTools.register('html-email', function (spot, T) {
  function audit(html) {
    var R = [], add = function (lvl, t) { R.push([lvl, t]); }, d = new DOMParser().parseFromString(html, 'text/html'), kb = new Blob([html]).size / 1024;
    if (kb > 102) add('✕', 'Size ' + Math.round(kb) + ' KB: Gmail cuts emails over 102 KB and shows “Message clipped”.'); else add('✓', 'Size ' + Math.round(kb * 10) / 10 + ' KB (under Gmail’s 102 KB limit).');
    if (d.querySelector('script')) add('✕', 'Contains <script>: every email app removes JavaScript.');
    if (d.querySelector('form, input, button, select, textarea')) add('!', 'Contains form fields: many apps (Outlook, Gmail on phones) block forms. Link to a web form instead.');
    if (d.querySelector('link[rel="stylesheet" i]')) add('✕', 'External stylesheet <link>: most apps ignore it. Put CSS inline in style="" attributes.');
    if (d.querySelector('video, audio, iframe, embed, object')) add('✕', 'Video, audio or iframe: not supported in most email apps. Use an image that links to the video.');
    var css = Array.prototype.map.call(d.querySelectorAll('style'), function (s) { return s.textContent; }).join('\n') + '\n' + Array.prototype.map.call(d.querySelectorAll('[style]'), function (e) { return e.getAttribute('style'); }).join(';');
    if (/display\s*:\s*(flex|grid|inline-flex)/i.test(css)) add('!', 'Uses flexbox or grid: Outlook for Windows ignores them. Use tables for layout.');
    if (/position\s*:\s*(absolute|fixed|sticky)/i.test(css)) add('!', 'Uses position absolute/fixed: removed by Gmail and Outlook.');
    if (/var\(--/.test(css)) add('!', 'Uses CSS variables: not supported in Outlook and some Gmail apps.');
    if (/background-image|background\s*:[^;]*url\(/i.test(css)) add('!', 'Background images: Outlook for Windows does not show them. Give a background colour as a fallback.');
    if (/@import|@font-face/i.test(css)) add('!', 'Web fonts: only some apps load them. Always list safe fallback fonts (Arial, Helvetica, sans-serif).');
    if (d.querySelectorAll('style').length && !d.querySelectorAll('[style]').length) add('!', 'All CSS is in a <style> block: some apps strip it. Inline the important styles.');
    if (/\b\d*\.?\d+rem\b/.test(css)) add('!', 'Uses rem units: some apps do not support them; prefer px.');
    var imgs = d.querySelectorAll('img'), noAlt = 0, noW = 0, rel = 0;
    Array.prototype.forEach.call(imgs, function (i) { if (!i.hasAttribute('alt')) noAlt++; if (!i.getAttribute('width')) noW++; if (!/^(https?:|cid:|data:)/i.test(i.getAttribute('src') || '')) rel++; });
    if (noAlt) add('!', noAlt + ' image(s) without alt text: many apps block images at first, so alt text is all people see.');
    if (noW) add('!', noW + ' image(s) without a width attribute: Outlook may show them at full size.');
    if (rel) add('✕', rel + ' image(s) with a relative address: use full https:// addresses so they load in the inbox.');
    var links = Array.prototype.filter.call(d.querySelectorAll('a[href]'), function (a) { return !/^(https?:|mailto:|tel:|#)/i.test(a.getAttribute('href')); });
    if (links.length) add('✕', links.length + ' link(s) with a relative address: use full https:// links.');
    if (!d.querySelector('table')) add('!', 'No tables: for layouts that hold together in Outlook, build columns with tables.');
    if (!/unsubscribe/i.test(d.body ? d.body.textContent : '')) add('!', 'No “unsubscribe” text found: bulk emails must offer one (and it helps avoid spam folders).');
    if (!d.querySelector('meta[name="viewport" i]')) add('!', 'No viewport meta tag: add one so the email scales on phones.');
    if (R.length === 1) add('✓', 'No common email problems found.');
    return R;
  }
  function run(t) {
    var r = audit(t), x = r.filter(function (a) { return a[0] === '✕'; }).length, w = r.filter(function (a) { return a[0] === '!'; }).length;
    return [(x ? x + ' problem' + (x > 1 ? 's' : '') + ' to fix' : 'No blocking problems') + (w ? ', ' + w + ' warning' + (w > 1 ? 's' : '') : ''), ''].concat(r.map(function (a) { return a[0] + ' ' + a[1]; })).join('\n');
  }
  T.transformer(spot, { id: 'html-email', inLabel: 'Email HTML (newsletter or template)', mono: true, rows: 10, outLabel: 'Report', download: 'email-check.txt',
    sample: '<html><head><style>.wrap{display:flex}</style></head><body><div class="wrap"><img src="/logo.png"><p>Diwali sale: 30% off!</p><a href="/shop">Shop now</a></div><script>track()</script></body></html>',
    note: function () { return '✓ fine · ! may look different in some apps · ✕ will break'; }, run: run });
  T.tests['html-email'] = function () {
    var f = [], bad = audit('<div style="display:flex;position:absolute"><img src="/a.png"><a href="/x">x</a><script></script><link rel="stylesheet" href="a.css"></div>').map(function (a) { return a[1].slice(0, 12); }).join('|');
    ['Contains <sc', 'External sty', 'Uses flexbox', 'Uses positio', '1 image(s) w', '1 link(s) wi'].forEach(function (k) { if (bad.indexOf(k) < 0) f.push('missed ' + k); });
    var good = audit('<html><head><meta name="viewport" content="width=device-width"></head><body><table><tr><td style="color:#333">Hi <img src="https://x.com/a.png" alt="logo" width="100"> <a href="https://x.com">x</a> Unsubscribe</td></tr></table></body></html>');
    if (good.some(function (a) { return a[0] !== '✓'; })) f.push('good email flagged ' + JSON.stringify(good));
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
