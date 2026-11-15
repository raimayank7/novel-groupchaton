/* Infinity by GroupChatOn — csv-viewer. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSV and Excel viewer: open .csv, .tsv, .xlsx, .xls or .ods files as a sortable, searchable table with column summaries. Excel files use SheetJS, loaded on first use; nothing is uploaded. */
GCOTools.register('csv-viewer', function (spot, T) {
  var h = T.h, XL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', status = T.status();
  var rows = [], head = [], sortCol = -1, sortDir = 1, limit = 200, book = null, fileName = 'data';
  function detect(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); }).slice(0, 20), best = ',', bestScore = 0;
    [',', ';', '\t', '|'].forEach(function (d) {
      var counts = lines.map(function (l) { var n = 0, q = false; for (var i = 0; i < l.length; i++) { if (l[i] === '"') q = !q; else if (!q && l[i] === d) n++; } return n; });
      var same = counts.filter(function (c) { return c === counts[0]; }).length, score = counts[0] ? same * 10 + counts[0] : 0;
      if (score > bestScore) { bestScore = score; best = d; }
    });
    return best;
  }
  function parse(text, d) {
    var out = [], row = [], f = '', q = false, i = 0, n = text.length;
    if (text.charCodeAt(0) === 0xFEFF) i = 1;
    d = d || detect(text);
    for (; i < n; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
      if (c === '"' && f === '') { q = true; continue; }
      if (c === d) { row.push(f); f = ''; continue; }
      if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); out.push(row); row = []; f = ''; continue; }
      f += c;
    }
    if (f !== '' || row.length) { row.push(f); out.push(row); }
    return out.filter(function (r) { return r.length > 1 || r[0] !== ''; });
  }
  function toCSV(data) { return data.map(function (r) { return r.map(function (v) { v = v == null ? '' : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n'); }
  function num(v) { var s = String(v).trim().replace(/[,\s]/g, '').replace(/^[₹$€£¥]/, ''); return s !== '' && isFinite(s) && /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?%?$/i.test(s.replace(/%$/, '')) ? parseFloat(s) : null; }
  function compare(a, b) { var x = num(a), y = num(b); if (x !== null && y !== null) return x - y; if (x !== null) return -1; if (y !== null) return 1; return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }); }
  var q = h('input', { type: 'search', placeholder: 'Search all columns…', 'aria-label': 'Search the table' });
  var hasHead = h('input', { type: 'checkbox', checked: true }), sheetSel = T.select([], ''), sheetField = T.field('Sheet', sheetSel);
  sheetField.hidden = true;
  var stats = h('div', { 'class': 'tstats' }), tableBox = h('div', { 'class': 'tcalc-scroll', style: 'max-height:520px', 'data-out': '' }), more = h('div'), summary = h('div', { 'class': 'tcalc-scroll' });
  var tools = h('div', { hidden: true, style: 'display:grid;gap:10px;min-width:0' }, [h('div', { 'class': 'tgrid2' }, [T.field('Search', q), sheetField]), h('label', { 'class': 'tcheck' }, [hasHead, ' First row is the column names']), stats, tableBox, more,
    h('details', { 'class': 'tcalc-details' }, [h('summary', { text: 'Column summary (type, filled, unique, sum, average, min, max)' }), summary]),
    T.row([T.button('Download as CSV', { primary: true, onclick: function () { T.download(new Blob(['﻿' + toCSV([head].concat(visible()))], { type: 'text/csv;charset=utf-8' }), T.baseName(fileName) + '.csv'); } })])]);
  function visible() {
    var s = q.value.trim().toLowerCase(), list = s ? rows.filter(function (r) { return r.some(function (v) { return String(v).toLowerCase().indexOf(s) >= 0; }); }) : rows.slice();
    if (sortCol >= 0) list.sort(function (a, b) { return compare(a[sortCol] == null ? '' : a[sortCol], b[sortCol] == null ? '' : b[sortCol]) * sortDir; });
    return list;
  }
  function setData(data) {
    var w = data.reduce(function (m, r) { return Math.max(m, r.length); }, 0);
    data = data.map(function (r) { r = r.slice(); while (r.length < w) r.push(''); return r; });
    if (hasHead.checked && data.length) { head = data[0].map(function (v, i) { return String(v).trim() || 'Column ' + (i + 1); }); rows = data.slice(1); }
    else { head = []; for (var i = 0; i < w; i++) head.push('Column ' + (i + 1)); rows = data; }
    sortCol = -1; limit = 200; tools.hidden = false; draw(); drawSummary();
  }
  var raw = null;
  hasHead.addEventListener('change', function () { if (raw) setData(raw); });
  q.addEventListener('input', function () { limit = 200; draw(); });
  sheetSel.addEventListener('change', function () { loadSheet(sheetSel.value); });
  function draw() {
    var list = visible();
    stats.innerHTML = '';
    [[list.length.toLocaleString(), q.value.trim() ? 'matching rows' : 'rows'], [head.length, 'columns']].forEach(function (s) { stats.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(s[0]) }), h('span', { text: s[1] })])); });
    var thead = h('tr', {}, [h('th', { text: '#', style: 'text-align:left' })].concat(head.map(function (c, i) {
      return h('th', { style: 'text-align:left;cursor:pointer;user-select:none', tabindex: '0', 'aria-sort': sortCol === i ? (sortDir > 0 ? 'ascending' : 'descending') : 'none', title: 'Sort by ' + c,
        onclick: function () { sortDir = sortCol === i ? -sortDir : 1; sortCol = i; draw(); }, onkeydown: function (e) { if (e.key === 'Enter') e.currentTarget.click(); } }, [c + (sortCol === i ? (sortDir > 0 ? ' ▲' : ' ▼') : '')]);
    })));
    var body = list.slice(0, limit).map(function (r, k) { return h('tr', {}, [h('td', { text: String(k + 1), style: 'color:var(--muted)' })].concat(r.map(function (v) { var x = num(v); return h('td', { text: String(v), style: 'text-align:' + (x !== null ? 'right' : 'left') + ';max-width:320px;overflow:hidden;text-overflow:ellipsis' }); }))); });
    tableBox.innerHTML = '';
    tableBox.appendChild(h('table', {}, [h('thead', {}, [thead]), h('tbody', {}, body)]));
    more.innerHTML = '';
    if (list.length > limit) more.appendChild(T.button('Show ' + Math.min(500, list.length - limit) + ' more rows (' + (list.length - limit).toLocaleString() + ' left)', { onclick: function () { limit += 500; draw(); } }));
  }
  function colSummary(i) {
    var vals = rows.map(function (r) { return r[i]; }).filter(function (v) { return String(v).trim() !== ''; }), nums = vals.map(num).filter(function (x) { return x !== null; }), uniq = {};
    vals.forEach(function (v) { uniq[v] = 1; });
    var isNum = vals.length && nums.length >= vals.length * 0.9, sum = nums.reduce(function (a, b) { return a + b; }, 0);
    return { name: head[i], type: isNum ? 'Number' : 'Text', filled: vals.length, unique: Object.keys(uniq).length,
      sum: isNum ? sum : null, avg: isNum && nums.length ? sum / nums.length : null, min: isNum ? Math.min.apply(null, nums) : null, max: isNum ? Math.max.apply(null, nums) : null };
  }
  function drawSummary() {
    var f = function (x) { return x === null ? '' : T.num(x, 2); };
    summary.innerHTML = '';
    summary.appendChild(h('table', {}, [h('thead', {}, [h('tr', {}, ['Column', 'Type', 'Filled', 'Unique', 'Sum', 'Average', 'Min', 'Max'].map(function (c) { return h('th', { text: c }); }))]),
      h('tbody', {}, head.map(function (c, i) { var s = colSummary(i); return h('tr', {}, [s.name, s.type, String(s.filled), String(s.unique), f(s.sum), f(s.avg), f(s.min), f(s.max)].map(function (v) { return h('td', { text: v }); })); }))]));
  }
  function loadSheet(name) { var ws = book.Sheets[name]; raw = window.XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '', blankrows: false }); setData(raw); status.ok('✓ ' + fileName + ' · sheet “' + name + '”'); }
  function open(file) {
    fileName = file.name; status.info('Opening ' + file.name + '…'); book = null; sheetField.hidden = true;
    if (/\.(xlsx|xlsm|xls|xlsb|ods|numbers)$/i.test(file.name)) {
      return Promise.all([T.loadScript(XL), T.read(file)]).then(function (r) {
        book = window.XLSX.read(new Uint8Array(r[1]), { type: 'array', cellDates: true });
        sheetSel.innerHTML = '';
        book.SheetNames.forEach(function (n) { sheetSel.appendChild(h('option', { value: n, text: n })); });
        sheetField.hidden = book.SheetNames.length < 2;
        loadSheet(book.SheetNames[0]);
      }).catch(function (e) { status.error('Could not read this spreadsheet: ' + e.message); });
    }
    return T.read(file, 'text').then(function (t) { raw = parse(t); setData(raw); status.ok('✓ ' + file.name + ' · ' + ({ ',': 'comma', ';': 'semicolon', '\t': 'tab', '|': 'pipe' }[detect(t)]) + '-separated'); });
  }
  var SAMPLE = 'Date,Item,Category,Qty,Price,Total\n2026-10-01,Basmati rice 5 kg,Grocery,2,640,1280\n2026-10-02,"Notebook, A5",Stationery,10,45,450\n2026-10-03,LED bulb 9W,Electrical,6,99,594\n2026-10-05,Masala chai 500 g,Grocery,3,210,630\n2026-10-07,Extension board,Electrical,1,449,449\n2026-10-09,Gel pens (pack of 10),Stationery,4,120,480\n2026-10-12,Sunflower oil 1 L,Grocery,5,165,825\n';
  spot.appendChild(T.card([T.dropzone({ accept: '.csv,.tsv,.txt,.xlsx,.xlsm,.xls,.xlsb,.ods,text/csv', icon: '📊', label: 'Open a CSV or Excel file', hint: 'Or drag it here. It stays on your device.', onFiles: function (fs) { open(fs[0]); } }),
    T.row([T.button('Try a sample', { small: true, onclick: function () { fileName = 'sample.csv'; raw = parse(SAMPLE); setData(raw); status.ok('✓ Sample shopping list loaded. Tap a column name to sort.'); } })]),
    status.el, tools]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['csv-viewer'] = function () {
    var f = [], p = parse('a,b\n"x, y","he said ""hi"""\r\n1,2\n"multi\nline",3\n');
    if (JSON.stringify(p) !== JSON.stringify([['a', 'b'], ['x, y', 'he said "hi"'], ['1', '2'], ['multi\nline', '3']])) f.push('parse ' + JSON.stringify(p));
    if (detect('a;b;c\n1;2,5;3') !== ';' || detect('a\tb\n1\t2') !== '\t' || detect('a,b\n"1;2",3') !== ',') f.push('detect');
    if (compare('10', '9') <= 0 || compare('₹1,200', '950') <= 0 || compare('apple', 'Banana') >= 0 || compare('item2', 'item10') >= 0) f.push('compare');
    if (toCSV([['a', 'b,c'], ['he "x"', '']]) !== 'a,"b,c"\r\n"he ""x""",') f.push('toCSV ' + toCSV([['a', 'b,c'], ['he "x"', '']]));
    hasHead.checked = true; raw = parse(SAMPLE); setData(raw);
    var s = colSummary(5);
    if (rows.length !== 7 || s.type !== 'Number' || s.sum !== 4708 || s.max !== 1280 || colSummary(1).type !== 'Text') f.push('summary ' + JSON.stringify(s));
    sortCol = 5; sortDir = -1; if (visible()[0][1] !== 'Basmati rice 5 kg') f.push('sort');
    q.value = 'grocery'; if (visible().length !== 3) f.push('search ' + visible().length);
    q.value = ''; sortCol = -1; draw();
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
