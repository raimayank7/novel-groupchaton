/* Infinity by GroupChatOn — stamp-maker. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Rubber stamp and seal maker: round or rectangular stamps with curved text, centre text, stars, ink colour and a worn-ink look, saved as a transparent PNG. */
GCOTools.register('stamp-maker', function (spot, T) {
  var h = T.h, status = T.status();
  // angles for each letter of curved text, spread by letter width and centred on `mid` (radians)
  function arc(widths, radius, mid, gap) {
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + gap * (widths.length - 1), a = mid - total / radius / 2, out = [];
    widths.forEach(function (w) { out.push(a + w / 2 / radius); a += (w + gap) / radius; });
    return out;
  }
  var top = h('input', { type: 'text', value: 'GREEN LEAF TRADERS', 'aria-label': 'Top text' }), bottom = h('input', { type: 'text', value: 'LUDHIANA · PUNJAB', 'aria-label': 'Bottom text' });
  var mid1 = h('input', { type: 'text', value: 'APPROVED', 'aria-label': 'Centre text' }), mid2 = h('input', { type: 'text', value: '', placeholder: 'e.g. a date or signature line', 'aria-label': 'Second centre line' });
  var shape = 'round', color = T.select([['#1d4ed8', 'Blue'], ['#b91c1c', 'Red'], ['#6d28d9', 'Violet'], ['#047857', 'Green'], ['#111827', 'Black']], '#1d4ed8');
  var font = T.select([['Arial Black, Arial, sans-serif', 'Bold sans'], ['Georgia, Times New Roman, serif', 'Classic serif'], ['Courier New, monospace', 'Typewriter'], ['Impact, Arial Narrow, sans-serif', 'Condensed']], 'Arial Black, Arial, sans-serif');
  var worn = h('input', { type: 'checkbox', checked: true }), stars = h('input', { type: 'checkbox', checked: true }), tilt = h('input', { type: 'range', min: '-20', max: '20', value: '-6', 'aria-label': 'Tilt' });
  var cv = h('canvas', { width: '800', height: '800', 'aria-label': 'Stamp preview', style: 'width:min(340px,100%);aspect-ratio:1;display:block;margin:0 auto;background:repeating-conic-gradient(#e5e7eb 0 25%,#fff 0 50%) 0 0/20px 20px;border-radius:12px' });
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function curved(g, text, r, mid, inward, size) {
    g.font = 'bold ' + size + 'px ' + font.value;
    var chars = Array.from(text), ws = chars.map(function (c) { return g.measureText(c).width; }), gap = size * 0.12, an = arc(ws, r, inward ? 0 : 0, gap);
    var spread = an.length ? an[an.length - 1] - an[0] : 0;
    if (spread > Math.PI * 0.95 && size > 12) { var k = Math.PI * 0.95 / spread; size *= k; return curved(g, text, r, mid, inward, size); }
    chars.forEach(function (c, i) {
      g.save(); var a = inward ? mid - an[i] : mid + an[i];
      g.translate(400 + r * Math.cos(a), 400 + r * Math.sin(a)); g.rotate(inward ? a - Math.PI / 2 : a + Math.PI / 2);
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c, 0, 0); g.restore();
    });
  }
  function fit(g, text, max, size) { g.font = 'bold ' + size + 'px ' + font.value; while (g.measureText(text).width > max && size > 14) { size -= 2; g.font = 'bold ' + size + 'px ' + font.value; } return size; }
  function star(g, x, y, r) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } g.closePath(); g.fill(); }
  function draw() {
    var g = cv.getContext('2d'), c = color.value; g.clearRect(0, 0, 800, 800);
    g.save(); g.translate(400, 400); g.rotate(+tilt.value * Math.PI / 180); g.translate(-400, -400);
    g.strokeStyle = c; g.fillStyle = c;
    if (shape === 'round') {
      g.lineWidth = 16; g.beginPath(); g.arc(400, 400, 360, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 6; g.beginPath(); g.arc(400, 400, 330, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 5; g.beginPath(); g.arc(400, 400, 205, 0, Math.PI * 2); g.stroke();
      if (top.value.trim()) curved(g, top.value.trim().toUpperCase(), 268, -Math.PI / 2, false, 62);
      if (bottom.value.trim()) curved(g, bottom.value.trim().toUpperCase(), 268, Math.PI / 2, true, 52);
      if (stars.checked) { star(g, 400 - 268, 400, 20); star(g, 400 + 268, 400, 20); }
      fit(g, mid1.value.trim().toUpperCase(), 360, mid2.value.trim() ? 70 : 84); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(mid1.value.trim().toUpperCase(), 400, mid2.value.trim() ? 375 : 400);
      if (mid2.value.trim()) { fit(g, mid2.value.trim(), 340, 40); g.fillText(mid2.value.trim(), 400, 445); g.lineWidth = 4; g.beginPath(); g.moveTo(250, 412); g.lineTo(550, 412); g.stroke(); }
    } else {
      g.lineWidth = 16; g.strokeRect(50, 220, 700, 360); g.lineWidth = 5; g.strokeRect(78, 248, 644, 304);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (top.value.trim()) { fit(g, top.value.trim().toUpperCase(), 600, 54); g.fillText(top.value.trim().toUpperCase(), 400, 300); }
      fit(g, mid1.value.trim().toUpperCase(), 600, 96); g.fillText(mid1.value.trim().toUpperCase(), 400, 400);
      var lower = [mid2.value.trim(), bottom.value.trim().toUpperCase()].filter(Boolean).join('  ·  ');
      if (lower) { fit(g, lower, 600, 40); g.fillText(lower, 400, 495); }
      if (stars.checked) { star(g, 125, 400, 22); star(g, 675, 400, 22); }
    }
    g.restore();
    if (worn.checked) {   // knock out specks and streaks for a real rubber-stamp look
      seed = 7; g.save(); g.globalCompositeOperation = 'destination-out';
      for (var i = 0; i < 1600; i++) { g.globalAlpha = 0.25 + rand() * 0.75; g.beginPath(); g.arc(rand() * 800, rand() * 800, rand() * 3.2 + 0.4, 0, Math.PI * 2); g.fill(); }
      for (var j = 0; j < 14; j++) { g.globalAlpha = 0.15 + rand() * 0.2; g.lineWidth = rand() * 5 + 1; g.beginPath(); var y = rand() * 800; g.moveTo(0, y); g.lineTo(800, y + rand() * 120 - 60); g.stroke(); }
      g.restore();
    }
    var d = g.getImageData(0, 0, 800, 800).data, ink = 0; for (var k = 3; k < d.length; k += 400) if (d[k] > 0) ink++;
    return ink;
  }
  [top, bottom, mid1, mid2, color, font, worn, stars, tilt].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  function save() { T.canvasBlob(cv, 'image/png').then(function (b) { T.download(b, (mid1.value.trim() || 'stamp').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-stamp.png'); status.ok('Saved a transparent PNG: place it on documents in Word, Canva or a PDF editor.'); }); }
  spot.appendChild(T.card([T.seg([['round', 'Round seal'], ['rect', 'Rectangle']], 'round', function (v) { shape = v; draw(); }), cv,
    h('div', { 'class': 'tgrid2' }, [T.field('Top text (around the edge)', top), T.field('Bottom text', bottom), T.field('Centre text', mid1), T.field('Second centre line', mid2)]),
    h('div', { 'class': 'tgrid2' }, [T.field('Ink colour', color), T.field('Font', font), T.field('Tilt', tilt)]),
    T.row([h('label', { 'class': 'tcheck' }, [worn, ' Worn ink look']), h('label', { 'class': 'tcheck' }, [stars, ' Stars'])]),
    T.row([T.button('Download PNG', { primary: true, onclick: save }), T.button('Try a sample', { small: true, onclick: function () { top.value = 'SUNRISE BAKERY'; bottom.value = 'EST. 2012'; mid1.value = 'PAID'; mid2.value = new Date().toLocaleDateString(); draw(); } })]),
    status.el, h('p', { 'class': 'tnote', 'data-out': '', text: 'For your own name, shop or school only. Never copy the seal of a government office, court, bank or notary: that is forgery and a crime.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['stamp-maker'] = function () {
    var f = [], a = arc([10, 10, 10], 100, 0, 0);
    if (Math.abs(a[1]) > 1e-9 || Math.abs(a[0] + a[2]) > 1e-9 || Math.abs(a[2] - a[0] - 0.2) > 1e-9) f.push('arc ' + a.join(','));
    var b = arc([10, 30], 100, 1, 0);
    if (Math.abs((b[0] + b[1]) / 2 - 1) < 1e-9) f.push('arc ignores widths');
    if (draw() < 100) f.push('no ink drawn');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
