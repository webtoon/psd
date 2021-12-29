import * as path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (env) {
  const entry = {index: path.resolve(__dirname, "src/index.ts")};
  const output = {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  };

  if (env.WEBPACK_SERVE) {
    entry.example = path.resolve(__dirname, "example/example_browser.ts");
    entry["example-browser-worker"] = path.resolve(
      __dirname,
      "example/example-browser-worker.ts"
    );
  } else {
    output.library = {
      type: "module",
    };
  }

  return {
    entry,
    target: ["web", "es2018"],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    output,
    devServer: {
      static: "example",
      host: "localhost",
      port: 4200,
    },
    devtool: "source-map",
    experiments: {
      // Emit ESM only when bundling for production; avoid using ESM for the
      // in-browser example.
      // This is necessary because Firefox does not support import or
      // import.meta inside web workers.
      outputModule: !env.WEBPACK_SERVE,
    },
  };
}
