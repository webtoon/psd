// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ImageResourceBlockBase} from "./ImageResourceBlockBase";
import {ResourceType} from "./ResourceType";

export enum ResolutionUnit {
  PixelsPerInch = 1,
  PixelsPerCM = 2,
}

export enum DimensionUnit {
  Inch = 1,
  CM = 2,
  Point = 3, // 72 points == 1 inch
  Pica = 4, // 6 pica == 1 inch
  Column = 5,
}

export interface ResolutionInfo {
  horizontal: number;
  horizontalUnit: ResolutionUnit;
  widthUnit: DimensionUnit;
  vertical: number;
  verticalUnit: ResolutionUnit;
  heightUnit: DimensionUnit;
}
export type ResolutionInfoResourceBlock = ImageResourceBlockBase<
  ResourceType.ResolutionInfo,
  ResolutionInfo
>;
