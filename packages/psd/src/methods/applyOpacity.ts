// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ChannelKind, getChannelKindOffset} from "../interfaces";
import {InvalidOpacityValue} from "../utils";

export function applyOpacity(
  pixels: Uint8ClampedArray,
  opacity = 255
): Uint8ClampedArray {
  if (!(0 <= opacity && opacity <= 255)) {
    throw new InvalidOpacityValue();
  }

  const length = pixels.length / 4;
  const offset = getChannelKindOffset(ChannelKind.TransparencyMask);
  const alpha = opacity / 255;

  for (let i = 0; i < length; i++) {
    const j = i * 4 + offset;

    pixels[j] = Math.floor(alpha * pixels[j]);
  }

  return pixels;
}
