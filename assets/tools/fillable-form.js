/* Infinity by GroupChatOn — fillable-form. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Build a form, then download it as a fillable PDF (real form fields), fill it here, or copy it as HTML. */
GCOTools.register('fillable-form', function (spot, T) {
  var h = T.h;
  var TYPES = [['text', 'Short answer'], ['area', 'Long answer'], ['number', 'Number'], ['date', 'Date'], ['email', 'Email'], ['phone', 'Phone'],
    ['select', 'Drop-down'], ['radio', 'Choose one'], ['check', 'Tick boxes'], ['yesno', 'Yes / No'], ['sign', 'Signature line'], ['head', 'Section heading']];
  var TPL = {
    blank: ['Blank form', 'My Form', '', [['Full name', 'text', '', 1]]],
    admission: ['School admission form', 'Admission Form', 'Please fill in capital letters.', [['Student details', 'head'], ['Student’s full name', 'text', '', 1], ['Date of birth', 'date', '', 1], ['Gender', 'radio', 'Male, Female, Other'],
      ['Class applying for', 'select', 'Nursery, KG, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12', 1], ['Previous school', 'text'], ['Parent / guardian', 'head'], ['Father’s name', 'text', '', 1], ['Mother’s name', 'text', '', 1],
      ['Mobile number', 'phone', '', 1], ['Email', 'email'], ['Address', 'area', '', 1], ['Documents attached', 'check', 'Birth certificate, Aadhaar / ID card, Transfer certificate, Photographs'], ['Signature of parent', 'sign']]],
    job: ['Job application form', 'Job Application Form', '', [['Full name', 'text', '', 1], ['Position applied for', 'text', '', 1], ['Mobile', 'phone', '', 1], ['Email', 'email', '', 1], ['Date of birth', 'date'],
      ['Highest qualification', 'select', 'Below 10th, 10th, 12th, Diploma, Graduate, Post-graduate, Doctorate'], ['Years of experience', 'number'], ['Current / last employer', 'text'],
      ['Expected salary', 'text'], ['Can join in', 'radio', 'Immediately, 15 days, 30 days, 60+ days'], ['Skills', 'area'], ['I confirm the details are true', 'yesno'], ['Signature', 'sign']]],
    event: ['Event registration', 'Event Registration', '', [['Name', 'text', '', 1], ['Mobile', 'phone', '', 1], ['Email', 'email'], ['Number of people', 'number', '', 1],
      ['Ticket type', 'radio', 'Regular, VIP, Student'], ['Meal preference', 'select', 'Vegetarian, Non-vegetarian, Vegan, Jain'], ['How did you hear about us?', 'check', 'Friends, WhatsApp, Instagram, Facebook, Poster'], ['Any special needs?', 'area']]],
    feedback: ['Customer feedback', 'Customer Feedback', 'Thank you for taking a minute to help us improve.', [['Name (optional)', 'text'], ['Date of visit', 'date'],
      ['Overall rating', 'radio', 'Excellent, Good, Average, Poor'], ['What did you like?', 'check', 'Quality, Price, Service, Speed, Cleanliness'], ['Would you recommend us?', 'yesno'], ['Suggestions', 'area']]],
    leave: ['Leave request form', 'Leave Request Form', '', [['Employee name', 'text', '', 1], ['Employee ID', 'text'], ['Department', 'text'], ['Leave type', 'radio', 'Casual, Sick, Earned, Unpaid'],
      ['From date', 'date', '', 1], ['To date', 'date', '', 1], ['Reason', 'area', '', 1], ['Signature of employee', 'sign'], ['For office use', 'head'], ['Approved', 'yesno'], ['Signature of manager', 'sign']]],
    patient: ['Patient registration', 'Patient Registration Form', 'All information is kept confidential.', [['Patient name', 'text', '', 1], ['Age', 'number', '', 1], ['Sex', 'radio', 'Male, Female, Other'], ['Mobile', 'phone', '', 1],
      ['Address', 'area'], ['Known allergies', 'area'], ['Existing conditions', 'check', 'Diabetes, Blood pressure, Asthma, Heart disease, Thyroid, None'], ['Emergency contact', 'text'], ['Signature', 'sign']]],
    member: ['Membership form', 'Membership Form', '', [['Full name', 'text', '', 1], ['Mobile', 'phone', '', 1], ['Email', 'email'], ['Address', 'area'], ['Membership plan', 'select', 'Monthly, Quarterly, Half-yearly, Yearly', 1],
      ['Start date', 'date'], ['Payment mode', 'radio', 'Cash, UPI, Card, Bank transfer'], ['I agree to the rules', 'yesno'], ['Signature', 'sign']]]
  };
  var st = T.store.get('fillable-form', null) || load('admission');
  function load(k) { var t = TPL[k]; return { title: t[1], intro: t[2], fields: t[3].map(function (f) { return { label: f[0], type: f[1], opts: f[2] || '', req: !!f[3] }; }) }; }
  function keep() { T.store.set('fillable-form', st); }
  function opts(f) { return String(f.opts || '').split(/\s*[,\n]\s*/).filter(Boolean); }
  function slug(s, i) { return (String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field') + '_' + i; }

  var tpl = T.select([['', 'Start from a template…']].concat(Object.keys(TPL).map(function (k) { return [k, TPL[k][0]]; })), '');
  tpl.addEventListener('change', function () { if (!tpl.value) return; if (st.fields.length > 1 && !confirm('Replace your form with this template?')) { tpl.value = ''; return; } st = load(tpl.value); tpl.value = ''; keep(); draw(); });
  var title = h('input', { type: 'text' }), intro = h('input', { type: 'text', placeholder: 'Instructions under the title (optional)' });
  title.addEventListener('input', function () { st.title = title.value; keep(); preview(); });
  intro.addEventListener('input', function () { st.intro = intro.value; keep(); preview(); });
  var list = h('div', { 'class': 'tlist' }), live = h('form', { 'class': 'tform-live', 'data-out': '', onsubmit: function (e) { e.preventDefault(); } });
  var status = T.status();
  function draw() {
    title.value = st.title; intro.value = st.intro || '';
    list.innerHTML = '';
    st.fields.forEach(function (f, i) {
      var lab = h('input', { type: 'text', value: f.label, 'aria-label': 'Question ' + (i + 1) });
      var ty = T.select(TYPES, f.type);
      var op = h('input', { type: 'text', value: f.opts, placeholder: 'Choices, separated by commas' });
      var rq = h('input', { type: 'checkbox', checked: f.req ? true : null });
      var needOpts = function () { return ['select', 'radio', 'check'].indexOf(f.type) >= 0; };
      var opWrap = T.field('Choices', op); opWrap.hidden = !needOpts();
      lab.addEventListener('input', function () { f.label = lab.value; keep(); preview(); });
      ty.addEventListener('change', function () { f.type = ty.value; if (needOpts() && !f.opts) f.opts = 'Option 1, Option 2, Option 3'; keep(); draw(); });
      op.addEventListener('input', function () { f.opts = op.value; keep(); preview(); });
      rq.addEventListener('change', function () { f.req = rq.checked; keep(); preview(); });
      list.appendChild(h('div', { 'class': 'titem', style: 'flex-wrap:wrap;align-items:flex-end' }, [
        h('span', { style: 'flex:2 1 200px' }, [T.field((i + 1) + '. Question', lab)]), h('span', { style: 'flex:1 1 140px' }, [T.field('Type', ty)]),
        h('span', { style: 'flex:2 1 200px', hidden: !needOpts() }, [opWrap]),
        f.type === 'head' || f.type === 'sign' ? null : h('label', { 'class': 'tcheck' }, [rq, ' Required']),
        h('span', {}, [h('button', { type: 'button', title: 'Move up', 'aria-label': 'Move up', text: '↑', disabled: i === 0, onclick: function () { st.fields.splice(i - 1, 0, st.fields.splice(i, 1)[0]); keep(); draw(); } }),
          h('button', { type: 'button', title: 'Move down', 'aria-label': 'Move down', text: '↓', disabled: i === st.fields.length - 1, onclick: function () { st.fields.splice(i + 1, 0, st.fields.splice(i, 1)[0]); keep(); draw(); } }),
          h('button', { type: 'button', title: 'Remove', 'aria-label': 'Remove', text: '✕', onclick: function () { st.fields.splice(i, 1); keep(); draw(); } })])]));
    });
    preview();
  }
  // the form as people will fill it here
  function preview() {
    live.innerHTML = '';
    live.appendChild(h('h3', { text: st.title || 'Form' }));
    if (st.intro) live.appendChild(h('p', { 'class': 'tnote', text: st.intro }));
    st.fields.forEach(function (f, i) {
      var name = slug(f.label, i), lab = f.label + (f.req ? ' *' : ''), el;
      if (f.type === 'head') { live.appendChild(h('h3', { 'class': 'tcalc-h', text: f.label })); return; }
      if (f.type === 'area') el = h('textarea', { name: name, rows: '3', required: f.req || null });
      else if (f.type === 'select') el = h('select', { name: name, required: f.req || null }, [h('option', { value: '', text: 'Choose…' })].concat(opts(f).map(function (o) { return h('option', { text: o }); })));
      else if (f.type === 'radio' || f.type === 'yesno') el = h('div', { 'class': 'trow' }, (f.type === 'yesno' ? ['Yes', 'No'] : opts(f)).map(function (o) { return h('label', { 'class': 'tcheck' }, [h('input', { type: 'radio', name: name, value: o }), ' ' + o]); }));
      else if (f.type === 'check') el = h('div', { 'class': 'trow' }, opts(f).map(function (o) { return h('label', { 'class': 'tcheck' }, [h('input', { type: 'checkbox', name: name, value: o }), ' ' + o]); }));
      else if (f.type === 'sign') el = h('div', { style: 'height:40px;border-bottom:1px solid var(--line)' });
      else el = h('input', { type: f.type === 'phone' ? 'tel' : f.type, name: name, required: f.req || null });
      live.appendChild(T.field(lab, el));
    });
  }
  function values() {
    var v = {};
    st.fields.forEach(function (f, i) {
      var name = slug(f.label, i), els = live.querySelectorAll('[name="' + name + '"]');
      if (!els.length) return;
      if (f.type === 'check') v[name] = [].filter.call(els, function (e) { return e.checked; }).map(function (e) { return e.value; });
      else if (f.type === 'radio' || f.type === 'yesno') v[name] = ([].filter.call(els, function (e) { return e.checked; })[0] || {}).value || '';
      else v[name] = els[0].value;
    });
    return v;
  }
  // a real AcroForm PDF: text boxes, tick boxes, radio groups and drop-downs that work in Adobe Reader, Chrome, Edge, phones
  function makePdf(fill, flatten) {
    return T.lib('pdflib').then(function (L) {
      return L.PDFDocument.create().then(function (pdf) {
        return Promise.all([pdf.embedFont(L.StandardFonts.Helvetica), pdf.embedFont(L.StandardFonts.HelveticaBold)]).then(function (fonts) {
          var font = fonts[0], bold = fonts[1], W = 595.28, H = 841.89, M = 48, page, y, form = pdf.getForm(), v = fill ? values() : {}, ink = L.rgb(0.1, 0.1, 0.12), soft = L.rgb(0.45, 0.45, 0.5);
          // WinAnsi fonts cannot draw every character: keep Latin letters, swap curly quotes
          var clean = function (s) { return String(s || '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?'); };
          function newPage() { page = pdf.addPage([W, H]); y = H - M; }
          function need(hgt) { if (y - hgt < M) newPage(); }
          function wrap(text, size, f, width) {
            var words = clean(text).split(' '), lines = [], line = '';
            words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (f.widthOfTextAtSize(t, size) > width && line) { lines.push(line); line = w; } else line = t; });
            if (line) lines.push(line); return lines;
          }
          newPage();
          wrap(st.title || 'Form', 20, bold, W - 2 * M).forEach(function (l) { page.drawText(l, { x: M, y: y - 20, size: 20, font: bold, color: ink }); y -= 26; });
          if (st.intro) wrap(st.intro, 10.5, font, W - 2 * M).forEach(function (l) { page.drawText(l, { x: M, y: y - 12, size: 10.5, font: font, color: soft }); y -= 15; });
          y -= 10; var count = 0;
          st.fields.forEach(function (f, i) {
            var name = slug(f.label, i), label = clean(f.label + (f.req ? ' *' : ''));
            if (f.type === 'head') { need(34); y -= 10; page.drawText(clean(f.label), { x: M, y: y - 14, size: 13, font: bold, color: ink }); y -= 20; page.drawLine({ start: { x: M, y: y }, end: { x: W - M, y: y }, thickness: 0.6, color: soft }); y -= 8; return; }
            var hgt = f.type === 'area' ? 70 : f.type === 'check' || f.type === 'radio' ? 18 * Math.ceil(opts(f).length / 3) + 18 : f.type === 'sign' ? 44 : 40;
            need(hgt + 16);
            page.drawText(label, { x: M, y: y - 11, size: 10.5, font: bold, color: ink }); y -= 16;
            var bx = { x: M, width: W - 2 * M, font: font, borderColor: L.rgb(0.6, 0.62, 0.68), borderWidth: 0.8, backgroundColor: L.rgb(0.97, 0.97, 0.99) };
            if (f.type === 'sign') { y -= 30; page.drawLine({ start: { x: M, y: y }, end: { x: M + 220, y: y }, thickness: 0.8, color: soft }); page.drawText('Signature', { x: M, y: y - 11, size: 8.5, font: font, color: soft }); y -= 18; return; }
            if (f.type === 'check' || f.type === 'radio' || f.type === 'yesno') {
              var o = f.type === 'yesno' ? ['Yes', 'No'] : opts(f), colW = (W - 2 * M) / 3, rg = f.type === 'check' ? null : form.createRadioGroup(name);
              o.forEach(function (opt, k) {
                var cx = M + (k % 3) * colW, cy = y - 14 - Math.floor(k / 3) * 18;
                if (rg) rg.addOptionToPage(clean(opt), page, { x: cx, y: cy, width: 11, height: 11, borderColor: bx.borderColor, borderWidth: 0.8 });
                else { var cb = form.createCheckBox(name + '_' + k); cb.addToPage(page, { x: cx, y: cy, width: 11, height: 11, borderColor: bx.borderColor, borderWidth: 0.8 }); if (fill && (v[name] || []).indexOf(opt) >= 0) cb.check(); count++; }
                page.drawText(clean(opt), { x: cx + 16, y: cy + 2, size: 10, font: font, color: ink });
              });
              if (rg) { count++; if (fill && v[name]) rg.select(clean(v[name])); }
              y -= 18 * Math.ceil(o.length / 3) + 10; return;
            }
            if (f.type === 'select') {
              var dd = form.createDropdown(name); dd.addOptions(opts(f).map(clean)); dd.addToPage(page, { x: M, y: y - 24, width: 260, height: 22, font: font, borderColor: bx.borderColor, borderWidth: 0.8, backgroundColor: bx.backgroundColor });
              if (fill && v[name]) dd.select(clean(v[name])); count++; y -= 34; return;
            }
            var tf = form.createTextField(name);
            if (f.type === 'area') tf.enableMultiline();
            var hh = f.type === 'area' ? 58 : 22;
            tf.addToPage(page, { x: M, y: y - hh, width: f.type === 'number' || f.type === 'date' ? 200 : W - 2 * M, height: hh, font: font, borderColor: bx.borderColor, borderWidth: 0.8, backgroundColor: bx.backgroundColor });
            if (f.type === 'date') page.drawText('DD / MM / YYYY', { x: M + 210, y: y - 15, size: 8.5, font: font, color: soft });
            if (fill && v[name]) tf.setText(clean(v[name]));
            tf.setFontSize(f.type === 'area' ? 10 : 11);
            count++; y -= hh + 12;
          });
          if (flatten) form.flatten();
          pdf.setTitle(clean(st.title || 'Form')); pdf.setCreator('Infinity by GroupChatOn');
          return pdf.save().then(function (bytes) { return { bytes: bytes, count: count }; });
        });
      });
    });
  }
  function fileName(extra) { return (String(st.title || 'form').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'form') + (extra || '') + '.pdf'; }
  function dl(fill, flatten) {
    status.info('Making your PDF…');
    makePdf(fill, flatten).then(function (r) { T.download(new Blob([r.bytes], { type: 'application/pdf' }), fileName(fill ? '-filled' : '')); status.ok('Downloaded: ' + r.count + ' fillable fields.'); }, function (e) { status.error(e); });
  }
  function htmlCode() {
    var out = ['<form action="#" method="post">', '  <h2>' + (st.title || 'Form').replace(/</g, '&lt;') + '</h2>'];
    if (st.intro) out.push('  <p>' + st.intro.replace(/</g, '&lt;') + '</p>');
    st.fields.forEach(function (f, i) {
      var n = slug(f.label, i), L = f.label.replace(/</g, '&lt;'), r = f.req ? ' required' : '';
      if (f.type === 'head') return out.push('  <h3>' + L + '</h3>');
      if (f.type === 'sign') return out.push('  <p>' + L + ': ____________________</p>');
      if (f.type === 'radio' || f.type === 'check' || f.type === 'yesno') {
        out.push('  <fieldset><legend>' + L + '</legend>');
        (f.type === 'yesno' ? ['Yes', 'No'] : opts(f)).forEach(function (o) { out.push('    <label><input type="' + (f.type === 'check' ? 'checkbox' : 'radio') + '" name="' + n + '" value="' + o.replace(/"/g, '&quot;') + '"> ' + o.replace(/</g, '&lt;') + '</label>'); });
        return out.push('  </fieldset>');
      }
      out.push('  <label for="' + n + '">' + L + '</label>');
      if (f.type === 'area') out.push('  <textarea id="' + n + '" name="' + n + '" rows="4"' + r + '></textarea>');
      else if (f.type === 'select') out.push('  <select id="' + n + '" name="' + n + '"' + r + '>\n    <option value="">Choose…</option>\n' + opts(f).map(function (o) { return '    <option>' + o.replace(/</g, '&lt;') + '</option>'; }).join('\n') + '\n  </select>');
      else out.push('  <input id="' + n + '" name="' + n + '" type="' + (f.type === 'phone' ? 'tel' : f.type) + '"' + r + '>');
    });
    out.push('  <button type="submit">Submit</button>', '</form>');
    return out.join('\n');
  }
  var copyHtml = T.button('Copy HTML code', { small: true, onclick: function () { T.copy(htmlCode(), copyHtml); } });
  spot.appendChild(T.card([
    h('div', { 'class': 'tgrid2' }, [T.field('Template', tpl), T.field('Form title', title), T.field('Instructions', intro)]),
    h('h3', { text: 'Questions' }), list,
    T.row([T.button('+ Add question', { small: true, onclick: function () { st.fields.push({ label: 'New question', type: 'text', opts: '', req: false }); keep(); draw(); } })]),
    T.row([T.button('Download fillable PDF', { primary: true, onclick: function () { dl(false, false); } }), copyHtml]),
    status.el,
    h('h3', { text: 'Fill it here (optional)' }), h('div', { 'class': 'tpaper', style: 'color:inherit;background:var(--bg)' }, [live]),
    T.row([T.button('Download filled PDF', { onclick: function () { dl(true, false); } }), T.button('Download filled PDF (locked, cannot be edited)', { small: true, onclick: function () { dl(true, true); } })])]));
  draw();

  T.tests['fillable-form'] = function () {
    var keepSt = st; st = load('job'); draw();
    var nameEl = live.querySelector('input[type=text]'); nameEl.value = 'Asha Verma';
    var radio = live.querySelector('input[type=radio]'); radio.checked = true;
    var expect = st.fields.filter(function (f) { return f.type !== 'head' && f.type !== 'sign'; }).length;
    return makePdf(true, false).then(function (r) {
      return T.lib('pdflib').then(function (L) { return L.PDFDocument.load(r.bytes); }).then(function (back) {
        var fails = [], fields = back.getForm().getFields();
        if (r.count !== expect) fails.push('made ' + r.count + ' fields, want ' + expect);
        if (fields.length !== expect) fails.push('PDF has ' + fields.length + ' fields, want ' + expect);
        var first = back.getForm().getTextField(slug('Full name', 0)).getText();
        if (first !== 'Asha Verma') fails.push('filled name reads "' + first + '"');
        if (htmlCode().indexOf('<select id="highest_qualification_5"') < 0) fails.push('HTML code lacks the drop-down');
        st = keepSt; keep(); draw();
        return { ok: !fails.length, n: 4, fails: fails };
      });
    });
  };
});
