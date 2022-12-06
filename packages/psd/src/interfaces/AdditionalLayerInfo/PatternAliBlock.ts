// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ChannelBytes} from "../ChannelBytes";
import {ChannelKind} from "../ChannelKind";
import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";
import {Point} from "./VectorMaskSettingAliBlock";

export interface PatterDataRectangle {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface PatternDataChannel {
  written: boolean;
  length: number;
  pixelDepth1: number;
  rectangle: PatterDataRectangle;
  pixelDepth2: number;
  compression: number;
  data: ChannelBytes;
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
  point: Point;
  name: string;
  id: string;
  colorTable?: [number, number, number][];
  patternData: PatternData;
}

export interface PatternAliBlock
  extends KnownAliBlock<AliKey.Pattern1 | AliKey.Pattern2 | AliKey.Pattern3> {
  data: Pattern[];
}
