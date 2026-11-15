/* Infinity by GroupChatOn — html-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* HTML checker: unclosed tags, wrong nesting, stray end tags, duplicate ids and attributes, missing alt, page basics. Runs fully on the device. */
GCOTools.register('html-check', function (spot, T) {
  var VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
  var OPTIONAL = /^(p|li|dt|dd|tr|td|th|option|optgroup|thead|tbody|tfoot|colgroup|rb|rt|rp|html|head|body)$/;   // end tag may be left out (HTML spec)
  var BLOCK = /^(address|article|aside|blockquote|details|dialog|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hgroup|hr|main|menu|nav|ol|p|pre|section|table|ul)$/;
  var INLINE = /^(span|b|i|em|strong|small|code|abbr|cite|q|s|u|sub|sup|label|mark|kbd|time|var|samp|bdi|bdo|data|dfn|font)$/;
  var AUTO = { li: /^li$/, dt: /^d[dt]$/, dd: /^d[dt]$/, tr: /^(tr|td|th)$/, td: /^t[dh]$/, th: /^t[dh]$/, option: /^option$/, optgroup: /^(optgroup|option)$/,
    thead: /^(tbody|tfoot|tr|td|th)$/, tbody: /^(thead|tbody|tfoot|tr|td|th)$/, tfoot: /^(thead|tbody|tr|td|th)$/ };
  var RAW = /^(script|style|textarea|title)$/, OLD = /^(center|font|marquee|blink|big|strike|tt|frame|frameset|acronym)$/;
  var TAG = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
  function check(src) {
    var out = [], stack = [], ids = {}, starts = [0], i = 0, m;
    for (var k = 0; k < src.length; k++) if (src[k] === '\n') starts.push(k + 1);
    function lineOf(p) { var lo = 0, hi = starts.length - 1; while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (starts[mid] <= p) lo = mid; else hi = mid - 1; } return lo + 1; }
    function add(sev, p, msg) { out.push({ sev: sev, line: p < 0 ? 0 : lineOf(p), msg: msg }); }
    function pop(upto, why, at) {
      while (stack.length > upto) { var e = stack.pop(); if (!OPTIONAL.test(e.name)) add('error', e.pos, '<' + e.name + '> is not closed ' + why + (at != null ? ' (line ' + lineOf(at) + ')' : '') + '.'); }
    }
    while (i < src.length) {
      var lt = src.indexOf('<', i);
      if (lt < 0) break;
      if (src.substr(lt, 4) === '<!--') {
        var ce = src.indexOf('-->', lt + 4);
        if (ce < 0) { add('error', lt, 'This <!-- comment is never closed with -->, so everything after it is hidden.'); break; }
        i = ce + 3; continue;
      }
      if (/^<!doctype/i.test(src.substr(lt, 9)) || src[lt + 1] === '?') { var de = src.indexOf('>', lt); i = de < 0 ? src.length : de + 1; continue; }
      TAG.lastIndex = lt; m = TAG.exec(src);
      if (!m) {
        if (/[a-zA-Z\/]/.test(src[lt + 1] || '')) add('error', lt, 'Broken tag near “' + src.substr(lt, 20).split('\n')[0] + '”: check for a missing > or an unclosed quote.');
        i = lt + 1; continue;
      }
      i = TAG.lastIndex;
      var name = m[2].toLowerCase(), end = m[1] === '/', top = stack[stack.length - 1];
      if (end) {
        if (VOID.test(name)) { add('warn', lt, '<' + name + '> never has an end tag: remove </' + name + '>.'); continue; }
        var at = -1;
        for (var s = stack.length - 1; s >= 0; s--) if (stack[s].name === name) { at = s; break; }
        if (at < 0) { if (!/^(html|head|body|p|li|td|tr|th)$/.test(name) || name === 'p') add('error', lt, '</' + name + '> has no matching <' + name + '> before it.'); continue; }
        pop(at + 1, 'before </' + name + '>', lt);
        stack.pop();
        continue;
      }
      // the start tag's attributes
      var seen = {}, attrs = {}, re = /([^\s"'>\/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g, a;
      while ((a = re.exec(m[3]))) {
        var an = a[1].toLowerCase(), av = a[2] === undefined ? null : a[2].replace(/^["']|["']$/g, '');
        if (seen[an]) add('error', lt, '<' + name + '> has the attribute “' + an + '” twice; browsers ignore the second one.');
        seen[an] = 1; attrs[an] = av;
      }
      if (attrs.id != null) {
        if (!attrs.id) add('error', lt, 'Empty id="" on <' + name + '>.');
        else if (ids[attrs.id] != null) add('error', lt, 'Duplicate id “' + attrs.id + '” (first used on line ' + lineOf(ids[attrs.id]) + '). Every id must be unique.');
        else ids[attrs.id] = lt;
      }
      if (name === 'img') {
        if (!('alt' in attrs)) add('warn', lt, '<img> has no alt text. Describe the image, or use alt="" if it is only decoration.');
        if (!attrs.src) add('error', lt, '<img> has no src, so nothing can show.');
      }
      if (OLD.test(name)) add('warn', lt, '<' + name + '> is obsolete in HTML5: use CSS instead.');
      // end tags the HTML parser adds by itself (a new <li> closes the open <li>, a block closes an open <p>…)
      if (top && top.name === 'p' && BLOCK.test(name)) { stack.pop(); top = stack[stack.length - 1]; }
      while (top && AUTO[name] && AUTO[name].test(top.name)) { stack.pop(); top = stack[stack.length - 1]; }
      if (top && BLOCK.test(name) && INLINE.test(top.name)) add('warn', lt, 'Wrong nesting: block <' + name + '> inside inline <' + top.name + '> (line ' + lineOf(top.pos) + ').');
      if (name === 'a' && stack.some(function (e) { return e.name === 'a'; })) add('error', lt, 'A link <a> inside another link is not allowed.');
      if (/^(a|button|input|select|textarea)$/.test(name) && stack.some(function (e) { return e.name === 'button'; })) add('error', lt, '<' + name + '> inside a <button> is not allowed: buttons cannot hold other controls.');
      if (name === 'li' && top && !/^(ul|ol|menu)$/.test(top.name)) add('warn', lt, '<li> should be directly inside <ul> or <ol>, not <' + top.name + '>.');
      if (m[4] && !VOID.test(name) && !/:/.test(name) && !/^(svg|path|circle|rect|line|polyline|polygon|ellipse|use|stop|g|image)$/.test(name)) { add('warn', lt, '<' + name + ' /> does not close itself in HTML: write <' + name + '></' + name + '>.'); stack.push({ name: name, pos: lt }); continue; }
      if (m[4] || VOID.test(name)) continue;
      if (RAW.test(name)) {
        var close = src.toLowerCase().indexOf('</' + name, i);
        if (close < 0) { add('error', lt, '<' + name + '> is never closed with </' + name + '>.'); break; }
        var ge = src.indexOf('>', close); i = ge < 0 ? src.length : ge + 1; continue;
      }
      stack.push({ name: name, pos: lt });
    }
    pop(0, 'by the end of the file');
    if (/<html[\s>]/i.test(src)) {
      if (!/^\s*(<!--[\s\S]*?-->\s*)*<!doctype html/i.test(src)) add('warn', -1, 'Add <!DOCTYPE html> as the very first line so browsers use standards mode.');
      if (!/<html[^>]*\slang\s*=\s*["']?\w/i.test(src)) add('warn', -1, '<html> has no lang attribute (for example lang="en"). Screen readers and translators need it.');
      if (!/<title>\s*[^<\s]/i.test(src)) add('warn', -1, 'The page has no <title>. It shows in tabs, bookmarks and search results.');
      if (!/<meta[^>]+charset/i.test(src)) add('warn', -1, 'Add <meta charset="utf-8"> so every letter and symbol shows correctly.');
      if (!/<meta[^>]+name\s*=\s*["']?viewport/i.test(src)) add('warn', -1, 'No viewport meta tag: the page will look tiny on phones.');
    }
    return out;
  }
  function checkUI(o) {
    var h = T.h, status = T.status(), list = h('div', { 'class': 'tkv', 'data-out': '' }), timer, seq = 0;
    var input = h('textarea', { rows: '12', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': o.label, placeholder: o.ph || 'Paste your code here…' });
    input.value = T.store.get(o.id + '-in', '');
    function opts() { var r = {}; (o.options || []).forEach(function (el) { [el].concat([].slice.call(el.querySelectorAll('[data-opt]'))).forEach(function (x) { var k = x.getAttribute('data-opt'); if (k) r[k] = x.type === 'checkbox' ? x.checked : typeof x.value === 'function' ? x.value() : x.value; }); }); return r; }
    function show(line) {
      var L = input.value.split('\n'), p = 0;
      for (var k = 0; k < line - 1 && k < L.length; k++) p += L[k].length + 1;
      input.focus(); input.setSelectionRange(p, p + (L[line - 1] || '').length);
      input.scrollTop = Math.max(0, (line - 3) * (parseFloat(getComputedStyle(input).lineHeight) || 22));
    }
    function run() {
      T.store.set(o.id + '-in', input.value.slice(0, 200000));
      var tok = ++seq;
      if (!input.value.trim()) { list.innerHTML = ''; status.clear(); if (o.after) o.after(null); return; }
      if (o.slow) status.info('Checking…');
      Promise.resolve().then(function () { return o.check(input.value, opts(), status); }).then(function (r) { if (tok === seq) draw(r); }, function (e) { if (tok === seq) { list.innerHTML = ''; status.error(e); } });
    }
    function draw(issues) {
      list.innerHTML = '';
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0) || (a.col || 0) - (b.col || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok || '✓ No problems found.');
      else status.info((e ? e + (e > 1 ? ' errors' : ' error') : 'No errors') + (w ? ', ' + w + (w > 1 ? ' warnings' : ' warning') : '') + '. Tap Show to jump to the line.');
      issues.slice(0, 300).forEach(function (x) {
        list.appendChild(h('div', {}, [h('span', { 'class': x.sev === 'error' ? 'tout-c' : '', style: 'font-weight:700', text: (x.sev === 'error' ? '✕ ' : '! ') + (x.line ? 'Line ' + x.line + (x.col ? ':' + x.col : '') : 'Whole file') }),
          h('span', { text: x.msg }), x.line ? T.button('Show', { small: true, onclick: function () { show(x.line); } }) : h('span')]));
      });
      if (o.after) o.after(issues);
    }
    var go = o.button ? T.button(o.button, { primary: true, onclick: run }) : null;
    spot.appendChild(T.card([T.field(o.label, input), (o.options || []).length ? h('div', { 'class': 'topts' }, o.options) : null,
      T.row([go, T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; run(); } }), T.button('Clear', { small: true, onclick: function () { input.value = ''; run(); input.focus(); } })]),
      status.el, list].concat(o.extra || [])));
    spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
    if (!o.button) input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, o.delay || 300); });
    (o.options || []).forEach(function (el) { el.addEventListener('change', run); el.addEventListener('click', function (ev) { if (ev.target.tagName === 'BUTTON') setTimeout(run, 0); }); });
    if (!o.button) run();
    return { input: input, run: run, status: status };
  }
  checkUI({ id: 'html-check', label: 'HTML to check', check: check,
    sample: '<!DOCTYPE html>\n<html>\n<head><title>My shop</title></head>\n<body>\n  <div id="menu">\n    <ul>\n      <li><a href="/">Home</a>\n      <li><a href="/shop">Shop</a></li>\n    </ul>\n  <div id="menu">\n    <p>Welcome to <b><i>our shop</b></i>\n    <img src="logo.png">\n    <span><div>Offer</div></span>\n  </div>\n</body>\n</html>' });
  T.tests['html-check'] = function () {
    var f = [], c = function (s, err, warn, want) {
      var r = check(s), e = r.filter(function (x) { return x.sev === 'error'; }).length, w = r.length - e;
      if (e !== err || w !== warn || (want && !r.some(function (x) { return x.msg.indexOf(want) >= 0; }))) f.push(s.slice(0, 40) + ' → ' + e + 'e/' + w + 'w ' + r.map(function (x) { return x.msg; }).join(' | ').slice(0, 160));
    };
    c('<div><p>Hi</div>', 0, 0); c('<ul><li>a<li>b</ul>', 0, 0); c('<table><tr><td>1<td>2<tr><td>3</table>', 0, 0);
    c('<div><span>Hi</div>', 1, 0, '<span> is not closed'); c('<b><i>x</b></i>', 2, 0, 'no matching');
    c('<img src=a.png>', 0, 1, 'alt'); c('<p id=a></p><p id="a"></p>', 1, 0, 'Duplicate id'); c('<div class="a" class="b"></div>', 1, 0, 'twice');
    c('<div>', 1, 0, 'end of the file'); c('<span><div>x</div></span>', 0, 1, 'Wrong nesting'); c('<script>if (a<b && c>d) {}</script><br></br>', 0, 1);
    c('<a href="#">x<a href="#">y</a></a>', 1, 0, 'inside another link'); c('<!-- open', 1, 0, 'comment');
    c('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>A</title></head><body><p>x</body></html>', 0, 0);
    return Promise.resolve({ ok: !f.length, n: 14, fails: f });
  };
});
