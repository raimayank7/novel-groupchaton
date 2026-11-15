/* Infinity by GroupChatOn — water-reminder. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Water reminder: a daily water goal from your weight, activity and climate, a one-tap glass log, and reminders while the page is open. */
GCOTools.register('water-reminder', function (spot, T) {
  var h = T.h, status = T.status(), timer = 0, ctx = null;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  // about 35 ml per kg, plus about 350 ml per 30 minutes of exercise, 500 ml in hot weather, and extra when pregnant or breastfeeding
  function goal(kg, exMin, hot, extra) {
    var ml = kg * 35 + exMin / 30 * 350 + (hot ? 500 : 0) + (extra === 'preg' ? 300 : extra === 'feed' ? 700 : 0);
    return Math.round(Math.max(1200, Math.min(6000, ml)) / 50) * 50;
  }
  // reminder times between the start and end of the day, every `every` minutes
  function times(start, end, every) {
    var a = start.split(':'), b = end.split(':'), s = +a[0] * 60 + +a[1], e = +b[0] * 60 + +b[1], out = [];
    for (var t = s; t <= e; t += every) out.push(pad(Math.floor(t / 60)) + ':' + pad(t % 60));
    return out;
  }
  var st = T.store.get('water', { kg: 65, unit: 'kg', ex: 0, hot: false, extra: '', cup: 250, log: {} });
  var kg = h('input', { type: 'number', min: '20', max: '300', value: String(st.unit === 'lb' ? Math.round(st.kg / 0.4536) : st.kg), 'aria-label': 'Weight' });
  var unit = T.select([['kg', 'kg'], ['lb', 'lb']], st.unit), ex = T.select([[0, 'None'], [30, '30 min'], [60, '1 hour'], [90, '1½ hours'], [120, '2 hours or more']], st.ex);
  var hot = h('input', { type: 'checkbox', checked: st.hot ? true : null }), extra = T.select([['', 'None'], ['preg', 'Pregnant'], ['feed', 'Breastfeeding']], st.extra);
  var cup = T.select([[150, 'Small glass 150 ml'], [200, 'Glass 200 ml'], [250, 'Cup 250 ml'], [330, 'Can / bottle 330 ml'], [500, 'Bottle 500 ml'], [1000, 'Bottle 1 litre']], st.cup);
  var ring = h('canvas', { width: '400', height: '400', 'aria-label': 'Today’s water', style: 'width:min(200px,60vw);aspect-ratio:1;display:block;margin:0 auto' });
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 26px/1.3 var(--ui)' }), hist = h('div', { style: 'display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;align-items:end;height:110px' });
  var every = T.select([[30, 'Every 30 minutes'], [45, 'Every 45 minutes'], [60, 'Every hour'], [90, 'Every 1½ hours'], [120, 'Every 2 hours']], 60);
  var from = h('input', { type: 'time', value: '08:00', 'aria-label': 'From' }), to = h('input', { type: 'time', value: '21:00', 'aria-label': 'Until' });
  function kgNow() { var v = +kg.value || 65; return unit.value === 'lb' ? v * 0.4536 : v; }
  function save() { st.kg = Math.round(kgNow() * 10) / 10; st.unit = unit.value; st.ex = +ex.value; st.hot = hot.checked; st.extra = extra.value; st.cup = +cup.value; T.store.set('water', st); }
  function draw() {
    var g = goal(kgNow(), +ex.value, hot.checked, extra.value), drunk = st.log[today()] || 0, p = Math.min(1, drunk / g), c = ring.getContext('2d');
    c.clearRect(0, 0, 400, 400); c.lineWidth = 34; c.lineCap = 'round';
    c.strokeStyle = 'rgba(56,189,248,.18)'; c.beginPath(); c.arc(200, 200, 160, 0, Math.PI * 2); c.stroke();
    if (p > 0) { c.strokeStyle = p >= 1 ? '#16a34a' : '#0ea5e9'; c.beginPath(); c.arc(200, 200, 160, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke(); }
    c.fillStyle = '#0ea5e9'; c.font = 'bold 64px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(Math.round(p * 100) + '%', 200, 200);
    big.textContent = (drunk / 1000).toFixed(2).replace(/0$/, '') + ' L of ' + (g / 1000).toFixed(2).replace(/0$/, '') + ' L' + (p >= 1 ? ' ✓ Goal reached!' : ' · ' + Math.ceil((g - drunk) / (+cup.value)) + ' more ' + (+cup.value >= 330 ? 'bottles' : 'glasses'));
    hist.innerHTML = '';
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i); var k = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), v = st.log[k] || 0;
      hist.appendChild(h('div', { style: 'display:grid;gap:4px;justify-items:center;font-size:11px;color:var(--muted)', title: k + ': ' + v + ' ml' }, [
        h('span', { text: (v / 1000).toFixed(1) }),
        h('span', { style: 'width:70%;border-radius:6px 6px 2px 2px;background:' + (v >= g ? '#16a34a' : '#38bdf8') + ';height:' + Math.max(2, Math.min(60, v / g * 60)) + 'px' }),
        h('span', { text: d.toLocaleDateString(undefined, { weekday: 'narrow' }) })]));
    }
  }
  function add(ml) { var k = today(); st.log[k] = Math.max(0, (st.log[k] || 0) + ml); var keys = Object.keys(st.log).sort(); while (keys.length > 60) delete st.log[keys.shift()]; save(); draw(); }
  function remind() {
    var drunk = st.log[today()] || 0, g = goal(kgNow(), +ex.value, hot.checked, extra.value);
    if (drunk >= g) return;
    var msg = 'Time for a glass of water 💧 (' + Math.round(drunk / g * 100) + '% of today’s goal)';
    if (window.Notification && Notification.permission === 'granted') { try { new Notification('Water reminder', { body: msg, tag: 'gco-water' }); } catch (e) {} }
    try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); var o = ctx.createOscillator(), gn = ctx.createGain(); o.frequency.value = 660; o.connect(gn); gn.connect(ctx.destination); gn.gain.setValueAtTime(0.0001, ctx.currentTime); gn.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6); o.start(); o.stop(ctx.currentTime + 0.7); } catch (e) {}
    status.info('🔔 ' + msg + ' — ' + new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
  }
  function startRem() {
    if (timer) { clearInterval(timer); timer = 0; remBtn.textContent = 'Start reminders'; status.info('Reminders stopped.'); return; }
    var list = times(from.value || '08:00', to.value || '21:00', +every.value), fired = {};
    if (!list.length) { status.error('Set an end time later than the start time.'); return; }
    function arm() { timer = setInterval(function () { var n = new Date(), k = pad(n.getHours()) + ':' + pad(n.getMinutes()); if (list.indexOf(k) >= 0 && !fired[today() + k]) { fired[today() + k] = 1; remind(); } }, 15000); remBtn.textContent = 'Stop reminders'; status.ok('Reminders on: ' + list.length + ' a day, ' + list[0] + '–' + list[list.length - 1] + '. Keep this page open.'); }
    if (window.Notification && Notification.permission === 'default') Notification.requestPermission().then(arm, arm);
    else arm();
  }
  var remBtn = T.button('Start reminders', { onclick: startRem });
  [kg, unit, ex, hot, extra, cup].forEach(function (x) { x.addEventListener('change', function () { save(); draw(); }); x.addEventListener('input', function () { save(); draw(); }); });
  window.addEventListener('pagehide', function () { clearInterval(timer); if (ctx) ctx.close(); });
  spot.appendChild(T.card([ring, big,
    T.row([T.button('+ Drink', { primary: true, onclick: function () { add(+cup.value); } }), T.field('Size', cup), T.button('Undo', { small: true, onclick: function () { add(-(+cup.value)); } })]),
    h('b', { text: 'Last 7 days (litres)' }), hist,
    h('details', { open: true }, [h('summary', { text: 'Your daily goal' }), h('div', { 'class': 'tgrid2' }, [T.field('Weight', kg), T.field('Unit', unit), T.field('Exercise today', ex), T.field('Extra need', extra)]), h('label', { 'class': 'tcheck' }, [hot, ' Hot weather or I sweat a lot'])]),
    h('details', {}, [h('summary', { text: 'Reminders' }), h('div', { 'class': 'tgrid2' }, [T.field('How often', every), T.field('From', from), T.field('Until', to)]), T.row([remBtn]),
      h('p', { 'class': 'tnote', text: 'Reminders work while this page stays open (a tab in the background is fine on computers). Phones may pause web pages when locked; for all-day phone reminders, add the times shown to your phone’s alarm or calendar.' })]),
    status.el,
    h('p', { 'class': 'tnote', text: 'The goal is a general guide for healthy adults: food and other drinks count too. People with kidney, heart or liver conditions may need to drink less, so follow their doctor’s advice.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['water-reminder'] = function () {
    var f = [];
    if (goal(70, 0, false, '') !== 2450) f.push('base ' + goal(70, 0, false, ''));
    if (goal(70, 30, true, '') !== 3300) f.push('exercise + heat ' + goal(70, 30, true, ''));
    if (goal(60, 0, false, 'feed') !== 2800) f.push('breastfeeding');
    if (goal(20, 0, false, '') !== 1200) f.push('minimum');
    var t = times('08:00', '22:00', 120);
    if (t.length !== 8 || t[0] !== '08:00' || t[7] !== '22:00') f.push('times ' + t.join(' '));
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
