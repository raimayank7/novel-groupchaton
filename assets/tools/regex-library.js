/* Infinity by GroupChatOn — regex-library. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Ready-made regex patterns (email, phone, PIN, postcodes, PAN, GSTIN, IFSC, dates, colours…) with an explanation and a live tester. */
GCOTools.register('regex-library', function (spot, T) {
  var h = T.h;
  // [id, label, pattern, flags, what it checks, good examples, bad examples]   flags with g = "find in text"; otherwise the whole value must match
  var P = [
    ['email', 'Email address', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$', '', 'A practical email check: name, @, domain and a dot ending of 2+ letters. Real delivery can only be confirmed by sending a mail.', ['asha.verma+news@example.co.in', 'info@shop.com'], ['asha@@example.com', 'asha@example', 'asha example.com']],
    ['url', 'Website address (URL)', '^https?:\\/\\/[^\\s/$.?#][^\\s]*\\.[^\\s]{2,}$', 'i', 'http or https, then a domain with a dot, no spaces.', ['https://example.com', 'http://sub.site.org/page?q=1'], ['htp://example.com', 'https://', 'www example.com']],
    ['in-mobile', 'India · mobile number', '^(?:\\+91[\\s-]?|0)?[6-9]\\d{9}$', '', '10 digits starting 6–9, with an optional +91 or 0 in front.', ['9876543210', '+91 9876543210', '09876543210'], ['5876543210', '98765 4321', '+92 9876543210']],
    ['e164', 'Phone number (international, E.164)', '^\\+[1-9]\\d{6,14}$', '', 'A + then the country code and number, 7–15 digits, no spaces: the format WhatsApp and SMS APIs expect.', ['+14155552671', '+919876543210'], ['0014155552671', '+0123456789', '+91 98765 43210']],
    ['in-pin', 'India · PIN code', '^[1-9]\\d{5}$', '', '6 digits; Indian PIN codes never start with 0.', ['141001', '110001'], ['041001', '14100', '1410011']],
    ['us-zip', 'US · ZIP code', '^\\d{5}(?:-\\d{4})?$', '', '5 digits, or ZIP+4 like 90210-1234.', ['90210', '90210-1234'], ['9021', '90210-12']],
    ['uk-postcode', 'UK · postcode', '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', 'i', 'Outward code (SW1A) and inward code (1AA), space optional.', ['SW1A 1AA', 'M1 1AE', 'b338th'], ['12345', 'SW1A1A']],
    ['ca-postal', 'Canada · postal code', '^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$', 'i', 'Letter-digit-letter, space, digit-letter-digit.', ['K1A 0B1', 'm5v3l9'], ['K1A 0B', '123 456']],
    ['pan', 'India · PAN card', '^[A-Z]{5}\\d{4}[A-Z]$', '', '5 capital letters, 4 digits, 1 capital letter.', ['ABCDE1234F'], ['ABCD1234F', 'abcde1234f', 'ABCDE12345']],
    ['aadhaar', 'India · Aadhaar number (format)', '^[2-9]\\d{3}\\s?\\d{4}\\s?\\d{4}$', '', '12 digits, not starting with 0 or 1, spaces optional. It does not check the Verhoeff check digit.', ['2345 6789 0123', '234567890123'], ['1234 5678 9012', '2345 6789 012']],
    ['gstin', 'India · GSTIN', '^\\d{2}[A-Z]{5}\\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$', '', 'State code (2 digits), the PAN, entity number, the letter Z, and a check character.', ['27AAPFU0939F1ZV', '03ABCDE1234F1Z5'], ['27AAPFU0939F1AV', '27AAPFU0939F']],
    ['ifsc', 'India · IFSC bank code', '^[A-Z]{4}0[A-Z0-9]{6}$', '', '4 letters for the bank, a zero, then 6 letters or digits for the branch.', ['SBIN0001234', 'HDFC0ABC123'], ['SBIN1001234', 'SBI0001234']],
    ['in-vehicle', 'India · vehicle number', '^[A-Z]{2}[ -]?\\d{1,2}[ -]?[A-Z]{0,3}[ -]?\\d{4}$', '', 'State letters, RTO number, optional series letters and a 4-digit number.', ['PB 10 AB 1234', 'DL3CAB1234', 'MH-12-DE-1433'], ['P10AB1234', 'PB 10 AB 123']],
    ['ipv4', 'IPv4 address', '^(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$', '', 'Four numbers 0–255 separated by dots, no leading zeros.', ['192.168.1.1', '8.8.8.8'], ['256.1.1.1', '01.2.3.4', '1.2.3']],
    ['mac', 'MAC address', '^(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$', '', 'Six pairs of hex digits split by : or -.', ['00:1A:2B:3C:4D:5E', 'aa-bb-cc-dd-ee-ff'], ['00:1A:2B:3C:4D', '00:1G:2B:3C:4D:5E']],
    ['hex-color', 'Hex colour', '^#(?:[0-9a-fA-F]{3,4}){1,2}$', '', '#rgb, #rgba, #rrggbb or #rrggbbaa.', ['#fff', '#1a2b3c', '#1a2b3c80'], ['#12345', '123456', '#ggg']],
    ['date-iso', 'Date · YYYY-MM-DD', '^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$', '', 'ISO date with a valid month (01–12) and day (01–31). It does not know that 30 February does not exist.', ['2026-11-01', '1999-12-31'], ['2026-13-01', '2026-1-5', '01-11-2026']],
    ['date-dmy', 'Date · DD/MM/YYYY', '^(?:0[1-9]|[12]\\d|3[01])[\\/.-](?:0[1-9]|1[0-2])[\\/.-]\\d{4}$', '', 'Day first, as in India and the UK, with /, - or . between.', ['01/11/2026', '31.12.2025', '15-08-1947'], ['32/01/2026', '1/1/2026', '2026/11/01']],
    ['time-24', 'Time · 24-hour', '^(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?$', '', 'HH:MM or HH:MM:SS from 00:00 to 23:59.', ['23:59', '09:05:30'], ['24:00', '9:30', '12:60']],
    ['time-12', 'Time · 12-hour with AM/PM', '^(?:0?[1-9]|1[0-2]):[0-5]\\d\\s?(?:AM|PM)$', 'i', '1–12, minutes, then AM or PM.', ['9:30 pm', '12:00 AM'], ['13:00 PM', '9:30']],
    ['password', 'Strong password', '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$', '', 'At least 8 characters with a lowercase and capital letter, a digit and a symbol.', ['Str0ng!Pass', 'Mango#2026'], ['password1', 'SHORT1!', 'NoDigits!!']],
    ['username', 'Username', '^[A-Za-z][A-Za-z0-9_.]{2,19}$', '', 'Starts with a letter, 3–20 letters, digits, _ or .', ['mayank_rai', 'asha.v'], ['1user', 'ab', 'user name']],
    ['slug', 'URL slug', '^[a-z0-9]+(?:-[a-z0-9]+)*$', '', 'Lowercase words joined by single hyphens.', ['my-blog-post-2026', 'pdf'], ['My Post', '-bad-', 'two--hyphens']],
    ['uuid', 'UUID', '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i', 'A standard UUID (versions 1–8) with hyphens.', ['123e4567-e89b-42d3-a456-426614174000'], ['123e4567e89b42d3a456426614174000', '123e4567-e89b-92d3-a456-426614174000']],
    ['card', 'Card number (digits only)', '^(?:\\d[ -]?){12,18}\\d$', '', '13–19 digits with optional spaces or dashes. Use the Luhn check to catch typos.', ['4111 1111 1111 1111', '5500-0000-0000-0004'], ['4111 1111', '4111-1111-1111-111a']],
    ['decimal', 'Number (whole or decimal)', '^-?\\d+(?:\\.\\d+)?$', '', 'An optional minus, digits, and an optional decimal part.', ['42', '-12.5', '0.75'], ['1.2.3', '.5', '12,000']],
    ['find-email', 'Find: emails in text', '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}', 'g', 'Pulls every email address out of a block of text.', ['Mail asha@example.com or raj@shop.in'], ['no email here']],
    ['find-url', 'Find: links in text', 'https?:\\/\\/[^\\s<>"\']+', 'gi', 'Every http or https link in a block of text.', ['See https://example.com/a and http://x.org'], ['no link here']],
    ['find-hashtag', 'Find: hashtags', '#\\w+', 'g', 'Words starting with #. \\w covers English letters, digits and _.', ['Loving #Ludhiana and #food_2026'], ['no tags']],
    ['find-tag', 'Find: HTML tags', '<\\/?[a-z][a-z0-9-]*\\b[^>]*>', 'gi', 'Every opening and closing HTML tag, for stripping or counting tags.', ['<p class="x">Hi <b>there</b></p>'], ['5 < 6 and 7 > 3']],
    ['find-spaces', 'Find: double spaces', ' {2,}', 'g', 'Two or more spaces in a row; replace with one space to clean text.', ['too  many   spaces'], ['one space only']]
  ];
  function re(p) { return new RegExp(p[2], p[3]); }
  function test(p, s) {
    if (p[3].indexOf('g') >= 0) return (s.match(re(p)) || []);
    return re(p).test(s.trim());
  }
  var pick = T.select(P.map(function (p) { return [p[0], p[1]]; }), T.store.get('regex-lib-pick', 'email'));
  var lit = h('code', { 'data-out': '' }), plain = h('code'), about = h('p', { 'class': 'tstatus' });
  var box = h('textarea', { rows: '6', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'Text to test' }), out = h('textarea', { rows: '6', 'class': 'tout tmono', readonly: true, 'aria-label': 'Results' });
  var lastFill = '';
  function cur() { return P.filter(function (p) { return p[0] === pick.value; })[0] || P[0]; }
  function choose() {
    var p = cur();
    T.store.set('regex-lib-pick', p[0]);
    lit.textContent = '/' + p[2] + '/' + p[3]; plain.textContent = p[2]; about.textContent = p[4];
    if (!box.value.trim() || box.value === lastFill) box.value = lastFill = p[5].concat(p[6]).join('\n');
    check();
  }
  function check() {
    var p = cur(), g = p[3].indexOf('g') >= 0;
    out.value = g ? (function () { var m = test(p, box.value); return m.length ? m.length + ' found:\n' + m.join('\n') : 'Nothing found.'; })()
      : box.value.split(/\r?\n/).filter(function (l) { return l.trim(); }).map(function (l) { return (test(p, l) ? '✓ ' : '✕ ') + l; }).join('\n');
  }
  pick.addEventListener('change', choose); box.addEventListener('input', check);
  function copyBtn(el, label) { var b = T.button(label, { small: true, onclick: function () { T.copy(el.textContent, b); } }); return b; }
  spot.appendChild(T.card([T.field('Pattern', pick), about,
    h('div', { 'class': 'tkv' }, [h('div', {}, [h('span', { text: 'JavaScript' }), lit, copyBtn(lit, 'Copy')]), h('div', {}, [h('span', { text: 'Pattern only' }), plain, copyBtn(plain, 'Copy')])]),
    h('div', { 'class': 'tgrid2' }, [T.field('Test it (one value per line)', box), T.field('Result', out)]),
    h('p', { 'class': 'tstatus', text: 'The same pattern works in Python (re.fullmatch), PHP (preg_match with /…/), Java and C#. Always check important data on the server too.' })]));
  choose();
  T.tests['regex-library'] = function () {
    var f = [], n = 0;
    P.forEach(function (p) {
      var g = p[3].indexOf('g') >= 0;
      p[5].forEach(function (s) { n++; if (g ? !test(p, s).length : !test(p, s)) f.push(p[0] + ' should match ' + s); });
      p[6].forEach(function (s) { n++; if (g ? test(p, s).length : test(p, s)) f.push(p[0] + ' should not match ' + s); });
    });
    if (test(P.filter(function (p) { return p[0] === 'find-url'; })[0], 'a https://x.com b http://y.org').length !== 2) f.push('find-url count');
    return Promise.resolve({ ok: !f.length, n: n + 1, fails: f });
  };
});
