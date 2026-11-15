/* Infinity by GroupChatOn — wa-blank. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Blank WhatsApp message: invisible characters that WhatsApp sends as an empty-looking message or name. */
GCOTools.register('wa-blank', function (spot, T) {
  var h = T.h;
  var CH = [['⠀', 'Braille blank (works best in WhatsApp)'], ['ㅤ', 'Hangul filler (for names and bios)'], ['‎', 'Left-to-right mark (very short)']];
  var kind = T.select(CH.map(function (c, i) { return [String(i), c[1]]; }), '0'), lines = h('input', { type: 'number', min: '1', max: '200', value: '1', 'aria-label': 'Lines' });
  var out = h('textarea', { rows: '3', readonly: true, 'aria-label': 'Blank text' });
  function make() { var c = CH[+kind.value][0], n = Math.max(1, Math.min(200, +lines.value || 1)); return Array(n).fill(c).join('\n'); }
  function draw() { out.value = make(); }
  [kind, lines].forEach(function (e) { e.addEventListener('input', draw); e.addEventListener('change', draw); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Type of blank', kind), T.field('Number of empty lines', lines)]), out,
    T.row([T.button('Copy blank text', { primary: true, onclick: function (e) { T.copy(out.value, e.currentTarget); } }), h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', href: 'https://wa.me/?text=%E2%A0%80', text: 'Send in WhatsApp' })]),
    h('p', { 'class': 'tnote', text: 'The box looks empty, but it holds invisible characters. Paste it into a chat, status or name.' })]));
  draw();
  T.tests['wa-blank'] = function () {
    kind.value = '0'; lines.value = 3; draw();
    var ok = out.value === '⠀\n⠀\n⠀' && out.value.trim().length > 0;
    lines.value = 1; draw();
    return Promise.resolve({ ok: ok, n: 1, fails: ok ? [] : ['blank text ' + JSON.stringify(out.value)] });
  };
});
