/* Infinity by GroupChatOn — rename-files. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Bulk file renamer: rename many files at once with a pattern ({name}, {n}, {date}, {ext}), find and replace, case and spaces, then download them as a ZIP. Files never leave the device. */
GCOTools.register('rename-files', function (spot, T) {
  var h = T.h, status = T.status(), files = [];
  function title(s) { return s.toLowerCase().replace(/(^|[\s_\-.(])(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); }); }
  function newNames(list, o) {
    var used = {}, d = new Date(), today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    return list.map(function (f, i) {
      var m = /^(.*?)(\.[^.]+)?$/.exec(f.name), base = m[1] || f.name, ext = (m[2] || '');
      var num = String((+o.start || 0) + i * (+o.step || 1)), pad = Math.max(0, +o.pad || 0);
      while (num.length < pad) num = '0' + num;
      var mod = f.lastModified ? new Date(f.lastModified) : d, fdate = mod.getFullYear() + '-' + ('0' + (mod.getMonth() + 1)).slice(-2) + '-' + ('0' + mod.getDate()).slice(-2);
      if (o.find) {
        if (o.regex) { try { base = base.replace(new RegExp(o.find, 'g'), o.repl || ''); } catch (e) { throw new Error('The find pattern is not a valid regular expression: ' + e.message); } }
        else base = base.split(o.find).join(o.repl || '');
      }
      var name = (o.pattern || '{name}').replace(/\{name\}/g, base).replace(/\{n\}/g, num).replace(/\{date\}/g, fdate).replace(/\{today\}/g, today).replace(/\{ext\}/g, ext.slice(1));
      if (o.case === 'lower') name = name.toLowerCase(); else if (o.case === 'upper') name = name.toUpperCase(); else if (o.case === 'title') name = title(name);
      if (o.spaces === '-' || o.spaces === '_') name = name.replace(/\s+/g, o.spaces); else if (o.spaces === 'none') name = name.replace(/\s+/g, '');
      if (o.extCase === 'lower') ext = ext.toLowerCase(); else if (o.extCase === 'upper') ext = ext.toUpperCase();
      name = name.replace(/[\\\/:*?"<>|\u0000-\u001f]+/g, '_').replace(/^\.+/, '').trim() || 'file';
      var full = name + ext, k = 2;
      while (used[full.toLowerCase()]) full = name + ' (' + k++ + ')' + ext;
      used[full.toLowerCase()] = 1;
      return full;
    });
  }
  var pattern = h('input', { type: 'text', value: '{name}', 'aria-label': 'Name pattern', spellcheck: 'false' });
  var start = h('input', { type: 'number', value: '1', min: '0', 'aria-label': 'Start number' }), pad = T.select([['0', 'No padding (1, 2…)'], ['2', '01, 02…'], ['3', '001, 002…'], ['4', '0001…']], '2');
  var find = h('input', { type: 'text', placeholder: 'Text to find (optional)', spellcheck: 'false', 'aria-label': 'Find' }), repl = h('input', { type: 'text', placeholder: 'Replace with', spellcheck: 'false', 'aria-label': 'Replace with' });
  var regex = h('input', { type: 'checkbox' }), cse = T.select([['keep', 'Keep as is'], ['lower', 'lower case'], ['upper', 'UPPER CASE'], ['title', 'Title Case']], 'keep');
  var spaces = T.select([['keep', 'Keep spaces'], ['-', 'Spaces → -'], ['_', 'Spaces → _'], ['none', 'Remove spaces']], 'keep'), extCase = T.select([['keep', 'Keep extension'], ['lower', '.jpg (lower)'], ['upper', '.JPG (upper)']], 'lower');
  var list = h('div', { 'class': 'tcalc-scroll', 'data-out': '' }), go = T.button('Download renamed files (ZIP)', { primary: true, disabled: true, onclick: zip });
  function opts() { return { pattern: pattern.value, start: start.value, pad: pad.value, find: find.value, repl: repl.value, regex: regex.checked, case: cse.value, spaces: spaces.value, extCase: extCase.value }; }
  function draw() {
    list.innerHTML = ''; go.disabled = !files.length;
    if (!files.length) { status.info('Add files to see their new names.'); return; }
    var names;
    try { names = newNames(files, opts()); } catch (e) { status.error(e); go.disabled = true; return; }
    var changed = names.filter(function (n, i) { return n !== files[i].name; }).length;
    list.appendChild(h('table', {}, [h('thead', {}, [h('tr', {}, ['Old name', 'New name'].map(function (c) { return h('th', { text: c, style: 'text-align:left' }); }))]),
      h('tbody', {}, files.map(function (f, i) { return h('tr', {}, [h('td', { text: f.name, style: 'text-align:left;white-space:normal;overflow-wrap:anywhere' }), h('td', { text: names[i], style: 'text-align:left;white-space:normal;overflow-wrap:anywhere;font-weight:' + (names[i] !== f.name ? '700' : '400') })]); }))]));
    status.info(files.length + ' file' + (files.length === 1 ? '' : 's') + ' · ' + changed + ' will be renamed.');
  }
  function zip() {
    var names = newNames(files, opts());
    status.progress(0, 'Packing the ZIP…');
    T.zip(files.map(function (f, i) { return { name: names[i], blob: f }; }), function (p) { status.progress(p, 'Packing the ZIP… ' + Math.round(p * 100) + '%'); })
      .then(function (z) { T.download(z, 'renamed-files.zip'); status.ok('✓ Done. Unzip it to get your renamed files (the originals are unchanged).'); }).catch(status.error);
  }
  [pattern, start, pad, find, repl, regex, cse, spaces, extCase].forEach(function (x) { x.addEventListener('input', draw); x.addEventListener('change', draw); });
  var tokens = h('p', { 'class': 'tnote', style: 'font-size:14px' }, ['Tap to add: '].concat([['{name}', 'old name'], ['{n}', 'number'], ['{date}', 'file date'], ['{today}', 'today'], ['{ext}', 'extension']].map(function (t, i) {
    return h('span', {}, [i ? ' · ' : '', h('a', { href: '#', text: t[0], onclick: function (e) { e.preventDefault(); pattern.setRangeText(t[0], pattern.selectionStart || pattern.value.length, pattern.selectionEnd || pattern.value.length, 'end'); draw(); } }), ' ' + t[1]]);
  })));
  spot.appendChild(T.card([T.dropzone({ multiple: true, icon: '🏷️', label: 'Choose files to rename', hint: 'Any type, as many as you like. They stay on your device.', onFiles: function (fs) { files = files.concat(fs); draw(); } }),
    T.field('New name pattern', pattern), tokens,
    h('div', { 'class': 'tgrid2' }, [T.field('Start number', start), T.field('Number digits', pad), T.field('Find', find), T.field('Replace with', repl), T.field('Letter case', cse), T.field('Spaces', spaces), T.field('Extension', extCase)]),
    h('label', { 'class': 'tcheck' }, [regex, ' Find uses a regular expression']),
    status.el, list, T.row([go, T.button('Clear files', { small: true, onclick: function () { files = []; draw(); } }),
      T.button('Try a sample', { small: true, onclick: function () {
        files = ['IMG_20261001_0931.JPG', 'IMG_20261001_0932.JPG', 'Holiday notes FINAL.TXT'].map(function (n) { return new File(['sample ' + n], n, { lastModified: Date.UTC(2026, 9, 1, 9, 31) }); });
        pattern.value = 'goa-trip-{n}'; find.value = ''; repl.value = ''; cse.value = 'lower'; spaces.value = '-'; draw();
      } })]),
    h('p', { 'class': 'tnote', style: 'font-size:14px', text: 'Browsers are not allowed to rename files on your disk, so you get renamed copies in one ZIP file. Your original files are not changed.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['rename-files'] = function () {
    var f = [], fl = function (n) { return { name: n, lastModified: new Date(2026, 0, 5).getTime() }; };
    var r = newNames([fl('IMG_1.JPG'), fl('IMG_2.JPG'), fl('notes.txt')], { pattern: 'trip-{n}', start: 1, pad: 2, case: 'keep', spaces: 'keep', extCase: 'lower' });
    if (r.join('|') !== 'trip-01.jpg|trip-02.jpg|trip-03.txt') f.push('pattern ' + r.join('|'));
    r = newNames([fl('My Holiday Photo.png')], { pattern: '{date} {name}', case: 'title', spaces: '_', extCase: 'keep' });
    if (r[0] !== '2026-01-05_My_Holiday_Photo.png') f.push('date/title ' + r[0]);
    r = newNames([fl('scan 001.pdf'), fl('scan 002.pdf')], { pattern: '{name}', find: 'scan (\\d+)', repl: 'invoice-$1', regex: true, case: 'keep', spaces: 'keep', extCase: 'keep' });
    if (r.join('|') !== 'invoice-001.pdf|invoice-002.pdf') f.push('regex ' + r.join('|'));
    r = newNames([fl('a.txt'), fl('b.txt')], { pattern: 'same', case: 'keep', spaces: 'keep', extCase: 'keep' });
    if (r.join('|') !== 'same.txt|same (2).txt') f.push('duplicates ' + r.join('|'));
    r = newNames([fl('bad:name?.txt')], { pattern: '{name}', case: 'keep', spaces: 'keep', extCase: 'keep' });
    if (r[0] !== 'bad_name_.txt') f.push('invalid chars ' + r[0]);
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
