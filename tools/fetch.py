import json, os, io, sys, time, urllib.parse, urllib.request
from PIL import Image
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "mazaq-masr-site/1.0 (https://github.com/el3wwa16-pixel/mazaq-masr)"}
def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: return r.read()
        except Exception as e:
            print("retry", url[:100], e); time.sleep(3 * (i + 1))
    raise RuntimeError(url)
def api(**p):
    p.update(format="json", formatversion="2")
    return json.loads(get(API + "?" + urllib.parse.urlencode(p)))
def info(titles, width):
    d = api(action="query", titles="|".join(titles), prop="imageinfo", iiprop="url|size|mime|extmetadata", iiurlwidth=width)
    return d["query"].get("pages", [])
def search(q, n=12):
    d = api(action="query", generator="search", gsrsearch=q + " filetype:bitmap", gsrnamespace=6, gsrlimit=n,
            prop="imageinfo", iiprop="url|size|mime", iiurlwidth=400)
    pages = sorted(d.get("query", {}).get("pages", []), key=lambda p: p.get("index", 0))
    out = []
    for p in pages:
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mime") not in ("image/jpeg", "image/png", "image/webp"): continue
        w, h = ii.get("width", 0), ii.get("height", 0)
        if w < 700 or not h or not (0.6 < w / h < 2.4): continue
        out.append((p["title"], ii["thumburl"]))
    return out
def save(data, path, maxw):
    im = Image.open(io.BytesIO(data)).convert("RGB")
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(path, "JPEG", quality=78, optimize=True, progressive=True)
Q = json.load(open("tools/queries.json", encoding="utf-8"))
P = json.load(open("tools/picks.json", encoding="utf-8"))
os.makedirs("candidates", exist_ok=True); os.makedirs("images", exist_ok=True)
cand = {}
credits = json.load(open("images/credits.json")) if os.path.exists("images/credits.json") else {}
for key, qs in Q.items():
    if key in P:
        title = P[key]
        if credits.get(key, {}).get("title") == title and os.path.exists(f"images/{key}.jpg"): continue
        W = 1920 if key.startswith("hero") else 1200
        pg = info([title], W)[0]; ii = pg["imageinfo"][0]; m = ii.get("extmetadata", {})
        save(get(ii["thumburl"]), f"images/{key}.jpg", W)
        val = lambda k: (m.get(k) or {}).get("value", "")
        credits[key] = {"title": title, "page": ii.get("descriptionurl"), "artist": val("Artist"), "license": val("LicenseShortName"), "license_url": val("LicenseUrl")}
        print("saved", key, title); continue
    if os.path.exists(f"candidates/{key}.json"): continue
    seen, lst = set(), []
    for q in qs:
        for t, u in search(q):
            if t in seen: continue
            seen.add(t); lst.append((t, u))
    lst = lst[:8]
    for i, (t, u) in enumerate(lst):
        try: save(get(u), f"candidates/{key}-{i}.jpg", 400)
        except Exception as e: print("fail", t, e)
    json.dump([t for t, u in lst], open(f"candidates/{key}.json", "w"), ensure_ascii=False, indent=1)
    print(key, len(lst))
json.dump(credits, open("images/credits.json", "w"), ensure_ascii=False, indent=1)
