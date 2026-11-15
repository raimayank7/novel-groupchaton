/* Infinity by GroupChatOn — habit. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Habit tracker: tick off daily habits, see the last 7 days, streaks and a month view for each habit. Saved on this device. */
GCOTools.register('habit', function (spot, T) {
  var h = T.h, status = T.status(), V = T.vault('habits', { habits: [] });
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function shift(key, n) { var d = new Date(key + 'T12:00:00'); d.setDate(d.getDate() + n); return dkey(d); }
  // current streak: today counts if done; if today is not ticked yet, the streak up to yesterday still stands
  function streak(done, today) { var k = done[today] ? today : shift(today, -1), n = 0; while (done[k]) { n++; k = shift(k, -1); } return n; }
  function best(done) { var ks = Object.keys(done).filter(function (k) { return done[k]; }).sort(), b = 0, run = 0, prev = null; ks.forEach(function (k) { run = prev && shift(prev, 1) === k ? run + 1 : 1; b = Math.max(b, run); prev = k; }); return b; }
  function rate(done, today, days) { var n = 0; for (var i = 0; i < days; i++) if (done[shift(today, -i)]) n++; return Math.round(n / days * 100); }
  var name = h('input', { type: 'text', placeholder: 'New habit, e.g. Walk 30 minutes', 'aria-label': 'New habit', enterkeyhint: 'done' }), icon = T.select(['✅', '🚶', '💧', '📚', '🧘', '🏋️', '🥗', '😴', '🙏', '💊', '🎸', '✍️', '🚭', '📵', '🦷'].map(function (x) { return [x, x]; }), '✅');
  var board = h('div', { style: 'display:grid;gap:10px' }), month = h('div');
  function draw() {
    var d = V.data(), today = dkey(new Date()); board.innerHTML = '';
    if (!d.habits.length) board.appendChild(h('p', { 'class': 'tnote', text: 'No habits yet. Add one above, like “Drink 8 glasses of water” or “Read 10 pages”.' }));
    d.habits.forEach(function (hb, i) {
      var days = h('div', { style: 'display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px' });
      for (var k = 6; k >= 0; k--) (function (key) {
        var on = !!hb.done[key], dt = new Date(key + 'T12:00:00');
        days.appendChild(h('button', { type: 'button', 'aria-pressed': String(on), 'aria-label': hb.name + ' on ' + dt.toDateString(),
          style: 'min-height:48px;border-radius:10px;border:1px solid ' + (on ? 'var(--accent)' : 'var(--line)') + ';background:' + (on ? 'var(--accent)' : 'var(--bg)') + ';color:' + (on ? 'var(--accent-ink)' : 'var(--ink)') + ';font:600 12px/1.2 var(--ui);cursor:pointer;padding:2px',
          onclick: function () { if (hb.done[key]) delete hb.done[key]; else hb.done[key] = 1; V.save(d); draw(); } }, [h('span', { style: 'display:block;opacity:.75', text: dt.toLocaleDateString(undefined, { weekday: 'narrow' }) }), h('span', { text: on ? '✓' : String(dt.getDate()) })]));
      })(shift(today, -k));
      var st = streak(hb.done, today);
      board.appendChild(h('div', { style: 'display:grid;gap:8px;padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--bg)' }, [
        h('div', { 'class': 'trow trow-split' }, [h('b', { text: hb.icon + ' ' + hb.name }), h('span', { 'data-out': '', style: 'font-weight:700', text: (st ? '🔥 ' + st + '-day streak' : 'No streak yet') })]),
        days,
        h('div', { 'class': 'trow trow-split', style: 'font-size:13px;color:var(--muted)' }, [h('span', { text: 'Best ' + best(hb.done) + ' days · last 30 days ' + rate(hb.done, today, 30) + '%' }),
          h('span', {}, [T.button('Month', { small: true, onclick: function () { showMonth(hb); } }), ' ', T.button('✕', { small: true, onclick: function () { if (!confirm('Delete the habit “' + hb.name + '” and its history?')) return; d.habits.splice(i, 1); V.save(d); month.innerHTML = ''; draw(); } })])])]));
    });
  }
  function showMonth(hb) {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), off = (first.getDay() + 6) % 7;
    var g = h('div', { style: 'display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;text-align:center;font:12px var(--ui)' });
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(function (x) { g.appendChild(h('b', { style: 'color:var(--muted)', text: x })); });
    for (var i = 0; i < off; i++) g.appendChild(h('span'));
    for (var dd = 1; dd <= n; dd++) { var on = hb.done[y + '-' + pad(m + 1) + '-' + pad(dd)]; g.appendChild(h('span', { style: 'padding:8px 0;border-radius:8px;background:' + (on ? 'var(--accent)' : 'var(--surface-2)') + ';color:' + (on ? 'var(--accent-ink)' : 'var(--ink)'), text: String(dd) })); }
    month.innerHTML = ''; month.appendChild(h('b', { text: hb.icon + ' ' + hb.name + ' · ' + now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) })); month.appendChild(g);
  }
  function addHabit() {
    var n = name.value.trim(); if (!n) { status.error('Type a name for the habit.'); return; }
    var d = V.data(); if (d.habits.length >= 30) { status.error('Up to 30 habits: keep it simple!'); return; }
    d.habits.push({ name: n.slice(0, 60), icon: icon.value, done: {} }); V.save(d); name.value = ''; status.clear(); draw();
  }
  name.addEventListener('keydown', function (e) { if (e.key === 'Enter') addHabit(); });
  name.style.flex = '1'; name.style.minWidth = '0';
  spot.appendChild(T.card([T.row([icon, name, T.button('Add habit', { primary: true, onclick: addHabit })]), status.el, board, month,
    h('p', { 'class': 'tnote', text: 'Tap a day to tick it (tap again to undo). You can fill in the last 7 days if you forgot.' }), V.bar(draw)]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  icon.style.width = 'auto';
  V.ready.then(draw);
  T.tests['habit'] = function () {
    var f = [], D = { '2026-11-01': 1, '2026-10-31': 1, '2026-10-30': 1, '2026-10-28': 1, '2026-10-27': 1 };
    if (streak(D, '2026-11-01') !== 3) f.push('streak today ' + streak(D, '2026-11-01'));
    if (streak(D, '2026-11-02') !== 3) f.push('streak not yet today');
    if (streak(D, '2026-11-03') !== 0) f.push('broken streak');
    if (best(D) !== 3) f.push('best ' + best(D));
    if (shift('2026-03-01', -1) !== '2026-02-28' || shift('2024-02-28', 1) !== '2024-02-29') f.push('dates');
    if (rate(D, '2026-11-01', 10) !== 50) f.push('rate ' + rate(D, '2026-11-01', 10));
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
