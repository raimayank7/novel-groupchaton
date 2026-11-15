/* Infinity by GroupChatOn — trivia. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Trivia quiz: our own general-knowledge questions about the world in seven topics; rounds of 10 with an optional timer and a short fact after each answer. */
GCOTools.register('trivia', function (spot, T) {
  var h = T.h;
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var CATS = { g: '🌍 Geography', s: '🔬 Science', h: '🏛️ History', n: '🐾 Nature', p: '🏅 Sports & games', f: '🍲 Food & culture', m: '🔢 Numbers' };
  // topic | question | right answer | three wrong answers | a short fact (optional)
  var RAW = [
    'g|Which is the largest ocean on Earth?|Pacific Ocean|Atlantic Ocean|Indian Ocean|Arctic Ocean|The Pacific covers about a third of the planet’s surface.',
    'g|What is the capital of Australia?|Canberra|Sydney|Melbourne|Perth|Canberra was built as a compromise between Sydney and Melbourne.',
    'g|Which river flows through Cairo?|Nile|Congo|Niger|Zambezi|The Nile flows north into the Mediterranean Sea.',
    'g|Mount Everest sits on the border of Nepal and which other country?|China|India|Bhutan|Pakistan|Its peak is on the Nepal–China (Tibet) border.',
    'g|Which is the largest country by area?|Russia|Canada|China|United States|Russia spans eleven time zones.',
    'g|Which is the largest hot desert in the world?|Sahara|Gobi|Kalahari|Thar|Counting cold deserts, Antarctica is larger still.',
    'g|What is the capital of Japan?|Tokyo|Osaka|Kyoto|Hiroshima|',
    'g|Which country has the most people, according to UN estimates since 2023?|India|China|United States|Indonesia|India passed China in 2023.',
    'g|Most of the Amazon rainforest lies in which country?|Brazil|Peru|Colombia|Venezuela|About 60% of the rainforest is in Brazil.',
    'g|Which continent has the most countries?|Africa|Asia|Europe|South America|Africa has 54 countries.',
    'g|What is the capital of Canada?|Ottawa|Toronto|Vancouver|Montreal|',
    'g|Which is the longest river in Asia?|Yangtze|Ganges|Mekong|Indus|The Yangtze flows over 6,000 km across China.',
    'g|Which country is shaped like a boot?|Italy|Greece|Portugal|Chile|',
    'g|Lake Victoria is in which continent?|Africa|South America|Asia|Europe|It is shared by Uganda, Kenya and Tanzania.',
    'g|What is the capital of Kenya?|Nairobi|Mombasa|Kampala|Addis Ababa|',
    'g|The city of Marrakesh is in which country?|Morocco|Egypt|Tunisia|Algeria|',
    'g|Which strait separates Europe from Africa at its narrowest point?|Strait of Gibraltar|Bosphorus|Strait of Hormuz|Strait of Malacca|It is only about 14 km wide.',
    'g|Which is the smallest country in the world?|Vatican City|Monaco|San Marino|Liechtenstein|Vatican City covers less than half a square kilometre.',
    'g|The ancient city of Petra is in which country?|Jordan|Egypt|Turkey|Iran|Its buildings are carved into rose-red rock.',
    'g|What is the capital of Brazil?|Brasília|Rio de Janeiro|São Paulo|Salvador|Brasília became the capital in 1960.',
    'g|Which mountains are often taken as the border between Europe and Asia?|Ural Mountains|Alps|Himalayas|Andes|',
    'g|The Great Barrier Reef lies off the coast of which country?|Australia|Indonesia|Philippines|New Zealand|It is the largest coral reef system on Earth.',
    'g|Lagos is a big city in which country?|Nigeria|Ghana|Kenya|Senegal|',
    'g|What is the capital of Egypt?|Cairo|Alexandria|Luxor|Giza|',
    's|Which gas do plants take in from the air to make their food?|Carbon dioxide|Oxygen|Nitrogen|Hydrogen|Plants use sunlight to turn carbon dioxide and water into sugar.',
    's|How many planets are in our solar system?|8|7|9|10|Pluto was reclassified as a dwarf planet in 2006.',
    's|Which planet is known as the Red Planet?|Mars|Venus|Jupiter|Mercury|Iron oxide (rust) in its soil makes it look red.',
    's|What is the chemical symbol for gold?|Au|Ag|Go|Gd|It comes from the Latin word aurum.',
    's|What is the hardest natural substance?|Diamond|Iron|Quartz|Granite|',
    's|At sea level, water boils at what temperature?|100 °C|90 °C|110 °C|120 °C|High up a mountain it boils at a lower temperature.',
    's|Which organ pumps blood around the body?|Heart|Lungs|Liver|Kidneys|',
    's|How many bones does an adult human have?|206|186|226|256|Babies are born with more, some of which join together.',
    's|What is the largest planet in our solar system?|Jupiter|Saturn|Neptune|Earth|More than 1,300 Earths could fit inside it.',
    's|Which vitamin does your skin make in sunlight?|Vitamin D|Vitamin C|Vitamin A|Vitamin B12|',
    's|Light from the Sun takes about how long to reach Earth?|8 minutes|8 seconds|8 hours|8 days|About 8 minutes and 20 seconds.',
    's|H₂O is the chemical formula for what?|Water|Salt|Sugar|Ammonia|Two hydrogen atoms and one oxygen atom.',
    's|What force keeps the planets moving around the Sun?|Gravity|Magnetism|Friction|Static electricity|',
    's|What is the closest star to Earth?|The Sun|Proxima Centauri|Sirius|Polaris|The next closest, Proxima Centauri, is over 4 light years away.',
    's|Which blood cells help fight infection?|White blood cells|Red blood cells|Nerve cells|Skin cells|',
    's|What is the freezing point of water in degrees Fahrenheit?|32 °F|0 °F|100 °F|212 °F|',
    's|Which metal is liquid at room temperature?|Mercury|Iron|Aluminium|Copper|',
    's|Sound travels fastest through which of these?|Steel|Air|Water|Empty space|Sound cannot travel through empty space at all.',
    's|What do bees collect from flowers to make honey?|Nectar|Pollen|Sap|Dew|',
    's|Which planet is famous for its bright rings?|Saturn|Mars|Mercury|Venus|Its rings are made mostly of ice and rock.',
    's|How many legs does an insect have?|6|8|4|10|Spiders have 8 legs and are not insects.',
    's|What is the largest organ of the human body?|Skin|Liver|Brain|Heart|',
    's|Which gas makes up most of the air we breathe?|Nitrogen|Oxygen|Carbon dioxide|Argon|About 78% of air is nitrogen.',
    'h|Who was the first person to walk on the Moon?|Neil Armstrong|Buzz Aldrin|Yuri Gagarin|Michael Collins|He stepped onto the Moon in July 1969.',
    'h|In which year did the Second World War end?|1945|1939|1918|1950|',
    'h|Which of the Seven Wonders of the Ancient World still stands?|Great Pyramid of Giza|Hanging Gardens of Babylon|Colossus of Rhodes|Lighthouse of Alexandria|It is about 4,500 years old.',
    'h|Who painted the Mona Lisa?|Leonardo da Vinci|Michelangelo|Raphael|Vincent van Gogh|It hangs in the Louvre in Paris.',
    'h|Which empire built Machu Picchu?|Inca|Aztec|Maya|Olmec|It sits high in the Andes of Peru.',
    'h|In which year did India become independent?|1947|1950|1942|1957|Independence Day is 15 August.',
    'h|Who was the first person to travel into space?|Yuri Gagarin|Neil Armstrong|Valentina Tereshkova|Alan Shepard|He orbited Earth in April 1961.',
    'h|Who developed the theory of relativity?|Albert Einstein|Isaac Newton|Galileo Galilei|Nikola Tesla|',
    'h|Which civilisation built the Colosseum?|Romans|Greeks|Egyptians|Persians|It could hold around 50,000 people.',
    'h|Who wrote the play “Romeo and Juliet”?|William Shakespeare|Charles Dickens|Jane Austen|Homer|',
    'h|Who built the first European printing press with movable metal type?|Johannes Gutenberg|Leonardo da Vinci|Thomas Edison|Isaac Newton|Around the year 1440.',
    'h|Who was the first woman to win a Nobel Prize?|Marie Curie|Mother Teresa|Florence Nightingale|Rosalind Franklin|She won in both physics and chemistry.',
    'h|Which ship sank in 1912 after hitting an iceberg?|Titanic|Lusitania|Bismarck|Mayflower|',
    'h|Nelson Mandela became president of which country in 1994?|South Africa|Zimbabwe|Kenya|Namibia|',
    'h|Which country gave the Statue of Liberty to the United States?|France|United Kingdom|Spain|Italy|It was a gift for the USA’s 100th birthday.',
    'h|Which emperor had the Taj Mahal built?|Shah Jahan|Akbar|Babur|Aurangzeb|He built it in memory of his wife Mumtaz Mahal.',
    'h|Which city hosted the 2016 Summer Olympics?|Rio de Janeiro|London|Tokyo|Beijing|The first Olympics held in South America.',
    'h|The Great Wall was built mainly to protect which country?|China|Mongolia|Japan|Korea|',
    'n|What is the fastest land animal?|Cheetah|Lion|Horse|Greyhound|It can sprint at over 100 km/h for short bursts.',
    'n|Which is the largest animal known to have lived?|Blue whale|African elephant|Giraffe|Great white shark|It can be over 30 metres long.',
    'n|How many hearts does an octopus have?|3|1|2|4|Two pump blood to the gills, one to the rest of the body.',
    'n|What is the national bird of India?|Peacock|Parrot|Eagle|Swan|',
    'n|What do giant pandas mainly eat?|Bamboo|Fish|Grass|Fruit|They can eat over 12 kg of it a day.',
    'n|Which animal is called the “ship of the desert”?|Camel|Horse|Elephant|Donkey|',
    'n|What is a baby kangaroo called?|Joey|Cub|Kid|Calf|',
    'n|Which of these birds cannot fly?|Penguin|Sparrow|Eagle|Pigeon|Penguins “fly” underwater instead.',
    'n|What is the tallest animal?|Giraffe|Elephant|Camel|Ostrich|',
    'n|Frogs belong to which group of animals?|Amphibians|Reptiles|Mammals|Fish|Amphibians live part of their life in water and part on land.',
    'n|Which tree grows acorns?|Oak|Pine|Maple|Banyan|',
    'n|How many arms does a starfish usually have?|5|4|6|8|Some kinds have many more.',
    'n|Which mammal can truly fly?|Bat|Flying squirrel|Sugar glider|Flying lemur|The others glide rather than fly.',
    'n|What is a group of lions called?|Pride|Pack|Herd|Flock|',
    'n|Which plant’s young flower heads turn to follow the Sun?|Sunflower|Rose|Tulip|Lotus|',
    'p|How many players does a football (soccer) team have on the field?|11|10|9|12|',
    'p|In which sport do you hit a shuttlecock?|Badminton|Tennis|Squash|Table tennis|',
    'p|How many rings are on the Olympic flag?|5|4|6|7|',
    'p|In cricket, how many balls are in a standard over?|6|5|8|10|',
    'p|Which country hosted the first modern Olympic Games in 1896?|Greece|France|United Kingdom|United States|They were held in Athens.',
    'p|In chess, which piece moves only diagonally?|Bishop|Rook|Knight|King|',
    'p|How many points is a basketball shot from behind the three-point line worth?|3|2|4|1|',
    'p|A marathon is about how long?|42 km|21 km|26 km|50 km|Exactly 42.195 km.',
    'p|In tennis, what is a score of zero called?|Love|Nil|Duck|Blank|',
    'p|How many squares are on a chessboard?|64|81|100|49|',
    'p|Which sport uses the terms “birdie”, “eagle” and “par”?|Golf|Badminton|Cricket|Baseball|',
    'f|Sushi is a famous dish from which country?|Japan|China|Korea|Thailand|',
    'f|What is the main ingredient of guacamole?|Avocado|Tomato|Green pea|Cucumber|',
    'f|Paella is a rice dish from which country?|Spain|Italy|Mexico|Portugal|It comes from the Valencia region.',
    'f|Which bright yellow spice is widely used in Indian cooking?|Turmeric|Cinnamon|Clove|Cardamom|',
    'f|Which nut is used to make marzipan?|Almond|Peanut|Cashew|Walnut|',
    'f|How many strings does a standard guitar have?|6|4|5|8|',
    'f|Which instrument usually has 88 keys?|Piano|Violin|Flute|Harp|52 white keys and 36 black keys.',
    'f|Which language has the most native speakers?|Mandarin Chinese|English|Spanish|Hindi|English has the most speakers in total when learners are counted.',
    'f|What is the main language spoken in Brazil?|Portuguese|Spanish|English|French|',
    'f|Which festival is known as the festival of lights?|Diwali|Holi|Eid al-Fitr|Christmas|',
    'f|What is the currency of Japan?|Yen|Won|Yuan|Ringgit|',
    'f|Which country is famous for maple syrup?|Canada|Norway|Sweden|New Zealand|',
    'f|Pizza first became famous in which Italian city?|Naples|Rome|Milan|Venice|',
    'm|What is 12 × 12?|144|124|132|154|',
    'm|How many sides does a hexagon have?|6|5|7|8|',
    'm|What is the square root of 81?|9|8|7|11|',
    'm|How many minutes are in a day?|1,440|1,200|1,640|2,400|24 × 60 = 1,440.',
    'm|Which of these is a prime number?|13|21|27|33|A prime can only be divided by 1 and itself.',
    'm|How many days are in a leap year?|366|365|364|360|',
    'm|What is 15% of 200?|30|15|20|35|',
    'm|How many years are in a century?|100|10|50|1,000|',
    'm|How many continents are there, by the most common count?|7|5|6|8|',
    'm|How many hours are in a week?|168|144|120|186|7 × 24 = 168.',
    'm|What is 50 in Roman numerals?|L|C|D|X|',
    'm|How many zeros are in one million?|6|5|7|9|1,000,000.',
    'm|How many seconds are in an hour?|3,600|360|6,000|1,000|',
    'm|What is the sum of the angles in a triangle?|180°|90°|270°|360°|'
  ];
  var Q = RAW.map(function (line, i) { var p = line.split('|'); return { id: i, cat: p[0], q: p[1], a: p[2], wrong: p.slice(3, 6), fact: p[6] || '' }; });
  function round(cat, n, avoid) {
    var pool = Q.filter(function (x) { return cat === 'all' || x.cat === cat; }), fresh = pool.filter(function (x) { return avoid.indexOf(x.id) < 0; });
    if (fresh.length < n) fresh = pool;
    return shuffle(fresh.slice()).slice(0, n).map(function (x) { return { item: x, options: shuffle([x.a].concat(x.wrong)) }; });
  }
  var cat = T.select([['all', 'All topics']].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k]]; })), 'all');
  var timed = h('input', { type: 'checkbox', checked: T.store.get('tv-timed', false) });
  var stage = h('div', { style: 'display:grid;gap:12px;min-height:280px;align-content:start' }), out = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'font-weight:700;text-align:center;min-height:22px' });
  var R = [], at = 0, score = 0, tick = null, left = 0, answered = false, best = T.store.get('tv-best', 0);
  function start() {
    T.store.set('tv-timed', timed.checked);
    R = round(cat.value, 10, T.store.get('tv-seen', [])); at = 0; score = 0; out.textContent = ''; show();
  }
  function show() {
    clearInterval(tick); answered = false;
    var r = R[at], it = r.item; stage.innerHTML = '';
    var bar = h('div', { style: 'display:flex;justify-content:space-between;font-weight:700;color:var(--muted)' }, [h('span', { text: 'Question ' + (at + 1) + ' of ' + R.length + ' · ' + CATS[it.cat] }), h('span', { text: 'Score ' + score })]);
    var clock = h('span', { style: 'font-weight:800' });
    stage.appendChild(bar);
    stage.appendChild(h('div', { style: 'font:800 21px/1.35 var(--ui)', text: it.q }));
    var opts = h('div', { style: 'display:grid;gap:8px' });
    r.options.forEach(function (o, i) { opts.appendChild(h('button', { type: 'button', 'class': 'tbtn', 'data-o': o, style: 'justify-content:flex-start;text-align:left;font-weight:700;padding:12px 14px;white-space:normal', onclick: function () { pick(o); } }, [(i + 1) + '.  ' + o])); });
    stage.appendChild(opts);
    if (timed.checked) { left = 20; clock.textContent = '⏱ 20'; stage.appendChild(clock); tick = setInterval(function () { left--; clock.textContent = '⏱ ' + left; if (left <= 0) pick(null); }, 1000); }
  }
  function pick(o) {
    if (answered) return; answered = true; clearInterval(tick);
    var r = R[at], ok = o === r.item.a;
    if (ok) score++;
    var seen = T.store.get('tv-seen', []); seen.push(r.item.id); T.store.set('tv-seen', seen.slice(-80));
    Array.prototype.forEach.call(stage.querySelectorAll('[data-o]'), function (b) {
      var v = b.getAttribute('data-o'); b.disabled = true;
      if (v === r.item.a) { b.style.background = '#16a34a'; b.style.color = '#fff'; b.style.opacity = '1'; }
      else if (v === o) { b.style.background = '#dc2626'; b.style.color = '#fff'; b.style.opacity = '1'; }
    });
    stage.appendChild(h('div', { 'aria-live': 'polite', style: 'padding:10px 12px;border-radius:12px;background:var(--surface-2)' }, [h('b', { text: ok ? '✓ Correct! ' : o === null ? '⏱ Time’s up. ' : '✕ Not quite. ' }), (ok ? '' : 'The answer is ' + r.item.a + '. ') + r.item.fact]));
    stage.appendChild(T.button(at + 1 < R.length ? 'Next question' : 'See my score', { primary: true, onclick: next }));
  }
  function next() {
    at++;
    if (at < R.length) { show(); return; }
    var rec = score > best; if (rec) { best = score; T.store.set('tv-best', best); }
    stage.innerHTML = '';
    stage.appendChild(h('div', { style: 'font:900 48px/1 var(--ui);text-align:center', text: score + ' / ' + R.length }));
    stage.appendChild(h('p', { style: 'text-align:center', text: score >= 9 ? 'Brilliant: a true quiz champion!' : score >= 7 ? 'Great score!' : score >= 5 ? 'Not bad at all.' : 'Keep playing: every round teaches something new.' }));
    stage.appendChild(T.row([T.button('Play another round', { primary: true, onclick: start }), T.button('Share score', { small: true, onclick: function () { T.copy('I scored ' + score + '/' + R.length + ' in the Infinity trivia quiz! Try it: ' + location.href.split('#')[0], this); } })]));
    out.textContent = 'You scored ' + score + ' out of ' + R.length + (rec ? ': a new personal best!' : '. Your best: ' + best + '.');
  }
  document.addEventListener('keydown', function (e) {
    if (!/^[1-4]$/.test(e.key) || !(document.activeElement === document.body || spot.contains(document.activeElement))) return;
    var b = stage.querySelectorAll('[data-o]')[+e.key - 1]; if (b && !answered) b.click();
  });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Topic', cat), h('label', { 'class': 'tcheck', style: 'align-self:end' }, [timed, ' 20-second timer'])]),
    T.row([T.button('Start a round', { primary: true, onclick: start })]), stage, out,
    h('p', { 'class': 'tstatus', text: Q.length + ' questions written by us, ' + Object.keys(CATS).length + ' topics. Keys 1–4 answer on a keyboard.' })]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  start();
  T.tests['trivia'] = function () {
    var f = [], texts = {};
    Q.forEach(function (x) {
      var o = [x.a].concat(x.wrong);
      if (!CATS[x.cat]) f.push('topic ' + x.q);
      if (o.length !== 4 || o.some(function (v, i) { return !v || o.indexOf(v) !== i; })) f.push('options ' + x.q);
      if (texts[x.q]) f.push('repeat ' + x.q); texts[x.q] = 1;
    });
    var r = round('s', 10, []);
    if (r.length !== 10 || r.some(function (x) { return x.item.cat !== 's' || x.options.indexOf(x.item.a) < 0; })) f.push('round');
    if (Q.length < 100) f.push('only ' + Q.length + ' questions');
    return Promise.resolve({ ok: !f.length, n: Q.length + 2, fails: f.slice(0, 5) });
  };
});
