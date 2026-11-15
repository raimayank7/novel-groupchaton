/* Infinity by GroupChatOn — kaomoji. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Kaomoji: Japanese-style text faces for every mood (happy, love, sad, shrug, table flip, cats, bears…), tap to copy. */
GCOTools.register('kaomoji', function (spot, T) {
  var h = T.h, info = h('p', { 'class': 'tnote', 'aria-live': 'polite', text: 'Tap a face to copy it.' });
  var SETS = [
    ['Happy', '(◕‿◕)|(＾▽＾)|(￣▽￣)|(*^▽^*)|(≧◡≦)|(^_^)|(＾ｖ＾)|ヽ(・∀・)ﾉ|(✿◠‿◠)|(｡◕‿◕｡)|(◠‿◠)|(⌒‿⌒)|٩(◕‿◕)۶|(•‿•)|(´｡• ᵕ •｡`)|(o^▽^o)|＼(^o^)／|(*≧ω≦*)|(☆▽☆)|ヽ(>∀<☆)ノ'],
    ['Love', '(♥ω♥)|(´∀`)♡|(｡♥‿♥｡)|(◍•ᴗ•◍)❤|(っ˘з(˘⌣˘ )|♡(˃͈ દ ˂͈ ༶ )|(ღ˘⌣˘ღ)|(*˘︶˘*).｡.:*♡|(灬º‿º灬)♡|(´ε｀ )♡|♡( ◡‿◡ )|(≧◡≦) ♡|(˘∀˘)/(μ‿μ) ❤|(´,,•ω•,,)♡'],
    ['Shrug & meh', '¯\\_(ツ)_/¯|┐(￣ヘ￣)┌|ヽ(ー_ー )ノ|┐(´д｀)┌|╮(￣_￣)╭|┐( ˘_˘ )┌|(￣～￣;)|(¬_¬)|(－_－)|(・_・;)|(ー_ー)!!|( ˘･з･)'],
    ['Sad & crying', '(╥﹏╥)|(;﹏;)|(T_T)|(ಥ﹏ಥ)|(｡•́︿•̀｡)|(っ˘̩╭╮˘̩)っ|(-_-;)|(´；ω；`)|(ノ_<。)|(；へ：)|(｡╯︵╰｡)|(இ﹏இ`｡)'],
    ['Angry', '(╬ Ò﹏Ó)|(ﾉಥ益ಥ)ﾉ|(＃`Д´)|(｀ε´)|ヽ(`⌒´メ)ノ|(ಠ_ಠ)|(¬_¬\")|(▼皿▼#)|(╯°□°）╯|(・`ω´・)|٩(╬ʘ益ʘ╬)۶'],
    ['Table flip', '(╯°□°）╯︵ ┻━┻|┬─┬ノ( º _ ºノ)|(ノಠ益ಠ)ノ彡┻━┻|┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻|(┛◉Д◉)┛彡┻━┻|┬──┬◡ﾉ(° -°ﾉ)|(╯°益°)╯彡┻━┻'],
    ['Surprised', '(⊙_⊙)|(°ロ°) !|w(°ｏ°)w|(O_O)|Σ(°△°|||)|(⊙ˍ⊙)|(＠_＠)|(・□・;)|(ﾟДﾟ;)|(o_O)|(°o°)'],
    ['Greetings', '(＾▽＾)/|ヾ(・ω・)ノ|(・∀・)ノ|ヽ(^o^)丿|(^-^*)/|(￣▽￣)ノ|ヾ(＾∇＾)|(*・ω・)ﾉ|(＾０＾)ノ|(°▽°)/'],
    ['Dance & cheer', '♪(┌・。・)┌|ヾ(⌐■_■)ノ♪|└(＾＾)┐|┌(＾＾)┘|(〜￣▽￣)〜|ヽ(⌐■_■)ノ♪♬|＼(≧▽≦)／|٩(˘◡˘)۶|ᕕ( ᐛ )ᕗ|ヘ(￣ω￣ヘ)'],
    ['Cats', '(=^･ω･^=)|(=^･ｪ･^=)|(=①ω①=)|ฅ^•ﻌ•^ฅ|(^・ω・^ )|(=ↀωↀ=)|(=^‥^=)|ଲ(ⓛ ω ⓛ)ଲ|(ΦωΦ)|ฅ(＾・ω・＾ฅ)'],
    ['Bears & dogs', 'ʕ•ᴥ•ʔ|ʕ￫ᴥ￩ʔ|ʕ·ᴥ·ʔ|ʕ •̀ ω •́ ʔ|(ᵔᴥᵔ)|ʕ ꈍᴥꈍʔ|U・ᴥ・U|V●ᴥ●V|∪＾ェ＾∪|(❍ᴥ❍ʋ)'],
    ['Sleepy', '(－_－) zzZ|(∪｡∪)｡｡｡zzZ|(￣o￣) zzZZzzZZ|(ᴗ˳ᴗ)|(-.-)Zzz…|(ᴗ_ ᴗ。)|(ᵕ≀ ̠ᵕ )'],
    ['Thinking', '(・・ ) ?|( ˘･з･)?|(￢‿￢ )|(・_・ヾ|(￣ω￣;)|( ・◇・)？|( •᷄ὤ•᷅)？|(；一_一)|(｀_´)ゞ'],
    ['Thanks & sorry', '(人 •͈ᴗ•͈)|m(_ _)m|(シ_ _)シ|<(_ _)>|(｡•̀ᴗ-)✧|ありがとう (＾▽＾)|(⁄ ⁄•⁄ω⁄•⁄ ⁄)|(*´▽`*)ﾉ'],
    ['Fighting & strong', '(ง •̀_•́)ง|ᕦ(ò_óˇ)ᕤ|(ง •̀ ω •́)ง|ᕙ(⇀‸↼‶)ᕗ|(•̀ᴗ•́)و ̑̑|٩(•̀ᴗ•́)۶|( •̀ω•́ )σ'],
    ['Hide & shy', '┬┴┬┴┤(･_├┬┴┬┴|(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)|(/ω＼)|(〃▽〃)|(*/ω＼*)||ω・)|(//▽//)']
  ];
  var q = h('input', { type: 'search', placeholder: 'Find a mood: happy, shrug, cat, flip…', 'aria-label': 'Find a mood' });
  var body = h('div', { style: 'display:grid;gap:12px' }), tray = h('textarea', { rows: '2', 'aria-label': 'Your faces' });
  function faces(s) { return s.split('|').filter(Boolean); }
  function find(w) { w = w.toLowerCase().trim(); return SETS.filter(function (g) { return !w || g[0].toLowerCase().indexOf(w) >= 0 || (w === 'shrug' && /Shrug/.test(g[0])); }); }
  function draw() {
    body.innerHTML = '';
    var list = find(q.value);
    list.forEach(function (g) {
      body.appendChild(h('section', {}, [h('b', { style: 'display:block;font-size:13px;color:var(--muted);margin-bottom:6px', text: g[0] }),
        h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px' }, faces(g[1]).map(function (f) {
          return h('button', { type: 'button', style: 'min-height:46px;padding:6px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);cursor:pointer;font:16px/1.3 system-ui,sans-serif;overflow-wrap:anywhere', text: f,
            onclick: function () { tray.value += (tray.value ? ' ' : '') + f; T.copy(f); info.textContent = 'Copied ' + f + ' — paste it in any chat.'; } });
        }))]));
    });
    if (!list.length) body.appendChild(h('p', { 'class': 'tnote', text: 'No mood called that. Try happy, sad, love, angry, cat or bear.' }));
  }
  q.addEventListener('input', draw);
  var cp = T.button('Copy all', { onclick: function () { T.copy(tray.value, cp); } });
  spot.appendChild(T.card([q, T.row(SETS.slice(0, 8).map(function (g) { return T.button(g[0], { small: true, onclick: function () { q.value = g[0]; draw(); } }); }).concat([T.button('All', { small: true, onclick: function () { q.value = ''; draw(); } })])),
    info, body, T.field('Your collection', tray), T.row([cp, T.button('Clear', { small: true, onclick: function () { tray.value = ''; } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['kaomoji'] = function () {
    var f = [], n = 0;
    SETS.forEach(function (g) { var x = faces(g[1]); n += x.length; if (x.length < 6) f.push(g[0] + ' has ' + x.length); });
    if (n < 150) f.push('only ' + n);
    if (faces(find('shrug')[0][1])[0] !== '¯\\_(ツ)_/¯') f.push('shrug');
    if (find('table')[0][0] !== 'Table flip') f.push('flip');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
