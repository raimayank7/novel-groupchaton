/* Infinity by GroupChatOn — lua-run. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Run Lua 5.3 in the browser (Fengari, a Lua VM written in JavaScript): print, io.write and io.read, with a 10-second limit that stops endless loops. */
GCOTools.register('lua-run', function (spot, T) {
  var h = T.h, URLV = 'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js', LIMIT = 10000;
  function exec(code, stdin) {
    var f = window.fengari, lua = f.lua, lx = f.lauxlib, ll = f.lualib, S = f.to_luastring, J = f.to_jsstring, out = '', lines = stdin ? stdin.split('\n') : [], t0 = Date.now();
    var L = lx.luaL_newstate();
    ll.luaL_openlibs(L);
    function str(i) { var s = lx.luaL_tolstring(L, i); lua.lua_pop(L, 1); return J(s); }
    lua.lua_pushjsfunction(L, function (L) { var n = lua.lua_gettop(L), p = []; for (var i = 1; i <= n; i++) p.push(str(i)); out += p.join('\t') + '\n'; return 0; });
    lua.lua_setglobal(L, S('print'));
    if (lua.lua_getglobal(L, S('io')) !== lua.LUA_TTABLE) { lua.lua_pop(L, 1); lua.lua_newtable(L); lua.lua_pushvalue(L, -1); lua.lua_setglobal(L, S('io')); }
    lua.lua_pushjsfunction(L, function (L) { var n = lua.lua_gettop(L); for (var i = 1; i <= n; i++) out += str(i); return 0; });
    lua.lua_setfield(L, -2, S('write'));
    lua.lua_pushjsfunction(L, function (L) {
      var fmt = lua.lua_gettop(L) ? str(1) : 'l';
      if (/a/.test(fmt)) { lua.lua_pushstring(L, S(lines.splice(0).join('\n'))); return 1; }
      if (!lines.length) { lua.lua_pushnil(L); return 1; }
      var v = lines.shift();
      if (/n/.test(fmt)) { var x = parseFloat(v); if (isNaN(x)) lua.lua_pushnil(L); else if (Number.isInteger(x)) lua.lua_pushinteger(L, x); else lua.lua_pushnumber(L, x); }
      else lua.lua_pushstring(L, S(v));
      return 1;
    });
    lua.lua_setfield(L, -2, S('read'));
    lua.lua_pop(L, 1);
    lua.lua_sethook(L, function (L) { if (Date.now() - t0 > LIMIT) lx.luaL_error(L, S('stopped after 10 seconds: is there an endless loop?')); }, lua.LUA_MASKCOUNT, 1000);
    var buf = S(code), st = lx.luaL_loadbufferx(L, buf, buf.length, S('=main.lua'), null), err = '';
    if (st === lua.LUA_OK) st = lua.lua_pcall(L, 0, lua.LUA_MULTRET, 0);
    if (st !== lua.LUA_OK) err = J(lua.lua_tostring(L, -1) || S('error'));
    return { out: out, err: err, ms: Date.now() - t0 };
  }
  var code = h('textarea', { rows: '14', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'Lua code' });
  var stdin = h('textarea', { rows: '3', 'class': 'tin tmono', spellcheck: 'false', 'aria-label': 'Input for io.read()', placeholder: 'One line per io.read() call' });
  var out = h('textarea', { rows: '10', 'class': 'tout tmono', readonly: true, spellcheck: 'false', 'aria-label': 'Output', placeholder: 'Output appears here.' });
  var status = T.status();
  code.value = T.store.get('lua-run-code', '') || 'print("Hello from Lua " .. _VERSION)\n';
  code.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') { e.preventDefault(); code.setRangeText('  ', code.selectionStart, code.selectionEnd, 'end'); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
  });
  code.addEventListener('input', function () { T.store.set('lua-run-code', code.value.slice(0, 100000)); });
  function run() {
    out.value = '';
    status.info(window.fengari ? 'Running…' : 'Loading Lua (about 220 KB, only the first time)…');
    T.loadScript(URLV).then(function () {
      setTimeout(function () {
        var r = exec(code.value, stdin.value);
        out.value = r.out + (r.err ? (r.out && !/\n$/.test(r.out) ? '\n' : '') + r.err : '');
        if (r.err) status.error('The program ended with an error (see the output).'); else status.ok('✓ Finished in ' + Math.max(1, r.ms) + ' ms.');
      }, 30);
    }).catch(status.error);
  }
  var SAMPLE = '-- Times table and a word counter\nlocal n = tonumber(io.read()) or 7\nfor i = 1, 5 do\n  print(string.format("%d x %d = %d", n, i, n * i))\nend\n\nlocal text = io.read() or ""\nlocal counts = {}\nfor word in text:lower():gmatch("%a+") do\n  counts[word] = (counts[word] or 0) + 1\nend\nfor word, c in pairs(counts) do\n  if c > 1 then io.write(word, " appears ", c, " times\\n") end\nend\n';
  spot.appendChild(T.card([T.field('Lua code', code, 'Ctrl + Enter runs the code.'), T.field('Input (for io.read())', stdin),
    T.row([T.button('▶ Run', { primary: true, onclick: run }), T.button('Try a sample', { small: true, onclick: function () { code.value = SAMPLE; stdin.value = '9\nthe cat and the dog and the bird'; run(); } }),
      T.button('Clear output', { small: true, onclick: function () { out.value = ''; status.clear(); } })]),
    status.el, T.field('Output', out), T.row([T.button('Copy output', { onclick: function (e) { T.copy(out.value, e.currentTarget); } }),
      T.button('Download .lua', { onclick: function () { T.download(new Blob([code.value], { type: 'text/plain;charset=utf-8' }), 'main.lua'); } })])]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  T.tests['lua-run'] = function () {
    return T.loadScript(URLV).then(function () {
      var f = [], r;
      r = exec('local t = {}\nfor i = 1, 3 do t[#t + 1] = i * i end\nprint(table.concat(t, ","), 7 // 2, 2^10)\nio.write("x=", io.read("n") + 1, "\\n")\nprint(io.read())', '41\nhello');
      if (r.out !== '1,4,9\t3\t1024.0\nx=42\nhello\n' || r.err) f.push('run → ' + JSON.stringify(r));
      r = exec('print(nil + 1)', '');
      if (!/main\.lua:1: attempt to perform arithmetic/.test(r.err)) f.push('error → ' + r.err);
      r = exec('local x = ', '');
      if (!/main\.lua:1:/.test(r.err)) f.push('syntax → ' + r.err);
      LIMIT = 300; r = exec('while true do end', ''); LIMIT = 10000;
      if (!/stopped after/.test(r.err)) f.push('loop limit → ' + r.err);
      return { ok: !f.length, n: 4, fails: f };
    });
  };
});
