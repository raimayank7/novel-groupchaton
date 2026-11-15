/* Infinity by GroupChatOn — calories-burned. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'calories-burned', {
  inputs: [{ k: 'a', label: 'Activity', wide: true, options: [['3.5', 'Walking, normal pace'], ['5', 'Walking fast / brisk'], ['8', 'Running, 8 km/h'], ['11', 'Running, 11 km/h'], ['7.5', 'Cycling, moderate'], ['6', 'Swimming, easy'], ['10', 'Swimming laps, hard'],
    ['3', 'Yoga'], ['5', 'Dancing'], ['8', 'Skipping rope (moderate)'], ['6', 'Badminton'], ['7', 'Football / cricket fielding'], ['3.5', 'Household chores'], ['5', 'Gym, weights'], ['8', 'Climbing stairs']], value: '3.5' },
    { k: 'kg', label: 'Your weight', suffix: 'kg', value: 70 }, { k: 'min', label: 'Minutes', value: 30 }],
  calc: function (v, X) { X.pos(v.kg, 'your weight'); var k = +v.a * 3.5 * v.kg / 200 * v.min; return { rows: [['Calories burned', k, 'int'], ['Per hour', k / v.min * 60, 'int'], ['Fat equivalent', k / 7.7, 0, 'grams']], note: 'Based on MET values from the Compendium of Physical Activities. Real numbers vary with effort and fitness.' }; },
  test: [{ in: { a: '3.5', kg: 70, min: 30 }, expect: { 'Calories burned': 128.625 } }]
});
