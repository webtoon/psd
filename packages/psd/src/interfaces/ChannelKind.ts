// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {UnsupportedChannelKindOffset} from "../utils";

export enum ChannelKind {
  Red = 0,
  Green = 1,
  Blue = 2,
  TransparencyMask = -1,
  UserSuppliedLayerMask = -2,
  RealUserSuppliedLayerMask = -3,
}

export function getChannelKindOffset(channelKind: ChannelKind): 0 | 1 | 2 | 3 {
  switch (channelKind) {
    case ChannelKind.Red:
      return 0;
    case ChannelKind.Green:
      return 1;
    case ChannelKind.Blue:
      return 2;
    case ChannelKind.TransparencyMask:
      return 3;
    default:
      throw new UnsupportedChannelKindOffset();
  }
}
