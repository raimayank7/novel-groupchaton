/* Infinity by GroupChatOn — http-status. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* HTTP status codes: every common code with its meaning, searchable by number or word. */
GCOTools.register('http-status', function (spot, T) {
  var h = T.h;
  var CODES = [
    [100, 'Continue', 'The server got the request headers; the client can send the body.'],
    [101, 'Switching Protocols', 'The server agrees to switch protocol, for example to WebSocket.'],
    [103, 'Early Hints', 'Lets the browser start loading CSS or fonts while the page is still being prepared.'],
    [200, 'OK', 'The request worked and the answer is in the body.'],
    [201, 'Created', 'A new item was created (usually after a POST). Its address is often in the Location header.'],
    [202, 'Accepted', 'The request was accepted for later processing, but is not finished yet.'],
    [203, 'Non-Authoritative Information', 'The answer was changed by a proxy on the way.'],
    [204, 'No Content', 'It worked and there is nothing to send back, common after DELETE or a saved form.'],
    [205, 'Reset Content', 'It worked; the client should clear the form it sent.'],
    [206, 'Partial Content', 'Only part of the file is sent, because the client asked for a range (video seeking, resumed downloads).'],
    [207, 'Multi-Status', 'WebDAV: several results in one XML answer.'],
    [301, 'Moved Permanently', 'A permanent redirect: the page has a new address for good. Search engines move rankings to the new URL.'],
    [302, 'Found', 'A temporary redirect. Search engines keep the old URL.'],
    [303, 'See Other', 'Go to another URL with GET, typically after a form was submitted.'],
    [304, 'Not Modified', 'The copy in the browser cache is still fresh, so nothing is re-sent.'],
    [307, 'Temporary Redirect', 'Like 302, but the method (POST stays POST) and body must not change.'],
    [308, 'Permanent Redirect', 'Like 301, but the method and body must not change.'],
    [400, 'Bad Request', 'The server cannot read the request: broken JSON, a missing field or a malformed header.'],
    [401, 'Unauthorized', 'You are not signed in, or the token or API key is missing or wrong.'],
    [402, 'Payment Required', 'Reserved; some APIs use it when a plan or quota needs paying.'],
    [403, 'Forbidden', 'The server knows who you are, but you are not allowed to see this.'],
    [404, 'Not Found', 'Nothing exists at this address. Check the spelling of the URL.'],
    [405, 'Method Not Allowed', 'The address exists but not with this method, for example POST where only GET works.'],
    [406, 'Not Acceptable', 'The server cannot answer in any format listed in the Accept header.'],
    [407, 'Proxy Authentication Required', 'A proxy between you and the server needs you to sign in.'],
    [408, 'Request Timeout', 'The client took too long to send the request.'],
    [409, 'Conflict', 'The request clashes with the current state, for example editing an item someone else just changed.'],
    [410, 'Gone', 'The page was removed on purpose and will not come back. Search engines drop it faster than a 404.'],
    [411, 'Length Required', 'The request needs a Content-Length header.'],
    [412, 'Precondition Failed', 'A condition in the headers (If-Match, If-Unmodified-Since) is not true.'],
    [413, 'Content Too Large', 'The upload or body is bigger than the server allows.'],
    [414, 'URI Too Long', 'The address is too long, often because of a huge query string.'],
    [415, 'Unsupported Media Type', 'The body is in a format the server does not take (check Content-Type).'],
    [416, 'Range Not Satisfiable', 'The requested byte range is outside the file.'],
    [417, 'Expectation Failed', 'The server cannot meet the Expect header.'],
    [418, "I'm a teapot", 'An April Fools joke from 1998 (RFC 2324). Some sites use it to turn away bots.'],
    [421, 'Misdirected Request', 'The request reached a server that cannot answer for this domain.'],
    [422, 'Unprocessable Content', 'The format is fine but the data is not, for example a failed validation.'],
    [423, 'Locked', 'WebDAV: the item is locked.'],
    [425, 'Too Early', 'The server will not risk processing a request that might be replayed.'],
    [426, 'Upgrade Required', 'Switch to another protocol (named in the Upgrade header) and try again.'],
    [428, 'Precondition Required', 'The server wants a conditional request to avoid lost updates.'],
    [429, 'Too Many Requests', 'Rate limit hit: slow down. The Retry-After header says how long to wait.'],
    [431, 'Request Header Fields Too Large', 'The headers, often cookies, are too big. Clearing cookies usually fixes it.'],
    [451, 'Unavailable For Legal Reasons', 'Blocked because of a legal demand, such as a court order.'],
    [500, 'Internal Server Error', 'Something broke on the server. Check the server logs; it is not the visitor’s fault.'],
    [501, 'Not Implemented', 'The server does not support this method at all.'],
    [502, 'Bad Gateway', 'A proxy or load balancer got a bad answer from the server behind it (often the app crashed or is restarting).'],
    [503, 'Service Unavailable', 'The server is overloaded or down for maintenance. Usually temporary.'],
    [504, 'Gateway Timeout', 'A proxy waited too long for the server behind it.'],
    [505, 'HTTP Version Not Supported', 'The server does not support this HTTP version.'],
    [507, 'Insufficient Storage', 'The server has no room to store what was sent.'],
    [508, 'Loop Detected', 'WebDAV: the server found an endless loop.'],
    [511, 'Network Authentication Required', 'Sign in to the network first, as on hotel or airport Wi-Fi.'],
    [520, 'Unknown Error (Cloudflare)', 'Cloudflare got an empty or unexpected answer from the origin server.'],
    [521, 'Web Server Is Down (Cloudflare)', 'The origin server refused Cloudflare’s connection.'],
    [522, 'Connection Timed Out (Cloudflare)', 'Cloudflare could not reach the origin server in time.'],
    [524, 'A Timeout Occurred (Cloudflare)', 'The origin server accepted the connection but took over 100 seconds to answer.']
  ];
  var GROUP = { 1: '1xx Information', 2: '2xx Success', 3: '3xx Redirection', 4: '4xx Client error (your request)', 5: '5xx Server error' };
  function find(q) {
    q = q.trim().toLowerCase();
    if (!q) return CODES;
    var n = q.replace(/x/g, '');
    return CODES.filter(function (c) { return /^\d+x*$/.test(q) ? String(c[0]).indexOf(n) === 0 : (c[1] + ' ' + c[2]).toLowerCase().indexOf(q) >= 0; });
  }
  var q = h('input', { type: 'search', placeholder: 'Type a code (404, 5xx) or a word (redirect, timeout)…', 'aria-label': 'Search status codes' });
  var out = h('div', { 'class': 'tkv', 'data-out': '' }), note = h('p', { 'class': 'tstatus' });
  function draw() {
    var r = find(q.value), last = 0;
    out.innerHTML = '';
    r.forEach(function (c) {
      var g = Math.floor(c[0] / 100);
      if (g !== last) { out.appendChild(h('b', { text: GROUP[g] })); last = g; }
      out.appendChild(h('div', {}, [h('code', { text: String(c[0]) }), h('span', {}, [h('b', { text: c[1] }), h('br'), h('small', { text: c[2] })]),
        T.button('Copy', { small: true, onclick: function (e) { T.copy(c[0] + ' ' + c[1], e.currentTarget); } })]));
    });
    note.textContent = r.length ? r.length + ' status code' + (r.length > 1 ? 's' : '') : 'No status code matches that. Try a number like 404 or a word like “redirect”.';
  }
  q.addEventListener('input', draw);
  spot.appendChild(T.card([T.field('Find a status code', q), T.row(['2xx', '3xx', '4xx', '5xx'].map(function (g) { return T.button(g, { small: true, onclick: function () { q.value = g; draw(); } }); })
    .concat([T.button('All', { small: true, onclick: function () { q.value = ''; draw(); } })])), note, out]));
  draw();
  T.tests['http-status'] = function () {
    var f = [], one = function (s) { var r = find(s); return r.length === 1 ? r[0][1] : r.length + ' results'; };
    if (one('404') !== 'Not Found') f.push('404 ' + one('404'));
    if (one('teapot') !== "I'm a teapot") f.push('teapot');
    if (find('5xx').some(function (c) { return c[0] < 500; })) f.push('5xx filter');
    if (find('redirect').length < 4) f.push('redirect search');
    if (CODES.length < 55) f.push('only ' + CODES.length + ' codes');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
