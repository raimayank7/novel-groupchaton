/* Infinity by GroupChatOn — sql-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* SQL checker: common mistakes (unclosed quotes, extra commas, UPDATE without WHERE, = NULL) found instantly, then a real SQL parser for MySQL, PostgreSQL, SQLite, SQL Server and more (node-sql-parser, loaded on first use). */
GCOTools.register('sql-check', function (spot, T) {
  var h = T.h, NSP = 'https://cdn.jsdelivr.net/npm/node-sql-parser@5.3.4/umd/', parsers = {}, chain = Promise.resolve();
  var DIALECTS = [['mysql', 'MySQL', 'MySQL'], ['postgresql', 'PostgreSQL', 'PostgresQL'], ['sqlite', 'SQLite', 'Sqlite'], ['transactsql', 'SQL Server', 'TransactSQL'],
    ['mariadb', 'MariaDB', 'MariaDB'], ['bigquery', 'BigQuery', 'BigQuery'], ['snowflake', 'Snowflake', 'Snowflake'], ['redshift', 'Redshift', 'Redshift']];
  var STARTS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'WITH', 'TRUNCATE', 'REPLACE', 'MERGE', 'GRANT', 'REVOKE', 'BEGIN', 'COMMIT', 'ROLLBACK', 'USE', 'SET',
    'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN', 'PRAGMA', 'VALUES', 'DECLARE', 'EXEC', 'EXECUTE', 'CALL', 'START', 'LOCK', 'UNLOCK', 'ANALYZE', 'VACUUM', 'COPY', 'COMMENT', 'RENAME', 'SAVEPOINT',
    'RELEASE', 'IF', 'PRINT', 'GO', 'UPSERT', 'OPTIMIZE', 'REINDEX', 'ATTACH', 'DETACH', 'LOAD', 'TABLE', 'LISTEN', 'NOTIFY', 'RETURN', 'RAISE'];
  function dist(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) d[i] = [i];
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function scan(sql) {
    var out = [], sk = '', i = 0, n = sql.length, depth = [], starts = [0];
    for (var k = 0; k < n; k++) if (sql[k] === '\n') starts.push(k + 1);
    function lineOf(p) { var lo = 0, hi = starts.length - 1; while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (starts[mid] <= p) lo = mid; else hi = mid - 1; } return lo + 1; }
    function add(sev, p, msg) { out.push({ sev: sev, line: lineOf(p), msg: msg }); }
    var CLOSE = { "'": "'", '"': '"', '`': '`', '[': ']' };
    while (i < n) {
      var c = sql[i];
      if (c === '-' && sql[i + 1] === '-') { while (i < n && sql[i] !== '\n') { sk += ' '; i++; } continue; }
      if (c === '/' && sql[i + 1] === '*') { var e = sql.indexOf('*/', i + 2); if (e < 0) { add('error', i, 'This /* comment is never closed.'); e = n - 2; } while (i < e + 2 && i < n) { sk += sql[i] === '\n' ? '\n' : ' '; i++; } continue; }
      if (CLOSE[c] && (c !== '[' || /[\s,(.=]/.test(sql[i - 1] || ' '))) {
        var st = i, end = CLOSE[c]; sk += c; i++;
        for (;;) {
          if (i >= n) { add('error', st, (c === "'" ? 'A text value' : 'A quoted name') + ' starting with ' + c + ' is never closed.'); break; }
          if (sql[i] === end) { if (sql[i + 1] === end && end !== ']') { sk += '  '; i += 2; continue; } sk += end; i++; break; }
          if (sql[i] === '\\' && c === "'") { sk += '  '; i += 2; continue; }
          sk += sql[i] === '\n' ? '\n' : ' '; i++;
        }
        continue;
      }
      if (c === '(') depth.push(i);
      if (c === ')') { if (!depth.length) add('error', i, 'Extra ) with no ( before it.'); else depth.pop(); }
      sk += c; i++;
    }
    depth.forEach(function (p) { add('error', p, 'This ( is never closed.'); });
    var pos = 0;
    sk.split(';').forEach(function (part) {
      var lead = part.length - part.replace(/^\s+/, '').length, p0 = pos + lead, t = part.trim(), m;
      pos += part.length + 1;
      if (!t) return;
      var w = (/^[A-Za-z_]+/.exec(t) || [''])[0].toUpperCase();
      if (w && STARTS.indexOf(w) < 0) {
        var best = STARTS.reduce(function (b, s) { var d = dist(w, s); return d < b[0] ? [d, s] : b; }, [9, '']);
        add('error', p0, 'Unknown statement “' + w + '”.' + (best[0] <= 2 ? ' Did you mean ' + best[1] + '?' : ''));
      }
      if (/^(UPDATE|DELETE)\b/i.test(t) && !/\bWHERE\b/i.test(t)) add('warn', p0, w + ' without WHERE changes every row in the table. Is a WHERE missing?');
      var cmp = /(?:=|<>|!=)\s*NULL\b/ig;
      while ((m = cmp.exec(t))) {
        var before = t.slice(0, m.index);
        if (/^UPDATE\b/i.test(t) && !/\bWHERE\b/i.test(before) && /=/.test(m[0])) continue;   // SET col = NULL is fine
        add('warn', p0 + m.index, '“' + m[0] + '” is never true. Use IS NULL or IS NOT NULL.');
      }
      if ((m = /,\s*(FROM|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT)\b/i.exec(t))) add('error', p0 + m.index, 'Extra comma before ' + m[1].toUpperCase().replace(/\s+/, ' ') + '.');
      if ((m = /\bSELECT\s*,/i.exec(t))) add('error', p0 + m.index, 'Extra comma right after SELECT.');
      if ((m = /\bINSERT\s+INTO\s+[\w."`\[\]]+\s*\(([^)]*)\)\s*VALUES\s*\(([^)]*)\)/i.exec(sql.slice(p0, p0 + t.length)))) {
        var a = m[1].split(',').length, b = m[2].split(',').length;
        if (a !== b && !/['"]/.test(m[2])) add('error', p0, 'INSERT lists ' + a + ' columns but gives ' + b + ' values.');
      }
    });
    return out;
  }
  function parser(d) {
    chain = chain.then(function () {
      if (parsers[d]) return parsers[d];
      return T.loadScript(NSP + d + '.umd.js').then(function () { parsers[d] = new window.NodeSQLParser.Parser(); return parsers[d]; });
    });
    return chain;
  }
  function check(sql, o) {
    var r = scan(sql), d = DIALECTS.filter(function (x) { return x[0] === o.dialect; })[0] || DIALECTS[0];
    if (r.some(function (x) { return x.sev === 'error'; })) return r;
    return parser(d[0]).then(function (p) {
      try { p.astify(sql, { database: d[2] }); }
      catch (e) {
        var loc = e.location && e.location.start, msg = String(e.message || e), found = /but (.+?) found\.?$/.exec(msg), exp = /^Expected (.+?) but /.exec(msg);
        var list = exp ? exp[1].split(/,\s*(?:or\s+)?|\s+or\s+/).map(function (s) { return s.replace(/^"|"$/g, ''); }).filter(function (s) { return s && !/whitespace|comment|^\[|^#|^--|^\/\*/.test(s); }).slice(0, 8) : [];
        r.push({ sev: 'error', line: loc ? loc.line : 0, col: loc ? loc.column : 0,
          msg: d[1] + ' syntax error' + (found ? ' at ' + (found[1] === 'end of input' ? 'the end: something is missing' : found[1]) : '') + '.' + (list.length ? ' Expected: ' + list.join(', ') + '.' : '') });
      }
      return r;
    });
  }
  function checkUI(o) {
    var status = T.status(), list = h('div', { 'class': 'tkv', 'data-out': '' }), timer, seq = 0;
    var input = h('textarea', { rows: '12', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': o.label, placeholder: o.ph || 'Paste your code here…' });
    input.value = T.store.get(o.id + '-in', '');
    function opts() { var r = {}; (o.options || []).forEach(function (el) { [el].concat([].slice.call(el.querySelectorAll('[data-opt]'))).forEach(function (x) { var k = x.getAttribute('data-opt'); if (k) r[k] = x.type === 'checkbox' ? x.checked : typeof x.value === 'function' ? x.value() : x.value; }); }); return r; }
    function show(line) {
      var L = input.value.split('\n'), p = 0;
      for (var k = 0; k < line - 1 && k < L.length; k++) p += L[k].length + 1;
      input.focus(); input.setSelectionRange(p, p + (L[line - 1] || '').length);
      input.scrollTop = Math.max(0, (line - 3) * (parseFloat(getComputedStyle(input).lineHeight) || 22));
    }
    function run() {
      T.store.set(o.id + '-in', input.value.slice(0, 200000));
      var tok = ++seq;
      if (!input.value.trim()) { list.innerHTML = ''; status.clear(); return; }
      status.info('Checking…');
      Promise.resolve().then(function () { return o.check(input.value, opts()); }).then(function (r) { if (tok === seq) draw(r); }, function (e) { if (tok === seq) { list.innerHTML = ''; status.error(e); } });
    }
    function draw(issues) {
      list.innerHTML = '';
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0) || (a.col || 0) - (b.col || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok);
      else status.info((e ? e + (e > 1 ? ' errors' : ' error') : 'No errors') + (w ? ', ' + w + (w > 1 ? ' warnings' : ' warning') : '') + '. Tap Show to jump to the line.');
      issues.slice(0, 300).forEach(function (x) {
        list.appendChild(h('div', {}, [h('span', { 'class': x.sev === 'error' ? 'tout-c' : '', style: 'font-weight:700', text: (x.sev === 'error' ? '✕ ' : '! ') + (x.line ? 'Line ' + x.line + (x.col ? ':' + x.col : '') : 'Whole file') }),
          h('span', { text: x.msg }), x.line ? T.button('Show', { small: true, onclick: function () { show(x.line); } }) : h('span')]));
      });
    }
    spot.appendChild(T.card([T.field(o.label, input), h('div', { 'class': 'topts' }, o.options),
      T.row([T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; run(); } }), T.button('Clear', { small: true, onclick: function () { input.value = ''; run(); input.focus(); } })]),
      status.el, list]));
    spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 500); });
    o.options.forEach(function (el) { el.addEventListener('change', run); });
    run();
  }
  checkUI({ id: 'sql-check', label: 'SQL to check', check: check, ok: '✓ No problems found: the SQL parses correctly.',
    options: [T.opt.select('dialect', 'Database', DIALECTS.map(function (d) { return [d[0], d[1]]; }), T.store.get('sql-dialect', 'mysql'))],
    sample: "SELECT c.name, COUNT(o.id) AS orders,\n       SUM(o.total) AS spent,\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE c.city = 'Pune' AND o.coupon = NULL\nGROUP BY c.name;\n\nUPDATE customers SET vip = 1;\n" });
  spot.querySelector('select').addEventListener('change', function (e) { T.store.set('sql-dialect', e.target.value); });
  T.tests['sql-check'] = function () {
    var f = [], c = function (s, err, warn, want) {
      var r = scan(s), e = r.filter(function (x) { return x.sev === 'error'; }).length, w = r.length - e;
      if (e !== err || w !== warn || (want && !r.some(function (x) { return x.msg.indexOf(want) >= 0; }))) f.push(s.slice(0, 40) + ' → ' + e + 'e/' + w + 'w ' + r.map(function (x) { return x.msg; }).join(' | ').slice(0, 160));
    };
    c('SELEC * FROM t', 1, 0, 'Did you mean SELECT'); c('UPDATE t SET a = 1', 0, 1, 'WHERE'); c('SELECT * FROM t WHERE a = NULL', 0, 1, 'IS NULL'); c("SELECT 'abc FROM t", 1, 0, 'never closed');
    c('SELECT a, b, FROM t', 1, 0, 'Extra comma'); c('SELECT (a + b FROM t', 1, 0, 'never closed'); c('INSERT INTO t (a, b) VALUES (1, 2, 3)', 1, 0, '2 columns');
    c("UPDATE t SET a = NULL WHERE id = 1; -- note ; here\nSELECT 'it''s', \"x\" FROM t /* ; */ WHERE b <> 'a;b'", 0, 0);
    var n = 8;
    return check('SELECT id, name FROM users WHERE age > 30 ORDER BY name;', { dialect: 'mysql' }).then(function (r) { n++; if (r.length) f.push('valid mysql → ' + r[0].msg); })
      .then(function () { return check('SELECT id name FROM users WHERE', { dialect: 'mysql' }); }).then(function (r) { n++; if (!r.some(function (x) { return /syntax error/.test(x.msg); })) f.push('parser missed error'); })
      .then(function () { return check('SELECT "id" FROM "users" LIMIT 5 OFFSET 2', { dialect: 'postgresql' }); }).then(function (r) { n++; if (r.length) f.push('valid postgres → ' + r[0].msg); })
      .then(function () { return { ok: !f.length, n: n, fails: f }; });
  };
});
