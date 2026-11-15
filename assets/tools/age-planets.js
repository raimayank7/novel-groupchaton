/* Infinity by GroupChatOn — age-planets. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Age on other planets: your age in Mercury, Venus, Mars, Jupiter, Saturn, Uranus and Neptune years, and your next birthday there. */
GCOTools.register('age-planets', function (spot, T) {
  var h = T.h, YEAR = 31557600;   // seconds in an Earth year (365.25 days)
  var P = [['☿', 'Mercury', 0.2408467], ['♀', 'Venus', 0.61519726], ['🌍', 'Earth', 1.0000174], ['♂', 'Mars', 1.8808158], ['♃', 'Jupiter', 11.862615], ['♄', 'Saturn', 29.447498], ['⛢', 'Uranus', 84.016846], ['♆', 'Neptune', 164.79132]];
  function ages(sec) { return P.map(function (p) { return [p[1], sec / YEAR / p[2]]; }); }
  var inp = h('input', { type: 'date', value: T.store.get('planet-born', ''), 'aria-label': 'Date of birth' }), grid = h('div', { 'class': 'tstats', 'data-out': '' }), note = h('p', { 'class': 'tstatus' });
  function draw() {
    grid.innerHTML = ''; T.store.set('planet-born', inp.value);
    if (!inp.value) { note.textContent = 'Enter your date of birth.'; return; }
    var born = new Date(inp.value + 'T00:00'), sec = (Date.now() - born) / 1000;
    if (sec < 0) { note.textContent = 'That date is in the future.'; return; }
    P.forEach(function (p) {
      var a = sec / YEAR / p[2], next = new Date(born.getTime() + Math.ceil(a) * p[2] * YEAR * 1000);
      grid.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: p[0] + ' ' + (a < 10 ? a.toFixed(2) : a.toFixed(1)) }), h('span', { text: p[1] + ' years' }), h('br'),
        h('small', { text: 'next birthday ' + next.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) })]));
    });
    note.textContent = 'You have been alive ' + Math.floor(sec / 86400).toLocaleString() + ' Earth days. One year on a planet is one trip around the Sun.';
  }
  inp.addEventListener('input', draw);
  spot.appendChild(T.card([T.field('Date of birth', inp), T.row([T.button('Try a sample', { small: true, onclick: function () { inp.value = '2000-01-01'; draw(); } })]), note, grid]));
  draw();
  T.tests['age-planets'] = function () {
    var f = [], a = ages(1e9), b = ages(2134835688), r = function (x) { return Math.round(x * 100) / 100; };
    if (r(a[2][1]) !== 31.69) f.push('earth ' + a[2][1]);
    if (r(b[0][1]) !== 280.88) f.push('mercury ' + b[0][1]);
    if (r(ages(1821023456)[4][1]) !== 4.86 || r(ages(1821023456)[7][1]) !== 0.35) f.push('jupiter / neptune');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
