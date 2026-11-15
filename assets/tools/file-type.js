/* Infinity by GroupChatOn — file-type. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* What type is this file? Reads the first bytes (the "magic number") to find the real format, whatever the file is called, and warns when the name does not match. */
GCOTools.register('file-type', function (spot, T) {
  var h = T.h;
  function at(b, o, sig) { for (var i = 0; i < sig.length; i++) if (sig[i] !== null && b[o + i] !== sig[i]) return false; return b.length >= o + sig.length; }
  function asc(b, o, n) { var s = ''; for (var i = o; i < Math.min(b.length, o + n); i++) s += String.fromCharCode(b[i]); return s; }
  function A(s) { return s.split('').map(function (c) { return c.charCodeAt(0); }); }
  var PROGRAM = { exe: 1, elf: 1, macho: 1, apk: 1, jar: 1, script: 1 };
  // [test, name, extensions, MIME, kind]
  var SIGS = [
    [function (b) { return at(b, 0, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); }, 'PNG image', ['png'], 'image/png'],
    [function (b) { return at(b, 0, [0xFF, 0xD8, 0xFF]); }, 'JPEG image', ['jpg', 'jpeg', 'jfif'], 'image/jpeg'],
    [function (b) { return asc(b, 0, 6) === 'GIF87a' || asc(b, 0, 6) === 'GIF89a'; }, 'GIF image', ['gif'], 'image/gif'],
    [function (b) { return asc(b, 0, 4) === 'RIFF' && asc(b, 8, 4) === 'WEBP'; }, 'WebP image', ['webp'], 'image/webp'],
    [function (b) { return asc(b, 0, 4) === 'RIFF' && asc(b, 8, 4) === 'WAVE'; }, 'WAV audio', ['wav'], 'audio/wav'],
    [function (b) { return asc(b, 0, 4) === 'RIFF' && asc(b, 8, 4) === 'AVI '; }, 'AVI video', ['avi'], 'video/x-msvideo'],
    [function (b) { return asc(b, 0, 5) === '%PDF-'; }, 'PDF document', ['pdf'], 'application/pdf'],
    [function (b) { return at(b, 0, A('Rar!\x1a\x07')); }, 'RAR archive', ['rar'], 'application/vnd.rar'],
    [function (b) { return at(b, 0, [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]); }, '7-Zip archive', ['7z'], 'application/x-7z-compressed'],
    [function (b) { return at(b, 0, [0x1F, 0x8B]); }, 'GZIP archive', ['gz', 'tgz'], 'application/gzip'],
    [function (b) { return asc(b, 0, 3) === 'BZh'; }, 'BZIP2 archive', ['bz2'], 'application/x-bzip2'],
    [function (b) { return at(b, 0, [0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00]); }, 'XZ archive', ['xz'], 'application/x-xz'],
    [function (b) { return asc(b, 0x8001, 5) === 'CD001'; }, 'Disc image (ISO)', ['iso'], 'application/x-iso9660-image'],
    [function (b) { return asc(b, 257, 5) === 'ustar'; }, 'TAR archive', ['tar'], 'application/x-tar'],
    [function (b) { return asc(b, 0, 3) === 'ID3'; }, 'MP3 audio', ['mp3'], 'audio/mpeg'],
    [function (b) { return b[0] === 0xFF && (b[1] & 0xF6) === 0xF0; }, 'AAC audio', ['aac'], 'audio/aac'],
    [function (b) { return b[0] === 0xFF && (b[1] & 0xE0) === 0xE0; }, 'MP3 audio', ['mp3'], 'audio/mpeg'],
    [function (b) { return asc(b, 4, 4) === 'ftyp'; }, 'ftyp'],
    [function (b) { return at(b, 0, [0x1A, 0x45, 0xDF, 0xA3]); }, 'mkv'],
    [function (b) { return asc(b, 0, 4) === 'OggS'; }, 'OGG audio / video', ['ogg', 'oga', 'ogv', 'opus'], 'audio/ogg'],
    [function (b) { return asc(b, 0, 4) === 'fLaC'; }, 'FLAC audio', ['flac'], 'audio/flac'],
    [function (b) { return asc(b, 0, 4) === 'MThd'; }, 'MIDI music', ['mid', 'midi'], 'audio/midi'],
    [function (b) { return asc(b, 0, 2) === 'BM' && b.length > 14; }, 'BMP image', ['bmp'], 'image/bmp'],
    [function (b) { return at(b, 0, [0x49, 0x49, 0x2A, 0x00]) || at(b, 0, [0x4D, 0x4D, 0x00, 0x2A]); }, 'TIFF image (or camera RAW)', ['tif', 'tiff', 'dng', 'nef', 'cr2', 'arw'], 'image/tiff'],
    [function (b) { return at(b, 0, [0x00, 0x00, 0x01, 0x00]); }, 'Windows icon', ['ico'], 'image/x-icon'],
    [function (b) { return asc(b, 0, 4) === '8BPS'; }, 'Photoshop document', ['psd'], 'image/vnd.adobe.photoshop'],
    [function (b) { return asc(b, 0, 2) === 'MZ'; }, 'Windows program (EXE / DLL)', ['exe', 'dll', 'msi', 'scr', 'sys', 'com'], 'application/x-msdownload', 'exe'],
    [function (b) { return at(b, 0, [0x7F, 0x45, 0x4C, 0x46]); }, 'Linux / Android program (ELF)', ['so', 'elf', 'bin', 'o'], 'application/x-executable', 'elf'],
    [function (b) { return at(b, 0, [0xCF, 0xFA, 0xED, 0xFE]) || at(b, 0, [0xFE, 0xED, 0xFA, 0xCF]); }, 'Mac program (Mach-O)', ['dylib', 'app', ''], 'application/x-mach-binary', 'macho'],
    [function (b) { return at(b, 0, [0xCA, 0xFE, 0xBA, 0xBE]); }, 'Java class / Mac universal program', ['class'], 'application/java-vm', 'macho'],
    [function (b) { return asc(b, 0, 16) === 'SQLite format 3\0'; }, 'SQLite database', ['sqlite', 'db', 'sqlite3'], 'application/vnd.sqlite3'],
    [function (b) { return at(b, 0, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]); }, 'Old Microsoft Office file (DOC / XLS / PPT / MSG)', ['doc', 'xls', 'ppt', 'msg', 'msi'], 'application/x-ole-storage'],
    [function (b) { return asc(b, 0, 5) === '{\\rtf'; }, 'Rich Text document', ['rtf'], 'application/rtf'],
    [function (b) { return asc(b, 0, 4) === 'wOFF'; }, 'WOFF web font', ['woff'], 'font/woff'],
    [function (b) { return asc(b, 0, 4) === 'wOF2'; }, 'WOFF2 web font', ['woff2'], 'font/woff2'],
    [function (b) { return asc(b, 0, 4) === 'OTTO'; }, 'OpenType font', ['otf'], 'font/otf'],
    [function (b) { return at(b, 0, [0x00, 0x01, 0x00, 0x00, 0x00]); }, 'TrueType font', ['ttf'], 'font/ttf'],
    [function (b) { return at(b, 0, [0x00, 0x61, 0x73, 0x6D]); }, 'WebAssembly module', ['wasm'], 'application/wasm'],
    [function (b) { return asc(b, 0, 2) === 'PK' && (b[2] === 3 || b[2] === 5 || b[2] === 7); }, 'zip'],
    [function (b) { return asc(b, 0, 11) === 'd8:announce' || asc(b, 0, 7) === 'd4:info'; }, 'Torrent file', ['torrent'], 'application/x-bittorrent']
  ];
  function ftyp(b) {
    var br = asc(b, 8, 4).trim(), all = asc(b, 8, 40);
    if (/heic|heix|hevc|heim|heis/.test(br)) return ['HEIC photo (iPhone)', ['heic', 'heif'], 'image/heic'];
    if (/avif|avis/.test(all)) return ['AVIF image', ['avif'], 'image/avif'];
    if (/mif1|msf1/.test(br)) return ['HEIF image', ['heif', 'heic'], 'image/heif'];
    if (br === 'qt') return ['QuickTime video (MOV)', ['mov', 'qt'], 'video/quicktime'];
    if (br === 'M4A' || br === 'M4B') return ['M4A audio', ['m4a', 'm4b', 'aac'], 'audio/mp4'];
    if (br === 'M4V') return ['M4V video', ['m4v', 'mp4'], 'video/x-m4v'];
    if (/^3g/.test(br)) return ['3GP video', ['3gp', '3g2'], 'video/3gpp'];
    if (br === 'crx') return ['Canon CR3 RAW photo', ['cr3'], 'image/x-canon-cr3'];
    return ['MP4 video / audio', ['mp4', 'm4a', 'm4v'], 'video/mp4'];
  }
  function zip(b) {
    var s = asc(b, 0, b.length);
    if (s.indexOf('mimetypeapplication/epub+zip') >= 0) return ['EPUB e-book', ['epub'], 'application/epub+zip'];
    if (s.indexOf('mimetypeapplication/vnd.oasis.opendocument.text') >= 0) return ['OpenDocument text (ODT)', ['odt'], 'application/vnd.oasis.opendocument.text'];
    if (s.indexOf('mimetypeapplication/vnd.oasis.opendocument.spreadsheet') >= 0) return ['OpenDocument spreadsheet (ODS)', ['ods'], 'application/vnd.oasis.opendocument.spreadsheet'];
    if (s.indexOf('AndroidManifest.xml') >= 0) return ['Android app (APK)', ['apk', 'aab'], 'application/vnd.android.package-archive', 'apk'];
    if (s.indexOf('word/') >= 0) return ['Word document (DOCX)', ['docx', 'docm', 'dotx'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (s.indexOf('xl/') >= 0) return ['Excel workbook (XLSX)', ['xlsx', 'xlsm', 'xltx'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (s.indexOf('ppt/') >= 0) return ['PowerPoint (PPTX)', ['pptx', 'ppsx', 'potx'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (s.indexOf('META-INF/MANIFEST.MF') >= 0) return ['Java archive (JAR)', ['jar', 'war'], 'application/java-archive', 'jar'];
    return ['ZIP archive', ['zip'], 'application/zip'];
  }
  function text(b) {
    var start = 0, enc = 'UTF-8';
    if (at(b, 0, [0xEF, 0xBB, 0xBF])) start = 3;
    else if (at(b, 0, [0xFF, 0xFE]) || at(b, 0, [0xFE, 0xFF])) return ['Text (UTF-16)', ['txt', 'csv', 'xml', 'reg'], 'text/plain'];
    var s; try { s = new TextDecoder('utf-8', { fatal: true }).decode(b.subarray(start, Math.min(b.length, 65536 - 4))); } catch (e) { return null; }
    if (/[\x00-\x08\x0E-\x1F]/.test(s)) return null;
    var t = s.trim(), lo = t.slice(0, 200).toLowerCase();
    if (/^<\?xml/.test(lo) && /<svg/.test(t.slice(0, 2000).toLowerCase())) return ['SVG image', ['svg'], 'image/svg+xml'];
    if (/^<svg/.test(lo)) return ['SVG image', ['svg'], 'image/svg+xml'];
    if (/^<\?xml/.test(lo)) return ['XML document', ['xml', 'rss', 'atom', 'xsd', 'kml', 'gpx'], 'application/xml'];
    if (/^<!doctype html|^<html|<head>|<body/.test(lo)) return ['Web page (HTML)', ['html', 'htm', 'xhtml'], 'text/html'];
    if (/^#!/.test(t)) return ['Script (' + (t.split('\n')[0].split('/').pop() || 'shell') + ')', ['sh', 'py', 'pl', 'rb', ''], 'text/x-script', 'script'];
    if (/^[\[{]/.test(t)) { try { JSON.parse(t); return ['JSON data', ['json', 'geojson', 'webmanifest'], 'application/json']; } catch (e) {} }
    if (/^begin:vcard/i.test(t)) return ['Contact card (vCard)', ['vcf'], 'text/vcard'];
    if (/^begin:vcalendar/i.test(t)) return ['Calendar file (iCalendar)', ['ics'], 'text/calendar'];
    if (/^\d+\r?\n\d\d:\d\d:\d\d,\d{3} --> /.test(t)) return ['Subtitles (SRT)', ['srt'], 'application/x-subrip'];
    if (/^WEBVTT/.test(t)) return ['Subtitles (WebVTT)', ['vtt'], 'text/vtt'];
    var lines = t.split(/\r?\n/).slice(0, 6), commas = lines.map(function (l) { return (l.match(/,/g) || []).length; });
    if (lines.length > 1 && commas[0] > 0 && commas.every(function (c) { return c === commas[0]; })) return ['CSV spreadsheet data', ['csv', 'txt'], 'text/csv'];
    return ['Plain text (' + enc + ')', ['txt', 'md', 'log', 'csv', 'ini', 'cfg', 'conf', 'json', 'js', 'css', 'py', 'java', 'c', 'cpp', 'sql', 'yml', 'yaml', 'bat', 'ps1', 'srt'], 'text/plain'];
  }
  function detect(b) {
    for (var i = 0; i < SIGS.length; i++) {
      var s = SIGS[i];
      if (!s[0](b)) continue;
      if (s[1] === 'ftyp') return ftyp(b);
      if (s[1] === 'zip') return zip(b);
      if (s[1] === 'mkv') return asc(b, 0, 64).indexOf('webm') >= 0 ? ['WebM video', ['webm'], 'video/webm'] : ['Matroska video (MKV)', ['mkv', 'mka'], 'video/x-matroska'];
      return [s[1], s[2], s[3], s[4]];
    }
    return text(b) || ['Unknown binary data', [], 'application/octet-stream'];
  }
  function verdict(name, d) {
    var m = String(name || '').toLowerCase().match(/\.([a-z0-9]{1,8})$/), ext = m ? m[1] : '';
    var ok = !d[1].length || d[1].indexOf(ext) >= 0;
    var danger = PROGRAM[d[3]] && ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'mp3', 'mp4', 'zip'].indexOf(ext) >= 0;
    return { ext: ext, ok: ok, danger: !!danger };
  }
  var out = h('div', { 'class': 'tlist' }), status = T.status();
  function show(file) {
    return T.read(file.slice(0, 65536)).then(function (buf) {
      var b = new Uint8Array(buf), d = detect(b), v = verdict(file.name, d);
      var kv = h('div', { 'class': 'tkv', 'data-out': '' });
      [['Real type', d[0]], ['Usual extension', d[1].length ? '.' + d[1][0] : '—'], ['MIME type', d[2]], ['Size', T.bytes(file.size)], ['Last modified', file.lastModified ? new Date(file.lastModified).toLocaleString() : '—'],
        ['First bytes', Array.prototype.slice.call(b.subarray(0, 16)).map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(' ') || '(empty file)']].forEach(function (r) { kv.appendChild(h('div', {}, [h('span', { text: r[0] }), h('code', { text: r[1] }), h('span')])); });
      var msg = v.danger ? '⚠ Careful: this is a program pretending to be a .' + v.ext + ' file. Do not open it unless you fully trust where it came from.'
        : !file.size ? 'This file is empty.' : v.ok ? '✓ The name matches the content.' : 'The name ends in ' + (v.ext ? '.' + v.ext : 'no extension') + ' but the file is really a ' + d[0] + '. Renaming it to .' + d[1][0] + ' should let the right app open it.';
      out.insertBefore(h('div', { 'class': 'titem', style: 'display:block' }, [h('p', {}, [h('b', { text: file.name })]), kv, h('p', { 'class': 'tstatus' + (v.danger ? ' is-error' : v.ok ? ' is-ok' : ''), text: msg })]), out.firstChild);
      status.clear();
    });
  }
  function run(files) { files.reduce(function (p, f) { return p.then(function () { return show(f); }); }, Promise.resolve()).catch(function (e) { status.error(e); }); }
  spot.appendChild(T.card([T.dropzone({ label: 'Choose any file', icon: '🔎', multiple: true, hint: 'or drag and drop: only the first 64 KB is read, nothing is uploaded', onFiles: run }),
    T.row([T.button('Try a sample', { small: true, onclick: function () { run([new File([new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52])], 'holiday-photo.jpg', { type: 'image/jpeg' })]); } })]), status.el, out]));
  spot.lastChild.style.gridTemplateColumns = 'minmax(0, 1fr)';

  T.tests['file-type'] = function () {
    var f = [], te = new TextEncoder();
    function ty(bytes) { return detect(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))[0]; }
    function zipWith(name) { var b = new Uint8Array(200); b.set([0x50, 0x4B, 3, 4]); b.set(te.encode(name), 30); return b; }
    var mp4 = new Uint8Array(32); mp4.set(te.encode('ftypisom'), 4);
    var heic = new Uint8Array(32); heic.set(te.encode('ftypheic'), 4);
    var cases = [[[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], 'PNG image'], [[0xFF, 0xD8, 0xFF, 0xE0], 'JPEG image'], [te.encode('%PDF-1.7'), 'PDF document'], [zipWith('word/document.xml'), 'Word document (DOCX)'],
      [zipWith('xl/workbook.xml'), 'Excel workbook (XLSX)'], [zipWith('hello.txt'), 'ZIP archive'], [mp4, 'MP4 video / audio'], [heic, 'HEIC photo (iPhone)'], [te.encode('MZ\x90\x00'), 'Windows program (EXE / DLL)'],
      [te.encode('{"a": 1}'), 'JSON data'], [te.encode('name,age\nA,1\nB,2'), 'CSV spreadsheet data'], [te.encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'SVG image'], [[0, 1, 2, 3, 250, 251], 'Unknown binary data']];
    cases.forEach(function (c) { var got = ty(c[0]); if (got !== c[1]) f.push('want ' + c[1] + ' got ' + got); });
    var v = verdict('invoice.pdf', detect(te.encode('MZ\x90\x00'))); if (!v.danger) f.push('exe as pdf not flagged');
    var w = verdict('photo.jpg', detect(new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))); if (w.ok || w.danger) f.push('png named jpg');
    if (!verdict('a.JPEG', detect(new Uint8Array([0xFF, 0xD8, 0xFF]))).ok) f.push('upper-case extension');
    return Promise.resolve({ ok: !f.length, n: cases.length + 3, fails: f });
  };
});
