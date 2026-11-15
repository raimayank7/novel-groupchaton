/* Infinity by GroupChatOn — bmi. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'bmi', {
  inputs: [{ k: 'u', label: 'Units', options: [['m', 'Metric (kg, cm)'], ['i', 'Imperial (lb, ft, in)']], value: 'm' },
    { k: 'kg', label: 'Weight (kg)', value: 70, show: function (v) { return v.u === 'm'; } }, { k: 'cm', label: 'Height (cm)', value: 175, show: function (v) { return v.u === 'm'; } },
    { k: 'lb', label: 'Weight (lb)', value: 154, show: function (v) { return v.u === 'i'; } }, { k: 'ft', label: 'Height: feet', value: 5, show: function (v) { return v.u === 'i'; } },
    { k: 'in', label: 'and inches', value: 9, show: function (v) { return v.u === 'i'; } },
    { k: 'asia', label: 'Use the cut-offs for South and East Asian people (WHO Asia)', type: 'check', value: false, wide: true }],
  calc: function (v, X) {
    var kg = v.u === 'm' ? v.kg : v.lb * 0.45359237, m = v.u === 'm' ? v.cm / 100 : ((v.ft || 0) * 12 + (v.in || 0)) * 0.0254;
    X.pos(kg, 'your weight'); X.pos(m, 'your height');
    var b = kg / (m * m), cut = v.asia ? [18.5, 23, 25] : [18.5, 25, 30];
    var cat = b < cut[0] ? 'Underweight' : b < cut[1] ? 'Healthy weight' : b < cut[2] ? 'Overweight' : 'Obese';
    var lo = cut[0] * m * m, hi = (cut[1] - 0.1) * m * m;
    return { rows: [['Your BMI', b, 1, cat], ['Category', cat], ['Healthy weight for your height', v.u === 'm' ? X.num(lo, 1) + '–' + X.num(hi, 1) + ' kg' : X.num(lo / 0.45359237, 0) + '–' + X.num(hi / 0.45359237, 0) + ' lb']],
      note: 'BMI is a quick screening number, not a diagnosis. It does not tell muscle from fat; children and teens need age-based BMI charts.' };
  },
  test: [{ in: { u: 'm', kg: 70, cm: 175, asia: false }, expect: { 'Your BMI': 22.857, 'Category': 'Healthy' } }, { in: { u: 'm', kg: 70, cm: 175, asia: true }, expect: { 'Category': 'Healthy' } },
         { in: { u: 'm', kg: 80, cm: 175, asia: true }, expect: { 'Category': 'Obese' } }]
});
