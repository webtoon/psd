// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fsPromises from "fs/promises";
import * as path from "path";
import {fileURLToPath} from "url";

import * as Psd from "@webtoon/psd";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  await Psd.init;
  const file_path = path.resolve(__dirname, "./example.psd");
  const psd_file = await fsPromises.readFile(file_path, null);

  const psd = Psd.parse(psd_file.buffer);
  console.log(psd.fileHeader);
})();
