/* Infinity by GroupChatOn — html-playground. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* HTML / CSS / JS playground: write code in three boxes and see it run live in a safe sandboxed frame; saved on the device, downloadable as one file. */
GCOTools.register('html-playground', function (spot, T) {
  var h = T.h;
  function page(html, css, js) { return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>My page</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + html + '\n<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>\n</body>\n</html>\n'; }
  var saved = T.store.get('playground', null) || { html: '<h1>Hello!</h1>\n<p>Edit the boxes and watch this change.</p>\n<button id="btn">Click me</button>', css: 'body { font-family: system-ui, sans-serif; padding: 16px; }\nh1 { color: #0ea5e9; }\nbutton { padding: 8px 16px; border-radius: 8px; }', js: 'document.getElementById("btn").onclick = () => alert("It works!");' };
  var box = {}, frame = h('iframe', { 'class': 'tframe', title: 'Live preview', sandbox: 'allow-scripts allow-modals allow-forms allow-popups' }), timer = 0, auto = h('input', { type: 'checkbox', checked: true });
  ['html', 'css', 'js'].forEach(function (k) { box[k] = h('textarea', { rows: '9', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': k.toUpperCase() }); box[k].value = saved[k]; box[k].addEventListener('input', function () { T.store.set('playground', vals()); if (auto.checked) { clearTimeout(timer); timer = setTimeout(go, 600); } }); });
  box.html.addEventListener('keydown', tab); box.css.addEventListener('keydown', tab); box.js.addEventListener('keydown', tab);
  function tab(e) { if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); var t = e.target, s = t.selectionStart; t.value = t.value.slice(0, s) + '  ' + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = s + 2; } }
  function vals() { return { html: box.html.value, css: box.css.value, js: box.js.value }; }
  function go() { var v = vals(); frame.srcdoc = page(v.html, v.css, v.js); }
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('HTML', box.html), T.field('CSS', box.css), T.field('JavaScript', box.js)]),
    T.row([T.button('Run ▶', { primary: true, onclick: go }), h('label', { 'class': 'tcheck' }, [auto, ' Run as I type']),
      T.button('Download .html', { onclick: function () { var v = vals(); T.download(new Blob([page(v.html, v.css, v.js)], { type: 'text/html' }), 'my-page.html'); } }),
      T.button('Clear', { small: true, onclick: function () { box.html.value = box.css.value = box.js.value = ''; T.store.set('playground', vals()); go(); } })]),
    T.field('Preview', frame), h('p', { 'class': 'tstatus', text: 'Your code runs in a sealed-off frame: it cannot read this site or your other tabs. Work is saved on this device as you type.' })]));
  go();
  T.tests['html-playground'] = function () {
    var f = [], p = page('<p>x</p>', 'p{color:red}', 'var s="</script>";');
    if (p.indexOf('<style>\np{color:red}\n</style>') < 0 || p.indexOf('<body>\n<p>x</p>') < 0) f.push('page');
    if (p.indexOf('"<\\/script>"') < 0) f.push('script end not escaped');
    return new Promise(function (ok) {
      var fr = h('iframe', { sandbox: 'allow-scripts', style: 'display:none' });
      function on(e) { if (e.source === fr.contentWindow) { window.removeEventListener('message', on); fr.remove(); if (e.data !== 'ran 3') f.push('sandbox run: ' + e.data); ok({ ok: !f.length, n: 3, fails: f }); } }
      window.addEventListener('message', on); document.body.appendChild(fr);
      fr.srcdoc = page('<b>1</b>', '', 'parent.postMessage("ran " + (1 + 2), "*");');
      setTimeout(function () { window.removeEventListener('message', on); if (fr.isConnected) { fr.remove(); f.push('sandbox did not answer'); ok({ ok: false, n: 3, fails: f }); } }, 4000);
    });
  };
});
