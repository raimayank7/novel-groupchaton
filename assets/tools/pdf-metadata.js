/* Infinity by GroupChatOn — pdf-metadata. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* See and edit a PDF's title, author, subject, keywords and dates, or wipe them all for privacy (pdf-lib). */
GCOTools.register('pdf-metadata', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, bytes = null;
  var KEYS = ['Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer', 'CreationDate', 'ModDate', 'Trapped'];
  function read(doc) {
    return { title: doc.getTitle() || '', author: doc.getAuthor() || '', subject: doc.getSubject() || '', keywords: doc.getKeywords() || '', creator: doc.getCreator() || '', producer: doc.getProducer() || '',
      created: doc.getCreationDate() || null, modified: doc.getModificationDate() || null };
  }
  // m: the fields to save, or null to remove everything (the info dictionary and the XMP copy)
  function write(src, m) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.load(src, { updateMetadata: false }).then(function (doc) {
        if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        var info = doc.getInfoDict();
        doc.catalog.delete(L.PDFName.of('Metadata'));   // the XMP copy would otherwise show the old values in some readers
        if (!m) { KEYS.forEach(function (k) { info.delete(L.PDFName.of(k)); }); return doc.save({ updateMetadata: false }); }
        [['Title', m.title, 'setTitle'], ['Author', m.author, 'setAuthor'], ['Subject', m.subject, 'setSubject'], ['Creator', m.creator, 'setCreator'], ['Producer', m.producer, 'setProducer']].forEach(function (x) {
          if (x[1]) doc[x[2]](x[1]); else info.delete(L.PDFName.of(x[0]));
        });
        var kw = String(m.keywords || '').split(/[,;]+/).map(function (s) { return s.trim(); }).filter(Boolean);
        if (kw.length) doc.setKeywords(kw); else info.delete(L.PDFName.of('Keywords'));
        if (m.created) doc.setCreationDate(m.created); else info.delete(L.PDFName.of('CreationDate'));
        if (m.modified) doc.setModificationDate(m.modified); else info.delete(L.PDFName.of('ModDate'));
        return doc.save({ updateMetadata: false });
      });
    });
  }
  function local(d) { if (!d || isNaN(d)) return ''; var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16); }
  var F = {}; ['title', 'author', 'subject', 'keywords', 'creator', 'producer'].forEach(function (k) { F[k] = h('input', { type: 'text' }); });
  F.created = h('input', { type: 'datetime-local' }); F.modified = h('input', { type: 'datetime-local' });
  var facts = h('div', { 'class': 'tstats', hidden: true }), form = h('div', { 'class': 'tgrid2', hidden: true }, [T.field('Title', F.title), T.field('Author', F.author), T.field('Subject', F.subject),
    T.field('Keywords', F.keywords, 'Separate with commas'), T.field('Made with (Creator)', F.creator), T.field('PDF maker (Producer)', F.producer), T.field('Created', F.created), T.field('Last changed', F.modified)]);
  var save = T.button('Save changes', { primary: true, disabled: true, onclick: function () { run(false); } });
  var wipe = T.button('Remove all info', { disabled: true, onclick: function () { run(true); } });
  function take(files) {
    file = files[0]; results.clear(); status.info('Reading ' + file.name + '…');
    return T.read(file).then(function (b) { bytes = b; return T.lib('pdflib'); }).then(function (L) {
      return L.PDFDocument.load(bytes, { updateMetadata: false }).then(function (doc) {
        if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        var m = read(doc), head = new TextDecoder().decode(new Uint8Array(bytes, 0, 12)), ver = (head.match(/%PDF-(\d\.\d)/) || [])[1], p = doc.getPage(0).getSize();
        Object.keys(F).forEach(function (k) { F[k].value = k === 'created' || k === 'modified' ? local(m[k]) : m[k]; });
        facts.innerHTML = '';
        [[doc.getPageCount(), 'pages'], [T.bytes(file.size), 'file size'], [ver ? 'PDF ' + ver : 'PDF', 'version'], [Math.round(p.width / 72 * 25.4) + ' × ' + Math.round(p.height / 72 * 25.4) + ' mm', 'page 1 size'],
          [doc.catalog.get(L.PDFName.of('Metadata')) ? 'Yes' : 'No', 'XMP metadata']].forEach(function (x) { facts.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: String(x[0]) }), h('span', { text: x[1] })])); });
        facts.hidden = form.hidden = false; save.disabled = wipe.disabled = false;
        var filled = ['title', 'author', 'subject', 'keywords', 'creator', 'producer'].filter(function (k) { return m[k]; }).length;
        status.info(filled ? 'This PDF carries ' + filled + ' details about itself. Edit them, or remove them all before sharing.' : 'This PDF carries no title or author details.');
      });
    }).catch(status.error);
  }
  function run(clear) {
    if (!bytes) return;
    var m = clear ? null : { title: F.title.value.trim(), author: F.author.value.trim(), subject: F.subject.value.trim(), keywords: F.keywords.value, creator: F.creator.value.trim(), producer: F.producer.value.trim(),
      created: F.created.value ? new Date(F.created.value) : null, modified: F.modified.value ? new Date(F.modified.value) : null };
    write(bytes, m).then(function (out) {
      results.set([{ name: T.baseName(file.name) + (clear ? '-clean' : '-edited') + '.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      if (clear) Object.keys(F).forEach(function (k) { F[k].value = ''; });
      status.ok(clear ? 'All document details removed. The pages are unchanged.' : 'Saved! Download the PDF with its new details.');
    }).catch(status.error);
  }
  function samplePdf(L) {
    return L.PDFDocument.create().then(function (d) {
      return d.embedFont(L.StandardFonts.Helvetica).then(function (f) {
        d.addPage([595.28, 841.89]).drawText('Project proposal (sample)', { x: 60, y: 760, size: 22, font: f });
        d.setTitle('Draft proposal v3 FINAL'); d.setAuthor('R. Sharma (old laptop)'); d.setSubject('Internal'); d.setKeywords(['draft', 'confidential']); d.setCreator('Word processor'); d.setCreationDate(new Date(2025, 0, 15, 9, 30));
        return d.save();
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '🏷️', label: 'Choose a PDF', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), facts, form,
    T.row([save, wipe, T.button('Try a sample', { small: true, onclick: function () {
      T.lib('pdflib').then(samplePdf).then(function (b) { return take([new File([b], 'sample-proposal.pdf', { type: 'application/pdf' })]); }).then(function () { F.title.value = 'Project proposal'; F.author.value = 'Asha Verma'; run(false); });
    } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-metadata'] = function () {
    var f = [];
    return T.lib('pdflib').then(function (L) {
      return samplePdf(L).then(function (src) {
        return write(src, { title: 'New title', author: 'Asha', subject: '', keywords: 'tax, 2026', creator: '', producer: 'Me', created: new Date(2026, 1, 3), modified: null })
          .then(function (out) { return L.PDFDocument.load(out, { updateMetadata: false }); }).then(function (d) {
            var m = read(d);
            if (m.title !== 'New title' || m.author !== 'Asha' || m.subject !== '' || !/tax/.test(m.keywords) || m.producer !== 'Me' || !m.created || m.created.getFullYear() !== 2026 || m.modified) f.push('edit ' + JSON.stringify(m));
            return write(src, null);
          }).then(function (out) { return L.PDFDocument.load(out, { updateMetadata: false }); }).then(function (d) {
            var m = read(d);
            if (m.title || m.author || m.keywords || m.creator || m.producer || m.created) f.push('wipe left ' + JSON.stringify(m));
            if (d.catalog.get(L.PDFName.of('Metadata'))) f.push('XMP left');
          });
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 3, fails: f }; });
  };
});
