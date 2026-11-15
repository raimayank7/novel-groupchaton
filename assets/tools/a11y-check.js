/* Infinity by GroupChatOn — a11y-check. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Accessibility checker for HTML: alt text, form labels, button and link names, headings, page language and title, ARIA roles and references, keyboard access, zoom blocking and colour contrast of inline styles (WCAG 2.2). */
GCOTools.register('a11y-check', function (spot, T) {
  var h = T.h;
  var ROLES = ('alert alertdialog application article banner blockquote button caption cell checkbox code columnheader combobox complementary contentinfo definition deletion dialog directory document ' +
    'emphasis feed figure form generic grid gridcell group heading img insertion link list listbox listitem log main mark marquee math menu menubar menuitem menuitemcheckbox menuitemradio meter ' +
    'navigation none note option paragraph presentation progressbar radio radiogroup region row rowgroup rowheader scrollbar search searchbox separator slider spinbutton status strong subscript ' +
    'superscript switch tab table tablist tabpanel term textbox time timer toolbar tooltip tree treegrid treeitem').split(' ');
  var ctx = null;
  function rgb(c) {
    if (!ctx) ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = '#010203'; ctx.fillStyle = c;
    var v = ctx.fillStyle;
    if (v === '#010203' && !/^#010203$/i.test(c.trim())) return null;
    if (v[0] === '#') return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16), 1];
    var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(v);
    return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null;
  }
  function lum(c) { return [0, 1, 2].reduce(function (s, i) { var x = c[i] / 255; x = x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); return s + x * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function check(src) {
    var out = [], doc = new DOMParser().parseFromString(src, 'text/html'), clean = src.replace(/<!--[\s\S]*?-->/g, function (m) { return m.replace(/[^\n]/g, ' '); }), full = /<html[\s>]/i.test(src);
    function lineOf(el) {
      var name = el.tagName.toLowerCase(), k = [].indexOf.call(doc.getElementsByTagName(name), el), re = new RegExp('<' + name + '(?=[\\s/>])', 'gi'), m, c = -1;
      while ((m = re.exec(clean))) if (++c === k) return clean.slice(0, m.index).split('\n').length;
      return 0;
    }
    function add(sev, el, wcag, msg) { out.push({ sev: sev, line: el ? lineOf(el) : 0, msg: msg + ' (WCAG ' + wcag + ')' }); }
    function $$(sel) { return [].slice.call(doc.querySelectorAll(sel)); }
    function byId(id) { return doc.getElementById(id); }
    function accName(el) {
      var t = (el.getAttribute('aria-label') || '').trim();
      if (t) return t;
      var lb = el.getAttribute('aria-labelledby');
      if (lb) { t = lb.split(/\s+/).map(function (id) { var x = byId(id); return x ? x.textContent : ''; }).join(' ').trim(); if (t) return t; }
      var txt = '';
      (function walk(n) {
        [].forEach.call(n.childNodes, function (c) {
          if (c.nodeType === 3) txt += c.nodeValue;
          else if (c.nodeType === 1 && c.getAttribute('aria-hidden') !== 'true') {
            var tn = c.tagName.toLowerCase();
            if (tn === 'img' || c.getAttribute('role') === 'img') txt += ' ' + (c.getAttribute('alt') || c.getAttribute('aria-label') || '');
            else if (tn === 'svg') { var ti = c.querySelector('title'); txt += ' ' + (ti ? ti.textContent : c.getAttribute('aria-label') || ''); }
            else walk(c);
          }
        });
      })(el);
      txt = txt.replace(/\s+/g, ' ').trim();
      if (el.tagName === 'INPUT') txt = txt || (el.getAttribute('value') || '').trim() || ({ submit: 'Submit', reset: 'Reset' }[(el.getAttribute('type') || '').toLowerCase()] || '');
      return txt || (el.getAttribute('title') || '').trim();
    }
    if (full) {
      if (!(doc.documentElement.getAttribute('lang') || '').trim()) add('error', null, '3.1.1', 'The page has no language: add lang="en" (or your language) to <html>.');
      if (!(doc.title || '').trim()) add('error', null, '2.4.2', 'The page has no <title>.');
      if (!doc.querySelector('main,[role=main]')) add('warn', null, '1.3.1', 'No <main> landmark: screen-reader users jump to it to skip menus.');
      if (!doc.querySelector('h1,[role=heading][aria-level="1"]')) add('warn', null, '1.3.1', 'No <h1> heading: give the page one main heading.');
    }
    $$('img').forEach(function (el) {
      if (!el.hasAttribute('alt')) add('error', el, '1.1.1', 'Image without alt text. Describe it, or use alt="" if it is only decoration.');
      else if (/\.(png|jpe?g|gif|webp|svg|avif)$|^(image|photo|picture|img|graphic)$/i.test(el.getAttribute('alt').trim())) add('warn', el, '1.1.1', 'Alt text “' + el.getAttribute('alt') + '” does not describe the image.');
    });
    $$('input[type=image]').forEach(function (el) { if (!accName(el) && !el.getAttribute('alt')) add('error', el, '1.1.1', 'Image button without alt text.'); });
    $$('input,select,textarea').forEach(function (el) {
      var type = (el.getAttribute('type') || 'text').toLowerCase();
      if (el.tagName === 'INPUT' && /^(hidden|submit|button|reset|image)$/.test(type)) return;
      var id = el.getAttribute('id'), wrap = el.closest('label');
      var labelled = (id && $$('label').some(function (l) { return l.getAttribute('for') === id && l.textContent.trim(); })) || (wrap && wrap.textContent.trim()) ||
        (el.getAttribute('aria-label') || '').trim() || el.getAttribute('aria-labelledby') || (el.getAttribute('title') || '').trim();
      if (!labelled) add('error', el, '1.3.1, 4.1.2', '<' + el.tagName.toLowerCase() + (el.tagName === 'INPUT' ? ' type="' + type + '"' : '') + '> has no label.' + (el.getAttribute('placeholder') ? ' A placeholder is not a label: it disappears when typing starts.' : ' Add <label for="…">.'));
    });
    $$('button,[role=button],input[type=submit],input[type=button],input[type=reset]').forEach(function (el) { if (!accName(el)) add('error', el, '4.1.2', 'Button with no name: screen readers just say “button”. Add text or aria-label.'); });
    $$('a[href]').forEach(function (el) {
      var n = accName(el);
      if (!n) add('error', el, '2.4.4', 'Link with no text: say where it goes, or add aria-label to an icon link.');
      else if (/^(click here|here|read more|more|link|this|learn more|details)$/i.test(n)) add('warn', el, '2.4.4', 'Link text “' + n + '” does not say where it goes.');
    });
    var last = 0;
    $$('h1,h2,h3,h4,h5,h6').forEach(function (el) {
      var lv = +el.tagName[1];
      if (!accName(el)) add('error', el, '1.3.1', 'Empty <' + el.tagName.toLowerCase() + '> heading.');
      if (last && lv > last + 1) add('warn', el, '1.3.1', 'Heading jumps from H' + last + ' to H' + lv + '.');
      last = lv;
    });
    var ids = {};
    $$('[id]').forEach(function (el) { var id = el.getAttribute('id'); if (ids[id]) add('warn', el, '4.1.1', 'Duplicate id “' + id + '”: labels and ARIA may point at the wrong element.'); ids[id] = 1; });
    $$('[aria-labelledby],[aria-describedby],[aria-controls]').forEach(function (el) {
      ['aria-labelledby', 'aria-describedby', 'aria-controls'].forEach(function (a) {
        (el.getAttribute(a) || '').split(/\s+/).filter(Boolean).forEach(function (id) { if (!byId(id)) add('error', el, '1.3.1', a + ' points to id “' + id + '”, which does not exist.'); });
      });
    });
    $$('[role]').forEach(function (el) { var r = (el.getAttribute('role') || '').trim().split(/\s+/)[0]; if (r && ROLES.indexOf(r.toLowerCase()) < 0) add('error', el, '4.1.2', 'Unknown ARIA role “' + r + '”.'); });
    $$('[tabindex]').forEach(function (el) { if (+el.getAttribute('tabindex') > 0) add('warn', el, '2.4.3', 'tabindex="' + el.getAttribute('tabindex') + '" changes the natural keyboard order. Use 0 or -1.'); });
    $$('a[href][aria-hidden=true],button[aria-hidden=true],input[aria-hidden=true],select[aria-hidden=true],textarea[aria-hidden=true]').forEach(function (el) { add('error', el, '4.1.2', 'aria-hidden="true" on something that can be focused: keyboard users reach it but screen readers cannot.'); });
    $$('iframe').forEach(function (el) { if (!(el.getAttribute('title') || '').trim() && !(el.getAttribute('aria-label') || '').trim()) add('error', el, '4.1.2', '<iframe> without a title that says what it shows.'); });
    $$('table').forEach(function (el) { if (!/presentation|none/.test(el.getAttribute('role') || '') && el.querySelectorAll('tr').length > 1 && !el.querySelector('th')) add('warn', el, '1.3.1', 'Data table without <th> header cells.'); });
    $$('video[autoplay],audio[autoplay]').forEach(function (el) { if (!el.hasAttribute('muted')) add('warn', el, '1.4.2', 'Sound that plays by itself: add a way to stop it, or start muted.'); });
    $$('video').forEach(function (el) { if (!el.querySelector('track[kind=captions],track[kind=subtitles]')) add('warn', el, '1.2.2', 'Video without captions (<track kind="captions">).'); });
    $$('meta[name=viewport]').forEach(function (el) {
      var c = (el.getAttribute('content') || '').toLowerCase(), mx = /maximum-scale\s*=\s*([\d.]+)/.exec(c);
      if (/user-scalable\s*=\s*(no|0)/.test(c) || (mx && +mx[1] < 2)) add('error', el, '1.4.4', 'The viewport blocks zooming. People with low vision need to pinch-zoom.');
    });
    $$('meta[http-equiv]').forEach(function (el) { if (/refresh/i.test(el.getAttribute('http-equiv')) && /^\s*[1-9]/.test(el.getAttribute('content') || '')) add('warn', el, '2.2.1', 'The page reloads or moves on by itself (meta refresh).'); });
    $$('marquee,blink').forEach(function (el) { add('error', el, '2.2.2', '<' + el.tagName.toLowerCase() + '> moves or blinks with no way to stop it.'); });
    $$('[onclick]').forEach(function (el) { if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY|LABEL|OPTION)$/.test(el.tagName) && !el.getAttribute('role') && !el.hasAttribute('tabindex')) add('warn', el, '2.1.1', '<' + el.tagName.toLowerCase() + '> with onclick cannot be reached with a keyboard. Use a <button>.'); });
    $$('svg[role=img]').forEach(function (el) { if (!accName(el) && !el.querySelector('title')) add('warn', el, '1.1.1', 'SVG image without a <title> or aria-label.'); });
    $$('[style]').forEach(function (el) {
      var st = el.getAttribute('style'), fg = /(?:^|;)\s*color\s*:\s*([^;!]+)/i.exec(st), bg = /background(?:-color)?\s*:\s*([^;!]+)/i.exec(st);
      if (!fg || !bg) return;
      var a = rgb(fg[1].trim()), b = rgb(bg[1].trim().split(/\s+(?![^(]*\))/)[0]);
      if (!a || !b || a[3] < 1 || b[3] < 1) return;
      var fs = /font-size\s*:\s*([\d.]+)(px|pt|rem|em)/i.exec(st), px = fs ? +fs[1] * ({ pt: 4 / 3, rem: 16, em: 16 }[fs[2].toLowerCase()] || 1) : 16, bold = /font-weight\s*:\s*(bold|[6-9]00)/i.test(st) || /^(B|STRONG|H[1-6])$/.test(el.tagName);
      var need = px >= 24 || (bold && px >= 18.66) ? 3 : 4.5, r = contrast(a, b);
      if (r < need) add('error', el, '1.4.3', 'Text contrast is ' + r.toFixed(2) + ':1; it needs at least ' + need + ':1. Darken the text or lighten the background.');
    });
    return out;
  }
  function checkUI(o) {
    var status = T.status(), list = h('div', { 'class': 'tkv', 'data-out': '' }), timer, seq = 0;
    var input = h('textarea', { rows: '12', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': o.label, placeholder: o.ph || 'Paste your code here…' });
    input.value = T.store.get(o.id + '-in', '');
    function show(line) {
      var L = input.value.split('\n'), p = 0;
      for (var k = 0; k < line - 1 && k < L.length; k++) p += L[k].length + 1;
      input.focus(); input.setSelectionRange(p, p + (L[line - 1] || '').length);
      input.scrollTop = Math.max(0, (line - 3) * (parseFloat(getComputedStyle(input).lineHeight) || 22));
    }
    function run() {
      T.store.set(o.id + '-in', input.value.slice(0, 200000));
      var tok = ++seq;
      if (!input.value.trim()) { list.innerHTML = ''; status.clear(); return; }
      Promise.resolve().then(function () { return o.check(input.value); }).then(function (r) { if (tok === seq) draw(r); }, function (e) { if (tok === seq) { list.innerHTML = ''; status.error(e); } });
    }
    function draw(issues) {
      list.innerHTML = '';
      issues.sort(function (a, b) { return (a.line || 0) - (b.line || 0); });
      var e = issues.filter(function (x) { return x.sev === 'error'; }).length, w = issues.length - e;
      if (!issues.length) status.ok(o.ok);
      else status.info((e ? e + (e > 1 ? ' errors' : ' error') : 'No errors') + (w ? ', ' + w + (w > 1 ? ' warnings' : ' warning') : '') + '. Tap Show to jump to the line.');
      issues.slice(0, 300).forEach(function (x) {
        list.appendChild(h('div', {}, [h('span', { 'class': x.sev === 'error' ? 'tout-c' : '', style: 'font-weight:700', text: (x.sev === 'error' ? '✕ ' : '! ') + (x.line ? 'Line ' + x.line : 'Whole page') }),
          h('span', { text: x.msg }), x.line ? T.button('Show', { small: true, onclick: function () { show(x.line); } }) : h('span')]));
      });
    }
    spot.appendChild(T.card([T.field(o.label, input),
      T.row([T.button('Try a sample', { small: true, onclick: function () { input.value = o.sample; run(); } }), T.button('Clear', { small: true, onclick: function () { input.value = ''; run(); input.focus(); } })]),
      status.el, list]));
    spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 300); });
    run();
  }
  checkUI({ id: 'a11y-check', label: 'HTML to check', check: check, ok: '✓ No accessibility problems found in the code. Also test with a keyboard and a screen reader.',
    sample: '<!DOCTYPE html>\n<html>\n<head>\n  <meta name="viewport" content="width=device-width, user-scalable=no">\n</head>\n<body>\n  <div onclick="openMenu()">☰</div>\n  <h1>Fresh Bakes</h1>\n  <h3>Today’s offers</h3>\n  <img src="cake.jpg">\n  <p style="color:#aaa; background:#fff">Free delivery over ₹500</p>\n  <form>\n    <input type="email" placeholder="Your email">\n    <button></button>\n  </form>\n  <a href="/menu">Click here</a>\n</body>\n</html>' });
  T.tests['a11y-check'] = function () {
    var f = [], c = function (s, err, warn, want) {
      var r = check(s), e = r.filter(function (x) { return x.sev === 'error'; }).length, w = r.length - e;
      if (e !== err || (warn !== null && w !== warn) || (want && !r.some(function (x) { return x.msg.indexOf(want) >= 0; }))) f.push(s.slice(0, 40) + ' → ' + e + 'e/' + w + 'w ' + r.map(function (x) { return x.msg; }).join(' | ').slice(0, 160));
    };
    c('<img src="a.png">', 1, 0, '1.1.1'); c('<img src="a.png" alt="IMG_2041.jpg">', 0, 1); c('<input type="text" placeholder="Name">', 1, 0, 'placeholder');
    c('<label>Name <input type="text"></label><label for="e">Email</label><input id="e" type="email">', 0, 0); c('<button></button>', 1, 0, 'Button'); c('<button aria-label="Close">×</button>', 0, 0);
    c('<a href="/x">click here</a>', 0, 1); c('<h1>A</h1><h3>B</h3>', 0, 1, 'jumps'); c('<div role="buton">x</div>', 1, 0, 'role'); c('<p style="color:#999;background:#fff">x</p>', 1, 0, '2.85');
    c('<p style="color:#000;background-color:white">x</p>', 0, 0); c('<!DOCTYPE html><html><head></head><body><p>x</p></body></html>', 2, null, '3.1.1');
    c('<div onclick="go()">Go</div>', 0, 1, '2.1.1'); c('<iframe src="x"></iframe>', 1, 0, 'iframe'); c('<meta name="viewport" content="width=device-width, user-scalable=no"><p>x</p>', 1, 0, 'zoom');
    c('<span id="l">Search</span><input aria-labelledby="l"><input aria-describedby="nope" aria-label="x">', 1, 0, 'nope');
    return Promise.resolve({ ok: !f.length, n: 16, fails: f });
  };
});
