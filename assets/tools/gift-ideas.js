/* Infinity by GroupChatOn — gift-ideas. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Gift idea picker: thoughtful ideas filtered by who it is for, the occasion, their interests and your budget, with a "surprise me" pick. */
GCOTools.register('gift-ideas', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
  // idea | who (comma list or *) | occasions (or *) | budget 1 small, 2 medium, 3 big | interests (or *)
  var IDEAS = ('Personalised photo mug|*|*|1|home,coffee;A book by their favourite author|*|*|1|books;Kindle or e-reader|partner,parent,friend,teen,grandparent|birthday,festival,anniversary|3|books,tech;Bookshop gift card|*|*|2|books;Reading light that clips on a book|*|*|1|books' +
    ';Cookbook of a cuisine they love|*|*|1|cooking;Good chef’s knife|partner,parent,friend|*|2|cooking;Spice gift box|*|*|1|cooking;Air fryer|partner,parent,grandparent|wedding,housewarming,festival,anniversary|3|cooking,home;Cooking class for two|partner,friend|birthday,anniversary|2|cooking,travel' +
    ';Wireless earbuds|partner,friend,teen,parent|birthday,festival,anniversary|2|tech,music,fitness;Power bank|*|*|1|tech,travel;Smart watch or fitness band|partner,parent,teen,friend|birthday,festival,anniversary|3|tech,fitness;Bluetooth speaker|friend,teen,partner|birthday,festival|2|music,tech;Phone tripod and ring light|teen,friend|birthday|1|tech,art' +
    ';Yoga mat and strap|*|*|1|fitness,wellness;Running gear voucher|partner,friend,teen|birthday|2|fitness;Insulated water bottle|*|*|1|fitness,travel;Massage gun|partner,parent|birthday,anniversary,festival|2|fitness,wellness;Gym or class membership|partner,friend|birthday|3|fitness' +
    ';Travel organiser pouches|*|*|1|travel;Good backpack|partner,friend,teen|birthday,festival|2|travel;A weekend trip together|partner,parent|anniversary,birthday|3|travel;Scratch-off world map|friend,partner,teen|birthday,festival|1|travel;Neck pillow and eye mask|*|*|1|travel,wellness' +
    ';Concert or show tickets|partner,friend,teen|birthday,anniversary|2|music;Vinyl record or music subscription|partner,friend,teen|birthday|2|music;Ukulele for beginners|teen,child,friend|birthday|2|music;Karaoke microphone|child,teen|birthday,festival|1|music,games' +
    ';Watercolour paint set|*|*|1|art;Sketchbook and quality pencils|child,teen,friend|birthday|1|art;Pottery or painting workshop|partner,friend|birthday,anniversary|2|art;Framed print by a local artist|partner,friend,host|housewarming,wedding,birthday|2|art,home;Custom portrait from a photo|partner,parent,grandparent|anniversary,birthday|2|art' +
    ';Indoor plant in a nice pot|*|*|1|garden,home;Herb-growing kit|*|*|1|garden,cooking;Gardening gloves and tools set|parent,grandparent|birthday,festival|1|garden;Bird feeder|grandparent,parent,child|*|1|garden' +
    ';Board game for the family|*|birthday,festival,housewarming|2|games;Card game (UNO, Exploding Kittens…)|friend,teen,child,colleague|*|1|games;Jigsaw puzzle (1000 pieces)|parent,grandparent,friend|*|1|games;Chess set|child,teen,grandparent|*|1|games;Building blocks set|child|birthday,festival|2|games;Video game they have been wanting|teen,child,partner|birthday,festival|2|games,tech' +
    ';Silk scarf or stole|parent,partner,grandparent,teacher|*|2|fashion;Watch|partner,parent|anniversary,wedding,birthday|3|fashion;Wallet or handbag|partner,parent,friend|birthday,festival|2|fashion;Jewellery (simple pendant or earrings)|partner,parent|anniversary,birthday,festival|3|fashion;Cosy hoodie|teen,friend,partner|birthday,festival|1|fashion' +
    ';Spa voucher|partner,parent,friend|birthday,anniversary,thanks|2|wellness;Scented candles set|*|*|1|wellness,home;Aromatherapy diffuser|partner,parent,friend,colleague|*|1|wellness,home;Weighted blanket|partner,parent|birthday,festival|2|wellness,home;Journal with a nice pen|*|*|1|wellness,books' +
    ';Premium tea sampler|*|*|1|coffee;Coffee beans from a local roaster|*|*|1|coffee;French press or pour-over kit|partner,friend,colleague|birthday,housewarming|1|coffee,cooking;Espresso machine|partner,parent|wedding,anniversary,housewarming|3|coffee,cooking' +
    ';Dry fruit or sweets box|*|festival,thanks,housewarming,wedding|1|*;Hamper of local treats|*|festival,thanks,housewarming|2|*;Diya and decor set|*|festival,housewarming|1|home;Photo album of shared memories|partner,parent,grandparent,friend|anniversary,birthday|1|*;Handwritten letter and a small keepsake|*|*|1|*' +
    ';Plant or flowers for the desk|colleague,teacher|thanks,birthday|1|garden;Nice notebook and pen set|colleague,teacher,teen|thanks,birthday|1|books;Thank-you card signed by the class|teacher|thanks|1|*;Desk organiser|colleague|birthday,thanks|1|home' +
    ';Doorbell camera or smart plug|parent,host|housewarming|2|tech,home;Bedsheet set or cushion covers|host,parent|housewarming,wedding|2|home;Dinner set|host,partner|wedding,housewarming|2|home,cooking;Wall clock|host|housewarming|1|home' +
    ';Baby clothes in a bigger size|baby|newbaby|1|*;Baby carrier|baby|newbaby|2|*;Meals cooked for the new parents|baby|newbaby|1|cooking;Baby milestone cards and album|baby|newbaby|1|art;Soft toy and board books|baby,child|newbaby,birthday|1|books,games' +
    ';Science or craft kit|child|birthday,festival|1|games,art;Children’s encyclopedia|child|birthday|2|books;Scooter or bicycle|child,teen|birthday|3|fitness;Personalised storybook with their name|child|birthday|2|books' +
    ';Large-print book or audiobook subscription|grandparent|*|1|books;Digital photo frame loaded with family photos|grandparent,parent|*|2|tech,home;Comfortable slippers and shawl|grandparent|*|1|wellness;Video-call tablet set up for them|grandparent|birthday,festival|3|tech' +
    ';Personalised name necklace|partner,parent,friend|birthday,anniversary|2|fashion;Experience day (cooking, pottery, driving)|partner,friend|birthday,anniversary|3|*;Movie night box with popcorn and snacks|friend,partner,teen|*|1|games;Subscription box (snacks, books or coffee)|partner,friend|birthday,festival|2|books,coffee;Donation to a charity in their name|colleague,friend,grandparent|*|1|*;Instant camera|teen,friend,partner|birthday|2|art,tech;Book of handwritten family recipes|parent,partner,host|wedding,housewarming,birthday|1|cooking;Natural skincare set|partner,parent,friend|birthday,festival,thanks|2|wellness;Cricket bat or football|child,teen|birthday,festival|2|fitness,games;Engraved pen|colleague,teacher,parent|thanks,birthday|1|books;Wooden play kitchen or tool set|child|birthday,festival|2|games').split(';').map(function (s) {
    var p = s.split('|'); return { n: p[0], who: p[1], occ: p[2], b: +p[3], int: p[4] };
  });
  function has(list, v) { return !v || list === '*' || list.split(',').indexOf(v) >= 0; }
  function match(o) {
    return IDEAS.filter(function (x) { return has(x.who, o.who) && has(x.occ, o.occ) && x.b <= (o.b || 3) && (!o.ints.length || x.int === '*' || o.ints.some(function (i) { return x.int.split(',').indexOf(i) >= 0; })); })
      .map(function (x) { var s = (x.who !== '*' && o.who ? 2 : 0) + (x.occ !== '*' && o.occ ? 2 : 0) + (x.int !== '*' && o.ints.length ? 2 : 0) + x.b * 0.1; return { x: x, s: s }; })
      .sort(function (a, b) { return b.s - a.s; }).map(function (r) { return r.x; });
  }
  var WHO = [['', 'Anyone'], ['partner', 'Partner / spouse'], ['parent', 'Mum or dad'], ['friend', 'Friend'], ['child', 'Child (3–12)'], ['teen', 'Teenager'], ['grandparent', 'Grandparent'], ['colleague', 'Colleague / boss'], ['teacher', 'Teacher'], ['host', 'Host / new home'], ['baby', 'New parents']];
  var OCC = [['', 'Any occasion'], ['birthday', 'Birthday'], ['anniversary', 'Anniversary'], ['wedding', 'Wedding'], ['festival', 'Festival (Diwali, Eid, Christmas…)'], ['thanks', 'Thank you'], ['housewarming', 'Housewarming'], ['newbaby', 'New baby']];
  var INTS = [['books', '📚 Reading'], ['cooking', '🍳 Cooking'], ['tech', '📱 Tech'], ['fitness', '🏃 Fitness'], ['travel', '✈️ Travel'], ['music', '🎵 Music'], ['art', '🎨 Art'], ['garden', '🪴 Plants'], ['games', '🎲 Games'], ['fashion', '👗 Fashion'], ['wellness', '🧖 Wellness'], ['coffee', '☕ Tea & coffee'], ['home', '🏠 Home']];
  var who = T.select(WHO, ''), occ = T.select(OCC, ''), bud = 3, ints = [];
  var chips = h('div', { 'class': 'trow' }), list = h('div', { 'class': 'tlist', style: 'grid-template-columns:minmax(0,1fr)' }), big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 24px/1.3 var(--ui);min-height:32px' }), info = h('p', { 'class': 'tnote' });
  function drawChips() { chips.innerHTML = ''; INTS.forEach(function (x) { var on = ints.indexOf(x[0]) >= 0; chips.appendChild(h('button', { type: 'button', 'class': 'tbtn tbtn-sm', 'aria-pressed': String(on), style: on ? 'background:var(--accent-soft);border-color:var(--accent)' : '', text: x[1], onclick: function () { if (on) ints.splice(ints.indexOf(x[0]), 1); else ints.push(x[0]); drawChips(); draw(); } })); }); }
  function o() { return { who: who.value, occ: occ.value, b: bud, ints: ints }; }
  function draw() {
    var r = match(o()); list.innerHTML = '';
    r.slice(0, 30).forEach(function (x) { list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: '🎁' }), h('span', { 'class': 'titem-main' }, [h('b', { text: x.n, style: 'white-space:normal' })]), h('span', { 'class': 'titem-amt', title: 'Budget', text: ['', '$', '$$', '$$$'][x.b].replace(/\$/g, '●') })])); });
    info.textContent = r.length ? r.length + ' ideas match. ● small · ●● medium · ●●● big budget.' : 'Nothing matches all of that. Untick an interest or choose “Any occasion”.';
  }
  function surprise() { var r = match(o()); if (!r.length) { status.error('No ideas match: loosen the filters.'); return; } var top = r.slice(0, Math.min(r.length, 12)); big.textContent = '🎁 ' + top[rnd(top.length)].n; status.clear(); }
  [who, occ].forEach(function (x) { x.addEventListener('change', draw); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Who is it for?', who), T.field('Occasion', occ)]),
    T.field('Budget', T.seg([[1, 'Small'], [2, 'Up to medium'], [3, 'Any']], 3, function (v) { bud = v; draw(); })), h('b', { text: 'They love… (optional, pick any)' }), chips,
    T.row([T.button('Surprise me', { primary: true, onclick: surprise }), T.button('Try a sample', { small: true, onclick: function () { who.value = 'parent'; occ.value = 'birthday'; ints = ['cooking', 'garden']; drawChips(); draw(); surprise(); } })]),
    big, status.el, info, list,
    h('p', { 'class': 'tnote', text: 'The best gifts are personal: add a handwritten note saying why you chose it. Nothing you pick here is saved or sent anywhere.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  drawChips(); draw();
  T.tests['gift-ideas'] = function () {
    var f = [];
    if (IDEAS.length < 90) f.push('only ' + IDEAS.length);
    var bad = IDEAS.filter(function (x) { return !x.n || !(x.b >= 1 && x.b <= 3) || !x.who || !x.occ || !x.int; }); if (bad.length) f.push('bad ' + bad[0].n);
    var a = match({ who: 'child', occ: 'birthday', b: 1, ints: ['games'] });
    if (!a.length || a.some(function (x) { return x.b > 1; })) f.push('budget filter');
    if (!a.some(function (x) { return x.n === 'Chess set'; })) f.push('chess');
    if (match({ who: 'baby', occ: 'newbaby', b: 3, ints: [] }).some(function (x) { return x.n === 'Espresso machine'; })) f.push('baby espresso');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
