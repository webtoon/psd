// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import execute from "rollup-plugin-shell";
import watcher from "rollup-plugin-watcher";
import {defineConfig} from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig((env) => ({
  build: {
    lib: {
      entry: "./index.ts",
      // Use arrow function instead of plain string to avoid emitting "index.es.js"
      fileName: () => "index.js",
      formats: ["es"],
    },
    // Whenever we rebuild, we execute wasm-pack, which updates pkg/.
    // To avoid an infinite loop, don't watch pkg/.
    watch: env.mode === "watch" ? {exclude: "pkg/**"} : undefined,
  },
  plugins: [
    watcher(["**/*.rs"]),
    execute({commands: ["wasm-pack build"], hook: "buildStart", sync: true}),
    wasm(),
    topLevelAwait({
      promiseExportName: "init",
    }),
  ],
}));
