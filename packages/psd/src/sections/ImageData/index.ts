// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ChannelCompression, Depth, FileVersionSpec} from "../../interfaces";
import {Cursor, InvalidCompression, UnsupportedCompression} from "../../utils";
import {readRawData} from "./readRawData";
import {readRleCompressedData} from "./readRleCompressedData";

export interface ImageDataSection {
  compression: ChannelCompression;
  red: Uint8Array;
  green?: Uint8Array;
  blue?: Uint8Array;
  alpha?: Uint8Array;
}

export function parseImageData(
  dataView: DataView,
  depth: Depth,
  height: number,
  channelCount: number,
  fileVersionSpec: FileVersionSpec
): ImageDataSection {
  const cursor = new Cursor(dataView);

  const compression = cursor.read("u16");
  if (!(compression in ChannelCompression)) {
    throw new InvalidCompression();
  }

  const {red, green, blue, alpha} = (() => {
    switch (compression) {
      case ChannelCompression.RawData: {
        return readRawData(cursor, depth, channelCount);
      }
      case ChannelCompression.RleCompressed: {
        return readRleCompressedData(
          cursor,
          channelCount,
          height,
          fileVersionSpec
        );
      }
      default: {
        throw new UnsupportedCompression();
      }
    }
  })();

  return {
    compression,
    red,
    green,
    blue,
    alpha,
  };
}
