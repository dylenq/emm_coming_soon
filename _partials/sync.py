#!/usr/bin/env python3
"""
Sync the canonical nav and footer (from _partials/) into every *.html page in the site.

This is a build-time DRY mechanism. Edit _partials/nav.html or _partials/footer.html
once, run `python3 _partials/sync.py`, and every page is updated. Each page gets the
correct "active" class on its nav link based on its filename.

Safe to re-run. Idempotent.
"""
import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
PARTIALS = SITE / "_partials"
NAV_TEMPLATE = (PARTIALS / "nav.html").read_text()
FOOTER_HTML = (PARTIALS / "footer.html").read_text()

# Map filename -> which nav placeholder gets " active"
# Service pages all highlight the Services dropdown.
ACTIVE_MAP = {
    "index.html": "HOME",
    "about.html": "ABOUT",
    "professionals.html": "PROFESSIONALS",
    "services.html": "SERVICES",
    "service-counselling.html": "SERVICES",
    "service-energy-healing.html": "SERVICES",
    "service-life-coaching.html": "SERVICES",
    "service-mindfulness.html": "SERVICES",
    "service-yoga.html": "SERVICES",
    "service-fitness.html": "SERVICES",
    "service-assessments.html": "SERVICES",
    "service-financial.html": "SERVICES",
    "service-social.html": "SERVICES",
    "service-corporate.html": "SERVICES",
    "corporates.html": "CORPORATES",
    "journal.html": "JOURNAL",
    "journal-instructions.html": "JOURNAL",
    "contact.html": "CONTACT",
    # Stub / legal / misc pages: no active state.
}

PLACEHOLDERS = ["HOME", "ABOUT", "PROFESSIONALS", "SERVICES",
                "CORPORATES", "JOURNAL", "CONTACT"]


def render_nav(filename):
    active = ACTIVE_MAP.get(filename)
    out = NAV_TEMPLATE
    for ph in PLACEHOLDERS:
        out = out.replace("{{" + ph + "}}", " active" if ph == active else "")
    return out


# Regex to find an existing <!-- Navigation --> ... </nav> block (possibly with
# leading whitespace before the comment), and same for footer.
NAV_PATTERN = re.compile(
    r"[ \t]*<!--\s*Navigation\s*-->\s*\n\s*<nav\s+class=\"navbar\">.*?</nav>",
    re.S,
)
FOOTER_PATTERN = re.compile(
    r"[ \t]*<!--\s*Footer\s*-->\s*\n\s*<footer\s+class=\"footer\">.*?</footer>",
    re.S,
)


def sync_file(path: Path) -> str:
    """Returns 'changed', 'no-op', 'skipped' (no nav/footer found)."""
    src = path.read_text()
    new_nav = "    " + render_nav(path.name).lstrip()
    new_footer = "    " + FOOTER_HTML.lstrip()

    nav_found = bool(NAV_PATTERN.search(src))
    footer_found = bool(FOOTER_PATTERN.search(src))
    if not nav_found or not footer_found:
        return "skipped"

    new = NAV_PATTERN.sub(lambda m: new_nav, src, count=1)
    new = FOOTER_PATTERN.sub(lambda m: new_footer, new, count=1)
    if new == src:
        return "no-op"
    path.write_text(new)
    return "changed"


def main():
    files = sorted(p for p in SITE.glob("*.html") if not p.name.startswith("_"))
    counts = {"changed": 0, "no-op": 0, "skipped": 0}
    for p in files:
        status = sync_file(p)
        counts[status] += 1
        marker = {"changed": "✓", "no-op": "·", "skipped": "✗"}[status]
        print(f"  {marker} {p.name}: {status}")
    print()
    print(f"  {counts['changed']} changed · {counts['no-op']} no-op · {counts['skipped']} skipped")
    if counts["skipped"]:
        print("  (skipped = nav or footer block not found in expected form)")
        sys.exit(1)


if __name__ == "__main__":
    main()
