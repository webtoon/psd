// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("patterns parsing", () => {
  let psd: Psd;

  beforeAll(() => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "glandia.psd"));
    psd = PSD.parse(data.buffer);
  });

  it("should create patterns array on layer", () => {
    expect(psd.layers).toHaveLength(64);
  });
});
