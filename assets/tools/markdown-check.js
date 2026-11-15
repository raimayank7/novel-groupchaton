/* Infinity by GroupChatOn — markdown-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Markdown checker (linter): heading order, spacing, broken and empty links, missing alt text, unclosed code blocks, bare URLs, mixed list markers and more. Rules follow common markdownlint practice. */
GCOTools.register('markdown-check', function (spot, T) {
  var h = T.h;
  function check(src) {
    var out = [], L = src.replace(/\r/g, '').split('\n'), fence = null, fenceLine = 0, lastH = 0, h1 = 0, heads = {}, blanks = 0, marker = null, defs = {};
    function add(sev, ln, msg) { out.push({ sev: sev, line: ln, msg: msg }); }
    L.forEach(function (l) { var m = /^ {0,3}\[([^\]]+)\]:\s*\S/.exec(l); if (m) defs[m[1].toLowerCase()] = 1; });
    L.forEach(function (l, k) {
      var ln = k + 1, f = /^ {0,3}(`{3,}|~{3,})\s*(.*)$/.exec(l);
      if (l.trim()) blanks = 0;
      if (fence) { if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) fence = null; return; }
      if (f) { fence = f[1]; fenceLine = ln; if (!f[2].trim()) add('warn', ln, 'Code block without a language (for example ```js or ```python): add one for syntax colours.'); return; }
      if (!l.trim()) { blanks++; if (blanks === 2) add('warn', ln, 'Two or more blank lines in a row: one is enough.'); return; }
      blanks = 0;
      if (/\t/.test(l)) add('warn', ln, 'Tab character: use spaces, because tabs look different in every app.');
      var tr = / +$/.exec(l);
      if (tr && tr[0].length !== 2) add('warn', ln, 'Spaces at the end of the line. (Exactly two spaces make a line break; other amounts are just noise.)');
      if (/^ {0,3}#{1,6}[^#\s]/.test(l)) add('error', ln, 'No space after #: write “# Title” or it will not show as a heading.');
      var hm = /^ {0,3}(#{1,6})(\s+)(.*?)(\s+#+)?\s*$/.exec(l) || /^ {0,3}(#{1,6})()()\s*$/.exec(l);
      if (hm) {
        var lv = hm[1].length, text = hm[3].trim();
        if (hm[2].length > 1) add('warn', ln, 'More than one space after #.');
        if (!text) add('error', ln, 'Empty heading.');
        if (lastH && lv > lastH + 1) add('warn', ln, 'Heading level jumps from H' + lastH + ' to H' + lv + ': do not skip levels.');
        lastH = lv;
        if (lv === 1 && ++h1 === 2) add('warn', ln, 'More than one H1 heading: a page should have one main title.');
        var key = text.toLowerCase();
        if (key && heads[key]) add('warn', ln, 'Same heading text as line ' + heads[key] + '.'); else heads[key] = ln;
        if (/[.,;:!]$/.test(text)) add('warn', ln, 'Heading ends with “' + text.slice(-1) + '”: headings need no punctuation.');
        if (k > 0 && L[k - 1].trim()) add('warn', ln, 'Put a blank line before this heading.');
        if (k < L.length - 1 && L[k + 1].trim()) add('warn', ln, 'Put a blank line after this heading.');
      }
      var lm = /^(\s*)([*+-])\s+\S/.exec(l);
      if (lm && !/^\s*([*-])(\s*\1){2,}\s*$/.test(l)) { if (!lm[1]) { if (marker && marker !== lm[2]) add('warn', ln, 'Mixed list markers: use ' + marker + ' for the whole list.'); marker = marker || lm[2]; } }
      else if (!/^\s/.test(l) && !/^\d+[.)]\s/.test(l)) marker = null;
      var t = l.replace(/(`+)[\s\S]*?\1/g, ''), m;
      if (/\[[^\]]*\]\(\s*\)/.test(t)) add('error', ln, 'Empty link: [text]() has no address.');
      if (/!\[\s*\]\(/.test(t)) add('warn', ln, 'Image without alt text: write ![what it shows](image.png).');
      if (/(^|[^!\]\w])\([^()]+\)\[(https?:\/\/|\/|www\.|#)[^\]]*\]/.test(t)) add('error', ln, 'Reversed link: write [text](address), not (text)[address].');
      if (/\[\s+[^\]]*\]\(|\[[^\]]*\S\s+\]\(/.test(t)) add('warn', ln, 'Spaces just inside the link text brackets [ like this ].');
      var u = t.replace(/!?\[[^\]]*\]\([^)]*\)/g, '').replace(/<https?:[^>]+>/g, '').replace(/^ {0,3}\[[^\]]+\]:\s*\S+/, '').replace(/\([^()]*\)\[[^\]]*\]/g, '');
      if (/(^|[\s(])https?:\/\/[^\s)]+/.test(u)) add('warn', ln, 'Bare web address: write <https://…> or [text](https://…) so every app turns it into a link.');
      var re = /\[([^\]]+)\]\[([^\]]*)\]/g;
      while ((m = re.exec(t))) { var id = (m[2] || m[1]).toLowerCase(); if (!defs[id]) add('error', ln, 'Link reference [' + id + '] is never defined (add a line like [' + id + ']: https://…).'); }
    });
    if (fence) add('error', fenceLine, 'This code block (' + fence + ') is never closed, so the rest of the file shows as code.');
    return out;
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
      if (!input.value.trim()) { list.innerHTML = ''; status.clear(); return; }
      Promise.resolve().then(function () { return o.check(input.value); }).then(function (r) { if (tok === seq) draw(r); }, function (e) { if (tok === seq) { list.innerHTML = ''; status.error(e); } });
    }
    function draw(issues) {
      list.innerHTML = '';
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok);
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
  checkUI({ id: 'markdown-check', label: 'Markdown to check', check: check, ok: '✓ No problems found.',
    sample: '# Project notes\n## Install\nRun the installer from https://example.com/download   \n\n\n#Usage\n\n#### Options\n\n* Fast mode\n- Safe mode\n\nSee the (guide)[https://example.com/guide] and the [FAQ][faq].\n\n![](screen.png)\n\n```\nnpm start\n' });
  T.tests['markdown-check'] = function () {
    var f = [], c = function (s, err, warn, want) {
      var r = check(s), e = r.filter(function (x) { return x.sev === 'error'; }).length, w = r.length - e;
      if (e !== err || w !== warn || (want && !r.some(function (x) { return x.msg.indexOf(want) >= 0; }))) f.push(s.replace(/\n/g, '⏎').slice(0, 40) + ' → ' + e + 'e/' + w + 'w ' + r.map(function (x) { return x.line + ':' + x.msg; }).join(' | ').slice(0, 160));
    };
    c('#Title', 1, 0, 'No space'); c('# A\n\n### B', 0, 1, 'jumps'); c('# A\n\n# B', 0, 1, 'one H1'); c('```\ncode', 1, 1, 'never closed'); c('[x]()', 1, 0, 'Empty link');
    c('![](a.png)', 0, 1, 'alt'); c('See https://a.com now', 0, 1, 'Bare'); c('[a][b]', 1, 0, 'never defined'); c('[a][b]\n\n[b]: https://x.com', 0, 0);
    c('(text)[https://a.com]', 1, 0, 'Reversed'); c('* a\n- b', 0, 1, 'Mixed'); c('# Title.', 0, 1, 'punctuation');
    c('# Title\n\nSome *text* with a [link](https://a.com) and `code https://x`.\n\n## Part\n\n- one\n- two\n\n1. first\n2. second\n\n```js\nlet a = 1;   \n```\n', 0, 0);
    return Promise.resolve({ ok: !f.length, n: 13, fails: f });
  };
});
