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
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "pattern.psd"));
    psd = PSD.parse(data.buffer);
  });

  it("should create patterns array on layer", () => {
    expect(psd.patterns).toHaveLength(1);
    expect(Array.isArray(psd.patterns)).toEqual(true);
  });

  it("should have correct fielfds", () => {
    expect(psd.patterns[0]).toEqual({
      version: 1,
      imageMode: 3,
      width: 300,
      height: 300,
      name: "MyPattern02",
      id: "3e962e32-3652-6945-b740-96be1f7f364b",
      patternData: expect.any(Object),
    });
  });

  it("patternData should have correct fields", () => {
    expect(psd.patterns[0].patternData).toEqual({
      version: 3,
      length: 26338,
      rectangle: {top: 0, left: 0, bottom: 300, right: 300},
      numberOfChannels: 24,
      channels: expect.any(Map),
    });
  });

  it("pattern.data first channel should have correct fields", () => {
    expect(psd.patterns[0].patternData.channels.get(0)).toEqual({
      written: true,
      length: 8533,
      pixelDepth1: 8,
      rectangle: {top: 0, left: 0, bottom: 300, right: 300},
      pixelDepth2: 8,
      compression: 1,
      data: expect.any(Uint8Array),
    });
  });

  it("pattern.data length should have numberOfChannels + 2 length", () => {
    const channelsLength = Array.from(
      psd.patterns[0].patternData.channels.keys()
    ).length;

    expect(channelsLength).toEqual(
      psd.patterns[0].patternData.numberOfChannels + 2
    );
  });
});
