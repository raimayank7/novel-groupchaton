/* Infinity by GroupChatOn — certificate. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Certificate maker: achievement, participation, appreciation, completion and winner certificates as print-ready PNG or PDF; many names at once as a ZIP. */
GCOTools.register('certificate', function (spot, T) {
  var h = T.h, W = 2000, H = 1414;
  var KINDS = { achievement: ['Certificate', 'of Achievement', 'This certificate is proudly presented to', 'for outstanding performance in'], participation: ['Certificate', 'of Participation', 'This is to certify that', 'took part in'],
    appreciation: ['Certificate', 'of Appreciation', 'This certificate is presented to', 'in grateful recognition of'], completion: ['Certificate', 'of Completion', 'This is to certify that', 'has successfully completed'],
    winner: ['Certificate', 'of Merit', 'This certificate is awarded to', 'for winning'], employee: ['Employee', 'of the Month', 'Presented with appreciation to', 'for exceptional work in'] };
  var THEMES = { gold: ['#8a6d1d', '#c9a227', '#fffbea'], blue: ['#1e3a8a', '#3b82f6', '#f5f8ff'], green: ['#14532d', '#16a34a', '#f3fbf5'], maroon: ['#7f1d1d', '#b91c1c', '#fff6f4'], black: ['#111827', '#6b7280', '#ffffff'] };
  var SAMPLE = { kind: 'achievement', theme: 'gold', name: 'Riya Sharma', what: 'the Inter-School Science Quiz 2026, securing First Position', org: 'Green Valley Public School', date: '14 November 2026', s1: 'Meena Kapoor', r1: 'Principal', s2: 'Arun Mehta', r2: 'Event Coordinator', names: '', logo: '' };
  var st = T.store.get('certificate', null) || JSON.parse(JSON.stringify(SAMPLE));
  function keep() { var c = JSON.parse(JSON.stringify(st)); if ((c.logo || '').length > 500000) c.logo = ''; T.store.set('certificate', c); }
  function font(ctx, size, w, fam) { ctx.font = (w || '') + ' ' + size + 'px ' + (fam || 'Georgia, "Times New Roman", serif'); }
  function fitSize(ctx, text, max, size, w, fam) { font(ctx, size, w, fam); while (ctx.measureText(text).width > max && size > 20) { size -= 2; font(ctx, size, w, fam); } return size; }
  function wrap(ctx, text, max) {
    var words = String(text).split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function loadLogo(d) { return new Promise(function (ok) { if (!d.logo) return ok(null); var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = d.logo; }); }
  function draw(cv, d, name) {
    var ctx = cv.getContext('2d'), th = THEMES[d.theme] || THEMES.gold, k = KINDS[d.kind] || KINDS.achievement;
    cv.width = W; cv.height = H;
    return loadLogo(d).then(function (img) {
      ctx.fillStyle = th[2]; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = th[0]; ctx.lineWidth = 28; ctx.strokeRect(40, 40, W - 80, H - 80);
      ctx.strokeStyle = th[1]; ctx.lineWidth = 6; ctx.strokeRect(84, 84, W - 168, H - 168);
      [[84, 84], [W - 84, 84], [84, H - 84], [W - 84, H - 84]].forEach(function (p) { ctx.fillStyle = th[0]; ctx.beginPath(); ctx.arc(p[0], p[1], 22, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = th[1]; ctx.beginPath(); ctx.arc(p[0], p[1], 11, 0, Math.PI * 2); ctx.fill(); });
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      var y = 210;
      if (img) { var r = Math.min(220 / img.width, 140 / img.height); ctx.drawImage(img, W / 2 - img.width * r / 2, 130, img.width * r, img.height * r); y = 330; }
      if (d.org) { ctx.fillStyle = '#333'; fitSize(ctx, d.org, 1500, 44, '600', 'system-ui, "Segoe UI", Arial, sans-serif'); ctx.fillText(d.org, W / 2, y); y += 120; } else y += 60;
      ctx.fillStyle = th[0]; fitSize(ctx, k[0].toUpperCase(), 1500, 118, '700'); ctx.fillText(k[0].toUpperCase().split('').join(String.fromCharCode(8202)), W / 2, y);
      ctx.fillStyle = th[1]; font(ctx, 52, 'italic'); ctx.fillText(k[1], W / 2, y + 74);
      ctx.fillStyle = '#444'; font(ctx, 38, '', 'system-ui, "Segoe UI", Arial, sans-serif'); ctx.fillText(k[2], W / 2, y + 170);
      var nm = name || d.name || 'Recipient Name';
      ctx.fillStyle = '#111'; fitSize(ctx, nm, 1450, 104, 'italic 700'); ctx.fillText(nm, W / 2, y + 300);
      ctx.strokeStyle = th[1]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - 520, y + 330); ctx.lineTo(W / 2 + 520, y + 330); ctx.stroke();
      ctx.fillStyle = '#333'; font(ctx, 40, '', 'system-ui, "Segoe UI", Arial, sans-serif');
      wrap(ctx, k[3] + ' ' + (d.what || ''), 1400).slice(0, 3).forEach(function (l, i) { ctx.fillText(l, W / 2, y + 410 + i * 56); });
      var by = H - 230;
      [[d.s1, d.r1, 520], [d.s2, d.r2, W - 520]].forEach(function (s) {
        if (!s[0] && !s[1]) return;
        ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s[2] - 230, by); ctx.lineTo(s[2] + 230, by); ctx.stroke();
        ctx.fillStyle = '#111'; fitSize(ctx, s[0] || '', 440, 36, '700', 'system-ui, "Segoe UI", Arial, sans-serif'); ctx.fillText(s[0] || '', s[2], by + 46);
        ctx.fillStyle = '#555'; fitSize(ctx, s[1] || '', 440, 30, '', 'system-ui, "Segoe UI", Arial, sans-serif'); ctx.fillText(s[1] || '', s[2], by + 86);
      });
      // seal
      ctx.fillStyle = th[1]; ctx.beginPath();
      for (var i = 0; i < 48; i++) { var a = i * Math.PI / 24, rr = i % 2 ? 92 : 104; ctx.lineTo(W / 2 + rr * Math.cos(a), by - 20 + rr * Math.sin(a)); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = th[0]; ctx.beginPath(); ctx.arc(W / 2, by - 20, 78, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; font(ctx, 40, '700', 'system-ui, "Segoe UI", Arial, sans-serif'); ctx.fillText('★', W / 2, by - 40);
      var dt = String(d.date || ''), cut = dt.length > 10 ? dt.lastIndexOf(' ') : -1, dl = cut > 0 ? [dt.slice(0, cut), dt.slice(cut + 1)] : [dt];   // long dates on two lines inside the seal
      dl.forEach(function (l, i) { fitSize(ctx, l, 128, 26, '700', 'system-ui, "Segoe UI", Arial, sans-serif'); ctx.fillText(l, W / 2, by + 6 + i * 30); });
      return cv;
    });
  }
  function names(text) { return String(text || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean); }
  var cv = h('canvas', { style: 'width:100%;height:auto;border-radius:8px;box-shadow:0 1px 6px rgba(0,0,0,.2)', 'aria-label': 'Certificate preview' });
  var form = h('div', { 'class': 'tgrid2' }), status = T.status();
  function update() { keep(); draw(cv, st); }
  function inp(key, label, ph, area) { var el = area ? h('textarea', { rows: '4', placeholder: ph || '' }) : h('input', { type: 'text', placeholder: ph || '' }); el.value = st[key] || ''; el.addEventListener('input', function () { st[key] = el.value; update(); }); var f = T.field(label, el); if (area) f.classList.add('tcalc-wide'); return f; }
  function sel(key, label, opts) { var s = T.select(opts, st[key]); s.addEventListener('change', function () { st[key] = s.value; update(); }); return T.field(label, s); }
  var logoIn = h('input', { type: 'file', accept: 'image/*', style: 'width:100%;max-width:100%;min-width:0' });
  logoIn.addEventListener('change', function () { var f = logoIn.files[0]; if (!f) return; if (f.size > 800000) { status.error('Please choose a logo under 800 KB.'); return; } T.read(f, 'dataURL').then(function (u) { st.logo = u; update(); }); });
  function build() {
    form.innerHTML = '';
    [sel('kind', 'Certificate type', [['achievement', 'Achievement'], ['participation', 'Participation'], ['appreciation', 'Appreciation'], ['completion', 'Completion (course / training)'], ['winner', 'Merit / winner'], ['employee', 'Employee of the month']]),
      sel('theme', 'Colours', [['gold', 'Gold'], ['blue', 'Royal blue'], ['green', 'Green'], ['maroon', 'Maroon'], ['black', 'Black and grey']]),
      inp('name', 'Name of the person'), inp('what', 'For (event, course or reason)'), inp('org', 'School / company / organisation'), inp('date', 'Date'),
      inp('s1', 'Signature 1: name'), inp('r1', 'Signature 1: title'), inp('s2', 'Signature 2: name (optional)'), inp('r2', 'Signature 2: title'),
      T.field('Logo (optional)', logoIn), inp('names', 'Many people? One name per line (optional)', 'Riya Sharma\nKaran Gill\nAyesha Khan', true)].forEach(function (f) { form.appendChild(f); });
    update();
  }
  function each(fn) { var list = names(st.names); if (!list.length) list = [st.name || 'Recipient Name']; return list.reduce(function (p, n, i) { return p.then(function (acc) { var c = h('canvas'); return draw(c, st, n).then(function () { return fn(c, n, i, list.length).then(function (x) { acc.push(x); return acc; }); }); }); }, Promise.resolve([])); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'certificate'; }
  spot.appendChild(T.card([form, T.row([T.button('Try a sample', { small: true, onclick: function () { st = JSON.parse(JSON.stringify(SAMPLE)); build(); } })]), cv, status.el,
    T.row([T.button('Download PNG', { primary: true, onclick: function () {
      var list = names(st.names);
      if (list.length > 1) {
        status.progress(0, 'Making ' + list.length + ' certificates…');
        each(function (c, n, i, all) { status.progress((i + 1) / all, 'Made ' + (i + 1) + ' of ' + all); return T.canvasBlob(c, 'image/png').then(function (b) { return { name: (i + 1) + '-' + slug(n) + '.png', blob: b }; }); })
          .then(function (items) { return T.zip(items); }).then(function (z) { T.download(z, 'certificates.zip'); status.ok(list.length + ' certificates saved in one ZIP.'); }, function (e) { status.error(e); });
      } else T.canvasBlob(cv, 'image/png').then(function (b) { T.download(b, slug(st.name) + '-certificate.png'); });
    } }),
      T.button('Print / Save as PDF', { onclick: function () {
        var w = window.open('', '_blank'); if (!w) return;
        each(function (c) { return Promise.resolve(c.toDataURL('image/png')); }).then(function (urls) {
          w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Certificates</title><style>@page{size:A4 landscape;margin:0}body{margin:0}img{width:100%;height:auto;display:block;page-break-after:always;break-after:page}img:last-child{page-break-after:auto}</style></head><body>' +
            urls.map(function (u) { return '<img src="' + u + '">'; }).join('') + '</body></html>');
          w.document.close(); setTimeout(function () { w.print(); }, 600);
        });
      } })]),
    h('p', { 'class': 'tnote', text: 'Made in your browser at 2000 × 1414 pixels (A4 landscape shape). Type several names to make one certificate for each person.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  build();

  T.tests['certificate'] = function () {
    var f = [], c = h('canvas'), ctx = c.getContext('2d');
    if (names('A\n\n  B \nC').join('|') !== 'A|B|C') f.push('names list');
    var s1 = fitSize(ctx, 'Short', 1450, 104, 'italic 700'), s2 = fitSize(ctx, 'A Very Long Name That Goes On And On Kumari Venkataraghavan Subramaniam', 1450, 104, 'italic 700');
    if (s1 !== 104 || !(s2 < 104)) f.push('fit ' + s1 + ' ' + s2);
    if (wrap(ctx, 'one two three four five six seven eight nine ten', 100).length < 2) f.push('wrap');
    return draw(c, SAMPLE).then(function () {
      if (c.width !== 2000 || c.height !== 1414) f.push('size');
      var p = ctx.getImageData(50, 700, 1, 1).data; if (Math.abs(p[0] - 0x8a) > 4 || Math.abs(p[1] - 0x6d) > 4) f.push('border colour ' + p[0] + ',' + p[1] + ',' + p[2]);
      return { ok: !f.length, n: 5, fails: f };
    });
  };
});
