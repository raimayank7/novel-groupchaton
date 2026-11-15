/* Infinity by GroupChatOn — code-explain. Designed & Developed by Nivesh Sahayak. See LICENSE. */
/* Error message explainer: paste an error from JavaScript, Python, PHP, Java, SQL, npm, git or a web server and get what it means and how to fix it. */
GCOTools.register('code-explain', function (spot, T) {
  // [pattern, title, meaning, fix steps]
  var E = [
    [/([\w$.]+) is not defined/i, 'JavaScript: ReferenceError — name not defined', 'Your code uses a variable or function called “$1” that does not exist where it is used.', ['Check the spelling and capital letters of “$1”.', 'Make sure it is declared (let, const, function) before this line runs.', 'If it comes from a library, make sure the library’s <script> loads first.']],
    [/cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '([^']+)'\))?/i, 'JavaScript: reading from $1', 'The code tried to read “$2” from something that is $1, so that thing does not exist yet.', ['Find the object before “.$2” and check why it is empty.', 'If it is a page element, the script may run before the HTML loads: add defer to the <script> tag.', 'Guard it: obj?.$2 (optional chaining) or check if (obj) first.']],
    [/(\S+) is not a function/i, 'JavaScript: TypeError — not a function', '“$1” is being called with () but it is not a function (it may be a value, empty, or misspelt).', ['Check the spelling of the method name.', 'console.log the thing before calling it to see what it really is.', 'For arrays from the page (NodeList), some array methods need Array.from(list) first.']],
    [/unexpected token/i, 'Syntax error — unexpected token', 'The code reader found a character it did not expect at that point: usually a missing or extra bracket, comma or quote just before it.', ['Look at the line number in the error and the line above it.', 'Check every ( { [ has a matching ) } ].', 'If it mentions “<” while reading JSON, the server sent an HTML page (often an error page) instead of JSON.']],
    [/Unexpected end of (JSON input|input)/i, 'Unexpected end of input', 'The text ended before the code or JSON was complete: something was never closed, or the response was empty.', ['Look for a missing } or ] at the end.', 'If it is a fetch() response, check it is not empty and the request succeeded (status 200).']],
    [/CORS|Access-Control-Allow-Origin/i, 'Browser blocked by CORS', 'The browser stopped your page from reading a response from another website because that website did not allow it.', ['The other server must send an Access-Control-Allow-Origin header that includes your site.', 'If you do not control it, call it from your own server instead of the browser.', 'For local files, run a local web server rather than opening the file directly.']],
    [/Failed to fetch|NetworkError/i, 'Network request failed', 'The request never got an answer: no internet, wrong address, blocked by CORS, or a mixed http/https page.', ['Open the address directly in a new tab to check it works.', 'Use https:// addresses on https pages.', 'Check the browser console for a CORS message.']],
    [/Maximum call stack size exceeded|RecursionError|StackOverflowError/i, 'Endless recursion', 'A function keeps calling itself (or two functions call each other) without ever stopping.', ['Find the function that calls itself and make sure there is a stopping condition.', 'Check that each call moves closer to that condition.']],
    [/IndentationError|unexpected indent|expected an indented block/i, 'Python: indentation error', 'Python uses spaces at the start of lines to group code, and these do not line up.', ['Use 4 spaces for each level and never mix tabs and spaces.', 'After a line ending with “:” the next line must be indented.']],
    [/ModuleNotFoundError: No module named '([^']+)'|ImportError: No module named ([\w.]+)/i, 'Python: module not installed', 'Python cannot find the package “$1$2”.', ['Install it: pip install $1$2 (the install name is sometimes different).', 'Make sure you install into the same Python or virtual environment you are running.']],
    [/NameError: name '([^']+)' is not defined/i, 'Python: NameError', '“$1” is used before it was created, or it is misspelt.', ['Check the spelling and capital letters.', 'Make sure it is assigned or imported before this line.']],
    [/KeyError: (.+)/i, 'Python: KeyError', 'The dictionary has no key $1.', ['Print the dictionary’s keys to see what it contains.', 'Use d.get(key) to get None instead of an error.']],
    [/IndexError: (list|string|tuple) index out of range/i, 'Index out of range', 'The code asked for an item position that does not exist in the $1 (positions start at 0).', ['Check the length with len() before reading.', 'The last item is at position len - 1.']],
    [/TypeError: unsupported operand type|can only concatenate str|must be str, not/i, 'Python: mixing types', 'The code combines a number and text (or other types) that cannot be added together.', ['Convert first: str(number) to join with text, or int(text) to do maths.']],
    [/ZeroDivisionError|division by zero/i, 'Division by zero', 'A number was divided by 0, which has no answer.', ['Check the divisor before dividing, and handle 0 separately.']],
    [/SyntaxError: invalid syntax/i, 'Python: invalid syntax', 'Python could not understand the line: often a missing colon, bracket or quote, or Python 2 code in Python 3.', ['Check the line and the one above for a missing : ) ] or quote.', 'print needs brackets in Python 3: print("hi").']],
    [/NullPointerException/i, 'Java: NullPointerException', 'The code used an object that is null (it was never created or was set to null).', ['Find the variable used on that line and check where it should have been set.', 'Add a null check or use Optional.']],
    [/ArrayIndexOutOfBoundsException/i, 'Java: array index out of bounds', 'The code read an array position that does not exist.', ['Valid positions are 0 to length - 1.']],
    [/Call to undefined function ([\w\\]+)/i, 'PHP: undefined function', 'PHP does not know the function $1().', ['Check the spelling.', 'The file that defines it may not be included, or a PHP extension is not enabled.']],
    [/Undefined (variable|index|array key):? \$?(\S+)/i, 'PHP: undefined $1', 'The code reads $2, which was never set.', ['Set it before use, or check with isset() / ?? first.']],
    [/Headers already sent/i, 'PHP: headers already sent', 'PHP tried to send a header (redirect, cookie) after some output was already printed.', ['Remove any space or blank line before <?php and any echo before header().', 'Save the file as UTF-8 without BOM.']],
    [/Allowed memory size of \d+ bytes exhausted/i, 'PHP: out of memory', 'The script used more memory than allowed.', ['Process data in smaller pieces.', 'Raise memory_limit in php.ini only if really needed.']],
    [/You have an error in your SQL syntax/i, 'SQL syntax error', 'The database could not read the query near the place it shows.', ['Check commas between columns and quotes around text values.', 'Reserved words used as names (order, group) need `backticks` or "quotes".']],
    [/Duplicate entry '([^']*)' for key/i, 'SQL: duplicate entry', 'The value “$1” already exists in a column that must be unique.', ['Check whether the record already exists before inserting.', 'Use INSERT … ON DUPLICATE KEY UPDATE if you want to update it instead.']],
    [/no such table: (\w+)|Table '([\w.]+)' doesn't exist|relation "(\w+)" does not exist/i, 'SQL: table not found', 'The table $1$2$3 does not exist in this database.', ['Check the spelling and the database you are connected to.', 'Run your setup or migration that creates it.']],
    [/Access denied for user/i, 'Database: access denied', 'The database user name, password or host is wrong, or the user lacks permission.', ['Check the credentials in your config file.', 'Make sure the user is allowed to connect from this host.']],
    [/ENOENT|No such file or directory/i, 'File not found', 'A file or folder the program needs is not where it looked.', ['Check the path and spelling (paths are case-sensitive on Linux).', 'Relative paths depend on the folder you run the command from.']],
    [/EADDRINUSE|address already in use/i, 'Port already in use', 'Another program is already using that network port.', ['Stop the other program, or start yours on a different port.']],
    [/EACCES|Permission denied/i, 'Permission denied', 'The program is not allowed to read, write or run that file or port.', ['Check file permissions (see our chmod calculator).', 'Ports below 1024 need admin rights on Linux.']],
    [/npm ERR! code ERESOLVE|unable to resolve dependency tree/i, 'npm: dependency conflict', 'Two packages need different versions of the same package.', ['Update the packages that conflict.', 'As a last resort: npm install --legacy-peer-deps.']],
    [/command not found|is not recognized as an internal or external command/i, 'Command not found', 'The system cannot find that program: it is not installed or not on the PATH.', ['Install the program.', 'Restart the terminal after installing so the PATH updates.']],
    [/fatal: not a git repository/i, 'Git: not a repository', 'You ran a git command outside a project folder that git tracks.', ['cd into your project folder, or run git init to start tracking it.']],
    [/rejected.*\(fetch first\)|Updates were rejected because the remote contains work/i, 'Git: push rejected', 'The remote has commits you do not have yet.', ['Run git pull (or git pull --rebase), fix any conflicts, then push again.']],
    [/CONFLICT \(content\)|Merge conflict in/i, 'Git: merge conflict', 'The same lines were changed in two places and git cannot choose.', ['Open the files, keep the right lines between <<<<<<< and >>>>>>>, remove the markers.', 'Then git add the files and commit.']],
    [/\b404\b.*not found|Not Found/i, 'HTTP 404 Not Found', 'Nothing exists at that address.', ['Check the spelling of the URL.', 'The page may have moved: set up a 301 redirect for old links.']],
    [/\b500\b|Internal Server Error/i, 'HTTP 500 Internal Server Error', 'Something broke on the server while making the page.', ['Read the server error log: it names the real error.', 'Undo the last change to code or .htaccess.']],
    [/\b403\b|Forbidden/i, 'HTTP 403 Forbidden', 'The server refuses to show this to you.', ['Check file permissions and any login requirement.', 'A security rule or missing index file can also cause it.']],
    [/ERR_CERT|NET::ERR_CERT|certificate/i, 'Security certificate problem', 'The site’s HTTPS certificate is expired, for a different name, or not trusted.', ['Renew the certificate (many hosts do it free with Let’s Encrypt).', 'Make sure it covers both example.com and www.example.com.']],
    [/Mixed Content/i, 'Mixed content', 'An https page loads something over plain http, so the browser blocks it.', ['Change those addresses to https://.']],
    [/Uncaught \(in promise\)/i, 'JavaScript: unhandled promise rejection', 'An async action failed and nothing caught the error.', ['Add .catch(…) to the promise, or wrap await in try { … } catch (e) { … }.']]
  ];
  function explain(t) {
    var hits = [];
    E.forEach(function (e) {
      var m = e[0].exec(t); if (!m) return;
      var fill = function (s) { return s.replace(/\$(\d)/g, function (x, n) { return m[+n] || ''; }); };
      hits.push({ title: fill(e[1]), what: fill(e[2]), fix: e[3].map(fill) });
    });
    return hits;
  }
  function run(t) {
    var r = explain(t);
    if (!r.length) return 'No known pattern found.\n\nTips that solve most errors:\n• Read the FIRST error, not the last: later ones are often caused by it.\n• Go to the file and line number in the message, and check the line above too.\n• Search the exact error text in quotes, without your own file names.';
    return r.slice(0, 3).map(function (x) { return '■ ' + x.title + '\nWhat it means: ' + x.what + '\nHow to fix:\n' + x.fix.map(function (s, i) { return '  ' + (i + 1) + '. ' + s; }).join('\n'); }).join('\n\n');
  }
  T.transformer(spot, { id: 'code-explain', inLabel: 'Error message', rows: 5, outLabel: 'What it means', download: false,
    sample: "Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')\n    at app.js:12:31", run: run });
  T.tests['code-explain'] = function () {
    var f = [], first = function (s) { var r = explain(s); return r.length ? r[0].title : ''; };
    if (first("TypeError: Cannot read properties of undefined (reading 'map')") !== 'JavaScript: reading from undefined' || explain("Cannot read properties of null (reading 'x')")[0].what.indexOf('“x”') < 0) f.push('read props');
    if (first("ModuleNotFoundError: No module named 'requests'") !== 'Python: module not installed' || explain("ModuleNotFoundError: No module named 'requests'")[0].fix[0].indexOf('pip install requests') < 0) f.push('python module');
    if (first('ReferenceError: $ is not defined').indexOf('ReferenceError') < 0) f.push('$ not defined');
    if (first("Duplicate entry 'a@b.com' for key 'email'") !== 'SQL: duplicate entry') f.push('sql dup');
    if (first('error: failed to push some refs ... Updates were rejected because the remote contains work') !== 'Git: push rejected') f.push('git');
    if (run('blah blah').indexOf('No known pattern') !== 0) f.push('fallback');
    if (E.length < 40) f.push('only ' + E.length + ' patterns');
    return Promise.resolve({ ok: !f.length, n: 7, fails: f });
  };
});
