"""Real page files for every novel and chapter address (novel.groupchaton.com).
Designed & Developed by: Nivesh Sahayak (https://www.niveshsahayak.in/).

Why: GitHub Pages answered /novel/<id>/ and /read/<yyyy>/<mm>/<name>/ with 404.html (the app shell), so the app
opened but Google saw HTTP 404 for every chapter in the sitemap (Search Console, Nov 2026). This writes
<path>/index.html for each address: the same app shell, with that page's own title, description, canonical,
link-preview tags, schema, and the chapter text (or the novel's summary and chapter list) inside <main>,
so the page is real content even before reader.js draws the reader over it.

Run by the publish workflow after build_data.py (the files are NOT committed: see .gitignore).
Local: python -X utf8 scripts/pages.py
"""
import html, json, os, re, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SELF = 'https://novel.groupchaton.com'
E = lambda s: html.escape(str(s or ''), quote=True)


def rd(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def clean(h):
    """Chapter HTML from the copy -> safe reading HTML: paragraphs only, no scripts, styles or pictures."""
    h = re.sub(r'(?is)<(script|style|noscript|iframe)\b.*?</\1>', '', h or '')
    h = re.sub(r'(?is)<a\b[^>]*>\s*(<img\b[^>]*>)\s*</a>', '', h)
    h = re.sub(r'(?is)<img\b[^>]*>', '', h)
    h = re.sub(r'(?i)<br\s*/?>', '\n', h)
    h = re.sub(r'(?i)</(p|div|h[1-6]|li|blockquote)>', '\n', h)
    t = html.unescape(re.sub(r'(?s)<[^>]+>', '', h))
    paras = [re.sub(r'[ \t ]+', ' ', x).strip() for x in t.split('\n')]
    return [x for x in paras if x]


def desc_of(paras, n=155):
    s = ' '.join(paras)
    s = re.sub(r'\s+', ' ', s).strip()
    if len(s) <= n: return s
    s = s[:n]
    return s[:s.rfind(' ')].rstrip(' ,.;:') + '…'


SHELL = rd('index.html')


def page(path, title, desc, main, ld, og_image=None):
    url = SELF + path
    s = SHELL
    s = re.sub(r'<title>.*?</title>', '<title>%s</title>' % E(title), s, count=1, flags=re.S)
    s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % E(desc), s, count=1)
    s = re.sub(r'<link rel="canonical" id="canon" href="[^"]*">', '<link rel="canonical" id="canon" href="%s">' % E(url), s, count=1)
    s = re.sub(r'<meta property="og:type" content="[^"]*">', '<meta property="og:type" content="article">', s, count=1)
    s = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="%s">' % E(title), s, count=1)
    s = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="%s">' % E(desc), s, count=1)
    s = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="%s">' % E(url), s, count=1)
    if og_image:
        s = re.sub(r'<meta property="og:image" content="[^"]*">', '<meta property="og:image" content="%s">' % E(og_image), s, count=1)
    s = re.sub(r'<script type="application/ld\+json">.*?</script>',
               lambda m: '<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False).replace('</', '<\\/'), s, count=1, flags=re.S)
    s = re.sub(r'(<main id="main" tabindex="-1">).*?(</main>)', lambda m: m.group(1) + '\n' + main + '\n' + m.group(2), s, count=1, flags=re.S)
    f = os.path.join(ROOT, path.strip('/'), 'index.html')
    os.makedirs(os.path.dirname(f), exist_ok=True)
    with open(f, 'w', encoding='utf-8', newline='\n') as o:
        o.write(s)


def crumbs(*items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SELF + u} for i, (n, u) in enumerate(items)]}


def name_of(n):
    return n['title'] + (' ' + n['part'] if n.get('part') else '')


