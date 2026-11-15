/* Infinity by GroupChatOn — sql-run. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* SQL playground: a real SQLite database in the browser (sql.js, WebAssembly) with sample tables, result tables, your own .sqlite / .db files and download of the changed database. */
GCOTools.register('sql-run', function (spot, T) {
  var h = T.h, V = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/', SQL = null, db = null;
  var SCHEMA = "CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, joined DATE);\n" +
    "INSERT INTO customers VALUES (1,'Asha Verma','Pune','2024-01-15'),(2,'Rahul Singh','Delhi','2024-03-02'),(3,'Maria Lopez','Madrid','2024-05-20'),(4,'Chen Wei','Singapore','2024-07-08'),(5,'Fatima Khan','Dubai','2024-09-30');\n" +
    "CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product TEXT, qty INTEGER, price REAL, ordered DATE);\n" +
    "INSERT INTO orders VALUES (1,1,'Notebook',3,45.0,'2024-02-01'),(2,1,'Pen pack',2,120.0,'2024-02-10'),(3,2,'Backpack',1,899.0,'2024-03-15'),(4,3,'Notebook',5,45.0,'2024-06-01'),(5,4,'Desk lamp',1,1499.0,'2024-07-20'),(6,4,'Pen pack',4,120.0,'2024-08-02'),(7,5,'Backpack',2,899.0,'2024-10-05'),(8,2,'Notebook',2,45.0,'2024-11-11');";
  var EXAMPLES = [['Top customers', "SELECT c.name, c.city, COUNT(o.id) AS orders, SUM(o.qty * o.price) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY spent DESC;"],
    ['Best products', "SELECT product, SUM(qty) AS units, ROUND(SUM(qty * price), 2) AS revenue\nFROM orders\nGROUP BY product\nORDER BY revenue DESC;"],
    ['Monthly sales', "SELECT strftime('%Y-%m', ordered) AS month, SUM(qty * price) AS sales\nFROM orders\nGROUP BY month\nORDER BY month;"],
    ['Add a row', "INSERT INTO customers (name, city, joined) VALUES ('Ola Nordmann', 'Oslo', date('now'));\nSELECT * FROM customers ORDER BY id DESC LIMIT 3;"]];
  function load() {
    if (SQL) return Promise.resolve(SQL);
    return T.loadScript(V + 'sql-wasm.js').then(function () { return window.initSqlJs({ locateFile: function (f) { return V + f; } }); }).then(function (s) { SQL = s; return s; });
  }
  function fresh(bytes) {
    return load().then(function (S) { if (db) db.close(); db = bytes ? new S.Database(bytes) : new S.Database(); if (!bytes) db.run(SCHEMA); drawTables(); return db; });
  }
  function exec(sql) {
    return (db ? Promise.resolve(db) : fresh()).then(function (d) {
      var t0 = performance.now(), res = d.exec(sql);
      return { sets: res, changed: d.getRowsModified(), ms: performance.now() - t0 };
    });
  }
  function cell(v) { return v === null ? 'NULL' : v instanceof Uint8Array ? '[BLOB ' + v.length + ' bytes]' : String(v); }
  var editor = h('textarea', { rows: '8', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'SQL' });
  editor.value = T.store.get('sql-run-sql', EXAMPLES[0][1]);
  editor.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
    if (e.key === 'Tab') { e.preventDefault(); editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end'); }
  });
  var results = h('div', { 'data-out': '', style: 'display:grid;gap:12px;min-width:0' }), tables = h('p', { 'class': 'tnote', style: 'font-size:14px' }), status = T.status();
  function drawTables() {
    var t = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    var names = t.length ? t[0].values.map(function (r) { return r[0]; }) : [];
    tables.textContent = names.length ? 'Tables: ' + names.map(function (n) {
      var cols = db.exec('PRAGMA table_info(' + JSON.stringify(n) + ')');
      return n + ' (' + (cols.length ? cols[0].values.map(function (c) { return c[1]; }).join(', ') : '') + ')';
    }).join(' · ') : 'The database is empty: CREATE TABLE to start.';
  }
  function run() {
    T.store.set('sql-run-sql', editor.value.slice(0, 50000));
    results.innerHTML = '';
    if (!editor.value.trim()) return;
    status.info(SQL ? 'Running…' : 'Loading SQLite (about 1 MB, only the first time)…');
    exec(editor.value).then(function (r) {
      r.sets.forEach(function (s) {
        var body = s.values.slice(0, 1000);
        results.appendChild(h('div', { 'class': 'tcalc-scroll' }, [h('table', { style: 'text-align:left' }, [
          h('thead', {}, [h('tr', {}, s.columns.map(function (c) { return h('th', { text: c, style: 'text-align:left' }); }))]),
          h('tbody', {}, body.map(function (row) { return h('tr', {}, row.map(function (v) { return h('td', { text: cell(v), style: 'text-align:' + (typeof v === 'number' ? 'right' : 'left') }); })); }))])]));
        if (s.values.length > 1000) results.appendChild(h('p', { 'class': 'tnote', text: 'Showing the first 1,000 of ' + s.values.length.toLocaleString() + ' rows.' }));
      });
      var rows = r.sets.reduce(function (a, s) { return a + s.values.length; }, 0);
      status.ok('✓ Done in ' + Math.max(1, Math.round(r.ms)) + ' ms' + (r.sets.length ? ' · ' + rows + (rows === 1 ? ' row' : ' rows') : '') + (r.changed ? ' · ' + r.changed + ' row' + (r.changed === 1 ? '' : 's') + ' changed' : '') + '.');
      drawTables();
    }).catch(function (e) { status.error('SQLite error: ' + (e.message || e)); });
  }
  var file = T.dropzone({ accept: '.sqlite,.sqlite3,.db,.db3,application/x-sqlite3,application/vnd.sqlite3', icon: '🗄️', label: 'Open a .sqlite or .db file', hint: 'It stays on your device', onFiles: function (fs) {
    status.info('Opening ' + fs[0].name + '…');
    T.read(fs[0]).then(function (buf) { return fresh(new Uint8Array(buf)); }).then(function () { status.ok('✓ Opened ' + fs[0].name + '.'); results.innerHTML = ''; }).catch(function (e) { status.error('This file is not a SQLite database (' + (e.message || e) + ').'); });
  } });
  var ex = h('div', { 'class': 'trow' }, EXAMPLES.map(function (x) { return T.button(x[0], { small: true, onclick: function () { editor.value = x[1]; run(); } }); }));
  spot.appendChild(T.card([T.field('SQL (SQLite)', editor, 'Ctrl + Enter runs it. Separate several statements with ;'), ex,
    T.row([T.button('▶ Run', { primary: true, onclick: run }), T.button('Try a sample', { small: true, onclick: function () { editor.value = EXAMPLES[0][1]; run(); } }),
      T.button('Reset sample data', { small: true, onclick: function () { fresh().then(function () { results.innerHTML = ''; status.ok('✓ Sample data restored.'); }); } }),
      T.button('Download database', { small: true, onclick: function () { if (db) T.download(new Blob([db.export()], { type: 'application/vnd.sqlite3' }), 'database.sqlite'); else status.info('Run a query first.'); } })]),
    status.el, results, tables, file]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['sql-run'] = function () {
    var f = [];
    return fresh().then(function () { return exec('SELECT 2 + 3 AS x, upper(\'a\') AS y'); }).then(function (r) {
      if (JSON.stringify(r.sets[0]) !== '{"columns":["x","y"],"values":[[5,"A"]]}') f.push('select → ' + JSON.stringify(r.sets));
      return exec(EXAMPLES[0][1]);
    }).then(function (r) {
      var v = r.sets[0].values;
      if (v.length !== 5 || v[0][0] !== 'Chen Wei' || v[0][3] !== 1979) f.push('top customers → ' + JSON.stringify(v[0]));
      return exec("UPDATE orders SET qty = qty + 1 WHERE product = 'Notebook'");
    }).then(function (r) {
      if (r.changed !== 3) f.push('changed ' + r.changed);
      return exec('SELEC 1').then(function () { f.push('bad SQL accepted'); }, function (e) { if (!/syntax error/.test(e.message)) f.push('error ' + e.message); });
    }).then(function () { return fresh(); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
