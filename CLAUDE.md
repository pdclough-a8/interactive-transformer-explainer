# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This repo contains a single, self-contained HTML file:

- `index.html` - an interactive, client-side explainer ("How a transformer works") built for Analytics8. It walks through tokenization → embeddings → positional encoding → attention → multi-head attention → transformer blocks → depth/stacking → next-token generation → a toy training demo. Named `index.html` (rather than something more descriptive) specifically so GitHub Pages serves it directly at the site root with no redirect stub needed - don't rename it or reintroduce a second copy of this file (that previously caused the live site to go stale - see git history around "resync index.html").

There is no build system, package manager, bundler, or test suite. This directory **is** a git repo (remote: `origin` → GitHub) and pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/static.yml` - so a push, not just a local save, is what makes a change visible on the live site. The page can also be opened directly in a browser (double-click, or via a simple static file server) for local testing.

## Running / testing

There are no build or test commands. To view changes:

- Open `A8_How_a_Transformer_Works.html` directly in a browser, or serve the directory with any static file server (e.g. `python -m http.server`) if `file://` restrictions cause issues with the ES module script (see Tokenizer below).
- There is no linter or formatter configured. Match the existing minified/dense inline style (CSS and JS are extremely compact, single-line-per-rule) when editing.

Since this is a pure front-end demo with no automated tests, verify changes manually in a browser: type a sentence into the input, and click through each numbered station (tokens, embeddings, position, attention, heads, block, depth, output, training) to confirm rendering still works and nothing throws in the console.

## Structure of the single HTML file

Everything lives in one file, organized top-to-bottom as:

1. **`<style>`** (head) - all CSS, using CSS custom properties (`:root { --ink, --orange, --blue, ... }`) for the Analytics8 brand palette/fonts. Class names are short/dense (e.g. `.qkv-grid`, `.heat`, `.mat-cell`, `.stackviz`).
2. **`<body>`** - markup for:
   - Top bar + hero with the sentence input, example buttons, and an inference/training mode toggle (`#m-infer` / `#m-train`, toggles `body.mode-training` / `body.mode-inference` CSS classes which show/hide `.only-train`/`.only-infer` blocks).
   - A "Plain English" vs "Add the technical layer" toggle (`#t-plain` / `#t-tech`, toggles `body.show-tech` to reveal `.tech-block` elements) - every station has a plain-language explanation plus an optional technical/math aside.
   - A left-hand sticky nav rail (`nav.rail`) linking to each `section.station` (ids: `overview`, `tokens`, `embed`, `position`, `attention`, `heads`, `block`, `depth`, `output`, `history`, `resources`).
   - Each `section.station` is one stage of the pipeline, containing a `.demo` panel with the interactive visualization for that stage (canvas-drawn maps/heatmaps, DOM-built token chips, sliders, tabs, etc).
3. **Data blobs** (`<script>` before the module script) - `window.__BPE__` (offline BPE merges/vocab trained on a small corpus) and `window.__EMB__` (hand-curated 2D word-embedding map with categories/neighbours/palette, used for the embeddings visualization and the king−man+woman analogy demo).
4. **`<script type="module">`** - loads the real `cl100k_base` tokenizer from `https://esm.sh/gpt-tokenizer@2.9.0` (requires network access / non-`file://` context in some browsers) and exposes it as `window.__cl100k__`. Dispatches a `tokenizer-ready` event.
5. **Main `<script>` IIFE** - all interactive logic, `"use strict"`, no external dependencies beyond the tokenizer module. Key pieces:
   - **Tokenizer**: `tokenize()` tries the live `cl100k` encoder first (`TOKMODE==="live"`), falling back to the offline hand-rolled `bpeEncode()` BPE implementation (`TOKMODE==="offline"`) if the module import fails (e.g. no network / opened via `file://`).
   - **Toy embeddings**: `embed(text)` is a deterministic hash-based pseudo-embedding (16 dims, seeded PRNG) - illustrative only, not a real trained embedding.
   - **Position encoding**: `posEnc(p)` implements the standard sinusoidal formula for visualization.
   - **Attention simulation**: `computeAttn(mode)` fabricates plausible attention-weight patterns (not real learned attention) - `mode===undefined` is a generic cosine-similarity-based pattern for the single-head demo; modes `0/1/2` are three canned "head personalities" (local/previous-token, semantic-similarity, attention-sink) used in the multi-head station.
   - **Rendering functions**: one `render*` function per station (`renderTokens`, `drawMap`/`findNeighbours`/`showAnalogy` for embeddings, `renderPosHeat`/`renderPosSum`, `renderHeat`/`renderFocus` for attention heatmaps, `renderHeads`, `renderStack` for the depth/layer stack, `renderMatrix`/`renderSizes` for the "matrix size" panel).
   - **Toy next-token generator** (`8a`): a trigram language model (`TRI`/`BI`/`UNI` counts) built by `buildLM()` from a large hardcoded `CORPUS` string of sample sentences. `candidatesLM()` scores continuations with trigram→bigram→unigram backoff plus anti-repetition penalties and sentence-ending heuristics; `renderProbs()` applies temperature/softmax for the probability bars; `sampleOnce()`/`resetGen()` drive the "add next word" / "auto-write" / "reset" buttons.
   - **Toy training demo** (`8b`): `trStep()`/`trGuess()`/`drawLoss()` simulate a loss curve and a garbled-to-correct output as "training" progresses - this is a scripted animation, not a real model being trained.
   - **Master state**: a single `S` object (`{toks, ids, embs, attn, head, gen, newN, timer}`) holds current sentence state; `rerender()` re-tokenizes/re-embeds/re-renders every station whenever the input sentence changes (debounced via `deb`/`setTimeout`).
   - **Tooltip system**: `.term` spans with a `data-def` attribute get a shared floating tooltip (`#tip`) wired up at the bottom of the script (hover/focus/click/keyboard accessible), bound both at load and dynamically via `window.__bindTerms` for content injected later (e.g. `renderSizes`).

## Editing conventions specific to this file

- CSS and JS favor extreme density (many statements per line, minimal whitespace) - this appears to be an intentional style for this file rather than an accident; follow it for consistency rather than reformatting into a more spread-out style.
- Plain-English copy and technical/math copy are deliberately kept in separate blocks (`.only-*`, `.tech-block`) so the same station can serve both toggle states - when adding a new station or concept, provide both a plain explanation and a `.tech-block` counterpart gated by `body.show-tech`.
- All "model" data used in visualizations (embeddings map, attention patterns, trigram corpus, BPE vocab) is intentionally toy/illustrative, hand-tuned to produce pedagogically clean results (e.g. the king−man+woman analogy is hand-placed in `__EMB__`, not computed from real embeddings). When adjusting these, preserve the illustrative intent rather than trying to make them "more realistic" at the cost of clarity.
- The GPT-2-small-based numbers in `renderSizes()` (768 dims, 12 layers, 124M params, 50,257 vocab) and the GPT-3 comparison are intentionally fixed reference figures for the "size" explanation - keep these consistent if edited.
