/* Infinity by GroupChatOn — body-parts. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Body parts: tap a drawn child to hear each part in English or Hindi, learn what parts do and the five senses, and play “touch the knee”. */
GCOTools.register('body-parts', function (spot, T) {
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
  // id, English, Hindi, what it does
  var PARTS = [['hair', 'hair', 'बाल', 'Hair keeps our head warm.'], ['head', 'head', 'सिर', 'Our head holds the brain, which does our thinking.'], ['eye', 'eyes', 'आँखें', 'We see with our eyes.'],
    ['ear', 'ears', 'कान', 'We hear with our ears.'], ['nose', 'nose', 'नाक', 'We smell and breathe through our nose.'], ['mouth', 'mouth', 'मुँह', 'We eat, talk and smile with our mouth.'],
    ['neck', 'neck', 'गर्दन', 'The neck holds up the head and lets it turn.'], ['shoulder', 'shoulders', 'कंधे', 'Shoulders let our arms swing round.'], ['chest', 'chest', 'छाती', 'Inside the chest are the heart and lungs.'],
    ['tummy', 'tummy', 'पेट', 'Food goes to the stomach in our tummy.'], ['arm', 'arms', 'बाँहें', 'Arms help us lift, carry and hug.'], ['elbow', 'elbows', 'कोहनी', 'Elbows let our arms bend.'],
    ['hand', 'hands', 'हाथ', 'We hold, draw and wave with our hands. Each hand has five fingers.'], ['leg', 'legs', 'टाँगें', 'Legs help us walk, run and jump.'], ['knee', 'knees', 'घुटने', 'Knees let our legs bend.'],
    ['foot', 'feet', 'पैर', 'Feet carry us and help us balance. Each foot has five toes.']];
  function part(id) { return PARTS.filter(function (p) { return p[0] === id; })[0]; }
  var SKIN = '#f5c9a0', BODY = '<svg viewBox="0 0 200 360" width="260" style="max-width:100%;height:auto;touch-action:manipulation" role="img" aria-label="A child: tap a body part">' +
    '<g stroke="#7c5a3c" stroke-width="2" style="cursor:pointer">' +
    '<rect data-part="leg" x="70" y="216" width="26" height="54" rx="8" fill="#1e3a8a"/><rect data-part="leg" x="104" y="216" width="26" height="54" rx="8" fill="#1e3a8a"/>' +
    '<rect data-part="leg" x="72" y="282" width="22" height="44" rx="8" fill="' + SKIN + '"/><rect data-part="leg" x="106" y="282" width="22" height="44" rx="8" fill="' + SKIN + '"/>' +
    '<circle data-part="knee" cx="83" cy="276" r="11" fill="' + SKIN + '"/><circle data-part="knee" cx="117" cy="276" r="11" fill="' + SKIN + '"/>' +
    '<ellipse data-part="foot" cx="78" cy="334" rx="20" ry="10" fill="#dc2626"/><ellipse data-part="foot" cx="122" cy="334" rx="20" ry="10" fill="#dc2626"/>' +
    '<rect data-part="arm" x="38" y="130" width="20" height="56" rx="9" fill="#60a5fa"/><rect data-part="arm" x="142" y="130" width="20" height="56" rx="9" fill="#60a5fa"/>' +
    '<rect data-part="arm" x="39" y="194" width="18" height="40" rx="8" fill="' + SKIN + '"/><rect data-part="arm" x="143" y="194" width="18" height="40" rx="8" fill="' + SKIN + '"/>' +
    '<circle data-part="elbow" cx="48" cy="190" r="9" fill="' + SKIN + '"/><circle data-part="elbow" cx="152" cy="190" r="9" fill="' + SKIN + '"/>' +
    '<circle data-part="hand" cx="48" cy="244" r="13" fill="' + SKIN + '"/><circle data-part="hand" cx="152" cy="244" r="13" fill="' + SKIN + '"/>' +
    '<rect data-part="tummy" x="60" y="168" width="80" height="54" rx="14" fill="#3b82f6"/><rect data-part="chest" x="60" y="122" width="80" height="50" rx="16" fill="#60a5fa"/>' +
    '<circle data-part="shoulder" cx="64" cy="132" r="12" fill="#60a5fa"/><circle data-part="shoulder" cx="136" cy="132" r="12" fill="#60a5fa"/>' +
    '<rect data-part="neck" x="89" y="104" width="22" height="22" rx="4" fill="' + SKIN + '"/>' +
    '<circle data-part="ear" cx="57" cy="70" r="10" fill="' + SKIN + '"/><circle data-part="ear" cx="143" cy="70" r="10" fill="' + SKIN + '"/>' +
    '<circle data-part="head" cx="100" cy="68" r="42" fill="' + SKIN + '"/>' +
    '<path data-part="hair" d="M58 62 C58 30 80 20 100 20 C122 20 142 30 142 62 C132 44 116 38 100 40 C84 38 68 44 58 62 Z" fill="#6b4423"/>' +
    '<circle data-part="eye" cx="84" cy="64" r="7" fill="#1e293b"/><circle data-part="eye" cx="116" cy="64" r="7" fill="#1e293b"/>' +
    '<path data-part="nose" d="M100 70 L94 86 L106 86 Z" fill="#e8a87c"/>' +
    '<path data-part="mouth" d="M84 94 Q100 110 116 94 Q100 102 84 94 Z" fill="#dc2626"/>' +
    '</g></svg>';
  var lang = 'en', fig = h('div', { style: 'line-height:0;display:grid;justify-items:center' }), label = h('div', { 'class': 'kword', 'data-out': '', 'aria-live': 'polite', text: 'Tap a body part' }), what = h('p', { style: 'margin:0;min-height:24px' }), target = null, score = 0;
  fig.innerHTML = BODY;
  function name(p) { return lang === 'hi' ? p[2] : p[1]; }
  function sayPart(p, extra) { if (lang === 'hi') K.say(p[2], 'hi-IN', { fallback: p[1] }); else K.say(p[1] + '. ' + (extra || '')); }
  function light(id) { Array.prototype.forEach.call(fig.querySelectorAll('[data-part]'), function (el) { el.style.filter = el.getAttribute('data-part') === id ? 'drop-shadow(0 0 6px #facc15) brightness(1.15)' : ''; }); }
  fig.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-part]'); if (!el) return;
    var p = part(el.getAttribute('data-part')); light(p[0]);
    if (target) {
      if (p[0] === target[0]) { score++; label.textContent = K.praise() + ' That is the ' + name(p) + '.'; K.say('Yes! ' + p[1]); setTimeout(ask, 1500); }
      else { label.textContent = 'That is the ' + name(p) + '. Find the ' + name(target) + '!'; sayPart(p); }
      what.textContent = 'Score: ' + score; return;
    }
    label.textContent = name(p) + (lang === 'hi' ? ' · ' + p[1] : ' · ' + p[2]); what.textContent = p[3]; sayPart(p, p[3]);
  });
  function ask() { target = K.pick(PARTS); light(''); label.textContent = 'Touch the ' + name(target) + '!'; if (lang === 'hi') K.say(target[2] + ' कहाँ है?', 'hi-IN', { fallback: 'Touch the ' + target[1] }); else K.say('Touch the ' + target[1]); }
  var gameBtn = T.button('🎯 Play “Touch the…”', { primary: true, onclick: function () { if (target) { target = null; gameBtn.textContent = '🎯 Play “Touch the…”'; label.textContent = 'Tap a body part'; what.textContent = ''; light(''); return; } score = 0; what.textContent = 'Score: 0'; gameBtn.textContent = '■ Stop the game'; ask(); } });
  var SENSES = [['👀', 'sight', 'eyes', 'We see colours, shapes and light.'], ['👂', 'hearing', 'ears', 'We hear music, voices and birds.'], ['👃', 'smell', 'nose', 'We smell flowers and food.'],
    ['👅', 'taste', 'tongue', 'We taste sweet, salty, sour and bitter.'], ['✋', 'touch', 'skin', 'Our skin feels hot, cold, soft and rough.']];
  var senses = h('div', { 'class': 'tkv' }, SENSES.map(function (s) { return h('div', { style: 'grid-template-columns:48px minmax(0,1fr) auto' }, [h('span', { style: 'font-size:30px', text: s[0] }),
    h('span', {}, [h('b', { text: s[1] + ' · ' + s[2] }), h('br'), s[3]]), T.button('🔊', { small: true, onclick: function () { K.say('The sense of ' + s[1] + '. We use our ' + s[2] + '. ' + s[3]); } })]); }));
  var q = K.quiz({ rounds: 5, next: function () { var s = K.pick(SENSES); return { q: [h('div', { 'class': 'kpic', text: s[0] }), 'Which part helps us with ' + s[1] + '?'], a: s[2], opts: K.choices(s[2], SENSES.map(function (x) { return x[2]; }), 4) }; } });
  var main = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [h('div', { 'class': 'kstage' }, [fig, label, what]), T.row([gameBtn])]);
  var sensesBox = h('div', { style: 'display:grid;gap:12px;min-width:0' }, [senses, h('b', { text: 'Quick quiz' }), q.el]);
  var body = h('div', { style: 'display:grid;min-width:0' }, [main]);
  spot.appendChild(T.card([T.seg([['body', 'My body'], ['senses', 'Five senses']], 'body', function (v) { q.stop(); body.innerHTML = ''; body.appendChild(v === 'body' ? main : sensesBox); if (v === 'senses') q.start(); }),
    T.seg([['en', 'English'], ['hi', 'हिन्दी']], 'en', function (v) { lang = v; if (target) ask(); }), body]));
  K.fit(spot);
  T.tests['body-parts'] = function () {
    var f = [], ids = K.uniq(Array.prototype.map.call(fig.querySelectorAll('[data-part]'), function (el) { return el.getAttribute('data-part'); }));
    PARTS.forEach(function (p) { if (ids.indexOf(p[0]) < 0) f.push('no drawing for ' + p[0]); if (p.length !== 4) f.push('row ' + p[0]); });
    ids.forEach(function (id) { if (!part(id)) f.push('no data for ' + id); });
    var knee = fig.querySelector('[data-part="knee"]'); knee.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    if (label.textContent.indexOf('knees') !== 0) f.push('tap label ' + label.textContent);
    label.textContent = 'Tap a body part'; what.textContent = ''; light('');
    return Promise.resolve({ ok: !f.length, n: PARTS.length + 2, fails: f });
  };
});
