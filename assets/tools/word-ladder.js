/* Infinity by GroupChatOn — word-ladder. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Word ladder: change one letter at a time to turn the first word into the last, using real words; daily and practice ladders, hints and a solver. */
GCOTools.register('word-ladder', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var W3 = ('ace act add age ago aid aim air all and ant any ape apt arc are arm art ash ask ate bad bag ban bar bat bay bed bee beg bet bib bid big bin bit boa bob bog boo bow box boy bud bug bun bus but buy ' +
    'cab can cap car cat cod cog cot cow cry cub cue cup cut dab dad dam day den dew did dig dim din dip doe dog dot dry dub due dug dye ear eat egg elf elk elm end era eve eye fad fan far fat fax fed fee few fig fin fir fit fix flu fly foe fog for fox fry fun fur ' +
    'gap gas gel gem get gig gum gut guy gym had ham has hat hay hen her hid him hip his hit hog hop hot how hub hue hug hum hut ice icy ill ink inn ion its ivy jab jam jar jaw jay jet jig job jog joy jug kid kin kit lab lad lag lap law lay led leg let lid lie lip lit log lot low ' +
    'mad man map mat may men met mix mob mom mop mud mug nab nag nap net new nil nod nor not now nut oak oar oat odd off oil old one orb ore our out owe owl own pad pal pan pat paw pay pea peg pen pet pie pig pin pit pod pop pot pro pub pun pup put ' +
    'rag ram ran rap rat raw ray red rib rid rig rim rip rob rod rot row rub rug run rut sad sag sap sat saw say sea see set sew shy sip sir sit six ski sky sly sob sod son sow soy spa spy sty sub sum sun ' +
    'tab tag tan tap tar tax tea ten the tie tin tip toe ton too top tow toy try tub tug two urn use van vat vet via vow wag war was wax way web wed wet who why wig win wit wok won wow yak yam yap yes yet you zap zip zoo').split(' ');
  var W4 = ('able ache acid aged also arch area army away baby back bake bald ball band bang bank bare bark barn base bath bead beak beam bean bear beat beef been beer bell belt bend bent best bike bill bind bird bite blew blow blue blur boat body boil bold bolt bond bone book boom boot bore born boss both bowl bulb bull bump burn bush busy ' +
    'cage cake calf call calm came camp cane card care cart case cash cast cave cell chat chef chin chip chop city clap claw clay clip club clue coal coat code coil coin cold come cook cool cope copy cord core corn cost cosy crab crew crop crow cube curl cute ' +
    'damp dare dark dart dash date dawn deal dear debt deck deep deer desk dial dice diet dine dirt dish dive dock does doll dome done door dose dove down drag draw drew drip drop drum duck dull dune dusk dust duty ' +
    'each earn ease east easy edge else even ever exit face fact fade fail fair fake fall fame fare farm fast fate fear feed feel feet fell felt fern file fill film find fine fire firm fish fist five flag flat flaw flea fled flew flip flow foam fold folk fond font food fool foot fork form fort four free frog from fuel full fund fuse ' +
    'gain game gate gave gaze gear gift girl give glad glow glue goal goat gold golf gone good gown grab gray grew grey grid grin grip grow gulf hail hair half hall halt hand hang hard hare harm have hawk head heal heap hear heat heel held helm help herb herd here hero hide high hike hill hint hire hold hole holy home hood hook hoop hope horn hose host hour huge hung hunt hurt hush ' +
    'idea inch into iron item jazz join joke jump jury just keen keep kept kick kind king kiss kite knee knew knit knob knot know lace lack lady laid lake lamb lamp land lane last late lawn lazy lead leaf leak lean leap left lend lens less lick life lift like lily limb lime line link lion list live load loaf loan lock loft logo long look loop lord lose loss lost loud love luck lump lung ' +
    'made mail main make male mall many mark mask mass mast mate math meal mean meat meet melt menu mere mess mice mild mile milk mill mind mine mint miss mist mode mole mood moon more moss most moth move much mule must name navy near neat neck need nest news next nice nine none noon nose note ' +
    'oath obey once only open oven over pace pack page paid pail pain pair pale palm pane park part pass past path peak pear peel peer pest pick pier pile pine pink pint pipe plan play plot plug plum poem poet pole poll pond pony pool poor pore pork port pose post pour pray prey pull pump pure push ' +
    'race rack raft rage raid rail rain rake ramp rang rank rare rate read real rear rely rent rest rice rich ride ring rink ripe rise risk road roam roar robe rock rode role roll roof room root rope rose rude ruin rule rush rust ' +
    'sack safe sage said sail sake sale salt same sand sang save seal seam seat seed seek seem seen sell send sent shed ship shoe shop shot show shut sick side sigh sign silk sing sink site size skin skip slab slam slap sled slid slim slip slot slow snap snow soak soap soar sock soda sofa soft soil sold sole some song soon sore sort soul soup sour spin spot star stay stem step stir stop such suit sung sunk sure swan swap swim ' +
    'tail take tale talk tall tame tank tape task taxi team tear tell tend tent term test text than that them then they thin this tide tidy tied tile till time tiny tire toad told toll tone tool torn tour town trap tray tree trim trip true tube tune turn twin type ' +
    'unit upon used vase vast very vest view vine vote wade wage wait wake walk wall wand want ward warm warn wash wave weak wear week well went were west what when wide wife wild will wind wine wing wire wise wish with woke wolf wood wool word wore work worm wrap yard yarn year yell your zero zone').split(' ');
  var DICT = {}; W3.concat(W4).forEach(function (w) { DICT[w] = 1; });
  function oneApart(a, b) { if (a.length !== b.length) return false; var d = 0; for (var i = 0; i < a.length; i++) if (a[i] !== b[i] && ++d > 1) return false; return d === 1; }
  function near(w) { return (w.length === 3 ? W3 : W4).filter(function (x) { return oneApart(w, x); }); }
  function ladder(a, b) {   // shortest chain of real words from a to b (breadth-first search)
    if (a === b) return [a];
    var prev = {}, q = [a]; prev[a] = null;
    while (q.length) {
      var w = q.shift(), n = near(w);
      for (var i = 0; i < n.length; i++) if (!(n[i] in prev)) { prev[n[i]] = w; if (n[i] === b) { var out = [b]; while (prev[out[0]]) out.unshift(prev[out[0]]); return out; } q.push(n[i]); }
    }
    return null;
  }
  function seeded(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function pick(len, rand) {   // a start and end word 3 to 6 steps apart
    var list = len === 3 ? W3 : W4;
    for (var t = 0; t < 200; t++) {
      var a = list[Math.floor(rand() * list.length)], dist = {}, q = [a]; dist[a] = 0;
      while (q.length) { var w = q.shift(); if (dist[w] >= 6) continue; near(w).forEach(function (x) { if (!(x in dist)) { dist[x] = dist[w] + 1; q.push(x); } }); }
      var far = Object.keys(dist).filter(function (x) { return dist[x] >= (len === 3 ? 3 : 4) && dist[x] <= 6; });
      if (far.length) return [a, far[Math.floor(rand() * far.length)]];
    }
    return len === 3 ? ['cat', 'dog'] : ['cold', 'warm'];
  }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function hash(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  var start = '', goal = '', steps = [], best = 0, done = false, hints = 0;
  var title = h('h3', { text: '' }), rungs = h('div', { 'aria-live': 'polite', style: 'display:grid;gap:6px;justify-items:center' });
  var input = h('input', { type: 'text', maxlength: '4', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', 'aria-label': 'Next word', style: 'text-transform:uppercase;font:800 22px/1 var(--mono);letter-spacing:.3em;text-align:center;max-width:180px' });
  var out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' }), len = T.store.get('wl-len', 4);
  var lenSeg = T.seg([[3, '3 letters'], [4, '4 letters']], len, function (v) { len = v; T.store.set('wl-len', v); practice(); });
  var from = h('input', { type: 'text', maxlength: '4', placeholder: 'cold', 'aria-label': 'Start word', style: 'text-transform:uppercase' }), to = h('input', { type: 'text', maxlength: '4', placeholder: 'warm', 'aria-label': 'End word', style: 'text-transform:uppercase' });
  function tile(w, kind, diff) {
    var row = h('div', { style: 'display:flex;gap:5px' });
    w.split('').forEach(function (ch, i) {
      row.appendChild(h('span', { style: 'display:grid;place-items:center;width:44px;height:44px;border-radius:10px;font:800 24px/1 var(--ui);text-transform:uppercase;' +
        (kind === 'goal' ? 'background:#16a34a;color:#fff' : kind === 'start' ? 'background:var(--accent);color:var(--accent-ink)' : 'background:var(--surface-2);color:var(--ink)') + (diff === i ? ';box-shadow:inset 0 0 0 3px #f59e0b' : ''), text: ch }));
    });
    return row;
  }
  function changed(a, b) { for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return i; return -1; }
  function draw() {
    rungs.innerHTML = '';
    rungs.appendChild(tile(start, 'start'));
    steps.forEach(function (w, i) { rungs.appendChild(tile(w, w === goal ? 'goal' : '', changed(i ? steps[i - 1] : start, w))); });
    if (!done) { rungs.appendChild(h('div', { style: 'color:var(--muted);font-size:20px', text: '⋮' })); rungs.appendChild(tile(goal, 'goal')); }
    input.maxLength = start.length;
  }
  function load(a, b, label) {
    var p = ladder(a, b);
    if (!p) { status.error('No ladder links “' + a.toUpperCase() + '” and “' + b.toUpperCase() + '” with the words we know. Try another pair.'); return false; }
    start = a; goal = b; steps = []; best = p.length - 1; done = false; hints = 0; out.textContent = ''; status.clear(); input.value = '';
    title.textContent = label + ': ' + a.toUpperCase() + ' → ' + b.toUpperCase() + ' in ' + best + ' steps or more';
    draw(); return true;
  }
  function daily() { var r = seeded(hash('gco-ladder-' + today() + '-' + len)), p = pick(len, r); load(p[0], p[1], 'Today’s ladder'); }
  function practice() { var p = pick(len, function () { return rnd(1e9) / 1e9; }); load(p[0], p[1], 'Practice'); }
  function cur() { return steps.length ? steps[steps.length - 1] : start; }
  function submit() {
    if (done) return;
    var w = input.value.trim().toLowerCase();
    if (w.length !== start.length) { status.error('Type a ' + start.length + '-letter word.'); return; }
    if (!oneApart(cur(), w)) { status.error('Change exactly one letter of ' + cur().toUpperCase() + '.'); return; }
    if (!DICT[w]) { status.error('“' + w.toUpperCase() + '” is not in our word list. Try a more common word.'); return; }
    if (w === start || steps.indexOf(w) >= 0) { status.error('You have already used ' + w.toUpperCase() + '.'); return; }
    steps.push(w); input.value = ''; status.clear();
    if (w === goal) win(); else draw();
  }
  function win() {
    done = true; draw();
    out.textContent = '🎉 Done in ' + steps.length + ' steps' + (steps.length === best ? ': the shortest possible!' : ' (shortest is ' + best + ').') + (hints ? ' Hints used: ' + hints + '.' : '');
  }
  function hint() {
    if (done) return;
    var p = ladder(cur(), goal);
    if (!p) { status.info('There is no way from ' + cur().toUpperCase() + ' to ' + goal.toUpperCase() + '. Use Undo.'); return; }
    hints++; steps.push(p[1]); status.info('Hint: ' + cur().toUpperCase() + '.');
    if (p[1] === goal) win(); else draw();
  }
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  spot.appendChild(T.card([lenSeg, T.row([T.button('Today’s ladder', { primary: true, onclick: daily }), T.button('New practice ladder', { small: true, onclick: practice })]),
    title, rungs, h('div', { style: 'display:flex;gap:8px;justify-content:center;flex-wrap:wrap;align-items:center' }, [input, T.button('Add word', { primary: true, onclick: submit })]),
    T.row([T.button('Undo', { small: true, onclick: function () { if (!done && steps.length) { steps.pop(); draw(); } } }), T.button('Hint', { small: true, onclick: hint }),
      T.button('Show answer', { small: true, onclick: function () { var p = ladder(start, goal); steps = p.slice(1); done = true; draw(); out.textContent = 'One shortest ladder: ' + p.map(function (x) { return x.toUpperCase(); }).join(' → '); } })]),
    status.el, out,
    h('details', {}, [h('summary', { text: 'Make your own ladder or solve one' }), h('div', { style: 'display:grid;gap:10px;margin-top:10px' }, [h('div', { 'class': 'tgrid2' }, [T.field('From', from), T.field('To', to)]),
      T.row([T.button('Play it', { small: true, onclick: function () { custom(false); } }), T.button('Solve it', { small: true, onclick: function () { custom(true); } }), T.button('Try a sample', { small: true, onclick: function () { from.value = 'cold'; to.value = 'warm'; custom(true); } })])])])]));
  function custom(solve) {
    var a = from.value.trim().toLowerCase(), b = to.value.trim().toLowerCase();
    if (a.length !== b.length || a.length < 3 || a.length > 4) { status.error('Use two words of the same length: 3 or 4 letters.'); return; }
    if (!DICT[a] || !DICT[b]) { status.error((DICT[a] ? b : a).toUpperCase() + ' is not in our word list.'); return; }
    if (load(a, b, 'Your ladder') && solve) { var p = ladder(a, b); steps = p.slice(1); done = true; draw(); out.textContent = 'Shortest ladder (' + (p.length - 1) + ' steps): ' + p.map(function (x) { return x.toUpperCase(); }).join(' → '); }
  }
  daily();
  T.tests['word-ladder'] = function () {
    var f = [], p = ladder('cat', 'dog');
    if (!p || p.length !== 4) f.push('cat to dog ' + (p && p.join()));
    p = ladder('cold', 'warm');
    if (!p) f.push('cold to warm');
    else p.forEach(function (w, i) { if (!DICT[w] || (i && !oneApart(p[i - 1], w))) f.push('bad rung ' + w); });
    if (oneApart('cat', 'cut') !== true || oneApart('cat', 'dog') || oneApart('cat', 'cat')) f.push('one apart');
    var bad = W3.concat(W4).filter(function (w, i, a) { return a.indexOf(w) !== i || !/^[a-z]{3,4}$/.test(w); });
    if (bad.length) f.push('word list ' + bad.slice(0, 5).join());
    for (var t = 0; t < 5; t++) { var q = pick(4, function () { return rnd(1e9) / 1e9; }), l = ladder(q[0], q[1]); if (!l || l.length - 1 < 4 || l.length - 1 > 6) f.push('pick ' + q.join('-')); }
    return Promise.resolve({ ok: !f.length, n: 10, fails: f.slice(0, 5) });
  };
});
