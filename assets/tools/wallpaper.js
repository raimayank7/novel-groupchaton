/* Infinity by GroupChatOn — wallpaper. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('calc', 'wallpaper', {
  inputs: [{ k: 'p', label: 'Total width of the walls', suffix: 'm', value: 14 }, { k: 'h', label: 'Wall height', suffix: 'm', value: 2.5 },
    { k: 'rw', label: 'Roll width', suffix: 'm', value: 0.53 }, { k: 'rl', label: 'Roll length', suffix: 'm', value: 10.05 }, { k: 'rep', label: 'Pattern repeat', suffix: 'cm', value: 0 }],
  calc: function (v, X) {
    var drop = v.h + (v.rep || 0) / 100 + 0.1, per = Math.floor(v.rl / drop); X.need(per > 0, 'The wall is taller than one roll.');
    var strips = Math.ceil(v.p / v.rw);
    return { rows: [['Rolls needed', Math.ceil(strips / per), 'int'], ['Strips needed', strips, 'int'], ['Strips from one roll', per, 'int']], note: 'Adds 10 cm per strip for trimming. Buy one extra roll from the same batch for repairs.' };
  },
  test: [{ in: { p: 14, h: 2.5, rw: 0.53, rl: 10.05, rep: 0 }, expect: { 'Rolls needed': 9, 'Strips needed': 27, 'Strips from one roll': 3 } }]
});
