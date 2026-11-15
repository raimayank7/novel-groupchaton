/* Infinity unit converter engine: one short list of units → a converter with every unit shown at once.
   GCOTools.engine('units', 'pressure', {
     groups: [{ k: 'p', label: 'Pressure', units: [['pa', 'Pascal (Pa)', 1], ['bar', 'Bar', 1e5], ...] }],   // factor = how many base units in one
     from: 'bar', to: 'psi', value: 1,
     extra: function (base, g, X) { return [['5 ft 9 in', '…']]; },                                          // optional rows
     test: [['p', 1, 'bar', 'psi', 14.5038]] });   // [group, value, from, to, want, extra-row label]
   A unit may give functions instead of a factor: ['c', 'Celsius', function toBase(c) {…}, function fromBase(k) {…}].
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var T = window.GCOTools, h = T.h;
  function nice(n) {
    if (typeof n !== 'number' || isNaN(n)) return '—';
    if (!isFinite(n)) return n > 0 ? '∞' : '−∞';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e15 || a < 1e-6) return n.toExponential(6).replace(/\.?0+e/, 'e').replace('e+', ' × 10^').replace('e-', ' × 10^-');
    return parseFloat(n.toPrecision(10)).toLocaleString('en-US', { maximumFractionDigits: 10 });
  }
  function toBase(u, v) { return typeof u[2] === 'function' ? u[2](v) : v * u[2]; }
  function fromBase(u, b) { return typeof u[3] === 'function' ? u[3](b) : b / u[2]; }
  T.unitsNice = nice;
  // lists several converters share; a group can name one: { units: 'PRESS' }
  var PRESS = [['pa', 'Pascal (Pa)', 1], ['hpa', 'Hectopascal / millibar (hPa)', 100], ['kpa', 'Kilopascal (kPa)', 1000], ['mpa', 'Megapascal (MPa)', 1e6], ['bar', 'Bar (bar)', 1e5],
    ['atm', 'Standard atmosphere (atm)', 101325], ['psi', 'Pounds per square inch (psi)', 6894.757293168], ['mmhg', 'Millimetres of mercury (mmHg)', 133.322387415], ['inhg', 'Inches of mercury (inHg)', 3386.389],
    ['torr', 'Torr (Torr)', 101325 / 760], ['kgcm', 'Kilogram-force per cm² (kgf/cm²)', 98066.5]];
  var ENERGY = [['j', 'Joule (J)', 1], ['kj', 'Kilojoule (kJ)', 1000], ['mj', 'Megajoule (MJ)', 1e6], ['cal', 'Calorie (cal)', 4.184], ['kcal', 'Kilocalorie / food Calorie (kcal)', 4184],
    ['wh', 'Watt-hour (Wh)', 3600], ['kwh', 'Kilowatt-hour / unit (kWh)', 3.6e6], ['btu', 'British thermal unit (BTU)', 1055.05585262], ['therm', 'Therm, US (thm)', 105480400],
    ['ev', 'Electronvolt (eV)', 1.602176634e-19], ['ftlb', 'Foot-pound (ft·lbf)', 1.3558179483314004], ['erg', 'Erg (erg)', 1e-7]];
  var POWER = [['w', 'Watt (W)', 1], ['kw', 'Kilowatt (kW)', 1000], ['mw', 'Megawatt (MW)', 1e6], ['hp', 'Horsepower, mechanical (hp)', 745.69987158227022], ['ps', 'Metric horsepower (PS)', 735.49875],
    ['btuh', 'BTU per hour (BTU/h)', 0.29307107017222], ['kcalh', 'Kilocalorie per hour (kcal/h)', 1.163], ['tr', 'Ton of refrigeration (TR)', 3516.8528420667]];
  var ANGLE = [['deg', 'Degree (°)', 1], ['rad', 'Radian (rad)', 180 / Math.PI], ['grad', 'Gradian (gon)', 0.9], ['arcmin', 'Minute of arc (′)', 1 / 60], ['arcsec', 'Second of arc (″)', 1 / 3600],
    ['turn', 'Turn / revolution (turn)', 360], ['mil', 'Mil, NATO (mil)', 360 / 6400]];
  var FUEL = [['kml', 'Kilometres per litre (km/l)', function (x) { return x; }, function (x) { return x; }], ['l100', 'Litres per 100 km (L/100 km)', function (x) { return 100 / x; }, function (x) { return 100 / x; }],
    ['mpgus', 'Miles per gallon, US (mpg US)', function (x) { return x * 1.609344 / 3.785411784; }, function (x) { return x * 3.785411784 / 1.609344; }],
    ['mpguk', 'Miles per gallon, UK (mpg UK)', function (x) { return x * 1.609344 / 4.54609; }, function (x) { return x * 4.54609 / 1.609344; }]];
  var LISTS = { PRESS: PRESS, ENERGY: ENERGY, POWER: POWER, ANGLE: ANGLE, FUEL: FUEL };

  T.engines.units = function (spot, T, def, id) {
    var saved = T.store.get('units-' + id, {}), groups = def.groups;
    groups.forEach(function (g) { if (typeof g.units === 'string') g.units = LISTS[g.units]; });
    var gk = saved.g && groups.some(function (g) { return g.k === saved.g; }) ? saved.g : groups[0].k;
    function G() { return groups.filter(function (g) { return g.k === gk; })[0]; }
    var groupSel = groups.length > 1 ? T.select(groups.map(function (g) { return [g.k, g.label]; }), gk) : null;
    var val = h('input', { type: 'number', step: 'any', inputmode: 'decimal', value: saved.v !== undefined ? saved.v : (def.value !== undefined ? def.value : 1), 'aria-label': 'Value' });
    var from = h('select', { 'aria-label': 'From unit' }), to = h('select', { 'aria-label': 'To unit' });
    var big = h('div', { 'class': 'tu-big', 'aria-live': 'polite' }), table = h('div', { 'class': 'tu-all' }), extra = h('div', { 'class': 'tstats' }), note = h('p', { 'class': 'tnote' });
    function fill(sel, keep) {
      sel.innerHTML = '';
      G().units.forEach(function (u) { sel.appendChild(h('option', { value: u[0], text: u[1] })); });
      if (keep && G().units.some(function (u) { return u[0] === keep; })) sel.value = keep;
    }
    function unit(k) { return G().units.filter(function (u) { return u[0] === k; })[0]; }
    function start(first) {
      var g = G();
      fill(from, first ? saved.f || def.from : g.from || g.units[0][0]);
      fill(to, first ? saved.t || def.to : g.to || (g.units[1] || g.units[0])[0]);
      note.textContent = g.note || def.note || '';
      note.hidden = !note.textContent;
    }
    var last = {};
    function run() {
      T.store.set('units-' + id, { g: gk, v: val.value, f: from.value, t: to.value });
      var v = parseFloat(val.value), uf = unit(from.value), ut = unit(to.value);
      table.innerHTML = ''; extra.innerHTML = '';
      if (isNaN(v) || !uf || !ut) { big.textContent = 'Type a number to convert.'; last = {}; return; }
      var b = toBase(uf, v), r = fromBase(ut, b);
      last = { base: b, result: r, all: {} };
      big.innerHTML = '';
      big.appendChild(h('span', { text: nice(v) + ' ' + short(uf) + ' =' }));
      big.appendChild(h('b', { text: nice(r) + ' ' + short(ut) }));
      var rows = G().units.map(function (u) { var x = fromBase(u, b); last.all[u[0]] = x; return [u, x]; });
      table.appendChild(h('table', {}, [h('tbody', {}, rows.map(function (row) {
        return h('tr', { 'class': row[0][0] === to.value ? 'is-on' : null }, [h('th', { text: row[0][1] }), h('td', {}, [h('button', { type: 'button', 'class': 'tu-copy', title: 'Copy', text: nice(row[1]),
          onclick: function (e) { T.copy(String(parseFloat(row[1].toPrecision(12))), e.currentTarget); } })])]);
      }))]));
      if (def.extra) (def.extra(b, gk, { nice: nice }) || []).forEach(function (x) { extra.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: x[1] }), h('span', { text: x[0] })])); last.all[x[0]] = x[1]; });
      extra.hidden = !extra.childNodes.length;
    }
    function short(u) { var m = u[1].match(/\(([^)]+)\)\s*$/); return m ? m[1] : u[1].toLowerCase(); }
    if (groupSel) groupSel.addEventListener('change', function () { gk = groupSel.value; start(false); run(); });
    [val, from, to].forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
    var swap = T.button('⇅ Swap', { small: true, onclick: function () { var a = from.value; from.value = to.value; to.value = a; run(); } });
    var copy = T.button('Copy result', { small: true, onclick: function () { T.copy(big.textContent.replace(/\s+/g, ' ').trim(), copy); } });
    spot.appendChild(T.card([groupSel ? T.field('Convert', groupSel) : null,
      h('div', { 'class': 'tu-in' }, [T.field('Value', val), T.field('From', from), T.field('To', to)]),
      big, T.row([swap, copy]), extra, h('h3', { text: 'In every unit' }), table, note]));
    start(true); run();

    T.tests[id] = function () {
      var fails = [], keep = [gk, val.value, from.value, to.value];
      (def.test || []).forEach(function (t, n) {
        if (gk !== t[0]) { gk = t[0]; if (groupSel) groupSel.value = gk; start(false); }
        val.value = t[1]; from.value = t[2]; to.value = t[3]; run();
        var want = t[4], have = t[5] ? last.all[t[5]] : typeof want === 'number' ? last.result : last.all[t[3]];
        if (typeof want === 'number' ? !(Math.abs(have - want) <= Math.max(Math.abs(want) * 5e-5, 1e-9)) : String(have).indexOf(want) < 0) fails.push('#' + n + ' ' + t[1] + ' ' + t[2] + ' → ' + t[3] + ': got ' + have + ', want ' + want);
      });
      gk = keep[0]; if (groupSel) groupSel.value = gk; start(false); val.value = keep[1]; from.value = keep[2]; to.value = keep[3]; run();
      T.store.set('units-' + id, {});
      return Promise.resolve({ ok: !fails.length && (def.test || []).length > 0, n: (def.test || []).length, fails: fails });
    };
  };
})();
