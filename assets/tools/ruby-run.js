/* Infinity by GroupChatOn — ruby-run. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Run Ruby 3.3 in the browser: the official Ruby interpreter compiled to WebAssembly (ruby.wasm) in a background worker, with gets support and a Stop button. */
GCOTools.register('ruby-run', function (spot, T) {
  var h = T.h, R = 'https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@2.6.2/dist/', worker = null, ready = false, job = null, chain = Promise.resolve(), started = 0, tick = 0;
  var SRC = "importScripts('" + R + "browser.umd.js');\n" +
    "var boot = fetch('" + R + "ruby+stdlib.wasm').then(function (r) { if (!r.ok) throw new Error('download failed (' + r.status + ')'); return r.arrayBuffer(); })\n" +
    "  .then(function (b) { return WebAssembly.compile(b); }).then(function (m) { return self['ruby-wasm-wasi'].DefaultRubyVM(m, { consolePrint: false }); })\n" +
    "  .then(function (x) { postMessage({ ready: 1 }); return x.vm; }, function (e) { postMessage({ err: 'Ruby could not start: ' + e.message, done: 1 }); });\n" +
    "onmessage = function (e) { boot.then(function (vm) { try { postMessage({ out: vm.eval(e.data.src).toString(), done: 1 }); } catch (x) { postMessage({ err: String(x && x.message || x), done: 1 }); } }); };";
  function lit(s) { return JSON.stringify(s).replace(/#/g, '\\#'); }
  function program(code, input) {
    return 'require "stringio"\n$stdout = StringIO.new\n$stderr = $stdout\n$stdin = StringIO.new(' + lit(input) + ')\n' +
      'begin\n  TOPLEVEL_BINDING.eval(' + lit(code) + ', "main.rb", 1)\nrescue Exception => e\n' +
      '  $stdout.print "\\n" unless $stdout.string.empty? || $stdout.string.end_with?("\\n")\n' +
      '  $stdout.print "#{e.class}: #{e.message}\\n"\n' +
      '  (e.backtrace || []).select { |l| l.start_with?("main.rb") }.first(5).each { |l| $stdout.print "  from #{l}\\n" }\n' +
      '  $stdout.print "\\u0000ERR"\nend\n$stdout.string';
  }
  function boot() {
    if (worker) return;
    ready = false;
    worker = new Worker(URL.createObjectURL(new Blob([SRC], { type: 'text/javascript' })));
    worker.onmessage = function (e) {
      var d = e.data;
      if (d.ready) { ready = true; return; }
      if (!job) return;
      if (d.out != null) job.out = d.out;
      if (d.err) job.err = d.err;
      if (d.done) { var j = job; job = null; j.done(); }
    };
    worker.onerror = function (e) { if (job) { job.err = 'Ruby stopped: ' + (e.message || 'error'); var j = job; job = null; j.done(); } };
  }
  function exec(code, stdin) {
    chain = chain.then(function () {
      return new Promise(function (ok) {
        boot();
        job = { out: '', err: '', done: function () {
          var o = this.out, failed = o.indexOf('\u0000ERR') >= 0;
          ok({ out: o.replace('\u0000ERR', ''), err: this.err, failed: failed || !!this.err });
        } };
        worker.postMessage({ src: program(code, stdin || '') });
      });
    });
    return chain;
  }
  function stop() {
    if (worker) worker.terminate();
    worker = null; ready = false;
    if (job) { job.err = 'Stopped.'; var j = job; job = null; j.done(); }
  }
  var code = h('textarea', { rows: '14', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'Ruby code' });
  var stdin = h('textarea', { rows: '3', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'Input for gets', placeholder: 'One line per gets call' });
  var out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, spellcheck: 'false', 'aria-label': 'Output', placeholder: 'Output appears here.' });
  var status = T.status();
  code.value = T.store.get('ruby-run-code', '') || 'puts "Hello from Ruby #{RUBY_VERSION}"\n';
  code.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') { e.preventDefault(); code.setRangeText('  ', code.selectionStart, code.selectionEnd, 'end'); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
  });
  code.addEventListener('input', function () { T.store.set('ruby-run-code', code.value.slice(0, 100000)); });
  var runBtn = T.button('▶ Run', { primary: true, onclick: function () { run(); } });
  var stopBtn = T.button('■ Stop', { onclick: stop, disabled: true });
  function run() {
    out.value = ''; runBtn.disabled = true; stopBtn.disabled = false; started = Date.now();
    var msg = function () { return ready ? 'Running… ' + Math.round((Date.now() - started) / 1000) + ' s' : 'Starting Ruby (a large download the first time, then it is cached)…'; };
    clearInterval(tick); tick = setInterval(function () { status.info(msg()); }, 500); status.info(msg());
    exec(code.value, stdin.value).then(function (r) {
      clearInterval(tick); runBtn.disabled = false; stopBtn.disabled = true;
      out.value = r.out + (r.err ? (r.out ? '\n' : '') + r.err : '');
      if (r.err === 'Stopped.') status.info('Stopped. Ruby will restart on the next run.');
      else if (r.failed) status.error('The program ended with an error (see the output).');
      else status.ok('✓ Finished in ' + ((Date.now() - started) / 1000).toFixed(1) + ' s.');
    });
  }
  var SAMPLE = '# Split a bill between friends\nprint "Total bill: "\ntotal = gets.to_f\nfriends = gets.split(",").map(&:strip)\nshare = (total / friends.size).round(2)\nfriends.each { |f| puts "#{f.ljust(8)} pays #{format("%.2f", share)}" }\nputs "Rounding left over: #{(total - share * friends.size).round(2)}"\n';
  spot.appendChild(T.card([T.field('Ruby code', code, 'Ctrl + Enter runs the code.'), T.field('Input (for gets)', stdin),
    T.row([runBtn, stopBtn, T.button('Try a sample', { small: true, onclick: function () { code.value = SAMPLE; stdin.value = '1000\nAsha, Ravi, Meena'; run(); } }),
      T.button('Clear output', { small: true, onclick: function () { out.value = ''; status.clear(); } })]),
    status.el, T.field('Output', out), T.row([T.button('Copy output', { onclick: function (e) { T.copy(out.value, e.currentTarget); } }),
      T.button('Download .rb', { onclick: function () { T.download(new Blob([code.value], { type: 'text/plain;charset=utf-8' }), 'main.rb'); } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['ruby-run'] = function () {
    var f = [];
    if (lit('a "#{x}"\n') !== '"a \\"\\#{x}\\"\\n"') f.push('literal ' + lit('a "#{x}"\n'));
    return exec('name = gets.chomp\nputs "Hi #{name}"\np [1, 2, 3].sum, :ok\nputs "#{RUBY_VERSION[0, 3]}"', 'Asha').then(function (r) {
      if (r.out !== 'Hi Asha\n6\n:ok\n3.3\n' || r.failed) f.push('run → ' + JSON.stringify(r).slice(0, 140));
      return exec('puts 1\nfoo(', '');
    }).then(function (r) {
      if (!r.failed || !/SyntaxError/.test(r.out)) f.push('syntax → ' + r.out.slice(0, 100));
      return exec('raise ArgumentError, "bad"', '');
    }).then(function (r) {
      if (!/ArgumentError: bad/.test(r.out) || !/main\.rb:1/.test(r.out)) f.push('raise → ' + r.out.slice(0, 100));
      return { ok: !f.length, n: 4, fails: f };
    });
  };
});
