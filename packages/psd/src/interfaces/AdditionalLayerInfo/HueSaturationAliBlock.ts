// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

export interface HSLValue {
  hue: number;
  saturation: number;
  lightness: number;
}

export interface HSLChange extends HSLValue {
  beginRamp: number;
  beginSustain: number;
  endSustain: number;
  endRamp: number;
}

export interface HueSaturationAliBlock
  extends KnownAliBlock<AliKey.HueSaturation> {
  version: number;
  colorize: number;
  colorization: HSLValue;
  master: HSLValue;
  // TODO: better naming?
  adjustment?: HSLChange[];
}
