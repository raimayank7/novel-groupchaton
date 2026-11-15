/* Infinity by GroupChatOn — utm. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* UTM link builder: add utm_source, utm_medium and utm_campaign tags to a link so Google Analytics shows where visitors came from. */
GCOTools.register('utm', function (spot, T) {
  var h = T.h;
  function build(base, p) {
    var u; try { u = new URL(/^https?:\/\//i.test(base) ? base : 'https://' + base); } catch (e) { throw new Error('Enter a valid web address.'); }
    ['source', 'medium', 'campaign', 'term', 'content', 'id'].forEach(function (k) {
      var v = (p[k] || '').trim(); if (p.lower) v = v.toLowerCase(); if (p.dash) v = v.replace(/\s+/g, '-');
      if (v) u.searchParams.set('utm_' + k, v); else u.searchParams.delete('utm_' + k);
    });
    return u.href;
  }
  var f = {}, out = h('textarea', { rows: '3', 'class': 'tout tmono', readonly: true, 'aria-label': 'Tagged link' }), status = T.status();
  var lower = h('input', { type: 'checkbox', checked: true }), dash = h('input', { type: 'checkbox', checked: true });
  function inp(k, label, ph, hint) { f[k] = h('input', { type: 'text', placeholder: ph }); f[k].addEventListener('input', draw); return T.field(label, f[k], hint); }
  var urlF = inp('url', 'Website address', 'https://yoursite.com/offer'), PRE = [['WhatsApp', 'whatsapp', 'social'], ['Instagram bio', 'instagram', 'social'], ['Facebook post', 'facebook', 'social'], ['Email newsletter', 'newsletter', 'email'], ['Google Ads', 'google', 'cpc'], ['QR code / print', 'qr', 'print']];
  function draw() {
    var p = { source: f.source.value, medium: f.medium.value, campaign: f.campaign.value, term: f.term.value, content: f.content.value, lower: lower.checked, dash: dash.checked };
    out.value = '';
    if (!f.url.value.trim()) { status.info('Enter the address of the page you are sharing.'); return; }
    try { out.value = build(f.url.value.trim(), p); status.info(!f.source.value.trim() || !f.medium.value.trim() || !f.campaign.value.trim() ? 'Fill in source, medium and campaign for clean reports.' : 'Ready. Share this link; visits show under Acquisition → Traffic acquisition in Google Analytics.'); }
    catch (e) { status.error(e); }
  }
  [lower, dash].forEach(function (x) { x.addEventListener('change', draw); });
  var copy = T.button('Copy link', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([urlF, T.field('Quick fill', T.row(PRE.map(function (p) { return T.button(p[0], { small: true, onclick: function () { f.source.value = p[1]; f.medium.value = p[2]; draw(); } }); }))),
    h('div', { 'class': 'tgrid2' }, [inp('source', 'Source *', 'whatsapp, google, newsletter', 'Where the click comes from'), inp('medium', 'Medium *', 'social, email, cpc', 'The kind of channel'), inp('campaign', 'Campaign *', 'diwali-sale-2026', 'Your promotion name'),
      inp('term', 'Term (optional)', 'paid keyword'), inp('content', 'Content (optional)', 'banner-a', 'Tells apart two links in the same campaign')]),
    T.row([h('label', { 'class': 'tcheck' }, [lower, ' lowercase']), h('label', { 'class': 'tcheck' }, [dash, ' spaces → dashes'])]), status.el, T.field('Your tagged link', out), T.row([copy])]));
  draw();
  T.tests['utm'] = function () {
    var fl = [], u = build('shop.com/sale?ref=1', { source: 'WhatsApp', medium: 'social', campaign: 'Diwali Sale', lower: true, dash: true });
    if (u !== 'https://shop.com/sale?ref=1&utm_source=whatsapp&utm_medium=social&utm_campaign=diwali-sale') fl.push(u);
    if (build('https://a.com/?utm_source=old', { source: '', medium: 'x', campaign: 'y' }).indexOf('utm_source') >= 0) fl.push('old source not removed');
    try { build('http://', {}); fl.push('bad url accepted'); } catch (e) {}
    return Promise.resolve({ ok: !fl.length, n: 3, fails: fl });
  };
});
