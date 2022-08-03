// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {describe, it} from "vitest";

import PSD from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe(`@webtoon/psd reads EngineData`, () => {
  it(`should parse the file successfully`, () => {
    const data = fs.readFileSync(
      path.resolve(FIXTURE_DIR, "engineData.psd")
    ).buffer;
    PSD.parse(data);
  });

  it(`should parse CJK text successfully`, () => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "CJK.psd")).buffer;
    PSD.parse(data);
  });
});
