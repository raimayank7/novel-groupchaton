/* Infinity by GroupChatOn — reading-log. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Books and reading log: want to read, reading (with page progress) and finished, ratings, notes and a yearly goal. */
GCOTools.register('reading-log', function (spot, T) {
  var h = T.h, V = T.vault('reading', { books: [], goal: {} }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function pct(b) { return b.status === 'done' ? 100 : b.pages > 0 ? Math.min(100, Math.round((b.cur || 0) / b.pages * 100)) : 0; }
  function year(y) { var r = { done: 0, pages: 0 }; db.books.forEach(function (b) { if (b.status === 'done' && (b.end || '').slice(0, 4) === y) { r.done++; r.pages += b.pages || 0; } }); return r; }
  var view = 'reading', seg = T.seg([['reading', '📖 Reading'], ['want', '🔖 Want to read'], ['done', '✅ Finished']], 'reading', function (v) { view = v; draw(); });
  var f = { t: h('input', { type: 'text', placeholder: 'Book title' }), a: h('input', { type: 'text', placeholder: 'Author' }), p: h('input', { type: 'number', min: '0', step: '1', placeholder: 'Total pages' }), s: T.select([['reading', 'Reading now'], ['want', 'Want to read'], ['done', 'Finished']], 'reading') };
  function add() {
    if (!f.t.value.trim()) { f.t.focus(); return; }
    var b = { id: uid(), title: f.t.value.trim(), author: f.a.value.trim(), pages: parseInt(f.p.value, 10) || 0, cur: 0, status: f.s.value, start: f.s.value === 'want' ? '' : iso(), end: f.s.value === 'done' ? iso() : '', rating: 0, notes: '' };
    db.books.push(b); save(); f.t.value = ''; f.a.value = ''; f.p.value = ''; view = b.status; seg.querySelectorAll('button').forEach(function (x, i) { x.setAttribute('aria-pressed', String(['reading', 'want', 'done'][i] === view)); }); draw();
  }
  f.t.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
  var goalIn = h('input', { type: 'number', min: '0', step: '1', placeholder: 'e.g. 12' }), goalBox = h('div', { 'data-out': '' }), list = h('div', { 'class': 'tlist' });
  goalIn.addEventListener('change', function () { db.goal[iso().slice(0, 4)] = parseInt(goalIn.value, 10) || 0; save(); draw(); });
  function finish(b) { b.status = 'done'; b.end = iso(); b.cur = b.pages; save(); }
  function draw() {
    db = V.data(); goalBox.innerHTML = ''; list.innerHTML = '';
    var y = iso().slice(0, 4), yr = year(y), g = db.goal[y] || 0;
    goalBox.appendChild(h('div', { 'class': 'tsum' }, [['Finished in ' + y, T.num(yr.done) + (g ? ' of ' + g : '')], ['Pages read in ' + y, T.num(yr.pages)], ['Reading now', T.num(db.books.filter(function (b) { return b.status === 'reading'; }).length)]].map(function (x) { return h('div', {}, [h('span', { text: x[0] }), h('b', { text: x[1] })]); })));
    if (g) goalBox.appendChild(h('div', { 'class': 'tprogress', style: 'margin-top:8px' }, [h('span', { style: 'width:' + Math.min(100, yr.done / g * 100) + '%' })]));
    db.books.filter(function (b) { return b.status === view; }).sort(function (a, b) { return (b.end || b.start || '') < (a.end || a.start || '') ? -1 : 1; }).forEach(function (b) {
      var extra = h('div', { style: 'width:100%' });
      if (b.status === 'reading') {
        var pg = h('input', { type: 'number', min: '0', step: '1', value: b.cur || '', placeholder: 'Page you are on', style: 'max-width:150px', 'aria-label': 'Page you are on' });
        pg.addEventListener('change', function () { b.cur = Math.max(0, parseInt(pg.value, 10) || 0); if (b.pages && b.cur >= b.pages) finish(b); else save(); draw(); });
        extra.appendChild(h('div', { 'class': 'tprogress', style: 'margin:6px 0' }, [h('span', { style: 'width:' + pct(b) + '%' })]));
        extra.appendChild(T.row([pg, T.button('Finished!', { small: true, primary: true, onclick: function () { finish(b); draw(); } })]));
      } else if (b.status === 'want') extra.appendChild(T.row([T.button('Start reading', { small: true, primary: true, onclick: function () { b.status = 'reading'; b.start = iso(); save(); draw(); } })]));
      else {
        var st = T.select([['0', 'Rate it…'], ['5', '★★★★★'], ['4', '★★★★'], ['3', '★★★'], ['2', '★★'], ['1', '★']], String(b.rating || 0)); st.addEventListener('change', function () { b.rating = +st.value; save(); draw(); });
        var nt = h('input', { type: 'text', value: b.notes || '', placeholder: 'One line to remember it by' }); nt.addEventListener('change', function () { b.notes = nt.value.trim(); save(); });
        extra.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Rating', st), T.field('Notes', nt)]));
      }
      list.appendChild(h('div', { 'class': 'titem', style: 'flex-wrap:wrap' }, [h('span', { 'class': 'titem-ic', text: b.status === 'done' ? '✅' : b.status === 'reading' ? '📖' : '🔖' }),
        h('span', { 'class': 'titem-main' }, [h('b', { text: b.title }), h('small', { text: [b.author, b.pages ? b.pages + ' pages' : '', b.status === 'reading' && b.pages ? pct(b) + '% read' : '', b.end ? 'finished ' + b.end : '', b.rating ? '★'.repeat(b.rating) : ''].filter(Boolean).join(' · ') })]),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Remove ' + b.title + '?')) { db.books = db.books.filter(function (x) { return x !== b; }); save(); draw(); } } }), extra]));
    });
    if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: view === 'reading' ? 'Nothing on the go. Add the book you are reading above.' : view === 'want' ? 'Add books you want to read next.' : 'Books you finish will collect here.' }));
  }
  spot.appendChild(T.card([V.bar(draw), h('div', { 'class': 'tool-app-opts' }, [h('div', { 'class': 'tgrid2' }, [T.field('Title', f.t), T.field('Author', f.a), T.field('Pages', f.p), T.field('Status', f.s)]), T.row([T.button('Add book', { primary: true, onclick: add })])]),
    goalBox, h('div', { 'class': 'tgrid2' }, [T.field('Books I want to read this year', goalIn)]), seg, list]));
  V.ready.then(function () { goalIn.value = V.data().goal[iso().slice(0, 4)] || ''; draw(); });

  T.tests['reading-log'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [], y = iso().slice(0, 4);
    V.save({ books: [{ id: 'a', title: 'Book A', pages: 400, cur: 100, status: 'reading' }, { id: 'b', title: 'Book B', pages: 200, status: 'done', end: y + '-01-10' }, { id: 'c', title: 'Book C', pages: 300, status: 'done', end: '2001-05-01' }], goal: {} }); db = V.data();
    if (pct(db.books[0]) !== 25) fails.push('progress ' + pct(db.books[0]));
    var yr = year(y); if (yr.done !== 1 || yr.pages !== 200) fails.push('year ' + JSON.stringify(yr));
    finish(db.books[0]); if (year(y).done !== 2 || pct(db.books[0]) !== 100) fails.push('finish');
    view = 'done'; draw(); if (list.querySelectorAll('.titem').length !== 3) fails.push('finished list ' + list.querySelectorAll('.titem').length);
    return V.save(keep).then(function () { view = 'reading'; draw(); return { ok: !fails.length, n: 4, fails: fails }; });
  }
});
