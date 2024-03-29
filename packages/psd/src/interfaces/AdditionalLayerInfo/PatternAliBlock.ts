// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ChannelBytes} from "../ChannelBytes";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

export interface PatternDataRectangle {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface PatternDataChannel extends ChannelBytes {
  written: true;
  length: number;
  pixelDepth1: number;
  rectangle: PatternDataRectangle;
  pixelDepth2: number;
}

export interface PatternData {
  version: number;
  length: number;
  rectangle: PatternDataRectangle;
  numberOfChannels: number;
  channels: (PatternDataChannel | null)[];
}

export type ColorTable = [number, number, number][];

export interface Pattern {
  version: number;
  imageMode: number;
  width: number;
  height: number;
  name: string;
  id: string;
  colorTable?: ColorTable;
  patternData: PatternData;
}

export interface PatternAliBlock
  extends KnownAliBlock<AliKey.Pattern1 | AliKey.Pattern2 | AliKey.Pattern3> {
  data: Pattern[];
}
