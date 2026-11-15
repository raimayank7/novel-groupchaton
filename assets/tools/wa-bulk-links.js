/* Infinity by GroupChatOn — wa-bulk-links. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Bulk click-to-chat links: a list or CSV of names and numbers → a wa.me link for each, with a personal message. */
GCOTools.register('wa-bulk-links', function (spot, T) {
  var h = T.h;
  var cc = h('input', { type: 'text', inputmode: 'numeric', value: T.store.get('wa-cc', '91'), 'aria-label': 'Default country code', style: 'max-width:110px' });
  var list = h('textarea', { rows: '6', placeholder: 'One per line: name, number\nRahul, 98765 43210\nPriya, +971 50 123 4567' });
  list.value = 'Rahul, 98765 43210\nPriya, +971 50 123 4567\n09876543211';
  var msg = h('textarea', { rows: '3' }); msg.value = 'Hi {name}, your order is ready for pickup.';
  var out = h('div', { 'class': 'tu-all' }), rows = [];
  function build() {
    rows = [];
    list.value.split(/\n/).forEach(function (line) {
      line = line.trim(); if (!line) return;
      var parts = line.split(/[,;\t]/), name = '', raw = line;
      if (parts.length > 1) { var numPart = parts.filter(function (p) { return /\d{6,}/.test(p.replace(/\D/g, '')); })[0] || parts[1]; raw = numPart; name = parts.filter(function (p) { return p !== numPart; }).join(' ').trim(); }
      var plus = /^\s*(\+|00)/.test(raw), n = raw.replace(/\D/g, '').replace(/^00/, '');
      if (!plus) { n = n.replace(/^0+/, ''); if (n.length <= 10) n = cc.value.replace(/\D/g, '') + n; }
      var ok = n.length >= 10 && n.length <= 15, text = msg.value.replace(/\{name\}/gi, name || 'there').trim();
      rows.push({ name: name, num: n, ok: ok, link: ok ? 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '') : '' });
    });
    out.innerHTML = '';
    out.appendChild(h('table', {}, [h('tbody', {}, rows.map(function (r) {
      return h('tr', {}, [h('th', { text: (r.name || '—') + ' · +' + r.num }), h('td', {}, [r.ok ? h('a', { 'class': 'tbtn tbtn-sm', href: r.link, target: '_blank', rel: 'noopener', text: 'Open chat' }) : h('span', { 'class': 'tstatus is-error', text: 'check number' })])]);
    }))]));
  }
  [cc, list, msg].forEach(function (e) { e.addEventListener('input', build); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Default country code', cc, 'used when a number has no + code'), h('span')]),
    T.field('Names and numbers', list, 'paste from Excel or a CSV: name and number on each line'), T.field('Message ({name} becomes each person’s name)', msg),
    T.row([T.button('Copy all links', { primary: true, onclick: function (e) { T.copy(rows.filter(function (r) { return r.ok; }).map(function (r) { return (r.name ? r.name + ': ' : '') + r.link; }).join('\n'), e.currentTarget); } }),
      T.button('Download CSV', { onclick: function () { T.download(new Blob(['﻿Name,Number,Link\n' + rows.map(function (r) { return '"' + r.name.replace(/"/g, '""') + '",+' + r.num + ',' + r.link; }).join('\n')], { type: 'text/csv' }), 'whatsapp-links.csv'); } })]),
    out, h('p', { 'class': 'tnote', text: 'Open each chat and press send yourself: sending in bulk automatically breaks WhatsApp’s rules and can get a number banned.' })]));
  build();
  T.tests['wa-bulk-links'] = function () {
    var k = [cc.value, list.value, msg.value], fails = [];
    cc.value = '91'; list.value = 'Rahul, 98765 43210\nPriya, +971 50 123 4567\n09876543211\nBad, 123'; msg.value = 'Hi {name}'; build();
    if (rows.length !== 4) fails.push('rows ' + rows.length);
    if (rows[0].link !== 'https://wa.me/919876543210?text=Hi%20Rahul') fails.push('row 1 ' + rows[0].link);
    if (rows[1].num !== '971501234567') fails.push('row 2 ' + rows[1].num);
    if (rows[2].num !== '919876543211' || rows[2].link.indexOf('Hi%20there') < 0) fails.push('row 3 ' + rows[2].link);
    if (rows[3].ok) fails.push('bad number accepted');
    cc.value = k[0]; list.value = k[1]; msg.value = k[2]; build();
    return Promise.resolve({ ok: !fails.length, n: 5, fails: fails });
  };
});
