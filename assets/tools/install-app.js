/* Infinity by GroupChatOn — install-app. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Install as an app: step-by-step "add to home screen" for this phone or computer (Android, iPhone, iPad, Windows, Mac), a one-tap install where the browser allows it,
   and a direct app link (with QR) for any Infinity tool. */
GCOTools.register('install-app', function (spot, T) {
  var h = T.h, status = T.status(), C = window.GCO || {}, prompt = null;
  function detect(ua, touch) {
    ua = ua || '';
    var ios = /iPhone|iPod/.test(ua) || (/iPad/.test(ua) || (/Macintosh/.test(ua) && touch > 1)) ;
    if (ios) return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? (/iPad|Macintosh/.test(ua) ? 'ipad-other' : 'ios-other') : (/iPad|Macintosh/.test(ua) ? 'ipad' : 'ios');
    if (/Android/.test(ua)) return /SamsungBrowser/.test(ua) ? 'samsung' : /Firefox/.test(ua) ? 'android-firefox' : 'android';
    if (/Edg\//.test(ua)) return 'edge';
    if (/Firefox/.test(ua)) return 'firefox';
    if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua)) return 'mac-safari';
    return 'chrome';
  }
  var STEPS = {
    ios: ['iPhone (Safari)', ['Tap the Share button (the square with an arrow) at the bottom of Safari.', 'Scroll down and tap “Add to Home Screen”.', 'Keep or change the name, then tap Add.', 'Open it from your home screen: it opens full screen like an app.']],
    'ios-other': ['iPhone (Chrome, Edge or Firefox)', ['Tap the Share button (in Chrome it is at the top right, next to the address).', 'Tap “Add to Home Screen”. If you do not see it, open this page in Safari and use Share → Add to Home Screen.', 'Tap Add.']],
    ipad: ['iPad (Safari)', ['Tap the Share button at the top right of Safari.', 'Tap “Add to Home Screen”.', 'Tap Add.']],
    'ipad-other': ['iPad (Chrome, Edge or Firefox)', ['Tap the Share button next to the address bar.', 'Tap “Add to Home Screen” (or open the page in Safari to do it).', 'Tap Add.']],
    android: ['Android (Chrome)', ['Tap the ⋮ menu at the top right.', 'Tap “Install app” or “Add to Home screen”.', 'Tap Install. The app appears on your home screen and in your app list.']],
    samsung: ['Android (Samsung Internet)', ['Tap the ☰ menu at the bottom right.', 'Tap “Add page to” → “Home screen” (or the install icon in the address bar).', 'Tap Add.']],
    'android-firefox': ['Android (Firefox)', ['Tap the ⋮ menu.', 'Tap “Install” or “Add to Home screen”.', 'Tap Add.']],
    chrome: ['Computer (Chrome)', ['Click the install icon at the right end of the address bar (a screen with a down arrow).', 'Or open the ⋮ menu → “Cast, save and share” → “Install page as app”.', 'Click Install. It opens in its own window and can be pinned to the taskbar or Dock.']],
    edge: ['Computer (Microsoft Edge)', ['Click the ⋯ menu at the top right.', 'Choose Apps → “Install this site as an app”.', 'Click Install, then pin it to the taskbar or Start if you like.']],
    'mac-safari': ['Mac (Safari 17 or newer)', ['Click File in the menu bar (or the Share button).', 'Choose “Add to Dock”.', 'Click Add. It opens in its own window from the Dock.']],
    firefox: ['Computer (Firefox)', ['Firefox on computers cannot install web apps.', 'Use Chrome or Edge to install it, or simply bookmark the page (Ctrl + D, or Cmd + D on a Mac).']]
  };
  function appBase() { return C.isApp ? location.origin + '/' : (C.appUrl || 'https://novel.groupchaton.com/').replace(/\/?$/, '/'); }
  function appLink(id) { return id ? appBase() + 't/' + id + '/' : appBase(); }
  var me = detect(navigator.userAgent, navigator.maxTouchPoints || 0), which = me;
  var stepsBox = h('ol', { style: 'margin:0;padding-left:22px;display:grid;gap:8px;font-size:15.5px' }), head = h('b', { 'data-out': '', style: 'font-size:17px' });
  var dev = T.select(Object.keys(STEPS).map(function (k) { return [k, STEPS[k][0] + (k === me ? ' — this device' : '')]; }), me);
  var installBtn = T.button('Install now', { primary: true, onclick: function () { if (!prompt) return; prompt.prompt(); prompt.userChoice.then(function (r) { status[r.outcome === 'accepted' ? 'ok' : 'info'](r.outcome === 'accepted' ? 'Installed! Look for it on your home screen or app list.' : 'Not installed. You can do it later from the browser menu.'); prompt = null; installBtn.hidden = true; }); } });
  installBtn.hidden = true;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); prompt = e; installBtn.hidden = false; });
  function draw() { var s = STEPS[which]; head.textContent = 'How to install on ' + s[0]; stepsBox.innerHTML = ''; s[1].forEach(function (x) { stepsBox.appendChild(h('li', { text: x })); }); }
  dev.addEventListener('change', function () { which = dev.value; draw(); });
  var pick = h('select', { 'aria-label': 'Tool' }, [h('option', { value: '', text: 'The whole Infinity app (all tools)' })]), link = h('input', { type: 'text', readonly: true, 'class': 'tmono', 'aria-label': 'App link' }), qrBox = h('div', { style: 'text-align:center' });
  function setLink() { link.value = appLink(pick.value); qrBox.innerHTML = ''; }
  pick.addEventListener('change', setLink);
  T.ready.then(function () {
    T.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (t) { pick.appendChild(h('option', { value: t.id, text: t.icon + ' ' + t.name })); });
  });
  function qr() {
    T.lib('qrcode').then(function (qrcode) { var g = qrcode(0, 'M'); g.addData(link.value, 'Byte'); g.make(); qrBox.innerHTML = ''; qrBox.appendChild(h('img', { src: g.createDataURL(6, 3), alt: 'QR code for the app link', style: 'width:min(200px,60%);image-rendering:pixelated;background:#fff;border-radius:8px' })); qrBox.appendChild(h('p', { 'class': 'tnote', text: 'Scan with your phone camera, open the link, then follow the steps above to install.' })); }, function (e) { status.error(e); });
  }
  var cp = T.button('Copy link', { small: true, onclick: function () { T.copy(link.value, cp); } });
  spot.appendChild(T.card([T.field('Your device and browser', dev), head, stepsBox, T.row([installBtn]), status.el,
    h('hr', { style: 'border:0;border-top:1px solid var(--line);margin:4px 0' }), h('b', { text: 'Install one tool, or the whole app' }),
    T.field('Tool', pick), link, T.row([cp, T.button('QR code for my phone', { small: true, onclick: qr }), T.button('Open', { small: true, onclick: function () { window.open(link.value, '_blank', 'noopener'); } }),
      T.button('Share on WhatsApp', { small: true, onclick: function () { window.open('https://wa.me/?text=' + encodeURIComponent('Free tool that works on any phone, even offline: ' + link.value), '_blank', 'noopener'); } })]), qrBox,
    h('p', { 'class': 'tnote', text: 'Installed tools open full screen, start faster and many work offline. They take almost no space, ask for no permissions and can be removed like any app (long-press the icon → Remove). Records stay on your device.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  pick.style.maxWidth = '100%'; link.style.width = '100%';
  draw(); setLink();
  T.tests['install-app'] = function () {
    var f = [];
    [['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', 0, 'ios'],
     ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1', 0, 'ios-other'],
     ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15', 5, 'ipad'],
     ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15', 0, 'mac-safari'],
     ['Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36', 5, 'samsung'],
     ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36', 5, 'android'],
     ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 Edg/126.0', 0, 'edge'],
     ['Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0', 0, 'firefox']].forEach(function (x) { if (detect(x[0], x[1]) !== x[2]) f.push(x[2] + ' → ' + detect(x[0], x[1])); });
    if (!/\/t\/emi\/$/.test(appLink('emi')) || /\/t\//.test(appLink(''))) f.push('links ' + appLink('emi'));
    if (Object.keys(STEPS).some(function (k) { return STEPS[k][1].length < 2; })) f.push('steps');
    return Promise.resolve({ ok: !f.length, n: 10, fails: f });
  };
});
