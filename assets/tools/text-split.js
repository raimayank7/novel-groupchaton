/* Infinity by GroupChatOn — text-split. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Split long text into parts of a set size (tweets, SMS, WhatsApp status), never cutting a word, with 1/3, 2/3 numbering. */
GCOTools.register('text-split', function (spot, T) {
  function split(t, max, numbered) {
    var n = 1, parts;
    for (var pass = 0; pass < 4; pass++) {
      var room = max - (numbered ? (' ' + n + '/' + n).length : 0);
      if (room < 10) throw new Error('The size is too small. Use at least 20 characters.');
      parts = []; var cur = '';
      t.replace(/\s+/g, ' ').trim().split(' ').forEach(function (w) {
        while (w.length > room) { if (cur) { parts.push(cur); cur = ''; } parts.push(w.slice(0, room)); w = w.slice(room); }
        if (!w) return;
        if (!cur) cur = w; else if ((cur + ' ' + w).length <= room) cur += ' ' + w; else { parts.push(cur); cur = w; }
      });
      if (cur) parts.push(cur);
      if (parts.length === n || !numbered) break;
      n = parts.length;
    }
    return numbered && parts.length > 1 ? parts.map(function (p, i) { return p + ' ' + (i + 1) + '/' + parts.length; }) : parts;
  }
  var SIZES = [['280', 'X (Twitter) post: 280'], ['160', 'SMS: 160'], ['500', 'Threads: 500'], ['700', 'WhatsApp status text: 700'], ['2200', 'Instagram caption: 2,200'], ['custom', 'Custom size']];
  T.transformer(spot, { id: 'text-split', inLabel: 'Long text', sample: 'Infinity has hundreds of free tools that run right in your browser. Nothing you type is uploaded, there is no sign-up and no watermark. Calculators, converters, PDF and image tools, WhatsApp helpers and more, all in one place, and each one can be installed on your phone like an app.',
    options: [T.opt.select('size', 'Part size', SIZES, '280'), T.opt.number('custom', 'Custom size (characters)', 100, 20, 100000), T.opt.check('num', 'Number the parts (1/3, 2/3…)', true)],
    note: function (a, b) { var k = b ? b.split('\n\n———\n\n').length : 0; return k + (k === 1 ? ' part' : ' parts') + ' from ' + a.length.toLocaleString() + ' characters'; },
    run: function (t, o) { var max = o.size === 'custom' ? parseInt(o.custom, 10) || 100 : +o.size; return split(t, max, o.num).join('\n\n———\n\n'); } });
  T.tests['text-split'] = function () {
    var f = [], a = split('one two three four five six seven eight nine ten eleven twelve', 25, true), b;
    if (a.length !== 4 || a.some(function (p) { return p.length > 25; })) f.push('numbered ' + JSON.stringify(a));
    if (a[0].slice(-4) !== ' 1/4') f.push('label ' + a[0]);
    try { split('x', 5, true); f.push('tiny size allowed'); } catch (e) {}
    try { b = split('aaaa bbbb cccc', 12, false); if (b.join('|') !== 'aaaa bbbb|cccc') f.push('plain ' + b.join('|')); } catch (e) { f.push(e.message); }
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
