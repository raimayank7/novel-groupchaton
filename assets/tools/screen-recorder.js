/* Infinity by GroupChatOn — screen-recorder. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Screen recorder: record your whole screen, a window or a tab, with tab / system sound and your microphone mixed in. Runs in the browser, nothing uploaded. */
GCOTools.register('screen-recorder', function (spot, T) {
  var h = T.h, status = T.status();
  function pickMime(ok, list) { for (var i = 0; i < list.length; i++) if (ok(list[i])) return list[i]; return ''; }
  function ext(m) { return /mp4/.test(m) ? 'mp4' : 'webm'; }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function clock(s) { s = Math.max(0, Math.floor(s)); return (s >= 3600 ? Math.floor(s / 3600) + ':' + p2(Math.floor(s / 60) % 60) : Math.floor(s / 60)) + ':' + p2(s % 60); }
  function stamp(d) { return d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '-' + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds()); }
  var MIMES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4;codecs=avc1,mp4a', 'video/mp4'];
  var sys = h('input', { type: 'checkbox', checked: true }), mic = h('input', { type: 'checkbox' }), cd = h('input', { type: 'checkbox', checked: true });
  var big = h('div', { 'data-out': '', style: 'font:800 clamp(40px,12vw,64px)/1.1 var(--ui);text-align:center;font-variant-numeric:tabular-nums', text: '0:00' });
  var startB = T.button('● Start screen recording', { primary: true, onclick: start }), stopB = T.button('■ Stop', { disabled: true, onclick: stop });
  var out = h('div', { style: 'display:grid;gap:10px' }), streams = [], rec = null, chunks = [], t0 = 0, timer = 0, ac = null, last = null;
  var can = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && window.MediaRecorder);
  function stopAll() { streams.forEach(function (s) { s.getTracks().forEach(function (t) { t.stop(); }); }); streams = []; if (ac) { ac.close(); ac = null; } clearInterval(timer); }
  function start() {
    if (!can) return status.error('This browser cannot record the screen. It works in Chrome, Edge, Firefox and Safari on a computer. Phones and tablets do not let websites record the screen: use the screen recorder built into your phone instead.');
    startB.disabled = true; status.info('Choose what to share: the whole screen, a window or a browser tab' + (sys.checked ? ' (tick “Share audio” for sound)' : '') + '.');
    navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: sys.checked }).then(function (screen) {
      streams.push(screen);
      return (mic.checked ? navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (m) { streams.push(m); return m; }, function () { status.info('Microphone not available: recording without it.'); return null; }) : Promise.resolve(null)).then(function (m) {
        var tracks = screen.getVideoTracks().slice(), audios = streams.filter(function (s) { return s.getAudioTracks().length; });
        if (audios.length > 1) {   // mix screen sound and microphone into one track
          ac = new (window.AudioContext || window.webkitAudioContext)(); var dest = ac.createMediaStreamDestination();
          audios.forEach(function (s) { ac.createMediaStreamSource(s).connect(dest); }); tracks = tracks.concat(dest.stream.getAudioTracks());
        } else if (audios.length) tracks = tracks.concat(audios[0].getAudioTracks());
        screen.getVideoTracks()[0].addEventListener('ended', stop);   // the browser's own "Stop sharing" button
        var wait = cd.checked ? 3 : 0;
        (function count() {
          if (wait > 0) { big.textContent = String(wait); status.info('Starting in ' + wait + '…'); wait--; return setTimeout(count, 1000); }
          var mime = pickMime(function (x) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x); }, MIMES);
          chunks = []; rec = new MediaRecorder(new MediaStream(tracks), mime ? { mimeType: mime } : undefined);
          rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
          rec.onstop = done; rec.start(1000); t0 = Date.now(); stopB.disabled = false;
          timer = setInterval(function () { big.textContent = clock((Date.now() - t0) / 1000); }, 250);
          status.info('🔴 Recording' + (tracks.length > 1 ? ' with sound' : ' (no sound)') + '. Press Stop here or “Stop sharing” in the browser bar when you are done.');
        })();
      });
    }).catch(function (e) { stopAll(); startB.disabled = false; status.error(e && e.name === 'NotAllowedError' ? 'Screen sharing was cancelled or blocked. Press Start and choose a screen, window or tab.' : (e && e.message) || 'Screen recording could not start.'); });
  }
  function stop() { if (rec && rec.state !== 'inactive') rec.stop(); else { stopAll(); startB.disabled = false; stopB.disabled = true; } }
  function done() {
    var secs = (Date.now() - t0) / 1000; stopAll(); startB.disabled = false; stopB.disabled = true;
    var type = (rec && rec.mimeType) || 'video/webm', blob = new Blob(chunks, { type: type.split(';')[0] }), name = 'screen-recording-' + stamp(new Date()) + '.' + ext(type);
    if (last) URL.revokeObjectURL(last); last = URL.createObjectURL(blob); rec = null;
    out.innerHTML = '';
    out.appendChild(h('video', { src: last, controls: true, playsinline: true, style: 'width:100%;max-height:420px;border-radius:12px;background:#000' }));
    out.appendChild(T.row([T.button('Download ' + ext(type).toUpperCase() + ' (' + T.bytes(blob.size) + ')', { primary: true, onclick: function () { T.download(blob, name); } })]));
    status.ok('Done: ' + clock(secs) + ' recorded. Preview it below and download. WebM plays in Chrome, Firefox and VLC; to get MP4, use a video converter.');
  }
  spot.appendChild(T.card([big, T.row([startB, stopB]), status.el,
    T.row([h('label', { 'class': 'tcheck' }, [sys, ' Screen / tab sound']), h('label', { 'class': 'tcheck' }, [mic, ' My microphone']), h('label', { 'class': 'tcheck' }, [cd, ' 3-second countdown'])]),
    out, h('p', { 'class': 'tnote', text: can ? 'The recording is made and kept inside this browser; nothing is uploaded. Long recordings use memory, so download and close the page after very long sessions.' : 'Screen recording is not available in this browser. On a computer, use Chrome, Edge, Firefox or Safari. On phones, use the built-in screen recorder.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['screen-recorder'] = function () {
    var f = [];
    if (pickMime(function (m) { return /^video\/webm/.test(m); }, MIMES) !== 'video/webm;codecs=vp9,opus') f.push('mime');
    if (ext('video/mp4;codecs=avc1') !== 'mp4' || ext('video/webm') !== 'webm') f.push('ext');
    if (clock(3725) !== '1:02:05' || clock(65) !== '1:05') f.push('clock');
    if (stamp(new Date(2026, 0, 2, 3, 4, 5)) !== '20260102-030405') f.push('stamp');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
