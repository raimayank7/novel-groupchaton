/* Password Generator — crypto-random passwords or passphrases, made on the device and never sent anywhere.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('password', function (spot, T) {
  var h = T.h, crypto = window.crypto || window.msCrypto;
  var mode = T.seg([['chars', 'Password'], ['words', 'Passphrase']], 'chars', function () { sync(); make(); });
  var len = h('input', { type: 'range', min: '8', max: '64', value: '16' });
  var fLen = T.field('Length: 16', len);
  var nWords = h('input', { type: 'range', min: '3', max: '10', value: '5' });
  var fWords = T.field('Words: 5', nWords);
  var sets = { upper: ['A–Z', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], lower: ['a–z', 'abcdefghijklmnopqrstuvwxyz'], digits: ['0–9', '0123456789'], symbols: ['!@#$…', '!@#$%^&*()-_=+[]{};:,.?/'] };
  var checks = {};
  var boxes = h('div', { 'class': 'trow' }, Object.keys(sets).map(function (k) {
    checks[k] = h('input', { type: 'checkbox', checked: true, onchange: make });
    return h('label', { 'class': 'tcheck' }, [checks[k], sets[k][0]]);
  }));
  var similar = h('input', { type: 'checkbox', checked: true, onchange: make });
  var out = h('output', { 'aria-live': 'polite' });
  var meter = h('div', { 'class': 'tmeter' }, [h('span')]);
  var strength = h('p', { 'class': 'tstatus' });
  var copy = T.button('Copy', { primary: true, onclick: function () { T.copy(out.textContent, copy); } });
  var more = h('div', { 'class': 'tresults-grid' });
  var charOpts = h('div', { 'class': 'tool-app-opts' }, [fLen, boxes, h('label', { 'class': 'tcheck' }, [similar, 'Avoid look-alikes (I l 1 O 0)'])]);
  spot.appendChild(T.card([mode, h('div', { 'class': 'tpass' }, [out, copy]), meter, strength, charOpts, fWords,
    T.row([T.button('↻ New password', { onclick: make }), T.button('Make 5 more', { onclick: five })]), more]));
  len.addEventListener('input', function () { fLen.firstChild.textContent = 'Length: ' + len.value; make(); });
  nWords.addEventListener('input', function () { fWords.firstChild.textContent = 'Words: ' + nWords.value; make(); });

  var WORDS = ('apple brave cloud dance eagle flame grape honey ivory jolly karma lemon mango noble ocean piano quiet raven solar tiger umbra vivid whale xenon yacht zebra ' +
    'amber blaze cedar delta ember frost globe haven index jewel koala lunar maple nectar orbit pearl quest river storm tulip unity valor willow young zesty ' +
    'arrow bloom candle drift epic fable garden harbor island jungle kettle ladder meadow nimble olive pepper quartz rocket silver timber urban velvet winter yellow zigzag ' +
    'anchor basket castle dragon engine falcon ginger hammer igloo jacket kitten lantern magnet needle oyster parrot quiver rabbit saddle thunder violet walnut').split(' ');
  function rnd(n) {   // unbiased random integer below n
    var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n;
    do { crypto.getRandomValues(a); } while (a[0] >= lim);
    return a[0] % n;
  }
  function gen() {
    if (mode.value() === 'words') {
      var w = []; for (var i = 0; i < +nWords.value; i++) w.push(WORDS[rnd(WORDS.length)]);
      return { pw: w.join('-') + '-' + rnd(100), bits: +nWords.value * Math.log2(WORDS.length) + Math.log2(100) };
    }
    var pools = Object.keys(sets).filter(function (k) { return checks[k].checked; }).map(function (k) {
      return similar.checked ? sets[k][1].replace(/[Il1O0o]/g, '') : sets[k][1];
    });
    if (!pools.length) { checks.lower.checked = true; return gen(); }
    var all = pools.join(''), L = +len.value, chars = [];
    pools.forEach(function (p) { chars.push(p[rnd(p.length)]); });          // at least one from each chosen set
    while (chars.length < L) chars.push(all[rnd(all.length)]);
    for (var j = chars.length - 1; j > 0; j--) { var k = rnd(j + 1), t = chars[j]; chars[j] = chars[k]; chars[k] = t; }
    return { pw: chars.join(''), bits: L * Math.log2(all.length) };
  }
  function make() {
    var r = gen();
    out.textContent = r.pw;
    var lvl = r.bits < 50 ? ['Weak', 25, '#dc2626'] : r.bits < 70 ? ['Fair', 50, '#d97706'] : r.bits < 100 ? ['Strong', 80, '#16a34a'] : ['Very strong', 100, '#15803d'];
    meter.firstChild.style.width = lvl[1] + '%'; meter.firstChild.style.background = lvl[2];
    strength.textContent = lvl[0] + ' · about ' + Math.round(r.bits) + ' bits of randomness';
  }
  function five() {
    more.innerHTML = '';
    for (var i = 0; i < 5; i++) (function (pw) {
      var c = T.button('Copy', { small: true, onclick: function () { T.copy(pw, c); } });
      more.appendChild(h('div', { 'class': 'tresult' }, [h('span', { 'class': 'tresult-name' }, [h('b', { text: pw, style: 'font-family:ui-monospace,Consolas,monospace' })]), c]));
    })(gen().pw);
  }
  function sync() { var c = mode.value() === 'chars'; charOpts.hidden = !c; fWords.hidden = c; }
  sync(); make();
});
