/* Infinity by GroupChatOn — resume. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Resume / CV builder: short sections, three layouts, any accent colour; print, save as PDF or Word. Saved only in this browser. */
GCOTools.register('resume', function (spot, T) {
  var h = T.h;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var EMPTY = { tpl: 'classic', color: '#1d4ed8', name: '', title: '', email: '', phone: '', place: '', links: '', summary: '', exp: [], edu: [], skills: '', langs: '', extra: '' };
  var SAMPLE = { tpl: 'modern', color: '#0f766e', name: 'Asha Verma', title: 'Accounts Executive', email: 'asha.verma@example.com', phone: '+91 98765 43210', place: 'Ludhiana, Punjab',
    links: 'linkedin.com/in/ashaverma', summary: 'Accounts executive with 3 years of experience in GST returns, bank reconciliation and month-end closing for manufacturing firms. Known for accurate work and on-time filings.',
    exp: [{ role: 'Accounts Executive', org: 'Sunrise Auto Parts Pvt. Ltd.', when: 'Apr 2024 – Present', points: 'File monthly GSTR-1 and GSTR-3B for two units\nCut month-end closing time from 6 days to 3\nReconcile 4 bank accounts and vendor ledgers every week' },
      { role: 'Accounts Assistant', org: 'Gill & Co., Chartered Accountants', when: 'Jun 2023 – Mar 2024', points: 'Prepared books for 25 small business clients in Tally\nHelped with income tax returns and TDS filings' }],
    edu: [{ course: 'B.Com (Honours)', school: 'Punjab University, Chandigarh', when: '2023', score: '72%' }, { course: 'Class XII (Commerce)', school: 'Green Valley Public School', when: '2020', score: '86%' }],
    skills: 'Tally Prime, GST returns, TDS, MS Excel (pivot tables, VLOOKUP), Bank reconciliation, Zoho Books', langs: 'English, Hindi, Punjabi', extra: 'Certified GST Practitioner course (2024)\nBest Employee of the Quarter, Sunrise Auto Parts (Q3 2025)' };
  var EXP = [['role', 'Job title'], ['org', 'Company / organisation'], ['when', 'From – to', 'e.g. Jun 2023 – Present'], ['points', 'What you did (one point per line)', 'area']];
  var EDU = [['course', 'Degree / course'], ['school', 'School / college / university'], ['when', 'Year'], ['score', 'Grade / % (optional)']];
  var st = T.store.get('resume', null) || clone(EMPTY);
  function keep() { T.store.set('resume', st); }
  function lines(s) { return String(s || '').split('\n').map(function (x) { return x.replace(/^\s*[-•*]\s*/, '').trim(); }).filter(Boolean); }
  function list(s) { return String(s || '').split(/\s*[,;\n]\s*/).filter(Boolean); }

  // the finished resume as HTML (also used for print and Word)
  function render(d, forWord) {
    var c = /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#1d4ed8', tpl = forWord ? 'classic' : d.tpl;
    var contact = [d.email, d.phone, d.place].concat(list(d.links)).filter(Boolean).map(esc);
    function head(t) { return '<h2 style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:' + c + ';border-bottom:1.5px solid ' + c + ';padding-bottom:3px;margin:16px 0 8px">' + t + '</h2>'; }
    function exp() {
      var x = (d.exp || []).filter(function (e) { return e.role || e.org; });
      if (!x.length) return '';
      return head('Experience') + x.map(function (e) {
        var p = lines(e.points);
        return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>' + esc(e.role) + '</b><span style="color:#555">' + esc(e.when) + '</span></div>' +
          '<div style="color:#333">' + esc(e.org) + '</div>' + (p.length ? '<ul style="margin:4px 0 0 18px;padding:0">' + p.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      }).join('');
    }
    function edu() {
      var x = (d.edu || []).filter(function (e) { return e.course || e.school; });
      if (!x.length) return '';
      return head('Education') + x.map(function (e) {
        return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>' + esc(e.course) + '</b><span style="color:#555">' + esc(e.when) + '</span></div>' +
          '<div style="color:#333">' + esc(e.school) + (e.score ? ' · ' + esc(e.score) : '') + '</div></div>';
      }).join('');
    }
    function chips(s) { return list(s).map(function (x) { return '<span style="display:inline-block;margin:0 6px 6px 0;padding:2px 8px;border:1px solid ' + c + '55;border-radius:10px">' + esc(x) + '</span>'; }).join(''); }
    var summary = d.summary ? head('Profile') + '<p style="margin:0">' + esc(d.summary) + '</p>' : '';
    var skills = list(d.skills).length ? head('Skills') + (tpl === 'classic' ? '<p style="margin:0">' + list(d.skills).map(esc).join(' · ') + '</p>' : '<div>' + chips(d.skills) + '</div>') : '';
    var langs = list(d.langs).length ? head('Languages') + '<p style="margin:0">' + list(d.langs).map(esc).join(', ') + '</p>' : '';
    var extra = lines(d.extra).length ? head('Certifications and achievements') + '<ul style="margin:0 0 0 18px;padding:0">' + lines(d.extra).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '';
    var name = esc(d.name || 'Your Name'), title = d.title ? esc(d.title) : '';
    if (tpl === 'modern') {
      return '<div style="display:flex;flex-wrap:wrap;gap:0;font:13px/1.5 system-ui,\'Segoe UI\',Arial,sans-serif;color:#111">' +
        '<div style="flex:1 1 190px;background:' + c + ';color:#fff;padding:18px 16px;border-radius:6px 0 0 6px"><div style="font-size:24px;font-weight:800;line-height:1.15">' + name + '</div>' +
        (title ? '<div style="opacity:.9;margin-top:4px">' + title + '</div>' : '') + '<div style="margin-top:14px;font-size:12px;word-break:break-word">' + contact.join('<br>') + '</div>' +
        (list(d.skills).length ? '<div style="margin-top:16px;font-weight:700;letter-spacing:.06em;font-size:12px">SKILLS</div><div style="font-size:12px">' + list(d.skills).map(esc).join('<br>') + '</div>' : '') +
        (list(d.langs).length ? '<div style="margin-top:14px;font-weight:700;letter-spacing:.06em;font-size:12px">LANGUAGES</div><div style="font-size:12px">' + list(d.langs).map(esc).join('<br>') + '</div>' : '') + '</div>' +
        '<div style="flex:3 1 300px;padding:6px 18px 12px">' + summary + exp() + edu() + extra + '</div></div>';
    }
    var top = tpl === 'compact'
      ? '<div style="border-left:6px solid ' + c + ';padding-left:12px"><div style="font-size:24px;font-weight:800;color:' + c + '">' + name + '</div>' + (title ? '<div style="font-weight:600">' + title + '</div>' : '') + '<div style="color:#444;font-size:12px">' + contact.join(' · ') + '</div></div>'
      : '<div style="text-align:center"><div style="font-size:26px;font-weight:800;letter-spacing:.02em">' + name + '</div>' + (title ? '<div style="color:' + c + ';font-weight:600">' + title + '</div>' : '') + '<div style="color:#444;font-size:12px;margin-top:2px">' + contact.join(' &nbsp;|&nbsp; ') + '</div></div>';
    return '<div style="font:' + (tpl === 'compact' ? '12.5px/1.45' : '13px/1.5') + ' system-ui,\'Segoe UI\',Arial,sans-serif;color:#111">' + top + summary + exp() + edu() + skills + langs + extra + '</div>';
  }

  var form = h('div', {}), paper = h('div', { 'class': 'tpaper', 'data-out': '' });
  function preview() { paper.innerHTML = render(st); }
  function inp(obj, key, label, kind, ph) {
    var el = kind === 'area' ? h('textarea', { rows: '3', placeholder: ph || '' }) : h('input', { type: kind || 'text', placeholder: ph || '' });
    el.value = obj[key] || '';
    el.addEventListener('input', function () { obj[key] = el.value; keep(); preview(); });
    var f = T.field(label, el); if (kind === 'area') f.classList.add('tcalc-wide');
    return f;
  }
  function repeat(key, spec, title, addText) {
    var box = h('div', { 'class': 'tlist' });
    (st[key] || []).forEach(function (it, i) {
      box.appendChild(h('div', { 'class': 'titem', style: 'display:block' }, [h('div', { 'class': 'tgrid2' }, spec.map(function (s) { return inp(it, s[0], s[1], s[3], s[2]); })),
        T.row([T.button('↑', { small: true, disabled: i === 0, onclick: function () { st[key].splice(i - 1, 0, st[key].splice(i, 1)[0]); keep(); draw(); } }),
          T.button('Remove', { small: true, onclick: function () { st[key].splice(i, 1); keep(); draw(); } })])]));
    });
    return [h('h3', { text: title }), box, T.row([T.button(addText, { small: true, onclick: function () { var o = {}; spec.forEach(function (s) { o[s[0]] = ''; }); (st[key] = st[key] || []).push(o); keep(); draw(); } })])];
  }
  var colour = h('input', { type: 'color', 'aria-label': 'Accent colour' });
  colour.addEventListener('input', function () { st.color = colour.value; keep(); preview(); });
  var tplSeg;
  function draw() {
    form.innerHTML = ''; colour.value = st.color;
    tplSeg = T.seg([['classic', 'Classic'], ['modern', 'Modern'], ['compact', 'Compact']], st.tpl, function (v) { st.tpl = v; keep(); preview(); });
    form.appendChild(T.row([T.field('Layout', tplSeg), T.field('Colour', colour)]));
    form.appendChild(h('h3', { text: 'About you' }));
    form.appendChild(h('div', { 'class': 'tgrid2' }, [inp(st, 'name', 'Full name'), inp(st, 'title', 'Job title you want', 'text', 'e.g. Accounts Executive'), inp(st, 'email', 'Email', 'email'),
      inp(st, 'phone', 'Phone'), inp(st, 'place', 'City, country'), inp(st, 'links', 'Links (LinkedIn, portfolio…)', 'text', 'Separate with commas'),
      inp(st, 'summary', 'Profile: 2–3 lines about you', 'area', 'Who you are, your experience and what you are good at')]));
    repeat('exp', EXP, 'Experience (latest first)', '+ Add a job').forEach(function (n) { form.appendChild(n); });
    repeat('edu', EDU, 'Education', '+ Add education').forEach(function (n) { form.appendChild(n); });
    form.appendChild(h('h3', { text: 'Skills and more' }));
    form.appendChild(h('div', { 'class': 'tgrid2' }, [inp(st, 'skills', 'Skills (separate with commas)', 'area'), inp(st, 'langs', 'Languages'),
      inp(st, 'extra', 'Certifications, awards, projects (one per line)', 'area')]));
    preview();
  }
  function page(body) {
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(st.name || 'Resume') + ' – Resume</title><style>body{margin:0;padding:1.2cm;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:0}li{margin:1px 0}</style></head><body>' + body + '</body></html>';
  }
  function fname() { return (st.name || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-resume'; }
  var status = T.status();
  spot.appendChild(T.card([
    T.row([T.button('Try a sample', { small: true, onclick: function () { if (st.name && st.name !== SAMPLE.name && !confirm('Replace your details with the sample?')) return; st = clone(SAMPLE); keep(); draw(); } }),
      T.button('Start again', { small: true, onclick: function () { if (!confirm('Clear every section?')) return; st = clone(EMPTY); keep(); draw(); } })]),
    form, h('h3', { text: 'Preview' }), paper,
    T.row([T.button('Print / Save as PDF', { primary: true, onclick: function () { var w = window.open('', '_blank'); if (!w) return; w.document.write(page(render(st))); w.document.close(); setTimeout(function () { w.print(); }, 400); } }),
      T.button('Word (.doc)', { onclick: function () { T.download(new Blob(['﻿' + page(render(st, true))], { type: 'application/msword' }), fname() + '.doc'); status.ok('Downloaded. Word opens it; the Classic layout is used because Word handles it best.'); } })]),
    status.el, h('p', { 'class': 'tnote', text: 'Your details are saved only in this browser so you can come back and edit them.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();

  T.tests['resume'] = function () {
    var f = [], r = render(SAMPLE), pts = SAMPLE.exp.reduce(function (a, e) { return a + lines(e.points).length; }, 0) + lines(SAMPLE.extra).length;
    if (r.indexOf('Asha Verma') < 0 || r.indexOf('Experience') < 0 || r.indexOf('Education') < 0) f.push('sample sections');
    if ((r.match(/<li>/g) || []).length !== pts) f.push('bullet points ' + (r.match(/<li>/g) || []).length + ' want ' + pts);
    var x = clone(EMPTY); x.name = '<b>Hack</b>'; x.skills = 'A, B';
    var rx = render(x);
    if (rx.indexOf('&lt;b&gt;Hack') < 0 || rx.indexOf('<b>Hack') >= 0) f.push('not escaped');
    if (rx.indexOf('Education') >= 0 || rx.indexOf('Experience') >= 0) f.push('empty sections shown');
    ['classic', 'modern', 'compact'].forEach(function (t) { var s = clone(SAMPLE); s.tpl = t; if (render(s).indexOf('Sunrise Auto Parts') < 0) f.push(t + ' layout'); });
    if (render(SAMPLE, true).indexOf('display:flex;flex-wrap:wrap;gap:0') >= 0) f.push('word export not classic');
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
