/* Infinity by GroupChatOn — js-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* JavaScript checker: the real ESLint linter (loaded when you first check) finds syntax errors, undefined names, unused variables and risky code. */
GCOTools.register('js-check', function (spot, T) {
  var ESLINT = 'https://cdn.jsdelivr.net/npm/eslint-linter-browserify@9.14.0/linter.min.js';
  var BUGS = ['constructor-super', 'for-direction', 'getter-return', 'no-async-promise-executor', 'no-class-assign', 'no-compare-neg-zero', 'no-cond-assign', 'no-const-assign',
    'no-constant-binary-expression', 'no-debugger', 'no-dupe-args', 'no-dupe-class-members', 'no-dupe-else-if', 'no-dupe-keys', 'no-duplicate-case', 'no-empty-character-class', 'no-ex-assign',
    'no-func-assign', 'no-global-assign', 'no-import-assign', 'no-invalid-regexp', 'no-loss-of-precision', 'no-misleading-character-class', 'no-new-native-nonconstructor', 'no-obj-calls',
    'no-redeclare', 'no-self-assign', 'no-setter-return', 'no-sparse-arrays', 'no-this-before-super', 'no-undef', 'no-unexpected-multiline', 'no-unreachable', 'no-unsafe-finally',
    'no-unsafe-negation', 'no-unsafe-optional-chaining', 'no-with', 'require-yield', 'use-isnan', 'valid-typeof', 'no-delete-var', 'no-shadow-restricted-names'];
  var RISKS = ['no-unused-vars', 'no-empty', 'no-fallthrough', 'no-constant-condition', 'no-self-compare', 'no-eval', 'no-implied-eval', 'no-extra-boolean-cast', 'no-useless-catch',
    'no-unused-labels', 'no-case-declarations', 'no-empty-pattern', 'no-irregular-whitespace', 'no-unused-expressions', 'no-new-func', 'no-prototype-builtins', 'no-useless-escape'];
  var STYLE = ['eqeqeq', 'no-var', 'prefer-const', 'curly', 'no-console', 'no-alert'];
  var NODE = ['require', 'module', 'exports', 'process', '__dirname', '__filename', 'Buffer', 'global', 'setImmediate', 'clearImmediate'];
  var linter = null;
  function load() {
    return linter ? Promise.resolve(linter) : T.loadScript(ESLINT).then(function () { linter = new window.eslint.Linter({ configType: 'flat' }); return linter; });
  }
  function lint(code, o) {
    return load().then(function (L) {
      var globals = {}, rules = {};
      Object.getOwnPropertyNames(window).forEach(function (k) { if (/^[A-Za-z_$][\w$]*$/.test(k)) globals[k] = 'readonly'; });
      if (o.env === 'node') NODE.forEach(function (k) { globals[k] = 'writable'; });
      BUGS.forEach(function (r) { rules[r] = 'error'; });
      RISKS.forEach(function (r) { rules[r] = 'warn'; });
      if (o.strict) STYLE.forEach(function (r) { rules[r] = 'warn'; });
      var msgs = L.verify(code, [{ languageOptions: { ecmaVersion: 'latest', sourceType: o.env === 'module' ? 'module' : 'script', globals: globals,
        parserOptions: { ecmaFeatures: { globalReturn: o.env === 'node' } } }, rules: rules }]);
      return msgs.map(function (m) { return { sev: m.fatal || m.severity === 2 ? 'error' : 'warn', line: m.line, col: m.column, msg: m.message + (m.ruleId ? ' (' + m.ruleId + ')' : '') }; });
    });
  }
  function checkUI(o) {
    var h = T.h, status = T.status(), list = h('div', { 'class': 'tkv', 'data-out': '' }), timer, seq = 0;
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
      if (!input.value.trim()) { list.innerHTML = ''; status.clear(); return; }
      status.info(o.loading ? o.loading() : 'Checking…');
      Promise.resolve().then(function () { return o.check(input.value, opts()); }).then(function (r) { if (tok === seq) draw(r); }, function (e) { if (tok === seq) { list.innerHTML = ''; status.error(e); } });
    }
    function draw(issues) {
      list.innerHTML = '';
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0) || (a.col || 0) - (b.col || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok || '✓ No problems found.');
      else status.info((e ? e + (e > 1 ? ' errors' : ' error') : 'No errors') + (w ? ', ' + w + (w > 1 ? ' warnings' : ' warning') : '') + '. Tap Show to jump to the line.');
      issues.slice(0, 300).forEach(function (x) {
        list.appendChild(h('div', {}, [h('span', { 'class': x.sev === 'error' ? 'tout-c' : '', style: 'font-weight:700', text: (x.sev === 'error' ? '✕ ' : '! ') + (x.line ? 'Line ' + x.line + (x.col ? ':' + x.col : '') : 'Whole file') }),
          h('span', { text: x.msg }), x.line ? T.button('Show', { small: true, onclick: function () { show(x.line); } }) : h('span')]));
      });
      if (o.after) o.after(issues, input.value, opts());
    }
    spot.appendChild(T.card([T.field(o.label, input), h('div', { 'class': 'topts' }, o.options),
      T.row([T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; run(); } }), T.button('Clear', { small: true, onclick: function () { input.value = ''; run(); input.focus(); } })]),
      status.el, list].concat(o.extra || [])));
    spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 500); });
    o.options.forEach(function (el) { el.addEventListener('change', run); el.addEventListener('click', function (ev) { if (ev.target.tagName === 'BUTTON') setTimeout(run, 0); }); });
    run();
  }
  var env = T.seg([['browser', 'Browser'], ['module', 'ES module'], ['node', 'Node.js']], 'browser');
  env.setAttribute('data-opt', 'env');
  checkUI({ id: 'js-check', label: 'JavaScript to check', check: lint, ok: '✓ ESLint found no problems.',
    loading: function () { return linter ? 'Checking…' : 'Loading ESLint (about 1 MB, only the first time)…'; },
    options: [env, T.opt.check('strict', 'Also check style (===, const, curly braces, console)', false)],
    sample: 'function total(items) {\n  var sum = 0, unused = 1;\n  for (let i = 0; i < items.length; i++) {\n    if (items[i].price = 0) continue;\n    sum += items[i].price\n  }\n  return sum;\n  console.log("done");\n}\nconst rate = 18;\nrate = 12;\nshowTotal(total(cart));\n' });
  T.tests['js-check'] = function () {
    var f = [], n = 0;
    function c(code, rule, o) { n++; return lint(code, o || { env: 'browser' }).then(function (r) { var ok = rule ? r.some(function (x) { return x.msg.indexOf(rule) >= 0; }) : !r.length; if (!ok) f.push(code + ' → ' + (r.map(function (x) { return x.msg; }).join(' | ') || 'no issues')); }); }
    return c('const a = 1; a = 2;', 'no-const-assign').then(function () { return c('if (x = 1) {}', 'no-cond-assign'); })
      .then(function () { return c('notDefinedAnywhere();', 'no-undef'); }).then(function () { return c('function f() { return 1; f(); }', 'no-unreachable'); })
      .then(function () { return c('let s = "a"\nlet t = (s', 'Parsing error'); }).then(function () { return c('document.title = String(window.innerWidth);'); })
      .then(function () { return c('const fs = require("fs"); module.exports = fs;', null, { env: 'node' }); }).then(function () { return c('import x from "y"; export default x;', null, { env: 'module' }); })
      .then(function () { return c('var a = 1; if (a == 2) console.log(a);', 'eqeqeq', { env: 'browser', strict: true }); })
      .then(function () { return { ok: !f.length, n: n, fails: f }; });
  };
});
