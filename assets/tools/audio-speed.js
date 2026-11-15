/* Infinity by GroupChatOn — audio-speed. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Change audio speed and pitch on the device: faster or slower with the same pitch (WSOLA time-stretch), or shift pitch by semitones; saves WAV. */
GCOTools.register('audio-speed', function (spot, T) {
  var h = T.h, status = T.status(), results = (function (r) { var s = r.set; r.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; r.set = function (l, z) { s(l, z); var g = r.el.querySelector('.tresults-grid'); if (g) g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }; return r; })(T.results());
  var N = 2048, HS = 512, TOL = 256;
  function resample(x, f) { var n = Math.floor(x.length / f), y = new Float32Array(n); for (var i = 0; i < n; i++) { var p = i * f, j = Math.floor(p), a = p - j; y[i] = x[j] * (1 - a) + (x[j + 1] || 0) * a; } return y; }
  function hann() { var w = new Float32Array(N); for (var i = 0; i < N; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N); return w; }
  // WSOLA: each output frame copies the input frame near its ideal place that best continues the previous one, so pitch is kept
  function stretch(chs, rate, onProg) {
    return new Promise(function (ok) {
      var len = chs[0].length, padded = chs.map(function (c) { var p = new Float32Array(len + N + 2 * TOL); p.set(c); return p; }), mono = padded[0], w = hann();
      if (padded.length > 1) { mono = new Float32Array(padded[0].length); padded.forEach(function (c) { for (var i = 0; i < c.length; i++) mono[i] += c[i] / padded.length; }); }
      var outLen = Math.round(len / rate), ys = padded.map(function () { return new Float32Array(outLen + N); }), ws = new Float32Array(outLen + N), k = 0, prev = 0;
      function corr(a, b) { var s = 0; for (var i = 0; i < N / 2; i += 8) s += mono[a + i] * mono[b + i]; return s; }
      (function chunk() {
        var stopAt = k + 300;
        for (; k < stopAt; k++) {
          var outPos = k * HS; if (outPos >= outLen) break;
          var ideal = Math.round(outPos * rate), pos = ideal;
          if (k > 0) {
            var nat = prev + HS, best = -Infinity, lo = Math.max(0, ideal - TOL), hi = Math.min(mono.length - N - 1, ideal + TOL), p;
            for (p = lo; p <= hi; p += 4) { var c = corr(nat, p); if (c > best) { best = c; pos = p; } }
            var c0 = pos; for (p = Math.max(lo, c0 - 3); p <= Math.min(hi, c0 + 3); p++) { var cc = corr(nat, p); if (cc > best) { best = cc; pos = p; } }
          }
          if (pos + N > mono.length) pos = mono.length - N;
          for (var ch = 0; ch < padded.length; ch++) { var x = padded[ch], y = ys[ch]; for (var i = 0; i < N; i++) y[outPos + i] += x[pos + i] * w[i]; }
          for (var j = 0; j < N; j++) ws[outPos + j] += w[j];
          prev = pos;
        }
        if (onProg) onProg(Math.min(1, k * HS / outLen));
        if (k * HS < outLen) return setTimeout(chunk, 0);
        ok(ys.map(function (y) { var o = new Float32Array(outLen); for (var i = 0; i < outLen; i++) o[i] = ws[i] > 1e-3 ? y[i] / ws[i] : 0; return o; }));
      })();
    });
  }
  function change(chs, speed, semis, keep, onProg) {
    var P = (keep ? 1 : speed) * Math.pow(2, semis / 12), r = speed / P;
    return (Math.abs(r - 1) > 0.001 ? stretch(chs, r, onProg) : Promise.resolve(chs)).then(function (s) { return Math.abs(P - 1) > 0.001 ? s.map(function (c) { return resample(c, P); }) : s; });
  }
  function wav(chs, sr) {
    var n = chs[0].length, nc = chs.length, v = new DataView(new ArrayBuffer(44 + n * nc * 2)), o = 44;
    function str(at, s) { for (var i = 0; i < s.length; i++) v.setUint8(at + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + n * nc * 2, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nc, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * nc * 2, true); v.setUint16(32, nc * 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * nc * 2, true);
    for (var i = 0; i < n; i++) for (var c = 0; c < nc; c++) { var x = Math.max(-1, Math.min(1, chs[c][i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); o += 2; }
    return new Blob([v.buffer], { type: 'audio/wav' });
  }
  function crossings(x, sr) { var n = 0; for (var i = 1; i < x.length; i++) if (x[i - 1] < 0 && x[i] >= 0) n++; return n / (x.length / sr); }
  var src = null, name = 'audio', player = h('audio', { controls: true, style: 'width:100%', hidden: true });
  var speed = h('input', { type: 'range', min: '0.5', max: '2', step: '0.05', value: '1.25' }), semis = h('input', { type: 'range', min: '-12', max: '12', step: '1', value: '0' }), keep = h('input', { type: 'checkbox', checked: true });
  var lab = h('div', { 'class': 'tnote', 'data-out': '' });
  function label() { lab.textContent = 'Speed ×' + (+speed.value).toFixed(2) + ' · pitch ' + (+semis.value > 0 ? '+' : '') + semis.value + ' semitones' + (keep.checked ? ' · voice pitch kept' : ' · pitch follows speed'); if (!player.hidden) { player.playbackRate = +speed.value; player.preservesPitch = player.mozPreservesPitch = player.webkitPreservesPitch = keep.checked; } }
  [speed, semis, keep].forEach(function (x) { x.addEventListener('input', label); x.addEventListener('change', label); });
  var presets = T.row([0.75, 1.25, 1.5, 2].map(function (v) { return T.button('×' + v, { small: true, onclick: function () { speed.value = v; label(); } }); }));
  function open(file) {
    status.info('Opening ' + file.name + '…'); results.clear(); name = T.baseName(file.name);
    file.arrayBuffer().then(function (ab) { var c = new (window.AudioContext || window.webkitAudioContext)(); return c.decodeAudioData(ab).then(function (b) { c.close(); return b; }); }).then(function (b) {
      var chs = []; for (var i = 0; i < Math.min(2, b.numberOfChannels); i++) chs.push(new Float32Array(b.getChannelData(i)));
      src = { chs: chs, sr: b.sampleRate }; player.src = URL.createObjectURL(file); player.hidden = false; label(); go.disabled = false;
      status.ok(file.name + ': ' + Math.floor(b.duration / 60) + ' min ' + Math.round(b.duration % 60) + ' s. Play it to hear the speed live, or press Make to save.');
    }).catch(function () { status.error('This file could not be opened. Try MP3, WAV, OGG or M4A.'); });
  }
  function make() {
    if (!src) return; go.disabled = true; var t = Date.now();
    change(src.chs, +speed.value, +semis.value, keep.checked, function (p) { status.progress(p, 'Working… ' + Math.round(p * 100) + '%'); }).then(function (out) {
      var b = wav(out, src.sr), secs = out[0].length / src.sr;
      results.set([{ name: name + '-x' + (+speed.value).toFixed(2) + (+semis.value ? '-' + (+semis.value > 0 ? 'up' : 'down') + Math.abs(semis.value) : '') + '.wav', blob: b, icon: '🎵', note: Math.floor(secs / 60) + ':' + ('0' + Math.round(secs % 60)).slice(-2) }], 'audio');
      status.ok('Done in ' + ((Date.now() - t) / 1000).toFixed(1) + ' s. Download your WAV file below.'); go.disabled = false;
    });
  }
  function sample() {
    var sr = 22050, notes = [262, 294, 330, 349, 392, 440, 494, 523], x = new Float32Array(sr * 3);
    for (var i = 0; i < x.length; i++) { var n = Math.floor(i / (sr * 3 / 8)), t = (i % (sr * 3 / 8)) / sr; x[i] = 0.4 * Math.sin(2 * Math.PI * notes[n] * i / sr) * Math.min(1, t * 40) * Math.exp(-t * 2); }
    src = { chs: [x], sr: sr }; name = 'sample-scale'; go.disabled = false; label(); make();
  }
  var go = T.button('Make', { primary: true, disabled: true, onclick: make });
  spot.appendChild(T.card([T.dropzone({ accept: 'audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus', icon: '🎵', label: 'Choose an audio file', hint: 'MP3, WAV, OGG, M4A · nothing is uploaded', onFiles: function (f) { open(f[0]); } }),
    player, T.field('Speed (0.5× to 2×)', speed), presets, T.field('Pitch (semitones)', semis), h('label', { 'class': 'tcheck' }, [keep, ' Keep the original pitch when changing speed']), lab,
    T.row([go, T.button('Try a sample', { small: true, onclick: sample })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  label();
  T.tests['audio-speed'] = function () {
    var f = [], sr = 8000, x = new Float32Array(sr * 2);
    for (var i = 0; i < x.length; i++) x[i] = Math.sin(2 * Math.PI * 440 * i / sr);
    if (resample(new Float32Array(1000), 2).length !== 500) f.push('resample length');
    return change([x], 2, 0, true).then(function (o) {
      if (Math.abs(o[0].length - sr) > 1) f.push('stretch length ' + o[0].length);
      var hz = crossings(o[0].subarray(1000, 7000), sr); if (Math.abs(hz - 440) > 9) f.push('kept pitch ' + hz);
      return change([x], 1, 12, true);
    }).then(function (o) {
      if (Math.abs(o[0].length - x.length) > 2) f.push('pitch-only length ' + o[0].length);
      var hz = crossings(o[0].subarray(2000, 14000), sr); if (Math.abs(hz - 880) > 18) f.push('octave up ' + hz);
      return change([x], 0.5, 0, false);
    }).then(function (o) {
      if (Math.abs(o[0].length - 2 * x.length) > 2 || Math.abs(crossings(o[0], sr) - 220) > 5) f.push('slow chipmunk');
      if (wav([new Float32Array(10), new Float32Array(10)], 8000).size !== 84) f.push('stereo wav size');
      return { ok: !f.length, n: 6, fails: f };
    });
  };
});
