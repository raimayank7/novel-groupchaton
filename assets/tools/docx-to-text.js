/* Infinity by GroupChatOn — docx-to-text. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Word to text: pulls the text out of a .docx file as plain text, Markdown (headings, bold, lists, links) or clean HTML, using mammoth.js on the device. */
GCOTools.register('docx-to-text', function (spot, T) {
  var h = T.h, MAM = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js', status = T.status(), buf = null, name = 'document';
  function convert(ab, how) {
    return T.loadScript(MAM).then(function () {
      var M = window.mammoth, input = { arrayBuffer: ab };
      var p = how === 'html' ? M.convertToHtml(input) : how === 'md' ? M.convertToMarkdown(input) : M.extractRawText(input);
      return p.then(function (r) { return { text: how === 'text' ? r.value.replace(/\n{3,}/g, '\n\n').trim() : r.value.trim(), warnings: r.messages.filter(function (m) { return m.type === 'warning'; }).length }; });
    }).catch(function (e) { throw new Error(/zip|central directory|end of data/i.test(e.message) ? 'This is not a .docx file. Old .doc files must be saved as .docx in Word first.' : e.message); });
  }
  var how = T.seg([['text', 'Plain text'], ['md', 'Markdown'], ['html', 'HTML']], 'text', function () { if (buf) run(); });
  var out = h('textarea', { rows: '14', 'class': 'tout', readonly: true, 'aria-label': 'Extracted text', placeholder: 'The text will appear here.' });
  var acts = h('div', { hidden: true }, [T.row([T.button('Download', { primary: true, onclick: function () {
    var k = how.value(), ext = { text: '.txt', md: '.md', html: '.html' }[k];
    T.download(new Blob([k === 'html' ? '<!DOCTYPE html>\n<meta charset="utf-8">\n<title>' + name.replace(/</g, '') + '</title>\n' + out.value : out.value], { type: (k === 'html' ? 'text/html' : 'text/plain') + ';charset=utf-8' }), T.baseName(name) + ext);
  } }), T.button('Copy', { onclick: function (e) { T.copy(out.value, e.currentTarget); } })])]);
  function run() {
    status.info(window.mammoth ? 'Reading…' : 'Loading the Word reader (about 600 KB, only the first time)…');
    return convert(buf, how.value()).then(function (r) {
      out.value = r.text; acts.hidden = !r.text;
      var words = (r.text.match(/\S+/g) || []).length;
      if (!r.text) status.error('No text found in this document.');
      else status.ok('✓ ' + words.toLocaleString() + ' words' + (r.warnings ? ' · some formatting could not be kept' : '') + '.');
      return r;
    }).catch(status.error);
  }
  function sampleDocx() {
    var W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    var p = function (text, style, bold) { return '<w:p>' + (style ? '<w:pPr><w:pStyle w:val="' + style + '"/></w:pPr>' : '') + '<w:r>' + (bold ? '<w:rPr><w:b/></w:rPr>' : '') + '<w:t xml:space="preserve">' + text + '</w:t></w:r></w:p>'; };
    var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + W + '><w:body>' + p('Meeting notes', 'Heading1') +
      '<w:p><w:r><w:t xml:space="preserve">Date: 1 November 2026. </w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>Decisions</w:t></w:r><w:r><w:t xml:space="preserve"> are below.</w:t></w:r></w:p>' +
      p('Budget', 'Heading2') + p('Approve ₹50,000 for the new website.') + p('Next meeting on Friday.') + '</w:body></w:document>';
    var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ' + W + '><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/></w:style></w:styles>';
    return T.lib('jszip').then(function (JSZip) {
      var z = new JSZip();
      z.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
      z.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
      z.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
      z.file('word/document.xml', doc); z.file('word/styles.xml', styles);
      return z.generateAsync({ type: 'arraybuffer' });
    });
  }
  spot.appendChild(T.card([T.dropzone({ accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: '📝', label: 'Choose a Word file (.docx)', hint: 'Or drag it here. It stays on your device.', onFiles: function (fs) {
      name = fs[0].name; T.read(fs[0]).then(function (b) { buf = b; run(); });
    } }), how, T.row([T.button('Try a sample', { small: true, onclick: function () { name = 'sample.docx'; sampleDocx().then(function (b) { buf = b; run(); }).catch(status.error); } })]),
    status.el, T.field('Text', out), acts]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['docx-to-text'] = function () {
    var f = [], b;
    return sampleDocx().then(function (x) { b = x; return convert(b, 'text'); }).then(function (r) {
      if (r.text !== 'Meeting notes\n\nDate: 1 November 2026. Decisions are below.\n\nBudget\n\nApprove ₹50,000 for the new website.\n\nNext meeting on Friday.') f.push('text → ' + JSON.stringify(r.text));
      return convert(b, 'md');
    }).then(function (r) {
      if (r.text.indexOf('# Meeting notes') !== 0 || r.text.indexOf('__Decisions__') < 0 && r.text.indexOf('**Decisions**') < 0 || r.text.indexOf('## Budget') < 0) f.push('markdown → ' + JSON.stringify(r.text.slice(0, 120)));
      return convert(b, 'html');
    }).then(function (r) {
      if (r.text.indexOf('<h1>Meeting notes</h1>') !== 0 || r.text.indexOf('<strong>Decisions</strong>') < 0) f.push('html → ' + r.text.slice(0, 120));
      return convert(new Uint8Array([1, 2, 3]).buffer, 'text').then(function () { f.push('junk accepted'); }, function (e) { if (!/not a \.docx/.test(e.message)) f.push('junk error: ' + e.message); });
    }).then(function () { return { ok: !f.length, n: 4, fails: f }; });
  };
});
