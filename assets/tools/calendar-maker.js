/* Infinity by GroupChatOn — calendar-maker. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Printable calendar: any year or month, week from Monday or Sunday, public holidays (India, US, UK) and your own events; print or save as PDF. */
GCOTools.register('calendar-maker', function (spot, T) {
  var h = T.h;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function key(y, m, d) { return y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + d).slice(-2); }
  function easter(y) {   // Anonymous Gregorian algorithm
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), hh = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - hh - k) % 7, m = Math.floor((a + 11 * hh + 22 * l) / 451), mo = Math.floor((hh + l - 7 * m + 114) / 31), da = (hh + l - 7 * m + 114) % 31 + 1;
    return new Date(y, mo - 1, da);
  }
  function nth(y, m, wd, n) { var d = new Date(y, m, 1); d.setDate(1 + (wd - d.getDay() + 7) % 7 + (n - 1) * 7); return d; }
  function lastWd(y, m, wd) { var d = new Date(y, m + 1, 0); d.setDate(d.getDate() - (d.getDay() - wd + 7) % 7); return d; }
  function shift(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function holidays(y, set) {
    var o = {};
    function put(d, name) { o[key(d.getFullYear(), d.getMonth(), d.getDate())] = name; }
    if (set === 'in') { put(new Date(y, 0, 26), 'Republic Day'); put(new Date(y, 7, 15), 'Independence Day'); put(new Date(y, 9, 2), 'Gandhi Jayanti'); put(new Date(y, 11, 25), 'Christmas'); }
    if (set === 'us') {
      put(new Date(y, 0, 1), 'New Year’s Day'); put(nth(y, 0, 1, 3), 'Martin Luther King Jr. Day'); put(nth(y, 1, 1, 3), 'Presidents’ Day'); put(lastWd(y, 4, 1), 'Memorial Day');
      put(new Date(y, 5, 19), 'Juneteenth'); put(new Date(y, 6, 4), 'Independence Day'); put(nth(y, 8, 1, 1), 'Labor Day'); put(nth(y, 9, 1, 2), 'Columbus Day'); put(new Date(y, 10, 11), 'Veterans Day');
      put(nth(y, 10, 4, 4), 'Thanksgiving'); put(new Date(y, 11, 25), 'Christmas Day');
    }
    if (set === 'uk') {   // England and Wales, with weekend substitute days
      var ny = new Date(y, 0, 1); put(ny.getDay() === 6 ? shift(ny, 2) : ny.getDay() === 0 ? shift(ny, 1) : ny, 'New Year’s Day' + (ny.getDay() % 6 ? '' : ' (substitute)'));
      var e = easter(y); put(shift(e, -2), 'Good Friday'); put(shift(e, 1), 'Easter Monday');
      put(nth(y, 4, 1, 1), 'Early May bank holiday'); put(lastWd(y, 4, 1), 'Spring bank holiday'); put(lastWd(y, 7, 1), 'Summer bank holiday');
      var x = new Date(y, 11, 25), wd = x.getDay();
      if (wd === 6) { put(new Date(y, 11, 27), 'Christmas Day (substitute)'); put(new Date(y, 11, 28), 'Boxing Day (substitute)'); }
      else if (wd === 0) { put(new Date(y, 11, 26), 'Boxing Day'); put(new Date(y, 11, 27), 'Christmas Day (substitute)'); }
      else if (wd === 5) { put(x, 'Christmas Day'); put(new Date(y, 11, 28), 'Boxing Day (substitute)'); }
      else { put(x, 'Christmas Day'); put(new Date(y, 11, 26), 'Boxing Day'); }
    }
    return o;
  }
  function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 864e5 + 1) / 7); }
  // weeks of a month: arrays of 7 day numbers (0 = empty)
  function weeks(y, m, monFirst) {
    var first = new Date(y, m, 1).getDay(), lead = monFirst ? (first + 6) % 7 : first, days = new Date(y, m + 1, 0).getDate(), cells = [], out = [];
    for (var i = 0; i < lead; i++) cells.push(0);
    for (var d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7) cells.push(0);
    for (var w = 0; w < cells.length; w += 7) out.push(cells.slice(w, w + 7));
    return out;
  }
  function events(text, y) {
    var o = {};
    String(text || '').split('\n').forEach(function (l) {
      var m = l.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(.+)$/) || l.trim().match(/^()(\d{1,2})-(\d{1,2})\s+(.+)$/);
      if (!m) return; var k = key(m[1] ? +m[1] : y, +m[2] - 1, +m[3]); o[k] = (o[k] ? o[k] + '; ' : '') + m[4];
    });
    return o;
  }
  function month(y, m, o, big) {
    var mon = o.start === 'mon', heads = mon ? DAY.slice(1).concat(DAY[0]) : DAY, c = o.color, hol = o.hol, ev = o.ev;
    var rows = weeks(y, m, mon).map(function (w) {
      var wk = '';
      if (o.wk) { var dd = w.filter(Boolean)[0]; wk = '<td style="color:#888;font-size:' + (big ? 11 : 8) + 'px;width:1px">' + (dd ? isoWeek(new Date(y, m, mon ? dd : Math.min(dd + 1, new Date(y, m + 1, 0).getDate()))) : '') + '</td>'; }
      return '<tr>' + wk + w.map(function (d, i) {
        if (!d) return '<td></td>';
        var k = key(y, m, d), wd = (i + (mon ? 1 : 0)) % 7, label = hol[k] || ev[k], red = hol[k] || wd === 0;
        return '<td style="' + (big ? 'height:72px;vertical-align:top;text-align:left;padding:4px 6px;border:1px solid #ddd;' : 'text-align:center;padding:2px 0;') + (red ? 'color:' + c + ';font-weight:700;' : '') + (ev[k] && !big ? 'text-decoration:underline;' : '') + '"' + (label ? ' title="' + esc(label) + '"' : '') + '>' + d +
          (big && label ? '<div style="font-size:10px;font-weight:400;color:' + (hol[k] ? c : '#333') + ';line-height:1.2;margin-top:2px">' + esc(label) + '</div>' : '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<table style="width:100%;border-collapse:collapse;table-layout:fixed;font-size:' + (big ? 15 : 11) + 'px"><caption style="font-weight:800;font-size:' + (big ? 26 : 14) + 'px;color:' + c + ';padding:4px 0 6px;text-align:' + (big ? 'left' : 'center') + '">' + MON[m] + (big ? ' ' + y : '') + '</caption>' +
      '<thead><tr>' + (o.wk ? '<th style="width:' + (big ? 26 : 16) + 'px;font-size:' + (big ? 11 : 8) + 'px;color:#888">Wk</th>' : '') + heads.map(function (d) { return '<th style="font-size:' + (big ? 13 : 10) + 'px;color:' + (d === 'Sun' ? c : '#555') + ';padding:2px 0">' + (big ? d : d.slice(0, 2)) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>';
  }
  function build(o) {
    var y = o.year, ms = [], parts = [];
    for (var i = 0; i < (o.view === 'month' ? 1 : 12); i++) ms.push((o.from + i) % 12);
    var yearOf = function (m) { return y + (o.view !== 'month' && m < o.from ? 1 : 0); };
    o.hol = {}; o.ev = {};
    [y, y + 1].forEach(function (yy) { var hh = holidays(yy, o.set), ee = events(o.events, yy); Object.keys(hh).forEach(function (k) { o.hol[k] = hh[k]; }); Object.keys(ee).forEach(function (k) { o.ev[k] = ee[k]; }); });
    if (o.view === 'year') {
      parts.push('<div style="text-align:center;font-size:30px;font-weight:800;color:' + o.color + ';margin-bottom:8px">' + esc(o.title || (o.from ? y + '–' + (y + 1) : String(y))) + '</div><div class="tcal-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px 16px">' +
        ms.map(function (m) { return '<div>' + month(yearOf(m), m, o, false) + '</div>'; }).join('') + '</div>');
      var all = []; ms.forEach(function (m) { var yy = yearOf(m); for (var d = 1; d <= new Date(yy, m + 1, 0).getDate(); d++) { var k = key(yy, m, d); if (o.hol[k] || o.ev[k]) all.push(d + ' ' + MON[m].slice(0, 3) + ': ' + esc([o.hol[k], o.ev[k]].filter(Boolean).join('; '))); } });
      if (all.length) parts.push('<p style="font-size:10.5px;color:#333;margin-top:10px;line-height:1.5">' + all.join(' · ') + '</p>');
      return parts.join('');
    }
    return ms.map(function (m) { return '<div class="tcal-page">' + (o.title ? '<div style="font-size:14px;color:#555">' + esc(o.title) + '</div>' : '') + month(yearOf(m), m, o, true) + '</div>'; }).join('<div style="height:24px"></div>');
  }
  var now = new Date(), saved = T.store.get('calendar-maker', {});
  var year = h('input', { type: 'number', min: '1900', max: '2200', value: String(saved.year || now.getFullYear() + (now.getMonth() >= 10 ? 1 : 0)) });
  var from = T.select(MON.map(function (m, i) { return [String(i), m]; }), String(saved.from || 0));
  var view = T.select([['year', 'Whole year on one page'], ['months', '12 pages, one month each'], ['month', 'One month']], saved.view || 'year');
  var start = T.select([['mon', 'Monday'], ['sun', 'Sunday']], saved.start || (T.currency() === 'USD' ? 'sun' : 'mon'));
  var set = T.select([['none', 'None'], ['in', 'India (national: fixed dates)'], ['us', 'United States (federal)'], ['uk', 'United Kingdom (England and Wales)']], saved.set || ({ INR: 'in', USD: 'us', GBP: 'uk' }[T.currency()] || 'none'));
  var title = h('input', { type: 'text', placeholder: 'e.g. Sunrise Traders 2027 (optional)', value: saved.title || '' });
  var color = h('input', { type: 'color', value: saved.color || '#c2410c' });
  var wk = h('input', { type: 'checkbox', checked: saved.wk ? true : null });
  var ev = h('textarea', { rows: '4', placeholder: 'One per line:\n2027-03-14 Holi\n08-15 Shop anniversary (every year)' }); ev.value = saved.events || '';
  var paper = h('div', { 'class': 'tpaper', 'data-out': '' });
  function opts() { return { year: Math.round(+year.value) || now.getFullYear(), from: +from.value, view: view.value, start: start.value, set: set.value, title: title.value, color: color.value, wk: wk.checked, events: ev.value }; }
  function run() { var o = opts(); T.store.set('calendar-maker', o); paper.innerHTML = build(o); }
  [year, from, view, start, set, title, color, wk, ev].forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
  function print() {
    var o = opts(), land = o.view === 'year';
    var w = window.open('', '_blank'); if (!w) return;
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Calendar ' + o.year + '</title><style>body{font-family:system-ui,"Segoe UI",Arial,sans-serif;margin:0;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4 ' + (land ? 'landscape' : 'portrait') + ';margin:1cm}' +
      '.tcal-grid{grid-template-columns:repeat(4,1fr)!important}.tcal-page{page-break-after:always;break-after:page}.tcal-page:last-child{page-break-after:auto}</style></head><body>' + build(o).replace(/<div style="height:24px"><\/div>/g, '') + '</body></html>');
    w.document.close(); setTimeout(function () { w.print(); }, 400);
  }
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Year', year), T.field('Start from', from), T.field('Layout', view), T.field('Week starts on', start), T.field('Public holidays', set), T.field('Title (optional)', title), T.field('Colour', color)]),
    h('label', { 'class': 'tcheck' }, [wk, ' Show week numbers (ISO)']), T.field('Your events and birthdays (optional)', ev),
    T.row([T.button('Print / Save as PDF', { primary: true, onclick: print }), T.button('Try a sample', { small: true, onclick: function () { ev.value = (opts().year) + '-02-14 Valentine’s Day\n03-21 Shop anniversary\n' + opts().year + '-11-08 Diwali'; run(); } })]),
    h('p', { 'class': 'tnote', text: 'Holidays shown are fixed or rule-based national days. Festivals that follow the moon (Diwali, Eid, Holi…) change every year: add them as events.' }), paper]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  run();

  T.tests['calendar-maker'] = function () {
    var f = [];
    var e = easter(2026); if (e.getMonth() !== 3 || e.getDate() !== 5) f.push('easter 2026 ' + e);
    var e2 = easter(2027); if (e2.getMonth() !== 2 || e2.getDate() !== 28) f.push('easter 2027 ' + e2);
    var us = holidays(2026, 'us'); if (us['2026-11-26'] !== 'Thanksgiving' || us['2026-05-25'] !== 'Memorial Day' || us['2026-01-19'].indexOf('Martin') < 0) f.push('us holidays');
    var uk = holidays(2027, 'uk'); if (uk['2027-12-27'] !== 'Christmas Day (substitute)' || uk['2027-12-28'] !== 'Boxing Day (substitute)') f.push('uk substitutes ' + JSON.stringify(uk));
    var w = weeks(2026, 0, true); if (w[0].join(',') !== '0,0,0,1,2,3,4') f.push('jan 2026 mon-first ' + w[0]);
    if (weeks(2026, 0, false)[0].join(',') !== '0,0,0,0,1,2,3') f.push('jan 2026 sun-first');
    if (weeks(2028, 1, true).reduce(function (a, r) { return a + r.filter(Boolean).length; }, 0) !== 29) f.push('feb 2028 leap');
    if (isoWeek(new Date(2026, 0, 1)) !== 1 || isoWeek(new Date(2027, 0, 1)) !== 53) f.push('iso week');
    var ex = events('2026-03-21 A\n12-25 B', 2026); if (ex['2026-03-21'] !== 'A' || ex['2026-12-25'] !== 'B') f.push('events');
    var html = build({ year: 2026, from: 0, view: 'year', start: 'mon', set: 'in', title: '', color: '#c2410c', wk: false, events: '' });
    if ((html.match(/<caption/g) || []).length !== 12 || html.indexOf('Republic Day') < 0) f.push('year build');
    return Promise.resolve({ ok: !f.length, n: 10, fails: f });
  };
});
