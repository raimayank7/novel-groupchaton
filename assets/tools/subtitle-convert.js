/* Infinity by GroupChatOn — subtitle-convert. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Subtitle converter: SRT ↔ WebVTT, plain text, shift all times earlier or later, and fix frame-rate drift (23.976 ↔ 25 fps). */
GCOTools.register('subtitle-convert', function (spot, T) {
  var h = T.h;
  function ms(s) { var p = String(s).replace(',', '.').split(':'), sec = parseFloat(p.pop()) || 0, m = +p.pop() || 0, hr = +p.pop() || 0; return Math.round((hr * 3600 + m * 60 + sec) * 1000); }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
  function stamp(t, sep) { t = Math.max(0, Math.round(t)); return pad(Math.floor(t / 3600000), 2) + ':' + pad(Math.floor(t / 60000) % 60, 2) + ':' + pad(Math.floor(t / 1000) % 60, 2) + sep + pad(t % 1000, 3); }
  var TIME = /((?:\d+:)?\d{1,2}:\d{1,2}(?:[,.]\d{1,3})?)\s*-->\s*((?:\d+:)?\d{1,2}:\d{1,2}(?:[,.]\d{1,3})?)/;
  function parse(text) {
    var out = [];
    String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n/).forEach(function (b) {
      var lines = b.split('\n'), i = -1;
      for (var k = 0; k < lines.length; k++) if (TIME.test(lines[k])) { i = k; break; }
      if (i < 0) return;
      var m = lines[i].match(TIME), t = lines.slice(i + 1).join('\n').trim();
      if (t) out.push({ s: ms(m[1]), e: ms(m[2]), t: t });
    });
    return out;
  }
  function clean(t) { return t.replace(/<v(?:\.[^ >]*)?\s+([^>]+)>/g, '$1: ').replace(/<\/?(?:c|v|lang|ruby|rt)(?:\.[^>]*)?(?:\s[^>]*)?>/g, '').replace(/<\d{2}:[\d:.]+>/g, ''); }
  function convert(text, o) {
    var cues = parse(text), f = 1;
    if (!cues.length) throw new Error('No subtitles found. Paste the contents of an .srt or .vtt file (times look like 00:00:01,000 --> 00:00:03,500).');
    if (o.fps && o.fps !== '1') { var a = o.fps.split('/'); f = +a[0] / +a[1]; }
    var sh = Math.round((parseFloat(String(o.shift || '0').replace(',', '.')) || 0) * 1000);
    cues = cues.map(function (c) { return { s: Math.max(0, Math.round(c.s * f) + sh), e: Math.max(0, Math.round(c.e * f) + sh), t: c.t }; }).filter(function (c) { return c.e > 0; });
    if (o.to === 'txt') return cues.map(function (c) { return clean(c.t).replace(/<[^>]+>/g, ''); }).join('\n');
    if (o.to === 'srt') return cues.map(function (c, i) { return (i + 1) + '\n' + stamp(c.s, ',') + ' --> ' + stamp(c.e, ',') + '\n' + clean(c.t); }).join('\n\n') + '\n';
    return 'WEBVTT\n\n' + cues.map(function (c) { return stamp(c.s, '.') + ' --> ' + stamp(c.e, '.') + '\n' + c.t; }).join('\n\n') + '\n';
  }
  var SAMPLE = '1\n00:00:01,000 --> 00:00:03,500\nHello! Welcome to the video.\n\n2\n00:00:04,000 --> 00:00:06,250\n<i>Subtitles make videos easier to follow.</i>\n\n3\n00:00:07,000 --> 00:00:09,000\nThanks for watching.';
  var to = T.opt.select('to', 'Convert to', [['vtt', 'WebVTT (.vtt) for websites'], ['srt', 'SubRip (.srt) for players'], ['txt', 'Plain text (no times)']], 'vtt');
  var tr = T.transformer(spot, { id: 'subtitle-convert', run: convert, sample: SAMPLE, mono: true, inLabel: 'Subtitles (.srt or .vtt contents)', outLabel: 'Converted subtitles', download: false,
    placeholder: 'Paste your subtitles, or drop a .srt / .vtt file below', options: [to, T.opt.text('shift', 'Shift times (seconds, e.g. 2.5 or -1.2)', '0'),
      T.opt.select('fps', 'Frame-rate fix', [['1', 'No change'], ['23.976/25', '23.976 → 25 fps (subtitles run late)'], ['25/23.976', '25 → 23.976 fps (subtitles run early)'], ['24/25', '24 → 25 fps'], ['25/24', '25 → 24 fps'], ['23.976/24', '23.976 → 24 fps'], ['24/23.976', '24 → 23.976 fps']], '1')],
    note: function (i, o) { var c = parse(i); return c.length + ' subtitles · from ' + stamp(c[0].s, '.').slice(0, 8) + ' to ' + stamp(c[c.length - 1].e, '.').slice(0, 8); } });
  var card = spot.lastChild;
  card.style.gridTemplateColumns = 'minmax(0, 1fr)';
  card.appendChild(T.dropzone({ accept: '.srt,.vtt,.txt,text/vtt', icon: '💬', label: 'Or open a subtitle file', hint: '.srt or .vtt · nothing is uploaded', onFiles: function (f) { T.read(f[0], 'text').then(function (t) { tr.input.value = t; tr.update(); }); } }));
  card.appendChild(T.row([T.button('Download file', { primary: true, onclick: function () {
    var k = to.querySelector('select').value; if (!tr.output.value) return;
    T.download(new Blob([tr.output.value], { type: (k === 'vtt' ? 'text/vtt' : 'text/plain') + ';charset=utf-8' }), 'subtitles.' + k);
  } })]));
  T.tests['subtitle-convert'] = function () {
    var f = [], v = convert('1\n00:00:01,000 --> 00:00:02,500\nHi', { to: 'vtt' });
    if (v !== 'WEBVTT\n\n00:00:01.000 --> 00:00:02.500\nHi\n') f.push('srt→vtt ' + JSON.stringify(v));
    var s = convert('WEBVTT\n\n00:01.500 --> 00:03.000 align:start\n<v Bob>Hello <c.loud>there</c>\n\nNOTE x\n\n01:00:00.000 --> 01:00:01.000\nBye', { to: 'srt' });
    if (s !== '1\n00:00:01,500 --> 00:00:03,000\nBob: Hello there\n\n2\n01:00:00,000 --> 01:00:01,000\nBye\n') f.push('vtt→srt ' + JSON.stringify(s));
    if (convert('00:00:01,000 --> 00:00:02,000\nA', { to: 'srt', shift: '-1.5' }).indexOf('00:00:00,000 --> 00:00:00,500') < 0) f.push('shift + clamp');
    if (convert('00:00:25,000 --> 00:00:26,000\nA', { to: 'srt', fps: '25/24' }).indexOf('00:00:26,042') < 0) f.push('fps');
    if (convert(SAMPLE, { to: 'txt' }) !== 'Hello! Welcome to the video.\nSubtitles make videos easier to follow.\nThanks for watching.') f.push('plain text');
    try { convert('nothing here', { to: 'srt' }); f.push('accepted junk'); } catch (e) {}
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
