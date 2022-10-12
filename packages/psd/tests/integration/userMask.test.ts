// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {describe, expect, it} from "vitest";

import PSD from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe(`@webtoon/psd reads user masks`, () => {
  it(`should parse the mask properties successfully`, () => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "mask.psd")).buffer;
    const psd = PSD.parse(data);
    const maskedLayer = psd.layers[0];
    expect(maskedLayer.maskData).toStrictEqual({
      backgroundColor: 0,
      top: 39,
      bottom: 59,
      left: 579,
      right: 600,
      flags: {
        invertMaskWhenBlending: false,
        layerMaskDisabled: false,
        masksHaveParametersApplied: false,
        positionRelativeToLayer: false,
        userMaskFromRenderingOtherData: true,
      },
      parameters: undefined,
      realData: {
        backgroundColor: 0,
        bottom: 65535,
        left: 65535,
        right: 65535,
        top: 40,
        flags: {
          invertMaskWhenBlending: false,
          layerMaskDisabled: false,
          masksHaveParametersApplied: false,
          positionRelativeToLayer: false,
          userMaskFromRenderingOtherData: false,
        },
      },
    });
    expect(maskedLayer.userMask).toHaveLength(0);
    expect(maskedLayer.realUserMask).toHaveLength(0);
  });

  it(`should extract mask pixels`, async () => {
    const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "mask.psd")).buffer;
    const psd = PSD.parse(data);
    const maskedLayer = psd.layers[0];
    // NOTE: maybe we should introduce decoding into some grayscale format instead?
    // 21 (width) * 20 (height) * 4 (since we decompress into RGBA format)
    expect(await maskedLayer.userMask()).toHaveLength(1680);
    expect(await maskedLayer.realUserMask()).toBeUndefined();
  });
});
