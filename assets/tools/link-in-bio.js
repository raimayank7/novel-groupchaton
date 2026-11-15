/* Infinity by GroupChatOn — link-in-bio. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Link-in-bio page maker: your photo, name, short bio and buttons for every link, as one small HTML page you can host anywhere for free. */
GCOTools.register('link-in-bio', function (spot, T) {
  var h = T.h;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function links(t) { return t.split(/\r?\n/).map(function (l) { var m = /^(.*?)\s*[|,]\s*(\S+)\s*$/.exec(l.trim()); if (!m) return null; var u = /^(https?:|mailto:|tel:)/i.test(m[2]) ? m[2] : 'https://' + m[2]; return [m[1] || m[2], u]; }).filter(Boolean); }
  function page(o) {
    var dark = o.theme === 'dark', bg = dark ? '#0f172a' : '#f8fafc', ink = dark ? '#f1f5f9' : '#0f172a';
    var av = /^https?:\/\//.test(o.avatar) ? '<img src="' + esc(o.avatar) + '" alt="' + esc(o.name) + '" width="96" height="96" style="border-radius:50%;object-fit:cover">' : '<div style="width:96px;height:96px;border-radius:50%;display:grid;place-items:center;font-size:48px;background:' + o.color + '22;margin:auto">' + esc(o.avatar || '🙂') + '</div>';
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + esc(o.name) + '</title>\n<meta name="description" content="' + esc(o.bio) + '">\n<style>\n' +
      'body { margin: 0; min-height: 100vh; background: ' + bg + '; color: ' + ink + '; font-family: system-ui, sans-serif; display: flex; justify-content: center; }\n' +
      'main { width: 100%; max-width: 440px; padding: 40px 18px; text-align: center; }\nh1 { font-size: 22px; margin: 14px 0 6px; }\np { margin: 0 0 22px; opacity: .8; }\n' +
      'a.btn { display: block; margin: 12px 0; padding: 14px; border-radius: 14px; background: ' + o.color + '; color: #fff; text-decoration: none; font-weight: 700; }\na.btn:hover { filter: brightness(1.08); }\nfooter { margin-top: 28px; font-size: 12px; opacity: .6; }\n</style>\n</head>\n<body>\n<main>\n' +
      av + '\n<h1>' + esc(o.name) + '</h1>\n<p>' + esc(o.bio) + '</p>\n' + links(o.links).map(function (l) { return '<a class="btn" href="' + esc(l[1]) + '" rel="noopener">' + esc(l[0]) + '</a>'; }).join('\n') + '\n<footer>' + esc(o.name) + '</footer>\n</main>\n</body>\n</html>\n';
  }
  var f = { name: h('input', { type: 'text', value: 'Asha’s Kitchen' }), bio: h('input', { type: 'text', value: 'Home-made pickles and snacks · Ludhiana · Orders on WhatsApp' }), avatar: h('input', { type: 'text', value: '🥭', placeholder: 'An emoji, or https://… photo address' }),
    color: h('input', { type: 'color', value: '#16a34a' }), theme: T.select([['light', 'Light'], ['dark', 'Dark']], 'light'),
    links: h('textarea', { rows: '6', 'class': 'tmono', placeholder: 'Button text | https://address' }) };
  f.links.value = 'Order on WhatsApp | https://wa.me/919876543210\nInstagram | instagram.com/yourname\nPrice list (PDF) | https://example.com/prices.pdf\nCall us | tel:+919876543210';
  var frame = h('iframe', { 'class': 'tframe', title: 'Preview', sandbox: '' }), status = T.status();
  function o() { return { name: f.name.value.trim() || 'My links', bio: f.bio.value.trim(), avatar: f.avatar.value.trim(), color: f.color.value, theme: f.theme.value, links: f.links.value }; }
  function draw() { var op = o(); frame.srcdoc = page(op); var n = links(op.links).length; status.info(n + ' button' + (n === 1 ? '' : 's') + '. Write one link per line: Button text | address.'); }
  Object.keys(f).forEach(function (k) { f[k].addEventListener('input', draw); f[k].addEventListener('change', draw); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Name', f.name), T.field('Photo', f.avatar), T.field('Button colour', f.color), T.field('Theme', f.theme)]), T.field('Short bio', f.bio),
    T.field('Links', f.links), status.el, T.field('Preview', frame), T.row([T.button('Download page (index.html)', { primary: true, onclick: function () { T.download(new Blob([page(o())], { type: 'text/html' }), 'index.html'); } })]),
    h('p', { 'class': 'tstatus', text: 'Host it free on GitHub Pages, Netlify or Cloudflare Pages, then put that address in your Instagram or YouTube bio.' })]));
  draw();
  T.tests['link-in-bio'] = function () {
    var fl = [], l = links('Shop | shop.com\nbad line\nMail, mailto:a@b.com');
    if (JSON.stringify(l) !== '[["Shop","https://shop.com"],["Mail","mailto:a@b.com"]]') fl.push('links ' + JSON.stringify(l));
    var p = page({ name: 'A<b>', bio: 'x', avatar: '🙂', color: '#000000', theme: 'dark', links: 'Go | a.com' });
    if (p.indexOf('<title>A&lt;b&gt;</title>') < 0 || p.indexOf('<a class="btn" href="https://a.com" rel="noopener">Go</a>') < 0 || p.indexOf('#0f172a') < 0) fl.push('page');
    return Promise.resolve({ ok: !fl.length, n: 2, fails: fl });
  };
});
