# manhattanreasoning.com — site v2

Static, no-build site: `index.html` (the scrolling landing page), `research.html`
and `careers.html`. Off-white, Helvetica (per `instructions/instructions.md`).

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(A server is needed because the hero fetches `data/routing.json`; `file://` won't.)

## What's real

- **Hero routing field** — `data/routing.json` is extracted from the routed
  nextpnr `.config` of the actual `cloud_fpga_soc` build (VexRiscv + LiteEth on
  an ECP5-85F): 20,228 directional span-wire PIPs. `js/routing-viz.js` treats
  the wires' shared tile endpoints as a graph and continuously propagates
  "signals" (BFS frontiers) along it — the circuit re-routes itself forever,
  bleeding into the off-white page via a radial mask (no container). Moving the
  cursor injects current at the nearest node. Regenerate `routing.json` after a
  new build with the extractor alongside `Projects/Cloud_FPGA/firmware/base/viz/`
  tooling (see `render_routing.py`).
- **Code snippets** — match the real `manhattan_reasoning_gym` API
  (`mrg.RegisterMap`, `mrg.cloud.App`, `mrg.Sandbox`).
- **Terminal** — replays a real `mrg run` session, including
  "warming up the flip-flops…".

## The research page

`research.html` is the Fall 2026 research vision paper, set for the web. It
carries no design system of its own — it links `css/style.css` and `js/main.js`
like every other page, and adds only `css/research.css` (reading column, section
rail, figure plates) and `js/research.js` (rail scroll-spy, reading progress,
figure zoom).

The figures in `assets/figures/` are vector exports of the paper's TikZ/pgfplots
sources, and `assets/manhattan-reasoning-research-vision.pdf` is the built PDF
the hero links to. Both are generated from the paper's LaTeX repo, not edited
here — regenerate them there and copy the results across.

Careers came out of the nav and the footer to make room for it. `careers.html`
is unchanged and still served at `/careers.html` — the printed QR flier in
`print/` points there — but nothing on the site links to it.

## Before going live

1. **Beta form**: create a form at [formspree.io](https://formspree.io), then
   replace `YOUR_FORM_ID` in `index.html`. Until then, submitting falls back to
   a pre-filled email to hello@manhattanreasoning.com.
2. **Docs link** points at `docs.manhattanreasoning.com`.

## Deploy (GitHub Pages)

Push this directory to the repo and enable Pages (Settings → Pages → deploy
from branch, root). For the apex domain, add a `CNAME` file containing
`www.manhattanreasoning.com` and set the DNS records per GitHub's docs.

## Test hooks

`?nofx` disables animations and vh-sizing (for screenshots);
`?nofx&scrolled` also forces the collapsed turnstile nav.
