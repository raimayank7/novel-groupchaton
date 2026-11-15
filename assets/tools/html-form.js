/* Infinity by GroupChatOn — html-form. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* HTML form builder: add fields (text, email, phone, date, dropdown, checkboxes…), set labels and rules, preview, and copy accessible form HTML. */
GCOTools.register('html-form', function (spot, T) {
  var h = T.h;
  var TYPES = [['text', 'Short text'], ['email', 'Email'], ['tel', 'Phone'], ['number', 'Number'], ['date', 'Date'], ['textarea', 'Long text'], ['select', 'Drop-down'], ['radio', 'Pick one (radio)'], ['checkbox', 'Tick boxes'], ['file', 'File upload'], ['url', 'Website']];
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function build(fields, o) {
    var L = ['<form action="' + esc(o.action || '#') + '" method="' + o.method + '"' + (fields.some(function (f) { return f.type === 'file'; }) ? ' enctype="multipart/form-data"' : '') + (o.css ? ' class="gco-form"' : '') + '>'];
    fields.forEach(function (f) {
      var id = slug(f.label), req = f.req ? ' required' : '', star = f.req ? ' *' : '', ph = f.ph ? ' placeholder="' + esc(f.ph) + '"' : '', opts = (f.opts || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (f.type === 'radio' || f.type === 'checkbox') {
        L.push('  <fieldset>\n    <legend>' + esc(f.label) + star + '</legend>');
        (opts.length ? opts : ['Option 1', 'Option 2']).forEach(function (op, i) { L.push('    <label><input type="' + f.type + '" name="' + id + (f.type === 'checkbox' ? '[]' : '') + '" value="' + esc(op) + '"' + (f.req && f.type === 'radio' && !i ? ' required' : '') + '> ' + esc(op) + '</label>'); });
        L.push('  </fieldset>'); return;
      }
      L.push('  <label for="' + id + '">' + esc(f.label) + star + '</label>');
      if (f.type === 'textarea') L.push('  <textarea id="' + id + '" name="' + id + '" rows="4"' + ph + req + '></textarea>');
      else if (f.type === 'select') L.push('  <select id="' + id + '" name="' + id + '"' + req + '>\n    <option value="">Choose…</option>\n' + (opts.length ? opts : ['Option 1', 'Option 2']).map(function (op) { return '    <option>' + esc(op) + '</option>'; }).join('\n') + '\n  </select>');
      else L.push('  <input type="' + f.type + '" id="' + id + '" name="' + id + '"' + ph + req + ({ email: ' autocomplete="email"', tel: ' autocomplete="tel" inputmode="tel"' }[f.type] || '') + '>');
    });
    L.push('  <button type="submit">' + esc(o.button || 'Send') + '</button>\n</form>');
    if (o.css) L.unshift('<style>\n.gco-form { display: grid; gap: 8px; max-width: 420px; font-family: system-ui, sans-serif; }\n.gco-form input, .gco-form select, .gco-form textarea { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; }\n.gco-form label { font-weight: 600; }\n.gco-form fieldset { border: 1px solid #cbd5e1; border-radius: 8px; }\n.gco-form fieldset label { display: block; font-weight: 400; }\n.gco-form button { padding: 10px; border: 0; border-radius: 8px; background: #0ea5e9; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }\n</style>');
    return L.join('\n');
  }
  var fields = T.store.get('form-fields', null) || [{ label: 'Full name', type: 'text', req: true, ph: '' }, { label: 'Email', type: 'email', req: true, ph: 'you@example.com' }, { label: 'Message', type: 'textarea', req: false, ph: '' }];
  var rows = h('div', { style: 'display:grid;gap:8px' }), out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, 'aria-label': 'Form HTML' }), prev = h('div', { 'class': 'tpaper', style: 'padding:14px;border-radius:12px;background:#fff;color:#111' });
  var action = h('input', { type: 'url', placeholder: 'https://formspree.io/f/… (where answers go)' }), method = T.select([['post', 'POST'], ['get', 'GET']], 'post'), btn = h('input', { type: 'text', value: 'Send' }), css = h('input', { type: 'checkbox', checked: true });
  function save() { T.store.set('form-fields', fields); }
  function drawRows() {
    rows.innerHTML = '';
    fields.forEach(function (f, i) {
      var lab = h('input', { type: 'text', value: f.label, 'aria-label': 'Label' }), typ = T.select(TYPES, f.type), req = h('input', { type: 'checkbox', checked: f.req ? true : null }), opt = h('input', { type: 'text', value: f.opts || f.ph || '', placeholder: /select|radio|checkbox/.test(f.type) ? 'Options, comma separated' : 'Placeholder (optional)' });
      lab.addEventListener('input', function () { f.label = lab.value; draw(); }); typ.addEventListener('change', function () { f.type = typ.value; drawRows(); draw(); });
      req.addEventListener('change', function () { f.req = req.checked; draw(); }); opt.addEventListener('input', function () { if (/select|radio|checkbox/.test(f.type)) f.opts = opt.value; else f.ph = opt.value; draw(); });
      rows.appendChild(h('div', { style: 'display:grid;gap:6px;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--bg)' }, [h('div', { 'class': 'tgrid2' }, [T.field('Label', lab), T.field('Type', typ)]), opt,
        T.row([h('label', { 'class': 'tcheck' }, [req, ' Required']), T.button('↑', { small: true, onclick: function () { if (i) { fields.splice(i - 1, 0, fields.splice(i, 1)[0]); drawRows(); draw(); } } }),
          T.button('↓', { small: true, onclick: function () { if (i < fields.length - 1) { fields.splice(i + 1, 0, fields.splice(i, 1)[0]); drawRows(); draw(); } } }), T.button('Remove', { small: true, onclick: function () { fields.splice(i, 1); drawRows(); draw(); } })])]));
    });
  }
  function draw() {
    save();
    var html = build(fields, { action: action.value.trim(), method: method.value, button: btn.value, css: css.checked });
    out.value = html; prev.innerHTML = html;
    var fm = prev.querySelector('form'); if (fm) fm.addEventListener('submit', function (e) { e.preventDefault(); alert('Preview only: on your site the answers go to the address in “Send answers to”.'); });
  }
  [action, method, btn, css].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  var copy = T.button('Copy HTML', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  spot.appendChild(T.card([T.field('Fields', rows), T.row([T.button('+ Add field', { onclick: function () { fields.push({ label: 'New field', type: 'text', req: false }); drawRows(); draw(); } }),
    T.button('Contact form', { small: true, onclick: function () { fields = [{ label: 'Full name', type: 'text', req: true }, { label: 'Email', type: 'email', req: true, ph: 'you@example.com' }, { label: 'Phone', type: 'tel', req: false }, { label: 'Message', type: 'textarea', req: true }]; drawRows(); draw(); } }),
    T.button('Order form', { small: true, onclick: function () { fields = [{ label: 'Name', type: 'text', req: true }, { label: 'Phone', type: 'tel', req: true }, { label: 'Product', type: 'select', req: true, opts: 'Small, Medium, Large' }, { label: 'Quantity', type: 'number', req: true }, { label: 'Delivery', type: 'radio', req: true, opts: 'Home delivery, Pick up' }, { label: 'Address', type: 'textarea', req: false }]; drawRows(); draw(); } })]),
    h('div', { 'class': 'tgrid2' }, [T.field('Send answers to (form action)', action, 'A form service or your server; leave empty to test'), T.field('Method', method), T.field('Button text', btn)]), h('label', { 'class': 'tcheck' }, [css, ' Include simple styling']),
    T.field('Preview', prev), T.field('HTML', out), T.row([copy])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  drawRows(); draw();
  T.tests['html-form'] = function () {
    var f = [], o = build([{ label: 'Full name', type: 'text', req: true }, { label: 'Size', type: 'radio', req: true, opts: 'S, M' }, { label: 'CV', type: 'file' }], { action: '/send', method: 'post', button: 'Go', css: false });
    ['<form action="/send" method="post" enctype="multipart/form-data">', '<label for="full_name">Full name *</label>', '<input type="text" id="full_name" name="full_name" required>', '<legend>Size *</legend>',
      '<label><input type="radio" name="size" value="S" required> S</label>', '<button type="submit">Go</button>'].forEach(function (x) { if (o.indexOf(x) < 0) f.push('missing ' + x); });
    if (build([{ label: 'A "q"', type: 'text' }], { method: 'get', css: false }).indexOf('A &quot;q&quot;') < 0) f.push('escape');
    return Promise.resolve({ ok: !f.length, n: 2, fails: f });
  };
});
