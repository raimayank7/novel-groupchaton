/* Infinity by GroupChatOn — exif-viewer. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* EXIF viewer and remover: see the camera, date and GPS location hidden in a photo, then remove the location or all metadata without re-compressing (exifr). */
GCOTools.register('exif-viewer', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  var EXIFR = 'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js';
  function exifr() { return T.loadScript(EXIFR).then(function () { return window.exifr; }); }
  function read(blob) {
    return exifr().then(function (E) {
      return Promise.all([E.parse(blob, { tiff: true, exif: true, gps: true, xmp: true, iptc: true, icc: false, interop: false, ifd1: false, mergeOutput: true, translateValues: true, reviveValues: true }).catch(function () { return null; }),
        E.orientation(blob).catch(function () { return 1; })]);
    }).then(function (r) { return { tags: r[0] || {}, orientation: r[1] || 1 }; });
  }
  function ascii(b, at, n) { var s = ''; for (var i = 0; i < n && at + i < b.length; i++) s += String.fromCharCode(b[at + i]); return s; }
  // empties the GPS block of an EXIF segment in place (the block stays, with nothing in it)
  function dropGps(seg) {
    var t = 10, le = seg[t] === 0x49, u16 = function (o) { return le ? seg[o] | seg[o + 1] << 8 : seg[o] << 8 | seg[o + 1]; }, u32 = function (o) { return le ? (seg[o] | seg[o + 1] << 8 | seg[o + 2] << 16 | seg[o + 3] << 24) >>> 0 : (seg[o] << 24 | seg[o + 1] << 16 | seg[o + 2] << 8 | seg[o + 3]) >>> 0; };
    var SIZE = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8], ifd = t + u32(t + 4), n = u16(ifd), gps = 0;
    for (var i = 0; i < n; i++) if (u16(ifd + 2 + i * 12) === 0x8825) gps = t + u32(ifd + 2 + i * 12 + 8);
    if (!gps || gps + 2 > seg.length) return false;
    var m = u16(gps);
    for (i = 0; i < m; i++) {
      var e = gps + 2 + i * 12, size = (SIZE[u16(e + 2)] || 1) * u32(e + 4);
      if (size > 4) { var at = t + u32(e + 8); for (var k = 0; k < size && at + k < seg.length; k++) seg[at + k] = 0; }
      for (k = 0; k < 12; k++) seg[e + k] = 0;
    }
    seg[gps] = seg[gps + 1] = 0;
    return true;
  }
  function orientationSeg(o) {   // a tiny EXIF block that only says which way up the photo is
    return new Uint8Array([0xFF, 0xE1, 0, 34, 0x45, 0x78, 0x69, 0x66, 0, 0, 0x4D, 0x4D, 0, 0x2A, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, o, 0, 0, 0, 0, 0, 0]);
  }
  // JPEG: removes metadata blocks without touching the picture data. mode: 'all' | 'gps'
  function cleanJpeg(buf, mode, orientation) {
    var b = new Uint8Array(buf), out = [b.subarray(0, 2)], i = 2;
    if (b[0] !== 0xFF || b[1] !== 0xD8) throw new Error('This is not a valid JPG file.');
    while (i + 4 <= b.length) {
      if (b[i] !== 0xFF) throw new Error('This JPG looks damaged.');
      var m = b[i + 1];
      if (m === 0xFF) { i++; continue; }
      if (m === 0xDA || m === 0xD9) { out.push(b.subarray(i)); break; }   // the picture data: copied as it is
      if ((m >= 0xD0 && m <= 0xD7) || m === 0x01) { out.push(b.subarray(i, i + 2)); i += 2; continue; }
      var len = b[i + 2] << 8 | b[i + 3], seg = b.subarray(i, i + 2 + len), app1 = m === 0xE1, isExif = app1 && ascii(seg, 4, 6) === 'Exif\0\0', drop = false;
      if (mode === 'all') drop = app1 || m === 0xED || m === 0xFE || (m >= 0xE3 && m <= 0xEF && m !== 0xEE);   // keeps JFIF (E0), colour profile (E2) and Adobe colour (EE)
      else if (isExif) { seg = new Uint8Array(seg); dropGps(seg); }
      else if (app1 && /GPS/.test(ascii(seg, 4, len))) drop = true;   // an XMP copy of the location
      if (!drop) out.push(seg);
      i += 2 + len;
    }
    if (mode === 'all' && orientation > 1 && orientation <= 8) out.splice(1, 0, orientationSeg(orientation));
    return new Blob(out, { type: 'image/jpeg' });
  }
  function cleanPng(buf, mode) {
    var b = new Uint8Array(buf), out = [b.subarray(0, 8)], i = 8, dv = new DataView(buf);
    while (i + 12 <= b.length) {
      var len = dv.getUint32(i), type = ascii(b, i + 4, 4), chunk = b.subarray(i, i + 12 + len), text = /^(tEXt|zTXt|iTXt)$/.test(type);
      var drop = mode === 'all' ? (type === 'eXIf' || text || type === 'tIME') : (type === 'eXIf' || (text && /GPS/.test(ascii(b, i + 8, len))));
      if (!drop) out.push(chunk);
      i += 12 + len;
    }
    return new Blob(out, { type: 'image/png' });
  }
  function clean(f, mode, orientation) {
    return T.read(f).then(function (buf) {
      var b = new Uint8Array(buf, 0, 8);
      if (b[0] === 0xFF && b[1] === 0xD8) return { blob: cleanJpeg(buf, mode, orientation), ext: 'jpg' };
      if (b[0] === 0x89 && b[1] === 0x50) return { blob: cleanPng(buf, mode), ext: 'png' };
      return new Promise(function (ok, fail) {   // WebP, TIFF and others: saving a fresh copy drops all metadata
        var im = new Image(); im.onload = function () { var c = h('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); T.canvasBlob(c, 'image/png').then(function (bl) { ok({ blob: bl, ext: 'png', note: 'saved as PNG' }); }); };
        im.onerror = function () { fail(new Error('This browser cannot open this kind of photo. For iPhone HEIC photos, use our HEIC to JPG tool: its copies carry no metadata.')); };
        im.src = URL.createObjectURL(f);
      });
    });
  }
  function nice(v) {
    if (v instanceof Date) return isNaN(v) ? '' : v.toLocaleString();
    if (v instanceof Uint8Array || v instanceof ArrayBuffer) return '(data, ' + (v.byteLength || v.length) + ' bytes)';
    if (Array.isArray(v)) return v.map(nice).join(', ');
    if (v && typeof v === 'object') return Object.keys(v).slice(0, 6).map(function (k) { return k + ': ' + nice(v[k]); }).join('; ');
    if (typeof v === 'number') return String(Math.round(v * 1e6) / 1e6);
    return v == null ? '' : String(v);
  }
  var warn = h('div', { 'class': 'tnote', hidden: true }), facts = h('div', { 'class': 'tstats', hidden: true }), list = h('div', { 'class': 'tkv', 'data-out': '' });
  var bGps = T.button('Remove location', { disabled: true, onclick: function () { run('gps'); } }), bAll = T.button('Remove all metadata', { primary: true, disabled: true, onclick: function () { run('all'); } });
  var current = null;
  function take(files) {
    file = files[0]; results.clear(); list.innerHTML = ''; facts.hidden = warn.hidden = true; status.info('Reading ' + file.name + '…');
    return read(file).then(function (r) {
      current = r; var t = r.tags, keys = Object.keys(t).filter(function (k) { return nice(t[k]) !== '' && !/^(latitude|longitude)$/.test(k); });
      bGps.disabled = bAll.disabled = false;
      facts.innerHTML = ''; facts.hidden = false;
      [[t.Make || t.Model ? [t.Make, t.Model].filter(Boolean).join(' ') : 'Unknown', 'camera or phone'], [t.DateTimeOriginal ? nice(t.DateTimeOriginal) : 'Not recorded', 'taken'],
        [t.ExifImageWidth ? t.ExifImageWidth + ' × ' + t.ExifImageHeight : '—', 'pixels'], [T.bytes(file.size), 'file size'], [keys.length, 'details found']].forEach(function (x) {
        facts.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(x[0]) }), h('span', { text: x[1] })]));
      });
      if (typeof t.latitude === 'number' && typeof t.longitude === 'number') {
        var lat = t.latitude.toFixed(5), lon = t.longitude.toFixed(5);
        warn.innerHTML = ''; warn.hidden = false;
        warn.appendChild(h('p', {}, [h('b', { text: '📍 This photo shows where it was taken: ' + lat + ', ' + lon + '. ' }), 'Anyone you send the original file to can see this. ',
          h('a', { href: 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '#map=16/' + lat + '/' + lon, target: '_blank', rel: 'noopener nofollow', text: 'See it on a map' })]));
      }
      keys.sort().forEach(function (k) { list.appendChild(h('div', {}, [h('span', { text: k }), h('code', { text: nice(t[k]).slice(0, 300) })])); });
      status.info(keys.length ? 'Choose “Remove location” to keep camera details, or “Remove all metadata” before posting the photo publicly.' : 'No hidden details found in this photo.');
    }).catch(status.error);
  }
  function run(mode) {
    if (!file) return;
    clean(file, mode, current ? current.orientation : 1).then(function (r) {
      var nm = T.baseName(file.name) + (mode === 'all' ? '-clean.' : '-no-location.') + r.ext;
      results.set([{ name: nm, blob: r.blob, preview: URL.createObjectURL(r.blob), note: (r.note ? r.note + ' · ' : '') + (mode === 'all' ? 'no metadata' : 'no location') }]);
      status.ok(mode === 'all' ? 'Done! All hidden details are removed. The picture itself is unchanged.' : 'Done! The location is removed; camera and date details are kept.');
    }).catch(status.error);
  }
  function exifSample() {   // a JPG with camera, date and a GPS location (Connaught Place, New Delhi), built by hand
    function u16(a, v) { a.push(v >> 8 & 255, v & 255); } function u32(a, v) { a.push(v >>> 24 & 255, v >> 16 & 255, v >> 8 & 255, v & 255); }
    function txt(s) { return Array.prototype.map.call(s + '\0', function (c) { return c.charCodeAt(0); }); }
    function rat() { var a = []; for (var i = 0; i < arguments.length; i += 2) { u32(a, arguments[i]); u32(a, arguments[i + 1]); } return a; }
    function block(list, at) {
      var head = [], data = [], dataAt = at + 2 + list.length * 12 + 4;
      u16(head, list.length);
      list.forEach(function (e) { u16(head, e[0]); u16(head, e[1]); u32(head, e[2]); if (e[3].length <= 4) head.push.apply(head, e[3].concat([0, 0, 0, 0]).slice(0, 4)); else { u32(head, dataAt + data.length); data.push.apply(data, e[3]); if (data.length % 2) data.push(0); } });
      u32(head, 0); return head.concat(data);
    }
    var make = txt('Infinity Cam'), model = txt('Sample One'), sw = txt('Infinity');
    var exif = [[0x829A, 5, 1, rat(1, 125)], [0x8827, 3, 1, [0, 100]], [0x9003, 2, 20, txt('2026:03:14 09:26:53')]];
    var gps = [[0, 1, 4, [2, 2, 0, 0]], [1, 2, 2, txt('N')], [2, 5, 3, rat(28, 1, 36, 1, 5004, 100)], [3, 2, 2, txt('E')], [4, 5, 3, rat(77, 1, 12, 1, 3240, 100)]];
    function ifd0(exifAt, gpsAt) { return [[0x010F, 2, make.length, make], [0x0110, 2, model.length, model], [0x0112, 3, 1, [0, 1]], [0x0131, 2, sw.length, sw], [0x8769, 4, 1, [exifAt >>> 24 & 255, exifAt >> 16 & 255, exifAt >> 8 & 255, exifAt & 255]], [0x8825, 4, 1, [gpsAt >>> 24 & 255, gpsAt >> 16 & 255, gpsAt >> 8 & 255, gpsAt & 255]]]; }
    var l0 = block(ifd0(0, 0), 8).length, e = block(exif, 8 + l0), gAt = 8 + l0 + e.length, tiff = [0x4D, 0x4D, 0, 0x2A, 0, 0, 0, 8].concat(block(ifd0(8 + l0, gAt), 8), e, block(gps, gAt));
    var seg = [0xFF, 0xE1]; u16(seg, tiff.length + 8); seg = seg.concat(txt('Exif'), [0], tiff);
    var c = h('canvas'); c.width = 480; c.height = 320; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 320);
    gr.addColorStop(0, '#fde68a'); gr.addColorStop(1, '#f97316'); g.fillStyle = gr; g.fillRect(0, 0, 480, 320); g.fillStyle = '#7c2d12'; g.fillRect(60, 180, 360, 140); g.fillStyle = '#fff7ed'; g.font = 'bold 28px sans-serif'; g.fillText('Holiday photo', 140, 120);
    return T.canvasBlob(c, 'image/jpeg', 0.9).then(function (b) { return b.arrayBuffer(); }).then(function (buf) {
      var j = new Uint8Array(buf);
      return new File([j.subarray(0, 2), new Uint8Array(seg), j.subarray(2)], 'holiday-photo.jpg', { type: 'image/jpeg' });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'image/*,.heic,.heif', paste: true, icon: '📍', label: 'Choose a photo', hint: 'JPG, PNG, HEIC, WebP · nothing is uploaded', onFiles: take }),
    warn, facts, T.row([bGps, bAll, T.button('Try a sample', { small: true, onclick: function () { exifSample().then(function (f) { take([f]); }); } })]), status.el, results.el, list]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['exif-viewer'] = function () {
    var f = [];
    return exifSample().then(function (s) {
      return read(s).then(function (r) {
        if (Math.abs(r.tags.latitude - 28.6139) > 0.001 || Math.abs(r.tags.longitude - 77.209) > 0.001 || r.tags.Make !== 'Infinity Cam') f.push('read ' + r.tags.latitude + ',' + r.tags.longitude + ' ' + r.tags.Make);
        return clean(s, 'gps', 1);
      }).then(function (r) { return read(r.blob); }).then(function (r) {
        if (r.tags.latitude != null || r.tags.Make !== 'Infinity Cam') f.push('location not removed or camera lost');
        return clean(s, 'all', 6);
      }).then(function (r) { return Promise.all([read(r.blob), createImageBitmap(r.blob).catch(function () { return null; })]); }).then(function (r) {
        if (r[0].tags.Make || r[0].tags.latitude != null) f.push('metadata left: ' + Object.keys(r[0].tags).join(','));
        if (r[0].orientation !== 6) f.push('orientation ' + r[0].orientation);
        if (!r[1] || r[1].width < 300) f.push('cleaned photo does not open');
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
