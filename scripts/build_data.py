# Builds the novel data the GroupChatOn app reads (GitHub Actions runs this every hour).
#   data/novels.json      : every novel (title, cover, summary, genres) with its chapters in reading order
#   c/<yyyy>/<mm>/<x>.json : the text of one chapter (www.groupchaton.com/<yyyy>/<mm>/<x>.html)
# The book list (titles, covers, which addresses belong to which book) comes from the novels site:
# https://assets.groupchaton.com/data/series.json (groupchaton-theme repo, data/series-config.json).
# Chapters come from the blog: the public feed lists every post, and each new or edited post's page is read once.
# Run:  python -X utf8 scripts/build_data.py            (only new / edited chapters)
#       python -X utf8 scripts/build_data.py --all      (read every chapter again)
# Designed & Developed by Nivesh Sahayak (https://www.niveshsahayak.in/). All rights reserved: see LICENSE.
import argparse, concurrent.futures as cf, html, json, os, re, sys, time, urllib.request
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.environ.get('SITE_URL', 'https://www.groupchaton.com')
SERIES = os.environ.get('SERIES_URL', 'https://assets.groupchaton.com/data/series.json')
UA = {'User-Agent': 'GroupChatOn app build (+https://novel.groupchaton.com)'}


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read().decode('utf-8')
        except Exception as e:  # Blogger now and then answers 429 / 5xx under load
            if i == tries - 1:
                raise
            time.sleep(3 * (i + 1))


def feed_posts():
    """Every live post: path, title, published, updated, post id."""
    posts, start, total = [], 1, None
    while total is None or start <= total:
        feed = json.loads(get(f'{SITE}/feeds/posts/summary?alt=json&max-results=150&start-index={start}'))['feed']
        total = int(feed['openSearch$totalResults']['$t'])
        entries = feed.get('entry', [])
        if not entries:
            break
        for e in entries:
            link = next((l['href'] for l in e['link'] if l['rel'] == 'alternate'), '')
            posts.append({'path': re.sub(r'^https?://[^/]+', '', link), 'title': re.sub(r'\s+', ' ', e['title']['$t']).strip(),
                          'pub': e['published']['$t'], 'upd': e['updated']['$t'], 'id': e['id']['$t'].rsplit('-', 1)[-1]})
        start += len(entries)
    return posts


def order_key(p):
    # same order as the novels site (gco.js): chapters by the number in the title, then side stories by URL number
    ss = re.search(r'ss(\d+)(?:_\d+)?\.html$', p['path'])
    if ss:
        return (1, int(ss.group(1)), p['pub'])
    m = re.match(r'\s*Chapter\s+(\d+)', p['title'], re.I) or re.search(r'(\d+)(?:_\d+)?\.html$', p['path'])
    return (0, int(m.group(1)) if m else 10**6, p['pub'])


# ---------- a tiny HTML tree, enough to cut the post body out of a Blogger page and tidy it ----------
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


class Node:
    def __init__(self, tag, attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs or {}), parent, []

    def cls(self):
        return (self.attrs.get('class') or '').split()

    def walk(self):
        for k in self.kids:
            if isinstance(k, Node):
                yield k
                yield from k.walk()

    def text(self):
        return ''.join(k if isinstance(k, str) else k.text() for k in self.kids)


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = self.cur = Node('#root')

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.kids.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.kids.append(data)


def parse(src):
    t = Tree()
    t.feed(src)
    t.close()
    return t.root


KEEP = {'p', 'br', 'em', 'i', 'strong', 'b', 'u', 's', 'del', 'sup', 'sub', 'h2', 'h3', 'h4', 'blockquote', 'hr',
        'ul', 'ol', 'li', 'img', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'center'}
DROP = {'script', 'style', 'meta', 'link', 'noscript', 'iframe', 'form', 'input', 'button', 'select', 'textarea', 'svg', 'object', 'embed', 'head', 'title'}
SHORTCODE = re.compile(r'\(\[[\s\S]*?\]\)')


def absolute(u):
    u = (u or '').strip()
    if u.startswith('//'):
        return 'https:' + u
    if u.startswith('/'):
        return SITE + u
    return u if re.match(r'https?://', u) else ''


