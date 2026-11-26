# Stamps a new version on the GroupChatOn app after you change index.html, reader.js, reader.css or sw.js:
#   - version = today's date + a short fingerprint of those files (reader.js VERSION, sw.js VERSION, ?v= in index.html and sw.js)
#   - 404.html = a copy of index.html (any other address opens the app); /novel/ and /read/ get real page files from scripts/pages.py at publish time
#   - t/<id>/index.html = small pages that send the old Infinity App tool addresses to infinity.groupchaton.com
# Run:  python -X utf8 scripts/release.py      then commit and push.
# Designed & Developed by Nivesh Sahayak (https://www.niveshsahayak.in/). All rights reserved: see LICENSE.
import hashlib, html, json, os, re, shutil, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INF = 'https://infinity.groupchaton.com/'


def rd(name):
    return open(os.path.join(ROOT, name), encoding='utf-8').read()


def wr(name, text):
    with open(os.path.join(ROOT, name), 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def main():
    files = ['index.html', 'reader.js', 'reader.css', 'sw.js', 'app.webmanifest']
    blank = lambda s: re.sub(r"\d{4}-\d{2}-\d{2}\.[0-9a-f]+|\d{4}-\d{2}-\d{2}\.\d+", 'V', s)  # fingerprint ignores old stamps
    digest = hashlib.sha1(''.join(blank(rd(f)) for f in files).encode()).hexdigest()[:7]
    ver = time.strftime('%Y-%m-%d') + '.' + digest
    stamp = lambda s: re.sub(r"(\?v=|VERSION = ')(\d{4}-\d{2}-\d{2}\.[0-9a-f]+|\d{4}-\d{2}-\d{2}\.\d+)", lambda m: m.group(1) + ver, s)
    for f in ('index.html', 'reader.js', 'sw.js'):
        wr(f, stamp(rd(f)))
    shutil.copyfile(os.path.join(ROOT, 'index.html'), os.path.join(ROOT, '404.html'))
    for slug in ('about', 'privacy-policy', 'disclaimer', 'contact'):   # the app's own pages: real addresses (status 200), same app shell
        os.makedirs(os.path.join(ROOT, slug), exist_ok=True)
        shutil.copyfile(os.path.join(ROOT, 'index.html'), os.path.join(ROOT, slug, 'index.html'))

    # old Infinity App tool pages (/t/<id>/) → the same tool on Infinity
    tools = json.load(open(os.path.join(ROOT, 'scripts', 'old-tools.json'), encoding='utf-8'))
    tdir = os.path.join(ROOT, 't')
    shutil.rmtree(tdir, ignore_errors=True)
    for tid, (slug, name) in tools.items():
        url = INF + slug + '/'
        os.makedirs(os.path.join(tdir, tid), exist_ok=True)
        wr(os.path.join('t', tid, 'index.html'), f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(name)} moved to Infinity</title><meta name="robots" content="noindex">
<link rel="canonical" href="{url}"><meta http-equiv="refresh" content="0; url={url}">
<script>location.replace({json.dumps(url)} + (location.hash || ''));</script>
<style>body{{font:17px/1.6 system-ui,sans-serif;margin:0;padding:40px 20px;text-align:center;background:#fbfaf7;color:#1d1f22}}@media (prefers-color-scheme:dark){{body{{background:#15171a;color:#dedad1}}a{{color:#6cc46a}}}}a{{color:#2c8a3a}}</style>
</head><body><p><b>{html.escape(name)}</b> now opens on Infinity.</p><p><a href="{url}">Open {html.escape(name)}</a></p>
<p><a href="/old-records/">Records you kept in the old Infinity App</a></p></body></html>
''')
    print('version', ver, '·', len(tools), 'old tool redirects')


if __name__ == '__main__':
    main()
