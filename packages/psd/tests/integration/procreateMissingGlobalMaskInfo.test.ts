// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("Procreate PSD without global mask info", () => {
  let psd: Psd;

  beforeAll(() => {
    const data = fs.readFileSync(
      path.resolve(FIXTURE_DIR, "procreate-missing-global-mask-info.psd")
    );
    psd = PSD.parse(data.buffer);
  });

  it("parses successfully", () => {
    expect(psd.width).toBe(128);
    expect(psd.height).toBe(128);
    expect(psd.layers.length).toBeGreaterThan(0);
  });
});
