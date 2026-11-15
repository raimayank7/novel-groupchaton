/* Infinity by GroupChatOn — audio-convert. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Audio converter: MP3, M4A, WAV, OGG, Opus and FLAC, one file or many, with your choice of quality (ffmpeg.wasm). */
GCOTools.register('audio-convert', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results();
  // ffmpeg.wasm (the single-thread build: needs no special server headers) in a worker of our own. ~31 MB, downloaded once when the first job starts.
  var FF = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core';
  function ffmpeg() {
    if (T.__ff) return T.__ff;
    var src = 'importScripts("' + FF + '.js");var M;onmessage=function(e){var d=e.data;if(d.t==="load"){createFFmpegCore({mainScriptUrlOrBlob:"' + FF + '.js#"+btoa(JSON.stringify({wasmURL:"' + FF + '.wasm",workerURL:""}))})' +
      '.then(function(m){M=m;M.setLogger(function(l){postMessage({t:"log",m:l.message})});postMessage({t:"ready"})},function(x){postMessage({t:"fail",m:String(x&&x.message||x)})});return}' +
      'try{d.files.forEach(function(f){M.FS.writeFile(f.name,new Uint8Array(f.data))});M.setTimeout(-1);M.exec.apply(M,d.args);var rc=M.ret;M.reset();' +
      'var outs=d.outs.map(function(n){try{var b=M.FS.readFile(n);M.FS.unlink(n);return b.buffer}catch(x){return null}});d.files.forEach(function(f){try{M.FS.unlink(f.name)}catch(x){}});' +
      'postMessage({t:"done",rc:rc,outs:outs},outs.filter(Boolean))}catch(x){postMessage({t:"done",rc:-1,outs:[],err:String(x&&x.message||x)})}};';
    var w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' }))), jobs = [], busy = null;
    var api = { run: function (files, args, outs, onLog) { return new Promise(function (ok) { jobs.push({ files: files, args: args, outs: outs, onLog: onLog, ok: ok, log: [] }); pump(); }); } };
    function pump() { if (busy || !jobs.length) return; busy = jobs.shift(); w.postMessage({ t: 'run', files: busy.files, args: ['-hide_banner'].concat(busy.args), outs: busy.outs }, busy.files.map(function (f) { return f.data; })); }
    T.__ff = new Promise(function (ok, fail) {
      w.onmessage = function (e) {
        var d = e.data;
        if (d.t === 'ready') ok(api);
        else if (d.t === 'fail') { T.__ff = null; fail(new Error('The video engine could not start (' + d.m + '). Check your connection and try again.')); }
        else if (d.t === 'log' && busy) { busy.log.push(d.m); if (busy.onLog) busy.onLog(d.m); }
        else if (d.t === 'done') {
          var b = busy; busy = null;
          if (d.rc === -1 && d.err) { T.__ff = null; w.terminate(); }   // out of memory: start a fresh engine next time
          b.ok({ rc: d.rc, outs: d.outs, log: b.log.join('\n') + (d.err ? '\n' + d.err : '') }); pump();
        }
      };
      w.onerror = function (e) { T.__ff = null; fail(new Error('The video engine could not start: ' + (e.message || 'blocked by this browser') + '.')); };
      w.postMessage({ t: 'load' });
    });
    return T.__ff;
  }
  function secs(s) {   // "1:23.5", "83.5" or "0:01:23" → seconds
    var p = String(s || '').trim().split(':').map(Number);
    if (!p.length || p.some(function (x) { return !isFinite(x) || x < 0; })) return NaN;
    return p.reduce(function (a, x) { return a * 60 + x; }, 0);
  }
  function hms(n) { n = Math.max(0, n || 0); var m = Math.floor(n / 60), s = n - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
  function ext(name) { return (String(name).match(/\.([a-z0-9]{2,4})$/i) || [, ''])[1].toLowerCase(); }
  function streams(log) {   // what ffmpeg says about the first input
    var d = /Duration: (\d+):(\d+):([\d.]+)/.exec(log), v = /Stream #0:\d+[^:]*: Video: ([a-z0-9_]+)[^\n]*?, (\d{2,5})x(\d{2,5})/.exec(log), a = /Stream #0:\d+[^:]*: Audio: ([a-z0-9_]+)/.exec(log);
    return { dur: d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0, video: v ? { codec: v[1], w: +v[2], h: +v[3] } : null, audio: a ? a[1] : null };
  }
  function probe(file) {
    return Promise.all([ffmpeg(), T.read(file)]).then(function (r) {
      var nm = 'probe.' + (ext(file.name) || 'bin');
      return r[0].run([{ name: nm, data: r[1] }], ['-i', nm], []);
    }).then(function (r) { var i = streams(r.log); if (!i.dur && !i.video && !i.audio) throw new Error(why(r.log)); return i; });
  }
  function progressOf(total, cb) {
    var dur = total || 0;
    return function (m) {
      var d = !dur && /Duration: (\d+):(\d+):([\d.]+)/.exec(m); if (d) dur = +d[1] * 3600 + +d[2] * 60 + +d[3];
      var t = /time=(\d+):(\d+):([\d.]+)/.exec(m); if (t && dur) cb(Math.min(1, (+t[1] * 3600 + +t[2] * 60 + +t[3]) / dur));
    };
  }
  function why(log) {
    if (/does not contain any stream|matches no streams|Output file is empty/i.test(log)) return 'This file has no sound (or no picture) to work with.';
    if (/Invalid data found|could not find codec|moov atom not found|EBML header parsing failed/i.test(log)) return 'This file could not be read. It may be damaged, or a format we cannot open.';
    if (/memory|Aborted|RuntimeError/i.test(log)) return 'This file is too big for your browser. Try a shorter or smaller file, or a computer with more memory.';
    return 'The conversion did not work. Try a different setting or format.';
  }
  function checkSize(file) { if (file.size > 1.5e9) throw new Error('This file is over 1.5 GB: too big to process inside a browser. Trim or compress it on a computer first.'); }
  function job(file, args, out, total, onP) {   // runs one ffmpeg command on the file (named in.<ext>) → the output bytes
    checkSize(file);
    var nm = 'in.' + (ext(file.name) || 'bin');
    return Promise.all([ffmpeg(), T.read(file)]).then(function (r) {
      return r[0].run([{ name: nm, data: r[1] }], args.map(function (a) { return a === '$IN' ? nm : a; }), [out], progressOf(total, onP || function () {}));
    }).then(function (r) {
      if (r.rc !== 0 || !r.outs[0] || r.outs[0].byteLength < 100) { var e = new Error(why(r.log)); e.log = r.log; throw e; }
      return new Uint8Array(r.outs[0]);
    });
  }
  function sampleVideo() {   // a 4-second test clip with sound, made by ffmpeg itself
    return ffmpeg().then(function (f) {
      return f.run([], ['-f', 'lavfi', '-i', 'testsrc2=size=320x240:rate=15:duration=4', '-f', 'lavfi', '-i', 'sine=frequency=330:duration=4', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '96k', '-shortest', 'sample.mp4'], ['sample.mp4']);
    }).then(function (r) { if (!r.outs[0]) throw new Error('The sample could not be made.'); return new File([r.outs[0]], 'sample-clip.mp4', { type: 'video/mp4' }); });
  }
  function engineNote(st) { if (!T.__ffReady) { st.progress(0.02, 'Loading the video engine (31 MB, only the first time)…'); ffmpeg().then(function () { T.__ffReady = true; }, function () {}); } }
  var FMT = { mp3: ['libmp3lame', 'audio/mpeg', true], m4a: ['aac', 'audio/mp4', true], wav: ['pcm_s16le', 'audio/wav', false], ogg: ['libvorbis', 'audio/ogg', true], opus: ['libopus', 'audio/ogg', true], flac: ['flac', 'audio/flac', false] };
  function args(to, kbps, mono) {
    var f = FMT[to], a = ['-i', '$IN', '-vn', '-map', '0:a:0', '-c:a', f[0]];
    if (f[2]) a.push('-b:a', kbps + 'k');
    if (mono) a.push('-ac', '1');
    if (to === 'm4a') a.push('-movflags', '+faststart');
    return a.concat(['out.' + to]);
  }
  function convert(file, to, kbps, mono, onP) { return job(file, args(to, kbps, mono), 'out.' + to, 0, onP); }
  function wav(seconds) {   // a short tune made right here, for the sample
    var rate = 44100, n = Math.round(seconds * rate), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), notes = [262, 330, 392, 523];
    function s(o, t) { for (var i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); }
    s(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) { var t = i / rate, f = notes[Math.floor(t * 2) % 4], env = 1 - (t * 2 % 1) * 0.8; v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * f * t) * 9000 * env, true); }
    return new File([buf], 'sample-tune.wav', { type: 'audio/wav' });
  }
  var to = T.seg([['mp3', 'MP3'], ['m4a', 'M4A'], ['wav', 'WAV'], ['ogg', 'OGG'], ['opus', 'Opus'], ['flac', 'FLAC']], 'mp3', sync);
  var kbps = T.select([[96, '96 kbps (voice)'], [128, '128 kbps'], [192, '192 kbps (music)'], [256, '256 kbps'], [320, '320 kbps (best)']], 192), kF = T.field('Quality', kbps), mono = h('input', { type: 'checkbox' });
  function sync() { kF.hidden = !FMT[to.value()][2]; }
  var go = T.button('Convert', { primary: true, disabled: true, onclick: run });
  var list = T.fileList(function (f) { go.disabled = !f.length; results.clear(); });
  function run() {
    var files = list.files(), x = to.value(), out = [], i = 0;
    if (!files.length) return Promise.resolve();
    go.disabled = true; engineNote(status);
    function next() {
      if (i >= files.length) { results.set(out, 'converted-audio'); status.ok('Done! ' + out.length + (out.length === 1 ? ' file' : ' files') + ' converted.'); return; }
      var f = files[i++];
      return convert(f, x, +kbps.value, mono.checked, function (p) { status.progress((i - 1 + p) / files.length, 'Converting ' + f.name + ' (' + i + ' of ' + files.length + ')…'); }).then(function (b) {
        out.push({ name: T.baseName(f.name) + '.' + x, blob: new Blob([b], { type: FMT[x][1] }), icon: '🎵' }); return next();
      });
    }
    return next().catch(status.error).then(function () { go.disabled = false; });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'audio/*,video/*,.m4a,.aac,.flac,.opus,.amr,.wma,.mkv', multiple: true, icon: '🎧', label: 'Choose audio files', hint: 'MP3, WAV, M4A, AAC, OGG, FLAC, AMR, even videos · nothing is uploaded', onFiles: list.add }),
    list.el, T.field('Convert to', to), h('div', { 'class': 'tgrid2' }, [kF, h('label', { 'class': 'tcheck' }, [mono, ' Mono (one channel, half the size)'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { list.clear(); list.add([wav(4)]); return run(); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  list.el.style.gridTemplateColumns = 'minmax(0, 1fr)';
  sync();
  T.tests['audio-convert'] = function () {
    var f = [], a = args('wav', 192, true).join(' ');
    if (a.indexOf('-b:a') >= 0 || a.indexOf('-ac 1') < 0 || a.indexOf('pcm_s16le') < 0) f.push('wav args ' + a);
    var src = wav(2);
    return convert(src, 'm4a', 128, false).then(function (b) { if (String.fromCharCode(b[4], b[5], b[6], b[7]) !== 'ftyp') f.push('m4a header'); return probe(new File([b], 'x.m4a')); })
      .then(function (i) { if (i.audio !== 'aac' || Math.abs(i.dur - 2) > 0.15) f.push('m4a ' + JSON.stringify(i)); return convert(src, 'opus', 96, false); })
      .then(function (b) { if (String.fromCharCode(b[0], b[1], b[2], b[3]) !== 'OggS') f.push('opus header'); return convert(src, 'flac', 0, false); })
      .then(function (b) { if (String.fromCharCode(b[0], b[1], b[2], b[3]) !== 'fLaC') f.push('flac header'); })
      .catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 5, fails: f }; });
  };
});
