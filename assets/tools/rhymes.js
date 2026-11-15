/* Infinity by GroupChatOn — rhymes. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Rhymes reader: traditional public-domain nursery rhymes and new rhymes written for this site, read line by line with the current line lit up. */
GCOTools.register('rhymes', function (spot, T) {
  var h = T.h, K = T.kids || (T.kids = (function () {
    // shared by the kids tools (each tool carries its own copy, so any one can load alone): big tap tiles, a picture stage, speech, fair random picks, a quiz
    if (!document.getElementById('gco-kids-css')) document.head.appendChild(h('style', { id: 'gco-kids-css', text: [
      '.kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px}',
      '.ktile{display:grid;place-items:center;gap:2px;min-height:64px;min-width:0;padding:6px 4px;border-radius:16px;border:2px solid var(--line);background:var(--surface-2);color:var(--ink);font:700 26px/1.15 var(--ui);cursor:pointer;touch-action:manipulation;overflow-wrap:anywhere}',
      '.ktile small{font:600 12px/1.2 var(--ui);color:var(--ink-soft)}.ktile:hover{border-color:var(--accent)}.ktile.is-on{border-color:var(--accent);background:var(--accent-soft)}',
      '.ktile.is-ok,.kchoices button.is-ok{border-color:#16a34a;background:rgba(34,197,94,.22)}.ktile.is-no,.kchoices button.is-no{border-color:#dc2626;background:rgba(239,68,68,.16)}',
      '.kstage{display:grid;justify-items:center;gap:6px;min-width:0;padding:16px 10px;border-radius:20px;background:var(--bg);border:1px solid var(--line);text-align:center}',
      '.kbig{font:800 clamp(56px,17vw,112px)/1.1 var(--ui)}.kpic{font-size:clamp(46px,13vw,84px);line-height:1.15}',
      '.kword{font:700 clamp(20px,6vw,30px)/1.3 var(--ui);overflow-wrap:anywhere}.ksub{color:var(--ink-soft);font-size:15px;overflow-wrap:anywhere}',
      '.kchoices{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(130px,100%),1fr));gap:10px}',
      '.kchoices button{min-height:64px;min-width:0;padding:8px;border-radius:16px;border:2px solid var(--line);background:var(--surface-2);color:var(--ink);font:700 24px/1.2 var(--ui);cursor:pointer;touch-action:manipulation;overflow-wrap:anywhere}',
      '.kscore{margin:0;font:700 17px/1.4 var(--ui);text-align:center}.kswatch{width:44px;height:44px;border-radius:50%;border:3px solid var(--line);cursor:pointer}.kswatch[aria-pressed=true]{border-color:var(--ink);transform:scale(1.1)}',
      '.kcanvas{display:block;width:min(100%,420px);height:auto;aspect-ratio:1;margin:0 auto;border-radius:18px;border:2px solid var(--line);background:#fff;touch-action:none;cursor:crosshair}',
      '@media (prefers-reduced-motion:no-preference){.kpop{animation:kpop .35s ease}@keyframes kpop{0%{transform:scale(.7)}70%{transform:scale(1.08)}100%{transform:scale(1)}}}'].join('') }));
    function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    var synth = window.speechSynthesis;
    function voices() { try { return synth ? synth.getVoices() : []; } catch (e) { return []; } }
    voices();
    function voice(lang) {
      var l = String(lang || 'en-US').toLowerCase(), vs = voices();
      function f(test) { return vs.filter(function (v) { return test(String(v.lang).toLowerCase().replace('_', '-')); })[0]; }
      return f(function (x) { return x === l; }) || f(function (x) { return x.slice(0, 2) === l.slice(0, 2); }) || null;
    }
    // say(text, 'hi-IN', { fallback: 'said in English when the device has no voice for that language', rate, onend, onboundary, queue })
    function say(text, lang, o) {
      o = o || {};
      if (!synth || !window.SpeechSynthesisUtterance || !text) return null;
      try {
        if (!o.queue) synth.cancel();
        lang = lang || 'en-US';
        var v = voice(lang);
        if (!v && o.fallback != null && voices().length) { if (!o.fallback) return null; text = o.fallback; lang = 'en-US'; v = voice(lang); }
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang; if (v) u.voice = v; u.rate = o.rate || 0.85; u.pitch = o.pitch || 1.05;
        if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
        if (o.onboundary) u.onboundary = o.onboundary;
        synth.speak(u); return u;
      } catch (e) { return null; }
    }
    function uniq(a) { var seen = {}; return a.filter(function (x) { var k = String(x); if (seen[k]) return false; seen[k] = 1; return true; }); }
    // the right answer plus n-1 different wrong ones, shuffled
    function choices(answer, pool, n) { return shuffle([answer].concat(shuffle(uniq(pool).filter(function (x) { return String(x) !== String(answer); })).slice(0, (n || 4) - 1))); }
    var PRAISE = ['Well done! 🎉', 'Great job! ⭐', 'Super! 🌟', 'You got it! 👏', 'Brilliant! 🏆', 'Yay! 🎈'];
    function stars(score, n) { var r = n ? score / n : 0; return r >= 0.9 ? '⭐⭐⭐' : r >= 0.6 ? '⭐⭐' : r >= 0.3 ? '⭐' : '🌱'; }
    /* quiz({ rounds, next() → { q: [nodes], a: answer, opts: [answers], say: fn }, label(v) → text or node, done(score, n) })
       first tap counts; a wrong tap shows the right answer, then the next question comes */
    function quiz(o) {
      var n = o.rounds || 10, score = 0, asked = 0, cur = null, locked = false, timer = 0;
      var head = h('div', { 'class': 'kstage' }), grid = h('div', { 'class': 'kchoices' }), info = h('p', { 'class': 'kscore', 'data-out': '', 'aria-live': 'polite' });
      var box = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [head, grid, info]);
      function next() {
        clearTimeout(timer);
        if (asked >= n) return finish();
        cur = o.next(); locked = false; head.innerHTML = ''; grid.innerHTML = '';
        cur.q.forEach(function (x) { head.appendChild(typeof x === 'string' ? h('div', { 'class': 'kword', text: x }) : x); });
        cur.opts.forEach(function (v) {
          var lab = o.label ? o.label(v) : String(v), b = h('button', { type: 'button', 'data-v': String(v) }, [lab]);
          b.addEventListener('click', function () { pick(b, v); });
          grid.appendChild(b);
        });
        info.textContent = 'Question ' + (asked + 1) + ' of ' + n + ' · Score ' + score;
        if (cur.say) cur.say();
      }
      function pick(b, v) {
        if (locked) return;
        locked = true; asked++;
        var ok = String(v) === String(cur.a), p = K.praise(), why = cur.why ? ' ' + cur.why : '';
        if (ok) { score++; b.classList.add('is-ok'); info.textContent = p + why + ' Score ' + score + ' of ' + asked; say(p.replace(/[^A-Za-z! ]/g, '') + why); }
        else {
          b.classList.add('is-no');
          Array.prototype.forEach.call(grid.children, function (x) { if (x.getAttribute('data-v') === String(cur.a)) x.classList.add('is-ok'); });
          info.textContent = 'Not quite: the answer is shown in green.' + why + ' Score ' + score + ' of ' + asked;
          if (why) say(why);
        }
        timer = setTimeout(next, (ok ? 1100 : 2200) + (why ? 1600 : 0));
      }
      function finish() {
        head.innerHTML = ''; grid.innerHTML = '';
        head.appendChild(h('div', { 'class': 'kpic', text: stars(score, n) }));
        head.appendChild(h('div', { 'class': 'kword', text: 'You got ' + score + ' out of ' + n + '!' }));
        head.appendChild(T.button('Play again', { primary: true, onclick: start }));
        info.textContent = score === n ? 'Perfect score! 🏆' : 'Keep practising and you will get them all.';
        say('You got ' + score + ' out of ' + n);
        if (o.done) o.done(score, n);
      }
      function start() { score = 0; asked = 0; next(); }
      return { el: box, start: start, stop: function () { clearTimeout(timer); } };
    }
    var K = { rnd: rnd, shuffle: shuffle, pick: function (a) { return a[rnd(a.length)]; }, say: say, voice: voice, choices: choices, uniq: uniq, stars: stars, quiz: quiz,
      praise: function () { return PRAISE[rnd(PRAISE.length)]; },
      pop: function (el) { el.classList.remove('kpop'); void el.offsetWidth; el.classList.add('kpop'); },
      tile: function (big, small, onclick, label) { return h('button', { type: 'button', 'class': 'ktile', onclick: onclick, 'aria-label': label || null }, [h('b', { text: big }), small ? h('small', { text: small }) : null]); },
      mark: function (box, el) { Array.prototype.forEach.call(box.children, function (x) { x.classList.toggle('is-on', x === el); }); },
      fit: function (spot) { var c = spot.lastChild; if (c) c.style.gridTemplateColumns = 'minmax(0, 1fr)'; } };
    return K;
  })());
  // title, language, picture, old (traditional, public domain) or new (written for this site), lines separated by /
  var R = [
    ['Twinkle, Twinkle, Little Star', 'en-US', '⭐', 'old', 'Twinkle, twinkle, little star, / How I wonder what you are! / Up above the world so high, / Like a diamond in the sky. / Twinkle, twinkle, little star, / How I wonder what you are!'],
    ['Humpty Dumpty', 'en-US', '🥚', 'old', 'Humpty Dumpty sat on a wall, / Humpty Dumpty had a great fall. / All the king’s horses and all the king’s men / Couldn’t put Humpty together again.'],
    ['Baa, Baa, Black Sheep', 'en-US', '🐑', 'old', 'Baa, baa, black sheep, / Have you any wool? / Yes sir, yes sir, / Three bags full! / One for the master, / One for the dame, / And one for the little boy / Who lives down the lane.'],
    ['Jack and Jill', 'en-US', '🪣', 'old', 'Jack and Jill went up the hill / To fetch a pail of water. / Jack fell down and broke his crown, / And Jill came tumbling after.'],
    ['Hickory Dickory Dock', 'en-US', '🐭', 'old', 'Hickory, dickory, dock, / The mouse ran up the clock. / The clock struck one, / The mouse ran down, / Hickory, dickory, dock.'],
    ['Row, Row, Row Your Boat', 'en-US', '🚣', 'old', 'Row, row, row your boat / Gently down the stream. / Merrily, merrily, merrily, merrily, / Life is but a dream.'],
    ['Hey Diddle Diddle', 'en-US', '🐄', 'old', 'Hey diddle diddle, / The cat and the fiddle, / The cow jumped over the moon. / The little dog laughed / To see such sport, / And the dish ran away with the spoon.'],
    ['One, Two, Buckle My Shoe', 'en-US', '👞', 'old', 'One, two, buckle my shoe; / Three, four, knock at the door; / Five, six, pick up sticks; / Seven, eight, lay them straight; / Nine, ten, a big fat hen.'],
    ['Rain, Rain, Go Away', 'en-US', '🌧️', 'old', 'Rain, rain, go away, / Come again another day. / Little children want to play, / Rain, rain, go away.'],
    ['Hot Cross Buns', 'en-US', '🥯', 'old', 'Hot cross buns! / Hot cross buns! / One a penny, two a penny, / Hot cross buns!'],
    ['My Red Bus', 'en-US', '🚌', 'new', 'My red bus goes beep, beep, beep, / Past the farm and past the sheep. / Up the hill and round the bend, / Waving to my bestest friend.'],
    ['Little Raindrop', 'en-US', '💧', 'new', 'Little raindrop, plip, plop, plop, / Dancing on the rooftop-top. / Splash a puddle, fill a pond, / Help the flowers grow beyond.'],
    ['Brush, Brush, Brush', 'en-US', '🪥', 'new', 'Brush your teeth up, brush them down, / Brush them round and round and round. / Top and bottom, front and back, / Shiny teeth, then off to bed, not a snack!'],
    ['Ten Little Toes', 'en-US', '🦶', 'new', 'One little toe, two little toes, / Wiggle them, jiggle them, see how it goes. / Count up to ten and give them a shake, / Now we are ready to walk to the lake!'],
    ['The Sleepy Moon', 'en-US', '🌙', 'new', 'The sleepy moon is climbing high, / A silver boat across the sky. / The stars come out to say goodnight, / Close your eyes and sleep tight.'],
    ['Washing Hands', 'en-US', '🧼', 'new', 'Water on, then soap goes round, / Bubbles, bubbles, without a sound. / Fingers, thumbs and in between, / Rinse and dry, now hands are clean!'],
    ['मछली जल की रानी है', 'hi-IN', '🐟', 'old', 'मछली जल की रानी है, / जीवन उसका पानी है। / हाथ लगाओ डर जाएगी, / बाहर निकालो मर जाएगी।'],
    ['सूरज दादा', 'hi-IN', '☀️', 'new', 'सूरज दादा जल्दी आओ, / सुबह-सुबह किरणें लाओ। / चिड़िया गाए, फूल खिलें, / हम सब मिलकर खेल खेलें।'],
    ['बारिश आई', 'hi-IN', '🌧️', 'new', 'टप-टप-टप बारिश आई, / ठंडी-ठंडी हवा भी लाई। / कागज़ की हम नाव चलाएँ, / छप-छप पानी में नहाएँ।'],
    ['मेरी गुड़िया', 'hi-IN', '🪆', 'new', 'मेरी गुड़िया प्यारी-प्यारी, / पहने सुंदर लाल किनारी। / गोल-गोल आँखें, गाल गुलाबी, / बातें उसकी सबसे न्यारी।']];
  function lines(r) { return r[4].split(' / '); }
  var ri = 0, playing = false, repeat = false, timer = 0, token = 0;
  var pic = h('div', { 'class': 'kpic' }), head = h('div', { 'class': 'kword' }), note = h('div', { 'class': 'ksub' }), box = h('div', { 'data-out': '', style: 'display:grid;gap:6px;text-align:center;font:600 clamp(19px,5vw,26px)/1.45 var(--ui)' });
  function show(i) {
    stop(); ri = i; var r = R[i]; pic.textContent = r[2]; head.textContent = r[0]; note.textContent = r[3] === 'old' ? 'Traditional rhyme' : 'A new rhyme written for this site';
    box.innerHTML = ''; lines(r).forEach(function (l) { box.appendChild(h('div', { style: 'padding:2px 8px;border-radius:10px', text: l })); });
    K.mark(grid, grid.children[i]); K.pop(pic);
  }
  function light(k) { Array.prototype.forEach.call(box.children, function (d, j) { d.style.background = j === k ? '#fde68a' : ''; d.style.color = j === k ? '#111' : ''; }); }
  function stop() { playing = false; token++; clearTimeout(timer); try { speechSynthesis.cancel(); } catch (e) {} light(-1); if (play) play.textContent = '🎵 Read it to me'; }
  function sing(k, my) {
    if (!playing || my !== token) return;
    var ls = lines(R[ri]);
    if (k >= ls.length) { if (repeat) { timer = setTimeout(function () { sing(0, my); }, 900); return; } stop(); return; }
    light(k); var moved = false;
    function next() { if (moved || my !== token) return; moved = true; clearTimeout(timer); timer = setTimeout(function () { sing(k + 1, my); }, 250); }
    K.say(ls[k], R[ri][1], { rate: 0.85, onend: next, queue: k > 0 });
    timer = setTimeout(next, 1400 + ls[k].length * 95);   // keeps going even if the device never says the line has ended
  }
  var play = T.button('🎵 Read it to me', { primary: true, onclick: function () { if (playing) return stop(); playing = true; play.textContent = '■ Stop'; try { speechSynthesis.cancel(); } catch (e) {} sing(0, ++token); } });
  var grid = h('div', { 'class': 'kgrid', style: 'grid-template-columns:repeat(auto-fill,minmax(110px,1fr))' });
  R.forEach(function (r, i) { var b = h('button', { type: 'button', 'class': 'ktile', style: 'font-size:15px;padding:8px' }, [h('span', { style: 'font-size:30px', text: r[2] }), h('small', { text: r[0] })]); b.addEventListener('click', function () { show(i); }); grid.appendChild(b); });
  spot.appendChild(T.card([h('div', { 'class': 'kstage' }, [pic, head, note, box]),
    T.row([play, h('label', { 'class': 'tcheck' }, [h('input', { type: 'checkbox', onchange: function () { repeat = this.checked; } }), ' Repeat']),
      T.button('Try a sample', { small: true, onclick: function () { show(10); } })]), h('b', { text: 'Choose a rhyme' }), grid]));
  K.fit(spot);
  show(0);
  T.tests['rhymes'] = function () {
    var f = [];
    if (R.length < 20) f.push('rhymes ' + R.length);
    R.forEach(function (r) { if (r.length !== 5 || (r[3] !== 'old' && r[3] !== 'new')) f.push('row ' + r[0]); if (lines(r).length < 4 || lines(r).some(function (l) { return !l.trim(); })) f.push('lines ' + r[0]); });
    if (R.filter(function (r) { return r[3] === 'new'; }).length < 9) f.push('new rhymes');
    show(2); if (box.children.length !== 8) f.push('baa baa lines ' + box.children.length); light(1); if (!box.children[1].style.background) f.push('light'); show(0);
    return Promise.resolve({ ok: !f.length, n: 44, fails: f });
  };
});
