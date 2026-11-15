/* Infinity by GroupChatOn — json-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* JSON validator: finds the exact line and column of an error, explains it in plain words, and can fix common mistakes (comments, trailing commas, single quotes). */
GCOTools.register('json-check', function (spot, T) {
  // a small JSON reader that knows WHERE it fails (browsers word JSON.parse errors differently); loose = also accept JS-style input
  function parse(src, loose) {
    var i = 0;
    function err(msg) { var e = new Error(msg); e.pos = i; throw e; }
    function show(c) { return c === undefined ? 'end of text' : c === '\n' ? 'line break' : '“' + c + '”'; }
    function ws() {
      for (;;) {
        var c = src[i];
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '﻿' || c === ' ') { i++; continue; }
        if (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*')) {
          if (!loose) err('Comments are not allowed in JSON');
          if (src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; } else { var e = src.indexOf('*/', i + 2); if (e < 0) err('A /* comment is never closed'); i = e + 2; }
          continue;
        }
        return;
      }
    }
    function str() {
      var q = src[i++], out = '';
      for (;;) {
        var c = src[i];
        if (c === undefined) err('A text value is never closed: add the missing ' + q);
        if (c === q) { i++; return out; }
        if (c === '\n') err('Line break inside a text value (write \\n instead)');
        if (c === '\\') {
          var n = src[i + 1], map = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };
          if (n === 'u') { var hx = src.slice(i + 2, i + 6); if (!/^[0-9a-fA-F]{4}$/.test(hx)) err('Bad \\u escape: it needs 4 hex digits'); out += String.fromCharCode(parseInt(hx, 16)); i += 6; continue; }
          if (n in map || (loose && n === "'")) { out += n === "'" ? "'" : map[n]; i += 2; continue; }
          err('Unknown escape \\' + n);
        }
        if (c < ' ' && c !== '\t') err('Control character inside a text value');
        if (c === '\t' && !loose) err('Tab inside a text value (write \\t instead)');
        out += c; i++;
      }
    }
    function num() {
      if (!loose && /^-?0\d/.test(src.slice(i, i + 3))) err('Numbers cannot start with 0 (like 007)');
      var m = (loose ? /^[+-]?(0x[0-9a-fA-F]+|(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)/ : /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/).exec(src.slice(i, i + 400));
      if (!m) err(/^-?0\d/.test(src.slice(i, i + 3)) ? 'Numbers cannot start with 0 (like 007)' : 'Bad number');
      i += m[0].length;
      return m[1] && /^0x/i.test(m[1]) ? parseInt(m[0], 16) : +m[0];
    }
    function word(w, v) { if (src.slice(i, i + w.length) === w) { i += w.length; return { v: v }; } return null; }
    function value() {
      ws();
      var c = src[i], r;
      if (c === '{') return obj();
      if (c === '[') return arr();
      if (c === '"' || (loose && c === "'")) return str();
      if (c === '-' || (c >= '0' && c <= '9') || (loose && (c === '+' || c === '.'))) return num();
      if ((r = word('true', true) || word('false', false) || word('null', null))) return r.v;
      if (c === "'") err('Use double quotes " for text, not single quotes \'');
      if (/^(True|False|None|undefined|NaN|Infinity)\b/.test(src.slice(i, i + 9))) err(/^None/.test(src.slice(i, i + 4)) ? 'Write null instead of None' : /^(True|False)/.test(src.slice(i, i + 5)) ? 'Write true or false in small letters' : 'JSON has no ' + /^\w+/.exec(src.slice(i))[0] + ': use null or a number');
      err(i >= src.length ? 'The JSON ends too early: something is missing at the end' : 'Unexpected ' + show(c));
    }
    function obj() {
      var o = {}; i++; ws();
      if (src[i] === '}') { i++; return o; }
      for (;;) {
        ws();
        var k, c = src[i];
        if (c === '"' || (loose && c === "'")) k = str();
        else if (loose && /[A-Za-z_$]/.test(c || '')) { k = /^[A-Za-z_$][\w$]*/.exec(src.slice(i))[0]; i += k.length; }
        else err(c === '}' ? 'Trailing comma: remove the last , before }' : c === "'" ? 'Use double quotes " around keys' : /[A-Za-z_$]/.test(c || '') ? 'Keys need double quotes: "' + /^[\w$]+/.exec(src.slice(i))[0] + '"' : 'Expected a key in double quotes');
        ws();
        if (src[i] !== ':') err('Expected : after the key "' + k + '"');
        i++; o[k] = value(); ws();
        if (src[i] === ',') { i++; ws(); if (loose && src[i] === '}') { i++; return o; } continue; }
        if (src[i] === '}') { i++; return o; }
        err(i >= src.length ? 'A } is missing at the end' : 'Expected , or } here: is a comma missing?');
      }
    }
    function arr() {
      var a = []; i++; ws();
      if (src[i] === ']') { i++; return a; }
      for (;;) {
        ws();
        if (src[i] === ']') err('Trailing comma: remove the last , before ]');
        a.push(value()); ws();
        if (src[i] === ',') { i++; ws(); if (loose && src[i] === ']') { i++; return a; } continue; }
        if (src[i] === ']') { i++; return a; }
        err(i >= src.length ? 'A ] is missing at the end' : 'Expected , or ] here: is a comma missing?');
      }
    }
    var v = value(); ws();
    if (i < src.length) err('Extra text after the JSON ends (only one value is allowed)');
    return v;
  }
  function where(src, pos) {
    var before = src.slice(0, pos), line = before.split('\n').length, col = pos - before.lastIndexOf('\n'), text = src.split('\n')[line - 1] || '';
    return { line: line, col: col, text: text.replace(/\t/g, ' ') };
  }
  function run(t, o) {
    try { return JSON.stringify(parse(t, false), null, o.indent === 'tab' ? '\t' : +o.indent); }
    catch (e) {
      if (e.pos === undefined) throw e;
      var w = where(t, e.pos), tip = '';
      try { parse(t, true); tip = '\n\nTip: press “Fix common mistakes” to repair this automatically.'; } catch (x) {}
      throw new Error('Line ' + w.line + ', column ' + w.col + ': ' + e.message + '.\n' + w.text.slice(Math.max(0, w.col - 40), w.col + 40) + '\n' + new Array(Math.min(w.col, 40)).join(' ') + '^' + tip);
    }
  }
  var tr = T.transformer(spot, { id: 'json-check', inLabel: 'JSON to check', mono: true, rows: 12, outLabel: 'Valid, formatted JSON', download: 'checked.json', type: 'application/json',
    sample: '{\n  "name": "Asha",\n  "age": 30,\n  "skills": ["Excel", "Tally",],\n  "city": \'Ludhiana\'\n}',
    options: [T.opt.select('indent', 'Indent', [['2', '2 spaces'], ['4', '4 spaces'], ['tab', 'Tab']], '2')],
    note: function (a, b) { return b ? '✓ Valid JSON · ' + b.split('\n').length + ' lines' : ''; }, run: run });
  tr.status.el.style.whiteSpace = 'pre-wrap'; tr.status.el.style.fontFamily = 'ui-monospace,Consolas,monospace';
  spot.lastChild.insertBefore(T.row([T.button('Fix common mistakes', { small: true, onclick: function () {
    try { tr.input.value = JSON.stringify(parse(tr.input.value, true), null, 2); tr.update(); } catch (e) { var w = where(tr.input.value, e.pos || 0); tr.status.error('Could not fix it automatically. Line ' + w.line + ', column ' + w.col + ': ' + e.message + '.'); }
  } })]), spot.lastChild.children[3]);
  T.tests['json-check'] = function () {
    var f = [], bad = function (s, want, line) { try { parse(s, false); f.push('accepted ' + s); } catch (e) { if (e.message.indexOf(want) < 0 || (line && where(s, e.pos).line !== line)) f.push(s.replace(/\n/g, '⏎') + ' → ' + e.message + ' line ' + where(s, e.pos).line); } };
    bad('{"a":1,}', 'Trailing comma'); bad('[1,2,]', 'Trailing comma'); bad("{'a':1}", 'double quotes'); bad('{a:1}', 'Keys need double quotes'); bad('{"a":1\n"b":2}', 'comma missing', 2);
    bad('{"a":True}', 'small letters'); bad('{"a":"x\ny"}', 'Line break'); bad('{"a":1} x', 'Extra text'); bad('{"a":[1,2}', 'Expected , or ]'); bad('{"a":01}', 'cannot start with 0'); bad('// c\n{}', 'Comments');
    if (JSON.stringify(parse(' {"a":[1,-2.5e3,true,null,"\\u0041\\n"]} ', false)) !== '{"a":[1,-2500,true,null,"A\\n"]}') f.push('valid parse');
    if (JSON.stringify(parse("// note\n{a:1, 'b':'x', c:[1,2,],}", true)) !== '{"a":1,"b":"x","c":[1,2]}') f.push('loose fix');
    return Promise.resolve({ ok: !f.length, n: 13, fails: f });
  };
});
