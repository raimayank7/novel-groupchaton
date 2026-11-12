/* GroupChatOn app (novel.groupchaton.com): the reading app for the GroupChatOn novels (chapters are written on the blog, BLOG below).
   - Novels and chapter lists: /data/novels.json (built every hour from the blog by scripts/build_data.py)
   - Chapter text: /c/<yyyy>/<mm>/<name>.json; every opened or downloaded chapter stays on the device (service worker)
   - Brand-new chapters: Blogger's own feed (JSONP), so they show up before the next hourly build
   - Your library, reading position and settings: this browser only (localStorage)
   - Old "Infinity App" records saved on this address: found and offered as one backup file for Infinity
   Designed & Developed by Nivesh Sahayak (https://www.niveshsahayak.in/). All rights reserved: see LICENSE. */
(function () {
  'use strict';
  var VERSION = '2026-11-12.94a7c54';
  var WWW = 'https://www.groupchaton.com', INF = 'https://infinity.groupchaton.com';
  var BLOG = 'https://groupchaton-novels.blogspot.com';   /* where chapters are written; www is the family's start page since Nov 2026 */
  var SELF = 'https://novel.groupchaton.com';
  var AD_CLIENT = 'ca-pub-5935207738848708', ADS = { top: '2358914532', inArticle: '2020003182', end: '2358914532', home: '3496736383' };
  var CH_CACHE = 'gcr-chapters';
  var doc = document, html = doc.documentElement, main = doc.getElementById('main');

  /* ---------------- small helpers ---------------- */
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function el(tag, a, kids) {
    var n = doc.createElement(tag);
    if (a) Object.keys(a).forEach(function (k) {
      var v = a[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null && c !== false) n.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c); });
    return n;
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var ICON = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    lib: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10v18H5.5A1.5 1.5 0 0 1 4 19.5z"/><path d="M14 3h4.5A1.5 1.5 0 0 1 20 4.5v15a1.5 1.5 0 0 1-1.5 1.5H14z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    aa: '<path d="M3 19 8 5l5 14M4.8 14h6.4"/><path d="M15 19l3-8 3 8M15.9 16.6h4.2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    prev: '<path d="m15 18-6-6 6-6"/>', next: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    down: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    install: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 7v7M9 11l3 3 3-3"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    off: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>'
  };
  function icon(name, label) {
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + ICON[name] + '</svg>' + (label ? '<span>' + label + '</span>' : '');
  }
  function fmtDate(s) {
    if (!s) return '';
    var d = new Date(s + 'T12:00:00');
    return isNaN(d) ? s : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function ago(s) {
    var days = Math.round((Date.now() - new Date(s + 'T12:00:00')) / 864e5);
    return days <= 0 ? 'today' : days === 1 ? 'yesterday' : days < 30 ? days + ' days ago' : fmtDate(s);
  }
  function bytes(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function plural(n, w) { return n.toLocaleString() + ' ' + w + (n === 1 ? '' : 's'); }
  function shortTitle(t) { return (t || '').replace(/\s*[:–—-]\s.*$/, '').trim() || t; }
  var toastTimer;
  function toast(msg, action, ms) {
    var t = $('#toast');
    t.innerHTML = '';
    t.appendChild(el('span', { text: msg }));
    if (action) t.appendChild(el('button', { type: 'button', text: action.label, onclick: function () { hide(); action.run(); } }));
    t.appendChild(el('button', { type: 'button', 'class': 'x', 'aria-label': 'Close', text: '✕', onclick: hide }));
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hide, ms || 4000);
    function hide() { t.classList.remove('is-on'); }
  }

  /* ---------------- reading settings (same as the site's Aa sheet) ---------------- */
  var DEFAULTS = { theme: 'auto', font: 'serif', size: 19, lh: 1.8, width: 'm', align: 'left' };
  var WIDTHS = { s: '600px', m: '700px', l: '820px' };
  var settings = Object.assign({}, DEFAULTS, store.get('gco-reader', {}));
  var darkMQ = matchMedia('(prefers-color-scheme: dark)');
  function curTheme() { return settings.theme === 'auto' ? (darkMQ.matches ? 'dark' : 'light') : settings.theme; }
  function applySettings() {
    html.setAttribute('data-theme', curTheme());
    html.setAttribute('data-font', settings.font);
    html.setAttribute('data-align', settings.align);
    html.style.setProperty('--rd-size', settings.size + 'px');
    html.style.setProperty('--rd-lh', settings.lh);
    html.style.setProperty('--rd-measure', WIDTHS[settings.width] || WIDTHS.m);
    if (settings.font === 'readable' && !$('#font-readable')) doc.head.appendChild(el('link', { id: 'font-readable', rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap' }));
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(doc.body).backgroundColor);
    var tb = $('#themeBtn');
    if (tb) { var dk = /dark|black/.test(curTheme()); tb.innerHTML = icon(dk ? 'sun' : 'moon'); tb.setAttribute('aria-label', dk ? 'Light mode' : 'Dark mode'); }
    $$('[data-set]').forEach(function (b) {
      var k = b.getAttribute('data-set'), cur = k === 'theme' ? curTheme() : String(settings[k]);
      b.setAttribute('aria-pressed', String(b.getAttribute('data-val') === cur));
    });
    $$('[data-size-out]').forEach(function (o) { o.textContent = settings.size + ' px'; });
    $$('[data-auto]').forEach(function (c) { c.checked = settings.theme === 'auto'; });
  }
  function saveSettings() { store.set('gco-reader', settings); applySettings(); }
  if (darkMQ.addEventListener) darkMQ.addEventListener('change', function () { if (settings.theme === 'auto') applySettings(); });
  function settingsPanel() {
    var b = el('div');
    function seg(key, options) {
      return el('div', { 'class': 'seg', role: 'group', 'aria-label': key }, options.map(function (o) {
        return el('button', { type: 'button', 'data-set': key, 'data-val': String(o[0]), text: o[1],
          onclick: function () { settings[key] = typeof DEFAULTS[key] === 'number' ? Number(o[0]) : o[0]; saveSettings(); } });
      }));
    }
    b.appendChild(el('div', { 'class': 'set-row' }, [el('span', { text: 'Theme' }),
      el('div', { 'class': 'swatches', role: 'group', 'aria-label': 'Theme' }, [['light', 'Light'], ['sepia', 'Sepia'], ['dark', 'Dark'], ['black', 'Black']].map(function (o) {
        return el('button', { type: 'button', 'class': 'sw-' + o[0], 'data-set': 'theme', 'data-val': o[0], text: o[1], onclick: function () { settings.theme = o[0]; saveSettings(); } });
      }))]));
    b.appendChild(el('label', { 'class': 'switch' }, [el('span', { text: 'Match my device (light / dark)' }),
      el('input', { type: 'checkbox', 'data-auto': '', onchange: function (e) { settings.theme = e.target.checked ? 'auto' : curTheme(); saveSettings(); } })]));
    b.appendChild(el('div', { 'class': 'set-row' }, [el('span', { text: 'Font' }), seg('font', [['serif', 'Book'], ['sans', 'Clean'], ['readable', 'Easy-read']])]));
    b.appendChild(el('div', { 'class': 'set-row' }, [el('span', { text: 'Text size' }), el('div', { 'class': 'stepper' }, [
      el('button', { type: 'button', 'aria-label': 'Smaller text', text: 'A−', onclick: function () { settings.size = Math.max(14, settings.size - 1); saveSettings(); } }),
      el('output', { 'data-size-out': '' }),
      el('button', { type: 'button', 'aria-label': 'Bigger text', text: 'A+', onclick: function () { settings.size = Math.min(30, settings.size + 1); saveSettings(); } })])]));
    b.appendChild(el('div', { 'class': 'set-row' }, [el('span', { text: 'Line spacing' }), seg('lh', [[1.55, 'Compact'], [1.8, 'Normal'], [2.05, 'Relaxed']])]));
    b.appendChild(el('div', { 'class': 'set-row' }, [el('span', { text: 'Page width' }), seg('width', [['s', 'Narrow'], ['m', 'Medium'], ['l', 'Wide']])]));
    b.appendChild(el('div', { 'class': 'set-row' }, [el('span', { text: 'Text alignment' }), seg('align', [['left', 'Left'], ['justify', 'Justified']])]));
    b.appendChild(el('button', { type: 'button', 'class': 'btn btn-sm', text: 'Reset to default', onclick: function () { settings = Object.assign({}, DEFAULTS); saveSettings(); } }));
    return b;
  }

  /* ---------------- sheets ---------------- */
  var backdrop = el('div', { 'class': 'backdrop', onclick: closeSheets });
  doc.body.appendChild(backdrop);
  var lastFocus;
  function sheet(title, bodyEl) {
    closeSheets();
    var s = el('section', { 'class': 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, tabindex: '-1' }, [
      el('div', { 'class': 'sheet-head' }, [el('h2', { text: title }), el('button', { type: 'button', 'class': 'icon-btn', 'aria-label': 'Close', html: icon('x'), onclick: closeSheets })]),
      el('div', { 'class': 'sheet-body' }, [bodyEl])]);
    doc.body.appendChild(s);
    lastFocus = doc.activeElement;
    applySettings();
    requestAnimationFrame(function () { s.classList.add('is-open'); backdrop.classList.add('is-open'); s.focus(); });
    return s;
  }
  function closeSheets() {
    var open = $$('.sheet');
    open.forEach(function (s) { s.classList.remove('is-open'); setTimeout(function () { s.remove(); }, 250); });
    backdrop.classList.remove('is-open');
    if (open.length && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheets(); });

  /* ---------------- data ---------------- */
  var DATA = null, dataP = null;
  function loadData() {
    if (dataP) return dataP;
    dataP = fetch('/data/novels.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
      d.byId = {};
      d.novels.forEach(function (n) {
        d.byId[n.id] = n;
        n.idx = {};
        n.chapters.forEach(function (c, i) { n.idx[c[0]] = i; });
      });
      DATA = d;
      freshFromBlog();
      return d;
    });
    dataP.catch(function () { dataP = null; });
    return dataP;
  }
  function novelOf(key) {
    if (!DATA) return null;
    for (var i = 0; i < DATA.novels.length; i++) if (key in DATA.novels[i].idx) return DATA.novels[i];
    return null;
  }
  function chapNo(t) { var m = (t || '').match(/^\s*(?:Chapter|Ch\.?)\s*(\d+)/i); return m ? m[1] : ''; }
  // brand-new chapters, straight from Blogger's feed (JSONP: the feed has no CORS headers)
  var freshDone = false;
  function freshFromBlog() {
    if (freshDone || !navigator.onLine) return;
    freshDone = true;
    var cb = '__gcoFresh' + Date.now();
    window[cb] = function (j) {
      delete window[cb];
      var changed = false;
      ((j.feed && j.feed.entry) || []).forEach(function (e) {
        var link = (e.link || []).filter(function (l) { return l.rel === 'alternate'; })[0];
        if (!link) return;
        var path = link.href.replace(/^https?:\/\/[^/]+/, ''), key = path.slice(1).replace(/\.html$/, '');
        DATA.novels.forEach(function (n) {
          if (!n.match || key in n.idx || !new RegExp(n.match).test(path)) return;
          n.chapters.push([key, e.title.$t.replace(/\s+/g, ' ').trim(), (e.published.$t || '').slice(0, 10), 0, 1]);
          n.chapters.sort(function (a, b) { return cmp(orderKey(a), orderKey(b)); });
          n.idx = {}; n.chapters.forEach(function (c, i) { n.idx[c[0]] = i; });
          n.count = n.chapters.length;
          DATA.latest.unshift([n.id, key, e.title.$t, (e.published.$t || '').slice(0, 10)]);
          changed = true;
        });
      });
      if (changed && route.name === 'home') render(null, true);
    };
    var s = el('script', { src: BLOG + '/feeds/posts/summary?alt=json-in-script&max-results=25&callback=' + cb, async: true });
    s.onerror = function () { delete window[cb]; };
    doc.head.appendChild(s);
  }
  function orderKey(c) {
    var ss = c[0].match(/ss(\d+)(?:_\d+)?$/);
    if (ss) return [1, +ss[1]];
    var m = c[1].match(/^\s*Chapter\s+(\d+)/i) || c[0].match(/(\d+)(?:_\d+)?$/);
    return [0, m ? +m[1] : 1e6];
  }
  function cmp(a, b) { return a[0] - b[0] || a[1] - b[1]; }

  /* reading history, position, library (this browser only) */
  function hist() { return store.get('gco-app-hist', {}); }
  function setHist(n, c, p) { var h = hist(); h[n.id] = { k: c[0], t: c[1], p: p || 0, at: Date.now() }; store.set('gco-app-hist', h); }
  function readSet(id) { return store.get('gco-app-read-' + id, []); }
  function markRead(id, key) { var r = readSet(id); if (r.indexOf(key) < 0) { r.push(key); store.set('gco-app-read-' + id, r.slice(-5000)); } }
  function follows() { return store.get('gco-app-follow', {}); }
  function isFollowing(id) { return !!follows()[id]; }
  function setFollow(n, on) {
    var f = follows();
    if (on) f[n.id] = { at: Date.now(), seen: n.chapters.length }; else delete f[n.id];
    store.set('gco-app-follow', f);
  }
  function seen(n) { var f = follows(); if (f[n.id]) { f[n.id].seen = n.chapters.length; store.set('gco-app-follow', f); } }
  function newCount(n) { var f = follows()[n.id]; return f ? Math.max(0, n.chapters.length - (f.seen || 0)) : 0; }
  function posOf(key) { return (store.get('gco-app-pos', {}))[key] || 0; }
  function setPos(key, p) {
    var m = store.get('gco-app-pos', {}); m[key] = Math.round(p * 1000) / 1000;
    var ks = Object.keys(m); if (ks.length > 400) ks.slice(0, ks.length - 400).forEach(function (k) { delete m[k]; });
    store.set('gco-app-pos', m);
  }

  /* chapters kept on the device */
  function chapterUrl(key) { return '/c/' + key + '.json'; }
  function offlineKeys() {
    if (!window.caches) return Promise.resolve({});
    return caches.open(CH_CACHE).then(function (c) { return c.keys(); }).then(function (reqs) {
      var o = {}; reqs.forEach(function (r) { var m = new URL(r.url).pathname.match(/^\/c\/(.+)\.json$/); if (m) o[m[1]] = 1; }); return o;
    }).catch(function () { return {}; });
  }
  function getChapter(key) {
    return fetch(chapterUrl(key)).then(function (r) {
      if (r.status === 404) { var e = new Error('missing'); e.missing = true; throw e; }
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }
  function download(n, from, count, onStep) {
    var list = n.chapters.slice(from, count ? from + count : undefined).filter(function (c) { return !c[4]; });
    var i = 0, ok = 0, stop = false;
    return caches.open(CH_CACHE).then(function (cache) {
      function nextOne() {
        if (stop || i >= list.length) return Promise.resolve();
        var c = list[i++];
        return cache.match(chapterUrl(c[0])).then(function (hit) {
          return hit || fetch(chapterUrl(c[0])).then(function (r) { if (r.ok) return cache.put(chapterUrl(c[0]), r); });
        }).then(function () { ok++; if (onStep) onStep(ok, list.length); }, function () { if (!navigator.onLine) stop = true; }).then(nextOne);
      }
      return Promise.all([nextOne(), nextOne(), nextOne()]);
    }).then(function () { return { ok: ok, total: list.length }; });
  }

  /* ---------------- ads (labelled, lazy, never beside buttons) ---------------- */
  var adsLoaded = false, adObs = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { adObs.unobserve(e.target); fillAd(e.target); } });
  }, { rootMargin: '500px 0px' }) : null;
  function adSlot(kind, slot) {
    if (!slot) return null;   // offline too: the space then shows a sponsor card
    var d = el('div', { 'class': 'ad-slot ' + kind, 'data-slot': slot, 'data-kind': kind });
    if (adObs) adObs.observe(d); else setTimeout(function () { fillAd(d); }, 0);
    return d;
  }
  function fillAd(d) {
    if (!navigator.onLine || adsBlocked) return promoFill(d);   // no Google ad possible: a sponsor card instead
    if (!adsLoaded) {
      adsLoaded = true;
      var sc = el('script', { async: true, crossorigin: 'anonymous', src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + AD_CLIENT });
      sc.onerror = function () { adsBlocked = true; [].forEach.call(doc.querySelectorAll('.ad-slot:not(.is-promo)'), promoFill); };   // blocked or offline
      doc.head.appendChild(sc);
    }
    var ins = el('ins', { 'class': 'adsbygoogle', style: 'display:block', 'data-ad-client': AD_CLIENT, 'data-ad-slot': d.getAttribute('data-slot') });
    if (d.getAttribute('data-kind') === 'in-article') { ins.setAttribute('data-ad-layout', 'in-article'); ins.setAttribute('data-ad-format', 'fluid'); }
    else { ins.setAttribute('data-ad-format', 'auto'); ins.setAttribute('data-full-width-responsive', 'false'); }
    d.appendChild(ins);
    if (window.MutationObserver) new MutationObserver(function (m, o) {
      var st = ins.getAttribute('data-ad-status');
      if (/^unfill/.test(st || '')) { promoFill(d); o.disconnect(); } else if (st === 'filled') o.disconnect();
    }).observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    // no real ad after a while (ad blocker with a fake ad script, slow or filtered network): the sponsor card takes the space
    setTimeout(function () { if (ins.getAttribute('data-ad-status') !== 'filled') promoFill(d); }, 8000);
  }

  /* ---------------- sponsor cards: fill an ad space that stays empty (offline, blocked, no ad) ----------------
     The list is data/promos.json (copied hourly from Share's sponsor list); the offline script keeps it and its pictures. */
  var adsBlocked = false, promos = null, promoUsed = [];
  var PROMO_ICONS = { coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M7 2v3M11 2v3M15 2v3"/></svg>' };
  var inIndia = (function () { try { return /^Asia\/(Kolkata|Calcutta)$/.test(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch (e) { return false; } })();
  function getPromos() {
    return promos || (promos = fetch('/data/promos.json').then(function (r) { return r.json(); })
      .then(function (P) { return ((P && P.promos) || []).filter(function (x) { return x.href && ((x.imgs && x.imgs.length) || x.icon || x.img_icon) && x.family !== 'novels' && (inIndia || !x.india); }); })
      .catch(function () { promos = null; return []; }));
  }
  function promoFill(d) {
    if (!d || d.classList.contains('is-promo')) return;
    // ad blockers hide every box named ad-slot, so the box changes its name before the card goes in
    d.classList.remove('ad-slot'); d.classList.add('pk-slot', 'is-promo');
    getPromos().then(function (list) {
      if (!list.length) { d.classList.add('is-empty'); return; }
      var fresh = list.filter(function (x) { return promoUsed.indexOf(x.href) < 0; });
      if (!fresh.length) { promoUsed = []; fresh = list; }
      var x = fresh[Math.floor(Math.random() * fresh.length)];
      promoUsed.push(x.href);
      d.innerHTML = '';
      if (x.own) d.classList.add('is-own');   // our own card (Ko-fi): labelled "From GroupChatOn", not a sponsored link
      if (x.tag) d.setAttribute('data-tag', x.tag); else d.removeAttribute('data-tag');   // its own label (e.g. "From Nivesh Sahayak")
      var pic = x.imgs && x.imgs.length ? el('img', { src: x.imgs[Math.floor(Math.random() * x.imgs.length)], alt: x.title || '', loading: 'lazy', width: 336, height: 280 })
        : x.img_icon ? el('img', { 'class': 'promo-ic is-mark', src: x.img_icon, alt: '', width: 64, height: 64, loading: 'lazy' })
        : el('span', { 'class': 'promo-ic', 'aria-hidden': 'true', html: PROMO_ICONS[x.icon] || '' });
      d.appendChild(el('a', { 'class': 'promo-card', href: x.href, target: '_blank', rel: x.own ? 'noopener' : 'sponsored noopener' }, [
        pic,
        el('b', { text: x.title || '' }),
        x.line ? el('span', { text: x.line }) : null,
        el('em', { text: x.cta || 'Learn more' }), x.small ? el('small', { text: x.small }) : null]));
    });
  }

  /* ---------------- install ---------------- */
  var installEvt = null;
  var installed = html.classList.contains('is-installed');
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; drawTop(); fillInstall(); });
  window.addEventListener('appinstalled', function () { installEvt = null; installed = true; toast('GroupChatOn is installed. Open it from your home screen.'); drawTop(); });
  function canInstall() { return !installed && (installEvt || isIOS); }
  function install() {
    if (installEvt) {
      installEvt.prompt();
      installEvt.userChoice.then(function (c) { if (c.outcome === 'accepted') installEvt = null; drawTop(); });
      return;
    }
    var steps = el('div', {}, [
      el('p', { text: isIOS ? 'On iPhone and iPad, install from Safari:' : 'Your browser installs apps from its menu:' }),
      el('ol', { 'class': 'steps' }, (isIOS ? ['Tap the Share button (the square with an arrow) at the bottom of Safari.', 'Scroll down and tap “Add to Home Screen”.', 'Tap “Add”. GroupChatOn now opens from your home screen like any app.']
        : ['Open the browser menu (⋮ or ⋯) at the top right.', 'Choose “Install app”, “Install GroupChatOn” or “Add to Home screen”.', 'Confirm. GroupChatOn now opens from your home screen or desktop like any app.']).map(function (t) { return el('li', { text: t }); }))]);
    sheet('Install GroupChatOn', steps);
  }

  /* ---------------- old Infinity App records (same address, so they are still on this device) ---------------- */
  var OLD = { money: 'Money Manager', books: 'Book Keeper and Statement Generator', invoice: 'Invoice Generator', 'wa-catalog': 'WhatsApp Price List Maker', stock: 'Stock Register',
    attendance: 'Attendance Register', salary: 'Staff Salary Register', hisab: 'Milk and Daily Hisab', rent: 'Rent Tracker for Landlords', lend: 'Lend and Borrow Tracker',
    bills: 'Bill and Renewal Reminders', customers: 'Customer Book (Mini CRM)', shagun: 'Shagun and Gift Register', kitty: 'Kitty and Committee Tracker', portfolio: 'Investment Portfolio Tracker',
    health: 'BP, Sugar and Weight Log', meds: 'Medicine Schedule and Reminders', vehicle: 'Vehicle Fuel and Service Log', diary: 'Private Diary (Encrypted)', workout: 'Gym and Workout Log',
    reading: 'Books and Reading Log', recipes: 'My Recipe Book', study: 'Study Planner and Exam Countdown', 'credit-note': 'Credit Note Generator', 'gst-register': 'GST Register', habits: 'Habit Tracker',
    'daily-expense': 'Daily Expense Tracker', 'study-notepad': 'Study Notepad', 'study-todo': 'Study To-do List' };
  var VPRE = 'gco-vault-';
  function oldName(n) { return OLD[n] || n.replace(/[-_]/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }); }
  var oldP = null;
  function oldRecords() {   // → { vaults: {name: data}, settings: {key: string} }; never changes or deletes anything
    if (oldP) return oldP;
    var out = { vaults: {}, settings: {} };
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf(VPRE) === 0) try { out.vaults[k.slice(VPRE.length)] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
        else if (k.indexOf('gco-tool-') === 0) out.settings[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    oldP = new Promise(function (ok) {
      if (!window.indexedDB) return ok(out);
      var created = false, r;
      try { r = indexedDB.open('gco-records'); } catch (e) { return ok(out); }
      r.onupgradeneeded = function () { created = true; r.transaction.abort(); };   // no old database: don't create one
      r.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); ok(out); };
      r.onblocked = function () { ok(out); };
      r.onsuccess = function () {
        var db = r.result;
        if (created || !db.objectStoreNames.contains('vault')) { db.close(); return ok(out); }
        var tx = db.transaction('vault', 'readonly'), st = tx.objectStore('vault'), cur = st.openCursor();
        cur.onsuccess = function () {
          var c = cur.result;
          if (!c) return;
          if (String(c.key).indexOf(VPRE) === 0) out.vaults[String(c.key).slice(VPRE.length)] = c.value;
          c['continue']();
        };
        tx.oncomplete = function () { db.close(); ok(out); };
        tx.onerror = tx.onabort = function () { db.close(); ok(out); };
      };
    });
    return oldP;
  }
  function recCount(d) { var n = 0; if (d && typeof d === 'object') Object.keys(d).forEach(function (k) { if (Array.isArray(d[k])) n += d[k].length; }); return n; }
  function hasOld(o) { return Object.keys(o.vaults).some(function (n) { var d = o.vaults[n]; return d && (recCount(d) > 0 || JSON.stringify(d).length > 40); }); }
  function readAs(blob) { return new Promise(function (ok, fail) { var fr = new FileReader(); fr.onload = function () { ok(fr.result); }; fr.onerror = function () { fail(fr.error); }; fr.readAsDataURL(blob); }); }
  function toPlain(x) {   // photos and files become data URLs, exactly like Infinity's own backups
    if (x instanceof Blob) return readAs(x).then(function (u) { return { __blob: u }; });
    if (Array.isArray(x)) return Promise.all(x.map(toPlain));
    if (x && typeof x === 'object') { var ks = Object.keys(x); return Promise.all(ks.map(function (k) { return toPlain(x[k]); })).then(function (vs) { var o = {}; ks.forEach(function (k, i) { o[k] = vs[i]; }); return o; }); }
    return Promise.resolve(x);
  }
  function oldBackup(o) {   // the "Back up everything" format that Infinity's My Data tool restores
    var names = Object.keys(o.vaults), plain = {};
    return Promise.all(names.map(function (n) { return toPlain(o.vaults[n]).then(function (p) { plain[n] = p; }); })).then(function () {
      var j = { tool: '*all*', app: 'Infinity by GroupChatOn', saved: new Date().toISOString(), vaults: plain, settings: o.settings };
      return new File([JSON.stringify(j, null, 1)], 'infinity-all-backup-' + new Date().toISOString().slice(0, 10) + '.json', { type: 'application/json' });
    });
  }
  function saveFile(f) {
    var a = el('a', { href: URL.createObjectURL(f), download: f.name });
    doc.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }

  /* ---------------- router ---------------- */
  var route = { name: 'home' };
  function parse(path, search) {
    var m;
    if ((m = path.match(/^\/read\/(\d{4}\/\d{2}\/[\w.-]+?)\/?$/))) return { name: 'read', key: m[1] };
    if ((m = path.match(/^\/novel\/([\w-]+)\/?$/))) return { name: 'novel', id: m[1] };
    if (/^\/library\/?$/.test(path)) return { name: 'library' };
    if (/^\/search\/?$/.test(path)) return { name: 'search', q: new URLSearchParams(search).get('q') || '' };
    if (/^\/settings\/?$/.test(path)) return { name: 'settings' };
    if (/^\/old-records\/?$/.test(path)) return { name: 'old' };
    if ((m = path.match(/^\/t\/([\w-]+)/))) return { name: 'moved', id: m[1] };
    // a blog address pasted or shared into the app: /2025/02/chd1.html
    if ((m = path.match(/^\/(\d{4}\/\d{2}\/[\w.-]+)\.html$/))) return { name: 'read', key: m[1], replace: true };
    return { name: path === '/' || path === '/index.html' ? 'home' : 'notfound' };
  }
  function go(href, replace) {
    var u = new URL(href, location.href);
    if (u.origin !== location.origin) { location.href = href; return; }
    if (u.pathname + u.search === location.pathname + location.search && !replace) { window.scrollTo(0, 0); return; }
    saveScroll();
    history[replace ? 'replaceState' : 'pushState']({}, '', u.pathname + u.search + u.hash);
    start(true);
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || /^\/(t|c|data|brand)\//.test(u.pathname) || /\.(json|txt|xml|png|jpg)$/.test(u.pathname)) return;
    e.preventDefault();
    closeSheets();
    go(a.href);
  });
  window.addEventListener('popstate', function () { start(false); });
  var scrolls = {};
  function saveScroll() { scrolls[location.pathname + location.search] = window.scrollY; }
  history.scrollRestoration = 'manual';

  function setMeta(title, desc, canon) {
    doc.title = title ? title + ' · GroupChatOn' : 'GroupChatOn: read Korean web novels in the app';
    var d = $('meta[name="description"]'); if (d && desc) d.setAttribute('content', desc);
    var c = $('#canon'); if (c) c.href = canon || 'https://novel.groupchaton.com/';
    var r = $('meta[name="robots"]');
    var index = route.name === 'home' || route.name === 'read' || route.name === 'novel';   // home, novel and chapter pages are this site's own pages (in sitemap.xml)
    if (index && r) r.remove();
    if (!index && !r) doc.head.appendChild(el('meta', { name: 'robots', content: 'noindex' }));
  }

  function drawTop() {
    var tabs = $('#tabs'), cur = route.name;
    tabs.innerHTML = '';
    [['/', 'home', 'Home', 'home'], ['/library/', 'lib', 'Library', 'library'], ['/search/', 'search', 'Search', 'search'], ['/settings/', 'gear', 'Settings', 'settings']].forEach(function (t) {
      var a = el('a', { href: t[0], html: icon(t[1], t[2]) });
      if (cur === t[3] || (t[3] === 'library' && cur === 'old')) a.setAttribute('aria-current', 'page');
      tabs.appendChild(a);
    });
    var act = $('#topAct');
    act.innerHTML = '';
    if (canInstall()) act.appendChild(el('button', { type: 'button', 'class': 'icon-btn', 'aria-label': 'Install the app', title: 'Install the app', html: icon('install'), onclick: install }));
    if (cur === 'read') {
      act.appendChild(el('button', { type: 'button', 'class': 'icon-btn', 'aria-label': 'Chapter list', title: 'Chapters', html: icon('list'), onclick: function () { if (route.toc) route.toc(); } }));
      act.appendChild(el('button', { type: 'button', 'class': 'icon-btn', 'aria-label': 'Reading settings', title: 'Reading settings', html: icon('aa'), onclick: function () { sheet('Reading settings', settingsPanel()); } }));
    } else {
      act.appendChild(el('button', { type: 'button', id: 'themeBtn', 'class': 'icon-btn', onclick: function () {
        settings.theme = /dark|black/.test(curTheme()) ? 'light' : 'dark'; saveSettings(); } }));
    }
    applySettings();
  }

  var renderId = 0;
  function start(fromClick) {
    route = parse(location.pathname, location.search);
    if (route.replace) { history.replaceState({}, '', '/read/' + route.key + '/'); }
    if (location.hash && location.pathname === '/' && /^#[\w-]+$/.test(location.hash)) {   // old Infinity App shortcuts: /#money-manager
      location.replace('/t/' + location.hash.slice(1) + '/');
      return;
    }
    render(fromClick);
  }
  function render(fromClick, quiet) {
    var id = ++renderId;
    closeSheets();
    doc.body.classList.toggle('is-reading', route.name === 'read');
    $('#top').classList.remove('is-hidden');
    drawTop();
    var fn = PAGES[route.name] || PAGES.notfound;
    var out = fn(route);
    Promise.resolve(out).then(function (node) {
      if (id !== renderId || !node) return;
      main.innerHTML = '';
      main.appendChild(node);
      if (!quiet) { main.classList.remove('is-in'); void main.offsetWidth; main.classList.add('is-in'); }
      var y = quiet ? window.scrollY : fromClick === false ? scrolls[location.pathname + location.search] : 0;
      if (route.after) { var a = route.after; route.after = null; a(); }
      else window.scrollTo(0, y || 0);
      if (fromClick) main.focus({ preventScroll: true });
    }, function (e) {
      if (id !== renderId) return;
      main.innerHTML = '';
      main.appendChild(errorBox(e));
    });
  }
  function skeleton() {
    return el('div', { 'class': 'wrap', 'aria-busy': 'true' }, [el('div', { 'class': 'sk sk-title' }), el('div', { 'class': 'sk sk-line' }), el('div', { 'class': 'sk sk-line', style: 'width:70%' })]);
  }
  function errorBox(e) {
    var off = !navigator.onLine;
    return el('div', { 'class': 'wrap' }, [el('h1', { text: off ? 'You are offline' : 'Something did not load' }),
      el('p', { text: off ? 'Connect to the internet to see novels and chapters you have not opened yet. Chapters you opened or downloaded are in your Library.'
        : 'Please try again in a moment. (' + (e && e.message || e) + ')' }),
      el('div', { 'class': 'row' }, [el('button', { type: 'button', 'class': 'btn btn-primary', text: 'Try again', onclick: function () { dataP = null; render(); } }),
        el('a', { 'class': 'btn', href: '/library/', text: 'Open Library' })])]);
  }
  function footer() {
    return el('footer', { 'class': 'foot' }, [
      el('div', { 'class': 'links', style: 'justify-content:center' }, [
        el('a', { href: WWW + '/', text: 'www.groupchaton.com' }), el('a', { href: WWW + '/p/privacy-policy.html', text: 'Privacy policy' }),
        el('a', { href: WWW + '/p/disclaimer.html', text: 'Disclaimer' }), el('a', { href: WWW + '/p/contact-us.html?from=app', text: 'Contact' })]),
      el('p', { html: '© ' + new Date().getFullYear() + ' GroupChatOn. All rights reserved. · Designed &amp; Developed by: <a href="https://www.niveshsahayak.in/" rel="noopener" target="_blank">Nivesh Sahayak</a>' })]);
  }
  // Blogger serves any size of a picture: ask for a small one instead of the 1600px original
  function coverUrl(u, w) { return (u || '').replace(/\/(s\d+(-c)?|w\d+(-h\d+)?(-[a-z]+)*)\/([^/]+)$/, '/w' + w + '/$5'); }
  function cover(n, cls, w, eager) { return el('img', { 'class': cls || '', src: coverUrl(n.cover, w || 320), alt: '', loading: eager ? 'eager' : 'lazy', decoding: 'async', width: '200', height: '300' }); }
  function novelName(n) { return n.title + (n.part ? ' · ' + n.part : ''); }

  /* ---------------- pages ---------------- */
  var PAGES = {};

  PAGES.home = function () {
    setMeta('', 'The GroupChatOn app: read every GroupChatOn novel, follow your favourites, continue where you stopped and keep chapters for offline reading.');
    return Promise.all([loadData(), oldRecords()]).then(function (r) {
      var d = r[0], w = el('div', { 'class': 'wrap' });
      if (hasOld(r[1]) && !store.get('gco-app-old-hide', false)) w.appendChild(oldBanner(r[1]));
      w.appendChild(el('div', { 'class': 'hello' }, [el('div', {}, [el('h1', { text: 'Read Korean web novels' }), el('p', { text: 'Translated into English. ' + plural(d.novels.reduce(function (a, n) { return a + n.chapters.length; }, 0), 'chapter') + ' to read, free.' })]),
        navigator.onLine ? null : el('span', { 'class': 'offline-pill', text: 'Offline' })]));
      // continue reading: the most recent book
      var h = hist(), last = Object.keys(h).map(function (k) { return [k, h[k]]; }).filter(function (x) { return d.byId[x[0]]; }).sort(function (a, b) { return b[1].at - a[1].at; })[0];
      if (last) w.appendChild(contCard(d.byId[last[0]], last[1]));
      w.appendChild(el('h2', { text: 'Novels' }));
      var g = el('div', { 'class': 'grid' });
      d.novels.forEach(function (n) {
        var nw = newCount(n), newest = n.chapters.reduce(function (a, c) { return c[2] > a ? c[2] : a; }, '');
        g.appendChild(el('a', { 'class': 'nv', href: '/novel/' + n.id + '/' }, [
          el('div', { 'class': 'nv-cover' }, [cover(n, '', 320, true), nw ? el('span', { 'class': 'nv-badge', text: nw + ' new' }) : null]),
          el('span', { 'class': 'nv-title', text: novelName(n) }),
          el('span', { 'class': 'nv-meta', text: plural(n.chapters.length, 'chapter') + ' · ' + ago(newest) })]));
      });
      w.appendChild(g);
      var ad = adSlot('home', ADS.home); if (ad) w.appendChild(ad);
      w.appendChild(el('h2', { text: 'Latest chapters' }));
      var ul = el('ul', { 'class': 'list' });
      d.latest.slice(0, 20).forEach(function (x) {
        var n = d.byId[x[0]]; if (!n) return;
        ul.appendChild(el('li', {}, [el('a', { href: '/read/' + x[1] + '/' }, [cover(n), el('span', { 'class': 't' }, [el('b', { text: x[2] }), el('small', { text: novelName(n) })]), el('span', { 'class': 'r', text: ago(x[3]) })])]));
      });
      w.appendChild(ul);
      w.appendChild(el('div', { id: 'installSlot' }));
      setTimeout(fillInstall, 0);
      w.appendChild(footer());
      return w;
    });
  };
  function fillInstall() {
    var slot = $('#installSlot');
    if (!slot || slot.firstChild || !canInstall()) return;
    slot.appendChild(el('div', { 'class': 'card install-card', style: 'margin-top:32px' }, [
        el('img', { src: '/brand/favicon-192.png', alt: '', width: '56', height: '56' }),
        el('div', {}, [el('b', { text: 'Install GroupChatOn' }), el('p', { 'class': 'muted', style: 'margin:2px 0 0', text: 'Opens from your home screen, full screen, and keeps chapters for offline reading.' })]),
        el('button', { type: 'button', 'class': 'btn btn-primary', html: icon('install', 'Install'), onclick: install })]));
  }
  function resume(n, h) {
    var i = n.idx[h.k];
    if (i == null) return null;
    if (h.p > 0.97 && i < n.chapters.length - 1) { var c = n.chapters[i + 1]; return { k: c[0], t: c[1], p: 0, i: i + 1 }; }
    return { k: h.k, t: h.t, p: h.p, i: i };
  }
  function contCard(n, h) {
    h = resume(n, h) || h;
    var i = n.idx[h.k], pct = n.chapters.length ? Math.round(((i || 0) + (h.p || 0)) / n.chapters.length * 100) : 0;
    return el('a', { 'class': 'cont', href: '/read/' + h.k + '/' }, [cover(n),
      el('span', { style: 'flex:1;min-width:0' }, [el('small', { text: 'Continue reading' }), el('b', { text: novelName(n) }), el('small', { text: h.t }),
        el('span', { 'class': 'bar', 'aria-label': pct + '% of the novel' }, [el('span', { style: 'width:' + pct + '%' })])]),
      el('span', { 'class': 'go', html: icon('next') })]);
  }
  function oldBanner(o) {
    var n = Object.keys(o.vaults).length;
    return el('div', { 'class': 'note warn', style: 'margin:0 0 20px' }, [
      el('p', {}, [el('b', { text: 'Your records from the old Infinity App are still here. ' }), 'This address is now the GroupChatOn reading app; the record tools moved to Infinity. Save your ' + plural(n, 'tool') + '’ records in one file and open them there.']),
      el('div', { 'class': 'row' }, [el('a', { 'class': 'btn btn-primary btn-sm', href: '/old-records/', html: icon('box', 'Save my old records') })])]);
  }

  PAGES.novel = function (r) {
    return loadData().then(function (d) {
      var n = d.byId[r.id];
      if (!n) return PAGES.notfound();
      setMeta(novelName(n), 'Read ' + novelName(n) + ' in the GroupChatOn app: ' + n.chapters.length + ' chapters.', SELF + location.pathname);
      seen(n);
      var w = el('div', { 'class': 'wrap' }), h = hist()[n.id], read = readSet(n.id), readMap = {};
      read.forEach(function (k) { readMap[k] = 1; });
      w.appendChild(el('nav', { 'class': 'crumb', 'aria-label': 'Breadcrumb' }, [el('a', { href: '/', text: 'Home' }), '›', el('span', { text: n.short || n.title })]));
      var newest = n.chapters.reduce(function (a, c) { return c[2] > a ? c[2] : a; }, '');
      var words = n.chapters.reduce(function (a, c) { return a + (c[3] || 0); }, 0);
      var actions = el('div', { 'class': 'actions' });
      var first = n.chapters[0];
      var rs = h && resume(n, h);
      if (rs) h = rs;
      if (rs) {
        actions.appendChild(el('a', { 'class': 'btn btn-primary', href: '/read/' + h.k + '/', text: 'Continue: ' + shortTitle(h.t) }));
        if (first) actions.appendChild(el('a', { 'class': 'btn', href: '/read/' + first[0] + '/', text: 'Start over' }));
      } else if (first) actions.appendChild(el('a', { 'class': 'btn btn-primary', href: '/read/' + first[0] + '/', text: 'Start reading' }));
      var fb = el('button', { type: 'button', 'class': 'btn', onclick: function () {
        var on = !isFollowing(n.id); setFollow(n, on); drawFollow();
        toast(on ? 'Added to your Library. New chapters show a badge.' : 'Removed from your Library.');
      } });
      function drawFollow() { var on = isFollowing(n.id); fb.innerHTML = icon(on ? 'check' : 'plus', on ? 'In Library' : 'Add to Library'); fb.setAttribute('aria-pressed', String(on)); }
      drawFollow();
      actions.appendChild(fb);
      if (window.caches) actions.appendChild(el('button', { type: 'button', 'class': 'btn', html: icon('down', 'Download'), onclick: function () { downloadSheet(n); } }));
      w.appendChild(el('div', { 'class': 'hero' }, [cover(n, '', 480, true), el('div', {}, [
        el('h1', { text: novelName(n) }),
        n.alt ? el('p', { 'class': 'alt', text: 'Also known as: ' + n.alt }) : null,
        el('div', { 'class': 'genres' }, (n.genres || []).map(function (g) { return el('span', { 'class': 'chip', text: g }); })),
        el('div', { 'class': 'stats' }, [el('span', { text: plural(n.chapters.length, 'chapter') }), newest ? el('span', { text: 'Updated ' + fmtDate(newest) }) : null,
          read.length ? el('span', { text: read.length + ' read' }) : null, words ? el('span', { text: 'about ' + Math.round(words / 230 / 60) + ' hours of reading' }) : null])]), actions]));
      if (n.summary) {
        var sum = el('div', { 'class': 'summary' }, n.summary.split('\n').map(function (p) { return el('p', { text: p }); }));
        w.appendChild(sum);
        if (n.summary.length > 420) {
          sum.classList.add('is-short');
          w.appendChild(el('button', { type: 'button', 'class': 'more', text: 'Read more', onclick: function (e) { var s = sum.classList.toggle('is-short'); e.target.textContent = s ? 'Read more' : 'Show less'; } }));
        }
      }
      var ad = adSlot('in-article', ADS.inArticle); if (ad) w.appendChild(ad);
      w.appendChild(el('h2', { id: 'chapters', text: 'Chapters' }));
      var holder = el('div');
      w.appendChild(holder);
      offlineKeys().then(function (off) { holder.appendChild(tocBox(n, h && h.k, readMap, off)); });
      
      w.appendChild(footer());
      return w;
    });
  };
  function tocBox(n, cur, readMap, off, onPick) {
    var box = el('div'), desc = false;
    var q = el('input', { 'class': 'field', type: 'search', placeholder: 'Find a chapter: number or words', 'aria-label': 'Find a chapter', enterkeyhint: 'search' });
    var sortB = el('button', { type: 'button', 'class': 'btn btn-sm', text: 'Newest first', onclick: function () { desc = !desc; sortB.textContent = desc ? 'Oldest first' : 'Newest first'; draw(); } });
    var ul = el('ol', { 'class': 'toc' });
    box.appendChild(el('div', { 'class': 'toc-tools' }, [q, sortB]));
    box.appendChild(ul);
    var latest = n.chapters.reduce(function (a, c) { return c[2] > a ? c[2] : a; }, '');
    function draw() {
      var s = q.value.trim().toLowerCase(), num = /^\d+$/.test(s) ? s : '';
      ul.innerHTML = '';
      var list = n.chapters.slice();
      if (desc) list.reverse();
      var frag = doc.createDocumentFragment(), shown = 0;
      list.forEach(function (c) {
        if (s && !(num ? chapNo(c[1]) === num || c[0].match(/(\d+)$/) && c[0].match(/(\d+)$/)[1] === num : c[1].toLowerCase().indexOf(s) >= 0)) return;
        shown++;
        var li = el('li', { 'class': (readMap[c[0]] ? 'is-read ' : '') + (c[0] === cur ? 'is-cur' : '') }, [
          el('a', { href: '/read/' + c[0] + '/', onclick: onPick || null }, [el('span', { 'class': 'n', text: c[1] }),
            c[2] === latest && !readMap[c[0]] ? el('span', { 'class': 'new', text: 'NEW' }) : null,
            off[c[0]] ? el('span', { 'class': 'off', title: 'On this device', 'aria-label': 'On this device', html: icon('check') }) : null,
            el('span', { 'class': 'd', text: fmtDate(c[2]) })])]);
        frag.appendChild(li);
      });
      if (!shown) frag.appendChild(el('li', {}, [el('div', { 'class': 'li muted', text: 'No chapter matches “' + q.value + '”.' })]));
      ul.appendChild(frag);
    }
    q.addEventListener('input', draw);
    draw();
    box.scrollToCur = function () { var c = $('.is-cur', ul); if (c) c.scrollIntoView({ block: 'center' }); };
    return box;
  }
  function downloadSheet(n) {
    var h = hist()[n.id], from = h && n.idx[h.k] != null ? n.idx[h.k] : 0;
    var avg = n.chapters.reduce(function (a, c) { return a + (c[3] || 2500); }, 0) / Math.max(1, n.chapters.length) * 6.2;
    var b = el('div'), status = el('p', { 'class': 'muted', role: 'status' });
    function opt(label, sub, start, count) {
      return el('button', { type: 'button', 'class': 'opt', onclick: function () {
        if (!navigator.onLine) { status.textContent = 'You are offline. Connect to the internet to download.'; return; }
        $$('.opt', b).forEach(function (x) { x.disabled = true; });
        status.textContent = 'Starting…';
        download(n, start, count, function (i, t) { status.textContent = 'Saved ' + i + ' of ' + t + ' chapters…'; }).then(function (r) {
          status.textContent = r.ok === r.total ? 'Done: ' + plural(r.ok, 'chapter') + ' saved on this device. They open without internet.' : 'Saved ' + r.ok + ' of ' + r.total + '. Try again to get the rest.';
          $$('.opt', b).forEach(function (x) { x.disabled = false; });
          toast('Saved ' + plural(r.ok, 'chapter') + ' for offline reading.');
        });
      } }, [el('b', { text: label }), el('small', { text: sub })]);
    }
    var left = n.chapters.length - from;
    b.appendChild(el('p', { text: 'Saved chapters open without internet, on this device only. Chapters you open are saved by themselves too.' }));
    b.appendChild(opt('Next 10 chapters', 'From ' + shortTitle(n.chapters[from][1]) + ' · about ' + bytes(avg * Math.min(10, left)), from, 10));
    b.appendChild(opt('Next 50 chapters', 'About ' + bytes(avg * Math.min(50, left)), from, 50));
    b.appendChild(opt('The whole novel', plural(n.chapters.length, 'chapter') + ' · about ' + bytes(avg * n.chapters.length), 0, 0));
    b.appendChild(status);
    sheet('Download for offline', b);
  }

  PAGES.read = function (r) {
    return loadData().then(function (d) {
      var n = novelOf(r.key);
      var i = n ? n.idx[r.key] : -1, c = n ? n.chapters[i] : null;
      var w = el('article', { 'class': 'reader' });
      var prev = n && i > 0 ? n.chapters[i - 1] : null, next = n && i < n.chapters.length - 1 ? n.chapters[i + 1] : null;
      setMeta(c ? c[1] + (n ? ' · ' + n.title : '') : 'Chapter', c && n ? 'Read ' + n.title + ' ' + c[1] + ' in the GroupChatOn app.' : '', SELF + location.pathname);
      if (n) w.appendChild(el('nav', { 'class': 'crumb', 'aria-label': 'Breadcrumb' }, [el('a', { href: '/', text: 'Home' }), '›', el('a', { href: '/novel/' + n.id + '/', text: n.short || n.title })]));
      var title = el('h1', { 'class': 'rd-title', text: c ? c[1] : 'Loading…' });
      var meta = el('div', { 'class': 'rd-meta' });
      var text = el('div', { 'class': 'rd-text' }, [el('div', { 'class': 'sk sk-line' }), el('div', { 'class': 'sk sk-line' }), el('div', { 'class': 'sk sk-line', style: 'width:60%' })]);
      w.appendChild(title); w.appendChild(meta);
      var top = adSlot('ad-top', ADS.top);
      w.appendChild(text);
      // reading toolbar at the bottom
      var bar = el('div', { 'class': 'rd-bar', role: 'toolbar', 'aria-label': 'Chapter' });
      var pct = el('span', { 'class': 'pct', text: '0%' });
      function navBtn(ch, dir) {
        var b = el('a', { 'class': 'icon-btn', href: ch ? '/read/' + ch[0] + '/' : '#', 'aria-label': dir === 'prev' ? 'Previous chapter' : 'Next chapter', html: icon(dir, dir === 'prev' ? 'Prev' : 'Next') });
        if (!ch) { b.setAttribute('aria-disabled', 'true'); b.style.opacity = '.4'; b.addEventListener('click', function (e) { e.preventDefault(); }); }
        return b;
      }
      bar.appendChild(navBtn(prev, 'prev'));
      bar.appendChild(el('button', { type: 'button', 'class': 'icon-btn', 'aria-label': 'Chapter list', html: icon('list'), onclick: function () { openToc(); } }));
      bar.appendChild(pct);
      bar.appendChild(el('button', { type: 'button', 'class': 'icon-btn', 'aria-label': 'Reading settings', html: icon('aa'), onclick: function () { sheet('Reading settings', settingsPanel()); } }));
      bar.appendChild(navBtn(next, 'next'));
      w.appendChild(bar);
      function openToc() {
        if (!n) return;
        var rm = {}; readSet(n.id).forEach(function (k) { rm[k] = 1; });
        offlineKeys().then(function (off) {
          var box = tocBox(n, r.key, rm, off, function () { closeSheets(); });
          sheet(novelName(n), box);
          setTimeout(box.scrollToCur, 260);
        });
      }
      route.toc = openToc;

      getChapter(r.key).then(function (ch) {
        if (!c) { c = [r.key, ch.t, ch.d, ch.w]; title.textContent = ch.t; }
        meta.innerHTML = '';
        if (n) meta.appendChild(el('span', { text: novelName(n) }));
        meta.appendChild(el('span', { text: fmtDate(ch.d) }));
        if (ch.w) meta.appendChild(el('span', { text: Math.max(1, Math.round(ch.w / 230)) + ' min read' }));
        text.innerHTML = ch.h;
        var credits = buildCredits(text);
        if (top) w.insertBefore(top, text);
        // in-article ads at paragraph breaks, about every 900 words, at most 3, never in the last 350 words
        var total = ch.w || 0, every = 900, count = 0, seenW = 0;
        if (total > every * 1.3) $$(':scope > p', text).some(function (p) {
          seenW += (p.textContent.trim().split(/\s+/).length);
          if (seenW >= every * (count + 1) && total - seenW > 350) { var s = adSlot('in-article', ADS.inArticle); if (s) { p.parentNode.insertBefore(s, p.nextSibling); count++; } }
          return count >= 3;
        });
        var endAd = adSlot('ad-end', ADS.end);
        if (endAd) w.insertBefore(endAd, bar);
        if (credits) w.insertBefore(credits, bar);
        w.insertBefore(endNav(n, next, prev), bar);
        if (n) {
          var p0 = posOf(r.key);
          setHist(n, c, p0);
          if (p0 > 0.03 && p0 < 0.97) {
            route.after = null;
            requestAnimationFrame(function () {
              window.scrollTo(0, p0 * (doc.documentElement.scrollHeight - innerHeight));
              toast('Back where you stopped.', { label: 'Start of chapter', run: function () { window.scrollTo(0, 0); } }, 5000);
            });
          }
          if (next && !next[4] && navigator.onLine && window.caches) caches.open(CH_CACHE).then(function (cc) {   // the next chapter, ready offline
            cc.match(chapterUrl(next[0])).then(function (hit) { if (!hit) fetch(chapterUrl(next[0])).catch(function () {}); });
          });
        }
      }, function (e) {
        text.innerHTML = '';
        if (e.missing || (c && c[4])) {
          text.appendChild(el('div', { 'class': 'note' }, [el('p', {}, [el('b', { text: 'Just published! ' }), 'The app gets its own copy of new chapters within about an hour. You can read it on the website right now.']),
            el('div', { 'class': 'row' }, [el('a', { 'class': 'btn btn-primary btn-sm', href: BLOG + '/' + r.key + '.html', html: icon('ext', 'Open the chapter page') })])]));
        } else {
          text.appendChild(el('div', { 'class': 'note' }, [el('p', { text: navigator.onLine ? 'This chapter did not load. Check your internet connection and try again. Chapters you opened or downloaded before open without internet: see your Library.' : 'You are offline and this chapter is not saved on this device yet. Connect to the internet, or open a downloaded chapter from your Library.' }),
            el('div', { 'class': 'row' }, [el('button', { type: 'button', 'class': 'btn btn-sm', text: 'Try again', onclick: function () { render(); } })])]));
        }
      });
      return w;
    });
  };
  function endNav(n, next, prev) {
    var s = el('section', { 'class': 'chap-end', 'aria-label': 'Next chapter' });
    if (next) s.appendChild(el('a', { 'class': 'next-big', href: '/read/' + next[0] + '/' }, [el('span', {}, [el('small', { text: 'Next chapter' }), document.createTextNode(next[1])]), el('span', { html: icon('next') })]));
    else if (n) s.appendChild(el('div', { 'class': 'caught' }, [el('b', { text: 'You are all caught up! ' }), 'New chapters of ' + n.title + ' show up here as soon as they are posted.',
      isFollowing(n.id) ? null : el('div', { 'class': 'row', style: 'margin-top:10px' }, [el('button', { type: 'button', 'class': 'btn btn-sm', html: icon('plus', 'Add to Library'), onclick: function (e) { setFollow(n, true); e.currentTarget.replaceWith(el('span', { text: '✓ In your Library' })); } })])]));
    var row = el('div', { 'class': 'row' });
    if (prev) row.appendChild(el('a', { 'class': 'btn btn-sm', href: '/read/' + prev[0] + '/', html: icon('prev', 'Previous') }));
    if (n) row.appendChild(el('a', { 'class': 'btn btn-sm', href: '/novel/' + n.id + '/#chapters', html: icon('list', 'All chapters') }));
    if (navigator.share) row.appendChild(el('button', { type: 'button', 'class': 'btn btn-sm', html: icon('share', 'Share'), onclick: function () {
      navigator.share({ title: doc.title, url: SELF + location.pathname }).catch(function () {});
    } }));
    s.appendChild(row);
    return s;
  }
  // the translator credits at the end of a chapter, as a tidy card (same rules as the site)
  function buildCredits(content) {
    var ps = $$(':scope > p', content), start = -1;
    for (var i = Math.max(0, ps.length - 14); i < ps.length; i++) {
      var t = ps[i].textContent.trim();
      if (/^(\*\s*){3}$/.test(t) || /^if you find any (errors|mistakes)/i.test(t) || /^\[?\s*(author|translator|proofreader|editor)\s*[–—:-]/i.test(t)) { start = i; break; }
    }
    if (start < 0) return null;
    var dl = el('dl'), thanks = [];
    ps.slice(start).forEach(function (p) {
      var t = p.textContent.replace(/\s+/g, ' ').trim();
      var m = t.match(/^\[?\s*(Author|Translator|Proofreader|Editor|Original)\s*[–—:-]\s*([\s\S]+?)\s*\]?$/i);
      if (m) { dl.appendChild(el('dt', { text: m[1] })); dl.appendChild(el('dd', { text: m[2] })); }
      else if (t && !/^(\*\s*){3}$/.test(t)) thanks.push(t);
      p.remove();
    });
    var card = el('aside', { 'class': 'credits', 'aria-label': 'Credits' });
    if (thanks.length) card.appendChild(el('p', { text: thanks.join(' ') }));
    if (dl.children.length) card.appendChild(dl);
    return card;
  }
  // reading progress: bar, %, saved position, header hides while reading down
  var lastY = 0, ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY, top = $('#top'), bar = $('.rd-bar');
      if (y > lastY + 6 && y > 200) { top.classList.add('is-hidden'); if (bar) bar.classList.add('is-hidden'); }
      else if (y < lastY - 6 || y < 100) { top.classList.remove('is-hidden'); if (bar) bar.classList.remove('is-hidden'); }
      lastY = y;
      if (route.name !== 'read') return;
      var max = doc.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, y / max) : 1;
      var pb = $('#progress span'); if (pb) pb.style.transform = 'scaleX(' + p + ')';
      var pc = $('.rd-bar .pct'); if (pc) pc.textContent = Math.round(p * 100) + '%';
      var n = DATA && novelOf(route.key);
      if (n && $('.rd-text p')) {
        setPos(route.key, p);
        var h = hist(); if (h[n.id] && h[n.id].k === route.key) { h[n.id].p = p; h[n.id].at = Date.now(); store.set('gco-app-hist', h); }
        if (p > 0.9) markRead(n.id, route.key);
      }
    });
  }, { passive: true });
  doc.body.appendChild(el('div', { 'class': 'progress', id: 'progress', 'aria-hidden': 'true' }, [el('span')]));
  doc.addEventListener('keydown', function (e) {
    if (route.name !== 'read' || e.target.closest('input,textarea,select') || e.altKey || e.ctrlKey || e.metaKey || $('.sheet')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      var a = $$('.rd-bar a.icon-btn')[e.key === 'ArrowRight' ? 1 : 0];
      if (a && !a.hasAttribute('aria-disabled')) { e.preventDefault(); go(a.href); }
    }
  });

  PAGES.library = function () {
    setMeta('Library', 'Your novels, reading progress and downloaded chapters.');
    return Promise.all([loadData().catch(function () { return null; }), offlineKeys(), oldRecords()]).then(function (r) {
      var d = r[0], off = r[1], w = el('div', { 'class': 'wrap' });
      w.appendChild(el('h1', { text: 'Library' }));
      w.appendChild(el('p', { 'class': 'muted', text: 'Kept in this browser only. Nothing is uploaded.' }));
      if (!d) { w.appendChild(errorBox()); return w; }
      var f = follows(), h = hist();
      var ids = Object.keys(f).concat(Object.keys(h).filter(function (k) { return !f[k]; })).filter(function (k) { return d.byId[k]; });
      ids.sort(function (a, b) { return ((h[b] || {}).at || (f[b] || {}).at || 0) - ((h[a] || {}).at || (f[a] || {}).at || 0); });
      w.appendChild(el('h2', { text: 'My novels' }));
      if (!ids.length) w.appendChild(el('div', { 'class': 'empty' }, [el('p', { text: 'Novels you add or start reading show up here, with where you stopped and how many new chapters came out.' }), el('a', { 'class': 'btn btn-primary', href: '/', text: 'Browse novels' })]));
      else {
        var ul = el('ul', { 'class': 'list' });
        ids.forEach(function (id) {
          var n = d.byId[id], hh = h[id], nw = newCount(n), rd = readSet(id).length;
          var offN = n.chapters.filter(function (c) { return off[c[0]]; }).length;
          var sub = [hh ? 'At ' + shortTitle(hh.t) : 'Not started', rd ? rd + ' of ' + n.chapters.length + ' read' : n.chapters.length + ' chapters', offN ? offN + ' offline' : '', f[id] ? '' : 'not added'].filter(Boolean).join(' · ');
          if (hh) hh = resume(n, hh) || hh;
          ul.appendChild(el('li', {}, [el('a', { href: hh && n.idx[hh.k] != null ? '/read/' + hh.k + '/' : '/novel/' + id + '/' }, [cover(n),
            el('span', { 'class': 't' }, [el('b', { text: novelName(n) }), el('small', { text: sub })]),
            nw ? el('span', { 'class': 'new chip', text: nw + ' new' }) : el('span', { 'class': 'r', html: icon('next') })])]));
        });
        w.appendChild(ul);
      }
      var offList = [];
      d.novels.forEach(function (n) { n.chapters.forEach(function (c) { if (off[c[0]]) offList.push([n, c]); }); });
      w.appendChild(el('h2', { text: 'On this device' }));
      if (!offList.length) w.appendChild(el('p', { 'class': 'muted', text: 'Chapters you open, and chapters you download from a novel’s page, are saved here for reading without internet.' }));
      else {
        var byN = {};
        offList.forEach(function (x) { (byN[x[0].id] = byN[x[0].id] || []).push(x[1]); });
        var ul2 = el('ul', { 'class': 'list' });
        Object.keys(byN).forEach(function (id) {
          var n = d.byId[id], cs = byN[id];
          ul2.appendChild(el('li', {}, [el('a', { href: '/novel/' + id + '/#chapters' }, [cover(n), el('span', { 'class': 't' }, [el('b', { text: novelName(n) }),
            el('small', { text: plural(cs.length, 'chapter') + ' saved: ' + shortTitle(cs[0][1]) + (cs.length > 1 ? ' … ' + shortTitle(cs[cs.length - 1][1]) : '') })])])]));
        });
        w.appendChild(ul2);
        w.appendChild(el('div', { 'class': 'row', style: 'margin-top:12px' }, [el('button', { type: 'button', 'class': 'btn btn-sm', text: 'Remove downloaded chapters', onclick: function () {
          if (!confirm('Remove all ' + offList.length + ' saved chapters from this device? Your library and reading positions stay.')) return;
          caches['delete'](CH_CACHE).then(function () { toast('Saved chapters removed.'); render(); });
        } })]));
      }
      if (hasOld(r[2])) w.appendChild(el('div', { style: 'margin-top:28px' }, [oldBanner(r[2])]));
      w.appendChild(footer());
      return w;
    });
  };

  PAGES.search = function (r) {
    setMeta('Search', 'Search GroupChatOn novels and chapters.');
    return loadData().then(function (d) {
      var w = el('div', { 'class': 'wrap' });
      w.appendChild(el('h1', { text: 'Search' }));
      var q = el('input', { 'class': 'field', type: 'search', value: r.q, placeholder: 'Novel name, chapter title or number', 'aria-label': 'Search', enterkeyhint: 'search', autocomplete: 'off' });
      var out = el('div', { 'aria-live': 'polite' });
      w.appendChild(el('form', { role: 'search', onsubmit: function (e) { e.preventDefault(); q.blur(); } }, [q]));
      w.appendChild(out);
      var t;
      function draw() {
        var s = q.value.trim().toLowerCase();
        history.replaceState({}, '', '/search/' + (s ? '?q=' + encodeURIComponent(q.value.trim()) : ''));
        out.innerHTML = '';
        if (!s) { out.appendChild(el('p', { 'class': 'muted', text: 'Try “demon”, “Cale”, “RAGS 120” or a chapter number.' })); return; }
        var words = s.split(/\s+/), num = (s.match(/(\d+)\s*$/) || [])[1];
        var novels = d.novels.filter(function (n) {
          var hay = (n.title + ' ' + n.part + ' ' + n.short + ' ' + n.alt + ' ' + (n.genres || []).join(' ')).toLowerCase();
          return words.every(function (x) { return hay.indexOf(x) >= 0; });
        });
        if (novels.length) {
          out.appendChild(el('h2', { text: 'Novels' }));
          var ul = el('ul', { 'class': 'list' });
          novels.forEach(function (n) { ul.appendChild(el('li', {}, [el('a', { href: '/novel/' + n.id + '/' }, [cover(n), el('span', { 'class': 't' }, [el('b', { text: novelName(n) }), el('small', { text: plural(n.chapters.length, 'chapter') })])])])); });
          out.appendChild(ul);
        }
        // chapters: words in the title, or "<novel> <number>"
        var hits = [];
        d.novels.forEach(function (n) {
          var nhay = (n.title + ' ' + n.short + ' ' + n.part).toLowerCase(), restWords = words.filter(function (x) { return nhay.indexOf(x) < 0; });
          n.chapters.forEach(function (c) {
            var t = c[1].toLowerCase();
            if (num && restWords.length <= 1 && restWords.join('') === num && chapNo(c[1]) === num && restWords.length < words.length) hits.push([n, c, 0]);
            else if (words.every(function (x) { return t.indexOf(x) >= 0; })) hits.push([n, c, 1]);
            else if (/^\d+$/.test(s) && chapNo(c[1]) === s) hits.push([n, c, 0]);
          });
        });
        hits.sort(function (a, b) { return a[2] - b[2]; });
        if (hits.length) {
          out.appendChild(el('h2', { text: 'Chapters' + (hits.length > 60 ? ' (first 60 of ' + hits.length + ')' : '') }));
          var ul2 = el('ul', { 'class': 'list' });
          hits.slice(0, 60).forEach(function (x) { ul2.appendChild(el('li', {}, [el('a', { href: '/read/' + x[1][0] + '/' }, [el('span', { 'class': 't' }, [el('b', { text: x[1][1] }), el('small', { text: novelName(x[0]) + ' · ' + fmtDate(x[1][2]) })])])])); });
          out.appendChild(ul2);
        }
        if (!novels.length && !hits.length) out.appendChild(el('div', { 'class': 'empty', text: 'Nothing found for “' + q.value.trim() + '”. Check the spelling or try fewer words.' }));
      }
      q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(draw, 120); });
      draw();
      route.after = function () { window.scrollTo(0, 0); if (!r.q) q.focus(); };
      return w;
    });
  };

  PAGES.settings = function () {
    setMeta('Settings', 'Reading settings and information about the GroupChatOn app.');
    return oldRecords().then(function (o) {
      var w = el('div', { 'class': 'wrap', style: 'max-width:720px' });
      w.appendChild(el('h1', { text: 'Settings' }));
      w.appendChild(el('section', { 'class': 'set-sec card' }, [el('h2', { text: 'Reading' }), settingsPanel()]));
      var storeLine = el('p', { 'class': 'muted' });
      if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) { storeLine.textContent = 'The app uses about ' + bytes(e.usage || 0) + ' on this device.'; });
      w.appendChild(el('section', { 'class': 'set-sec card' }, [el('h2', { text: 'Offline reading' }),
        el('p', { text: 'Every chapter you open stays on this device, and the next one is fetched in advance. To save more, open a novel and tap Download.' }), storeLine,
        el('div', { 'class': 'row' }, [el('a', { 'class': 'btn btn-sm', href: '/library/', text: 'See saved chapters' })])]));
      if (!installed) w.appendChild(el('section', { 'class': 'set-sec card' }, [el('h2', { text: 'Install the app' }),
        el('p', { text: 'Install GroupChatOn to open it from your home screen or desktop, full screen, like any other app. It is free and takes almost no space.' }),
        el('button', { type: 'button', 'class': 'btn btn-primary', html: icon('install', 'Install GroupChatOn'), onclick: install })]));
      if (hasOld(o)) w.appendChild(el('section', { 'class': 'set-sec' }, [oldBanner(o)]));
      w.appendChild(el('section', { 'class': 'set-sec card' }, [el('h2', { text: 'About' }),
        el('dl', { 'class': 'kv' }, [el('dt', { text: 'App' }), el('dd', { text: 'GroupChatOn' }), el('dt', { text: 'Version' }), el('dd', { text: VERSION }),
          el('dt', { text: 'Novels updated' }), el('dd', { text: DATA ? new Date(DATA.built).toLocaleString() : '—' }),
          el('dt', { text: 'Website' }), el('dd', {}, [el('a', { href: WWW + '/', text: 'www.groupchaton.com' })])]),
        el('p', { text: 'The app shows every GroupChatOn novel and chapter and checks for new chapters by itself. Your library, reading position and settings stay in this browser only.' }),
        el('p', {}, ['Record tools (invoices, khata, money manager…) are on ', el('a', { href: INF + '/', text: 'Infinity' }), '.']),
        el('div', { 'class': 'links' }, [el('a', { href: WWW + '/p/privacy-policy.html', text: 'Privacy policy' }), el('a', { href: WWW + '/p/disclaimer.html', text: 'Disclaimer' }),
          el('a', { href: WWW + '/p/contact-us.html?from=app', text: 'Contact us' }), el('a', { href: WWW + '/', text: 'About GroupChatOn' })]),
        el('p', { 'class': 'copy', html: '© ' + new Date().getFullYear() + ' GroupChatOn. All rights reserved.<br>Designed &amp; Developed by: <a href="https://www.niveshsahayak.in/" rel="noopener" target="_blank">Nivesh Sahayak</a>' })]));
      if (!DATA) loadData().then(function () { if (route.name === 'settings') render(); }).catch(function () {});
      return w;
    });
  };

  PAGES.old = function () {
    setMeta('Your records from the old Infinity App', 'Save the records you kept in the old Infinity App and restore them on infinity.groupchaton.com.');
    return oldRecords().then(function (o) {
      var w = el('div', { 'class': 'wrap', style: 'max-width:760px' });
      w.appendChild(el('h1', { text: 'Your records from the old Infinity App' }));
      var names = Object.keys(o.vaults);
      if (!names.length) {
        w.appendChild(el('div', { 'class': 'empty' }, [el('p', { text: 'There are no Infinity App records on this device. If you kept records on another phone or browser, open novel.groupchaton.com there to save them.' }),
          el('a', { 'class': 'btn', href: INF + '/', text: 'Open Infinity' })]));
        return w;
      }
      w.appendChild(el('p', { text: 'novel.groupchaton.com is now the GroupChatOn reading app. The record tools (money manager, khata, invoices, registers and logs) now live on Infinity, which installs as its own app. Your records are still safe on this device; nothing has been deleted. Move them in two steps:' }));
      var ul = el('ul', { 'class': 'list rec-list', style: 'margin:16px 0' });
      names.forEach(function (n) {
        var c = recCount(o.vaults[n]);
        ul.appendChild(el('li', {}, [el('div', { 'class': 'li' }, [el('span', { 'class': 't' }, [el('b', { text: oldName(n) }), el('small', { text: c ? plural(c, 'record') : 'settings and notes' })])])]));
      });
      w.appendChild(ul);
      var status = el('p', { role: 'status', 'class': 'muted' });
      var file = null;
      var dl = el('button', { type: 'button', 'class': 'btn btn-primary', html: icon('down', 'Step 1: Save backup file'), onclick: function () {
        status.textContent = 'Preparing the file…';
        oldBackup(o).then(function (f) {
          file = f; saveFile(f);
          store.set('gco-app-old-saved', new Date().toISOString().slice(0, 10));
          status.textContent = 'Saved “' + f.name + '” (' + bytes(f.size) + ') in your Downloads. Keep a copy in Google Drive, email or WhatsApp to yourself.';
          if (shareB) shareB.hidden = false;
        }, function (e) { status.textContent = 'Could not make the file: ' + (e && e.message || e); });
      } });
      var shareB = null;
      if (navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.json', { type: 'application/json' })] })) {
        shareB = el('button', { type: 'button', 'class': 'btn', hidden: true, html: icon('share', 'Send the file to Drive or WhatsApp'), onclick: function () {
          if (file) navigator.share({ files: [file], title: 'Infinity backup' }).catch(function () {});
        } });
      }
      w.appendChild(el('div', { 'class': 'card' }, [el('h2', { text: '1. Save one backup file' }),
        el('p', { text: 'One file holds every record, photo and setting of these tools (the same file Infinity’s “Back up everything” makes). Your diary stays encrypted inside it.' }),
        el('div', { 'class': 'row' }, [dl, shareB]), status]));
      w.appendChild(el('div', { 'class': 'card', style: 'margin-top:14px' }, [el('h2', { text: '2. Restore it on Infinity' }),
        el('ol', { 'class': 'steps' }, [el('li', {}, ['Open ', el('a', { href: INF + '/my-data-backup/', target: '_blank', rel: 'noopener', text: 'Infinity › My Data: Backup Everything' }), ' on the same phone or computer.']),
          el('li', { text: 'Tap “⬆ Restore a backup” and choose the file you saved in step 1.' }),
          el('li', { text: 'Confirm. Every tool now shows your records on infinity.groupchaton.com. Install Infinity as an app from its menu if you like.' })]),
        el('div', { 'class': 'row' }, [el('a', { 'class': 'btn', href: INF + '/my-data-backup/', target: '_blank', rel: 'noopener', html: icon('ext', 'Open Infinity My Data') })])]));
      w.appendChild(el('div', { 'class': 'note', style: 'margin-top:14px' }, [el('p', { text: 'The records stay on this device as they are; this app never changes or deletes them. When you have restored them on Infinity, you can hide this notice.' }),
        el('div', { 'class': 'row' }, [el('button', { type: 'button', 'class': 'btn btn-sm', text: store.get('gco-app-old-hide', false) ? 'Show the notice on Home again' : 'Hide the notice on Home', onclick: function (e) {
          var hide = !store.get('gco-app-old-hide', false); store.set('gco-app-old-hide', hide);
          e.currentTarget.textContent = hide ? 'Show the notice on Home again' : 'Hide the notice on Home';
          toast(hide ? 'Hidden. This page stays in Settings.' : 'The notice shows on Home again.');
        } })])]));
      return w;
    });
  };

  PAGES.moved = function (r) {
    setMeta('This tool moved to Infinity', '');
    var w = el('div', { 'class': 'wrap', style: 'max-width:640px' });
    w.appendChild(el('h1', { text: 'This tool moved to Infinity' }));
    w.appendChild(el('p', { text: 'The record and business tools of the old Infinity App now open on infinity.groupchaton.com.' }));
    w.appendChild(el('div', { 'class': 'row' }, [el('a', { 'class': 'btn btn-primary', href: INF + '/search?q=' + encodeURIComponent(r.id.replace(/-/g, ' ')), html: icon('ext', 'Open it on Infinity') }),
      el('a', { 'class': 'btn', href: '/old-records/', text: 'My old records' })]));
    return w;
  };

  PAGES.notfound = function () {
    setMeta('Page not found', '');
    return el('div', { 'class': 'wrap' }, [el('h1', { text: 'Page not found' }), el('p', { text: 'This page is not in the app.' }),
      el('div', { 'class': 'row' }, [el('a', { 'class': 'btn btn-primary', href: '/', text: 'Go to Home' }), el('a', { 'class': 'btn', href: '/search/', text: 'Search' })])]);
  };

  /* ---------------- start ---------------- */
  window.addEventListener('online', function () { if (route.name !== 'read') render(); });
  start(false);
  if ('serviceWorker' in navigator) {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('/sw.js').catch(function () {});
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      // a new version took over: reload once on a quiet screen so the new files are used
      if (reloading || !hadController || route.name === 'read') return;
      reloading = true;
      if (!$('.sheet')) location.reload();
    });
  }
})();

/* Footer credit (owner, 2026-11-02): a "Designed & Developed by: Nivesh Sahayak" badge linked to niveshsahayak.in.
   The badge (look, wording, link) comes from Nivesh Sahayak's shared file, so it is changed in one place for every site;
   until that file loads, the plain text already reads "Designed & Developed by:". Also corrects themes uploaded earlier. */
;(function () {
  var RE = /(designed\s*&\s*developed|built)\s+by:?\s*$/i;
  function fix() {
    [].forEach.call(document.querySelectorAll('a[href*="niveshsahayak.in"]'), function (a) {
      var t = a.previousSibling;
      if (t && t.nodeType === 3 && RE.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace(RE, 'Designed & Developed by: ');
    });
    if (!document.querySelector('script[src*="niveshsahayak.in/assets/credit.js"]')) {
      var s = document.createElement('script'); s.async = true; s.src = 'https://assets.niveshsahayak.in/assets/credit.js';
      document.head.appendChild(s);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix); else fix();
})();
