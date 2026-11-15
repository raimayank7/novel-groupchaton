/* Text to Speech — the browser's own voices (Web Speech API): voice, speed and pitch, pause and resume.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('tts', function (spot, T) {
  var h = T.h, status = T.status(), synth = window.speechSynthesis;
  if (!synth) { spot.appendChild(T.card([h('p', { 'class': 'tstatus is-error', text: 'This browser cannot read text aloud. Try Chrome, Edge or Safari.' })])); return; }
  var text = h('textarea', { rows: '8', placeholder: 'Type or paste the text to listen to…', 'aria-label': 'Text to read' });
  text.value = T.store.get('tts-text', '');
  text.addEventListener('input', function () { T.store.set('tts-text', text.value.slice(0, 20000)); });
  var voice = h('select', { 'aria-label': 'Voice' });
  var rate = h('input', { type: 'range', min: '0.5', max: '2', step: '0.1', value: T.store.get('tts-rate', '1') });
  var pitch = h('input', { type: 'range', min: '0.5', max: '1.5', step: '0.1', value: '1' });
  var fRate = T.field('Speed: ' + rate.value + '×', rate), fPitch = T.field('Pitch: 1.0', pitch);
  rate.addEventListener('input', function () { fRate.firstChild.textContent = 'Speed: ' + rate.value + '×'; T.store.set('tts-rate', rate.value); });
  pitch.addEventListener('input', function () { fPitch.firstChild.textContent = 'Pitch: ' + (+pitch.value).toFixed(1); });
  var play = T.button('▶ Read aloud', { primary: true, onclick: start });
  var pause = T.button('⏸ Pause', { onclick: function () { if (synth.paused) { synth.resume(); pause.textContent = '⏸ Pause'; } else { synth.pause(); pause.textContent = '▶ Resume'; } } });
  var stop = T.button('⏹ Stop', { onclick: function () { synth.cancel(); done(); } });
  pause.disabled = stop.disabled = true;
  spot.appendChild(T.card([T.field('Text', text), h('div', { 'class': 'tgrid2' }, [T.field('Voice', voice), fRate, fPitch]), T.row([play, pause, stop]), status.el]));

  function loadVoices() {
    var vs = synth.getVoices(), keep = T.store.get('tts-voice', '');
    if (!vs.length) return;
    voice.innerHTML = '';
    vs.slice().sort(function (a, b) { return (a.lang.indexOf('en') === 0 ? 0 : 1) - (b.lang.indexOf('en') === 0 ? 0 : 1) || a.lang.localeCompare(b.lang); })
      .forEach(function (v) { voice.appendChild(h('option', { value: v.name, selected: v.name === keep || (!keep && v.default) }, [v.name + ' (' + v.lang + ')'])); });
  }
  loadVoices();
  if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices); else synth.onvoiceschanged = loadVoices;
  voice.addEventListener('change', function () { T.store.set('tts-voice', voice.value); });

  // long text is spoken sentence by sentence: some browsers stop speaking after ~15 seconds of one utterance
  function chunks(s) {
    var parts = s.replace(/\s+/g, ' ').match(/[^.!?。！？\n]+[.!?。！？]*\s*/g) || [s], out = [], cur = '';
    parts.forEach(function (p) { if ((cur + p).length > 220 && cur) { out.push(cur); cur = p; } else cur += p; });
    if (cur.trim()) out.push(cur);
    return out;
  }
  function start() {
    var t = text.value.trim();
    if (!t) return status.error('Type or paste some text first.');
    synth.cancel();
    var list = chunks(t), v = synth.getVoices().filter(function (x) { return x.name === voice.value; })[0], i = 0;
    play.disabled = true; pause.disabled = stop.disabled = false; pause.textContent = '⏸ Pause';
    (function next() {
      if (i >= list.length) { done(); status.ok('Finished.'); return; }
      var u = new SpeechSynthesisUtterance(list[i++]);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = +rate.value; u.pitch = +pitch.value;
      u.onend = next;
      u.onerror = function (e) { if (e.error !== 'interrupted' && e.error !== 'canceled') status.error('Speech stopped: ' + e.error); done(); };
      status.progress(i / list.length, 'Reading… ' + i + ' / ' + list.length);
      synth.speak(u);
    })();
  }
  function done() { play.disabled = false; pause.disabled = stop.disabled = true; pause.textContent = '⏸ Pause'; }
});
