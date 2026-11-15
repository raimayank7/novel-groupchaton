/* YAML ↔ JSON Converter — both directions, with clear errors (line and column) for broken YAML.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('yaml-json', function (spot, T) {
  var mode = T.seg([['y2j', 'YAML → JSON'], ['j2y', 'JSON → YAML']], 'y2j');
  mode.setAttribute('data-opt', 'mode');
  T.transformer(spot, { id: 'yaml-json', inLabel: 'YAML or JSON', mono: true, rows: 12, download: false,
    sample: 'site: Infinity\nfree: true\ntools:\n  - name: Merge PDF\n    category: pdf\n  - name: JSON Formatter\n    category: developer\n',
    options: [mode],
    run: function (t, o) {
      return T.lib('yaml').then(function (Y) {
        if (o.mode === 'j2y') {
          var v;
          try { v = JSON.parse(t); } catch (e) { throw new Error('Not valid JSON: ' + e.message); }
          return Y.dump(v, { lineWidth: 120, noRefs: true });
        }
        try { return JSON.stringify(Y.load(t), null, 2); }
        catch (e) { throw new Error('YAML problem: ' + (e.reason || e.message) + (e.mark ? ' (line ' + (e.mark.line + 1) + ', column ' + (e.mark.column + 1) + ')' : '')); }
      });
    } });
});
