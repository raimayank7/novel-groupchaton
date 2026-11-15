/* Infinity by GroupChatOn — event-invite. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Event invitation maker: a party, puja, wedding or meeting invite as a picture plus a message with "add to calendar", map and RSVP links that work on Android and iPhone. */
GCOTools.register('event-invite', function (spot, T) {
  var h = T.h, status = T.status();
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var HERE = (window.Intl && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  var THEMES = { party: ['🎉', '#7c3aed', '#fdf4ff'], birthday: ['🎂', '#db2777', '#fff1f2'], wedding: ['💍', '#b45309', '#fffbeb'], puja: ['🪔', '#c2410c', '#fff7ed'], baby: ['🍼', '#0284c7', '#f0f9ff'], meeting: ['📅', '#0f766e', '#f0fdfa'], dinner: ['🍽️', '#15803d', '#f0fdf4'] };
  function stamp(date, time) { return date.replace(/-/g, '') + (time ? 'T' + time.replace(':', '') + '00' : ''); }
  function endOf(e) { var d = e.date.split('-').map(Number), t = (e.end || e.start).split(':').map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1])); if (!e.end || e.end <= e.start) x = new Date(x.getTime() + (e.end && e.end < e.start ? 864e5 : 2 * 36e5)); return [x.toISOString().slice(0, 10), pad(x.getUTCHours()) + ':' + pad(x.getUTCMinutes())]; }
  function gcal(e) { var en = endOf(e), q = ['action=TEMPLATE', 'text=' + encodeURIComponent(e.title), 'dates=' + stamp(e.date, e.start) + '/' + stamp(en[0], en[1]), 'ctz=' + encodeURIComponent(e.tz)]; if (e.venue) q.push('location=' + encodeURIComponent(e.venue)); if (e.host || e.notes) q.push('details=' + encodeURIComponent([e.host ? 'Hosted by ' + e.host : '', e.notes].filter(Boolean).join('\n'))); return 'https://calendar.google.com/calendar/render?' + q.join('&'); }
  function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function ics(e) {
    var en = endOf(e), now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Infinity by GroupChatOn//Event Invite//EN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', 'UID:' + now + '-' + Math.abs(e.title.length * 7919 + e.date.length) + '@infinity.groupchaton.com', 'DTSTAMP:' + now,
      'DTSTART;TZID=' + e.tz + ':' + stamp(e.date, e.start), 'DTEND;TZID=' + e.tz + ':' + stamp(en[0], en[1]), 'SUMMARY:' + esc(e.title)];
    if (e.venue) L.push('LOCATION:' + esc(e.venue));
    if (e.host || e.notes) L.push('DESCRIPTION:' + esc([e.host ? 'Hosted by ' + e.host : '', e.notes].filter(Boolean).join('\n')));
    L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(e.title), 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR');
    return L.join('\r\n') + '\r\n';
  }
  function mapUrl(v) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v); }
  function rsvp(e) { var n = String(e.phone || '').replace(/[^\d]/g, '').replace(/^00/, ''); return n.length >= 8 ? 'https://wa.me/' + n + '?text=' + encodeURIComponent('Hi' + (e.host ? ' ' + e.host.split(/\s/)[0] : '') + ', yes, I will come to ' + e.title + ' 🙂') : ''; }
  function when(e) {
    var d = e.date.split('-').map(Number), dt = new Date(Date.UTC(d[0], d[1] - 1, d[2]));
    function t12(x) { var p = x.split(':').map(Number); return (p[0] % 12 || 12) + (p[1] ? ':' + pad(p[1]) : '') + (p[0] < 12 ? ' AM' : ' PM'); }
    return [dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }), t12(e.start) + (e.end ? ' – ' + t12(e.end) : '')];
  }
  function message(e) {
    var w = when(e), L = [THEMES[e.theme][0] + ' ' + e.title, ''];
    if (e.host) L.push('You are invited by ' + e.host + '.');
    L.push('🗓️ ' + w[0], '🕖 ' + w[1]);
    if (e.venue) L.push('📍 ' + e.venue, 'Map: ' + mapUrl(e.venue));
    if (e.notes) L.push('', e.notes);
    L.push('', 'Add to Google Calendar: ' + gcal(e));
    if (rsvp(e)) L.push('Reply on WhatsApp: ' + rsvp(e));
    return L.join('\n');
  }
  var d0 = new Date(Date.now() + 7 * 864e5);
  var title = h('input', { type: 'text', value: '', placeholder: 'e.g. Aarav’s 5th Birthday Party', 'aria-label': 'Event name', maxlength: '80' }), host = h('input', { type: 'text', placeholder: 'e.g. The Sharma family', 'aria-label': 'Hosted by' });
  var date = h('input', { type: 'date', value: d0.getFullYear() + '-' + pad(d0.getMonth() + 1) + '-' + pad(d0.getDate()), 'aria-label': 'Date' }), start = h('input', { type: 'time', value: '18:00', 'aria-label': 'Starts' }), end = h('input', { type: 'time', value: '21:00', 'aria-label': 'Ends' });
  var venue = h('input', { type: 'text', placeholder: 'Full address of the venue', 'aria-label': 'Venue' }), phone = h('input', { type: 'tel', placeholder: 'With country code, e.g. +91 98765 43210', 'aria-label': 'RSVP WhatsApp number' });
  var notes = h('textarea', { rows: '2', placeholder: 'Optional: dress code, gift wishes, parking…', 'aria-label': 'Notes', maxlength: '300' }), theme = 'party';
  var cv = h('canvas', { width: '1080', height: '1350', 'aria-label': 'Invitation picture', style: 'width:min(320px,100%);aspect-ratio:4/5;display:block;margin:0 auto;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.15)' });
  var msg = h('textarea', { rows: '8', 'class': 'tout', readonly: true, 'aria-label': 'Invitation message' });
  function ev() { return { title: title.value.trim() || 'You’re invited!', host: host.value.trim(), date: date.value, start: start.value || '18:00', end: end.value, venue: venue.value.trim(), phone: phone.value, notes: notes.value.trim(), theme: theme, tz: HERE }; }
  function wrap(g, text, max) { var words = text.split(/\s+/), lines = [], cur = ''; words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  function paint(e) {
    var g = cv.getContext('2d'), th = THEMES[e.theme], W = 1080, H = 1350, w = when(e);
    g.fillStyle = th[2]; g.fillRect(0, 0, W, H);
    g.strokeStyle = th[1]; g.lineWidth = 14; g.strokeRect(40, 40, W - 80, H - 80); g.lineWidth = 4; g.strokeRect(70, 70, W - 140, H - 140);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '150px system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; g.fillText(th[0], W / 2, 230);
    g.fillStyle = '#374151'; g.font = '600 40px system-ui, sans-serif'; g.fillText(e.host ? 'You are invited by ' + e.host : 'You are invited', W / 2, 380);
    g.fillStyle = th[1]; var size = 92; g.font = 'bold ' + size + 'px Georgia, serif'; var lines = wrap(g, e.title, 880);
    while (lines.length > 3 && size > 50) { size -= 8; g.font = 'bold ' + size + 'px Georgia, serif'; lines = wrap(g, e.title, 880); }
    var y = 500; lines.slice(0, 3).forEach(function (l) { g.fillText(l, W / 2, y); y += size * 1.15; });
    y += 40; g.fillStyle = '#111827'; g.font = '600 50px system-ui, sans-serif'; g.fillText(w[0], W / 2, y); y += 75; g.font = '46px system-ui, sans-serif'; g.fillText(w[1], W / 2, y); y += 100;
    if (e.venue) { g.font = '40px system-ui, sans-serif'; g.fillStyle = '#374151'; wrap(g, '📍 ' + e.venue, 860).slice(0, 3).forEach(function (l) { g.fillText(l, W / 2, y); y += 56; }); y += 20; }
    if (e.notes) { g.font = 'italic 36px Georgia, serif'; g.fillStyle = '#4b5563'; wrap(g, e.notes, 860).slice(0, 3).forEach(function (l) { g.fillText(l, W / 2, y); y += 50; }); }
    g.font = '30px system-ui, sans-serif'; g.fillStyle = th[1]; g.fillText(rsvp(e) ? 'Please reply on WhatsApp' : 'We look forward to seeing you', W / 2, H - 130);
  }
  function draw() { if (!date.value) { status.error('Choose the date.'); return; } status.clear(); var e = ev(); paint(e); msg.value = message(e); }
  [title, host, date, start, end, venue, phone, notes].forEach(function (x) { x.addEventListener('input', draw); });
  var cp = T.button('Copy message', { small: true, onclick: function () { T.copy(msg.value, cp); } });
  spot.appendChild(T.card([T.seg([['party', '🎉'], ['birthday', '🎂'], ['wedding', '💍'], ['puja', '🪔'], ['baby', '🍼'], ['meeting', '📅'], ['dinner', '🍽️']], 'party', function (v) { theme = v; draw(); }),
    T.field('Event name', title), T.field('Hosted by', host), h('div', { 'class': 'tgrid2' }, [T.field('Date', date), T.field('Starts', start), T.field('Ends (optional)', end)]),
    T.field('Venue address', venue), T.field('RSVP on WhatsApp to (optional)', phone), T.field('Notes', notes), cv,
    T.row([T.button('Share on WhatsApp', { primary: true, onclick: function () { draw(); window.open('https://wa.me/?text=' + encodeURIComponent(msg.value), '_blank', 'noopener'); } }),
      T.button('Download picture', { small: true, onclick: function () { draw(); T.canvasBlob(cv, 'image/png').then(function (b) { T.download(b, 'invitation.png'); }); } }),
      T.button('Calendar file (.ics)', { small: true, onclick: function () { draw(); T.download(new Blob([ics(ev())], { type: 'text/calendar;charset=utf-8' }), 'invitation.ics'); } }),
      T.button('Try a sample', { small: true, onclick: function () { title.value = 'Aarav’s 5th Birthday Party'; host.value = 'Priya and Rahul'; venue.value = 'Green Park Banquet, Sector 21, Gurugram'; notes.value = 'Fancy dress: superheroes! 🦸'; phone.value = '+91 98765 43210'; theme = 'birthday'; draw(); } })]),
    status.el, T.field('Message to send (with calendar, map and reply links)', msg), T.row([cp]),
    h('p', { 'class': 'tnote', text: 'Send the picture and then the message: guests tap the links to add the event to Google Calendar, open the map, or reply on WhatsApp. iPhone users can also open the .ics file to add it to Apple Calendar. Everything is made on your device.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['event-invite'] = function () {
    var f = [], e = { title: 'Diwali Dinner', host: 'Asha Rao', date: '2026-11-08', start: '19:30', end: '22:00', venue: 'Flat 4B, Rose Apts, Pune', phone: '+91 98765-43210', notes: '', theme: 'puja', tz: 'Asia/Kolkata' };
    var g = gcal(e), m = message(e), c = ics(e);
    if (g.indexOf('dates=20261108T193000/20261108T220000') < 0 || g.indexOf('ctz=Asia%2FKolkata') < 0) f.push('gcal ' + g);
    if (rsvp(e).indexOf('https://wa.me/919876543210?text=Hi%20Asha%2C%20yes') !== 0) f.push('rsvp ' + rsvp(e));
    if (!/🗓️ Sunday,? 8 November 2026/.test(m) || m.indexOf('🕖 7:30 PM – 10 PM') < 0 || m.indexOf('Map: https://www.google.com/maps/search/?api=1&query=Flat%204B') < 0) f.push('message ' + m.slice(0, 120));
    if (c.indexOf('DTSTART;TZID=Asia/Kolkata:20261108T193000') < 0 || c.indexOf('LOCATION:Flat 4B\\, Rose Apts\\, Pune') < 0) f.push('ics');
    e.end = '01:00'; if (endOf(e).join(' ') !== '2026-11-09 01:00') f.push('past midnight');
    e.end = ''; if (endOf(e).join(' ') !== '2026-11-08 21:30') f.push('default 2 h');
    e.phone = '123'; if (rsvp(e) !== '') f.push('short phone');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
