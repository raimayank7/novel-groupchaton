/* Infinity by GroupChatOn — username. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Username generator: name- or keyword-based handles in cool, gamer, professional or cute styles, checked for length and allowed characters. */
GCOTools.register('username', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var W = {
    cool: [['Neo', 'Urban', 'Silent', 'Lunar', 'Wild', 'Echo', 'Nova', 'Astro', 'Pixel', 'Velvet', 'Cosmic', 'Indie'], ['Wave', 'Vibe', 'Soul', 'Drift', 'Craft', 'Story', 'Sky', 'Hub', 'Lab', 'Studio', 'Trail', 'Byte']],
    gamer: [['Shadow', 'Blaze', 'Venom', 'Turbo', 'Rogue', 'Frost', 'Ghost', 'Rapid', 'Titan', 'Viper', 'Storm', 'Ninja'], ['Slayer', 'Sniper', 'Hunter', 'Striker', 'Wolf', 'Reaper', 'Knight', 'Raider', 'Fang', 'Ace', 'Fury', 'X']],
    pro: [['The', 'Hello', 'Hey', 'Its', 'Real', 'Team', 'Official', 'Studio', 'Work', 'Daily', 'Simply', 'Just'], ['HQ', 'Official', 'Works', 'Writes', 'Designs', 'Codes', 'Media', 'Co', 'Online', 'Pro', 'Journal', 'Notes']],
    cute: [['Sunny', 'Honey', 'Bubbly', 'Sweet', 'Tiny', 'Peachy', 'Cuddly', 'Sparkly', 'Fluffy', 'Cherry', 'Minty', 'Dreamy'], ['Bunny', 'Panda', 'Muffin', 'Cupcake', 'Kitten', 'Daisy', 'Mochi', 'Bear', 'Bee', 'Star', 'Puff', 'Pie']]
  };
  function clean(s) { return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, ' ').trim(); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
  function make(seed, style, o) {
    var words = clean(seed).split(' ').filter(Boolean), base = words.map(cap), w = W[style], out = {}, guard = 0;
    var pick = function (a) { return a[rnd(a.length)]; }, num = function () { return o.year ? String([7, 9, 11, 21, 24, 77, 99, 2026][rnd(8)]) : String(rnd(900) + 10); };
    while (Object.keys(out).length < o.count && guard++ < 800) {
      var b = base.length ? base[rnd(base.length)] : pick(w[0]), first = base.length ? base[0] : '', last = base.length > 1 ? base[base.length - 1] : '', s;
      switch (rnd(style === 'pro' ? 6 : 7)) {
        case 0: s = pick(w[0]) + b; break;
        case 1: s = b + pick(w[1]); break;
        case 2: s = pick(w[0]) + pick(w[1]); break;
        case 3: s = first && last ? first + o.sep + last : b + o.sep + pick(w[1]); break;
        case 4: s = first && last ? first.charAt(0) + last : b + pick(w[1]); break;
        case 5: s = b + o.sep + pick(w[1]); break;
        default: s = pick(w[0]) + o.sep + b;
      }
      if (o.nums && rnd(2)) s += num();
      if (o.lower) s = s.toLowerCase();
      s = s.replace(/[._]{2,}/g, o.sep).replace(/^[._]+|[._]+$/g, '');
      if (s.length >= 3 && s.length <= o.max) out[s] = 1;
    }
    return Object.keys(out);
  }
  var seed = h('input', { type: 'text', placeholder: 'Your name or a word you like (optional)', 'aria-label': 'Name or keyword' }), style = T.seg([['cool', 'Cool'], ['gamer', 'Gamer'], ['pro', 'Professional'], ['cute', 'Cute']], 'cool');
  var sep = T.select([['', 'none (AshaVerma)'], ['_', 'underscore (asha_verma)'], ['.', 'dot (asha.verma)']], ''), max = h('input', { type: 'number', value: '15', min: '6', max: '30' });
  var nums = h('input', { type: 'checkbox', checked: true }), lower = h('input', { type: 'checkbox' }), grid = h('div', { 'class': 'tkv', 'data-out': '' });
  function go() {
    grid.innerHTML = '';
    make(seed.value, style.value(), { count: 20, sep: sep.value, max: +max.value || 15, nums: nums.checked, lower: lower.checked }).forEach(function (u) {
      grid.appendChild(h('div', {}, [h('span', { text: '@' }), h('code', { text: u }), T.button('Copy', { small: true, onclick: function (e) { T.copy(u, e.currentTarget); } })]));
    });
  }
  seed.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  spot.appendChild(T.card([T.field('Name or keyword', seed), T.field('Style', style), h('div', { 'class': 'tgrid2' }, [T.field('Join words with', sep), T.field('Longest length', max, 'Instagram 30, X (Twitter) 15, Gmail 30')]),
    T.row([h('label', { 'class': 'tcheck' }, [nums, ' Add numbers sometimes']), h('label', { 'class': 'tcheck' }, [lower, ' all lowercase'])]),
    T.row([T.button('Generate usernames', { primary: true, onclick: go }), T.button('Try a sample', { small: true, onclick: function () { seed.value = 'Asha Verma'; go(); } })]), grid,
    h('p', { 'class': 'tstatus', text: 'Ideas only: check on the app or site whether a name is still free.' })]));
  go();
  T.tests['username'] = function () {
    var f = [];
    ['cool', 'gamer', 'pro', 'cute'].forEach(function (st) {
      var r = make('Asha Verma', st, { count: 20, sep: '_', max: 15, nums: true, lower: false });
      if (r.length < 15) f.push(st + ' only ' + r.length);
      r.forEach(function (u) { if (!/^[A-Za-z0-9][A-Za-z0-9_.]{1,13}[A-Za-z0-9]$/.test(u)) f.push(st + ' bad ' + u); });
    });
    if (!make('Zoë', 'cute', { count: 20, sep: '', max: 20, nums: false, lower: true }).some(function (u) { return u.indexOf('zoe') >= 0; })) f.push('accent / keyword');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