def out(n):
    """Clean HTML: only reading tags, no classes/styles/scripts, links made absolute."""
    if isinstance(n, str):
        return html.escape(SHORTCODE.sub('', n), quote=False)
    if n.tag in DROP or n.tag.startswith('!'):
        return ''
    inner = ''.join(out(k) for k in n.kids)
    tag = n.tag
    if tag == 'h1':
        tag = 'h2'
    if tag == 'center':
        tag = 'p'
    if tag not in KEEP:
        return inner  # div, span, font…: keep only what is inside
    if tag == 'a':
        href = absolute(n.attrs.get('href'))
        if not href or ('google.com/search' in href and 'bbid=' in href) or not inner.strip():
            return inner  # Blogger's automatic Google-search links on names: plain text
        return f'<a href="{html.escape(href)}" rel="noopener" target="_blank">{inner}</a>'
    if tag == 'img':
        src = absolute(n.attrs.get('src') or n.attrs.get('data-src'))
        if not src:
            return ''
        a = f' alt="{html.escape(n.attrs.get("alt") or "")}"'
        for k in ('width', 'height'):
            if re.fullmatch(r'\d{1,4}', n.attrs.get(k) or ''):
                a += f' {k}="{n.attrs[k]}"'
        return f'<img src="{html.escape(src)}"{a} loading="lazy" decoding="async">'
    if tag in ('br', 'hr'):
        return f'<{tag}>'
    if tag in ('p', 'li', 'h2', 'h3', 'h4', 'blockquote', 'td', 'th') and not re.sub(r'(<br>|\s|\xa0)+', '', inner) and '<img' not in inner:
        return ''  # empty paragraphs used as spacing
    return f'<{tag}>{inner}</{tag}>'


def post_body(page):
    root = parse(page)
    body = next((n for n in root.walk() if 'post-body' in n.cls()), None)
    if body is None:
        return None
    custom = next((k for k in body.kids if isinstance(k, Node) and 'custom-post' in k.cls()), None)
    if custom is not None:
        return custom
    # older posts: no .custom-post; leave out the button rows and the old Table of Content widgets
    for n in list(body.walk()):
        c = n.cls()
        if (n.parent is body and ('button-container' in c or 'separator' in c and not any(isinstance(x, Node) and x.tag == 'img' for x in n.walk()))) \
                or 'stylish-header1' in c or 'custom-tab-container' in c or n.attrs.get('id') == 'arcTitleDescription' \
                or (n.parent is body and n.tag == 'h3' and n.attrs.get('align') == 'center'):
            n.parent.kids.remove(n)
    return body


def tidy(n):
    h = out(n)
    h = re.sub(r'(<br>\s*){3,}', '<br><br>', h)
    h = re.sub(r'\n\s*\n+', '\n', h).strip()
    return h


def words(h):
    return len(re.sub(r'<[^>]+>', ' ', h).split())


