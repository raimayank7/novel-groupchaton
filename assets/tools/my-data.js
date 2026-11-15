/* Infinity by GroupChatOn — my-data. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* My data: every record tool's saved data on this device in one place; back up all of it in one file, restore, or delete. */
GCOTools.register('my-data', function (spot, T) {
  var h = T.h, PRE = 'gco-vault-';
  var TOOLS = { money: 'money-manager', books: 'book-keeper', invoice: 'invoice', 'wa-catalog': 'wa-catalog', stock: 'stock-register', attendance: 'attendance', salary: 'salary-register', hisab: 'milk-hisab',
    rent: 'rent-tracker', lend: 'lend-borrow', bills: 'bill-reminders', customers: 'customer-book', shagun: 'shagun-register', kitty: 'kitty-tracker', portfolio: 'portfolio', health: 'health-log',
    meds: 'medicine-schedule', vehicle: 'vehicle-log', diary: 'diary', workout: 'workout-log', reading: 'reading-log', recipes: 'recipe-book', study: 'study-planner' };
  function info(name) { var t = T.find(TOOLS[name] || name); return t ? { name: t.name, icon: t.icon, path: t.path } : { name: name.replace(/[-_]/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }), icon: '🗂️', path: '' }; }
  function toPlain(x) {
    if (x instanceof Blob) return T.read(x, 'dataURL').then(function (u) { return { __blob: u }; });
    if (Array.isArray(x)) return Promise.all(x.map(toPlain));
    if (x && typeof x === 'object') { var ks = Object.keys(x); return Promise.all(ks.map(function (k) { return toPlain(x[k]); })).then(function (vs) { var o = {}; ks.forEach(function (k, i) { o[k] = vs[i]; }); return o; }); }
    return Promise.resolve(x);
  }
  function fromPlain(x) {
    if (x && x.__blob) return fetch(x.__blob).then(function (r) { return r.blob(); });
    if (Array.isArray(x)) return Promise.all(x.map(fromPlain));
    if (x && typeof x === 'object') { var ks = Object.keys(x); return Promise.all(ks.map(function (k) { return fromPlain(x[k]); })).then(function (vs) { var o = {}; ks.forEach(function (k, i) { o[k] = vs[i]; }); return o; }); }
    return Promise.resolve(x);
  }
  function count(d) { var n = 0; if (d && typeof d === 'object') Object.keys(d).forEach(function (k) { if (Array.isArray(d[k])) n += d[k].length; }); return n; }
  function size(d) { var n = 0; (function walk(x) { if (x instanceof Blob) n += x.size; else if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') Object.keys(x).forEach(function (k) { n += k.length; walk(x[k]); }); else n += String(x).length; })(d); return n; }
  // every saved record set: IndexedDB first, plus any left in localStorage (private windows)
  function all() {
    var out = {};
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf(PRE) === 0) try { out[k.slice(PRE.length)] = JSON.parse(localStorage.getItem(k)); } catch (e) {} } } catch (e) {}
    return T.idb.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return String(k).indexOf(PRE) === 0; }).map(function (k) { return T.idb.get(k).then(function (v) { out[k.slice(PRE.length)] = v; }); }));
    }, function () {}).then(function () { return out; });
  }
  function settings() { var s = {}; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('gco-tool-') === 0) s[k] = localStorage.getItem(k); } } catch (e) {} return s; }
  function backupAll() {
    return all().then(function (v) {
      var names = Object.keys(v), plain = {};
      return Promise.all(names.map(function (n) { return toPlain(v[n]).then(function (p) { plain[n] = p; }); })).then(function () { return { tool: '*all*', app: 'Infinity by GroupChatOn', saved: new Date().toISOString(), vaults: plain, settings: settings() }; });
    });
  }
  function put(name, data) { return T.idb.put(PRE + name, data).catch(function () { localStorage.setItem(PRE + name, JSON.stringify(data)); }); }
  function restore(j, only) {
    if (j && j.tool === '*all*' && j.vaults) {
      var names = Object.keys(j.vaults).filter(function (n) { return !only || only.indexOf(n) >= 0; });
      return Promise.all(names.map(function (n) { return fromPlain(j.vaults[n]).then(function (d) { return put(n, d); }); })).then(function () {
        if (!only && j.settings) try { Object.keys(j.settings).forEach(function (k) { if (k.indexOf('gco-tool-') === 0) localStorage.setItem(k, j.settings[k]); }); } catch (e) {}
        return names;
      });
    }
    if (j && j.tool && j.data) return fromPlain(j.data).then(function (d) { return put(j.tool, d).then(function () { return [j.tool]; }); });
    return Promise.reject(new Error('This file is not an Infinity backup.'));
  }
  var sum = h('div', { 'class': 'tsum', 'data-out': '' }), list = h('div', { 'class': 'tlist' }), store = h('p', { 'class': 'tnote' }), msg = T.status();
  var file = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
  file.addEventListener('change', function () {
    var f0 = file.files[0]; file.value = ''; if (!f0) return;
    T.read(f0, 'text').then(function (t) {
      var j = JSON.parse(t), n = j.tool === '*all*' ? Object.keys(j.vaults || {}).length : 1;
      if (!confirm('Restore ' + n + (n === 1 ? ' tool' : ' tools') + ' from this backup (saved ' + String(j.saved || '').slice(0, 10) + ')? It replaces what those tools have saved on this device now.')) return;
      return restore(j).then(function (names) { msg.ok('Restored: ' + names.map(function (x) { return info(x).name; }).join(', ') + '. Reloading so every tool sees it…'); draw(); setTimeout(function () { location.reload(); }, 1800); });
    }).catch(function (e) { msg.error(e.message && /JSON/.test(e.message) ? 'This file is not an Infinity backup.' : e); });
  });
  function draw() {
    return all().then(function (v) {
      var names = Object.keys(v).sort(function (a, b) { return size(v[b]) - size(v[a]); }), total = 0, recs = 0;
      list.innerHTML = '';
      names.forEach(function (n) {
        var d = v[n], s = size(d), c = count(d), t = info(n); total += s; recs += c;
        list.appendChild(h('div', { 'class': 'titem' }, [h('span', { 'class': 'titem-ic', text: t.icon }),
          h('span', { 'class': 'titem-main' }, [t.path ? h('a', { href: t.path, style: 'font-weight:700' }, [t.name]) : h('b', { text: t.name }), h('small', { text: T.num(c) + ' records · ' + T.bytes(s) })]),
          h('button', { type: 'button', title: 'Back up this tool', 'aria-label': 'Back up ' + t.name, text: '⬇', onclick: function () {
            toPlain(d).then(function (p) { T.download(new Blob([JSON.stringify({ tool: n, saved: new Date().toISOString(), data: p }, null, 1)], { type: 'application/json' }), n + '-backup-' + new Date().toISOString().slice(0, 10) + '.json'); });
          } }),
          h('button', { type: 'button', title: 'Delete this tool’s data', 'aria-label': 'Delete ' + t.name + ' data', text: '✕', onclick: function () {
            if (!confirm('Delete everything ' + t.name + ' has saved on this device? Back it up first if you may need it.')) return;
            T.idb.del(PRE + n).catch(function () {}).then(function () { try { localStorage.removeItem(PRE + n); } catch (e) {} msg.ok(t.name + ' data deleted. Reloading…'); draw(); setTimeout(function () { location.reload(); }, 1500); });
          } })]));
      });
      if (!names.length) list.appendChild(h('p', { 'class': 'tnote', text: 'No tool has saved anything on this device yet. Records from the money manager, khata, invoices, registers and logs will show here.' }));
      sum.innerHTML = '';
      [['Tools with data', T.num(names.length)], ['Records', T.num(recs)], ['Space used', T.bytes(total)]].forEach(function (x) { sum.appendChild(h('div', {}, [h('span', { text: x[0] }), h('b', { text: x[1] })])); });
      if (navigator.storage && navigator.storage.estimate) Promise.all([navigator.storage.estimate(), navigator.storage.persisted ? navigator.storage.persisted() : false]).then(function (r) {
        store.textContent = (r[0].quota ? 'This browser lets the site use up to about ' + T.bytes(r[0].quota) + '. ' : '') + (r[1] ? '✅ The browser has agreed to keep this data even when space runs low.' : '⚠️ The browser may clear this data if your device runs very low on space, so keep a backup.');
      }, function () {});
      return v;
    });
  }
  var lastBackup = T.store.get('my-data-last', '');
  spot.appendChild(T.card([h('div', { 'class': 'tvault' }, [h('span', { 'class': 'tvault-msg' }, [h('b', { text: '🔒 All on this device. ' }), 'Records from every Infinity tool live in this browser only. One backup file keeps all of them safe.'])]),
    sum, T.row([T.button('⬇ Back up everything', { primary: true, onclick: function () {
      backupAll().then(function (j) {
        T.download(new Blob([JSON.stringify(j, null, 1)], { type: 'application/json' }), 'infinity-all-backup-' + new Date().toISOString().slice(0, 10) + '.json');
        T.store.set('my-data-last', new Date().toISOString().slice(0, 10)); msg.ok('Backup file saved with ' + Object.keys(j.vaults).length + ' tools. Keep it in Google Drive, email or a pen drive.');
      }, msg.error);
    } }), T.button('⬆ Restore a backup', { onclick: function () { file.click(); } }), file]),
    h('p', { 'class': 'tnote', text: lastBackup ? 'Last full backup from this page: ' + lastBackup + '.' : 'Tip: back up once a week, and always before clearing browser data or changing phones.' }),
    msg.el, h('h3', { text: 'Saved by each tool' }), list, store,
    T.row([T.button('Ask the browser to keep my data', { small: true, onclick: function () { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(function (ok) { msg[ok ? 'ok' : 'info'](ok ? 'Done: the browser will keep this data.' : 'The browser said not now. It usually agrees once you install the app or use it often; keep backups meanwhile.'); draw(); }); } })]),
    h('p', { 'class': 'tnote', text: 'Restore accepts both this full backup and the single-tool backups made with each tool’s own Backup button. Diary entries stay encrypted inside every backup.' })]));
  T.ready.then(draw);

  T.tests['my-data'] = function () {
    var fails = [], blob = new Blob(['hi'], { type: 'text/plain' });
    return T.idb.put(PRE + 'zz-test', { list: [1, 2, 3], pic: blob, note: 'x' }).then(backupAll).then(function (j) {
      var p = j.vaults['zz-test'];
      if (!p || !p.pic || String(p.pic.__blob).indexOf('data:') !== 0) fails.push('blob not in backup');
      if (count(p) !== 3) fails.push('count ' + count(p));
      return restore({ tool: '*all*', vaults: { 'zz-test2': p } });
    }).then(function () { return T.idb.get(PRE + 'zz-test2'); }).then(function (back) {
      if (!back || !(back.pic instanceof Blob) || back.pic.size !== 2 || back.list.length !== 3) fails.push('restore all');
      return restore({ tool: 'zz-test3', data: { a: [1] } });
    }).then(function () { return T.idb.get(PRE + 'zz-test3'); }).then(function (one) {
      if (!one || one.a[0] !== 1) fails.push('restore single');
      return restore({ foo: 1 }).then(function () { fails.push('bad file accepted'); }, function () {});
    }).then(draw).then(function (v) {
      if (!v['zz-test'] || list.textContent.indexOf('Zz test') < 0) fails.push('not listed: ' + list.textContent.slice(0, 80));
      return Promise.all(['zz-test', 'zz-test2', 'zz-test3'].map(function (k) { return T.idb.del(PRE + k); }));
    }).then(draw).then(function () { return { ok: !fails.length, n: 6, fails: fails }; });
  };
});
