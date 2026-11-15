/* Infinity by GroupChatOn — workout-log. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Gym and workout log: exercises, sets, reps and weight; personal bests, weekly volume and streak. */
GCOTools.register('workout-log', function (spot, T) {
  var h = T.h, V = T.vault('workout', { log: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var COMMON = ['Bench press', 'Squat', 'Deadlift', 'Overhead press', 'Barbell row', 'Pull-ups', 'Push-ups', 'Lat pulldown', 'Bicep curl', 'Tricep pushdown', 'Leg press', 'Lunges', 'Plank', 'Running', 'Cycling', 'Walking', 'Skipping', 'Yoga', 'Surya namaskar'];
  function vol(x) { return (x.s || 1) * (x.r || 0) * (x.w || 0); }
  function oneRM(w, r) { return r > 0 && w > 0 ? (r === 1 ? w : w * (1 + r / 30)) : 0; }   // Epley estimate
  function bests() { var b = {}; db.log.forEach(function (x) { var k = x.ex.toLowerCase(), e = oneRM(x.w, x.r), c = b[k] || { ex: x.ex, w: 0, rm: 0, min: 0 }; if (x.w > c.w) c.w = x.w; if (e > c.rm) c.rm = e; if (x.min > c.min) c.min = x.min; b[k] = c; }); return b; }
  function streak(today) {
    var days = {}; db.log.forEach(function (x) { days[x.d] = 1; });
    var d = new Date((today || iso()) + 'T00:00:00'), n = 0; if (!days[iso(d)]) d.setDate(d.getDate() - 1);
    while (days[iso(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function week(today) {
    var d = new Date((today || iso()) + 'T00:00:00'), from = iso(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6)), r = { days: {}, vol: 0, min: 0 };
    db.log.forEach(function (x) { if (x.d >= from && x.d <= iso(d)) { r.days[x.d] = 1; r.vol += vol(x); r.min += x.min || 0; } });
    r.n = Object.keys(r.days).length; return r;
  }
  var ex = h('input', { type: 'text', placeholder: 'e.g. Bench press, Running', list: 'wo-ex' }), dl = h('datalist', { id: 'wo-ex' });
  var s = h('input', { type: 'number', min: '0', step: '1', inputmode: 'numeric', placeholder: '3' }), r = h('input', { type: 'number', min: '0', step: '1', inputmode: 'numeric', placeholder: '10' });
  var w = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: 'kg (0 for body weight)' }), mi = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: 'minutes (cardio)' });
  var d = h('input', { type: 'date', value: iso() }), note = h('input', { type: 'text', placeholder: 'e.g. felt strong, knee sore' }), lastTime = h('p', { 'class': 'tnote' }), msg = T.status();
  ex.addEventListener('input', function () {
    var k = ex.value.trim().toLowerCase(), l = db.log.filter(function (x) { return x.ex.toLowerCase() === k; }).sort(function (a, b) { return a.d < b.d ? 1 : -1; })[0];
    lastTime.textContent = l ? 'Last time (' + l.d + '): ' + (l.r ? (l.s || 1) + ' × ' + l.r + (l.w ? ' @ ' + T.num(l.w) + ' kg' : '') : '') + (l.min ? ' ' + T.num(l.min) + ' min' : '') : '';
  });
  function add() {
    var x = { id: uid(), d: d.value || iso(), ex: ex.value.trim(), s: parseInt(s.value, 10) || 0, r: parseInt(r.value, 10) || 0, w: parseFloat(w.value) || 0, min: parseFloat(mi.value) || 0, n: note.value.trim() };
    if (!x.ex) { msg.error('Type the exercise.'); ex.focus(); return; }
    if (!x.r && !x.min) { msg.error('Type reps (and sets), or minutes for cardio.'); r.focus(); return; }
    if (x.r && !x.s) x.s = 1;
    var b = bests()[x.ex.toLowerCase()], pr = b && x.w > b.w;
    db.log.push(x); save(); msg.ok(pr ? '🏆 New best weight for ' + x.ex + ': ' + T.num(x.w) + ' kg!' : 'Saved ' + x.ex + '.');
    note.value = ''; draw();
  }
  [s, r, w, mi].forEach(function (x) { x.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); }); });
  var sum = h('div', { 'class': 'tsum', 'data-out': '' }), list = h('div', { 'class': 'tlist' }), prs = h('div', { 'class': 'tlist' });
  function draw() {
    db = V.data(); sum.innerHTML = ''; list.innerHTML = ''; prs.innerHTML = '';
    var names = {}; COMMON.concat(db.log.map(function (x) { return x.ex; })).forEach(function (n) { names[n] = 1; }); dl.innerHTML = ''; Object.keys(names).forEach(function (n) { dl.appendChild(h('option', { value: n })); });
    var wk = week();
    [['Streak', streak() + (streak() === 1 ? ' day' : ' days')], ['Workouts in 7 days', T.num(wk.n)], ['Volume in 7 days', T.num(wk.vol) + ' kg'], ['Cardio in 7 days', T.num(wk.min) + ' min']].forEach(function (x) { sum.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { text: x[1] })])); });
    var day = '';
    db.log.slice().sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; }).slice(0, 80).forEach(function (x) {
      if (x.d !== day) { day = x.d; var dv = db.log.filter(function (y) { return y.d === day; }).reduce(function (t, y) { return t + vol(y); }, 0); list.appendChild(h('div', { 'class': 'tday' }, [h('span', { text: new Date(day + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) }), h('span', { text: dv ? T.num(dv) + ' kg lifted' : '' })])); }
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: x.ex }), h('small', { text: (x.r ? x.s + ' × ' + x.r + (x.w ? ' @ ' + T.num(x.w) + ' kg' : ' (body weight)') : '') + (x.min ? (x.r ? ' · ' : '') + T.num(x.min) + ' min' : '') + (x.n ? ' · ' + x.n : '') })]),
        h('button', { type: 'button', 'aria-label': 'Do again', title: 'Do again', text: '↻', onclick: function () { ex.value = x.ex; s.value = x.s || ''; r.value = x.r || ''; w.value = x.w || ''; mi.value = x.min || ''; d.value = iso(); ex.dispatchEvent(new Event('input')); ex.focus(); } }),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this entry?')) { db.log = db.log.filter(function (y) { return y !== x; }); save(); draw(); } } })]));
    });
    if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: 'Log your first exercise above.' }));
    var b = bests(); Object.keys(b).sort().forEach(function (k) {
      var c = b[k]; if (!c.w && !c.min) return;
      prs.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: '🏆' }), h('span', { 'class': 'titem-main' }, [h('b', { text: c.ex }), h('small', { text: c.rm ? 'Estimated 1-rep max ' + T.num(c.rm, 1) + ' kg' : '' })]),
        h('span', { 'class': 'titem-amt', text: c.w ? T.num(c.w) + ' kg' : T.num(c.min) + ' min' })]));
    });
    if (!prs.children.length) prs.appendChild(h('p', { 'class': 'tnote', text: 'Your best lifts will show here.' }));
  }
  spot.appendChild(T.card([V.bar(draw), h('div', { 'class': 'tool-app-opts' }, [h('div', { 'class': 'tgrid2' }, [T.field('Exercise', ex), T.field('Sets', s), T.field('Reps', r), T.field('Weight (kg)', w), T.field('Minutes', mi), T.field('Date', d), T.field('Note', note), dl]),
    lastTime, T.row([T.button('Save', { primary: true, onclick: add })]), msg.el]), sum, h('h3', { text: 'Workouts' }), list, h('h3', { text: 'Personal bests' }), prs]));
  V.ready.then(draw);

  T.tests['workout-log'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ log: [{ id: '1', d: '2026-10-08', ex: 'Squat', s: 3, r: 5, w: 100 }, { id: '2', d: '2026-10-09', ex: 'Squat', s: 3, r: 8, w: 80 }, { id: '3', d: '2026-10-10', ex: 'Running', min: 30 }, { id: '4', d: '2026-10-05', ex: 'Bench press', s: 3, r: 10, w: 50 }] }); db = V.data();
    if (vol(db.log[0]) !== 1500) fails.push('volume ' + vol(db.log[0]));
    var b = bests().squat; if (b.w !== 100 || Math.abs(b.rm - 116.6667) > 0.01) fails.push('squat best ' + JSON.stringify(b));
    if (streak('2026-10-10') !== 3 || streak('2026-10-11') !== 3 || streak('2026-10-12') !== 0) fails.push('streak ' + streak('2026-10-10') + ',' + streak('2026-10-11') + ',' + streak('2026-10-12'));
    var wk = week('2026-10-10'); if (wk.n !== 4 || wk.vol !== 1500 + 1920 + 1500 || wk.min !== 30) fails.push('week ' + JSON.stringify(wk));
    draw(); if (prs.textContent.indexOf('116.7') < 0) fails.push('PR not shown');
    return V.save(keep).then(function () { db = V.data(); draw(); return { ok: !fails.length, n: 5, fails: fails }; });
  }
});
