/* Infinity by GroupChatOn — heart-rate. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'heart-rate', {
  inputs: [{ k: 'a', label: 'Age', value: 30 }, { k: 'r', label: 'Resting heart rate (optional)', suffix: 'beats a minute', value: 60 }],
  calc: function (v, X) {
    var max = 220 - v.a, hr = v.r > 30 ? v.r : 0, z = function (lo, hi) { return hr ? Math.round(hr + lo * (max - hr)) + '–' + Math.round(hr + hi * (max - hr)) : Math.round(lo * max) + '–' + Math.round(hi * max); };
    return { rows: [['Maximum heart rate', max, 'int', 'beats a minute'], ['Zone 1: very light (50–60%)', z(.5, .6)], ['Zone 2: fat burning (60–70%)', z(.6, .7)], ['Zone 3: aerobic (70–80%)', z(.7, .8)], ['Zone 4: hard (80–90%)', z(.8, .9)], ['Zone 5: maximum (90–100%)', z(.9, 1)]],
      note: hr ? 'Karvonen method, using your resting heart rate.' : 'Add your resting heart rate for more personal zones.' };
  },
  test: [{ in: { a: 30, r: 60 }, expect: { 'Maximum heart rate': 190, 'Zone 2: fat burning (60–70%)': '138–151' } }]
});
