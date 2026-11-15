/* Infinity by GroupChatOn — color-blind. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Colour vision check: our own dot plates with hidden numbers in red-green and blue-yellow colours, scored at the end. A screening aid, not a diagnosis. */
GCOTools.register('color-blind', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
  function rf() { return rnd(1e6) / 1e6; }
  var WARN = 'margin:0;padding:10px 12px;border-radius:12px;background:#fef3c7;color:#713f12;font-weight:600';
  // each plate: figure colours and background colours. "all" plates everyone should read; the others hide the number by hue only
  var PLATES = [
    { kind: 'all', fig: ['#e3672b', '#d9541d', '#ef7b3a'], bg: ['#6a7a8c', '#5d6d80', '#7c8a99'] },
    { kind: 'rg', fig: ['#cf7a5c', '#d9865f', '#c56f55', '#e09367'], bg: ['#9ca95a', '#aab063', '#8f9f55', '#b4b86a'] },
    { kind: 'rg', fig: ['#a9b25e', '#9aa955', '#b6bb69'], bg: ['#d48a66', '#c97b5c', '#de9670', '#cf8160'] },
    { kind: 'rg', fig: ['#d36f6f', '#c96262', '#de7b78'], bg: ['#a28f55', '#958447', '#ad9a5e', '#8f8146'] },
    { kind: 'rg', fig: ['#8aa069', '#7f965f', '#94aa71'], bg: ['#b9876b', '#ad7c61', '#c39276'] },
    { kind: 'by', fig: ['#7f8fd0', '#7384c8', '#8b9bd8'], bg: ['#8fa98f', '#83a083', '#9bb39b'] },
    { kind: 'by', fig: ['#c9b24e', '#bfa743', '#d3bc5a'], bg: ['#a7a9a0', '#9b9e95', '#b2b4ab'] },
    { kind: 'all', fig: ['#2f6fd1', '#245fbd', '#3b7ce0'], bg: ['#d8a24c', '#cc9440', '#e2ae58'] }
  ];
  function digitMask(text, size) {
    var c = document.createElement('canvas'); c.width = c.height = size; var g = c.getContext('2d');
    g.fillStyle = '#000'; g.font = 'bold ' + Math.round(size * (text.length > 1 ? 0.55 : 0.7)) + 'px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, size / 2, size / 2 + size * 0.03);
    var d = g.getImageData(0, 0, size, size).data, n = 0;
    for (var i = 3; i < d.length; i += 4) if (d[i] > 128) n++;
    var fn = function (x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= size || y >= size) return false; return d[(y * size + x) * 4 + 3] > 128; };
    fn.ink = n; return fn;
  }
  function plate(cv, p, text) {
    var S = cv.width, g = cv.getContext('2d'), R = S / 2 - 4, inside = digitMask(text, S), dots = [], tries = 0;
    g.clearRect(0, 0, S, S); g.fillStyle = '#f4efe6'; g.beginPath(); g.arc(S / 2, S / 2, R + 3, 0, Math.PI * 2); g.fill();
    while (dots.length < 1100 && tries < 26000) {
      tries++;
      var r = 3 + rf() * (tries < 6000 ? 9 : 5), a = rf() * Math.PI * 2, d = Math.sqrt(rf()) * (R - r), x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d, ok = true;
      for (var i = 0; i < dots.length; i++) { var q = dots[i], dx = q[0] - x, dy = q[1] - y; if (dx * dx + dy * dy < (q[2] + r + 1.2) * (q[2] + r + 1.2)) { ok = false; break; } }
      if (!ok) continue;
      dots.push([x, y, r]);
      var pal = inside(x, y) ? p.fig : p.bg; g.fillStyle = pal[rnd(pal.length)];
      g.globalAlpha = 0.82 + rf() * 0.18; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    }
    return dots.length;
  }
  function score(list) {
    var r = { all: [0, 0], rg: [0, 0], by: [0, 0] };
    list.forEach(function (x) { r[x.kind][1]++; if (x.ok) r[x.kind][0]++; });
    var msg;
    if (r.all[1] && r.all[0] < r.all[1]) msg = 'You missed a plate that almost everyone can read, so the screen, the light or the distance may be affecting the test. Turn brightness up, avoid night mode and blue-light filters, and try again.';
    else if (r.rg[0] <= r.rg[1] - 2) msg = 'You missed several red-green plates. This is a common sign of red-green colour vision deficiency (about 1 in 12 men and 1 in 200 women). Ask an optometrist for a proper test.';
    else if (r.by[0] <= r.by[1] - 1 && r.by[1]) msg = 'You missed a blue-yellow plate. Blue-yellow differences are rare and can have other causes, so it is worth mentioning to an optometrist.';
    else msg = 'You read the plates well. No sign of a colour vision problem on this screen.';
    return { r: r, msg: msg };
  }
  var cv = h('canvas', { width: '520', height: '520', 'aria-label': 'Colour dot plate with a hidden number', style: 'width:min(320px,86vw);aspect-ratio:1;display:block;margin:0 auto' });
  var ans = h('input', { type: 'text', inputmode: 'numeric', placeholder: 'Number you see', 'aria-label': 'Number you see', style: 'max-width:200px' });
  var prog = h('p', { 'class': 'tnote', style: 'text-align:center' }), out = h('div', { 'data-out': '', 'aria-live': 'polite' });
  var i = 0, nums = [], answers = [];
  function newTest() { i = 0; answers = []; nums = PLATES.map(function () { var n = 2 + rnd(8); return String(rnd(3) === 0 ? n * 10 + 1 + rnd(8) : n); }); out.innerHTML = ''; status.clear(); show(); }
  function show() { plate(cv, PLATES[i], nums[i]); prog.textContent = 'Plate ' + (i + 1) + ' of ' + PLATES.length + '. Type the number you see, or press “I see no number”.'; ans.value = ''; }
  function next(v) {
    answers.push({ kind: PLATES[i].kind, ok: v === nums[i], said: v || '–', was: nums[i] });
    i++;
    if (i < PLATES.length) return show();
    var s = score(answers);
    out.innerHTML = '';
    out.appendChild(h('div', { 'class': 'tkv' }, answers.map(function (a, k) { return h('div', {}, [h('b', { text: 'Plate ' + (k + 1) }), h('span', { text: 'You: ' + a.said + ' · Number: ' + a.was }), h('span', { text: a.ok ? '✓' : '✗' })]); })));
    out.appendChild(h('p', { style: 'font-weight:700', text: s.msg }));
    prog.textContent = 'Done. ' + answers.filter(function (a) { return a.ok; }).length + ' of ' + answers.length + ' correct.';
  }
  ans.addEventListener('keydown', function (e) { if (e.key === 'Enter') next(ans.value.trim()); });
  spot.appendChild(T.card([h('p', { style: WARN, text: '⚠️ Not a medical test. Screens and lighting change colours, so this can only hint at a colour vision difference. Only an eye professional can diagnose colour blindness.' }),
    cv, prog, T.row([ans, T.button('Next', { primary: true, onclick: function () { next(ans.value.trim()); } }), T.button('I see no number', { small: true, onclick: function () { next(''); } }), T.button('Start again', { small: true, onclick: newTest })]),
    status.el, out, h('p', { 'class': 'tnote', text: 'For best results: full screen brightness, night mode and blue-light filters off, daylight or a white room light, about 50–75 cm from the screen, and spend no more than 3 seconds per plate.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  newTest();
  T.tests['color-blind'] = function () {
    var f = [], m = digitMask('8', 200);
    if (m.ink < 1500) f.push('mask ink ' + m.ink);
    if (m(5, 5)) f.push('mask corner');
    var test = h('canvas', { width: '200', height: '200' }), n = plate(test, PLATES[0], '5');
    if (n < 150) f.push('few dots ' + n);
    var good = score([{ kind: 'all', ok: true }, { kind: 'rg', ok: true }, { kind: 'rg', ok: true }, { kind: 'by', ok: true }]), rg = score([{ kind: 'all', ok: true }, { kind: 'rg', ok: false }, { kind: 'rg', ok: false }, { kind: 'rg', ok: true }]);
    if (!/well/.test(good.msg) || !/red-green/.test(rg.msg)) f.push('scoring');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
