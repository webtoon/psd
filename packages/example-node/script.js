// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from "url";

import Psd from "@webtoon/psd";

// Pretend we run in a TTY to enable colors, even when we are called by wireit
process.stdout.isTTY = true;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const file_path = path.resolve(__dirname, "./example.psd");
const psd_file = fs.readFileSync(file_path);

const psd = Psd.parse(psd_file.buffer);
console.log(psd);
