/* Infinity by GroupChatOn — video-frames. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Extract frames from a video as JPG or PNG: every few seconds, a set number spread evenly, or just the frame you paused on. Uses the browser's own video player. */
GCOTools.register('video-frames', function (spot, T) {
  var h = T.h, status = T.status(), results = (function (r) { var s = r.set; r.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; r.set = function (l, z) { s(l, z); var g = r.el.querySelector('.tresults-grid'); if (g) g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }; return r; })(T.results());
  function times(d, mode, val) {
    var out = [];
    if (!(d > 0)) return out;
    if (mode === 'every') { var step = Math.max(0.04, +val || 1); for (var t = 0; t < d - 0.001 && out.length < 500; t += step) out.push(Math.round(t * 1000) / 1000); }
    else { var n = Math.max(1, Math.min(500, Math.round(+val) || 1)); for (var i = 0; i < n; i++) out.push(Math.round((i + 0.5) * d / n * 1000) / 1000); }
    return out;
  }
  function stamp(t) { var m = Math.floor(t / 60), s = t - m * 60; return (m < 10 ? '0' : '') + m + '-' + (s < 10 ? '0' : '') + s.toFixed(2); }
  var video = h('video', { controls: true, playsinline: true, muted: true, preload: 'auto', style: 'width:100%;max-height:420px;border-radius:12px;background:#000', hidden: true }); video.muted = true;
  var name = 'video', dur = 0, busy = false;
  var mode = T.seg([['every', 'Every N seconds'], ['count', 'N frames in total']], 'every', function () { lab.firstChild.textContent = mode.value() === 'every' ? 'Seconds between frames' : 'How many frames'; val.value = mode.value() === 'every' ? '2' : '12'; info(); });
  var val = h('input', { type: 'number', min: '0.04', step: 'any', value: '2' }), lab = T.field('Seconds between frames', val), fmt = T.select([['image/jpeg', 'JPG (smaller)'], ['image/png', 'PNG (exact)']], 'image/jpeg');
  var maxW = T.select([['0', 'Original size'], ['1920', 'Up to 1920 px wide'], ['1280', 'Up to 1280 px wide'], ['640', 'Up to 640 px wide']], '0');
  var go = T.button('Extract frames', { primary: true, disabled: true, onclick: function () { run(times(dur, mode.value(), val.value)); } });
  var one = T.button('Save the frame on screen', { small: true, disabled: true, onclick: function () { run([video.currentTime], true); } });
  function info() { if (dur) status.info(name + ': ' + Math.floor(dur / 60) + ' min ' + Math.round(dur % 60) + ' s, ' + video.videoWidth + ' × ' + video.videoHeight + ' → ' + times(dur, mode.value(), val.value).length + ' frames'); }
  val.addEventListener('input', info);
  function wait(ev, ms) { return new Promise(function (ok, no) { var t = setTimeout(function () { video.removeEventListener(ev, f); no(new Error('timeout')); }, ms); function f() { clearTimeout(t); video.removeEventListener(ev, f); ok(); } video.addEventListener(ev, f); }); }
  function seek(t) { if (Math.abs(video.currentTime - t) < 0.001) return Promise.resolve(); var p = wait('seeked', 8000); video.currentTime = t; return p; }
  function open(file) {
    name = T.baseName(file.name); results.clear(); dur = 0; go.disabled = one.disabled = true;
    video.hidden = false; video.src = URL.createObjectURL(file); status.info('Opening ' + file.name + '…');
    wait('loadedmetadata', 15000).then(function () {
      if (isFinite(video.duration)) return;
      var p = wait('durationchange', 8000); video.currentTime = 1e7; return p.then(function () { video.currentTime = 0; });   // recordings from browsers often hide their length until the end is read
    }).then(function () { dur = isFinite(video.duration) ? video.duration : 0; if (!dur) throw new Error('length'); go.disabled = one.disabled = false; info(); })
      .catch(function () { status.error('This video could not be opened here. Browsers play MP4 (H.264), WebM and most phone videos; try converting it to MP4 first.'); });
  }
  function run(list, single) {
    if (busy || !list.length) return; busy = true; go.disabled = one.disabled = true; video.pause();
    var out = [], i = 0, type = fmt.value, ext = type === 'image/png' ? 'png' : 'jpg', back = video.currentTime;
    var w = video.videoWidth, hh = video.videoHeight, mw = +maxW.value; if (mw && w > mw) { hh = Math.round(hh * mw / w); w = mw; }
    var c = h('canvas'); c.width = w; c.height = hh; var g = c.getContext('2d');
    (function next() {
      if (i >= list.length) { busy = false; go.disabled = one.disabled = false; if (!single) video.currentTime = back; results.set(out, name + '-frames'); status.ok(out.length + ' frame' + (out.length > 1 ? 's' : '') + ' ready.' + (out.length > 1 ? ' Download them one by one or all as a ZIP.' : '')); return; }
      var t = list[i++]; status.progress(i / list.length, 'Frame ' + i + ' of ' + list.length + '…');
      (single ? Promise.resolve() : seek(t)).then(function () {
        g.drawImage(video, 0, 0, w, hh);
        return T.canvasBlob(c, type, 0.92).then(function (b) { out.push({ name: name + '-' + stamp(t) + '.' + ext, blob: b, preview: URL.createObjectURL(b), note: w + ' × ' + hh + ' · at ' + stamp(t).replace('-', ':') }); next(); });
      }).catch(function () { busy = false; go.disabled = one.disabled = false; status.error('The video stopped responding at ' + stamp(t).replace('-', ':') + '. Try fewer frames or another browser.'); });
    })();
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'video/*,.mp4,.webm,.mov,.mkv', icon: '🎞️', label: 'Choose a video', hint: 'MP4, WebM, MOV · nothing is uploaded', onFiles: function (f) { open(f[0]); } }),
    video, T.field('Take', mode), h('div', { 'class': 'tgrid2' }, [lab, T.field('Save as', fmt), T.field('Size', maxW)]), T.row([go, one]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['video-frames'] = function () {
    var f = [];
    if (times(10, 'every', 2).join(',') !== '0,2,4,6,8') f.push('every 2 s ' + times(10, 'every', 2));
    if (times(10, 'count', 4).join(',') !== '1.25,3.75,6.25,8.75') f.push('4 evenly');
    if (times(0, 'every', 1).length || times(10000, 'every', 1).length !== 500) f.push('limits');
    if (stamp(75.5) !== '01-15.50' || stamp(3) !== '00-03.00') f.push('stamp ' + stamp(75.5));
    var c = h('canvas'); c.width = 64; c.height = 36; var cs = c.captureStream ? c.captureStream(10) : null;
    if (!cs) return Promise.resolve({ ok: !f.length, n: 4, fails: f });
    video.srcObject = cs; var g = c.getContext('2d'); g.fillStyle = '#00ff00'; g.fillRect(0, 0, 64, 36);
    var tick = setInterval(function () { g.fillRect(0, 0, 64, 36); }, 50);
    return video.play().then(function () { return new Promise(function (ok) { setTimeout(ok, 400); }); }).then(function () {
      var o = h('canvas'); o.width = 64; o.height = 36; var og = o.getContext('2d'); og.drawImage(video, 0, 0, 64, 36); var p = og.getImageData(32, 18, 1, 1).data;
      if (p[1] < 200 || p[0] > 60) f.push('frame grab colour ' + p[0] + ',' + p[1]);
    }).catch(function () {}).then(function () { clearInterval(tick); video.pause(); video.srcObject = null; video.hidden = true; return { ok: !f.length, n: 5, fails: f }; });
  };
});
