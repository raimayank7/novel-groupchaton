/* Text Cleaner — extra spaces, empty lines, line breaks, HTML tags, smart quotes and invisible characters, in one pass.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('text-cleaner', function (spot, T) {
  T.transformer(spot, { id: 'text-cleaner', inLabel: 'Messy text',
    sample: '  Hello   world!  \n\n\n“Smart quotes” and <b>tags</b> and\ttabs.  \nLine one\nline two',
    options: [T.opt.check('spaces', 'Remove extra spaces and tabs', true), T.opt.check('trim', 'Trim each line', true), T.opt.check('empty', 'Remove empty lines'),
      T.opt.check('join', 'Join all lines into one paragraph'), T.opt.check('html', 'Remove HTML tags'), T.opt.check('quotes', 'Smart quotes → straight quotes'),
      T.opt.check('nonprint', 'Remove invisible characters', true)],
    run: function (t, o) {
      if (o.nonprint) t = t.replace(/[​-‍﻿­]/g, '').replace(/ /g, ' ');
      if (o.html) {
        var d = new DOMParser().parseFromString(t.replace(/<(br|\/p|\/div|\/li|\/h[1-6])\b[^>]*>/gi, '\n$&'), 'text/html');
        t = d.body.textContent || '';
      }
      if (o.quotes) t = t.replace(/[‘’‚′]/g, "'").replace(/[“”„″]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...');
      var lines = t.split(/\r?\n/);
      if (o.spaces) lines = lines.map(function (l) { return l.replace(/[ \t]+/g, ' '); });
      if (o.trim) lines = lines.map(function (l) { return l.trim(); });
      if (o.empty) lines = lines.filter(function (l) { return l.trim(); });
      else lines = lines.join('\n').replace(/\n{3,}/g, '\n\n').split('\n');
      return o.join ? lines.filter(Boolean).join(' ').replace(/ {2,}/g, ' ') : lines.join('\n');
    } });
});
