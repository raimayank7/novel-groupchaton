/* Infinity by GroupChatOn — svg-optimize. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* SVG optimiser: shrinks SVG files with SVGO (removes editor junk, metadata and comments, rounds numbers, merges paths) and shows before / after previews and the saving. */
GCOTools.register('svg-optimize', function (spot, T) {
  var h = T.h, SVGO = 'https://cdn.jsdelivr.net/npm/svgo@3.3.2/dist/svgo.browser.js', lib = null, name = 'image.svg';
  function load() { return lib ? Promise.resolve(lib) : import(SVGO).then(function (m) { lib = m; return m; }); }
  function bytes(s) { return new Blob([s]).size; }
  function optimize(svg, o) {
    return load().then(function (S) {
      var plugins = [{ name: 'preset-default', params: { overrides: o.keepIds ? { cleanupIds: false, removeViewBox: false } : { removeViewBox: false } } }];
      if (o.dims) plugins.push('removeDimensions');
      var r;
      try { r = S.optimize(svg, { multipass: true, floatPrecision: +o.precision, js2svg: { pretty: !!o.pretty, indent: 2 }, plugins: plugins }); }
      catch (e) { throw new Error('This is not valid SVG: ' + String(e.message || e).split('\n')[0]); }
      return r.data;
    });
  }
  var before = h('img', { alt: 'Original SVG', style: 'max-width:100%;max-height:180px;display:block;margin:auto' }), after = h('img', { alt: 'Optimised SVG', style: 'max-width:100%;max-height:180px;display:block;margin:auto' });
  var stats = h('div', { 'class': 'tstats', 'data-out': '' }), preview = h('div', { 'class': 'tgrid2', hidden: true }, [
    h('figure', { style: 'margin:0;padding:10px;border:1px solid var(--line);border-radius:12px;background:#fff' }, [before, h('figcaption', { text: 'Before', style: 'text-align:center;color:#555;font-size:13px' })]),
    h('figure', { style: 'margin:0;padding:10px;border:1px solid var(--line);border-radius:12px;background:#fff' }, [after, h('figcaption', { text: 'After', style: 'text-align:center;color:#555;font-size:13px' })])]);
  function url(s) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); }
  function stat(label, value) { return h('div', { 'class': 'tstat' }, [h('b', { text: value }), h('span', { text: label })]); }
  function run(svg, o) {
    return optimize(svg, o).then(function (out) {
      var a = bytes(svg), b = bytes(out);
      stats.innerHTML = '';
      [stat('Before', T.bytes(a)), stat('After', T.bytes(b)), stat('Saved', Math.max(0, Math.round((1 - b / a) * 100)) + '%')].forEach(function (x) { stats.appendChild(x); });
      before.src = url(svg); after.src = url(out); preview.hidden = false;
      return out;
    });
  }
  var opts = [T.opt.select('precision', 'Number precision', [['1', '1 decimal (smallest)'], ['2', '2 decimals'], ['3', '3 decimals (safe)'], ['4', '4 decimals'], ['5', '5 decimals']], '3'),
    T.opt.check('dims', 'Remove width/height (scales to its box)', false), T.opt.check('keepIds', 'Keep ids (for CSS or JS)', false), T.opt.check('pretty', 'Pretty print', false)];
  var tr = T.transformer(spot, { id: 'svg-optimize', inLabel: 'SVG code (or open a file below)', outLabel: 'Optimised SVG', mono: true, rows: 8, live: false, button: 'Optimise', download: 'image.min.svg', type: 'image/svg+xml',
    placeholder: '<svg xmlns="http://www.w3.org/2000/svg" …', run: run, options: opts,
    sample: '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!-- Created with an editor -->\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="120.000000" height="120.000000" viewBox="0 0 120 120" version="1.1" id="svg8">\n  <metadata id="metadata5">editor data</metadata>\n  <defs id="defs2"/>\n  <g id="layer1" inkscape:label="Layer 1">\n    <g>\n      <circle style="fill:#ff5c7a;fill-opacity:1;stroke:none" cx="60.000000" cy="60.000000" r="50.123456" id="circle10"/>\n      <path style="fill:#ffffff;stroke:none" d="M 40.000000,62.500000 L 55.000000,77.500000 L 82.500000,45.000000 L 77.500000,40.000000 L 55.000000,67.500000 L 45.000000,57.500000 Z" id="path12"/>\n    </g>\n  </g>\n</svg>\n',
    note: function (a, b) { return b ? '✓ Optimised · ' + T.bytes(bytes(a)) + ' → ' + T.bytes(bytes(b)) : ''; } });
  var card = spot.lastChild;
  card.style.gridTemplateColumns = 'minmax(0, 1fr)';
  card.insertBefore(T.dropzone({ accept: '.svg,image/svg+xml', icon: '✨', label: 'Open an SVG file', hint: 'It stays on your device', onFiles: function (fs) {
    name = fs[0].name;
    T.read(fs[0], 'text').then(function (t) { tr.input.value = t; tr.update(); });
  } }), card.firstChild);
  card.appendChild(stats); card.appendChild(preview);
  T.tests['svg-optimize'] = function () {
    var f = [], src = '<?xml version="1.0"?>\n<!-- c -->\n<svg xmlns="http://www.w3.org/2000/svg" width="10.000" height="10.000" viewBox="0 0 10 10"><metadata>x</metadata><g><g><path d="M 1.000000,1.000000 L 9.000000,9.000000" stroke="#000000"/></g></g></svg>';
    return optimize(src, { precision: '3' }).then(function (r) {
      if (!(bytes(r) < bytes(src) * 0.7) || !/<path/.test(r) || /<!--|metadata|<g>/.test(r) || !/viewBox="0 0 10 10"/.test(r)) f.push('optimise → ' + r);
      return optimize(src, { precision: '3', dims: true });
    }).then(function (r) {
      if (/width=/.test(r) || !/viewBox/.test(r)) f.push('remove dimensions → ' + r);
      return optimize('<svg><path d="M0 0"', { precision: '3' }).then(function () { f.push('broken SVG accepted'); }, function (e) { if (!/not valid SVG/.test(e.message)) f.push('error ' + e.message); });
    }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
