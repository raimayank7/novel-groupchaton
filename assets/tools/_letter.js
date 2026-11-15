/* Infinity letter engine — application and letter generators: pick a type, fill a short form, get a ready letter.
   Designed & Developed by Nivesh Sahayak. See LICENSE.

   GCOTools.engine('letter', 'application-generator', {
     templates: [ { id: 'sick-school', group: 'School', name: 'Sick leave', lang: 'en',
                    fields: ['name', 'cls', ...],                  // keys of FIELDS below, or [key, label, default] for one-off fields
                    to: 'The Principal', subject: 'Application for sick leave',
                    body: function (f, x) { return '…' + f.name; } } ],      // f: field values (empty ones show as [Label]); x: helpers
     test: [ { t: 'sick-school', in: { name: 'Asha' }, has: ['Asha', 'Subject:'] } ] }); */
(function () {
  var T = window.GCOTools, h = T.h;
  // fields shared by many letters: [label, sample value, input type]
  var FIELDS = {
    name: ['Your full name', 'Asha Verma'], cls: ['Class and section', '8 B'], roll: ['Roll number', '21'],
    school: ['School / college name', 'Green Valley Public School'], place: ['City / town', 'Ludhiana'],
    from: ['From date', '', 'date'], till: ['To date', '', 'date'], days: ['Number of days', '3'],
    reason: ['Reason (in a few words)', 'a family wedding'], illness: ['Illness', 'fever and cold'],
    company: ['Company / office name', 'Sunrise Technologies Pvt. Ltd.'], role: ['Your designation / job title', 'Accounts Executive'],
    empid: ['Employee ID (optional)', ''], manager: ['Addressed to (title)', 'The Manager'], dept: ['Department', 'Accounts'],
    bank: ['Bank name', 'State Bank of India'], branch: ['Branch', 'Model Town'], acno: ['Account number', ''],
    phone: ['Your mobile number', ''], email: ['Your email', ''], address: ['Your address', ''],
    newaddr: ['New address', ''], post: ['Job you are applying for', 'Accounts Assistant'],
    exp: ['Your experience (short)', '2 years as an accounts assistant'], skills: ['Your key skills', 'Tally, GST returns and MS Excel'],
    last: ['Last working day', '', 'date'], notice: ['Notice period', '30 days'], person: ['Name of the person', 'Rahul Sharma'],
    relation: ['Their relation to you', 'my brother'], purpose: ['Purpose', 'collect my documents'], docs: ['Documents / items', 'my passport'],
    amount: ['Amount', ''], invoice: ['Invoice / order number', ''], due: ['Due date', '', 'date'], product: ['Product / service', ''],
    friend: ['Friend’s name', 'Riya'], occasion: ['Occasion', 'my birthday party'], when: ['When', 'Sunday, 15 November at 6 pm'],
    area: ['Your area / colony', 'Sector 12, Model Town'], problem: ['Problem', 'no water supply for the last three days'],
    authority: ['Authority (title)', 'The Executive Engineer'], dept2: ['Department / office', 'Municipal Corporation'],
    sal: ['Salutation', 'Sir/Madam', 'select']
  };
  function today() { return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  function nice(iso, lang) { if (!iso) return ''; var d = new Date(iso + 'T00:00:00'); return isNaN(d) ? iso : d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }

  T.engines.letter = function (spot, T, def, id) {
    var saved = T.store.get('letter-' + id, {});
    var groups = [];
    def.templates.forEach(function (t) { if (groups.indexOf(t.group) < 0) groups.push(t.group); });
    var pick = h('select', { 'aria-label': 'Letter type' }, groups.map(function (g) {
      return h('optgroup', { label: g }, def.templates.filter(function (t) { return t.group === g; }).map(function (t) {
        return h('option', { value: t.id, selected: t.id === saved.t ? true : null }, [t.name + (t.lang === 'hi' ? ' (हिंदी)' : '')]);
      }));
    }));
    var form = h('div', { 'class': 'tgrid2' });
    var out = h('textarea', { 'class': 'tout tletter', rows: '18', 'aria-label': 'Your letter', 'data-out': '', spellcheck: 'true' });
    var note = h('p', { 'class': 'tnote', text: 'You can edit the letter here before copying or printing it.' });
    var vals = saved.v || {}, els = {}, edited = false;
    function tpl() { return def.templates.filter(function (t) { return t.id === pick.value; })[0] || def.templates[0]; }
    function spec(f) { return Array.isArray(f) ? { k: f[0], label: f[1], v: f[2] || '', type: f[3] } : { k: f, label: FIELDS[f][0], v: FIELDS[f][1], type: FIELDS[f][2] }; }
    function drawForm() {
      form.innerHTML = ''; els = {};
      tpl().fields.concat(['sal']).forEach(function (f) {
        var s = spec(f), el;
        if (s.k === 'sal') el = T.select(tpl().lang === 'hi' ? [['महोदय', 'महोदय'], ['महोदया', 'महोदया'], ['महोदय/महोदया', 'महोदय/महोदया']] : [['Sir', 'Sir'], ['Madam', 'Madam'], ['Sir/Madam', 'Sir/Madam']], vals.sal);
        else if (s.type === 'date') el = h('input', { type: 'date' });
        else if (s.type === 'area') el = h('textarea', { rows: '3' });
        else el = h('input', { type: 'text', placeholder: s.v });
        if (s.k !== 'sal') el.value = vals[s.k] !== undefined ? vals[s.k] : (s.type === 'date' ? (s.k === 'from' ? iso(0) : s.k === 'till' ? iso(2) : s.k === 'last' ? iso(30) : s.k === 'due' ? iso(7) : '') : s.v);
        el.addEventListener('input', function () { vals[s.k] = el.value; edited = false; write(); });
        el.addEventListener('change', function () { vals[s.k] = el.value; edited = false; write(); });
        els[s.k] = el;
        form.appendChild(T.field(s.k === 'sal' ? (tpl().lang === 'hi' ? 'संबोधन' : 'Salutation') : s.label, el));
      });
    }
    function iso(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
    function values() {
      var f = {}, t = tpl();
      t.fields.concat(['sal']).forEach(function (x) {
        var s = spec(x), v = els[s.k] ? (els[s.k].value || '').trim() : '';
        f[s.k] = v ? (s.type === 'date' ? nice(v, t.lang) : v) : '[' + s.label + ']';
      });
      return f;
    }
    function write() {
      var t = tpl(), f = values(), hi = t.lang === 'hi';
      var x = { date: hi ? new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : today(),
        opt: function (v, pre, post) { return !v || v.charAt(0) === '[' ? '' : (pre || '') + v + (post || ''); } };
      var text = typeof t.letter === 'function' ? t.letter(f, x) : [
        (hi ? 'सेवा में,' : 'To,'), t.to + (t.org ? ',\n' + t.org(f) : '') + ',', (t.addr ? t.addr(f) : f.place) + '.', '',
        (hi ? 'दिनांक: ' : 'Date: ') + x.date, '',
        (hi ? 'विषय: ' : 'Subject: ') + (typeof t.subject === 'function' ? t.subject(f) : t.subject) + '.', '',
        (hi ? 'आदरणीय ' : 'Respected ') + f.sal + ',', '',
        t.body(f, x), '',
        hi ? 'धन्यवाद।' : 'Thanking you,', '', (t.close || (hi ? 'आपका/आपकी आज्ञाकारी,' : 'Yours faithfully,')), t.sign(f, x)].join('\n');
      out.value = text.replace(/\n{3,}/g, '\n\n');
      T.store.set('letter-' + id, { t: pick.value, v: vals });
      share.href = 'https://wa.me/?text=' + encodeURIComponent(out.value);
    }
    var copy = T.button('Copy letter', { primary: true, onclick: function () { T.copy(out.value, copy); } });
    var share = h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', text: 'Share on WhatsApp' });
    function html() {
      return '<!doctype html><html><head><meta charset="utf-8"><title>' + tpl().name + '</title><style>body{font:12pt/1.6 "Times New Roman",serif;margin:2.2cm}pre{white-space:pre-wrap;font:inherit;margin:0}</style></head><body><pre>' +
        out.value.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre></body></html>';
    }
    var word = T.button('Word (.doc)', { onclick: function () { T.download(new Blob(['﻿' + html()], { type: 'application/msword' }), slug() + '.doc'); } });
    var txt = T.button('Text (.txt)', { onclick: function () { T.download(new Blob([out.value], { type: 'text/plain;charset=utf-8' }), slug() + '.txt'); } });
    var print = T.button('Print / Save as PDF', { onclick: function () {
      var w = window.open('', '_blank'); if (!w) return;
      w.document.write(html()); w.document.close(); w.focus(); setTimeout(function () { w.print(); }, 300);
    } });
    function slug() { return tpl().name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'letter'; }
    var fresh = T.button('Start again', { small: true, onclick: function () { vals = {}; drawForm(); write(); } });
    pick.addEventListener('change', function () { drawForm(); write(); });
    spot.appendChild(T.card([T.field('What do you need to write?', pick), h('h3', { text: 'Fill in your details' }), form, T.row([fresh]),
      h('h3', { text: 'Your letter' }), out, note, T.row([copy, share, word, txt, print])]));
    drawForm(); write();

    T.tests[id] = function () {
      var fails = [];
      def.templates.forEach(function (t) {   // every template must build a letter with no gaps in its wording
        pick.value = t.id; vals = {}; drawForm(); write();
        var v = out.value;
        if (v.length < 150) fails.push(t.id + ': too short');
        if (/undefined|null|NaN|\[object/.test(v)) fails.push(t.id + ': shows undefined/null');
        if (/\[[^\]]*\]/.test(v.replace(/\[(Your|Account|Employee|Amount|Invoice|Product|New)[^\]]*\]/g, ''))) fails.push(t.id + ': empty field ' + v.match(/\[[^\]]*\]/)[0]);
      });
      (def.test || []).forEach(function (c) {
        pick.value = c.t; vals = c.in; drawForm(); write();
        c.has.forEach(function (s) { if (out.value.indexOf(s) < 0) fails.push(c.t + ': missing "' + s + '"'); });
      });
      vals = {}; T.store.set('letter-' + id, {}); pick.value = def.templates[0].id; drawForm(); write();
      return Promise.resolve({ ok: !fails.length, n: def.templates.length + (def.test || []).length, fails: fails });
    };
  };
})();
