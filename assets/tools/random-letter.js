/* Infinity by GroupChatOn — random-letter. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Random letter, word or country picker for games like Scattergories, Pictionary and quiz rounds, with no-repeat draws. */
GCOTools.register('random-letter', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  var ALPHA = {
    en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', easy: 'ABCDEFGHIJKLMNOPRSTW', vow: 'AEIOU', con: 'BCDFGHJKLMNPQRSTVWXYZ',
    hi: 'अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह', gr: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ', ru: 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ', ar: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
  };
  var WORDS = ('apple,anchor,airplane,ant,balloon,banana,bicycle,bridge,butterfly,camera,candle,castle,cat,clock,cloud,crown,dinosaur,doctor,dog,dragon,drum,eagle,egg,elephant,engine,feather,fire,fish,flower,football,fork,frog,garden,ghost,giraffe,glasses,guitar,hammer,helicopter,horse,house,ice cream,island,jacket,jungle,kangaroo,key,kite,ladder,lamp,lemon,lighthouse,lion,map,mirror,monkey,moon,mountain,mushroom,necklace,nest,ocean,octopus,owl,paint,parrot,pencil,penguin,piano,pirate,pizza,planet,rabbit,rain,rainbow,robot,rocket,river,sandwich,scissors,shark,ship,shoe,snake,snowman,spider,star,sun,sunflower,teacher,telephone,tent,tiger,tomato,train,treasure,tree,truck,umbrella,unicorn,violin,volcano,waterfall,whale,window,wizard,yacht,zebra,cricket bat,rickshaw,kettle,mango,peacock,temple,camel,cactus,snail,sock,toothbrush,trophy,turtle,waiter,wheel,watch,zip').split(',');
  var COUNTRIES = ('Afghanistan,Albania,Algeria,Andorra,Angola,Antigua and Barbuda,Argentina,Armenia,Australia,Austria,Azerbaijan,Bahamas,Bahrain,Bangladesh,Barbados,Belarus,Belgium,Belize,Benin,Bhutan,Bolivia,Bosnia and Herzegovina,Botswana,Brazil,Brunei,Bulgaria,Burkina Faso,Burundi,Cabo Verde,Cambodia,Cameroon,Canada,Central African Republic,Chad,Chile,China,Colombia,Comoros,Congo,Costa Rica,Côte d’Ivoire,Croatia,Cuba,Cyprus,Czechia,Democratic Republic of the Congo,Denmark,Djibouti,Dominica,Dominican Republic,Ecuador,Egypt,El Salvador,Equatorial Guinea,Eritrea,Estonia,Eswatini,Ethiopia,Fiji,Finland,France,Gabon,Gambia,Georgia,Germany,Ghana,Greece,Grenada,Guatemala,Guinea,Guinea-Bissau,Guyana,Haiti,Honduras,Hungary,Iceland,India,Indonesia,Iran,Iraq,Ireland,Israel,Italy,Jamaica,Japan,Jordan,Kazakhstan,Kenya,Kiribati,Kuwait,Kyrgyzstan,Laos,Latvia,Lebanon,Lesotho,Liberia,Libya,Liechtenstein,Lithuania,Luxembourg,Madagascar,Malawi,Malaysia,Maldives,Mali,Malta,Marshall Islands,Mauritania,Mauritius,Mexico,Micronesia,Moldova,Monaco,Mongolia,Montenegro,Morocco,Mozambique,Myanmar,Namibia,Nauru,Nepal,Netherlands,New Zealand,Nicaragua,Niger,Nigeria,North Korea,North Macedonia,Norway,Oman,Pakistan,Palau,Palestine,Panama,Papua New Guinea,Paraguay,Peru,Philippines,Poland,Portugal,Qatar,Romania,Russia,Rwanda,Saint Kitts and Nevis,Saint Lucia,Saint Vincent and the Grenadines,Samoa,San Marino,São Tomé and Príncipe,Saudi Arabia,Senegal,Serbia,Seychelles,Sierra Leone,Singapore,Slovakia,Slovenia,Solomon Islands,Somalia,South Africa,South Korea,South Sudan,Spain,Sri Lanka,Sudan,Suriname,Sweden,Switzerland,Syria,Tajikistan,Tanzania,Thailand,Timor-Leste,Togo,Tonga,Trinidad and Tobago,Tunisia,Turkey,Turkmenistan,Tuvalu,Uganda,Ukraine,United Arab Emirates,United Kingdom,United States,Uruguay,Uzbekistan,Vanuatu,Vatican City,Venezuela,Vietnam,Yemen,Zambia,Zimbabwe').split(',');
  var kind = 'letter', bag = [], past = [];
  var alpha = T.select([['en', 'English A–Z'], ['easy', 'English, no hard letters (Q, U, V, X, Y, Z)'], ['vow', 'Vowels only'], ['con', 'Consonants only'], ['hi', 'Hindi (Devanagari)'], ['ar', 'Arabic'], ['gr', 'Greek'], ['ru', 'Russian (Cyrillic)']], 'en');
  var noRep = h('input', { type: 'checkbox', checked: true }), count = T.select([1, 2, 3, 5, 10].map(function (x) { return [x, x + ' at a time']; }), 1);
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:900 72px/1.15 var(--ui);min-height:90px;overflow-wrap:anywhere', text: '?' });
  var log = h('textarea', { rows: '3', 'class': 'tout', readonly: true, 'aria-label': 'Picked so far' });
  function pool() { return kind === 'letter' ? Array.from(ALPHA[alpha.value]) : kind === 'word' ? WORDS : COUNTRIES; }
  function draw1(p) {
    if (!noRep.checked) return p[rnd(p.length)];
    if (!bag.length) { bag = p.slice(); if (past.length) status.info('Every item has been picked once, so the list starts again.'); }
    return bag.splice(rnd(bag.length), 1)[0];
  }
  function go() {
    var p = pool(), n = +count.value, out = [];
    for (var i = 0; i < n; i++) out.push(draw1(p));
    big.textContent = out.join(kind === 'letter' ? '  ' : ' · ');
    big.style.fontSize = kind === 'letter' && n <= 3 ? '72px' : n === 1 ? '40px' : '26px';
    past = out.concat(past).slice(0, 200); log.value = past.join(', ');
  }
  function reset() { bag = []; past = []; log.value = ''; big.textContent = '?'; status.clear(); }
  var alphaField = T.field('Alphabet', alpha);
  alpha.addEventListener('change', reset);
  spot.appendChild(T.card([T.seg([['letter', 'Letter'], ['word', 'Word'], ['country', 'Country']], 'letter', function (v) { kind = v; alphaField.hidden = v !== 'letter'; reset(); }),
    h('div', { 'class': 'tgrid2' }, [alphaField, T.field('How many', count)]), h('label', { 'class': 'tcheck' }, [noRep, ' No repeats until everything has been picked']),
    big, T.row([T.button('Pick', { primary: true, onclick: go }), T.button('Try a sample', { small: true, onclick: go }), T.button('Start again', { small: true, onclick: reset })]), status.el, T.field('Picked so far (newest first)', log)]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['random-letter'] = function () {
    var f = [], seen = {};
    bag = []; for (var i = 0; i < 26; i++) seen[draw1(Array.from(ALPHA.en))] = 1;
    if (Object.keys(seen).length !== 26) f.push('no-repeat draw missed letters');
    if (COUNTRIES.length !== 195) f.push('countries ' + COUNTRIES.length);
    if (Array.from(ALPHA.hi).length !== 43) f.push('hindi ' + Array.from(ALPHA.hi).length);
    bag = [];
    return Promise.resolve({ ok: !f.length, n: 3, fails: f });
  };
});
