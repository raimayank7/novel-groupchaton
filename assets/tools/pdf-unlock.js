/* Infinity by GroupChatOn — pdf-unlock. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Remove a PDF password you know: opens the file with your password and saves an unlocked copy (qpdf compiled to WebAssembly). */
GCOTools.register('pdf-unlock', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, bytes = null;
  var QJS = 'https://cdn.jsdelivr.net/npm/@jspawn/qpdf-wasm@0.0.2/qpdf.js', QWASM = 'https://cdn.jsdelivr.net/npm/@jspawn/qpdf-wasm@0.0.2/qpdf.wasm';
  function qpdf(args, input) {   // runs the qpdf command line on /in.pdf → /out.pdf; a fresh copy each time
    return T.loadScript(QJS).then(function () {
      if (!T.__qpdf) T.__qpdf = window.Module;   // qpdf.js names its loader "Module"
      return T.__qpdf({ locateFile: function () { return QWASM; }, print: function () {}, printErr: function () {} });
    }).then(function (m) {
      m.FS.writeFile('/in.pdf', new Uint8Array(input));
      var rc; try { rc = m.callMain(args); } catch (e) { rc = e && e.status != null ? e.status : 1; }
      var out = null; try { out = m.FS.readFile('/out.pdf'); } catch (e) {}
      return { rc: rc, out: (rc === 0 || rc === 3) ? out : null };
    });
  }
  function isLocked(b) { return T.lib('pdflib').then(function (L) { return L.PDFDocument.load(b, { ignoreEncryption: true }); }).then(function (d) { return d.isEncrypted; }); }
  function unlock(b, pw) {
    return qpdf(['--password=' + (pw || ''), '--decrypt', '/in.pdf', '/out.pdf'], b).then(function (r) {
      if (!r.out) throw new Error(pw ? 'That password is not right. Check capital letters and try again.' : 'This PDF needs its password to open. Type it above.');
      return r.out;
    });
  }
  var pw = h('input', { type: 'password', autocomplete: 'off', placeholder: 'The password you use to open it' }), show = h('input', { type: 'checkbox' });
  show.addEventListener('change', function () { pw.type = show.checked ? 'text' : 'password'; });
  var pwBox = h('div', { 'class': 'tgrid2', hidden: true }, [T.field('PDF password', pw), h('label', { 'class': 'tcheck' }, [show, ' Show password'])]);
  var go = T.button('Remove password', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  pw.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
  function take(files) {
    file = files[0]; bytes = null; results.clear(); pwBox.hidden = true; go.disabled = true; status.info('Checking ' + file.name + '…'); info.textContent = file.name + ' · ' + T.bytes(file.size);
    return T.read(file).then(function (b) { bytes = b; return isLocked(b); }).then(function (locked) {
      if (!locked) { status.ok('Good news: this PDF has no password or restrictions. You can use it as it is.'); return; }
      go.disabled = false; pwBox.hidden = false;
      return qpdf(['--decrypt', '/in.pdf', '/out.pdf'], bytes).then(function (r) {   // only print / copy limits, no open password?
        if (r.out) { pwBox.hidden = true; status.info('This PDF opens without a password but blocks printing or copying. Press Remove password to lift those limits.'); }
        else status.info('Type the password, then press Remove password.');
      });
    }).catch(status.error);
  }
  function run() {
    if (!bytes) return;
    go.disabled = true; status.progress(0.4, 'Unlocking…');
    unlock(bytes, pw.value).then(function (out) {
      results.set([{ name: T.baseName(file.name) + '-unlocked.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      status.ok('Unlocked! This copy opens without a password. Keep it safe.');
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function sample(user, owner) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.create().then(function (d) {
        return d.embedFont(L.StandardFonts.Helvetica).then(function (f) { d.addPage([595.28, 841.89]).drawText('Bank statement (sample). Password: 1234', { x: 60, y: 760, size: 18, font: f }); return d.save(); });
      });
    }).then(function (b) { return qpdf(['--encrypt', user, owner, '256', '--', '/in.pdf', '/out.pdf'], b); }).then(function (r) { return r.out; });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🔓', label: 'Choose a locked PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info, pwBox,
    T.row([go, T.button('Try a sample', { small: true, onclick: function () {
      sample('1234', 'owner-1234').then(function (b) { return take([new File([b], 'sample-statement-locked.pdf', { type: 'application/pdf' })]); }).then(function () { pw.value = '1234'; run(); });
    } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-unlock'] = function () {
    var f = [];
    return sample('abc', 'xyz').then(function (locked) {
      return isLocked(locked).then(function (l) { if (!l) f.push('sample not locked'); })
        .then(function () { return unlock(locked, 'wrong').then(function () { f.push('wrong password accepted'); }, function () {}); })
        .then(function () { return unlock(locked, 'abc'); }).then(function (out) { return isLocked(out); }).then(function (l) { if (l) f.push('still locked'); });
    }).then(function () { return sample('', 'only-owner'); }).then(function (limited) { return unlock(limited, ''); }).then(function (out) { return isLocked(out); }).then(function (l) { if (l) f.push('restrictions not removed'); })
      .catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
