# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.0](https://github.com/webtoon/psd/compare/0.2.0...0.3.0) (2022-10-20)

### Features

- AdditionalLayerInfos; LinkedLayers ([#54](https://github.com/webtoon/psd/issues/54)) ([bf9540b](https://github.com/webtoon/psd/commit/bf9540b784e23dcfe49b30fdba2931177d500ae2))
- expose ICC profile ([aa7679e](https://github.com/webtoon/psd/commit/aa7679e6e79e22b8ea8ff8a8d4414cc90d6d7bf7))
- Implement additional ImageResources ([#55](https://github.com/webtoon/psd/issues/55)) ([1d1e702](https://github.com/webtoon/psd/commit/1d1e70234282e09da2404132368d5bbbb4d31aa5))
- implement EngineData parsing ([8c5f09c](https://github.com/webtoon/psd/commit/8c5f09cf5b0338cda1344b56dd1aa9b1979da195))
- Implement reading mask data ([#56](https://github.com/webtoon/psd/issues/56)) ([0f99674](https://github.com/webtoon/psd/commit/0f9967493297a139d4773b1bb63991a6d8ae6b72))

### Bug Fixes

- ALI block 'cinf' has diffent size for PSB ([70ffd71](https://github.com/webtoon/psd/commit/70ffd7107490400a6d4d5f9a595e8e0b95e60c91))
- Don't align ALI block size to 4 byte boundary ([f4fc949](https://github.com/webtoon/psd/commit/f4fc9497d2826aeaed17910194dc9e8f7130ebe9))
- handle empty channel data ([9cd2d8f](https://github.com/webtoon/psd/commit/9cd2d8f1caeeed778a9c902892f524d2d96b3f1b))
- left sidebar width in wider screen ([702eeed](https://github.com/webtoon/psd/commit/702eeed01ae1da5338cf7aeb2b45002cb33c45ef))
- readme update. need to fileVariable name instead of module name ([1b6d1ca](https://github.com/webtoon/psd/commit/1b6d1ca25d295bf2956191f466d358bc4a823a59))

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
