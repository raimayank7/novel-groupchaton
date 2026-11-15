/* Infinity by GroupChatOn — vehicle-log. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Vehicle fuel, mileage and service log: real km per litre between full tanks, running cost and service due. */
GCOTools.register('vehicle-log', function (spot, T) {
  var h = T.h, V = T.vault('vehicle', { vehicles: [], fuel: [], svc: [] }), db = V.data();
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var sel = null, body = h('div', { 'class': 'tool-app-opts' });
  function veh(id) { return db.vehicles.filter(function (v) { return v.id === id; })[0]; }
  function mileage(vid) {
    var fs = db.fuel.filter(function (x) { return x.v === vid; }).sort(function (a, b) { return a.odo - b.odo; }), seg = [], last = null, lit = 0, cost = 0;
    fs.forEach(function (x) {
      if (last !== null) { lit += x.l; cost += x.cost || 0; }
      if (x.full) { if (last !== null && lit > 0) seg.push({ d: x.d, km: x.odo - last, l: lit, kmpl: (x.odo - last) / lit, cost: cost }); last = x.odo; lit = 0; cost = 0; }
    });
    var km = seg.reduce(function (s, x) { return s + x.km; }, 0), l = seg.reduce(function (s, x) { return s + x.l; }, 0), c = seg.reduce(function (s, x) { return s + x.cost; }, 0);
    return { seg: seg, avg: l ? km / l : 0, perKm: km ? c / km : 0, last: seg.length ? seg[seg.length - 1].kmpl : 0 };
  }
  function odo(vid) { var m = 0; db.fuel.concat(db.svc).forEach(function (x) { if (x.v === vid && x.odo > m) m = x.odo; }); return m; }
  function due(vid, today) {
    var s = db.svc.filter(function (x) { return x.v === vid; }).sort(function (a, b) { return a.odo - b.odo; }).pop(); if (!s) return null;
    var o = odo(vid), r = { s: s, km: s.nextKm ? s.odo + s.nextKm - o : null, days: s.nextD ? Math.round((new Date(s.nextD + 'T00:00:00') - new Date((today || iso()) + 'T00:00:00')) / 864e5) : null };
    r.over = (r.km !== null && r.km <= 0) || (r.days !== null && r.days <= 0);
    return r;
  }
  function draw() {
    db = V.data(); body.innerHTML = '';
    if (!veh(sel) && db.vehicles.length) sel = db.vehicles[0].id;
    var v = veh(sel);
    if (v) {
      var vs = T.select(db.vehicles.map(function (x) { return [x.id, x.name]; }), v.id); vs.addEventListener('change', function () { sel = vs.value; draw(); });
      body.appendChild(T.field('Vehicle', vs));
      var m = mileage(v.id), dd = due(v.id), fuelSpend = db.fuel.reduce(function (s, x) { return x.v === v.id && x.d.slice(0, 4) === iso().slice(0, 4) ? s + (x.cost || 0) : s; }, 0);
      body.appendChild(h('div', { 'class': 'tsum', 'data-out': '' }, [['Average mileage', m.avg ? T.num(m.avg, 1) + ' km/l' : 'Needs 2 full tanks', ''], ['Last full tank', m.last ? T.num(m.last, 1) + ' km/l' : '—', ''], ['Fuel cost per km', m.perKm ? T.money(m.perKm) : '—', ''], ['Fuel this year', T.money(fuelSpend), ''],
        ['Next service', !dd || (dd.km === null && dd.days === null) ? '—' : dd.over ? 'Due now' : [dd.km !== null ? 'in ' + T.num(dd.km) + ' km' : '', dd.days !== null ? 'in ' + dd.days + ' days' : ''].filter(Boolean).join(' / '), dd && dd.over ? 'tout-c' : '']].map(function (x) {
        return h('div', {}, [h('span', { text: x[0] }), h('b', { 'class': x[2], text: x[1] })]); })));
      var kind = 'fuel', box = h('div');
      body.appendChild(T.seg([['fuel', '⛽ Fuel'], ['svc', '🔧 Service / repair']], 'fuel', function (k) { kind = k; form(); }));
      body.appendChild(box);
      var form = function () {
        box.innerHTML = '';
        var d = h('input', { type: 'date', value: iso() }), o = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Odometer reading', value: '' }), c = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Amount paid' });
        if (kind === 'fuel') {
          var l = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'Litres' }), full = h('input', { type: 'checkbox', checked: true });
          box.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Odometer (km)', o, 'Last: ' + T.num(odo(v.id)) + ' km'), T.field('Litres filled', l), T.field('Amount (' + T.currency() + ')', c), T.field('Date', d)]));
          box.appendChild(h('label', { 'class': 'tcheck' }, [full, ' Filled the tank full (needed to work out mileage)']));
          box.appendChild(T.row([T.button('Save fuel', { primary: true, onclick: function () {
            var x = { id: uid(), v: v.id, d: d.value || iso(), odo: parseFloat(o.value), l: parseFloat(l.value), cost: parseFloat(c.value) || 0, full: full.checked };
            if (!(x.odo > 0) || !(x.l > 0)) { alert('Type the odometer reading and the litres.'); return; }
            db.fuel.push(x); save(); draw();
          } })]));
        } else {
          var w = h('input', { type: 'text', placeholder: 'e.g. General service, oil change, new tyres, insurance' }), nk = h('input', { type: 'number', min: '0', step: 'any', placeholder: 'e.g. 5000' }), nd = h('input', { type: 'date' });
          box.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Work done', w), T.field('Odometer (km)', o), T.field('Cost (' + T.currency() + ')', c), T.field('Date', d), T.field('Next service after (km)', nk), T.field('or by date', nd)]));
          box.appendChild(T.row([T.button('Save service', { primary: true, onclick: function () {
            var x = { id: uid(), v: v.id, d: d.value || iso(), odo: parseFloat(o.value) || odo(v.id), cost: parseFloat(c.value) || 0, what: w.value.trim() || 'Service', nextKm: parseFloat(nk.value) || 0, nextD: nd.value || '' };
            db.svc.push(x); save(); draw();
          } })]));
        }
      };
      form();
      var list = h('div', { 'class': 'tlist' }), all = [];
      db.fuel.forEach(function (x) { if (x.v === v.id) all.push(['f', x]); }); db.svc.forEach(function (x) { if (x.v === v.id) all.push(['s', x]); });
      all.sort(function (a, b) { return b[1].odo - a[1].odo || (a[1].d < b[1].d ? 1 : -1); }).slice(0, 60).forEach(function (r) {
        var x = r[1], s = m.seg.filter(function (g) { return g.d === x.d && r[0] === 'f' && x.full; })[0];
        list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: r[0] === 'f' ? '⛽' : '🔧' }),
          h('span', { 'class': 'titem-main' }, [h('b', { text: r[0] === 'f' ? T.num(x.l) + ' L' + (x.full ? ' (full)' : '') + (s ? ' · ' + T.num(s.kmpl, 1) + ' km/l' : '') : x.what }), h('small', { text: x.d + ' · ' + T.num(x.odo) + ' km' })]),
          h('span', { 'class': 'titem-amt', text: x.cost ? T.money(x.cost) : '' }),
          h('button', { type: 'button', 'aria-label': 'Delete', title: 'Delete', text: '✕', onclick: function () { if (confirm('Delete this entry?')) { db[r[0] === 'f' ? 'fuel' : 'svc'] = db[r[0] === 'f' ? 'fuel' : 'svc'].filter(function (y) { return y !== x; }); save(); draw(); } } })]));
      });
      body.appendChild(h('h3', { text: 'Log' })); body.appendChild(list);
    }
    var n = h('input', { type: 'text', placeholder: 'e.g. Activa, Swift, Splendor' });
    body.appendChild(h('details', { 'class': 'tcalc-details', open: db.vehicles.length ? null : true }, [h('summary', { text: '➕ Add a vehicle' }), T.field('Name', n),
      T.row([T.button('Add vehicle', { primary: true, onclick: function () { if (!n.value.trim()) { n.focus(); return; } var x = { id: uid(), name: n.value.trim() }; db.vehicles.push(x); sel = x.id; save(); draw(); } }),
        v ? T.button('Delete ' + v.name, { small: true, onclick: function () { if (confirm('Delete ' + v.name + ' and its whole log?')) { db.vehicles = db.vehicles.filter(function (x) { return x !== v; }); db.fuel = db.fuel.filter(function (x) { return x.v !== v.id; }); db.svc = db.svc.filter(function (x) { return x.v !== v.id; }); sel = null; save(); draw(); } } }) : null])]));
  }
  spot.appendChild(T.card([V.bar(draw), body]));
  V.ready.then(draw);

  T.tests['vehicle-log'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    V.save({ vehicles: [{ id: 'v', name: 'Test bike' }], fuel: [{ id: '1', v: 'v', d: '2026-10-01', odo: 1000, l: 10, cost: 1000, full: true }, { id: '2', v: 'v', d: '2026-10-05', odo: 1300, l: 15, cost: 1500, full: true },
      { id: '3', v: 'v', d: '2026-10-08', odo: 1500, l: 5, cost: 500, full: false }, { id: '4', v: 'v', d: '2026-10-12', odo: 1700, l: 10, cost: 1000, full: true }], svc: [{ id: 's', v: 'v', d: '2026-10-02', odo: 1100, cost: 800, what: 'Service', nextKm: 500, nextD: '' }] }); db = V.data();
    var m = mileage('v');
    if (m.seg.length !== 2 || Math.abs(m.seg[0].kmpl - 20) > 1e-9) fails.push('first fill ' + JSON.stringify(m.seg[0]));
    if (Math.abs(m.seg[1].kmpl - 400 / 15) > 1e-9) fails.push('second fill ' + m.seg[1].kmpl);
    if (Math.abs(m.avg - 700 / 30) > 1e-9) fails.push('average ' + m.avg);
    if (Math.abs(m.perKm - 3000 / 700) > 1e-9) fails.push('cost per km ' + m.perKm);
    var dd = due('v'); if (dd.km !== -100 || !dd.over) fails.push('service due ' + JSON.stringify(dd));
    sel = 'v'; draw(); if (body.textContent.indexOf('23.3') < 0) fails.push('average not shown');
    return V.save(keep).then(function () { sel = null; draw(); return { ok: !fails.length, n: 6, fails: fails }; });
  }
});
