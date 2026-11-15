/* Infinity by GroupChatOn — python-run. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Run Python in the browser: real Python 3.12 (Pyodide, WebAssembly) in a background worker, with input() support, popular packages loaded on demand, and a Stop button for endless loops. */
GCOTools.register('python-run', function (spot, T) {
  var h = T.h, PY = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/', worker = null, ready = false, job = null, chain = Promise.resolve(), started = 0, tick = 0;
  var SRC = "importScripts('" + PY + "pyodide.js');\n" +
    "var boot = loadPyodide({ indexURL: '" + PY + "' }).then(function (py) { postMessage({ ready: 1 }); return py; }, function (e) { postMessage({ err: 'Python could not start: ' + e.message, done: 1 }); });\n" +
    "onmessage = function (e) { boot.then(function (py) {\n" +
    "  var lines = e.data.stdin ? e.data.stdin.split('\\n') : [];\n" +
    "  py.setStdout({ batched: function (s) { postMessage({ out: s + '\\n' }); } });\n" +
    "  py.setStderr({ batched: function (s) { postMessage({ out: s + '\\n' }); } });\n" +
    "  py.setStdin({ stdin: function () { return lines.length ? lines.shift() : null; } });\n" +
    "  return py.loadPackagesFromImports(e.data.code, { messageCallback: function (m) { postMessage({ info: m }); }, errorCallback: function () {} }).then(function () {\n" +
    "    var g = py.globals.get('dict')(); g.set('__name__', '__main__');\n" +
    "    return py.runPythonAsync(e.data.code, { globals: g, filename: 'main.py' });\n" +
    "  }).then(function (r) { if (r !== undefined && r !== null) postMessage({ out: String(r) + '\\n' }); postMessage({ done: 1 }); }, function (x) { postMessage({ err: String(x && x.message || x), done: 1 }); });\n" +
    "}); };";
  function tidy(msg) {
    var out = [], skip = false;
    msg.split('\n').forEach(function (l) {
      if (/^  File "/.test(l)) skip = !/"(main\.py|<exec>)"/.test(l); else if (!/^    /.test(l)) skip = false;
      if (!skip) out.push(l.replace('File "<exec>"', 'File "main.py"'));
    });
    var t = out.join('\n').trim();
    if (/EOFError/.test(t)) t += '\n\n(Your program asked for input(): type one answer per line in the Input box, then Run again.)';
    return t;
  }
  function boot() {
    if (worker) return;
    ready = false;
    worker = new Worker(URL.createObjectURL(new Blob([SRC], { type: 'text/javascript' })));
    worker.onmessage = function (e) {
      var d = e.data;
      if (d.ready) { ready = true; return; }
      if (!job) return;
      if (d.info) job.info(d.info);
      if (d.out) job.out += d.out;
      if (d.err) job.err = tidy(d.err);
      if (d.done) { var j = job; job = null; j.done(); }
      else job.update();
    };
    worker.onerror = function (e) { if (job) { job.err = 'Python stopped: ' + (e.message || 'error'); var j = job; job = null; j.done(); } };
  }
  // runs one program at a time; resolves with { out, err }
  function exec(code, stdin, onUpdate, onInfo) {
    chain = chain.then(function () {
      return new Promise(function (ok) {
        boot();
        job = { out: '', err: '', update: function () { if (onUpdate) onUpdate(job); }, info: onInfo || function () {}, done: function () { ok({ out: this.out, err: this.err }); } };
        worker.postMessage({ code: code, stdin: stdin || '' });
      });
    });
    return chain;
  }
  function stop() {
    if (worker) worker.terminate();
    worker = null; ready = false;
    if (job) { job.err = 'Stopped.'; var j = job; job = null; j.done(); }
  }
  var code = h('textarea', { rows: '14', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'Python code' });
  var stdin = h('textarea', { rows: '3', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'Input for input()', placeholder: 'One line per input() call, for example:\nAsha\n25' });
  var out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, spellcheck: 'false', 'aria-label': 'Output', placeholder: 'Output appears here.' });
  var status = T.status();
  code.value = T.store.get('python-run-code', '') || 'print("Hello from Python!")\n';
  code.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') { e.preventDefault(); var s = code.selectionStart; code.setRangeText('    ', s, code.selectionEnd, 'end'); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
  });
  code.addEventListener('input', function () { T.store.set('python-run-code', code.value.slice(0, 100000)); });
  var runBtn = T.button('▶ Run', { primary: true, onclick: function () { run(); } });
  var stopBtn = T.button('■ Stop', { onclick: stop, disabled: true });
  function run() {
    T.store.set('python-run-code', code.value.slice(0, 100000));
    out.value = ''; runBtn.disabled = true; stopBtn.disabled = false;
    started = Date.now();
    clearInterval(tick);
    tick = setInterval(function () { status.info(ready ? 'Running… ' + Math.round((Date.now() - started) / 1000) + ' s' : 'Starting Python (about 10 MB the first time, then it is cached)…'); }, 500);
    status.info(ready ? 'Running…' : 'Starting Python (about 10 MB the first time, then it is cached)…');
    exec(code.value, stdin.value, function (j) { out.value = j.out; }, function (m) { status.info(m); }).then(function (r) {
      clearInterval(tick); runBtn.disabled = false; stopBtn.disabled = true;
      out.value = r.out + (r.err ? (r.out ? '\n' : '') + r.err : '');
      if (r.err === 'Stopped.') status.info('Stopped. Python will restart on the next run.');
      else if (r.err) status.error('The program ended with an error (see the output).');
      else status.ok('✓ Finished in ' + ((Date.now() - started) / 1000).toFixed(1) + ' s.');
    });
  }
  var SAMPLE = '# Shopping bill with GST\nitems = {"Rice 5 kg": 340, "Dal 1 kg": 145, "Oil 1 L": 180}\nname = input("Your name: ")\nprint("Bill for", name)\ntotal = 0\nfor item, price in items.items():\n    print(f"{item:<12} ₹{price:>6.2f}")\n    total += price\ngst = round(total * 0.05, 2)\nprint("-" * 21)\nprint(f"{\'GST 5%\':<12} ₹{gst:>6.2f}")\nprint(f"{\'Total\':<12} ₹{total + gst:>6.2f}")\n';
  spot.appendChild(T.card([T.field('Python code', code, 'Ctrl + Enter runs the code. Tab indents with 4 spaces.'), T.field('Input (for input())', stdin),
    T.row([runBtn, stopBtn, T.button('Try a sample', { small: true, onclick: function () { code.value = SAMPLE; stdin.value = 'Asha'; run(); } }),
      T.button('Clear output', { small: true, onclick: function () { out.value = ''; status.clear(); } })]),
    status.el, T.field('Output', out), T.row([T.button('Copy output', { onclick: function (e) { T.copy(out.value, e.currentTarget); } }),
      T.button('Download .py', { onclick: function () { T.download(new Blob([code.value], { type: 'text/x-python;charset=utf-8' }), 'main.py'); } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['python-run'] = function () {
    var f = [];
    if (tidy('Traceback (most recent call last):\n  File "/lib/python312.zip/_pyodide/_base.py", line 596, in eval_code_async\n    await CodeRunner(\n  File "<exec>", line 2, in <module>\nNameError: name \'x\' is not defined') !==
      'Traceback (most recent call last):\n  File "main.py", line 2, in <module>\nNameError: name \'x\' is not defined') f.push('traceback tidy');
    return exec('import math\nprint(sum(range(10)), math.sqrt(16))\nname = input()\nprint("Hi", name)\nif __name__ == "__main__":\n    print("main")', 'Asha').then(function (r) {
      if (r.out !== '45 4.0\nHi Asha\nmain\n' || r.err) f.push('run → ' + JSON.stringify(r).slice(0, 120));
      return exec('print(1/0)', '');
    }).then(function (r) {
      if (!/ZeroDivisionError/.test(r.err) || /_pyodide/.test(r.err)) f.push('error → ' + r.err.slice(0, 120));
      return { ok: !f.length, n: 3, fails: f };
    });
  };
});
