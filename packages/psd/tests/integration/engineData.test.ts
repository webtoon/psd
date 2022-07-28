// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {beforeAll, describe, it} from "vitest";

import PSD from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe(`@webtoon/psd reads EngineData`, () => {
  let data: ArrayBuffer;

  beforeAll(() => {
    data = fs.readFileSync(path.resolve(FIXTURE_DIR, "engineData.psd")).buffer;
  });

  it(`should parse the file successfully`, () => {
    PSD.parse(data);
  });
});
