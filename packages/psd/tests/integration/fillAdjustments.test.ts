// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {beforeAll, describe, expect, it} from "vitest";

import type Psd from "../../src/index";
import PSD from "../../src/index";
import {AliKey} from "../../src/interfaces";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("adjustements parsing", () => {
  let psd: Psd;
  beforeAll(() => {
    const data = fs.readFileSync(
      path.resolve(FIXTURE_DIR, "fillAdjustments.psd")
    );
    psd = PSD.parse(data.buffer);
  });

  it("describe HSL changes", () => {
    const hue = psd.layers[10].additionalProperties.find(
      ({key}) => key === AliKey.HueSaturation
    );

    expect(hue).toStrictEqual({
      adjustment: [
        {
          beginRamp: 315,
          beginSustain: 345,
          endSustain: 15,
          endRamp: 45,
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
        {
          beginRamp: 15,
          beginSustain: 45,
          endSustain: 75,
          endRamp: 105,
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
        {
          beginRamp: 75,
          beginSustain: 105,
          endSustain: 135,
          endRamp: 165,
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
        {
          beginRamp: 135,
          beginSustain: 165,
          endSustain: 195,
          endRamp: 225,
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
        {
          beginRamp: 195,
          beginSustain: 225,
          endSustain: 255,
          endRamp: 285,
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
        {
          beginRamp: 255,
          beginSustain: 285,
          endSustain: 315,
          endRamp: 345,
          hue: 0,
          saturation: 0,
          lightness: 0,
        },
      ],
      signature: "8BIM",
      key: "hue2",
      version: 2,
      colorize: 0,
      colorization: {hue: 0, saturation: 25, lightness: 0},
      master: {hue: -17, saturation: 19, lightness: 4},
    });
  });
});
