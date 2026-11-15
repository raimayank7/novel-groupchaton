/* Infinity by GroupChatOn — user-agent. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* What is my user agent: this browser's user agent, browser, system and screen, plus a parser for any user-agent string. */
GCOTools.register('user-agent', function (spot, T) {
  var h = T.h;
  var BROWSERS = [[/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Microsoft Edge'], [/OPR\/([\d.]+)|Opera\/([\d.]+)/, 'Opera'], [/SamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
    [/UCBrowser\/([\d.]+)/, 'UC Browser'], [/YaBrowser\/([\d.]+)/, 'Yandex Browser'], [/Vivaldi\/([\d.]+)/, 'Vivaldi'], [/Brave\/([\d.]+)/, 'Brave'],
    [/FxiOS\/([\d.]+)/, 'Firefox'], [/CriOS\/([\d.]+)/, 'Chrome'], [/Firefox\/([\d.]+)/, 'Firefox'], [/Chrome\/([\d.]+)/, 'Chrome'],
    [/Version\/([\d.]+).*Safari\//, 'Safari'], [/MSIE ([\d.]+)|Trident\/.*rv:([\d.]+)/, 'Internet Explorer']];
  var WIN = { '10.0': '10 or 11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' };
  function parse(ua) {
    var r = { browser: 'Unknown', version: '', os: 'Unknown', device: 'Desktop', engine: 'Unknown' }, m;
    if ((m = /(Googlebot|Bingbot|bingbot|DuckDuckBot|YandexBot|Baiduspider|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|GPTBot|ClaudeBot|Applebot|AhrefsBot|SemrushBot)[\/ ]?([\d.]*)/.exec(ua)))
      return { browser: m[1], version: m[2] || '', os: '-', device: 'Bot / crawler', engine: '-' };
    if (/bot\b|crawler|spider|slurp/i.test(ua)) return { browser: 'A bot or crawler', version: '', os: '-', device: 'Bot / crawler', engine: '-' };
    for (var i = 0; i < BROWSERS.length; i++) if ((m = BROWSERS[i][0].exec(ua))) { r.browser = BROWSERS[i][1]; r.version = m[1] || m[2] || ''; break; }
    if ((m = /Windows NT ([\d.]+)/.exec(ua))) r.os = 'Windows ' + (WIN[m[1]] || m[1]);
    else if ((m = /(?:iPhone|CPU) OS ([\d_]+)/.exec(ua))) r.os = (/iPad/.test(ua) ? 'iPadOS ' : 'iOS ') + m[1].replace(/_/g, '.');
    else if ((m = /Android ([\d.]+)/.exec(ua))) r.os = 'Android ' + m[1];
    else if (/CrOS/.test(ua)) r.os = 'ChromeOS';
    else if ((m = /Mac OS X ([\d_.]+)/.exec(ua))) r.os = 'macOS ' + m[1].replace(/_/g, '.');
    else if (/Linux/.test(ua)) r.os = 'Linux';
    if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) r.device = 'Tablet';
    else if (/Mobi|iPhone|iPod/.test(ua)) r.device = 'Phone';
    r.engine = /Trident/.test(ua) ? 'Trident' : /Gecko\/|Firefox\//.test(ua) && !/like Gecko/.test(ua) ? 'Gecko' : /Chrome\/|CriOS|Edg/.test(ua) && !/iPhone|iPad/.test(ua) ? 'Blink' : /AppleWebKit/.test(ua) ? 'WebKit' : 'Unknown';
    return r;
  }
  function kv(rows) {
    return h('div', { 'class': 'tkv', 'data-out': '' }, rows.map(function (r) {
      return h('div', {}, [h('span', { text: r[0] }), h('code', { text: String(r[1]) }), T.button('Copy', { small: true, onclick: function (e) { T.copy(String(r[1]), e.currentTarget); } })]);
    }));
  }
  function rows(ua) { var p = parse(ua); return [['Browser', p.browser + (p.version ? ' ' + p.version : '')], ['System', p.os], ['Device', p.device], ['Engine', p.engine]]; }
  var ua = navigator.userAgent || '', mine = h('div');
  var extra = [['Language', (navigator.languages || [navigator.language]).join(', ')], ['Screen', screen.width + ' × ' + screen.height + ' (pixel ratio ' + (window.devicePixelRatio || 1) + ')'],
    ['Window', window.innerWidth + ' × ' + window.innerHeight], ['Time zone', (Intl.DateTimeFormat().resolvedOptions().timeZone || '-')], ['Touch screen', navigator.maxTouchPoints > 0 ? 'Yes' : 'No'],
    ['Cookies', navigator.cookieEnabled ? 'Enabled' : 'Blocked']];
  mine.appendChild(kv([['User agent', ua]].concat(rows(ua), extra)));
  var other = h('textarea', { rows: '3', 'class': 'tin tmono', spellcheck: 'false', placeholder: 'Paste a user-agent string from a log file or analytics…', 'aria-label': 'User agent to check' }), otherOut = h('div');
  function check() { otherOut.innerHTML = ''; if (other.value.trim()) otherOut.appendChild(kv(rows(other.value.trim()))); }
  other.addEventListener('input', check);
  spot.appendChild(T.card([h('b', { text: 'Your browser' }), mine, T.field('Check another user agent', other), T.row([T.button('Try a sample', { small: true, onclick: function () {
    other.value = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36'; check(); } })]), otherOut,
    h('p', { 'class': 'tstatus', text: 'Windows 11 still reports itself as “Windows NT 10.0”, so the user agent alone cannot tell 10 and 11 apart.' })]));
  T.tests['user-agent'] = function () {
    var f = [], c = [
      ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', 'Chrome|130.0.0.0|Windows 10 or 11|Desktop|Blink'],
      ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1', 'Safari|17.2|iOS 17.2|Phone|WebKit'],
      ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.68', 'Microsoft Edge|130.0.2849.68|Windows 10 or 11|Desktop|Blink'],
      ['Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36', 'Samsung Internet|25.0|Android 14|Phone|Blink'],
      ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0', 'Firefox|132.0|macOS 10.15|Desktop|Gecko'],
      ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Googlebot|2.1|-|Bot / crawler|-']];
    c.forEach(function (x) { var p = parse(x[0]), s = [p.browser, p.version, p.os, p.device, p.engine].join('|'); if (s !== x[1]) f.push(s); });
    return Promise.resolve({ ok: !f.length, n: c.length, fails: f });
  };
});
