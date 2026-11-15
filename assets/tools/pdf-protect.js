/* Infinity by GroupChatOn — pdf-protect. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Password-protect a PDF with AES-256, and choose whether people may print, copy or edit it (qpdf compiled to WebAssembly). */
GCOTools.register('pdf-protect', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null;
  var QJS = 'https://cdn.jsdelivr.net/npm/@jspawn/qpdf-wasm@0.0.2/qpdf.js', QWASM = 'https://cdn.jsdelivr.net/npm/@jspawn/qpdf-wasm@0.0.2/qpdf.wasm';
  function qpdf(args, input) {
    return T.loadScript(QJS).then(function () {
      if (!T.__qpdf) T.__qpdf = window.Module;
      return T.__qpdf({ locateFile: function () { return QWASM; }, print: function () {}, printErr: function () {} });
    }).then(function (m) {
      m.FS.writeFile('/in.pdf', new Uint8Array(input));
      var rc; try { rc = m.callMain(args); } catch (e) { rc = e && e.status != null ? e.status : 1; }
      var out = null; try { out = m.FS.readFile('/out.pdf'); } catch (e) {}
      return { rc: rc, out: (rc === 0 || rc === 3) ? out : null };
    });
  }
  function ownerKey() { var a = new Uint8Array(18); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  // o: { password, print, copy, edit }
  function protect(b, o) {
    var args = ['--encrypt', o.password, ownerKey(), '256', '--print=' + (o.print ? 'full' : 'none'), '--modify=' + (o.edit ? 'all' : 'none'), '--extract=' + (o.copy ? 'y' : 'n'), '--', '/in.pdf', '/out.pdf'];
    return qpdf(args, b).then(function (r) { if (!r.out) throw new Error('This PDF could not be locked. If it already has a password, remove it first.'); return r.out; });
  }
  var pw = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'At least 4 characters' }), pw2 = h('input', { type: 'password', autocomplete: 'new-password' }), show = h('input', { type: 'checkbox' });
  show.addEventListener('change', function () { pw.type = pw2.type = show.checked ? 'text' : 'password'; });
  var cPrint = h('input', { type: 'checkbox', checked: true }), cCopy = h('input', { type: 'checkbox', checked: true }), cEdit = h('input', { type: 'checkbox' });
  var go = T.button('Protect PDF', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function take(files) { file = files[0]; results.clear(); status.clear(); go.disabled = false; info.textContent = file.name + ' · ' + T.bytes(file.size); }
  function run() {
    if (!file) return;
    if (pw.value.length < 4) return status.error('Use a password of at least 4 characters (longer is safer).');
    if (pw.value !== pw2.value) return status.error('The two passwords are different. Type them again.');
    go.disabled = true; status.progress(0.4, 'Locking with AES-256…');
    T.read(file).then(function (b) { return protect(b, { password: pw.value, print: cPrint.checked, copy: cCopy.checked, edit: cEdit.checked }); }).then(function (out) {
      results.set([{ name: T.baseName(file.name) + '-protected.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      status.ok('Locked! Anyone opening this PDF now needs the password. If you forget it, it cannot be recovered.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function samplePdf() {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.create().then(function (d) {
        return d.embedFont(L.StandardFonts.Helvetica).then(function (f) { d.addPage([595.28, 841.89]).drawText('Salary slip (sample)', { x: 60, y: 760, size: 22, font: f }); return d.save(); });
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🔐', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    h('div', { 'class': 'tgrid2' }, [T.field('Password', pw), T.field('Type it again', pw2), h('label', { 'class': 'tcheck' }, [show, ' Show passwords'])]),
    T.field('People who open it may…', h('div', { 'class': 'tchecks' }, [h('label', { 'class': 'tcheck' }, [cPrint, ' Print']), h('label', { 'class': 'tcheck' }, [cCopy, ' Copy text']), h('label', { 'class': 'tcheck' }, [cEdit, ' Edit and fill in'])])),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () {
      samplePdf().then(function (b) { take([new File([b], 'sample-salary-slip.pdf', { type: 'application/pdf' })]); pw.value = pw2.value = 'demo1234'; run(); });
    } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-protect'] = function () {
    var f = [];
    return samplePdf().then(function (src) { return protect(src, { password: 'pass123', print: true, copy: false, edit: false }); }).then(function (out) {
      return T.lib('pdflib').then(function (L) { return L.PDFDocument.load(out, { ignoreEncryption: true }); }).then(function (d) { if (!d.isEncrypted) f.push('not encrypted'); })
        .then(function () { return T.lib('pdfjs'); }).then(function (P) { return P.getDocument({ data: out.slice(0) }).promise.then(function () { f.push('opened without password'); }, function () {}); })
        .then(function () { return qpdf(['--password=pass123', '--decrypt', '/in.pdf', '/out.pdf'], out); }).then(function (r) { if (!r.out) f.push('right password refused'); })
        .then(function () { return qpdf(['--password=nope', '--decrypt', '/in.pdf', '/out.pdf'], out); }).then(function (r) { if (r.out) f.push('wrong password accepted'); });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
