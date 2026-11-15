/* Infinity by GroupChatOn — js-to-json. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* JavaScript object ↔ JSON: turn a JS object literal (unquoted keys, single quotes, comments, trailing commas) into valid JSON, or JSON into a tidy JS object. */
GCOTools.register('js-to-json', function (spot, T) {
  // reads JS object literals without running them (never eval)
  function parse(src) {
    var i = 0;
    function err(m) { var b = src.slice(0, i); throw new Error('Line ' + b.split('\n').length + ', column ' + (i - b.lastIndexOf('\n')) + ': ' + m); }
    function ws() { for (;;) { var c = src[i]; if (/\s/.test(c || '')) { i++; continue; } if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; } if (c === '/' && src[i + 1] === '*') { var e = src.indexOf('*/', i + 2); if (e < 0) err('Unclosed comment'); i = e + 2; continue; } return; } }
    function str() {
      var q = src[i++], out = '';
      for (;;) {
        var c = src[i];
        if (c === undefined) err('Text never closed');
        if (c === q) { i++; return out; }
        if (q === '`' && c === '$' && src[i + 1] === '{') err('Template literals with ${…} cannot be converted: they need running code');
        if (c === '\\') { var n = src[i + 1]; if (n === 'u') { out += String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16)); i += 6; continue; } out += { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0' }[n] || n; i += 2; continue; }
        out += c; i++;
      }
    }
    function value() {
      ws();
      var c = src[i], m;
      if (c === '{') { i++; var o = {}; for (;;) { ws(); if (src[i] === '}') { i++; return o; } var k; if (src[i] === '"' || src[i] === "'" || src[i] === '`') k = str(); else if ((m = /^[A-Za-z_$][\w$]*|^\d+/.exec(src.slice(i)))) { k = m[0]; i += k.length; } else if (src[i] === '[') err('Computed keys [like this] need running code'); else err('Expected a key'); ws();
        if (src[i] !== ':') { if (src[i] === ',' || src[i] === '}') { err('Shorthand “' + k + '” needs a value: write ' + k + ': …'); } err('Expected :'); } i++; o[k] = value(); ws(); if (src[i] === ',') { i++; continue; } if (src[i] === '}') { i++; return o; } err('Expected , or }'); } }
      if (c === '[') { i++; var a = []; for (;;) { ws(); if (src[i] === ']') { i++; return a; } a.push(value()); ws(); if (src[i] === ',') { i++; continue; } if (src[i] === ']') { i++; return a; } err('Expected , or ]'); } }
      if (c === '"' || c === "'" || c === '`') return str();
      if ((m = /^[+-]?(0x[\da-f]+|0b[01]+|0o[0-7]+|(\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(e[+-]?\d+)?)/i.exec(src.slice(i)))) { i += m[0].length; var t = m[0].replace(/_/g, ''); var neg = t[0] === '-'; t = t.replace(/^[+-]/, ''); var v = /^0[xbo]/i.test(t) ? parseInt(t.slice(2), { x: 16, b: 2, o: 8 }[t[1].toLowerCase()]) : +t; return neg ? -v : v; }
      if ((m = /^(true|false|null|undefined|NaN|Infinity)\b/.exec(src.slice(i)))) { i += m[0].length; return { 'true': true, 'false': false }[m[0]] !== undefined ? m[0] === 'true' : null; }
      if ((m = /^new Date\(\s*(['"])(.*?)\1\s*\)/.exec(src.slice(i)))) { i += m[0].length; return m[2]; }
      err(c === undefined ? 'Input ends too early' : 'This looks like code (“' + src.slice(i, i + 12) + '…”), not a plain value');
    }
    ws();
    var pre = /^(?:(?:export\s+)?(?:const|let|var)\s+[\w$]+\s*=|module\.exports\s*=|export\s+default)\s*/.exec(src.slice(i));
    if (pre) i += pre[0].length;
    var v = value(); ws(); if (src[i] === ';') i++; ws();
    if (i < src.length) err('Extra text after the value');
    return v;
  }
  function toJs(v, ind, q, lvl) {
    lvl = lvl || 0;
    var pad = new Array(lvl + 2).join(ind), end = new Array(lvl + 1).join(ind), s = function (x) { return q === "'" ? "'" + JSON.stringify(x).slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'") + "'" : JSON.stringify(x); };
    if (v === null || typeof v !== 'object') return typeof v === 'string' ? s(v) : String(v);
    if (Array.isArray(v)) return v.length ? '[\n' + v.map(function (x) { return pad + toJs(x, ind, q, lvl + 1); }).join(',\n') + '\n' + end + ']' : '[]';
    var k = Object.keys(v);
    return k.length ? '{\n' + k.map(function (x) { return pad + (/^[A-Za-z_$][\w$]*$/.test(x) ? x : s(x)) + ': ' + toJs(v[x], ind, q, lvl + 1); }).join(',\n') + '\n' + end + '}' : '{}';
  }
  function run(t, o) {
    var ind = o.indent === 'tab' ? '\t' : new Array((+o.indent || 2) + 1).join(' ');
    if (o.dir === 'json') return JSON.stringify(parse(t), null, ind);
    var j; try { j = JSON.parse(t); } catch (e) { throw new Error('This is not valid JSON: ' + e.message); }
    return (o.decl ? 'const data = ' : '') + toJs(j, ind, o.quote) + (o.decl ? ';' : '');
  }
  T.transformer(spot, { id: 'js-to-json', inLabel: 'JavaScript object or JSON', mono: true, rows: 10, outLabel: 'Result',
    sample: "const user = {\n  name: 'Asha', // first name\n  age: 30,\n  tags: ['admin', 'beta',],\n  'home-city': \"Ludhiana\",\n  verified: true,\n};",
    options: [T.opt.select('dir', 'Convert', [['json', 'JavaScript → JSON'], ['js', 'JSON → JavaScript']], 'json'), T.opt.select('quote', 'JS quotes', [["'", "Single '"], ['"', 'Double "']], "'"),
      T.opt.select('indent', 'Indent', [['2', '2 spaces'], ['4', '4 spaces'], ['tab', 'Tab']], '2'), T.opt.check('decl', 'Add “const data =”', false)], run: run });
  T.tests['js-to-json'] = function () {
    var f = [], a = parse("export const x = { a: 1, 'b-c': 'it\\'s', d: [0x1F, -.5, 1_000,], e: undefined, f: `t`, // c\n /* x */ g: { h: null } };");
    if (JSON.stringify(a) !== '{"a":1,"b-c":"it\'s","d":[31,-0.5,1000],"e":null,"f":"t","g":{"h":null}}') f.push('parse ' + JSON.stringify(a));
    try { parse('{ a }'); f.push('shorthand accepted'); } catch (e) { if (e.message.indexOf('Shorthand') < 0) f.push(e.message); }
    try { parse('{ a: foo() }'); f.push('code accepted'); } catch (e) {}
    var js = run('{"name":"A","list":[1,"x"],"my key":true}', { dir: 'js', quote: "'", indent: '2', decl: false });
    if (js !== "{\n  name: 'A',\n  list: [\n    1,\n    'x'\n  ],\n  'my key': true\n}") f.push('to js ' + js);
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
