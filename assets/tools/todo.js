/* Infinity by GroupChatOn — todo. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* To-do list saved on this device: priorities, due dates, filters, clear done, share the list on WhatsApp. */
GCOTools.register('todo', function (spot, T) {
  var h = T.h, status = T.status(), V = T.vault('study-todo', { items: [] });
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function uid() { var a = new Uint32Array(2); crypto.getRandomValues(a); return a[0].toString(36) + a[1].toString(36); }
  function sorted(items) {
    return items.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.pri !== b.pri) return a.pri - b.pri;
      if ((a.due || '9') !== (b.due || '9')) return (a.due || '9') < (b.due || '9') ? -1 : 1;
      return a.at - b.at;
    });
  }
  function shareText(items) { return '📝 To-do\n' + sorted(items).map(function (t) { return (t.done ? '✅ ' : '⬜ ') + t.text + (t.due && !t.done ? ' (by ' + t.due + ')' : ''); }).join('\n'); }
  function dueLabel(d, today) { if (!d) return ''; if (d < today) return '⚠ overdue ' + d; if (d === today) return 'today'; var t = new Date(); t.setDate(t.getDate() + 1); return d === ymd(t) ? 'tomorrow' : d; }
  var txt = h('input', { type: 'text', placeholder: 'What needs doing?', enterkeyhint: 'done' }), due = h('input', { type: 'date' }), pri = T.select([[2, 'Normal'], [1, 'High'], [3, 'Low']], 2);
  var filter = T.seg([['all', 'All'], ['open', 'To do'], ['done', 'Done']], 'open', draw), listEl = h('div', { 'class': 'tlist', 'data-out': '' }), sum = h('p', { 'class': 'tnote' });
  var sampleBtn = T.button('Try a sample', { small: true, onclick: function () {
    var d = new Date(); [['Finish maths homework', 1, ymd(d)], ['Buy groceries', 2, ''], ['Call grandma', 2, ''], ['Clean the desk', 3, '']].forEach(function (s) { items().push({ id: uid(), text: s[0], pri: s[1], due: s[2], done: false, at: Date.now() }); });
    save();
  } });
  function items() { return V.data().items; }
  function save() { V.save(V.data()); draw(); }
  function add() {
    var t = txt.value.trim(); if (!t) { status.error('Type a task first.'); txt.focus(); return; }
    items().push({ id: uid(), text: t.slice(0, 300), pri: +pri.value, due: due.value, done: false, at: Date.now() }); txt.value = ''; due.value = ''; status.clear(); save(); txt.focus();
  }
  txt.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
  function draw() {
    var f = filter.value(), today = ymd(new Date()), all = items(), open = all.filter(function (t) { return !t.done; }).length;
    listEl.innerHTML = '';
    sorted(all).filter(function (t) { return f === 'all' || (f === 'done') === !!t.done; }).forEach(function (t) {
      var cb = h('input', { type: 'checkbox', checked: t.done ? true : null, 'aria-label': 'Done', style: 'width:22px;height:22px;flex:none' });
      cb.addEventListener('change', function () { t.done = cb.checked; save(); });
      var dl = dueLabel(t.due, today);
      listEl.appendChild(h('div', { style: 'display:flex;gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg)' + (t.pri === 1 && !t.done ? ';border-left:4px solid #ef4444' : '') }, [cb,
        h('span', { style: 'flex:1;min-width:0;overflow-wrap:anywhere' + (t.done ? ';text-decoration:line-through;color:var(--muted)' : '') }, [t.text,
          dl || t.pri !== 2 ? h('small', { style: 'display:block;color:' + (/overdue/.test(dl) && !t.done ? '#dc2626' : 'var(--muted)'), text: [t.pri === 1 ? '🔴 High' : t.pri === 3 ? '⚪ Low' : '', dl ? '📅 ' + dl : ''].filter(Boolean).join(' · ') }) : null]),
        T.button('✕', { small: true, onclick: function () { V.data().items = all.filter(function (x) { return x.id !== t.id; }); save(); } })]));
    });
    if (!listEl.childNodes.length) listEl.appendChild(h('p', { 'class': 'tnote', text: f === 'done' ? 'Nothing finished yet.' : all.length ? 'All done! 🎉' : 'Your list is empty. Add your first task above.' }));
    sum.textContent = open + ' to do · ' + (all.length - open) + ' done';
    sampleBtn.hidden = all.length > 0;
  }
  var copy = T.button('Copy list', { small: true, onclick: function () { T.copy(shareText(items()), copy); } });
  spot.appendChild(T.card([V.bar(function () { V.ready.then(draw); }), T.field('New task', txt), h('div', { 'class': 'tgrid2' }, [T.field('Due date (optional)', due), T.field('Priority', pri)]),
    T.row([T.button('Add task', { primary: true, onclick: add }), sampleBtn]), status.el, T.row([filter, sum], 'trow-split'), listEl,
    T.row([T.button('Clear done', { small: true, onclick: function () { V.data().items = items().filter(function (t) { return !t.done; }); save(); } }), copy,
      T.button('Share on WhatsApp', { small: true, onclick: function () { window.open('https://wa.me/?text=' + encodeURIComponent(shareText(items())), '_blank', 'noopener'); } })])]));
  V.ready.then(draw);
  T.tests.todo = function () {
    var f = [], s = sorted([{ text: 'a', pri: 2, due: '', done: true, at: 1 }, { text: 'b', pri: 3, due: '', done: false, at: 2 }, { text: 'c', pri: 1, due: '2026-05-02', done: false, at: 3 }, { text: 'd', pri: 1, due: '2026-05-01', done: false, at: 4 }, { text: 'e', pri: 2, due: '', done: false, at: 5 }]);
    if (s.map(function (x) { return x.text; }).join('') !== 'dceba') f.push('sort ' + s.map(function (x) { return x.text; }).join(''));
    if (shareText([{ text: 'Milk', pri: 2, done: false, at: 1 }, { text: 'Eggs', pri: 2, done: true, at: 2 }]) !== '📝 To-do\n⬜ Milk\n✅ Eggs') f.push('share text');
    if (dueLabel('2026-01-01', '2026-02-01').indexOf('overdue') < 0 || dueLabel('2026-02-01', '2026-02-01') !== 'today') f.push('due label');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
