// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {UnknownAliBlock} from "./AliBlockBase";
import {SectionDividerSettingAliBlock} from "./SectionDividerSettingAliBlock";
import {TypeToolObjectSettingAliBlock} from "./TypeToolObjectSettingAliBlock";
import {UnicodeLayerNameAliBlock} from "./UnicodeLayerNameAliBlock";

export * from "./AliKey";
export * from "./SectionDividerSettingAliBlock";
export * from "./UnicodeLayerNameAliBlock";
export * from "./TypeToolObjectSettingAliBlock";

/**
 * Represents a single Additional Layer Info block ("ALI block").
 */
export type AdditionalLayerInfo =
  | SectionDividerSettingAliBlock
  | TypeToolObjectSettingAliBlock
  | UnicodeLayerNameAliBlock
  | UnknownAliBlock;
