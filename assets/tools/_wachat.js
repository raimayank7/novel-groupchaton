/* WhatsApp chat engine: reads an exported chat (.txt, or the .zip "with media") from Android or iPhone, all on the device.
   Kinds: viewer (chat bubbles with photos, search), stats (who texts most, busiest hours, emoji, words), pdf (print or save as PDF / HTML).
   GCOTools.engine('wachat', 'wa-chat-viewer', { kind: 'viewer' })
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var T = window.GCOTools, h = T.h;
  var LINE = /^‎?\[?(\d{1,4})[\/.\-](\d{1,2})[\/.\-](\d{2,4}),?\s+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?[\s  ]*([apAP]\.?\s?[mM]\.?)?\]?\s*(?:[-–]\s)?\s*([\s\S]*)$/;
  var ATTACH = /<attached:\s*([^>]+)>|^‎?(\S+\.(?:jpe?g|png|webp|gif|mp4|3gp|mov|opus|ogg|m4a|mp3|pdf|docx?|xlsx?|vcf|webm))\s*\(file attached\)|^<Media omitted>$|^(image|video|audio|sticker|GIF|document) omitted$/i;
  // text → { msgs: [{ d: Date, who, text, media, sys }], people: [] }
  function parse(text, order) {
    var lines = text.replace(/\r\n?/g, '\n').split('\n'), raw = [], dmy = order;
    lines.forEach(function (l) {
      var m = l.match(LINE);
      if (m && +m[2] <= 31 && +m[4] < 25) raw.push({ m: m });
      else if (raw.length) raw[raw.length - 1].more = (raw[raw.length - 1].more || '') + '\n' + l;
    });
    if (!dmy) {   // is it day/month or month/day? look for a part above 12
      dmy = 'dmy';
      for (var i = 0; i < raw.length; i++) { if (+raw[i].m[1] > 12 && +raw[i].m[1] < 32) { dmy = 'dmy'; break; } if (+raw[i].m[2] > 12) { dmy = 'mdy'; break; } }
      if (raw.length && raw[0].m[1].length === 4) dmy = 'ymd';
    }
    var people = [], msgs = raw.map(function (r) {
      var m = r.m, a = +m[1], b = +m[2], c = +m[3], y, mo, d;
      if (dmy === 'ymd') { y = a; mo = b; d = c; } else if (dmy === 'mdy') { mo = a; d = b; y = c; } else { d = a; mo = b; y = c; }
      if (y < 100) y += 2000;
      var hr = +m[4], ap = (m[7] || '').toLowerCase();
      if (ap.charAt(0) === 'p' && hr < 12) hr += 12; if (ap.charAt(0) === 'a' && hr === 12) hr = 0;
      var date = new Date(y, mo - 1, d, hr, +m[5], +(m[6] || 0)), body = m[8] + (r.more || '');
      var who = body.match(/^([^:\n]{1,60}?):\s([\s\S]*)$/), out = { d: date };
      if (!who) { out.sys = true; out.text = body.replace(/^‎/, ''); return out; }
      out.who = who[1].replace(/^‎/, '').trim(); out.text = who[2].replace(/‎/g, '');
      var at = out.text.trim().match(ATTACH);
      if (at) out.media = at[1] || at[2] || at[3] || 'media';
      if (people.indexOf(out.who) < 0) people.push(out.who);
      return out;
    }).filter(function (x) { return !isNaN(x.d); });
    return { msgs: msgs, people: people, order: dmy };
  }
  T.waParse = parse;
  var EMOJI = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*/gu;
  var STOP = 'the and you that have for not with this but are was what your just will can all its get out how when from they there then them she his her him our about would could should been were also okay haan nahi kya hai hain bhi toh aur main mein tum aap koi kuch nhi media omitted message deleted'.split(' ');
  function stats(data) {
    var by = {}, hours = new Array(24).fill(0), days = new Array(7).fill(0), emo = {}, words = {}, perDay = {};
    data.msgs.forEach(function (m) {
      if (m.sys) return;
      var p = by[m.who] = by[m.who] || { n: 0, words: 0, media: 0, emoji: 0 };
      p.n++; hours[m.d.getHours()]++; days[m.d.getDay()]++;
      var key = m.d.getFullYear() + '-' + (m.d.getMonth() + 1) + '-' + m.d.getDate(); perDay[key] = (perDay[key] || 0) + 1;
      if (m.media) { p.media++; return; }
      var w = m.text.split(/\s+/).filter(Boolean); p.words += w.length;
      (m.text.match(EMOJI) || []).forEach(function (e) { emo[e] = (emo[e] || 0) + 1; p.emoji++; });
      w.forEach(function (x) { x = x.toLowerCase().replace(/[^\p{L}\p{N}']/gu, ''); if (x.length > 3 && STOP.indexOf(x) < 0 && !/^https?/.test(x)) words[x] = (words[x] || 0) + 1; });
    });
    var top = function (o, n) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, n).map(function (k) { return [k, o[k]]; }); };
    var busiest = top(perDay, 1)[0];
    return { by: by, hours: hours, days: days, emoji: top(emo, 12), words: top(words, 20), busiest: busiest, activeDays: Object.keys(perDay).length };
  }
  T.waStats = stats;

  function loader(onData, status) {
    return T.dropzone({ accept: '.txt,.zip,text/plain,application/zip', label: 'Open your exported chat (.txt or .zip)', icon: '💬',
      hint: 'In WhatsApp: open the chat → ⋮ / contact name → More → Export chat. Nothing is uploaded.',
      onFiles: function (files) {
        var f = files[0];
        status.info('Reading ' + f.name + '…');
        if (/\.zip$/i.test(f.name) || f.type === 'application/zip') {
          T.lib('jszip').then(function (JSZip) { return JSZip.loadAsync(f); }).then(function (zip) {
            var names = Object.keys(zip.files), txt = names.filter(function (n) { return /\.txt$/i.test(n); })[0];
            if (!txt) throw new Error('No chat text (.txt) inside this ZIP.');
            var media = {};
            return Promise.all(names.filter(function (n) { return n !== txt && !zip.files[n].dir; }).map(function (n) {
              return zip.files[n].async('blob').then(function (b) { media[n.split('/').pop()] = b; });
            })).then(function () { return zip.files[txt].async('string'); }).then(function (t) { onData(t, media, f.name); });
          }).catch(function (e) { status.error(e); });
        } else T.read(f, 'text').then(function (t) { onData(t, {}, f.name); }).catch(function (e) { status.error(e); });
      } });
  }
  var COLORS = ['#22D3EE', '#F472B6', '#FBBF24', '#4ADE80', '#A78BFA', '#FB923C', '#60A5FA', '#F87171'];
  function fmtDate(d) { return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }); }
  function fmtTime(d) { return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }
  var SAMPLE = '12/03/2024, 09:15 - Messages and calls are end-to-end encrypted. No one outside of this chat can read them.\n12/03/2024, 09:15 - Rahul: Hello 😀\n' +
    '12/03/2024, 09:16 - Priya: Hi Rahul!\nHow are you?\n13/03/2024, 21:05 - Rahul: IMG-20240313-WA0001.jpg (file attached)\n13/03/2024, 21:06 - Priya: 👍👍 see you tomorrow';

  T.engines.wachat = function (spot, T, def, id) {
    var status = T.status(), body = h('div', { 'class': 'twa-body' }), data = null, media = {}, urls = [], me = '';
    var pick = h('select', { 'aria-label': 'Which one is you' }), q = h('input', { type: 'search', placeholder: 'Search the chat…', 'aria-label': 'Search' });
    var opts = h('div', { 'class': 'tgrid2', hidden: true }, [T.field('Which one is you?', pick, 'your messages appear on the right'), def.kind === 'viewer' ? T.field('Search', q) : h('span')]);
    function load(text, files, name) {
      urls.forEach(URL.revokeObjectURL); urls = []; media = files || {};
      data = parse(text);
      if (!data.msgs.length) { status.error('This does not look like a WhatsApp chat export. Open the .txt (or .zip) file WhatsApp made.'); return; }
      status.ok(data.msgs.filter(function (m) { return !m.sys; }).length.toLocaleString() + ' messages from ' + data.people.length + ' people' + (Object.keys(media).length ? ', ' + Object.keys(media).length + ' media files' : '') + '.');
      pick.innerHTML = ''; data.people.forEach(function (p) { pick.appendChild(h('option', { value: p, text: p })); });
      me = data.people[0] || ''; pick.value = me; opts.hidden = false;
      draw();
    }
    function src(name) { var b = media[name]; if (!b) return null; var u = URL.createObjectURL(b); urls.push(u); return u; }
    function bubble(m, color) {
      if (m.sys) return h('div', { 'class': 'twa-sys', text: m.text });
      var kids = [m.who !== me ? h('b', { style: 'color:' + color, text: m.who }) : null];
      if (m.media) {
        var u = src(m.media);
        if (u && /\.(jpe?g|png|webp|gif)$/i.test(m.media)) kids.push(h('img', { src: u, alt: m.media, loading: 'lazy' }));
        else if (u && /\.(mp4|webm|mov|3gp)$/i.test(m.media)) kids.push(h('video', { src: u, controls: true, preload: 'none' }));
        else if (u && /\.(opus|ogg|m4a|mp3)$/i.test(m.media)) kids.push(h('audio', { src: u, controls: true, preload: 'none' }));
        else kids.push(h('span', { 'class': 'twa-media', text: '📎 ' + (m.media === 'media' ? 'Media not included in export' : m.media) }));
      } else kids.push(h('span', { 'class': 'twa-text', text: m.text }));
      kids.push(h('small', { text: fmtTime(m.d) }));
      return h('div', { 'class': 'twa-msg' + (m.who === me ? ' is-me' : '') }, kids);
    }
    var shown = 0, list = null, colorOf = {};
    function draw() {
      body.innerHTML = '';
      if (!data) return;
      data.people.forEach(function (p, i) { colorOf[p] = COLORS[i % COLORS.length]; });
      if (def.kind === 'viewer') viewer(); else if (def.kind === 'stats') statsView(); else pdfView();
    }
    function filtered() { var s = q.value.trim().toLowerCase(); return s ? data.msgs.filter(function (m) { return !m.sys && (m.text.toLowerCase().indexOf(s) >= 0 || (m.who || '').toLowerCase().indexOf(s) >= 0); }) : data.msgs; }
    // long chats are drawn 400 messages at a time as you scroll, so the page stays fast
    function viewer() {
      list = h('div', { 'class': 'twa-chat' }); shown = 0;
      var all = filtered(), more = h('button', { type: 'button', 'class': 'tbtn tbtn-sm twa-more', text: 'Show more' });
      body.appendChild(h('p', { 'class': 'thub-count', text: all.length.toLocaleString() + (q.value.trim() ? ' matches' : ' lines') }));
      body.appendChild(list); body.appendChild(more);
      var lastDay = '';
      function chunk() {
        var frag = document.createDocumentFragment();
        all.slice(shown, shown + 400).forEach(function (m) {
          var day = m.d.toDateString();
          if (day !== lastDay) { frag.appendChild(h('div', { 'class': 'twa-day', text: fmtDate(m.d) })); lastDay = day; }
          frag.appendChild(bubble(m, colorOf[m.who]));
        });
        list.appendChild(frag); shown += 400; more.hidden = shown >= all.length;
      }
      more.onclick = chunk; chunk();
      if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting && shown < all.length) chunk(); }, { rootMargin: '600px' }).observe(more);
    }
    function statsView() {
      var s = stats(data), people = Object.keys(s.by).sort(function (a, b) { return s.by[b].n - s.by[a].n; }), total = people.reduce(function (a, p) { return a + s.by[p].n; }, 0);
      var first = data.msgs[0].d, last = data.msgs[data.msgs.length - 1].d;
      body.appendChild(h('div', { 'class': 'tstats' }, [[total.toLocaleString(), 'messages'], [people.length, 'people'], [s.activeDays, 'days with messages'],
        [Math.max(1, Math.round((last - first) / 864e5)).toLocaleString(), 'days from first to last'], [s.busiest ? s.busiest[1] + ' msgs' : '—', 'busiest day: ' + (s.busiest ? s.busiest[0] : '')]]
        .map(function (x) { return h('div', { 'class': 'tstat' }, [h('b', { text: String(x[0]) }), h('span', { text: x[1] })]); })));
      body.appendChild(h('h3', { text: 'Who texts most' }));
      body.appendChild(h('div', { 'class': 'twa-bars' }, people.slice(0, 15).map(function (p) {
        var r = s.by[p];
        return h('div', { 'class': 'twa-bar' }, [h('span', { text: p }), h('i', { style: 'width:' + (100 * r.n / s.by[people[0]].n) + '%;background:' + colorOf[p] }),
          h('small', { text: r.n.toLocaleString() + ' msgs · ' + r.words.toLocaleString() + ' words · ' + r.media + ' media · ' + Math.round(100 * r.n / total) + '%' })]);
      })));
      var maxH = Math.max.apply(null, s.hours) || 1;
      body.appendChild(h('h3', { text: 'Busiest hours' }));
      body.appendChild(h('div', { 'class': 'twa-hours' }, s.hours.map(function (n, i) { return h('i', { style: 'height:' + (4 + 96 * n / maxH) + '%', title: i + ':00 – ' + n + ' messages' }, [h('small', { text: i % 3 === 0 ? String(i) : '' })]); })));
      var DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], maxD = Math.max.apply(null, s.days) || 1;
      body.appendChild(h('h3', { text: 'Days of the week' }));
      body.appendChild(h('div', { 'class': 'twa-bars' }, s.days.map(function (n, i) { return h('div', { 'class': 'twa-bar' }, [h('span', { text: DN[i] }), h('i', { style: 'width:' + (100 * n / maxD) + '%' }), h('small', { text: n.toLocaleString() })]); })));
      if (s.emoji.length) { body.appendChild(h('h3', { text: 'Top emoji' })); body.appendChild(h('p', { 'class': 'twa-emoji' }, s.emoji.map(function (e) { return h('span', {}, [e[0], h('small', { text: '×' + e[1] })]); }))); }
      if (s.words.length) { body.appendChild(h('h3', { text: 'Most used words' })); body.appendChild(h('p', { 'class': 'twa-words' }, s.words.map(function (w) { return h('span', { text: w[0] + ' ' + w[1] }); }))); }
      body.lastStats = s;
    }
    function pdfView() {
      var inc = h('input', { type: 'checkbox', checked: true }), dates = h('input', { type: 'checkbox', checked: true });
      body.appendChild(h('div', {}, [h('label', { 'class': 'tcheck' }, [inc, ' Include photos from the ZIP']), h('label', { 'class': 'tcheck' }, [dates, ' Show a date line for each day'])]));
      function doc() {
        var parts = [], lastDay = '';
        data.msgs.forEach(function (m) {
          var day = m.d.toDateString();
          if (dates.checked && day !== lastDay) { parts.push('<div class="day">' + esc(fmtDate(m.d)) + '</div>'); lastDay = day; }
          if (m.sys) { parts.push('<div class="sys">' + esc(m.text) + '</div>'); return; }
          var inner = m.media ? (inc.checked && media[m.media] && /\.(jpe?g|png|webp|gif)$/i.test(m.media) ? '<img src="' + src(m.media) + '">' : '<i>📎 ' + esc(m.media) + '</i>') : esc(m.text).replace(/\n/g, '<br>');
          parts.push('<div class="m' + (m.who === me ? ' me' : '') + '"><b style="color:' + colorOf[m.who] + '">' + esc(m.who) + '</b>' + inner + '<small>' + esc(fmtTime(m.d)) + '</small></div>');
        });
        return '<!doctype html><html><head><meta charset="utf-8"><title>WhatsApp chat</title><style>body{font:14px/1.45 system-ui,"Segoe UI",sans-serif;background:#efeae2;margin:0;padding:20px}' +
          '.m{max-width:75%;margin:4px 0;padding:6px 10px 4px;border-radius:10px;background:#fff;box-shadow:0 1px 1px rgba(0,0,0,.1);break-inside:avoid;white-space:pre-wrap;word-wrap:break-word}.m.me{margin-left:auto;background:#d9fdd3}' +
          '.m b{display:block;font-size:12.5px}.m.me b{display:none}.m small{display:block;text-align:right;color:#667781;font-size:11px}.m img{max-width:100%;max-height:360px;border-radius:6px;display:block}' +
          '.day,.sys{text-align:center;margin:12px auto;color:#54656f;font-size:12.5px}.day span,.day{background:#fff;display:table;padding:4px 10px;border-radius:8px}@media print{body{background:#fff}.m{box-shadow:none;border:1px solid #ddd}}</style></head><body>' +
          '<h2 style="font-size:16px">' + esc(data.people.join(', ')) + '</h2>' + parts.join('') + '</body></html>';
      }
      body.lastDoc = doc;
      body.appendChild(T.row([T.button('Print or save as PDF', { primary: true, onclick: function () {
        var f = h('iframe', { style: 'position:fixed;right:0;bottom:0;width:0;height:0;border:0', title: 'Print' }); document.body.appendChild(f);
        f.contentDocument.open(); f.contentDocument.write(doc()); f.contentDocument.close();
        setTimeout(function () { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(function () { f.remove(); }, 60000); }, 600);
      } }), T.button('Download as HTML', { onclick: function () { T.download(new Blob([doc()], { type: 'text/html' }), 'whatsapp-chat.html'); } })]));
      body.appendChild(h('p', { 'class': 'tnote', text: 'In the print window choose “Save as PDF” as the printer. Photos are included only when you open the .zip export “with media”.' }));
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    pick.addEventListener('change', function () { me = pick.value; draw(); });
    var timer = 0; q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(draw, 250); });
    spot.appendChild(T.card([loader(load, status), T.row([T.button('Try a sample chat', { small: true, onclick: function () { load(SAMPLE, {}, 'sample'); } })]), status.el, opts, body,
      h('p', { 'class': 'tnote', text: '🔒 The chat is read inside your browser and never uploaded. Close the page and it is gone.' })]));

    T.tests[id] = function () {
      var fails = [], d = parse(SAMPLE);
      if (d.msgs.length !== 5) fails.push('lines ' + d.msgs.length);
      if (d.people.join(',') !== 'Rahul,Priya') fails.push('people ' + d.people);
      if (d.msgs[2].text !== 'Hi Rahul!\nHow are you?') fails.push('multi-line: ' + JSON.stringify(d.msgs[2].text));
      if (d.msgs[3].media !== 'IMG-20240313-WA0001.jpg') fails.push('media ' + d.msgs[3].media);
      if (d.msgs[3].d.getHours() !== 21 || d.msgs[3].d.getDate() !== 13 || d.msgs[3].d.getMonth() !== 2) fails.push('date ' + d.msgs[3].d);
      var ios = parse('[12/03/24, 9:15:32 PM] Rahul: Hi\n[12/03/24, 9:16:01 PM] Priya: ‎image omitted\n[3/14/24, 10:00:00 AM] Rahul: ok');
      if (ios.msgs.length !== 3 || ios.msgs[0].d.getHours() !== 21 || ios.msgs[1].media !== 'image' || ios.order !== 'mdy' || ios.msgs[2].d.getDate() !== 14) fails.push('iPhone format: ' + JSON.stringify(ios.msgs.map(function (m) { return [m.d.toISOString(), m.media]; })));
      var s = stats(d);
      if (s.by.Rahul.n !== 2 || s.by.Priya.n !== 2 || s.by.Rahul.media !== 1) fails.push('counts ' + JSON.stringify(s.by));
      if (!s.emoji.length || s.emoji[0][0] !== '👍' || s.emoji[0][1] !== 2) fails.push('emoji ' + JSON.stringify(s.emoji));
      if (s.hours[9] !== 2 || s.hours[21] !== 2) fails.push('hours');
      load(SAMPLE, {}, 'sample');
      if (def.kind === 'viewer' && body.querySelectorAll('.twa-msg').length !== 4) fails.push('bubbles ' + body.querySelectorAll('.twa-msg').length);
      if (def.kind === 'stats' && body.querySelectorAll('.twa-bar').length < 9) fails.push('bars missing');
      if (def.kind === 'pdf' && (body.lastDoc().match(/class="m/g) || []).length !== 4) fails.push('pdf messages');
      return Promise.resolve({ ok: !fails.length, n: 10, fails: fails });
    };
  };
})();
