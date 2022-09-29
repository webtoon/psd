// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {defineConfig} from "vite";

export default defineConfig({
  root: __dirname,
  base: "./",
  assetsInclude: ["**/*.psd"],
  server: {
    port: 4300,
  },
  build: {
    outDir: "../../dist-web/benchmark/",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: "[name][extname]",
      },
    },
  },
});
