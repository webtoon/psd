// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as path from "path";
import typescript from "@rollup/plugin-typescript";
import {defineConfig} from "vite";

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
  // If our code imports another package (@webtoon/psd-decoder in this case),
  // Vite disables build.minify when build.lib.formats includes 'es'.
  // Since we do not want this behavior, force esbuild to minify our code.
  // This must be disabled when testing; otherwise, it causes Vitest to fail.
  esbuild: env.mode === "test" ? undefined : {minify: true},
}));
