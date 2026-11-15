/* Digital Storage Calculator — bits to petabytes in both standards (1000 and 1024), what a drive really shows,
   what fits in that space, and how long it takes to download at any speed.
   Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.register('data-size', function (spot, T) {
  var h = T.h;
  // bytes in one unit
  var UNITS = [
    ['b', 'bits', 1 / 8], ['B', 'bytes', 1],
    ['KB', 'kilobytes (KB)', 1e3], ['MB', 'megabytes (MB)', 1e6], ['GB', 'gigabytes (GB)', 1e9], ['TB', 'terabytes (TB)', 1e12], ['PB', 'petabytes (PB)', 1e15],
    ['KiB', 'kibibytes (KiB)', 1024], ['MiB', 'mebibytes (MiB)', Math.pow(1024, 2)], ['GiB', 'gibibytes (GiB)', Math.pow(1024, 3)], ['TiB', 'tebibytes (TiB)', Math.pow(1024, 4)], ['PiB', 'pebibytes (PiB)', Math.pow(1024, 5)],
    ['Kb', 'kilobits (Kb)', 1e3 / 8], ['Mb', 'megabits (Mb)', 1e6 / 8], ['Gb', 'gigabits (Gb)', 1e9 / 8]
  ];
  var BY = {}; UNITS.forEach(function (u) { BY[u[0]] = u; });
  var saved = T.store.get('data-size', { v: '1', u: 'TB', speed: '100', su: 'Mbps' });
  var val = h('input', { type: 'number', min: '0', step: 'any', value: saved.v, 'aria-label': 'Amount' });
  var unit = T.select(UNITS.map(function (u) { return [u[0], u[1]]; }), saved.u);
  var grid = h('div', { 'class': 'tkv' });
  var drive = h('p', { 'class': 'tnote' });
  var fits = h('div', { 'class': 'tstats' });
  var speed = h('input', { type: 'number', min: '0', step: 'any', value: saved.speed, 'aria-label': 'Internet speed' });
  var sunit = T.select([['Kbps', 'Kbps'], ['Mbps', 'Mbps (internet plans)'], ['Gbps', 'Gbps'], ['MBps', 'MB/s (download apps)']], saved.su);
  var time = h('p', { 'class': 'tbig' });
  spot.appendChild(T.card([
    h('div', { 'class': 'tgrid2' }, [T.field('Amount', val), T.field('Unit', unit)]),
    h('h3', { text: 'In every unit' }), grid,
    h('h3', { text: 'What your computer or phone will show' }), drive,
    h('h3', { text: 'What fits in this space (about)' }), fits,
    h('h3', { text: 'How long to download it' }), h('div', { 'class': 'tgrid2' }, [T.field('Internet speed', speed), T.field('Speed unit', sunit)]), time]));

  function nice(n) {
    if (!isFinite(n)) return '—';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e15 || a < 1e-6) return n.toExponential(4);
    return n.toLocaleString(undefined, { maximumFractionDigits: a >= 100 ? 2 : a >= 1 ? 4 : 8 });
  }
  function best(bytes, base) {   // the friendliest unit for a byte count
    var names = base === 1024 ? ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'] : ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'], i = 0;
    while (bytes >= base && i < names.length - 1) { bytes /= base; i++; }
    return nice(Math.round(bytes * 100) / 100) + ' ' + names[i];
  }
  function dur(sec) {
    if (!isFinite(sec) || sec <= 0) return '—';
    if (sec < 1) return 'less than a second';
    var d = Math.floor(sec / 86400), hh = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = Math.round(sec % 60), out = [];
    if (d) out.push(d + ' day' + (d > 1 ? 's' : ''));
    if (hh) out.push(hh + ' hour' + (hh > 1 ? 's' : ''));
    if (m && !d) out.push(m + ' min');
    if (s && !d && !hh) out.push(s + ' sec');
    return out.join(' ');
  }
  function run() {
    T.store.set('data-size', { v: val.value, u: unit.value, speed: speed.value, su: sunit.value });
    var bytes = (parseFloat(val.value) || 0) * BY[unit.value][2];
    grid.innerHTML = '';
    UNITS.forEach(function (u) {
      if (u[0] === unit.value) return;
      var v = nice(bytes / u[2]);
      var b = T.button('Copy', { small: true, onclick: function () { T.copy(String(bytes / u[2]), b); } });
      grid.appendChild(h('div', {}, [h('span', { text: u[1] }), h('code', { text: v }), b]));
    });
    // drives are sold in 1000s, Windows counts in 1024s (and calls them GB)
    drive.innerHTML = '';
    drive.appendChild(document.createTextNode('Sold as ' + best(bytes, 1000) + ', Windows shows about '));
    drive.appendChild(h('b', { text: best(bytes, 1024).replace('KiB', 'KB').replace('MiB', 'MB').replace('GiB', 'GB').replace('TiB', 'TB').replace('PiB', 'PB') }));
    drive.appendChild(document.createTextNode('. macOS, iPhone and Android show ' + best(bytes, 1000) + '. Nothing is missing: makers count 1 GB as 1,000,000,000 bytes, Windows counts 1,073,741,824. The system and pre-installed apps take a little more.'));
    // typical sizes (bytes)
    var ITEMS = [['📷', 'phone photos', 3.5e6], ['🎵', 'songs (MP3, 4 min)', 4e6], ['🎬', 'minutes of 1080p video', 130e6], ['📺', 'minutes of 4K video', 400e6],
      ['📄', 'PDF documents', 1e6], ['💬', 'WhatsApp voice notes (1 min)', 1e5], ['🎮', 'mobile games', 1.5e9], ['🎞️', 'HD movies', 4e9]];
    fits.innerHTML = '';
    ITEMS.forEach(function (it) {
      var n = Math.floor(bytes / it[2]);
      fits.appendChild(h('div', { 'class': 'tstat' }, [h('b', { text: it[0] + ' ' + (n >= 1e6 ? (n / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' M' : n.toLocaleString()) }), h('span', { text: it[1] })]));
    });
    var bps = (parseFloat(speed.value) || 0) * ({ Kbps: 1e3, Mbps: 1e6, Gbps: 1e9, MBps: 8e6 })[sunit.value];
    time.textContent = bps ? dur(bytes * 8 / bps) + ' at full speed' : 'Type your internet speed';
  }
  [val, unit, speed, sunit].forEach(function (x) { x.addEventListener('input', run); x.addEventListener('change', run); });
  run();
});
