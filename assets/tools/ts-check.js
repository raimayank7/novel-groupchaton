/* Infinity by GroupChatOn — ts-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* TypeScript checker: the real TypeScript compiler (loaded on first use) type-checks your code against the standard and browser types, and shows the JavaScript it compiles to. */
GCOTools.register('ts-check', function (spot, T) {
  var h = T.h, V = '5.6.3', TSJS = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/' + V + '/typescript.min.js', LIB = 'https://cdn.jsdelivr.net/npm/typescript@' + V + '/lib/';
  var ROOT = 'lib.es2022.full.d.ts', libs = {}, libSF = {}, libsReady = null;
  function fetchLib(name) {
    if (libs[name] !== undefined) return Promise.resolve();
    libs[name] = null;
    return fetch(LIB + name).then(function (r) { if (!r.ok) throw new Error('Could not load the TypeScript type library. Check your connection.'); return r.text(); }).then(function (t) {
      libs[name] = t;
      var refs = [], re = /\/\/\/\s*<reference\s+lib="([^"]+)"/g, m;
      while ((m = re.exec(t))) refs.push('lib.' + m[1].toLowerCase() + '.d.ts');
      return Promise.all(refs.map(fetchLib));
    });
  }
  function load() {
    if (!libsReady) libsReady = Promise.all([T.loadScript(TSJS), fetchLib(ROOT)]).catch(function (e) { libsReady = null; libs = {}; throw e; });
    return libsReady.then(function () { return window.ts; });
  }
  function compile(code, o) {
    return load().then(function (ts) {
      var file = '/main.ts', base = function (p) { return p.split('/').pop(); };
      var opts = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, strict: !!o.strict, noEmit: true, skipLibCheck: true,
        noUnusedLocals: !!o.unused, noUnusedParameters: !!o.unused, noImplicitReturns: !!o.strict, noFallthroughCasesInSwitch: true, allowUnreachableCode: false };
      var host = {
        getSourceFile: function (name, target) {
          if (name === file) return ts.createSourceFile(name, code, target, true);
          var b = base(name);
          if (typeof libs[b] === 'string') return libSF[b] || (libSF[b] = ts.createSourceFile(name, libs[b], target, true));
        },
        getDefaultLibFileName: function () { return '/' + ROOT; }, writeFile: function () {}, getCurrentDirectory: function () { return '/'; }, getDirectories: function () { return []; },
        fileExists: function (name) { return name === file || typeof libs[base(name)] === 'string'; }, readFile: function (name) { return name === file ? code : libs[base(name)]; },
        getCanonicalFileName: function (f) { return f; }, useCaseSensitiveFileNames: function () { return true; }, getNewLine: function () { return '\n'; }
      };
      var prog = ts.createProgram([file], opts, host), sf = prog.getSourceFile(file);
      return ts.getPreEmitDiagnostics(prog).filter(function (d) { return !d.file || d.file.fileName === file; }).map(function (d) {
        var pos = d.file && d.start != null ? sf.getLineAndCharacterOfPosition(d.start) : null;
        var missingPkg = d.code === 2307 || d.code === 2792;
        return { sev: missingPkg ? 'warn' : d.category === ts.DiagnosticCategory.Error ? 'error' : 'warn', line: pos ? pos.line + 1 : 0, col: pos ? pos.character + 1 : 0,
          msg: 'TS' + d.code + ': ' + ts.flattenDiagnosticMessageText(d.messageText, ' ') + (missingPkg ? ' (packages from npm are not available here, so their types are unknown)' : '') };
      });
    });
  }
  var js = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, spellcheck: 'false', 'aria-label': 'Compiled JavaScript' });
  var jsBox = h('div', { hidden: true }, [T.field('Compiled JavaScript', js), T.row([T.button('Copy JavaScript', { onclick: function (e) { T.copy(js.value, e.currentTarget); } })])]);
  function checkUI(o) {
    var status = T.status(), list = h('div', { 'class': 'tkv', 'data-out': '' }), timer, seq = 0;
    var input = h('textarea', { rows: '12', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': o.label, placeholder: o.ph || 'Paste your code here…' });
    input.value = T.store.get(o.id + '-in', '');
    function opts() { var r = {}; (o.options || []).forEach(function (el) { [el].concat([].slice.call(el.querySelectorAll('[data-opt]'))).forEach(function (x) { var k = x.getAttribute('data-opt'); if (k) r[k] = x.type === 'checkbox' ? x.checked : typeof x.value === 'function' ? x.value() : x.value; }); }); return r; }
    function show(line) {
      var L = input.value.split('\n'), p = 0;
      for (var k = 0; k < line - 1 && k < L.length; k++) p += L[k].length + 1;
      input.focus(); input.setSelectionRange(p, p + (L[line - 1] || '').length);
      input.scrollTop = Math.max(0, (line - 3) * (parseFloat(getComputedStyle(input).lineHeight) || 22));
    }
    function run() {
      T.store.set(o.id + '-in', input.value.slice(0, 200000));
      var tok = ++seq;
      if (!input.value.trim()) { list.innerHTML = ''; status.clear(); jsBox.hidden = true; return; }
      status.info(o.loading());
      Promise.resolve().then(function () { return o.check(input.value, opts()); }).then(function (r) { if (tok === seq) draw(r); }, function (e) { if (tok === seq) { list.innerHTML = ''; status.error(e); } });
    }
    function draw(issues) {
      list.innerHTML = '';
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0) || (a.col || 0) - (b.col || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok);
      else status.info((e ? e + (e > 1 ? ' errors' : ' error') : 'No errors') + (w ? ', ' + w + (w > 1 ? ' warnings' : ' warning') : '') + '. Tap Show to jump to the line.');
      issues.slice(0, 300).forEach(function (x) {
        list.appendChild(h('div', {}, [h('span', { 'class': x.sev === 'error' ? 'tout-c' : '', style: 'font-weight:700', text: (x.sev === 'error' ? '✕ ' : '! ') + (x.line ? 'Line ' + x.line + (x.col ? ':' + x.col : '') : 'Whole file') }),
          h('span', { text: x.msg }), x.line ? T.button('Show', { small: true, onclick: function () { show(x.line); } }) : h('span')]));
      });
      if (o.after) o.after(input.value, opts());
    }
    spot.appendChild(T.card([T.field(o.label, input), h('div', { 'class': 'topts' }, o.options),
      T.row([T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; run(); } }), T.button('Clear', { small: true, onclick: function () { input.value = ''; run(); input.focus(); } })]),
      status.el, list].concat(o.extra || [])));
    spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 600); });
    o.options.forEach(function (el) { el.addEventListener('change', run); });
    run();
  }
  checkUI({ id: 'ts-check', label: 'TypeScript to check', check: compile, ok: '✓ No type errors.', extra: [jsBox],
    loading: function () { return window.ts ? 'Type-checking…' : 'Loading the TypeScript compiler (about 3 MB, only the first time)…'; },
    options: [T.opt.check('strict', 'Strict mode (recommended)', true), T.opt.check('unused', 'Report unused variables', false), T.opt.check('js', 'Show the compiled JavaScript', false)],
    after: function (code, o) {
      jsBox.hidden = !o.js;
      if (o.js) js.value = window.ts.transpileModule(code, { compilerOptions: { target: window.ts.ScriptTarget.ES2020, module: window.ts.ModuleKind.ESNext } }).outputText;
    },
    sample: 'interface Product {\n  name: string;\n  price: number;\n  tags?: string[];\n}\n\nfunction total(items: Product[]): number {\n  return items.reduce((sum, p) => sum + p.price, 0);\n}\n\nconst cart: Product[] = [\n  { name: "Pen", price: "10" },\n  { name: "Book", price: 250, colour: "red" },\n];\n\nlet count: number = total(cart).toFixed(2);\nconst firstName: number = cart[0].name;\n' });
  T.tests['ts-check'] = function () {
    var f = [], n = 0;
    function c(code, want, o) { n++; return compile(code, o || { strict: true }).then(function (r) { var ok = want ? r.some(function (x) { return x.msg.indexOf(want) >= 0; }) : !r.length; if (!ok) f.push(code.slice(0, 40) + ' → ' + (r.map(function (x) { return x.msg; }).join(' | ') || 'no errors')); }); }
    return c('let a: number = "x";', 'TS2322').then(function () { return c('function f(x) { return x; }', 'TS7006'); })
      .then(function () { return c('const s = [1, 2].map(n => n * 2).join(", ").toUpperCase(); document.title = s;'); })
      .then(function () { return c('let o = { a: 1 }; o.b = 2;', 'TS2339'); }).then(function () { return c('let x: string = 5', 'TS2322', { strict: false }); })
      .then(function () { return { ok: !f.length, n: n, fails: f }; });
  };
});
