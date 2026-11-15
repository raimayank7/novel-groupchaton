/* Infinity by GroupChatOn — vibration. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Vibration tester: check your phone's vibration motor with short, long, SOS, heartbeat and your own patterns. */
GCOTools.register('vibration', function (spot, T) {
  var h = T.h, status = T.status();
  var PATTERNS = [['Short buzz', [100]], ['Long buzz', [1000]], ['Double tap', [80, 120, 80]], ['Heartbeat', [120, 100, 180, 600, 120, 100, 180]], ['SOS', [100, 100, 100, 100, 100, 300, 300, 100, 300, 100, 300, 300, 100, 100, 100, 100, 100]], ['Ringtone', [400, 200, 400, 200, 400, 1000, 400, 200, 400]], ['Escalating', [50, 200, 100, 200, 200, 200, 400, 200, 800]]];
  function parse(s) {
    var p = String(s).split(/[\s,;]+/).filter(Boolean).map(Number);
    if (!p.length || p.some(function (x) { return !isFinite(x) || x < 0 || x > 10000; })) throw new Error('Write milliseconds separated by commas, like 200, 100, 200 (buzz, pause, buzz). Each up to 10000.');
    return p;
  }
  function length(p) { return p.reduce(function (a, b) { return a + b; }, 0); }
  var can = !!navigator.vibrate, custom = h('input', { type: 'text', 'class': 'tmono', value: '200, 100, 200, 100, 500', 'aria-label': 'Your pattern' });
  var read = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:700 20px/1.3 var(--ui)', text: 'Tap a pattern to feel it' });
  function buzz(name, p) {
    if (!can) { status.error('This device or browser cannot vibrate from a web page. iPhones and iPads do not allow it in any browser, and most computers have no vibration motor.'); return; }
    var ok = navigator.vibrate(p);
    if (!ok) { status.error('The browser refused to vibrate. Make sure the phone is not on silent or “do not disturb” and that this tab is in front.'); return; }
    status.clear(); read.textContent = '📳 ' + name + ' · ' + (length(p) / 1000).toFixed(1) + ' s';
  }
  spot.appendChild(T.card([read, h('div', { 'class': 'tgrid2' }, PATTERNS.map(function (x) { return T.button(x[0], { onclick: function () { buzz(x[0], x[1]); } }); })),
    T.field('Your own pattern (buzz, pause, buzz… in milliseconds)', custom),
    T.row([T.button('Play my pattern', { primary: true, onclick: function () { try { buzz('Your pattern', parse(custom.value)); } catch (e) { status.error(e); } } }), T.button('Stop', { small: true, onclick: function () { if (can) navigator.vibrate(0); read.textContent = 'Stopped'; } })]),
    status.el, h('p', { 'class': 'tnote', text: can ? 'Vibration is supported in this browser. If you feel nothing, check that vibration is switched on in your phone’s sound settings.' : 'This browser cannot vibrate (iPhone, iPad and most computers). The buttons will tell you so.' })]));
  T.tests['vibration'] = function () {
    var f = [];
    if (parse('200, 100,200').join() !== '200,100,200' || parse('50 50').length !== 2) f.push('parse');
    try { parse('abc'); f.push('letters accepted'); } catch (e) {}
    try { parse('-5'); f.push('negative accepted'); } catch (e) {}
    if (length(PATTERNS[4][1]) !== 2700) f.push('sos length ' + length(PATTERNS[4][1]));
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
