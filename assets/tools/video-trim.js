/* Infinity by GroupChatOn — video-trim. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Trim and cut video: keep a part or remove a part, instantly without re-encoding or frame-exact (ffmpeg.wasm). */
GCOTools.register('video-trim', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, dur = 0;
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
  // o: { a, b (seconds), keep: true = keep a–b / false = remove a–b, exact }, i: what probe() found
  function plan(f, o, i) {
    var x = ext(f.name), fastExt = /^(mp4|mov|m4v|webm|mkv)$/.test(x) ? x : 'mp4', len = o.b - o.a;
    if (o.keep && !o.exact) return { args: ['-ss', String(o.a), '-i', '$IN', '-t', String(len), '-map', '0:v?', '-map', '0:a?', '-c', 'copy', '-avoid_negative_ts', 'make_zero', 'out.' + fastExt], out: 'out.' + fastExt, total: len };
    var enc = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p'].concat(i.audio ? ['-c:a', 'aac', '-b:a', '160k'] : ['-an'], ['-movflags', '+faststart', 'out.mp4']);
    if (o.keep) return { args: ['-ss', String(o.a), '-i', '$IN', '-t', String(len), '-map', '0:v:0'].concat(i.audio ? ['-map', '0:a:0'] : [], enc), out: 'out.mp4', total: len };
    var keepV = "select='not(between(t," + o.a + ',' + o.b + "))',setpts=N/FRAME_RATE/TB", keepA = "aselect='not(between(t," + o.a + ',' + o.b + "))',asetpts=N/SR/TB";
    return { args: ['-i', '$IN', '-vf', keepV].concat(i.audio ? ['-af', keepA] : [], enc), out: 'out.mp4', total: Math.max(0.1, i.dur - len) };
  }
  function trim(f, o, onP) { return probe(f).then(function (i) { var p = plan(f, o, i); return job(f, p.args, p.out, p.total, onP).then(function (b) { return { bytes: b, name: p.out }; }); }); }
  var video = h('video', { controls: true, playsinline: true, preload: 'metadata', style: 'width:100%;max-height:360px;border-radius:12px;background:#000', hidden: true });
  var a = h('input', { type: 'text', value: '0:00.0', inputmode: 'decimal' }), b = h('input', { type: 'text', value: '0:10.0', inputmode: 'decimal' });
  var keep = T.seg([['keep', 'Keep this part'], ['cut', 'Remove this part']], 'keep'), exact = T.seg([['fast', 'Fast'], ['exact', 'Frame-exact']], 'fast');
  var go = T.button('Trim video', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) {
    file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size);
    video.src = URL.createObjectURL(file); video.hidden = false;
    return new Promise(function (ok) {
      var done = function () { dur = isFinite(video.duration) ? video.duration : 0; if (dur) { a.value = hms(0); b.value = hms(Math.min(dur, 10)); info.textContent += ' · ' + hms(dur); } ok(); };
      video.onloadedmetadata = done; video.onerror = function () { video.hidden = true; ok(); };   // no preview for some formats: times still work
      setTimeout(ok, 4000);
    });
  }
  function run() {
    if (!file) return Promise.resolve();
    var s = secs(a.value), e = secs(b.value);
    if (!(e > s)) return Promise.resolve(status.error('The end time must be after the start time, e.g. start 0:05 and end 0:20.'));
    if (dur && s >= dur) return Promise.resolve(status.error('The start is after the end of the video (' + hms(dur) + ').'));
    if (dur) e = Math.min(e, dur);
    go.disabled = true; engineNote(status);
    return trim(file, { a: s, b: e, keep: keep.value() === 'keep', exact: exact.value() === 'exact' }, function (p) { status.progress(p, 'Working… ' + Math.round(p * 100) + '%'); }).then(function (r) {
      var x = ext(r.name), blob = new Blob([r.bytes], { type: x === 'webm' ? 'video/webm' : x === 'mov' ? 'video/quicktime' : x === 'mkv' ? 'video/x-matroska' : 'video/mp4' });
      results.set([{ name: T.baseName(file.name) + (keep.value() === 'keep' ? '-trimmed.' : '-cut.') + x, blob: blob, icon: '✂️' }]);
      status.ok('Done!' + (keep.value() === 'keep' && exact.value() === 'fast' ? ' Fast mode starts at the nearest key frame, so the start can be up to a second or two early. Choose Frame-exact for a precise cut.' : ''));
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'video/*,.mkv,.mov,.avi,.3gp', icon: '✂️', label: 'Choose a video', hint: 'MP4, MOV, WebM, MKV… · nothing is uploaded', onFiles: take }), info, video,
    h('div', { 'class': 'tgrid2' }, [T.field('Start', a, 'minutes:seconds'), T.field('End', b, 'minutes:seconds')]),
    T.row([T.button('Start = now', { small: true, onclick: function () { a.value = hms(video.currentTime); } }), T.button('End = now', { small: true, onclick: function () { b.value = hms(video.currentTime); } })]),
    h('div', { 'class': 'tgrid2' }, [T.field('What to do', keep), T.field('Cut', exact)]),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () { engineNote(status); sampleVideo().then(function (f) { return take([f]); }).then(function () { a.value = '0:01.0'; b.value = '0:03.0'; return run(); }).catch(status.error); } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['video-trim'] = function () {
    var f = [], p = plan({ name: 'a.MOV' }, { a: 5, b: 20, keep: true, exact: false }, { audio: 'aac', dur: 60 });
    if (p.out !== 'out.mov' || p.args.join(' ').indexOf('-ss 5 -i $IN -t 15') !== 0) f.push('fast plan ' + p.args.join(' '));
    if (plan({ name: 'a.avi' }, { a: 5, b: 20, keep: false, exact: true }, { audio: null, dur: 60 }).args.join(' ').indexOf('-af') >= 0) f.push('remove plan without sound');
    return sampleVideo().then(function (v) {
      return trim(v, { a: 1, b: 3, keep: true, exact: true }).then(function (r) { return probe(new File([r.bytes], r.name)); }).then(function (i) {
        if (Math.abs(i.dur - 2) > 0.2 || !i.audio) f.push('keep 1–3 s gave ' + JSON.stringify(i));
        return trim(v, { a: 1, b: 2, keep: false, exact: true });
      }).then(function (r) { return probe(new File([r.bytes], r.name)); }).then(function (i) { if (Math.abs(i.dur - 3) > 0.25) f.push('remove 1–2 s gave ' + i.dur); });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
