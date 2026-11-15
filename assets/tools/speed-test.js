/* Infinity by GroupChatOn — speed-test. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Internet speed test: measures download and upload speed, ping and jitter against Cloudflare's speed-test servers (speed.cloudflare.com), the same service as speed.cloudflare.com itself. */
GCOTools.register('speed-test', function (spot, T) {
  var h = T.h, CF = 'https://speed.cloudflare.com/', status = T.status(), running = false, stopNow = false;
  function mbps(bytes, ms) { return ms > 0 ? bytes * 8 / ms / 1000 : 0; }
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; }
  function jitter(a) { if (a.length < 2) return 0; var t = 0; for (var i = 1; i < a.length; i++) t += Math.abs(a[i] - a[i - 1]); return t / (a.length - 1); }
  function fmt(v) { return v >= 100 ? Math.round(v) + '' : v >= 10 ? v.toFixed(1) : v.toFixed(2); }
  function verdict(d) {
    if (d >= 100) return 'Very fast: 4K streaming on several screens, big downloads and video calls all at once.';
    if (d >= 25) return 'Fast: HD and 4K streaming, video calls and online games work well.';
    if (d >= 10) return 'Good: HD video and video calls work; large downloads take a while.';
    if (d >= 3) return 'Basic: web, WhatsApp and SD video are fine; HD video may buffer.';
    return 'Slow: pages and video will feel slow. Move closer to the Wi-Fi router or try mobile data.';
  }
  function rnd() { var a = new Uint32Array(2); crypto.getRandomValues(a); return a[0].toString(36) + a[1].toString(36); }
  var tiles = {}, box = h('div', { 'class': 'tstats', 'data-out': '' });
  [['down', 'Download (Mbps)'], ['up', 'Upload (Mbps)'], ['ping', 'Ping (ms)'], ['jit', 'Jitter (ms)']].forEach(function (k) { tiles[k[0]] = h('b', { text: '–' }); box.appendChild(h('div', { 'class': 'tstat' }, [tiles[k[0]], h('span', { text: k[1] })])); });
  var note = h('p', { 'class': 'tnote' }), where = h('p', { 'class': 'tnote', style: 'font-size:14px' });
  function ping() {
    var times = [], i = 0;
    function one() {
      if (i++ >= 10 || stopNow) return Promise.resolve();
      var t0 = performance.now();
      return fetch(CF + '__down?bytes=0&r=' + rnd(), { cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.arrayBuffer(); }).then(function () { times.push(performance.now() - t0); tiles.ping.textContent = fmt(median(times.slice(1).length ? times.slice(1) : times)); return one(); });
    }
    return one().then(function () { var t = times.slice(1); return { ping: median(t), jitter: jitter(t) }; });
  }
  function download(budget) {
    var sizes = [1e5, 1e6, 5e6, 10e6, 25e6, 50e6], results = [], t00 = performance.now();
    function next(k) {
      if (k >= sizes.length || stopNow || performance.now() - t00 > budget) return Promise.resolve();
      var t0 = performance.now(), got = 0;
      return fetch(CF + '__down?bytes=' + sizes[k] + '&r=' + rnd(), { cache: 'no-store', credentials: 'omit' }).then(function (r) {
        var rd = r.body.getReader();
        function pump() { return rd.read().then(function (c) { if (c.done) return; got += c.value.length; var ms = performance.now() - t0; if (ms > 200) tiles.down.textContent = fmt(mbps(got, ms)); if (stopNow) return rd.cancel(); return pump(); }); }
        return pump();
      }).then(function () { var ms = performance.now() - t0; results.push({ bytes: got, ms: ms, v: mbps(got, ms) }); if (ms > 4000) return; return next(k + 1); });
    }
    return next(0).then(function () { var big = results.filter(function (r) { return r.bytes >= 1e6 && r.ms > 300; }); var use = big.length ? big : results; return use.length ? Math.max.apply(null, use.slice(-2).map(function (r) { return r.v; })) : 0; });
  }
  function upload(budget) {
    var sizes = [1e5, 1e6, 3e6, 8e6], results = [], t00 = performance.now();
    function payload(n) { var b = new Uint8Array(n); for (var i = 0; i < n; i += 65536) crypto.getRandomValues(b.subarray(i, Math.min(n, i + 65536))); return b; }
    function next(k) {
      if (k >= sizes.length || stopNow || performance.now() - t00 > budget) return Promise.resolve();
      var body = payload(sizes[k]), t0 = performance.now();
      return fetch(CF + '__up?r=' + rnd(), { method: 'POST', body: body, cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.text(); }).then(function () {
        var ms = performance.now() - t0; results.push({ bytes: sizes[k], ms: ms, v: mbps(sizes[k], ms) }); tiles.up.textContent = fmt(results[results.length - 1].v);
        if (ms > 4000) return; return next(k + 1);
      });
    }
    return next(0).then(function () { var use = results.filter(function (r) { return r.bytes >= 1e6; }); use = use.length ? use : results; return use.length ? Math.max.apply(null, use.slice(-2).map(function (r) { return r.v; })) : 0; });
  }
  var start = T.button('▶ Start the test', { primary: true, onclick: function () {
    if (running) { stopNow = true; return; }
    running = true; stopNow = false; start.textContent = '■ Stop';
    ['down', 'up', 'ping', 'jit'].forEach(function (k) { tiles[k].textContent = '–'; }); note.textContent = '';
    var res = {};
    status.info('Measuring ping…');
    fetch(CF + 'meta', { cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
      if (m && (m.city || m.colo)) where.textContent = 'Test server: Cloudflare ' + [m.city, m.country].filter(Boolean).join(', ') + (m.asOrganization ? ' · your network: ' + m.asOrganization : '');
    }).catch(function () {});
    ping().then(function (p) {
      res.ping = p.ping; tiles.ping.textContent = fmt(p.ping); tiles.jit.textContent = fmt(p.jitter);
      status.info('Measuring download speed…'); return download(12000);
    }).then(function (d) {
      res.down = d; tiles.down.textContent = fmt(d);
      status.info('Measuring upload speed…'); return upload(10000).catch(function () { tiles.up.textContent = '–'; return null; });
    }).then(function (u) {
      if (u != null) tiles.up.textContent = fmt(u);
      if (stopNow) status.info('Stopped.');
      else { status.ok('✓ Done.'); note.textContent = verdict(res.down) + (res.ping > 100 ? ' Ping is high, so calls and games may lag.' : ''); }
    }).catch(function (e) { status.error(/fetch|network/i.test(e.message) ? 'Could not reach the speed-test server. Check that you are online, or an ad blocker may be blocking speed.cloudflare.com.' : e.message); })
      .then(function () { running = false; start.textContent = '▶ Start the test'; });
  } });
  spot.appendChild(T.card([box, T.row([start]), status.el, note, where,
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: '🌐 Online tool: the test downloads and uploads random data (up to about 100 MB on fast connections; less on slow ones) to Cloudflare’s speed-test servers, which see your IP address like any website. Nothing else is sent. On mobile data this uses your data allowance.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['speed-test'] = function () {
    var f = [];
    if (mbps(1e6, 1000) !== 8 || mbps(25e6, 2000) !== 100 || mbps(5, 0) !== 0) f.push('mbps');
    if (median([3, 1, 2]) !== 2 || median([4, 1, 3, 2]) !== 2.5 || median([]) !== 0) f.push('median');
    if (jitter([10, 12, 11]) !== 1.5 || jitter([5]) !== 0) f.push('jitter');
    if (fmt(123.4) !== '123' || fmt(45.67) !== '45.7' || fmt(3.456) !== '3.46') f.push('fmt');
    if (verdict(150).indexOf('Very fast') !== 0 || verdict(1).indexOf('Slow') !== 0) f.push('verdict');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
