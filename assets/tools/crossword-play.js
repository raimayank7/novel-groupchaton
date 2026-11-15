/* Infinity by GroupChatOn — crossword-play. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Daily crossword: a new grid each day built from our own word-and-clue list (same puzzle for everyone that day), or a fresh random one. */
GCOTools.register('crossword-play', function (spot, T) {
  var h = T.h, status = T.status();
  var BANK = ('ANCHOR|Heavy hook that keeps a ship in place;APPLE|Fruit said to keep the doctor away;BANANA|Long yellow fruit that monkeys love;BRIDGE|It carries a road over a river;' +
    'CANDLE|Wax stick with a wick;CAMEL|Desert animal with one or two humps;CARROT|Orange root vegetable;CASTLE|Fortified home of a king or queen;CLOUD|White shape floating in the sky;' +
    'COFFEE|Morning drink made from roasted beans;DESERT|Dry, sandy land with little rain;DOCTOR|Person who treats the sick;DRAGON|Fire-breathing creature of legend;EAGLE|Large bird of prey with sharp eyes;' +
    'EARTH|The planet we live on;ENGINE|Part of a car that makes it go;FOREST|Large area thick with trees;GARDEN|Place where flowers and vegetables grow;GUITAR|Six-stringed musical instrument;' +
    'HONEY|Sweet food made by bees;ISLAND|Land with water all around it;JUNGLE|Thick tropical forest;KETTLE|Pot used to boil water for tea;LADDER|You climb it to reach high places;' +
    'LEMON|Sour yellow citrus fruit;LIBRARY|Building full of books to borrow;MANGO|Juicy fruit often called the king of fruits;MARKET|Place where people buy and sell goods;MIRROR|Glass that shows your reflection;' +
    'MONKEY|Playful animal that swings through trees;MOUNTAIN|Very high hill, like Everest;NEEDLE|Thin tool for sewing;OCEAN|Huge body of salt water;ORANGE|A colour and a fruit;' +
    'PENCIL|Writing tool with a graphite core;PEPPER|Spice that can make you sneeze;PIANO|Instrument with black and white keys;PILLOW|Soft thing you rest your head on;PLANET|Mars or Jupiter, for example;' +
    'POCKET|Small pouch sewn into clothes;RABBIT|Long-eared animal that hops;RAINBOW|Arc of colours after rain;RIVER|Flowing water heading to the sea;ROCKET|It launches into space;' +
    'SCHOOL|Where children go to learn;SHADOW|Dark shape you cast in sunlight;SILVER|Shiny grey precious metal;SPIDER|Eight-legged web spinner;SUMMER|Hottest season of the year;' +
    'TEACHER|Person who runs a classroom;TIGER|Big striped cat;TOMATO|Red fruit used in sauces and salads;TRAIN|It runs on rails;TURTLE|Slow reptile with a shell;UMBRELLA|Keeps you dry in the rain;' +
    'VALLEY|Low land between hills;VIOLIN|Small string instrument played with a bow;WATER|What ice turns into when it melts;WINDOW|Glass opening in a wall;WINTER|Coldest season;ZEBRA|Striped horse-like animal;' +
    'ACTOR|Person who plays a role on stage;ALARM|Bell that wakes you up;ARROW|Shot from a bow;BREAD|Baked loaf for sandwiches;BRUSH|Used for painting or for hair;CHAIR|Seat with a back;' +
    'CHALK|White stick for a blackboard;CLOCK|It tells the time;CROWN|Worn on a royal head;DANCE|Move your body to music;DREAM|Story your mind plays while you sleep;EMAIL|Letter sent over the internet;' +
    'FENCE|Barrier around a garden;FLAME|Tongue of fire;GHOST|Spooky spirit;GLOBE|Round model of the world;GRAPE|Small fruit that grows in bunches;HEART|It pumps blood round the body;' +
    'HORSE|Animal you can ride;HOTEL|Place to stay when travelling;JUICE|Drink squeezed from fruit;KNIFE|Tool for cutting;LIGHT|Opposite of dark;MAGIC|Tricks of a conjurer;MUSIC|Songs and melodies;' +
    'NIGHT|Time of the moon and stars;NURSE|Hospital carer;OLIVE|Small fruit pressed for oil;PAPER|Sheet you write on;PARTY|Celebration with friends;PEARL|Gem found inside an oyster;' +
    'QUEEN|Female monarch;RADIO|Box that plays broadcasts;ROBOT|Machine that can do tasks by itself;SALAD|Dish of fresh greens;SHEEP|Farm animal that gives wool;SMILE|Happy expression;' +
    'SNAKE|Legless reptile;SPOON|Used to eat soup;STORM|Wild weather with wind and rain;SUGAR|Sweetener for tea;TABLE|Furniture with a flat top and legs;TOWEL|Cloth for drying yourself;' +
    'TRUCK|Large goods vehicle;WHALE|Largest animal in the sea;WHEAT|Grain ground into flour;BEE|Buzzing honey maker;CAT|Pet that purrs;COW|Farm animal that gives milk;EGG|Laid by a hen;' +
    'FAN|It keeps you cool;ICE|Frozen water;INK|Liquid in a pen;JAM|Fruit spread for toast;KEY|It opens a lock;MAP|Drawing that shows the way;OWL|Night bird that hoots;PEN|Writing tool with ink;' +
    'SUN|Star at the centre of our solar system;TEA|Hot drink brewed from leaves;BOOK|Something you read;BOAT|It floats on water;CAKE|Birthday treat with candles;DOOR|You open it to enter a room;' +
    'DUCK|Water bird that quacks;FISH|It swims with fins;FROG|Green jumper that croaks;GOLD|Precious yellow metal;KITE|Flies on a string in the wind;LAMP|Gives light on a desk;LION|Big cat with a mane;' +
    'MILK|White drink from cows;MOON|It lights the night sky;NEST|A bird’s home;RAIN|Water falling from clouds;ROSE|Flower with thorns;SALT|Seasoning from the sea;SHIP|Big boat;SNOW|White flakes in winter;' +
    'STAR|Twinkles at night;TREE|Tall plant with a trunk;WIND|Moving air;WOLF|Wild relative of the dog;ZERO|Nothing at all, as a number;CRICKET|Sport with bats, wickets and overs;' +
    'FOOTBALL|Game played with a round ball and two goals;HOCKEY|Sport played with sticks and a ball or puck;TENNIS|Racket sport played over a net;CHESS|Board game with kings and pawns;' +
    'PUZZLE|Brain teaser to solve;LETTER|A, B or C;NUMBER|One, two or three;BUTTER|Spread made from cream;CHEESE|Food made from milk curds;DIAMOND|Hardest natural gem;ELEPHANT|Animal with a trunk;' +
    'GIRAFFE|Animal with a very long neck;PENGUIN|Bird that cannot fly but swims well;PARROT|Colourful bird that can copy words;VOLCANO|Mountain that can erupt;COMPUTER|Machine with a keyboard and screen;' +
    'BICYCLE|Two wheels and pedals;CAMERA|It takes photos;FEATHER|Light thing covering a bird;HAMMER|Tool for hitting nails;JACKET|Short coat;POTATO|Vegetable made into chips and fries;' +
    'SANDAL|Open summer shoe;THUNDER|Loud boom after lightning;TICKET|Pass for a bus, train or show;WALLET|Holds your money and cards').split(';').map(function (s) { var p = s.split('|'); return { w: p[0], c: p[1] }; });
  function seeded(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  // builds a crossword from the bank with a seeded random source; max 13 × 13
  function build(seed, want) {
    var rand = seeded(seed), MAX = 13, best = null;
    for (var attempt = 0; attempt < 8; attempt++) {
      var pool = BANK.slice();
      for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      pool = pool.slice(0, 40).sort(function (a, b) { return b.w.length - a.w.length; });
      var G = {}, placed = [], minR = 0, maxR = 0, minC = 0, maxC = 0;
      var at = function (r, c) { return G[r + ',' + c]; };
      var fits = function (w, r, c, dr, dc) {
        var cross = 0;
        if (at(r - dr, c - dc) || at(r + dr * w.length, c + dc * w.length)) return -1;
        for (var k = 0; k < w.length; k++) {
          var rr = r + dr * k, cc = c + dc * k, x = at(rr, cc);
          if (x) { if (x !== w[k]) return -1; cross++; continue; }
          if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) return -1;
        }
        var r2 = r + dr * (w.length - 1), c2 = c + dc * (w.length - 1);
        if (Math.max(maxR, r2) - Math.min(minR, r) >= MAX || Math.max(maxC, c2) - Math.min(minC, c) >= MAX) return -1;
        return cross;
      };
      var put = function (e, r, c, dr, dc) {
        for (var k = 0; k < e.w.length; k++) G[(r + dr * k) + ',' + (c + dc * k)] = e.w[k];
        minR = Math.min(minR, r); minC = Math.min(minC, c); maxR = Math.max(maxR, r + dr * (e.w.length - 1)); maxC = Math.max(maxC, c + dc * (e.w.length - 1));
        placed.push({ w: e.w, c: e.c, r: r, col: c, down: !!dr });
      };
      put(pool[0], 0, 0, 0, 1);
      for (var pass = 0; pass < 2 && placed.length < want; pass++) pool.slice(1).forEach(function (e) {
        if (placed.length >= want || placed.some(function (p) { return p.w === e.w; })) return;
        var opts = [];
        placed.forEach(function (p) {
          for (var a = 0; a < p.w.length; a++) for (var b = 0; b < e.w.length; b++) if (p.w[a] === e.w[b]) {
            var dr = p.down ? 0 : 1, dc = p.down ? 1 : 0, pr = p.r + (p.down ? a : 0), pc = p.col + (p.down ? 0 : a), r = pr - dr * b, c = pc - dc * b, s = fits(e.w, r, c, dr, dc);
            if (s > 0) opts.push([s + rand(), r, c, dr, dc]);
          }
        });
        if (!opts.length) return;
        opts.sort(function (x, y) { return y[0] - x[0]; });
        put(e, opts[0][1], opts[0][2], opts[0][3], opts[0][4]);
      });
      if (!best || placed.length > best.placed.length) best = { placed: placed, minR: minR, minC: minC, rows: maxR - minR + 1, cols: maxC - minC + 1 };
      if (placed.length >= want) break;
    }
    var P = best, grid = [];
    for (var r = 0; r < P.rows; r++) { grid.push([]); for (var c = 0; c < P.cols; c++) grid[r].push(''); }
    P.placed.forEach(function (p) { p.r -= P.minR; p.col -= P.minC; for (var k = 0; k < p.w.length; k++) grid[p.r + (p.down ? k : 0)][p.col + (p.down ? 0 : k)] = p.w[k]; });
    // number the starts in reading order
    var n = 0, nums = {};
    for (r = 0; r < P.rows; r++) for (c = 0; c < P.cols; c++) {
      if (!grid[r][c]) continue;
      var ac = (!c || !grid[r][c - 1]) && c + 1 < P.cols && grid[r][c + 1], dn = (!r || !grid[r - 1][c]) && r + 1 < P.rows && grid[r + 1][c];
      if (ac || dn) nums[r + ',' + c] = ++n;
    }
    P.placed.forEach(function (p) { p.n = nums[p.r + ',' + p.col]; });
    P.placed.sort(function (a, b) { return a.n - b.n; });
    return { rows: P.rows, cols: P.cols, grid: grid, words: P.placed, nums: nums };
  }
  function css(id, s) { if (!document.getElementById(id)) document.head.appendChild(h('style', { id: id, text: s })); }
  css('tcw-css', '.tcw{display:grid;gap:0;margin:0 auto;touch-action:manipulation}.tcw>div{position:relative;min-width:0;min-height:0}.tcw .b{background:transparent}' +
    '.tcw .l{background:var(--surface);outline:1px solid var(--ink);outline-offset:-0.5px}.tcw input{all:unset;position:absolute;inset:0;box-sizing:border-box;width:100%;height:100%;text-align:center;font:700 16px/1 var(--ui);color:var(--ink);text-transform:uppercase;caret-color:transparent;cursor:pointer}' +
    '.tcw .w{background:var(--accent-soft)}.tcw .on{background:var(--accent)}.tcw .on input{color:var(--accent-ink)}.tcw .x input{color:#dc2626}.tcw .rv input{color:#2563eb}.tcw .ok input{color:#16a34a}' +
    '.tcw sup{position:absolute;z-index:1;left:2px;top:1px;font:600 9px/1 var(--ui);color:var(--muted);pointer-events:none}.tcw .on sup{color:var(--accent-ink)}' +
    '.tcw-clue{padding:10px 12px;border-radius:12px;background:var(--surface-2);font-weight:600;min-height:22px}.tcw-lists{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}' +
    '.tcw-lists ol{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:2px}.tcw-lists li{padding:5px 8px;border-radius:8px;cursor:pointer}.tcw-lists li.on{background:var(--accent-soft)}.tcw-lists li.done{color:var(--muted);text-decoration:line-through}');
  var P, cellEls = {}, inputs = {}, cur = { r: 0, c: 0, down: false }, t0 = 0, timer = null, finished = false, key = '';
  var gridEl = h('div', { 'class': 'tcw', role: 'grid', 'aria-label': 'Crossword grid' }), clue = h('div', { 'class': 'tcw-clue', 'aria-live': 'polite' });
  var acrossL = h('ol'), downL = h('ol'), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' }), clock = h('span', { text: '0:00' });
  function fmt(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function wordAt(r, c, down) { return P.words.filter(function (w) { return w.down === down && (down ? w.col === c && r >= w.r && r < w.r + w.w.length : w.r === r && c >= w.col && c < w.col + w.w.length); })[0]; }
  function cellsOf(w) { var a = []; for (var k = 0; k < w.w.length; k++) a.push([w.r + (w.down ? k : 0), w.col + (w.down ? 0 : k)]); return a; }
  function load(seed, label) {
    P = build(seed, 12); key = 'cw-' + seed; finished = false;
    var saved = T.store.get('cw-save', {});
    gridEl.innerHTML = ''; cellEls = {}; inputs = {};
    gridEl.style.gridTemplateColumns = 'repeat(' + P.cols + ',minmax(0,1fr))'; gridEl.style.width = 'min(100%,' + P.cols * 40 + 'px)';
    gridEl.style.gridTemplateRows = 'repeat(' + P.rows + ',minmax(0,1fr))'; gridEl.style.aspectRatio = P.cols + ' / ' + P.rows;
    for (var r = 0; r < P.rows; r++) for (var c = 0; c < P.cols; c++) (function (r, c) {
      if (!P.grid[r][c]) { gridEl.appendChild(h('div', { 'class': 'b' })); return; }
      var inp = h('input', { type: 'text', maxlength: '2', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'Row ' + (r + 1) + ' column ' + (c + 1) });
      var cell = h('div', { 'class': 'l' }, [P.nums[r + ',' + c] ? h('sup', { text: String(P.nums[r + ',' + c]) }) : null, inp]);
      inp.addEventListener('focus', function () { if (cur.r !== r || cur.c !== c) { cur.r = r; cur.c = c; if (!wordAt(r, c, cur.down)) cur.down = !cur.down; } paint(); });
      inp.addEventListener('mousedown', function () { if (document.activeElement === inp && wordAt(r, c, !cur.down)) { cur.down = !cur.down; setTimeout(paint, 0); } });
      inp.addEventListener('input', function () {
        var v = (inp.value.replace(/[^a-z]/gi, '').slice(-1) || '').toUpperCase(); inp.value = v; cell.classList.remove('x', 'rv', 'ok'); saveNow();
        if (v) step(1); check(false);
      });
      inp.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'Backspace' && !inp.value) { e.preventDefault(); step(-1); var p = inputs[cur.r + ',' + cur.c]; if (p) { p.value = ''; saveNow(); } }
        else if (/^Arrow/.test(k)) {
          e.preventDefault();
          var dr = k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0, dc = k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0;
          if ((dr && !cur.down && wordAt(r, c, true)) || (dc && cur.down && wordAt(r, c, false))) { cur.down = !!dr; paint(); return; }
          go(r + dr, c + dc, dr, dc);
        } else if (k === 'Enter' || k === 'Tab') { e.preventDefault(); nextWord(e.shiftKey ? -1 : 1); }
        else if (k === ' ') { e.preventDefault(); if (wordAt(r, c, !cur.down)) { cur.down = !cur.down; paint(); } }
      });
      cellEls[r + ',' + c] = cell; inputs[r + ',' + c] = inp; gridEl.appendChild(cell);
    })(r, c);
    var mine = saved.key === key ? saved : null;
    if (mine) Object.keys(mine.v || {}).forEach(function (k) { if (inputs[k]) inputs[k].value = mine.v[k]; });
    [acrossL, downL].forEach(function (L, i) {
      L.innerHTML = '';
      P.words.filter(function (w) { return w.down === !!i; }).forEach(function (w) {
        w.li = h('li', { onclick: function () { cur = { r: w.r, c: w.col, down: w.down }; inputs[w.r + ',' + w.col].focus(); paint(); } }, [h('b', { text: w.n + '. ' }), w.c + ' (' + w.w.length + ')']);
        L.appendChild(w.li);
      });
    });
    title.textContent = label + ' · ' + P.words.length + ' words';
    cur = { r: P.words[0].r, c: P.words[0].col, down: P.words[0].down };
    t0 = mine && mine.t ? mine.t : 0; clearInterval(timer);
    timer = setInterval(function () { if (!finished && !document.hidden) { t0++; clock.textContent = fmt(t0); if (t0 % 5 === 0) saveNow(); } }, 1000);
    out.textContent = ''; status.clear(); paint(); check(false);
  }
  function saveNow() { var v = {}; Object.keys(inputs).forEach(function (k) { if (inputs[k].value) v[k] = inputs[k].value; }); T.store.set('cw-save', { key: key, v: v, t: t0 }); }
  function go(r, c, dr, dc) {
    while (r >= 0 && c >= 0 && r < P.rows && c < P.cols) { if (inputs[r + ',' + c]) { cur.r = r; cur.c = c; inputs[r + ',' + c].focus(); paint(); return; } r += dr; c += dc; }
  }
  function step(d) {
    var w = wordAt(cur.r, cur.c, cur.down); if (!w) return;
    var r = cur.r + (cur.down ? d : 0), c = cur.c + (cur.down ? 0 : d);
    if (inputs[r + ',' + c] && wordAt(r, c, cur.down) === w) { cur.r = r; cur.c = c; inputs[r + ',' + c].focus(); }
    else if (d > 0) nextWord(1);
    paint();
  }
  function nextWord(d) {
    var w = wordAt(cur.r, cur.c, cur.down), i = P.words.indexOf(w), n = P.words[(i + d + P.words.length) % P.words.length];
    cur = { r: n.r, c: n.col, down: n.down };
    var empty = cellsOf(n).filter(function (x) { return !inputs[x[0] + ',' + x[1]].value; })[0];
    if (empty) { cur.r = empty[0]; cur.c = empty[1]; }
    inputs[cur.r + ',' + cur.c].focus(); paint();
  }
  function paint() {
    var w = wordAt(cur.r, cur.c, cur.down) || wordAt(cur.r, cur.c, !cur.down), on = {};
    if (w) { cur.down = w.down; cellsOf(w).forEach(function (x) { on[x[0] + ',' + x[1]] = 1; }); }
    Object.keys(cellEls).forEach(function (k) { cellEls[k].classList.toggle('w', !!on[k]); cellEls[k].classList.toggle('on', k === cur.r + ',' + cur.c); });
    P.words.forEach(function (x) { x.li.classList.toggle('on', x === w); });
    clue.textContent = w ? w.n + (w.down ? ' Down: ' : ' Across: ') + w.c + ' (' + w.w.length + ')' : '';
  }
  function check(mark) {
    var all = true, full = true;
    P.words.forEach(function (w) {
      var good = cellsOf(w).every(function (x) { return inputs[x[0] + ',' + x[1]].value === P.grid[x[0]][x[1]]; });
      w.li.classList.toggle('done', good);
    });
    Object.keys(inputs).forEach(function (k) {
      var p = k.split(','), v = inputs[k].value, right = v === P.grid[+p[0]][+p[1]];
      if (!v) full = false;
      if (!right) all = false;
      if (mark && v && !right) cellEls[k].classList.add('x');
    });
    if (all && !finished) {
      finished = true; saveNow();
      out.textContent = '🎉 Crossword complete in ' + fmt(t0) + '!';
      status.ok('Every answer is right.');
    } else if (mark) {
      var wrong = Object.keys(cellEls).filter(function (k) { return cellEls[k].classList.contains('x'); }).length;
      if (wrong) status.error(wrong + (wrong === 1 ? ' letter is' : ' letters are') + ' wrong (shown in red).'); else status.info(full ? 'All good so far.' : 'No wrong letters so far. Keep going!');
    }
  }
  function reveal(which) {
    var list = which === 'all' ? Object.keys(inputs) : which === 'word' ? cellsOf(wordAt(cur.r, cur.c, cur.down)).map(function (x) { return x.join(','); }) : [cur.r + ',' + cur.c];
    list.forEach(function (k) { var p = k.split(','), right = P.grid[+p[0]][+p[1]]; if (inputs[k].value !== right) { inputs[k].value = right; cellEls[k].classList.remove('x'); cellEls[k].classList.add('rv'); } });
    saveNow(); check(false);
  }
  var title = h('h3', { text: '' });
  function daily() { load(hash('gco-cw-' + today()), 'Today’s crossword (' + today() + ')'); }
  function random() { var a = new Uint32Array(1); crypto.getRandomValues(a); load(a[0], 'Practice crossword'); }
  spot.appendChild(T.card([T.row([T.button('Today’s puzzle', { primary: true, onclick: daily }), T.button('New random puzzle', { small: true, onclick: random })]),
    h('div', { style: 'display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap' }, [title, h('span', { 'class': 'tstatus' }, ['⏱ ', clock])]),
    clue, gridEl,
    T.row([T.button('Check', { small: true, onclick: function () { check(true); } }), T.button('Reveal letter', { small: true, onclick: function () { reveal('letter'); } }),
      T.button('Reveal word', { small: true, onclick: function () { reveal('word'); } }), T.button('Reveal all', { small: true, onclick: function () { if (confirm('Show every answer?')) reveal('all'); } }),
      T.button('Clear', { small: true, onclick: function () { Object.keys(inputs).forEach(function (k) { inputs[k].value = ''; cellEls[k].className = 'l'; }); finished = false; out.textContent = ''; saveNow(); check(false); paint(); } })]),
    status.el, out, h('div', { 'class': 'tcw-lists' }, [h('div', {}, [h('b', { text: 'Across' }), acrossL]), h('div', {}, [h('b', { text: 'Down' }), downL])])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  daily();
  T.tests['crossword-play'] = function () {
    var f = [], seeds = [1, 2, 3, 99, 12345, 777777, hash('x'), hash('gco-cw-2026-01-01')];
    seeds.forEach(function (s) {
      var p = build(s, 12);
      if (p.words.length < 8) f.push('seed ' + s + ' only ' + p.words.length + ' words');
      if (p.rows > 13 || p.cols > 13) f.push('too big ' + p.rows + 'x' + p.cols);
      p.words.forEach(function (w) { cellsOf(w).forEach(function (x, k) { if (p.grid[x[0]][x[1]] !== w.w[k]) f.push('letter mismatch ' + w.w); }); if (!w.n) f.push('no number ' + w.w); });
      // every run of 2+ letters must be one of the placed words (no accidental words)
      [false, true].forEach(function (down) {
        var A = down ? p.cols : p.rows, B = down ? p.rows : p.cols;
        for (var a = 0; a < A; a++) { var run = '', st = 0; for (var b = 0; b <= B; b++) {
          var ch = b < B ? (down ? p.grid[b][a] : p.grid[a][b]) : '';
          if (ch) { if (!run) st = b; run += ch; } else { if (run.length > 1 && !p.words.some(function (w) { return w.down === down && w.w === run && (down ? w.col === a && w.r === st : w.r === a && w.col === st); })) f.push('stray word ' + run); run = ''; }
        } }
      });
    });
    if (build(42, 12).words.map(function (w) { return w.w; }).join() !== build(42, 12).words.map(function (w) { return w.w; }).join()) f.push('same day gives different puzzles');
    return Promise.resolve({ ok: !f.length, n: seeds.length * 4 + 1, fails: f.slice(0, 5) });
  };
});
