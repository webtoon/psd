// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {defineConfig} from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  build: {
    lib: {
      entry: "./index.ts",
      // Use arrow function instead of plain string to avoid emitting "index.es.js"
      fileName: () => "index.js",
      formats: ["es"],
    },
    // Enabling source maps for @webtoon/psd-decoder appears to do nothing.
    // This may be because we use vite-plugin-top-level-await to transform code,
    // and the plugin does not support source maps.
    // sourcemap: true,
  },
  plugins: [
    wasm(),
    topLevelAwait({
      promiseExportName: "init",
    }),
  ],
});
