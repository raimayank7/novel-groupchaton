/* Infinity by GroupChatOn — health-log. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* BP, sugar and weight log with charts and plain-language ranges. */
GCOTools.register('health-log', function (spot, T) {
  var h = T.h, V = T.vault('health', { r: [], height: 0 }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  function now() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function bp(s, d) {
    if (s > 180 || d > 120) return ['Very high: get medical help now', 'tout-c'];
    if (s < 90 || d < 60) return ['Low', 'tout-c'];
    if (s >= 140 || d >= 90) return ['High (stage 2)', 'tout-c'];
    if (s >= 130 || d >= 80) return ['High (stage 1)', 'tout-c'];
    if (s >= 120) return ['Elevated', ''];
    return ['Normal', 'tin-c'];
  }
  function sugar(v, when) {
    if (v < 70) return ['Low', 'tout-c'];
    if (when === 'fast') return v < 100 ? ['Normal (fasting)', 'tin-c'] : v < 126 ? ['Prediabetes range', ''] : ['Diabetes range', 'tout-c'];
    return v < 140 ? ['Normal', 'tin-c'] : v < 200 ? ['Prediabetes range', ''] : ['Diabetes range', 'tout-c'];
  }
  function label(x) { return x.k === 'bp' ? bp(x.a, x.b) : x.k === 'sugar' ? sugar(x.a, x.w) : bmi(x.a); }
  function bmi(w) { if (!(db.height > 0)) return ['', '']; var b = w / Math.pow(db.height / 100, 2); return ['BMI ' + b.toFixed(1) + (b < 18.5 ? ' · underweight' : b < 25 ? ' · healthy' : b < 30 ? ' · overweight' : ' · obese'), b >= 18.5 && b < 25 ? 'tin-c' : '']; }
  function text(x) { return x.k === 'bp' ? x.a + '/' + x.b + ' mmHg' + (x.p ? ' · pulse ' + x.p : '') : x.k === 'sugar' ? x.a + ' mg/dL · ' + ({ fast: 'fasting', pp: 'after meal', rand: 'random' })[x.w] : x.a + ' kg'; }
  var kind = 'bp', seg = T.seg([['bp', '❤️ BP'], ['sugar', '🩸 Sugar'], ['weight', '⚖️ Weight']], 'bp', function (v) { kind = v; shape(); draw(); });
  var a = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal' }), b = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: 'e.g. 80' }), p = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'numeric', placeholder: 'optional' });
  var w = T.select([['fast', 'Fasting'], ['pp', 'After meal (2 hours)'], ['rand', 'Random']], 'fast'), d = h('input', { type: 'date', value: iso() }), t = h('input', { type: 'time', value: now() }), note = h('input', { type: 'text', placeholder: 'e.g. after walk, missed medicine' });
  var fa = T.field('', a), fb = T.field('Lower (diastolic)', b), fp = T.field('Pulse', p), fw = T.field('When', w), msg = T.status();
  function shape() { fa.firstChild.textContent = kind === 'bp' ? 'Upper (systolic)' : kind === 'sugar' ? 'Sugar (mg/dL)' : 'Weight (kg)'; a.placeholder = kind === 'bp' ? 'e.g. 120' : kind === 'sugar' ? 'e.g. 95' : 'e.g. 68.5'; fb.hidden = fp.hidden = kind !== 'bp'; fw.hidden = kind !== 'sugar'; }
  function add() {
    var x = { id: uid(), k: kind, d: d.value || iso(), t: t.value || '', a: parseFloat(a.value), n: note.value.trim() };
    if (!(x.a > 0)) { msg.error('Type the reading.'); a.focus(); return; }
    if (kind === 'bp') { x.b = parseFloat(b.value); x.p = parseFloat(p.value) || 0; if (!(x.b > 0)) { msg.error('Type the lower number too.'); b.focus(); return; } }
    if (kind === 'sugar') x.w = w.value;
    db.r.push(x); save(); msg.ok('Saved: ' + text(x) + (label(x)[0] ? ' · ' + label(x)[0] : ''));
    a.value = ''; b.value = ''; p.value = ''; note.value = ''; draw();
  }
  [a, b, p].forEach(function (x) { x.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); }); });
  var chart = h('div', { 'data-out': '' }), list = h('div', { 'class': 'tlist' }), ht = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'e.g. 165' });
  ht.addEventListener('change', function () { db.height = parseFloat(ht.value) || 0; save(); draw(); });
  function rows(k) { return db.r.filter(function (x) { return x.k === k; }).sort(function (x, y) { return (x.d + x.t) < (y.d + y.t) ? -1 : 1; }); }
  function svg(k) {
    var rs = rows(k).slice(-30), W = 600, H = 220, L = 40, B = 24;
    if (rs.length < 2) return h('p', { 'class': 'tnote', text: rs.length ? 'Add one more reading to see the chart.' : 'No readings yet. Your chart appears here.' });
    var vals = []; rs.forEach(function (x) { vals.push(x.a); if (k === 'bp') vals.push(x.b); });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pad = (hi - lo) * 0.15 || 5; lo = Math.max(0, lo - pad); hi += pad;
    var X = function (i) { return L + i * (W - L - 10) / (rs.length - 1); }, Y = function (v) { return 10 + (hi - v) / (hi - lo) * (H - B - 10); };
    var NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'Chart of the last ' + rs.length + ' readings'); s.style.cssText = 'width:100%;height:auto;display:block';
    function el(tag, at, txt) { var e = document.createElementNS(NS, tag); Object.keys(at).forEach(function (k2) { e.setAttribute(k2, at[k2]); }); if (txt) e.textContent = txt; s.appendChild(e); return e; }
    [hi, (hi + lo) / 2, lo].forEach(function (v) { el('line', { x1: L, x2: W - 10, y1: Y(v), y2: Y(v), stroke: 'currentColor', 'stroke-opacity': '.15' }); el('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': '11', fill: 'currentColor', 'fill-opacity': '.6' }, String(Math.round(v))); });
    var lines = k === 'bp' ? [['a', '#dc2626'], ['b', '#2563eb']] : [['a', k === 'sugar' ? '#d97706' : '#16a34a']];
    lines.forEach(function (ln) {
      el('polyline', { points: rs.map(function (x, i) { return X(i).toFixed(1) + ',' + Y(x[ln[0]]).toFixed(1); }).join(' '), fill: 'none', stroke: ln[1], 'stroke-width': '2.5', 'stroke-linejoin': 'round' });
      rs.forEach(function (x, i) { el('circle', { cx: X(i), cy: Y(x[ln[0]]), r: '3.5', fill: ln[1] }); });
    });
    el('text', { x: L, y: H - 6, 'font-size': '11', fill: 'currentColor', 'fill-opacity': '.6' }, rs[0].d); el('text', { x: W - 10, y: H - 6, 'text-anchor': 'end', 'font-size': '11', fill: 'currentColor', 'fill-opacity': '.6' }, rs[rs.length - 1].d);
    return s;
  }
  function avg(k, days) {
    var from = iso(new Date(Date.now() - days * 864e5)), rs = rows(k).filter(function (x) { return x.d >= from; });
    if (!rs.length) return null;
    return { n: rs.length, a: rs.reduce(function (s, x) { return s + x.a; }, 0) / rs.length, b: rs.reduce(function (s, x) { return s + (x.b || 0); }, 0) / rs.length };
  }
  function draw() {
    db = V.data(); chart.innerHTML = ''; list.innerHTML = '';
    var m = avg(kind, 30);
    chart.appendChild(h('div', { 'class': 'tsum' }, [h('div', {}, [h('span', { text: 'Readings' }), h('b', { text: T.num(rows(kind).length) })]),
      h('div', {}, [h('span', { text: '30-day average' }), h('b', { text: !m ? '—' : kind === 'bp' ? Math.round(m.a) + '/' + Math.round(m.b) : (Math.round(m.a * 10) / 10) + (kind === 'sugar' ? ' mg/dL' : ' kg') })])]));
    chart.appendChild(svg(kind));
    rows(kind).reverse().slice(0, 40).forEach(function (x) {
      var l = label(x);
      list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-main' }, [h('b', { text: text(x) }), h('small', { text: x.d + (x.t ? ' ' + x.t : '') + (x.n ? ' · ' + x.n : '') })]),
        h('span', { 'class': 'titem-amt ' + l[1], style: 'white-space:normal;text-align:right;font-size:13px', text: l[0] }),
        h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this reading?')) { db.r = db.r.filter(function (y) { return y !== x; }); save(); draw(); } } })]));
    });
  }
  function csv() {
    var q = function (s) { s = String(s == null ? '' : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    T.download(new Blob(['﻿Date,Time,Type,Reading,Meaning,Note\n' + db.r.slice().sort(function (x, y) { return (x.d + x.t) < (y.d + y.t) ? -1 : 1; }).map(function (x) { return [x.d, x.t, x.k, text(x), label(x)[0], x.n].map(q).join(','); }).join('\n')], { type: 'text/csv' }), 'health-log-' + iso() + '.csv');
  }
  spot.appendChild(T.card([V.bar(draw), seg, h('div', { 'class': 'tool-app-opts' }, [h('div', { 'class': 'tgrid2' }, [fa, fb, fp, fw, T.field('Date', d), T.field('Time', t), T.field('Note (optional)', note)]), T.row([T.button('Save reading', { primary: true, onclick: add })]), msg.el]),
    chart, h('h3', { text: 'Readings' }), list, T.row([T.button('Download for your doctor (CSV)', { small: true, onclick: csv })]),
    h('details', { 'class': 'tcalc-details' }, [h('summary', { text: '⚙️ Height (for BMI)' }), T.field('Height (cm)', ht)]),
    h('p', { 'class': 'tnote', text: 'Ranges follow common adult guidelines (BP: under 120/80 normal; fasting sugar: under 100 normal). They are a guide, not a diagnosis: your doctor may set different targets for you.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  shape(); V.ready.then(function () { ht.value = V.data().height || ''; draw(); });

  T.tests['health-log'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    [[118, 76, 'Normal'], [125, 78, 'Elevated'], [134, 82, 'High (stage 1)'], [150, 95, 'High (stage 2)'], [190, 100, 'Very high: get medical help now']].forEach(function (c) { if (bp(c[0], c[1])[0] !== c[2]) fails.push('bp ' + c[0] + '/' + c[1] + ' → ' + bp(c[0], c[1])[0]); });
    if (sugar(110, 'fast')[0] !== 'Prediabetes range' || sugar(130, 'fast')[0] !== 'Diabetes range' || sugar(130, 'pp')[0] !== 'Normal' || sugar(60, 'pp')[0] !== 'Low') fails.push('sugar ranges');
    V.save({ r: [], height: 170 }); db = V.data();
    kind = 'bp'; a.value = '120'; b.value = '80'; d.value = '2026-10-01'; add(); a.value = '130'; b.value = '85'; d.value = '2026-10-02'; add();
    kind = 'weight'; a.value = '72.25'; add(); draw();
    if (bmi(72.25)[0].indexOf('25.0') < 0) fails.push('bmi ' + bmi(72.25)[0]);
    kind = 'bp'; draw();
    if (chart.querySelectorAll('polyline').length !== 2) fails.push('bp chart lines ' + chart.querySelectorAll('polyline').length);
    d.value = iso();
    return V.save(keep).then(function () { db = V.data(); draw(); return { ok: !fails.length, n: 8, fails: fails }; });
  }
});
