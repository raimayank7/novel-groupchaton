/* Infinity by GroupChatOn — countdown. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Countdown to any date and time: days, hours, minutes and seconds, saved countdowns, and a share text. */
GCOTools.register('countdown', function (spot, T) {
  var h = T.h, status = T.status();
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function parts(ms) { var past = ms < 0; ms = Math.abs(ms); return { past: past, d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 }; }
  function nextYearly(now, mo, d) { var t = new Date(now.getFullYear(), mo, d); if (t <= now) t = new Date(now.getFullYear() + 1, mo, d); return t; }
  function at(dateStr, timeStr) { var a = String(dateStr).split('-'), b = String(timeStr || '00:00').split(':'); return new Date(+a[0], a[1] - 1, +a[2], +b[0] || 0, +b[1] || 0); }
  function ymd(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  var name = h('input', { type: 'text', placeholder: 'e.g. Exams, Wedding, Trip', value: 'New Year' }), date = h('input', { type: 'date' }), time = h('input', { type: 'time', value: '00:00' });
  var boxes = h('div', { 'class': 'tstats', 'data-out': '' }), title = h('div', { style: 'text-align:center;font:700 19px/1.35 var(--ui)' }), extra = h('p', { 'class': 'tnote', style: 'text-align:center' });
  var saved = h('div', { 'class': 'trow' });
  function target() { return date.value ? at(date.value, time.value) : null; }
  function text() {
    var t = target(); if (!t) return '';
    var p = parts(t - Date.now());
    return p.past ? '“' + (name.value || 'The day') + '” was ' + p.d + ' days ago.' : '⏳ ' + p.d + ' days, ' + p.h + ' hours to go until ' + (name.value || 'the big day') + ' (' + t.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + ')';
  }
  function draw() {
    var t = target();
    boxes.innerHTML = ''; extra.textContent = '';
    if (!t || isNaN(t)) { title.textContent = 'Pick a date to start the countdown'; return; }
    var ms = t - Date.now(), p = parts(ms);
    title.textContent = (p.past ? 'Time since ' : 'Time left until ') + (name.value || 'your date') + ' · ' + t.toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    [[p.d, 'Days'], [p.h, 'Hours'], [p2(p.m), 'Minutes'], [p2(p.s), 'Seconds']].forEach(function (r) { boxes.appendChild(h('div', { 'class': 'tstat', style: 'text-align:center' }, [h('b', { text: String(r[0]), style: 'font-size:34px' }), h('span', { text: r[1] })])); });
    var abs = Math.abs(ms);
    extra.textContent = 'That is ' + Math.floor(abs / 6048e5) + ' weeks and ' + (Math.floor(abs / 864e5) % 7) + ' days, or ' + Math.floor(abs / 36e5).toLocaleString() + ' hours in total.' + (p.past ? ' This date has passed.' : '');
  }
  function setTo(n, d) { name.value = n; date.value = ymd(d); time.value = p2(d.getHours()) + ':' + p2(d.getMinutes()); status.clear(); draw(); }
  function list() { return T.store.get('cd-list', []); }
  function drawSaved() {
    saved.innerHTML = '';
    list().forEach(function (c, i) {
      saved.appendChild(h('span', { 'class': 'tseg' }, [h('button', { type: 'button', text: c.n, onclick: function () { setTo(c.n, at(c.d, c.t)); } }),
        h('button', { type: 'button', 'aria-label': 'Remove ' + c.n, text: '✕', onclick: function () { var l = list(); l.splice(i, 1); T.store.set('cd-list', l); drawSaved(); } })]));
    });
  }
  var now = new Date();
  var presets = T.row([['🎆 New Year', 0, 1], ['🎄 Christmas', 11, 25], ['💝 Valentine’s', 1, 14]].map(function (p) { return T.button(p[0], { small: true, onclick: function () { setTo(p[0].slice(3), nextYearly(new Date(), p[1], p[2])); } }); })
    .concat([T.button('📅 +1 week', { small: true, onclick: function () { var d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); setTo('In one week', d); } })]));
  [name, date, time].forEach(function (x) { x.addEventListener('input', draw); });
  var copy = T.button('Copy', { small: true, onclick: function () { T.copy(text(), copy); } });
  spot.appendChild(T.card([T.field('Event name', name), h('div', { 'class': 'tgrid2' }, [T.field('Date', date), T.field('Time', time)]), presets, title, boxes, extra, status.el,
    T.row([T.button('Save this countdown', { onclick: function () {
      if (!date.value) return status.error('Pick a date first.');
      var l = list().filter(function (c) { return c.n !== name.value; }); l.push({ n: name.value || 'My countdown', d: date.value, t: time.value }); T.store.set('cd-list', l.slice(-12)); drawSaved(); status.ok('Saved on this device.');
    } }), copy, T.button('Share on WhatsApp', { small: true, onclick: function () { window.open('https://wa.me/?text=' + encodeURIComponent(text()), '_blank', 'noopener'); } }),
    T.button('Try a sample', { small: true, onclick: function () { setTo('New Year', nextYearly(new Date(), 0, 1)); } })]), saved]));
  setTo('New Year', nextYearly(now, 0, 1)); drawSaved();
  setInterval(draw, 1000);
  T.tests.countdown = function () {
    var f = [], p = parts(Date.UTC(2026, 0, 2, 3, 4, 5) - Date.UTC(2026, 0, 1));
    if (p.d !== 1 || p.h !== 3 || p.m !== 4 || p.s !== 5 || p.past) f.push('parts');
    if (!parts(-1000).past) f.push('past');
    var n = nextYearly(new Date(2026, 11, 26), 11, 25); if (n.getFullYear() !== 2027) f.push('next Christmas ' + n);
    if (at('2026-03-05', '14:30').getHours() !== 14 || at('2026-03-05').getDate() !== 5) f.push('at');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
