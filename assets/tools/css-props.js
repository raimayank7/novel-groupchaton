/* Infinity by GroupChatOn — css-props. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* CSS property reference: the most used properties with plain explanations and a live demo where you click each value to see what it does. */
GCOTools.register('css-props', function (spot, T) {
  var h = T.h;
  // [property, group, what it does, values to try]
  var P = [
    ['color', 'Text', 'Text colour.', ['#e11d48', 'teal', 'rgb(37, 99, 235)', 'hsl(280 70% 50%)']],
    ['font-size', 'Text', 'Size of the text.', ['12px', '1rem', '1.5rem', 'clamp(1rem, 4vw, 2rem)']],
    ['font-weight', 'Text', 'How bold the text is (100–900).', ['300', 'normal', '600', 'bold']],
    ['font-style', 'Text', 'Italic or normal.', ['normal', 'italic']],
    ['font-family', 'Text', 'The typeface, with fallbacks.', ['system-ui, sans-serif', 'Georgia, serif', 'ui-monospace, monospace', 'cursive']],
    ['line-height', 'Text', 'Space between lines. 1.5 is comfortable for reading.', ['1', '1.5', '2']],
    ['letter-spacing', 'Text', 'Space between letters.', ['-0.5px', 'normal', '2px', '0.2em']],
    ['text-align', 'Text', 'Alignment of lines.', ['left', 'center', 'right', 'justify']],
    ['text-transform', 'Text', 'Changes letter case without changing the text.', ['none', 'uppercase', 'lowercase', 'capitalize']],
    ['text-decoration', 'Text', 'Underline, line-through and their style.', ['none', 'underline', 'line-through', 'underline wavy #e11d48']],
    ['text-shadow', 'Text', 'Shadow behind letters.', ['none', '1px 1px 2px #0006', '0 0 8px #38bdf8']],
    ['white-space', 'Text', 'Whether text wraps and keeps spaces.', ['normal', 'nowrap', 'pre-wrap']],
    ['text-overflow', 'Text', 'What to show when text is cut off (needs overflow hidden and nowrap).', ['clip', 'ellipsis']],
    ['background-color', 'Box', 'Fill colour behind the content.', ['#fde68a', '#bae6fd', 'transparent']],
    ['background', 'Box', 'Shorthand for colours, gradients and images.', ['linear-gradient(135deg, #38bdf8, #a78bfa)', 'radial-gradient(#fde68a, #fb923c)', '#e2e8f0']],
    ['padding', 'Box', 'Space inside the border, around the content.', ['0', '8px', '24px', '8px 32px']],
    ['margin', 'Box', 'Space outside the border. auto on left and right centres a block.', ['0', '16px', '0 auto', '24px 48px']],
    ['border', 'Box', 'Line around the box: width, style, colour.', ['none', '2px solid #0ea5e9', '3px dashed #e11d48', '4px double #334155']],
    ['border-radius', 'Box', 'Rounded corners.', ['0', '8px', '24px', '50%']],
    ['box-shadow', 'Box', 'Shadow around the box.', ['none', '0 4px 12px #0003', '0 10px 30px -5px #0005', 'inset 0 2px 6px #0004']],
    ['width', 'Box', 'Width of the box.', ['auto', '50%', '200px', 'fit-content']],
    ['height', 'Box', 'Height of the box.', ['auto', '60px', '120px']],
    ['max-width', 'Box', 'The widest a box may get; keeps lines readable.', ['none', '160px', '60ch']],
    ['box-sizing', 'Box', 'Whether width includes padding and border. border-box is easier to work with.', ['content-box', 'border-box']],
    ['opacity', 'Box', 'See-through-ness from 0 (invisible) to 1.', ['1', '0.6', '0.3']],
    ['overflow', 'Box', 'What happens when content is bigger than the box.', ['visible', 'hidden', 'auto', 'scroll']],
    ['display', 'Layout', 'How the box takes part in layout.', ['block', 'inline-block', 'flex', 'grid', 'none']],
    ['position', 'Layout', 'How the box is placed: normal flow, shifted, fixed to the screen or sticky.', ['static', 'relative', 'absolute', 'sticky']],
    ['top', 'Layout', 'Offset from the top for positioned boxes (also right, bottom, left).', ['0', '10px', '30px']],
    ['z-index', 'Layout', 'Which positioned box sits on top. Higher numbers come first.', ['0', '10', '-1']],
    ['float', 'Layout', 'Lets text wrap around a box (older layout method).', ['none', 'left', 'right']],
    ['flex-direction', 'Flex', 'Main direction of a flex container.', ['row', 'column', 'row-reverse']],
    ['justify-content', 'Flex', 'Spacing along the main direction (flex and grid).', ['flex-start', 'center', 'space-between', 'space-evenly']],
    ['align-items', 'Flex', 'Alignment across the main direction.', ['stretch', 'flex-start', 'center', 'flex-end']],
    ['gap', 'Flex', 'Space between items in flex and grid.', ['0', '8px', '24px']],
    ['flex-wrap', 'Flex', 'Whether items move to a new line.', ['nowrap', 'wrap']],
    ['grid-template-columns', 'Grid', 'Column sizes of a grid.', ['1fr 1fr', '1fr 2fr', 'repeat(3, 1fr)']],
    ['transform', 'Effects', 'Move, rotate, scale or skew without affecting layout.', ['none', 'rotate(8deg)', 'scale(1.2)', 'translateX(20px)', 'skewX(-12deg)']],
    ['transition', 'Effects', 'Animates changes smoothly (hover the demo).', ['none', 'all 0.3s ease', 'transform 0.5s ease-in-out']],
    ['filter', 'Effects', 'Photo-style effects.', ['none', 'blur(2px)', 'grayscale(1)', 'brightness(1.3)', 'drop-shadow(0 4px 4px #0006)']],
    ['cursor', 'Effects', 'Mouse pointer shape over the box.', ['default', 'pointer', 'not-allowed', 'grab', 'help']],
    ['outline', 'Effects', 'A line outside the border that takes no space. Keep focus outlines for keyboard users.', ['none', '2px solid #f59e0b', '3px dotted #0ea5e9']],
    ['aspect-ratio', 'Effects', 'Keeps a width-to-height shape.', ['auto', '1 / 1', '16 / 9']],
    ['object-fit', 'Effects', 'How an image fills its box (cover crops, contain fits).', ['fill', 'cover', 'contain']],
    ['visibility', 'Effects', 'Hides a box but keeps its space.', ['visible', 'hidden']],
    ['list-style-type', 'Text', 'Bullet or number style for lists.', ['disc', 'decimal', 'square', 'lower-roman', 'none']],
    ['writing-mode', 'Text', 'Horizontal or vertical text.', ['horizontal-tb', 'vertical-rl']],
    ['user-select', 'Effects', 'Whether text can be selected.', ['auto', 'none', 'all']],
    ['clip-path', 'Effects', 'Cuts the box into a shape.', ['none', 'circle(45%)', 'polygon(50% 0, 100% 100%, 0 100%)']],
    ['scroll-behavior', 'Effects', 'Smooth scrolling to anchors (set on html).', ['auto', 'smooth']]
  ];
  var groups = ['All'].concat(P.map(function (p) { return p[1]; }).filter(function (g, i, a) { return a.indexOf(g) === i; }));
  var q = h('input', { type: 'search', placeholder: 'Search: margin, shadow, center, bold…', 'aria-label': 'Search properties' }), grp = T.select(groups.map(function (g) { return [g, g]; }), 'All');
  var list = h('div', { style: 'display:grid;gap:10px', 'data-out': '' });
  function find(s, g) { s = s.trim().toLowerCase(); return P.filter(function (p) { return (g === 'All' || p[1] === g) && (!s || p[0].indexOf(s) >= 0 || p[2].toLowerCase().indexOf(s) >= 0); }); }
  function demoFor(p) {
    var list2 = /^(flex-direction|justify-content|align-items|gap|flex-wrap)$/.test(p[0]), grid = p[0] === 'grid-template-columns', img = p[0] === 'object-fit';
    var inner = list2 || grid ? ['A', 'B', 'C'].map(function (x) { return h('span', { text: x, style: 'padding:6px 12px;border-radius:8px;background:#38bdf8;color:#0f172a;font-weight:700' }); }) :
      img ? [h('div', { style: 'width:100%;height:100%;background:repeating-linear-gradient(45deg,#fbbf24 0 12px,#fb923c 12px 24px)' })] : ['The quick brown fox jumps over the lazy dog.'];
    var base = 'padding:12px;border-radius:10px;background:#f1f5f9;color:#0f172a;transition:all .25s;' + (list2 ? 'display:flex;min-height:90px;' : grid ? 'display:grid;gap:6px;' : '') + (p[0] === 'top' || p[0] === 'z-index' ? 'position:relative;' : '') + (p[0] === 'text-overflow' ? 'white-space:nowrap;overflow:hidden;width:200px;' : '') + (img ? 'width:160px;height:90px;overflow:hidden;' : '') + (p[0] === 'overflow' ? 'height:44px;width:180px;' : '');
    return h('div', { style: base }, inner);
  }
  function draw() {
    list.innerHTML = '';
    find(q.value, grp.value).forEach(function (p) {
      var demo = demoFor(p), code = h('code', { text: p[0] + ': ' + p[3][0] + ';' }), wrap = h('div', { style: 'padding:10px;border-radius:12px;background:#fff;overflow:auto' }, [demo]);
      var btns = T.row(p[3].map(function (v) { return T.button(v.length > 22 ? v.slice(0, 21) + '…' : v, { small: true, onclick: function () { demo.style.setProperty(p[0], v); if (p[0] === 'top') demo.style.position = 'relative'; code.textContent = p[0] + ': ' + v + ';'; } }); }));
      demo.style.setProperty(p[0], p[3][0]);
      list.appendChild(h('details', { style: 'border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--bg)' }, [h('summary', { style: 'cursor:pointer' }, [h('code', { text: p[0] }), ' ', h('small', { text: p[1] })]),
        h('p', { text: p[2], style: 'margin:8px 0' }), btns, wrap, T.row([code, T.button('Copy', { small: true, onclick: function (e) { T.copy(code.textContent, e.currentTarget); } })])]));
    });
  }
  q.addEventListener('input', draw); grp.addEventListener('change', draw);
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Search', q), T.field('Group', grp)]), h('p', { 'class': 'tstatus', text: 'Open a property and tap its values to see the change live.' }), list]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['css-props'] = function () {
    var f = [];
    if (P.length < 45) f.push('only ' + P.length);
    if (window.CSS && CSS.supports) P.forEach(function (p) { p[3].forEach(function (v) { if (!CSS.supports(p[0], v)) f.push(p[0] + ': ' + v); }); });
    if (find('shadow', 'All').length < 2 || find('', 'Flex').length !== 5) f.push('search');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
