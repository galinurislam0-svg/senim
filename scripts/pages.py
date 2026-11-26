#!/usr/bin/env python3
"""Ішкі беттерді басты беттің жүйесімен (css/site.css) генерациялайды.
Іске қосу: python3 scripts/pages.py   →  categories.html, merit.html, safety.html, ai-protection.html
Header/footer бір жерде: беттер бір-бірінен айырылып кетпейді."""
from pathlib import Path
from html import escape as e

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://senim-eight.vercel.app"

NAV = [("categories", "Бағыттар"), ("merit", "Деңгейлер"), ("safety", "Заңдылық"), ("ai-protection", "AI қорғаныс")]

INK_FILTER = """<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25" result="s"/><feComposite in="SourceGraphic" in2="s" operator="in"/></filter></svg>"""


def page(slug, title, desc, h1, lead, body, nxt, seal=None):
    links = "\n".join(
        f'        <li><a href="{s}"{" aria-current=\"page\"" if s == slug else ""}>{e(t)}</a></li>' for s, t in NAV)
    nxt_slug, nxt_title = nxt
    return f"""<!DOCTYPE html>
<html lang="kk" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{BASE}/{slug}">
<meta name="theme-color" content="#0E0D0C">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SENIM">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{BASE}/{slug}">
<meta property="og:image" content="{BASE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/icons/logo.svg" type="image/svg+xml">
<link rel="manifest" href="manifest.json">
<link rel="preload" href="assets/fonts/geologica-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/site.css">
</head>
<body class="inner">
<a class="skip" href="#main">Негізгі мазмұнға өту</a>
{INK_FILTER}
<header class="nav is-solid" id="nav">
  <div class="wrap nav__in">
    <a class="nav__brand" href="/" aria-label="SENIM, басты бет">SENIM</a>
    <nav aria-label="Бөлімдер">
      <ul class="nav__links" id="nav-links">
{links}
      </ul>
    </nav>
    <a class="btn btn--ink nav__cta" href="/#join">Тіркелу</a>
    <button class="nav__menu" id="menu-btn" aria-expanded="false" aria-controls="nav-links">Мәзір</button>
  </div>
</header>

<main id="main" tabindex="-1">
  <section class="phead">
    <div class="wrap">
      <nav class="crumbs" aria-label="Жол"><a href="/">Басты бет</a><span aria-hidden="true">/</span><span>{e(h1)}</span></nav>
      <h1 class="phead__title">{e(h1)}</h1>
      <p class="lead">{e(lead)}</p>
      {f'<span class="stamp stamp--{seal[0]} phead__seal" aria-hidden="true">{e(seal[1])}</span>' if seal else ''}
    </div>
  </section>
{body}
  <section class="pnext">
    <div class="wrap">
      <a class="pnext__link" href="{nxt_slug}"><span class="doc__meta">Келесі бөлім</span><span class="pnext__title">{e(nxt_title)}</span></a>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot__in">
    <nav aria-label="Төменгі мәзір" class="foot__nav">
      <a href="/">Басты бет</a>
      <a href="/#guard">Сүзгіні сынау</a>
      <a href="dashboard">Демо кабинет</a>
      <a href="https://github.com/galinurislam0-svg/senim" rel="noopener">GitHub</a>
    </nav>
    <p class="doc__meta">Хакатон прототипі. SMS шлюзі мен банк әлі қосылмаған.</p>
  </div>
  <p class="foot__word" aria-hidden="true">SENIM</p>
</footer>
<script src="js/inner.js" defer></script>
</body>
</html>
"""


