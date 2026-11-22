"""Browser tests for Practice Pad (kidspractice/index.html).

Run from the repo root:
    pip install pytest playwright
    python -m playwright install chromium
    python -m pytest _tests -q

Jekyll skips folders that start with "_", so this file is never published.
"""
import json
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

STUB = (
    "window.__said=[];"
    "Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{"
    "speak(u){window.__said.push({text:u.text,pitch:u.pitch,rate:u.rate})},"
    "cancel(){},getVoices(){return window.__voices||[]},addEventListener(){}}});"
)

PAGE = (Path(__file__).resolve().parents[1] / "kidspractice" / "index.html").as_uri()


@pytest.fixture(scope="module")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


@pytest.fixture
def page(browser):
    ctx = browser.new_context(viewport={"width": 400, "height": 860})
    # speechSynthesis is noisy and timing-dependent in headless runs: stub it.
    ctx.add_init_script(STUB)
    pg = ctx.new_page()
    pg.errors = []
    pg.on("pageerror", lambda e: pg.errors.append(str(e)))
    pg.goto(PAGE)
    yield pg
    assert pg.errors == [], pg.errors
    ctx.close()


# ---------- helpers ----------
def stars(pg):
    return int(pg.text_content("#stars"))


def stored(pg, key):
    return pg.evaluate(f"JSON.parse(localStorage.getItem('pp_{key}'))")


def seed(pg, **items):
    for k, v in items.items():
        pg.evaluate(f"localStorage.setItem('pp_{k}', {json.dumps(json.dumps(v))})")
    pg.reload()


def close_party(pg):
    if pg.is_visible("#party"):
        pg.click("#pyes")


def math_answer(pg):
    a, b = pg.text_content("#qt").replace("=", "").split("+")
    return int(a) + int(b)


def use_math_buttons(pg):
    pg.click("#tab-math")
    if pg.is_hidden("#pad button >> nth=0"):
        pg.click("#tapToggle")


def solve_math(pg, wrong_first=False):
    n = math_answer(pg)
    if wrong_first:
        pg.click(f'#pad button[data-n="{(n + 1) % 7}"]')
    pg.click(f'#pad button[data-n="{n}"]')
    close_party(pg)


def between_answer(pg):
    t = [pg.text_content(f"#t{i}").strip() for i in range(3)]
    q = t.index("?")
    return int(t[1]) - 1 if q == 0 else int(t[0]) + 1


def use_between_buttons(pg):
    pg.click("#tab-between")
    if pg.is_hidden("#bbtns"):
        pg.click("#btap")


# ---------- stars: number line ----------
def test_starts_at_zero(page):
    assert stars(page) == 0
    assert page.text_content("#budnext") == "5 more stars to a new friend"


def test_correct_answer_gives_exactly_one_star(page):
    use_math_buttons(page)
    solve_math(page)
    assert stars(page) == 1 and stored(page, "stars") == 1
    # tapping more numbers after it is solved gives nothing
    for n in range(0, 7):
        page.click(f'#pad button[data-n="{n}"]')
    assert stars(page) == 1


def test_wrong_answer_gives_no_star_and_buddy_encourages(page):
    use_math_buttons(page)
    n = math_answer(page)
    page.click(f'#pad button[data-n="{(n + 1) % 7}"]')
    assert stars(page) == 0
    assert page.text_content("#budsay") != ""
    page.click(f'#pad button[data-n="{n}"]')
    assert stars(page) == 1  # a retry still earns the star


def test_one_star_per_problem_over_many_problems(page):
    use_math_buttons(page)
    for i in range(7):
        solve_math(page, wrong_first=(i % 2 == 0))
        page.click("#next")
    assert stars(page) == 7 and stored(page, "stars") == 7


# ---------- stars: in between ----------
def test_in_between_correct_gives_one_star(page):
    use_between_buttons(page)
    n = between_answer(page)
    page.click(f'#bbtns button[data-n="{n}"]')
    page.click(f'#bbtns button[data-n="{n}"]')
    assert stars(page) == 1


# ---------- stars: sight words ----------
def focus_word(pg, word):
    """Make `word` the card on screen: every other word is marked mastered, the
    target keeps its real box, and the page reloads (queue is sorted by box)."""
    boxes = stored(pg, "boxes") or {}
    pg.evaluate(
        "w=>{const b=JSON.parse(localStorage.getItem('pp_boxes')||'{}');"
        "for(const x of words())if(x!==w)b[x]=5;"
        "localStorage.setItem('pp_boxes',JSON.stringify(b))}",
        word,
    )
    pg.reload()
    pg.click("#tab-words")
    assert pg.text_content("#word") == word
    return boxes.get(word, 0)


def test_word_earns_star_once_when_learned(page):
    page.click("#tab-words")
    word = page.text_content("#word")
    focus_word(page, word)
    page.click("#know")  # box 0 -> 1
    assert stars(page) == 0
    focus_word(page, word)
    page.click("#know")  # box 1 -> 2: learned
    assert stars(page) == 1


def test_practice_again_cannot_farm_stars(page):
    page.click("#tab-words")
    word = page.text_content("#word")
    for _ in range(2):
        focus_word(page, word)
        page.click("#know")
    assert stars(page) == 1
    for _ in range(3):  # "Practice again" (box -> 0), then "I know it" twice
        focus_word(page, word)
        page.click("#again")
        for _ in range(2):
            focus_word(page, word)
            page.click("#know")
    assert stars(page) == 1


