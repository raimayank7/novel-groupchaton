/* Infinity by GroupChatOn — ip-lookup. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* What is my IP: shows your public IP address and its approximate location, network and time zone (from the free GeoJS service), and looks up any other IP. */
GCOTools.register('ip-lookup', function (spot, T) {
  var h = T.h, API = 'https://get.geojs.io/v1/ip/geo';
  function isIPv4(s) { return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(s); }
  function isIPv6(s) {
    if (!/^[0-9a-f:.]+$/i.test(s) || s.indexOf(':') < 0) return false;
    var dbl = s.split('::'), v4 = 0;
    if (dbl.length > 2) return false;
    var g = (dbl[0] ? dbl[0].split(':') : []).concat(dbl.length > 1 && dbl[1] ? dbl[1].split(':') : []);
    if (g.length && g[g.length - 1].indexOf('.') >= 0) { if (!isIPv4(g.pop())) return false; v4 = 2; }
    if (g.some(function (x) { return !/^[0-9a-f]{1,4}$/i.test(x); })) return false;
    return dbl.length > 1 ? g.length + v4 < 8 : g.length + v4 === 8;
  }
  function kind(ip) {
    if (isIPv4(ip)) {
      var p = ip.split('.').map(Number);
      if (p[0] === 10 || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168)) return 'IPv4 · private (home or office network)';
      if (p[0] === 127) return 'IPv4 · this device (loopback)';
      if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return 'IPv4 · shared (carrier-grade NAT)';
      return 'IPv4 · public';
    }
    if (isIPv6(ip)) return /^f[cd]/i.test(ip) ? 'IPv6 · private' : /^fe80/i.test(ip) ? 'IPv6 · link-local' : ip === '::1' ? 'IPv6 · this device' : 'IPv6 · public';
    return '';
  }
  function rows(d) {
    var place = [d.city, d.region, d.country].filter(Boolean).join(', ');
    var r = [['IP address', d.ip], ['Type', kind(d.ip)], ['Location (approximate)', place || 'Unknown'], ['Country code', d.country_code || ''],
      ['Time zone', d.timezone || ''], ['Network / ISP', d.organization_name || (d.organization || '').replace(/^AS\d+\s*/, '') || ''], ['ASN', d.asn ? 'AS' + d.asn : '']];
    if (d.latitude && d.longitude) r.push(['Coordinates', (+d.latitude).toFixed(2) + ', ' + (+d.longitude).toFixed(2) + (d.accuracy ? ' (± ' + d.accuracy + ' km)' : '')]);
    return r.filter(function (x) { return x[1]; });
  }
  var box = h('div', { 'data-out': '' }), status = T.status(), q = h('input', { type: 'text', placeholder: 'For example 8.8.8.8 or 2606:4700::1111', 'aria-label': 'IP address to look up', inputmode: 'text', autocomplete: 'off', spellcheck: 'false' });
  function show(d) {
    box.innerHTML = '';
    box.appendChild(h('div', { 'class': 'tstats' }, [h('div', { 'class': 'tstat tstat-wide' }, [h('b', { text: d.ip, style: 'overflow-wrap:anywhere' }), h('span', { text: kind(d.ip) })])]));
    box.appendChild(h('div', { 'class': 'tkv', style: 'margin-top:8px' }, rows(d).slice(1).map(function (r) {
      return h('div', {}, [h('span', { text: r[0] }), h('code', { text: String(r[1]) }), T.button('Copy', { small: true, onclick: function (e) { T.copy(String(r[1]), e.currentTarget); } })]);
    })));
    if (d.latitude && d.longitude) box.appendChild(h('p', { 'class': 'tnote' }, [h('a', { href: 'https://www.openstreetmap.org/?mlat=' + (+d.latitude) + '&mlon=' + (+d.longitude) + '#map=9/' + (+d.latitude) + '/' + (+d.longitude), target: '_blank', rel: 'noopener', text: 'See the area on OpenStreetMap ↗' })]));
  }
  function look(ip) {
    status.info('Asking GeoJS…');
    return fetch(API + (ip ? '/' + encodeURIComponent(ip) : '') + '.json', { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('The lookup service answered ' + r.status + '. Try again in a minute.'); return r.json(); })
      .then(function (d) { d = Array.isArray(d) ? d[0] : d; if (!d || !d.ip) throw new Error('No details found for this address.'); show(d); status.ok(ip ? '✓ Details for ' + ip : '✓ This is the address websites see when you visit them.'); return d; })
      .catch(function (e) { status.error(/fetch|network/i.test(e.message) ? 'Could not reach the lookup service. Check your connection, or an ad blocker may be blocking it.' : e.message); });
  }
  function other() {
    var ip = q.value.trim();
    if (!ip) return look('');
    if (!isIPv4(ip) && !isIPv6(ip)) { status.error('“' + ip + '” is not an IP address. For a website name, use the DNS Lookup tool to find its IP first.'); return; }
    look(ip);
  }
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') other(); });
  spot.appendChild(T.card([box, status.el, T.field('Look up another IP address', q), T.row([T.button('Look up', { primary: true, onclick: other }), T.button('My IP again', { small: true, onclick: function () { q.value = ''; look(''); } })]),
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: '🌐 Online tool: your IP address (or the one you type) is sent to GeoJS (get.geojs.io), a free lookup service, to find the approximate location. Nothing else is sent, and nothing is stored by us.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  look('');
  T.tests['ip-lookup'] = function () {
    var f = [], ok4 = ['8.8.8.8', '192.168.1.10', '0.0.0.0', '255.255.255.255'], bad4 = ['256.1.1.1', '1.2.3', '01.2.3.4', '1.2.3.4.5', 'a.b.c.d'],
      ok6 = ['2606:4700::1111', '::1', '2001:db8:0:0:0:0:2:1', 'fe80::1', '::ffff:192.0.2.1'], bad6 = ['2001:db8::1::2', '12345::1', 'gggg::1', '1:2:3:4:5:6:7:8:9'];
    ok4.forEach(function (x) { if (!isIPv4(x)) f.push('v4 rejected ' + x); }); bad4.forEach(function (x) { if (isIPv4(x)) f.push('v4 accepted ' + x); });
    ok6.forEach(function (x) { if (!isIPv6(x)) f.push('v6 rejected ' + x); }); bad6.forEach(function (x) { if (isIPv6(x)) f.push('v6 accepted ' + x); });
    if (kind('10.0.0.5').indexOf('private') < 0 || kind('8.8.8.8') !== 'IPv4 · public') f.push('kind');
    var r = rows({ ip: '8.8.8.8', city: 'Mountain View', region: 'California', country: 'United States', country_code: 'US', timezone: 'America/Los_Angeles', organization_name: 'GOOGLE', asn: 15169, latitude: '37.4223', longitude: '-122.0861' });
    if (r[2][1] !== 'Mountain View, California, United States' || r[6][1] !== 'AS15169' || r[7][1] !== '37.42, -122.09') f.push('rows ' + JSON.stringify(r));
    return Promise.resolve({ ok: !f.length, n: 20, fails: f });
  };
});
