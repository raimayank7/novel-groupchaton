/* Infinity by GroupChatOn — audio-trim. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Audio trimmer and ringtone maker: pick a part on the waveform, add fades, save MP3 or WAV (Web Audio + lamejs). */
GCOTools.register('audio-trim', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), name = 'audio', clip = null, ctx = null, playing = null;
  var LAME = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
  function secs(s) { var p = String(s || '').trim().split(':').map(Number); if (!p.length || p.some(function (x) { return !isFinite(x) || x < 0; })) return NaN; return p.reduce(function (a, x) { return a * 60 + x; }, 0); }
  function hms(n) { n = Math.max(0, n || 0); var m = Math.floor(n / 60), s = n - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
  // any audio (or video with sound) the browser can play → { rate, duration, channels: [Float32Array] } at 44.1 kHz
  function decode(file) {
    return T.read(file).then(function (buf) {
      var C = window.OfflineAudioContext || window.webkitOfflineAudioContext, ctx = new C(2, 44100, 44100);
      return new Promise(function (ok, fail) {
        var p = ctx.decodeAudioData(buf, ok, function () { fail(new Error(file.name + ' could not be opened as audio. Try MP3, WAV, M4A or OGG, or convert it first with our Audio Converter.')); });
        if (p && p.catch) p.catch(function () {});
      });
    }).then(function (ab) {
      var ch = []; for (var i = 0; i < ab.numberOfChannels; i++) ch.push(ab.getChannelData(i));
      return { rate: ab.sampleRate, duration: ab.duration, channels: ch };
    });
  }
  function part(c, s, e, fadeIn, fadeOut) {   // a copy of s–e seconds with straight-line fades
    var a = Math.floor(s * c.rate), b = Math.min(c.channels[0].length, Math.floor(e * c.rate)), n = Math.max(0, b - a), fi = Math.round(fadeIn * c.rate), fo = Math.round(fadeOut * c.rate);
    return { rate: c.rate, duration: n / c.rate, channels: c.channels.map(function (d) {
      var o = d.slice(a, b);
      for (var i = 0; i < Math.min(fi, n); i++) o[i] *= i / fi;
      for (i = 0; i < Math.min(fo, n); i++) o[n - 1 - i] *= i / fo;
      return o;
    }) };
  }
  function wavOf(c) {   // 16-bit PCM WAV
    var ch = c.channels.length, n = c.channels[0].length, buf = new ArrayBuffer(44 + n * ch * 2), v = new DataView(buf);
    function s(o, t) { for (var i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); }
    s(0, 'RIFF'); v.setUint32(4, 36 + n * ch * 2, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, c.rate, true);
    v.setUint32(28, c.rate * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * ch * 2, true);
    for (var i = 0, o = 44; i < n; i++) for (var k = 0; k < ch; k++, o += 2) { var x = Math.max(-1, Math.min(1, c.channels[k][i])); v.setInt16(o, x < 0 ? x * 32768 : x * 32767, true); }
    return new Blob([buf], { type: 'audio/wav' });
  }
  function mp3(c, kbps, onP) {   // encodes in small batches so the page stays responsive
    return T.loadScript(LAME).then(function () {
      var L = window.lamejs, ch = Math.min(2, c.channels.length), enc = new L.Mp3Encoder(ch, c.rate, kbps), out = [], n = c.channels[0].length, B = 1152, i = 0;
      var pcm = c.channels.slice(0, ch).map(function (d) { var a = new Int16Array(d.length); for (var j = 0; j < d.length; j++) { var x = Math.max(-1, Math.min(1, d[j])); a[j] = x < 0 ? x * 32768 : x * 32767; } return a; });
      return new Promise(function (ok) {
        (function step() {
          for (var k = 0; k < 300 && i < n; k++, i += B) { var m = ch === 2 ? enc.encodeBuffer(pcm[0].subarray(i, i + B), pcm[1].subarray(i, i + B)) : enc.encodeBuffer(pcm[0].subarray(i, i + B)); if (m.length) out.push(new Uint8Array(m)); }
          if (onP) onP(Math.min(1, i / n));
          if (i < n) return setTimeout(step, 0);
          var e = enc.flush(); if (e.length) out.push(new Uint8Array(e));
          ok(new Blob(out, { type: 'audio/mpeg' }));
        })();
      });
    });
  }
  function tune(seconds, name, pitch) {   // a short melody made right here, for samples
    var rate = 44100, n = Math.round(seconds * rate), c = { rate: rate, channels: [new Float32Array(n)] }, notes = [262, 294, 330, 392, 440, 392, 330, 294];
    for (var i = 0; i < n; i++) { var t = i / rate, f = notes[Math.floor(t * 2) % 8] * (pitch || 1), env = 1 - (t * 2 % 1) * 0.85; c.channels[0][i] = Math.sin(2 * Math.PI * f * t) * 0.3 * env; }
    return new File([wavOf(c)], name || 'sample-song.wav', { type: 'audio/wav' });
  }
  var cv = h('canvas', { width: '900', height: '160', style: 'width:100%;height:auto;aspect-ratio:900/160;background:var(--bg);border-radius:12px;touch-action:none;cursor:ew-resize', 'aria-label': 'Waveform: drag to choose the part to keep' });
  var a = h('input', { type: 'text', value: '0:00.0' }), b = h('input', { type: 'text', value: '0:30.0' });
  var fin = T.select([[0, 'No fade in'], [1, '1 s fade in'], [2, '2 s fade in']], 1), fout = T.select([[0, 'No fade out'], [1, '1 s fade out'], [3, '3 s fade out']], 1);
  var fmt = T.seg([['mp3', 'MP3'], ['wav', 'WAV']], 'mp3');
  var go = T.button('Save the part', { primary: true, disabled: true, onclick: run }), play = T.button('▶ Play the part', { small: true, disabled: true, onclick: toggle });
  var info = h('p', { 'class': 'tstatus' });
  function sel() { return { s: Math.max(0, secs(a.value) || 0), e: Math.min(clip ? clip.duration : 0, secs(b.value) || 0) }; }
  function paint() {
    if (!clip) return;
    var g = cv.getContext('2d'), W = cv.width, H = cv.height, d = clip.channels[0], step = Math.max(1, Math.floor(d.length / W)), r = sel();
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(14,165,233,.16)'; g.fillRect(r.s / clip.duration * W, 0, (r.e - r.s) / clip.duration * W, H);
    for (var x = 0; x < W; x++) {
      var mx = 0; for (var i = x * step, end = Math.min(d.length, i + step); i < end; i += 4) { var v = Math.abs(d[i]); if (v > mx) mx = v; }
      var t = x / W * clip.duration; g.fillStyle = t >= r.s && t <= r.e ? '#0ea5e9' : '#94a3b8';
      g.fillRect(x, H / 2 - mx * H * 0.46, 1, Math.max(1, mx * H * 0.92));
    }
    g.fillStyle = '#ef4444'; g.fillRect(r.s / clip.duration * W - 1, 0, 3, H); g.fillRect(r.e / clip.duration * W - 1, 0, 3, H);
    info.textContent = name + ' · ' + hms(clip.duration) + ' long · keeping ' + hms(Math.max(0, r.e - r.s));
  }
  var drag = null;
  function at(e) { var r = cv.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * clip.duration; }
  cv.addEventListener('pointerdown', function (e) { if (!clip) return; var t = at(e), r = sel(); drag = Math.abs(t - r.s) < Math.abs(t - r.e) ? a : b; drag.value = hms(t); cv.setPointerCapture(e.pointerId); paint(); });
  cv.addEventListener('pointermove', function (e) { if (drag) { drag.value = hms(at(e)); paint(); } });
  ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drag = null; }); });
  [a, b].forEach(function (x) { x.addEventListener('input', paint); });
  function toggle() {
    if (playing) { playing.stop(); playing = null; play.textContent = '▶ Play the part'; return; }
    var r = sel(); if (!(r.e > r.s)) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    var p = part(clip, r.s, r.e, +fin.value, +fout.value), buf = ctx.createBuffer(p.channels.length, p.channels[0].length, p.rate);
    p.channels.forEach(function (c, i) { buf.copyToChannel(c, i); });
    playing = ctx.createBufferSource(); playing.buffer = buf; playing.connect(ctx.destination); playing.onended = function () { playing = null; play.textContent = '▶ Play the part'; }; playing.start(); play.textContent = '■ Stop';
  }
  function take(files) {
    var f = files[0]; name = f.name; results.clear(); status.info('Opening ' + f.name + '…');
    return decode(f).then(function (c) {
      clip = c; go.disabled = play.disabled = false; a.value = hms(0); b.value = hms(Math.min(c.duration, 30)); paint(); status.clear();
    }).catch(status.error);
  }
  function run() {
    if (!clip) return Promise.resolve();
    var r = sel();
    if (!(r.e - r.s >= 0.1)) return Promise.resolve(status.error('Choose a part at least 0.1 s long: the end must be after the start.'));
    var p = part(clip, r.s, r.e, +fin.value, +fout.value), x = fmt.value();
    status.progress(0.3, 'Saving…');
    return (x === 'mp3' ? mp3(p, 192) : Promise.resolve(wavOf(p))).then(function (blob) {
      results.set([{ name: T.baseName(name) + '-part.' + x, blob: blob, icon: '🎵', note: hms(r.e - r.s) }]);
      status.ok('Done! For an iPhone ringtone, convert the MP3 to M4A with our Audio Converter and rename it to .m4r.');
    }).catch(status.error);
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'audio/*,video/*,.m4a,.aac,.flac,.opus', icon: '✂️', label: 'Choose a song or recording', hint: 'MP3, WAV, M4A, OGG… · nothing is uploaded', onFiles: take }), info, cv,
    h('div', { 'class': 'tgrid2' }, [T.field('Start', a, 'minutes:seconds'), T.field('End', b, 'minutes:seconds'), T.field('Fade in', fin), T.field('Fade out', fout), T.field('Save as', fmt)]),
    T.row([play, T.button('30 s ringtone', { small: true, onclick: function () { if (!clip) return; var s = sel().s; b.value = hms(Math.min(clip.duration, s + 30)); paint(); } })]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { take([tune(40)]).then(function () { a.value = '0:04.0'; b.value = '0:16.0'; paint(); return run(); }); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['audio-trim'] = function () {
    var f = [], src = { rate: 8000, duration: 3, channels: [new Float32Array(24000).fill(0.5)] };
    var p = part(src, 1, 2, 0.5, 0.25);
    if (p.channels[0].length !== 8000) f.push('length ' + p.channels[0].length);
    if (p.channels[0][0] !== 0 || Math.abs(p.channels[0][4000] - 0.5) > 1e-6 || Math.abs(p.channels[0][7999]) > 0.01 || Math.abs(p.channels[0][2000] - 0.25) > 0.01) f.push('fades');
    var w = wavOf({ rate: 8000, channels: [new Float32Array(100), new Float32Array(100)] });
    return w.arrayBuffer().then(function (buf) {
      var v = new DataView(buf); if (buf.byteLength !== 444 || v.getUint32(40, true) !== 400 || v.getUint16(22, true) !== 2) f.push('wav header');
      return decode(tune(3));
    }).then(function (c) {
      if (Math.abs(c.duration - 3) > 0.01) f.push('decoded ' + c.duration);
      return mp3(part(c, 0.5, 2.5, 0, 0), 128);
    }).then(function (m) { return m.arrayBuffer(); }).then(function (buf) {
      var u = new Uint8Array(buf); if (u[0] !== 0xFF || (u[1] & 0xE0) !== 0xE0) f.push('mp3 frame sync');
      return decode(new File([buf], 'x.mp3'));
    }).then(function (c) { if (Math.abs(c.duration - 2) > 0.08) f.push('mp3 length ' + c.duration); })
      .catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 6, fails: f }; });
  };
});
