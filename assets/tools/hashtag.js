/* Infinity by GroupChatOn — hashtag. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Hashtag generator: turns your topic into clean hashtags (single words, joined phrases, related popular tags), within each app's sensible limit. */
GCOTools.register('hashtag', function (spot, T) {
  var h = T.h;
  var STOP = ' a an and the of in on at to for with my our your is are be by from this that it its me we i you de la el le et und '.split(' ');
  var LIMIT = { instagram: [30, 'Instagram allows 30; 5–15 focused tags usually work best.'], tiktok: [8, 'TikTok has no fixed limit; 3–8 relevant tags is the norm.'], x: [3, 'On X, 1–3 hashtags read naturally.'],
    linkedin: [5, 'LinkedIn suggests 3–5 hashtags.'], youtube: [15, 'YouTube ignores all hashtags on a video if there are more than 15.'], facebook: [5, 'On Facebook, 1–5 hashtags is plenty.'] };
  // related tags for common topics (lower case keys)
  var NICHE = {
    travel: 'travel wanderlust travelgram instatravel traveltheworld explore adventure travelphotography', food: 'food foodie foodporn instafood foodlover homemade yummy foodphotography',
    recipe: 'recipe recipes homecooking easyrecipes cooking healthyrecipes', fitness: 'fitness fitnessmotivation workout gym fitfam healthylifestyle training', gym: 'gym gymlife workout fitness bodybuilding gymmotivation',
    yoga: 'yoga yogapractice yogainspiration meditation mindfulness wellness', health: 'health healthylifestyle wellness selfcare nutrition', fashion: 'fashion style ootd fashionblogger outfitoftheday streetstyle',
    beauty: 'beauty makeup skincare beautytips makeuplover', makeup: 'makeup makeupartist mua beauty makeuplook', photography: 'photography photooftheday photographer picoftheday instaphoto naturephotography',
    nature: 'nature naturelovers naturephotography outdoors landscape earth', wedding: 'wedding weddingday bride bridal weddingphotography weddinginspiration', business: 'business entrepreneur smallbusiness startup success marketing',
    marketing: 'marketing digitalmarketing socialmediamarketing branding contentmarketing seo', startup: 'startup startups entrepreneur founder innovation business', motivation: 'motivation inspiration mindset success goals quotes',
    art: 'art artist artwork drawing painting illustration creative', music: 'music musician newmusic song singer musiclover', tech: 'tech technology innovation gadgets ai',
    coding: 'coding programming developer webdevelopment javascript python code', education: 'education learning students study teachers', study: 'study studygram studymotivation students exam',
    baby: 'baby babyboy babygirl newborn momlife parenting', dog: 'dog dogsofinstagram puppy doglover dogs', cat: 'cat catsofinstagram cats kitten catlover', pets: 'pets petsofinstagram dog cat animals',
    cricket: 'cricket cricketlover ipl teamindia cricketfans', football: 'football soccer footballer fifa goal', festival: 'festival celebration festive happyfestival', diwali: 'diwali happydiwali festivaloflights diwalivibes diwalidecor',
    holi: 'holi happyholi festivalofcolours holifestival', eid: 'eid eidmubarak ramadan eidaladha', christmas: 'christmas merrychristmas xmas christmastree holidays', india: 'india incredibleindia indian indiapictures',
    punjab: 'punjab punjabi punjabisong pind', realestate: 'realestate property home realtor househunting', home: 'home homedecor interiordesign homesweethome decor', car: 'car cars carsofinstagram carlifestyle',
    books: 'books bookstagram reading booklover bookworm', gaming: 'gaming gamer videogames gamingcommunity esports', love: 'love couple couplegoals romance', sunset: 'sunset sunsetlovers sky goldenhour',
    beach: 'beach beachlife sea ocean summer', summer: 'summer summervibes sunshine holiday', farming: 'farming agriculture farmer organicfarming farmlife', garden: 'garden gardening plants plantlover urbangarden'
  };
  function clean(w) { return w.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}_]/gu, ''); }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }
  function make(text, o) {
    o = o || {};
    var out = [], seen = {};
    function add(tag) {
      if (!tag || /^\d+$/.test(tag) || tag.length > 60) return;
      var k = tag.toLowerCase(); if (seen[k]) return; seen[k] = 1; out.push('#' + tag);
    }
    var phrases = String(text || '').split(/[,\n;|#]+/).map(function (p) { return p.trim(); }).filter(Boolean);
    var words = [];
    phrases.forEach(function (p) {
      var ws = p.split(/\s+/).map(clean).filter(Boolean);
      var keep = ws.filter(function (w) { return STOP.indexOf(w.toLowerCase()) < 0; });
      if (ws.length > 1) add(ws.map(function (w) { return o.style === 'camel' ? cap(w) : o.style === 'lower' ? w.toLowerCase() : w; }).join(''));
      keep.forEach(function (w) { words.push(w); });
    });
    words.forEach(function (w) { add(o.style === 'camel' ? cap(w) : o.style === 'lower' ? w.toLowerCase() : w); });
    if (o.related !== false) words.forEach(function (w) { (NICHE[w.toLowerCase()] || '').split(' ').forEach(function (t) { add(o.style === 'camel' ? cap(t) : t); }); });
    return out.slice(0, o.limit || 30);
  }
  var inp = h('textarea', { rows: '3', placeholder: 'e.g. summer travel, goa beach, sunset' });
  inp.value = T.store.get('hashtag-in', '');
  var plat = T.select([['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['x', 'X (Twitter)'], ['linkedin', 'LinkedIn'], ['youtube', 'YouTube'], ['facebook', 'Facebook']], T.store.get('hashtag-p', 'instagram'));
  var style = T.select([['as', 'As typed'], ['lower', 'all lowercase'], ['camel', 'CamelCase (easier to read)']], T.store.get('hashtag-s', 'as'));
  var rel = h('input', { type: 'checkbox', checked: true });
  var out = h('textarea', { 'class': 'tout', rows: '5', readonly: true, 'aria-label': 'Hashtags' }), note = h('p', { 'class': 'tnote' });
  function run() {
    T.store.set('hashtag-in', inp.value); T.store.set('hashtag-p', plat.value); T.store.set('hashtag-s', style.value);
    var tags = make(inp.value, { style: style.value, related: rel.checked, limit: LIMIT[plat.value][0] });
    out.value = tags.join(' ');
    note.textContent = tags.length ? tags.length + ' hashtag' + (tags.length > 1 ? 's' : '') + '. ' + LIMIT[plat.value][1] : 'Type a few words about your post.';
  }
  [inp, plat, style, rel].forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
  var copy = T.button('Copy hashtags', { primary: true, onclick: function () { T.copy(out.value, copy); } });
  var copyLines = T.button('Copy one per line', { onclick: function () { T.copy(out.value.split(' ').join('\n'), copyLines); } });
  spot.appendChild(T.card([T.field('What is your post about? (separate topics with commas)', inp), h('div', { 'class': 'tgrid2' }, [T.field('For', plat), T.field('Style', style)]),
    h('label', { 'class': 'tcheck' }, [rel, ' Add popular related tags']),
    T.row([T.button('Try a sample', { small: true, onclick: function () { inp.value = 'summer travel, goa beach, sunset'; run(); } })]), out, note, T.row([copy, copyLines])]));
  run();
  T.tests['hashtag'] = function () {
    var f = [], a = make('summer travel, goa beach', { related: false });
    ['#summertravel', '#goabeach', '#goa', '#beach'].forEach(function (t) { if (a.indexOf(t) < 0) f.push('missing ' + t + ' in ' + a.join(' ')); });
    if (make('the best of india', { related: false }).indexOf('#the') >= 0) f.push('stop word kept');
    if (make('summer travel', { style: 'camel', related: false })[0] !== '#SummerTravel') f.push('camel ' + make('summer travel', { style: 'camel' })[0]);
    if (make('2026, दिल्ली', { related: false }).join(' ') !== '#दिल्ली') f.push('unicode/numbers ' + make('2026, दिल्ली', { related: false }).join(' '));
    if (make('travel food fitness', { limit: 3 }).length !== 3) f.push('limit');
    var d = make('Travel travel TRAVEL', { related: false }); if (d.length !== 2) f.push('dedupe ' + d.join(' '));
    if (make('food', {}).indexOf('#foodie') < 0) f.push('related');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
