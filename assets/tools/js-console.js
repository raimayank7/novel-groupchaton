/* Infinity by GroupChatOn — js-console. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* JavaScript console: run JavaScript in a sealed sandbox and see results, console.log output and errors, like a browser's developer console. */
GCOTools.register('js-console', function (spot, T) {
  var h = T.h;
  var BOOT = '<!doctype html><script>(function(){var send=function(t,v){parent.postMessage({gco:1,t:t,v:v},"*")};' +
    'function show(x,d){d=d||0;if(x===null)return"null";if(x===void 0)return"undefined";var t=typeof x;if(t==="string")return d?JSON.stringify(x):x;if(t==="function")return"ƒ "+(x.name||"anonymous")+"()";' +
    'if(t==="symbol"||t==="bigint")return String(x)+(t==="bigint"?"n":"");if(t!=="object")return String(x);if(x instanceof Error)return x.name+": "+x.message;if(x instanceof Date)return x.toISOString();if(d>3)return Array.isArray(x)?"[…]":"{…}";' +
    'if(Array.isArray(x))return"["+x.slice(0,100).map(function(v){return show(v,d+1)}).join(", ")+(x.length>100?", … "+(x.length-100)+" more":"")+"]";' +
    'if(x instanceof Map)return"Map("+x.size+") {"+Array.from(x).slice(0,50).map(function(p){return show(p[0],d+1)+" => "+show(p[1],d+1)}).join(", ")+"}";if(x instanceof Set)return"Set("+x.size+") {"+Array.from(x).slice(0,50).map(function(v){return show(v,d+1)}).join(", ")+"}";' +
    'var k=Object.keys(x);return(x.constructor&&x.constructor!==Object&&x.constructor.name?x.constructor.name+" ":"")+"{"+k.slice(0,50).map(function(n){return(/^[A-Za-z_$][\\w$]*$/.test(n)?n:JSON.stringify(n))+": "+show(x[n],d+1)}).join(", ")+"}"}' +
    '["log","info","warn","error","debug"].forEach(function(m){console[m]=function(){send(m,Array.prototype.map.call(arguments,function(a){return show(a)}).join(" "))}});' +
    'console.table=function(a){send("log",show(a))};window.onerror=function(m){send("error",String(m))};window.onunhandledrejection=function(e){send("error","Uncaught (in promise) "+show(e.reason))};' +
    'addEventListener("message",function(e){if(!e.data||e.data.gco!==2)return;try{var r=(0,eval)(e.data.code);if(r&&typeof r.then==="function"){r.then(function(v){send("result",show(v,1));send("done")},function(x){send("error","Uncaught (in promise) "+show(x));send("done")})}else{send("result",show(r,1));send("done")}}catch(x){send("error",(x&&x.name?x.name+": "+x.message:String(x)));send("done")}});send("ready")})();<\/script>';
  var frame = null, ready = null, out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, 'aria-label': 'Console output' }), lines = [], waiters = [];
  var code = h('textarea', { rows: '7', 'class': 'tin tmono', spellcheck: 'false', placeholder: 'e.g. [1, 2, 3].map(n => n * 2)', 'aria-label': 'JavaScript' });
  code.value = T.store.get('jsconsole', '');
  var ICON = { log: '  ', info: 'ℹ ', warn: '⚠ ', error: '✕ ', debug: '  ', result: '← ' };
  function boot() {
    if (frame) frame.remove();
    frame = h('iframe', { sandbox: 'allow-scripts', style: 'display:none', title: 'JavaScript sandbox' });
    ready = new Promise(function (ok) { waiters.push(['ready', ok]); });
    document.body.appendChild(frame); frame.srcdoc = BOOT;
  }
  window.addEventListener('message', function (e) {
    if (!frame || e.source !== frame.contentWindow || !e.data || e.data.gco !== 1) return;
    var d = e.data;
    if (d.t === 'ready' || d.t === 'done') { waiters = waiters.filter(function (w) { if (w[0] === d.t) { w[1](); return false; } return true; }); return; }
    lines.push(ICON[d.t] + d.v); out.value = lines.join('\n'); out.scrollTop = out.scrollHeight;
  });
  function run(src) {
    T.store.set('jsconsole', code.value);
    lines.push('› ' + src.split('\n').join('\n  ')); out.value = lines.join('\n');
    return ready.then(function () { return new Promise(function (ok) { waiters.push(['done', ok]); frame.contentWindow.postMessage({ gco: 2, code: src }, '*'); setTimeout(ok, 5000); }); });
  }
  code.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(code.value); } });
  spot.appendChild(T.card([T.field('JavaScript (Ctrl + Enter runs it)', code), T.row([T.button('Run ▶', { primary: true, onclick: function () { if (code.value.trim()) run(code.value); } }),
    T.button('Try a sample', { small: true, onclick: function () { code.value = 'const prices = [120, 450, 99];\nconsole.log("Total:", prices.reduce((a, b) => a + b, 0));\nprices.map(p => p * 1.18)'; run(code.value); } }),
    T.button('Clear output', { small: true, onclick: function () { lines = []; out.value = ''; } }), T.button('Reset variables', { small: true, onclick: function () { boot(); lines.push('— fresh start —'); out.value = lines.join('\n'); } })]),
    T.field('Console', out), h('p', { 'class': 'tstatus', text: 'Code runs in a sealed sandbox with no access to this site, your cookies or other tabs. Variables are kept between runs until you reset. An endless loop can freeze this tab: reload the page if that happens.' })]));
  boot();
  T.tests['js-console'] = function () {
    var f = [];
    lines = [];
    return run('console.log("hi", {a: [1, "x"]}); [1, 2].map(x => x * 2)').then(function () {
      return run('nope + 1');
    }).then(function () { return run('Promise.resolve(new Map([["k", 1]]))'); }).then(function () {
      var t = lines.join('\n');
      if (t.indexOf('  hi {a: [1, "x"]}') < 0) f.push('console.log ' + t);
      if (t.indexOf('← [2, 4]') < 0) f.push('result');
      if (t.indexOf('✕ ReferenceError: nope is not defined') < 0) f.push('error');
      if (t.indexOf('← Map(1) {"k" => 1}') < 0) f.push('promise / map');
      lines = []; out.value = '';
      return { ok: !f.length, n: 4, fails: f };
    });
  };
});
