/* Infinity by GroupChatOn — worksheet. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Printable worksheets as a PDF (jsPDF): letter and number tracing, maths, missing numbers, times tables and handwriting lines, with answer keys. */
GCOTools.register('worksheet', function (spot, T) {
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
  function r(a, b) { return a + K.rnd(b - a + 1); }
  function problem(op, lv) {
    if (op === 'mix') op = K.pick(['+', '-', 'x', '/']);
    var top = [10, 20, 100, 1000][lv - 1], a, b;
    if (op === '+') { a = r(0, top - 1); b = r(0, top - a); return [a + ' + ' + b, a + b]; }
    if (op === '-') { a = r(1, top); b = r(0, a); return [a + ' - ' + b, a - b]; }
    if (op === 'x') { a = r(1, [5, 10, 12, 99][lv - 1]); b = r(1, [5, 10, 12, 12][lv - 1]); return [a + ' x ' + b, a * b]; }
    b = r(1, [5, 10, 12, 12][lv - 1]); a = r(1, [5, 10, 12, 99][lv - 1]); return [a * b + ' / ' + b, a];
  }
  function sequence(step) {
    var start = step * r(0, step === 1 ? 80 : 30), nums = [], blanks = K.shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3);
    for (var k = 0; k < 10; k++) nums.push(start + k * step);
    return { shown: nums.map(function (n, k) { return blanks.indexOf(k) >= 0 ? '___' : String(n); }), answers: blanks.sort(function (x, y) { return x - y; }).map(function (k) { return nums[k]; }) };
  }
  var kind = T.store.get('ws-kind', 'maths');
  var title = h('input', { type: 'text', value: 'My Worksheet', 'aria-label': 'Title' }), letters = h('input', { type: 'text', value: 'A B C D E F', 'aria-label': 'Letters to trace' });
  var op = T.select([['+', 'Addition'], ['-', 'Subtraction'], ['x', 'Multiplication'], ['/', 'Division'], ['mix', 'Mixed']], '+'), lv = T.select([[1, 'Up to 10'], [2, 'Up to 20'], [3, 'Up to 100'], [4, 'Up to 1000']], 1);
  var step = T.select([[1, 'Count by 1'], [2, 'Count by 2'], [5, 'Count by 5'], [10, 'Count by 10']], 1), tables = h('input', { type: 'text', value: '2, 3, 4', 'aria-label': 'Tables' });
  var paper = T.select([['a4', 'A4'], ['letter', 'Letter']], 'a4'), pagesN = T.select([[1, '1 page'], [2, '2 pages'], [3, '3 pages'], [5, '5 pages']], 1), key = h('input', { type: 'checkbox', checked: true });
  var F = { letters: T.field('Letters to trace (English A–Z, a–z)', letters), op: T.field('Sums', op), lv: T.field('Numbers', lv), step: T.field('Pattern', step), tables: T.field('Times tables (up to 20)', tables) };
  var SHOW = { trace: ['letters'], numbers: [], maths: ['op', 'lv'], missing: ['step'], tables: ['tables'], lines: [] };
  function fields() { Object.keys(F).forEach(function (k) { F[k].hidden = SHOW[kind].indexOf(k) < 0; }); }
  var status = T.status(), results = T.results(), frame = h('iframe', { 'class': 'tframe', title: 'Worksheet preview', hidden: true, style: 'height:480px' }), lastUrl = '';
  // builds the PDF; returns { pdf, pages }
  function build(lib) {
    var pdf = new lib.jsPDF({ unit: 'mm', format: paper.value }), W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight(), M = 16, answers = [];
    var name = title.value.trim().replace(/[^\x20-\x7E]/g, '') || 'Worksheet', n = +pagesN.value;
    function header(sub) {
      pdf.setTextColor(20); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.text(name, M, M + 6, { renderingMode: 'fill' });
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.text('Name: ______________________   Date: ____________', W - M, M + 6, { align: 'right' });
      if (sub) { pdf.setFontSize(11); pdf.setTextColor(90); pdf.text(sub, M, M + 14); }
      pdf.setFontSize(8); pdf.setTextColor(150); pdf.text('Free printable worksheet · infinity.groupchaton.com', W / 2, H - 8, { align: 'center' }); pdf.setTextColor(20);
      return M + 24;
    }
    function guide(y, hgt) { pdf.setDrawColor(180); pdf.setLineWidth(0.3); pdf.setLineDashPattern([], 0); pdf.line(M, y, W - M, y); pdf.line(M, y - hgt, W - M, y - hgt); pdf.setLineDashPattern([1.5, 1.5], 0); pdf.line(M, y - hgt / 2, W - M, y - hgt / 2); pdf.setLineDashPattern([], 0); }
    function traceRows(items, y0) {
      var row = 30, y = y0, size = 64;
      items.forEach(function (ch) {
        if (y + row > H - 14) { pdf.addPage(); y = header('Trace the dotted shapes, then write your own.'); }
        var base = y + 22; guide(base, 22);
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(size); pdf.setTextColor(60); pdf.text(ch, M + 2, base, { renderingMode: 'fill' });
        var cw = pdf.getTextWidth(ch) + 7, x = M + 2 + cw;
        pdf.setDrawColor(130); pdf.setLineWidth(0.35); pdf.setLineDashPattern([1.2, 1.2], 0);
        while (x + cw < W - M) { pdf.text(ch, x, base, { renderingMode: 'stroke' }); x += cw; }
        pdf.setLineDashPattern([], 0); pdf.setTextColor(20); y += row;
      });
    }
    for (var pg = 0; pg < n; pg++) {
      if (pg) pdf.addPage();
      if (kind === 'trace') {
        var ls = letters.value.split(/[\s,]+/).filter(Boolean).map(function (x) { return x.slice(0, 2); });
        if (!ls.length || ls.some(function (x) { return /[^\x20-\x7E]/.test(x); })) throw new Error('Type English letters (A–Z or a–z) separated by spaces. For Hindi or Punjabi tracing use the Letter Tracing tool.');
        traceRows(ls, header('Trace the dotted letters, then write your own.'));
      }
      if (kind === 'numbers') traceRows(pg % 2 ? ['11', '12', '13', '14', '15', '16', '17', '18', '19', '20'] : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], header('Trace the dotted numbers, then write your own.'));
      if (kind === 'maths') {
        var y = header('Work out each answer.'), list = [];
        for (var k = 0; k < 30; k++) list.push(problem(op.value, +lv.value));
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(16);
        list.forEach(function (p, k) { var col = k % 2, rowY = y + Math.floor(k / 2) * 15.5; pdf.text((k + 1) + ')  ' + p[0] + ' = ________', M + col * (W - 2 * M) / 2, rowY); });
        answers.push(list.map(function (p, k) { return (k + 1) + ') ' + p[1]; }));
      }
      if (kind === 'missing') {
        var y2 = header('Fill in the missing numbers.'), keyRows = [];
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(15);
        for (var j = 0; j < 12; j++) { var s = sequence(+step.value); pdf.text((j + 1) + ')  ' + s.shown.join(',  '), M, y2 + j * 19); keyRows.push((j + 1) + ') ' + s.answers.join(', ')); }
        answers.push(keyRows);
      }
      if (kind === 'tables') {
        var ts = tables.value.split(/[^0-9]+/).map(Number).filter(function (x) { return x >= 1 && x <= 20; }).slice(0, 4);
        if (!ts.length) throw new Error('Type the times tables to practise, for example 2, 3, 4.');
        var y3 = header('Fill in the times tables.'), cw2 = (W - 2 * M) / ts.length, keyT = [];
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(14);
        ts.forEach(function (t, c) {
          var order = pg ? K.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
          order.forEach(function (m, i) { pdf.text(t + ' x ' + m + ' = ______', M + c * cw2, y3 + i * 17); });
          keyT.push('Table of ' + t + ': ' + order.map(function (m) { return t * m; }).join(', '));
        });
        answers.push(keyT);
      }
      if (kind === 'lines') { var y4 = header('Handwriting practice'); for (var b = y4 + 14; b < H - 16; b += 24) guide(b, 14); }
    }
    if (key.checked && answers.length) {
      pdf.addPage(); var yk = M + 6; pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16); pdf.text('Answer key: ' + name, M, yk); yk += 10;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
      answers.forEach(function (a, i) {
        if (answers.length > 1) { pdf.setFont('helvetica', 'bold'); pdf.text('Page ' + (i + 1), M, yk); pdf.setFont('helvetica', 'normal'); yk += 6; }
        pdf.splitTextToSize(a.join('    '), W - 2 * M).forEach(function (l) { if (yk > H - 14) { pdf.addPage(); yk = M + 6; } pdf.text(l, M, yk); yk += 5.5; }); yk += 4;
      });
    }
    return { pdf: pdf, pages: pdf.getNumberOfPages() };
  }
  var go = T.button('Make worksheet (PDF)', { primary: true, onclick: make });
  function make() {
    go.disabled = true; status.info('Making your worksheet…');
    return T.lib('jspdf').then(function (lib) {
      var out = build(lib), blob = out.pdf.output('blob');
      results.set([{ name: (title.value.trim() || 'worksheet').replace(/[\\/:*?"<>|]+/g, '').slice(0, 50) + '.pdf', blob: blob, note: out.pages + (out.pages === 1 ? ' page' : ' pages'), icon: '📄' }]);
      if (lastUrl) URL.revokeObjectURL(lastUrl); lastUrl = URL.createObjectURL(blob); frame.src = lastUrl; frame.hidden = false;
      status.ok('Ready! Download it or print it from the preview.'); return blob;
    }).catch(function (e) { status.error(e); }).then(function (b) { go.disabled = false; return b; });
  }
  spot.appendChild(T.card([
    T.seg([['trace', 'ABC tracing'], ['numbers', '123 tracing'], ['maths', 'Sums'], ['missing', 'Missing numbers'], ['tables', 'Times tables'], ['lines', 'Writing lines']], kind, function (v) { kind = v; T.store.set('ws-kind', v); fields(); }),
    T.field('Title at the top', title), F.letters, h('div', { 'class': 'tgrid2' }, [F.op, F.lv, F.step, F.tables]),
    h('div', { 'class': 'tgrid2' }, [T.field('Paper', paper), T.field('How many', pagesN)]), h('label', { 'class': 'tcheck' }, [key, ' Add an answer key page']),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { kind = 'maths'; make(); } })]), status.el, results.el, frame,
    h('p', { 'class': 'ksub', text: 'Every “Make” gives new random questions. If the preview is blank on your phone, use Download and open the PDF.' })]));
  K.fit(spot);
  fields();
  T.tests['worksheet'] = function () {
    var f = [];
    ['+', '-', 'x', '/'].forEach(function (o) { [1, 2, 3, 4].forEach(function (l) { for (var k = 0; k < 200; k++) {
      var p = problem(o, l), m = p[0].split(' '), a = +m[0], b = +m[2], v = o === '+' ? a + b : o === '-' ? a - b : o === 'x' ? a * b : a / b;
      if (v !== p[1] || v < 0 || v % 1) { f.push(o + l + ' ' + p.join(' = ')); return; }
    } }); });
    var s = sequence(5); if (s.shown.length !== 10 || s.shown.filter(function (x) { return x === '___'; }).length !== 3 || s.answers.some(function (x) { return x % 5; })) f.push('sequence');
    var keep = kind; kind = 'trace';
    return T.lib('jspdf').then(function (lib) {
      ['trace', 'numbers', 'maths', 'missing', 'tables', 'lines'].forEach(function (k) { kind = k; try { var out = build(lib), head = out.pdf.output().slice(0, 5); if (head !== '%PDF-') f.push(k + ' not a PDF'); } catch (e) { f.push(k + ' ' + e.message); } });
      kind = keep; return { ok: !f.length, n: 3208, fails: f };
    }, function (e) { kind = keep; return { ok: false, n: 1, fails: ['jsPDF did not load: ' + e.message] }; });
  };
});
