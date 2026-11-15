/* Infinity by GroupChatOn — date-format. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  function cal(d, c, o) { try { return new Intl.DateTimeFormat('en-u-ca-' + c, o || { year: 'numeric', month: 'long', day: 'numeric', era: c === 'japanese' ? 'long' : undefined, timeZone: 'UTC' }).format(d); } catch (e) { return 'Not supported by this browser'; } }
  GCOTools.engine('calc', 'date-format', {
    inputs: [{ k: 'd', label: 'Date', type: 'date', value: 'today' }],
    calc: function (v, X) {
      X.need(/^\d{4}-\d{2}-\d{2}$/.test(v.d || ''), 'Choose a date.');
      var p = v.d.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
      var doy = Math.round((d - Date.UTC(p[0], 0, 1)) / 864e5) + 1;
      var th = new Date(d); th.setUTCDate(th.getUTCDate() + 3 - (th.getUTCDay() + 6) % 7);
      var wk = 1 + Math.round(((th - Date.UTC(th.getUTCFullYear(), 0, 4)) / 864e5 - 3 + (new Date(Date.UTC(th.getUTCFullYear(), 0, 4)).getUTCDay() + 6) % 7) / 7);
      var saka = cal(d, 'indian'), sy = (saka.match(/(\d{4})/) || [])[1];
      return { rows: [['Day', d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })], ['ISO 8601', v.d], ['US style', d.toLocaleDateString('en-US', { timeZone: 'UTC' })],
        ['UK / India style', ('0' + p[2]).slice(-2) + '/' + ('0' + p[1]).slice(-2) + '/' + p[0]], ['Day of the year', doy, 'int'], ['ISO week', p[0] + '-W' + ('0' + wk).slice(-2)],
        ['Unix time (midnight UTC)', Math.round(d / 1000), function (n) { return String(n); }],
        ['Islamic (Hijri, Umm al-Qura)', cal(d, 'islamic-umalqura')], ['Hebrew', cal(d, 'hebrew')], ['Indian national (Saka)', saka],
        ['Vikram Samvat (year, about)', sy ? String(+sy + 135) : '—'], ['Persian (Solar Hijri)', cal(d, 'persian')], ['Chinese', cal(d, 'chinese', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })],
        ['Buddhist (Thai)', cal(d, 'buddhist')], ['Japanese', cal(d, 'japanese')], ['Ethiopian', cal(d, 'ethiopic')]],
        note: 'Calendars come from your browser’s built-in calendar data. Islamic dates can differ by a day locally, as months start with the moon sighting. The Vikram Samvat year changes in March or April.' };
    },
    test: [{ in: { d: '2026-11-01' }, expect: { 'Day of the year': 305, 'ISO week': '2026-W44', 'Unix time (midnight UTC)': 1793491200, Day: 'Sunday', Hebrew: '5787', 'Islamic (Hijri, Umm al-Qura)': '1448',
      'Indian national (Saka)': '1948', 'Vikram Samvat (year, about)': '2083', 'Persian (Solar Hijri)': '1405', 'Buddhist (Thai)': '2569' } }]
  });
})();
