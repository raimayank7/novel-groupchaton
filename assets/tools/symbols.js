/* Infinity by GroupChatOn — symbols. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Copy symbols: currency, legal, maths, arrows, ticks, bullets, punctuation and more, with their Unicode code and HTML entity. */
GCOTools.register('symbols', function (spot, T) {
  var h = T.h, info = h('p', { 'class': 'tnote', 'aria-live': 'polite' });
  var GROUPS = [
    ['Currency', '₹ Indian rupee|$ dollar|€ euro|£ pound sterling|¥ yen / yuan|¢ cent|₩ won|₽ ruble|₺ Turkish lira|₦ naira|₱ peso|฿ baht|₫ dong|₪ shekel|₴ hryvnia|₸ tenge|₼ manat|₾ lari|৳ taka|₨ rupee sign|﷼ rial|₿ bitcoin|¤ currency sign'],
    ['Legal & marks', '© copyright|® registered|™ trademark|℠ service mark|§ section|¶ paragraph|† dagger|‡ double dagger|№ numero|℅ care of|℗ sound recording|‰ per mille|‱ per ten thousand|@ at|& ampersand|# number sign'],
    ['Maths', '± plus or minus|× multiply|÷ divide|− minus|≠ not equal|≈ approximately|≡ identical|≤ less or equal|≥ greater or equal|< less than|> greater than|∞ infinity sign|√ square root|∛ cube root|∑ sum|∏ product|∫ integral|∂ partial|∆ delta / change|∇ nabla|π pi|° degree|′ prime / minutes|″ double prime / seconds|µ micro|Ω ohm|∝ proportional|∠ angle|⊥ perpendicular|∥ parallel|∩ intersection|∪ union|⊂ subset|∈ element of|∉ not element of|∅ empty set|∀ for all|∃ there exists|¬ not|∴ therefore|∵ because|½ one half|⅓ one third|¼ one quarter|¾ three quarters|⅛ one eighth|⁰ superscript 0|¹ superscript 1|² squared|³ cubed|⁴ superscript 4|ⁿ superscript n|₀ subscript 0|₁ subscript 1|₂ subscript 2|₃ subscript 3'],
    ['Arrows', '→ right arrow|← left arrow|↑ up arrow|↓ down arrow|↔ left right arrow|↕ up down arrow|⇒ double right arrow / implies|⇐ double left arrow|⇔ if and only if|↗ north east arrow|↘ south east arrow|↙ south west arrow|↖ north west arrow|➜ heavy right arrow|➔ wide right arrow|➤ arrowhead|➡ black right arrow|⬅ black left arrow|⬆ black up arrow|⬇ black down arrow|↩ return arrow|↪ forward return arrow|⟶ long right arrow|⟵ long left arrow|↻ clockwise|↺ anticlockwise|⤴ curve up|⤵ curve down|▶ play triangle|◀ reverse triangle|▲ up triangle|▼ down triangle|» right guillemet|« left guillemet'],
    ['Ticks & boxes', '✓ check mark|✔ heavy check mark|✗ ballot x|✘ heavy ballot x|✕ multiplication x|☐ empty box|☑ ticked box|☒ crossed box|⊠ squared x|⊡ squared dot|○ empty circle|◉ fisheye|◯ large circle|⦿ circled bullet'],
    ['Bullets & shapes', '• bullet|◦ white bullet|‣ triangle bullet|⁃ hyphen bullet|▪ small black square|▫ small white square|■ black square|□ white square|● black circle|○ white circle|◆ black diamond|◇ white diamond|★ black star|☆ white star|✦ four pointed star|✪ circled star|❖ diamond minus x|❤ heavy heart|♥ heart suit|♦ diamond suit|♣ club suit|♠ spade suit|♪ musical note|♫ beamed notes|☀ sun|☁ cloud|☂ umbrella|☎ telephone|✉ envelope|✈ airplane|☕ hot drink|⚑ flag|⚐ white flag|✂ scissors|✎ pencil|⌛ hourglass|⚡ high voltage|☮ peace|☯ yin yang|☢ radioactive|☣ biohazard|⚠ warning|♻ recycle|♀ female|♂ male|⚧ transgender|☺ smiling face|☹ frowning face|✿ flower|❀ florette|❄ snowflake|☘ shamrock'],
    ['Punctuation & spaces', '— em dash|– en dash|‐ hyphen|… ellipsis|· middle dot|“ left double quote|” right double quote|‘ left single quote|’ right single quote / apostrophe|„ low double quote|‚ low single quote|‹ single left guillemet|› single right guillemet|¡ inverted exclamation|¿ inverted question|‽ interrobang|⁂ asterism|※ reference mark|¦ broken bar|‖ double bar|〃 ditto mark|ʼ modifier apostrophe|° degree sign|℃ degree Celsius|℉ degree Fahrenheit'],
    ['Greek', 'α alpha|β beta|γ gamma|δ delta|ε epsilon|ζ zeta|η eta|θ theta|ι iota|κ kappa|λ lambda|μ mu|ν nu|ξ xi|ο omicron|π pi|ρ rho|σ sigma|τ tau|υ upsilon|φ phi|χ chi|ψ psi|ω omega|Γ Gamma|Δ Delta|Θ Theta|Λ Lambda|Ξ Xi|Π Pi|Σ Sigma|Φ Phi|Ψ Psi|Ω Omega'],
    ['Indian scripts', 'ॐ om|। danda (full stop)|॥ double danda|ऽ avagraha|ः visarga|ं anusvara|ँ chandrabindu|् halant / virama|₹ rupee|੧ Gurmukhi one|ੴ ik onkar|☬ khanda|৳ taka|௹ Tamil rupee']
  ];
  function code(ch) { return 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'); }
  function entity(ch) { return '&#' + ch.codePointAt(0) + ';'; }
  var tray = h('textarea', { rows: '2', 'aria-label': 'Your symbols', placeholder: 'Tap symbols to collect them here' });
  var q = h('input', { type: 'search', placeholder: 'Search: rupee, arrow, tick, degree, copyright…', 'aria-label': 'Search symbols' });
  var body = h('div', { style: 'display:grid;gap:12px' });
  function pick(ch, name) { tray.value += ch; T.copy(ch); info.textContent = 'Copied ' + ch + ' ' + name + ' · ' + code(ch) + ' · HTML ' + entity(ch); }
  function draw() {
    var w = q.value.toLowerCase().trim(), n = 0; body.innerHTML = '';
    GROUPS.forEach(function (g) {
      var items = g[1].split('|').map(function (s) { var i = s.indexOf(' '); return [s.slice(0, i), s.slice(i + 1)]; })
        .filter(function (x) { return !w || x[1].toLowerCase().indexOf(w) >= 0 || x[0] === w || g[0].toLowerCase().indexOf(w) >= 0; });
      if (!items.length) return;
      n += items.length;
      body.appendChild(h('section', {}, [h('b', { style: 'display:block;font-size:13px;color:var(--muted);margin-bottom:6px', text: g[0] }),
        h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(48px,1fr));gap:6px' }, items.map(function (x) {
          return h('button', { type: 'button', title: x[1] + ' (' + code(x[0]) + ')', 'aria-label': x[1], style: 'font:24px/1 system-ui,sans-serif;height:48px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);cursor:pointer', text: x[0], onclick: function () { pick(x[0], x[1]); } });
        }))]));
    });
    if (!n) body.appendChild(h('p', { 'class': 'tnote', text: 'Nothing matches. Try a simpler word like arrow, star or money.' }));
  }
  q.addEventListener('input', draw);
  var cp = T.button('Copy all', { onclick: function () { T.copy(tray.value, cp); } });
  spot.appendChild(T.card([q, info, body, T.field('Your collection', tray), T.row([cp, T.button('Clear', { small: true, onclick: function () { tray.value = ''; } })]),
    h('p', { 'class': 'tnote', text: 'Tip: hover or long-press a symbol to see its name and Unicode code.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  info.textContent = 'Tap any symbol to copy it.';
  draw();
  T.tests['symbols'] = function () {
    var f = [];
    if (code('₹') !== 'U+20B9' || entity('₹') !== '&#8377;') f.push('rupee ' + code('₹'));
    if (code('©') !== 'U+00A9') f.push('copyright');
    var total = 0, bad = [];
    GROUPS.forEach(function (g) { g[1].split('|').forEach(function (s) { total++; if (s.indexOf(' ') < 1) bad.push(s); }); });
    if (bad.length) f.push('bad ' + bad.join(','));
    if (total < 250) f.push('only ' + total);
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
