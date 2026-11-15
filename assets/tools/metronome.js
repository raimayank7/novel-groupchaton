/* Infinity by GroupChatOn — metronome. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Metronome: 20–300 BPM, beats per bar, accent, subdivisions, three sounds, tap tempo. Clicks are scheduled on the audio clock, so they stay steady. */
GCOTools.register('metronome', function (spot, T) {
  var h = T.h;
  var NAMES = [[40, 'Grave'], [60, 'Largo'], [66, 'Larghetto'], [76, 'Adagio'], [108, 'Andante'], [120, 'Moderato'], [156, 'Allegro'], [176, 'Vivace'], [200, 'Presto'], [1e9, 'Prestissimo']];
  function tempoName(b) { for (var i = 0; i < NAMES.length; i++) if (b < NAMES[i][0]) return NAMES[i][1]; return 'Prestissimo'; }
  function tapBpm(ts) { if (ts.length < 2) return 0; var d = [], i; for (i = 1; i < ts.length; i++) d.push(ts[i] - ts[i - 1]); var avg = d.reduce(function (a, b) { return a + b; }, 0) / d.length; return Math.round(60000 / avg); }
  function plan(bpm, beats, subs, count) { var out = [], step = 60 / bpm / subs; for (var i = 0; i < count; i++) { var s = i % subs, b = Math.floor(i / subs) % beats; out.push({ t: Math.round(i * step * 1e6) / 1e6, kind: s ? 'sub' : b ? 'beat' : 'accent', beat: b }); } return out; }
  var bpm = T.store.get('metro-bpm', 100), ac = null, timer = 0, next = 0, idx = 0, taps = [];
  var big = h('div', { 'data-out': '', style: 'font:800 clamp(52px,16vw,88px)/1 var(--ui);text-align:center;font-variant-numeric:tabular-nums' }), name = h('div', { style: 'text-align:center;color:var(--ink-soft);font-weight:600' });
  var slider = h('input', { type: 'range', min: '20', max: '300', value: String(bpm), 'aria-label': 'Beats per minute' }), num = h('input', { type: 'number', min: '20', max: '300', value: String(bpm), 'aria-label': 'BPM' });
  var beats = T.seg([['2', '2/4'], ['3', '3/4'], ['4', '4/4'], ['5', '5/4'], ['6', '6/8']], String(T.store.get('metro-beats', 4)), function (v) { T.store.set('metro-beats', +v); drawDots(); });
  var subs = T.seg([['1', '♩'], ['2', '♫ ×2'], ['3', 'Triplets'], ['4', '×4']], '1'), sound = T.seg([['click', 'Click'], ['wood', 'Wood'], ['beep', 'Beep']], T.store.get('metro-sound', 'click'), function (v) { T.store.set('metro-sound', v); });
  var accent = h('input', { type: 'checkbox', checked: true }), vol = h('input', { type: 'range', min: '0', max: '100', value: '80', 'aria-label': 'Volume' });
  var dots = h('div', { style: 'display:flex;justify-content:center;gap:10px' });
  function drawDots() { dots.innerHTML = ''; for (var i = 0; i < +beats.value(); i++) dots.appendChild(h('span', { style: 'width:22px;height:22px;border-radius:50%;background:var(--surface-2);border:2px solid var(--line);transition:background .05s' })); }
  function setBpm(v) { bpm = Math.max(20, Math.min(300, Math.round(+v) || 100)); slider.value = num.value = bpm; big.textContent = bpm + ' BPM'; name.textContent = tempoName(bpm); T.store.set('metro-bpm', bpm); }
  slider.addEventListener('input', function () { setBpm(slider.value); }); num.addEventListener('change', function () { setBpm(num.value); });
  function click(t, kind) {
    var o = ac.createOscillator(), g = ac.createGain(), v = vol.value / 100 * (kind === 'accent' ? 1 : kind === 'beat' ? 0.7 : 0.4), s = sound.value();
    if (kind === 'accent' && !accent.checked) { kind = 'beat'; v = vol.value / 100 * 0.7; }
    o.type = s === 'beep' ? 'sine' : s === 'wood' ? 'triangle' : 'square';
    o.frequency.value = (s === 'wood' ? 800 : s === 'beep' ? 880 : 1000) * (kind === 'accent' ? 1.5 : kind === 'sub' ? 0.75 : 1);
    var d = s === 'beep' ? 0.08 : 0.03;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.001, v), t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.01);
  }
  function light(b) { Array.prototype.forEach.call(dots.children, function (d, i) { d.style.background = i === b ? (b === 0 && accent.checked ? '#ef4444' : 'var(--accent)') : 'var(--surface-2)'; }); }
  function schedule() {
    var n = +subs.value(), nb = +beats.value();
    while (next < ac.currentTime + 0.12) {
      var s = idx % n, b = Math.floor(idx / n) % nb, kind = s ? 'sub' : b ? 'beat' : 'accent';
      click(next, kind);
      if (!s) (function (bb, at) { setTimeout(function () { light(bb); }, Math.max(0, (at - ac.currentTime) * 1000)); })(b, next);
      idx++; next += 60 / bpm / n;
    }
  }
  var play = T.button('▶ Start', { primary: true, onclick: function () {
    if (timer) { clearInterval(timer); timer = 0; play.textContent = '▶ Start'; light(-1); return; }
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume(); } catch (e) { return; }
    idx = 0; next = ac.currentTime + 0.06; timer = setInterval(schedule, 25); schedule(); play.textContent = '■ Stop';
  } });
  var tap = T.button('Tap tempo', { onclick: function () { var t = performance.now(); if (taps.length && t - taps[taps.length - 1] > 2000) taps = []; taps.push(t); taps = taps.slice(-6); if (taps.length > 1) setBpm(tapBpm(taps)); } });
  spot.appendChild(T.card([big, name, dots, T.row([play, tap, T.button('−', { small: true, onclick: function () { setBpm(bpm - 1); } }), T.button('+', { small: true, onclick: function () { setBpm(bpm + 1); } })]),
    T.field('Tempo', slider), h('div', { 'class': 'tgrid2' }, [T.field('BPM', num), T.field('Volume', vol)]), T.field('Beats per bar', beats), T.field('Clicks per beat', subs), T.field('Sound', sound),
    h('label', { 'class': 'tcheck' }, [accent, ' Accent the first beat of each bar']),
    h('p', { 'class': 'tnote', text: 'Tip: tap “Tap tempo” along with a song 4 or more times to find its speed. Use headphones for a cleaner click when recording.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  setBpm(bpm); drawDots();
  T.tests.metronome = function () {
    var f = [];
    if (tapBpm([0, 500, 1000, 1500]) !== 120 || tapBpm([0, 400]) !== 150 || tapBpm([5]) !== 0) f.push('tap tempo');
    if (tempoName(120) !== 'Allegro' || tempoName(50) !== 'Largo' || tempoName(90) !== 'Andante' || tempoName(250) !== 'Prestissimo') f.push('names');
    var p = plan(120, 3, 2, 8);
    if (p.map(function (x) { return x.t; }).join(',') !== '0,0.25,0.5,0.75,1,1.25,1.5,1.75' || p.map(function (x) { return x.kind[0]; }).join('') !== 'asbsbsas') f.push('plan ' + p.map(function (x) { return x.kind[0]; }).join(''));
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
