/* Infinity by GroupChatOn — team-maker. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Random team generator: split a list of names into fair, random teams by number of teams or people per team. */
GCOTools.register('team-maker', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function split(names, k, by) {
    if (!names.length) throw new Error('Add the names, one per line.');
    var teams = by === 'size' ? Math.ceil(names.length / Math.max(1, k)) : Math.max(1, Math.min(k, names.length)), out = [];
    for (var i = 0; i < teams; i++) out.push([]);
    shuffle(names).forEach(function (n, i) { out[i % teams].push(n); });
    return out;
  }
  function run(t, o) {
    var names = t.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean), teams = split(names, Math.round(+o.k) || 2, o.by), labels = o.names.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return teams.map(function (tm, i) { return (labels[i] || 'Team ' + (i + 1)) + ' (' + tm.length + ')\n' + tm.map(function (n) { return '• ' + n; }).join('\n'); }).join('\n\n');
  }
  var tr = T.transformer(spot, { id: 'team-maker', inLabel: 'Names (one per line)', live: false, button: 'Make teams', rows: 9, outLabel: 'Teams', download: 'teams.txt',
    sample: 'Aarav\nDiya\nKabir\nMeera\nRohan\nSara\nVivaan\nAnaya\nIshaan\nZoya',
    options: [T.opt.select('by', 'Split by', [['teams', 'Number of teams'], ['size', 'People per team']], 'teams'), T.opt.number('k', 'How many', 2, 1, 100),
      T.opt.text('names', 'Team names (optional, comma separated)', '', 'Red, Blue')], run: run });
  var share = h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', text: 'Share on WhatsApp', href: '#',
    onclick: function (e) { if (!tr.output.value) { e.preventDefault(); return; } share.href = 'https://wa.me/?text=' + encodeURIComponent(tr.output.value); } });
  spot.lastChild.appendChild(T.row([share]));
  T.tests['team-maker'] = function () {
    var f = [], n = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], t = split(n, 3, 'teams'), s = split(n, 4, 'size');
    if (t.map(function (x) { return x.length; }).join() !== '4,3,3') f.push('3 teams ' + t.map(function (x) { return x.length; }));
    if ([].concat.apply([], t).sort().join('') !== 'abcdefghij') f.push('names lost');
    if (s.length !== 3 || s.some(function (x) { return x.length > 4; })) f.push('size 4');
    if (run('x\ny\nz', { k: 5, by: 'teams', names: 'Red, Blue' }).indexOf('Red (1)') !== 0) f.push('labels / cap');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
