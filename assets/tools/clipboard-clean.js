/* Infinity by GroupChatOn — clipboard-clean. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Paste as plain text: strip formatting, hidden characters, smart quotes, extra spaces and broken line wraps from copied text. */
GCOTools.register('clipboard-clean', function (spot, T) {
  var h = T.h;
  function clean(s, o) {
    s = s.replace(/\r\n?/g, '\n');
    if (o.hidden) s = s.replace(/[​‌⁠﻿­‎‏‪-‮]/g, '').replace(/([^\p{Extended_Pictographic}])‍/gu, '$1');
    if (o.spaces) s = s.replace(/[  -   　\t]/g, ' ');
    if (o.quotes) s = s.replace(/[‘’‚′]/g, "'").replace(/[“”„″]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...');
    if (o.bullets) s = s.replace(/^[ \t]*(?:[•◦▪▫●○■□➤►▶‣⁃–—*-]|\d+[.)])[ \t]+/gm, '');
    if (o.unwrap) s = s.split(/\n{2,}/).map(function (p) { return p.replace(/-\n(?=[a-z])/g, '').replace(/\n(?!\n)/g, ' '); }).join('\n\n');
    if (o.spaces) s = s.replace(/ {2,}/g, ' ');
    if (o.trim) s = s.split('\n').map(function (l) { return l.trim(); }).join('\n').trim();
    if (o.blank) s = s.replace(/\n{3,}/g, '\n\n');
    if (o.oneline) s = s.replace(/\s*\n+\s*/g, ' ');
    if (o.emoji) s = s.replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}‍️]/gu, '').replace(/ {2,}/g, ' ');
    if (o.lower) s = s.toLowerCase();
    return s;
  }
  var tr = T.transformer(spot, {
    id: 'clipboard-clean', run: clean, button: 'Clean',
    inLabel: 'Paste your text here (formatting is dropped automatically)', outLabel: 'Clean plain text',
    placeholder: 'Paste text from Word, a web page, a PDF or an email…',
    options: [T.opt.check('trim', 'Trim spaces at line ends', true), T.opt.check('spaces', 'Fix double and odd spaces', true), T.opt.check('blank', 'Remove extra blank lines', true),
      T.opt.check('hidden', 'Remove hidden characters', true), T.opt.check('quotes', 'Straight quotes and dashes (“ ” → ")', false), T.opt.check('unwrap', 'Join broken lines (from PDFs and emails)', false),
      T.opt.check('bullets', 'Remove bullets and numbering', false), T.opt.check('oneline', 'Make it one line', false), T.opt.check('emoji', 'Remove emoji', false), T.opt.check('lower', 'all lowercase', false)],
    sample: '  “Quarterly report” — draft​\n\n\n\n•  Sales grew by 12% this\nquarter, driven by strong de-\nmand in the north.  \n2)  Costs   stayed flat.  ✅\n',
    note: function (a, b) { return a.length + ' characters in → ' + b.length + ' out.'; }, download: 'clean-text.txt'
  });
  if (navigator.clipboard && navigator.clipboard.readText) {
    var btn = T.button('Paste from clipboard', { primary: true, onclick: function () {
      navigator.clipboard.readText().then(function (t) { tr.input.value = t; tr.update(); tr.output.select(); }, function () { tr.status.info('The browser did not allow reading the clipboard. Press Ctrl+V (or long-press → Paste) in the box instead.'); });
    } });
    tr.input.parentNode.parentNode.insertBefore(T.row([btn]), tr.input.parentNode);
  }
  T.tests['clipboard-clean'] = function () {
    var f = [], all = { trim: true, spaces: true, blank: true, hidden: true };
    if (clean('  Hello   world  \n\n\n\nBye​ ', all) !== 'Hello world\n\nBye') f.push('basic ' + JSON.stringify(clean('  Hello   world  \n\n\n\nBye​ ', all)));
    if (clean('“Hi” — it’s…', { quotes: true }) !== '"Hi" - it\'s...') f.push('quotes');
    if (clean('one two\nthree de-\nmand\n\nnext', { unwrap: true }) !== 'one two three demand\n\nnext') f.push('unwrap ' + JSON.stringify(clean('one two\nthree de-\nmand\n\nnext', { unwrap: true })));
    if (clean('• a\n2) b\n- c', { bullets: true }) !== 'a\nb\nc') f.push('bullets');
    if (clean('hi 👋🏽 there 👨‍👩‍👧', { emoji: true }) !== 'hi there ') f.push('emoji ' + JSON.stringify(clean('hi 👋🏽 there 👨‍👩‍👧', { emoji: true })));
    if (clean('a‍b 👨‍👩', { hidden: true }) !== 'ab 👨‍👩') f.push('joiner');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
