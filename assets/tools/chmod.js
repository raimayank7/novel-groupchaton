/* Infinity by GroupChatOn — chmod. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* chmod calculator: tick read/write/execute for owner, group and others, or type 755 / rwxr-xr-x, and get the command. */
GCOTools.register('chmod', function (spot, T) {
  var h = T.h, WHO = ['Owner', 'Group', 'Others'], WHAT = [['r', 'Read', 4], ['w', 'Write', 2], ['x', 'Execute', 1]];
  function toSym(n) { return String(n).split('').map(function (d) { d = +d; return (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-'); }).join(''); }
  function read(s) {
    s = s.trim().replace(/^[-dl](?=[rwx-]{9}$)/, '');
    if (/^[0-7]{3}$/.test(s)) return s;
    if (/^0?[0-7]{3}$/.test(s)) return s.slice(-3);
    if (/^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(s)) return [0, 3, 6].map(function (i) { return (s[i] === 'r' ? 4 : 0) + (s[i + 1] === 'w' ? 2 : 0) + (s[i + 2] === 'x' ? 1 : 0); }).join('');
    throw new Error('Type 3 digits from 0–7 (like 755) or 9 letters (like rwxr-xr-x).');
  }
  function words(n) {
    return WHO.map(function (w, i) {
      var d = +String(n)[i], can = WHAT.filter(function (x) { return d & x[2]; }).map(function (x) { return x[1].toLowerCase(); });
      return w + ': ' + (can.length ? can.join(', ') : 'nothing');
    }).join(' · ');
  }
  var boxes = [], num = h('input', { type: 'text', 'class': 'tmono tbig', value: '755', maxlength: '10', 'aria-label': 'Permission number or letters', style: 'max-width:220px' });
  var file = h('input', { type: 'text', 'class': 'tmono', value: 'file.sh', 'aria-label': 'File name' });
  var res = h('div', { 'class': 'tkv', 'data-out': '' }), status = T.status();
  var grid = h('table', { style: 'border-collapse:collapse;width:100%;max-width:420px;text-align:center' }, [h('tr', {}, [h('th')].concat(WHAT.map(function (x) { return h('th', { text: x[1] }); })))]);
  WHO.forEach(function (w, i) {
    var tr = h('tr', {}, [h('th', { text: w, style: 'text-align:left;padding:6px 0' })]);
    WHAT.forEach(function (x) {
      var c = h('input', { type: 'checkbox', 'aria-label': w + ' ' + x[1], style: 'width:22px;height:22px' });
      c.addEventListener('change', fromBoxes); boxes.push([c, i, x[2]]); tr.appendChild(h('td', {}, [c]));
    });
    grid.appendChild(tr);
  });
  function fromBoxes() { var d = [0, 0, 0]; boxes.forEach(function (b) { if (b[0].checked) d[b[1]] += b[2]; }); num.value = d.join(''); show(num.value); }
  function show(n) {
    boxes.forEach(function (b) { b[0].checked = !!(+n[b[1]] & b[2]); });
    var f = file.value.trim() || 'file', rows = [['Number', n], ['Letters', toSym(n)], ['ls -l shows', '-' + toSym(n)], ['Command', 'chmod ' + n + ' ' + f]];
    res.innerHTML = '';
    rows.forEach(function (r) { res.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] }), T.button('Copy', { small: true, onclick: function (e) { T.copy(r[1], e.currentTarget); } })])); });
    status.info(words(n) + (n[2] & 2 ? '. Warning: everyone can change this file.' : ''));
  }
  function typed() { try { show(read(num.value)); } catch (e) { status.error(e); } }
  num.addEventListener('input', typed); file.addEventListener('input', typed);
  var COMMON = [['644', 'Web pages, images'], ['755', 'Folders, scripts'], ['600', 'Private keys, .env'], ['700', 'Private folder'], ['775', 'Shared team folder'], ['444', 'Read-only']];
  spot.appendChild(T.card([grid, h('div', { 'class': 'tgrid2' }, [T.field('Number or letters', num), T.field('File or folder', file)]), status.el, res,
    T.field('Common choices', T.row(COMMON.map(function (c) { return T.button(c[0] + ' · ' + c[1], { small: true, onclick: function () { num.value = c[0]; typed(); } }); })))]));
  typed();
  T.tests['chmod'] = function () {
    var f = [];
    [['755', 'rwxr-xr-x'], ['644', 'rw-r--r--'], ['600', 'rw-------'], ['777', 'rwxrwxrwx']].forEach(function (c) {
      if (toSym(c[0]) !== c[1]) f.push(c[0] + ' → ' + toSym(c[0]));
      if (read(c[1]) !== c[0]) f.push(c[1] + ' → ' + read(c[1]));
    });
    if (read('-rw-r--r--') !== '644' || read('0755') !== '755') f.push('ls form / leading 0');
    try { read('789'); f.push('789 accepted'); } catch (e) {}
    if (words('640') !== 'Owner: read, write · Group: read · Others: nothing') f.push('words ' + words('640'));
    return Promise.resolve({ ok: !f.length, n: 11, fails: f });
  };
});
