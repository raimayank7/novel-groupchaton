/* Infinity by GroupChatOn — study-planner. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Study planner and exam countdown: subjects and topics, what to finish each day, and today's to-do list. */
GCOTools.register('study-planner', function (spot, T) {
  var h = T.h, V = T.vault('study', { exams: [], topics: [], tasks: [], rev: 3 }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function daysLeft(d, today) { return Math.round((new Date(d + 'T00:00:00') - new Date((today || iso()) + 'T00:00:00')) / 864e5); }
  function plan(exam, today) {
    var left = db.topics.filter(function (t) { return t.e === exam.id && !t.done; }).length, all = db.topics.filter(function (t) { return t.e === exam.id; }).length;
    var days = daysLeft(exam.d, today), study = Math.max(1, days - (db.rev || 0));
    return { all: all, left: left, done: all - left, days: days, perDay: left ? Math.ceil(left / study) : 0, pct: all ? Math.round((all - left) / all * 100) : 0 };
  }
  var tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' }), cur = 'today', sel = null;
  function draw() {
    db = V.data(); tabs.innerHTML = ''; body.innerHTML = '';
    [['today', '📅 Today'], ['syllabus', '📚 Syllabus'], ['exams', '⏳ Exams']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(cur === t[0]), text: t[1], onclick: function () { cur = t[0]; draw(); } })); });
    ({ today: drawToday, syllabus: drawSyllabus, exams: drawExams })[cur]();
  }
  function upcoming() { return db.exams.filter(function (e) { return daysLeft(e.d) >= 0; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; }); }
  function drawToday() {
    var up = upcoming();
    if (up.length) body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, up.slice(0, 3).map(function (e) { var p = plan(e), n = p.days; return h('div', {}, [h('span', { text: e.name }), h('b', { text: n === 0 ? 'Today!' : n + (n === 1 ? ' day' : ' days') }), h('span', { text: p.all ? p.pct + '% syllabus done' : 'add topics' })]); })));
    var t = h('input', { type: 'text', placeholder: 'Add a task for today (e.g. 20 maths problems)' });
    var addT = function () { if (!t.value.trim()) return; db.tasks.push({ id: uid(), d: iso(), text: t.value.trim(), done: false }); save(); draw(); };
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter') addT(); });
    body.appendChild(T.row([t, T.button('Add', { primary: true, onclick: addT })]));
    // suggested topics: enough from each upcoming exam to stay on track
    var list = h('div', { 'class': 'tlist' });
    up.forEach(function (e) {
      var p = plan(e); if (!p.left) return;
      db.topics.filter(function (x) { return x.e === e.id && !x.done; }).slice(0, p.perDay).forEach(function (x) {
        list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: '📘' }), h('span', { 'class': 'titem-main' }, [h('b', { text: x.sub ? x.sub + ': ' + x.name : x.name }), h('small', { text: 'For ' + e.name + ' · ' + p.perDay + ' topic' + (p.perDay > 1 ? 's' : '') + ' a day keeps you on time' })]),
          T.button('Done', { small: true, primary: true, onclick: function () { x.done = iso(); save(); draw(); } })]));
      });
    });
    db.tasks.filter(function (x) { return x.d === iso() || (!x.done && x.d < iso()); }).forEach(function (x) {
      var cb = h('input', { type: 'checkbox', checked: x.done ? true : null, 'aria-label': 'Done' }); cb.addEventListener('change', function () { x.done = cb.checked; save(); draw(); });
      list.appendChild(h('div', { 'class': 'titem' }, [cb, h('span', { 'class': 'titem-main' }, [h('b', { text: x.text, style: x.done ? 'text-decoration:line-through;opacity:.6' : null }), x.d < iso() ? h('small', { text: 'from ' + x.d }) : null]),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { db.tasks = db.tasks.filter(function (y) { return y !== x; }); save(); draw(); } })]));
    });
    if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: db.exams.length ? 'All clear for today. 🎉' : 'Start in ⏳ Exams: add your exam dates, then your topics in 📚 Syllabus.' }));
    body.appendChild(h('h3', { text: 'Today’s plan' })); body.appendChild(list);
  }
  function pickExam() {
    if (!db.exams.length) return null;
    if (!db.exams.filter(function (e) { return e.id === sel; }).length) sel = (upcoming()[0] || db.exams[0]).id;
    var s = T.select(db.exams.map(function (e) { return [e.id, e.name + ' · ' + e.d]; }), sel); s.addEventListener('change', function () { sel = s.value; draw(); });
    return T.field('Exam', s);
  }
  function drawSyllabus() {
    var pe = pickExam(); if (!pe) { body.appendChild(h('p', { 'class': 'tnote', text: 'Add an exam first (⏳ Exams).' })); return; }
    body.appendChild(pe);
    var e = db.exams.filter(function (x) { return x.id === sel; })[0], p = plan(e);
    body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Done', p.done + ' of ' + p.all], ['Days left', String(Math.max(0, p.days))], ['Topics a day', String(p.perDay)]].map(function (x) { return h('div', {}, [h('span', { text: x[0] }), h('b', { text: x[1] })]); })));
    body.appendChild(h('div', { 'class': 'tprogress' }, [h('span', { style: 'width:' + p.pct + '%' })]));
    var sub = h('input', { type: 'text', placeholder: 'Subject (e.g. Physics)', list: 'sp-subs' }), tp = h('textarea', { rows: '3', placeholder: 'Topics or chapters, one per line' });
    var subs = {}; db.topics.forEach(function (x) { if (x.sub) subs[x.sub] = 1; });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Subject', sub), h('datalist', { id: 'sp-subs' }, Object.keys(subs).map(function (s) { return h('option', { value: s }); }))]));
    body.appendChild(T.field('Topics', tp));
    body.appendChild(T.row([T.button('Add topics', { primary: true, onclick: function () {
      var ls = tp.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean); if (!ls.length) { tp.focus(); return; }
      ls.forEach(function (n) { db.topics.push({ id: uid(), e: e.id, sub: sub.value.trim(), name: n, done: '' }); }); save(); draw();
    } })]));
    var groups = {}; db.topics.filter(function (x) { return x.e === e.id; }).forEach(function (x) { (groups[x.sub || 'General'] = groups[x.sub || 'General'] || []).push(x); });
    var list = h('div', { 'class': 'tlist' });
    Object.keys(groups).sort().forEach(function (g) {
      var dn = groups[g].filter(function (x) { return x.done; }).length;
      list.appendChild(h('div', { 'class': 'tday' }, [h('span', { text: g }), h('span', { text: dn + ' / ' + groups[g].length })]));
      groups[g].forEach(function (x) {
        var cb = h('input', { type: 'checkbox', checked: x.done ? true : null, 'aria-label': 'Done' }); cb.addEventListener('change', function () { x.done = cb.checked ? iso() : ''; save(); draw(); });
        list.appendChild(h('div', { 'class': 'titem' }, [cb, h('span', { 'class': 'titem-main' }, [h('b', { text: x.name, style: x.done ? 'text-decoration:line-through;opacity:.6' : null })]),
          h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { db.topics = db.topics.filter(function (y) { return y !== x; }); save(); draw(); } })]));
      });
    });
    body.appendChild(list);
  }
  function drawExams() {
    var n = h('input', { type: 'text', placeholder: 'e.g. Board maths, NEET, Semester 3' }), d = h('input', { type: 'date' }), rv = h('input', { type: 'number', min: '0', step: '1', value: db.rev });
    rv.addEventListener('change', function () { db.rev = Math.max(0, parseInt(rv.value, 10) || 0); save(); });
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Exam', n), T.field('Date', d)]));
    body.appendChild(T.row([T.button('Add exam', { primary: true, onclick: function () { if (!n.value.trim() || !d.value) { (n.value.trim() ? d : n).focus(); return; } var e = { id: uid(), name: n.value.trim(), d: d.value }; db.exams.push(e); sel = e.id; save(); cur = 'syllabus'; draw(); } })]));
    var list = h('div', { 'class': 'tlist', 'data-out': '' });
    db.exams.slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; }).forEach(function (e) {
      var p = plan(e);
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: p.days < 0 ? '✔️' : '⏳' }), h('span', { 'class': 'titem-main' }, [h('b', { text: e.name }), h('small', { text: new Date(e.d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + (p.all ? ' · ' + p.pct + '% done' : '') })]),
        h('span', { 'class': 'titem-amt', text: p.days < 0 ? 'Over' : p.days === 0 ? 'Today' : p.days + ' days' }),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete ' + e.name + ' and its topics?')) { db.exams = db.exams.filter(function (x) { return x !== e; }); db.topics = db.topics.filter(function (x) { return x.e !== e.id; }); save(); draw(); } } })]));
    });
    body.appendChild(list);
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Days kept for revision before each exam', rv)]));
    body.appendChild(h('p', { 'class': 'tnote', text: 'Topics a day = topics left ÷ (days left − revision days), so you finish the syllabus with time to revise.' }));
  }
  spot.appendChild(T.card([V.bar(draw), tabs, body]));
  V.ready.then(draw);

  T.tests['study-planner'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    if (daysLeft('2026-11-21', '2026-11-01') !== 20) fails.push('days left');
    var tp = []; for (var i = 0; i < 34; i++) tp.push({ id: 't' + i, e: 'e', sub: 'Maths', name: 'Topic ' + i, done: i < 4 ? '2026-10-01' : '' });
    V.save({ exams: [{ id: 'e', name: 'Test exam', d: '2026-11-21' }], topics: tp, tasks: [], rev: 3 }); db = V.data();
    var p = plan(db.exams[0], '2026-11-01');
    if (p.left !== 30 || p.perDay !== 2 || p.pct !== 12) fails.push('plan ' + JSON.stringify(p));
    db.rev = 30; if (plan(db.exams[0], '2026-11-01').perDay !== 30) fails.push('all revision days ' + plan(db.exams[0], '2026-11-01').perDay); db.rev = 3;
    sel = 'e'; cur = 'syllabus'; draw(); if (body.textContent.indexOf('4 of 34') < 0) fails.push('syllabus not shown');
    return V.save(keep).then(function () { cur = 'today'; sel = null; draw(); return { ok: !fails.length, n: 4, fails: fails }; });
  }
});
