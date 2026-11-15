/* Infinity by GroupChatOn — html-tags. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* HTML tag reference: the tags people actually use, grouped, searchable, each with a plain explanation, an example and a live preview. */
GCOTools.register('html-tags', function (spot, T) {
  var h = T.h;
  // [tag, group, what it is for, example]
  var TAGS = [
    ['html', 'Page', 'The root of every page. Set the language with lang="en".', '<html lang="en">…</html>'],
    ['head', 'Page', 'Holds information about the page: title, styles, meta tags. Nothing in it is shown.', '<head><title>My page</title></head>'],
    ['title', 'Page', 'The text in the browser tab and the blue link on Google.', '<title>Free PDF Tools</title>'],
    ['meta', 'Page', 'Facts about the page: character set, description, mobile viewport, social previews.', '<meta name="viewport" content="width=device-width, initial-scale=1">'],
    ['link', 'Page', 'Connects a stylesheet, icon or other file to the page.', '<link rel="stylesheet" href="style.css">'],
    ['style', 'Page', 'CSS written directly in the page.', '<style>p { color: teal; }</style>'],
    ['script', 'Page', 'JavaScript, written in the page or loaded from a file.', '<script src="app.js" defer></script>'],
    ['body', 'Page', 'Everything visible on the page.', '<body>…</body>'],
    ['header', 'Layout', 'The top part of a page or section: logo, title, navigation.', '<header><h1>My Shop</h1></header>'],
    ['nav', 'Layout', 'A group of main navigation links.', '<nav><a href="/">Home</a> · <a href="/about">About</a></nav>'],
    ['main', 'Layout', 'The main content of the page. Use it once per page.', '<main><p>Main content</p></main>'],
    ['section', 'Layout', 'A themed part of a page, usually with its own heading.', '<section><h2>Prices</h2><p>…</p></section>'],
    ['article', 'Layout', 'A self-contained piece: a blog post, news story or comment.', '<article><h2>Post title</h2><p>Text…</p></article>'],
    ['aside', 'Layout', 'Side content related to the main text, like a sidebar or tip box.', '<aside>Tip: save often.</aside>'],
    ['footer', 'Layout', 'The bottom of a page or section: copyright, contact, links.', '<footer>© 2026 My Shop</footer>'],
    ['div', 'Layout', 'A plain box with no meaning, used for styling and layout.', '<div style="padding:8px;border:1px solid #ccc">A box</div>'],
    ['span', 'Layout', 'A plain inline piece of text, used for styling part of a line.', '<p>Price: <span style="color:red">₹99</span></p>'],
    ['h1', 'Text', 'The main heading. One per page is best for SEO. h2–h6 are sub-headings.', '<h1>Main heading</h1><h2>Sub-heading</h2>'],
    ['p', 'Text', 'A paragraph of text.', '<p>This is a paragraph.</p>'],
    ['br', 'Text', 'A line break inside text (no closing tag).', 'Line one<br>Line two'],
    ['hr', 'Text', 'A thematic break, drawn as a horizontal line.', '<p>Part one</p><hr><p>Part two</p>'],
    ['a', 'Text', 'A link. href is the address; target="_blank" opens a new tab.', '<a href="https://example.com" target="_blank" rel="noopener">Visit</a>'],
    ['strong', 'Text', 'Important text, shown bold.', '<p><strong>Warning:</strong> hot surface.</p>'],
    ['em', 'Text', 'Stressed text, shown in italics.', '<p>I <em>really</em> mean it.</p>'],
    ['b', 'Text', 'Bold for style only, without extra importance.', '<b>Bold</b>'],
    ['i', 'Text', 'Italic for style, foreign words or titles.', '<i>Namaste</i> means hello.'],
    ['u', 'Text', 'Underlined text (can be confused with links; use rarely).', '<u>underlined</u>'],
    ['mark', 'Text', 'Highlighted text, like a marker pen.', '<p>Find the <mark>key word</mark>.</p>'],
    ['small', 'Text', 'Small print such as disclaimers.', '<small>Prices include GST.</small>'],
    ['sub', 'Text', 'Subscript, as in chemical formulas.', 'H<sub>2</sub>O'],
    ['sup', 'Text', 'Superscript, as in powers and footnotes.', 'E = mc<sup>2</sup>'],
    ['blockquote', 'Text', 'A long quotation from another source.', '<blockquote>Be the change you wish to see.</blockquote>'],
    ['q', 'Text', 'A short inline quotation (adds quote marks).', '<p>He said <q>see you soon</q>.</p>'],
    ['abbr', 'Text', 'An abbreviation; title gives the full form on hover.', '<abbr title="Goods and Services Tax">GST</abbr>'],
    ['code', 'Text', 'A short piece of computer code.', '<p>Run <code>npm install</code>.</p>'],
    ['pre', 'Text', 'Preformatted text: spaces and line breaks are kept.', '<pre>Line 1\n    indented</pre>'],
    ['kbd', 'Text', 'Keyboard input.', 'Press <kbd>Ctrl</kbd> + <kbd>C</kbd>'],
    ['time', 'Text', 'A date or time that machines can read.', '<time datetime="2026-11-01">1 November</time>'],
    ['del', 'Text', 'Removed text, shown struck through.', '<del>₹999</del> ₹699'],
    ['ins', 'Text', 'Added text, shown underlined.', '<ins>New price</ins>'],
    ['ul', 'Lists', 'A bulleted (unordered) list; each item is an li.', '<ul><li>Tea</li><li>Coffee</li></ul>'],
    ['ol', 'Lists', 'A numbered list.', '<ol><li>Open</li><li>Edit</li><li>Save</li></ol>'],
    ['li', 'Lists', 'One item in a ul or ol list.', '<ul><li>One item</li></ul>'],
    ['dl', 'Lists', 'A description list of terms (dt) and their descriptions (dd).', '<dl><dt>PAN</dt><dd>Permanent Account Number</dd></dl>'],
    ['details', 'Interactive', 'A box that opens and closes, with a summary as its title. Great for FAQs.', '<details><summary>Is it free?</summary>Yes, completely.</details>'],
    ['dialog', 'Interactive', 'A pop-up dialog box, opened with JavaScript.', '<dialog open>Hello from a dialog</dialog>'],
    ['img', 'Media', 'An image. Always add alt text; width and height stop the page jumping.', '<img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2260%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%2394a3b8%22/%3E%3C/svg%3E" alt="Grey box" width="120" height="60">'],
    ['picture', 'Media', 'Offers several image versions (WebP, sizes) and lets the browser choose.', '<picture><source srcset="a.webp" type="image/webp"><img src="a.jpg" alt=""></picture>'],
    ['figure', 'Media', 'A picture, chart or code with an optional caption (figcaption).', '<figure><div style="background:#ddd;height:40px"></div><figcaption>Fig. 1</figcaption></figure>'],
    ['video', 'Media', 'A video player. controls shows play and volume buttons.', '<video controls width="240" src="movie.mp4"></video>'],
    ['audio', 'Media', 'An audio player.', '<audio controls src="song.mp3"></audio>'],
    ['iframe', 'Media', 'Shows another page inside this one, such as a YouTube video or map.', '<iframe src="https://example.com" width="240" height="120" title="Example"></iframe>'],
    ['canvas', 'Media', 'A drawing area for JavaScript graphics and games.', '<canvas width="120" height="60" style="border:1px solid #ccc"></canvas>'],
    ['svg', 'Media', 'Vector graphics that stay sharp at any size.', '<svg width="60" height="60"><circle cx="30" cy="30" r="25" fill="tomato"/></svg>'],
    ['table', 'Tables', 'A table of rows (tr) and cells (th for headings, td for data).', '<table border="1"><tr><th>Item</th><th>Price</th></tr><tr><td>Tea</td><td>₹20</td></tr></table>'],
    ['caption', 'Tables', 'The title of a table.', '<table border="1"><caption>Price list</caption><tr><td>Tea</td></tr></table>'],
    ['thead', 'Tables', 'The heading rows of a table (tbody holds the body, tfoot the totals).', '<table border="1"><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Asha</td></tr></tbody></table>'],
    ['form', 'Forms', 'A form that sends what people type. action is where it goes; method is GET or POST.', '<form><input placeholder="Your name"> <button>Send</button></form>'],
    ['label', 'Forms', 'The visible name of a form field. Clicking it focuses the field.', '<label>Email <input type="email"></label>'],
    ['input', 'Forms', 'A form field. type can be text, email, tel, number, date, checkbox, radio, file, range, color…', '<input type="date"> <input type="range"> <input type="color">'],
    ['textarea', 'Forms', 'A box for several lines of text.', '<textarea rows="3" placeholder="Your message"></textarea>'],
    ['select', 'Forms', 'A drop-down list of options.', '<select><option>India</option><option>Nepal</option></select>'],
    ['button', 'Forms', 'A button. Inside a form it submits unless type="button".', '<button type="button">Click me</button>'],
    ['fieldset', 'Forms', 'Groups related form fields, with a legend as its title.', '<fieldset><legend>Delivery</legend><label><input type="radio" name="d"> Home</label></fieldset>'],
    ['progress', 'Forms', 'A progress bar.', '<progress value="60" max="100"></progress>'],
    ['meter', 'Forms', 'A gauge for a known range, like disk space.', '<meter value="0.7">70%</meter>'],
    ['template', 'Other', 'HTML kept for JavaScript to copy later; not shown.', '<template><p>Copied by JS</p></template>'],
    ['noscript', 'Other', 'Shown only when JavaScript is turned off.', '<noscript>Please turn on JavaScript.</noscript>']
  ];
  var groups = ['All'].concat(TAGS.map(function (t) { return t[1]; }).filter(function (g, i, a) { return a.indexOf(g) === i; }));
  function find(q, g) { q = q.trim().toLowerCase().replace(/[<>\/]/g, ''); return TAGS.filter(function (t) { return (g === 'All' || t[1] === g) && (!q || t[0].indexOf(q) === 0 || t[2].toLowerCase().indexOf(q) >= 0); }); }
  var q = h('input', { type: 'search', placeholder: 'Search: img, link, table, list, form…', 'aria-label': 'Search tags' }), grp = T.select(groups.map(function (g) { return [g, g]; }), 'All');
  var list = h('div', { style: 'display:grid;gap:10px', 'data-out': '' }), note = h('p', { 'class': 'tstatus' });
  function draw() {
    var r = find(q.value, grp.value); list.innerHTML = '';
    note.textContent = r.length + ' tag' + (r.length === 1 ? '' : 's');
    r.forEach(function (t) {
      var demo = h('div', { 'class': 'tpaper', style: 'padding:10px;border-radius:10px;background:#fff;color:#111;overflow:auto;max-height:180px' }); demo.innerHTML = t[3].replace(/<iframe[^>]*>/, '<span>(an embedded page shows here)</span>').replace(/<\/iframe>/, '');
      Array.prototype.forEach.call(demo.querySelectorAll('audio,video,img,canvas,svg,table,pre'), function (x) { x.style.maxWidth = '100%'; });
      list.appendChild(h('details', { style: 'border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--bg)' }, [
        h('summary', { style: 'cursor:pointer' }, [h('code', { text: '<' + t[0] + '>' }), ' ', h('small', { text: t[1] })]),
        h('p', { text: t[2], style: 'margin:8px 0' }), h('pre', { 'class': 'tmono', style: 'white-space:pre-wrap;margin:0 0 8px;font-size:13px', text: t[3] }), demo,
        T.row([T.button('Copy example', { small: true, onclick: function (e) { T.copy(t[3], e.currentTarget); } })])]));
    });
  }
  q.addEventListener('input', draw); grp.addEventListener('change', draw);
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Search', q), T.field('Group', grp)]), note, list]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['html-tags'] = function () {
    var f = [];
    if (TAGS.length < 60) f.push('only ' + TAGS.length);
    if (find('img', 'All')[0][0] !== 'img' || find('<table>', 'All')[0][0] !== 'table' || find('', 'Lists').length !== 4) f.push('search');
    if (TAGS.map(function (t) { return t[0]; }).some(function (t, i, a) { return a.indexOf(t) !== i; })) f.push('duplicate tag');
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
