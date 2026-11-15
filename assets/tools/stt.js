/* Speech to Text — dictation with the browser's speech recognition (Chrome, Edge, Safari).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('stt', function (spot, T) {
  var h = T.h, status = T.status();
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { spot.appendChild(T.card([h('p', { 'class': 'tstatus is-error', text: 'Speech typing is not available in this browser. Please use Google Chrome, Microsoft Edge or Safari.' })])); return; }
  var lang = T.select([['en-IN', 'English (India)'], ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['hi-IN', 'Hindi'], ['pa-IN', 'Punjabi'], ['ur-IN', 'Urdu'],
    ['bn-IN', 'Bengali'], ['ta-IN', 'Tamil'], ['te-IN', 'Telugu'], ['mr-IN', 'Marathi'], ['gu-IN', 'Gujarati'], ['ko-KR', 'Korean'], ['es-ES', 'Spanish'], ['fr-FR', 'French'], ['de-DE', 'German'], ['ar-SA', 'Arabic']],
    T.store.get('stt-lang', 'en-IN'));
  var out = h('textarea', { 'class': 'tout', 'aria-label': 'Your words', placeholder: 'Press Start and speak. Your words appear here, and you can edit them.' });
  var live = h('p', { 'class': 'tstatus', 'aria-live': 'polite' });
  var rec = null, on = false;
  var btn = T.button('🎙 Start speaking', { primary: true, onclick: toggle });
  var copy = T.button('Copy', { onclick: function () { T.copy(out.value, copy); } });
  var save = T.button('Download .txt', { onclick: function () { T.download(new Blob([out.value], { type: 'text/plain;charset=utf-8' }), 'speech.txt'); } });
  var clear = T.button('Clear', { onclick: function () { out.value = ''; } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Language you speak', lang)]), T.row([btn]), live, out, T.row([copy, save, clear]), status.el]));

  function toggle() { on ? stopRec() : startRec(); }
  function startRec() {
    T.store.set('stt-lang', lang.value);
    rec = new SR(); rec.lang = lang.value; rec.continuous = true; rec.interimResults = true;
    rec.onresult = function (e) {
      var interim = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) out.value += (out.value && !/\s$/.test(out.value) ? ' ' : '') + t.trim();
        else interim += t;
      }
      live.textContent = interim ? '… ' + interim : 'Listening…';
    };
    rec.onerror = function (e) {
      var m = { 'not-allowed': 'Microphone permission was blocked. Allow it in the address bar and try again.', 'no-speech': 'No speech heard. Try again closer to the microphone.', network: 'Speech typing needs an internet connection.' }[e.error];
      status.error(m || 'Stopped: ' + e.error);
    };
    rec.onend = function () { if (on) { try { rec.start(); } catch (x) { stopRec(); } } };   // keep listening through pauses
    try { rec.start(); on = true; btn.textContent = '⏹ Stop'; live.textContent = 'Listening…'; status.clear(); } catch (e) { status.error(e); }
  }
  function stopRec() { on = false; if (rec) rec.stop(); btn.textContent = '🎙 Start speaking'; live.textContent = ''; }
});
