/* URL Encode / Decode — percent-encoding for query values or whole addresses; also splits a link's query into parts.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('url-encode', function (spot, T) {
  var mode = T.seg([['enc', 'Encode'], ['dec', 'Decode'], ['parts', 'Split a link']], 'enc');
  mode.setAttribute('data-opt', 'mode');
  T.transformer(spot, { id: 'url-encode', inLabel: 'Text or link', mono: true, rows: 6, sample: 'https://example.com/search?q=free pdf tools&lang=hi&city=New Delhi',
    options: [mode, T.opt.check('full', 'Whole address (keep : / ? & =)')],
    run: function (t, o) {
      if (o.mode === 'enc') return o.full ? encodeURI(t) : encodeURIComponent(t);
      if (o.mode === 'dec') {
        try { return decodeURIComponent(t.replace(/\+/g, ' ')); } catch (e) { throw new Error('Part of this text is not valid percent-encoding (a % must be followed by two hex digits).'); }
      }
      var u;
      try { u = new URL(t.trim()); } catch (e) { throw new Error('Paste a complete link, starting with https://'); }
      var lines = ['Protocol: ' + u.protocol.replace(':', ''), 'Host: ' + u.host, 'Path: ' + decodeURIComponent(u.pathname)];
      if (u.hash) lines.push('Fragment: ' + decodeURIComponent(u.hash.slice(1)));
      var params = Array.from(u.searchParams.entries());
      if (params.length) { lines.push('', 'Query parameters:'); params.forEach(function (p) { lines.push('  ' + p[0] + ' = ' + p[1]); }); }
      return lines.join('\n');
    } });
});
