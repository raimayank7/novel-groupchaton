/* Infinity by GroupChatOn (infinity.groupchaton.com) — tool loader + shared kit
   Designed & Developed by Nivesh Sahayak (https://www.niveshsahayak.in/). All rights reserved: see LICENSE.
   A Blogger post becomes a tool with:  <div class="gco-page" data-gco-tool="pdf-merge"> ... <div class="gco-tool-mount"></div> ... </div>
   site.js loads this file; this file loads tools.css and tools/<id>.js, which calls GCOTools.register(). */
(function () {
  'use strict';
  // loaded twice (site.js and the ⌘K search both ask for it): the second time only mounts tools added since
  if (window.GCOTools && window.GCOTools.scan) { window.GCOTools.scan(); return; }
  var C = window.GCO || {};
  var BASE = C.base || '';
  // EDIT: bump this after changing any file in assets/tools/, so browsers fetch the new version straight away
  var VERSION = '2026-11-02.14';
  var doc = document;
  var T = window.GCOTools = window.GCOTools || {};

  /* ---------- the tool database: data/tools.json (built from scripts/catalog.py) ---------- */
  T.list = [];
  T.cats = [];
  T.find = function (id) { return T.list.filter(function (t) { return t.id === id; })[0]; };
  T.cat = function (id) { return T.cats.filter(function (c) { return c.id === id; })[0] || { id: id, name: id, label: id, icon: '•', color: '#888' }; };
  // every published post, read from the blog's feed page by page (Blogger gives at most 150 per page): tool slug → its address (/yyyy/mm/slug.html)
  function feedPage(start, acc) {
    return fetch('/feeds/posts/summary?alt=json&max-results=150&start-index=' + start, { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        ((d && d.feed && d.feed.entry) || []).forEach(function (e) {
          var link = (e.link || []).filter(function (l) { return l.rel === 'alternate'; })[0];
          if (!link) return;
          var path = link.href.replace(/^https?:\/\/[^/]+/, '');
          acc[path.replace(/^.*\//, '').replace(/\.html$/, '')] = path;
          if (e.title) acc['title:' + e.title.$t] = path;   // posts imported in bulk get their address from the title
        });
        return +((d && d.feed && d.feed.openSearch$totalResults) || {}).$t || 0;
      });
  }
  function postPaths() {   // the first page tells the total; the other pages are fetched at the same time
    var acc = {};
    return feedPage(1, acc).then(function (total) {
      var more = [];
      for (var s = 151; s <= Math.min(total, 6000); s += 150) more.push(feedPage(s, acc));
      return Promise.all(more).then(function () { return acc; });
    });
  }
  var PKEY = 'gco-tool-paths';   // the last post list, kept in this browser so links are right from the first paint
  function savedPaths() { try { return JSON.parse(localStorage.getItem(PKEY) || 'null') || null; } catch (e) { return null; } }
  function applyPaths(paths) {
    T.list.forEach(function (t) {
      var p = paths[t.slug] || paths['title:' + t.title];
      if (p) t.path = p;
      if (C.isApp) t.path = t.app ? '#' + t.id : (C.infinity || '') + '/search?q=' + encodeURIComponent(t.name);
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-tool-link]'), function (a) {
      var t = T.find(a.getAttribute('data-tool-link'));
      if (t) a.setAttribute('href', t.path);
    });
  }
  T.ready = fetch(BASE + 'data/tools.json?v=' + Math.floor(Date.now() / 6e5), { credentials: 'omit' })
    .then(function (r) { if (!r.ok) throw new Error('Tool list ' + r.status); return r.json(); })
    .then(function (db) {
      T.cats = db.categories || [];
      T.list = db.tools || [];
      // until the post list arrives, a tool's link is a search for it; then it becomes the post's own address
      T.list.forEach(function (t) { t.path = '/search?q=' + encodeURIComponent(t.name); });
      if (C.static) { T.list.forEach(function (t) { t.path = '/' + t.slug + '/'; }); return {}; }   // the static site: every tool is /<slug>/
      if (C.isApp) return {};   // novel.groupchaton.com: tools open inside the app (#id)
      var saved = savedPaths(), fresh = postPaths().then(function (p) {
        if (Object.keys(p).length) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) {} }
        return p;
      }).catch(function () { return {}; });
      if (!saved) return fresh;
      fresh.then(applyPaths);   // posts added since the last visit get their address when the new list arrives
      return saved;
    })
    .then(applyPaths)
    .catch(function (e) { if (window.console) console.warn('Infinity: tool list not loaded', e); });
  if (!C.isApp) {
    // opening effect: the tapped card dims with a spinner and a thin bar runs along the top until the tool page arrives
    var fx = doc.createElement('style');
    fx.textContent = '#gco-go-bar{position:fixed;top:0;left:0;height:3px;width:0;z-index:2147483646;pointer-events:none;' +
      'background:linear-gradient(90deg,#A04CB3,#d68be6,#A04CB3);box-shadow:0 0 8px #A04CB3;opacity:1;transition:width 8s cubic-bezier(.1,.7,.2,1),opacity .3s}' +
      '#gco-go-bar.on{width:88%}' +
      'a.gco-opening{position:relative;pointer-events:none;transform:scale(.98);transition:transform .15s}' +
      'a.gco-opening::after{content:"";position:absolute;inset:0;border-radius:inherit;background:rgba(127,127,127,.12);animation:gco-fade .2s both}' +
      'a.gco-opening::before{content:"";position:absolute;z-index:2;top:50%;left:50%;right:auto;bottom:auto;width:22px;height:22px;margin:-11px 0 0 -11px;background:none;opacity:1;' +
      'box-sizing:border-box;border:3px solid rgba(160,76,179,.25);border-top-color:var(--cc,#A04CB3);border-radius:50%;animation:gco-spin .7s linear infinite}' +
      '#gco-go-veil{position:fixed;inset:0;z-index:2147483645;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;' +
      'background:rgba(255,255,255,.86);color:#3b2342;font:600 16px/1.4 system-ui,sans-serif;text-align:center;padding:16px;animation:gco-fade .2s both}' +
      '#gco-go-veil i{width:34px;height:34px;border:4px solid rgba(160,76,179,.25);border-top-color:#A04CB3;border-radius:50%;animation:gco-spin .7s linear infinite}' +
      '@media (prefers-color-scheme:dark){html:not([data-theme=light]) #gco-go-veil{background:rgba(18,12,22,.88);color:#f1e6f4}}' +
      'html[data-theme=dark] #gco-go-veil,body.dark #gco-go-veil{background:rgba(18,12,22,.88);color:#f1e6f4}' +
      '@keyframes gco-spin{to{transform:rotate(360deg)}}@keyframes gco-fade{from{opacity:0}}' +
      '@media (prefers-reduced-motion:reduce){#gco-go-bar{transition:none}a.gco-opening{transform:none}a.gco-opening::before,#gco-go-veil i{animation-duration:2s}}';
    (doc.head || doc.documentElement).appendChild(fx);
    var goBar = function () {
      var b = doc.getElementById('gco-go-bar');
      if (!b) { b = doc.createElement('div'); b.id = 'gco-go-bar'; doc.body.appendChild(b); }
      b.offsetWidth; b.className = 'on';   // reflow first, so the bar grows from 0
    };
    // coming back with the Back button shows the page from memory: clear the effect
    window.addEventListener('pageshow', function () {
      var b = doc.getElementById('gco-go-bar'), v = doc.getElementById('gco-go-veil');
      if (b) b.remove();
      if (v) v.remove();
      Array.prototype.forEach.call(doc.querySelectorAll('.gco-opening'), function (a) { a.classList.remove('gco-opening'); });
    });
    // a tool link tapped before the post list arrived: wait for it, then open the tool's own page instead of a search
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-tool-link]');
      if (!a || e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.target === '_blank') return;
      a.classList.add('gco-opening');
      goBar();
      if (!/^\/search\?q=/.test(a.getAttribute('href') || '')) return;   // a real address: the browser opens it
      e.preventDefault();
      T.ready.then(function () { var t = T.find(a.getAttribute('data-tool-link')); location.href = t ? t.path : a.href; });
    }, true);
    // a search that is exactly a tool's name (links from help articles, old bookmarks): go straight to that tool
    var q = location.pathname === '/search' && /[?&]q=([^&]*)/.exec(location.search);
    if (q) T.ready.then(function () {
      var name = decodeURIComponent(q[1].replace(/\+/g, ' ')).trim().toLowerCase();
      var t = T.list.filter(function (x) { return x.name.toLowerCase() === name || x.title.toLowerCase() === name; })[0];
      if (!t || /^\/search/.test(t.path)) return;
      var v = doc.createElement('div');
      v.id = 'gco-go-veil';
      v.setAttribute('role', 'status');
      v.innerHTML = '<i aria-hidden="true"></i>';
      v.appendChild(doc.createTextNode('Opening ' + t.name + '…'));
      doc.body.appendChild(v);
      goBar();
      location.replace(t.path);
    });
  }

  /* ---------- libraries (fixed versions) ---------- */
  var CDN = 'https://cdnjs.cloudflare.com/ajax/libs/';
  var LIBS = {
    pdflib: [CDN + 'pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib'],
    pdfjs: [CDN + 'pdf.js/3.11.174/pdf.min.js', 'pdfjsLib'],
    jszip: [CDN + 'jszip/3.10.1/jszip.min.js', 'JSZip'],
    jspdf: [CDN + 'jspdf/2.5.1/jspdf.umd.min.js', 'jspdf'],
    html2canvas: [CDN + 'html2canvas/1.4.1/html2canvas.min.js', 'html2canvas'],
    tesseract: ['https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js', 'Tesseract'],
    qrcode: [CDN + 'qrcode-generator/1.4.4/qrcode.min.js', 'qrcode'],
    marked: ['https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js', 'marked'],
    purify: ['https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js', 'DOMPurify'],
    yaml: ['https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js', 'jsyaml'],
    terser: ['https://cdn.jsdelivr.net/npm/terser@5.31.0/dist/bundle.min.js', 'Terser'],
    leaflet: [CDN + 'leaflet/1.9.4/leaflet.min.js', 'L']
  };
  var loading = {};
  T.loadScript = function (src) {
    if (!loading[src]) loading[src] = new Promise(function (ok, fail) {
      var s = doc.createElement('script');
      s.src = src; s.async = true;
      s.onload = function () { ok(); };
      s.onerror = function () { delete loading[src]; fail(new Error('Could not load ' + src.split('/').pop() + '. Check your connection and try again.')); };
      doc.head.appendChild(s);
    });
    return loading[src];
  };
  T.lib = function (name) {
    var l = LIBS[name];
    return T.loadScript(l[0]).then(function () {
      var g = window[l[1]];
      if (name === 'pdfjs' && g && !g.GlobalWorkerOptions.workerSrc) g.GlobalWorkerOptions.workerSrc = CDN + 'pdf.js/3.11.174/pdf.worker.min.js';
      return g;
    });
  };

  /* ---------- small helpers ---------- */
  var h = T.h = function (tag, attrs, kids) {
    var n = doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c !== null && c !== undefined && c !== false) n.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c); });
    return n;
  };
  T.bytes = function (n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(n < 10485760 ? 2 : 1) + ' MB';
  };
  T.baseName = function (name) { return String(name || 'file').replace(/\.[^.]+$/, ''); };
  T.read = function (file, how) {
    return new Promise(function (ok, fail) {
      var r = new FileReader();
      r.onload = function () { ok(r.result); };
      r.onerror = function () { fail(new Error('Could not read ' + file.name)); };
      if (how === 'dataURL') r.readAsDataURL(file); else if (how === 'text') r.readAsText(file); else r.readAsArrayBuffer(file);
    });
  };
  T.download = function (blob, name) {
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: name });
    doc.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  };
  T.zip = function (items, onProgress) {
    return T.lib('jszip').then(function (JSZip) {
      var z = new JSZip();
      items.forEach(function (it) { z.file(it.name, it.blob); });
      return z.generateAsync({ type: 'blob' }, function (m) { if (onProgress) onProgress(m.percent / 100); });
    });
  };
  T.copy = function (text, btn) {
    var done = function () {
      if (!btn) return;
      var old = btn.textContent; btn.textContent = 'Copied ✓';
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(done);
    var ta = h('textarea', { style: 'position:fixed;opacity:0' }); ta.value = text;
    doc.body.appendChild(ta); ta.select();
    try { doc.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
    return Promise.resolve();
  };
  T.store = {
    get: function (k, d) { try { var v = localStorage.getItem('gco-tool-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('gco-tool-' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- building blocks ---------- */
  T.button = function (text, opts) {
    opts = opts || {};
    return h('button', { type: 'button', 'class': 'tbtn' + (opts.primary ? ' tbtn-primary' : '') + (opts.small ? ' tbtn-sm' : ''),
      onclick: opts.onclick, disabled: opts.disabled }, [text]);
  };
  T.field = function (label, input, hint) {
    return h('label', { 'class': 'tfield' }, [h('span', { 'class': 'tfield-label', text: label }), input, hint ? h('small', { text: hint }) : null]);
  };
  T.select = function (options, value) {
    var s = h('select', {}, options.map(function (o) {
      var val = Array.isArray(o) ? o[0] : o, lab = Array.isArray(o) ? o[1] : o;
      return h('option', { value: val, selected: String(val) === String(value) }, [lab]);
    }));
    return s;
  };
  T.seg = function (options, value, onChange) {
    var wrap = h('div', { 'class': 'tseg', role: 'group' });
    function draw() {
      wrap.innerHTML = '';
      options.forEach(function (o) {
        wrap.appendChild(h('button', { type: 'button', 'aria-pressed': String(o[0] === value), text: o[1],
          onclick: function () { value = o[0]; draw(); if (onChange) onChange(value); } }));
      });
    }
    draw();
    wrap.value = function () { return value; };
    return wrap;
  };
  T.row = function (kids, cls) { return h('div', { 'class': 'trow' + (cls ? ' ' + cls : '') }, kids); };

  // drop area: click, drag and drop, or paste (images)
  T.dropzone = function (opts) {
    var input = h('input', { type: 'file', accept: opts.accept || '', multiple: opts.multiple ? true : null, hidden: true });
    if (opts.folder) { input.setAttribute('webkitdirectory', ''); input.setAttribute('directory', ''); }
    var zone = h('div', { 'class': 'tdrop', tabindex: '0', role: 'button', 'aria-label': opts.label }, [
      h('span', { 'class': 'tdrop-ic', 'aria-hidden': 'true', text: opts.icon || '📂' }),
      h('b', { text: opts.label || 'Choose files' }),
      h('small', { text: opts.hint || 'or drag and drop them here' }),
      input]);
    function take(list) {
      var files = Array.prototype.slice.call(list || []);
      if (opts.filter) files = files.filter(opts.filter);
      if (files.length) opts.onFiles(opts.multiple ? files : [files[0]]);
    }
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', function () { take(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('is-over'); }); });
    zone.addEventListener('drop', function (e) { take(e.dataTransfer.files); });
    if (opts.paste) doc.addEventListener('paste', function (e) {
      var items = (e.clipboardData && e.clipboardData.files) || [];
      if (items.length) take(items);
    });
    return zone;
  };

  // a list of files the user can reorder and remove
  T.fileList = function (onChange) {
    var files = [], ul = h('ol', { 'class': 'tfiles' });
    function draw() {
      ul.innerHTML = '';
      files.forEach(function (f, i) {
        ul.appendChild(h('li', {}, [
          f.thumb ? h('img', { src: f.thumb, alt: '' }) : h('span', { 'class': 'tfiles-ic', text: '📄' }),
          h('span', { 'class': 'tfiles-name' }, [h('b', { text: f.file.name }), h('small', { text: T.bytes(f.file.size) + (f.note ? ' · ' + f.note : '') })]),
          h('span', { 'class': 'tfiles-act' }, [
            h('button', { type: 'button', 'aria-label': 'Move up', disabled: i === 0, text: '↑', onclick: function () { move(i, -1); } }),
            h('button', { type: 'button', 'aria-label': 'Move down', disabled: i === files.length - 1, text: '↓', onclick: function () { move(i, 1); } }),
            h('button', { type: 'button', 'aria-label': 'Remove', text: '✕', onclick: function () { files.splice(i, 1); draw(); } })])]));
      });
      ul.hidden = !files.length;
      if (onChange) onChange(files);
    }
    function move(i, d) { var x = files.splice(i, 1)[0]; files.splice(i + d, 0, x); draw(); }
    return {
      el: ul,
      add: function (list) {
        list.forEach(function (file) {
          var item = { file: file };
          files.push(item);
          if (/^image\//.test(file.type)) { item.thumb = URL.createObjectURL(file); }
        });
        draw();
      },
      files: function () { return files.map(function (f) { return f.file; }); },
      clear: function () { files = []; draw(); },
      draw: draw
    };
  };

  // status line with optional progress bar
  T.status = function () {
    var bar = h('div', { 'class': 'tprogress', hidden: true }, [h('span')]);
    var msg = h('p', { 'class': 'tstatus', role: 'status', 'aria-live': 'polite' });
    var wrap = h('div', { 'class': 'tstatus-wrap' }, [bar, msg]);
    function set(kind, text) { msg.className = 'tstatus' + (kind ? ' is-' + kind : ''); msg.textContent = text || ''; }
    return {
      el: wrap,
      info: function (t) { set('', t); },
      ok: function (t) { bar.hidden = true; set('ok', t); },
      error: function (e) { bar.hidden = true; set('error', (e && e.message) || String(e)); },
      progress: function (p, t) { bar.hidden = false; bar.firstChild.style.width = Math.round(Math.max(0, Math.min(1, p)) * 100) + '%'; if (t) set('', t); },
      clear: function () { bar.hidden = true; set('', ''); }
    };
  };

  // a box of result files with download buttons (+ "download all as ZIP")
  T.results = function () {
    var box = h('div', { 'class': 'tresults', hidden: true });
    var items = [];
    function draw() {
      box.innerHTML = '';
      box.hidden = !items.length;
      if (!items.length) return;
      var head = h('div', { 'class': 'tresults-head' }, [h('b', { text: items.length === 1 ? 'Your file is ready' : items.length + ' files are ready' })]);
      if (items.length > 1) head.appendChild(T.button('Download all (ZIP)', { primary: true, small: true, onclick: function () {
        T.zip(items).then(function (z) { T.download(z, (box.zipName || 'files') + '.zip'); });
      } }));
      box.appendChild(head);
      var grid = h('div', { 'class': 'tresults-grid' });
      items.forEach(function (it) {
        grid.appendChild(h('div', { 'class': 'tresult' }, [
          it.preview ? h('img', { src: it.preview, alt: it.name, loading: 'lazy' }) : h('span', { 'class': 'tresult-ic', text: it.icon || '📄' }),
          h('span', { 'class': 'tresult-name' }, [h('b', { text: it.name }), h('small', { text: T.bytes(it.blob.size) + (it.note ? ' · ' + it.note : '') })]),
          T.button('Download', { small: true, primary: items.length === 1, onclick: function () { T.download(it.blob, it.name); } })]));
      });
      box.appendChild(grid);
    }
    return {
      el: box,
      set: function (list, zipName) { items = list; box.zipName = zipName; draw(); },
      clear: function () { items = []; draw(); }
    };
  };

  T.card = function (kids) { return h('div', { 'class': 'tool-app' }, kids); };

  /* text in → text out: the shape of most text and developer tools.
     o: { id, run(text, opts) → string (throw Error for a message), options: [elements], live: true (update as you type),
          button: 'Format', inLabel, outLabel, placeholder, sample, mono, rows, download: 'result.txt', type: 'text/plain' }
     Returns { input, output, update }. Options with data-opt="name" are passed to run() as opts.name. */
  T.transformer = function (spot, o) {
    var mono = o.mono ? ' tmono' : '';
    var input = h('textarea', { rows: String(o.rows || 9), 'class': 'tin' + mono, placeholder: o.placeholder || 'Type or paste here…', 'aria-label': o.inLabel || 'Input', spellcheck: o.mono ? 'false' : null });
    var output = h('textarea', { rows: String(o.rows || 9), 'class': 'tout' + mono, readonly: true, 'aria-label': o.outLabel || 'Result', spellcheck: 'false' });
    var status = T.status();
    input.value = T.store.get(o.id + '-in', '');
    var seq = 0;
    function opts() {
      var r = {};
      (o.options || []).forEach(function (el) {
        Array.prototype.forEach.call([el].concat(Array.prototype.slice.call(el.querySelectorAll ? el.querySelectorAll('[data-opt]') : [])), function (x) {
          var k = x.getAttribute && x.getAttribute('data-opt');
          if (!k) return;
          r[k] = x.type === 'checkbox' ? x.checked : typeof x.value === 'function' ? x.value() : x.value;
        });
      });
      return r;
    }
    function update() {
      T.store.set(o.id + '-in', input.value.slice(0, 200000));
      if (!input.value) { output.value = ''; status.clear(); return; }
      try {
        var res = o.run(input.value, opts()), tok = ++seq;
        if (res && typeof res.then === 'function') {   // tools that wait for a library or the browser's crypto
          status.info('Working…');
          res.then(function (v) { if (tok !== seq) return; output.value = v == null ? '' : String(v); if (o.note) status.info(o.note(input.value, output.value)); else status.clear(); },
            function (e) { if (tok === seq) { output.value = ''; status.error(e); } });
          return;
        }
        output.value = res == null ? '' : String(res);
        if (o.note) status.info(o.note(input.value, output.value)); else status.clear();
      } catch (e) { output.value = ''; status.error(e); }
    }
    var copy = T.button('Copy result', { onclick: function () { T.copy(output.value, copy); } });
    var dl = T.button('Download', { onclick: function () { T.download(new Blob([output.value], { type: (o.type || 'text/plain') + ';charset=utf-8' }), o.download || 'result.txt'); } });
    var go = o.live === false ? T.button(o.button || 'Convert', { primary: true, onclick: update }) : null;
    var sample = o.sample ? T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; update(); } }) : null;
    var clear = T.button('Clear', { small: true, onclick: function () { input.value = ''; update(); input.focus(); } });
    spot.appendChild(T.card([
      T.field(o.inLabel || 'Your text', input),
      (o.options || []).length ? h('div', { 'class': 'topts' }, o.options) : null,
      T.row([go, sample, clear]),
      status.el,
      T.field(o.outLabel || 'Result', output),
      T.row([copy, o.download === false ? null : dl])]));
    if (o.live !== false) input.addEventListener('input', update);
    (o.options || []).forEach(function (el) { el.addEventListener('change', update); el.addEventListener('input', function () { if (o.live !== false) update(); }); el.addEventListener('click', function () { if (o.live !== false) setTimeout(update, 0); }); });
    update();
    return { input: input, output: output, update: update, status: status };
  };
  // a labelled checkbox / select / number for T.transformer options
  T.opt = {
    check: function (name, label, on) { return h('label', { 'class': 'tcheck' }, [h('input', { type: 'checkbox', 'data-opt': name, checked: on ? true : null }), ' ' + label]); },
    select: function (name, label, options, value) { var s = T.select(options, value); s.setAttribute('data-opt', name); return T.field(label, s); },
    text: function (name, label, value, ph) { return T.field(label, h('input', { type: 'text', 'data-opt': name, value: value || '', placeholder: ph || '' })); },
    number: function (name, label, value, min, max) { return T.field(label, h('input', { type: 'number', 'data-opt': name, value: String(value), min: min, max: max })); }
  };


  /* ---------- engines: one script draws many tools from a short description ----------
     A tool file calls  GCOTools.engine('calc', 'emi', { ...description... })  and _calc.js does the rest. */
  T.engines = {};
  T.tests = {};   // id → function returning a Promise of { ok, fails: [] } (used by our own test runs)
  T.engine = function (name, id, def) {
    var go = function () { T.register(id, function (spot, T, page) { return T.engines[name](spot, T, def, id, page); }); };
    if (T.engines[name]) return go();
    T.loadScript(BASE + 'assets/tools/_' + name + '.js?v=' + VERSION).then(go, function (e) {
      $all('[data-gco-tool="' + id + '"] .gco-tool-mount').forEach(function (s) { s.appendChild(h('p', { 'class': 'tstatus is-error', text: e.message })); });
    });
  };

  /* ---------- numbers and money for a global audience ---------- */
  var LANG = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US';
  var REGION_CUR = { IN: 'INR', US: 'USD', GB: 'GBP', IE: 'EUR', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
    CA: 'CAD', AU: 'AUD', NZ: 'NZD', AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', OM: 'OMR', BH: 'BHD', PK: 'PKR', BD: 'BDT', NP: 'NPR', LK: 'LKR', SG: 'SGD', MY: 'MYR',
    ID: 'IDR', PH: 'PHP', TH: 'THB', VN: 'VND', JP: 'JPY', CN: 'CNY', HK: 'HKD', KR: 'KRW', TW: 'TWD', ZA: 'ZAR', NG: 'NGN', KE: 'KES', EG: 'EGP', GH: 'GHS', TR: 'TRY',
    RU: 'RUB', UA: 'UAH', PL: 'PLN', SE: 'SEK', NO: 'NOK', DK: 'DKK', CH: 'CHF', CZ: 'CZK', HU: 'HUF', RO: 'RON', IL: 'ILS', MX: 'MXN', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN' };
  T.CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'PKR', 'BDT', 'NPR', 'LKR', 'CAD', 'AUD', 'NZD', 'SGD', 'MYR', 'IDR', 'PHP', 'THB', 'VND', 'JPY', 'CNY', 'HKD', 'KRW',
    'ZAR', 'NGN', 'KES', 'EGP', 'GHS', 'TRY', 'RUB', 'UAH', 'PLN', 'SEK', 'NOK', 'DKK', 'CHF', 'CZK', 'ILS', 'QAR', 'KWD', 'OMR', 'BHD', 'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN'];
  T.currency = function (set) {
    if (set) { T.store.set('currency', set); return set; }
    return T.store.get('currency', null) || REGION_CUR[(LANG.split('-')[1] || '').toUpperCase()] || 'USD';
  };
  function locFor(cur) { return cur === 'INR' ? 'en-IN' : LANG; }   // lakh / crore grouping for rupees
  T.money = function (n, cur) {
    cur = cur || T.currency();
    if (!isFinite(n)) return '—';
    try { return new Intl.NumberFormat(locFor(cur), { style: 'currency', currency: cur, maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2 }).format(n); }
    catch (e) { return cur + ' ' + T.num(n, 2); }
  };
  T.num = function (n, dp) {
    if (typeof n !== 'number' || !isFinite(n)) return n === Infinity ? '∞' : '—';
    var a = Math.abs(n);
    if (a !== 0 && (a >= 1e15 || a < 1e-6)) return n.toExponential(Math.min(dp == null ? 6 : dp, 10)).replace('e+', ' × 10^').replace('e-', ' × 10^-');
    return n.toLocaleString(locFor(T.currency()), { maximumFractionDigits: dp == null ? (a >= 1000 ? 2 : a >= 1 ? 4 : 8) : dp });
  };


  /* ---------- on-device storage for record-keeping tools (money manager, book keeper, invoices…) ----------
     Like WhatsApp Web, records live in this browser's IndexedDB: large, fast, and able to hold photos and PDFs (Blobs).
     Each tool's records are loaded into memory once, then every change is written back.
     var V = T.vault('money', emptyValue);  V.ready.then(draw);  V.data() → the records;  V.save(records);  V.bar(onChange) → Backup / Restore / Delete all */
  var idb = null;
  function db() {
    if (!idb) idb = new Promise(function (ok, fail) {
      if (!window.indexedDB) return fail(new Error('no IndexedDB'));
      var r = indexedDB.open('gco-records', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('vault'); };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { fail(r.error); };
    });
    return idb;
  }
  function idbDo(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (ok, fail) {
        var tx = d.transaction('vault', mode), req = fn(tx.objectStore('vault'));
        tx.oncomplete = function () { ok(req && req.result); };
        tx.onerror = tx.onabort = function () { fail(tx.error); };
      });
    });
  }
  T.idb = { get: function (k) { return idbDo('readonly', function (s) { return s.get(k); }); }, put: function (k, v) { return idbDo('readwrite', function (s) { return s.put(v, k); }); },
    del: function (k) { return idbDo('readwrite', function (s) { return s['delete'](k); }); }, keys: function () { return idbDo('readonly', function (s) { return s.getAllKeys(); }); } };
  var vaults = {};
  T.vault = function (name, empty) {
    if (vaults[name]) return vaults[name];
    var key = 'gco-vault-' + name, mem, useLocal = false;
    function fresh() { return JSON.parse(JSON.stringify(empty || {})); }
    mem = fresh();
    var v = { key: key };
    // ask the browser not to clear these records when space runs low
    if (navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) {} }
    v.ready = T.idb.get(key).then(function (got) {
      if (got !== undefined) { mem = got; return; }
      var old = null; try { old = localStorage.getItem(key); } catch (e) {}   // records saved by the first version of these tools
      if (old) { mem = JSON.parse(old); return T.idb.put(key, mem).then(function () { try { localStorage.removeItem(key); } catch (e) {} }); }
    }).catch(function () {   // private windows in some browsers block IndexedDB: fall back to localStorage
      useLocal = true;
      try { var x = localStorage.getItem(key); if (x) mem = JSON.parse(x); } catch (e) {}
    });
    v.data = function () { return mem; };
    v.save = function (d) {
      mem = d;
      var fail = function () { alert('Your records could not be saved: the browser storage may be full. Download a backup, then delete old records.'); };
      if (useLocal) { try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) { fail(); } return Promise.resolve(); }
      return T.idb.put(key, d).catch(fail);
    };
    v.clear = function () { return v.save(fresh()); };
    v.backup = function () {
      // photos and files are saved as data URLs so one JSON file holds everything
      return toPlain(mem).then(function (plain) {
        T.download(new Blob([JSON.stringify({ tool: name, saved: new Date().toISOString(), data: plain }, null, 1)], { type: 'application/json' }),
          name + '-backup-' + new Date().toISOString().slice(0, 10) + '.json');
      });
    };
    v.restore = function (file) {
      return T.read(file, 'text').then(function (t) {
        var j = JSON.parse(t);
        if (!j || j.tool !== name || !j.data) throw new Error('This is not a backup from this tool.');
        return fromPlain(j.data).then(function (d) { return v.save(d).then(function () { return d; }); });
      });
    };
    v.bar = function (onChange) {
      var file = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
      file.addEventListener('change', function () {
        if (!file.files[0]) return;
        v.restore(file.files[0]).then(function () { if (onChange) onChange(); alert('Backup restored.'); }, function (e) { alert(e.message); });
        file.value = '';
      });
      return h('div', { 'class': 'tvault' }, [
        h('span', { 'class': 'tvault-msg' }, [h('b', { text: '🔒 Saved only on this device. ' }), 'Nothing is uploaded. Download a backup now and then, and before clearing your browser.']),
        h('span', { 'class': 'tvault-act' }, [
          T.button('Backup', { small: true, onclick: v.backup }),
          T.button('Restore', { small: true, onclick: function () { file.click(); } }),
          T.button('Delete all', { small: true, onclick: function () {
            if (!confirm('Delete all saved records in this tool? Download a backup first if you may need them.')) return;
            v.clear().then(function () { if (onChange) onChange(); });
          } }), file])]);
    };
    vaults[name] = v;
    return v;
  };
  // Blobs ↔ data URLs, for backups that fit in one JSON file
  function toPlain(x) {
    if (x instanceof Blob) return T.read(x, 'dataURL').then(function (u) { return { __blob: u }; });
    if (Array.isArray(x)) return Promise.all(x.map(toPlain));
    if (x && typeof x === 'object') { var ks = Object.keys(x); return Promise.all(ks.map(function (k) { return toPlain(x[k]); })).then(function (vs) { var o = {}; ks.forEach(function (k, i) { o[k] = vs[i]; }); return o; }); }
    return Promise.resolve(x);
  }
  function fromPlain(x) {
    if (x && x.__blob) return fetch(x.__blob).then(function (r) { return r.blob(); });
    if (Array.isArray(x)) return Promise.all(x.map(fromPlain));
    if (x && typeof x === 'object') { var ks = Object.keys(x); return Promise.all(ks.map(function (k) { return fromPlain(x[k]); })).then(function (vs) { var o = {}; ks.forEach(function (k, i) { o[k] = vs[i]; }); return o; }); }
    return Promise.resolve(x);
  }
  // amount in words: lakh / crore for rupees, million / billion for other currencies
  T.words = function (n, cur) {
    cur = cur || T.currency();
    var ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    var tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function two(x) { return x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? '-' + ones[x % 10] : ''); }
    function three(x) { return (x >= 100 ? ones[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? two(x % 100) : ''); }
    function whole(x) {
      if (x === 0) return 'Zero';
      var out = [];
      if (cur === 'INR' || cur === 'NPR' || cur === 'PKR' || cur === 'BDT') {
        if (x >= 1e9) { out.push(whole(Math.floor(x / 1e7)).replace(/^Zero$/, '') + ' Crore'); x %= 1e7; }
        [[1e7, 'Crore'], [1e5, 'Lakh'], [1e3, 'Thousand']].forEach(function (p) { if (x >= p[0]) { out.push(two(Math.floor(x / p[0])) + ' ' + p[1]); x %= p[0]; } });
        if (x) out.push(three(x));
      } else {
        [[1e12, 'Trillion'], [1e9, 'Billion'], [1e6, 'Million'], [1e3, 'Thousand']].forEach(function (p) { if (x >= p[0]) { out.push(three(Math.floor(x / p[0])) + ' ' + p[1]); x %= p[0]; } });
        if (x) out.push(three(x));
      }
      return out.join(' ');
    }
    var NAMES = { INR: ['Rupees', 'Paise'], USD: ['Dollars', 'Cents'], EUR: ['Euros', 'Cents'], GBP: ['Pounds', 'Pence'], AED: ['Dirhams', 'Fils'], SAR: ['Riyals', 'Halalas'],
      PKR: ['Rupees', 'Paisa'], BDT: ['Taka', 'Poisha'], NPR: ['Rupees', 'Paisa'], LKR: ['Rupees', 'Cents'], CAD: ['Dollars', 'Cents'], AUD: ['Dollars', 'Cents'], SGD: ['Dollars', 'Cents'] };
    var nm = NAMES[cur] || [cur, 'Cents'];
    n = Math.round(Math.abs(n) * 100);
    var c = n % 100;
    return nm[0] + ' ' + whole(Math.floor(n / 100)) + (c ? ' and ' + two(c) + ' ' + nm[1] : '') + ' Only';
  };

  /* ---------- PDF helpers ---------- */
  T.openPdf = function (file) {
    return Promise.all([T.lib('pdfjs'), T.read(file)]).then(function (r) {
      return r[0].getDocument({ data: new Uint8Array(r[1]) }).promise;
    }).catch(function (e) {
      if (/password/i.test(e && e.name + e.message)) throw new Error('This PDF is password-protected. Remove the password first.');
      throw e;
    });
  };
  T.renderPage = function (pdf, n, scale) {
    return pdf.getPage(n).then(function (page) {
      var vp = page.getViewport({ scale: scale || 1 });
      var canvas = h('canvas'); canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      // 'print' intent renders without waiting for animation frames, so it keeps going in a background tab
      return page.render({ canvasContext: ctx, viewport: vp, intent: 'print' }).promise.then(function () { return canvas; });
    });
  };
  T.canvasBlob = function (canvas, type, quality) {
    return new Promise(function (ok) { canvas.toBlob(ok, type || 'image/png', quality); });
  };
  // "1-3, 5, 8-" → [1,2,3,5,8,...,max]
  T.parseRanges = function (text, max) {
    var out = [];
    String(text || '').split(/[,;]+/).forEach(function (part) {
      var m = part.trim().match(/^(\d*)\s*-\s*(\d*)$/), a, b;
      if (m) { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : max; }
      else if (/^\d+$/.test(part.trim())) { a = b = +part.trim(); }
      else return;
      for (var i = Math.max(1, a); i <= Math.min(max, b); i++) if (out.indexOf(i) < 0) out.push(i);
    });
    return out;
  };

  /* ---------- loading and mounting ---------- */
  var registry = {};
  T.register = function (id, setup) {
    registry[id] = setup;
    $all('[data-gco-tool="' + id + '"]').forEach(mount);
  };
  function $all(sel) { return Array.prototype.slice.call(doc.querySelectorAll(sel)); }
  function mount(page) {
    if (page.__mounted) return;
    page.__mounted = true;
    var id = page.getAttribute('data-gco-tool');
    var spot = page.querySelector('.gco-tool-mount') || page.insertBefore(h('div', { 'class': 'gco-tool-mount' }), page.firstChild);
    spot.innerHTML = '';
    if (id !== 'hub') { toolbar(page, spot, id); T.used(id); }
    try { registry[id](spot, T, page); } catch (e) {
      spot.appendChild(h('p', { 'class': 'tstatus is-error', text: 'This tool could not start: ' + e.message }));
      if (window.console) console.error(e);
    }
    T.ready.then(function () {
    var info = T.find(id);
    if (info && !C.isApp) {
      // an ad between the tool and the guide below it (never next to the tool's buttons)
      if (C.adSlot) { var ad = C.adSlot('in-article', (C.ads || {}).inArticle); if (ad) spot.parentNode.insertBefore(ad, spot.nextSibling); }
      related(page, info);
      structured(info);
    }
    });
  }
  // above every tool: favourite, and install just this tool as an app
  function toolbar(page, spot, id) {
    if (page.querySelector('.tbar') || doc.documentElement.classList.contains('is-embed') || C.only) return;
    var fav = T.isFav(id);
    var star = h('button', { type: 'button', 'class': 'tbtn tbtn-sm tbar-fav', 'data-id': id, 'aria-pressed': String(fav), onclick: function () { T.toggleFav(id); } },
      [h('span', { 'aria-hidden': 'true', text: '★' }), h('span', { text: fav ? ' Favourite' : ' Add to favourites' })]);
    var kids = [star];
    var appBase = C.isApp ? location.origin + '/' : C.appUrl ? C.appUrl.replace(/\/?$/, '/') : '';
    if (C.static && !(window.matchMedia && matchMedia('(display-mode: standalone)').matches))   // Infinity itself installs as the app (infinity.js)
      kids.push(h('a', { 'class': 'tbtn tbtn-sm', href: '/#install', 'data-install': '1', title: 'Install Infinity on your phone or computer: every tool, works offline' },
        [h('span', { 'aria-hidden': 'true', text: '⬇' }), ' Install app']));
    else if (appBase) kids.push(h('a', { 'class': 'tbtn tbtn-sm', href: appBase + 't/' + id + '/', target: C.isApp ? null : '_blank', rel: 'noopener',
      title: 'Opens this tool on its own, ready to install on your phone or computer' }, [h('span', { 'aria-hidden': 'true', text: '⬇' }), ' Install as app']));
    spot.parentNode.insertBefore(h('div', { 'class': 'tbar' }, kids), spot);
  }
  function related(page, info) {
    var same = T.list.filter(function (t) { return t.id !== info.id && t.cat === info.cat; });
    var other = T.list.filter(function (t) { return t.id !== info.id && t.cat !== info.cat; });
    var picks = same.concat(other).slice(0, 6);
    page.appendChild(h('section', { 'class': 'trelated' }, [
      h('h2', { text: 'More ' + T.cat(info.cat).name + ' tools and more' }),
      h('div', { 'class': 'thub-grid' }, picks.map(card)),
      h('p', { 'class': 'trelated-all' }, [h('a', { href: '/', text: 'See all ' + T.list.length + ' tools →' })])]));
  }
  function card(t) {
    var c = T.cat(t.cat), fav = T.isFav(t.id);
    var star = h('button', { type: 'button', 'class': 'thub-fav', 'aria-pressed': String(fav), title: fav ? 'Remove from favourites' : 'Add to favourites',
      'aria-label': (fav ? 'Remove ' : 'Add ') + t.name + (fav ? ' from' : ' to') + ' favourites', text: fav ? '★' : '☆',
      onclick: function (e) { e.preventDefault(); e.stopPropagation(); T.toggleFav(t.id); } });
    return h('div', { 'class': 'thub-cell', 'data-id': t.id }, [h('a', { 'class': 'thub-card', href: t.path, 'data-tool-link': t.id, 'data-cat': t.cat, style: '--cc:' + c.color }, [
      h('span', { 'class': 'thub-ic', 'aria-hidden': 'true', text: t.icon }),
      h('span', {}, [h('b', {}, [t.name, t.isNew ? h('em', { 'class': 'thub-new', text: 'NEW' }) : null]), h('small', { text: t.desc })])]), star]);
  }
  /* ---------- favourites, recently used and popular (favourites and usage stay on this device) ---------- */
  T.favs = function () { var f = T.store.get('favs', []); return Array.isArray(f) ? f : []; };
  T.isFav = function (id) { return T.favs().indexOf(id) >= 0; };
  T.toggleFav = function (id) {
    var f = T.favs(), i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.unshift(id);
    T.store.set('favs', f.slice(0, 200));
    // every star for this tool on the page follows
    $all('.thub-cell[data-id="' + id + '"] .thub-fav, .tbar-fav[data-id="' + id + '"]').forEach(function (b) {
      var on = i < 0; b.setAttribute('aria-pressed', String(on));
      if (b.classList.contains('thub-fav')) { b.textContent = on ? '★' : '☆'; b.title = on ? 'Remove from favourites' : 'Add to favourites'; }
      else b.lastChild.textContent = on ? ' Favourite' : ' Add to favourites';
    });
    doc.dispatchEvent(new CustomEvent('gco-favs'));
    return i < 0;
  };
  T.used = function (id) {
    var u = T.store.get('use', {}), r = u[id] || [0, 0];
    u[id] = [r[0] + 1, Date.now()];
    var ids = Object.keys(u);
    if (ids.length > 150) ids.sort(function (a, b) { return u[a][1] - u[b][1]; }).slice(0, ids.length - 150).forEach(function (k) { delete u[k]; });
    T.store.set('use', u);
  };
  T.recent = function (n) {
    var u = T.store.get('use', {});
    return Object.keys(u).sort(function (a, b) { return u[b][1] - u[a][1]; }).map(T.find).filter(Boolean).slice(0, n || 8);
  };
  // the most-visited tools across the site: Blogger's Popular Posts gadget (#gco-popular), topped up with everyday favourites
  var STARTER = ['image-compress', 'pdf-merge', 'emi', 'qr', 'invoice', 'percentage', 'age', 'gst', 'scientific', 'word-count', 'money-manager', 'income-tax-in'];
  T.popular = function (n) {
    var out = [];
    function add(t) { if (t && out.indexOf(t) < 0) out.push(t); }
    $all('#gco-popular a[href]').forEach(function (a) {
      // by the post's address, or by its title when Blogger gave the post a different address
      var m = a.getAttribute('href').match(/\/([a-z0-9-]+)\.html(?:$|[?#])/), title = a.textContent.trim();
      add(T.list.filter(function (x) { return (m && x.slug === m[1]) || x.title === title || x.name === title; })[0]);
    });
    STARTER.forEach(function (id) { add(T.find(id)); });
    return out.slice(0, n || 8);
  };
  T.toolCard = card;
  function structured(info) {
    var s = h('script', { type: 'application/ld+json' });
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: info.name + ' — Infinity by GroupChatOn',
      url: location.origin + location.pathname, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (runs in your browser)',
      description: info.desc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } });
    doc.head.appendChild(s);
  }

  /* the tool hub (home page and category pages).
     Home: your favourites, recently used, popular, then each category with its most-used tools and "See all".
     Searching or picking a category shows a grid, drawn 48 cards at a time so a phone never builds hundreds at once. */
  T.register('hub', function (spot) {
    T.ready.then(function () {
      var label = (location.pathname.match(/^\/search\/label\/([^/?#]+)/) || [])[1];
      label = label ? decodeURIComponent(label).replace(/\+/g, ' ') : '';
      var cat = C.cat || (T.cats.filter(function (c) { return c.label === label; })[0] || {}).id || 'all';
      var q = h('input', { type: 'search', 'class': 'thub-search', placeholder: 'Search ' + T.list.length + ' free tools…', 'aria-label': 'Search tools', enterkeyhint: 'search' });
      var startQ = new URLSearchParams(location.search).get('q');
      if (startQ && !label) q.value = startQ;
      var chips = h('div', { 'class': 'thub-cats', role: 'tablist', 'aria-label': 'Categories' });
      var body = h('div', { 'class': 'thub-body' });
      var count = h('p', { 'class': 'thub-count', role: 'status', 'aria-live': 'polite' });
      var PAGE = 48, limit = PAGE, timer = 0, popIds = {};
      function chip(id, name, icon, color, n) {
        return h('button', { type: 'button', role: 'tab', 'class': 'thub-chip', 'data-cat': id, style: color ? '--cc:' + color : null,
          'aria-selected': String(cat === id), onclick: function () { pickCat(id); } }, [h('span', { 'aria-hidden': 'true', text: icon }), name, h('em', { text: String(n) })]);
      }
      function pickCat(id) { cat = id; limit = PAGE; draw(); if (id !== 'all' && spot.scrollIntoView) spot.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      function drawChips() {
        chips.innerHTML = '';
        chips.appendChild(chip('all', 'All', '∞', '', T.list.length));
        var favN = T.favs().filter(T.find).length;
        if (favN) chips.appendChild(chip('fav', 'Favourites', '★', '#FBBF24', favN));
        T.cats.forEach(function (c) {
          var n = T.list.filter(function (t) { return t.cat === c.id; }).length;
          if (n) chips.appendChild(chip(c.id, c.name, c.icon, c.color, n));
        });
      }
      function section(icon, title, tools, more, cls) {
        if (!tools.length) return null;
        return h('section', { 'class': 'thub-sec' + (cls ? ' ' + cls : '') }, [
          h('div', { 'class': 'thub-sec-head' }, [h('h2', {}, [h('span', { 'aria-hidden': 'true', text: icon }), ' ' + title]),
            more ? h('button', { type: 'button', 'class': 'thub-more', onclick: more[1], text: more[0] }) : null]),
          h('div', { 'class': 'thub-grid' }, tools.map(card))]);
      }
      function home() {
        var favs = T.favs().map(T.find).filter(Boolean), recent = T.recent(3), pop = T.popular(6);
        pop.forEach(function (t, i) { popIds[t.id] = i + 1; });
        [section('★', 'Your favourites', favs.slice(0, 6), favs.length > 6 ? ['See all ' + favs.length + ' →', function () { pickCat('fav'); }] : null, 'is-fav'),
          section('🕘', 'Recently used', recent, null, 'is-recent'),
          section('🔥', 'Popular right now', pop, null, 'is-pop')].forEach(function (x) { if (x) body.appendChild(x); });
        if (!favs.length) body.appendChild(h('p', { 'class': 'thub-tip', text: 'Tip: tap ☆ on any tool to keep it at the top of this page.' }));
        T.cats.forEach(function (c) {
          var all = T.list.filter(function (t) { return t.cat === c.id; });
          if (!all.length) return;
          // the tools people use most lead each row
          var ranked = all.slice().sort(function (a, b) { return (popIds[a.id] || 99) - (popIds[b.id] || 99); });
          body.appendChild(section(c.icon, c.name, ranked.slice(0, 6), all.length > 6 ? ['See all ' + all.length + ' →', function () { pickCat(c.id); }] : null, 'is-cat'));
        });
        count.textContent = '';
      }
      function draw() {
        var s = q.value.trim().toLowerCase();
        drawChips();
        body.innerHTML = '';
        if (!s && cat === 'all') return home();
        var words = s.split(/\s+/).filter(Boolean), favs = T.favs();
        var shown = T.list.filter(function (t) {
          if (cat === 'fav' ? favs.indexOf(t.id) < 0 : cat !== 'all' && t.cat !== cat) return false;
          if (!words.length) return true;
          var hay = (t.name + ' ' + t.desc + ' ' + T.cat(t.cat).name + ' ' + (t.keywords || []).join(' ')).toLowerCase();
          return words.every(function (w) { return hay.indexOf(w) >= 0; });
        });
        if (words.length) shown.sort(function (a, b) { var x = a.name.toLowerCase().indexOf(words[0]) >= 0, y = b.name.toLowerCase().indexOf(words[0]) >= 0; return x === y ? 0 : x ? -1 : 1; });
        var grid = h('div', { 'class': 'thub-grid' });
        shown.slice(0, limit).forEach(function (t) { grid.appendChild(card(t)); });
        body.appendChild(grid);
        if (shown.length > limit) body.appendChild(h('p', { 'class': 'thub-pager' }, [T.button('Show ' + Math.min(PAGE, shown.length - limit) + ' more (' + (shown.length - limit) + ' left)', { onclick: function () { limit += PAGE; draw(); } })]));
        count.textContent = shown.length + (shown.length === 1 ? ' tool' : ' tools') + (cat !== 'all' ? ' in ' + (cat === 'fav' ? 'Favourites' : T.cat(cat).name) : '');
        if (!shown.length) body.appendChild(h('p', { 'class': 'tstatus', html: cat === 'fav' && !s ? 'No favourites yet: tap ☆ on any tool card.' : 'No tool matches “' + h('b', { text: q.value }).outerHTML + '” yet. <a href="/p/ask-for-a-tool.html" data-feedback="tool">Ask for it</a> and we’ll build it.' }));
      }
      q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { limit = PAGE; draw(); }, 120); });
      doc.addEventListener('gco-favs', function () { clearTimeout(timer); timer = setTimeout(draw, 600); });
      spot.appendChild(h('div', { 'class': 'thub' }, [q, chips, count, body]));
      draw();
    });
  });

  // load the stylesheet, then each tool's script
  if (!doc.getElementById('gco-tools-css')) doc.head.appendChild(h('link', { id: 'gco-tools-css', rel: 'stylesheet', href: BASE + 'assets/tools/tools.css?v=' + VERSION }));
  function inline(page, id) {
    if (registry[id]) return mount(page);
    if (!/^[a-z0-9-]+$/.test(id)) return;
    showLoading(page, id);
    T.loadScript(BASE + 'assets/tools/' + id + '.js?v=' + VERSION).catch(function (e) {
      var spot = page.querySelector('.gco-tool-mount');
      if (spot) { spot.innerHTML = ''; spot.appendChild(h('p', { 'class': 'tstatus is-error' }, [e.message + ' ', T.button('Try again', { small: true, onclick: function () { location.reload(); } })])); }
    });
  }
  // every post shows a loading panel until its tool starts; after 10 s it offers a reload in case the connection stalled
  function showLoading(page, id) {
    var spot = page.querySelector('.gco-tool-mount');
    if (!spot || id === 'hub') return;
    var box = spot.querySelector('.tload');
    if (!box) { box = h('div', { 'class': 'tload', role: 'status', 'aria-live': 'polite' }, [h('span', { 'class': 'tload-bar' }, [h('i')]), h('code', { text: 'loading tool' })]); spot.appendChild(box); }
    setTimeout(function () {
      if (!box.isConnected || box.querySelector('.tload-slow')) return;
      box.appendChild(h('p', { 'class': 'tload-slow' }, ['Taking longer than usual: your connection may be slow. ', T.button('Reload', { small: true, onclick: function () { location.reload(); } })]));
    }, 10000);
  }
  /* A tool that keeps records (money manager, khata, invoices…) is shown from the Infinity app (C.appUrl) in a frame.
     novel.groupchaton.com and this blog are the same site to the browser, so the frame and the installed app share one set of records.
     If the app cannot be reached, the tool runs here instead. */
  function fromApp(page, info) {
    page.__mounted = true;
    var spot = page.querySelector('.gco-tool-mount') || page.insertBefore(h('div', { 'class': 'gco-tool-mount' }), page.firstChild);
    var src = C.appUrl.replace(/\/?$/, '/') + '?embed=1#' + info.id;
    var frame = h('iframe', { src: src, title: info.name, 'class': 'tapp-frame', loading: 'eager', allow: 'clipboard-write; camera; microphone' });
    var ready = false;
    function onMsg(e) {
      if (e.source !== frame.contentWindow || !e.data || !e.data.gcoApp) return;
      if (e.data.gcoApp === 'ready') ready = true;
      if (e.data.gcoApp === 'height') frame.style.height = Math.max(400, Math.min(6000, +e.data.h || 0)) + 'px';
    }
    window.addEventListener('message', onMsg);
    spot.innerHTML = '';
    toolbar(page, spot, info.id); T.used(info.id);
    spot.appendChild(frame);
    spot.appendChild(h('p', { 'class': 'tapp-note' }, ['🔒 Your records are saved only on this device. ',
      h('a', { href: C.appUrl.replace(/\/?$/, '/') + '#' + info.id, target: '_blank', rel: 'noopener', text: 'Open it as an app (works offline) →' })]));
    setTimeout(function () {
      if (ready) return;
      window.removeEventListener('message', onMsg);
      page.__mounted = false; spot.innerHTML = '';
      inline(page, info.id);
    }, 12000);
    if (C.adSlot) { var ad = C.adSlot('in-article', (C.ads || {}).inArticle); if (ad) spot.parentNode.insertBefore(ad, spot.nextSibling); }
    related(page, info);
    structured(info);
  }
  /* ---------- button icons ----------
     Every .tbtn gets a line icon picked from its words (Copy, Download, Share…) or from the emoji/glyph it starts with,
     and every WhatsApp button gets WhatsApp's own mark. The button's text is never changed (tools read it back), the
     glyph is only hidden, and a button whose label a tool rewrites is simply decorated again. */
  var IC = {
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.4-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    next: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    sound: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/>',
    swap: '<path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/>',
    flip: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    open: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v1M14 20h1M18 18h3v3h-3z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    full: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    erase: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM18 9l-6 6M12 9l6 6"/>',
    merge: '<path d="M8 6l4-4 4 4M12 2v10.3a4 4 0 0 1-1.17 2.83L4 22M20 22l-5-5"/>',
    split: '<path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.17-2.83L3 3M21 3l-7.2 7.2"/>',
    shrink: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
    zin: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>',
    zout: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3M8 11h6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    wa: '<path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z"/>'
  };
  // the words a label starts with → its icon (first match wins; WhatsApp anywhere in the label beats them all)
  var IC_WORDS = [
    [/^(copied|done|finish|submit|verify|check|mark)/i, 'check'], [/^(copy)/i, 'copy'],
    [/^(download|export|install|save as|get (the )?(file|pdf|picture|image))/i, 'download'], [/^save/i, 'save'],
    [/^(upload|import|choose|browse|load|attach)/i, 'upload'], [/^(share|post|send)/i, 'share'], [/^print/i, 'print'],
    [/^(clear|delete|remove|empty|erase)/i, 'trash'], [/^(reset|start over|restart|again|replay|redo)/i, 'reset'], [/^undo/i, 'undo'],
    [/^(play|start|begin|resume|go\b)/i, 'play'], [/^pause/i, 'pause'], [/^(stop|end\b)/i, 'stop'],
    [/^(add|new|\+\s)/i, 'plus'], [/^(try|example|sample|generate|make|create|surprise|random)/i, 'spark'],
    [/^(show|reveal|preview|view|see)/i, 'eye'], [/^(next|convert|continue|calculate|skip)/i, 'next'], [/^(prev|previous|back)\b/i, 'left'],
    [/^(hear|listen|speak|read( it)? aloud|say)/i, 'sound'], [/^swap/i, 'swap'], [/^shuffle/i, 'shuffle'], [/^roll/i, 'dice'],
    [/^(flip|turn)/i, 'flip'], [/^hint/i, 'bulb'], [/^(open|test|visit)/i, 'open'], [/^(find|search|look up)/i, 'search'],
    [/^(cancel|close)/i, 'x'], [/^qr/i, 'qr'], [/^call/i, 'phone'], [/^(e-?mail|mail)/i, 'mail'], [/^(edit|rename)/i, 'edit'],
    [/^(today|pick (a )?date)/i, 'calendar'], [/^(use my location|locate|my location)/i, 'pin'], [/^(camera|take (a )?photo|scan)/i, 'camera'],
    [/^(merge|combine|join)/i, 'merge'], [/^split/i, 'split'], [/^(compress|minify|shrink)/i, 'shrink'], [/^zoom in/i, 'zin'], [/^zoom out/i, 'zout'],
    [/^restore/i, 'upload'], [/^backup/i, 'download'], [/^(rotate|reverse)/i, 'flip'], [/^read text/i, 'eye'], [/^use screen/i, 'full'], [/^(word|text|pdf|excel|csv|json) \(/i, 'file'],
    [/^(record)/i, 'mic'], [/^full ?screen/i, 'full'], [/(favourite|favorite)/i, 'star'], [/^(link|shorten)/i, 'link']
  ];
  // a label that starts with one of these glyphs shows the icon in its place
  var IC_GLYPH = { '▶': 'play', '⏵': 'play', '⏯': 'play', '⏸': 'pause', '■': 'stop', '⏹': 'stop', '🔊': 'sound', '🔈': 'sound', '✕': 'x', '×': 'x', '✖': 'x',
    '🖨': 'print', '💾': 'save', '↺': 'reset', '⟲': 'reset', '🔄': 'reset', '↻': 'flip', '✓': 'check', '✔': 'check', '◀': 'left', '‹': 'left', '«': 'left', '›': 'right', '»': 'right',
    '📷': 'camera', '📸': 'camera', '📍': 'pin', '📅': 'calendar', '📆': 'calendar', '💡': 'bulb', '🎤': 'mic', '⌫': 'erase', '⇅': 'swap', '⇄': 'swap', '↶': 'undo',
    '⬇': 'download', '⤓': 'download', '⬆': 'upload', '📂': 'upload', '★': 'star', '☆': 'star', '📞': 'phone', '✉': 'mail', '📧': 'mail', '✎': 'edit', '✏': 'edit',
    '🎲': 'dice', '📋': 'copy', '🔗': 'link', '📤': 'share', '🗑': 'trash', '➕': 'plus', '+': 'plus', '🔍': 'search', '🔎': 'search', '🔀': 'shuffle', '🎯': 'spark', '✨': 'spark' };
  var IC_NAME = { play: 'Play', pause: 'Pause', stop: 'Stop', sound: 'Listen', x: 'Close', print: 'Print', save: 'Save', reset: 'Start again', flip: 'Flip',
    check: 'Done', left: 'Previous', right: 'Next', camera: 'Camera', pin: 'My location', calendar: 'Date', bulb: 'Hint', mic: 'Record', erase: 'Delete',
    swap: 'Swap', undo: 'Undo', download: 'Download', upload: 'Upload', star: 'Favourite', phone: 'Call', mail: 'Email', edit: 'Edit', dice: 'Roll',
    copy: 'Copy', link: 'Link', share: 'Share', trash: 'Delete', plus: 'Add', search: 'Search', shuffle: 'Shuffle', spark: 'Go' };
  function icSvg(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + IC[k] + '</svg>';
  }
  function icUndo(b) {
    var old = b.querySelector(':scope > .t-ic'); if (old) old.remove();
    Array.prototype.slice.call(b.querySelectorAll(':scope > .t-glyph')).forEach(function (g) { g.replaceWith(doc.createTextNode(g.textContent)); });
    b.classList.remove('tbtn-wa', 'tbtn-ic-only'); b.removeAttribute('data-ic');
  }
  function icDecorate(b) {
    var text = b.textContent.replace(/\s+/g, ' ').trim();
    if (b.getAttribute('data-ic') === text) return;
    if (b.hasAttribute('data-ic')) icUndo(b);
    if (b.classList.contains('tbtn-noic') || b.querySelector('svg, img, canvas')) return;
    var href = b.getAttribute('href') || '', k = null, glyph = null;
    // the first visible character: an emoji or symbol at the start of the label
    var walker = doc.createTreeWalker(b, NodeFilter.SHOW_TEXT), node;
    while ((node = walker.nextNode()) && !node.nodeValue.trim()) {}
    if (node) {
      var m = /^\s*([^\s\wऀ-ൿ])(️)?\s?/.exec(node.nodeValue);
      if (m && IC_GLYPH[m[1]] && !(m[1] === '+' && /^\s*\+\d/.test(node.nodeValue))) { k = IC_GLYPH[m[1]]; glyph = [node, m[0]]; }
    }
    var words = text.replace(/^[^\wऀ-ൿ]+/, '');
    if (/whatsapp/i.test(text) || /(^|\/\/)(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|chat\.whatsapp\.com)|^whatsapp:/i.test(href)) k = 'wa';
    else if (!k) IC_WORDS.some(function (r) { if (r[0].test(words)) { k = r[1]; return true; } });
    if (!k) { b.setAttribute('data-ic', text); return; }
    if (glyph) {
      // hide the glyph itself (it stays in the text, which some tools read back)
      var n = glyph[0], cut = glyph[1].length, rest = n.splitText(cut);
      var g = h('span', { 'class': 't-glyph', 'aria-hidden': 'true' }); n.replaceWith(g); g.appendChild(n);
      if (!rest.nodeValue.trim() && !words) {
        b.classList.add('tbtn-ic-only');
        if (!b.getAttribute('aria-label') && !b.title) b.setAttribute('aria-label', IC_NAME[k] || '');
      }
    }
    var ic = h('span', { 'class': 't-ic', 'aria-hidden': 'true' }); ic.innerHTML = icSvg(k);
    b.insertBefore(ic, b.firstChild);
    if (k === 'wa') b.classList.add('tbtn-wa');
    if (!text) b.classList.add('tbtn-ic-only');
    b.setAttribute('data-ic', text);
  }
  T.icons = function (root) { Array.prototype.slice.call((root || doc).querySelectorAll('.tbtn')).forEach(icDecorate); };
  (function () {
    var queued = false;
    function run() { queued = false; T.icons(); }
    function later() { if (!queued) { queued = true; setTimeout(run, 16); } }
    if (!window.MutationObserver) return;
    new MutationObserver(later).observe(doc.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href'] });
    later();
  })();

  T.scan = function () { $all('[data-gco-tool]').forEach(function (page) {
    var id = page.getAttribute('data-gco-tool');
    if (page.__mounted || page.__waiting) return;
    if (!C.appUrl || C.isApp || id === 'hub') return inline(page, id);
    page.__waiting = true;
    T.ready.then(function () {
      page.__waiting = false;
      var info = T.find(id);
      if (info && info.app) fromApp(page, info); else inline(page, id);
    });
  }); };
  T.scan();
})();
