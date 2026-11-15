/* Infinity by GroupChatOn — typing-layouts. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Learn another keyboard layout: practise AZERTY, QWERTZ or Dvorak on your normal keyboard (the tool swaps the keys), or QWERTY itself. */
GCOTools.register('typing-layouts', function (spot, T) {
  var h = T.h, Y = T.typing || (T.typing = (function () {
    // shared by the typing tools (each tool carries its own copy, so any one can load alone): word lists, keyboards with finger colours, the typing drill, results and history
    if (!document.getElementById('gco-typing-css')) document.head.appendChild(h('style', { id: 'gco-typing-css', text: [
      '.ty-text{position:relative;max-height:9.6em;overflow:auto;padding:12px 14px;border-radius:14px;background:var(--bg);border:1px solid var(--line);font:500 clamp(17px,4.6vw,21px)/1.6 var(--ui);white-space:pre-wrap;overflow-wrap:anywhere;user-select:none;color:var(--ink-soft)}',
      '.ty-text.ty-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:clamp(14px,3.8vw,17px);tab-size:4}',
      '.ty-text span.ok{color:var(--ink)}.ty-text span.fix{color:#d97706}.ty-text span.no{color:#dc2626;background:rgba(239,68,68,.18);border-radius:3px}',
      '.ty-text span.cur{background:var(--accent-soft);box-shadow:inset 0 -3px 0 var(--accent);border-radius:3px;color:var(--ink)}',
      '.ty-in{font:500 18px/1.5 var(--ui)!important;min-height:64px!important;resize:none!important}.ty-in.ty-mono{font-family:ui-monospace,Menlo,Consolas,monospace!important;font-size:15px!important;min-height:120px!important}',
      '.ty-live{display:flex;flex-wrap:wrap;gap:6px 16px;font:600 15px/1.4 var(--ui);color:var(--ink-soft);font-variant-numeric:tabular-nums}.ty-live b{color:var(--ink)}',
      '.ty-kb{display:grid;gap:4px;min-width:0;user-select:none;padding:8px;border-radius:14px;background:var(--bg);border:1px solid var(--line)}',
      '.ty-row{display:flex;gap:4px;min-width:0}.ty-k,.ty-gap{flex:1 1 0;min-width:0}.ty-k{display:grid;place-items:center;height:clamp(30px,8vw,42px);border-radius:7px;border:1px solid var(--line);border-bottom-width:4px;background:var(--surface-2);color:var(--ink);font:600 clamp(10px,2.8vw,15px)/1 var(--ui);overflow:hidden;white-space:nowrap;transition:transform .08s}',
      '.ty-k small{font-size:.75em;opacity:.7}.ty-k.is-next{background:var(--accent);color:var(--accent-ink);transform:translateY(-1px)}.ty-k.is-hit{filter:brightness(.85);transform:translateY(2px)}.ty-k.is-bad{background:rgba(239,68,68,.35)}',
      '.ty-k.f-home{text-decoration:underline;text-underline-offset:3px}.ty-legend{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:13px;color:var(--ink-soft)}.ty-legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:4px;vertical-align:-1px}',
      '.ty-hint{margin:0;font:600 15px/1.4 var(--ui);color:var(--ink-soft);min-height:1.4em}.ty-cv{display:block;width:100%;height:auto;border-radius:16px;border:1px solid var(--line);background:#0b1220;touch-action:manipulation}',
      '.ty-list{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(min(150px,100%),1fr))}.ty-list button{min-height:52px;min-width:0;padding:6px 10px;border-radius:12px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font:600 14px/1.25 var(--ui);text-align:left;cursor:pointer;overflow-wrap:anywhere}',
      '.ty-list button[aria-pressed=true]{border-color:var(--accent);background:var(--accent-soft)}.ty-list button small{display:block;font-weight:500;color:var(--ink-soft)}',
      '.ty-table{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}.ty-table th,.ty-table td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left}'].join('') }));
    function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function pick(a) { return a[rnd(a.length)]; }
    // everyday English words, short to long (our own list)
    var WORDS = ('a i am an as at be by do go he if in is it me my no of on or so to up us we all and any are ask bad bag big box boy but buy can car cat cup cut dad day did dog dry eat egg end eye far few fit fly for fun get got had has hat her him his hot how ice ink its jam job joy key kid lad law leg let lid lip lot low mad man map may mix mom new not now nut odd off oil old one our out own pan pay pen pet pin pot put ran red rid row run sad sat saw say sea see set she shy sip sit six sky son sun tag tap tea ten the tie tin toe too top toy try two use van war was way web wet who why win yes yet you ' +
      'able also area away baby back bake ball band bank bear bell best bike bird blue boat body book both cake call calm came card care cash city clap club cold come cook cool corn dark dash data dear desk dish door down draw drop duck dust each earn east easy edge else even ever face fact fair fall farm fast feel file fill find fine fire fish flag flat flow food foot form free from full game gate gave gift girl give glad glass goal gold good grow hair half hall hand hard have head hear heat help here hill hold home hope hour idea into jail join joke jump just keep kind king kite lake land last late lead leaf left less life lift like line list live long look love made mail main make many mark meal milk mind miss more most move much must name near neck need next nice note once only open over page park part pass past path pick plan play plus pool poor post pull push rain read real rest rice ride ring road rock role room rope rule safe said salt same sand save seed seen self sell send ship shop show sick side sign sing size skin slow snow soft soil some song soon sort star stay step stop such sure swim take talk tall task team tell test than that them then they thin this time tiny told tone tool town tree trip true turn type unit upon used very view wait walk wall want warm wash wave weak wear week well went were west what when wide wife wild will wind wise wish with wood word work yard year your zero ' +
      'about above after again agree ahead alarm alive allow alone along apple April begin being below birth black block board bread brick bring brown build carry catch chair cheap check chess child chose class clean clear clock close cloud coach coast color count cover craft cream dance dream dress drink drive early earth eight enjoy enter equal every extra faith false field fight final first flash floor flour focus fresh front fruit funny ghost giant glass grade grain grass great green group guard guess guide happy heart heavy hello horse hotel house human jelly juice knife laugh learn least leave lemon level light lucky lunch magic maker mango match metal model money month motor mouse mouth music never night noise north ocean offer often order other paint paper party peace phone piece pilot place plant plate point power press price print prize proud queen quick quiet radio raise reach ready river robot round route ruler salad scale scene score seven shape share sheep shelf shine shirt short sixty skill sleep small smart smile snake sound south space spare speak speed spell spend spice spoon sport stamp stand start state stone storm story sugar sweet table taste teach thank their there thick thing think three tiger title today tooth total touch tower track trade train trust truth uncle under until upper usual value video visit voice water wheel where which while white whole woman world write young ' +
      'action almost always animal answer around autumn basket battle beauty before better bottle bridge bright bubble budget butter camera candle carpet castle cattle change cheese choice circle clever coffee corner cotton couple cousin credit danger decide degree dinner doctor dollar double dragon driver energy engine enough family farmer father finger finish flower follow forest friend future garden gentle ginger golden ground growth guitar hammer health honest island jacket kitten ladder leader letter listen little lovely market master matter middle minute modern moment monkey mother number object office orange parent pencil people pepper person planet player pocket purple rabbit reason record repeat ribbon rocket school screen season second secret silver simple sister smooth spring square street strong summer sunday supply switch symbol tablet temple thanks theory ticket timber tomato travel turtle twelve valley violin wallet window winter wonder yellow ' +
      'balance blanket brother capital central chapter chicken climate comfort company correct country curious machine example feather freedom general holiday kitchen library lantern measure message million morning natural network nothing pattern perfect picture popular present problem program project promise quarter rainbow science shelter society station student subject success sunrise teacher thought tonight traffic uniform village weather welcome whisper writing').split(' ');
    // short practice passages (our own writing)
    var PASSAGES = [
      'Typing well is a skill anyone can learn. Keep your fingers resting on the home row, look at the screen instead of the keys, and let each finger reach only for its own keys. Speed comes later; accuracy comes first.',
      'The old banyan tree at the edge of the village has seen a hundred summers. Children climb its roots after school, farmers rest in its shade at noon, and in the evening the birds return to its branches with a noisy song.',
      'A good cup of tea needs patience. Boil fresh water, add the leaves, and wait a few minutes before you pour in the milk. Ginger and cardamom make it warm and fragrant, and a small biscuit on the side makes it perfect.',
      'Rain arrived early this year. The dusty roads turned dark and shiny, the fields drank deeply, and the smell of wet earth filled every street. Umbrellas bloomed like colourful flowers outside the busy railway station.',
      'Saving money is easier with a simple plan. Write down what you earn, list what you must spend, and keep a small amount aside every week. Even ten rupees a day becomes more than three thousand in a single year.',
      'The night sky over the desert is full of stars. Without city lights, you can see the faint band of the Milky Way stretching from one side of the horizon to the other, and sometimes a shooting star racing past.',
      'Our team won the match in the final over. Needing twelve runs from six balls, the youngest player hit two clean boundaries and then ran a quick single while the whole ground stood up and cheered.',
      'Learning a new language opens a new window on the world. Start with greetings and numbers, listen to songs, and do not worry about mistakes. Every word you learn helps you understand people a little better.',
      'A healthy morning routine can change your whole day. Drink a glass of water, stretch for five minutes, eat a light breakfast, and write down the three most important things you want to finish before evening.',
      'The small shop on the corner sells everything from pencils to pickles. Its owner remembers every customer by name, keeps a notebook of who owes what, and always has a joke ready for the children who come in for sweets.',
      'Bicycles are quiet, cheap and good for the planet. A short ride to the market instead of a car trip saves fuel, keeps the air cleaner and gives your heart some exercise. Remember to wear a helmet and use lights at night.',
      'Every computer understands only two symbols, zero and one. Letters, pictures, songs and videos are all stored as long patterns of these two digits, and clever programs turn them back into something people can enjoy.',
      'The festival lights were switched on at sunset. Lamps glowed on every balcony, sweets were shared between neighbours, and the streets were full of families in new clothes, laughing and greeting one another.',
      'Mountains teach patience. The path climbs slowly through pine forests and rocky slopes, the air grows thin and cool, and then suddenly the clouds open to show snowy peaks shining in the afternoon sun.',
      'Before sending an important email, read it once aloud. You will notice missing words, unclear sentences and the wrong tone. A calm, short and polite message is far more likely to get a helpful reply.',
      'Honey bees visit thousands of flowers to make a single spoon of honey. They tell each other where food is found by dancing, and a strong hive works together like one large, busy and very organised family.'];
    var FINGERS = { LP: ['Left little finger', '#F87171'], LR: ['Left ring finger', '#FB923C'], LM: ['Left middle finger', '#FACC15'], LI: ['Left index finger', '#4ADE80'],
      RI: ['Right index finger', '#22D3EE'], RM: ['Right middle finger', '#60A5FA'], RR: ['Right ring finger', '#A78BFA'], RP: ['Right little finger', '#F472B6'], TH: ['Thumb', '#94A3B8'] };
    var F0 = 'LP LP LR LM LI LI RI RI RM RR RP RP RP'.split(' '), F1 = 'LP LR LM LI LI RI RI RM RR RP RP RP RP'.split(' ');
    function finger(row, col) { return (row === 0 ? F0 : F1)[col] || 'RP'; }
    var CODES = ['Backquote Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0 Minus Equal', 'KeyQ KeyW KeyE KeyR KeyT KeyY KeyU KeyI KeyO KeyP BracketLeft BracketRight Backslash',
      'KeyA KeyS KeyD KeyF KeyG KeyH KeyJ KeyK KeyL Semicolon Quote', 'KeyZ KeyX KeyC KeyV KeyB KeyN KeyM Comma Period Slash'].map(function (r) { return r.split(' '); });
    // what each key types, row by row: unshifted, then with Shift ('·' = nothing)
    var DEFS = {
      qwerty: { name: 'QWERTY', n: ['`1234567890-=', 'qwertyuiop[]\\', "asdfghjkl;'", 'zxcvbnm,./'], s: ['~!@#$%^&*()_+', 'QWERTYUIOP{}|', 'ASDFGHJKL:"', 'ZXCVBNM<>?'] },
      azerty: { name: 'AZERTY (French)', n: ['²&é"\'(-è_çà)=', 'azertyuiop^$*', 'qsdfghjklmù', 'wxcvbn,;:!'], s: ['²1234567890°+', 'AZERTYUIOP¨£µ', 'QSDFGHJKLM%', 'WXCVBN?./§'] },
      qwertz: { name: 'QWERTZ (German)', n: ['^1234567890ß´', 'qwertzuiopü+#', 'asdfghjklöä', 'yxcvbnm,.-'], s: ['°!"§$%&/()=?`', 'QWERTZUIOPÜ*\'', 'ASDFGHJKLÖÄ', 'YXCVBNM;:_'] },
      dvorak: { name: 'Dvorak', n: ['`1234567890[]', '\',.pyfgcrl/=\\', 'aoeuidhtns-', ';qjkxbmwvz'], s: ['~!@#$%^&*(){}', '"<>PYFGCRL?+|', 'AOEUIDHTNS_', ':QJKXBMWVZ'] },
      'inscript-hi': { name: 'Hindi Inscript', n: ['· 1 2 3 4 5 6 7 8 9 0 - ृ', 'ौ ै ा ी ू ब ह ग द ज ड ़ ॉ', 'ो े ् ि ु प र क त च ट', '· ं म न व ल स , . य'],
        s: ['· ऍ ॅ ्र र् ज्ञ त्र क्ष श्र ( ) ः ऋ', 'औ ऐ आ ई ऊ भ ङ घ ध झ ढ ञ ऑ', 'ओ ए अ इ उ फ ऱ ख थ छ ठ', '· ँ ण · · ळ श ष । य़'] },
      'inscript-pa': { name: 'Punjabi Inscript', n: ['· 1 2 3 4 5 6 7 8 9 0 - ·', 'ੌ ੈ ਾ ੀ ੂ ਬ ਹ ਗ ਦ ਜ ਡ ਼ ·', 'ੋ ੇ ੍ ਿ ੁ ਪ ਰ ਕ ਤ ਚ ਟ', '· ੰ ਮ ਨ ਵ ਲ ਸ , . ਯ'],
        s: ['੍ਹ ੍ਵ ੍ਯ ੍ਰ ੱ · · · · ( ) · ·', 'ਔ ਐ ਆ ਈ ਊ ਭ ਙ ਘ ਧ ਝ ਢ ਞ ·', 'ਓ ਏ ਅ ਇ ਉ ਫ ੜ ਖ ਥ ਛ ਠ', '· ਂ ਣ · ੲ ਲ਼ ਸ਼ · । ·'] } };
    function cells(s) { return s.indexOf(' ') >= 0 ? s.split(' ').map(function (x) { return x === '·' ? '' : x; }) : Array.from(s); }
    var built = {};
    // def: a DEFS name or { name, n, s, label(char) }
    function layout(def) {
      var id = typeof def === 'string' ? def : null;
      if (id && built[id]) return built[id];
      var d = id ? DEFS[id] : def, L = { id: id || d.id || 'custom', name: d.name, keys: [], byCode: {}, byChar: {}, label: d.label };
      CODES.forEach(function (row, r) {
        var n = cells(d.n[r]), s = cells(d.s[r]);
        row.forEach(function (code, c) {
          var k = { code: code, row: r, col: c, n: (n[c] || '').normalize('NFC'), s: (s[c] || '').normalize('NFC'), f: finger(r, c) };
          L.keys.push(k); L.byCode[code] = k;
          if (k.s && !L.byChar[k.s]) L.byChar[k.s] = { key: k, shift: true };
          if (k.n) L.byChar[k.n] = { key: k, shift: false };
        });
      });
      L.byChar[' '] = { key: { code: 'Space', f: 'TH' }, shift: false };
      if (id) built[id] = L;
      return L;
    }
    function fingerFor(ch, lay) { var k = (lay || layout('qwerty')).byChar[ch]; return k ? k.key.f : null; }
    // what a key on a US keyboard types in another layout (used to try a layout without changing the computer's settings)
    function emulate(lay, usChar) {
      if (usChar === ' ') return ' ';
      var us = layout('qwerty').byChar[usChar];
      if (!us) return '';
      var k = lay.byCode[us.key.code];
      return k ? (us.shift ? k.s : k.n) : '';
    }
    function board(lay) {
      var el = h('div', { 'class': 'ty-kb', 'aria-hidden': 'true' }), map = {}, cur = [];
      function key(k, grow) {
        var lab = k.n ? (lay.label ? lay.label(k.n) : /^[a-zäöüàèéù]$/.test(k.n) ? k.n.toUpperCase() : k.n) : '';
        var shiftLab = k.s && !/^[A-ZÄÖÜ]$/.test(k.s) && k.s !== (lab || '').toUpperCase() ? (lay.label ? lay.label(k.s) : k.s) : '';
        var b = h('span', { 'class': 'ty-k' + (/^Key[FJ]$/.test(k.code) ? ' f-home' : ''), style: 'border-bottom-color:' + FINGERS[k.f][1] + (grow ? ';flex-grow:' + grow : ''), title: FINGERS[k.f][0] },
          [shiftLab && lab !== shiftLab ? h('small', { text: shiftLab }) : null, lab || '']);
        map[k.code] = b; return b;
      }
      function gap(g) { return h('span', { 'class': 'ty-gap', style: 'flex-grow:' + g }); }
      function draw(l) {
        lay = l; el.innerHTML = ''; map = {};
        var rows = [[], [], [], []];
        lay.keys.forEach(function (k) { rows[k.row].push(k); });
        el.appendChild(h('div', { 'class': 'ty-row' }, rows[0].map(function (k) { return key(k); }).concat([gap(1)])));
        el.appendChild(h('div', { 'class': 'ty-row' }, [gap(0.5)].concat(rows[1].map(function (k) { return key(k); })).concat([gap(0.5)])));
        el.appendChild(h('div', { 'class': 'ty-row' }, [gap(0.8)].concat(rows[2].map(function (k) { return key(k); })).concat([gap(2.2)])));
        var ls = key({ code: 'ShiftLeft', n: 'Shift', f: 'LP' }, 1.3), rs = key({ code: 'ShiftRight', n: 'Shift', f: 'RP' }, 2.7);
        el.appendChild(h('div', { 'class': 'ty-row' }, [ls].concat(rows[3].map(function (k) { return key(k); })).concat([rs])));
        el.appendChild(h('div', { 'class': 'ty-row' }, [gap(3.5), key({ code: 'Space', n: 'space', f: 'TH' }, 7), gap(3.5)]));
      }
      draw(lay);
      return {
        el: el, set: function (l) { draw(l); },
        // light up the key (and Shift) for the next character; returns { key, shift, finger } or null
        next: function (ch) {
          cur.forEach(function (b) { b.classList.remove('is-next'); }); cur = [];
          var info = ch == null ? null : lay.byChar[ch];
          if (!info) return null;
          var b = map[info.key.code]; if (b) cur.push(b);
          if (info.shift) cur.push(map[/^L/.test(info.key.f) ? 'ShiftRight' : 'ShiftLeft']);
          cur.forEach(function (b) { if (b) b.classList.add('is-next'); });
          return { key: info.key, shift: info.shift, finger: FINGERS[info.key.f][0] };
        },
        hit: function (code, bad) {
          var b = map[code]; if (!b) return;
          b.classList.add(bad ? 'is-bad' : 'is-hit');
          setTimeout(function () { b.classList.remove('is-hit', 'is-bad'); }, 160);
        }
      };
    }
    function legend() {
      return h('div', { 'class': 'ty-legend', 'aria-hidden': 'true' }, Object.keys(FINGERS).map(function (f) { return h('span', {}, [h('i', { style: 'background:' + FINGERS[f][1] }), FINGERS[f][0].replace(' finger', '')]); }));
    }
    function wpm(chars, ms) { return ms > 0 ? chars / 5 / (ms / 60000) : 0; }
    function fmtTime(ms) { var s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
    function nfc(s) { return String(s || '').normalize('NFC'); }
    /* the typing drill: a passage to copy and a box to type in.
       o: { text, time (seconds: a timed test), board, mono, autoIndent, onDone(result), onTick(result), clock(),
            emu: a layout (the US keys type that layout), units(text) → what is compared, key(usChar) → units added, show(units) → text shown } */
    function drill(o) {
      var clock = o.clock || function () { return performance.now(); };
      var disp = h('div', { 'class': 'ty-text' + (o.mono ? ' ty-mono' : ''), 'aria-hidden': 'true' });
      var input = h('textarea', { 'class': 'ty-in' + (o.mono ? ' ty-mono' : ''), rows: o.mono ? '5' : '2', autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
        'aria-label': 'Type the text here', placeholder: o.placeholder || 'Start typing here…', lang: o.lang || null });
      var live = h('div', { 'class': 'ty-live', 'data-out': '' });
      var st, spans = [], target = [], shownTarget = [], text = '', timer = 0, demoT = 0;
      function units(t) { return o.units ? o.units(t) : Array.from(nfc(t)); }
      function typedUnits() { return o.emu ? st.buf.join('') : Array.from(nfc(input.value)).join(''); }
      function setText(t) {
        stopTimers(); text = nfc(t); target = units(text); shownTarget = Array.from(text);
        st = { start: 0, end: 0, keys: 0, errs: 0, err: {}, buf: [], prev: '', done: false, demo: false };
        input.value = ''; input.disabled = false; disp.innerHTML = '';
        spans = shownTarget.map(function (c) { return h('span', { text: c === '\n' ? '↵\n' : c }); });
        spans.forEach(function (s) { disp.appendChild(s); });
        paint(); tick();
      }
      function cmpShown() {   // what the reader sees, compared letter by letter with the passage
        var t = typedUnits();
        return Array.from(o.show ? nfc(o.show(t)) : t);
      }
      function paint() {
        var shown = cmpShown(), n = shown.length;
        for (var i = 0; i < spans.length; i++) {
          var c = i < n ? (shown[i] === shownTarget[i] ? (st.err[i] ? 'fix' : 'ok') : 'no') : i === n ? 'cur' : '';
          if (spans[i].className !== c) spans[i].className = c;
        }
        var cur = spans[Math.min(n, spans.length - 1)];
        if (cur) { var top = cur.offsetTop - disp.clientHeight / 3; if (Math.abs(disp.scrollTop - top) > 8) disp.scrollTop = Math.max(0, top); }
        if (o.board) {
          var t = Array.from(typedUnits()), nextU = target[t.length], ok = t.join('') === target.slice(0, t.length).join('');
          var info = o.board.next(ok ? nextU : null);
          if (o.onNext) o.onNext(ok ? info : null, ok);
        }
      }
      function result() {
        var t = Array.from(typedUnits()), ms = st.on ? (st.end || clock()) - st.start : 0, good = 0;
        for (var i = 0; i < t.length && i < target.length; i++) if (t[i] === target[i]) good++;
        return { ms: ms, sec: ms / 1000, typed: t.length, correct: good, keys: st.keys, errors: st.errs, total: target.length,
          wpm: wpm(good, ms), raw: wpm(t.length, ms), acc: st.keys ? Math.max(0, (st.keys - st.errs) / st.keys * 100) : 100, done: st.done, demo: st.demo };
      }
      function tick() {
        var r = result(), left = o.time ? Math.max(0, o.time * 1000 - r.ms) : 0;
        live.innerHTML = '';
        [['Time', o.time ? fmtTime(left) : fmtTime(r.ms)], ['WPM', Math.round(r.wpm)], ['Accuracy', Math.round(r.acc) + '%'], ['Errors', r.errors], ['Done', Math.round(r.typed / Math.max(1, r.total) * 100) + '%']].forEach(function (p) {
          live.appendChild(h('span', {}, [p[0] + ': ', h('b', { text: String(p[1]) })]));
        });
        if (o.onTick) o.onTick(r);
        if (o.time && st.on && !st.done && left <= 0) finish();
      }
      function stopTimers() { clearInterval(timer); timer = 0; clearTimeout(demoT); }
      function begin() { if (!st.on) { st.on = true; st.start = clock(); timer = setInterval(tick, 250); } }
      function finish() {
        if (st.done) return;
        st.done = true; st.end = clock(); stopTimers(); input.disabled = true; tick(); paint();
        if (o.board) o.board.next(null);
        if (o.onDone) o.onDone(result());
      }
      // count new keystrokes and mistakes between the old and new typed text
      function changed() {
        if (st.done) return;
        var now = typedUnits(), was = st.prev, a = Array.from(now), b = Array.from(was), p = 0;
        if (a.length) begin();
        while (p < a.length && p < b.length && a[p] === b[p]) p++;
        for (var i = p; i < a.length; i++) { st.keys++; if (a[i] !== target[i]) { st.errs++; st.err[i] = 1; } }
        st.prev = now; paint(); tick();
        if (a.length >= target.length) finish();
      }
      function emuKey(us) {
        var out = o.key ? o.key(us) : emulate(o.emu, us);
        if (!out) return false;
        st.buf.push(o.key ? out : nfc(out)); input.value = o.show ? o.show(st.buf.join('')) : st.buf.join(''); changed(); return true;
      }
      function emuBack() { if (st.buf.length) { st.buf.pop(); input.value = o.show ? o.show(st.buf.join('')) : st.buf.join(''); changed(); } }
      input.addEventListener('keydown', function (e) {
        if (o.board && e.code) o.board.hit(e.code);
        if (o.emu && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (e.key === 'Backspace') { e.preventDefault(); emuBack(); return; }
          var us = layout('qwerty').byCode[e.code];
          if (e.code === 'Space') { e.preventDefault(); emuKey(' '); return; }
          if (us) { e.preventDefault(); emuKey(e.shiftKey ? us.s : us.n); return; }
          if (e.key === 'Enter') e.preventDefault();
          return;
        }
        if (e.key === 'Enter' && target[Array.from(typedUnits()).length] !== '\n') { e.preventDefault(); return; }
        if (e.key === 'Tab' && o.mono) { e.preventDefault(); insert('    '); }
      });
      // phones: keys arrive as text, not key codes
      input.addEventListener('beforeinput', function (e) {
        if (!o.emu) return;
        if (e.inputType === 'insertText' && e.data) { e.preventDefault(); Array.from(e.data).forEach(emuKey); }
        else if (e.inputType === 'deleteContentBackward') { e.preventDefault(); emuBack(); }
        else if (e.inputType !== 'insertCompositionText') e.preventDefault();
      });
      function insert(s) {
        var v = input.value, a = input.selectionStart, b = input.selectionEnd;
        input.value = v.slice(0, a) + s + v.slice(b); input.selectionStart = input.selectionEnd = a + s.length; changed();
      }
      input.addEventListener('input', function () {
        if (o.emu) { input.value = o.show ? o.show(st.buf.join('')) : st.buf.join(''); return; }
        if (o.autoIndent && /\n$/.test(input.value)) {   // after Enter, the next line's indent is typed for you
          var n = Array.from(input.value).length, sp = ''; while (target[n + sp.length] === ' ') sp += ' ';
          if (sp) input.value += sp;
        }
        changed();
      });
      input.addEventListener('paste', function (e) { e.preventDefault(); });
      input.addEventListener('drop', function (e) { e.preventDefault(); });
      setText(o.text || '');
      return {
        el: h('div', { style: 'display:grid;gap:10px;min-width:0' }, [disp, input, live]), input: input, live: live,
        setText: setText, result: result, finish: finish, stop: stopTimers, started: function () { return !!st.on; },
        // for our tests: type this text as if a person did
        feed: function (s) { if (o.emu) { Array.from(s).forEach(emuKey); } else { input.value = s; input.dispatchEvent(new Event('input')); } },
        back: function () { if (o.emu) emuBack(); else { input.value = Array.from(input.value).slice(0, -1).join(''); changed(); } },
        // a demo: the text types itself at this speed (not saved)
        demo: function (speed, then) {
          setText(text); st.demo = true; var i = 0, step = 60000 / (speed * 5);
          (function go() {
            if (st.done) return;
            if (o.emu) { st.buf.push(target[i]); input.value = o.show ? o.show(st.buf.join('')) : st.buf.join(''); changed(); } else { input.value = target.slice(0, i + 1).join(''); changed(); }
            i++; if (i < target.length && !st.done) demoT = setTimeout(go, step); else if (then) then();
          })();
        }
      };
    }
    function statsEl(r) {
      return h('div', { 'class': 'tstats', 'data-out': '' }, [['WPM', Math.round(r.wpm)], ['Accuracy', Math.round(r.acc) + '%'], ['Raw WPM', Math.round(r.raw)], ['Mistakes', r.errors], ['Time', fmtTime(r.ms)], ['Characters', r.correct + ' / ' + r.typed]].map(function (p) {
        return h('div', { 'class': 'tstat' }, [h('b', { text: String(p[1]) }), h('span', { text: p[0] })]);
      }));
    }
    // every finished test is kept on this device (shared by the typing tools: the daily chart and the certificate read it)
    function log(tool, r, extra) {
      if (!r || r.demo || r.ms < 3000) return null;
      var e = { t: Date.now(), tool: tool, wpm: Math.round(r.wpm * 10) / 10, acc: Math.round(r.acc * 10) / 10, sec: Math.round(r.sec), err: r.errors };
      if (extra) Object.keys(extra).forEach(function (k) { e[k] = extra[k]; });
      var all = T.store.get('typing-log', []); if (!Array.isArray(all)) all = [];
      all.push(e); T.store.set('typing-log', all.slice(-600));
      return e;
    }
    function history(tool) { var all = T.store.get('typing-log', []); return (Array.isArray(all) ? all : []).filter(function (e) { return !tool || e.tool === tool; }); }
    function best(tool) { return history(tool).reduce(function (b, e) { return !b || e.wpm > b.wpm ? e : b; }, null); }
    function words(n, ok) {
      var pool = ok ? WORDS.filter(ok) : WORDS, out = [];
      if (!pool.length) return '';
      for (var i = 0; i < n; i++) { var w = pick(pool); if (out.length && out[out.length - 1] === w && pool.length > 1) { i--; continue; } out.push(w); }
      return out.join(' ');
    }
    // a game canvas sharp on any screen: draw in its own units (w × h)
    function canvas(w, hgt) {
      var cv = h('canvas', { 'class': 'ty-cv', width: String(w), height: String(hgt), role: 'img' });
      return cv;
    }
    var AC = null;
    function beep(freq, len, vol) {
      try {
        AC = AC || new (window.AudioContext || window.webkitAudioContext)();
        var t = AC.currentTime, osc = AC.createOscillator(), g = AC.createGain();
        osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(freq / 2, t + len);
        g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        osc.connect(g); g.connect(AC.destination); osc.start(t); osc.stop(t + len);
      } catch (e) {}
    }
    return { rnd: rnd, shuffle: shuffle, pick: pick, WORDS: WORDS, PASSAGES: PASSAGES, FINGERS: FINGERS, DEFS: DEFS, CODES: CODES, layout: layout, finger: finger, fingerFor: fingerFor,
      emulate: emulate, board: board, legend: legend, wpm: wpm, fmtTime: fmtTime, nfc: nfc, drill: drill, statsEl: statsEl, log: log, history: history, best: best, words: words, canvas: canvas, beep: beep };
  })());
  var status = T.status(), opts = T.store.get('typing-layouts', { lay: 'dvorak', level: 'home', emu: true });
  var kb = Y.board(Y.layout(opts.lay)), hint = h('p', { 'class': 'ty-hint', 'aria-live': 'polite' }), out = h('div', { style: 'display:grid;gap:10px;min-width:0' }), d;
  function homeLetters(L) { return L.keys.filter(function (k) { return k.row === 2 && /^[a-zà-ÿ]$/.test(k.n); }).map(function (k) { return k.n; }).join(''); }
  function letters(L) { return L.keys.filter(function (k) { return /^[a-z]$/.test(k.n); }).map(function (k) { return k.n; }).join(''); }
  function textFor(L, level) {
    if (level === 'home') {
      var hm = homeLetters(L), pool = Y.WORDS.filter(function (w) { return w.length > 1 && w.split('').every(function (c) { return hm.indexOf(c) >= 0; }); }), o = [];
      for (var i = 0; i < 6; i++) { var g = ''; for (var j = 0, n = 2 + Y.rnd(3); j < n; j++) g += hm[Y.rnd(hm.length)]; o.push(g); }
      for (var k = 0; k < Math.min(8, pool.length); k++) o.push(Y.pick(pool));
      return o.join(' ');
    }
    if (level === 'words') return Y.words(14);
    return Y.pick(Y.PASSAGES);
  }
  function restart() {
    if (d) d.stop();
    var L = Y.layout(opts.lay); kb.set(L);
    var o = { text: textFor(L, opts.level), board: kb, onDone: done, onNext: function (info, ok) { hint.textContent = !ok ? 'Oops: press Backspace to fix it.' : info ? 'Next: ' + (info.key.code === 'Space' ? 'Space bar' : (info.shift ? 'Shift + ' : '') + (info.key.n || '').toUpperCase()) + ' — ' + info.finger.toLowerCase() : ''; } };
    if (opts.emu && opts.lay !== 'qwerty') o.emu = L;
    var nd = Y.drill(o); if (d) d.el.replaceWith(nd.el); d = nd; out.innerHTML = ''; status.clear();
  }
  function done(r) {
    if (!r.demo) Y.log('typing-layouts', r, { lay: opts.lay });
    out.innerHTML = ''; out.appendChild(Y.statsEl(r));
    status.ok(Y.layout(opts.lay).name + ': ' + Math.round(r.wpm) + ' WPM with ' + Math.round(r.acc) + '% accuracy.');
    out.appendChild(T.row([T.button('Next text', { primary: true, onclick: function () { restart(); d.input.focus(); } })]));
  }
  function save() { T.store.set('typing-layouts', opts); }
  var emu = h('input', { type: 'checkbox', checked: opts.emu ? true : null, onchange: function () { opts.emu = emu.checked; save(); restart(); } });
  spot.appendChild(T.card([T.field('Layout', T.seg([['qwerty', 'QWERTY'], ['azerty', 'AZERTY'], ['qwertz', 'QWERTZ'], ['dvorak', 'Dvorak']], opts.lay, function (v) { opts.lay = v; save(); restart(); })),
    T.field('Practise', T.seg([['home', 'Home row'], ['words', 'Words'], ['text', 'Sentences']], opts.level, function (v) { opts.level = v; save(); restart(); })),
    h('label', { 'class': 'tcheck' }, [emu, ' My keyboard is a normal QWERTY one: swap the keys for me']),
    hint, kb.el, Y.legend(), h('div'), T.row([T.button('New text', { onclick: function () { restart(); d.input.focus(); } }), T.button('Try a sample (watch)', { onclick: function () { restart(); d.demo(40); } })]), status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  restart(); spot.lastChild.insertBefore(d.el, spot.lastChild.children[6]);
  T.tests['typing-layouts'] = function () {
    var f = [], dv = Y.layout('dvorak'), az = Y.layout('azerty'), de = Y.layout('qwertz');
    [[dv, 'd', 'e'], [dv, 'j', 'h'], [dv, 'q', "'"], [dv, 'S', 'O'], [az, 'q', 'a'], [az, 'a', 'q'], [az, 'w', 'z'], [az, ';', 'm'], [de, 'y', 'z'], [de, 'z', 'y'], [de, '[', 'ü']].forEach(function (x) {
      if (Y.emulate(x[0], x[1]) !== x[2]) f.push(x[0].name + ' ' + x[1] + ' → ' + Y.emulate(x[0], x[1])); });
    if (homeLetters(dv) !== 'aoeuidhtns' || homeLetters(Y.layout('qwerty')) !== 'asdfghjkl') f.push('home rows ' + homeLetters(dv));
    var t = Y.drill({ text: 'hello', emu: dv }); t.feed('jdpps'); if (!t.result().done || t.result().errors) f.push('dvorak drill ' + t.input.value);
    ['qwerty', 'azerty', 'qwertz', 'dvorak'].forEach(function (id) { if (letters(Y.layout(id)).length !== 26) f.push(id + ' letters'); });
    return Promise.resolve({ ok: !f.length, n: 18, fails: f });
  };
});
