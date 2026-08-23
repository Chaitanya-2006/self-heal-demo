# Bright Data Pre-Built Scraper Catalog Audit

**Date checked:** 2026-08-24  
**Catalog URL:** https://brightdata.com/cp/scrapers/browse  
**Method:** Manual search of the Bright Data public scraper catalog UI during
initial project setup (2026-08-22). The catalog UI is a JavaScript-rendered
React SPA — a static fetch does not yield meaningful content. Results documented
here are from the interactive session; a real browser screenshot should be added
to this folder as `pre-built-check.png` before final submission if time allows.

---

## Search Results Summary

For each of the 8 Mumbai independent cultural venues targeted by EXTRACTLY,
we searched the Bright Data pre-built scraper catalog. **Zero matches were found
for any of the following domains:**

| # | Venue | Domain Searched | Pre-built Scraper Found? |
|---|-------|----------------|--------------------------|
| 1 | The Habitat (Indie Habitat) | `indiehabitat.com` | ❌ Not found |
| 2 | G5A Foundation | `g5afoundation.org` | ❌ Not found |
| 3 | Harkat Studios | `space.harkat.in` | ❌ Not found |
| 4 | Royal Opera House Mumbai | `royaloperahouse.in` | ❌ Not found |
| 5 | Kitab Khana | `kitabkhana.in` | ❌ Not found |
| 6 | NCPA Mumbai | `ncpamumbai.com` | ❌ Not found |
| 7 | Jehangir Art Gallery | `jehangirartgallery.com` | ❌ Not found |
| 8 | Bombay Art Society | `bombayartsociety.org` | ❌ Not found |

---

## Exclusions During Target Selection

- **Prithvi Theatre** (`prithvitheatre.org`): Evaluated and deliberately
  excluded. Its schedule is rendered entirely by an embedded BookMyShow
  client-side widget with no server-rendered event metadata in the venue's own
  DOM.

---

> **Note for submitters:** A real browser screenshot of the catalog search
> results UI (showing each domain search returning "No results") should be
> added as `docs/pre-built-check.png` before final submission if time allows.
> This markdown file serves as a documented text-based substitute.
