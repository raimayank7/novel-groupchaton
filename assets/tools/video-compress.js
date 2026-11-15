/* Infinity by GroupChatOn — video-compress. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Compress video: smaller MP4 files by quality level or a target size in MB, with optional lower resolution (ffmpeg.wasm, H.264). */
GCOTools.register('video-compress', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, meta = null;
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
  // o: { mode: 'quality' | 'size', crf, mb, height (0 = keep), sound: true/false }, i: what probe() found
  function plan(o, i) {
    var a = ['-i', '$IN', '-map', '0:v:0'], audioK = o.sound && i.audio ? 96 : 0;
    if (o.height && i.video && i.video.h > o.height) a.push('-vf', 'scale=-2:' + o.height);
    a.push('-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p');
    if (o.mode === 'size') {
      var kbps = Math.max(80, Math.floor(o.mb * 8192 / Math.max(1, i.dur) * 0.95) - audioK);
      a.push('-b:v', kbps + 'k', '-maxrate', Math.round(kbps * 1.5) + 'k', '-bufsize', kbps * 2 + 'k');
    } else a.push('-crf', String(o.crf));
    if (audioK) a.push('-map', '0:a:0', '-c:a', 'aac', '-b:a', audioK + 'k'); else a.push('-an');
    return a.concat(['-movflags', '+faststart', 'out.mp4']);
  }
  function compress(f, o, onP) { return probe(f).then(function (i) { return job(f, plan(o, i), 'out.mp4', i.dur, onP); }); }
  var mode = T.seg([['quality', 'By quality'], ['size', 'To a size']], 'quality', sync);
  var crf = T.select([[24, 'Light (looks the same)'], [28, 'Balanced'], [32, 'Strong (smallest)']], 28), mb = h('input', { type: 'number', min: '1', step: '1', value: '16' });
  var res = T.select([[0, 'Keep the size'], [1080, '1080p (Full HD)'], [720, '720p (HD)'], [480, '480p'], [360, '360p']], 720), sound = h('input', { type: 'checkbox', checked: true });
  var fQ = T.field('Compression', crf), fS = T.field('Target size (MB)', mb, 'WhatsApp: 16 MB for normal videos; email: about 20 MB');
  function sync() { fQ.hidden = mode.value() !== 'quality'; fS.hidden = mode.value() !== 'size'; }
  var go = T.button('Compress video', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return Promise.resolve();
    go.disabled = true; engineNote(status);
    var o = { mode: mode.value(), crf: +crf.value, mb: Math.max(1, +mb.value || 16), height: +res.value, sound: sound.checked };
    return compress(file, o, function (p) { status.progress(p, 'Compressing… ' + Math.round(p * 100) + '% (keep this tab open)'); }).then(function (b) {
      var pct = Math.round((1 - b.length / file.size) * 100);
      results.set([{ name: T.baseName(file.name) + '-compressed.mp4', blob: new Blob([b], { type: 'video/mp4' }), icon: '🎬', note: pct > 0 ? pct + '% smaller' : '' }]);
      status.ok(pct > 0 ? 'Done! ' + T.bytes(file.size) + ' → ' + T.bytes(b.length) + ' (' + pct + '% smaller).' : 'Done, but the result is not smaller: this video is already well compressed. Try a lower resolution or Strong.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'video/*,.mkv,.mov,.avi,.3gp', icon: '📉', label: 'Choose a video', hint: 'MP4, MOV, WebM, MKV… · nothing is uploaded', onFiles: take }), info,
    T.field('How', mode), fQ, fS, h('div', { 'class': 'tgrid2' }, [T.field('Resolution', res), h('label', { 'class': 'tcheck' }, [sound, ' Keep the sound'])]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { engineNote(status); sampleVideo().then(function (f) { take([f]); return run(); }).catch(status.error); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  sync();
  T.tests['video-compress'] = function () {
    var f = [], i = { dur: 100, video: { w: 1920, h: 1080 }, audio: 'aac' };
    var a = plan({ mode: 'size', mb: 10, height: 720, sound: true }, i).join(' ');
    if (a.indexOf('scale=-2:720') < 0 || a.indexOf('-b:v 682k') < 0 || a.indexOf('-b:a 96k') < 0) f.push('size plan: ' + a);
    if (plan({ mode: 'quality', crf: 28, height: 1080, sound: false }, { dur: 5, video: { w: 640, h: 360 }, audio: 'aac' }).join(' ').match(/scale|-c:a/)) f.push('quality plan should not upscale or keep sound');
    return sampleVideo().then(function (v) { return compress(v, { mode: 'quality', crf: 32, height: 120, sound: false }).then(function (b) { return probe(new File([b], 'x.mp4')); }); }).then(function (r) {
      if (!r.video || r.video.h !== 120 || r.video.w !== 160 || r.audio) f.push('result ' + JSON.stringify(r));
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
