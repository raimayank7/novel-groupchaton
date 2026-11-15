/* Infinity by GroupChatOn — graph. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Graph plotter for data: paste x, y values (or two columns from Excel) to draw a scatter, line or bar chart with a best-fit trend line (linear, quadratic, exponential, logarithmic, power), its equation and R². */
GCOTools.register('graph', function (spot, T) {
  var h = T.h, status = T.status();
  function parse(text) {
    var pts = [], rows = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean), single = true;
    rows.forEach(function (l) {
      var p = l.split(/[\t;,]\s*|\s+/).filter(Boolean).map(function (v) { return +v.replace(/^\+/, ''); });
      if (p.length >= 2 && isFinite(p[0]) && isFinite(p[1])) { pts.push([p[0], p[1]]); single = false; }
      else if (p.length === 1 && isFinite(p[0])) pts.push([null, p[0]]);
    });
    if (single || pts.some(function (p) { return p[0] === null; })) pts = pts.map(function (p, i) { return [i + 1, p[1]]; });
    var head = rows.length && !/^[-+.\d]/.test(rows[0]) ? rows[0].split(/[\t;,]\s*/) : null;
    return { pts: pts, head: head };
  }
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var t = M[c]; M[c] = M[p]; M[p] = t;
      if (Math.abs(M[c][c]) < 1e-12) return null;
      for (r = 0; r < n; r++) if (r !== c) { var k = M[r][c] / M[c][c]; for (var j = c; j <= n; j++) M[r][j] -= k * M[c][j]; }
    }
    return M.map(function (r, i) { return r[n] / r[i]; });
  }
  function linfit(xs, ys) {
    var n = xs.length, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; }
    var d = n * sxx - sx * sx; if (!d) return null;
    var b = (n * sxy - sx * sy) / d; return [(sy - b * sx) / n, b];
  }
  function fit(pts, kind) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; }), f = null, eq = '', c;
    if (kind === 'linear' && (c = linfit(xs, ys))) { f = function (x) { return c[0] + c[1] * x; }; eq = 'y = ' + n4(c[1]) + 'x ' + sign(c[0]); }
    if (kind === 'quadratic' && pts.length >= 3) {
      var S = function (p, q) { return pts.reduce(function (s, v) { return s + Math.pow(v[0], p) * Math.pow(v[1], q); }, 0); };
      c = solve([[pts.length, S(1, 0), S(2, 0)], [S(1, 0), S(2, 0), S(3, 0)], [S(2, 0), S(3, 0), S(4, 0)]], [S(0, 1), S(1, 1), S(2, 1)]);
      if (c) { f = function (x) { return c[0] + c[1] * x + c[2] * x * x; }; eq = 'y = ' + n4(c[2]) + 'x² ' + sign(c[1]) + 'x ' + sign(c[0]); }
    }
    if (kind === 'exponential') {
      if (ys.some(function (y) { return y <= 0; })) return { error: 'An exponential trend needs every y above 0.' };
      if ((c = linfit(xs, ys.map(Math.log)))) { var a = Math.exp(c[0]); c = [a, c[1]]; f = function (x) { return c[0] * Math.exp(c[1] * x); }; eq = 'y = ' + n4(c[0]) + ' · e^(' + n4(c[1]) + 'x)'; }
    }
    if (kind === 'log') {
      if (xs.some(function (x) { return x <= 0; })) return { error: 'A logarithmic trend needs every x above 0.' };
      if ((c = linfit(xs.map(Math.log), ys))) { f = function (x) { return c[0] + c[1] * Math.log(x); }; eq = 'y = ' + n4(c[1]) + ' · ln(x) ' + sign(c[0]); }
    }
    if (kind === 'power') {
      if (xs.some(function (x) { return x <= 0; }) || ys.some(function (y) { return y <= 0; })) return { error: 'A power trend needs every x and y above 0.' };
      if ((c = linfit(xs.map(Math.log), ys.map(Math.log)))) { c = [Math.exp(c[0]), c[1]]; f = function (x) { return c[0] * Math.pow(x, c[1]); }; eq = 'y = ' + n4(c[0]) + ' · x^' + n4(c[1]); }
    }
    if (!f) return kind === 'none' ? {} : { error: 'Not enough different points for this trend.' };
    var mean = ys.reduce(function (s, y) { return s + y; }, 0) / ys.length, ssr = 0, sst = 0;
    pts.forEach(function (p) { ssr += Math.pow(p[1] - f(p[0]), 2); sst += Math.pow(p[1] - mean, 2); });
    return { f: f, eq: eq, c: c, r2: sst ? 1 - ssr / sst : 1 };
  }
  function n4(x) { var a = Math.abs(x); if (a < 1e-10) return '0'; return a >= 1e6 || a < 1e-3 ? x.toExponential(3) : String(+x.toPrecision(5)); }
  function sign(x) { return (x < 0 && Math.abs(x) >= 1e-10 ? '− ' : '+ ') + n4(Math.abs(x)); }
  function nice(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    var raw = (max - min) / count, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, step = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
    return { min: Math.floor(min / step) * step, max: Math.ceil(max / step) * step, step: step };
  }
  function label(v, step) { var d = Math.max(0, -Math.floor(Math.log10(step)) + (step / Math.pow(10, Math.floor(Math.log10(step))) % 1 ? 1 : 0)); return (+v.toFixed(Math.min(d, 8))).toLocaleString(undefined, { maximumFractionDigits: Math.min(d, 8) }); }
  var data = h('textarea', { rows: '8', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'Data', placeholder: 'x, y on each line, for example:\n1, 2.1\n2, 3.9\n3, 6.2\n\nor paste two columns from Excel' });
  data.value = T.store.get('graph-data', '');
  var kind = T.seg([['scatter', 'Points'], ['line', 'Line'], ['bar', 'Bars']], 'scatter', function () { draw(); });
  var trend = T.select([['none', 'No trend line'], ['linear', 'Linear (straight line)'], ['quadratic', 'Quadratic (curve)'], ['exponential', 'Exponential (growth)'], ['log', 'Logarithmic'], ['power', 'Power']], 'linear');
  var title = h('input', { type: 'text', placeholder: 'Chart title (optional)' }), xl = h('input', { type: 'text', placeholder: 'x axis name' }), yl = h('input', { type: 'text', placeholder: 'y axis name' });
  var canvas = h('canvas', { style: 'width:100%;height:auto;display:block;border-radius:12px;border:1px solid var(--line);background:#fff', role: 'img', 'aria-label': 'Chart' });
  var stats = h('div', { 'class': 'tkv', 'data-out': '' }), timer;
  function draw() {
    T.store.set('graph-data', data.value.slice(0, 50000));
    var P = parse(data.value), pts = P.pts.slice().sort(function (a, b) { return a[0] - b[0]; });
    stats.innerHTML = '';
    if (pts.length < 2) { canvas.hidden = true; status.info('Type or paste at least two points.'); return null; }
    canvas.hidden = false;
    var W = 900, H = 560, dpr = 2, x = canvas.getContext('2d');
    canvas.width = W * dpr; canvas.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var L = 74, R = 24, TOP = title.value ? 56 : 24, B = 64, isBar = kind.value() === 'bar';
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var fr = fit(pts, trend.value);
    var ymin = Math.min.apply(null, ys.concat(isBar ? [0] : [])), ymax = Math.max.apply(null, ys.concat(isBar ? [0] : []));
    var xpad = isBar ? 0.5 : 0, xa = nice(Math.min.apply(null, xs) - xpad, Math.max.apply(null, xs) + xpad, 8), ya = nice(ymin, ymax, 6);
    if (isBar) { xa.min = Math.min.apply(null, xs) - 0.6; xa.max = Math.max.apply(null, xs) + 0.6; }
    var X = function (v) { return L + (v - xa.min) / (xa.max - xa.min) * (W - L - R); }, Y = function (v) { return H - B - (v - ya.min) / (ya.max - ya.min) * (H - TOP - B); };
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.font = '13px system-ui, Segoe UI, sans-serif'; x.fillStyle = '#475569'; x.strokeStyle = '#e2e8f0'; x.lineWidth = 1;
    x.textAlign = 'right'; x.textBaseline = 'middle';
    for (var v = ya.min; v <= ya.max + ya.step / 2; v += ya.step) { x.beginPath(); x.moveTo(L, Y(v)); x.lineTo(W - R, Y(v)); x.stroke(); x.fillText(label(v, ya.step), L - 8, Y(v)); }
    x.textAlign = 'center'; x.textBaseline = 'top';
    if (isBar) xs.forEach(function (v) { x.fillText(label(v, 1), X(v), H - B + 8); });
    else for (v = xa.min; v <= xa.max + xa.step / 2; v += xa.step) { x.beginPath(); x.moveTo(X(v), TOP); x.lineTo(X(v), H - B); x.stroke(); x.fillText(label(v, xa.step), X(v), H - B + 8); }
    x.strokeStyle = '#94a3b8'; x.beginPath(); x.moveTo(L, TOP); x.lineTo(L, H - B); x.lineTo(W - R, H - B); x.stroke();
    if (ya.min < 0 && ya.max > 0) { x.strokeStyle = '#94a3b8'; x.beginPath(); x.moveTo(L, Y(0)); x.lineTo(W - R, Y(0)); x.stroke(); }
    x.fillStyle = '#0f172a'; x.font = '600 14px system-ui, Segoe UI, sans-serif';
    if (xl.value) x.fillText(xl.value, (L + W - R) / 2, H - 26);
    if (yl.value) { x.save(); x.translate(18, (TOP + H - B) / 2); x.rotate(-Math.PI / 2); x.textBaseline = 'middle'; x.fillText(yl.value, 0, 0); x.restore(); }
    if (title.value) { x.font = 'bold 20px system-ui, Segoe UI, sans-serif'; x.textBaseline = 'alphabetic'; x.fillText(title.value, W / 2, 34); }
    var col = '#2563eb';
    if (isBar) { var bw = Math.max(4, Math.min(60, (W - L - R) / pts.length * 0.6)); x.fillStyle = col; pts.forEach(function (p) { var y0 = Y(0), y1 = Y(p[1]); x.fillRect(X(p[0]) - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0)); }); }
    else {
      if (kind.value() === 'line') { x.strokeStyle = col; x.lineWidth = 2.5; x.beginPath(); pts.forEach(function (p, i) { if (i) x.lineTo(X(p[0]), Y(p[1])); else x.moveTo(X(p[0]), Y(p[1])); }); x.stroke(); }
      x.fillStyle = col; pts.forEach(function (p) { x.beginPath(); x.arc(X(p[0]), Y(p[1]), 4.5, 0, Math.PI * 2); x.fill(); });
    }
    if (fr.f) {
      x.save(); x.beginPath(); x.rect(L, TOP, W - L - R, H - TOP - B); x.clip();
      x.strokeStyle = '#dc2626'; x.lineWidth = 2; x.setLineDash([7, 5]); x.beginPath();
      var lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs), started = false;
      for (var i = 0; i <= 200; i++) { var xv = lo + (hi - lo) * i / 200, yv = fr.f(xv); if (!isFinite(yv)) { started = false; continue; } if (started) x.lineTo(X(xv), Y(yv)); else { x.moveTo(X(xv), Y(yv)); started = true; } }
      x.stroke(); x.restore();
      x.fillStyle = '#dc2626'; x.font = '600 14px system-ui, Segoe UI, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillText(fr.eq + '   R² = ' + fr.r2.toFixed(4), L + 10, TOP + 6);
    }
    var mx = xs.reduce(function (s, a) { return s + a; }, 0) / xs.length, my = ys.reduce(function (s, a) { return s + a; }, 0) / ys.length;
    var sxy = 0, sxx = 0, syy = 0; pts.forEach(function (p) { sxy += (p[0] - mx) * (p[1] - my); sxx += Math.pow(p[0] - mx, 2); syy += Math.pow(p[1] - my, 2); });
    var r = sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
    [['Points', String(pts.length)], ['Trend line', fr.eq || (fr.error ? '—' : 'None')], ['R² (fit quality, 1 = perfect)', fr.r2 != null ? fr.r2.toFixed(4) : '—'], ['Correlation r', r.toFixed(4)],
      ['Average x / y', n4(mx) + ' / ' + n4(my)], ['y range', n4(Math.min.apply(null, ys)) + ' to ' + n4(Math.max.apply(null, ys))]].forEach(function (s) {
      stats.appendChild(h('div', {}, [h('span', { text: s[0] }), h('code', { text: s[1] }), T.button('Copy', { small: true, onclick: function (e) { T.copy(s[1], e.currentTarget); } })]));
    });
    if (fr.error) status.error(fr.error); else status.ok('✓ ' + pts.length + ' points plotted.');
    return { pts: pts, fit: fr, r: r };
  }
  function soon() { clearTimeout(timer); timer = setTimeout(draw, 250); }
  [data, title, xl, yl].forEach(function (i) { i.addEventListener('input', soon); });
  trend.addEventListener('change', draw);
  spot.appendChild(T.card([T.field('Your data', data), h('div', { 'class': 'tgrid2' }, [T.field('Chart', kind), T.field('Trend line', trend), T.field('Title', title), T.field('x axis', xl), T.field('y axis', yl)]),
    T.row([T.button('Download PNG', { primary: true, onclick: function () { if (!canvas.hidden) T.canvasBlob(canvas).then(function (b) { T.download(b, (title.value || 'graph').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '.png'); }); } }),
      T.button('Try a sample', { small: true, onclick: function () { data.value = 'Hours studied, Test score\n1, 52\n2, 58\n3, 61\n4, 67\n5, 71\n6, 74\n7, 80\n8, 84'; title.value = 'Study time vs test score'; xl.value = 'Hours studied'; yl.value = 'Score'; trend.value = 'linear'; draw(); } })]),
    status.el, canvas, stats]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['graph'] = function () {
    var f = [], near = function (a, b, e) { return Math.abs(a - b) <= (e || 1e-6); };
    var p = parse('x\ty\n1\t2\n2\t4\n3\t6').pts;
    if (JSON.stringify(p) !== '[[1,2],[2,4],[3,6]]') f.push('parse tabs ' + JSON.stringify(p));
    if (JSON.stringify(parse('5\n7\n9').pts) !== '[[1,5],[2,7],[3,9]]') f.push('parse single column');
    if (JSON.stringify(parse('1;2\n2;3').pts) !== '[[1,2],[2,3]]') f.push('parse semicolons');
    var l = fit([[1, 2], [2, 4], [3, 6]], 'linear');
    if (!near(l.c[0], 0) || !near(l.c[1], 2) || !near(l.r2, 1) || l.eq !== 'y = 2x + 0') f.push('linear ' + l.eq);
    var q = fit([[-2, 5], [-1, 2], [0, 1], [1, 2], [2, 5], [3, 10]], 'quadratic');
    if (!near(q.c[2], 1) || !near(q.c[1], 0) || !near(q.c[0], 1)) f.push('quadratic ' + q.eq);
    var e = fit([0, 1, 2, 3].map(function (x) { return [x, 2 * Math.exp(0.5 * x)]; }), 'exponential');
    if (!near(e.c[0], 2) || !near(e.c[1], 0.5)) f.push('exponential ' + e.eq);
    var pw = fit([1, 2, 4, 8].map(function (x) { return [x, 3 * Math.pow(x, 1.5)]; }), 'power');
    if (!near(pw.c[0], 3) || !near(pw.c[1], 1.5)) f.push('power ' + pw.eq);
    if (!fit([[0, 1], [1, 2]], 'log').error || !fit([[1, -1], [2, 2]], 'exponential').error) f.push('domain errors');
    var nn = nice(0, 87, 6); if (nn.step !== 10 || nn.max !== 90 || nice(0, 170, 6).step !== 20) f.push('nice ' + JSON.stringify(nn));
    return Promise.resolve({ ok: !f.length, n: 9, fails: f });
  };
});
