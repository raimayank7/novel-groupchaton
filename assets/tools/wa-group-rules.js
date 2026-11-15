/* Infinity by GroupChatOn — wa-group-rules. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* WhatsApp group description and rules writer. */
GCOTools.register('wa-group-rules', function (spot, T) {
  var h = T.h;
  var TYPES = { family: 'Family', friends: 'Friends', business: 'Business / customers', school: 'School / class parents', society: 'Housing society / RWA', office: 'Office team', community: 'Community / club' };
  var RULES = [['respect', 'Be respectful. No abuse, insults or personal attacks.'], ['topic', 'Keep messages on the group’s topic.'], ['forward', 'No forwarded chain messages, fake news or rumours.'],
    ['ads', 'No promotions, ads or selling without the admin’s permission.'], ['politics', 'No political or religious debates.'], ['time', 'No messages between 10 pm and 7 am, except emergencies.'],
    ['media', 'Avoid sending too many photos, videos and stickers.'], ['private', 'Do not share members’ numbers or group messages outside the group.'], ['reply', 'Reply in private when only one person needs to see it.'],
    ['admin', 'Only admins can change the group name, icon and description.'], ['remove', 'Members who break the rules may be removed without notice.']];
  var name = h('input', { type: 'text', value: 'Green Park Residents', 'aria-label': 'Group name' }), type = T.select(Object.keys(TYPES).map(function (k) { return [k, TYPES[k]]; }), 'society');
  var about = h('input', { type: 'text', value: 'Updates, notices and help for residents of Green Park.', 'aria-label': 'What the group is for' });
  var checks = RULES.map(function (r, i) { return h('input', { type: 'checkbox', checked: i < 6 || i === 10, 'data-k': r[0] }); });
  var extra = h('textarea', { rows: '2', placeholder: 'Any other rule (optional)' }), out = h('textarea', { rows: '12', readonly: true, 'aria-label': 'Group description' }), count = h('small', {});
  function make() {
    var rules = RULES.filter(function (r, i) { return checks[i].checked; }).map(function (r) { return r[1]; });
    extra.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (s) { rules.push(s); });
    return '*' + (name.value.trim() || 'Our group') + '*\n' + (about.value.trim() ? about.value.trim() + '\n' : '') + '\n*Group rules*\n' + rules.map(function (r, i) { return (i + 1) + '. ' + r; }).join('\n') + '\n\nThank you for keeping this group useful for everyone. 🙏';
  }
  function draw() { out.value = make(); count.textContent = out.value.length + ' / 2048 characters (WhatsApp’s limit for a description)'; count.style.color = out.value.length > 2048 ? 'var(--err)' : ''; }
  type.addEventListener('change', function () {   // sensible ticks for the kind of group
    var on = { family: ['respect', 'forward', 'politics', 'private'], friends: ['respect', 'forward', 'private'], business: ['respect', 'topic', 'ads', 'time', 'private', 'reply'], school: ['respect', 'topic', 'forward', 'ads', 'politics', 'time', 'reply', 'admin'],
      society: ['respect', 'topic', 'forward', 'ads', 'politics', 'time', 'remove'], office: ['respect', 'topic', 'forward', 'politics', 'time', 'private'], community: ['respect', 'topic', 'forward', 'ads', 'politics', 'remove'] }[type.value];
    checks.forEach(function (c) { c.checked = on.indexOf(c.getAttribute('data-k')) >= 0; }); draw();
  });
  [name, about, extra].concat(checks).forEach(function (e) { e.addEventListener('input', draw); e.addEventListener('change', draw); });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Group name', name), T.field('Kind of group', type)]), T.field('What the group is for', about),
    h('div', { 'class': 'tchecks' }, RULES.map(function (r, i) { return h('label', { 'class': 'tcheck' }, [checks[i], ' ' + r[1]]); })), T.field('More rules', extra),
    out, count, T.row([T.button('Copy description', { primary: true, onclick: function (e) { T.copy(out.value, e.currentTarget); } })])]));
  draw();
  T.tests['wa-group-rules'] = function () {
    var fails = [], keep = name.value;
    type.value = 'school'; type.dispatchEvent(new Event('change')); name.value = 'Class 5B Parents'; draw();
    if (out.value.indexOf('*Class 5B Parents*') !== 0) fails.push('title');
    if (out.value.indexOf('1. Be respectful') < 0 || out.value.indexOf('Only admins can change') < 0) fails.push('school rules');
    if (out.value.indexOf('Members who break') >= 0) fails.push('unticked rule shown');
    name.value = keep; type.value = 'society'; type.dispatchEvent(new Event('change'));
    return Promise.resolve({ ok: !fails.length, n: 3, fails: fails });
  };
});
