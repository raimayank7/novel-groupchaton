/* Infinity by GroupChatOn — what-to-eat. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* What should I eat? A fair random pick from about 140 dishes from around the world, filtered by meal, diet, cuisine and effort, or from your own list. */
GCOTools.register('what-to-eat', function (spot, T) {
  var h = T.h, status = T.status();
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  // dish | cuisine | diet v vegetarian, vg vegan, e egg, n non-veg | meals b l d s | effort q quick, c cook, o order out
  var D = ('Poha|in|vg|b|q;Upma|in|v|b|q;Aloo paratha with curd|in|v|bl|c;Masala dosa|in|vg|bl|co;Idli sambar|in|vg|b|co;Chole bhature|in|v|l|co;Rajma chawal|in|vg|ld|c;Dal tadka with jeera rice|in|v|ld|c;Paneer butter masala with naan|in|v|ld|co;Palak paneer with roti|in|v|ld|c;Vegetable biryani|in|v|ld|co;Chicken biryani|in|n|ld|co;Butter chicken|in|n|d|co;Fish curry and rice|in|n|ld|c;Egg curry|in|e|ld|c;Masala omelette with toast|in|e|b|q;Pav bhaji|in|v|lds|c;Vada pav|in|vg|s|o;Pani puri|in|vg|s|o;Samosa with chutney|in|vg|s|o;Khichdi with ghee|in|v|ld|q;Kadhi chawal|in|v|l|c;Aloo gobi with roti|in|vg|ld|c;Baingan bharta|in|vg|ld|c;Thali|in|v|l|o;Pongal|in|v|b|c;Uttapam|in|vg|b|c;Appam with stew|in|vg|bd|c;Hyderabadi haleem|in|n|d|o;Kathi roll|in|n|ls|o;Paneer tikka|in|v|ds|c;Aloo tikki chaat|in|v|s|o;Dhokla|in|v|bs|c;Misal pav|in|vg|bl|c;Sabudana khichdi|in|v|b|c;Chicken tikka masala|in|n|d|o;Mutton rogan josh|in|n|d|c;Prawn masala|in|n|ld|c;Lemon rice|in|vg|l|q;Curd rice|in|v|l|q;Bisi bele bath|in|v|ld|c;Momos|np|v|s|o;Thukpa|np|n|ld|c;Dal bhat|np|vg|ld|c' +
    ';Fried rice|cn|e|ld|q;Hakka noodles|cn|vg|ld|q;Chilli paneer|cn|v|d|c;Manchurian with fried rice|cn|vg|d|o;Kung pao chicken|cn|n|d|c;Dumplings|cn|n|ls|o;Hot and sour soup|cn|vg|ds|q;Mapo tofu|cn|vg|d|c;Sweet and sour chicken|cn|n|d|o;Dim sum|cn|n|ls|o' +
    ';Margherita pizza|it|v|lds|o;Pasta arrabbiata|it|vg|ld|q;Spaghetti carbonara|it|n|ld|q;Pesto pasta|it|v|ld|q;Lasagne|it|n|d|c;Mushroom risotto|it|v|d|c;Minestrone soup|it|vg|ld|c;Bruschetta|it|vg|s|q;Gnocchi with tomato sauce|it|v|d|c' +
    ';Tacos|mx|n|lds|c;Bean burrito|mx|vg|ld|q;Quesadilla|mx|v|ls|q;Nachos with salsa and guacamole|mx|v|s|q;Burrito bowl|mx|vg|ld|c;Enchiladas|mx|n|d|c;Huevos rancheros|mx|e|b|c;Chicken fajitas|mx|n|d|c' +
    ';Hummus with pita and salad|me|vg|ls|q;Falafel wrap|me|vg|ls|o;Chicken shawarma|me|n|lds|o;Lentil soup|me|vg|ld|c;Shakshuka|me|e|bl|q;Mixed grill with rice|me|n|d|o;Tabbouleh salad|me|vg|l|q;Mandi rice with lamb|me|n|ld|o;Za’atar manakish|me|v|bs|o' +
    ';Pad thai|th|n|ld|c;Green curry with rice|th|n|d|c;Vegetable red curry|th|v|d|c;Tom yum soup|th|n|ds|c;Mango sticky rice|th|vg|s|o;Thai basil chicken with egg|th|n|ld|q' +
    ';Sushi|jp|n|ld|o;Ramen|jp|n|ld|o;Vegetable tempura|jp|e|ds|c;Chicken teriyaki bowl|jp|n|ld|c;Miso soup with rice|jp|n|bd|q;Okonomiyaki|jp|n|d|c;Japanese curry rice|jp|n|d|c;Katsu curry|jp|n|d|o;Teriyaki tofu bowl|jp|vg|ld|c' +
    ';Bibimbap|kr|n|ld|c;Kimchi fried rice|kr|n|ld|q;Korean fried chicken|kr|n|ds|o;Tteokbokki|kr|n|s|c' +
    ';Pho|vn|n|bld|o;Banh mi|vn|n|ls|o;Fresh spring rolls|vn|vg|ls|c' +
    ';Cheeseburger and fries|us|n|ld|o;Veggie burger|us|v|ld|o;Mac and cheese|us|v|ld|q;Pancakes with honey|us|e|b|q;BBQ chicken wings|us|n|ds|c;Grilled cheese sandwich|us|v|bls|q;Caesar salad|us|n|l|q;Chicken soup|us|n|ld|c' +
    ';Fish and chips|uk|n|ld|o;Full English breakfast|uk|n|b|c;Jacket potato with beans|uk|v|ld|q;Shepherd’s pie|uk|n|d|c;Cheese and pickle sandwich|uk|v|l|q' +
    ';Avocado toast|ww|vg|bl|q;Scrambled eggs on toast|ww|e|b|q;Overnight oats with fruit|ww|v|b|q;Fruit smoothie bowl|ww|vg|b|q;Greek salad|gr|v|l|q;Chicken souvlaki|gr|n|ld|o;Spinach and feta pie|gr|v|ld|c' +
    ';Jollof rice|af|n|ld|c;Injera with lentil stew|af|v|ld|o;Bunny chow|af|n|l|o;Chicken tagine with couscous|af|n|d|c;Vegetable couscous|af|vg|ld|c' +
    ';Nasi goreng|id|n|bld|q;Chicken satay with peanut sauce|id|n|ds|c;Gado-gado|id|v|l|c;Nasi lemak|my|n|bl|o;Laksa|my|n|ld|o' +
    ';Paella|es|n|ld|c;Spanish omelette|es|e|bl|c;Patatas bravas|es|vg|s|c;Crêpes|fr|e|bs|q;French onion soup|fr|n|d|c;Quiche|fr|e|l|c' +
    ';Sandwich with whatever is in the fridge|ww|v|lds|q;Instant noodles with a fried egg|ww|e|lds|q;Leftovers, reinvented|ww|v|ld|q;Fruit and yoghurt|ww|v|bs|q;Soup and toast|ww|vg|ld|q;Big salad with beans|ww|vg|l|q').split(';').map(function (s) { var p = s.split('|'); return { n: p[0], c: p[1], d: p[2], m: p[3], e: p[4] }; });
  var CUIS = [['', 'Any cuisine'], ['in', 'Indian'], ['np', 'Nepali / Tibetan'], ['cn', 'Chinese / Indo-Chinese'], ['it', 'Italian'], ['mx', 'Mexican'], ['me', 'Middle Eastern'], ['th', 'Thai'], ['jp', 'Japanese'], ['kr', 'Korean'], ['vn', 'Vietnamese'], ['us', 'American'], ['uk', 'British'], ['gr', 'Greek'], ['es', 'Spanish'], ['fr', 'French'], ['af', 'African'], ['id', 'Indonesian'], ['my', 'Malaysian'], ['ww', 'Simple / anywhere']];
  var DIET = { any: 'Anything', v: 'Vegetarian', vg: 'Vegan', e: 'Eggs OK, no meat' };
  function ok(x, o) {
    if (o.c && x.c !== o.c) return false;
    if (o.meal && x.m.indexOf(o.meal) < 0) return false;
    if (o.e && x.e.indexOf(o.e) < 0) return false;
    if (o.diet === 'vg' && x.d !== 'vg') return false;
    if (o.diet === 'v' && x.d !== 'v' && x.d !== 'vg') return false;
    if (o.diet === 'e' && x.d === 'n') return false;
    if (o.no && o.no.indexOf(x.n) >= 0) return false;
    return true;
  }
  var cu = T.select(CUIS, ''), meal = T.select([['', 'Any meal'], ['b', 'Breakfast'], ['l', 'Lunch'], ['d', 'Dinner'], ['s', 'Snack']], (function () { var hr = new Date().getHours(); return hr < 11 ? 'b' : hr < 16 ? 'l' : hr < 18 ? 's' : 'd'; })());
  var diet = T.select(Object.keys(DIET).map(function (k) { return [k, DIET[k]]; }), T.store.get('eat-diet', 'any')), effort = T.select([['', 'Any effort'], ['q', 'Quick (about 15 min)'], ['c', 'I will cook'], ['o', 'Order or eat out']], '');
  var mine = h('textarea', { rows: '4', placeholder: 'Or type your own options, one per line', 'aria-label': 'Your own options' }), useMine = h('input', { type: 'checkbox' });
  mine.value = T.store.get('eat-mine', '');
  var big = h('div', { 'data-out': '', 'aria-live': 'polite', style: 'text-align:center;font:800 30px/1.3 var(--ui);min-height:44px', text: '🍽️ ?' }), also = h('p', { 'class': 'tnote', style: 'text-align:center' }), skip = [];
  function o() { return { c: cu.value, meal: meal.value, diet: diet.value, e: effort.value, no: skip }; }
  function decide() {
    T.store.set('eat-diet', diet.value);
    if (useMine.checked) {
      var m = mine.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean); T.store.set('eat-mine', mine.value);
      if (m.length < 2) { status.error('Type at least two options of your own.'); return; }
      big.textContent = '🍽️ ' + m[rnd(m.length)]; also.textContent = ''; status.clear(); return;
    }
    var r = D.filter(function (x) { return ok(x, o()); });
    if (!r.length) { skip = []; r = D.filter(function (x) { return ok(x, o()); }); }
    if (!r.length) { status.error('Nothing fits all of those. Choose “Any cuisine” or “Any effort”.'); return; }
    var i = rnd(r.length), x = r[i]; r.splice(i, 1);
    big.textContent = '🍽️ ' + x.n; status.clear();
    var alt = []; while (r.length && alt.length < 3) alt.push(r.splice(rnd(r.length), 1)[0].n);
    also.textContent = alt.length ? 'Or: ' + alt.join(' · ') : '';
    big.dataset.last = x.n;
  }
  [cu, meal, diet, effort].forEach(function (x) { x.addEventListener('change', function () { skip = []; }); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Meal', meal), T.field('Diet', diet), T.field('Cuisine', cu), T.field('Effort', effort)]),
    big, also, T.row([T.button('Decide for me', { primary: true, onclick: decide }), T.button('Not that one', { small: true, onclick: function () { if (big.dataset.last) skip.push(big.dataset.last); decide(); } }), T.button('Try a sample', { small: true, onclick: decide })]), status.el,
    h('details', {}, [h('summary', { text: 'Pick from my own list instead' }), T.field('Your options', mine), h('label', { 'class': 'tcheck' }, [useMine, ' Use my list'])])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['what-to-eat'] = function () {
    var f = [];
    if (D.length < 140) f.push('only ' + D.length);
    var bad = D.filter(function (x) { return !x.n || !/^(v|vg|e|n)$/.test(x.d) || !/^[blds]+$/.test(x.m) || !/^[qco]+$/.test(x.e) || !CUIS.some(function (c) { return c[0] === x.c; }); });
    if (bad.length) f.push('bad ' + bad[0].n);
    if (D.filter(function (x) { return ok(x, { diet: 'v' }); }).some(function (x) { return /chicken|fish|lamb/i.test(x.n); })) f.push('veg has meat');
    if (D.filter(function (x) { return ok(x, { diet: 'vg' }); }).some(function (x) { return x.d !== 'vg'; })) f.push('vegan');
    if (!D.filter(function (x) { return ok(x, { meal: 'b', c: 'in' }); }).length) f.push('indian breakfast');
    return Promise.resolve({ ok: !f.length, n: 5, fails: f });
  };
});
