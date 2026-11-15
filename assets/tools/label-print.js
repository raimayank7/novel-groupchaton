/* Infinity by GroupChatOn — label-print. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Address labels and envelopes: print addresses on standard A4 and US Letter label sheets (Avery-style) or straight onto DL, C5 and #10 envelopes. */
GCOTools.register('label-print', function (spot, T) {
  var h = T.h, status = T.status();
  // sheet: page w × h (mm), columns, rows, label w × h, top and left margin, step across and down
  var SHEETS = {
    a4_21: ['A4 · 21 labels (3 × 7, 63.5 × 38.1 mm)', 210, 297, 3, 7, 63.5, 38.1, 15.15, 7.25, 66.04, 38.1],
    a4_14: ['A4 · 14 labels (2 × 7, 99.1 × 38.1 mm)', 210, 297, 2, 7, 99.1, 38.1, 15.15, 4.65, 101.6, 38.1],
    a4_8: ['A4 · 8 labels (2 × 4, 99.1 × 67.7 mm)', 210, 297, 2, 4, 99.1, 67.7, 13.1, 4.65, 101.6, 67.7],
    a4_24: ['A4 · 24 labels (3 × 8, 63.5 × 33.9 mm)', 210, 297, 3, 8, 63.5, 33.9, 12.9, 7.25, 66.04, 33.9],
    a4_65: ['A4 · 65 labels (5 × 13, 38.1 × 21.2 mm)', 210, 297, 5, 13, 38.1, 21.2, 10.7, 4.65, 40.64, 21.2],
    us_30: ['US Letter · 30 labels (3 × 10, 2⅝ × 1 in, like 5160)', 215.9, 279.4, 3, 10, 66.675, 25.4, 12.7, 4.7625, 69.85, 25.4],
    us_10: ['US Letter · 10 labels (2 × 5, 4 × 2 in, like 5163)', 215.9, 279.4, 2, 5, 101.6, 50.8, 12.7, 3.96875, 106.3625, 50.8],
    us_6: ['US Letter · 6 labels (2 × 3, 4 × 3⅓ in, like 5164)', 215.9, 279.4, 2, 3, 101.6, 84.67, 12.7, 3.96875, 106.3625, 84.67]
  };
  var ENVS = { dl: ['DL envelope (220 × 110 mm)', 220, 110], c5: ['C5 envelope (229 × 162 mm)', 229, 162], c6: ['C6 envelope (162 × 114 mm)', 162, 114], us10: ['#10 envelope (9½ × 4⅛ in)', 241.3, 104.775] };
  function blocks(text) { return text.replace(/\r/g, '').split(/\n\s*\n/).map(function (b) { return b.split('\n').map(function (l) { return l.trim(); }).filter(Boolean); }).filter(function (b) { return b.length; }); }
  function pos(s, i) { var c = i % s[3], r = Math.floor(i / s[3]) % s[4]; return { x: Math.round((s[8] + c * s[9]) * 100) / 100, y: Math.round((s[7] + r * s[10]) * 100) / 100, page: Math.floor(i / (s[3] * s[4])) }; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var mode = 'labels', addr = h('textarea', { rows: '8', 'aria-label': 'Addresses', placeholder: 'One address per block, with a blank line between addresses' });
  addr.value = T.store.get('labels-addr', '');
  var sheet = T.select(Object.keys(SHEETS).map(function (k) { return [k, SHEETS[k][0]]; }), T.store.get('labels-sheet', 'a4_21')), env = T.select(Object.keys(ENVS).map(function (k) { return [k, ENVS[k][0]]; }), 'dl');
  var skip = h('input', { type: 'number', min: '0', max: '64', value: '0', 'aria-label': 'Skip used labels' }), fill = h('input', { type: 'checkbox' }), border = h('input', { type: 'checkbox', checked: true });
  var size = T.select([[9, 'Small text'], [11, 'Normal text'], [13, 'Large text']], 11), align = T.select([['left', 'Left'], ['center', 'Centre']], 'left');
  var from = h('textarea', { rows: '3', 'aria-label': 'Return address', placeholder: 'Your (return) address for envelopes' }); from.value = T.store.get('labels-from', '');
  var frame = h('iframe', { 'class': 'tframe', title: 'Print preview', style: 'height:420px;background:#fff' }), info = h('p', { 'class': 'tnote', 'data-out': '' });
  function labelsHtml() {
    var s = SHEETS[sheet.value], list = blocks(addr.value), per = s[3] * s[4], items = [], k = Math.max(0, Math.min(per - 1, Math.round(+skip.value) || 0));
    if (fill.checked && list.length) { for (var i = k; i < per; i++) items.push(list[0]); } else items = list;
    var cells = items.map(function (b, i) {
      var p = pos(s, i + k);
      return '<div class="l" style="left:' + p.x + 'mm;top:' + (p.y + p.page * s[2]) + 'mm;width:' + s[5] + 'mm;height:' + s[6] + 'mm">' + b.map(esc).join('<br>') + '</div>';
    });
    var pages = items.length ? pos(s, items.length - 1 + k).page + 1 : 1;
    info.textContent = items.length + ' label' + (items.length === 1 ? '' : 's') + ' on ' + pages + ' sheet' + (pages === 1 ? '' : 's') + (k ? ', starting after ' + k + ' used label' + (k === 1 ? '' : 's') : '') + '.';
    return '<!doctype html><html><head><meta charset="utf-8"><style>@page{size:' + s[1] + 'mm ' + s[2] + 'mm;margin:0}html,body{margin:0;padding:0}body{position:relative;width:' + s[1] + 'mm;height:' + (pages * s[2]) + 'mm;font:' + size.value + 'pt/1.3 Arial,Helvetica,sans-serif;color:#000}.l{position:absolute;box-sizing:border-box;padding:2.5mm 4mm;overflow:hidden;display:flex;flex-direction:column;justify-content:center;text-align:' + align.value + ';' + (border.checked ? 'outline:0.2mm dashed #bbb;' : '') + '}@media print{.l{outline:none}}</style></head><body>' + cells.join('') + '</body></html>';
  }
  function envHtml() {
    var e = ENVS[env.value], list = blocks(addr.value), ret = from.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    info.textContent = list.length + ' envelope' + (list.length === 1 ? '' : 's') + '. Feed envelopes as your printer’s manual shows, and set the paper size to ' + e[0].replace(/ \(.*/, '') + '.';
    var pages = (list.length ? list : [[]]).map(function (b) { return '<section><div class="f">' + ret.map(esc).join('<br>') + '</div><div class="t">' + b.map(esc).join('<br>') + '</div></section>'; });
    return '<!doctype html><html><head><meta charset="utf-8"><style>@page{size:' + e[1] + 'mm ' + e[2] + 'mm;margin:0}html,body{margin:0}section{position:relative;width:' + e[1] + 'mm;height:' + e[2] + 'mm;page-break-after:always;font:' + size.value + 'pt/1.35 Arial,Helvetica,sans-serif;' + (border.checked ? 'outline:0.3mm dashed #bbb;' : '') + 'margin-bottom:4mm}@media print{section{outline:none;margin:0}}.f{position:absolute;left:12mm;top:10mm;font-size:0.85em}.t{position:absolute;left:' + (e[1] * 0.45) + 'mm;top:' + (e[2] * 0.45) + 'mm;font-size:1.15em}</style></head><body>' + pages.join('') + '</body></html>';
  }
  function render() {
    T.store.set('labels-addr', addr.value.slice(0, 50000)); T.store.set('labels-sheet', sheet.value); T.store.set('labels-from', from.value);
    frame.srcdoc = mode === 'labels' ? labelsHtml() : envHtml();
  }
  function print() {
    if (!blocks(addr.value).length) { status.error('Type at least one address first.'); return; }
    render();
    setTimeout(function () { try { frame.contentWindow.focus(); frame.contentWindow.print(); status.info('In the print window set Scale to 100% (Actual size) and Margins to None, then print a test on plain paper and hold it against a label sheet.'); } catch (e) { status.error('Printing was blocked. Download the page instead and print it.'); } }, 300);
  }
  var labOpts = h('div', { style: 'display:grid;gap:12px' }, [T.field('Label sheet', sheet), h('div', { 'class': 'tgrid2' }, [T.field('Skip used labels at the start', skip), T.field('Text size', size), T.field('Align', align)]), h('label', { 'class': 'tcheck' }, [fill, ' Fill the whole sheet with the first address (return labels)'])]);
  var envOpts = h('div', { style: 'display:grid;gap:12px', hidden: true }, [T.field('Envelope', env), T.field('Return address (top left)', from)]);
  [addr, sheet, env, skip, fill, border, size, align, from].forEach(function (x) { x.addEventListener('change', render); });
  addr.addEventListener('input', function () { clearTimeout(render.t); render.t = setTimeout(render, 400); });
  spot.appendChild(T.card([T.seg([['labels', 'Label sheets'], ['env', 'Envelopes']], 'labels', function (v) { mode = v; labOpts.hidden = v !== 'labels'; envOpts.hidden = v === 'labels'; render(); }),
    T.field('Addresses (blank line between each)', addr), labOpts, envOpts, h('label', { 'class': 'tcheck' }, [border, ' Show label outlines on screen (not printed)']),
    T.row([T.button('Print', { primary: true, onclick: print }), T.button('Try a sample', { small: true, onclick: function () { addr.value = 'Mr Rahul Sharma\n12 MG Road\nBengaluru 560001\nIndia\n\nMs Emma Brown\n45 King Street\nManchester M2 4LQ\nUnited Kingdom\n\nDr Ali Hassan\nVilla 7, Al Wasl Road\nDubai, UAE'; render(); } }),
      T.button('Download page', { small: true, onclick: function () { render(); T.download(new Blob([frame.srcdoc], { type: 'text/html;charset=utf-8' }), mode === 'labels' ? 'address-labels.html' : 'envelopes.html'); } })]),
    status.el, info, frame,
    h('p', { 'class': 'tnote', text: 'Label sizes match the common A4 (L7160, L7163, L7165, L7159, L7651 style) and US Letter (5160, 5163, 5164 style) sheets. Always print one test page on plain paper first. Addresses stay on this device.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  render();
  T.tests['label-print'] = function () {
    var f = [], b = blocks('A\nB\n\n\nC\n  \nD\nE\n');
    if (b.length !== 3 || b[2].join() !== 'D,E') f.push('blocks ' + JSON.stringify(b));
    var p = pos(SHEETS.a4_21, 4), q = pos(SHEETS.a4_21, 21), r = pos(SHEETS.us_30, 29);
    if (p.x !== 73.29 || p.y !== 53.25 || p.page !== 0) f.push('pos 4 ' + JSON.stringify(p));
    if (q.page !== 1 || q.x !== 7.25 || q.y !== 15.15) f.push('page 2');
    if (r.y + SHEETS.us_30[6] > 279.4 - 12) f.push('letter fits');
    Object.keys(SHEETS).forEach(function (k) { var s = SHEETS[k], last = pos(s, s[3] * s[4] - 1); if (last.x + s[5] > s[1] + 0.01 || last.y + s[6] > s[2] + 0.01) f.push(k + ' overflows'); });
    if (esc('<b>&') !== '&lt;b&gt;&amp;') f.push('escape');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
