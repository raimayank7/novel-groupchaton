/* Color Converter — HEX, RGB, HSL, HSV and CMYK, with a picker, shades and the WCAG contrast against white and black.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('color-convert', function (spot, T) {
  var h = T.h;
  var pick = h('input', { type: 'color', value: '#8b7cff', 'aria-label': 'Pick a colour', style: 'width:64px;height:48px;padding:0;border:0;background:none' });
  var text = h('input', { type: 'text', 'class': 'tmono', value: '#8B7CFF', 'aria-label': 'Any colour', placeholder: '#22d3ee, rgb(34 211 238), hsl(…), teal' });
  var swatch = h('div', { 'class': 'tswatch' }), list = h('div', { 'class': 'tkv' }), shades = h('div', { 'class': 'tshades' }), status = T.status();
  spot.appendChild(T.card([h('div', { 'class': 'trow' }, [pick, T.field('Type any colour (HEX, RGB, HSL or a name)', text)]), swatch, status.el, list, h('h3', { text: 'Shades and tints' }), shades]));
  var probe = document.createElement('canvas').getContext('2d');
  function parse(s) {   // the browser understands every CSS colour format; read it back as RGB
    probe.fillStyle = '#010203'; probe.fillStyle = s.trim();
    var f = probe.fillStyle;
    if (f === '#010203' && !/^#?010203$/i.test(s.trim()) && !/rgb\(\s*1\D+2\D+3\b/.test(s)) return null;
    if (f[0] === '#') return [parseInt(f.slice(1, 3), 16), parseInt(f.slice(3, 5), 16), parseInt(f.slice(5, 7), 16), 1];
    var m = f.match(/[\d.]+/g); return [+m[0], +m[1], +m[2], m[3] == null ? 1 : +m[3]];
  }
  function hex(c) { return '#' + c.slice(0, 3).map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('').toUpperCase(); }
  function hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = 0, hh = 0, d = mx - mn;
    if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; }
    return [Math.round(hh), Math.round(s * 100), Math.round(l * 100)];
  }
  function hsv(r, g, b) { r /= 255; g /= 255; b /= 255; var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; return [hsl(r * 255, g * 255, b * 255)[0], Math.round(mx ? d / mx * 100 : 0), Math.round(mx * 100)]; }
  function cmyk(r, g, b) { var k = 1 - Math.max(r, g, b) / 255; if (k === 1) return [0, 0, 0, 100]; return [r, g, b].map(function (v) { return Math.round((1 - v / 255 - k) / (1 - k) * 100); }).concat(Math.round(k * 100)); }
  function lum(c) { var a = c.slice(0, 3).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; }
  function ratio(c, other) { var x = lum(c), y = lum(other); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function grade(r) { return r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large text only' : 'fails'; }
  function draw(c, from) {
    if (!c) { status.error('Not a colour I can read. Try #22D3EE, rgb(34, 211, 238) or a name like teal.'); return; }
    status.clear();
    var H = hex(c), L = hsl(c[0], c[1], c[2]), V = hsv(c[0], c[1], c[2]), K = cmyk(c[0], c[1], c[2]);
    if (from !== 'pick') pick.value = H.toLowerCase();
    if (from !== 'text') text.value = H;
    swatch.style.background = H;
    var w = ratio(c, [255, 255, 255]), bk = ratio(c, [0, 0, 0]);
    swatch.style.color = w > bk ? '#fff' : '#000';
    swatch.textContent = H;
    var rows = [['HEX', H], ['RGB', 'rgb(' + c.slice(0, 3).map(Math.round).join(', ') + ')'], ['HSL', 'hsl(' + L[0] + ', ' + L[1] + '%, ' + L[2] + '%)'],
      ['HSV / HSB', V[0] + '°, ' + V[1] + '%, ' + V[2] + '%'], ['CMYK', K.join('%, ') + '%'],
      ['On white', w.toFixed(2) + ' : 1 — ' + grade(w)], ['On black', bk.toFixed(2) + ' : 1 — ' + grade(bk)]];
    list.innerHTML = '';
    rows.forEach(function (r) { var b = T.button('Copy', { small: true, onclick: function () { T.copy(r[1].split(' —')[0], b); } }); list.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] }), b])); });
    shades.innerHTML = '';
    [95, 85, 75, 65, 55, 45, 35, 25, 15, 8].forEach(function (l) {
      probe.fillStyle = 'hsl(' + L[0] + ',' + L[1] + '%,' + l + '%)';
      var sh = probe.fillStyle.toUpperCase();
      shades.appendChild(h('button', { type: 'button', style: 'background:' + sh, title: sh, 'aria-label': 'Use ' + sh, onclick: function () { draw(parse(sh)); } }));
    });
  }
  pick.addEventListener('input', function () { draw(parse(pick.value), 'pick'); });
  text.addEventListener('input', function () { draw(parse(text.value), 'text'); });
  draw(parse('#8B7CFF'));
});
