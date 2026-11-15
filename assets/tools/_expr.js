/* Infinity maths engine: a safe expression parser (no eval), exact symbolic derivatives, and five calculators built on it:
   basic (keypad + history), scientific, graph (plotter), derivative (and integral) and equation (roots and linear systems).
   GCOTools.engine('expr', 'scientific', { kind: 'scientific' });   GCOTools.expr.parse('2x^2', { vars: ['x'] })
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var T = window.GCOTools, h = T.h;

  /* ---------------- parser ---------------- */
  var CONST = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI, phi: (1 + Math.sqrt(5)) / 2 };
  var TRIG = { sin: 1, cos: 1, tan: 1, sec: 1, csc: 1, cot: 1 }, ATRIG = { asin: 1, acos: 1, atan: 1 };
  var FN = {
    sin: [1, Math.sin], cos: [1, Math.cos], tan: [1, Math.tan], sec: [1, function (x) { return 1 / Math.cos(x); }], csc: [1, function (x) { return 1 / Math.sin(x); }],
    cot: [1, function (x) { return 1 / Math.tan(x); }], asin: [1, Math.asin], acos: [1, Math.acos], atan: [1, Math.atan],
    sinh: [1, Math.sinh], cosh: [1, Math.cosh], tanh: [1, Math.tanh], asinh: [1, Math.asinh], acosh: [1, Math.acosh], atanh: [1, Math.atanh],
    sqrt: [1, Math.sqrt], cbrt: [1, Math.cbrt], abs: [1, Math.abs], ln: [1, Math.log], log: [[1, 2], function (x, b) { return b === undefined ? Math.log10(x) : Math.log(x) / Math.log(b); }],
    log2: [1, Math.log2], log10: [1, Math.log10], exp: [1, Math.exp], floor: [1, Math.floor], ceil: [1, Math.ceil], round: [1, Math.round], sign: [1, Math.sign],
    root: [2, function (x, n) { return x < 0 && n % 2 === 1 ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n); }],
    min: [-1, Math.min], max: [-1, Math.max], mod: [2, function (a, b) { return a - b * Math.floor(a / b); }],
    nCr: [2, function (n, r) { return Math.round(fact(n) / (fact(r) * fact(n - r))); }], nPr: [2, function (n, r) { return Math.round(fact(n) / fact(n - r)); }],
    gcd: [2, function (a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { var t = b; b = a % b; a = t; } return a; }],
    lcm: [2, function (a, b) { return a && b ? Math.abs(a * b) / FN.gcd[1](a, b) : 0; }]
  };
  function gamma(x) {   // Stirling series after shifting x up to 10: about 14 correct digits
    if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
    var p = 1;
    while (x < 10) { p *= x; x++; }
    return Math.exp((x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) + 1 / (12 * x) - 1 / (360 * Math.pow(x, 3)) + 1 / (1260 * Math.pow(x, 5)) - 1 / (1680 * Math.pow(x, 7)) + 1 / (1188 * Math.pow(x, 9))) / p;
  }
  function fact(n) {
    if (n === Math.floor(n)) { if (n < 0) return NaN; if (n > 170) return Infinity; var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
    return gamma(n + 1);
  }
  function tidy(s) {
    return String(s).replace(/[×·∙]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/\*\*/g, '^').replace(/π/g, ' pi ').replace(/√/g, ' sqrt ')
      .replace(/∛/g, ' cbrt ').replace(/²/g, '^2').replace(/³/g, '^3').replace(/^\s*(y|f\(x\))\s*=/i, '');
  }
  function tokenize(src, known) {
    var s = tidy(src), out = [], m;
    while (s.length) {
      if ((m = s.match(/^\s+/))) { s = s.slice(m[0].length); continue; }
      if ((m = s.match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i))) { out.push({ k: 'n', v: parseFloat(m[0]) }); s = s.slice(m[0].length); continue; }
      if ((m = s.match(/^[a-zA-Z_][a-zA-Z_0-9]*/))) {
        var w = m[0]; s = s.slice(w.length);
        if (known(w)) { out.push({ k: 'id', v: w }); continue; }
        // "xy", "2pix", "xsin" → x·y, pi·x, x·sin
        var parts = [], rest = w;
        while (rest) {
          var hit = '';
          for (var L = rest.length; L > 0; L--) if (known(rest.slice(0, L))) { hit = rest.slice(0, L); break; }
          if (!hit) throw new Error('I don’t know “' + w + '”. Check the spelling, or use * between letters.');
          parts.push({ k: 'id', v: hit }); rest = rest.slice(hit.length);
        }
        out.push.apply(out, parts); continue;
      }
      if ('+-*/^(),!%|='.indexOf(s[0]) >= 0) { out.push({ k: s[0] }); s = s.slice(1); continue; }
      throw new Error('Cannot read “' + s[0] + '”.');
    }
    return out;
  }
  function parse(src, opts) {
    opts = opts || {};
    var vars = opts.vars || [];
    var known = function (w) { return FN[w] || w in CONST || vars.indexOf(w) >= 0; };
    var tk = tokenize(src, known), i = 0;
    if (!tk.length) throw new Error('Type something to work out.');
    function peek() { return tk[i]; }
    function is(k) { return tk[i] && tk[i].k === k; }
    function eat(k) { if (!is(k)) throw new Error(tk[i] ? 'Unexpected “' + (tk[i].v !== undefined ? tk[i].v : tk[i].k) + '”.' : 'Something is missing at the end.'); return tk[i++]; }
    function starts() { var t = peek(); return t && (t.k === 'n' || t.k === 'id' || t.k === '('); }
    function expr() {
      var a = term();
      while (is('+') || is('-')) { var o = tk[i++].k; a = { t: 'op', o: o, a: a, b: term() }; }
      return a;
    }
    function term() {
      var a = unary();
      for (;;) {
        if (is('*') || is('/')) { var o = tk[i++].k; a = { t: 'op', o: o, a: a, b: unary() }; }
        else if (starts()) a = { t: 'op', o: '*', a: a, b: power() };   // 2x, 3(4), 2sin(x)
        else return a;
      }
    }
    function unary() {
      if (is('-')) { i++; return { t: 'neg', a: unary() }; }
      if (is('+')) { i++; return unary(); }
      return power();
    }
    function power() {
      var b = postfix();
      if (is('^')) { i++; return { t: 'op', o: '^', a: b, b: unary() }; }
      return b;
    }
    function postfix() {
      var a = primary();
      while (is('!') || is('%')) a = { t: tk[i++].k === '!' ? 'fact' : 'pct', a: a };
      return a;
    }
    function primary() {
      var t = peek();
      if (!t) throw new Error('Something is missing at the end.');
      if (t.k === 'n') { i++; return { t: 'n', v: t.v }; }
      if (t.k === '(') { i++; var e = expr(); eat(')'); return e; }
      if (t.k === '|') { i++; var e2 = expr(); eat('|'); return { t: 'fn', n: 'abs', args: [e2] }; }
      if (t.k === 'id') {
        i++;
        if (FN[t.v]) {
          var args = [];
          if (is('(')) { i++; if (!is(')')) { args.push(expr()); while (is(',')) { i++; args.push(expr()); } } eat(')'); }
          else args.push(power());   // sin 30, sqrt 2
          var ar = FN[t.v][0];
          if (ar !== -1 && (Array.isArray(ar) ? ar.indexOf(args.length) < 0 : args.length !== ar)) throw new Error(t.v + '() takes ' + (Array.isArray(ar) ? ar.join(' or ') : ar) + ' value' + (ar === 1 ? '' : 's') + '.');
          if (ar === -1 && !args.length) throw new Error(t.v + '() needs at least one value.');
          return { t: 'fn', n: t.v, args: args };
        }
        if (t.v in CONST && vars.indexOf(t.v) < 0) return { t: 'c', n: t.v };
        return { t: 'v', n: t.v };
      }
      throw new Error('Unexpected “' + t.k + '”.');
    }
    var tree = expr();
    if (i < tk.length) throw new Error('Unexpected “' + (tk[i].v !== undefined ? tk[i].v : tk[i].k) + '”.');
    return tree;
  }
  // close any brackets the user left open: "(1+2" → "(1+2)"
  function closeParens(s) { var n = (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length; return n > 0 ? s + new Array(n + 1).join(')') : s; }

  /* ---------------- evaluate ---------------- */
  function compile(node, deg) {
    var D = Math.PI / 180;
    function c(n) {
      switch (n.t) {
        case 'n': return function () { return n.v; };
        case 'c': var k = CONST[n.n]; return function () { return k; };
        case 'v': return function (s) { var v = s[n.n]; if (v === undefined) throw new Error('No value for ' + n.n + ' yet.'); return v; };
        case 'neg': var a = c(n.a); return function (s) { return -a(s); };
        case 'fact': var f = c(n.a); return function (s) { return fact(f(s)); };
        case 'pct': var p = c(n.a); return function (s) { return p(s) / 100; };
        case 'op':
          var L = c(n.a), R;
          if ((n.o === '+' || n.o === '-') && n.b.t === 'pct') { R = c(n.b.a); return n.o === '+' ? function (s) { var l = L(s); return l + l * R(s) / 100; } : function (s) { var l = L(s); return l - l * R(s) / 100; }; }
          R = c(n.b);
          switch (n.o) {
            case '+': return function (s) { return L(s) + R(s); };
            case '-': return function (s) { return L(s) - R(s); };
            case '*': return function (s) { return L(s) * R(s); };
            case '/': return function (s) { return L(s) / R(s); };
            case '^': return function (s) { var b = L(s), e = R(s); if (b < 0 && e !== Math.floor(e)) { var q = 1 / e; if (Math.abs(q - Math.round(q)) < 1e-9 && Math.round(q) % 2) return -Math.pow(-b, e); } return Math.pow(b, e); };
          }
          break;
        case 'fn':
          var args = n.args.map(c), fn = FN[n.n][1];
          if (deg && TRIG[n.n]) return function (s) { var x = args[0](s), r = fn(x * D); return Math.abs(r) < 1e-15 ? 0 : (n.n === 'tan' || n.n === 'sec') && Math.abs(Math.cos(x * D)) < 1e-15 ? NaN : r; };
          if (deg && ATRIG[n.n]) return function (s) { return fn(args[0](s)) / D; };
          return function (s) { return fn.apply(null, args.map(function (a) { return a(s); })); };
      }
      throw new Error('Cannot work that out.');
    }
    return c(node);
  }
  function evaluate(src, scope, opts) {
    opts = opts || {};
    var tree = parse(closeParens(src), { vars: Object.keys(scope || {}) });
    return compile(tree, opts.deg)(scope || {});
  }
  // plain number text for calculator screens: 0.1+0.2 → 0.3, 1e21 → 1e21
  function fmt(n) {
    if (typeof n !== 'number' || isNaN(n)) return 'Not a number';
    if (!isFinite(n)) return n > 0 ? '∞' : '−∞';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e15 || a < 1e-9) return n.toExponential(9).replace(/\.?0+e/, 'e').replace('e+', 'e');
    return String(parseFloat(n.toPrecision(12)));
  }

  /* ---------------- symbolic derivative ---------------- */
  var N = function (v) { return { t: 'n', v: v }; };
  var op = function (o, a, b) { return { t: 'op', o: o, a: a, b: b }; };
  var fn = function (n, a) { return { t: 'fn', n: n, args: [a] }; };
  var neg = function (a) { return { t: 'neg', a: a }; };
  function has(n, x) {
    if (n.t === 'v') return n.n === x;
    if (n.t === 'op') return has(n.a, x) || has(n.b, x);
    if (n.t === 'fn') return n.args.some(function (a) { return has(a, x); });
    if (n.a) return has(n.a, x);
    return false;
  }
  function d(n, x) {
    if (!has(n, x)) return N(0);
    switch (n.t) {
      case 'v': return N(1);
      case 'neg': return neg(d(n.a, x));
      case 'pct': return op('/', d(n.a, x), N(100));
      case 'fact': throw new Error('Factorials (!) cannot be differentiated.');
      case 'op':
        var a = n.a, b = n.b, da = d(a, x), db = d(b, x);
        if (n.o === '+' || n.o === '-') return op(n.o, da, db);
        if (n.o === '*') return op('+', op('*', da, b), op('*', a, db));
        if (n.o === '/') return op('/', op('-', op('*', da, b), op('*', a, db)), op('^', b, N(2)));
        if (!has(b, x)) return op('*', op('*', b, op('^', a, op('-', b, N(1)))), da);
        if (!has(a, x)) return op('*', op('*', n, fn('ln', a)), db);
        return op('*', n, op('+', op('*', db, fn('ln', a)), op('/', op('*', b, da), a)));
      case 'fn':
        var u = n.args[0], du = d(u, x);
        if (n.args.length > 1 && n.n !== 'log') throw new Error(n.n + '() cannot be differentiated here.');
        if (n.n === 'log' && n.args.length === 2) return d(op('/', fn('ln', u), fn('ln', n.args[1])), x);
        var inner = {
          sin: function () { return fn('cos', u); }, cos: function () { return neg(fn('sin', u)); }, tan: function () { return op('^', fn('sec', u), N(2)); },
          sec: function () { return op('*', fn('sec', u), fn('tan', u)); }, csc: function () { return neg(op('*', fn('csc', u), fn('cot', u))); }, cot: function () { return neg(op('^', fn('csc', u), N(2))); },
          asin: function () { return op('/', N(1), fn('sqrt', op('-', N(1), op('^', u, N(2))))); }, acos: function () { return neg(op('/', N(1), fn('sqrt', op('-', N(1), op('^', u, N(2)))))); },
          atan: function () { return op('/', N(1), op('+', N(1), op('^', u, N(2)))); },
          sinh: function () { return fn('cosh', u); }, cosh: function () { return fn('sinh', u); }, tanh: function () { return op('-', N(1), op('^', fn('tanh', u), N(2))); },
          asinh: function () { return op('/', N(1), fn('sqrt', op('+', op('^', u, N(2)), N(1)))); }, acosh: function () { return op('/', N(1), fn('sqrt', op('-', op('^', u, N(2)), N(1)))); },
          atanh: function () { return op('/', N(1), op('-', N(1), op('^', u, N(2)))); },
          sqrt: function () { return op('/', N(1), op('*', N(2), fn('sqrt', u))); }, cbrt: function () { return op('/', N(1), op('*', N(3), op('^', fn('cbrt', u), N(2)))); },
          abs: function () { return fn('sign', u); }, ln: function () { return op('/', N(1), u); }, log: function () { return op('/', N(1), op('*', u, fn('ln', N(10)))); },
          log10: function () { return op('/', N(1), op('*', u, fn('ln', N(10)))); }, log2: function () { return op('/', N(1), op('*', u, fn('ln', N(2)))); }, exp: function () { return fn('exp', u); }
        }[n.n];
        if (!inner) throw new Error(n.n + '() has no derivative here.');
        return op('*', inner(), du);
    }
    return N(0);
  }
  /* ---------------- tidy up a formula ---------------- */
  var isN = function (n, v) { return n.t === 'n' && (v === undefined || n.v === v); };
  function same(a, b) { return show(a) === show(b); }
  function simp(n) {
    if (n.t === 'neg') {
      var a = simp(n.a);
      if (a.t === 'n') return N(-a.v);
      if (a.t === 'neg') return a.a;
      if (a.t === 'op' && a.o === '*' && a.a.t === 'n') return simp(op('*', N(-a.a.v), a.b));
      return neg(a);
    }
    if (n.t === 'fn') {
      var args = n.args.map(simp);
      if (args.every(function (x) { return x.t === 'n'; })) { var r = FN[n.n][1].apply(null, args.map(function (x) { return x.v; })); if (isFinite(r) && Math.abs(r - Math.round(r)) < 1e-12) return N(Math.round(r)); }
      return { t: 'fn', n: n.n, args: args };
    }
    if (n.t !== 'op') return n;
    var A = simp(n.a), B = simp(n.b), o = n.o;
    if (A.t === 'n' && B.t === 'n') {
      var v = o === '+' ? A.v + B.v : o === '-' ? A.v - B.v : o === '*' ? A.v * B.v : o === '/' ? A.v / B.v : Math.pow(A.v, B.v);
      if (o !== '/' && o !== '^' || Math.abs(v - Math.round(v)) < 1e-12) return N(o === '/' || o === '^' ? Math.round(v) : v);
      if (o === '/' && A.v < 0) return neg(op('/', N(-A.v), B));
    }
    switch (o) {
      case '+':
        if (isN(A, 0)) return B; if (isN(B, 0)) return A;
        if (B.t === 'neg') return simp(op('-', A, B.a));
        if (B.t === 'n' && B.v < 0) return op('-', A, N(-B.v));
        if (same(A, B)) return simp(op('*', N(2), A));
        if (A.t === 'n') return op('+', B, A);
        break;
      case '-':
        if (isN(B, 0)) return A; if (isN(A, 0)) return simp(neg(B));
        if (B.t === 'neg') return simp(op('+', A, B.a));
        if (B.t === 'n' && B.v < 0) return op('+', A, N(-B.v));
        if (same(A, B)) return N(0);
        break;
      case '*':
        if (isN(A, 0) || isN(B, 0)) return N(0);
        if (isN(A, 1)) return B; if (isN(B, 1)) return A;
        if (isN(A, -1)) return simp(neg(B)); if (isN(B, -1)) return simp(neg(A));
        if (A.t === 'neg') return simp(neg(op('*', A.a, B)));
        if (B.t === 'neg') return simp(neg(op('*', A, B.a)));
        if (B.t === 'n' && A.t !== 'n') return simp(op('*', B, A));
        if (A.t === 'n' && B.t === 'op' && B.o === '*' && B.a.t === 'n') return simp(op('*', N(A.v * B.a.v), B.b));
        if (A.t === 'n' && B.t === 'op' && B.o === '/' && B.a.t === 'n') return simp(op('/', N(A.v * B.a.v), B.b));
        if (A.t === 'op' && A.o === '*' && A.a.t === 'n') return simp(op('*', A.a, op('*', A.b, B)));
        if (B.t === 'op' && B.o === '*' && B.a.t === 'n') return simp(op('*', B.a, op('*', A, B.b)));
        if (same(A, B)) return simp(op('^', A, N(2)));
        if (B.t === 'op' && B.o === '^' && same(A, B.a)) return simp(op('^', A, op('+', B.b, N(1))));
        if (A.t === 'op' && A.o === '^' && same(A.a, B)) return simp(op('^', B, op('+', A.b, N(1))));
        if (A.t === 'op' && A.o === '^' && B.t === 'op' && B.o === '^' && same(A.a, B.a)) return simp(op('^', A.a, op('+', A.b, B.b)));
        if (B.t === 'op' && B.o === '/' && isN(B.a, 1)) return simp(op('/', A, B.b));
        if (A.t === 'op' && A.o === '/' && isN(A.a, 1)) return simp(op('/', B, A.b));
        break;
      case '/':
        if (isN(A, 0)) return N(0); if (isN(B, 1)) return A;
        if (same(A, B)) return N(1);
        if (A.t === 'neg') return simp(neg(op('/', A.a, B)));
        if (A.t === 'op' && A.o === '*' && A.a.t === 'n' && B.t === 'n' && Math.abs(A.a.v / B.v - Math.round(A.a.v / B.v)) < 1e-12) return simp(op('*', N(Math.round(A.a.v / B.v)), A.b));
        if (A.t === 'op' && A.o === '*' && A.a.t === 'n' && B.t === 'op' && B.o === '*' && B.a.t === 'n' && A.a.v === B.a.v) return simp(op('/', A.b, B.b));
        if (A.t === 'op' && A.o === '/') return simp(op('/', A.a, op('*', A.b, B)));
        break;
      case '^':
        if (isN(B, 0)) return N(1); if (isN(B, 1)) return A; if (isN(A, 1)) return N(1);
        if (isN(A, 0) && B.t === 'n' && B.v > 0) return N(0);
        if (A.t === 'op' && A.o === '^' && A.b.t === 'n' && B.t === 'n') return simp(op('^', A.a, N(A.b.v * B.v)));
        if (B.t === 'n' && B.v === 0.5) return fn('sqrt', A);
        break;
    }
    return op(o, A, B);
  }
  function simplify(n) { for (var k = 0; k < 12; k++) { var s = show(n), m = simp(n); if (show(m) === s) return m; n = m; } return n; }
  /* ---------------- formula → text ---------------- */
  function prec(n) { return n.t === 'op' ? { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 }[n.o] : n.t === 'neg' ? 3 : n.t === 'n' && n.v < 0 ? 3 : 5; }
  function numText(v) { return fmt(v).replace('−', '-'); }
  function show(n) {
    switch (n.t) {
      case 'n': return numText(n.v);
      case 'c': return n.n === 'pi' ? 'π' : n.n === 'tau' ? 'τ' : n.n === 'phi' ? 'φ' : n.n;
      case 'v': return n.n;
      case 'neg': return '-' + wrap(n.a, prec(n.a) < 3);
      case 'fact': return wrap(n.a, prec(n.a) < 5) + '!';
      case 'pct': return wrap(n.a, prec(n.a) < 5) + '%';
      case 'fn': return n.n + '(' + n.args.map(show).join(', ') + ')';
      case 'op':
        var p = prec(n), A = n.a, B = n.b;
        if (n.o === '+') return show(A) + ' + ' + show(B);
        if (n.o === '-') return show(A) + ' - ' + wrap(B, prec(B) <= 1 || prec(B) === 3);
        if (n.o === '*') {
          var l = wrap(A, prec(A) < 2), r = wrap(B, prec(B) <= 2 || prec(B) === 3);
          var glue = A.t === 'n' && /^[a-zA-Zπτφ(]/.test(r) && !(B.t === 'op' && B.o === '^' && B.a.t === 'n') ? '' : '·';
          return l + glue + r;
        }
        if (n.o === '/') return wrap(A, prec(A) < 2) + '/' + wrap(B, prec(B) <= 2 || prec(B) === 3);
        return wrap(A, prec(A) <= 4) + '^' + wrap(B, prec(B) < 5);
    }
    return '';
  }
  function wrap(n, paren) { var s = show(n); return paren ? '(' + s + ')' : s; }
  // adaptive Simpson's rule for definite integrals
  function integrate(f, a, b) {
    function s(a, b, fa, fm, fb) { return (b - a) / 6 * (fa + 4 * fm + fb); }
    function go(a, b, fa, fm, fb, whole, eps, depth) {
      var m = (a + b) / 2, lm = (a + m) / 2, rm = (m + b) / 2, flm = f(lm), frm = f(rm);
      var left = s(a, m, fa, flm, fm), right = s(m, b, fm, frm, fb);
      if (depth <= 0 || Math.abs(left + right - whole) <= 15 * eps) return left + right + (left + right - whole) / 15;
      return go(a, m, fa, flm, fm, left, eps / 2, depth - 1) + go(m, b, fm, frm, fb, right, eps / 2, depth - 1);
    }
    var fa = f(a), fb = f(b), fm = f((a + b) / 2);
    return go(a, b, fa, fm, fb, s(a, b, fa, fm, fb), 1e-10, 40);
  }
  // every real root of f in [lo, hi]: sign changes plus touching roots (x² = 0)
  function roots(f, lo, hi, steps) {
    steps = steps || 20000;
    var out = [], dx = (hi - lo) / steps, xs = [], ys = [];
    for (var k = 0; k <= steps; k++) { xs.push(lo + k * dx); ys.push(f(lo + k * dx)); }
    function add(r) {
      if (!isFinite(r)) return;
      if (Math.abs(r - Math.round(r)) < 1e-9) r = Math.round(r);
      if (Math.abs(f(r)) > 1e-7 * (1 + Math.abs(r))) return;
      if (!out.some(function (x) { return Math.abs(x - r) < 1e-7 * (1 + Math.abs(r)); })) out.push(r);
    }
    for (k = 0; k < steps; k++) {
      var y0 = ys[k], y1 = ys[k + 1];
      if (!isFinite(y0) || !isFinite(y1)) continue;
      if (y0 === 0) { add(xs[k]); continue; }
      if (y0 * y1 < 0) {
        var a = xs[k], b = xs[k + 1], fa = y0;
        for (var it = 0; it < 80; it++) { var m = (a + b) / 2, fm = f(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } }
        var r = (a + b) / 2;
        if (Math.abs(f(r)) < 1e-6 * (1 + Math.abs(y0) + Math.abs(y1))) add(r);   // not a jump across an asymptote
      } else if (k > 0 && Math.abs(y0) <= Math.abs(ys[k - 1]) && Math.abs(y0) <= Math.abs(y1)) {
        var p = xs[k - 1], q = xs[k + 1];   // a dip that may just touch zero
        for (it = 0; it < 100; it++) { var m1 = p + (q - p) / 3, m2 = q - (q - p) / 3; if (Math.abs(f(m1)) < Math.abs(f(m2))) q = m2; else p = m1; }
        add((p + q) / 2);
      }
    }
    if (isFinite(ys[steps]) && ys[steps] === 0) add(hi);
    return out.sort(function (a, b) { return a - b; });
  }
  T.expr = { parse: parse, compile: compile, evaluate: evaluate, fmt: fmt, derivative: function (n, x) { return simplify(d(n, x)); }, simplify: simplify, show: show, integrate: integrate, roots: roots, closeParens: closeParens };

  /* ================= the calculators ================= */
  T.engines.expr = function (spot, T, def, id) { return KINDS[def.kind](spot, T, id); };
  function result(label, value, copyable) {
    var b = h('b', { text: value });
    return h('div', { 'class': 'tx-res' }, [h('span', { text: label }), b, copyable ? T.button('Copy', { small: true, onclick: function (e) { T.copy(b.textContent, e.currentTarget); } }) : null]);
  }
  function keypad(rows, press) {
    return h('div', { 'class': 'tx-keys', style: '--cols:' + rows[0].length }, [].concat.apply([], rows).map(function (k) {
      if (!k) return h('span');
      var lab = Array.isArray(k) ? k[0] : k, cls = /^[÷×−+]$/.test(lab) ? ' is-op' : lab === '=' ? ' is-eq' : /^(AC|C|⌫)$/.test(lab) ? ' is-clear' : /^[0-9.]$/.test(lab) ? ' is-num' : ' is-fn';
      return h('button', { type: 'button', 'class': 'tx-key' + cls, 'data-key': lab, 'aria-label': Array.isArray(k) && k[2] ? k[2] : lab, text: lab, onclick: function () { press(k); } });
    }));
  }
  function calculator(spot, T, id, sci) {
    var store = 'expr-' + id, saved = T.store.get(store, {}), hist = saved.hist || [], ans = saved.ans || 0, mem = saved.mem || 0, deg = saved.deg !== false;
    var disp = h('input', { type: 'text', 'class': 'tx-disp', inputmode: 'none', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Calculation', placeholder: '0' });
    var prev = h('div', { 'class': 'tx-prev', 'aria-live': 'polite' }), memEl = h('span', { 'class': 'tx-mem' }), list = h('ol', { 'class': 'tx-hist' });
    var justDone = false;
    function save() { T.store.set(store, { hist: hist.slice(0, 30), ans: ans, mem: mem, deg: deg }); }
    function calc(s) { return evaluate(s.replace(/\bAns\b/g, 'ans'), { ans: ans }, { deg: deg }); }
    function preview() {
      var s = disp.value.trim();
      memEl.textContent = (sci ? (deg ? 'DEG' : 'RAD') : '') + (mem ? (sci ? ' · ' : '') + 'M = ' + fmt(mem) : '');
      if (!s || /^-?[\d.]+$/.test(s)) { prev.textContent = ''; return; }
      try { prev.textContent = '= ' + fmt(calc(s)); } catch (e) { prev.textContent = ''; }
    }
    function drawHist() {
      list.innerHTML = '';
      hist.forEach(function (x) {
        list.appendChild(h('li', {}, [h('button', { type: 'button', title: 'Use this again', text: x[0] + ' = ', onclick: function () { disp.value = x[0]; preview(); } }),
          h('button', { type: 'button', 'class': 'tx-hist-r', title: 'Use the answer', text: x[1], onclick: function () { insert(x[1]); } })]));
      });
      list.hidden = !hist.length;
    }
    function insert(t) { if (justDone && /^[\d.(a-zπ√]/i.test(t)) disp.value = ''; justDone = false; disp.value += t; preview(); }
    function equals() {
      var s = disp.value.trim(); if (!s) return;
      try {
        var r = calc(s);
        if (typeof r !== 'number' || isNaN(r)) throw new Error('That has no real answer.');
        ans = r; hist.unshift([T.expr.closeParens(s), fmt(r)]); hist = hist.slice(0, 30); save();
        disp.value = fmt(r).replace('−', '-').replace('∞', 'Infinity' === '' ? '' : '∞'); prev.textContent = ''; justDone = true; drawHist();
      } catch (e) { prev.textContent = e.message; }
    }
    function lastNumber(fnc) {
      var m = disp.value.match(/(\(-)?(\d*\.?\d+(?:e[+-]?\d+)?)\)?$/);
      if (!m) return;
      disp.value = disp.value.slice(0, m.index) + fnc(m); preview();
    }
    function press(k) {
      var lab = Array.isArray(k) ? k[0] : k, ins = Array.isArray(k) ? k[1] : null;
      if (lab === '=') return equals();
      if (lab === 'AC') { disp.value = ''; prev.textContent = ''; justDone = false; return; }
      if (lab === '⌫') { disp.value = disp.value.slice(0, -1); justDone = false; return preview(); }
      if (lab === '±') return lastNumber(function (m) { return m[1] ? m[2] : '(-' + m[2] + ')'; });
      if (lab === 'MC') { mem = 0; save(); return preview(); }
      if (lab === 'MR') return insert(fmt(mem));
      if (lab === 'M+' || lab === 'M−') { try { var v = disp.value.trim() ? calc(disp.value) : ans; mem += lab === 'M+' ? v : -v; save(); preview(); } catch (e) { prev.textContent = e.message; } return; }
      if (lab === 'DEG' || lab === 'RAD') { deg = !deg; save(); degBtn.textContent = deg ? 'DEG' : 'RAD'; return preview(); }
      if (/^[÷×−+^%!]$/.test(lab) || ins && /^[\^!%)]/.test(ins)) justDone = false;
      insert(ins !== null ? ins : lab);
    }
    var basicRows = [['MC', 'MR', 'M+', 'M−'], ['AC', '⌫', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['±', '0', '.', '=']];
    var sciRows = [['DEG', ['(', '('], [')', ')'], ['Ans', 'ans', 'Last answer'], ['π', 'π', 'pi']],
      [['sin', 'sin('], ['cos', 'cos('], ['tan', 'tan('], ['ln', 'ln(', 'natural log'], ['log', 'log(', 'log base 10']],
      [['sin⁻¹', 'asin(', 'inverse sine'], ['cos⁻¹', 'acos(', 'inverse cosine'], ['tan⁻¹', 'atan(', 'inverse tangent'], ['eˣ', 'e^(', 'e to the power'], ['10ˣ', '10^(', '10 to the power']],
      [['x²', '^2', 'squared'], ['xʸ', '^', 'to the power'], ['√', '√(', 'square root'], ['∛', 'cbrt(', 'cube root'], ['1/x', '^(-1)', 'reciprocal']],
      [['n!', '!', 'factorial'], ['|x|', 'abs(', 'absolute value'], ['e', 'e', 'Euler’s number'], ['nCr', 'nCr(', 'combinations'], ['EE', '×10^', 'times ten to the power']]];
    var keys = h('div', { 'class': 'tx-pad' + (sci ? ' is-sci' : '') }, [sci ? keypad(sciRows, press) : null, keypad(basicRows, press)]);
    var degBtn = keys.querySelector('[data-key="DEG"]');
    if (degBtn) degBtn.textContent = deg ? 'DEG' : 'RAD';
    disp.addEventListener('input', function () { justDone = false; preview(); });
    disp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
      else if (e.key === 'Escape') { e.preventDefault(); press('AC'); }
      else if (justDone && e.key.length === 1 && /[\d.(a-z]/i.test(e.key)) { disp.value = ''; justDone = false; }
      else justDone = false;
    });
    // typing anywhere on the calculator goes to the display
    var card = T.card([h('div', { 'class': 'tx-screen' }, [memEl, disp, prev]), keys,
      h('details', { 'class': 'tx-help' }, [h('summary', { text: 'History and help' }), list,
        h('p', { 'class': 'tnote', text: sci ? 'Type with your keyboard too: sin(30), 2^10, 5!, sqrt(2), log(8, 2) for log base 2, nCr(10,3), 15% of 200 as 200*15%. Press Enter for the answer. Brackets you forget are closed for you.'
          : 'Type with your keyboard too. 200 + 10% gives 220 (adds 10% of 200); 50 × 10% gives 5. M+ adds the screen to memory. Press Enter for the answer, Esc to clear.' }),
        T.button('Clear history', { small: true, onclick: function () { hist = []; save(); drawHist(); } })])]);
    card.addEventListener('keydown', function (e) {
      if (e.target === disp || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1 && /[\d.+\-*/^()%!a-z]/i.test(e.key)) { e.preventDefault(); insert(e.key); }
      else if (e.key === 'Enter') { e.preventDefault(); equals(); }
      else if (e.key === 'Backspace') { e.preventDefault(); press('⌫'); }
      else if (e.key === 'Escape') press('AC');
    });
    spot.appendChild(card);
    drawHist(); preview();
    T.tests[id] = function () {
      var fails = [], keepDeg = deg, keepHist = hist.slice(), keepAns = ans, keepMem = mem;
      function check(expr, want, d) {
        deg = d !== false;
        try { var got = fmt(calc(expr)); if (got !== want) fails.push(expr + ' → ' + got + ', want ' + want); } catch (e) { fails.push(expr + ' threw ' + e.message); }
      }
      // pressing keys
      press('AC'); ['1', '2', '+', '3', '×', '2', '='].forEach(press);
      if (disp.value !== '18') fails.push('keys 12+3×2 gave ' + disp.value);
      press('AC'); ['2', '0', '0', '+', '1', '0', '%', '='].forEach(press);
      if (disp.value !== '220') fails.push('200+10% gave ' + disp.value);
      press('AC'); ['5', '±'].forEach(press); if (disp.value !== '(-5)') fails.push('± gave ' + disp.value);
      press('AC'); ['7', '÷', '0', '='].forEach(press); if (disp.value !== '∞' && prev.textContent === '') fails.push('7÷0 not handled');
      check('0.1+0.2', '0.3'); check('2+3*4', '14'); check('50*10%', '5'); check('(1+2', '3'); check('-2^2', '-4'); check('2^-1', '0.5'); check('1e21*10', '1e22');
      if (sci) {
        check('sin(30)', '0.5'); check('cos(60)', '0.5'); check('tan(45)', '1'); check('asin(1)', '90'); check('sin(pi/2)', '1', false);
        check('5!', '120'); check('ln(e)', '1'); check('log(1000)', '3'); check('log(8,2)', '3'); check('sqrt(16)+cbrt(27)', '7'); check('2pi', '6.28318530718');
        check('nCr(5,2)', '10'); check('3!^2', '36'); check('|-3|+abs(-4)', '7'); check('cbrt(-8)', '-2'); check('(-8)^(1/3)', '-2'); check('0.5!', '0.886226925453');
        press('AC'); ['√', '9', ')', '='].forEach(function (k) { press(k === '√' ? ['√', '√('] : k); }); if (disp.value !== '3') fails.push('√9 key gave ' + disp.value);
      }
      deg = keepDeg; hist = keepHist; ans = keepAns; mem = keepMem; save(); drawHist(); press('AC');
      return Promise.resolve({ ok: !fails.length, n: sci ? 28 : 11, fails: fails });
    };
  }

  /* ---------------- graph plotter ---------------- */
  var COLORS = ['#8B7CFF', '#F472B6', '#22D3EE', '#FBBF24', '#4ADE80', '#FB923C'];
  function graph(spot, T, id) {
    var store = 'expr-' + id, saved = T.store.get(store, {});
    var fns = saved.fns || ['x^2 - 4', 'sin(x)'], view = { cx: 0, cy: 0, sx: 20 };   // sx: width of the view in x units
    var canvas = h('canvas', { 'class': 'tx-canvas', role: 'img', 'aria-label': 'Graph' }), read = h('p', { 'class': 'tx-read', 'aria-live': 'polite' });
    var rows = h('div', { 'class': 'tx-fns' }), facts = h('div', { 'class': 'tx-facts' }), status = T.status(), compiled = [], last = { pts: 0 };
    function save() { T.store.set(store, { fns: fns }); }
    function drawRows() {
      rows.innerHTML = '';
      fns.forEach(function (f, n) {
        var inp = h('input', { type: 'text', value: f, spellcheck: 'false', autocomplete: 'off', placeholder: 'e.g. x^2, sin(x), 2x+1', 'aria-label': 'Function ' + (n + 1) });
        inp.addEventListener('input', function () { fns[n] = inp.value; save(); build(); });
        rows.appendChild(h('div', { 'class': 'tx-fn' }, [h('i', { style: 'background:' + COLORS[n % COLORS.length] }), h('b', { text: 'y =' }), inp,
          h('button', { type: 'button', 'class': 'tx-x', 'aria-label': 'Remove', text: '✕', onclick: function () { fns.splice(n, 1); save(); drawRows(); build(); } })]));
      });
    }
    function build() {
      var errs = [];
      compiled = fns.map(function (f, n) {
        if (!f.trim()) return null;
        try { var c = compile(parse(closeParens(f), { vars: ['x'] })); c({ x: 1 }); return c; } catch (e) { errs.push('Line ' + (n + 1) + ': ' + e.message); return null; }
      });
      if (errs.length) status.error(errs.join(' ')); else status.clear();
      draw();
    }
    function cssv(n, d) { var v = getComputedStyle(canvas).getPropertyValue(n).trim(); return v || d; }
    function step(range) { var raw = range / 8, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
    function draw() {
      var W = canvas.clientWidth || 600, H = Math.round(Math.min(460, Math.max(260, W * 0.7))), dpr = window.devicePixelRatio || 1;
      canvas.style.height = H + 'px'; canvas.width = W * dpr; canvas.height = H * dpr;
      var g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var sx = view.sx, sy = sx * H / W, x0 = view.cx - sx / 2, y1 = view.cy + sy / 2;
      var X = function (x) { return (x - x0) / sx * W; }, Y = function (y) { return (y1 - y) / sy * H; };
      g.fillStyle = cssv('--bg', '#05060F'); g.fillRect(0, 0, W, H);
      var st = step(sx), ink = cssv('--muted', '#8A90B8'), line = cssv('--line', 'rgba(255,255,255,.1)');
      g.lineWidth = 1; g.strokeStyle = line; g.beginPath();
      for (var gx = Math.ceil(x0 / st) * st; gx <= x0 + sx; gx += st) { g.moveTo(Math.round(X(gx)) + 0.5, 0); g.lineTo(Math.round(X(gx)) + 0.5, H); }
      for (var gy = Math.ceil((y1 - sy) / st) * st; gy <= y1; gy += st) { g.moveTo(0, Math.round(Y(gy)) + 0.5); g.lineTo(W, Math.round(Y(gy)) + 0.5); }
      g.stroke();
      g.strokeStyle = ink; g.globalAlpha = 0.8; g.beginPath(); g.moveTo(0, Y(0)); g.lineTo(W, Y(0)); g.moveTo(X(0), 0); g.lineTo(X(0), H); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = ink; g.font = '11px system-ui, sans-serif';
      var ax = Math.min(Math.max(Y(0) + 13, 13), H - 4), ay = Math.min(Math.max(X(0) + 4, 4), W - 40);
      for (gx = Math.ceil(x0 / st) * st; gx <= x0 + sx; gx += st) if (Math.abs(gx) > st / 2) g.fillText(fmt(+gx.toPrecision(10)), X(gx) + 3, ax);
      for (gy = Math.ceil((y1 - sy) / st) * st; gy <= y1; gy += st) if (Math.abs(gy) > st / 2) g.fillText(fmt(+gy.toPrecision(10)), ay, Y(gy) - 3);
      last.pts = 0;
      compiled.forEach(function (f, n) {
        if (!f) return;
        g.strokeStyle = COLORS[n % COLORS.length]; g.lineWidth = 2.4; g.beginPath();
        var pen = false, py = 0;
        for (var px = 0; px <= W; px += 0.5) {
          var y; try { y = f({ x: x0 + px / W * sx }); } catch (e) { y = NaN; }
          var qy = Y(y);
          if (!isFinite(qy) || Math.abs(qy) > H * 50) { pen = false; continue; }
          if (pen && Math.abs(qy - py) > H) pen = false;   // jump across an asymptote
          if (pen) g.lineTo(px, qy); else g.moveTo(px, qy);
          pen = true; py = qy; last.pts++;
        }
        g.stroke();
      });
      findFacts(x0, x0 + sx);
    }
    function findFacts(lo, hi) {
      facts.innerHTML = '';
      compiled.forEach(function (f, n) {
        if (!f) return;
        var safe = function (x) { try { return f({ x: x }); } catch (e) { return NaN; } };
        var r = roots(safe, lo, hi, 4000), y0 = safe(0);
        facts.appendChild(h('p', {}, [h('i', { style: 'background:' + COLORS[n % COLORS.length] }), h('b', { text: 'y = ' + fns[n] }),
          h('span', { text: (r.length ? ' crosses zero at x = ' + r.slice(0, 8).map(function (x) { return fmt(+x.toPrecision(8)); }).join(', ') + (r.length > 8 ? ' …' : '') : ' does not cross zero in view') +
            (isFinite(y0) ? '; meets the y-axis at y = ' + fmt(+y0.toPrecision(8)) : '') })]));
      });
    }
    // pan with a finger or the mouse, zoom with the wheel or two fingers
    var ptrs = {}, startDist = 0;
    canvas.addEventListener('pointerdown', function (e) { canvas.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.clientX, e.clientY]; var k = Object.keys(ptrs); if (k.length === 2) startDist = dist(); });
    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect(), W = r.width, H = r.height, sy = view.sx * H / W;
      if (!ptrs[e.pointerId]) {
        var x = view.cx - view.sx / 2 + (e.clientX - r.left) / W * view.sx, y = view.cy + sy / 2 - (e.clientY - r.top) / H * sy;
        read.textContent = 'x = ' + fmt(+x.toPrecision(5)) + compiled.map(function (f, n) { if (!f) return ''; var v; try { v = f({ x: x }); } catch (er) { v = NaN; } return ',  y' + (n + 1) + ' = ' + fmt(+(+v).toPrecision(6)); }).join('');
        return;
      }
      var old = ptrs[e.pointerId]; ptrs[e.pointerId] = [e.clientX, e.clientY];
      var keys = Object.keys(ptrs);
      if (keys.length === 1) { view.cx -= (e.clientX - old[0]) / W * view.sx; view.cy += (e.clientY - old[1]) / H * sy; draw(); }
      else if (keys.length === 2 && startDist) { var dd = dist(); if (dd > 0) { view.sx *= startDist / dd; startDist = dd; draw(); } }
    });
    function dist() { var p = Object.keys(ptrs).map(function (k) { return ptrs[k]; }); return Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); }
    ['pointerup', 'pointercancel'].forEach(function (ev) { canvas.addEventListener(ev, function (e) { delete ptrs[e.pointerId]; startDist = 0; }); });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = canvas.getBoundingClientRect(), k = e.deltaY > 0 ? 1.15 : 1 / 1.15, sy = view.sx * r.height / r.width;
      var mx = view.cx - view.sx / 2 + (e.clientX - r.left) / r.width * view.sx, my = view.cy + sy / 2 - (e.clientY - r.top) / r.height * sy;
      view.cx = mx + (view.cx - mx) * k; view.cy = my + (view.cy - my) * k; view.sx *= k; draw();
    }, { passive: false });
    function zoom(k) { view.sx *= k; draw(); }
    var png = T.button('Download PNG', { small: true, onclick: function () { canvas.toBlob(function (b) { T.download(b, 'graph.png'); }); } });
    spot.appendChild(T.card([rows,
      T.row([T.button('+ Add function', { small: true, onclick: function () { if (fns.length < 6) { fns.push(''); save(); drawRows(); rows.lastChild.querySelector('input').focus(); } } }),
        T.button('Zoom in', { small: true, onclick: function () { zoom(1 / 1.5); } }), T.button('Zoom out', { small: true, onclick: function () { zoom(1.5); } }),
        T.button('Reset view', { small: true, onclick: function () { view = { cx: 0, cy: 0, sx: 20 }; draw(); } }), png]),
      status.el, canvas, read, facts,
      h('p', { 'class': 'tnote', text: 'Drag to move, scroll or pinch to zoom. Write 2x for 2×x, x^2 for x², sqrt(x), sin(x) (radians), abs(x), ln(x), e^x. Up to 6 functions.' })]));
    drawRows(); build();
    addEventListener('resize', function () { draw(); });
    T.tests[id] = function () {
      var keep = fns.slice(), fails = [];
      fns = ['x^2 - 4', '1/x']; build();
      var txt = facts.textContent;
      if (txt.indexOf('x = -2, 2') < 0) fails.push('roots of x²-4: ' + txt);
      if (txt.indexOf('y = 1/x does not cross zero') < 0) fails.push('1/x has a false root: ' + txt);
      if (last.pts < 500) fails.push('only ' + last.pts + ' points drawn');
      fns = ['2x+'];  build(); if (!/missing/i.test(status.el.textContent)) fails.push('no error for 2x+');
      fns = keep; save(); drawRows(); build();
      return Promise.resolve({ ok: !fails.length, n: 4, fails: fails });
    };
  }

  /* ---------------- derivative and integral ---------------- */
  function derivative(spot, T, id) {
    var saved = T.store.get('expr-' + id, {});
    var f = h('input', { type: 'text', value: saved.f || 'x^3 + 2x^2 - sin(x)', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Function of x' });
    var order = T.seg([['1', 'f′(x)'], ['2', 'f″(x)'], ['3', 'f‴(x)']], saved.o || '1', run);
    var at = h('input', { type: 'number', step: 'any', value: saved.at !== undefined ? saved.at : 1 }), a = h('input', { type: 'number', step: 'any', value: saved.a !== undefined ? saved.a : 0 }),
      b = h('input', { type: 'number', step: 'any', value: saved.b !== undefined ? saved.b : 2 });
    var out = h('div', { 'class': 'tx-out' }), status = T.status(), lastOut = {};
    [f, at, a, b].forEach(function (el) { el.addEventListener('input', run); });
    function run() {
      out.innerHTML = ''; status.clear(); lastOut = {};
      T.store.set('expr-' + id, { f: f.value, o: order.value(), at: at.value, a: a.value, b: b.value });
      try {
        var tree = parse(closeParens(f.value), { vars: ['x'] }), F = compile(tree), n = +order.value(), dn = tree;
        for (var k = 0; k < n; k++) dn = T.expr.derivative(dn, 'x');
        var D = compile(dn), mark = ['′', '″', '‴'][n - 1];
        lastOut.d = show(dn); lastOut.D = D; lastOut.F = F;
        out.appendChild(result('f' + mark + '(x) =', show(dn), true));
        if (at.value !== '') {
          var x0 = +at.value, y0 = F({ x: x0 }), m = D({ x: x0 });
          lastOut.m = m;
          out.appendChild(result('f' + mark + '(' + fmt(x0) + ') =', fmt(m)));
          if (n === 1 && isFinite(y0) && isFinite(m)) {
            var c = y0 - m * x0;
            out.appendChild(result('Tangent line at x = ' + fmt(x0), 'y = ' + fmt(+m.toPrecision(10)) + 'x ' + (c < 0 ? '− ' : '+ ') + fmt(+Math.abs(c).toPrecision(10)), true));
          }
        }
        if (a.value !== '' && b.value !== '') {
          var I = T.expr.integrate(function (x) { return F({ x: x }); }, +a.value, +b.value);
          lastOut.I = I;
          out.appendChild(result('∫ f(x) dx from ' + fmt(+a.value) + ' to ' + fmt(+b.value) + ' =', isFinite(I) ? fmt(+I.toPrecision(10)) : 'does not converge (the function blows up in this range)'));
        }
      } catch (e) { status.error(e); }
    }
    spot.appendChild(T.card([T.field('f(x) =', f, 'e.g. x^3, sin(x)^2, e^(2x), ln(x)/x, sqrt(1+x^2)'), T.field('Which derivative', order),
      h('div', { 'class': 'tgrid2' }, [T.field('Value at x =', at), h('div', { 'class': 'tgrid2' }, [T.field('Integrate from', a), T.field('to', b)])]),
      status.el, out,
      h('p', { 'class': 'tnote', text: 'Exact derivatives by the usual rules (power, product, quotient, chain), simplified. The definite integral is worked out numerically (adaptive Simpson’s rule) to about 10 digits. Angles are in radians.' })]));
    run();
    T.tests[id] = function () {
      var fails = [], keep = [f.value, at.value, a.value, b.value];
      function chk(src, wantD, x0, wantM, A, B, wantI) {
        f.value = src; at.value = x0; a.value = A; b.value = B; run();
        if (wantD && lastOut.d !== wantD) fails.push('d/dx ' + src + ' = ' + lastOut.d + ', want ' + wantD);
        if (wantM !== null && Math.abs(lastOut.m - wantM) > 1e-9 * (1 + Math.abs(wantM))) fails.push(src + "' at " + x0 + ' = ' + lastOut.m);
        if (wantI !== null && Math.abs(lastOut.I - wantI) > 1e-8) fails.push('∫' + src + ' = ' + lastOut.I + ', want ' + wantI);
        // the exact derivative must agree with a numerical one
        [0.3, 1.7, 2.9].forEach(function (x) { var hh = 1e-5, num = (lastOut.F({ x: x + hh }) - lastOut.F({ x: x - hh })) / (2 * hh), ex = lastOut.D({ x: x }); if (isFinite(num) && Math.abs(num - ex) > 1e-4 * (1 + Math.abs(ex))) fails.push(src + ' at ' + x + ': ' + ex + ' vs ' + num); });
      }
      var keepO = order.value();
      if (keepO !== '1') order.querySelector('button').click();
      chk('x^3', '3x^2', 2, 12, 0, 1, 0.25);
      chk('sin(x)', 'cos(x)', 0, 1, 0, Math.PI, 2);
      chk('x*sin(x)', null, 1, Math.sin(1) + Math.cos(1), 0, 1, Math.sin(1) - Math.cos(1));
      chk('e^(2x)', null, 0, 2, 0, 1, (Math.exp(2) - 1) / 2);
      chk('ln(x)/x', null, 1, 1, 1, Math.E, 0.5);
      chk('sqrt(1+x^2)', null, 1, 1 / Math.sqrt(2), 0, 1, 1.1477935746353);
      chk('x^x', null, 1, 1, 1, 2, 2.0504462345347);
      chk('5', '0', 3, 0, 0, 2, 10);
      f.value = keep[0]; at.value = keep[1]; a.value = keep[2]; b.value = keep[3]; run();
      return Promise.resolve({ ok: !fails.length, n: 8, fails: fails });
    };
  }

  /* ---------------- equation solver ---------------- */
  function equation(spot, T, id) {
    var saved = T.store.get('expr-' + id, {});
    var mode = T.seg([['one', 'One equation'], ['sys', 'System of linear equations']], saved.m || 'one', function () { show2(); run(); });
    var eq = h('input', { type: 'text', value: saved.eq || 'x^3 - 6x^2 + 11x = 6', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Equation' });
    var lo = h('input', { type: 'number', step: 'any', value: saved.lo || -100 }), hi = h('input', { type: 'number', step: 'any', value: saved.hi || 100 });
    var sys = h('textarea', { rows: '3', spellcheck: 'false', 'aria-label': 'Equations, one per line' }); sys.value = saved.sys || '2x + 3y = 8\nx - y = -1';
    var one = h('div', { 'class': 'tx-one' }, [T.field('Equation in x', eq, 'e.g. 2x + 3 = 7, x^2 = 2, cos(x) = x, e^x = 5'), h('div', { 'class': 'tgrid2' }, [T.field('Look for answers from', lo), T.field('to', hi)])]);
    var many = h('div', {}, [T.field('Equations, one per line', sys, 'Use x, y, z (and w). Up to 4 unknowns.')]);
    var out = h('div', { 'class': 'tx-out' }), status = T.status(), lastOut = {};
    [eq, lo, hi, sys].forEach(function (el) { el.addEventListener('input', run); });
    function show2() { one.hidden = mode.value() !== 'one'; many.hidden = mode.value() === 'one'; }
    function sides(s, vars) {
      var p = s.split('=');
      if (p.length > 2) throw new Error('Use one = sign in each equation.');
      var L = compile(parse(closeParens(p[0]), { vars: vars })), R = p.length === 2 && p[1].trim() ? compile(parse(closeParens(p[1]), { vars: vars })) : function () { return 0; };
      return function (sc) { return L(sc) - R(sc); };
    }
    function run() {
      out.innerHTML = ''; status.clear(); lastOut = {};
      T.store.set('expr-' + id, { m: mode.value(), eq: eq.value, lo: lo.value, hi: hi.value, sys: sys.value });
      try { if (mode.value() === 'one') single(); else system(); } catch (e) { status.error(e); }
    }
    function single() {
      var g = sides(eq.value, ['x']), f = function (x) { try { return g({ x: x }); } catch (e) { return NaN; } };
      var a = +lo.value, b = +hi.value;
      if (!(b > a)) throw new Error('The “to” value must be bigger than the “from” value.');
      var r = roots(f, a, b, 40000);
      lastOut.r = r;
      if (!r.length) { out.appendChild(result('Answer', 'No real answer between ' + fmt(a) + ' and ' + fmt(b))); return; }
      out.appendChild(result(r.length === 1 ? 'x =' : r.length + ' answers: x =', r.slice(0, 20).map(function (x) { return fmt(+x.toPrecision(12)); }).join(',  '), true));
      out.appendChild(h('p', { 'class': 'tnote', text: 'Check: putting each answer back in leaves a difference of at most ' + fmt(+Math.max.apply(null, r.map(function (x) { return Math.abs(f(x)); })).toPrecision(2)) + '. Answers are found numerically between your limits; widen them to search further.' }));
    }
    function system() {
      var lines = sys.value.split(/\n|;/).map(function (s) { return s.trim(); }).filter(Boolean);
      var V = ['x', 'y', 'z', 'w'], used = V.filter(function (v) { return lines.some(function (l) { return new RegExp('(^|[^a-z])' + v + '([^a-z]|$)').test(l.replace(/[a-z]{2,}\(/g, '(')); }); });
      if (!lines.length) throw new Error('Type the equations, one per line.');
      if (lines.length !== used.length) throw new Error(used.length + ' unknown' + (used.length === 1 ? '' : 's') + ' (' + used.join(', ') + ') need ' + used.length + ' equation' + (used.length === 1 ? '' : 's') + '; you have ' + lines.length + '.');
      var n = used.length, A = [], zero = {};
      used.forEach(function (v) { zero[v] = 0; });
      lines.forEach(function (l, k) {
        var g = sides(l, used), c0 = g(zero), row = used.map(function (v) { var s = Object.assign({}, zero); s[v] = 1; return g(s) - c0; });
        var test = {}; used.forEach(function (v, j) { test[v] = 1.37 + j * 0.71; });
        var lin = c0 + row.reduce(function (acc, c, j) { return acc + c * test[used[j]]; }, 0);
        if (Math.abs(g(test) - lin) > 1e-9 * (1 + Math.abs(lin))) throw new Error('Line ' + (k + 1) + ' is not linear (no x², xy, sin x…). Use “One equation” for that.');
        A.push(row.concat([-c0]));
      });
      for (var c = 0; c < n; c++) {   // Gaussian elimination with partial pivoting
        var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
        if (Math.abs(A[p][c]) < 1e-12) throw new Error('These equations have no single answer (no solution, or infinitely many).');
        var t = A[c]; A[c] = A[p]; A[p] = t;
        for (r = 0; r < n; r++) if (r !== c) { var q = A[r][c] / A[c][c]; for (var j = c; j <= n; j++) A[r][j] -= q * A[c][j]; }
      }
      lastOut.s = {};
      used.forEach(function (v, k) { var x = A[k][n] / A[k][k]; if (Math.abs(x - Math.round(x)) < 1e-10) x = Math.round(x); lastOut.s[v] = x; out.appendChild(result(v + ' =', fmt(+x.toPrecision(12)), true)); });
    }
    spot.appendChild(T.card([mode, one, many, status.el, out]));
    show2(); run();
    T.tests[id] = function () {
      var fails = [], keep = [mode.value(), eq.value, sys.value, lo.value, hi.value];
      function setMode(m) { if (mode.value() !== m) Array.prototype.forEach.call(mode.querySelectorAll('button'), function (b) { if ((m === 'one') === (b.textContent === 'One equation')) b.click(); }); }
      function one1(src, want) { setMode('one'); eq.value = src; lo.value = -100; hi.value = 100; run(); var got = (lastOut.r || []).map(function (x) { return +x.toPrecision(10); }); if (JSON.stringify(got) !== JSON.stringify(want)) fails.push(src + ' → ' + JSON.stringify(got)); }
      one1('x^3 - 6x^2 + 11x = 6', [1, 2, 3]); one1('2x + 3 = 7', [2]); one1('x^2 = 2', [-1.414213562, 1.414213562]); one1('x^2 = 0', [0]); one1('cos(x) = x', [0.7390851332]);
      one1('1/x = 0', []); one1('1/(x-1) = 0', []); setMode('one'); eq.value = 'tan(x) = 0'; run(); if ((lastOut.r || []).length !== 63) fails.push('tan(x) = 0 should have 63 roots in ±100, got ' + (lastOut.r || []).length);
      setMode('sys'); sys.value = '2x + 3y = 8\nx - y = -1'; run(); if (!lastOut.s || lastOut.s.x !== 1 || lastOut.s.y !== 2) fails.push('2×2 system: ' + JSON.stringify(lastOut.s));
      sys.value = 'x + y + z = 6\n2y + 5z = -4\n2x + 5y - z = 27'; run(); if (!lastOut.s || lastOut.s.x !== 5 || lastOut.s.y !== 3 || lastOut.s.z !== -2) fails.push('3×3 system: ' + JSON.stringify(lastOut.s));
      sys.value = 'x + y = 2\n2x + 2y = 4'; run(); if (!/no single answer/.test(status.el.textContent)) fails.push('singular system not reported');
      setMode(keep[0]); eq.value = keep[1]; sys.value = keep[2]; lo.value = keep[3]; hi.value = keep[4]; run();
      return Promise.resolve({ ok: !fails.length, n: 10, fails: fails });
    };
  }
  var KINDS = { basic: function (s, T, id) { calculator(s, T, id, false); }, scientific: function (s, T, id) { calculator(s, T, id, true); }, graph: graph, derivative: derivative, equation: equation };
})();
