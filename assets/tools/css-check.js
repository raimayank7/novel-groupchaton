/* Infinity by GroupChatOn — css-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS checker: unknown properties (with "did you mean"), invalid values, bad selectors, missing ; and braces, duplicates. Uses the browser's own CSS engine. */
GCOTools.register('css-check', function (spot, T) {
  var SHORT = ['margin', 'padding', 'border', 'background', 'font', 'flex', 'flex-flow', 'grid', 'grid-template', 'grid-area', 'grid-row', 'grid-column', 'gap', 'inset', 'outline', 'transition',
    'animation', 'list-style', 'overflow', 'place-items', 'place-content', 'place-self', 'border-radius', 'text-decoration', 'columns', 'border-top', 'border-right', 'border-bottom', 'border-left',
    'border-color', 'border-width', 'border-style', 'mask', 'container', 'font-variant', 'scroll-margin', 'scroll-padding', 'border-image', 'column-rule', 'text-emphasis'];
  var known = null;
  function props() {
    if (!known) { known = {}; [].slice.call(getComputedStyle(document.documentElement)).concat(SHORT).forEach(function (p) { if (p[0] !== '-') known[p] = 1; }); known = Object.keys(known); }
    return known;
  }
  function dist(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function suggest(p) {
    var best = null, bd = 99;
    props().forEach(function (k) { var x = dist(p, k); if (x < bd) { bd = x; best = k; } });
    return bd <= (p.length > 8 ? 3 : 2) ? best : null;
  }
  function supports(p, v) { try { return CSS.supports(p, v); } catch (e) { return true; } }
  var sheet = null;
  function selectorOk(sel) {
    try { if (!sheet) sheet = new CSSStyleSheet(); } catch (e) { return true; }
    try { sheet.insertRule(sel + '{}', 0); sheet.deleteRule(0); return true; } catch (e) { return false; }
  }
  function check(src) {
    var out = [], starts = [0];
    for (var k = 0; k < src.length; k++) if (src[k] === '\n') starts.push(k + 1);
    function lineOf(p) { var lo = 0, hi = starts.length - 1; while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (starts[mid] <= p) lo = mid; else hi = mid - 1; } return lo + 1; }
    function add(sev, p, msg) { out.push({ sev: sev, line: lineOf(p), msg: msg }); }
    // comments become spaces so positions stay the same
    var s = src.replace(/\/\*[\s\S]*?(\*\/|$)/g, function (m, e, at) { if (!e) add('error', at, 'This /* comment is never closed with */.'); return m.replace(/[^\n]/g, ' '); });
    var i = 0, n = s.length;
    // read up to the next { ; or } that is not inside brackets or quotes
    function upto() {
      var depth = 0, q = null, st = i;
      for (; i < n; i++) {
        var c = s[i];
        if (q) { if (c === '\\') i++; else if (c === q) q = null; else if (c === '\n') { add('error', st, 'A quoted text is not closed on this line.'); q = null; } continue; }
        if (c === '"' || c === "'") q = c;
        else if (c === '(' || c === '[') depth++;
        else if (c === ')' || c === ']') depth--;
        else if (depth <= 0 && (c === '{' || c === ';' || c === '}')) return c;
      }
      return '';
    }
    function rules(nested, kf) {
      for (;;) {
        while (i < n && /\s/.test(s[i])) i++;
        if (i >= n) return;
        if (s[i] === '}') { if (nested) return; add('error', i, 'Extra } with no { before it.'); i++; continue; }
        var st = i, c = upto(), pre = s.slice(st, i).trim();
        if (c === '{') {
          var open = i; i++;
          var at = /^@([\w-]+)/.exec(pre);
          if (at && /^(media|supports|container|layer|document|scope|starting-style)$/i.test(at[1])) rules(true, false);
          else if (at && /keyframes$/i.test(at[1])) rules(true, true);
          else { if (!at && !kf) selectors(pre, st, false); decls(open); }
          if (s[i] === '}') i++; else add('error', open, 'This { is never closed with }.');
        } else if (c === ';') { if (!/^@/.test(pre)) add('error', st, 'Unexpected “' + pre.slice(0, 30) + '”: a declaration must be inside { }.'); i++; }
        else if (c === '}') { add('error', st, 'Missing { after “' + pre.slice(0, 30) + '”.'); if (!nested) i++; else return; }
        else { if (pre) add('error', st, 'Unexpected end of file after “' + pre.slice(0, 30) + '”: a { is missing.'); return; }
      }
    }
    function selectors(pre, st, nested) {
      if (!pre) { add('error', st, 'A rule has no selector before {.'); return; }
      var parts = [], depth = 0, cur = '';
      for (var k = 0; k < pre.length; k++) { var c = pre[k]; if (c === '(' || c === '[') depth++; if (c === ')' || c === ']') depth--; if (c === ',' && !depth) { parts.push(cur); cur = ''; } else cur += c; }
      parts.push(cur);
      parts.forEach(function (sel) {
        sel = sel.trim();
        if (!sel) { add('error', st, 'Empty selector in “' + pre.slice(0, 40) + '”: is there an extra comma?'); return; }
        var test = nested ? (/^[>+~]/.test(sel) ? 'a ' : '') + sel.replace(/&/g, 'a') : sel;
        if (!selectorOk(test)) add(/-(webkit|moz|ms|o)-/.test(sel) ? 'warn' : 'error', st, 'Invalid selector “' + sel.slice(0, 60) + '”' + (/-(webkit|moz|ms|o)-/.test(sel) ? ': this browser does not know this prefixed selector.' : ': check the spelling of pseudo-classes like :hover and the brackets.'));
      });
    }
    function decls(open) {
      var seen = {}, count = 0;
      for (;;) {
        while (i < n && /[\s;]/.test(s[i])) i++;
        if (i >= n || s[i] === '}') { if (!count) add('warn', open, 'Empty rule: it does nothing and can be removed.'); return; }
        var st = i, c = upto(), seg = s.slice(st, i);
        if (c === '{') { count++; var o2 = i; i++; selectors(seg.trim(), st, true); decls(o2); if (s[i] === '}') i++; else add('error', o2, 'This { is never closed with }.'); continue; }
        count++;
        decl(seg, st, seen);
        if (c === ';') i++;
      }
    }
    function decl(seg, st, seen) {
      var lead = seg.length - seg.replace(/^\s+/, '').length, p0 = st + lead, txt = seg.trim(), m = /^([^:]+):([\s\S]*)$/.exec(txt);
      if (!m) { add('error', p0, /\n/.test(txt) ? 'Missing ; or : around “' + txt.split('\n')[0].slice(0, 30) + '”.' : 'Missing : in “' + txt.slice(0, 40) + '” (write property: value).'); return; }
      var prop = m[1].trim(), val = m[2].trim(), low = prop.toLowerCase();
      if (/\n\s*-?[a-z][\w-]*\s*:/i.test(val)) { add('error', p0, 'Missing ; at the end of this line (after “' + val.split('\n')[0].trim().slice(0, 30) + '”).'); return; }
      if (/^--/.test(prop)) return;
      if (!/^-?[a-zA-Z][\w-]*$/.test(prop)) { add('error', p0, '“' + prop.slice(0, 30) + '” is not a valid property name.'); return; }
      var vendor = /^-(webkit|moz|ms|o)-/.test(low);
      if (!vendor && !supports(low, 'inherit')) { var sg = suggest(low); add('error', p0, 'Unknown property “' + prop + '”.' + (sg ? ' Did you mean “' + sg + '”?' : '')); return; }
      var v = val.replace(/!\s*important\s*$/i, '').trim();
      if (!v) { add('error', p0, '“' + prop + '” has no value.'); return; }
      if (!vendor && !/var\(|env\(|attr\(|\{|calc-size/.test(v) && !supports(low, v)) add(/-(webkit|moz|ms|o)-/.test(v) ? 'warn' : 'error', p0, '“' + v.slice(0, 50) + '” is not a valid value for ' + low + '.');
      if (seen[low] && !vendor) add('warn', p0, low + ' is set twice in this rule (first on line ' + lineOf(seen[low]) + '); the later one wins.');
      seen[low] = p0;
    }
    rules(false, false);
    return out;
  }
  function checkUI(o) {
    var h = T.h, status = T.status(), list = h('div', { 'class': 'tkv', 'data-out': '' }), timer, seq = 0;
    var input = h('textarea', { rows: '12', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': o.label, placeholder: o.ph || 'Paste your code here…' });
    input.value = T.store.get(o.id + '-in', '');
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
      Promise.resolve().then(function () { return o.check(input.value); }).then(function (r) { if (tok === seq) draw(r); }, function (e) { if (tok === seq) { list.innerHTML = ''; status.error(e); } });
    }
    function draw(issues) {
      list.innerHTML = '';
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok || '✓ No problems found.');
      else status.info((e ? e + (e > 1 ? ' errors' : ' error') : 'No errors') + (w ? ', ' + w + (w > 1 ? ' warnings' : ' warning') : '') + '. Tap Show to jump to the line.');
      issues.slice(0, 300).forEach(function (x) {
        list.appendChild(h('div', {}, [h('span', { 'class': x.sev === 'error' ? 'tout-c' : '', style: 'font-weight:700', text: (x.sev === 'error' ? '✕ ' : '! ') + (x.line ? 'Line ' + x.line : 'Whole file') }),
          h('span', { text: x.msg }), x.line ? T.button('Show', { small: true, onclick: function () { show(x.line); } }) : h('span')]));
      });
    }
    spot.appendChild(T.card([T.field(o.label, input),
      T.row([T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; run(); } }), T.button('Clear', { small: true, onclick: function () { input.value = ''; run(); input.focus(); } })]),
      status.el, list]));
    spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 300); });
    run();
  }
  checkUI({ id: 'css-check', label: 'CSS to check', check: check, ok: '✓ No problems found: this browser understands every rule.',
    sample: '.card {\n  colr: #333;\n  background: whitee;\n  padding: 12px\n  margin: 0 auto;\n  display: flex;\n  display: grid;\n}\n\n.card:hovr { opacity: .9 }\n\n@media (max-width: 600px) {\n  .card { font-size: 14px; }\n}\n\n.empty { }\n' });
  T.tests['css-check'] = function () {
    var f = [], c = function (s, err, warn, want) {
      var r = check(s), e = r.filter(function (x) { return x.sev === 'error'; }).length, w = r.length - e;
      if (e !== err || w !== warn || (want && !r.some(function (x) { return x.msg.indexOf(want) >= 0; }))) f.push(s.slice(0, 40) + ' → ' + e + 'e/' + w + 'w ' + r.map(function (x) { return x.msg; }).join(' | ').slice(0, 160));
    };
    c('a{colr:red}', 1, 0, '“color”'); c('a{color:redd}', 1, 0, 'not a valid value'); c('a{color:red;color:blue}', 0, 1, 'twice'); c('a{color:red', 1, 0, 'never closed');
    c('a{color:red}}', 1, 0, 'Extra }'); c('a:hovr{color:red}', 1, 0, 'Invalid selector'); c('a{color:red\nmargin:0}', 1, 0, 'Missing ;'); c('a{}', 0, 1, 'Empty rule'); c('a,{color:red}', 1, 0, 'Empty selector');
    c('@import url("x.css");\n@media (max-width:600px){.x>.y:hover::before{content:"a;b}";margin:0 auto!important;--k:1px;color:var(--k)}}\n@keyframes s{from{opacity:0}50%{opacity:.5}to{opacity:1}}\n/* note */ .a{.b &{color:red}}', 0, 0);
    return Promise.resolve({ ok: !f.length, n: 10, fails: f });
  };
});
