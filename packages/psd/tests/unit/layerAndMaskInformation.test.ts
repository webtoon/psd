// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {describe, expect, it} from "vitest";

import {PsdSpec} from "../../src/interfaces/FileVersionSpec";
import {parseLayerAndMaskInformation} from "../../src/sections/LayerAndMaskInformation";

describe("parseLayerAndMaskInformation", () => {
  it("accepts PSD sections without a readable global layer mask info block", () => {
    const data = new Uint8Array([
      0x00,
      0x00,
      0x00,
      0x08, // Layer and Mask Information section length
      0x00,
      0x00,
      0x00,
      0x02, // LayerInfo length
      0x00,
      0x00, // layer count = 0
      0x00,
      0x00, // alignment padding; no room for GlobalLayerMaskInfo length field
    ]);

    const section = parseLayerAndMaskInformation(
      new DataView(data.buffer),
      PsdSpec
    );

    expect(section.layers).toStrictEqual([]);
    expect(section.groups).toStrictEqual([]);
    expect(section.orders).toStrictEqual([]);
    expect(section.globalAdditionalLayerInformation).toStrictEqual({});
  });
});
