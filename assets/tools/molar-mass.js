/* Infinity by GroupChatOn — molar-mass. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var W = 'H 1.008 He 4.0026 Li 6.94 Be 9.0122 B 10.81 C 12.011 N 14.007 O 15.999 F 18.998 Ne 20.180 Na 22.990 Mg 24.305 Al 26.982 Si 28.085 P 30.974 S 32.06 Cl 35.45 Ar 39.95 ' +
    'K 39.098 Ca 40.078 Sc 44.956 Ti 47.867 V 50.942 Cr 51.996 Mn 54.938 Fe 55.845 Co 58.933 Ni 58.693 Cu 63.546 Zn 65.38 Ga 69.723 Ge 72.630 As 74.922 Se 78.971 Br 79.904 Kr 83.798 ' +
    'Rb 85.468 Sr 87.62 Y 88.906 Zr 91.224 Nb 92.906 Mo 95.95 Tc 98 Ru 101.07 Rh 102.91 Pd 106.42 Ag 107.87 Cd 112.41 In 114.82 Sn 118.71 Sb 121.76 Te 127.60 I 126.90 Xe 131.29 ' +
    'Cs 132.91 Ba 137.33 La 138.91 Ce 140.12 Pr 140.91 Nd 144.24 Pm 145 Sm 150.36 Eu 151.96 Gd 157.25 Tb 158.93 Dy 162.50 Ho 164.93 Er 167.26 Tm 168.93 Yb 173.05 Lu 174.97 ' +
    'Hf 178.49 Ta 180.95 W 183.84 Re 186.21 Os 190.23 Ir 192.22 Pt 195.08 Au 196.97 Hg 200.59 Tl 204.38 Pb 207.2 Bi 208.98 Po 209 At 210 Rn 222 Fr 223 Ra 226 Ac 227 ' +
    'Th 232.04 Pa 231.04 U 238.03 Np 237 Pu 244 Am 243 Cm 247 Bk 247 Cf 251 Es 252 Fm 257 Md 258 No 259 Lr 266 Rf 267 Db 268 Sg 269 Bh 270 Hs 269 Mt 278 Ds 281 Rg 282 Cn 285 Nh 286 Fl 289 Mc 290 Lv 293 Ts 294 Og 294';
  var AW = {}, p = W.split(' ');
  for (var i = 0; i < p.length; i += 2) AW[p[i]] = +p[i + 1];
  // CuSO4·5H2O, Ca(OH)2, [Fe(CN)6]3 … → { Cu: 1, S: 1, O: 9, H: 10 }
  function parse(f) {
    var parts = String(f).replace(/\s+/g, '').split(/[·.*•]/), total = {};
    parts.forEach(function (part) {
      var m = part.match(/^(\d+)(.*)$/), mult = 1;
      if (m) { mult = +m[1]; part = m[2]; }
      var stack = [{}], re = /([A-Z][a-z]?)(\d*)|([(\[{])|([)\]}])(\d*)|(.)/g, t;
      while ((t = re.exec(part))) {
        if (t[1]) { if (!(t[1] in AW)) throw new Error('“' + t[1] + '” is not an element symbol. Use capitals correctly: Co is cobalt, CO is carbon monoxide.'); add(stack[stack.length - 1], t[1], +(t[2] || 1)); }
        else if (t[3]) stack.push({});
        else if (t[4]) { if (stack.length < 2) throw new Error('A closing bracket has no opening one.'); var g = stack.pop(), n = +(t[5] || 1); Object.keys(g).forEach(function (e) { add(stack[stack.length - 1], e, g[e] * n); }); }
        else throw new Error('Cannot read “' + t[6] + '” in the formula.');
      }
      if (stack.length !== 1) throw new Error('A bracket is not closed.');
      Object.keys(stack[0]).forEach(function (e) { add(total, e, stack[0][e] * mult); });
    });
    return total;
  }
  function add(o, e, n) { o[e] = (o[e] || 0) + n; }
  GCOTools.engine('calc', 'molar-mass', {
    inputs: [{ k: 'f', label: 'Chemical formula', type: 'text', value: 'CuSO4·5H2O', wide: true, hint: 'e.g. H2O, Ca(OH)2, C6H12O6, CuSO4.5H2O' },
      { k: 'g', label: 'Mass (optional, to find moles)', suffix: 'grams', value: '' }],
    calc: function (v, X) {
      X.need(/[A-Z]/.test(v.f || ''), 'Type a formula, such as H2O.');
      var c = parse(v.f), els = Object.keys(c), M = 0;
      els.forEach(function (e) { M += AW[e] * c[e]; });
      var rows = [['Molar mass', M, function (n) { return X.num(n, 3) + ' g/mol'; }]];
      if (v.g > 0) rows.push(['Moles in ' + v.g + ' g', v.g / M, function (n) { return X.num(n, 5) + ' mol'; }], ['Number of molecules', v.g / M * 6.02214076e23, function (n) { return n.toExponential(4).replace('e+', ' × 10^'); }]);
      return { rows: rows, bars: els.map(function (e) { return [e, AW[e] * c[e]]; }),
        table: { caption: 'Mass by element', open: true, head: ['Element', 'Atoms', 'Atomic mass', 'Mass', 'Share'], rows: els.map(function (e) { return [e, String(c[e]), AW[e].toString(), X.num(AW[e] * c[e], 3), X.num(AW[e] * c[e] / M * 100, 2) + '%']; }) },
        note: 'Uses IUPAC standard atomic weights. Write hydrates with a dot: CuSO4.5H2O.' };
    },
    test: [{ in: { f: 'H2O', g: '' }, expect: { 'Molar mass': 18.015 } }, { in: { f: 'CuSO4.5H2O', g: '' }, expect: { 'Molar mass': 249.677 } },
      { in: { f: 'Ca(OH)2', g: 74.092 }, expect: { 'Molar mass': 74.092, 'Moles in 74.092 g': 1 } }, { in: { f: 'Xy2', g: '' }, expect: { _error: 'not an element' } },
      { in: { f: 'C6H12O6', g: '' }, expect: { 'Molar mass': 180.156 } }]
  });
})();
