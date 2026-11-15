/* Infinity by GroupChatOn — audio-join. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Join audio files: songs or recordings back to back in your order, with an optional gap, saved as MP3 or WAV (Web Audio + lamejs). */
GCOTools.register('audio-join', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
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
  // clips of the same sample rate → one clip; gap in seconds; smooth adds a 30 ms fade at every join so there is no click
  function join(clips, gap, smooth) {
    var rate = clips[0].rate, chans = Math.max.apply(0, clips.map(function (c) { return c.channels.length; })), g = Math.round(gap * rate);
    var total = clips.reduce(function (n, c) { return n + c.channels[0].length; }, 0) + g * (clips.length - 1), out = [];
    for (var ch = 0; ch < chans; ch++) out.push(new Float32Array(total));
    var at = 0, f = smooth ? Math.round(0.03 * rate) : 0;
    clips.forEach(function (c, k) {
      var n = c.channels[0].length;
      for (ch = 0; ch < chans; ch++) {
        var src = c.channels[Math.min(ch, c.channels.length - 1)], dst = out[ch];
        dst.set(src, at);
        for (var i = 0; i < Math.min(f, n); i++) { if (k > 0) dst[at + i] *= i / f; if (k < clips.length - 1) dst[at + n - 1 - i] *= i / f; }
      }
      at += n + g;
    });
    return { rate: rate, duration: total / rate, channels: out };
  }
  var gap = T.select([[0, 'No gap'], [0.5, '0.5 s'], [1, '1 s'], [2, '2 s'], [3, '3 s']], 0), smooth = h('input', { type: 'checkbox', checked: true }), fmt = T.seg([['mp3', 'MP3'], ['wav', 'WAV']], 'mp3');
  var kbps = T.select([[128, '128 kbps'], [192, '192 kbps'], [320, '320 kbps']], 192);
  var go = T.button('Join files', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = f.length < 2; results.clear(); });
  function run(filesIn) {
    var files = Array.isArray(filesIn) ? filesIn : list.files();
    if (files.length < 2) return Promise.resolve(status.error('Choose at least 2 files.'));
    go.disabled = true;
    var clips = [], i = 0;
    function next() {
      if (i >= files.length) return;
      var fl = files[i++]; status.progress(i / (files.length + 1), 'Opening ' + fl.name + '…');
      return decode(fl).then(function (c) { clips.push(c); return next(); });
    }
    return next().then(function () {
      var j = join(clips, +gap.value, smooth.checked), x = fmt.value();
      if (j.duration > 3 * 3600) throw new Error('That is over 3 hours of audio: too much for a browser to join in one go.');
      status.progress(0.9, 'Saving ' + hms(j.duration) + ' of audio…');
      return (x === 'mp3' ? mp3(j, +kbps.value) : Promise.resolve(wavOf(j))).then(function (blob) {
        results.set([{ name: 'joined-audio.' + x, blob: blob, icon: '🎵', note: hms(j.duration) }]);
        status.ok('Done! ' + files.length + ' files joined: ' + hms(j.duration) + ' in total.');
      });
    }).catch(status.error).then(function () { go.disabled = list.files().length < 2; });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'audio/*,video/*,.m4a,.aac,.flac,.opus', multiple: true, icon: '🔗', label: 'Choose 2 or more audio files', hint: 'they play in this order · reorder with the arrows', onFiles: list.add }),
    list.el, h('div', { 'class': 'tgrid2' }, [T.field('Gap between files', gap), T.field('Save as', fmt), T.field('MP3 quality', kbps), h('label', { 'class': 'tcheck' }, [smooth, ' Smooth joins (no clicks)'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { var a = tune(5, 'part-1.wav'), b = tune(4, 'part-2.wav', 1.5); list.clear(); list.add([a, b]); return run([a, b]); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  list.el.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['audio-join'] = function () {
    var f = [], one = function (n, v) { return { rate: 1000, duration: n / 1000, channels: [new Float32Array(n).fill(v)] }; };
    var j = join([one(1000, 0.5), { rate: 1000, duration: 0.5, channels: [new Float32Array(500).fill(0.25), new Float32Array(500).fill(-0.25)] }], 0.5, false);
    if (j.channels.length !== 2 || j.channels[0].length !== 2000 || j.channels[1][999] !== 0.5 || j.channels[1][1200] !== 0 || j.channels[1][1600] !== -0.25) f.push('join layout');
    var s = join([one(1000, 1), one(1000, 1)], 0, true);
    if (s.channels[0][999] !== 0 || s.channels[0][1000] !== 0 || s.channels[0][500] !== 1) f.push('smooth joins');
    return Promise.all([decode(tune(2, 'a.wav')), decode(tune(1, 'b.wav'))]).then(function (c) { return wavOf(join(c, 1, true)); }).then(function (w) { return decode(new File([w], 'j.wav')); })
      .then(function (c) { if (Math.abs(c.duration - 4) > 0.01) f.push('joined length ' + c.duration); })
      .catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
