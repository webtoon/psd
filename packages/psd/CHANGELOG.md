# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.0](https://github.com/webtoon/psd/compare/0.1.2...0.2.0) (2022-06-20)

### ⚠ BREAKING CHANGES

- parse layer hidden, transparency lock flags
- remove named export 'parse()'
- export Group, Layer, Slice as types only
- init WASM during decode, no top-level init
- implement Rust/WebAssembly-based decoder

### Features

- export Group, Layer, Slice as types only ([564b5a5](https://github.com/webtoon/psd/commit/564b5a5a7a87c40458e837c70902164d3e283660))
- implement Rust/WebAssembly-based decoder ([020f7a0](https://github.com/webtoon/psd/commit/020f7a00e9244a8b5c7cc30d8c68b62b2574a969))
- init WASM during decode, no top-level init ([0b0bb68](https://github.com/webtoon/psd/commit/0b0bb6822859c034ab8fb6345a7f301c249b0b44))
- parse layer hidden, transparency lock flags ([1caf69b](https://github.com/webtoon/psd/commit/1caf69b927cde01609e8b26a68c40eae80d58606))

### Code Refactoring

- remove named export 'parse()' ([86af282](https://github.com/webtoon/psd/commit/86af282efa6b4bef05f8ea6148461230bf01ab28))

## [0.1.2](https://github.com/webtoon/psd/compare/0.1.1...0.1.2) (2022-06-03)

- fix: update main and types in package.json (403670a)

## [0.1.1](https://github.com/webtoon/psd/compare/0.1.0...0.1.1) (2022-05-09)

- chore: update dependencies 20220509 (0ced7d0)
- Update README.md (98c7cd7)
- ci: setup auto-deploy GitHub Pages (dde2e47)
- docs: add badges w/ links (bb8e2de)
- docs: add intro paragraph and logo (d015f92)
- feat: check for compat with Edge 79+, Node 12+ (ff8f310)
- feat(benchmark): provide sample PSD file w/ download link (d907f05)
- refactor(benchmark): improve layout (b15f89e)
- fix(benchmark): don't show indeterminate progressbar on initial load (2f28afa)
- refactor(benchmark): use functional architecture (8425d07)
- chore: update all dependencies (4108db5)
- docs: put Benchmarks section after Installation (0478f55)
- docs: link to benchmark page (38d589a)
- fix(demo): allow opening PSD files on Windows (9234673)
- feat: add web-based benchmark page (9bc26f9)
- build: use dist-web/ for publishing to GitHub Pages (d16c6ab)
- build: use default entrypoint when building browser demo (6aa9913)
- build: refactor Webpack config for browser example (dcb72ea)
- build: cleanup Webpack configs (cc84744)
- chore: make Prettier ignore browser demo artifacts (a6f0441)
- style: Allow Prettier to format HTML files (0b4b9aa)
- chore: replace PSD.ts with @webtoon/psd (8a62ec5)
- chore: update dev deps (eba0f0f)
- chore: fix GitHub badge text in demo (43a7708)
- docs: fix import stmt (9cdf3bf)

## [0.1.0](https://github.com/webtoon/psd/tree/0.1.0) (2022-01-17)

Say hello to PSD.ts!

```
npm install @webtoon/psd
```

Created with <3 by WEBTOON
