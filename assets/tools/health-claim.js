/* Infinity by GroupChatOn — health-claim. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'health-claim', {
  inputs: [{ k: 'bill', label: 'Total hospital bill', money: true, value: 300000 }, { k: 'si', label: 'Sum insured left', money: true, value: 500000 },
    { k: 'room', label: 'Room rent charged per day', money: true, value: 8000 }, { k: 'cap', label: 'Room rent limit in your policy per day (0 if none)', money: true, value: 5000 },
    { k: 'assoc', label: 'Part of the bill linked to room rent (doctor, nursing, tests)', suffix: '% of bill', value: 60 },
    { k: 'non', label: 'Items not covered (gloves, masks, admin fees)', money: true, value: 10000 }, { k: 'co', label: 'Co-payment', suffix: '%', value: 0 }, { k: 'ded', label: 'Deductible', money: true, value: 0 }],
  calc: function (v, X) {
    var payable = v.bill - (v.non || 0), cut = 0;
    if (v.cap > 0 && v.room > v.cap) { var ratio = v.cap / v.room; cut = payable * (v.assoc || 0) / 100 * (1 - ratio); }   // proportionate deduction
    var after = Math.max(0, payable - cut - (v.ded || 0)), co = after * (v.co || 0) / 100, claim = Math.min(v.si, after - co);
    return { rows: [['Insurer pays (about)', claim, 'money'], ['You pay', v.bill - claim, 'money'], ['Cut because the room cost more than the limit', cut, 'money'], ['Not-covered items', v.non || 0, 'money'], ['Co-payment', co, 'money']],
      bars: [['Insurer', claim], ['Room-rent cut', cut], ['Not covered', v.non || 0], ['Co-pay and deductible', co + (v.ded || 0)]],
      note: 'Shows the “proportionate deduction” many policies apply when you take a costlier room than allowed: linked charges are cut in the same ratio. Your policy wording decides the final amount.' };
  },
  test: [{ in: { bill: 300000, si: 500000, room: 8000, cap: 5000, assoc: 60, non: 10000, co: 0, ded: 0 }, expect: { 'Cut because the room cost more than the limit': 65250, 'Insurer pays (about)': 224750 } }]
});
