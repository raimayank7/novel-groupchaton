/* Infinity by GroupChatOn — video-mute. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Remove audio from video: a silent copy in seconds, with the picture copied untouched (ffmpeg.wasm). */
GCOTools.register('video-mute', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
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
  function mute(f, onP) {
    var x = ext(f.name), keepExt = /^(mp4|mov|m4v|webm|mkv|avi|3gp)$/.test(x) ? x : 'mp4', out = 'out.' + keepExt;
    return job(f, ['-i', '$IN', '-map', '0:v:0', '-c', 'copy', '-an', out], out, 0, onP).catch(function () {
      return job(f, ['-i', '$IN', '-map', '0:v:0', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-an', 'out.mp4'], 'out.mp4', 0, onP).then(function (b) { b.name = 'mp4'; return b; });
    }).then(function (b) { return { bytes: b, ext: b.name || keepExt }; });
  }
  var go = T.button('Remove sound', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return Promise.resolve();
    go.disabled = true; engineNote(status);
    return mute(file, function (p) { status.progress(p, 'Removing the sound… ' + Math.round(p * 100) + '%'); }).then(function (r) {
      var mime = { webm: 'video/webm', mov: 'video/quicktime', mkv: 'video/x-matroska', avi: 'video/x-msvideo', '3gp': 'video/3gpp' }[r.ext] || 'video/mp4';
      results.set([{ name: T.baseName(file.name) + '-no-sound.' + r.ext, blob: new Blob([r.bytes], { type: mime }), icon: '🔇' }]);
      status.ok('Done! The video is silent and the picture is unchanged.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'video/*,.mkv,.mov,.avi,.3gp', icon: '🔇', label: 'Choose a video', hint: 'MP4, MOV, WebM, MKV… · nothing is uploaded', onFiles: take }), info,
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { engineNote(status); sampleVideo().then(function (f) { take([f]); return run(); }).catch(status.error); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['video-mute'] = function () {
    var f = [];
    return sampleVideo().then(function (v) { return mute(v); }).then(function (r) { if (r.ext !== 'mp4') f.push('kept as ' + r.ext); return probe(new File([r.bytes], 'x.mp4')); }).then(function (i) {
      if (i.audio || !i.video || i.video.codec !== 'h264' || Math.abs(i.dur - 4) > 0.3) f.push('result ' + JSON.stringify(i));
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 2, fails: f }; });
  };
});
