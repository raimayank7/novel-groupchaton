/* Infinity by GroupChatOn — dog-age. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'dog-age', {
  inputs: [{ k: 'p', label: 'Pet', options: [['ds', 'Dog: small (under 10 kg)'], ['dm', 'Dog: medium (10–25 kg)'], ['dl', 'Dog: large (over 25 kg)'], ['c', 'Cat']], value: 'dm' }, { k: 'a', label: 'Pet’s age', suffix: 'years', value: 5 }],
  calc: function (v, X) {
    X.pos(v.a, 'the age'); var per = { ds: 4, dm: 5, dl: 6, c: 4 }[v.p], h = v.a <= 1 ? v.a * 15 : v.a <= 2 ? 15 + (v.a - 1) * 9 : 24 + (v.a - 2) * per;
    var stage = h < 20 ? 'Young' : h < 45 ? 'Adult' : h < 60 ? 'Middle-aged' : 'Senior';
    return { rows: [['Age in human years', h, 'int'], ['Life stage', stage]], note: 'The first year counts as about 15 human years and the second as 9; after that small dogs and cats age about 4 years a year, large dogs up to 6 or 7.' };
  },
  test: [{ in: { p: 'dm', a: 5 }, expect: { 'Age in human years': 39 } }, { in: { p: 'c', a: 1 }, expect: { 'Age in human years': 15 } }]
});