def summary_of(page):
    """The novel's synopsis: the readable paragraphs at the top of its index post."""
    body = post_body(page)
    if body is None:
        return ''
    paras = []
    for n in body.walk():
        if n.tag == 'p':
            t = re.sub(r'\s+', ' ', SHORTCODE.sub('', n.text())).strip()
            if len(t) > 60 and not re.search(r'chapter\s*\d|click|tap here|table of content', t, re.I):
                paras.append(t)
        if len(' '.join(paras)) > 900:
            break
    return re.sub(r'^\s*(summary|synopsis)\s*[:–-]\s*', '', '\n'.join(paras[:6]), flags=re.I)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--all', action='store_true', help='read every chapter page again')
    ap.add_argument('--workers', type=int, default=6)
    args = ap.parse_args()

    series = json.loads(get(SERIES))['series']
    posts = feed_posts()
    if len(posts) < 100:
        # Still regenerate the sitemap from whatever novels.json is on disk so it isn't stuck at 1 URL.
        try:
            existing = json.load(open(os.path.join(ROOT, 'data', 'novels.json'), encoding='utf-8'))
            save_sitemap(existing['novels'])
        except Exception:
            pass
        sys.exit(f'Only {len(posts)} posts came back from the feed; keeping the old data.')
    old = {}
    try:
        old = {s['id']: s for s in json.load(open(os.path.join(ROOT, 'data', 'novels.json'), encoding='utf-8'))['novels']}
    except Exception:
        pass

    novels, todo, keep = [], [], set()
    for s in series:
        rx = re.compile(s['match'])
        items = sorted((p for p in posts if rx.match(p['path'])), key=order_key)
        chapters = []
        for p in items:
            key = p['path'][1:].removesuffix('.html')  # 2025/02/chd1
            file = os.path.join(ROOT, 'c', *key.split('/')) + '.json'
            keep.add(os.path.normcase(file))
            have = None
            if os.path.exists(file):
                try:
                    have = json.load(open(file, encoding='utf-8'))
                except Exception:
                    have = None
            if args.all or not have or have.get('u') != p['upd']:
                todo.append((s['id'], p, key, file))
            chapters.append([key, p['title'], p['pub'][:10], (have or {}).get('w', 0)])
        summary = (old.get(s['id']) or {}).get('summary', '')
        if not summary or args.all:
            try:
                summary = summary_of(get(SITE + s['index']))
            except Exception as e:
                print('summary failed', s['id'], e)
        novels.append({k: s.get(k, '') for k in ('id', 'short', 'title', 'part', 'index', 'match', 'cover', 'alt', 'genres')}
                      | {'summary': summary, 'count': len(chapters), 'chapters': chapters})
        print(f"{s['id']:5} {len(chapters):5} chapters")

    print(f'{len(todo)} chapter pages to read')
    done = {}

    def fetch(job):
        sid, p, key, file = job
        body = post_body(get(SITE + p['path']))
        h = tidy(body) if body is not None else ''
        if not h:
            raise ValueError('no post body')
        os.makedirs(os.path.dirname(file), exist_ok=True)
        rec = {'t': p['title'], 'd': p['pub'][:10], 'u': p['upd'], 'id': p['id'], 's': sid, 'w': words(h), 'h': h}
        with open(file, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(rec, f, ensure_ascii=False, separators=(',', ':'))
        return key, rec['w']

    failed = 0
    with cf.ThreadPoolExecutor(args.workers) as ex:
        futs = {ex.submit(fetch, j): j for j in todo}
        for i, f in enumerate(cf.as_completed(futs), 1):
            try:
                k, w = f.result()
                done[k] = w
            except Exception as e:
                failed += 1
                print('failed', futs[f][2], e)
            if i % 100 == 0:
                print(f'  {i}/{len(todo)}')
    for n in novels:
        for c in n['chapters']:
            if c[0] in done:
                c[3] = done[c[0]]

    # chapters taken off the blog: remove their copies
    for dirpath, _, files in os.walk(os.path.join(ROOT, 'c')):
        for fn in files:
            fp = os.path.join(dirpath, fn)
            if os.path.normcase(fp) not in keep:
                os.remove(fp)

    latest = sorted(((c[2], n['id'], c[0], c[1]) for n in novels for i, c in enumerate(n['chapters'])), reverse=True)[:30]
    data = {'built': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'site': SITE,
            'novels': sorted(novels, key=lambda n: max((c[2] for c in n['chapters']), default=''), reverse=True),
            'latest': [[x[1], x[2], x[3], x[0]] for x in latest]}
    os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
    try:  # nothing new: keep the old time stamp, so the hourly run has nothing to commit
        prev = json.load(open(os.path.join(ROOT, 'data', 'novels.json'), encoding='utf-8'))
        if {k: v for k, v in prev.items() if k != 'built'} == {k: v for k, v in data.items() if k != 'built'}:
            data['built'] = prev['built']
    except Exception:
        pass
    with open(os.path.join(ROOT, 'data', 'novels.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    save_sitemap(data['novels'])
    save_promos()
    print(f'done: {len(done)} read, {failed} failed')
    if failed > max(20, len(todo) // 5):
        sys.exit('Too many chapters failed.')



APP = 'https://novel.groupchaton.com'


def save_sitemap(novels):
    """Write sitemap.xml: home + one /novel/<id>/ page per series + every chapter /read/<key>/."""
    urls = [f'  <url><loc>{APP}/</loc><changefreq>daily</changefreq></url>']
    for n in novels:
        urls.append(f'  <url><loc>{APP}/novel/{n["id"]}/</loc><changefreq>weekly</changefreq></url>')
        for key, _title, pub, _w in n['chapters']:
            urls.append(f'  <url><loc>{APP}/read/{key}/</loc><lastmod>{pub}</lastmod><changefreq>monthly</changefreq></url>')
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + '\n'.join(urls) + '\n</urlset>\n')
    dest = os.path.join(ROOT, 'sitemap.xml')
    try:
        if open(dest, encoding='utf-8').read() == xml:
            return  # no change: don't touch the file
    except Exception:
        pass
    with open(dest, 'w', encoding='utf-8', newline='\n') as f:
        f.write(xml)
    total = 1 + len(novels) + sum(len(n['chapters']) for n in novels)
    print(f'sitemap: {total} URLs')


PROMOS = 'https://share.groupchaton.com/promos.json'   # the sponsor list Share uses (same sponsors as the novels site)


def save_promos():
    """Copies the sponsor list into data/promos.json, so the app can show sponsor cards where an ad space stays
    empty (offline, blocked, no ad) and keep them for offline. Written only when it changed; on any error the old copy stays."""
    fp = os.path.join(ROOT, 'data', 'promos.json')
    try:
        with urllib.request.urlopen(urllib.request.Request(PROMOS, headers=UA), timeout=30) as r:
            new = json.loads(r.read().decode('utf-8'))
        if not isinstance(new.get('promos'), list) or not new['promos']:
            raise ValueError('no sponsors in the list')
        new['promos'] = [x for x in new['promos'] if x.get('family') != 'novels']   # the app is the novels: no card for itself
        for x in new['promos']:   # our own Ko-fi card, worded for readers of the novels (Share's wording is about groups)
            if 'ko-fi.com' in x.get('href', ''):
                x['title'], x['line'] = 'Enjoying the chapters?', 'Every chapter here is proofread by hand. A coffee on Ko-fi helps keep them coming.'
        try:
            if json.load(open(fp, encoding='utf-8')) == new:
                return
        except Exception:
            pass
        with open(fp, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(new, f, ensure_ascii=False, separators=(',', ':'))
        print('sponsors: %d saved' % len(new['promos']))
    except Exception as e:
        print('sponsors: kept the old list (%s)' % e)

if __name__ == '__main__':
    main()
