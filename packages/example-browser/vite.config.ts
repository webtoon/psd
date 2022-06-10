// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {defineConfig} from "vite";

export default defineConfig({
  root: __dirname,
  publicDir: "statics",
  server: {
    port: 4200,
    watch: {
      interval: 1000,
    },
  },
  build: {
    outDir: "../../dist-web",
    emptyOutDir: true,
  },
});
