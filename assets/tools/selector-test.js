/* Infinity by GroupChatOn — selector-test. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS selector tester: paste HTML, type a selector, and see exactly which elements it matches. */
GCOTools.register('selector-test', function (spot, T) {
  var h = T.h;
  function match(html, sel) {
    var d = new DOMParser().parseFromString(html, 'text/html'), list;
    try { list = d.querySelectorAll(sel); } catch (e) { throw new Error('“' + sel + '” is not a valid CSS selector.'); }
    return Array.prototype.map.call(list, function (el) {
      var attrs = Array.prototype.map.call(el.attributes, function (a) { return ' ' + a.name + (a.value ? '="' + a.value + '"' : ''); }).join(''), text = el.textContent.replace(/\s+/g, ' ').trim();
      var path = [], n = el; while (n && n.nodeType === 1 && n.tagName !== 'HTML') { path.unshift(n.tagName.toLowerCase()); n = n.parentNode; }
      return { tag: '<' + el.tagName.toLowerCase() + attrs + '>', text: text.length > 50 ? text.slice(0, 49) + '…' : text, path: path.join(' > ') };
    });
  }
  var html = h('textarea', { rows: '9', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'HTML' }), sel = h('input', { type: 'text', 'class': 'tmono', placeholder: 'e.g. ul.menu > li:not(.active) a', 'aria-label': 'CSS selector' });
  var out = h('textarea', { rows: '8', 'class': 'tout tmono', readonly: true, 'aria-label': 'Matches' }), status = T.status();
  html.value = T.store.get('seltest-html', '<nav>\n  <ul class="menu">\n    <li class="active"><a href="/">Home</a></li>\n    <li><a href="/tools">Tools</a></li>\n    <li><a href="/blog" target="_blank">Blog</a></li>\n  </ul>\n</nav>\n<p class="note">Built with <a href="#">love</a></p>');
  sel.value = T.store.get('seltest-sel', 'ul.menu > li:not(.active) a');
  function go() {
    T.store.set('seltest-html', html.value.slice(0, 50000)); T.store.set('seltest-sel', sel.value);
    out.value = '';
    if (!sel.value.trim()) { status.info('Type a selector.'); return; }
    try {
      var m = match(html.value, sel.value);
      out.value = m.map(function (x, i) { return (i + 1) + '. ' + x.tag + (x.text ? '  “' + x.text + '”' : '') + '\n   ' + x.path; }).join('\n');
      if (m.length) status.ok(m.length + ' element' + (m.length > 1 ? 's' : '') + ' matched.'); else status.info('No elements match this selector.');
    } catch (e) { status.error(e); }
  }
  [html, sel].forEach(function (x) { x.addEventListener('input', go); });
  var tips = ['a[target="_blank"]', 'li:first-child', 'li:nth-child(2n)', '.menu a', 'nav ~ p', 'a:not([href^="/"])'];
  spot.appendChild(T.card([T.field('HTML', html), T.field('CSS selector', sel), T.row(tips.map(function (t) { return T.button(t, { small: true, onclick: function () { sel.value = t; go(); } }); })), status.el, T.field('Matched elements', out)]));
  go();
  T.tests['selector-test'] = function () {
    var f = [], H = '<ul class="m"><li class="a"><a href="/">H</a></li><li><a href="/t">T</a></li><li><a href="http://x" target="_blank">B</a></li></ul>';
    if (match(H, 'ul.m > li:not(.a) a').length !== 2) f.push('not');
    if (match(H, 'a[target="_blank"]')[0].text !== 'B' || match(H, 'li:nth-child(2n)').length !== 1) f.push('attr / nth');
    if (match(H, 'li:first-child a')[0].path !== 'body > ul > li > a') f.push('path ' + match(H, 'li:first-child a')[0].path);
    try { match(H, 'li::'); f.push('bad selector accepted'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
