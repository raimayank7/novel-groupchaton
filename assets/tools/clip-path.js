/* Infinity by GroupChatOn — clip-path. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS clip-path maker: triangles, polygons, stars, arrows, circles and speech bubbles; drag the points and copy the CSS. */
GCOTools.register('clip-path', function (spot, T) {
  var h = T.h;
  function r1(x) { return Math.round(x * 10) / 10; }
  function ngon(n, inner) {
    var p = [], k = inner ? 2 * n : n;
    for (var i = 0; i < k; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / k, R = inner && i % 2 ? 50 * inner : 50; p.push([r1(50 + R * Math.cos(a)), r1(50 + R * Math.sin(a))]); }
    return p;
  }
  var SHAPES = { triangle: [[50, 0], [100, 100], [0, 100]], rhombus: [[50, 0], [100, 50], [50, 100], [0, 50]], pentagon: ngon(5), hexagon: ngon(6), octagon: ngon(8), star: ngon(5, 0.38),
    'arrow right': [[0, 30], [60, 30], [60, 0], [100, 50], [60, 100], [60, 70], [0, 70]], chevron: [[0, 0], [75, 0], [100, 50], [75, 100], [0, 100], [25, 50]],
    message: [[0, 0], [100, 0], [100, 75], [40, 75], [20, 100], [20, 75], [0, 75]], cross: [[35, 0], [65, 0], [65, 35], [100, 35], [100, 65], [65, 65], [65, 100], [35, 100], [35, 65], [0, 65], [0, 35], [35, 35]],
    'slanted edge': [[0, 0], [100, 0], [100, 85], [0, 100]], circle: 'circle', ellipse: 'ellipse' };
  function css(s) { return s === 'circle' ? 'circle(50% at 50% 50%)' : s === 'ellipse' ? 'ellipse(50% 35% at 50% 50%)' : 'polygon(' + s.map(function (p) { return p[0] + '% ' + p[1] + '%'; }).join(', ') + ')'; }
  var pts = SHAPES.triangle.map(function (p) { return p.slice(); });
  var stage = h('div', { style: 'position:relative;width:min(300px,80vw);aspect-ratio:1;margin:12px auto;background:repeating-conic-gradient(var(--surface-2) 0 25%,transparent 0 50%) 0 0/24px 24px;border-radius:8px;touch-action:none' });
  var shape = h('div', { style: 'position:absolute;inset:0;background:linear-gradient(135deg,#f472b6,#fb923c)' }), out = h('textarea', { rows: '3', 'class': 'tout tmono', readonly: true, 'aria-label': 'CSS' });
  stage.appendChild(shape);
  var pick = T.select(Object.keys(SHAPES).map(function (k) { return [k, k.charAt(0).toUpperCase() + k.slice(1)]; }), 'triangle'), handles = [];
  function draw() {
    var v = Array.isArray(pts) ? css(pts) : css(pts);
    shape.style.clipPath = v; shape.style.webkitClipPath = v; out.value = '-webkit-clip-path: ' + v + ';\nclip-path: ' + v + ';';
    handles.forEach(function (x) { x.remove(); }); handles = [];
    if (!Array.isArray(pts)) return;
    pts.forEach(function (p, i) {
      var d = h('div', { 'aria-label': 'Point ' + (i + 1), style: 'position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#fff;border:3px solid #0ea5e9;cursor:grab;left:' + p[0] + '%;top:' + p[1] + '%' });
      d.addEventListener('pointerdown', function (e) {
        d.setPointerCapture(e.pointerId);
        function mv(ev) { var r = stage.getBoundingClientRect(); p[0] = Math.round(Math.max(0, Math.min(100, (ev.clientX - r.left) / r.width * 100))); p[1] = Math.round(Math.max(0, Math.min(100, (ev.clientY - r.top) / r.height * 100))); d.style.left = p[0] + '%'; d.style.top = p[1] + '%'; var v2 = css(pts); shape.style.clipPath = v2; out.value = '-webkit-clip-path: ' + v2 + ';\nclip-path: ' + v2 + ';'; }
        function up() { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); }
        d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up);
      });
      stage.appendChild(d); handles.push(d);
    });
  }
  pick.addEventListener('change', function () { var s = SHAPES[pick.value]; pts = Array.isArray(s) ? s.map(function (p) { return p.slice(); }) : s; draw(); });
  var copy = T.button('Copy CSS', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([T.field('Shape', pick), stage, h('p', { 'class': 'tstatus', text: 'Drag the white dots to change the shape.' }), T.field('CSS', out), T.row([copy])]));
  draw();
  T.tests['clip-path'] = function () {
    var f = [];
    if (css(SHAPES.triangle) !== 'polygon(50% 0%, 100% 100%, 0% 100%)') f.push('triangle');
    if (JSON.stringify(ngon(4)) !== '[[50,0],[100,50],[50,100],[0,50]]') f.push('square ngon ' + JSON.stringify(ngon(4)));
    if (ngon(5, 0.38).length !== 10 || ngon(5, 0.38)[1][0] !== 61.2) f.push('star ' + JSON.stringify(ngon(5, 0.38)[1]));
    if (css('circle') !== 'circle(50% at 50% 50%)') f.push('circle');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
