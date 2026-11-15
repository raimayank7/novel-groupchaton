/* WhatsApp Direct Message — open a chat with any number without saving it (wa.me link).
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('whatsapp-direct', function (spot, T) {
  var h = T.h, status = T.status();
  var codes = [['91', 'India (+91)'], ['92', 'Pakistan (+92)'], ['880', 'Bangladesh (+880)'], ['977', 'Nepal (+977)'], ['94', 'Sri Lanka (+94)'],
    ['971', 'UAE (+971)'], ['966', 'Saudi Arabia (+966)'], ['974', 'Qatar (+974)'], ['965', 'Kuwait (+965)'], ['968', 'Oman (+968)'], ['973', 'Bahrain (+973)'],
    ['1', 'USA / Canada (+1)'], ['44', 'UK (+44)'], ['61', 'Australia (+61)'], ['64', 'New Zealand (+64)'], ['65', 'Singapore (+65)'], ['60', 'Malaysia (+60)'],
    ['62', 'Indonesia (+62)'], ['63', 'Philippines (+63)'], ['82', 'South Korea (+82)'], ['49', 'Germany (+49)'], ['33', 'France (+33)'], ['39', 'Italy (+39)'],
    ['34', 'Spain (+34)'], ['55', 'Brazil (+55)'], ['52', 'Mexico (+52)'], ['27', 'South Africa (+27)'], ['234', 'Nigeria (+234)'], ['254', 'Kenya (+254)'], ['', 'Other (type full number)']];
  var cc = T.select(codes, T.store.get('wa-cc', '91'));
  var num = h('input', { type: 'tel', inputmode: 'numeric', placeholder: 'Phone number', autocomplete: 'tel-national' });
  var msg = h('textarea', { rows: '4', placeholder: 'Your message (optional)' });
  var go = T.button('Open in WhatsApp', { primary: true, onclick: function () { var l = link(); if (l) { T.store.set('wa-cc', cc.value); window.open(l, '_blank', 'noopener'); } } });
  var copyBtn = T.button('Copy link', { onclick: function () { var l = link(); if (l) T.copy(l, copyBtn); } });
  spot.appendChild(T.card([h('div', { 'class': 'tgrid2' }, [T.field('Country', cc), T.field('Number', num, 'Without the leading 0')]),
    T.field('Message', msg), T.row([go, copyBtn]), status.el]));
  function link() {
    var n = num.value.replace(/\D/g, '').replace(/^0+/, '');
    if (cc.value && n.indexOf(cc.value) === 0 && n.length > 10) n = n.slice(cc.value.length);   // they typed the code twice
    var full = (cc.value || '') + n;
    if (full.length < 8) { status.error('Type the phone number (with its country code if you chose “Other”).'); return ''; }
    status.clear();
    return 'https://wa.me/' + full + (msg.value.trim() ? '?text=' + encodeURIComponent(msg.value.trim()) : '');
  }
});
