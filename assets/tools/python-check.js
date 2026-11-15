/* Infinity by GroupChatOn — python-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Python checker: finds syntax and indentation mistakes and common beginner errors as you type; "Check with real Python" also compiles the code with Python itself (Pyodide, on the device). */
GCOTools.register('python-check', function (spot, T) {
  var PY = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/', py = null, pyLoading = null;
  var KW = /^(if|elif|else|for|while|def|class|try|except|finally|with|async\s+(?:def|for|with))\b/;
  function scan(src) {
    var out = [], sk = '', i = 0, n, br = [], line = 1, cont = { 1: false }, PAIR = { '(': ')', '[': ']', '{': '}' };
    function add(sev, ln, msg) { out.push({ sev: sev, line: ln, msg: msg }); }
    src = src.replace(/\r/g, '');
    n = src.length;
    while (i < n) {
      var c = src[i];
      if (c === '\n') { sk += c; line++; cont[line] = br.length > 0 || src[i - 1] === '\\'; i++; continue; }
      if (c === '#') { while (i < n && src[i] !== '\n') { sk += ' '; i++; } continue; }
      if (c === '"' || c === "'") {
        var tq = src.substr(i, 3) === c + c + c, q = tq ? c + c + c : c, sl = line;
        sk += q; i += q.length;
        for (;;) {
          if (i >= n) { add('error', sl, tq ? 'This ' + q + ' string is never closed.' : 'This string is never closed: add the missing ' + c + '.'); break; }
          var d = src[i];
          if (d === '\\') { sk += ' '; i++; if (src[i] === '\n') { sk += '\n'; line++; cont[line] = true; } else if (i < n) sk += ' '; i++; continue; }
          if (!tq && d === '\n') { add('error', sl, 'This string is not closed: add the missing ' + c + ' before the end of the line.'); break; }
          if (src.substr(i, q.length) === q) { sk += q; i += q.length; break; }
          if (d === '\n') { sk += '\n'; line++; cont[line] = true; } else sk += ' ';
          i++;
        }
        continue;
      }
      if (PAIR[c]) br.push({ c: c, line: line });
      else if (c === ')' || c === ']' || c === '}') {
        var top = br.pop();
        if (!top) add('error', line, 'Unmatched “' + c + '”: there is no opening bracket for it.');
        else if (PAIR[top.c] !== c) add('error', line, '“' + c + '” does not match “' + top.c + '” opened on line ' + top.line + '.');
      }
      sk += c; i++;
    }
    br.forEach(function (b) { add('error', b.line, '“' + b.c + '” is never closed: add the missing “' + PAIR[b.c] + '”.'); });
    var lines = sk.split('\n'), indents = [0], need = 0, tabs = 0, spaces = 0;
    for (var k = 0; k < lines.length; k++) {
      var ln = k + 1, raw = lines[k];
      if (cont[ln] || !raw.trim()) continue;
      var ws = /^[ \t]*/.exec(raw)[0];
      if (/\t/.test(ws) && / /.test(ws)) add('error', ln, 'Tabs and spaces are mixed in this indent: use 4 spaces only.');
      if (/\t/.test(ws)) tabs = tabs || ln; else if (ws) spaces = spaces || ln;
      var w = ws.replace(/\t/g, '        ').length, top2 = indents[indents.length - 1];
      if (need) { if (w <= top2) add('error', ln, 'Expected an indented block after line ' + need + '.'); else indents.push(w); need = 0; }
      else if (w > top2) add('error', ln, 'Unexpected indent: this line is indented more than the one before it.');
      else if (w < top2) { while (indents.length > 1 && indents[indents.length - 1] > w) indents.pop(); if (indents[indents.length - 1] !== w) add('error', ln, 'This indent does not match any outer level.'); }
      var code = raw.trim(), full = code;
      for (var j = k + 1; j < lines.length && cont[j + 1]; j++) full += ' ' + lines[j].trim();
      full = full.replace(/\\\s*/g, ' ').trim();
      var kw = KW.exec(code);
      if (kw && !/:/.test(full)) { add('error', ln, 'Missing : at the end of the ' + kw[1] + ' line.'); need = ln; }
      else if ((kw || /^(match|case)\s.*:$/.test(full)) && /:$/.test(full)) need = ln;
      if (/^print\s+[^\s(=.\[]/.test(code)) add('error', ln, 'In Python 3, print needs brackets: print(…).');
      if (/^else\s+if\b/.test(code)) add('error', ln, 'Python uses elif, not else if.');
      if (/^(if|elif|while)\b/.test(code)) {
        var cond = full.replace(/^\w+/, '').replace(/:$/, '');
        while (/\([^()]*\)|\[[^\[\]]*\]|\{[^{}]*\}/.test(cond)) cond = cond.replace(/\([^()]*\)|\[[^\[\]]*\]|\{[^{}]*\}/g, '');
        if (/(^|[^=!<>:+\-*\/%&|^@])=(?!=)/.test(cond)) add('error', ln, 'Use == to compare. A single = assigns a value.');
      }
      if (/\w(\+\+|--)(\s|$|\))/.test(code)) add('error', ln, 'Python has no ++ or --: write x += 1 or x -= 1.');
      if (/&&|\|\|/.test(code)) add('error', ln, 'Python uses and / or instead of && / ||.');
      if (/^(var|let|const)\s+\w+\s*=/.test(code)) add('error', ln, 'Python has no var, let or const: just write name = value.');
      if (/^(function|func)\s+\w+\s*\(/.test(code)) add('error', ln, 'Use def to define a function: def name(…):');
      if (/^\}\s*$/.test(code) || (kw && /\{\s*$/.test(full))) add('error', ln, 'Python uses : and indentation for blocks, not { }.');
      if (/[!=]=\s*None\b/.test(code)) add('warn', ln, 'Compare with None using “is None” or “is not None”.');
      if (/^except\s*:/.test(code)) add('warn', ln, 'A bare except: also hides typos and Ctrl+C. Name the error, for example except ValueError:');
      if (/^(async\s+)?def\s+\w+\s*\(.*=\s*(\[\]|\{\}|list\(\)|dict\(\)|set\(\))/.test(full)) add('warn', ln, 'Default value is a list or dict: it is shared between calls. Use None and create it inside the function.');
      if (/^from\s+\S+\s+import\s+\*/.test(code)) add('warn', ln, 'import * hides where names come from. Import the names you need.');
      if (/;\s*$/.test(code)) add('warn', ln, 'No ; is needed at the end of a line in Python.');
      if (/(=|==|\(|,|return)\s*(true|false|null|none)\b/.test(code)) add('warn', ln, 'Python writes True, False and None with a capital letter.');
    }
    if (need) add('error', need, 'Expected an indented block after this line.');
    if (tabs && spaces) add('warn', Math.max(tabs, spaces), 'The file uses both tabs (line ' + tabs + ') and spaces (line ' + spaces + ') to indent. Pick one: 4 spaces is the standard.');
    return out;
  }
  function loadPy() {
    if (!pyLoading) pyLoading = T.loadScript(PY + 'pyodide.js').then(function () { return window.loadPyodide({ indexURL: PY }); }).then(function (p) {
      p.runPython('import json\ndef _gco_chk(src):\n    try:\n        compile(src, "main.py", "exec")\n        return "[]"\n    except SyntaxError as e:\n        return json.dumps([[e.lineno or 0, e.offset or 0, type(e).__name__ + ": " + str(e.msg)]])\n');
      py = p; return p;
    }).catch(function (e) { pyLoading = null; throw e; });
    return pyLoading;
  }
  function check(code) {
    var r = scan(code);
    if (!py) return r;
    var real = JSON.parse(py.globals.get('_gco_chk')(code));
    real.forEach(function (x) { if (!r.some(function (y) { return y.sev === 'error' && y.line === x[0]; })) r.push({ sev: 'error', line: x[0], col: x[1], msg: 'Python says: ' + x[2] }); });
    return r;
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
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0) || (a.col || 0) - (b.col || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok());
      else status.info((e ? e + (e > 1 ? ' errors' : ' error') : 'No errors') + (w ? ', ' + w + (w > 1 ? ' warnings' : ' warning') : '') + '. Tap Show to jump to the line.');
      issues.slice(0, 300).forEach(function (x) {
        list.appendChild(h('div', {}, [h('span', { 'class': x.sev === 'error' ? 'tout-c' : '', style: 'font-weight:700', text: (x.sev === 'error' ? '✕ ' : '! ') + (x.line ? 'Line ' + x.line + (x.col ? ':' + x.col : '') : 'Whole file') }),
          h('span', { text: x.msg }), x.line ? T.button('Show', { small: true, onclick: function () { show(x.line); } }) : h('span')]));
      });
    }
    spot.appendChild(T.card([T.field(o.label, input),
      T.row([o.deep, T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; run(); } }), T.button('Clear', { small: true, onclick: function () { input.value = ''; run(); input.focus(); } })]),
      status.el, list]));
    spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 300); });
    run();
    return { run: run, status: status };
  }
  var ui, deep = T.button('Check with real Python', { primary: true, onclick: function () {
    if (py) return ui.run();
    deep.disabled = true; ui.status.info('Loading Python (about 10 MB, only the first time)…');
    loadPy().then(function () { deep.textContent = 'Check again'; deep.disabled = false; ui.run(); }, function (e) { deep.disabled = false; ui.status.error(e); });
  } });
  ui = checkUI({ id: 'python-check', label: 'Python code to check', check: check, deep: deep,
    ok: function () { return py ? '✓ No problems found, and Python compiles it without errors.' : '✓ No common mistakes found. Press “Check with real Python” for a full syntax check.'; },
    sample: 'def average(numbers=[]):\n    if len(numbers) = 0\n        return None\n    total = 0\n    for n in numbers:\n        total += n\n   return total / len(numbers)\n\nprint "Average:", average([4, 8, 15])\nif result == None:\n    print("none")\n' });
  T.tests['python-check'] = function () {
    var f = [], c = function (s, err, warn, want) {
      var r = scan(s), e = r.filter(function (x) { return x.sev === 'error'; }).length, w = r.length - e;
      if (e !== err || w !== warn || (want && !r.some(function (x) { return x.msg.indexOf(want) >= 0; }))) f.push(s.replace(/\n/g, '⏎').slice(0, 40) + ' → ' + e + 'e/' + w + 'w ' + r.map(function (x) { return x.line + ':' + x.msg; }).join(' | ').slice(0, 160));
    };
    c('if x == 1\n    print(x)', 1, 0, 'Missing :'); c('def f():\nreturn 1', 1, 0, 'indented block'); c('x = (1, 2', 1, 0, 'never closed'); c("s = 'abc", 1, 0, 'closed');
    c('print "hi"', 1, 0, 'brackets'); c('if a = 1:\n  pass', 1, 0, '=='); c('if a:\n    b = 1\n  c = 2', 1, 0, 'does not match'); c('x = 1\n    y = 2', 1, 0, 'Unexpected indent');
    c('def f(a=[]):\n    return a', 0, 1, 'shared'); c('i++', 1, 0, '+='); c('if x == None:\n    pass', 0, 1, 'is None');
    c('def f(a, b=2):\n    """Doc: with \'quotes\'\n    and lines"""\n    if a == ":" and f(b=1):\n        return [x for x in range(b)\n                if x]\n    return {"k": a}  # comment: )\n\nif __name__ == "__main__":\n    print(f(1), end="")\n', 0, 0);
    return Promise.resolve({ ok: !f.length, n: 12, fails: f });
  };
});
