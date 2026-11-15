/* Infinity by GroupChatOn — css-animation. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS animation maker: ready keyframe animations (fade, slide, bounce, pulse, shake, spin…) with timing controls, a live preview and copy-ready CSS. */
GCOTools.register('css-animation', function (spot, T) {
  var h = T.h;
  var K = {
    'fade-in': 'from { opacity: 0; }\n  to { opacity: 1; }',
    'slide-up': 'from { opacity: 0; transform: translateY(40px); }\n  to { opacity: 1; transform: translateY(0); }',
    'slide-in-left': 'from { opacity: 0; transform: translateX(-60px); }\n  to { opacity: 1; transform: translateX(0); }',
    'zoom-in': 'from { opacity: 0; transform: scale(.6); }\n  to { opacity: 1; transform: scale(1); }',
    bounce: '0%, 20%, 50%, 80%, 100% { transform: translateY(0); }\n  40% { transform: translateY(-30px); }\n  60% { transform: translateY(-15px); }',
    pulse: '0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.08); }',
    shake: '0%, 100% { transform: translateX(0); }\n  20%, 60% { transform: translateX(-10px); }\n  40%, 80% { transform: translateX(10px); }',
    spin: 'from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }',
    'flip': 'from { transform: perspective(400px) rotateY(0); }\n  to { transform: perspective(400px) rotateY(360deg); }',
    heartbeat: '0%, 28%, 70% { transform: scale(1); }\n  14%, 42% { transform: scale(1.25); }',
    wobble: '0%, 100% { transform: rotate(0); }\n  25% { transform: rotate(-6deg); }\n  75% { transform: rotate(6deg); }',
    glow: '0%, 100% { box-shadow: 0 0 0 rgba(56,189,248,0); }\n  50% { box-shadow: 0 0 24px rgba(56,189,248,.9); }'
  };
  function build(o) {
    var name = o.name || o.anim;
    return '@keyframes ' + name + ' {\n  ' + K[o.anim] + '\n}\n\n.animated {\n  animation: ' + name + ' ' + o.dur + 's ' + o.ease + ' ' + o.delay + 's ' + (o.inf ? 'infinite' : o.count) + ' ' + o.dir + ' ' + o.fill + ';\n}';
  }
  var anim = T.select(Object.keys(K).map(function (k) { return [k, k.replace(/-/g, ' ')]; }), 'bounce'), dur = h('input', { type: 'number', min: '0.1', step: '0.1', value: '1' }), delay = h('input', { type: 'number', min: '0', step: '0.1', value: '0' });
  var ease = T.select(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'cubic-bezier(.34,1.56,.64,1)', 'steps(4)'].map(function (x) { return [x, x]; }), 'ease');
  var count = h('input', { type: 'number', min: '1', value: '1' }), inf = h('input', { type: 'checkbox', checked: true }), dir = T.select(['normal', 'reverse', 'alternate', 'alternate-reverse'].map(function (x) { return [x, x]; }), 'normal');
  var fill = T.select(['none', 'forwards', 'backwards', 'both'].map(function (x) { return [x, x]; }), 'both'), out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, 'aria-label': 'CSS' });
  var ball = h('div', { style: 'width:110px;height:110px;margin:30px auto;border-radius:24px;background:linear-gradient(135deg,#38bdf8,#818cf8);display:grid;place-items:center;color:#fff;font:700 15px system-ui', text: 'Hello' });
  var styleEl = document.getElementById('gco-anim-preview') || document.head.appendChild(h('style', { id: 'gco-anim-preview' }));
  function o() { return { anim: anim.value, name: '', dur: +dur.value || 1, delay: +delay.value || 0, ease: ease.value, count: +count.value || 1, inf: inf.checked, dir: dir.value, fill: fill.value }; }
  function draw() {
    var op = o(), css = build(op);
    out.value = css;
    styleEl.textContent = '@keyframes gco-prev-' + op.anim + ' {\n' + K[op.anim] + '\n}';
    ball.style.animation = 'none'; void ball.offsetWidth;
    ball.style.animation = 'gco-prev-' + op.anim + ' ' + op.dur + 's ' + op.ease + ' ' + op.delay + 's ' + (op.inf ? 'infinite' : op.count) + ' ' + op.dir + ' ' + op.fill;
  }
  [anim, dur, delay, ease, count, inf, dir, fill].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  var copy = T.button('Copy CSS', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([h('div', { style: 'overflow:hidden;border-radius:14px;background:var(--bg)' }, [ball]), h('div', { 'class': 'tgrid2' }, [T.field('Animation', anim), T.field('Duration (s)', dur), T.field('Delay (s)', delay), T.field('Timing', ease),
    T.field('Times', count), T.field('Direction', dir), T.field('Fill mode', fill)]), h('label', { 'class': 'tcheck' }, [inf, ' Repeat forever']),
    T.row([T.button('Replay', { onclick: draw }), copy]), T.field('CSS (add class="animated" to your element)', out),
    h('p', { 'class': 'tstatus', text: 'Tip: wrap motion in @media (prefers-reduced-motion: no-preference) { … } for visitors who turn animations off.' })]));
  draw();
  T.tests['css-animation'] = function () {
    var f = [], c = build({ anim: 'fade-in', dur: 0.5, delay: 0, ease: 'ease-out', count: 1, inf: false, dir: 'normal', fill: 'both' });
    if (c !== '@keyframes fade-in {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n.animated {\n  animation: fade-in 0.5s ease-out 0s 1 normal both;\n}') f.push(c);
    if (build({ anim: 'spin', dur: 2, delay: 1, ease: 'linear', count: 3, inf: true, dir: 'reverse', fill: 'none' }).indexOf('spin 2s linear 1s infinite reverse none') < 0) f.push('infinite');
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
