/* Infinity by GroupChatOn — epf. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'epf', {
  inputs: [{ k: 'b', label: 'Basic + DA a month', money: true, value: 30000 }, { k: 'age', label: 'Your age', value: 30 }, { k: 'ret', label: 'Retire at', value: 58 },
    { k: 'bal', label: 'EPF balance now', money: true, value: 0 }, { k: 'g', label: 'Salary increase a year', suffix: '%', value: 5 }, { k: 'r', label: 'EPF interest rate', suffix: '%', value: 8.25, step: 0.05 }],
  calc: function (v, X) {
    var bal = v.bal || 0, basic = v.b, put = 0, yrs = v.ret - v.age; X.need(yrs > 0, 'Check the ages.');
    for (var y = 0; y < yrs; y++) {
      var int = 0;
      for (var m = 0; m < 12; m++) { var c = basic * (0.12 + 0.0367); bal += c; put += c; int += bal * v.r / 1200; }
      bal += int; basic *= 1 + v.g / 100;
    }
    return { rows: [['EPF at retirement', bal, 'money'], ['Total contributed (you + employer)', put, 'money'], ['Interest earned', bal - put - (v.bal || 0), 'money']],
      note: 'You put 12% of basic; your employer puts 3.67% into EPF (the other 8.33% goes to the pension scheme, EPS). Interest is worked out monthly and added once a year, as EPFO does.' };
  },
  test: [{ in: { b: 30000, age: 57, ret: 58, bal: 0, g: 0, r: 8.25 }, expect: { 'Total contributed (you + employer)': 56412, 'EPF at retirement': 58932.91 } }]
});
