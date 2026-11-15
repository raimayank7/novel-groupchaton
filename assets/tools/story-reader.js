/* Infinity by GroupChatOn — story-reader. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Story reader: eight short original picture stories (English and Hindi) read aloud with the words lit up as they are spoken, or paste your own story. */
GCOTools.register('story-reader', function (spot, T) {
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
  // our own stories, written for this site; each page: picture | text
  var STORIES = [
    ['Mina and the Moon Kite', 'en-US', ['🌇|Mina had a kite shaped like a moon. It was silver and round, with a long blue tail.', '🌬️|One windy evening she ran up the hill. “Fly high, Moon Kite!” she called.',
      '🪁|The kite rose higher and higher, until it floated right beside the real moon.', '🌙|“Who are you?” asked the real moon. “I am a kite,” said the kite. “I came to say hello.”',
      '⭐|The stars giggled and twinkled. They had never met a kite before.', '🏡|When the wind grew sleepy, Mina pulled her kite home. “Same time tomorrow?” whispered the moon.',
      '😴|Mina smiled and fell asleep, dreaming of silver skies.']],
    ['Tiko the Tiny Tortoise', 'en-US', ['🐢|Tiko was the smallest tortoise in the garden. He wished he could do something big.', '🍃|Every day he watched the busy birds and said, “One day I will help someone too.”',
      '🌧️|One morning it rained very hard. A little ladybird fell into a puddle. “Help!” she cried.', '🛟|Tiko paddled slowly to the puddle. “Climb on my shell,” he said.',
      '🐞|The ladybird climbed on, and Tiko carried her to a big dry leaf.', '😊|“You may be small,” said the ladybird, “but you have a very big heart.”', '🌈|From that day on, Tiko never felt tiny again.']],
    ['Raju’s Rainy Day', 'en-US', ['🌧️|Rain tapped on the window. Raju sighed. “No football today.”', '📦|Grandma brought out an old box of paper. “Let’s make a boat,” she said.',
      '⛵|They folded a little boat together and painted it red and yellow.', '🚪|When the rain slowed down, they hurried outside to the stream by the gate.',
      '💧|The boat sailed past leaves and pebbles. Raju ran beside it, laughing.', '🌈|Then the sun came out and a rainbow appeared. “Rainy days are fun after all,” said Raju.']],
    ['The Counting Bus', 'en-US', ['🚌|The yellow bus stopped at the first stop. One little duck climbed in. Quack!', '🐶|At the next stop, two puppies hopped on. Now there were three friends.',
      '🐱|Three kittens climbed aboard with a purr. Now there were six friends.', '🐰|Four rabbits squeezed in, wiggling their noses. Now there were ten friends!',
      '🎉|“Where are we going?” they all asked. “To the park!” said the driver.', '🌳|At the park, all ten friends jumped out and played until the sun went down.']],
    ['Pip the Penguin Finds Spring', 'en-US', ['🐧|Pip lived where the snow never melted. He wondered what green grass looked like.', '🐋|A friendly whale said, “Hop on my back! I am swimming north.”',
      '🌊|They travelled for days across the wide blue sea.', '🌸|At last Pip saw flowers on a hill. They were pink, yellow and purple!',
      '🥵|But the sun was warm, much too warm for a penguin.', '❄️|“Spring is lovely to visit,” said Pip, “but my snowy home is best for me.” And the whale carried him home.']],
    ['The Little Seed', 'en-US', ['🌰|A little seed lay in the dark, warm soil. “What will I be?” it wondered.', '💧|The rain gave it a drink, and the seed grew a tiny white root.',
      '☀️|The sun said good morning, and the seed pushed up a small green shoot.', '🌱|Day by day it grew taller: two leaves, then four, then ten.',
      '🌻|One summer morning it opened a big yellow face to the sky. It was a sunflower!', '🐦|Birds came to eat its seeds. Some fell into the soil, ready to grow again.']],
    ['चिंटू की साइकिल', 'hi-IN', ['🚲|चिंटू को जन्मदिन पर एक लाल साइकिल मिली। वह बहुत खुश था।', '😟|पर उसे साइकिल चलाना नहीं आता था। वह बार-बार गिर जाता था।',
      '👴|दादाजी ने कहा, “डरो मत। धीरे-धीरे पैडल चलाओ और सामने देखो।”', '💪|चिंटू ने रोज़ अभ्यास किया। हर दिन वह थोड़ा और दूर तक गया।',
      '🎉|एक दिन वह बिना गिरे पूरी गली में घूम आया!', '😊|चिंटू बोला, “मेहनत करो तो सब कुछ सीख सकते हैं।”']],
    ['बादल और नन्ही चिड़िया', 'hi-IN', ['🐦|एक नन्ही चिड़िया को बहुत प्यास लगी थी। धूप बहुत तेज़ थी।', '☁️|उसने आसमान में एक छोटा बादल देखा। “बादल भैया, थोड़ा पानी दोगे?”',
      '🌬️|बादल बोला, “मैं अकेला बहुत छोटा हूँ। मैं अपने दोस्तों को बुलाता हूँ।”', '⛈️|थोड़ी देर में बहुत सारे बादल आ गए। आसमान काला हो गया।',
      '🌧️|फिर टप-टप बारिश होने लगी। चिड़िया ने जी भरकर पानी पिया।', '🌈|चिड़िया ने मीठा गाना गाकर बादलों को धन्यवाद कहा।']]];
  function pages(s) { return s[2].map(function (p) { var i = p.indexOf('|'); return { pic: p.slice(0, i), text: p.slice(i + 1) }; }); }
  // your own story: pages are split at empty lines
  function ownPages(text) { return text.split(/\n\s*\n/).map(function (t) { return t.trim(); }).filter(Boolean).map(function (t) { return { pic: '📖', text: t }; }); }
  var own = h('textarea', { rows: '6', placeholder: 'Paste or type a story. Leave an empty line between pages.', 'aria-label': 'Your story' });
  own.value = T.store.get('story-own', '');
  own.addEventListener('input', function () { T.store.set('story-own', own.value.slice(0, 20000)); });
  var si = 0, pi = 0, list = pages(STORIES[0]), lang = 'en-US', rate = 0.85, reading = false, whole = false;
  var pic = h('div', { 'class': 'kpic', style: 'font-size:clamp(64px,20vw,120px)' }), text = h('p', { 'data-out': '', style: 'margin:0;font:600 clamp(20px,5.5vw,28px)/1.6 var(--ui);text-align:center;max-width:640px' });
  var title = h('div', { 'class': 'ksub' }), pageNo = h('span', { 'class': 'ksub' });
  function spans(str) { text.innerHTML = ''; var re = /\S+/g, m, last = 0; while ((m = re.exec(str))) { if (m.index > last) text.appendChild(document.createTextNode(str.slice(last, m.index))); var s = h('span', { text: m[0], 'data-at': String(m.index) }); text.appendChild(s); last = m.index + m[0].length; } if (last < str.length) text.appendChild(document.createTextNode(str.slice(last))); }
  function showPage() { var p = list[pi]; if (!p) return; pic.textContent = p.pic; spans(p.text); pageNo.textContent = 'Page ' + (pi + 1) + ' of ' + list.length; K.pop(pic); }
  function lightAt(ci) { Array.prototype.forEach.call(text.querySelectorAll('span[data-at]'), function (s) { var a = +s.getAttribute('data-at'); s.style.background = ci >= a && ci < a + s.textContent.length ? '#fde68a' : ''; s.style.borderRadius = '6px'; s.style.color = ci >= a && ci < a + s.textContent.length ? '#111' : ''; }); }
  function stop() { reading = false; whole = false; try { speechSynthesis.cancel(); } catch (e) {} lightAt(-1); readBtn.textContent = '🔊 Read this page'; }
  function readPage() {
    var p = list[pi]; if (!p) return; reading = true; readBtn.textContent = '■ Stop';
    var u = K.say(p.text, lang, { rate: rate, onboundary: function (e) { lightAt(e.charIndex); }, onend: function () {
      lightAt(-1); if (!reading) return;
      if (whole && pi < list.length - 1) { pi++; showPage(); setTimeout(function () { if (reading) readPage(); }, 600); } else stop();
    } });
    if (!u) { reading = false; readBtn.textContent = '🔊 Read this page'; }
  }
  var readBtn = T.button('🔊 Read this page', { primary: true, onclick: function () { if (reading) return stop(); whole = false; readPage(); } });
  var speed = h('input', { type: 'range', min: '0.6', max: '1.2', step: '0.05', value: String(rate), 'aria-label': 'Reading speed', style: 'width:100%' });
  speed.addEventListener('input', function () { rate = +speed.value; });
  var pick = T.select(STORIES.map(function (s, i) { return [i, s[0] + (s[1] === 'hi-IN' ? ' (हिन्दी)' : '')]; }).concat([['own', 'My own story']]), 0);
  var ownBox = T.field('Your story', own); ownBox.hidden = true;
  function choose(v) {
    stop(); ownBox.hidden = v !== 'own';
    if (v === 'own') { list = ownPages(own.value); if (!list.length) list = [{ pic: '📖', text: 'Type or paste a story in the box below, then press Use my story.' }]; lang = /[ऀ-ॿ]/.test(own.value) ? 'hi-IN' : 'en-US'; title.textContent = 'My own story'; }
    else { si = +v; list = pages(STORIES[si]); lang = STORIES[si][1]; title.textContent = STORIES[si][0]; }
    pi = 0; showPage();
  }
  pick.addEventListener('change', function () { choose(pick.value); });
  spot.appendChild(T.card([T.field('Story', pick), ownBox,
    h('div', { 'class': 'kstage' }, [title, pic, text, pageNo]),
    T.row([T.button('◀', { onclick: function () { stop(); if (pi > 0) { pi--; showPage(); } } }), readBtn, T.button('▶', { onclick: function () { stop(); if (pi < list.length - 1) { pi++; showPage(); } } })]),
    T.row([T.button('▶▶ Read the whole story', { onclick: function () { stop(); pi = 0; showPage(); whole = true; readPage(); } }),
      T.button('Use my story', { small: true, onclick: function () { pick.value = 'own'; choose('own'); } }),
      T.button('Try a sample', { small: true, onclick: function () { pick.value = '3'; choose('3'); } })]),
    T.field('Reading speed', speed), h('p', { 'class': 'ksub', text: 'Words light up as they are read when your device’s voice supports it. Hindi stories need a Hindi voice on the device.' })]));
  K.fit(spot);
  choose('0');
  T.tests['story-reader'] = function () {
    var f = [];
    if (STORIES.length !== 8) f.push('stories ' + STORIES.length);
    STORIES.forEach(function (s) { var p = pages(s); if (p.length < 6) f.push(s[0] + ' short'); p.forEach(function (x) { if (!x.pic || x.text.length < 10) f.push(s[0] + ' page'); }); });
    if (ownPages('One.\n\nTwo.\n \nThree').length !== 3) f.push('own pages');
    spans('The cat sat.'); if (text.querySelectorAll('span').length !== 3 || text.textContent !== 'The cat sat.') f.push('word spans');
    lightAt(4); if (!text.querySelectorAll('span')[1].style.background) f.push('highlight');
    choose('0');
    return Promise.resolve({ ok: !f.length, n: 60, fails: f });
  };
});
