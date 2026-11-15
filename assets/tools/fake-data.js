/* Infinity by GroupChatOn — fake-data. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Test data generator: realistic fake people, addresses and records (India, US, UK or mixed) as CSV, JSON, SQL or Markdown. Emails use reserved example domains. */
GCOTools.register('fake-data', function (spot, T) {
  var h = T.h;
  var R = {
    in: { country: 'India', m: 'Aarav Vivaan Aditya Arjun Rohan Rahul Amit Vikram Karan Siddharth Harpreet Gurpreet Manoj Suresh Imran Farhan Joseph Rajesh Anil Deepak', f: 'Aanya Diya Priya Neha Pooja Ananya Kavya Simran Harleen Fatima Ayesha Sneha Riya Meera Lakshmi Sunita Anjali Ishita Nisha Mary',
      l: 'Sharma Verma Gupta Singh Kumar Patel Reddy Iyer Nair Das Banerjee Khan Sheikh Gill Sandhu Mehta Joshi Rao Fernandes Chopra',
      city: [['Mumbai', 'Maharashtra', '400'], ['Delhi', 'Delhi', '110'], ['Bengaluru', 'Karnataka', '560'], ['Chennai', 'Tamil Nadu', '600'], ['Kolkata', 'West Bengal', '700'], ['Hyderabad', 'Telangana', '500'], ['Pune', 'Maharashtra', '411'],
        ['Ahmedabad', 'Gujarat', '380'], ['Jaipur', 'Rajasthan', '302'], ['Lucknow', 'Uttar Pradesh', '226'], ['Ludhiana', 'Punjab', '141'], ['Chandigarh', 'Chandigarh', '160'], ['Kochi', 'Kerala', '682'], ['Indore', 'Madhya Pradesh', '452'], ['Patna', 'Bihar', '800'], ['Guwahati', 'Assam', '781']],
      street: ['MG Road', 'Station Road', 'Mall Road', 'Park Street', 'Gandhi Nagar', 'Civil Lines', 'Model Town', 'Nehru Place', 'Shastri Nagar', 'Sector 12'], co: 'Pvt. Ltd.', cur: 'INR' },
    us: { country: 'United States', m: 'James John Robert Michael David William Daniel Matthew Anthony Joshua Ethan Noah Liam Carlos Jose Kevin Brian Jason Ryan Tyler', f: 'Mary Patricia Jennifer Linda Elizabeth Sarah Jessica Emily Ashley Olivia Emma Sophia Isabella Mia Grace Chloe Maria Hannah Lauren Megan',
      l: 'Smith Johnson Williams Brown Jones Garcia Miller Davis Rodriguez Martinez Wilson Anderson Taylor Thomas Moore Jackson Lee Harris Clark Lewis',
      city: [['New York', 'NY', '100'], ['Los Angeles', 'CA', '900'], ['Chicago', 'IL', '606'], ['Houston', 'TX', '770'], ['Phoenix', 'AZ', '850'], ['Philadelphia', 'PA', '191'], ['San Antonio', 'TX', '782'], ['San Diego', 'CA', '921'],
        ['Dallas', 'TX', '752'], ['Austin', 'TX', '787'], ['Seattle', 'WA', '981'], ['Denver', 'CO', '802'], ['Boston', 'MA', '021'], ['Miami', 'FL', '331'], ['Atlanta', 'GA', '303']],
      street: ['Maple St', 'Oak Ave', 'Pine St', 'Cedar Ln', 'Elm St', 'Washington Ave', 'Lake Dr', 'Hill Rd', 'Main St', 'Park Blvd'], co: 'Inc.', cur: 'USD' },
    uk: { country: 'United Kingdom', m: 'Oliver George Harry Jack Charlie Thomas Oscar William James Henry Leo Alfie Jacob Freddie Arthur Noah Theo Archie Joshua Mohammed', f: 'Amelia Olivia Isla Ava Emily Sophia Grace Lily Freya Mia Ella Poppy Evie Isabella Sophie Ruby Daisy Florence Alice Rosie',
      l: 'Smith Jones Taylor Brown Williams Wilson Johnson Davies Patel Robinson Wright Thompson Evans Walker White Roberts Green Hall Wood Hughes',
      city: [['London', 'Greater London', 'E'], ['Manchester', 'Greater Manchester', 'M'], ['Birmingham', 'West Midlands', 'B'], ['Leeds', 'West Yorkshire', 'LS'], ['Glasgow', 'Scotland', 'G'], ['Liverpool', 'Merseyside', 'L'],
        ['Bristol', 'Bristol', 'BS'], ['Edinburgh', 'Scotland', 'EH'], ['Cardiff', 'Wales', 'CF'], ['Belfast', 'Northern Ireland', 'BT'], ['Sheffield', 'South Yorkshire', 'S'], ['Nottingham', 'Nottinghamshire', 'NG']],
      street: ['High Street', 'Station Road', 'Church Lane', 'Victoria Road', 'Green Lane', 'Manor Road', 'Park Avenue', 'Queens Road', 'Mill Lane', 'King Street'], co: 'Ltd', cur: 'GBP' }
  };
  var JOBS = ['Accountant', 'Software Engineer', 'Teacher', 'Nurse', 'Sales Executive', 'Graphic Designer', 'Data Analyst', 'Project Manager', 'Electrician', 'Chef', 'Marketing Manager', 'HR Executive', 'Pharmacist', 'Driver', 'Customer Support Agent', 'Civil Engineer'];
  var BIZ = ['Traders', 'Technologies', 'Industries', 'Enterprises', 'Foods', 'Logistics', 'Solutions', 'Textiles', 'Motors', 'Pharma'];
  var FIELDS = [['id', 'ID', 1], ['first', 'First name', 1], ['last', 'Last name', 1], ['name', 'Full name', 0], ['gender', 'Gender', 0], ['email', 'Email', 1], ['phone', 'Phone', 1], ['dob', 'Date of birth', 0], ['age', 'Age', 0],
    ['street', 'Street address', 0], ['city', 'City', 1], ['state', 'State / region', 0], ['zip', 'PIN / ZIP / postcode', 0], ['country', 'Country', 1], ['company', 'Company', 0], ['job', 'Job title', 0],
    ['username', 'Username', 0], ['password', 'Password', 0], ['uuid', 'UUID', 0], ['ip', 'IP address', 0], ['url', 'Website', 0], ['price', 'Price', 0], ['qty', 'Quantity', 0], ['date', 'Recent date', 0], ['active', 'Active (true/false)', 0], ['color', 'Colour (hex)', 0]];
  // random source: the browser's secure generator, or a repeatable one when a seed is given
  function rng(seed) {
    if (!seed) return function () { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; };
    var s = 0; for (var i = 0; i < seed.length; i++) s = Math.imul(31, s) + seed.charCodeAt(i) | 0;
    return function () { s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function gen(o) {
    var r = rng(o.seed), rows = [];
    function n(k) { return Math.floor(r() * k); }
    function pick(a) { return a[n(a.length)]; }
    function digits(k) { var s = ''; for (var i = 0; i < k; i++) s += n(10); return s; }
    function pad(x) { return ('0' + x).slice(-2); }
    function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    var now = new Date(2026, 9, 31);
    for (var i = 0; i < o.rows; i++) {
      var key = o.region === 'mix' ? pick(['in', 'us', 'uk']) : o.region, L = R[key], female = r() < 0.5;
      var first = pick((female ? L.f : L.m).split(' ')), last = pick(L.l.split(' ')), c = pick(L.city), age = 18 + n(53);
      var dob = new Date(now.getFullYear() - age, n(12), 1 + n(28));
      var zip = key === 'in' ? c[2] + digits(3) : key === 'us' ? c[2] + digits(2) : c[2] + (1 + n(20)) + ' ' + n(10) + pick('ABDEFGHJLNPQRSTUWXYZ'.split('')) + pick('ABDEFGHJLNPQRSTUWXYZ'.split(''));
      var phone = key === 'in' ? '+91 ' + pick(['6', '7', '8', '9']) + digits(4) + ' ' + digits(5) : key === 'us' ? '(' + pick(['212', '310', '312', '713', '602', '215', '206', '303', '617', '305']) + ') 555-01' + digits(2) : '07700 900' + digits(3);
      var u = []; for (var b = 0; b < 16; b++) u.push(n(256)); u[6] = u[6] & 15 | 64; u[8] = u[8] & 63 | 128;
      var hex = u.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      var user = (first + '.' + last).toLowerCase().replace(/[^a-z.]/g, '') + n(100);
      var pw = ''; for (var p = 0; p < 12; p++) pw += 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'.charAt(n(61));
      var rec = { id: i + 1, first: first, last: last, name: first + ' ' + last, gender: female ? 'Female' : 'Male', email: user + '@' + pick(['example.com', 'example.org', 'example.net']), phone: phone,
        dob: iso(dob), age: age, street: (1 + n(400)) + ', ' + pick(L.street), city: c[0], state: c[1], zip: zip, country: L.country, company: pick(L.l.split(' ')) + ' ' + pick(BIZ) + ' ' + L.co, job: pick(JOBS),
        username: user, password: pw, uuid: hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20), ip: pick(['192.0.2.', '198.51.100.', '203.0.113.']) + (1 + n(254)),
        url: 'https://www.example.com/' + user.replace('.', '-'), price: Math.round((5 + r() * 4995) * 100) / 100, qty: 1 + n(50), date: iso(new Date(now.getTime() - n(730) * 864e5)), active: r() < 0.7, color: '#' + ('00000' + n(16777216).toString(16)).slice(-6) };
      var row = {}; o.fields.forEach(function (k) { row[k] = rec[k]; }); rows.push(row);
    }
    return rows;
  }
  function csvCell(v, sep) { v = String(v); return v.indexOf(sep) >= 0 || /["\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function format(rows, fields, how, table) {
    if (how === 'json') return JSON.stringify(rows, null, 1);
    if (how === 'csv' || how === 'tsv') { var s = how === 'csv' ? ',' : '\t'; return [fields.join(s)].concat(rows.map(function (r) { return fields.map(function (k) { return csvCell(r[k], s); }).join(s); })).join('\n'); }
    if (how === 'md') return '| ' + fields.join(' | ') + ' |\n|' + fields.map(function () { return ' --- '; }).join('|') + '|\n' + rows.map(function (r) { return '| ' + fields.map(function (k) { return String(r[k]).replace(/\|/g, '\\|'); }).join(' | ') + ' |'; }).join('\n');
    var t = (table || 'people').replace(/[^A-Za-z0-9_]/g, '') || 'people';
    return rows.map(function (r) { return 'INSERT INTO ' + t + ' (' + fields.join(', ') + ') VALUES (' + fields.map(function (k) { var v = r[k]; return typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : "'" + String(v).replace(/'/g, "''") + "'"; }).join(', ') + ');'; }).join('\n');
  }
  var saved = T.store.get('fake-data', {});
  var checks = h('div', { 'class': 'tchecks', style: 'display:flex;flex-wrap:wrap;gap:4px 14px' }), boxes = {};
  FIELDS.forEach(function (f) { var on = saved.fields ? saved.fields.indexOf(f[0]) >= 0 : !!f[2]; var b = h('input', { type: 'checkbox', checked: on ? true : null }); boxes[f[0]] = b; checks.appendChild(h('label', { 'class': 'tcheck' }, [b, ' ' + f[1]])); });
  var region = T.select([['in', 'India'], ['us', 'United States'], ['uk', 'United Kingdom'], ['mix', 'Mixed']], saved.region || 'in');
  var rows = h('input', { type: 'number', min: '1', max: '5000', value: String(saved.rows || 25) });
  var fmt = T.select([['csv', 'CSV (Excel)'], ['json', 'JSON'], ['sql', 'SQL INSERT'], ['tsv', 'TSV (paste into a sheet)'], ['md', 'Markdown table']], saved.fmt || 'csv');
  var seed = h('input', { type: 'text', placeholder: 'Leave empty for new data every time', value: saved.seed || '' });
  var table = h('input', { type: 'text', value: saved.table || 'people' });
  var out = h('textarea', { 'class': 'tout tmono', rows: '12', readonly: true, 'aria-label': 'Generated data', spellcheck: 'false' }), status = T.status();
  function go() {
    var fields = FIELDS.map(function (f) { return f[0]; }).filter(function (k) { return boxes[k].checked; }), n = Math.round(+rows.value);
    if (!fields.length) { status.error('Tick at least one field.'); return; }
    if (!(n >= 1 && n <= 5000)) { status.error('Choose between 1 and 5,000 rows.'); return; }
    T.store.set('fake-data', { fields: fields, region: region.value, rows: n, fmt: fmt.value, seed: seed.value, table: table.value });
    out.value = format(gen({ rows: n, fields: fields, region: region.value, seed: seed.value }), fields, fmt.value, table.value);
    status.ok(n + ' rows ready. Emails use example.com and phone numbers use ranges kept aside for fiction, so no real person is contacted.');
  }
  var copy = T.button('Copy', { onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([h('h3', { text: 'Fields' }), checks, h('div', { 'class': 'tgrid2' }, [T.field('Country style', region), T.field('Rows', rows), T.field('Format', fmt), T.field('Seed (same seed = same data)', seed), T.field('SQL table name', table)]),
    T.row([T.button('Generate', { primary: true, onclick: go }), T.button('Try a sample', { small: true, onclick: function () { rows.value = 10; go(); } })]), status.el, out,
    T.row([copy, T.button('Download', { onclick: function () { var ext = { csv: 'csv', json: 'json', sql: 'sql', tsv: 'tsv', md: 'md' }[fmt.value]; T.download(new Blob([(fmt.value === 'csv' ? '﻿' : '') + out.value], { type: 'text/plain;charset=utf-8' }), 'test-data.' + ext); } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';

  T.tests['fake-data'] = function () {
    var f = [], all = FIELDS.map(function (x) { return x[0]; });
    var a = gen({ rows: 30, fields: all, region: 'mix', seed: 'abc' }), b = gen({ rows: 30, fields: all, region: 'mix', seed: 'abc' });
    if (JSON.stringify(a) !== JSON.stringify(b)) f.push('seed not repeatable');
    if (JSON.stringify(gen({ rows: 5, fields: all, region: 'in' })) === JSON.stringify(gen({ rows: 5, fields: all, region: 'in' }))) f.push('random repeats');
    a.forEach(function (r) {
      if (!/^[a-z.]+\d*@example\.(com|org|net)$/.test(r.email)) f.push('email ' + r.email);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(r.uuid)) f.push('uuid ' + r.uuid);
      if (r.age < 18 || r.age > 70) f.push('age ' + r.age);
    });
    var j = JSON.parse(format(a, all, 'json')); if (j.length !== 30) f.push('json rows');
    var c = format([{ name: 'A, "B"' }], ['name'], 'csv'); if (c !== 'name\n"A, ""B"""') f.push('csv quoting ' + c);
    var s = format([{ name: "O'Neil", qty: 3, active: true }], ['name', 'qty', 'active'], 'sql', 'x'); if (s !== "INSERT INTO x (name, qty, active) VALUES ('O''Neil', 3, TRUE);") f.push('sql ' + s);
    var inr = gen({ rows: 20, fields: ['zip', 'phone'], region: 'in', seed: 'z' }); inr.forEach(function (r) { if (!/^\d{6}$/.test(r.zip) || !/^\+91 [6-9]\d{4} \d{5}$/.test(r.phone)) f.push('india ' + r.zip + ' ' + r.phone); });
    return Promise.resolve({ ok: !f.length, n: 8, fails: f.slice(0, 5) });
  };
});
