/* Infinity by GroupChatOn — battery. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Battery status: charge level, charging or not, and time to full or empty, where the browser shares it (Chrome, Edge, Opera, Samsung Internet). */
GCOTools.register('battery', function (spot, T) {
  var h = T.h, status = T.status(), bat = null;
  function fmtTime(s) {
    if (s == null || !isFinite(s) || s <= 0) return 'Not known yet';
    var m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
  }
  function tip(level, charging) {
    if (charging && level >= 0.8) return 'Many phones last longer if you unplug at around 80–90% rather than keeping them at 100% for hours.';
    if (!charging && level <= 0.2) return 'Low battery: turn on battery saver, dim the screen and close apps you are not using.';
    return 'Keeping your battery between about 20% and 80% is gentlest on it over the years.';
  }
  var gauge = h('div', { style: 'position:relative;width:min(260px,70vw);height:110px;margin:6px auto;border:6px solid var(--ink);border-radius:18px;padding:6px;box-sizing:border-box' }, [h('span', { style: 'display:block;height:100%;width:0;border-radius:8px;background:#16a34a;transition:width .4s' }), h('i', { style: 'position:absolute;right:-18px;top:30px;width:12px;height:38px;border-radius:0 6px 6px 0;background:var(--ink)' })]);
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 48px/1.1 var(--ui)', text: '–' }), box = h('div', { 'class': 'tkv' }), note = h('p', { 'class': 'tnote' });
  function draw() {
    if (!bat) return;
    var lv = bat.level, pct = Math.round(lv * 100);
    gauge.firstChild.style.width = pct + '%'; gauge.firstChild.style.background = lv <= 0.2 ? '#dc2626' : lv <= 0.4 ? '#f59e0b' : '#16a34a';
    big.textContent = pct + '%' + (bat.charging ? ' ⚡' : '');
    box.innerHTML = '';
    [['Status', bat.charging ? (pct >= 100 ? 'Full, plugged in' : 'Charging') : 'On battery'], [bat.charging ? 'Time to full' : 'Time left', fmtTime(bat.charging ? bat.chargingTime : bat.dischargingTime)], ['Checked', new Date().toLocaleTimeString()]]
      .forEach(function (r) { box.appendChild(h('div', {}, [h('b', { text: r[0] }), h('code', { text: r[1] }), h('span')])); });
    note.textContent = tip(lv, bat.charging);
  }
  function check() {
    if (!navigator.getBattery) { status.error('This browser does not share battery information (Safari and Firefox keep it private). Try Chrome, Edge or Samsung Internet, or check your phone’s settings.'); return; }
    navigator.getBattery().then(function (b) {
      if (!bat) ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'].forEach(function (e) { b.addEventListener(e, draw); });
      bat = b; draw(); status.ok('Live: this updates by itself while the page is open.');
    }, function () { status.error('The battery could not be read on this device.'); });
  }
  spot.appendChild(T.card([gauge, big, T.row([T.button('Check battery', { primary: true, onclick: check })]), status.el, box, note,
    h('p', { 'class': 'tnote', text: 'Desktop computers without a battery show 100% and plugged in. Time estimates appear after a few minutes of use.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['battery'] = function () {
    var f = [];
    if (fmtTime(Infinity) !== 'Not known yet' || fmtTime(0) !== 'Not known yet' || fmtTime(null) !== 'Not known yet') f.push('unknown');
    if (fmtTime(3600) !== '1 h 0 min' || fmtTime(1500) !== '25 min' || fmtTime(5430) !== '1 h 31 min') f.push('times ' + fmtTime(5430));
    if (!/80/.test(tip(0.9, true)) || !/Low/.test(tip(0.1, false))) f.push('tips');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
