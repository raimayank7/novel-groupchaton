/* Infinity by GroupChatOn — telegram-link. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Telegram and Signal link maker: direct chat links by username or phone number, and share links with pre-filled text. */
GCOTools.register('telegram-link', function (spot, T) {
  var h = T.h;
  function tg(o) {
    if (o.kind === 'user') { var u = o.user.trim().replace(/^@|^https?:\/\/t\.me\//i, ''); if (!/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(u)) throw new Error('Telegram usernames have 5–32 letters, digits or _ and start with a letter.'); return 'https://t.me/' + u + (o.text ? '?text=' + encodeURIComponent(o.text) : ''); }
    if (o.kind === 'phone') { var p = o.phone.replace(/[^\d+]/g, '').replace(/^00/, '+'); if (!/^\+\d{7,15}$/.test(p)) throw new Error('Write the number with + and the country code, like +91 98765 43210.'); return 'https://t.me/' + p; }
    if (o.kind === 'share') { if (!o.url.trim()) throw new Error('Enter the link to share.'); return 'https://t.me/share/url?url=' + encodeURIComponent(o.url.trim()) + (o.text ? '&text=' + encodeURIComponent(o.text) : ''); }
    var s = o.phone.replace(/[^\d+]/g, '').replace(/^00/, '+'); if (!/^\+\d{7,15}$/.test(s)) throw new Error('Write the number with + and the country code.'); return 'https://signal.me/#p/' + s;
  }
  var kind = T.select([['user', 'Telegram: by username'], ['phone', 'Telegram: by phone number'], ['share', 'Telegram: share a link'], ['signal', 'Signal: by phone number']], 'user');
  var user = h('input', { type: 'text', placeholder: '@username', value: '@infinitytools' }), phone = h('input', { type: 'tel', placeholder: '+91 98765 43210' }), url = h('input', { type: 'url', placeholder: 'https://…' }), text = h('input', { type: 'text', placeholder: 'Pre-filled message (optional)' });
  var fU = T.field('Username', user), fP = T.field('Phone number with country code', phone, 'The person must allow being found by number in their privacy settings'), fL = T.field('Link to share', url), fT = T.field('Text', text);
  var out = h('textarea', { rows: '2', 'class': 'tout tmono', readonly: true, 'aria-label': 'Link' }), status = T.status(), open = h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', text: 'Open link', href: '#' });
  function draw() {
    var k = kind.value; fU.hidden = k !== 'user'; fP.hidden = k !== 'phone' && k !== 'signal'; fL.hidden = k !== 'share'; fT.hidden = k === 'phone' || k === 'signal';
    out.value = ''; open.href = '#';
    try { out.value = tg({ kind: k, user: user.value, phone: phone.value, url: url.value, text: text.value }); open.href = out.value; status.clear(); } catch (e) { status.error(e); }
  }
  [kind, user, phone, url, text].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  var copy = T.button('Copy link', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([T.field('Link type', kind), fU, fP, fL, fT, status.el, T.field('Your link', out), T.row([copy, open])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['telegram-link'] = function () {
    var f = [];
    if (tg({ kind: 'user', user: '@Asha_Shop', text: '' }) !== 'https://t.me/Asha_Shop') f.push('user');
    if (tg({ kind: 'phone', phone: '0091 98765-43210' }) !== 'https://t.me/+919876543210') f.push('phone');
    if (tg({ kind: 'share', url: 'https://x.com/a?b=1', text: 'Look' }) !== 'https://t.me/share/url?url=https%3A%2F%2Fx.com%2Fa%3Fb%3D1&text=Look') f.push('share');
    if (tg({ kind: 'signal', phone: '+1 415 555 2671' }) !== 'https://signal.me/#p/+14155552671') f.push('signal');
    try { tg({ kind: 'user', user: 'ab' }); f.push('short username accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
