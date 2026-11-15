/* Infinity by GroupChatOn — dns-lookup. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* DNS lookup: A, AAAA, CNAME, MX, TXT, NS, SOA, CAA, SRV and PTR records of any domain over encrypted DNS-over-HTTPS (Google Public DNS or Cloudflare). */
GCOTools.register('dns-lookup', function (spot, T) {
  var h = T.h, TYPES = { A: 1, NS: 2, CNAME: 5, SOA: 6, PTR: 12, MX: 15, TXT: 16, AAAA: 28, SRV: 33, DS: 43, DNSKEY: 48, HTTPS: 65, CAA: 257 }, NAMES = {};
  Object.keys(TYPES).forEach(function (k) { NAMES[TYPES[k]] = k; });
  var STATUS = { 0: 'OK', 1: 'Format error', 2: 'Server failure (SERVFAIL): the domain’s DNS is broken or not answering', 3: 'This domain does not exist (NXDOMAIN)', 4: 'Not implemented', 5: 'Refused' };
  var ALL = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA', 'CAA'];
  function normalize(s) {
    s = String(s || '').trim();
    if (!s) return '';
    if (/^[0-9a-f:]+$/i.test(s) && s.indexOf(':') >= 0) return s.toLowerCase();
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = 'http://' + s;
    try { return new URL(s).hostname.replace(/\.$/, '').replace(/^\[|\]$/g, '').toLowerCase(); } catch (e) { return ''; }
  }
  function reverse(ip) {
    if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return ip.split('.').reverse().join('.') + '.in-addr.arpa';
    if (ip.indexOf(':') < 0) return '';
    var parts = ip.split('::'), head = parts[0] ? parts[0].split(':') : [], tail = parts.length > 1 && parts[1] ? parts[1].split(':') : [];
    var fill = parts.length > 1 ? 8 - head.length - tail.length : 0, groups = head.concat(new Array(Math.max(0, fill)).fill('0'), tail);
    if (groups.length !== 8 || groups.some(function (g) { return !/^[0-9a-f]{1,4}$/i.test(g); })) return '';
    return groups.map(function (g) { return ('0000' + g).slice(-4); }).join('').toLowerCase().split('').reverse().join('.') + '.ip6.arpa';
  }
  function ttl(s) {
    s = +s;
    if (s >= 86400 && s % 3600 === 0) return (s / 86400 % 1 ? (s / 3600) + ' h' : s / 86400 + (s === 86400 ? ' day' : ' days'));
    if (s >= 3600) return Math.round(s / 360) / 10 + ' h';
    if (s >= 60) return Math.round(s / 6) / 10 + ' min';
    return s + ' s';
  }
  function pretty(type, data) {
    var m;
    if (type === 'MX' && (m = /^(\d+)\s+(\S+)$/.exec(data))) return ['Priority ' + m[1], m[2].replace(/\.$/, '')];
    if (type === 'SOA' && (m = data.split(/\s+/)).length >= 7) return ['Primary server ' + m[0].replace(/\.$/, ''), 'Admin ' + m[1].replace(/\.$/, '').replace('.', '@') + ' · serial ' + m[2]];
    if (type === 'TXT') return ['', data.replace(/^"|"$/g, '').replace(/"\s*"/g, '')];
    return ['', data.replace(/\.$/, '')];
  }
  function parse(json, type) {
    return {
      status: json.Status, secure: !!json.AD, type: type, text: STATUS[json.Status] || 'DNS error ' + json.Status,
      records: (json.Answer || []).map(function (a) { var t = NAMES[a.type] || String(a.type), p = pretty(t, String(a.data)); return { name: a.name.replace(/\.$/, ''), type: t, ttl: a.TTL, note: p[0], value: p[1] }; })
    };
  }
  function query(name, type, via) {
    var u = via === 'cf' ? 'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(name) + '&type=' + type : 'https://dns.google/resolve?name=' + encodeURIComponent(name) + '&type=' + type;
    return fetch(u, { headers: via === 'cf' ? { accept: 'application/dns-json' } : {}, credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('The DNS service answered ' + r.status + '.'); return r.json(); }).then(function (j) { return parse(j, type); });
  }
  var q = h('input', { type: 'text', placeholder: 'example.com, a full link, or an IP for reverse lookup', 'aria-label': 'Domain name', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off' });
  var type = T.select([['ALL', 'All common records']].concat(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA', 'SRV', 'PTR', 'DS', 'DNSKEY', 'HTTPS'].map(function (t) { return [t, t]; })), 'ALL');
  var via = T.seg([['google', 'Google DNS'], ['cf', 'Cloudflare']], T.store.get('dns-via', 'google'), function (v) { T.store.set('dns-via', v); });
  var out = h('div', { 'data-out': '', style: 'display:grid;gap:10px;min-width:0' }), status = T.status();
  function lookup() {
    var raw = q.value.trim(), t = type.value, name = normalize(raw);
    out.innerHTML = '';
    if (!raw) { status.error('Type a domain name first.'); return; }
    if (/^[\d.]+$|:/.test(name) && reverse(name)) { name = reverse(name); t = 'PTR'; }
    if (!name || !/^[a-z0-9_]([a-z0-9_-]*[a-z0-9_])?(\.[a-z0-9_]([a-z0-9_-]*[a-z0-9_])?)*$/i.test(name)) { status.error('“' + raw + '” is not a valid domain name.'); return; }
    var list = t === 'ALL' ? ALL : [t];
    status.info('Looking up ' + name + '…');
    Promise.all(list.map(function (x) { return query(name, x, via.value()).catch(function (e) { return { error: e.message, type: x, records: [] }; }); })).then(function (res) {
      if (res.every(function (r) { return r.error; })) throw new Error('Could not reach the DNS service. Check your connection, or try the other resolver.');
      var nx = res.filter(function (r) { return r.status === 3; }).length === res.length, found = 0;
      res.forEach(function (r) {
        if (!r.records.length) return;
        found += r.records.length;
        out.appendChild(h('div', { 'class': 'tcalc-scroll' }, [h('table', {}, [h('thead', {}, [h('tr', {}, ['Type', 'Value', '', 'TTL'].map(function (c) { return h('th', { text: c, style: 'text-align:left' }); }))]),
          h('tbody', {}, r.records.map(function (x) {
            return h('tr', {}, [h('td', { text: x.type }), h('td', { text: x.value, style: 'text-align:left;white-space:normal;overflow-wrap:anywhere;min-width:180px;font-family:ui-monospace,Consolas,monospace;font-size:13px' }),
              h('td', { text: x.note, style: 'text-align:left' }), h('td', { text: ttl(x.ttl), style: 'text-align:left' })]);
          }))])]));
      });
      var secure = res.some(function (r) { return r.secure; });
      if (nx) status.error(STATUS[3] + '. Check the spelling.');
      else if (!found) status.info('No ' + (t === 'ALL' ? '' : t + ' ') + 'records found for ' + name + '.');
      else status.ok('✓ ' + found + ' record' + (found === 1 ? '' : 's') + ' for ' + name + (secure ? ' · signed with DNSSEC ✓' : '') + '.');
    }).catch(function (e) { status.error(e.message); });
  }
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') lookup(); });
  spot.appendChild(T.card([T.field('Domain', q), h('div', { 'class': 'tgrid2' }, [T.field('Record type', type), T.field('Ask', via)]),
    T.row([T.button('Look up', { primary: true, onclick: lookup }), T.button('Try a sample', { small: true, onclick: function () { q.value = 'wikipedia.org'; type.value = 'ALL'; lookup(); } })]),
    status.el, out,
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: '🌐 Online tool: the domain name you type is sent over an encrypted connection to the public DNS service you choose (Google Public DNS or Cloudflare 1.1.1.1). Nothing else is sent, and nothing is stored by us.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['dns-lookup'] = function () {
    var f = [];
    [['https://www.Example.com:8080/path?q=1', 'www.example.com'], ['example.com.', 'example.com'], ['  mail.google.com ', 'mail.google.com'], ['bücher.de', 'xn--bcher-kva.de']].forEach(function (x) { if (normalize(x[0]) !== x[1]) f.push('normalize ' + x[0] + ' → ' + normalize(x[0])); });
    if (reverse('8.8.4.4') !== '4.4.8.8.in-addr.arpa') f.push('reverse v4 ' + reverse('8.8.4.4'));
    if (reverse('2001:db8::1') !== '1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa') f.push('reverse v6 ' + reverse('2001:db8::1'));
    [[45, '45 s'], [300, '5 min'], [3600, '1 h'], [86400, '1 day'], [172800, '2 days'], [5400, '1.5 h']].forEach(function (x) { if (ttl(x[0]) !== x[1]) f.push('ttl ' + x[0] + ' → ' + ttl(x[0])); });
    var p = parse({ Status: 0, AD: true, Answer: [{ name: 'example.com.', type: 15, TTL: 3600, data: '10 mail.example.com.' }, { name: 'example.com.', type: 16, TTL: 300, data: '"v=spf1 " "-all"' }] }, 'MX');
    if (!p.secure || p.records[0].value !== 'mail.example.com' || p.records[0].note !== 'Priority 10' || p.records[1].value !== 'v=spf1 -all' || p.records[1].type !== 'TXT') f.push('parse ' + JSON.stringify(p));
    if (parse({ Status: 3 }, 'A').text.indexOf('NXDOMAIN') < 0) f.push('nxdomain');
    return Promise.resolve({ ok: !f.length, n: 14, fails: f });
  };
});
