# How a Transformer Works

An interactive, client-side explainer that walks through exactly how a transformer-based language model (the architecture behind ChatGPT, Claude, Gemini, and most modern LLMs) turns a sentence into a prediction — built for Analytics8 as a learning tool.

**Live site:** https://pdclough-a8.github.io/interactive-transformer-explainer/

No installation, sign-up, or backend of any kind — open the link, type your own sentence into the box at the top, and watch it flow through every stage of a real transformer's forward pass.

## What it covers

The page walks through the pipeline stage by stage, each with its own interactive, sentence-driven demo:

1. **Tokenise** — splitting text into sub-word tokens and ID numbers
2. **Embed** — turning each token into a vector of numbers
3. **Position** — how the model keeps track of word order
4. **Attention** — how tokens exchange information (with a live "who's attending to whom" diagram, a causal-mask toggle, and a pronoun-resolution experiment)
5. **Many heads** — running several attention patterns in parallel
6. **The block** — attention + the feed-forward network, residuals and normalisation
7. **Depth** — stacking blocks to build up richer representations
8. **Next token prediction** — turning scores into a prediction, with temperature and sampling
9. **Predictor to assistant** — how raw pretraining becomes something like Claude or ChatGPT (instruction tuning, learning from human feedback, reasoning training)
10. **Beyond the model** — RAG, tool use and agents

...plus a summary of the big ideas, a short history of how transformers came to dominate, and a set of curated external resources for going deeper on each topic (TensorFlow Projector, Embedding Atlas, Transformer Explainer, exBERT, the original papers behind RAG and agents, and more, linked inline at the relevant station).

## How to read it

Three independent controls change what you see, without changing the underlying content:

- **Using it / Teaching it** (top right) — switches between *inference* (using an already-trained, frozen model) and *training* (the same pipeline, plus the one extra step that updates the weights). The 8-step forward pass is identical either way; only the "While training" call-outs and a couple of training-specific stations change.
- **Plain English / Add the technical layer** (top of the page) — every station has a plain-language explanation that stands on its own, plus an optional technical layer underneath with the real mechanism, named techniques, and (where it genuinely aids understanding) worked examples — deliberately with as little bare mathematical notation as possible, in favour of plain sentences that carry the same information.
- **Realism tags** on every demo — 🟢 **Real** (an actual computation on your sentence), 🟡 **Simplified** (a real mechanism at a small, checkable scale), or 🔵 **Illustrative** (a visual stand-in for the idea, not a real model's output). The page is deliberately honest about which is which throughout — nothing claims to be more real than it is.

## What's actually real vs. illustrative

Worth knowing up front: **tokenisation is genuinely real** (it uses OpenAI's actual `cl100k_base` tokenizer when online, falling back to a small BPE tokenizer trained specifically for this page if it can't reach that). Almost everything downstream of it — the toy embeddings, the attention weights, the multi-head "personalities," the next-word probabilities — is a hand-written illustrative approximation running entirely in your browser, designed to demonstrate real, well-documented tendencies (semantic similarity, recency, pronoun resolution, previous-token heads, and more) without ever calling out to, or being computed by, an actual trained model. Every demo says so explicitly via its realism tag.

## Project structure

This is intentionally a single self-contained file with no build step, package manager, or dependencies to install:

- `index.html` — the entire site: markup, CSS, and JavaScript in one file. The only external calls are an optional live tokenizer import (`https://esm.sh/gpt-tokenizer`) and Google Fonts.
- `.github/workflows/static.yml` — deploys straight to GitHub Pages on every push to `main`.
- `CLAUDE.md` — guidance for AI coding agents working in this repo (code layout, editing conventions, the dense/minified style used throughout).

To view changes locally, just open `index.html` in a browser, or serve the folder with any static file server if you hit `file://` restrictions on the tokenizer import (e.g. `python -m http.server`).

## Design philosophy

A few decisions that shape everything on the page, in case they're not obvious from reading it:

- **One sentence flows through the whole page.** Type it once at the top; every station's demo recomputes live from that same sentence.
- **What vs. how.** Plain English explains *what* each stage does and why it matters; the technical layer explains *how*, with real terminology and mechanism — but strips bare formulas in favour of plain sentences wherever the underlying idea can be said in words without losing anything genuinely useful.
- **Show, then let people poke at it.** Wherever possible, a concept gets a "try it" moment — swap a word and watch the effect, turn off the causal mask and watch a model "cheat," turn the temperature dial until the output goes off the rails — rather than another paragraph of explanation.
- **Never overclaim realism.** If something is a hand-scripted stand-in, it says so, right next to the demo, every time.
