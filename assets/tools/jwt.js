/* JWT Decoder — reads a JSON Web Token's header and payload and explains its dates (issued, expires).
   It only decodes: the signature cannot be checked without the secret key, and the token is never sent anywhere.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('jwt', function (spot, T) {
  function part(s, name) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    try {
      var bin = atob(s), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { throw new Error('The ' + name + ' part is not valid. Is this a complete JWT?'); }
  }
  function when(sec) { var d = new Date(sec * 1000); return isNaN(d) ? '' : d.toLocaleString() + ' (' + d.toISOString() + ')'; }
  T.transformer(spot, { id: 'jwt', inLabel: 'JWT (eyJ…)', outLabel: 'Decoded', mono: true, rows: 8, download: false,
    sample: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFzaGEiLCJpYXQiOjE3NjE5NTUyMDAsImV4cCI6MTc5MzQ5MTIwMH0.signature',
    run: function (t) {
      var bits = t.trim().replace(/^Bearer\s+/i, '').split('.');
      if (bits.length < 2) throw new Error('A JWT has three parts separated by dots: header.payload.signature');
      var head = part(bits[0], 'header'), body = part(bits[1], 'payload'), out = ['HEADER', JSON.stringify(head, null, 2), '', 'PAYLOAD', JSON.stringify(body, null, 2)];
      var notes = [], now = Date.now() / 1000;
      if (body.iat) notes.push('Issued (iat): ' + when(body.iat));
      if (body.nbf) notes.push('Valid from (nbf): ' + when(body.nbf));
      if (body.exp) notes.push('Expires (exp): ' + when(body.exp) + (body.exp < now ? '  → EXPIRED' : '  → still valid'));
      if (notes.length) out.push('', 'DATES', notes.join('\n'));
      out.push('', 'SIGNATURE', (bits[2] ? 'Present (' + head.alg + '). It can only be verified with the secret or public key.' : 'None (unsigned token).'));
      return out.join('\n');
    } });
});
