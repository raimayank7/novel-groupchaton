/* Infinity by GroupChatOn — sql-format. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* SQL formatter: indents and lines up SQL for MySQL, PostgreSQL, SQL Server, SQLite, Oracle PL/SQL, BigQuery and more (sql-formatter), or squeezes it onto one line. */
GCOTools.register('sql-format', function (spot, T) {
  var SF = 'https://cdn.jsdelivr.net/npm/sql-formatter@15.4.5/dist/sql-formatter.min.js';
  var DIALECTS = [['sql', 'Standard SQL'], ['mysql', 'MySQL'], ['mariadb', 'MariaDB'], ['postgresql', 'PostgreSQL'], ['tsql', 'SQL Server (T-SQL)'], ['sqlite', 'SQLite'], ['plsql', 'Oracle PL/SQL'],
    ['bigquery', 'Google BigQuery'], ['snowflake', 'Snowflake'], ['redshift', 'Amazon Redshift'], ['spark', 'Spark SQL'], ['db2', 'IBM Db2'], ['trino', 'Trino / Presto']];
  // one line: comments removed, runs of spaces squeezed, quoted text left untouched
  function minify(sql) {
    var out = '', i = 0, n = sql.length, keep = [];
    while (i < n) {
      var c = sql[i];
      if (c === '-' && sql[i + 1] === '-') { while (i < n && sql[i] !== '\n') i++; out += ' '; continue; }
      if (c === '/' && sql[i + 1] === '*') { var e = sql.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; out += ' '; continue; }
      if (c === "'" || c === '"' || c === '`') { var j = i + 1; while (j < n && (sql[j] !== c || sql[j + 1] === c)) j += sql[j] === c ? 2 : 1; keep.push(sql.slice(i, j + 1)); out += '\u0001' + (keep.length - 1) + '\u0001'; i = j + 1; continue; }
      out += c; i++;
    }
    out = out.replace(/\s+/g, ' ').replace(/\s*([,;])\s*/g, '$1 ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
    return out.replace(/\u0001(\d+)\u0001/g, function (m, k) { return keep[+k]; });
  }
  function format(sql, o) {
    if (o.minify) return minify(sql);
    return T.loadScript(SF).then(function () {
      try {
        return window.sqlFormatter.format(sql, { language: o.dialect || 'sql', tabWidth: o.indent === 'tab' ? 1 : +o.indent || 2, useTabs: o.indent === 'tab', keywordCase: o.kw || 'upper',
          linesBetweenQueries: 1, logicalOperatorNewline: 'before', denseOperators: false });
      } catch (e) { throw new Error('Could not format this SQL: ' + String(e.message || e).split('\n')[0]); }
    });
  }
  var opts = [T.opt.select('dialect', 'Database', DIALECTS, T.store.get('sql-format-dialect', 'sql')), T.opt.select('kw', 'Keywords', [['upper', 'UPPER case'], ['lower', 'lower case'], ['preserve', 'Keep as typed']], 'upper'),
    T.opt.select('indent', 'Indent', [['2', '2 spaces'], ['4', '4 spaces'], ['tab', 'Tab']], '2'), T.opt.check('minify', 'One line (minify)', false)];
  opts[0].querySelector('select').addEventListener('change', function (e) { T.store.set('sql-format-dialect', e.target.value); });
  T.transformer(spot, { id: 'sql-format', inLabel: 'SQL to format', outLabel: 'Formatted SQL', mono: true, rows: 12, download: 'query.sql', type: 'application/sql', run: format, options: opts,
    sample: "select o.id, c.name as customer, sum(i.qty*i.price) total from orders o join customers c on c.id=o.customer_id left join order_items i on i.order_id=o.id where o.status in ('paid','shipped') and o.created_at>='2024-01-01' group by o.id, c.name having sum(i.qty*i.price)>1000 order by total desc limit 20;",
    note: function (a, b) { return b ? '✓ ' + b.split('\n').length + (b.split('\n').length === 1 ? ' line' : ' lines') : ''; } });
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['sql-format'] = function () {
    var f = [];
    var m = minify("SELECT  a ,\n  b -- note\nFROM t /* x */ WHERE  s = 'two  spaces' AND f( 1 , 2 ) ;");
    if (m !== "SELECT a, b FROM t WHERE s = 'two  spaces' AND f(1, 2);") f.push('minify → ' + m);
    return format('select a, b from t where c = 1 and d = 2', { dialect: 'mysql', kw: 'upper', indent: '2' }).then(function (r) {
      if (r !== 'SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  c = 1\n  AND d = 2') f.push('format → ' + JSON.stringify(r));
      return format('SELECT TOP 5 [Name] FROM [dbo].[Users]', { dialect: 'tsql', kw: 'lower', indent: '4' });
    }).then(function (r) {
      if (r !== 'select\n    top 5 [Name]\nfrom\n    [dbo].[Users]') f.push('tsql → ' + JSON.stringify(r));
      return { ok: !f.length, n: 3, fails: f };
    });
  };
});
