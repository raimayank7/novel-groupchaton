/* Markdown to HTML — live preview and clean HTML code (GitHub-style: tables, task lists, code blocks).
   The preview is cleaned by DOMPurify, so pasted Markdown can never run scripts.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('markdown', function (spot, T) {
  var h = T.h;
  var input = h('textarea', { rows: '14', 'class': 'tmono', placeholder: '# Heading\n\nWrite **Markdown** here…', 'aria-label': 'Markdown', spellcheck: 'false' });
  input.value = T.store.get('markdown', '# Hello, Infinity\n\nWrite **bold**, *italic* and `code`.\n\n- [x] Task done\n- [ ] Task to do\n\n| Tool | Free |\n|------|------|\n| PDF  | Yes  |\n\n> A quote\n\n```js\nconsole.log("hi");\n```');
  var preview = h('div', { 'class': 'tmd-preview post-body', 'aria-label': 'Preview' });
  var code = h('textarea', { rows: '8', 'class': 'tmono', readonly: true, 'aria-label': 'HTML code' });
  var tab = T.seg([['preview', 'Preview'], ['html', 'HTML code']], 'preview', show);
  var status = T.status();
  var copy = T.button('Copy HTML', { onclick: function () { T.copy(code.value, copy); } });
  var dl = T.button('Download .html', { onclick: function () {
    T.download(new Blob(['<!doctype html><meta charset="utf-8"><title>Document</title>\n' + code.value], { type: 'text/html' }), 'document.html'); } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Markdown', input), h('div', {}, [tab, preview, code])]), status.el, T.row([copy, dl])]));
  function show() { preview.hidden = tab.value() !== 'preview'; code.hidden = !preview.hidden; }
  var libs = Promise.all([T.lib('marked'), T.lib('purify')]);
  function run() {
    T.store.set('markdown', input.value.slice(0, 200000));
    libs.then(function (L) {
      var out = L[0].parse(input.value, { gfm: true, breaks: false });
      var clean = L[1].sanitize(out);
      code.value = clean.trim();
      preview.innerHTML = clean;
      status.clear();
    }).catch(function (e) { status.error(e); });
  }
  input.addEventListener('input', run);
  show(); run();
});
