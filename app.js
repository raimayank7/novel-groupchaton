/* Infinity App by GroupChatOn (novel.groupchaton.com) — the installable, offline home for tools that keep records.
   An app shell: top bar (back, title, install, theme) + bottom tabs (Home, All tools, Settings); on wide screens the tabs become a side rail.
   Routes: no hash = Home, #all = All tools, #settings = Settings, #<tool-id> = that tool.
   /t/<id>/ is one tool installed on its own (no tabs). ?embed=1 is the view shown inside infinity.groupchaton.com posts (tool only).
   Designed & Developed by Nivesh Sahayak (https://www.niveshsahayak.in/). All rights reserved: see LICENSE. */
(function () {
  'use strict';
  var T = window.GCOTools, h = T.h, app = document.getElementById('app'), root = document.documentElement;
  var embed = root.classList.contains('is-embed');
  var only = window.GCO.only || '';   // novel.groupchaton.com/t/<id>/: one tool, installable on its own
  var $ = function (id) { return document.getElementById(id); };
  var titleEl = $('app-title'), back = $('app-back'), tabs = $('app-tabs');
  if (only) root.classList.add('is-single');

  // ---- offline: the service worker keeps every file of the app on the device ----
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () {});
  function online() { return navigator.onLine; }
  addEventListener('online', function () { route(true); }); addEventListener('offline', function () { route(true); });

  // ---- install (Chrome, Edge, Android); iPhone users get the Share → Add to Home Screen hint ----
  var installBtn = $('app-install'), deferred = null;
  var standalone = root.classList.contains('is-installed'), ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; installBtn.hidden = false; route(true); });
  addEventListener('appinstalled', function () { deferred = null; installBtn.hidden = true; standalone = true; root.classList.add('is-installed'); route(true); });
  function install() {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; installBtn.hidden = true; route(true); });
  }
  installBtn.addEventListener('click', install);

  // ---- light / dark ----
  function theme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('gct-theme', t); } catch (e) {}
  }
  $('app-theme').addEventListener('click', function () { theme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });

  // ---- back: to the screen you came from inside the app, else Home ----
  var depth = 0;
  back.addEventListener('click', function () { if (depth > 0) history.back(); else location.hash = ''; });

  // ---- inside an infinity post: tell the page our height so the frame fits ----
  if (embed && window.parent !== window) {
    var post = function () { parent.postMessage({ gcoApp: 'height', h: Math.ceil(app.getBoundingClientRect().height) + 8 }, '*'); };
    if (window.ResizeObserver) new ResizeObserver(post).observe(app);
    addEventListener('load', post);
    parent.postMessage({ gcoApp: 'ready' }, '*');
  }

  // ---- recently opened tools (this device only) ----
  function recent() { try { return JSON.parse(localStorage.getItem('gco-app-recent')) || []; } catch (e) { return []; } }
  function used(id) { var r = recent().filter(function (x) { return x !== id; }); r.unshift(id); try { localStorage.setItem('gco-app-recent', JSON.stringify(r.slice(0, 6))); } catch (e) {} }

  function appTools() { return T.list.filter(function (t) { return t.app; }); }
  // the app's own sections (the site files every record tool under one category); a new app tool lands in "More" until listed here
  var GROUPS = [
    { id: 'bill', name: 'Billing', color: '#8B7CFF', ids: ['invoice', 'quotation', 'receipt', 'proforma-invoice', 'credit-note', 'delivery-challan', 'purchase-order', 'gst-register'] },
    { id: 'shop', name: 'Shop & staff', color: '#22D3EE', ids: ['book-keeper', 'customer-book', 'stock-register', 'attendance', 'salary-register', 'milk-hisab'] },
    { id: 'money', name: 'Money', color: '#4ADE80', ids: ['money-manager', 'lend-borrow', 'bill-reminders', 'rent-tracker', 'portfolio', 'kitty-tracker', 'shagun-register'] },
    { id: 'life', name: 'Personal', color: '#F472B6', ids: ['health-log', 'medicine-schedule', 'workout-log', 'diary', 'reading-log', 'study-planner', 'recipe-book', 'vehicle-log', 'my-data'] }];
  var MORE = { id: 'more', name: 'More', color: '#FBBF24', ids: [] };
  function groupOf(t) { return GROUPS.filter(function (g) { return g.ids.indexOf(t.id) >= 0; })[0] || MORE; }
  function grouped(tools) {   // [{g, tools}] in section order, each section in its listed order, empty ones left out
    return GROUPS.concat([MORE]).map(function (g) {
      var mine = tools.filter(function (t) { return groupOf(t) === g; });
      mine.sort(function (a, b) { return (g.ids.indexOf(a.id) + 1 || 99) - (g.ids.indexOf(b.id) + 1 || 99); });
      return { g: g, tools: mine };
    }).filter(function (x) { return x.tools.length; });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tile(t, i) {
    return h('a', { 'class': 'thub-card app-tile', href: '#' + t.id, style: '--cc:' + groupOf(t).color, title: t.desc }, [
      typeof i === 'number' ? h('i', { 'class': 'app-idx', 'aria-hidden': 'true', text: pad(i + 1) }) : null,
      h('span', { 'class': 'thub-ic', 'aria-hidden': 'true', text: t.icon }), h('b', { text: t.name.replace(/ (Generator|and Statement Generator|Maker)$/, '') })]);
  }
  function row(t) {
    var g = groupOf(t);
    return h('a', { 'class': 'thub-card app-row', href: '#' + t.id, style: '--cc:' + g.color }, [
      h('span', { 'class': 'thub-ic', 'aria-hidden': 'true', text: t.icon }),
      h('span', {}, [h('b', { text: t.name }), h('small', { text: t.desc }), h('em', { 'class': 'app-tag', text: g.name })]),
      h('i', { 'class': 'app-chev', 'aria-hidden': 'true', text: '›' })]);
  }
  // the console-style panel at the top of Home: what the app is, in numbers
  function hero(hi) {
    function stat(v, k) { return h('div', { 'class': 'app-stat' }, [h('b', { text: v }), h('span', { text: k })]); }
    return h('section', { 'class': 'app-hero' }, [
      h('div', { 'class': 'app-hero-bar', 'aria-hidden': 'true' }, [h('i'), h('i'), h('i'), h('code', { text: '~/infinity · ' + (online() ? 'online' : 'offline') })]),
      h('p', { 'class': 'app-hero-hi' }, [h('span', { 'class': 'app-prompt', 'aria-hidden': 'true', text: '>_' }), h('span', { text: hi })]),
      h('h2', {}, ['Your business and ', h('span', { 'class': 'app-grad', text: 'money toolkit' })]),
      h('div', { 'class': 'app-stats' }, [stat(String(appTools().length), 'toolkits'), stat('0 KB', 'uploaded'), stat('100%', 'on device')]),
      chip()]);
  }
  function chip() { return h('span', { 'class': 'app-chip' + (online() ? '' : ' is-off'), text: online() ? '● Online' : '● Offline: everything still works' }); }
  function installCard() {
    if (standalone) return null;
    return h('div', { 'class': 'app-card app-install-card' }, [
      h('b', { text: 'Install Infinity on this device' }),
      h('p', { text: ios ? 'Tap Share, then “Add to Home Screen”. It opens like an app and works without internet.' : 'It opens like an app from your home screen and works without internet.' }),
      deferred ? T.button('Install app', { primary: true, onclick: install }) : (ios ? null : h('p', { 'class': 'app-muted', text: 'Or use your browser menu → “Install app”.' }))]);
  }

  function screen(name, title, kids) {
    document.title = title === 'Infinity' ? 'Infinity App by GroupChatOn' : title + ' · Infinity App';
    titleEl.textContent = title;
    back.hidden = name === 'home' || name === 'all' || name === 'settings' || !!only;
    root.setAttribute('data-screen', name);
    Array.prototype.forEach.call(tabs.querySelectorAll('a'), function (a) { a.classList.toggle('is-on', a.getAttribute('data-tab') === name); a.setAttribute('aria-current', a.getAttribute('data-tab') === name ? 'page' : 'false'); });
    app.innerHTML = '';
    var s = h('div', { 'class': 'app-screen' }, kids.filter(Boolean));
    app.appendChild(s);
  }

  function home() {
    var hr = new Date().getHours(), hi = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    var r = recent().map(T.find).filter(function (t) { return t && t.app; }), n = 0;
    var kids = [hero(hi),
      r.length ? h('h3', { 'class': 'app-h3', text: 'Recent' }) : null,
      r.length ? h('div', { 'class': 'app-strip' }, r.map(function (t) { return tile(t); })) : null];
    grouped(appTools()).forEach(function (x) {   // one titled grid per section, numbered across sections
      kids.push(h('h3', { 'class': 'app-h3', style: '--cc:' + x.g.color, text: x.g.name }),
        h('div', { 'class': 'app-grid' }, x.tools.map(function (t) { return tile(t, n++); })));
    });
    kids.push(installCard(), h('p', { 'class': 'app-note', text: '🔒 Records are saved only on this device. Nothing is uploaded.' }));
    screen('home', 'Infinity', kids);
  }
  function all() {
    var q = h('input', { type: 'search', 'class': 'app-search', placeholder: 'Search toolkits', 'aria-label': 'Search toolkits' }), list = h('div', { 'class': 'app-list' });
    var tools = appTools(), pick = '', count = h('p', { 'class': 'app-count' });
    var chips = h('div', { 'class': 'app-chips', 'aria-label': 'Filter by section' }), sections = grouped(tools);
    function chipBtn(id, label, n) {
      return h('button', { type: 'button', 'class': 'app-fchip', 'aria-pressed': String(pick === id), onclick: function () { pick = id; draw(); } }, [label, h('small', { text: String(n) })]);
    }
    function draw() {
      var s = q.value.trim().toLowerCase();
      chips.innerHTML = '';
      [chipBtn('', 'All', tools.length)].concat(sections.map(function (x) { return chipBtn(x.g.id, x.g.name, x.tools.length); }))
        .forEach(function (b) { chips.appendChild(b); });
      list.innerHTML = '';
      var hits = tools.filter(function (t) { return (!pick || groupOf(t).id === pick) && (!s || (t.name + ' ' + t.desc + ' ' + (t.keywords || []).join(' ')).toLowerCase().indexOf(s) >= 0); });
      grouped(hits).forEach(function (x) {
        list.appendChild(h('h3', { 'class': 'app-h3', style: '--cc:' + x.g.color, text: x.g.name + ' · ' + x.tools.length }));
        x.tools.forEach(function (t) { list.appendChild(row(t)); });
      });
      count.textContent = hits.length + ' of ' + tools.length + ' toolkits · all run on this device';
      if (!hits.length) list.appendChild(h('p', { 'class': 'app-muted', text: 'No toolkit matches “' + q.value + '”.' }));
    }
    q.addEventListener('input', draw);
    screen('all', 'All tools', [h('div', { 'class': 'app-searchbox' }, [q]), chips, count, list,
      h('a', { 'class': 'app-card app-link', href: window.GCO.infinity + '/', target: '_blank', rel: 'noopener' }, [h('b', { text: 'See all ' + T.list.length + ' free tools on Infinity' }), h('span', { text: 'PDF, image, calculators, converters and more  ›' })])]);
    draw();
  }
  function settings() {
    var dark = root.getAttribute('data-theme') === 'dark';
    function item(label, value, onclick, href) {
      var kids = [h('span', { text: label }), value ? h('small', { text: value }) : null, h('i', { 'class': 'app-chev', 'aria-hidden': 'true', text: '›' })];
      return href ? h('a', { 'class': 'app-item', href: href, target: '_blank', rel: 'noopener' }, kids) : h('button', { type: 'button', 'class': 'app-item', onclick: onclick }, kids);
    }
    screen('settings', 'Settings', [
      h('h3', { 'class': 'app-h3', text: 'Appearance' }),
      h('div', { 'class': 'app-group' }, [item('Theme', dark ? 'Dark' : 'Light', function () { theme(dark ? 'light' : 'dark'); settings(); })]),
      h('h3', { 'class': 'app-h3', text: 'This device' }),
      h('div', { 'class': 'app-group' }, [
        h('div', { 'class': 'app-item is-static' }, [h('span', { text: 'Connection' }), h('small', { text: online() ? 'Online' : 'Offline: your tools still work' })]),
        h('div', { 'class': 'app-item is-static' }, [h('span', { text: 'Installed' }), h('small', { text: standalone ? 'Yes' : 'No' })]),
        !standalone && deferred ? item('Install app', '', install) : null]),
      installCard(),
      h('h3', { 'class': 'app-h3', text: 'Your records' }),
      h('p', { 'class': 'app-note', text: 'Invoices, khata and money records are saved only in this browser on this device. Use “Download a backup” inside each tool regularly, and before clearing browser data or changing phones.' }),
      h('h3', { 'class': 'app-h3', text: 'About' }),
      h('div', { 'class': 'app-group' }, [
        item('More free tools on Infinity', '', null, window.GCO.infinity + '/'),
        item('Help and guides', '', null, 'https://help.groupchaton.com/'),
        item('Privacy policy', '', null, window.GCO.infinity + '/p/privacy-policy.html'),
        item('Terms of use', '', null, window.GCO.infinity + '/p/terms-of-use.html'),
        h('div', { 'class': 'app-item is-static' }, [h('span', { text: 'Version' }), h('small', { text: (document.querySelector('script[src*="app.js?v="]') || { src: '' }).src.split('v=')[1] || '' })])]),
      h('p', { 'class': 'app-note app-copy', text: '© ' + new Date().getFullYear() + ' Infinity by GroupChatOn. All rights reserved. Built by Nivesh Sahayak.' })]);
  }
  function tool(id) {
    var t = T.find(id);
    if (!t) return home();
    used(id);
    screen('tool', t.name, [
      embed ? null : h('div', { 'class': 'app-tool-head' }, [h('span', { 'class': 'thub-ic', 'aria-hidden': 'true', text: t.icon }), h('p', { text: t.desc })]),
      only && !standalone ? installCard() : null,
      h('div', { 'class': 'gco-page', 'data-gco-tool': id }, [h('div', { 'class': 'gco-tool-mount' })]),
      only ? h('a', { 'class': 'app-card app-link', href: window.GCO.infinity + '/', target: '_blank', rel: 'noopener' }, [h('b', { text: 'More free tools on Infinity' }), h('span', { text: 'Open infinity.groupchaton.com  ›' })]) : null]);
    T.scan();
  }

  var last = null;
  function route(refresh) {
    var id = only || location.hash.replace(/^#\/?/, '');
    if (refresh && (id && id !== 'all' && id !== 'settings')) return;   // never redraw a tool the user is working in
    if (!refresh) { if (last !== null && id !== last) depth = id ? depth + 1 : 0; last = id; }
    if (refresh) root.setAttribute('data-quiet', ''); else root.removeAttribute('data-quiet');   // status updates redraw without the slide-in
    if (id === 'all') all(); else if (id === 'settings') settings(); else if (id) tool(id); else home();
    if (!refresh) scrollTo(0, 0);
  }
  T.ready.then(function () { route(); addEventListener('hashchange', function () { route(); }); });
})();
