/* Infinity by GroupChatOn — subnet. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* IP subnet calculator (IPv4): network, broadcast, host range, mask, wildcard and host count from an address with /prefix or mask. */
GCOTools.register('subnet', function (spot, T) {
  function ip2n(s) {
    var p = s.split('.');
    if (p.length !== 4 || p.some(function (x) { return !/^\d{1,3}$/.test(x) || +x > 255; })) throw new Error('“' + s + '” is not an IPv4 address (four numbers 0–255, like 192.168.1.10).');
    return ((+p[0] << 24) >>> 0) + (+p[1] << 16) + (+p[2] << 8) + +p[3];
  }
  function n2ip(n) { return [n >>> 24, n >>> 16 & 255, n >>> 8 & 255, n & 255].join('.'); }
  function mask(c) { return c ? (0xFFFFFFFF << (32 - c)) >>> 0 : 0; }
  function maskToCidr(m) { var n = ip2n(m), c = 0; while (c < 32 && (n & (0x80000000 >>> c))) c++; if (mask(c) !== n) throw new Error(m + ' is not a valid subnet mask.'); return c; }
  function kind(n) {
    var a = n >>> 24, b = n >>> 16 & 255;
    if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return 'Private (LAN)';
    if (a === 127) return 'Loopback (this computer)';
    if (a === 169 && b === 254) return 'Link-local (no DHCP answer)';
    if (a === 100 && b >= 64 && b <= 127) return 'Carrier-grade NAT (shared by your ISP)';
    if (a >= 224 && a <= 239) return 'Multicast';
    if (a >= 240) return 'Reserved';
    return 'Public (internet)';
  }
  function calc(line) {
    var m = /^\s*([\d.]+)\s*(?:\/\s*(\d{1,2})|\s+([\d.]+))?\s*$/.exec(line);
    if (!m) throw new Error('Write an address and prefix, like 192.168.1.10/24 or 10.0.0.5 255.255.255.0');
    var ip = ip2n(m[1]), c = m[2] !== undefined ? +m[2] : m[3] ? maskToCidr(m[3]) : 24;
    if (c > 32) throw new Error('The prefix goes from /0 to /32.');
    var mk = mask(c), net = (ip & mk) >>> 0, bc = (net | (~mk >>> 0)) >>> 0, total = Math.pow(2, 32 - c);
    var first = c >= 31 ? net : net + 1, last = c >= 31 ? bc : bc - 1, usable = c === 32 ? 1 : c === 31 ? 2 : total - 2;
    var a = ip >>> 24, cls = a < 128 ? 'A' : a < 192 ? 'B' : a < 224 ? 'C' : a < 240 ? 'D (multicast)' : 'E';
    return { ip: n2ip(ip), cidr: c, net: n2ip(net), bc: n2ip(bc), mask: n2ip(mk), wild: n2ip(~mk >>> 0), first: n2ip(first), last: n2ip(last), usable: usable, total: total, cls: cls, kind: kind(ip),
      bin: ('00000000000000000000000000000000' + mk.toString(2)).slice(-32).replace(/(.{8})(?!$)/g, '$1.') };
  }
  function run(t) {
    return t.split(/\r?\n/).filter(function (l) { return l.trim(); }).map(function (l) {
      var r = calc(l), n = function (x) { return x.toLocaleString('en-US'); };
      return [r.ip + '/' + r.cidr, '  Network        ' + r.net + '/' + r.cidr, '  Subnet mask    ' + r.mask, '  Wildcard       ' + r.wild, '  Broadcast      ' + r.bc,
        '  Host range     ' + r.first + ' – ' + r.last, '  Usable hosts   ' + n(r.usable) + (r.cidr === 31 ? ' (point-to-point link)' : ''), '  All addresses  ' + n(r.total),
        '  Class          ' + r.cls, '  Type           ' + r.kind, '  Mask in binary ' + r.bin].join('\n');
    }).join('\n\n');
  }
  T.transformer(spot, { id: 'subnet', inLabel: 'IP address with /prefix or mask (one per line)', placeholder: '192.168.1.10/24', sample: '192.168.1.10/24\n10.20.30.40 255.255.240.0\n203.0.113.9/29', mono: true, rows: 4, outLabel: 'Subnet details', download: 'subnets.txt', run: run });
  T.tests['subnet'] = function () {
    var f = [], a = calc('192.168.1.10/24'), b = calc('10.20.30.40 255.255.240.0'), c = calc('203.0.113.9/29'), d = calc('8.8.8.8/32'), e = calc('10.0.0.0/31');
    if (a.net !== '192.168.1.0' || a.bc !== '192.168.1.255' || a.usable !== 254 || a.first !== '192.168.1.1' || a.kind !== 'Private (LAN)') f.push('/24 ' + JSON.stringify(a));
    if (b.cidr !== 20 || b.net !== '10.20.16.0' || b.bc !== '10.20.31.255' || b.wild !== '0.0.15.255') f.push('/20 ' + JSON.stringify(b));
    if (c.net !== '203.0.113.8' || c.last !== '203.0.113.14' || c.usable !== 6) f.push('/29');
    if (d.usable !== 1 || d.first !== '8.8.8.8' || d.kind !== 'Public (internet)') f.push('/32');
    if (e.usable !== 2 || e.last !== '10.0.0.1') f.push('/31');
    if (calc('172.16.5.4/0').total !== 4294967296) f.push('/0');
    try { calc('10.0.0.1 255.0.255.0'); f.push('bad mask accepted'); } catch (x) {}
    try { calc('300.1.1.1/8'); f.push('300 accepted'); } catch (x) {}
    return Promise.resolve({ ok: !f.length, n: 8, fails: f });
  };
});
