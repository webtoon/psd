// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {describe, expect, it} from "vitest";

import PSD from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures/icc");

/**
 * Test helper function that loads a PSD file and calls `PSD.parse()` on it.
 * @param fileName Name of PSD file under `FIXTURE_DIR` directory
 * @returns Callback that parses the loaded data as a `Psd` object
 */
function parsePsdFile(fileName: string) {
  const data = fs.readFileSync(path.resolve(FIXTURE_DIR, fileName));
  return PSD.parse(data.buffer);
}

describe("ICC profile parsing", () => {
  it("should return array of bytes", () => {
    const psd = parsePsdFile("SWOP.psd");
    expect(psd.icc_profile).toHaveLength(557168);
  });

  it("should be undefined if not found", () => {
    const psd = parsePsdFile("empty.psd");
    expect(psd.icc_profile).toBe(undefined);
  });
});
