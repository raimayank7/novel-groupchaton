/* Infinity by GroupChatOn — escape-string. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Escape / unescape strings for JSON, JavaScript, HTML, URLs, CSV, SQL and regular expressions. */
GCOTools.register('escape-string', function (spot, T) {
  var HTML = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  var F = {
    json: [function (s) { return JSON.stringify(s).slice(1, -1); }, function (s) { return JSON.parse('"' + s.replace(/(^|[^\\])"/g, '$1\\"') + '"'); }],
    js: [function (s) { return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\$\{/g, '\\${'); },
      function (s) { return s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, function (m, c) {
        if (c[0] === 'u') return String.fromCodePoint(parseInt(c.replace(/[u{}]/g, ''), 16));
        if (c[0] === 'x') return String.fromCharCode(parseInt(c.slice(1), 16));
        return { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' }[c] || c; }); }],
    html: [function (s) { return s.replace(/[&<>"']/g, function (c) { return HTML[c]; }); },
      function (s) { var d = document.createElement('textarea'); d.innerHTML = s; return d.value; }],
    url: [encodeURIComponent, function (s) { return decodeURIComponent(s.replace(/\+/g, ' ')); }],
    csv: [function (s) { return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }, function (s) { var t = s.trim(); return /^".*"$/s.test(t) ? t.slice(1, -1).replace(/""/g, '"') : s; }],
    sql: [function (s) { return "'" + s.replace(/'/g, "''") + "'"; }, function (s) { var t = s.trim(); return (/^'.*'$/s.test(t) ? t.slice(1, -1) : t).replace(/''/g, "'"); }],
    regex: [function (s) { return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); }, function (s) { return s.replace(/\\([.*+?^${}()|[\]\\\/])/g, '$1'); }]
  };
  function run(t, o) { return F[o.kind][o.dir === 'un' ? 1 : 0](t); }
  T.transformer(spot, { id: 'escape-string', inLabel: 'Your text', mono: true, sample: 'He said "Hi!" & left.\nPath: C:\\new\\tab',
    options: [T.opt.select('kind', 'For', [['json', 'JSON string'], ['js', 'JavaScript string'], ['html', 'HTML (& < > " \')'], ['url', 'URL (percent-encoding)'], ['csv', 'CSV cell'], ['sql', 'SQL string literal'], ['regex', 'Regular expression']], 'json'),
      T.opt.select('dir', 'Do', [['esc', 'Escape'], ['un', 'Unescape']], 'esc')],
    run: run });
  T.tests['escape-string'] = function () {
    var f = [], s = 'He said "Hi!" & left.\nC:\\new\t<b>\'x\'</b>';
    Object.keys(F).forEach(function (k) { var e = run(s, { kind: k, dir: 'esc' }), u = run(e, { kind: k, dir: 'un' }); if (u !== s) f.push(k + ' round trip → ' + JSON.stringify(u)); });
    if (run('a"b', { kind: 'json', dir: 'esc' }) !== 'a\\"b') f.push('json');
    if (run("it's", { kind: 'sql', dir: 'esc' }) !== "'it''s'") f.push('sql');
    if (run('1+1=2?', { kind: 'regex', dir: 'esc' }) !== '1\\+1=2\\?') f.push('regex');
    if (run('a,b', { kind: 'csv', dir: 'esc' }) !== '"a,b"') f.push('csv');
    return Promise.resolve({ ok: !f.length, n: 11, fails: f });
  };
});
