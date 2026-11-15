/* Infinity by GroupChatOn — split-file. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Split a large file into numbered parts (to email or upload), and join the parts back into the original, all on your device. */
GCOTools.register('split-file', function (spot, T) {
  var h = T.h;
  function pad(n) { return ('00' + n).slice(-3); }
  function plan(size, part) { var out = []; for (var s = 0; s < size; s += part) out.push([s, Math.min(size, s + part)]); return out.length ? out : [[0, 0]]; }
  function split(file, part) { return plan(file.size, part).map(function (r, i) { return { name: file.name + '.' + pad(i + 1), blob: file.slice(r[0], r[1]) }; }); }
  // parts named like "video.mp4.001", "video.mp4.002"… → base name and the files in order
  function order(files) {
    var items = files.map(function (f) { var m = f.name.match(/^(.*)\.(\d{2,4})$/); return m ? { base: m[1], n: +m[2], f: f } : null; });
    if (items.some(function (x) { return !x; })) throw new Error('Every part must end in a number, like video.mp4.001, video.mp4.002.');
    var base = items[0].base; if (items.some(function (x) { return x.base !== base; })) throw new Error('These parts come from different files. Choose the parts of one file only.');
    items.sort(function (a, b) { return a.n - b.n; });
    var first = items[0].n;
    for (var i = 0; i < items.length; i++) if (items[i].n !== first + i) throw new Error('Part ' + pad(first + i) + ' is missing. Add all the parts.');
    if (first > 1) throw new Error('Part ' + pad(1) + ' is missing. Add all the parts.');
    return { base: base, files: items.map(function (x) { return x.f; }) };
  }
  var mode = 'split', res = T.results(), status = T.status(), help = h('div', { 'class': 'tnote' });
  // the shared results box has an auto-width column that is too wide for phones: keep it inside the card
  function fit() {
    [res.el].concat([].slice.call(res.el.querySelectorAll('.tresults-grid'))).forEach(function (e) { e.style.gridTemplateColumns = 'minmax(0, 1fr)'; });
    [].slice.call(res.el.querySelectorAll('.tresult-name')).forEach(function (e) { e.style.minWidth = '0'; e.style.overflowWrap = 'anywhere'; e.style.flex = '1'; });
    [].slice.call(res.el.querySelectorAll('.tresults-head')).forEach(function (e) { e.style.flexWrap = 'wrap'; });
  }
  var size = T.select([['1', '1 MB'], ['5', '5 MB'], ['10', '10 MB'], ['20', '20 MB (most email)'], ['25', '25 MB (Gmail)'], ['100', '100 MB'], ['500', '500 MB'], ['1024', '1 GB'], ['n', 'A number of equal parts…']], T.store.get('split-size', '20'));
  var parts = h('input', { type: 'number', min: '2', max: '999', value: '3' }), partsF = T.field('Number of parts', parts);
  function syncSize() { partsF.hidden = size.value !== 'n'; T.store.set('split-size', size.value); }
  size.addEventListener('change', syncSize);
  function doSplit(files) {
    var f = files[0], each = size.value === 'n' ? Math.ceil(f.size / Math.max(2, Math.min(999, Math.round(+parts.value) || 2))) : +size.value * 1048576;
    if (!f.size) { status.error('This file is empty.'); return; }
    if (f.size / each > 999) { status.error('That would make more than 999 parts. Choose a bigger part size.'); return; }
    var list = split(f, each);
    res.set(list.map(function (p) { return { name: p.name, blob: p.blob, icon: '🧩' }; }), f.name + '-parts'); fit();
    status.ok('Made ' + list.length + ' parts. Download each one (or all as ZIP for small files). Keep them together to join later.');
    var q = '"' + f.name + '"';
    help.innerHTML = ''; help.appendChild(h('p', {}, [h('b', { text: 'To join them later: ' }), 'use the Join tab here, or on a computer without internet:']));
    help.appendChild(h('pre', { 'class': 'tmono', style: 'white-space:pre-wrap;overflow-wrap:anywhere', text: 'Windows (Command Prompt):\ncopy /b ' + list.map(function (p) { return '"' + p.name + '"'; }).join(' + ') + ' ' + q + '\n\nMac / Linux (Terminal):\ncat ' + q + '.[0-9][0-9][0-9] > ' + q }));
  }
  function doJoin(files) {
    try {
      var o = order(files), total = o.files.reduce(function (a, f) { return a + f.size; }, 0);
      res.set([{ name: o.base, blob: new Blob(o.files), icon: '📦' }]); fit();
      status.ok('Joined ' + o.files.length + ' parts into ' + o.base + ' (' + T.bytes(total) + ').'); help.innerHTML = '';
    } catch (e) { res.clear(); status.error(e); }
  }
  var drop = T.dropzone({ label: 'Choose the file to split', icon: '✂️', multiple: true, onFiles: function (fs) { if (mode === 'split') doSplit(fs); else doJoin(fs); } });
  var opts = h('div', { 'class': 'tgrid2' }, [T.field('Size of each part', size), partsF]);
  var seg = T.seg([['split', '✂️ Split'], ['join', '🧩 Join']], mode, function (v) {
    mode = v; opts.hidden = v === 'join'; res.clear(); status.clear(); help.innerHTML = '';
    drop.querySelector('b').textContent = v === 'split' ? 'Choose the file to split' : 'Choose all the parts (.001, .002…)';
  });
  spot.appendChild(T.card([seg, opts, drop, T.row([T.button('Try a sample', { small: true, onclick: function () {
    var text = ''; for (var i = 1; i <= 60; i++) text += 'Line ' + i + ': a sample file to show how splitting works.\n';
    size.value = 'n'; parts.value = '3'; syncSize(); doSplit([new File([text], 'sample-notes.txt', { type: 'text/plain' })]);
  } })]), status.el, res.el, help, h('p', { 'class': 'tnote', text: 'Parts are made by cutting the file, not copying it, so even large videos split instantly. Nothing is uploaded.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  syncSize();

  T.tests['split-file'] = function () {
    var f = [], bytes = new Uint8Array(2500); for (var i = 0; i < bytes.length; i++) bytes[i] = i * 7 & 255;
    var file = new File([bytes], 'data.bin'), ps = split(file, 1000);
    if (ps.map(function (p) { return p.name + ':' + p.blob.size; }).join(' ') !== 'data.bin.001:1000 data.bin.002:1000 data.bin.003:500') f.push('split ' + ps.map(function (p) { return p.name + ':' + p.blob.size; }).join(' '));
    var shuffled = [ps[2], ps[0], ps[1]].map(function (p) { return new File([p.blob], p.name); }), o = order(shuffled);
    if (o.base !== 'data.bin') f.push('base ' + o.base);
    try { order([new File(['a'], 'x.bin.001'), new File(['b'], 'x.bin.003')]); f.push('gap not caught'); } catch (e) { if (!/002 is missing/.test(e.message)) f.push('gap msg ' + e.message); }
    try { order([new File(['a'], 'x.bin.002')]); f.push('missing first not caught'); } catch (e) {}
    try { order([new File(['a'], 'x.bin.001'), new File(['b'], 'y.bin.002')]); f.push('mixed files not caught'); } catch (e) {}
    return new Blob(o.files).arrayBuffer().then(function (buf) {
      var back = new Uint8Array(buf), same = back.length === bytes.length && back.every(function (v, i) { return v === bytes[i]; });
      if (!same) f.push('join did not restore the bytes');
      return { ok: !f.length, n: 6, fails: f };
    });
  };
});
