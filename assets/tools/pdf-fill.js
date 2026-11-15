/* Infinity by GroupChatOn — pdf-fill. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Fill in PDF forms: every text box, tick box, list and option in the PDF appears as a field here; save filled or flattened (pdf-lib). */
GCOTools.register('pdf-fill', function (spot, T) {
  var h = T.h, status = T.status(), results = T.results(), file = null, bytes = null, inputs = [];
  // the form's fields as plain objects: { name, kind: text|check|choice|radio|list, value, options, multiline, readOnly }
  function fieldsOf(L, doc) {
    return doc.getForm().getFields().map(function (fl) {
      var o = { name: fl.getName(), readOnly: fl.isReadOnly() };
      if (fl instanceof L.PDFTextField) { o.kind = 'text'; o.value = fl.getText() || ''; o.multiline = fl.isMultiline(); }
      else if (fl instanceof L.PDFCheckBox) { o.kind = 'check'; o.value = fl.isChecked(); }
      else if (fl instanceof L.PDFDropdown) { o.kind = 'choice'; o.options = fl.getOptions(); o.value = fl.getSelected()[0] || ''; }
      else if (fl instanceof L.PDFRadioGroup) { o.kind = 'radio'; o.options = fl.getOptions(); o.value = fl.getSelected() || ''; }
      else if (fl instanceof L.PDFOptionList) { o.kind = 'list'; o.options = fl.getOptions(); o.value = fl.getSelected()[0] || ''; }
      else return null;   // buttons and signature boxes cannot be typed into
      return o;
    }).filter(Boolean);
  }
  // values: { fieldName: string | boolean }. Letters the standard PDF font cannot draw (Hindi, Arabic…) are kept, and PDF readers draw them.
  function fill(src, values, flatten) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.load(src).then(function (doc) {
        var form = doc.getForm();
        form.getFields().forEach(function (fl) {
          var n = fl.getName(); if (!(n in values) || fl.isReadOnly()) return;
          var v = values[n];
          if (fl instanceof L.PDFTextField) fl.setText(v ? String(v) : undefined);
          else if (fl instanceof L.PDFCheckBox) { if (v) fl.check(); else fl.uncheck(); }
          else if (fl instanceof L.PDFRadioGroup || fl instanceof L.PDFDropdown || fl instanceof L.PDFOptionList) { if (v) fl.select(String(v)); else fl.clear(); }
        });
        try { if (flatten) form.flatten(); else form.updateFieldAppearances(); return doc.save(); }
        catch (e) {
          if (!/encode|WinAnsi/i.test(e.message)) throw e;
          if (flatten) throw new Error('Some letters you typed (like Hindi or emoji) cannot be flattened here. Untick “Lock the answers” and save again.');
          form.acroForm.dict.set(L.PDFName.of('NeedAppearances'), L.PDFBool.True);
          return doc.save({ updateFieldAppearances: false });
        }
      });
    });
  }
  var box = h('div', { 'class': 'tgrid2' }), flat = h('input', { type: 'checkbox' });
  var go = T.button('Save filled PDF', { primary: true, disabled: true, onclick: run });
  var info = h('p', { 'class': 'tstatus' });
  function pretty(n) { return String(n).replace(/[._\[\]]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim().replace(/^./, function (c) { return c.toUpperCase(); }); }
  function draw(list) {
    box.innerHTML = ''; inputs = [];
    list.forEach(function (o) {
      var el;
      if (o.kind === 'text') { el = h(o.multiline ? 'textarea' : 'input', o.multiline ? { rows: '3' } : { type: 'text' }); el.value = o.value; }
      else if (o.kind === 'check') { el = h('input', { type: 'checkbox', checked: o.value ? true : null }); }
      else { el = T.select([['', '— choose —']].concat(o.options.map(function (x) { return [x, x]; })), o.value); }
      if (o.readOnly) el.disabled = true;
      inputs.push({ name: o.name, el: el, kind: o.kind });
      box.appendChild(o.kind === 'check' ? h('label', { 'class': 'tcheck' }, [el, ' ' + pretty(o.name)]) : T.field(pretty(o.name) + (o.readOnly ? ' (locked)' : ''), el));
    });
  }
  function take(files) {
    file = files[0]; results.clear(); box.innerHTML = ''; go.disabled = true; status.info('Reading the form…');
    return T.read(file).then(function (b) { bytes = b; return T.lib('pdflib'); }).then(function (L) {
      return L.PDFDocument.load(bytes).then(function (doc) {
        if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password first.');
        var list = fieldsOf(L, doc);
        info.textContent = file.name + ' · ' + doc.getPageCount() + ' pages · ' + list.length + ' fields';
        if (!list.length) throw new Error('This PDF has no boxes to fill in. It may be a scan or a flat PDF: use the Sign PDF tool’s Type option to add text, or make a fillable form with our Fillable Form Maker.');
        draw(list); go.disabled = false; status.info('Fill in the boxes below, then save.');
      });
    }).catch(status.error);
  }
  function run() {
    if (!bytes) return;
    var values = {}; inputs.forEach(function (x) { values[x.name] = x.kind === 'check' ? x.el.checked : x.el.value; });
    go.disabled = true; status.progress(0.4, 'Saving your answers…');
    fill(bytes, values, flat.checked).then(function (out) {
      results.set([{ name: T.baseName(file.name) + '-filled.pdf', blob: new Blob([out], { type: 'application/pdf' }) }]);
      status.ok('Done! ' + (flat.checked ? 'Your answers are now part of the page and cannot be changed.' : 'The boxes can still be edited in any PDF reader.'));
    }).catch(status.error).then(function () { go.disabled = false; });
  }
  function sampleForm(L) {
    return L.PDFDocument.create().then(function (d) {
      return d.embedFont(L.StandardFonts.Helvetica).then(function (f) {
        var p = d.addPage([595.28, 841.89]), form = d.getForm();
        p.drawText('Membership form (sample)', { x: 60, y: 770, size: 22, font: f });
        [['Full name', 700], ['Email', 650], ['City', 600], ['Plan', 550], ['Notes', 470]].forEach(function (x) { p.drawText(x[0], { x: 60, y: x[1] + 6, size: 12, font: f }); });
        form.createTextField('full_name').addToPage(p, { x: 160, y: 695, width: 300, height: 22 });
        form.createTextField('email').addToPage(p, { x: 160, y: 645, width: 300, height: 22 });
        var city = form.createDropdown('city'); city.addOptions(['Delhi', 'Mumbai', 'Ludhiana', 'London']); city.addToPage(p, { x: 160, y: 595, width: 200, height: 22 });
        var plan = form.createRadioGroup('plan'); plan.addOptionToPage('Basic', p, { x: 160, y: 548, width: 16, height: 16 }); plan.addOptionToPage('Pro', p, { x: 260, y: 548, width: 16, height: 16 });
        p.drawText('Basic', { x: 182, y: 552, size: 11, font: f }); p.drawText('Pro', { x: 282, y: 552, size: 11, font: f });
        var notes = form.createTextField('notes'); notes.enableMultiline(); notes.addToPage(p, { x: 160, y: 420, width: 300, height: 70 });
        form.createCheckBox('agree_to_terms').addToPage(p, { x: 60, y: 380, width: 16, height: 16 }); p.drawText('I agree to the terms', { x: 84, y: 384, size: 11, font: f });
        return d.save();
      });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: 'application/pdf,.pdf', icon: '📝', label: 'Choose a PDF form', hint: 'or drag and drop it here · nothing is uploaded', onFiles: take }), info,
    box, h('label', { 'class': 'tcheck' }, [flat, ' Lock the answers (flatten, so they cannot be changed)']),
    T.row([go, T.button('Try a sample', { small: true, onclick: function () {
      T.lib('pdflib').then(sampleForm).then(function (b) { return take([new File([b], 'sample-form.pdf', { type: 'application/pdf' })]); }).then(function () {
        var v = { full_name: 'Asha Verma', email: 'asha@example.com', city: 'Ludhiana', plan: 'Pro', agree_to_terms: true };
        inputs.forEach(function (x) { if (x.name in v) { if (x.kind === 'check') x.el.checked = v[x.name]; else x.el.value = v[x.name]; } });
        run();
      });
    } })]), status.el, results.el]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  results.el.style.gridTemplateColumns = 'minmax(0, 1fr)'; var setR = results.set; results.set = function (l, z) { setR(l, z); Array.prototype.forEach.call(results.el.querySelectorAll('.tresults-grid'), function (g) { g.style.gridTemplateColumns = 'minmax(0, 1fr)'; }); };   // long file names must not push the card wider than a phone
  T.tests['pdf-fill'] = function () {
    var f = [];
    return T.lib('pdflib').then(function (L) {
      return sampleForm(L).then(function (src) {
        return L.PDFDocument.load(src).then(function (d) {
          var list = fieldsOf(L, d), kinds = list.map(function (x) { return x.kind; }).join(',');
          if (kinds !== 'text,text,choice,radio,text,check') f.push('fields ' + kinds);
          return fill(src, { full_name: 'Asha Verma', city: 'Delhi', plan: 'Pro', notes: 'नमस्ते', agree_to_terms: true }, false);
        }).then(function (out) { return L.PDFDocument.load(out); }).then(function (d) {
          var m = {}; fieldsOf(L, d).forEach(function (x) { m[x.name] = x.value; });
          if (m.full_name !== 'Asha Verma' || m.city !== 'Delhi' || m.plan !== 'Pro' || m.agree_to_terms !== true || m.notes !== 'नमस्ते') f.push('saved values ' + JSON.stringify(m));
          return fill(src, { full_name: 'Ravi' }, true);
        }).then(function (out) { return L.PDFDocument.load(out); }).then(function (d) { if (d.getForm().getFields().length) f.push('flatten left fields'); });
      });
    }).catch(function (e) { f.push('threw ' + e.message); }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
