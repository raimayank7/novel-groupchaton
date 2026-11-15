/* Infinity by GroupChatOn — api-tester. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* API request tester: send GET, POST, PUT, PATCH or DELETE requests with headers and a body, and read the status, timing, headers and formatted response. */
GCOTools.register('api-tester', function (spot, T) {
  var h = T.h, status = T.status();
  function headers(t) {
    var o = {};
    t.split(/\r?\n/).forEach(function (l, i) { l = l.trim(); if (!l || l[0] === '#') return; var k = l.indexOf(':'); if (k < 1) throw new Error('Header line ' + (i + 1) + ' needs “Name: value”.'); o[l.slice(0, k).trim()] = l.slice(k + 1).trim(); });
    return o;
  }
  function pretty(text, type) {
    if (/json/i.test(type || '') || /^\s*[\[{]/.test(text)) { try { return JSON.stringify(JSON.parse(text), null, 2); } catch (e) {} }
    return text;
  }
  var method = T.select(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].map(function (m) { return [m, m]; }), 'GET'), url = h('input', { type: 'url', 'class': 'tmono', value: T.store.get('api-url', 'https://jsonplaceholder.typicode.com/todos/1'), 'aria-label': 'URL' });
  var hdr = h('textarea', { rows: '3', 'class': 'tin tmono', placeholder: 'Content-Type: application/json\nAuthorization: Bearer …', 'aria-label': 'Headers' }), body = h('textarea', { rows: '5', 'class': 'tin tmono', placeholder: '{ "title": "Hello" }', 'aria-label': 'Body' });
  var meta = h('div', { 'class': 'tstats' }), resH = h('textarea', { rows: '5', 'class': 'tout tmono', readonly: true, 'aria-label': 'Response headers' }), resB = h('textarea', { rows: '12', 'class': 'tout tmono', readonly: true, 'aria-label': 'Response body' });
  function send() {
    var hs; try { hs = headers(hdr.value); } catch (e) { status.error(e); return; }
    var m = method.value, init = { method: m, headers: hs };
    if (body.value.trim() && m !== 'GET' && m !== 'HEAD') { init.body = body.value; if (!Object.keys(hs).some(function (k) { return /^content-type$/i.test(k); }) && /^\s*[\[{]/.test(body.value)) hs['Content-Type'] = 'application/json'; }
    T.store.set('api-url', url.value);
    status.info('Sending…'); meta.innerHTML = ''; resH.value = resB.value = '';
    var t0 = performance.now();
    fetch(url.value.trim(), init).then(function (r) {
      var ms = Math.round(performance.now() - t0), list = [];
      r.headers.forEach(function (v, k) { list.push(k + ': ' + v); }); resH.value = list.join('\n');
      return r.text().then(function (t) {
        resB.value = pretty(t, r.headers.get('content-type'));
        [[r.status + ' ' + (r.statusText || ''), 'status'], [ms + ' ms', 'time'], [T.bytes(new Blob([t]).size), 'size']].forEach(function (x) { meta.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: x[0] }), h('span', { text: x[1] })])); });
        if (r.ok) status.ok('Done.'); else status.error(r.status + ': the server answered with an error (see the body for details).');
      });
    }).catch(function (e) { status.error('No answer: ' + e.message + '. The address may be wrong, offline, or the server does not allow requests from web pages (CORS).'); });
  }
  spot.appendChild(T.card([T.row([method, h('div', { style: 'flex:1;min-width:200px' }, [url])]), T.field('Headers (one per line)', hdr), T.field('Body (for POST, PUT, PATCH)', body),
    T.row([T.button('Send', { primary: true, onclick: send }), T.button('Try a sample', { small: true, onclick: function () { method.value = 'GET'; url.value = 'data:application/json,' + encodeURIComponent('{"id":1,"title":"Sample response","done":false}'); send(); } })]),
    status.el, meta, T.field('Response body', resB), T.field('Response headers', resH),
    h('p', { 'class': 'tstatus', text: 'Requests go straight from your browser to the address you type; we never see them. Keys you type are not saved. Servers must allow browser requests (CORS) for the answer to be readable.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['api-tester'] = function () {
    var f = [], hs = headers('Content-Type: application/json\n# note\nAuthorization: Bearer a:b');
    if (hs['Authorization'] !== 'Bearer a:b' || Object.keys(hs).length !== 2) f.push('headers');
    try { headers('nocolon'); f.push('bad header accepted'); } catch (e) {}
    if (pretty('{"a":[1]}', 'application/json') !== '{\n  "a": [\n    1\n  ]\n}' || pretty('<p>x</p>', 'text/html') !== '<p>x</p>') f.push('pretty');
    return fetch('data:application/json,{"ok":true}').then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) f.push('fetch'); return { ok: !f.length, n: 4, fails: f }; });
  };
});
