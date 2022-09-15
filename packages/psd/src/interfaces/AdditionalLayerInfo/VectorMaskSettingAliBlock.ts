// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {KnownAliBlock} from "./AliBlockBase";
import {AliKey} from "./AliKey";

export type Point = {vert: number; horiz: number};

export enum PathRecordType {
  ClosedSubpathLength = 0,
  ClosedSubpathBezierKnotLinked = 1,
  ClosedSubpathBezierKnotUnlinked = 2,
  OpenSubpathLength = 3,
  OpenSubpathBezierKnotLinked = 4,
  OpenSubpathBezierKnotUnlinked = 5,
  PathFillRule = 6,
  Clipboard = 7,
  InitialFillRule = 8,
}

export type PathRecord =
  // Path record
  | {
      type:
        | PathRecordType.ClosedSubpathLength
        | PathRecordType.OpenSubpathLength;
      length: number;
      operation: number;
      subpathType: number;
      index: number;
    }
  // Bezier pont
  | {
      type:
        | PathRecordType.ClosedSubpathBezierKnotLinked
        | PathRecordType.ClosedSubpathBezierKnotUnlinked
        | PathRecordType.OpenSubpathBezierKnotLinked
        | PathRecordType.OpenSubpathBezierKnotUnlinked;
      preceding: Point;
      anchor: Point;
      leaving: Point;
    }
  // Path fill rule
  | {
      type: PathRecordType.PathFillRule;
    }
  // Clipboard
  | {
      type: PathRecordType.Clipboard;
      bounds: [number, number, number, number];
      resolution: number;
    }
  // Initial fill
  | {
      type: PathRecordType.InitialFillRule;
      fill: boolean;
    };

export interface VectorMaskSettingAliBlock
  extends KnownAliBlock<AliKey.VectorMaskSetting1 | AliKey.VectorMaskSetting2> {
  version: number;
  invert: boolean;
  notLink: boolean;
  disable: boolean;
  // https://github.com/layervault/psd.rb/blob/master/lib/psd/path_record.rb
  pathRecords: PathRecord[];
}
