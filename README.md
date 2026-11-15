# U Shall Receive — car insurance demo (prototype)

A self-contained, front-end-only prototype branded **U Shall Receive** (“Ask, and U shall receive.”): a simple U.S. online auto insurance product with two sample six-month plans (**PL/PD at $300** and **Full Coverage at $600**), a multi-step quote, mock checkout, and a printable/downloadable sample ID card.

**This is a demo only.** It is not a real insurance offer. No policy is sold, no payment is processed, and no licensed carrier is involved. Real auto insurance pricing in the United States varies by driver, vehicle, and state, and must be issued by a licensed insurer (and, where required, sold by a licensed producer).

## Live demo

- Repository: [https://github.com/james92195-lab/u-shall-receive](https://github.com/james92195-lab/u-shall-receive)
- GitHub Pages: [https://james92195-lab.github.io/u-shall-receive/](https://james92195-lab.github.io/u-shall-receive/)

This is a static demo only. It is not a real insurance offer, and no real payment is processed.

## How to run

No build step or backend is required. From this folder:

```bash
python3 -m http.server 8765
```

Then open [http://127.0.0.1:8765/](http://127.0.0.1:8765/) in a browser.

You can also open `index.html` directly as a file, though a local server is more reliable for fonts and screenshots.

### Useful URLs

- Landing page: `/` or `/#/`
- Quote wizard: `/#/quote`
- Quote result (after completing the form): `/#/result`
- Preview a populated Full Coverage sample quote: `/?preview=full` (or `/?preview=quote`)
- Preview a populated PL/PD sample quote: `/?preview=plpd`

Quote answers are stored in `localStorage` under the key `usrDemoState` so a refresh does not lose progress.

## What’s included

- **Landing page** — hero with “Car insurance from $300 for 6 months,” plus side-by-side sample plan cards for **PL/PD ($300 / 6 months)** and **Full Coverage ($600 / 6 months)**.
- **Persistent demo banner** — “Demo — not a real insurance offer,” plus notes that real pricing varies and requires licensed carriers.
- **Multi-step quote** — driver (name, age, ZIP/state), vehicle (year/make/model), driving history (accidents, tickets), coverage (**PL/PD – $300 / 6 mo** vs. **Full Coverage – $600 / 6 mo**).
- **Illustrative rating** — baseline comes from the chosen plan ($300 PL/PD or $600 Full Coverage), plus labeled sample risk adjustments (young or 65+ drivers, a few higher-cost states, accidents, tickets, and a modest newer-vehicle factor on Full Coverage only). There is no separate full-coverage surcharge.
- **Quote result** — coverage summary and a “Buy (simulated)” action.
- **Mock checkout** — disabled placeholder card fields and a **Simulate payment** button. No card data is collected or sent.
- **Confirmation** — mock policy number (`USR-2026-xxxxxx`) and a sample ID card that can be printed or downloaded as a PNG. The card is clearly marked as invalid proof of insurance.
- **Responsive layout** — works on mobile and desktop. Plain HTML, CSS, and JavaScript. No backend.

## Screenshots

Saved under `screenshots/`:

- `landing.png` — marketing home page with both plan cards
- `quote-result-plpd.png` — illustrative PL/PD quote result
- `quote-result-full.png` — illustrative Full Coverage quote result
- `confirmation.png` — mock policy confirmation and sample ID card

## Project layout

```
index.html
css/styles.css
js/app.js
screenshots/
README.md
```

## Suggested next steps toward a real product

1. **Licensing** — Obtain the producer / agency licenses required in each state you intend to sell in, or work exclusively through already-licensed partners. You cannot legally sell or bind auto insurance in the U.S. without them.
2. **Carrier or MGA partnership** — Contract with an admitted (or, if appropriate, surplus-lines) auto insurer or a managing general agent that can paper the product, file rates, and take risk.
3. **Rating and underwriting engine** — Replace this demo’s simple add-ons with the carrier’s approved rates, state minimum limits, MVRs, CLUE / loss history, and underwriting rules. The $300 and $600 figures cannot be guaranteed prices for every driver.
4. **Payments and compliance** — Use a PCI-compliant processor, handle premiums per state fiduciary rules, and add required disclosures, cancellation / cooling-off terms, and adverse-action notices.
5. **Identity, fraud, and data** — KYC, credit / insurance-score consents where used, DMV and vendor integrations, and a real privacy program (GLBA, state privacy laws).
6. **Product and ops** — Claims handling (carrier or TPA), customer service, policy documents, ID cards that meet state formats, and Department of Insurance market-conduct readiness.

This repository is a design and UX prototype only. It should not be deployed as a live sales site.
