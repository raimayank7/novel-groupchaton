/* GroupChatOn app (novel.groupchaton.com): the reading app for the GroupChatOn novels (chapters are written on the blog, BLOG below).
   - Novels and chapter lists: /data/novels.json (built every hour from the blog by scripts/build_data.py)
   - Chapter text: /c/<yyyy>/<mm>/<name>.json; every opened or downloaded chapter stays on the device (service worker)
   - Brand-new chapters: Blogger's own feed (JSONP), so they show up before the next hourly build
   - Your library, reading position and settings: this browser only (localStorage)
   - Old "Infinity App" records saved on this address: found and offered as one backup file for Infinity
   Designed & Developed by Nivesh Sahayak (https://www.niveshsahayak.in/). All rights reserved: see LICENSE. */
(function () {
  'use strict';
  var VERSION = '2026-11-15.1bca93b';
  var WWW = 'https://www.groupchaton.com', INF = 'https://infinity.groupchaton.com';
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
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    listen: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><path d="M4 15h3v5H5a1 1 0 0 1-1-1zM20 15h-3v5h2a1 1 0 0 0 1-1z"/>',
    play: '<path d="M8 5l11 7-11 7z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>'
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
    return;   /* the app never contacts the chapter source; new chapters arrive with the hourly copy */
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
    var d = el('div', { 'class': 'pk-slot pk-wait', 'data-slot': slot, 'data-kind': kind });
    if (adObs) adObs.observe(d); else setTimeout(function () { fillAd(d); }, 0);
    return d;
  }
  function fillAd(d) {
    if (!navigator.onLine || adsBlocked) return promoFill(d);   // no Google ad possible: a sponsor card instead
    if (!adsLoaded) {
      adsLoaded = true;
      var sc = el('script', { async: true, crossorigin: 'anonymous', src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + AD_CLIENT });
      sc.onerror = function () { adsBlocked = true; [].forEach.call(doc.querySelectorAll('.pk-slot.pk-wait'), promoFill); };   // blocked or offline
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
    return promos || (promos = fetch('/data/cards.json').then(function (r) { return r.json(); })
      .then(function (P) { return ((P && P.promos) || []).filter(function (x) { return x.href && ((x.imgs && x.imgs.length) || x.icon || x.img_icon) && x.family !== 'novels' && (inIndia || !x.india); }); })
      .catch(function () { promos = null; return []; }));
  }
  function promoFill(d) {
    if (!d || d.classList.contains('is-promo')) return;
    // the box is never named ad-slot / ad-top (ad blockers hide such boxes, so it would never scroll into view and no card could fill it)
    d.classList.remove('pk-wait'); d.classList.add('pk-slot', 'is-promo');
    getPromos().then(function (list) {
      if (!list.length) { d.classList.add('is-empty'); return; }
      var fresh = list.filter(function (x) { return promoUsed.indexOf(x.href) < 0; });
      if (!fresh.length) { promoUsed = []; fresh = list; }
      var x = fresh[Math.floor(Math.random() * fresh.length)];
      promoUsed.push(x.href);
      d.innerHTML = '';
      watchCard(d);
      if (x.own) d.classList.add('is-own');   // our own card (Ko-fi): labelled "From GroupChatOn", not a sponsored link
      if (x.tag) d.setAttribute('data-tag', x.tag); else d.removeAttribute('data-tag');   // its own label (e.g. "From Nivesh Sahayak")
      var pic = x.imgs && x.imgs.length ? el('img', { src: x.imgs[Math.floor(Math.random() * x.imgs.length)], alt: x.title || '', loading: 'lazy', width: 336, height: 280 })
        : x.img_icon ? el('img', { 'class': 'promo-ic is-mark', src: x.img_icon, alt: '', width: 64, height: 64, loading: 'lazy' })
        : el('span', { 'class': 'promo-ic', 'aria-hidden': 'true', html: PROMO_ICONS[x.icon] || '' });
      d.appendChild(el('a', { 'class': 'promo-card', href: x.href, target: '_blank', rel: x.own ? 'noopener' : 'sponsored noopener' }, [   // x.href is our own /go/<n>/ redirect page
        pic,
        el('span', { 'class': 'pk-lbl', text: x.tag || (x.own ? 'From GroupChatOn' : 'Sponsored') }),
        el('b', { text: x.title || '' }),
        x.line ? el('span', { text: x.line }) : null,
        el('em', { text: x.cta || 'Learn more' }), x.small ? el('small', { text: x.small }) : null]));
    });
  }

  /* A filter can still hide a card with a rule of its own. The card then looks again after a moment; if it is hidden or
     emptied, it is drawn once more with every style written on the elements themselves (a filter list cannot know those). */
  function watchCard(d) {
    setTimeout(function () {
      var a = d.querySelector('.promo-card');
      if (!d.isConnected) return;
      var gone = !a || a.offsetHeight < 20 || getComputedStyle(d).display === 'none' || getComputedStyle(a).visibility === 'hidden';
      if (!gone || d.getAttribute('data-plain')) return;
      d.setAttribute('data-plain', '1');
      var src = a ? a.cloneNode(true) : null;
      if (!src) return;
      var host = el('div', { style: 'display:block!important;visibility:visible!important;opacity:1!important;position:static!important;height:auto!important;margin:16px 0!important;max-width:720px' });
      src.style.cssText = 'display:flex!important;gap:12px;align-items:center;padding:12px;border:1px dashed #8886;border-radius:14px;color:inherit;text-decoration:none;background:rgba(127,127,127,.08)';
      [].forEach.call(src.querySelectorAll('img'), function (im) { im.style.cssText = 'width:72px;height:72px;object-fit:cover;border-radius:10px;flex:none'; });
      [].forEach.call(src.querySelectorAll('.pk-lbl'), function (s) { s.style.cssText = 'display:none'; });
      host.appendChild(src);
      d.parentNode && d.parentNode.insertBefore(host, d.nextSibling);
    }, 1800);
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
    if ((m = path.match(/^\/(about|privacy-policy|disclaimer|contact)\/?$/))) return { name: 'page', slug: m[1] };
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
    var index = route.name === 'home' || route.name === 'read' || route.name === 'novel' || route.name === 'page';   // home, novel and chapter pages are this site's own pages (in sitemap.xml)
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
    if (!quiet && TTS.open && !TTS.resumeNext && route.name !== 'read') ttsClose();   // leaving a chapter stops the reading
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
        el('a', { href: '/about/', text: 'About' }), el('a', { href: '/privacy-policy/', text: 'Privacy policy' }),
        el('a', { href: '/disclaimer/', text: 'Disclaimer' }), el('a', { href: '/contact/', text: 'Contact' })]),
      el('p', { html: '© ' + new Date().getFullYear() + ' GroupChatOn. All rights reserved. · Designed &amp; Developed by: <a href="https://www.niveshsahayak.in/" rel="noopener" target="_blank">Nivesh Sahayak</a>' })]);
  }
  // Blogger serves any size of a picture: ask for a small one instead of the 1600px original
  function coverUrl(u, w) { return (u || '').replace(/\/(s\d+(-c)?|w\d+(-h\d+)?(-[a-z]+)*)\/([^/]+)$/, '/w' + w + '/$5'); }
  /* a chapter's own picture (data.imgs + chapter entry [5]); the novel's cover when the chapter has none */
  var IMGBASE = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/';
  function chapImg(n, key, cls) {
    var i = n.idx ? n.idx[key] : null, c = i != null ? n.chapters[i] : null, u = c && c.length > 5 && DATA && DATA.imgs ? DATA.imgs[c[5]] : null;
    if (!u) return cover(n, cls);
    return el('img', { 'class': cls || '', src: (IMGBASE + u).replace(/\/(s\d+|w\d+)(-[a-z0-9]+)*\/([^\/]+)$/, '/w240/$3'), alt: '', loading: 'lazy', decoding: 'async', width: '200', height: '300' });
  }
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
        ul.appendChild(el('li', {}, [el('a', { href: '/read/' + x[1] + '/' }, [chapImg(n, x[1]), el('span', { 'class': 't' }, [el('b', { text: x[2] }), el('small', { text: novelName(n) })]), el('span', { 'class': 'r', text: ago(x[3]) })])]));
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
    return el('a', { 'class': 'cont', href: '/read/' + h.k + '/' }, [chapImg(n, h.k),
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
      if (n) {   // the novel's details card: beside the chapter on wide screens, a compact card above it on narrow ones
        var last = n.chapters[n.chapters.length - 1];
        w.appendChild(el('aside', { 'class': 'rd-side', 'aria-label': 'About this novel' }, [el('div', { 'class': 'rd-card' }, [
          el('a', { href: '/novel/' + n.id + '/', 'aria-label': novelName(n) }, [cover(n, 'rd-cover', 320, true)]),
          el('div', { 'class': 'rd-info' }, [
            el('a', { 'class': 'rd-nv', href: '/novel/' + n.id + '/', text: novelName(n) }),
            n.alt ? el('div', { 'class': 'rd-alt', text: n.alt }) : null,
            n.genres && n.genres.length ? el('div', { 'class': 'rd-chips' }, n.genres.slice(0, 6).map(function (g) { return el('span', { text: g }); })) : null,
            el('div', { 'class': 'rd-stat', text: plural(n.chapters.length, 'chapter') + (last ? ' · updated ' + fmtDate(last[2]) : '') }),
            el('button', { type: 'button', 'class': 'btn btn-sm rd-chap', text: 'All chapters', onclick: function () { openToc(); } })])])]));
      }
      if (window.matchMedia && matchMedia('(min-width:1320px)').matches) {   // wide screens: a sponsor card stays in view on the right of the chapter
        var railBox = el('div', { 'class': 'pk-slot' });
        w.appendChild(el('aside', { 'class': 'rd-rail', 'aria-label': 'Sponsored' }, [railBox]));
        promoFill(railBox);
      }
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
      bar.appendChild(el('button', { type: 'button', 'class': 'icon-btn', 'aria-label': 'Listen to this chapter', html: icon('listen'), onclick: function () { if (TTS.open && TTS.bar) ttsToggle(); else ttsOpen(); } }));
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
        if (n) {   // the cover at the top of the saved chapter moves into the details card
          var f0 = text.firstElementChild;
          if (f0 && (f0.tagName === 'IMG' || (f0.tagName === 'A' && f0.querySelector('img') && !f0.textContent.trim()))) {
            var pic = f0.tagName === 'IMG' ? f0 : f0.querySelector('img'), cv = $('.rd-cover', w);
            if (pic && cv && pic.getAttribute('src')) {   // every chapter has its own picture: the card shows it (the novel's cover stays when a chapter has none)
              cv.src = pic.getAttribute('src').replace(/\/(s\d+|w\d+)(-[a-z]+)*\/([^\/]+)$/, '/w420/$3'); cv.classList.add('is-ch');
            }
            text.removeChild(f0);
          }
        }
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
        w.insertBefore(chapTools(n, ch, r.key, text), bar);
        ttsReady(n, ch, r.key, text, next);
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
          text.appendChild(el('div', { 'class': 'note' }, [el('p', {}, [el('b', { text: 'Just published! ' }), 'The app gets its own copy of new chapters within about an hour. Please check back soon.']),
            el('div', { 'class': 'row' }, [el('button', { type: 'button', 'class': 'btn btn-sm', text: 'Try again', onclick: function () { render(); } })])]));
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
      if (y > lastY + 6 && y > 200) { top.classList.add('is-hidden'); if (bar && !TTS.open) bar.classList.add('is-hidden'); }
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
        el('div', { 'class': 'links' }, [el('a', { href: '/privacy-policy/', text: 'Privacy policy' }), el('a', { href: '/disclaimer/', text: 'Disclaimer' }),
          el('a', { href: '/contact/', text: 'Contact us' }), el('a', { href: '/about/', text: 'About GroupChatOn' })]),
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

  /* ---------------- messages (report a mistake, contact) and comments ---------------- */
  /* Messages go by e-mail through FormSubmit (formsubmit.co); the address is a code, not an e-mail address.
     Comments are Disqus, loaded only when the reader taps "Show comments" (same Disqus site and thread ids as the old blog). */
  var FORM_URL = 'https://formsubmit.co/ajax/08205137b14cf6d7ee97865c8e748e9c', DISQUS = 'group4whatsapp';
  function sendMessage(subject, f) {
    if (Date.now() - (+store.get('gco-app-sent', 0) || 0) < 45000) return Promise.resolve({ ok: false, msg: 'Please wait a minute before sending another message.' });
    var body = { _subject: '[GroupChatOn app] ' + subject, _captcha: 'false', _template: 'table', name: f.name || 'Reader', message: f.message, page: location.href, _honey: '' };
    if (f.email) body.email = f.email;
    return fetch(FORM_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (j) {
        if (j.success === true || j.success === 'true') { store.set('gco-app-sent', Date.now()); return { ok: true }; }
        return { ok: false, msg: 'We could not send that just now. Please try again in a little while.' };
      }, function () { return { ok: false, msg: navigator.onLine ? 'We could not send that just now. Please try again in a little while.' : 'You are offline. Please send it when you are connected.' }; });
  }
  /* a small form: fields = [{ key, label, type: text|email|textarea|select, required, options, hint, rows }] */
  function formBox(fields, submitText, make, thanks) {
    var me = store.get('gco-contact', {}), form = el('form', { 'class': 'fm', novalidate: 'novalidate' }), inp = {};
    fields.forEach(function (f) {
      var c;
      if (f.type === 'textarea') c = el('textarea', { rows: f.rows || 4, maxlength: 4000 });
      else if (f.type === 'select') c = el('select', {}, f.options.map(function (o) { return el('option', { value: o, text: o }); }));
      else c = el('input', { type: f.type || 'text', maxlength: 200, autocomplete: f.key === 'email' ? 'email' : f.key === 'name' ? 'name' : 'off' });
      if (f.key === 'name' || f.key === 'email') c.value = me[f.key] || '';
      inp[f.key] = c;
      form.appendChild(el('label', { 'class': 'fm-field' }, [el('span', { text: f.label + (f.required ? '' : ' (optional)') }), c, f.hint ? el('small', { text: f.hint }) : null]));
    });
    var status = el('div', { 'class': 'fm-status', role: 'status' }), btn = el('button', { type: 'submit', 'class': 'btn btn-primary', text: submitText });
    form.appendChild(el('div', { 'class': 'row' }, [btn]));
    form.appendChild(status);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {};
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i]; v[f.key] = (inp[f.key].value || '').trim();
        if (f.required && !v[f.key]) { status.className = 'fm-status is-error'; status.textContent = 'Please fill in: ' + f.label + '.'; inp[f.key].focus(); return; }
        if (f.type === 'email' && v[f.key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v[f.key])) { status.className = 'fm-status is-error'; status.textContent = 'That e-mail address does not look right.'; inp[f.key].focus(); return; }
      }
      store.set('gco-contact', { name: v.name || '', email: v.email || '' });
      var m = make(v);
      btn.disabled = true; status.className = 'fm-status'; status.textContent = 'Sending…';
      sendMessage(m.subject, { name: v.name, email: v.email, message: m.message }).then(function (r) {
        btn.disabled = false;
        status.className = 'fm-status ' + (r.ok ? 'is-ok' : 'is-error');
        status.textContent = r.ok ? thanks : r.msg;
        if (r.ok) fields.forEach(function (f) { if (f.type === 'textarea') inp[f.key].value = ''; });
      });
    });
    return form;
  }
  function openReport(ctx, quote) {
    var form = formBox([
      { key: 'kind', label: 'What kind of mistake?', type: 'select', required: true, options: ['Typo', 'Wrong name or word', 'Missing or repeated text', 'Other'] },
      { key: 'quote', label: 'The text with the mistake', type: 'textarea', rows: 3, hint: 'Copy a few words so we can find it.' },
      { key: 'fix', label: 'What it should say', type: 'textarea', rows: 3 },
      { key: 'name', label: 'Your name' },
      { key: 'email', label: 'Your e-mail', type: 'email', hint: 'Only if you would like a reply.' }],
      'Send report', function (v) {
        if (!v.quote && !v.fix) v.quote = '-';
        return { subject: '[Report] ' + v.kind + ' · ' + ctx.novel + ' · ' + ctx.title,
          message: ['[Report] ' + v.kind, 'Where: ' + ctx.novel + ' · ' + ctx.title, ctx.url, '', 'Text: ' + (v.quote || '-'), '', 'Should be: ' + (v.fix || '-')].join('\n') };
      }, 'Thank you! We will fix it soon.');
    var s = sheet('Report a mistake', form), areas = $$('textarea', form);
    if (quote && areas[0]) areas[0].value = quote;
    setTimeout(function () { var q = quote ? areas[1] : areas[0]; if (q) q.focus(); }, 280);
    return s;
  }
  /* select a line in a chapter: a "Report typo" button appears (it opens the report with that text filled in) */
  var selCtx = null, selBtn = null, selPicked = '', selT;
  function setupSelection() {
    if (selBtn) return;
    selBtn = el('button', { type: 'button', 'class': 'sel-report', hidden: 'hidden', text: 'Report typo' });
    doc.body.appendChild(selBtn);
    selBtn.addEventListener('mousedown', function (e) { e.preventDefault(); });   // keep the selection when the button is pressed
    selBtn.addEventListener('click', function () {
      var q = selPicked;
      selBtn.hidden = true;
      try { window.getSelection().removeAllRanges(); } catch (err) {}
      if (selCtx) openReport(selCtx.ctx, q);
    });
    doc.addEventListener('selectionchange', function () {
      clearTimeout(selT);
      selT = setTimeout(function () {
        var sel = window.getSelection(), text = sel ? String(sel).replace(/\s+/g, ' ').trim() : '';
        var inside = selCtx && route.name === 'read' && sel && sel.rangeCount && selCtx.el.contains(sel.getRangeAt(0).commonAncestorContainer);
        if (inside && text.length > 1 && text.length <= 800 && !$('.sheet.is-open')) { selPicked = text; selBtn.hidden = false; }
        else if (!text || !inside) selBtn.hidden = true;
      }, 180);
    });
  }
  function chapTools(n, ch, key, textEl) {
    var url = SELF + '/read/' + key + '/', title = ch.t || key, novel = n ? novelName(n) : 'GroupChatOn';
    if (textEl) { selCtx = { el: textEl, ctx: { novel: novel, title: title, url: url } }; setupSelection(); }
    var thread = el('div', { id: 'disqus_thread' }), note = el('p', { 'class': 'muted fm-note', text: 'Comments are run by Disqus. Please be kind, mark spoilers and do not share links to pirated copies.' });
    var cbtn = el('button', { type: 'button', 'class': 'btn', text: 'Show comments' });
    cbtn.addEventListener('click', function () {
      if (!navigator.onLine) { note.textContent = 'You are offline. Comments need an internet connection.'; return; }
      cbtn.hidden = true;
      window.disqus_config = function () { this.page.url = url; this.page.identifier = ch.id || key; };
      if (window.DISQUS) { window.DISQUS.reset({ reload: true, config: window.disqus_config }); return; }
      var sc = el('script', { src: 'https://' + DISQUS + '.disqus.com/embed.js', async: true });
      sc.setAttribute('data-timestamp', String(+new Date()));
      sc.onerror = function () { cbtn.hidden = false; note.textContent = 'Comments could not load (an ad or tracking blocker can stop them). Please try again.'; };
      doc.body.appendChild(sc);
    });
    return el('section', { 'class': 'chap-tools', 'aria-label': 'Comments and reports' }, [
      el('div', { 'class': 'row' }, [cbtn, el('button', { type: 'button', 'class': 'btn', text: 'Report a mistake', onclick: function () { openReport({ novel: novel, title: title, url: url }); } })]),
      thread, note]);
  }

  /* ---------------- the app's own About, Privacy policy, Disclaimer and Contact pages ---------------- */
  var LEGAL = {
    about: { title: 'About GroupChatOn', desc: 'GroupChatOn is a small fan-run project that shares carefully proofread English chapters of Korean web novels, free, in a comfortable reading app.',
      html: `<p class="lead">GroupChatOn is a small fan-run project where readers enjoy carefully proofread English chapters of Korean web novels, free and in a comfortable reading layout.</p>
<h2>What we do</h2>
<p>We take existing fan translations, proofread them line by line for grammar, names and flow, and publish them in reading order with easy chapter navigation. Our current series are listed on the <a href="/">home page</a>.</p>
<h2>Who we are</h2>
<p>GroupChatOn is run by Mayank, a reader who started proofreading favourite series so more people could enjoy them, together with the translators credited at the end of every chapter.</p>
<h2>Made for reading</h2>
<ul><li>Light, sepia, dark and black themes, with adjustable font, size and spacing.</li><li>Your place is remembered, so you can continue where you left off.</li><li>Chapters you open stay on your device, so you can keep reading offline.</li><li>Ads are kept light and placed so they never interrupt a scene.</li></ul>
<h2>Respecting the authors</h2>
<p>Every novel belongs to its original author and publisher. If you can, please support the official release. Rights holders can reach us through the <a href="/contact/">contact page</a> and we respond quickly. See our <a href="/disclaimer/">disclaimer</a>.</p>
<h2>Free tools</h2>
<p>We also offer free online tools for PDFs, images, text and links on <a href="https://infinity.groupchaton.com" rel="noopener">Infinity</a>.</p>
<h2 id="comments">Comment rules</h2>
<p>Be kind, mark spoilers (start with “Spoiler:”), no spam or referral links, no personal details, stay on topic, and no links to pirated copies. We may remove comments that break these rules. Found a typo? Use “Report a mistake” at the end of a chapter: it reaches us faster than a comment.</p>
<p><a class="btn btn-primary" href="/contact/">Contact us</a></p>` },
    'privacy-policy': { title: 'Privacy policy', desc: 'What the GroupChatOn app stores, which services it uses, and the choices you have.',
      html: `<p class="muted">Last updated: 15 November 2026</p>
<p class="lead">This policy explains what information the GroupChatOn app (novel.groupchaton.com) collects when you use it, how it is used and the choices you have.</p>
<h2>Information you give us</h2>
<p>When you use the contact form or “Report a mistake”, you send us your name (optional), your e-mail address (needed only if you want a reply) and your message. The message reaches us by e-mail through the FormSubmit service. We use it only to reply and to fix or plan chapters, and we never sell or share it.</p>
<h2>Stored on your own device</h2>
<p>To make reading comfortable, your browser saves your reading settings (theme, font, size), your library, the chapters you read and where you stopped, the chapters you opened for offline reading and, if you send us a message, your name and e-mail so you do not have to type them again. This stays in your browser; we do not receive it. You can delete it by clearing this site’s data in your browser settings.</p>
<h2>Services the app uses</h2>
<ul>
<li><b>Google AdSense</b> shows ads. Google and its partners use cookies to show ads based on your visits to this and other websites. You can turn off personalised ads at <a href="https://adssettings.google.com" rel="noopener" target="_blank">adssettings.google.com</a>. When no Google ad is available, the app may show a card for a partner or for another GroupChatOn site instead.</li>
<li><b>Disqus</b> runs the comments. It loads only when you tap “Show comments”, and its own <a href="https://help.disqus.com/en/articles/1717103-disqus-privacy-policy" rel="noopener" target="_blank">privacy policy</a> applies.</li>
<li><b>FormSubmit</b> delivers the messages you send us by e-mail, and may keep a copy for a short time.</li>
<li><b>GitHub Pages</b> hosts this app and keeps standard server logs such as IP addresses. Chapter pictures are served by Google’s image hosting.</li>
</ul>
<h2>Cookies</h2>
<p>The app itself does not set tracking cookies. Cookies are set by Google (ads) and Disqus (comments) when those parts load. You can block or delete cookies in your browser settings; the app will still work, but ads may become less relevant.</p>
<h2>Children</h2>
<p>The app is not directed at children under 13, and we do not knowingly collect their personal information.</p>
<h2>Your rights</h2>
<p>You can ask us what personal information we hold about you, or ask us to delete it, through the <a href="/contact/">contact page</a>. Depending on where you live (for example under GDPR or CCPA), you may have further rights, and we will honour them.</p>
<h2>Changes</h2>
<p>We may update this policy; the date at the top shows the latest version.</p>` },
    disclaimer: { title: 'Disclaimer', desc: 'GroupChatOn is a non-commercial fan project sharing proofread, unofficial English translations of Korean web novels.',
      html: `<p class="muted">Last updated: 15 November 2026</p>
<p class="lead">GroupChatOn is a non-commercial fan project sharing proofread, unofficial English translations of Korean web novels. By using the app you accept the points below.</p>
<h2>Copyright</h2>
<p>All novels, characters and original texts belong to their authors and publishers. GroupChatOn does not claim ownership of any work it presents. Translators and authors are credited on every chapter. Please support the official releases where they exist.</p>
<h2>Requests from rights holders</h2>
<p>If you own the rights to a work in the app and want it changed or removed, contact us through the <a href="/contact/">contact page</a> with the page links and your relationship to the work. We act on valid requests promptly.</p>
<h2>Accuracy</h2>
<p>We proofread carefully, but translations may still contain mistakes or differ from the original. Content is provided “as is”, for entertainment. If you spot a mistake, please use “Report a mistake” at the end of the chapter.</p>
<h2>External links and ads</h2>
<p>We link to other websites and show ads from Google and cards for partners. We are not responsible for their content, products or privacy practices.</p>
<h2>No affiliation</h2>
<p>GroupChatOn is independent. It is not affiliated with the authors, publishers or platforms of the original works, or with Google.</p>` },
    contact: { title: 'Contact us', desc: 'Send a message to GroupChatOn: questions, feedback, novel requests or a request from a rights holder.', form: true,
      html: `<p class="lead">Questions, feedback, a novel you would like to read, or a request from a rights holder: write to us here and we will get back to you.</p>
<p>Found a typo in a chapter? Please use <b>Report a mistake</b> at the end of that chapter: it comes with the chapter’s name already filled in.</p>` }
  };
  PAGES.page = function (r) {
    var p = LEGAL[r.slug];
    if (!p) return PAGES.notfound();
    setMeta(p.title, p.desc, SELF + '/' + r.slug + '/');
    var w = el('div', { 'class': 'wrap page-doc', style: 'max-width:720px' }, [el('h1', { text: p.title }), el('div', { 'class': 'doc-body', html: p.html })]);
    if (p.form) w.appendChild(el('section', { 'class': 'set-sec card' }, [formBox([
      { key: 'name', label: 'Your name' },
      { key: 'email', label: 'Your e-mail', type: 'email', required: true, hint: 'So we can reply.' },
      { key: 'topic', label: 'About', type: 'select', required: true, options: ['A question', 'Feedback', 'Request a novel', 'Rights holder request', 'Something else'] },
      { key: 'message', label: 'Your message', type: 'textarea', rows: 6, required: true }],
      'Send message', function (v) { return { subject: '[Contact] ' + v.topic, message: ['[Contact] ' + v.topic, '', v.message].join('\n') }; }, 'Thank you! Your message is in; we will reply by e-mail.')]));
    w.appendChild(footer());
    return w;
  };

  /* ---------------- Listen: the chapter read aloud (works in Edge, Chrome, Safari and on phones) ----------------
     The browser's own "Read aloud" stops at ads, cards and re-drawn parts of a page. This one reads only the story:
     one short piece at a time (long pieces get cut off by speech engines), highlights what is being read, scrolls along,
     goes on to the next chapter by itself, and keeps the screen awake. Voices come from the device (Edge has natural ones). */
  /* The recorded chapters (novel-audio releases) are made for the YouTube channel, not for this website: the site reads with the browser's own voices.
     Set USE_RECORDED to true to offer them here again (the code for it is kept). */
  var USE_RECORDED = false, USE_NEURAL = false;   // USE_NEURAL: the in-browser Piper voice (owner dropped it, 2026-11-15; code kept)
  var TTS = { src: (function () { var v = store.get('gco-app-tts-src', 'voice'); return (v === 'rec' && !USE_RECORDED) || (v === 'neural' && !USE_NEURAL) ? 'voice' : v; })(), ntok: 0, nq: null, status: '', mode: 'voice', fa: null, ftok: 0, ctx: null, parts: [], i: 0, on: false, open: false, bar: null, token: 0, resumeNext: false, wake: null, mark: null, guard: 0,
    rate: +store.get('gco-app-tts-rate', 1) || 1, voice: store.get('gco-app-tts-voice', ''), auto: store.get('gco-app-tts-auto', true) !== false };
  function ttsOk() { return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }
  function ttsChunks(text) {
    var out = [], sentences = text.match(/[^.!?…]+(?:[.!?…]+["”’')\]]*|$)\s*/g) || [text], cur = '';
    sentences.forEach(function (s) {
      if (cur && (cur + s).length > 220) { out.push(cur.trim()); cur = ''; }
      cur += s;
    });
    if (cur.trim()) out.push(cur.trim());
    var fine = [];
    out.forEach(function (c) {   // a very long sentence is cut at a space
      while (c.length > 260) { var k = c.lastIndexOf(' ', 220); if (k < 80) k = 220; fine.push(c.slice(0, k).trim()); c = c.slice(k).trim(); }
      if (c) fine.push(c);
    });
    return fine;
  }
  function ttsBuild(textEl) {
    var parts = [];
    $$(':scope > p, :scope > h2, :scope > h3, :scope > h4, :scope > blockquote, :scope > ul > li, :scope > ol > li', textEl).forEach(function (b) {
      var t = (b.textContent || '').replace(/\s+/g, ' ').trim();
      if (!t || !/[A-Za-z0-9À-￿]/.test(t)) return;   // spacers such as "* * *" are not read
      ttsChunks(t).forEach(function (c, k) { parts.push({ el: b, text: c, first: k === 0 }); });
    });
    return parts;
  }
  function ttsVoices() { return (window.speechSynthesis.getVoices() || []).filter(function (v) { return /^en/i.test(v.lang); }); }
  function ttsPick() {
    var vs = ttsVoices(), by = function (re) { return vs.filter(function (v) { return re.test(v.name); })[0]; }, pick;
    if (TTS.voice) pick = vs.filter(function (v) { return v.name === TTS.voice; })[0];
    return pick || by(/natural/i) || by(/online/i) || by(/google us english|samantha|aria|jenny|guy/i) || vs.filter(function (v) { return /^en-US/i.test(v.lang); })[0] || vs[0] || null;
  }
  function ttsMark(el) {
    if (TTS.mark === el) return;
    if (TTS.mark) TTS.mark.classList.remove('tts-now');
    TTS.mark = el;
    if (!el) return;
    el.classList.add('tts-now');
    var r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > innerHeight - 190) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function ttsLabels() {
    if (!TTS.bar) return;
    var play = $('.tts-play', TTS.bar);
    play.innerHTML = icon(TTS.on ? 'pause' : 'play');
    play.setAttribute('aria-label', TTS.on ? 'Pause' : 'Play');
    var lab = $('.tts-title', TTS.bar);
    if (lab && TTS.ctx) lab.textContent = TTS.status || TTS.ctx.title;
  }
  function ttsSpeak() {
    var tok = ++TTS.token;
    clearTimeout(TTS.guard);
    if (!TTS.on) return;
    if (TTS.i >= TTS.parts.length) return ttsFinished();
    var p = TTS.parts[TTS.i], u = new SpeechSynthesisUtterance(p.text), v = ttsPick(), done = false;
    ttsMark(p.el);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
    u.rate = TTS.rate;
    function next() { if (done || tok !== TTS.token) return; done = true; clearTimeout(TTS.guard); TTS.i++; ttsSpeak(); }
    u.onend = next;
    u.onerror = function (e) { if (tok !== TTS.token || (e && (e.error === 'canceled' || e.error === 'interrupted'))) return; next(); };
    TTS.cur = u;   // some browsers drop an utterance nothing refers to, and it then never ends
    window.speechSynthesis.speak(u);
    // a voice that never reports its end must not freeze the reading
    TTS.guard = setTimeout(function () {
      if (!done && tok === TTS.token && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) next();
    }, Math.max(5000, p.text.length * 120 / TTS.rate) + 5000);
  }
  function ttsFinished() {
    var nx = TTS.ctx && TTS.ctx.next;
    if (TTS.auto && nx && !nx[4]) { TTS.resumeNext = true; TTS.on = false; ttsLabels(); go('/read/' + nx[0] + '/'); return; }
    ttsPause(); TTS.i = 0;
    toast(nx ? 'End of chapter.' : 'You have reached the latest chapter.');
  }
  function ttsPause() {
    TTS.on = false; TTS.token++; clearTimeout(TTS.guard);
    if (TTS.fa && (TTS.mode === 'file' || TTS.mode === 'neural')) TTS.fa.pause();
    try { window.speechSynthesis.cancel(); } catch (e) {}
    ttsLabels(); ttsWake(false); ttsKeep(false);
    if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = 'paused'; } catch (e) {}
  }
  function ttsWake(on) {
    try {
      if (on && navigator.wakeLock && !TTS.wake) navigator.wakeLock.request('screen').then(function (l) { TTS.wake = l; l.addEventListener('release', function () { TTS.wake = null; }); }).catch(function () {});
      if (!on && TTS.wake) { TTS.wake.release(); TTS.wake = null; }
    } catch (e) {}
  }
  /* Phones stop a page's speech when the screen locks unless the page is "playing media". A silent looping sound makes it count as a
     music player (lock-screen controls appear), and a 4-second check un-pauses or restarts the voice if the phone paused it. */
  var SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
  function ttsKeep(on) {
    try {
      if (on) {
        if (!TTS.aud) { TTS.aud = new Audio(SILENT); TTS.aud.loop = true; TTS.aud.setAttribute('playsinline', ''); }
        TTS.aud.play().catch(function () {});
        if (!TTS.beat) TTS.beat = setInterval(function () {
          if (!TTS.on) return;
          var ss = window.speechSynthesis;
          if (ss.paused) ss.resume();
          else if (!ss.speaking && !ss.pending) ttsSpeak();
          if (TTS.aud && TTS.aud.paused) TTS.aud.play().catch(function () {});
        }, 4000);
      } else {
        if (TTS.aud) TTS.aud.pause();
        clearInterval(TTS.beat); TTS.beat = 0;
      }
    } catch (e) {}
  }
  function ttsPlay() {
    if (!TTS.ctx) return;
    if (TTS.mode === 'neural') {
      TTS.on = true; ttsLabels(); ttsWake(true);
      if (TTS.nq.at < 0 || TTS.nq.wait >= 0) ttsNStep(Math.max(0, TTS.nq.at + (TTS.nq.wait >= 0 ? 1 : 0)));
      else { var pn = TTS.fa.play(); if (pn && pn.catch) pn.catch(function () {}); }
      if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = 'playing'; } catch (e) {}
      return;
    }
    if (TTS.mode === 'file') {
      TTS.on = true; ttsLabels(); ttsWake(true);
      TTS.fa.playbackRate = TTS.rate;
      var pr = TTS.fa.play(); if (pr && pr.catch) pr.catch(function () { TTS.on = false; ttsLabels(); });
      if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = 'playing'; } catch (e) {}
      return;
    }
    TTS.on = true; ttsLabels(); ttsWake(true); ttsKeep(true);
    if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = 'playing'; } catch (e) {}
    ttsSpeak();
  }
  function ttsToggle() { if (TTS.probing) return; if (TTS.on) ttsPause(); else ttsPlay(); }
  function ttsSkip(dir) {
    if (TTS.mode === 'neural' && TTS.nq) { var q = TTS.nq, to = q.at + (dir > 0 ? 1 : (TTS.fa.currentTime > 3 || !q.url[q.at - 1] ? 0 : -1)); if (to === q.at && dir < 0) TTS.fa.currentTime = 0; else ttsNStep(Math.max(0, to)); return; }
    if (TTS.mode === 'file') { TTS.fa.currentTime = Math.max(0, TTS.fa.currentTime + (dir > 0 ? 30 : -15)); return; }
    var j = TTS.i;
    if (dir > 0) { j++; while (j < TTS.parts.length && !TTS.parts[j].first) j++; if (j >= TTS.parts.length) j = TTS.parts.length - 1; }
    else { j--; while (j > 0 && !TTS.parts[j].first) j--; j = Math.max(0, j - (TTS.parts[TTS.i] && TTS.parts[TTS.i].first ? 0 : 0)); }
    TTS.i = Math.max(0, j); TTS.token++;
    try { window.speechSynthesis.cancel(); } catch (e) {}
    if (TTS.on) ttsSpeak(); else ttsMark(TTS.parts[TTS.i] && TTS.parts[TTS.i].el);
  }
  function ttsRestartHere() { if (!TTS.on) return; TTS.token++; try { window.speechSynthesis.cancel(); } catch (e) {} ttsSpeak(); }
  function ttsClose() {
    ttsPause(); ttsMark(null); TTS.open = false;
    ttsNStop();
    if (TTS.fa) { TTS.ftok++; TTS.fa.removeAttribute('src'); TTS.fa.load(); }
    if (TTS.bar) { TTS.bar.remove(); TTS.bar = null; }
    doc.body.classList.remove('has-tts');
  }
  function ttsFirstVisible() {
    for (var k = 0; k < TTS.parts.length; k++) if (TTS.parts[k].first && TTS.parts[k].el.getBoundingClientRect().bottom > 120) return k;
    return 0;
  }
  function ttsMeasure() { var b = $('.rd-bar'); if (b) doc.documentElement.style.setProperty('--rdbar-h', b.offsetHeight + 'px'); }
  function ttsBar() {
    if (TTS.bar) return TTS.bar;
    var speeds = [0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2], rate = el('select', { 'aria-label': 'Speed' }, speeds.map(function (s) { return el('option', { value: s, text: s + 'x' }); })),
      src = el('select', { 'aria-label': 'Where the voice comes from' }, [USE_RECORDED ? el('option', { value: 'rec', text: 'Recorded voice' }) : null, el('option', { value: 'voice', text: 'Voices on my device' }), USE_NEURAL ? el('option', { value: 'neural', text: 'Natural voice (keeps playing when locked)' }) : null]), voice = el('select', { 'aria-label': 'Voice' }), auto = el('input', { type: 'checkbox', id: 'tts-auto' });
    rate.value = String(TTS.rate); auto.checked = TTS.auto;
    rate.onchange = function () { TTS.rate = +rate.value; store.set('gco-app-tts-rate', TTS.rate); if (TTS.mode === 'file' || TTS.mode === 'neural') TTS.fa.playbackRate = TTS.rate; else ttsRestartHere(); };
    voice.onchange = function () { TTS.voice = voice.value; store.set('gco-app-tts-voice', TTS.voice); ttsRestartHere(); };
    src.value = TTS.src; src.hidden = !USE_RECORDED && !USE_NEURAL;
    src.onchange = function () {
      var f = TTS.mode === 'file', pos = f && TTS.fa ? TTS.fa.currentTime : 0;
      TTS.src = src.value; store.set('gco-app-tts-src', TTS.src);
      var was = TTS.on;
      ttsPause();
      if (!f) TTS.i = ttsFirstVisible();
      ttsStart();
    };
    auto.onchange = function () { TTS.auto = auto.checked; store.set('gco-app-tts-auto', TTS.auto); };
    function fill() {
      var vs = ttsVoices(), cur = (ttsPick() || {}).name;
      voice.innerHTML = '';
      vs.forEach(function (v) { voice.appendChild(el('option', { value: v.name, text: v.name.replace(/^Microsoft\s+/, '').replace(/\s*-\s*English.*$/, '') + (/natural|online/i.test(v.name) ? ' ★' : '') })); });
      if (cur) voice.value = cur;
      voice.hidden = vs.length < 2;
    }
    fill();
    try { window.speechSynthesis.addEventListener('voiceschanged', fill); } catch (e) {}
    TTS.bar = el('div', { 'class': 'tts', role: 'region', 'aria-label': 'Listen to this chapter' }, [
      el('div', { 'class': 'tts-row' }, [
        el('button', { type: 'button', 'class': 'icon-btn tts-prev', 'aria-label': 'Previous paragraph', html: icon('prev'), onclick: function () { ttsSkip(-1); } }),
        el('button', { type: 'button', 'class': 'icon-btn tts-play', 'aria-label': 'Play', html: icon('play'), onclick: ttsToggle }),
        el('button', { type: 'button', 'class': 'icon-btn tts-nextb', 'aria-label': 'Next paragraph', html: icon('next'), onclick: function () { ttsSkip(1); } }),
        el('span', { 'class': 'tts-title' }),
        el('button', { type: 'button', 'class': 'icon-btn', 'aria-label': 'Close the player', html: icon('x'), onclick: ttsClose })]),
      el('div', { 'class': 'tts-row tts-seekrow', hidden: true }, [el('input', { type: 'range', 'class': 'tts-seek', min: 0, max: 100, value: 0, 'aria-label': 'Position in the chapter' }), el('span', { 'class': 'tts-time' })]),
      el('div', { 'class': 'tts-row tts-opts' }, [src, rate, voice, el('label', { 'class': 'tts-auto', 'for': 'tts-auto' }, [auto, 'Next chapter'])])]);
    var sk = $('.tts-seek', TTS.bar);
    sk.oninput = function () { TTS.drag = true; };
    sk.onchange = function () { TTS.drag = false; if (TTS.fa) TTS.fa.currentTime = +sk.value; };
    doc.body.appendChild(TTS.bar);
    doc.body.classList.add('has-tts');
    ttsMeasure();
    if ('mediaSession' in navigator) try {
      var ms = navigator.mediaSession;
      ms.setActionHandler('play', ttsPlay); ms.setActionHandler('pause', ttsPause);
      ms.setActionHandler('previoustrack', function () { ttsSkip(-1); }); ms.setActionHandler('nexttrack', function () { ttsSkip(1); });
      ms.setActionHandler('seekbackward', function () { if (TTS.mode === 'file') ttsSkip(-1); }); ms.setActionHandler('seekforward', function () { if (TTS.mode === 'file') ttsSkip(1); });
      ms.setActionHandler('seekto', function (d) { if (TTS.mode === 'file' && d.seekTime != null) TTS.fa.currentTime = d.seekTime; });
    } catch (e) {}
    return TTS.bar;
  }
  function ttsOpen() {
    if (!TTS.ctx) return;
    TTS.open = true; TTS.probing = true;
    TTS.parts = ttsBuild(TTS.ctx.el);
    ttsBar();
    TTS.i = ttsFirstVisible();
    if ('mediaSession' in navigator) try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: TTS.ctx.title, artist: TTS.ctx.novel, album: 'GroupChatOn', artwork: TTS.ctx.cover ? [{ src: TTS.ctx.cover, sizes: '320x480' }] : [] });
    } catch (e) {}
    ttsStart();
  }
  /* ---- "Natural, keeps playing when locked": a small open-source voice (Piper) runs inside the page and makes real audio, which one
     audio element plays. A phone treats that like music, so it goes on with the screen locked (device voices are stopped by the phone).
     The voice file (about 60 MB) is downloaded once and kept by the browser. Sections are made a little ahead of what is playing. ---- */
  var PIPER = 'https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/+esm', PIPER_VOICE = 'en_US-hfc_female-medium', NL = { lib: null };
  function ttsStatus(msg) { TTS.status = msg || ''; var lab = TTS.bar && $('.tts-title', TTS.bar); if (lab) lab.textContent = TTS.status || (TTS.ctx ? TTS.ctx.title : ''); }
  function ttsNeural(done) {
    var tok = ++TTS.ntok, chunks = [], cur = null, i;
    for (i = Math.max(0, TTS.i); i < TTS.parts.length; i++) {   // sections of about 350 letters, from the paragraph on the screen
      if (!cur || (cur.text.length > 330) || TTS.parts[i].first && cur.text.length > 120) { cur = { from: i, text: '' }; chunks.push(cur); }
      cur.text += (cur.text ? ' ' : '') + TTS.parts[i].text;
    }
    TTS.nq = { tok: tok, chunks: chunks, url: [], gen: 0, at: -1, wait: -1, busy: false };
    ttsStatus('Getting the natural voice ready…');
    if (!NL.lib) NL.lib = import(PIPER).catch(function (e) { NL.lib = null; throw e; });
    NL.lib.then(function (lib) {
      if (tok !== TTS.ntok) return;
      NL.mod = lib;
      if (!TTS.nbound) {
        TTS.nbound = true;
        var fa = TTS.fa || (TTS.fa = new Audio());
        fa.addEventListener('ended', function () { if (TTS.mode === 'neural') ttsNStep(TTS.nq.at + 1); });
        fa.addEventListener('pause', function () { if (TTS.mode === 'neural' && TTS.on && !TTS.nq.step && !fa.ended && doc.visibilityState !== 'hidden') { TTS.on = false; ttsLabels(); } });
        fa.addEventListener('play', function () { if (TTS.mode === 'neural' && !TTS.on) { TTS.on = true; ttsLabels(); } });
      }
      done('neural');
    }, function () { toast('The natural voice could not be loaded here. Using this device’s voice.'); TTS.src = 'voice'; done(false); });
  }
  function ttsNGen() {   // makes the sections ahead (3 at most), one at a time
    var q = TTS.nq;
    if (!q || q.busy || q.tok !== TTS.ntok || TTS.mode !== 'neural') return;
    if (q.gen >= q.chunks.length || q.gen - Math.max(q.at, 0) >= 3) return;
    var k = q.gen; q.busy = true;
    if (q.wait === k && !q.url[k]) ttsStatus(k === 0 && !NL.warm ? 'Downloading the voice (first time only)…' : 'Preparing the next part…');
    NL.mod.predict({ text: q.chunks[k].text, voiceId: PIPER_VOICE }, function (p) {
      if (k === 0 && !NL.warm && p && p.total) ttsStatus('Downloading the voice… ' + Math.round(100 * p.loaded / p.total) + '%');
    }).then(function (blob) {
      NL.warm = true; q.busy = false;
      if (q.tok !== TTS.ntok) return;
      q.url[k] = URL.createObjectURL(blob); q.gen = k + 1;
      if (q.wait === k) ttsNStep(k); else ttsNGen();
    }, function () { q.busy = false; if (q.tok === TTS.ntok) { toast('The natural voice stopped. Using this device’s voice.'); TTS.src = 'voice'; ttsStart(); } });
  }
  function ttsNStep(k) {
    var q = TTS.nq;
    if (!q || q.tok !== TTS.ntok) return;
    if (k >= q.chunks.length) {   // end of the chapter: on to the next one, on the same audio element
      var nx = TTS.ctx && TTS.ctx.next;
      if (TTS.auto && nx) { TTS.resumeNext = true; go('/read/' + nx[0] + '/'); } else { ttsPause(); ttsStatus(''); toast(nx ? 'End of chapter.' : 'You have reached the latest chapter.'); }
      return;
    }
    if (!q.url[k]) { q.wait = k; q.at = k - 1; ttsGenKick(); return; }
    q.wait = -1; q.step = true;
    var fa = TTS.fa;
    fa.src = q.url[k]; fa.playbackRate = TTS.rate; fa.preservesPitch = true;
    q.at = k; TTS.i = q.chunks[k].from;
    var pr = fa.play(); if (pr && pr.catch) pr.catch(function () { TTS.on = false; ttsLabels(); });
    q.step = false;
    ttsStatus('');
    ttsMark(TTS.parts[q.chunks[k].from] && TTS.parts[q.chunks[k].from].el);
    if (q.url[k - 2]) { URL.revokeObjectURL(q.url[k - 2]); q.url[k - 2] = null; }
    ttsNGen();
  }
  function ttsGenKick() { var q = TTS.nq; if (q && !q.busy) { if (q.gen <= q.wait) ttsNGen(); } }
  function ttsNStop() {
    TTS.ntok++;
    var q = TTS.nq;
    if (q) { q.url.forEach(function (u) { if (u) URL.revokeObjectURL(u); }); }
    TTS.nq = null; ttsStatus('');
    if (TTS.fa) { try { TTS.fa.pause(); } catch (e) {} }
  }
  /* the listener's choice: the recorded chapter (one voice) or the voices of this device (any of them, e.g. Ava Online Natural) */
  function ttsStart() {
    TTS.probing = true;
    if (TTS.nq) ttsNStop();
    var cb = function (ok) {
      if (!ok && !ttsOk()) { toast('This chapter has no recording yet, and this browser cannot read it aloud.'); ttsClose(); return; }
      TTS.probing = false;
      TTS.mode = ok === 'neural' ? 'neural' : ok ? 'file' : 'voice';
      // only ONE of the two may sound: the recording, or the device voice
      TTS.token++; clearTimeout(TTS.guard);
      try { window.speechSynthesis.cancel(); } catch (e) {}
      if (ok) { TTS.on = false; ttsKeep(false); ttsMark(null); } else if (TTS.fa) TTS.fa.pause();
      ttsLook(); ttsPlay();
    };
    if (TTS.src === 'neural') ttsNeural(cb);
    else if ((TTS.src === 'voice' || !USE_RECORDED) && ttsOk()) { if (TTS.fa) { TTS.ftok++; TTS.fa.pause(); } cb(false); } else ttsFile(cb);
  }
  /* The recorded chapter (release file of the novel-audio repository), when there is one. ONE audio element lives for the whole visit:
     a phone keeps playing it with the screen locked and lets it go on to the next chapter. Without a file the device voice reads. */
  var AUDIO = 'https://github.com/raimayank7/novel-audio/releases/download/';
  function ttsFile(done) {
    var fa = TTS.fa || (TTS.fa = new Audio()), key = TTS.ctx.key, finished = false, tok = ++TTS.ftok, t, want = AUDIO + 'n-' + TTS.ctx.nid + '/' + key.replace(/\//g, '_') + '.mp3';
    fa.preload = 'metadata'; fa.setAttribute('playsinline', '');
    if (fa.src === want && !fa.error && fa.readyState > 0) return done(true);   // already loaded: the player moved on to this chapter by itself
    function end(ok) { if (finished || tok !== TTS.ftok) return; finished = true; fa.removeEventListener('loadedmetadata', good); fa.removeEventListener('error', bad); clearTimeout(t); done(ok); }
    function good() { end(true); }
    function bad() { end(false); }
    fa.addEventListener('loadedmetadata', good); fa.addEventListener('error', bad);
    t = setTimeout(bad, 7000);
    if (!TTS.faBound) {
      TTS.faBound = true;
      fa.addEventListener('ended', function () {
        if (TTS.mode !== 'file') return;
        var nx = TTS.ctx && TTS.ctx.next;
        if (TTS.auto && nx) {   // straight on to the next recording on the same element (no gap for a locked phone), then the page follows
          fa.src = AUDIO + 'n-' + TTS.ctx.nid + '/' + nx[0].replace(/\//g, '_') + '.mp3';
          var pr = fa.play(); if (pr && pr.catch) pr.catch(function () {});
          TTS.resumeNext = true; go('/read/' + nx[0] + '/');
        } else ttsFinished();
      });
      fa.addEventListener('timeupdate', ttsTime);
      fa.addEventListener('pause', function () { if (TTS.mode === 'file' && TTS.on && !fa.ended && doc.visibilityState !== 'hidden') { TTS.on = false; ttsLabels(); } });
      fa.addEventListener('play', function () { if (TTS.mode === 'file' && !TTS.on) { TTS.on = true; ttsLabels(); } });
    }
    if (fa.src !== want) { fa.src = want; fa.load(); } else if (fa.error) fa.load();
  }
  function ttsFmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function ttsTime() {
    var fa = TTS.fa, sk = TTS.bar && $('.tts-seek', TTS.bar);
    if (!fa || TTS.mode !== 'file' || !sk) return;
    if (fa.duration) { sk.max = Math.floor(fa.duration); if (!TTS.drag) sk.value = Math.floor(fa.currentTime); }
    var tm = $('.tts-time', TTS.bar); if (tm) tm.textContent = ttsFmt(fa.currentTime) + ' / ' + ttsFmt(fa.duration);
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && fa.duration) try { navigator.mediaSession.setPositionState({ duration: fa.duration, position: Math.min(fa.currentTime, fa.duration), playbackRate: fa.playbackRate || 1 }); } catch (e) {}
  }
  function ttsLook() {   // a recorded chapter shows a seek bar and time; the device voice shows paragraph buttons
    if (!TTS.bar) return;
    var f = TTS.mode === 'file', nn = TTS.mode === 'neural';
    $('.tts-seekrow', TTS.bar).hidden = !f;
    $('.tts-opts select[aria-label="Voice"]', TTS.bar).style.display = f || nn ? 'none' : '';
    if (nn) { TTS.fa.playbackRate = TTS.rate; $('.tts-prev', TTS.bar).setAttribute('aria-label', 'Previous section'); $('.tts-nextb', TTS.bar).setAttribute('aria-label', 'Next section'); return; }
    $('.tts-prev', TTS.bar).setAttribute('aria-label', f ? 'Back 15 seconds' : 'Previous paragraph');
    $('.tts-nextb', TTS.bar).setAttribute('aria-label', f ? 'Forward 30 seconds' : 'Next paragraph');
    if (f) { TTS.fa.playbackRate = TTS.rate; TTS.fa.preservesPitch = true; ttsTime(); }
  }
  /* called when a chapter is on the screen: remembers it, and goes on reading when the last chapter ended while listening */
  function ttsReady(n, ch, key, textEl, next) {
    TTS.ctx = { el: textEl, title: ch.t || key, novel: n ? novelName(n) : 'GroupChatOn', next: next, key: key, nid: n ? n.id : '', cover: n && n.cover ? coverUrl(n.cover, 320) : '' };
    if (TTS.bar) { ttsMeasure(); ttsLabels(); }
    if (TTS.resumeNext) { TTS.resumeNext = false; setTimeout(function () { if (TTS.ctx && TTS.ctx.key === key) ttsOpen(); }, 500); }
  }
  doc.addEventListener('visibilitychange', function () { if (!doc.hidden && TTS.on) ttsWake(true); });
  window.addEventListener('pagehide', function () { try { window.speechSynthesis.cancel(); } catch (e) {} });

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
