// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD, {AliKey, PathRecordType} from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("patterns parsing", () => {
  let psd: Psd;

  beforeAll(() => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "pattern-01.psd"));
    psd = PSD.parse(data.buffer);
  });

  it("parses pattern data", () => {
    console.log("___psd", psd.patterns);
  });
});
