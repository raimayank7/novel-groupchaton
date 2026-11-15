/* Infinity by GroupChatOn — cooking. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  // grams in one US cup (240 mL is a "metric cup"; we use the US cup, 236.6 mL)
  var ING = [['236.6', 'Water'], ['245', 'Milk'], ['218', 'Cooking oil'], ['227', 'Butter'], ['125', 'All-purpose flour (maida)'], ['120', 'Whole wheat flour (atta)'], ['92', 'Gram flour (besan)'],
    ['200', 'Sugar (granulated)'], ['220', 'Brown sugar (packed)'], ['120', 'Powdered (icing) sugar'], ['340', 'Honey'], ['185', 'Rice (uncooked)'], ['90', 'Rolled oats'], ['85', 'Cocoa powder'], ['292', 'Salt'],
    ['240', 'Yogurt (curd)'], ['150', 'Chopped nuts']];
  var U = [['cup', 'Cups', 236.588], ['tbsp', 'Tablespoons', 14.7868], ['tsp', 'Teaspoons', 4.92892], ['ml', 'Millilitres (mL)', 1], ['floz', 'Fluid ounces (US)', 29.5735],
    ['g', 'Grams (g)', 0], ['kg', 'Kilograms (kg)', 0], ['oz', 'Ounces (oz)', 0], ['lb', 'Pounds (lb)', 0]];
  var W = { g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237 };
  GCOTools.engine('calc', 'cooking', {
    inputs: [{ k: 'a', label: 'Amount', value: 1 }, { k: 'u', label: 'Unit', options: U.map(function (u) { return [u[0], u[1]]; }), value: 'cup' }, { k: 'i', label: 'Ingredient', options: ING, value: '125', wide: true }],
    calc: function (v, X) {
      var dens = +v.i, ml, g, u = U.filter(function (x) { return x[0] === v.u; })[0];
      if (u[2]) { ml = v.a * u[2]; g = ml / 236.588 * dens; } else { g = v.a * W[v.u]; ml = g / dens * 236.588; }
      return { rows: [['Grams', g, function (n) { return X.num(n, 1) + ' g'; }], ['Cups', ml / 236.588, function (n) { return X.num(n, 2) + ' cups'; }], ['Tablespoons', ml / 14.7868, function (n) { return X.num(n, 1) + ' tbsp'; }],
        ['Teaspoons', ml / 4.92892, function (n) { return X.num(n, 1) + ' tsp'; }], ['Millilitres', ml, function (n) { return X.num(n, 0) + ' mL'; }], ['Ounces (weight)', g / 28.349523125, function (n) { return X.num(n, 2) + ' oz'; }]],
        note: 'US cup = 236.6 mL, tablespoon = 14.8 mL, teaspoon = 4.9 mL. Weights per cup are typical for spooned and levelled flour; packing it down adds up to 20%. For baking, weighing is most accurate.' };
    },
    test: [{ in: { a: 1, u: 'cup', i: '125' }, expect: { Grams: 125 } }, { in: { a: 200, u: 'g', i: '200' }, expect: { Cups: 1 } }, { in: { a: 1, u: 'tbsp', i: '227' }, expect: { Grams: 14.1875 } }]
  });
})();
