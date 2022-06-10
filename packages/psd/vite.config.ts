// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as path from "path";
import typescript from "@rollup/plugin-typescript";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
// eslint-disable-next-line import/no-unresolved
import {defineConfig} from "vitest/config";

export default defineConfig((env) => ({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      // Use arrow function instead of plain string to avoid emitting "index.es.js"
      fileName: () => "index.js",
      formats: ["es"],
    },
    rollupOptions: {
      plugins: [
        // Manually generate type declarations (*.d.ts) because Vite does not generate them
        typescript({
          declaration: true,
          declarationMap: true,
          noEmitOnError: true, // Perform type check during build
          outDir: "dist/",
          rootDir: "src/",
        }),
      ],
    },
    // Prevent rebuilding multiple times while wasm-pack is rebuilding
    watch: env.mode === "watch" ? {buildDelay: 1000} : undefined,
  },
  plugins: [
    wasm(),
    topLevelAwait({
      promiseExportName: "init",
    }),
  ],
  test: {
    setupFiles: "./tests/setup.ts",
  },
}));
