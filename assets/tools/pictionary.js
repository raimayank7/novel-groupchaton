/* Infinity by GroupChatOn — pictionary. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Draw and guess: picks secret words to draw (three levels), runs the timer, keeps team scores, and has a drawing pad for playing on one screen. */
GCOTools.register('pictionary', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var WORDS = {
    easy: 'cat,dog,sun,moon,tree,house,car,fish,ball,apple,banana,star,boat,hat,cup,book,bird,flower,cake,kite,clock,chair,shoe,egg,spoon,key,bus,train,rain,snowman,smile,heart,door,bed,pencil,duck,frog,lion,mouse,ice cream,umbrella,rainbow,cloud,phone,bell,candle,glasses,crown,balloon,ladder,pizza,carrot,spider,snake,horse,cow,pig,elephant,rabbit,turtle',
    medium: 'bicycle,guitar,castle,rocket,volcano,island,camera,dragon,robot,penguin,giraffe,lighthouse,tent,bridge,windmill,parachute,scissors,toothbrush,hamburger,sandwich,pineapple,mermaid,pirate,teacher,doctor,farmer,library,airport,hospital,waterfall,jungle,desert,swimming,dancing,sleeping,cooking,fishing,reading,singing,running,juggling,painting,skateboard,helicopter,treasure,compass,microscope,telescope,backpack,keyboard,lantern,peacock,octopus,kangaroo,cactus,igloo,snail,wedding,birthday,cricket bat',
    hard: 'gravity,echo,shadow,dream,silence,electricity,freedom,friendship,traffic jam,time travel,homework,thunderstorm,earthquake,recycling,photosynthesis,daylight saving,family tree,stock market,social media,password,vacation,breakfast in bed,rush hour,lost luggage,bad hair day,full moon,haunted house,surprise party,power cut,brain freeze,sunburn,applause,hiccups,jet lag,rollercoaster,traffic light,solar system,magnet,vaccine,blackout,soap bubble,heatwave,stage fright,winning goal,selfie,sleepwalking,snowball fight,road trip,campfire story,first day at school'
  };
  function bag(level) { var l = WORDS[level].split(','); return { list: l, used: [] }; }
  function draw1(b) {   // picks a word not used yet; refills when every word has been used
    if (b.used.length >= b.list.length) b.used = [];
    var left = b.list.filter(function (w) { return b.used.indexOf(w) < 0; }), w = left[rnd(left.length)];
    b.used.push(w); return w;
  }
  var level = T.store.get('pc-level', 'easy'), bags = { easy: bag('easy'), medium: bag('medium'), hard: bag('hard') }, word = '', shown = false, tick = null, left = 0;
  var teams = T.store.get('pc-teams', [{ n: 'Team A', s: 0 }, { n: 'Team B', s: 0 }]), turn = 0;
  var secs = T.select([[30, '30 seconds'], [60, '60 seconds'], [90, '90 seconds'], [120, '2 minutes']], T.store.get('pc-secs', 60));
  var card = h('button', { type: 'button', style: 'width:100%;min-height:120px;border:0;border-radius:18px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;font:900 clamp(26px,8vw,40px)/1.15 var(--ui);cursor:pointer;padding:16px', onclick: function () { if (word) { shown = !shown; paint(); } else next(); } });
  var clock = h('div', { 'data-out': '', 'aria-live': 'off', style: 'font:900 44px/1 var(--ui);text-align:center' }), turnEl = h('div', { style: 'text-align:center;font-weight:800' }), board = h('div', { 'class': 'tstats' });
  function paint() {
    card.textContent = !word ? 'Tap for a word' : shown ? word : '👀 Tap to see the word (drawer only)';
    clock.textContent = left > 0 ? String(left) : tick ? '0' : '';
    turnEl.textContent = '✏️ ' + teams[turn].n + ' draws now';
    board.innerHTML = '';
    teams.forEach(function (t, i) {
      board.appendChild(h('div', { 'class': 'tstat', style: i === turn ? 'outline:2px solid var(--accent)' : '' }, [h('b', { text: String(t.s) }), h('span', { text: t.n })]));
    });
    T.store.set('pc-teams', teams);
  }
  function next() { word = draw1(bags[level]); shown = false; paint(); }
  function startTimer() {
    if (!word) next();
    clearInterval(tick); left = +secs.value; T.store.set('pc-secs', left); status.clear(); paint();
    tick = setInterval(function () {
      left--; paint();
      if (left <= 0) { clearInterval(tick); tick = null; shown = true; paint(); status.info('⏰ Time’s up! The word was “' + word + '”.'); beep(); }
    }, 1000);
  }
  function beep() { try { var a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(); o.frequency.value = 660; o.connect(a.destination); o.start(); o.stop(a.currentTime + 0.4); } catch (e) {} if (navigator.vibrate) try { navigator.vibrate(300); } catch (e) {} }
  function got() { if (!word) return; teams[turn].s++; status.ok(teams[turn].n + ' guessed “' + word + '”! +1'); endTurn(); }
  function endTurn() { clearInterval(tick); tick = null; left = 0; turn = (turn + 1) % teams.length; word = ''; shown = false; clearPad(); paint(); }
  // ---- drawing pad ----
  var pad = h('canvas', { width: '900', height: '600', 'aria-label': 'Drawing pad', style: 'width:100%;aspect-ratio:3/2;background:#fff;border-radius:14px;border:1px solid var(--line);touch-action:none;cursor:crosshair' });
  var g = pad.getContext('2d'), pen = { c: '#111827', w: 6 }, down = false, lastPt = null;
  function pt(e) { var r = pad.getBoundingClientRect(); return [(e.clientX - r.left) * pad.width / r.width, (e.clientY - r.top) * pad.height / r.height]; }
  pad.addEventListener('pointerdown', function (e) { down = true; lastPt = pt(e); try { pad.setPointerCapture(e.pointerId); } catch (x) {} g.beginPath(); g.arc(lastPt[0], lastPt[1], pen.w / 2, 0, 7); g.fillStyle = pen.c; g.fill(); });
  pad.addEventListener('pointermove', function (e) { if (!down) return; var p = pt(e); g.strokeStyle = pen.c; g.lineWidth = pen.w; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(lastPt[0], lastPt[1]); g.lineTo(p[0], p[1]); g.stroke(); lastPt = p; });
  pad.addEventListener('pointerup', function () { down = false; });
  function clearPad() { g.fillStyle = '#fff'; g.fillRect(0, 0, pad.width, pad.height); }
  var tools = h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;align-items:center' });
  ['#111827', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#9333ea'].forEach(function (c) { tools.appendChild(h('button', { type: 'button', 'aria-label': 'Pen colour', style: 'width:32px;height:32px;border-radius:50%;border:2px solid var(--line);background:' + c + ';cursor:pointer', onclick: function () { pen.c = c; pen.w = sizeSel.value === 'b' ? 14 : 6; } })); });
  var sizeSel = T.seg([['t', 'Thin'], ['b', 'Thick']], 't', function (v) { pen.w = v === 'b' ? 14 : 6; });
  tools.appendChild(sizeSel);
  tools.appendChild(T.button('Eraser', { small: true, onclick: function () { pen.c = '#fff'; pen.w = 30; } }));
  tools.appendChild(T.button('Clear', { small: true, onclick: clearPad }));
  // ---- teams ----
  var teamBox = h('div', { style: 'display:grid;gap:6px' });
  function teamEditor() {
    teamBox.innerHTML = '';
    teams.forEach(function (t, i) {
      var inp = h('input', { type: 'text', value: t.n, maxlength: '20', 'aria-label': 'Team name' });
      inp.addEventListener('input', function () { t.n = inp.value || 'Team ' + (i + 1); paint(); });
      teamBox.appendChild(h('div', { style: 'display:flex;gap:6px;align-items:center' }, [inp, T.button('−1', { small: true, onclick: function () { t.s = Math.max(0, t.s - 1); paint(); } }), teams.length > 2 ? T.button('✕', { small: true, onclick: function () { teams.splice(i, 1); turn = 0; teamEditor(); paint(); } }) : null]));
    });
    if (teams.length < 6) teamBox.appendChild(T.button('+ Add a team', { small: true, onclick: function () { teams.push({ n: 'Team ' + String.fromCharCode(65 + teams.length), s: 0 }); teamEditor(); paint(); } }));
  }
  var lvSeg = T.seg([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], level, function (v) { level = v; T.store.set('pc-level', v); word = ''; paint(); });
  spot.appendChild(T.card([lvSeg, turnEl, card, clock,
    T.row([T.button('Start timer', { primary: true, onclick: startTimer }), T.button('✓ Guessed it', { small: true, onclick: got }), T.button('Skip word', { small: true, onclick: next }), T.button('Next team', { small: true, onclick: endTurn })]),
    T.field('Round time', secs), status.el, board,
    h('details', {}, [h('summary', { text: 'Drawing pad (draw right here on the screen)' }), h('div', { style: 'display:grid;gap:8px;margin-top:8px' }, [tools, pad])]),
    h('details', {}, [h('summary', { text: 'Teams and scores' }), h('div', { style: 'margin-top:8px;display:grid;gap:8px' }, [teamBox, T.button('Reset scores', { small: true, onclick: function () { teams.forEach(function (t) { t.s = 0; }); paint(); } })])])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  clearPad(); teamEditor(); paint();
  T.tests['pictionary'] = function () {
    var f = [];
    Object.keys(WORDS).forEach(function (k) {
      var l = WORDS[k].split(',');
      if (l.length < 50) f.push(k + ' only ' + l.length + ' words');
      if (l.some(function (w, i) { return !w || w !== w.trim() || l.indexOf(w) !== i; })) f.push(k + ' has a repeat or blank');
      var b = bag(k), seen = {};
      for (var i = 0; i < l.length; i++) { var w = draw1(b); if (seen[w]) { f.push(k + ' repeated before all words were used'); break; } seen[w] = 1; }
      if (!draw1(b)) f.push('refill');
    });
    return Promise.resolve({ ok: !f.length, n: 12, fails: f });
  };
});
