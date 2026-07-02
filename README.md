# manhattanreasoning.com — site v2

Static, no-build single-page site. Off-white, Helvetica, scrolling sections
(per `instructions/instructions.md`).

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
