/* Infinity by GroupChatOn — dose. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'dose', {
  inputs: [{ k: 'kg', label: 'Child’s weight', suffix: 'kg', value: 12 }, { k: 'm', label: 'Medicine', options: [['p', 'Paracetamol (15 mg per kg)'], ['i', 'Ibuprofen (10 mg per kg, over 6 months old)']], value: 'p', wide: true },
    { k: 'mg', label: 'Strength of the syrup: mg', value: 120 }, { k: 'ml', label: 'in how many ml', value: 5 }],
  calc: function (v, X) {
    X.pos(v.kg, 'the child’s weight'); X.pos(v.mg, 'the strength'); var per = v.m === 'p' ? 15 : 10, dose = Math.min(v.kg * per, v.m === 'p' ? 1000 : 400), ml = dose / v.mg * v.ml;
    return { rows: [['One dose', ml, 1, 'ml'], ['In mg', dose, 'int'], ['How often', v.m === 'p' ? 'Every 4–6 hours, at most 4 doses in 24 hours' : 'Every 6–8 hours, at most 3 doses in 24 hours']],
      note: '⚠️ Information only, not medical advice. Always check the dose with your doctor or pharmacist and the leaflet. Use the measuring spoon or syringe that came with the medicine. Do not give ibuprofen to babies under 6 months or children with asthma or dehydration without advice.' };
  },
  test: [{ in: { kg: 12, m: 'p', mg: 120, ml: 5 }, expect: { 'One dose': 7.5, 'In mg': 180 } }]
});
