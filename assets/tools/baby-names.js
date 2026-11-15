/* Infinity by GroupChatOn — baby-names. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Baby name ideas from many cultures, with meanings: filter by culture, boy or girl, first letter or meaning, pick at random, and keep a shortlist. */
GCOTools.register('baby-names', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var DATA = {
    'Hindu / Sanskrit': ['b', 'Aarav:peaceful|Arjun:bright, shining; the hero of the Mahabharata|Vihaan:dawn, the start of a new day|Aditya:the sun|Krishna:dark; a beloved Hindu god|Rohan:ascending, rising|Ishaan:the sun; lord of the north-east|Kabir:great; the name of a poet-saint|Dhruv:steadfast; the pole star|Om:the sacred sound|Advait:unique, without a second|Shaurya:bravery',
      'g', 'Ananya:unique, without equal|Diya:lamp|Saanvi:a name of Goddess Lakshmi|Aditi:boundless; mother of the gods|Priya:beloved|Kavya:poetry|Tara:star|Pooja:worship, prayer|Lakshmi:goddess of wealth and good fortune|Ira:the earth; a name of Saraswati|Myra:beloved|Navya:new, young'],
    'Sikh / Punjabi': ['u', 'Gurpreet:love of the Guru|Manpreet:love of the heart|Amrit:nectar of immortality|Jaspreet:love of praise (of God)',
      'b', 'Arjan:named after Guru Arjan Dev|Gurdeep:lamp of the Guru|Harjot:light of God|Amardeep:everlasting lamp|Navjot:new light|Ranbir:brave in battle|Sukhdeep:lamp of peace|Tegbir:brave with the sword',
      'g', 'Simran:remembrance of God|Harleen:absorbed in God|Jasleen:absorbed in God’s praise|Gurleen:absorbed in the Guru|Navneet:ever new|Kirandeep:lamp of light rays|Sukhmani:jewel of peace; a Sikh prayer|Mehtab:moonlight'],
    'Muslim / Arabic': ['b', 'Muhammad:praised, praiseworthy|Ali:high, exalted|Umar:long-lived, flourishing|Yusuf:the prophet Joseph|Ibrahim:the prophet Abraham|Ayaan:gift of God|Zayd:growth, abundance|Hamza:strong, steadfast|Rayyan:well-watered; a gate of Paradise|Idris:a prophet; studious',
      'g', 'Aisha:alive, living|Maryam:Mary, mother of Jesus|Zainab:a fragrant flowering tree|Noor:light|Amira:princess, leader|Inaya:care, concern|Hana:happiness, bliss|Layla:night|Aaliyah:high, exalted|Fatima:the daughter of the Prophet'],
    'English / Christian': ['b', 'Oliver:olive tree|James:from Jacob, “held by the heel”|William:resolute protector|Henry:ruler of the home|Jack:God is gracious|Noah:rest, comfort|George:farmer|Thomas:twin|Daniel:God is my judge|Samuel:heard by God',
      'g', 'Olivia:olive tree|Amelia:work, industrious|Charlotte:free (feminine of Charles)|Grace:grace, kindness|Lily:the lily flower|Ruby:the red gemstone|Isla:island|Emily:rival, eager|Florence:flourishing|Evelyn:wished-for child'],
    'Hebrew / Jewish': ['b', 'David:beloved|Eli:ascended; my God|Ari:lion|Benjamin:son of the right hand|Levi:joined, attached|Asher:happy, blessed|Ezra:help|Gabriel:God is my strength|Nathan:he gave|Jonah:dove',
      'g', 'Abigail:my father’s joy|Naomi:pleasantness|Eliana:my God has answered|Talia:dew from God|Shira:song|Ruth:friend, companion|Esther:star|Hannah:grace, favour|Leah:delicate|Maya:water'],
    'Irish / Gaelic': ['b', 'Liam:resolute protector|Conor:lover of hounds|Cian:ancient, enduring|Finn:fair, bright|Oisín:little deer|Rónán:little seal|Seán:God is gracious|Darragh:oak tree|Patrick:nobleman|Eoin:God is gracious',
      'g', 'Aoife:beauty, radiance|Saoirse:freedom|Niamh:bright, radiant|Ciara:dark-haired|Róisín:little rose|Siobhán:God is gracious|Caoimhe:gentle, precious|Orla:golden princess|Erin:Ireland|Clodagh:named after a river'],
    'Spanish / Latin American': ['b', 'Mateo:gift of God|Santiago:Saint James|Alejandro:defender of the people|Javier:new house|Carlos:free man|Pablo:small, humble|Andrés:manly, brave|Diego:a form of James|Lucas:from Lucania|Emiliano:eager, rival',
      'g', 'Sofía:wisdom|Valentina:strong, healthy|Lucía:light|Isabella:God is my oath|Camila:helper at the altar|Martina:of Mars|Elena:bright light|Paloma:dove|Mariana:of Mary|Esperanza:hope'],
    'French': ['b', 'Louis:famous warrior|Hugo:mind, intellect|Jules:youthful|Léo:lion|Raphaël:God heals|Théo:gift of God|Gabriel:God is my strength|Arthur:bear; noble|Mathis:gift of God|Gaspard:treasurer',
      'g', 'Chloé:green shoot, blooming|Camille:helper at the altar|Juliette:youthful|Manon:a French form of Mary|Inès:pure, holy|Margaux:pearl|Élise:pledged to God|Amélie:hard-working|Céline:heavenly|Zoé:life'],
    'Italian': ['b', 'Leonardo:brave as a lion|Francesco:free; Frenchman|Lorenzo:from Laurentum; laurel|Giovanni:God is gracious|Matteo:gift of God|Riccardo:brave ruler|Marco:of Mars|Luca:from Lucania|Enzo:ruler of the home|Dante:enduring',
      'g', 'Giulia:youthful|Aurora:dawn|Bianca:white, pure|Chiara:clear, bright|Francesca:free|Alessia:defender|Gioia:joy|Serena:calm, serene|Vittoria:victory|Beatrice:she who brings happiness'],
    'Greek': ['b', 'Alexandros:defender of the people|Nikolaos:victory of the people|Theodoros:gift of God|Leonidas:son of the lion|Christos:the anointed one|Stavros:cross|Andreas:manly, brave|Philippos:lover of horses|Georgios:farmer|Dimitrios:devoted to Demeter',
      'g', 'Sofia:wisdom|Eleni:torch, light|Zoe:life|Irene:peace|Penelope:weaver|Athena:goddess of wisdom|Daphne:laurel|Kalliope:beautiful voice|Thalia:to blossom|Despina:lady'],
    'German / Nordic': ['b', 'Felix:lucky, happy|Emil:eager, rival|Anton:priceless|Erik:ever-ruler|Leif:heir, descendant|Axel:father of peace|Magnus:great|Oskar:spear of the gods|Henrik:ruler of the home|Bjørn:bear',
      'g', 'Emma:whole, universal|Freya:lady; Norse goddess of love|Ingrid:beautiful, beloved|Astrid:divinely beautiful|Greta:pearl|Liv:life|Elsa:pledged to God|Sigrid:beautiful victory|Hanna:grace|Maja:a Nordic form of Maria'],
    'Japanese': ['b', 'Haruto:sun + soar (depends on kanji)|Ren:lotus; love|Sora:sky|Riku:land|Takumi:artisan, skilled|Kaito:sea + soar|Hiroshi:generous|Daiki:great radiance|Yuto:gentle + soar|Kenji:healthy, strong + second son',
      'g', 'Sakura:cherry blossom|Hana:flower|Yui:to bind, tie|Aoi:hollyhock; blue|Hinata:sunny place|Akari:light, brightness|Emi:blessed with beauty|Kaori:fragrance|Mei:sprout; bud|Miyu:beautiful + gentle (depends on kanji)'],
    'Chinese': ['b', 'Wei:great; strength|Jun:handsome, talented|Hao:vast, grand|Ming:bright|Jian:healthy, strong|Long:dragon|Bo:broad, learned|Zhi:will, ambition|Tao:great waves|Yu:jade; universe (depends on character)',
      'g', 'Mei:beautiful|Li:beautiful; jasmine|Xiu:elegant, graceful|Lan:orchid|Ying:clever; cherry|Hua:flower|Jing:quiet, still|Fang:fragrant|Yan:swallow (bird); beautiful|Xin:heart; joy'],
    'African': ['b', 'Jabari:brave (Swahili)|Kofi:born on Friday (Akan, Ghana)|Kwame:born on Saturday (Akan)|Chidi:God exists (Igbo)|Sipho:gift (Zulu)|Baraka:blessing (Swahili)|Femi:love me (Yoruba)|Obi:heart (Igbo)|Themba:hope (Zulu, Xhosa)|Tendai:be thankful (Shona)',
      'g', 'Amara:grace (Igbo)|Zuri:beautiful (Swahili)|Imani:faith (Swahili)|Ama:born on Saturday (Akan)|Ayo:joy (Yoruba)|Nia:purpose (Swahili)|Thandiwe:beloved (Zulu, Xhosa)|Adaeze:princess, king’s daughter (Igbo)|Makena:happy one (Kikuyu)|Ayana:beautiful flower (Amharic)'],
    'Persian': ['b', 'Arash:the hero archer of Persian legend|Dariush:he who holds firm to the good|Kian:king, royal|Kourosh:Cyrus; sun|Parsa:pious, devout|Rostam:the hero of the Shahnameh|Navid:good news|Babak:little father|Arman:wish, hope|Farhad:helper, invincible',
      'g', 'Shirin:sweet|Yasmin:jasmine|Roxana:bright, dawn|Laleh:tulip|Parisa:like a fairy|Setareh:star|Nasrin:wild rose|Darya:sea|Mahsa:like the moon|Ava:voice, sound'],
    'Tamil / South Indian': ['b', 'Arun:dawn, the rising sun|Karthik:a name of Lord Murugan|Senthil:a name of Lord Murugan|Vetri:victory|Ilango:prince|Mani:jewel|Surya:the sun|Anbu:love, kindness|Sriram:Lord Rama|Elan:youth, young',
      'g', 'Kayal:fish; beautiful eyes|Meenakshi:fish-eyed; a goddess|Tamizh:Tamil, the language|Nila:moon|Malar:flower|Kavya:poetry|Yazhini:musical, like the yazh harp|Anjali:offering with folded hands|Keerthana:hymn of praise|Divya:divine']
  };
  var ALL = [];
  Object.keys(DATA).forEach(function (c) { var v = DATA[c]; for (var i = 0; i < v.length; i += 2) v[i + 1].split('|').forEach(function (s) { var j = s.indexOf(':'); ALL.push({ n: s.slice(0, j), m: s.slice(j + 1), g: v[i], c: c }); }); });
  function strip(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function filter(o) {
    return ALL.filter(function (x) {
      if (o.c && x.c !== o.c) return false;
      if (o.g && x.g !== o.g && x.g !== 'u') return false;
      if (o.l && strip(x.n).charAt(0) !== o.l.toLowerCase()) return false;
      if (o.q && strip(x.n + ' ' + x.m).indexOf(strip(o.q)) < 0) return false;
      return true;
    });
  }
  var fav = T.store.get('baby-fav', []);
  var cult = T.select([['', 'All cultures (' + ALL.length + ' names)']].concat(Object.keys(DATA).map(function (c) { return [c, c]; })), ''), gender = 'b';
  var letter = T.select([['', 'Any letter']].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (l) { return [l, l]; })), ''), q = h('input', { type: 'search', placeholder: 'Meaning or name: light, brave, flower…', 'aria-label': 'Search names or meanings' });
  var list = h('div', { 'class': 'tlist', style: 'grid-template-columns:minmax(0,1fr)' }), info = h('p', { 'class': 'tnote', 'aria-live': 'polite' }), favBox = h('div', { 'class': 'trow' }), pick = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 26px/1.3 var(--ui);min-height:34px' });
  function opts() { return { c: cult.value, g: gender === 'a' ? '' : gender, l: letter.value, q: q.value.trim() }; }
  function row(x) {
    var on = fav.indexOf(x.n) >= 0;
    return h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: x.g === 'b' ? '👦' : x.g === 'g' ? '👧' : '🧒' }),
      h('span', { 'class': 'titem-main' }, [h('b', { text: x.n }), h('small', { text: x.m + ' · ' + x.c })]),
      h('button', { type: 'button', 'aria-pressed': String(on), 'aria-label': (on ? 'Remove ' : 'Save ') + x.n, title: on ? 'Remove from shortlist' : 'Add to shortlist', text: on ? '★' : '☆', style: 'font-size:20px;color:' + (on ? '#f59e0b' : 'inherit'),
        onclick: function () { var i = fav.indexOf(x.n); if (i >= 0) fav.splice(i, 1); else fav.push(x.n); T.store.set('baby-fav', fav); draw(); } })]);
  }
  function draw() {
    var r = filter(opts()); list.innerHTML = '';
    r.slice(0, 120).forEach(function (x) { list.appendChild(row(x)); });
    info.textContent = r.length ? r.length + ' name' + (r.length === 1 ? '' : 's') + (r.length > 120 ? ' (first 120 shown: narrow it down with a letter or culture)' : '') : 'No names match. Try another letter, culture or meaning.';
    favBox.innerHTML = '';
    if (fav.length) { favBox.appendChild(h('b', { text: '★ Shortlist: ' })); fav.forEach(function (n) { favBox.appendChild(h('span', { style: 'padding:3px 10px;border-radius:999px;background:var(--accent-soft);font-weight:600', text: n })); }); }
  }
  function random() { var r = filter(opts()); if (!r.length) { status.error('No names match these filters.'); return; } var x = r[rnd(r.length)]; pick.textContent = '✨ ' + x.n; status.info(x.n + ': ' + x.m + ' (' + x.c + ')'); }
  [cult, letter].forEach(function (x) { x.addEventListener('change', draw); }); q.addEventListener('input', draw);
  var cp = T.button('Copy shortlist', { small: true, onclick: function () { T.copy(fav.join(', '), cp); } });
  spot.appendChild(T.card([T.seg([['b', 'Boy'], ['g', 'Girl'], ['a', 'Any']], 'b', function (v) { gender = v; draw(); }),
    h('div', { 'class': 'tgrid2' }, [T.field('Culture', cult), T.field('Starts with', letter)]), q,
    T.row([T.button('Pick a random name', { primary: true, onclick: random }), T.button('Try a sample', { small: true, onclick: random }), cp]), pick, status.el, favBox, info, list,
    h('p', { 'class': 'tnote', text: 'Meanings are the most common ones; many names have several. Japanese and Chinese meanings depend on the characters chosen, so check them with family or a native speaker.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  draw();
  T.tests['baby-names'] = function () {
    var f = [];
    if (ALL.length < 300) f.push('only ' + ALL.length);
    if (!filter({ c: 'Hindu / Sanskrit', g: 'g', l: 'A' }).some(function (x) { return x.n === 'Aditi'; })) f.push('Aditi');
    if (filter({ q: 'light' }).length < 5) f.push('meaning search');
    if (!filter({ g: 'b', c: 'Sikh / Punjabi' }).some(function (x) { return x.n === 'Gurpreet'; })) f.push('unisex in boys');
    if (!filter({ l: 'O', q: 'deer' }).some(function (x) { return x.n === 'Oisín'; })) f.push('accent letter');
    var bad = ALL.filter(function (x) { return !x.n || !x.m; }); if (bad.length) f.push('blank ' + bad.length);
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
