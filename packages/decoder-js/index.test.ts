// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {describe, expect, it} from "vitest";
import {ChannelCompression, decodeChannel} from "./decode-channel";

describe("decodeChannel()", () => {
  it("should decode RLE with literal bytes", () => {
    const output = new Uint8Array(20);

    const compression = ChannelCompression.RleCompressed;
    const data = Uint8Array.of(0, 42, 3, 100, 150, 200, 250);
    decodeChannel({compression, data}, 0, output);

    expect(output).toEqual(
      Uint8Array.from([
        // pixel 0
        42, 0, 0, 0,
        // pixel 1
        100, 0, 0, 0,
        // pixel 2
        150, 0, 0, 0,
        // pixel 3
        200, 0, 0, 0,
        // pixel 4
        250, 0, 0, 0,
      ])
    );
  });

  it("should decode RLE with repeat bytes", () => {
    const output = new Uint8Array(36);

    const compression = ChannelCompression.RleCompressed;
    const data = Uint8Array.of(255, 5, 250, 242);
    decodeChannel({compression, data}, 0, output);

    expect(output).toEqual(
      Uint8Array.from([
        // pixel 0
        5, 0, 0, 0,
        // pixel 1
        5, 0, 0, 0,
        // pixel 2
        242, 0, 0, 0,
        // pixel 3
        242, 0, 0, 0,
        // pixel 4
        242, 0, 0, 0,
        // pixel 5
        242, 0, 0, 0,
        // pixel 6
        242, 0, 0, 0,
        // pixel 7
        242, 0, 0, 0,
        // pixel 8
        242, 0, 0, 0,
      ])
    );
  });

  it("should decode RLE with repeat bytes, where overflow may occur", () => {
    const output = new Uint8Array(512);

    const compression = ChannelCompression.RleCompressed;
    const data = Uint8Array.of(129, 130);
    decodeChannel({compression, data}, 0, output);

    const expected = new Uint8Array(512);
    for (let i = 0; i < expected.length; i += 4) {
      expected[i] = 130;
    }

    expect(output).toEqual(expected);
  });

  it("should decode RLE with noop", () => {
    const output = new Uint8Array(20);

    const compression = ChannelCompression.RleCompressed;
    const data = Uint8Array.of(128, 1328);
    decodeChannel({compression, data}, 0, output);

    expect(output).toEqual(new Uint8Array(20));
  });

  it("should decode RLE using channel offset", () => {
    const output = new Uint8Array(24);

    const compression = ChannelCompression.RleCompressed;
    const data = Uint8Array.of(1, 7, 240, 128, 253, 4);
    decodeChannel({compression, data}, 2, output);

    expect(output).toEqual(
      Uint8Array.from([
        // pixel 0
        0, 0, 7, 0,
        // pixel 1
        0, 0, 240, 0,
        // pixel 2
        0, 0, 4, 0,
        // pixel 3
        0, 0, 4, 0,
        // pixel 4
        0, 0, 4, 0,
        // pixel 5
        0, 0, 4, 0,
      ])
    );
  });
});
