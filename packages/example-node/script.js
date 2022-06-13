// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from "url";

import * as Psd from "@webtoon/psd";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const file_path = path.resolve(__dirname, "./example.psd");
const psd_file = fs.readFileSync(file_path);

const psd = Psd.parse(psd_file.buffer);
console.log(psd.fileHeader);
