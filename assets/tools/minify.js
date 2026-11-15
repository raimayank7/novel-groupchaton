/* Code Minifier — JavaScript (with Terser, the minifier most websites use), CSS and HTML; shows how much smaller it got.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('minify', function (spot, T) {
  function css(s) {
    return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>+~])\s*/g, '$1').replace(/;}/g, '}').replace(/(^|[^\d])0(px|em|rem|%)/g, '$10').trim();
  }
  function html(s) {
    var keep = [];
    s = s.replace(/<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi, function (m) { keep.push(m); return '\u0000' + (keep.length - 1) + '\u0000'; });
    s = s.replace(/<!--(?!\[if)[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) {
      var block = keep[+i];
      return /^<style/i.test(block) ? block.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/i, function (x, a, b, c) { return a + css(b) + c; }) : block;
    });
  }
  var lang = T.seg([['js', 'JavaScript'], ['css', 'CSS'], ['html', 'HTML']], 'js');
  lang.setAttribute('data-opt', 'lang');
  T.transformer(spot, { id: 'minify', inLabel: 'Code', outLabel: 'Minified code', mono: true, rows: 11, live: false, button: 'Minify',
    sample: '// add two numbers\nfunction addNumbers(first, second) {\n  const total = first + second;\n  return total;\n}\nconsole.log(addNumbers(2, 3));',
    options: [lang],
    run: function (t, o) {
      if (o.lang === 'css') return css(t);
      if (o.lang === 'html') return html(t);
      return T.lib('terser').then(function (Terser) { return Terser.minify(t, { compress: true, mangle: true }); })
        .then(function (r) { if (!r || r.code == null) throw new Error('Could not minify this code.'); return r.code; })
        .catch(function (e) { throw new Error(e && e.message && /Unexpected|line/i.test(e.message) ? 'JavaScript error: ' + e.message + (e.line ? ' (line ' + e.line + ')' : '') : (e.message || String(e))); });
    },
    note: function (a, b) { var x = new Blob([a]).size, y = new Blob([b]).size; return T.bytes(x) + ' → ' + T.bytes(y) + ' (' + Math.round((1 - y / Math.max(x, 1)) * 100) + '% smaller)'; } });
});
