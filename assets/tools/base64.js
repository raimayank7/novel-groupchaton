/* Base64 Encode / Decode — text (full Unicode, emoji, Hindi…) and the URL-safe variant.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('base64', function (spot, T) {
  function enc(s, safe) {
    var bytes = new TextEncoder().encode(s), bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    var b = btoa(bin);
    return safe ? b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b;
  }
  function dec(s) {
    s = s.trim().replace(/^data:[^,]*,/, '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin;
    try { bin = atob(s); } catch (e) { throw new Error('This is not valid Base64.'); }
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch (e) { throw new Error('This Base64 holds a file or binary data, not text.'); }
  }
  var mode = T.seg([['enc', 'Encode'], ['dec', 'Decode']], 'enc');
  mode.setAttribute('data-opt', 'mode');
  T.transformer(spot, { id: 'base64', inLabel: 'Text or Base64', mono: true, sample: 'Hello, Infinity! नमस्ते 👋',
    options: [mode, T.opt.check('safe', 'URL-safe (- and _ instead of + and /)')],
    run: function (t, o) { return o.mode === 'dec' ? dec(t) : enc(t, o.safe); } });
});
