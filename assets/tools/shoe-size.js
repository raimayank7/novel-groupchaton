/* Infinity by GroupChatOn — shoe-size. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Shoe and clothing size converter: UK, US, EU, India and foot length in cm, for men, women and children, plus a foot-length size finder. */
GCOTools.register('shoe-size', function (spot, T) {
  var h = T.h;
  // [UK, US, EU, foot length cm]; India uses UK sizes for shoes
  var TABLES = {
    men: { name: 'Men', us: 'US men', rows: [[5, 6, 38.5, 24], [5.5, 6.5, 39, 24.5], [6, 7, 40, 25], [6.5, 7.5, 40.5, 25.5], [7, 8, 41, 26], [7.5, 8.5, 42, 26.5], [8, 9, 42.5, 27], [8.5, 9.5, 43, 27.5], [9, 10, 44, 28], [9.5, 10.5, 44.5, 28.5], [10, 11, 45, 29], [10.5, 11.5, 45.5, 29.5], [11, 12, 46, 30], [11.5, 12.5, 47, 30.5], [12, 13, 47.5, 31], [13, 14, 48.5, 32]] },
    women: { name: 'Women', us: 'US women', rows: [[2.5, 5, 35.5, 22], [3, 5.5, 36, 22.5], [3.5, 6, 36.5, 23], [4, 6.5, 37.5, 23.5], [4.5, 7, 38, 24], [5, 7.5, 38.5, 24.5], [5.5, 8, 39, 25], [6, 8.5, 40, 25.5], [6.5, 9, 40.5, 26], [7, 9.5, 41, 26.5], [7.5, 10, 42, 27], [8, 10.5, 42.5, 27.5], [8.5, 11, 43, 28], [9.5, 12, 44, 29]] },
    kids: { name: 'Children', us: 'US kids', rows: [['4 (child)', '5 C', 20, 12.4], ['5 (child)', '6 C', 22, 13.2], ['6 (child)', '7 C', 23, 14], ['7 (child)', '8 C', 24, 14.9], ['8 (child)', '9 C', 26, 15.7], ['9 (child)', '10 C', 27, 16.5], ['10 (child)', '11 C', 28, 17.4],
      ['11 (child)', '12 C', 29, 18.2], ['12 (child)', '13 C', 30.5, 19.1], ['13 (child)', '1 Y', 32, 19.9], ['1', '2 Y', 33, 20.7], ['2', '3 Y', 34, 21.6], ['3', '4 Y', 35.5, 22.4]] }
  };
  var CLOTH = {
    wtop: { name: 'Women’s tops and dresses', head: ['Size', 'UK / India', 'US', 'EU', 'Bust (cm)'], rows: [['XS', '6', '2', '34', '80–84'], ['S', '8–10', '4–6', '36–38', '84–92'], ['M', '12', '8', '40', '92–96'], ['L', '14–16', '10–12', '42–44', '96–106'], ['XL', '18', '14', '46', '106–112'], ['XXL', '20–22', '16–18', '48–50', '112–124']] },
    mshirt: { name: 'Men’s shirts', head: ['Size', 'India / collar (cm)', 'Collar (inch)', 'EU', 'Chest (inch)'], rows: [['S', '38', '15', '38', '36–38'], ['M', '40', '15.5–16', '40', '38–40'], ['L', '42', '16.5', '42', '42–44'], ['XL', '44', '17–17.5', '44', '44–46'], ['XXL', '46', '18', '46', '46–48'], ['3XL', '48', '18.5–19', '48', '48–52']] },
    mpant: { name: 'Men’s trousers and jeans', head: ['Size', 'Waist (inch) / India', 'Waist (cm)', 'EU', 'UK / US'], rows: [['XS', '28', '71', '44', '28'], ['S', '30', '76', '46', '30'], ['M', '32', '81', '48', '32'], ['L', '34', '86', '50', '34'], ['XL', '36', '91', '52', '36'], ['XXL', '38–40', '97–102', '54–56', '38–40']] }
  };
  var COLS = ['UK / India', 'US', 'EU', 'Foot length (cm)'];
  function fmt(v) { return typeof v === 'number' ? String(v) : v; }
  // the row for a size in one system (0 UK, 1 US, 2 EU, 3 cm)
  function find(kind, col, val) { return TABLES[kind].rows.filter(function (r) { return String(r[col]) === String(val); })[0] || null; }
  // smallest size whose foot length is at least the measured foot
  function byFoot(kind, cm) { var rows = TABLES[kind].rows; for (var i = 0; i < rows.length; i++) if (rows[i][3] >= cm - 0.05) return rows[i]; return null; }
  var st = T.store.get('shoe-size', { kind: 'men', col: 0, val: '8' });
  var kindSeg, colSel = T.select(COLS.map(function (c, i) { return [String(i), c]; }), String(st.col)), valSel = h('select', { 'aria-label': 'Size' });
  var res = h('div', { 'class': 'tkv', 'data-out': '' }), tbl = h('div', { 'class': 'tcalc-scroll' }), foot = h('input', { type: 'number', step: '0.1', min: '8', max: '35', placeholder: 'e.g. 26.4', inputmode: 'decimal' }), footOut = h('p', { 'class': 'tnote' });
  var shoeBox = h('div'), clothBox = h('div');
  function fillVals() {
    if (st.kind === 'cloth') return;
    valSel.innerHTML = '';
    TABLES[st.kind].rows.forEach(function (r) { valSel.appendChild(h('option', { value: String(r[st.col]), selected: String(r[st.col]) === String(st.val) ? true : null, text: fmt(r[st.col]) })); });
    if (!find(st.kind, st.col, valSel.value)) valSel.selectedIndex = 0;
  }
  function show() {
    T.store.set('shoe-size', st);
    shoeBox.hidden = st.kind === 'cloth'; clothBox.hidden = st.kind !== 'cloth';
    if (st.kind === 'cloth') { drawCloth(); return; }
    st.val = valSel.value;
    var r = find(st.kind, st.col, st.val), t = TABLES[st.kind];
    res.innerHTML = '';
    if (r) [['UK', r[0]], ['India (IND)', r[0]], [t.us, r[1]], ['EU', r[2]], ['Foot length', r[3] + ' cm']].forEach(function (x) { res.appendChild(h('div', {}, [h('span', { text: x[0] }), h('code', { text: fmt(x[1]) }), h('span')])); });
    tbl.innerHTML = '';
    tbl.appendChild(h('table', {}, [h('thead', {}, [h('tr', {}, ['UK / India', t.us, 'EU', 'Foot (cm)'].map(function (x) { return h('th', { text: x }); }))]),
      h('tbody', {}, t.rows.map(function (row) { return h('tr', { style: row === r ? 'background:var(--accent-soft);font-weight:700' : null }, row.map(function (x) { return h('td', { text: fmt(x) }); })); }))]));
    footSize();
  }
  function footSize() {
    var cm = parseFloat(foot.value);
    if (!(cm > 0)) { footOut.textContent = 'Stand on paper, mark your heel and longest toe, and measure the distance in cm. Measure in the evening, when feet are largest.'; return; }
    var r = byFoot(st.kind, cm);
    footOut.textContent = r ? 'For a ' + cm + ' cm foot, try UK / India ' + fmt(r[0]) + ', ' + TABLES[st.kind].us + ' ' + fmt(r[1]) + ', EU ' + r[2] + '. Between sizes or wide feet? Go half a size up.' : 'That foot length is outside this chart.';
  }
  function drawCloth() {
    clothBox.innerHTML = '';
    Object.keys(CLOTH).forEach(function (k) {
      var c = CLOTH[k];
      clothBox.appendChild(h('h3', { text: c.name }));
      clothBox.appendChild(h('div', { 'class': 'tcalc-scroll', 'data-out': '' }, [h('table', {}, [h('thead', {}, [h('tr', {}, c.head.map(function (x) { return h('th', { text: x }); }))]), h('tbody', {}, c.rows.map(function (r) { return h('tr', {}, r.map(function (x) { return h('td', { text: x }); })); }))])]));
    });
    clothBox.appendChild(h('p', { 'class': 'tnote', text: 'Clothing sizes vary a lot between brands and countries: always check the brand’s own chart against your measurements.' }));
  }
  kindSeg = T.seg([['men', 'Men'], ['women', 'Women'], ['kids', 'Kids'], ['cloth', 'Clothes']], st.kind, function (v) { st.kind = v; fillVals(); show(); });
  colSel.addEventListener('change', function () { var r = find(st.kind, st.col, valSel.value); st.col = +colSel.value; if (r) st.val = String(r[st.col]); fillVals(); show(); });
  valSel.addEventListener('change', show); foot.addEventListener('input', footSize);
  shoeBox.appendChild(h('div', { 'class': 'tgrid2' }, [T.field('I know my size in', colSel), T.field('Size', valSel)]));
  shoeBox.appendChild(res); shoeBox.appendChild(h('h3', { text: 'Not sure? Measure your foot' })); shoeBox.appendChild(T.field('Foot length (cm)', foot)); shoeBox.appendChild(footOut);
  shoeBox.appendChild(h('h3', { text: 'Full chart' })); shoeBox.appendChild(tbl);
  shoeBox.appendChild(h('p', { 'class': 'tnote', text: 'Sizes follow common brand charts; India uses UK shoe sizes. Brands differ by up to half a size, so check the brand’s chart when you can.' }));
  spot.appendChild(T.card([kindSeg, shoeBox, clothBox]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';
  fillVals(); show();

  T.tests['shoe-size'] = function () {
    var f = [], a = find('men', 0, '8'), b = find('women', 1, '8'), c = find('kids', 2, '33');
    if (!a || a[1] !== 9 || a[2] !== 42.5) f.push('men UK 8 ' + a);
    if (!b || b[0] !== 5.5 || b[2] !== 39) f.push('women US 8 ' + b);
    if (!c || c[0] !== '1' || c[1] !== '2 Y') f.push('kids EU 33 ' + c);
    var d = byFoot('men', 26.8); if (!d || d[0] !== 8) f.push('foot 26.8 ' + d);
    if (byFoot('men', 40)) f.push('foot too big accepted');
    ['men', 'women', 'kids'].forEach(function (k) { var r = TABLES[k].rows; for (var i = 1; i < r.length; i++) if (!(r[i][2] > r[i - 1][2] && r[i][3] > r[i - 1][3])) f.push(k + ' order at ' + i); });
    return Promise.resolve({ ok: !f.length, n: 6, fails: f });
  };
});
