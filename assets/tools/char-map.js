/* Infinity by GroupChatOn — char-map. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Special characters picker: currency, maths, arrows, ticks, fractions, Greek, accents and more; tap to copy, with Unicode and HTML codes. */
GCOTools.register('char-map', function (spot, T) {
  var h = T.h;
  var G = {
    'Currency': '₹ Indian rupee|$ dollar|€ euro|£ pound|¥ yen / yuan|₩ won|₽ ruble|₺ Turkish lira|₫ dong|₱ peso|₦ naira|₴ hryvnia|₪ shekel|₿ bitcoin|¢ cent|৳ taka|₨ rupee sign|﷼ rial',
    'Ticks & marks': '✓ check mark|✔ heavy check|✗ ballot x|✘ heavy x|☐ empty box|☑ ticked box|☒ crossed box|• bullet|◦ white bullet|▪ small square|★ black star|☆ white star|♥ heart|❤ red heart|✦ sparkle|※ reference mark|⚠ warning|ℹ information',
    'Arrows': '→ right arrow|← left arrow|↑ up arrow|↓ down arrow|↔ left right arrow|↕ up down arrow|⇒ double right arrow|⇐ double left arrow|⇔ double left right|➜ heavy right arrow|➤ arrowhead|↗ north east arrow|↘ south east arrow|↩ return arrow|⟶ long right arrow|⤴ arrow curving up|▶ play|◀ reverse',
    'Maths': '± plus minus|× times|÷ divide|≈ almost equal|≠ not equal|≤ less or equal|≥ greater or equal|∞ infinity|√ square root|∛ cube root|∑ sum|∏ product|∫ integral|∂ partial|∆ delta|π pi|° degree|‰ per mille|∴ therefore|∵ because|∈ element of|∩ intersection|∪ union|⊂ subset|∀ for all|∃ exists|¬ not|∧ and|∨ or',
    'Fractions': '½ one half|⅓ one third|⅔ two thirds|¼ one quarter|¾ three quarters|⅕ one fifth|⅛ one eighth|⅜ three eighths|⅝ five eighths|⅞ seven eighths',
    'Super & subscript': '⁰ superscript 0|¹ superscript 1|² superscript 2|³ superscript 3|⁴ superscript 4|⁵ superscript 5|⁶ superscript 6|⁷ superscript 7|⁸ superscript 8|⁹ superscript 9|⁺ superscript plus|⁻ superscript minus|ⁿ superscript n|₀ subscript 0|₁ subscript 1|₂ subscript 2|₃ subscript 3|₄ subscript 4',
    'Punctuation': '“ left double quote|” right double quote|‘ left single quote|’ right single quote / apostrophe|« left angle quote|» right angle quote|— em dash|– en dash|… ellipsis|· middle dot|¶ paragraph|§ section|† dagger|‡ double dagger|¿ inverted question|¡ inverted exclamation|‽ interrobang|।  Devanagari danda',
    'Legal & symbols': '© copyright|® registered|™ trademark|℠ service mark|℗ sound recording|№ numero|℃ degree Celsius|℉ degree Fahrenheit|µ micro|Ω ohm|♀ female|♂ male|⚥ male and female|☎ telephone|✉ envelope|✂ scissors|✈ airplane|☀ sun|☁ cloud|☂ umbrella|❄ snowflake|♻ recycling|⌘ command key|⌥ option key|⇧ shift key|⏎ return key',
    'Shapes & lines': '■ black square|□ white square|▲ up triangle|△ white up triangle|▼ down triangle|◆ black diamond|◇ white diamond|● black circle|○ white circle|◎ bullseye|─ box line|│ vertical line|┌ corner top left|┐ corner top right|└ corner bottom left|┘ corner bottom right|░ light shade|▒ medium shade|▓ dark shade|█ full block',
    'Greek': 'α alpha|β beta|γ gamma|δ delta|ε epsilon|θ theta|λ lambda|μ mu|σ sigma|τ tau|φ phi|ω omega|Γ capital gamma|Δ capital delta|Θ capital theta|Λ capital lambda|Σ capital sigma|Φ capital phi|Ψ capital psi|Ω capital omega',
    'Accented letters': 'á a acute|à a grave|â a circumflex|ä a umlaut|ã a tilde|å a ring|ç c cedilla|é e acute|è e grave|ê e circumflex|ë e umlaut|í i acute|ï i umlaut|ñ n tilde|ó o acute|ô o circumflex|ö o umlaut|ø o stroke|ú u acute|ü u umlaut|ß sharp s|æ ae|œ oe|Ä capital A umlaut|É capital E acute|Ñ capital N tilde|Ö capital O umlaut|Ü capital U umlaut',
    'Indian': '₹ rupee|ॐ om|। danda|॥ double danda|० Devanagari zero|१ Devanagari one|२ Devanagari two|३ Devanagari three|४ Devanagari four|५ Devanagari five|६ Devanagari six|७ Devanagari seven|८ Devanagari eight|९ Devanagari nine|ੴ ik onkar|☬ khanda|卐 swastika (religious)|🪔 diya'
  };
  var ALL = []; Object.keys(G).forEach(function (g) { G[g].split('|').forEach(function (x) { var c = Array.from(x)[0]; ALL.push({ c: c, n: x.slice(c.length).trim(), g: g }); }); });
  function info(c) { var cp = c.codePointAt(0); return { u: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'), html: '&#' + cp + ';', css: '\\' + cp.toString(16).toUpperCase(), js: cp > 0xFFFF ? '\\u{' + cp.toString(16).toUpperCase() + '}' : '\\u' + cp.toString(16).toUpperCase().padStart(4, '0') }; }
  function find(q, g) { q = q.trim().toLowerCase(); return ALL.filter(function (x) { return (g === 'All' || x.g === g) && (!q || x.n.toLowerCase().indexOf(q) >= 0 || x.c === q); }); }
  var q = h('input', { type: 'search', placeholder: 'Search: rupee, arrow, tick, half, degree…', 'aria-label': 'Search characters' }), grp = T.select(['All'].concat(Object.keys(G)).map(function (g) { return [g, g]; }), 'All');
  var grid = h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:6px' }), detail = h('div', { 'class': 'tkv', 'data-out': '' }), tray = h('input', { type: 'text', placeholder: 'Characters you tap collect here', 'aria-label': 'Collected characters' });
  function show(x) {
    var i = info(x.c); detail.innerHTML = '';
    [['Character', x.c + '  ' + x.n], ['Unicode', i.u], ['HTML', i.html], ['CSS content', '"' + i.css + '"'], ['JavaScript', '"' + i.js + '"']].forEach(function (r) { detail.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] }), T.button('Copy', { small: true, onclick: function (e) { T.copy(r[0] === 'Character' ? x.c : r[1], e.currentTarget); } })])); });
  }
  function draw() {
    grid.innerHTML = '';
    find(q.value, grp.value).forEach(function (x) {
      grid.appendChild(h('button', { type: 'button', title: x.n, 'aria-label': x.n, style: 'height:52px;font-size:24px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);cursor:pointer', text: x.c,
        onclick: function (e) { tray.value += x.c; show(x); T.copy(x.c, null); } }));
    });
  }
  q.addEventListener('input', draw); grp.addEventListener('change', draw);
  var copyAll = T.button('Copy collected', { primary: true, onclick: function () { T.copy(tray.value, copyAll); } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Search', q), T.field('Group', grp)]), grid, h('p', { 'class': 'tstatus', text: 'Tap a character to copy it.' }), detail, T.field('Your characters', tray), T.row([copyAll, T.button('Clear', { small: true, onclick: function () { tray.value = ''; } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw(); show(ALL[0]);
  T.tests['char-map'] = function () {
    var f = [], e = info('€'), b = info('₿');
    if (e.u !== 'U+20AC' || e.html !== '&#8364;' || e.css !== '\\20AC' || e.js !== '\\u20AC') f.push('euro ' + JSON.stringify(e));
    if (info('🪔').js !== '\\u{1FA94}') f.push('astral');
    if (find('rupee', 'All').length < 2 || find('', 'Fractions').length !== 10) f.push('search');
    if (ALL.length < 200) f.push('only ' + ALL.length);
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
