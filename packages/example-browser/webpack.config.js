import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {Record<string, string | boolean>} env
 * @param {Record<string, string>} argv
 * @returns {import("webpack").Configuration}
 */
export default (env, argv) => {
  const isDevMode = argv.mode !== "production";

  return {
    entry: path.resolve(__dirname, "./src/main.ts"),
    output: {
      clean: true,
      filename: "[name].js",
      assetModuleFilename: "[name][ext]",
      path: path.resolve(__dirname, "../../dist-web"),
    },
    target: ["web", "es2018"],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
        },
        {
          test: /\.html$/i,
          use: "html-loader",
        },
        {
          test: /\.css$/i,
          use: [
            isDevMode ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "statics/index.html"),
      }),
      ...(isDevMode ? [] : [new MiniCssExtractPlugin()]),
    ],
    devServer: {
      static: path.resolve(__dirname, "./statics"),
      host: "localhost",
      port: 4200,
    },
  };
};
