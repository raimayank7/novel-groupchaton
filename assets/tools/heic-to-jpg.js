/* Infinity by GroupChatOn — heic-to-jpg. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* HEIC to JPG: turn iPhone HEIC / HEIF photos into JPG or PNG on your device, many at once (heic2any, built on libheif). */
GCOTools.register('heic-to-jpg', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  var HEIC = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
  var SAMPLE = 'AAAAHGZ0eXBoZWljAAAAAG1pZjFoZWljbWlhZgAAAVZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAABegABAAAAAAAABD8AAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABodmMxAAAAAA5waXRtAAAAAAABAAAA1mlwcnAAAAC3aXBjbwAAAHhodmNDAQNwAAAAkAAAAAAAHvAA/P34+AAADwNgAAEAGEABDAH//wNwAAADAJAAAAMAAAMAHroCQGEAAQArQgEBA3AAAAMAkAAAAwAAAwAeoBQgeWW6kkprm4CGgwIAAAMAMgAAAwACEGIAAQAHRAHBcrBiQAAAABNjb2xybmNseAABAA0ABoAAAAAUaXNwZQAAAAAAAACgAAAAeAAAABBwaXhpAAAAAAMICAgAAAAXaXBtYQAAAAAAAAABAAEEgQIDBAAABEdtZGF0AAAEOygBrwnQqGJpINHLqvr/7iN/e/lAL//vTXOg4w1RpqkiBl1T8YOgZ3tD+U44XFaOHdFlbV+N3eBAkMmZrUsgWZke4uSNdQM/zE94X4t594FXBh/vM3dvv6y4kAFvNJw89g/HwWwg4ACOaB3WjfCvW91/7dnqkENbh1YVlesF5XSE0V3PJAdVngLj6Ao6/AJsf+9723ZMViDFih5QBGpDYtAE+zkOKYrr+xRaW46IvlOWJh7VUGoGKoh+3pCFglsB1L/FE10C/JIe00SEGulEZYMHMXBICPMsK7aQFKzWQ2CCJ0j5WYRMgjOT/fZ4N0cDESUNqbExzUdibApCPKA9gQ/+gIOPHsfD6SBg6FhZbS7qo5vXePnjZ5ZGrv+xnLb7xgEEJP1eVXQNINrWzBVJVzwbOsHJZG0NodYKXkWMfaZIViLbvCyVC5SyBPVI7M07g5S7iFIhxbJiTL9SzG9vJkL6cO3L6cn1GJixIqNZ6l3YoFtUM96OX35pY7cq0PY1s1GkT9GihXaoJ2r//pXEJD5vzAEjoIuuucE3OW42sJZW1fNKjL6VXhg1wYVrd+hP19jZOBHHZspw8mYy4a1SpB79mNyP2MR9fvDH2DMX7Fm/aHwQ0Vdr7nKQHzpF4sE+Hv7hKsdbioXoxBLB49kNpLxct0FmL0IND6qwAE1P1cT8AlIhBgwFxvaqw2STucmvpOUO9stKWfTya9aNI95PGsYDA3cbGJUh9KweNTAE9obRctGMPhNVo+wph3HsED31ACB5niJYN7+1/BhUKbTaGn5j8pvMzXTmGVUxwkSuXeebt6Y/HqG2uaD5WpVHwcnzZ6mDEdXfdfRTBWpvttoHYvug0ewd3I2fgRtSSbcGTrTjgOIXjmXTcgE3z86RqaAWLZuBoewonVQAot8kp3E1QytaNUhKrtTPLg6CQLbUtfC0t/oIbAEDjPIHAnTcLlFB/TwTgmuEqOaI4H+8lecnuaFP2VRFfcdJbv9BlBHoZepDbM51+n8jyZEE16Jjx5Ydc2BkT9PLQ4YI13q/tM9mJW2BL1HQG1ZSViJY7dOJVZ4es7dAqk9h7vlrqC3JVRQx0J5lobUiMzI/8ZP7wLktRRbO7GXn4YEdfpT90CL+FR5bRJMEps63JGzUjQsztxgTpatyQsnSbJLDqTxF3TexfJcj9iR7pJyszZKmtSm0lp569060aAuip0K5Aqz27qGDcILEg8Fd1R+2Nm4blBgH1+ejNIrqmV5ROmmVX1iEMHPibRyxv+3l+8oK4qD+urkWsnwNh5oRr+j7cBYhnyk0Qta3tebXxDckvKdYelEWtaQ3b8/hGE9g3qoSdW1VtwoVc3ER4yPfHVAo0y0+i2WARIOF/3+D2TEi8Kb6bwxe4UknJIG3MSCn20pJ2XokxxpUuTkV35vLQhVEjAAo34t8pe1IX++vOAAAAwD7gA==';   // a tiny 160 × 120 HEIC picture made for this tool
  function isHeic(f) { return /\.(heic|heif)$/i.test(f.name || '') || /image\/hei[cf]/i.test(f.type || ''); }
  // one HEIC Blob → a JPG / PNG Blob
  function convert(blob, type, q) {
    return T.loadScript(HEIC).then(function () { return window.heic2any({ blob: blob, toType: type, quality: q }); }).then(function (r) { return Array.isArray(r) ? r[0] : r; }, function (e) {
      var m = (e && e.message) || String(e);
      if (/already browser readable/i.test(m)) return reencode(blob, type, q);   // a JPG or PNG with a .heic name
      throw new Error((blob.name || 'This file') + ' could not be read as HEIC. ' + (/format not supported/i.test(m) ? 'This kind of HEIF is not supported yet.' : 'It may be damaged.'));
    });
  }
  function reencode(blob, type, q) {
    return new Promise(function (ok, fail) {
      var im = new Image(); im.onload = function () { var c = h('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; var g = c.getContext('2d'); if (type === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); } g.drawImage(im, 0, 0); URL.revokeObjectURL(im.src); T.canvasBlob(c, type, q).then(ok); };
      im.onerror = function () { fail(new Error('This file could not be opened.')); }; im.src = URL.createObjectURL(blob);
    });
  }
  var fmt = T.seg([['image/jpeg', 'JPG'], ['image/png', 'PNG']], 'image/jpeg'), q = h('input', { type: 'range', min: '60', max: '100', value: '92' });
  var go = T.button('Convert', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = !f.length; results.clear(); });
  function run() {
    var files = list.files(), out = [], i = 0, type = fmt.value(), ext = type === 'image/png' ? 'png' : 'jpg';
    if (!files.length) return;
    go.disabled = true;
    (function next() {
      if (i >= files.length) { results.set(out, 'converted-photos'); status.ok('Done! ' + out.length + (out.length === 1 ? ' photo' : ' photos') + ' converted. Tip: the location and camera details are not copied.'); go.disabled = false; return; }
      var f = files[i++];
      status.progress((i - 0.5) / files.length, 'Converting ' + f.name + ' (' + i + ' of ' + files.length + ')…');
      convert(f, type, q.value / 100).then(function (b) {
        out.push({ name: T.baseName(f.name) + '.' + ext, blob: b, preview: URL.createObjectURL(b) });
        next();
      }).catch(function (e) { status.error(e); go.disabled = false; });
    })();
  }
  function sample() { var s = atob(SAMPLE), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return new File([a], 'IMG_0001.HEIC', { type: 'image/heic' }); }
  spot.appendChild(T.card([T.dropzone({ accept: '.heic,.heif,image/heic,image/heif', multiple: true, icon: '📱', label: 'Choose HEIC photos', hint: 'iPhone photos (.heic) · nothing is uploaded', onFiles: function (f) {
      var ok = f.filter(isHeic); if (ok.length < f.length) status.info((f.length - ok.length) + ' file(s) skipped: not HEIC.'); if (ok.length) list.add(ok); } }),
    list.el, h('div', { 'class': 'tgrid2' }, [T.field('Convert to', fmt), T.field('JPG quality', q)]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { list.clear(); list.add([sample()]); run(); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  list.el.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['heic-to-jpg'] = function () {
    var f = [];
    if (!isHeic({ name: 'a.HEIC' }) || !isHeic({ name: 'x', type: 'image/heif' }) || isHeic({ name: 'a.jpg', type: 'image/jpeg' })) f.push('isHeic');
    return convert(sample(), 'image/jpeg', 0.92).then(function (b) {
      return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = URL.createObjectURL(b); });
    }).then(function (im) {
      if (!im || im.naturalWidth !== 160 || im.naturalHeight !== 120) return f.push('size ' + (im && im.naturalWidth + 'x' + im.naturalHeight));
      var c = h('canvas'); c.width = 160; c.height = 120; c.getContext('2d').drawImage(im, 0, 0); var p = c.getContext('2d').getImageData(10, 10, 1, 1).data;
      if (Math.abs(p[0] - 125) > 25 || Math.abs(p[1] - 211) > 25 || Math.abs(p[2] - 252) > 25) f.push('colour ' + p[0] + ',' + p[1] + ',' + p[2]);
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
