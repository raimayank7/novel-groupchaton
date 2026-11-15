/* Infinity by GroupChatOn — readability. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Readability: Flesch reading ease, school grade level, sentence and word length, reading and speaking time. */
GCOTools.register('readability', function (spot, T) {
  function syl(w) {
    w = w.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    var m = w.match(/[aeiouy]+/g);
    return Math.max(1, m ? m.length : 1);
  }
  function stats(t) {
    var words = t.match(/[A-Za-z\u00C0-\u024F0-9'’]+/g) || [], sent = (t.match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/gm) || []).filter(function (s) { return /[A-Za-z0-9]/.test(s); }).length || 1;
    var sy = 0, poly = 0; words.forEach(function (w) { var s = syl(w); sy += s; if (s >= 3) poly++; });
    var W = words.length || 1, ease = 206.835 - 1.015 * (W / sent) - 84.6 * (sy / W), grade = 0.39 * (W / sent) + 11.8 * (sy / W) - 15.59;
    return { words: words.length, sentences: sent, syllables: sy, ease: ease, grade: grade, fog: 0.4 * ((W / sent) + 100 * poly / W) };
  }
  function band(e) {
    return e >= 90 ? 'Very easy: an 11-year-old understands it' : e >= 80 ? 'Easy' : e >= 70 ? 'Fairly easy' : e >= 60 ? 'Plain English: easy for most adults (aim here for websites)' :
      e >= 50 ? 'Fairly hard' : e >= 30 ? 'Hard: college level' : 'Very hard: best understood by graduates';
  }
  function run(t) {
    var s = stats(t), f = function (x) { return (Math.round(x * 10) / 10).toFixed(1); }, min = function (n, wpm) { var m = n / wpm; return m < 1 ? Math.max(1, Math.round(m * 60)) + ' sec' : f(m) + ' min'; };
    return ['Flesch reading ease: ' + f(s.ease) + ' / 100 (higher is easier)', '→ ' + band(s.ease), '',
      'School grade level (Flesch–Kincaid): ' + f(Math.max(0, s.grade)), 'Gunning fog index: ' + f(s.fog), '',
      'Words: ' + s.words.toLocaleString() + ' · Sentences: ' + s.sentences.toLocaleString() + ' · Syllables: ' + s.syllables.toLocaleString(),
      'Average sentence: ' + f(s.words / s.sentences) + ' words · Average word: ' + f(s.syllables / Math.max(1, s.words)) + ' syllables',
      'Reading time: ' + min(s.words, 230) + ' · Speaking time: ' + min(s.words, 140), '',
      'Tips: keep most sentences under 20 words, and swap long words for short ones (use → utilise).'].join('\n');
  }
  T.transformer(spot, { id: 'readability', inLabel: 'Your English text', sample: 'The cat sat on the mat. It was a sunny day, and the children played happily in the garden until their mother called them in for dinner.', run: run });
  T.tests['readability'] = function () {
    var f = [], s = stats('The cat sat on the mat.'), r = stats('One. Two words here! Is this three?');
    if (s.words !== 6 || s.sentences !== 1 || s.syllables !== 6) f.push('counts ' + JSON.stringify(s));
    if (Math.abs(s.ease - 116.145) > 0.01) f.push('ease ' + s.ease);
    if (r.sentences !== 3) f.push('sentences ' + r.sentences);
    if (syl('beautiful') !== 3 || syl('table') !== 2 || syl('jumped') !== 1) f.push('syllables ' + [syl('beautiful'), syl('table'), syl('jumped')]);
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
