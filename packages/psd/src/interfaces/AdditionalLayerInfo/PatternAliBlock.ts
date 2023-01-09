// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ChannelBytes} from "../ChannelBytes";
import {ChannelKind} from "../ChannelKind";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

export interface PatterDataRectangle {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface PatternDataChannel extends ChannelBytes {
  written: true;
  length: number;
  pixelDepth1: number;
  rectangle: PatterDataRectangle;
  pixelDepth2: number;
}

export interface PatternData {
  version: number;
  length: number;
  rectangle: PatterDataRectangle;
  numberOfChannels: number;
  channels: Map<ChannelKind, PatternDataChannel>;
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
