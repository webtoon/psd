// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ChannelCompression} from "./ChannelCompression";

/**
 * Represents the encoded bytes of a single channel.
 */
export interface ChannelBytes {
  compression: ChannelCompression;
  data: Uint8Array;
}
