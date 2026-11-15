/* Infinity by GroupChatOn — yaml-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* YAML validator: exact line and column of syntax errors, duplicate keys and tab indents, warnings for values like “no” that some tools read as false, and the parsed data as JSON. */
GCOTools.register('yaml-check', function (spot, T) {
  var h = T.h, json = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, spellcheck: 'false', 'aria-label': 'Parsed data as JSON' }), last = '';
  function warnings(src) {
    var out = [], L = src.replace(/\r/g, '').split('\n'), block = false;
    L.forEach(function (l, k) {
      if (/^\s*#/.test(l) || !l.trim()) return;
      var ind = /^\s*/.exec(l)[0].length;
      if (block !== false) { if (ind > block) return; block = false; }
      if (/:\s*[|>][-+0-9]*\s*(#.*)?$/.test(l)) { block = ind; return; }
      var m = /^\s*(?:-\s+)?[^#'"]*?:\s+(yes|no|on|off|y|n)\s*(#.*)?$/i.exec(l);
      if (m) out.push({ sev: 'warn', line: k + 1, msg: '“' + m[1] + '” is read as true/false by YAML 1.1 tools (like older Docker Compose and Ansible). Put it in quotes if you mean the text.' });
      if (/^\s*(?:-\s+)?[A-Za-z_][\w.-]*:[^\s:\/\[{]/.test(l) && !/^\s*(?:-\s+)?[A-Za-z_][\w.-]*:\/\//.test(l)) out.push({ sev: 'warn', line: k + 1, msg: 'No space after “:”, so this is read as one piece of text, not key: value.' });
      if (/\S[ \t]+$/.test(l)) out.push({ sev: 'warn', line: k + 1, msg: 'Spaces at the end of the line.' });
    });
    return out;
  }
  function check(src) {
    return T.lib('yaml').then(function (Y) {
      var out = warnings(src), docs;
      last = '';
      try { docs = Y.loadAll(src); }
      catch (e) {
        var why = String(e.reason || e.message);
        out.push({ sev: 'error', line: e.mark ? e.mark.line + 1 : 0, col: e.mark ? e.mark.column + 1 : 0, msg: why.charAt(0).toUpperCase() + why.slice(1) + (/tab/i.test(why) ? '. YAML indents with spaces only.' : '.') });
        return out;
      }
      last = JSON.stringify(docs.length === 1 ? docs[0] : docs, null, 2) || '';
      return out;
    });
  }
  function checkUI(o) {
    var status = T.status(), list = h('div', { 'class': 'tkv', 'data-out': '' }), timer, seq = 0;
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
      if (!input.value.trim()) { list.innerHTML = ''; status.clear(); last = ''; o.after(); return; }
      Promise.resolve().then(function () { return o.check(input.value); }).then(function (r) { if (tok === seq) draw(r); }, function (e) { if (tok === seq) { list.innerHTML = ''; status.error(e); } });
    }
    function draw(issues) {
      list.innerHTML = '';
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0) || (a.col || 0) - (b.col || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok);
      else status.info((e ? e + (e > 1 ? ' errors' : ' error') : 'Valid YAML') + (w ? ', ' + w + (w > 1 ? ' warnings' : ' warning') : '') + '. Tap Show to jump to the line.');
      issues.slice(0, 300).forEach(function (x) {
        list.appendChild(h('div', {}, [h('span', { 'class': x.sev === 'error' ? 'tout-c' : '', style: 'font-weight:700', text: (x.sev === 'error' ? '✕ ' : '! ') + (x.line ? 'Line ' + x.line + (x.col ? ':' + x.col : '') : 'Whole file') }),
          h('span', { text: x.msg }), x.line ? T.button('Show', { small: true, onclick: function () { show(x.line); } }) : h('span')]));
      });
      o.after();
    }
    spot.appendChild(T.card([T.field(o.label, input),
      T.row([T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; run(); } }), T.button('Clear', { small: true, onclick: function () { input.value = ''; run(); input.focus(); } })]),
      status.el, list].concat(o.extra)));
    spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 300); });
    run();
  }
  var box = h('div', { hidden: true }, [T.field('Parsed data (JSON)', json), T.row([T.button('Copy JSON', { onclick: function (e) { T.copy(json.value, e.currentTarget); } })])]);
  checkUI({ id: 'yaml-check', label: 'YAML to check', check: check, ok: '✓ Valid YAML.', extra: [box],
    after: function () { json.value = last; box.hidden = !last; },
    sample: 'name: My app\nversion: 1.2\ncountry: NO\nservices:\n  web:\n    image: nginx\n    ports:\n      - "8080:80"\n  db:\n    image: postgres\n     restart: always\n' });
  T.tests['yaml-check'] = function () {
    var f = [], n = 0;
    function c(s, err, warn, want) {
      n++;
      return check(s).then(function (r) {
        var e = r.filter(function (x) { return x.sev === 'error'; }).length, w = r.length - e;
        if (e !== err || w !== warn || (want && !r.some(function (x) { return (x.line + ' ' + x.msg).indexOf(want) >= 0; }))) f.push(s.replace(/\n/g, '⏎').slice(0, 40) + ' → ' + e + 'e/' + w + 'w ' + r.map(function (x) { return x.line + ' ' + x.msg; }).join(' | ').slice(0, 160));
      });
    }
    return c('a: 1\nb: [1, 2\n', 1, 0).then(function () { return c('a: 1\na: 2\n', 1, 0, 'uplicated'); }).then(function () { return c('country: NO\n', 0, 1, 'quotes'); })
      .then(function () { return c('a:\n\t- 1\n', 1, 0); }).then(function () { return c('key:value\n', 0, 1, 'No space'); })
      .then(function () { return c('a:\n  b: 2\n   c: 3\n', 1, 0); })
      .then(function () { return c('# config\nurl: https://example.com/x\ntext: |\n  on: yes\nlist:\n  - name: "no"\n    n: 2\n---\nsecond: true\n', 0, 0); })
      .then(function () {
        var j = null; try { j = JSON.parse(last); } catch (e) {}
        if (!j || j[1].second !== true || j[0].list[0].n !== 2 || j[0].text !== 'on: yes\n') f.push('JSON output ' + last.slice(0, 80));
        return { ok: !f.length, n: n + 1, fails: f };
      });
  };
});
