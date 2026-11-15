/* Regex Tester — highlights every match live, lists capture groups, and previews a replacement (JavaScript flavour).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('regex', function (spot, T) {
  var h = T.h;
  var pat = h('input', { type: 'text', 'class': 'tmono', placeholder: '\\b(\\w+)@(\\w+)\\.com\\b', 'aria-label': 'Pattern', spellcheck: 'false' });
  var flags = h('input', { type: 'text', 'class': 'tmono', value: 'g', maxlength: '8', 'aria-label': 'Flags', style: 'max-width:90px' });
  var text = h('textarea', { rows: '7', 'class': 'tmono', placeholder: 'Text to test', 'aria-label': 'Test text', spellcheck: 'false' });
  var rep = h('input', { type: 'text', 'class': 'tmono', placeholder: 'Replace with (optional), e.g. $1 at $2', 'aria-label': 'Replacement' });
  var view = h('pre', { 'class': 'tregex-view', 'aria-label': 'Matches highlighted' });
  var groups = h('div', { 'class': 'tregex-groups' });
  var replaced = h('textarea', { rows: '4', 'class': 'tmono', readonly: true, 'aria-label': 'Replaced text', hidden: true });
  var status = T.status();
  var saved = T.store.get('regex', null);
  if (saved) { pat.value = saved.p; flags.value = saved.f; text.value = saved.t; rep.value = saved.r || ''; }
  var sample = T.button('Try a sample', { small: true, onclick: function () {
    pat.value = '\\b([\\w.]+)@([\\w-]+)\\.(com|in|org)\\b'; flags.value = 'gi'; rep.value = '$1 at $2';
    text.value = 'Write to asha@example.com or ravi.k@site.in.\nNot an email: hello@world'; run(); } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2 tregex-top' }, [T.field('Pattern (between / /)', pat), T.field('Flags', flags, 'g all, i case, m lines, s dot-all, u unicode')]),
    T.field('Test text', text), T.field('Replace (optional)', rep), T.row([sample]), status.el, view, groups, replaced]));
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function run() {
    T.store.set('regex', { p: pat.value, f: flags.value, t: text.value.slice(0, 50000), r: rep.value });
    groups.innerHTML = ''; view.innerHTML = esc(text.value); replaced.hidden = true;
    if (!pat.value) { status.clear(); return; }
    var re, f = flags.value.replace(/[^dgimsuy]/g, '');
    try { re = new RegExp(pat.value, f.indexOf('g') < 0 ? f + 'g' : f); } catch (e) { status.error('Pattern error: ' + e.message); return; }
    var html = '', last = 0, n = 0, m, list = [];
    while ((m = re.exec(text.value)) && n < 5000) {
      if (m[0] === '') { re.lastIndex++; if (re.lastIndex > text.value.length) break; continue; }
      html += esc(text.value.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>';
      last = m.index + m[0].length; n++; list.push(m);
      if (f.indexOf('g') < 0) break;
    }
    view.innerHTML = html + esc(text.value.slice(last));
    status[n ? 'ok' : 'info'](n ? n + ' match' + (n === 1 ? '' : 'es') : 'No matches');
    list.slice(0, 50).forEach(function (mm, i) {
      var parts = [h('b', { text: '#' + (i + 1) + ' at ' + mm.index + ': ' }), h('code', { text: mm[0] })];
      for (var g = 1; g < mm.length; g++) parts.push(h('span', { text: '  $' + g + ' = ' }), h('code', { text: mm[g] == null ? '(none)' : mm[g] }));
      if (mm.groups) Object.keys(mm.groups).forEach(function (k) { parts.push(h('span', { text: '  ' + k + ' = ' }), h('code', { text: String(mm.groups[k]) })); });
      groups.appendChild(h('div', {}, parts));
    });
    if (rep.value) { replaced.hidden = false; replaced.value = text.value.replace(new RegExp(pat.value, f), rep.value); }
  }
  [pat, flags, text, rep].forEach(function (x) { x.addEventListener('input', run); });
  run();
});
