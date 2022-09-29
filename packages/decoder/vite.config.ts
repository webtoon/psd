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
  },
  plugins: [
    wasm(),
    topLevelAwait({
      promiseExportName: "init",
    }),
  ],
});
