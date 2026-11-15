/* Infinity by GroupChatOn — cron. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Cron expression explainer: a 5-field cron line in plain English, each field broken down, and the next run times. */
GCOTools.register('cron', function (spot, T) {
  var LABEL = ['Minute', 'Hour', 'Day of month', 'Month', 'Day of week'], LO = [0, 0, 1, 1, 0], HI = [59, 23, 31, 12, 7];
  var ONE = ['minute', 'hour', 'day', 'month', 'day of the week'], MANY = ['minutes', 'hours', 'days', 'months', 'days'];
  var MONTH = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var SHORT = { 3: 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split(' '), 4: 'SUN MON TUE WED THU FRI SAT'.split(' ') };
  var MACRO = { '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *' };
  var PART = /^(\*|(\d+)(?:-(\d+))?)(?:\/(\d+))?$/;
  function field(s, i) {
    s = s.toUpperCase().replace(/^\?$/, '*');
    if (SHORT[i]) SHORT[i].forEach(function (n, k) { s = s.replace(new RegExp('\\b' + n + '\\b', 'g'), String(k + (i === 3 ? 1 : 0))); });
    var set = {};
    s.split(',').forEach(function (p) {
      var m = PART.exec(p);
      if (!m) throw new Error('“' + p + '” is not valid in the ' + LABEL[i].toLowerCase() + ' field.');
      var a = m[1] === '*' ? LO[i] : +m[2], b = m[1] === '*' ? HI[i] : m[3] !== undefined ? +m[3] : m[4] ? HI[i] : a, st = m[4] ? +m[4] : 1;
      if (a < LO[i] || b > HI[i] || a > b || st < 1) throw new Error('The ' + LABEL[i].toLowerCase() + ' field takes ' + LO[i] + '–' + HI[i] + ' (you wrote ' + p + ').');
      for (var v = a; v <= b; v += st) set[i === 4 && v === 7 ? 0 : v] = true;
    });
    return { set: set, star: s === '*', raw: s };
  }
  function parse(expr) {
    expr = expr.trim();
    var e = MACRO[expr.toLowerCase()] || expr, p = e.split(/\s+/);
    if (p.length === 6 || p.length === 7) throw new Error('This has ' + p.length + ' fields (with seconds, as in Quartz or Spring). Standard cron uses 5: minute hour day month weekday.');
    if (p.length !== 5) throw new Error('A cron line needs 5 fields: minute hour day-of-month month day-of-week.');
    return p.map(field);
  }
  function name(i, v) { v = +v; return i === 3 ? MONTH[v] : i === 4 ? DAY[v] : i === 1 ? ('0' + v).slice(-2) + ':00' : String(v); }
  function partText(p, i) {
    var m = PART.exec(p);
    if (m[1] === '*') return m[4] ? 'every ' + m[4] + ' ' + MANY[i] : 'every ' + ONE[i];
    if (m[4]) return 'every ' + m[4] + ' ' + MANY[i] + ' from ' + name(i, m[2]) + (m[3] !== undefined ? ' through ' + name(i, m[3]) : '');
    return m[3] !== undefined ? name(i, m[2]) + ' through ' + name(i, m[3]) : name(i, m[2]);
  }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function fieldText(raw, i) { return list(raw.split(',').map(function (p) { return partText(p, i); })); }
  function pad(n) { return ('0' + n).slice(-2); }
  function describe(c) {
    var mR = c[0].raw, hR = c[1].raw, out;
    if (/^\d+$/.test(mR) && /^\d+(,\d+)*$/.test(hR)) out = 'At ' + list(hR.split(',').map(function (x) { return pad(x) + ':' + pad(mR); }));
    else {
      out = mR === '*' ? 'Every minute' : /^\*\/\d+$/.test(mR) ? 'Every ' + mR.slice(2) + ' minutes' : 'At minute ' + fieldText(mR, 0);
      if (hR !== '*') out += ', ' + (/^\*\/\d+$/.test(hR) ? fieldText(hR, 1) : 'during hour ' + list(hR.split(',').map(function (p) {
        var m = PART.exec(p); return m[1] === '*' || m[4] ? partText(p, 1) : m[3] !== undefined ? m[2] + ' through ' + m[3] : m[2];
      })));
      else if (mR !== '*' && !/^\*\//.test(mR)) out += ' of every hour';
    }
    var dR = c[2].raw, wR = c[4].raw, dayDom = /^\*\/\d+$/.test(dR) ? fieldText(dR, 2) + ' of the month' : 'on day ' + fieldText(dR, 2) + ' of the month';
    if (dR !== '*' && wR !== '*') out += ', ' + dayDom + ' or on ' + fieldText(wR, 4);
    else if (dR !== '*') out += ', ' + dayDom;
    else if (wR !== '*') out += ', ' + (/^\*\//.test(wR) ? fieldText(wR, 4) : 'on ' + fieldText(wR, 4));
    if (c[3].raw !== '*') out += ', ' + (/^\*\//.test(c[3].raw) ? fieldText(c[3].raw, 3) : 'in ' + fieldText(c[3].raw, 3));
    return out + '.';
  }
  function dayOk(c, d) {
    var dm = c[2].set[d.getDate()], dw = c[4].set[d.getDay()];
    return !c[2].star && !c[4].star ? dm || dw : dm && dw;   // cron rule: both set → either one is enough
  }
  function next(c, from, n) {
    var d = new Date(from.getTime()), out = [], guard = 0;
    d.setSeconds(0, 0); d.setMinutes(d.getMinutes() + 1);
    while (out.length < n && guard++ < 200000) {
      if (!c[3].set[d.getMonth() + 1]) { d.setMonth(d.getMonth() + 1, 1); d.setHours(0, 0, 0, 0); continue; }
      if (!dayOk(c, d)) { d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); continue; }
      if (!c[1].set[d.getHours()]) { d.setHours(d.getHours() + 1, 0, 0, 0); continue; }
      if (!c[0].set[d.getMinutes()]) { d.setMinutes(d.getMinutes() + 1, 0, 0); continue; }
      out.push(new Date(d.getTime())); d.setMinutes(d.getMinutes() + 1);
    }
    return out;
  }
  var when = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  function run(t) {
    var line = t.split(/\r?\n/).filter(function (l) { return l.trim() && !/^\s*#/.test(l); })[0] || '';
    var bits = line.trim().split(/\s+/), expr = MACRO[bits[0].toLowerCase()] ? bits[0] : bits.slice(0, 5).join(' '), cmd = MACRO[bits[0].toLowerCase()] ? bits.slice(1).join(' ') : bits.slice(5).join(' ');
    var c = parse(expr), runs = next(c, new Date(), 5);
    return [describe(c), cmd ? 'Command: ' + cmd : null, ''].concat(c.map(function (f, i) { return (LABEL[i] + '            ').slice(0, 14) + (f.raw + '        ').slice(0, 10) + fieldText(f.raw, i); }),
      ['', runs.length ? 'Next ' + runs.length + ' runs (your time zone):' : 'This schedule never runs: no date matches it (for example 31 February).'],
      runs.map(function (d) { return '  ' + d.toLocaleString(undefined, when); })).filter(function (x) { return x !== null; }).join('\n');
  }
  var tr = T.transformer(spot, { id: 'cron', inLabel: 'Cron expression (a whole crontab line works too)', placeholder: 'e.g. */15 9-17 * * 1-5', sample: '30 9 * * 1-5 /usr/bin/backup.sh', mono: true, rows: 3, outLabel: 'What it means', download: false, run: run });
  var common = [['Every 5 minutes', '*/5 * * * *'], ['Every hour', '0 * * * *'], ['Daily at midnight', '0 0 * * *'], ['Weekdays 9:00', '0 9 * * 1-5'], ['Every Sunday 3:30', '30 3 * * 0'], ['1st of month', '0 0 1 * *']];
  spot.lastChild.insertBefore(T.row(common.map(function (x) { return T.button(x[0], { small: true, onclick: function () { tr.input.value = x[1]; tr.update(); } }); })), spot.lastChild.children[1]);
  T.tests['cron'] = function () {
    var f = [];
    if (describe(parse('*/15 * * * *')) !== 'Every 15 minutes.') f.push('*/15 → ' + describe(parse('*/15 * * * *')));
    if (describe(parse('30 9 * * 1-5')) !== 'At 09:30, on Monday through Friday.') f.push('weekdays → ' + describe(parse('30 9 * * 1-5')));
    if (describe(parse('0 0 1 jan *')) !== 'At 00:00, on day 1 of the month, in January.') f.push('yearly → ' + describe(parse('0 0 1 jan *')));
    var r = next(parse('30 9 * * MON-FRI'), new Date(2026, 0, 1, 0, 0), 3).map(function (d) { return d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes(); }).join(',');
    if (r !== '1 9:30,2 9:30,5 9:30') f.push('next runs ' + r);
    if (next(parse('0 0 31 2 *'), new Date(2026, 0, 1), 1).length) f.push('31 Feb should never run');
    var b = next(parse('0 12 13 * 5'), new Date(2026, 0, 1), 3).map(function (d) { return d.getMonth() + 1 + '/' + d.getDate(); }).join(',');
    if (b !== '1/2,1/9,1/13') f.push('day OR weekday ' + b);
    try { parse('61 * * * *'); f.push('61 accepted'); } catch (e) {}
    if (run('@daily').indexOf('At 00:00.') !== 0) f.push('@daily');
    return Promise.resolve({ ok: !f.length, n: 8, fails: f });
  };
});
