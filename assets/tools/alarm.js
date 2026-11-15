/* Infinity by GroupChatOn — alarm. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Online alarm clock: several alarms, daily repeat, snooze, a choice of sounds, and keep-screen-on. Rings while this tab stays open. */
GCOTools.register('alarm', function (spot, T) {
  var h = T.h, status = T.status();
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function msUntil(now, hm) {   // ms from now to the next time the clock shows hm ("07:30")
    var a = String(hm).split(':'), t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +a[0] || 0, +a[1] || 0, 0, 0);
    if (t <= now) t.setDate(t.getDate() + 1);
    return t - now;
  }
  var ac = null, ringing = null, loop = 0, wake = null;
  function audio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume(); } catch (e) {} return ac; }
  function sound(kind, vol) {
    var c = audio(); if (!c) return;
    var t = c.currentTime + 0.03, notes = kind === 'bell' ? [[784, 0], [659, 0.5]] : kind === 'soft' ? [[523, 0], [659, 0.3], [784, 0.6]] : [[1000, 0], [1000, 0.15], [1000, 0.3], [1000, 0.45]];
    notes.forEach(function (n) {
      var o = c.createOscillator(), g = c.createGain(), s = t + n[1], d = kind === 'bell' ? 0.9 : kind === 'soft' ? 0.5 : 0.1;
      o.type = kind === 'beep' ? 'square' : 'sine'; o.frequency.value = n[0];
      g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + d);
      o.connect(g); g.connect(c.destination); o.start(s); o.stop(s + d + 0.05);
    });
  }
  var alarms = T.store.get('alarm-list', []);
  function save() { T.store.set('alarm-list', alarms); }
  var clock = h('div', { 'data-out': '', style: 'font:800 clamp(48px,15vw,88px)/1.05 var(--ui);text-align:center;font-variant-numeric:tabular-nums' }), dateLine = h('div', { style: 'text-align:center;color:var(--ink-soft)' });
  var tIn = h('input', { type: 'time', value: '07:00' }), lab = h('input', { type: 'text', placeholder: 'Label (optional), e.g. Wake up' }), rep = h('input', { type: 'checkbox', checked: true });
  var kind = T.select([['beep', 'Beep beep'], ['bell', 'Bell'], ['soft', 'Soft chime']], T.store.get('alarm-sound', 'beep')), vol = h('input', { type: 'range', min: '5', max: '100', value: String(T.store.get('alarm-vol', 70)) });
  kind.addEventListener('change', function () { T.store.set('alarm-sound', kind.value); }); vol.addEventListener('change', function () { T.store.set('alarm-vol', +vol.value); });
  var listEl = h('div', { 'class': 'tlist' }), ringBox = h('div', { hidden: true, role: 'alert', style: 'display:grid;gap:12px;padding:18px;border-radius:16px;background:#fef3c7;color:#111;text-align:center' });
  function nextFor(a) { return Date.now() + msUntil(new Date(), a.t); }
  function drawList() {
    listEl.innerHTML = '';
    if (!alarms.length) listEl.appendChild(h('p', { 'class': 'tnote', text: 'No alarms yet. Pick a time and press Add alarm.' }));
    alarms.sort(function (a, b) { return a.t < b.t ? -1 : 1; }).forEach(function (a, i) {
      var on = h('input', { type: 'checkbox', checked: a.on ? true : null, 'aria-label': 'Alarm on' });
      on.addEventListener('change', function () { a.on = on.checked; if (a.on) a.next = nextFor(a); save(); drawList(); });
      var left = a.on ? Math.max(0, a.next - Date.now()) : 0, hl = Math.floor(left / 36e5), ml = Math.ceil(left / 6e4) % 60;
      listEl.appendChild(h('div', { style: 'display:flex;gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg)' }, [
        on, h('b', { text: a.t, style: 'font-size:22px;font-variant-numeric:tabular-nums' }),
        h('span', { style: 'flex:1;min-width:0' }, [h('span', { text: a.l || 'Alarm' }), h('small', { style: 'display:block;color:var(--muted)', text: (a.r ? 'Every day' : 'Once') + (a.on ? ' · rings in ' + (hl ? hl + ' h ' : '') + ml + ' min' : ' · off') })]),
        T.button('✕', { small: true, onclick: function () { alarms.splice(i, 1); save(); drawList(); } })]));
    });
  }
  function ring(a) {
    ringing = a; ringBox.hidden = false; ringBox.innerHTML = '';
    ringBox.appendChild(h('b', { style: 'font-size:28px', text: '⏰ ' + a.t + (a.l ? ' · ' + a.l : '') }));
    ringBox.appendChild(T.row([T.button('Stop', { primary: true, onclick: stop }), T.button('Snooze 5 min', { onclick: function () { a.snooze = Date.now() + 300000; a.on = true; save(); stop(true); } })], 'trow-c'));
    clearInterval(loop); var n = 0;
    sound(kind.value, vol.value / 100); loop = setInterval(function () { sound(kind.value, vol.value / 100); if (++n > 300) stop(); }, 2000);
    if (navigator.vibrate) navigator.vibrate([500, 300, 500, 300, 500]);
    if (!/^⏰/.test(document.title)) document.title = '⏰ ' + document.title;
  }
  function stop(snoozed) {
    clearInterval(loop); ringBox.hidden = true; document.title = document.title.replace(/^⏰ /, '');
    if (ringing && snoozed !== true) { delete ringing.snooze; if (ringing.r) ringing.next = nextFor(ringing); else ringing.on = false; save(); }
    ringing = null; drawList();
  }
  function tick() {
    var d = new Date();
    clock.textContent = p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
    dateLine.textContent = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (ringing) return;
    alarms.forEach(function (a) {
      if (!a.on) return;
      var due = a.snooze || a.next;
      if (Date.now() >= due) { if (Date.now() - due < 600000) ring(a); else { delete a.snooze; if (a.r) a.next = nextFor(a); else a.on = false; save(); drawList(); } }
    });
    if (d.getSeconds() === 0) drawList();
  }
  var add = T.button('Add alarm', { primary: true, onclick: function () {
    if (!tIn.value) return status.error('Pick a time first.');
    audio();   // the tap unlocks sound, so the alarm can ring later
    var a = { t: tIn.value, l: lab.value.trim(), r: rep.checked, on: true }; a.next = nextFor(a);
    alarms.push(a); save(); drawList(); lab.value = '';
    status.ok('Alarm set for ' + a.t + '. Keep this tab open and the sound on.');
  } });
  var keep = T.button('Keep screen on', { small: true, onclick: function () {
    if (!('wakeLock' in navigator)) return status.error('This browser cannot keep the screen on. Change the screen timeout in your phone settings instead.');
    if (wake) { wake.release(); wake = null; keep.textContent = 'Keep screen on'; return; }
    navigator.wakeLock.request('screen').then(function (w) { wake = w; keep.textContent = 'Screen stays on ✓'; w.addEventListener('release', function () { wake = null; keep.textContent = 'Keep screen on'; }); }, function (e) { status.error(e); });
  } });
  if (alarms.length) document.addEventListener('pointerdown', function once() { audio(); document.removeEventListener('pointerdown', once); });
  spot.appendChild(T.card([clock, dateLine, ringBox,
    h('div', { 'class': 'tgrid2' }, [T.field('Alarm time', tIn), T.field('Label', lab), T.field('Sound', kind), T.field('Volume', vol)]),
    h('label', { 'class': 'tcheck' }, [rep, ' Repeat every day']),
    T.row([add, T.button('Test sound', { small: true, onclick: function () { sound(kind.value, vol.value / 100); } }), keep]), status.el, listEl,
    h('p', { 'class': 'tnote', text: 'The alarm rings only while this page is open and your device is awake: plug in your phone, keep the volume up and tap “Keep screen on”. For a must-not-miss alarm, also set your phone’s own clock app.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  tick(); drawList(); setInterval(tick, 1000);
  T.tests.alarm = function () {
    var f = [], now = new Date(2026, 4, 10, 7, 0, 0);
    if (msUntil(now, '07:30') !== 1800000) f.push('30 min ahead');
    if (msUntil(now, '06:30') !== 23.5 * 3600000) f.push('tomorrow');
    if (msUntil(now, '07:00') !== 86400000) f.push('same minute = tomorrow');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
