/* Infinity by GroupChatOn — json-to-ts. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* JSON to code types: TypeScript interfaces, Go structs or Python dataclasses from a JSON sample, with nested types and optional fields. */
GCOTools.register('json-to-ts', function (spot, T) {
  function pascal(s) { var r = String(s).replace(/[^A-Za-z0-9]+(.)?/g, function (m, c) { return c ? c.toUpperCase() : ''; }); r = r.charAt(0).toUpperCase() + r.slice(1); return /^\d/.test(r) ? 'T' + r : r || 'Item'; }
  function single(s) { return /ies$/i.test(s) ? s.slice(0, -3) + 'y' : /(ss|us)$/i.test(s) ? s : /s$/i.test(s) && s.length > 3 ? s.slice(0, -1) : s + 'Item'; }
  function model(json, rootName) {
    var types = [], used = {};
    function uniq(n) { var b = n, i = 2; while (used[n]) n = b + i++; used[n] = true; return n; }
    function infer(v, hint) {
      if (v === null) return { k: 'null' };
      if (Array.isArray(v)) {
        if (!v.length) return { k: 'arr', of: { k: 'any' } };
        var objs = v.filter(function (x) { return x && typeof x === 'object' && !Array.isArray(x); });
        if (objs.length === v.length) return { k: 'arr', of: struct(objs, single(hint)) };
        return { k: 'arr', of: v.map(function (x) { return infer(x, single(hint)); }).reduce(merge) };
      }
      if (typeof v === 'object') return struct([v], hint);
      if (typeof v === 'number') return { k: Number.isInteger(v) ? 'int' : 'float' };
      return { k: typeof v === 'boolean' ? 'bool' : 'string' };
    }
    function struct(objs, hint) {
      var t = { k: 'obj', name: uniq(pascal(hint)), fields: [] }, keys = [];
      types.push(t);
      objs.forEach(function (o) { Object.keys(o).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); }); });
      keys.forEach(function (k) {
        var have = objs.filter(function (o) { return k in o; }), vals = have.map(function (o) { return o[k]; }), sub;
        var oo = vals.filter(function (x) { return x && typeof x === 'object' && !Array.isArray(x); });
        if (oo.length && oo.length === vals.filter(function (x) { return x !== null; }).length) sub = struct(oo, k);
        else sub = vals.map(function (x) { return infer(x, k); }).reduce(merge);
        var nullable = vals.some(function (x) { return x === null; });
        if (sub.k === 'null') nullable = true;
        t.fields.push({ key: k, t: sub.k === 'null' ? { k: 'any' } : sub, opt: have.length < objs.length, nul: nullable && sub.k !== 'null' });
      });
      return t;
    }
    function merge(a, b) {
      if (a.k === 'null') return b; if (b.k === 'null') return a;
      if (a.k === b.k && a.k !== 'arr') return a;
      if ((a.k === 'int' && b.k === 'float') || (a.k === 'float' && b.k === 'int')) return { k: 'float' };
      if (a.k === 'arr' && b.k === 'arr') return { k: 'arr', of: merge(a.of, b.of) };
      return { k: 'any' };
    }
    var root = infer(json, rootName);
    return { root: root, types: types };
  }
  var GO_INIT = { id: 'ID', url: 'URL', api: 'API', uri: 'URI', ip: 'IP', http: 'HTTP', json: 'JSON', html: 'HTML', uuid: 'UUID', sku: 'SKU' };
  function goName(k) { var parts = String(k).split(/[^A-Za-z0-9]+/).filter(Boolean), r = parts.map(function (p) { return GO_INIT[p.toLowerCase()] || p.charAt(0).toUpperCase() + p.slice(1); }).join(''); return /^\d/.test(r) ? 'F' + r : r || 'Field'; }
  var LANG = {
    ts: { t: function (x) { return { string: 'string', int: 'number', float: 'number', bool: 'boolean', any: 'unknown', obj: x.name }[x.k] || (x.k === 'arr' ? (x.of.k === 'any' ? 'unknown' : LANG.ts.t(x.of)) + '[]' : 'unknown'); },
      out: function (m) {
        var s = m.types.map(function (t) {
          return 'export interface ' + t.name + ' {\n' + t.fields.map(function (f) {
            return '  ' + (/^[A-Za-z_$][\w$]*$/.test(f.key) ? f.key : JSON.stringify(f.key)) + (f.opt ? '?' : '') + ': ' + LANG.ts.t(f.t) + (f.nul ? ' | null' : '') + ';';
          }).join('\n') + '\n}';
        });
        if (m.root.k !== 'obj') s.push('export type Root = ' + LANG.ts.t(m.root) + ';');
        return s.join('\n\n');
      } },
    go: { t: function (x) { return { string: 'string', int: 'int', float: 'float64', bool: 'bool', any: 'interface{}', obj: x.name }[x.k] || (x.k === 'arr' ? '[]' + LANG.go.t(x.of) : 'interface{}'); },
      out: function (m) {
        var s = m.types.map(function (t) {
          var rows = t.fields.map(function (f) { var ty = LANG.go.t(f.t); return [goName(f.key), (f.nul && f.t.k !== 'any' && f.t.k !== 'arr' ? '*' : '') + ty, '`json:"' + f.key + (f.opt || f.nul ? ',omitempty' : '') + '"`']; });
          var w0 = Math.max.apply(0, rows.map(function (r) { return r[0].length; }).concat(0)), w1 = Math.max.apply(0, rows.map(function (r) { return r[1].length; }).concat(0));
          return 'type ' + t.name + ' struct {\n' + rows.map(function (r) { return '\t' + (r[0] + new Array(w0 + 1).join(' ')).slice(0, w0) + ' ' + (r[1] + new Array(w1 + 1).join(' ')).slice(0, w1) + ' ' + r[2]; }).join('\n') + '\n}';
        });
        if (m.root.k !== 'obj') s.push('type Root ' + LANG.go.t(m.root));
        return s.join('\n\n');
      } },
    py: { t: function (x) { return { string: 'str', int: 'int', float: 'float', bool: 'bool', any: 'Any', obj: x.name }[x.k] || (x.k === 'arr' ? 'List[' + LANG.py.t(x.of) + ']' : 'Any'); },
      out: function (m) {
        var s = m.types.slice().reverse().map(function (t) {
          var req = t.fields.filter(function (f) { return !f.opt && !f.nul; }), opt = t.fields.filter(function (f) { return f.opt || f.nul; });
          var name = function (k) { var n = String(k).replace(/[^A-Za-z0-9_]/g, '_'); return /^\d/.test(n) ? '_' + n : n; };
          return '@dataclass\nclass ' + t.name + ':\n' + (t.fields.length ? req.map(function (f) { return '    ' + name(f.key) + ': ' + LANG.py.t(f.t); })
            .concat(opt.map(function (f) { return '    ' + name(f.key) + ': Optional[' + LANG.py.t(f.t) + '] = None'; })).join('\n') : '    pass');
        });
        if (m.root.k !== 'obj') s.push('Root = ' + LANG.py.t(m.root));
        return 'from dataclasses import dataclass\nfrom typing import Any, List, Optional\n\n\n' + s.join('\n\n\n');
      } }
  };
  function run(t, o) {
    var j; try { j = JSON.parse(t); } catch (e) { throw new Error('This is not valid JSON: ' + e.message); }
    return LANG[o.lang].out(model(j, o.root || 'Root'));
  }
  T.transformer(spot, { id: 'json-to-ts', inLabel: 'JSON sample', mono: true, rows: 12, outLabel: 'Types', download: false,
    sample: '{\n  "id": 101,\n  "name": "Asha Verma",\n  "email": "asha@example.com",\n  "is_active": true,\n  "rating": 4.8,\n  "address": { "city": "Ludhiana", "pin": "141001" },\n  "orders": [\n    { "order_id": 1, "total": 499.5, "items": ["pen", "notebook"] },\n    { "order_id": 2, "total": 120, "coupon": "SAVE10" }\n  ],\n  "manager": null\n}',
    options: [T.opt.select('lang', 'Language', [['ts', 'TypeScript interfaces'], ['go', 'Go structs'], ['py', 'Python dataclasses']], 'ts'), T.opt.text('root', 'Main type name', 'Root')], run: run });
  T.tests['json-to-ts'] = function () {
    var f = [], j = '{"id":1,"name":"A","tags":["x"],"address":{"city":"Delhi"},"items":[{"a":1},{"a":2.5,"b":true}],"note":null,"first-name":"B"}';
    var ts = run(j, { lang: 'ts', root: 'Root' });
    ['export interface Root {', '  id: number;', '  tags: string[];', '  address: Address;', '  items: Item[];', 'export interface Item {', '  b?: boolean;', '  note: unknown;', '  "first-name": string;']
      .forEach(function (x) { if (ts.indexOf(x) < 0) f.push('ts missing ' + x); });
    var go = run(j, { lang: 'go', root: 'Root' });
    if (!/\tID +int +`json:"id"`/.test(go) || go.indexOf('[]Item') < 0 || go.indexOf('float64') < 0 || go.indexOf('FirstName') < 0) f.push('go ' + go.slice(0, 120));
    var py = run(j, { lang: 'py', root: 'Root' });
    if (py.indexOf('class Address:') > py.indexOf('class Root:') || py.indexOf('    b: Optional[bool] = None') < 0 || py.indexOf('    items: List[Item]') < 0) f.push('py');
    if (run('[1,2,3]', { lang: 'ts', root: 'Root' }) !== 'export type Root = number[];') f.push('array root');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