def rows(items):
    """Жіңішке сызықпен бөлінген жолдар: сол жақта тақырып, оң жақта мазмұн."""
    out = []
    for it in items:
        tags = "".join(f"<li>{e(t)}</li>" for t in it.get("tags", []))
        facts = "".join(f"<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in it.get("facts", []))
        stamp = f'<span class="stamp stamp--{it["stamp"][0]} prow__stamp" aria-hidden="true">{e(it["stamp"][1])}</span>' if it.get("stamp") else ""
        bullets = "".join(f"<li>{e(b)}</li>" for b in it.get("bullets", []))
        out.append(f"""      <article class="prow{' prow--stamped' if it.get('stamp') else ''}">
        <div class="prow__head">
          <p class="doc__meta">{e(it["kicker"])}</p>
          <h2 class="prow__title">{e(it["title"])}</h2>
        </div>
        <div class="prow__body">
          <p>{e(it["text"])}</p>
          {f'<ul class="check-list">{bullets}</ul>' if bullets else ''}
          {f'<ul class="tags" aria-label="Дағдылар">{tags}</ul>' if tags else ''}
          {f'<dl class="pfacts">{facts}</dl>' if facts else ''}
        </div>
        {stamp}
      </article>""")
    return "  <section class=\"prows\">\n    <div class=\"wrap\">\n" + "\n".join(out) + "\n    </div>\n  </section>"


PAGES = {
    "categories": dict(
        seal=('safe', 'ТЕК ЦИФРЛЫҚ'),
        title="Фриланс бағыттары · SENIM",
        desc="Бағдарламалау, дизайн, маркетинг, мәтін мен видео: SENIM-дегі жастарға арналған цифрлық бағыттар және бағдарлы бағалар.",
        h1="Фриланс бағыттары",
        lead="SENIM-де тек цифрлық жұмыс бар: компьютердің алдында, үйден, сабақтан кейін орындалатын тапсырмалар. Бағалар Junior маманға арналған бағдар, нақты бюджетті тапсырыс беруші қояды.",
        body=rows([
            dict(kicker="Код", title="Бағдарламалау", text="Лендинг беттер, Telegram-боттар, Python скрипттері, деректерді өңдеу. Тапсырманы Gemini деңгейге бөледі, сондықтан Starter маманға күрделі SaaS берілмейді.",
                 tags=["HTML/CSS", "JavaScript", "React", "Python", "Git", "SQL"], facts=[("Бағдарлы баға", "15 000-150 000 ₸ / жоба"), ("Деңгей", "Expert, Elite")]),
            dict(kicker="Көрініс", title="Дизайн және UI/UX", text="Instagram посттары, логотип, қосымша экрандары, презентация. Нәтиже Figma файлымен тапсырылады, авторлық құқық жоба толық төленгенде ғана беріледі.",
                 tags=["Figma", "UI/UX", "Логотип", "Blender", "Моушн"], facts=[("Бағдарлы баға", "10 000-80 000 ₸ / жоба"), ("Деңгей", "Expert")]),
            dict(kicker="Аудитория", title="Цифрлық маркетинг", text="Контент-жоспар, SMM, сайт мәтіндерінің SEO-сы. Казино, ставка, вейп сияқты жасқа сай емес тапсырыс берушілерді сүзгі жарияламайды.",
                 tags=["SMM", "SEO", "Контент-жоспар", "TikTok", "Копирайтинг"], facts=[("Бағдарлы баға", "20 000-60 000 ₸ / ай"), ("Деңгей", "Starter, Expert")]),
            dict(kicker="Тіл", title="Мәтін және аударма", text="Қазақша, орысша, ағылшынша аударма, транскрипция, субтитр. Тіркелген күннен бастап қолжетімді бастапқы бағыт.",
                 tags=["Аударма", "Транскрипция", "Субтитр", "Редакция"], facts=[("Бағдарлы баға", "3 000-25 000 ₸ / жоба"), ("Деңгей", "Starter")]),
            dict(kicker="Кадр", title="Видео және монтаж", text="Reels пен Shorts монтажы, YouTube роликтері, қарапайым анимация. Шикі материалды тапсырыс беруші платформа арқылы береді.",
                 tags=["CapCut", "Premiere", "After Effects", "Субтитр"], facts=[("Бағдарлы баға", "8 000-70 000 ₸ / жоба"), ("Деңгей", "Expert")]),
        ]),
        nxt=("merit", "Деңгейлер"),
    ),
    "merit": dict(
        seal=('safe', 'ДАҒДЫ БОЙЫНША'),
        title="Меріт-деңгейлер · SENIM",
        desc="Starter, Expert, Elite: SENIM-де дағды өскен сайын жоба бюджеті 25 000-нан 500 000 теңгеге дейін өседі.",
        h1="Меріт-деңгейлер",
        lead="Деңгей жасқа емес, дағдыға байланысты. Әр деңгейде жобаның ең жоғарғы бюджеті мен қолжетімді бағыттар ашылады.",
        body=rows([
            dict(kicker="Деңгей 1", title="Starter", text="Тіркелген кезде беріледі. Цифрлық сауаттылық тесті мен қысқа сынақ тапсырмасынан өту керек.",
                 bullets=["Аударма, транскрипция, деректер жинау", "Бір мезгілде 2 белсенді жоба", "Келесі деңгейге: 5 жоба және орташа баға 4.5"],
                 facts=[("Жоба бюджеті", "25 000 ₸-ге дейін")], stamp=("safe", "АШЫҚ")),
            dict(kicker="Деңгей 2", title="Expert", text="Портфолио модератордан өткенде және клиенттердің бағасы жоғары болғанда беріледі.",
                 bullets=["Дизайн, монтаж, маркетинг, қарапайым код", "Бір мезгілде 4 белсенді жоба", "Келесі деңгейге: 20 жоба және тірі сынақ"],
                 facts=[("Жоба бюджеті", "150 000 ₸-ге дейін")]),
            dict(kicker="Деңгей 3", title="Elite", text="Тірі сынақ (live review) пен келісімшарт стандартын білу тесті арқылы беріледі.",
                 bullets=["Full-stack, SaaS, дерекқор архитектурасы", "Ұзақ мерзімді келісімшарттар", "Pro режимде (18+) толық қолжетімді"],
                 facts=[("Жоба бюджеті", "500 000 ₸-ге дейін")]),
        ]),
        nxt=("safety", "Заңдылық пен қауіпсіздік"),
    ),
    "safety": dict(
        seal=('safe', 'ЗАҢДЫ'),
        title="Заңдылық пен қауіпсіздік · SENIM",
        desc="SENIM Junior мен Pro ережелері: ата-ана келісімі, жұмыс уақыты шегі, 4% салықты платформа өзі ұстап, аударады.",
        h1="Заңдылық пен қауіпсіздік",
        lead="Жасөспірім заң бойынша жұмыс істей алады, бірақ шарттары бар. SENIM сол шарттарды тіркелудің өзіне енгізген.",
        body=rows([
            dict(kicker="14-17 жас", title="SENIM Junior", text="ҚР Еңбек кодексі 14 жастан бастап ата-ана келісімімен оқуға зиянсыз жеңіл жұмысқа рұқсат береді. Келісім SMS кодымен расталмайынша аккаунт ашылмайды.",
                 bullets=["Жұмыс уақыты: аптасына 24 сағат (14-15 жас), 36 сағат (16-17 жас)", "22:00-ден кейін және сабақ уақытында тапсырма берілмейді", "Ата-ана төлемдер мен чатқа шолу жасайды", "Табыс баланың өз картасына түседі"],
                 stamp=("safe", "КЕЛІСІМ")),
            dict(kicker="18-22 жас", title="SENIM Pro", text="Толық дербес аккаунт. Салықты платформа салық агенті ретінде өзі ұстайды, сондықтан декларация тапсырудың қажеті жоқ.",
                 bullets=["Төлем тікелей өз картаңызға", "Айлық лимит 300 АЕК (1 297 500 ₸) жақындағанда ескерту", "Escrow, ресми акт және PDF шот-фактура"]),
            dict(kicker="Салық", title="4%, платформа төлейді", text="2026 жылғы Салық кодексі интернет-платформа арқылы жұмыс істейтін өзін-өзі жұмыспен қамтығандарға 4% мөлшерлеме белгіледі. Маслихат оны өңірде 50%-ға дейін өзгерте алады, мөлшерлеме конфигте бөлек тұр.",
                 facts=[("Мөлшерлеме", "4%"), ("Лимит", "айына 300 АЕК"), ("Кім төлейді", "платформа")]),
            dict(kicker="Тыйым", title="Не жарияланбайды", text="Оффлайн кездесу, физикалық жұмыс, тікелей аударым, карта ашып беру, жасқа сай емес салалар. Мұндай тапсырманы сүзгі жарияламай тоқтатады.",
                 stamp=("block", "ТЫЙЫМ")),
        ]),
        nxt=("ai-protection", "AI қорғаныс"),
    ),
    "ai-protection": dict(
        seal=('review', 'ЕКІ ТЕКСЕРУ'),
        title="AI қорғаныс · SENIM",
        desc="Сенім сүзгісі қалай жұмыс істейді: ережелер қозғалтқышы, Gemini талдауы, чат күзетшісі және AI тәлімгер.",
        h1="Сүзгі қалай жұмыс істейді",
        lead="Әр мәтін екі тексеруден өтеді. Ережелер миллисекундта жауап береді, Gemini мағынасын оқиды. Үкімнің қатаңырағы жеңеді.",
        body=rows([
            dict(kicker="1-қабат", title="Ережелер қозғалтқышы", text="Браузер мен серверде бірдей жұмыс істейді, деректер ешқайда жіберілмейді. Қазақша, орысша және бүркемеленген жазуды («w h a t s a p p», «к.а.с.п.и») таниды.",
                 tags=["Оффлайн қауіп", "Платформадан тыс байланыс", "Тікелей төлем", "Дроппер", "Жеке шекараны бұзу", "Жасқа сай емес"],
                 facts=[("Жауап уақыты", "1 мс-тен аз"), ("Тесттер", "18")], stamp=("safe", "ҚОСУЛЫ")),
            dict(kicker="2-қабат", title="Gemini талдауы", text="Мәтінді мағынасымен оқиды: неге қауіпті екенін қазақша түсіндіреді, жасөспірімге кеңес береді. Қауіпсіз тапсырмаға деңгей, әділ бюджет пен мерзім ұсынады. Модель бос болмаса, келесісіне ауысады, ал AI мүлде жауап бермесе, ережелер үкімі қалады.",
                 facts=[("Модельдер", "Gemini Flash Lite тізбегі"), ("Шешім", "екі үкімнің қатаңы")]),
            dict(kicker="Чат", title="Чат күзетшісі", text="Телефон, карта нөмірі (Luhn тексерісімен), IBAN, сілтеме, email мен ник хабарлама жеткізілмей тұрып жасырылады. Қауіпті хабарлама жеткізілмейді, 14-17 жаста ата-анаға хабарланады."),
            dict(kicker="Көмек", title="AI тәлімгер", text="Кабинеттегі тәлімгер кодқа, дизайнға, баға қоюға көмектеседі. Сұрақ алдымен сүзгіден өтеді: алаяқтық белгісі болса, модельге жіберілмейді.",
                 bullets=["Пайдаланушы жазған тілде жауап береді", "Жеке дерек сұрамайды, платформадан тыс төлемге кеңес бермейді"]),
        ]),
        nxt=("categories", "Фриланс бағыттары"),
    ),
}

for slug, p in PAGES.items():
    (ROOT / f"{slug}.html").write_text(page(slug, **p), encoding="utf-8")
    print("wrote", slug + ".html")
