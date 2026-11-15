/* Infinity by GroupChatOn — email-link. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Mailto, tel and SMS link maker: links and buttons that open a pre-filled email, a phone call or a text message. */
GCOTools.register('email-link', function (spot, T) {
  var h = T.h;
  function enc(s) { return encodeURIComponent(s).replace(/%20/g, '%20'); }
  function mailto(o) {
    var q = [];
    ['cc', 'bcc'].forEach(function (k) { if (o[k]) q.push(k + '=' + o[k].split(/[,;\s]+/).filter(Boolean).map(enc).join(',')); });
    if (o.subject) q.push('subject=' + enc(o.subject)); if (o.body) q.push('body=' + enc(o.body.replace(/\r?\n/g, '\r\n')));
    return 'mailto:' + o.to.split(/[,;\s]+/).filter(Boolean).map(function (x) { return enc(x).replace(/%40/g, '@'); }).join(',') + (q.length ? '?' + q.join('&') : '');
  }
  function phone(n) { var s = n.trim().replace(/[^\d+]/g, ''); return s.replace(/(?!^)\+/g, ''); }
  function tel(n) { return 'tel:' + phone(n); }
  function sms(n, body) { return 'sms:' + phone(n) + (body ? '?body=' + enc(body) : ''); }
  var kind = T.seg([['mail', 'Email'], ['tel', 'Phone call'], ['sms', 'SMS']], 'mail', function () { draw(); });
  var to = h('input', { type: 'text', placeholder: 'you@example.com', value: 'orders@example.com' }), cc = h('input', { type: 'text' }), bcc = h('input', { type: 'text' }), subject = h('input', { type: 'text', value: 'New order' });
  var body = h('textarea', { rows: '4' }), num = h('input', { type: 'tel', placeholder: '+91 98765 43210', value: '+91 98765 43210' }), text = h('input', { type: 'text', placeholder: 'Message (optional)' }), label = h('input', { type: 'text', value: 'Email us' });
  body.value = 'Hello,\nI would like to order:\n';
  var mailBox = h('div', { 'class': 'tgrid2' }, [T.field('To', to), T.field('Subject', subject), T.field('Cc', cc), T.field('Bcc', bcc)]), bodyF = T.field('Message', body), numBox = h('div', { 'class': 'tgrid2' }, [T.field('Phone number (with country code)', num), T.field('SMS text', text)]);
  var link = h('textarea', { rows: '3', 'class': 'tout tmono', readonly: true, 'aria-label': 'Link' }), html = h('textarea', { rows: '3', 'class': 'tout tmono', readonly: true, 'aria-label': 'HTML' }), test = h('a', { 'class': 'tbtn', text: 'Test the link', href: '#' });
  function draw() {
    var k = kind.value(); mailBox.hidden = bodyF.hidden = k !== 'mail'; numBox.hidden = k === 'mail'; text.parentNode.hidden = k !== 'sms';
    var l = k === 'mail' ? mailto({ to: to.value, cc: cc.value, bcc: bcc.value, subject: subject.value, body: body.value }) : k === 'tel' ? tel(num.value) : sms(num.value, text.value);
    link.value = l; test.href = l; html.value = '<a href="' + l.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '">' + (label.value || 'Contact us').replace(/</g, '&lt;') + '</a>';
  }
  [to, cc, bcc, subject, body, num, text, label].forEach(function (x) { x.addEventListener('input', draw); });
  var c1 = T.button('Copy link', { primary: true, onclick: function () { T.copy(link.value, c1); } }), c2 = T.button('Copy HTML', { onclick: function () { T.copy(html.value, c2); } });
  spot.appendChild(T.card([T.field('Link type', kind), mailBox, bodyF, numBox, T.field('Button text', label), T.field('Link', link), T.field('HTML for your site', html), T.row([c1, c2, test]),
    h('p', { 'class': 'tstatus', text: 'Email links open the visitor’s own mail app; SMS links work best on phones.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['email-link'] = function () {
    var f = [], m = mailto({ to: 'a@b.com, c@d.com', cc: 'e@f.com', bcc: '', subject: 'Hi & bye', body: 'L1\nL2' });
    if (m !== 'mailto:a@b.com,c@d.com?cc=e%40f.com&subject=Hi%20%26%20bye&body=L1%0D%0AL2') f.push(m);
    if (tel('+91 (98765) 43-210') !== 'tel:+919876543210' || sms('098765 43210', 'Hi there') !== 'sms:09876543210?body=Hi%20there') f.push('tel/sms');
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
