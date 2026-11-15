/* Infinity by GroupChatOn — poll. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Quick poll and decision maker: vote by passing the phone, count numbered replies pasted from a WhatsApp group, or let the browser pick fairly. */
GCOTools.register('poll', function (spot, T) {
  var h = T.h;
  var st = T.store.get('poll', null) || { q: '', opts: ['', ''], votes: {}, secret: false, shown: false, replies: '' };
  function keep() { T.store.set('poll', st); }
  function options() { return st.opts.map(function (o) { return o.trim(); }).filter(Boolean); }
  function rnd(n) { var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; }
  // replies like "[12/10/26, 9:41 PM] Riya: 2" or "12/10/2026, 21:41 - Riya: 2" or "Riya: pizza"; each person's last vote counts
  function tally(text, opts) {
    var by = {}, order = [], n = opts.length;
    String(text || '').split(/\r?\n/).forEach(function (line) {
      var m = line.replace(/^‎/, '').match(/^\s*(?:\[[^\]]*\]\s*|\d{1,4}[\/.\-]\d{1,2}[\/.\-]\d{1,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s?m\.?)?\s*[-–]\s*)?([^:]{1,60}):\s*(.+)$/i);
      if (!m) return;
      var who = m[1].trim(), said = m[2].trim().toLowerCase(), pick = -1, nums = said.match(/\d+/g), num = nums && nums.length === 1 ? [0, nums[0]] : said.match(/^(?:option\s*)?#?(\d{1,2})\b/);
      if (num && +num[1] >= 1 && +num[1] <= n) pick = +num[1] - 1;
      else opts.forEach(function (o, i) { if (pick < 0 && said.indexOf(o.toLowerCase()) >= 0) pick = i; });
      if (pick < 0) return;
      if (!(who in by)) order.push(who);
      by[who] = pick;
    });
    var counts = opts.map(function () { return 0; });
    order.forEach(function (w) { counts[by[w]]++; });
    return { counts: counts, voters: order.length, by: by };
  }
  function bars(counts, opts) {
    var total = counts.reduce(function (a, b) { return a + b; }, 0), max = Math.max.apply(null, counts.concat([0]));
    var box = h('div', { 'class': 'tlist', 'data-out': '' });
    opts.forEach(function (o, i) {
      var pc = total ? 100 * counts[i] / total : 0, win = total && counts[i] === max;
      box.appendChild(h('div', { 'class': 'titem', style: 'display:block' }, [h('div', { style: 'display:flex;justify-content:space-between;gap:8px' }, [h('b', { text: (win ? '🏆 ' : '') + o }), h('span', { text: counts[i] + ' · ' + pc.toFixed(0) + '%' })]),
        h('div', { style: 'height:8px;border-radius:6px;background:var(--line);margin-top:6px;overflow:hidden' }, [h('i', { style: 'display:block;height:100%;width:' + pc.toFixed(1) + '%;background:var(--accent)' })])]));
    });
    var winners = opts.filter(function (o, i) { return total && counts[i] === max; });
    box.appendChild(h('p', { 'class': 'tnote', text: !total ? 'No votes yet.' : winners.length > 1 ? 'Tie between ' + winners.join(' and ') + ' (' + total + ' votes). Use “Break the tie” or vote again.' : winners[0] + ' wins with ' + max + ' of ' + total + ' votes.' }));
    box.winners = winners;
    return box;
  }
  var view = 'vote', tabs = h('div', { 'class': 'ttabs', role: 'tablist' }), body = h('div', { 'class': 'tool-app-opts' }), status = T.status();
  var q = h('input', { type: 'text', placeholder: 'e.g. Where should we go for dinner?' });
  q.addEventListener('input', function () { st.q = q.value; keep(); share(); });
  var optBox = h('div', { 'class': 'tgrid2' }), shareA = h('a', { 'class': 'tbtn', target: '_blank', rel: 'noopener', text: 'Post the poll on WhatsApp' });
  function share() { shareA.href = 'https://wa.me/?text=' + encodeURIComponent('📊 ' + (st.q || 'Quick poll') + '\n' + options().map(function (o, i) { return (i + 1) + '. ' + o; }).join('\n') + '\n\nReply with the number of your choice.'); }
  function drawOpts() {
    optBox.innerHTML = '';
    st.opts.forEach(function (o, i) {
      var el = h('input', { type: 'text', placeholder: 'Option ' + (i + 1), value: o });
      el.addEventListener('input', function () { st.opts[i] = el.value; keep(); share(); if (view !== 'replies') drawBody(); });
      optBox.appendChild(h('div', { style: 'display:flex;gap:6px;align-items:flex-end' }, [h('span', { style: 'flex:1' }, [T.field('Option ' + (i + 1), el)]), st.opts.length > 2 ? T.button('✕', { small: true, onclick: function () { st.opts.splice(i, 1); keep(); drawOpts(); drawBody(); } }) : null]));
    });
    share();
  }
  function drawBody() {
    body.innerHTML = ''; status.clear();
    var opts = options();
    if (opts.length < 2) { body.appendChild(h('p', { 'class': 'tnote', text: 'Add at least two options above.' })); return; }
    if (view === 'vote') {
      var counts = opts.map(function (o) { return st.votes[o] || 0; }), total = counts.reduce(function (a, b) { return a + b; }, 0);
      var sec = h('input', { type: 'checkbox', checked: st.secret ? true : null, onchange: function (e) { st.secret = e.target.checked; st.shown = false; keep(); drawBody(); } });
      body.appendChild(h('label', { 'class': 'tcheck' }, [sec, ' Secret vote: hide results until everyone has voted (pass the phone around)']));
      body.appendChild(h('div', { 'class': 'trow' }, opts.map(function (o) { return T.button(o, { primary: true, onclick: function () { st.votes[o] = (st.votes[o] || 0) + 1; st.last = o; keep(); drawBody(); status.ok(st.secret ? 'Vote saved. Pass the phone to the next person.' : 'Vote added for ' + o + '.'); } }); })));
      if (st.secret && !st.shown) body.appendChild(h('p', { 'class': 'tbig', 'data-out': '', style: 'text-align:center', text: total + (total === 1 ? ' vote' : ' votes') + ' so far' }));
      else body.appendChild(bars(counts, opts));
      body.appendChild(T.row([st.secret && !st.shown ? T.button('Show results', { onclick: function () { st.shown = true; keep(); drawBody(); } }) : null,
        T.button('Undo last vote', { small: true, disabled: !st.last, onclick: function () { if (st.last && st.votes[st.last]) st.votes[st.last]--; st.last = ''; keep(); drawBody(); } }),
        T.button('Break the tie', { small: true, onclick: function () { var w = bars(counts, opts).winners; if (w.length < 2) { status.info('There is no tie to break.'); return; } status.ok('The browser picked: ' + w[rnd(w.length)]); } }),
        T.button('Reset votes', { small: true, onclick: function () { if (total && !confirm('Clear all votes?')) return; st.votes = {}; st.shown = false; st.last = ''; keep(); drawBody(); } })]));
    } else if (view === 'replies') {
      var ta = h('textarea', { rows: '8', placeholder: 'Paste the replies from your group here, e.g.\n[12/10/26, 9:41 PM] Riya: 2\n[12/10/26, 9:42 PM] Karan: pizza' });
      ta.value = st.replies || '';
      var res = h('div');
      function count() { st.replies = ta.value; keep(); var t = tally(ta.value, opts); res.innerHTML = ''; res.appendChild(bars(t.counts, opts)); res.appendChild(h('p', { 'class': 'tnote', text: t.voters + ' people voted. If someone changed their mind, only their last reply counts.' })); }
      ta.addEventListener('input', count);
      body.appendChild(T.field('Replies (copy them from the chat, or export the chat as text)', ta)); body.appendChild(res); count();
    } else {
      var big = h('div', { 'class': 'tbig', 'data-out': '', style: 'font-size:34px;font-weight:800;text-align:center;padding:16px 0;min-height:60px', text: st.picked || '?' });
      body.appendChild(big);
      body.appendChild(T.row([T.button('Decide for me', { primary: true, onclick: function () {
        var i = 0, spins = 14, timer = setInterval(function () { big.textContent = opts[i++ % opts.length]; if (--spins <= 0) { clearInterval(timer); st.picked = opts[rnd(opts.length)]; keep(); big.textContent = st.picked; } }, 70);
      } })]));
      body.appendChild(h('p', { 'class': 'tnote', text: 'The pick uses your browser’s secure random numbers, so every option has exactly the same chance.' }));
    }
  }
  function drawTabs() {
    tabs.innerHTML = '';
    [['vote', '🗳️ Vote here'], ['replies', '💬 Count replies'], ['decide', '🎲 Decide for me']].forEach(function (t) { tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(view === t[0]), text: t[1], onclick: function () { view = t[0]; drawTabs(); drawBody(); } })); });
  }
  spot.appendChild(T.card([T.field('Question', q), optBox,
    T.row([T.button('+ Add option', { small: true, onclick: function () { if (st.opts.length >= 12) return; st.opts.push(''); keep(); drawOpts(); } }), shareA,
      T.button('Try a sample', { small: true, onclick: function () {
        st = { q: 'Where should we go for dinner on Friday?', opts: ['Pizza', 'Chinese', 'Dhaba'], votes: { Pizza: 3, Chinese: 1, Dhaba: 3 }, secret: false, shown: false,
          replies: '[10/11/26, 9:41 PM] Riya: 1\n[10/11/26, 9:42 PM] Karan: chinese please\n[10/11/26, 9:43 PM] Ayesha: 3\n[10/11/26, 9:45 PM] Riya: actually 3\n10/11/2026, 21:46 - Dev: 1' };
        keep(); q.value = st.q; drawOpts(); drawBody(); } })]),
    tabs, body, status.el]));
  q.value = st.q; drawOpts(); drawTabs(); drawBody();

  T.tests['poll'] = function () {
    var f = [], o = ['Pizza', 'Chinese', 'Dhaba'];
    var t = tally('[10/11/26, 9:41 PM] Riya: 1\n[10/11/26, 9:42 PM] Karan: chinese please\n[10/11/26, 9:43 PM] Ayesha: 3\n[10/11/26, 9:45 PM] Riya: actually 3\n10/11/2026, 21:46 - Dev: 1\nRiya joined using this group’s invite link\nSam: 9', o);
    if (t.counts.join(',') !== '1,1,2' || t.voters !== 4) f.push('tally ' + t.counts + ' voters ' + t.voters);
    if (tally('Asha: option 2', o).counts[1] !== 1) f.push('"option 2"');
    var seen = {}; for (var i = 0; i < 300; i++) seen[rnd(3)] = 1; if (Object.keys(seen).length !== 3) f.push('random pick');
    var b = bars([2, 2, 1], o); if (b.winners.length !== 2) f.push('tie');
    return Promise.resolve({ ok: !f.length, n: 4, fails: f });
  };
});