def main():
    data = json.load(open(os.path.join(ROOT, 'data', 'novels.json'), encoding='utf-8'))
    for d in ('novel', 'read'):
        shutil.rmtree(os.path.join(ROOT, d), ignore_errors=True)
    pages = chap_n = 0
    for n in data['novels']:
        nm = name_of(n)
        chs = n['chapters']
        summ = [x.strip() for x in (n.get('summary') or '').split('\n') if x.strip()]
        lis = ''.join('<li><a href="/read/%s/">%s</a></li>' % (E(c[0]), E(c[1])) for c in chs)
        first = ('<p><a class="btn btn-primary" href="/read/%s/">Start reading: %s</a></p>' % (E(chs[0][0]), E(chs[0][1]))) if chs else ''
        main_html = ('<div class="wrap"><article class="pre"><h1>%s</h1>%s%s%s<h2>All %d chapters</h2><ol>%s</ol></article></div>'
                     % (E(nm), '<p><i>Also known as: %s</i></p>' % E(n['alt']) if n.get('alt') else '',
                        ''.join('<p>%s</p>' % E(x) for x in summ), first, len(chs), lis))
        desc = desc_of(summ) or 'Read %s free online: all %d chapters.' % (nm, len(chs))
        page('/novel/%s/' % n['id'], '%s: read all %d chapters free | GroupChatOn' % (nm, len(chs)), desc, main_html,
             {'@context': 'https://schema.org', '@graph': [
                 {'@type': 'Book', 'name': nm, 'url': SELF + '/novel/%s/' % n['id'], 'description': desc,
                  **({'image': n['cover']} if n.get('cover') else {}), 'inLanguage': 'en',
                  'publisher': {'@type': 'Organization', 'name': 'GroupChatOn', 'url': 'https://www.groupchaton.com/'}},
                 crumbs(('Novels', '/'), (nm, '/novel/%s/' % n['id']))]}, og_image=n.get('cover'))
        pages += 1
        for i, c in enumerate(chs):
            key, title, pub = c[0], c[1], c[2]
            f = os.path.join(ROOT, 'c', key + '.json')
            try:
                ch = json.load(open(f, encoding='utf-8'))
                paras = clean(ch.get('h'))
            except (OSError, ValueError):
                paras = []
            prev = chs[i - 1] if i else None
            nxt = chs[i + 1] if i + 1 < len(chs) else None
            nav = '<nav class="pre-nav">%s <a href="/novel/%s/">%s: all chapters</a> %s</nav>' % (
                '<a rel="prev" href="/read/%s/">Previous: %s</a> ·' % (E(prev[0]), E(prev[1])) if prev else '',
                E(n['id']), E(nm),
                '· <a rel="next" href="/read/%s/">Next: %s</a>' % (E(nxt[0]), E(nxt[1])) if nxt else '')
            body = ''.join('<p>%s</p>' % E(x) for x in paras) if paras else '<p>Open this chapter in the app to read it.</p>'
            main_html = ('<div class="wrap"><article class="pre"><p><a href="/novel/%s/">%s</a></p><h1>%s</h1>'
                         '<p><time datetime="%s">%s</time></p>%s%s</article></div>' % (E(n['id']), E(nm), E(title), E(pub), E(pub), body, nav))
            desc = desc_of(paras) if paras else '%s of %s. Read it free on GroupChatOn.' % (title, nm)
            page('/read/%s/' % key, '%s | %s' % (title, nm), desc, main_html,
                 {'@context': 'https://schema.org', '@graph': [
                     {'@type': 'Chapter', 'name': title, 'url': SELF + '/read/%s/' % key, 'datePublished': pub,
                      'isPartOf': {'@type': 'Book', 'name': nm, 'url': SELF + '/novel/%s/' % n['id']}},
                     crumbs(('Novels', '/'), (nm, '/novel/%s/' % n['id']), (title, '/read/%s/' % key))]})
            chap_n += 1
    print('page files: %d novels, %d chapters' % (pages, chap_n))


if __name__ == '__main__':
    main()
