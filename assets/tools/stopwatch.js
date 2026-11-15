/* Infinity by GroupChatOn — stopwatch. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Stopwatch with laps, and a countdown timer that rings. Time is read from the clock (not counted in ticks), so it stays right even if the tab sleeps. */
GCOTools.register('stopwatch', function (spot, T) {
  var h = T.h, status = T.status();
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ms, cs) {
    ms = Math.max(0, Math.floor(ms));
    var hh = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, c = Math.floor(ms / 10) % 100;
    return (hh ? hh + ':' + p2(m) : p2(m)) + ':' + p2(s) + (cs === false ? '' : '.' + p2(c));
  }
  function lapStats(laps) {   // index of the fastest and slowest lap (needs 2+ laps)
    if (laps.length < 2) return { fast: -1, slow: -1 };
    var f = 0, s = 0;
    laps.forEach(function (v, i) { if (v < laps[f]) f = i; if (v > laps[s]) s = i; });
    return { fast: f, slow: s };
  }
  var ac = null;
  function beep(n) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume();
      for (var i = 0; i < n; i++) {
        var t = ac.currentTime + 0.05 + i * 0.4, o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = 880; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.32);
      }
    } catch (e) {}
  }
  var big = h('div', { 'data-out': '', style: 'font:800 clamp(44px,14vw,84px)/1.1 var(--ui);text-align:center;font-variant-numeric:tabular-nums;padding:6px 0', text: '00:00.00' });
  var sw = { run: false, base: 0, t0: 0, laps: [] }, tm = { run: false, total: 0, left: 0, end: 0 };
  function swNow() { return sw.base + (sw.run ? performance.now() - sw.t0 : 0); }
  function tmLeft() { return tm.run ? Math.max(0, tm.end - Date.now()) : tm.left; }
  // stopwatch
  var swGo = T.button('Start', { primary: true, onclick: function () {
    if (sw.run) { sw.base = swNow(); sw.run = false; } else { sw.t0 = performance.now(); sw.run = true; }
    draw();
  } });
  var swLap = T.button('Lap', { onclick: function () {
    var now = swNow(), prev = sw.laps.reduce(function (a, b) { return a + b; }, 0);
    if (now - prev > 0) sw.laps.push(now - prev); draw();
  } });
  var swReset = T.button('Reset', { onclick: function () { sw = { run: false, base: 0, t0: 0, laps: [] }; draw(); } });
  var lapBox = h('div', { style: 'max-height:260px;overflow:auto' });
  // timer
  var th = h('input', { type: 'number', min: '0', max: '99', value: '0', inputmode: 'numeric' }), tmi = h('input', { type: 'number', min: '0', max: '59', value: '5', inputmode: 'numeric' }), ts = h('input', { type: 'number', min: '0', max: '59', value: '0', inputmode: 'numeric' });
  function setTimer(ms) { tm = { run: false, total: ms, left: ms, end: 0 }; th.value = Math.floor(ms / 3600000); tmi.value = Math.floor(ms / 60000) % 60; ts.value = Math.floor(ms / 1000) % 60; status.clear(); draw(); }
  function fromInputs() { return ((+th.value || 0) * 3600 + (+tmi.value || 0) * 60 + (+ts.value || 0)) * 1000; }
  [th, tmi, ts].forEach(function (x) { x.addEventListener('input', function () { if (!tm.run) { tm.total = tm.left = fromInputs(); draw(); } }); });
  var tmGo = T.button('Start', { primary: true, onclick: function () {
    if (tm.run) { tm.left = tmLeft(); tm.run = false; }
    else {
      if (!tm.left) tm.total = tm.left = fromInputs();
      if (!tm.left) return status.error('Set a time first, for example 5 minutes.');
      tm.end = Date.now() + tm.left; tm.run = true; status.clear(); document.title = document.title.replace(/^⏰ /, '');
      beep(0);   // a tap unlocks sound on phones, so the alarm can ring later
    }
    draw();
  } });
  var tmReset = T.button('Reset', { onclick: function () { setTimer(fromInputs()); } });
  var presets = T.row([1, 3, 5, 10, 15, 30, 60].map(function (m) { return T.button(m < 60 ? m + ' min' : '1 hour', { small: true, onclick: function () { setTimer(m * 60000); } }); }));
  var swBox = h('div', { style: 'display:grid;gap:12px' }, [T.row([swGo, swLap, swReset]), lapBox]);
  var tmBox = h('div', { style: 'display:grid;gap:12px', hidden: true }, [h('div', { 'class': 'tgrid2' }, [T.field('Hours', th), T.field('Minutes', tmi), T.field('Seconds', ts)]), presets, T.row([tmGo, tmReset])]);
  var mode = T.seg([['sw', '⏱ Stopwatch'], ['tm', '⏳ Timer']], 'sw', function (m) { swBox.hidden = m !== 'sw'; tmBox.hidden = m !== 'tm'; draw(); });
  function draw() {
    var m = mode.value();
    if (m === 'sw') {
      big.textContent = fmt(swNow());
      swGo.textContent = sw.run ? 'Pause' : sw.base ? 'Resume' : 'Start'; swLap.disabled = !sw.run;
      lapBox.innerHTML = '';
      if (sw.laps.length) {
        var st = lapStats(sw.laps), tot = 0, rows = sw.laps.map(function (v, i) { tot += v; return [i, v, tot]; }).reverse();
        lapBox.appendChild(h('table', {}, [h('thead', {}, [h('tr', {}, [h('th', { text: 'Lap' }), h('th', { text: 'Lap time' }), h('th', { text: 'Total' })])]),
          h('tbody', {}, rows.map(function (r) { return h('tr', { style: r[0] === st.fast ? 'color:#16a34a;font-weight:600' : r[0] === st.slow ? 'color:#dc2626' : '' }, [h('td', { text: 'Lap ' + (r[0] + 1) + (r[0] === st.fast ? ' (fastest)' : r[0] === st.slow ? ' (slowest)' : '') }), h('td', { text: fmt(r[1]) }), h('td', { text: fmt(r[2]) })]); }))]));
      }
    } else {
      var left = tmLeft();
      big.textContent = fmt(Math.ceil(left / 1000) * 1000, false);
      tmGo.textContent = tm.run ? 'Pause' : tm.left && tm.left < tm.total ? 'Resume' : 'Start';
      if (tm.run && left <= 0) {
        tm.run = false; tm.left = 0; beep(6); status.ok('⏰ Time is up!');
        if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
        if (!/^⏰/.test(document.title)) document.title = '⏰ ' + document.title;
        tmGo.textContent = 'Start';
      }
    }
  }
  setInterval(function () { if (sw.run || tm.run) draw(); }, 41);
  spot.appendChild(T.card([mode, big, swBox, tmBox, status.el,
    T.row([T.button('Try a sample', { small: true, onclick: function () { mode.querySelectorAll('button')[1].click(); setTimer(5000); tmGo.click(); } })]),
    h('p', { 'class': 'tnote', text: 'Keep this tab open. The time stays exact even if you switch apps, and the timer beeps and vibrates (on phones) when it ends.' })]));
  setTimer(300000);
  T.tests.stopwatch = function () {
    var f = [];
    if (fmt(3723456) !== '1:02:03.45') f.push('fmt 1h ' + fmt(3723456));
    if (fmt(61000, false) !== '01:01') f.push('fmt 61s');
    if (fmt(-5) !== '00:00.00') f.push('negative');
    var s = lapStats([3000, 2500, 4000]); if (s.fast !== 1 || s.slow !== 2) f.push('lap stats');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
