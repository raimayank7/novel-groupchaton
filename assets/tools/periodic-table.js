/* Infinity by GroupChatOn — periodic-table. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Interactive periodic table: all 118 elements by group and period, coloured by type; tap for details, search by name, symbol or number. */
GCOTools.register('periodic-table', function (spot, T) {
  var h = T.h;
  var SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
  var NAME = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Caesium Barium Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury Thallium Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium Americium Curium Berkelium Californium Einsteinium Fermium Mendelevium Nobelium Lawrencium Rutherfordium Dubnium Seaborgium Bohrium Hassium Meitnerium Darmstadtium Roentgenium Copernicium Nihonium Flerovium Moscovium Livermorium Tennessine Oganesson'.split(' ');
  var MASS = ('1.008 4.0026 6.94 9.0122 10.81 12.011 14.007 15.999 18.998 20.180 22.990 24.305 26.982 28.085 30.974 32.06 35.45 39.948 39.098 40.078 44.956 47.867 50.942 51.996 54.938 55.845 58.933 58.693 63.546 65.38 ' +
    '69.723 72.630 74.922 78.971 79.904 83.798 85.468 87.62 88.906 91.224 92.906 95.95 [98] 101.07 102.91 106.42 107.87 112.41 114.82 118.71 121.76 127.60 126.90 131.29 132.91 137.33 138.91 140.12 140.91 144.24 ' +
    '[145] 150.36 151.96 157.25 158.93 162.50 164.93 167.26 168.93 173.05 174.97 178.49 180.95 183.84 186.21 190.23 192.22 195.08 196.97 200.59 204.38 207.2 208.98 [209] [210] [222] [223] [226] [227] 232.04 ' +
    '231.04 238.03 [237] [244] [243] [247] [247] [251] [252] [257] [258] [259] [266] [267] [268] [269] [270] [269] [278] [281] [282] [285] [286] [289] [290] [293] [294] [294]').split(' ');
  var CAT = { alkali: ['Alkali metal', '#fca5a5'], alkaline: ['Alkaline earth metal', '#fdba74'], transition: ['Transition metal', '#fde68a'], post: ['Post-transition metal', '#bbf7d0'], metalloid: ['Metalloid', '#99f6e4'],
    nonmetal: ['Reactive nonmetal', '#bae6fd'], halogen: ['Halogen', '#c7d2fe'], noble: ['Noble gas', '#f5d0fe'], lanthanide: ['Lanthanide', '#fbcfe8'], actinide: ['Actinide', '#fecdd3'] };
  function pos(z) {   // [period, group] — lanthanides / actinides get group 0 (shown in the rows below)
    var starts = [1, 3, 11, 19, 37, 55, 87], p = 0; while (p < 6 && z >= starts[p + 1]) p++;
    var i = z - starts[p];
    if (p === 0) return [1, z === 1 ? 1 : 18];
    if (p < 3) return [p + 1, i < 2 ? i + 1 : i + 11];
    if (p < 5) return [p + 1, i + 1];
    if (i < 2) return [p + 1, i + 1];
    if (i <= 16) return [p + 1, 0];
    return [p + 1, i - 13];
  }
  function cat(z) {
    var g = pos(z)[1];
    if (z >= 57 && z <= 71) return 'lanthanide'; if (z >= 89 && z <= 103) return 'actinide';
    if (g === 18) return 'noble'; if (z === 1 || [6, 7, 8, 15, 16, 34].indexOf(z) >= 0) return 'nonmetal';
    if ([9, 17, 35, 53, 85, 117].indexOf(z) >= 0) return 'halogen'; if (g === 1) return 'alkali'; if (g === 2) return 'alkaline';
    if ([5, 14, 32, 33, 51, 52].indexOf(z) >= 0) return 'metalloid'; if (g >= 3 && g <= 12) return 'transition';
    return 'post';
  }
  function block(z) { var g = pos(z)[1]; if (!g) return 'f'; if (z === 2 || g <= 2) return 's'; if (g >= 13) return 'p'; return 'd'; }
  function state(z) { if ([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86].indexOf(z) >= 0) return 'Gas'; if (z === 35 || z === 80) return 'Liquid'; return z > 100 ? 'Unknown (made in labs)' : 'Solid'; }
  var cellsEl = {}, detail = h('div', { 'class': 'tkv', 'data-out': '' }), find = h('input', { type: 'search', placeholder: 'Search: name, symbol or number (e.g. iron, Fe, 26)' });
  var table = h('div', { style: 'display:grid;grid-template-columns:repeat(18,minmax(34px,1fr));gap:3px;min-width:680px' });
  function cellStyle(z) { return 'display:grid;place-items:center;aspect-ratio:1/1.1;padding:2px;border:1px solid rgba(0,0,0,.12);border-radius:6px;background:' + CAT[cat(z)][1] + ';color:#111;cursor:pointer;font:600 10px/1.1 var(--ui)'; }
  function addCell(z, row, col) {
    var b = h('button', { type: 'button', title: NAME[z - 1], style: cellStyle(z) + ';grid-row:' + row + ';grid-column:' + col, onclick: function () { show(z); } },
      [h('small', { text: String(z), style: 'font-size:9px' }), h('b', { text: SYM[z - 1], style: 'font-size:15px' })]);
    cellsEl[z] = b; table.appendChild(b);
  }
  for (var z = 1; z <= 118; z++) { var p = pos(z); if (p[1]) addCell(z, p[0], p[1]); else addCell(z, p[0] === 6 ? 9 : 10, z - (p[0] === 6 ? 57 : 89) + 3); }
  table.appendChild(h('div', { style: 'grid-row:6;grid-column:3;display:grid;place-items:center;font-size:10px;color:var(--muted)', text: '57–71' }));
  table.appendChild(h('div', { style: 'grid-row:7;grid-column:3;display:grid;place-items:center;font-size:10px;color:var(--muted)', text: '89–103' }));
  table.appendChild(h('div', { style: 'grid-row:8;grid-column:1/-1;height:8px' }));
  function show(z) {
    Object.keys(cellsEl).forEach(function (k) { cellsEl[k].style.outline = +k === z ? '3px solid var(--accent)' : ''; });
    var p = pos(z), m = MASS[z - 1];
    detail.innerHTML = '';
    [['Element', NAME[z - 1] + ' (' + SYM[z - 1] + ')'], ['Atomic number', z + ' (' + z + ' protons and ' + z + ' electrons)'], ['Atomic mass', m + ' u' + (m[0] === '[' ? ' (mass number of its most stable form)' : '')],
      ['Type', CAT[cat(z)][0]], ['Group', p[1] ? String(p[1]) : 'f-block (' + (z < 89 ? 'lanthanides' : 'actinides') + ')'], ['Period', String(p[0])], ['Block', block(z) + '-block'], ['At room temperature', state(z)],
      ['Radioactive', z === 43 || z === 61 || z >= 84 ? 'Yes' : 'No']].forEach(function (r) { detail.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] })])); });
  }
  find.addEventListener('input', function () {
    var s = find.value.trim().toLowerCase(), hit = 0;
    for (var z = 1; z <= 118; z++) {
      var ok = !s || String(z) === s || SYM[z - 1].toLowerCase() === s || NAME[z - 1].toLowerCase().indexOf(s) === 0;
      cellsEl[z].style.opacity = ok ? '1' : '.2'; if (ok && s && !hit) hit = z;
    }
    if (hit) show(hit);
  });
  var legend = h('div', { 'class': 'trow', style: 'gap:6px' }, Object.keys(CAT).map(function (k) {
    return h('button', { type: 'button', 'class': 'tbtn tbtn-sm', style: 'background:' + CAT[k][1] + ';color:#111;border-color:transparent', text: CAT[k][0], onclick: function () {
      find.value = ''; for (var z = 1; z <= 118; z++) cellsEl[z].style.opacity = cat(z) === k ? '1' : '.2';
    } });
  }).concat([T.button('Show all', { small: true, onclick: function () { find.value = ''; for (var z = 1; z <= 118; z++) cellsEl[z].style.opacity = '1'; } })]));
  spot.appendChild(T.card([T.field('Find an element', find), h('div', { style: 'overflow-x:auto;padding-bottom:6px' }, [table]), h('small', { 'class': 'tnote', text: 'Scroll sideways on small screens. Tap an element for its details.' }), legend, detail]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  show(26);
  T.tests['periodic-table'] = function () {
    var f = [];
    if (SYM.length !== 118 || NAME.length !== 118 || MASS.length !== 118) f.push('counts ' + SYM.length + '/' + NAME.length + '/' + MASS.length);
    [[26, 4, 8], [1, 1, 1], [2, 1, 18], [118, 7, 18], [72, 6, 4], [87, 7, 1], [31, 4, 13], [13, 3, 13]].forEach(function (c) { var p = pos(c[0]); if (p[0] !== c[1] || p[1] !== c[2]) f.push('pos ' + c[0] + ' ' + p); });
    if (MASS[78] !== '196.97' || MASS[7] !== '15.999' || NAME[78] !== 'Gold' || SYM[78] !== 'Au') f.push('gold / oxygen');
    if (cat(57) !== 'lanthanide' || cat(17) !== 'halogen' || cat(14) !== 'metalloid' || cat(11) !== 'alkali' || cat(29) !== 'transition' || cat(82) !== 'post') f.push('categories');
    if (block(26) !== 'd' || block(2) !== 's' || block(92) !== 'f' || block(6) !== 'p') f.push('blocks');
    return Promise.resolve({ ok: !f.length, n: 12, fails: f });
  };
});
