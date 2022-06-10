// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as path from "path";
import typescript from "@rollup/plugin-typescript";
import {defineConfig} from "vite";

export default defineConfig({
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
  },
});
