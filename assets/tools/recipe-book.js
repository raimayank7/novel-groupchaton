/* Infinity by GroupChatOn — recipe-book. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* My recipe book: recipes with photo, ingredients and steps; search by ingredient; scale servings; print. */
GCOTools.register('recipe-book', function (spot, T) {
  var h = T.h, V = T.vault('recipes', { list: [] }), db = V.data();
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function save() { return V.save(db); }
  var CATS = ['Breakfast', 'Main course', 'Dal & curry', 'Rice & roti', 'Snacks', 'Sweets', 'Drinks', 'Salad', 'Baking', 'Other'];
  var FR = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };
  function fmt(n) {
    var w = Math.floor(n + 1e-9), f = n - w, best = '';
    [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']].forEach(function (c) { if (best === '' && Math.abs(f - c[0]) < 0.03) { best = c[1] || ' '; if (c[0] === 1) w++; } });
    if (best) return (w ? String(w) : best.trim() ? '' : '0') + best.trim();
    return String(Math.round(n * 100) / 100);
  }
  function qty(s) {   // "1 1/2", "1/2", "1.5", "½", "1½" → number
    var m;
    if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
    if ((m = s.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
    if ((m = s.match(/^(\d*)\s*([½¼¾⅓⅔⅛])$/))) return (+m[1] || 0) + FR[m[2]];
    return parseFloat(s);
  }
  function scaleLine(line, k) {
    if (k === 1) return line;
    var m = line.match(/^(\s*[-•*]?\s*)(\d+\s+\d+\/\d+|\d+\/\d+|\d*\s*[½¼¾⅓⅔⅛]|\d+(?:\.\d+)?)(\s*(?:-|–|to)\s*(\d+(?:\.\d+)?))?/);
    if (!m) return line;
    return m[1] + fmt(qty(m[2].trim()) * k) + (m[4] ? m[3].slice(0, m[3].length - m[4].length) + fmt(+m[4] * k) : '') + line.slice(m[0].length);
  }
  var view = 'list', sel = null, serves = 0, body = h('div', { 'class': 'tool-app-opts' }), photoUrl = null;
  function rec(id) { return db.list.filter(function (r) { return r.id === id; })[0]; }
  function shrink(file) {   // photos are resized to at most 1000 px so hundreds fit on the device
    return new Promise(function (ok) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () { var s = Math.min(1, 1000 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); T.canvasBlob(c, 'image/jpeg', 0.82).then(ok); };
      img.onerror = function () { URL.revokeObjectURL(u); ok(null); }; img.src = u;
    });
  }
  function draw() {
    db = V.data(); body.innerHTML = ''; if (photoUrl) { URL.revokeObjectURL(photoUrl); photoUrl = null; }
    if (view === 'edit') return drawEdit(rec(sel));
    var r = rec(sel); if (view === 'view' && r) return drawView(r);
    var q = h('input', { type: 'search', placeholder: 'Search recipe or ingredient (e.g. paneer)…' }), cat = T.select([['', 'All categories']].concat(CATS), ''), list = h('div', { 'class': 'tlist' });
    function show() {
      list.innerHTML = ''; var s = q.value.trim().toLowerCase();
      db.list.filter(function (x) { return (!cat.value || x.cat === cat.value) && (!s || (x.title + ' ' + x.ing + ' ' + (x.tags || '')).toLowerCase().indexOf(s) >= 0); }).sort(function (a, b) { return (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || a.title.localeCompare(b.title); }).forEach(function (x) {
        list.appendChild(h('div', { 'class': 'titem', style: 'cursor:pointer', onclick: function () { sel = x.id; serves = x.serves || 0; view = 'view'; draw(); } }, [h('span', { 'class': 'titem-ic', text: x.fav ? '⭐' : '🍲' }),
          h('span', { 'class': 'titem-main' }, [h('b', { text: x.title }), h('small', { text: [x.cat, x.time ? x.time + ' min' : '', x.serves ? 'serves ' + x.serves : ''].filter(Boolean).join(' · ') })])]));
      });
      if (!list.children.length) list.appendChild(h('p', { 'class': 'tnote', text: db.list.length ? 'No recipe matches.' : 'Add your first recipe: family favourites, mum’s secret masala, the cake that never fails.' }));
    }
    q.addEventListener('input', show); cat.addEventListener('change', show);
    body.appendChild(T.row([T.button('➕ Add recipe', { primary: true, onclick: function () { sel = null; view = 'edit'; draw(); } })]));
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Search', q), T.field('Category', cat)])); body.appendChild(list); show();
  }
  function drawView(r) {
    var k = r.serves && serves ? serves / r.serves : 1;
    var sv = h('input', { type: 'number', min: '1', step: '1', value: serves || '', style: 'max-width:90px', 'aria-label': 'Servings' });
    sv.addEventListener('change', function () { serves = Math.max(1, parseInt(sv.value, 10) || r.serves || 1); draw(); });
    var paper = h('div', { 'class': 'tpaper', 'data-out': '' }, [h('h2', { text: r.title, style: 'margin:0 0 4px' }), h('p', { style: 'color:#666;margin:0 0 10px', text: [r.cat, r.time ? r.time + ' minutes' : '', serves ? 'serves ' + serves : ''].filter(Boolean).join(' · ') })]);
    if (r.photo instanceof Blob) { photoUrl = URL.createObjectURL(r.photo); paper.appendChild(h('img', { src: photoUrl, alt: r.title, style: 'width:100%;max-height:340px;object-fit:cover;border-radius:12px;margin-bottom:10px' })); }
    paper.appendChild(h('h3', { text: 'Ingredients' }));
    paper.appendChild(h('ul', {}, r.ing.split('\n').filter(function (l) { return l.trim(); }).map(function (l) { return h('li', { text: scaleLine(l.replace(/^\s*[-•*]\s*/, ''), k) }); })));
    paper.appendChild(h('h3', { text: 'Method' }));
    paper.appendChild(h('ol', {}, r.steps.split('\n').filter(function (l) { return l.trim(); }).map(function (l) { return h('li', { text: l.replace(/^\s*\d+[.)]\s*/, '') }); })));
    if (r.tags) paper.appendChild(h('p', { style: 'color:#666', text: 'Notes: ' + r.tags }));
    body.appendChild(T.row([T.button('‹ All recipes', { small: true, onclick: function () { view = 'list'; draw(); } }), r.serves ? h('span', { 'class': 'trow' }, [h('span', { text: 'Servings ' }), sv]) : null,
      T.button(r.fav ? '★ Favourite' : '☆ Favourite', { small: true, onclick: function () { r.fav = !r.fav; save(); draw(); } })]));
    body.appendChild(paper);
    var text = r.title + '\n\nIngredients' + (serves ? ' (serves ' + serves + ')' : '') + ':\n' + r.ing.split('\n').filter(function (l) { return l.trim(); }).map(function (l) { return '• ' + scaleLine(l.replace(/^\s*[-•*]\s*/, ''), k); }).join('\n') + '\n\nMethod:\n' + r.steps.split('\n').filter(function (l) { return l.trim(); }).map(function (l, i) { return (i + 1) + '. ' + l.replace(/^\s*\d+[.)]\s*/, ''); }).join('\n');
    body.appendChild(T.row([T.button('Print / Save as PDF', { primary: true, onclick: function () {
      var w = window.open('', '_blank'); if (!w) return;
      var go = function (src) { w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + r.title.replace(/</g, '') + '</title><style>body{font:15px/1.55 system-ui,sans-serif;margin:1.5cm;color:#111}img{max-width:100%;max-height:8cm;border-radius:10px}</style></head><body>' + paper.innerHTML.replace(/src="blob:[^"]*"/, src ? 'src="' + src + '"' : '') + '</body></html>'); w.document.close(); setTimeout(function () { w.print(); }, 400); };
      if (r.photo instanceof Blob) T.read(r.photo, 'dataURL').then(go); else go('');
    } }), h('a', { 'class': 'tbtn tbtn-sm', target: '_blank', rel: 'noopener', href: 'https://wa.me/?text=' + encodeURIComponent(text), text: 'Share on WhatsApp' }),
      T.button('Copy', { small: true, onclick: function (e) { T.copy(text, e.currentTarget); } }), T.button('Edit', { small: true, onclick: function () { view = 'edit'; draw(); } }),
      T.button('Delete', { small: true, onclick: function () { if (confirm('Delete ' + r.title + '?')) { db.list = db.list.filter(function (x) { return x !== r; }); save(); view = 'list'; draw(); } } })]));
  }
  function drawEdit(r) {
    r = r || {};
    var f = { title: h('input', { type: 'text', value: r.title || '', placeholder: 'e.g. Rajma chawal' }), cat: T.select(CATS, r.cat || 'Main course'), serves: h('input', { type: 'number', min: '1', step: '1', value: r.serves || 4 }),
      time: h('input', { type: 'number', min: '0', step: '1', value: r.time || '', placeholder: 'minutes' }), ing: h('textarea', { rows: '7', placeholder: '1 cup rajma, soaked overnight\n2 onions, chopped\n1/2 tsp turmeric\nSalt to taste' }),
      steps: h('textarea', { rows: '7', placeholder: 'Pressure cook the rajma for 6 whistles.\nFry onions till golden…' }), tags: h('input', { type: 'text', value: r.tags || '', placeholder: 'Tips, source, tags (optional)' }), photo: h('input', { type: 'file', accept: 'image/*' }) };
    f.ing.value = r.ing || ''; f.steps.value = r.steps || '';
    var keepPhoto = r.photo || null;
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Recipe name', f.title), T.field('Category', f.cat), T.field('Serves', f.serves), T.field('Time', f.time)]));
    body.appendChild(T.field('Ingredients (one per line; start with the amount so servings can scale)', f.ing));
    body.appendChild(T.field('Method (one step per line)', f.steps));
    body.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('Notes', f.tags), T.field(keepPhoto ? 'Change photo' : 'Photo (optional)', f.photo)]));
    body.appendChild(T.row([T.button('Save recipe', { primary: true, onclick: function () {
      if (!f.title.value.trim() || !f.ing.value.trim()) { (f.title.value.trim() ? f.ing : f.title).focus(); return; }
      var file = f.photo.files[0];
      (file ? shrink(file) : Promise.resolve(keepPhoto)).then(function (ph) {
        var x = r.id ? r : { id: uid() };
        x.title = f.title.value.trim(); x.cat = f.cat.value; x.serves = parseInt(f.serves.value, 10) || 0; x.time = parseInt(f.time.value, 10) || 0; x.ing = f.ing.value; x.steps = f.steps.value; x.tags = f.tags.value.trim(); x.photo = ph || null;
        if (!r.id) db.list.push(x); save(); sel = x.id; serves = x.serves; view = 'view'; draw();
      });
    } }), T.button('Cancel', { small: true, onclick: function () { view = r.id ? 'view' : 'list'; draw(); } }), keepPhoto ? T.button('Remove photo', { small: true, onclick: function () { keepPhoto = null; r.photo = null; save(); } }) : null]));
  }
  spot.appendChild(T.card([V.bar(draw), body]));
  V.ready.then(draw);

  T.tests['recipe-book'] = function () { return V.ready.then(test); };
  function test() {
    var keep = V.data(), fails = [];
    [['2 cups rice', 2, '4 cups rice'], ['1/2 tsp salt', 2, '1 tsp salt'], ['1 1/2 cup milk', 2, '3 cup milk'], ['½ cup curd', 3, '1½ cup curd'], ['Salt to taste', 2, 'Salt to taste'], ['- 3 onions', 0.5, '- 1½ onions'], ['2-3 green chillies', 2, '4-6 green chillies'], ['250 g paneer', 1.5, '375 g paneer'], ['1 tbsp oil', 1 / 3, '⅓ tbsp oil']].forEach(function (c) {
      var got = scaleLine(c[0], c[1]); if (got !== c[2]) fails.push(c[0] + ' ×' + c[1] + ' → ' + got);
    });
    V.save({ list: [{ id: 'r', title: 'Test dal', cat: 'Dal & curry', serves: 2, ing: '1 cup dal\n2 tomatoes', steps: 'Boil.\nTemper.', tags: '' }] }); db = V.data();
    sel = 'r'; serves = 4; view = 'view'; draw();
    if (body.textContent.indexOf('2 cup dal') < 0 || body.textContent.indexOf('4 tomatoes') < 0) fails.push('scaled view');
    return V.save(keep).then(function () { view = 'list'; sel = null; draw(); return { ok: !fails.length, n: 10, fails: fails }; });
  }
});