def test_old_saves_count_learned_words_as_already_paid(page):
    seed(page, stars=3, boxes={"the": 3, "and": 2})
    page.evaluate("localStorage.removeItem('pp_earned')")
    page.reload()
    assert sorted(stored(page, "earned")) == ["and", "the"]
    assert stars(page) == 3


# ---------- stars: storage ----------
def test_stars_survive_reload(page):
    use_math_buttons(page)
    solve_math(page)
    page.reload()
    assert stars(page) == 1


@pytest.mark.parametrize("bad", ["abc", "-4", "null", "\"7\"", "2.9"])
def test_bad_saved_value_is_safe(page, bad):
    page.evaluate(f"localStorage.setItem('pp_stars', {json.dumps(bad)})")
    page.reload()
    expected = {"\"7\"": 7, "2.9": 2}.get(bad, 0)
    assert stars(page) == expected
    use_math_buttons(page)
    solve_math(page)
    assert stars(page) == expected + 1


def test_two_open_tabs_do_not_lose_stars(browser):
    ctx = browser.new_context()
    ctx.add_init_script(STUB)
    a, b = ctx.new_page(), ctx.new_page()
    a.goto(PAGE)
    b.goto(PAGE)
    for pg in (a, b):
        use_math_buttons(pg)
        solve_math(pg)
    assert stored(a, "stars") == 2
    ctx.close()


# ---------- friends and buddies ----------
def test_new_friend_unlocks_at_exactly_five(page):
    seed(page, stars=4)
    use_math_buttons(page)
    solve_math_no_close = math_answer(page)
    page.click(f'#pad button[data-n="{solve_math_no_close}"]')
    assert stars(page) == 5
    assert page.is_visible("#party")
    assert "Tumble" in page.text_content("#ptext")


def test_each_tab_has_its_own_buddy(page):
    expected = {"math": "Bao", "between": "Puff", "words": "Melody"}
    for tab, name in expected.items():
        page.click(f"#tab-{tab}")
        assert name in page.get_attribute("#budav", "aria-label")


def test_picking_a_buddy_changes_only_that_tab(page):
    seed(page, stars=5)
    page.click("#tab-between")
    page.click("#fopen")
    page.click('#fgrid button[data-f="tumble"]')
    assert "Tumble" in page.get_attribute("#budav", "aria-label")
    page.click("#tab-math")
    assert "Bao" in page.get_attribute("#budav", "aria-label")
    page.reload()
    page.click("#tab-between")
    assert "Tumble" in page.get_attribute("#budav", "aria-label")


def test_locked_friend_cannot_be_picked(page):
    page.click("#fopen")
    page.click('#fgrid button[data-f="zoomi"]')
    assert "45 more stars" in page.text_content("#fmsg")
    page.click("#fclose")
    assert "Bao" in page.get_attribute("#budav", "aria-label")


def test_break_prompt_after_ten_problems(page):
    seed(page, stars=31)  # no friend unlocks between 31 and 41
    use_math_buttons(page)
    for i in range(10):
        solve_math(page)
        if i < 9:
            page.click("#next")
    page.wait_for_selector("#party", state="visible", timeout=4000)
    assert page.is_visible("#party")
    assert "show a grown-up" in page.text_content("#ptext")
    page.click("#pno")
    assert page.is_hidden("#party")
    assert stars(page) == 41


# ---------- voice ----------
VOICES = [
    {"name": "Microsoft David - English (United States)", "lang": "en-US"},
    {"name": "Microsoft Zira - English (United States)", "lang": "en-US"},
    {"name": "Microsoft Jenny Online (Natural) - English (United States)", "lang": "en-US"},
    {"name": "Microsoft Ana Online (Natural) - English (United States)", "lang": "en-US"},
    {"name": "Google UK English Female", "lang": "en-GB"},
    {"name": "Microsoft Pablo - Spanish (Spain)", "lang": "es-ES"},
]


def pick(pg, voices):
    return pg.evaluate("v=>{const p=pickVoice(v);return p&&p.name}", voices)


def test_prefers_natural_voice_over_old_system_voice(page):
    assert pick(page, VOICES) == "Microsoft Ana Online (Natural) - English (United States)"
    assert pick(page, VOICES[:2] + VOICES[4:]) == "Google UK English Female"
    assert pick(page, VOICES[:2]) is not None  # old voices are still better than nothing


def test_never_picks_a_non_english_voice(page):
    assert pick(page, [VOICES[5]]) is None
    assert pick(page, []) is None


def test_grown_up_voice_choice_is_kept(page):
    seed(page, voice="Microsoft Zira - English (United States)")
    assert pick(page, VOICES) == "Microsoft Zira - English (United States)"


def test_voice_picker_lists_english_voices_best_first(page):
    page.evaluate("v=>{window.__voices=v;loadVoice()}", VOICES)
    page.click("#fopen")
    page.click(".grown summary")
    opts = page.eval_on_selector_all("#vsel option", "o=>o.map(x=>x.value)")
    assert len(opts) == 5 and "Pablo" not in " ".join(opts)
    assert opts[0].startswith("Microsoft Ana")
    page.select_option("#vsel", "Microsoft Zira - English (United States)")
    assert stored(page, "voice") == "Microsoft Zira - English (United States)"


def test_speech_is_warmer_than_default(page):
    use_math_buttons(page)
    solve_math(page)
    said = page.evaluate("window.__said")
    assert said and said[0]["text"].startswith("Yes!")
    assert said[0]["pitch"] > 1 and said[0]["rate"] < 1
