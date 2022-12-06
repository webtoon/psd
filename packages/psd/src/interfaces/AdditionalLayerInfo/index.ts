// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {UnknownAliBlock} from "./AliBlockBase";
import {ArtboardDataAliBlock} from "./ArtboardDataAliBlock";
import {BlendOptionsCapacityAliBlock} from "./BlendOptionsCapacityAliBlock";
import {GradientFillSettingAliBlock} from "./GradientFillSettingAliBlock";
import {HueSaturationAliBlock} from "./HueSaturationAliBlock";
import {LayerIdAliBlock} from "./LayerIdAliBlock";
import {LinkedLayerAliBlock} from "./LinkedLayerAliBlock";
import {NestedSectionDividerSettingAliBlock} from "./NestedSectionDividerSettingAliBlock";
import {ObjectBasedEffectsAliBlock} from "./ObjectBasedEffectsAliBlock";
import {PatternFillSettingAliBlock} from "./PatternFillSettingAliBlock";
import {SectionDividerSettingAliBlock} from "./SectionDividerSettingAliBlock";
import {SmartObjectPlacedLayerDataAliBlock} from "./SmartObjectPlacedLayerDataAliBlock";
import {SolidColorSheetSettingAliBlock} from "./SolidColorSheetSettingAliBlock";
import {TypeToolObjectSettingAliBlock} from "./TypeToolObjectSettingAliBlock";
import {UnicodeLayerNameAliBlock} from "./UnicodeLayerNameAliBlock";
import {VectorMaskSettingAliBlock} from "./VectorMaskSettingAliBlock";
import {VectorOriginationDataAliBlock} from "./VectorOriginationDataAliBlock";
import {VectorStrokeContentDataAliBlock} from "./VectorStrokeContentDataAliBlock";
import {VectorStrokeDataAliBlock} from "./VectorStrokeDataAliBlock";
import {PatternAliBlock} from "./PatternAliBlock";

export * from "./AliKey";
export * from "./SectionDividerSettingAliBlock";
export * from "./UnicodeLayerNameAliBlock";
export * from "./TypeToolObjectSettingAliBlock";
export * from "./BlendOptionsCapacityAliBlock";
export * from "./GradientFillSettingAliBlock";
export * from "./HueSaturationAliBlock";
export * from "./LayerIdAliBlock";
export * from "./NestedSectionDividerSettingAliBlock";
export * from "./ObjectBasedEffectsAliBlock";
export * from "./PatternFillSettingAliBlock";
export * from "./SolidColorSheetSettingAliBlock";
export * from "./VectorMaskSettingAliBlock";
export * from "./VectorStrokeContentDataAliBlock";
export * from "./VectorStrokeDataAliBlock";
export * from "./ArtboardDataAliBlock";
export * from "./SmartObjectPlacedLayerDataAliBlock";
export * from "./LinkedLayerAliBlock";
export * from "./PatternAliBlock";

/**
 * Represents a single Additional Layer Info block ("ALI block").
 */
export type AdditionalLayerInfo =
  | SectionDividerSettingAliBlock
  | TypeToolObjectSettingAliBlock
  | UnicodeLayerNameAliBlock
  | VectorStrokeDataAliBlock
  | ObjectBasedEffectsAliBlock
  | GradientFillSettingAliBlock
  | SolidColorSheetSettingAliBlock
  | PatternFillSettingAliBlock
  | VectorStrokeContentDataAliBlock
  | VectorOriginationDataAliBlock
  | BlendOptionsCapacityAliBlock
  | VectorMaskSettingAliBlock
  | PatternFillSettingAliBlock
  | HueSaturationAliBlock
  | NestedSectionDividerSettingAliBlock
  | LayerIdAliBlock
  | ArtboardDataAliBlock
  | SmartObjectPlacedLayerDataAliBlock
  | LinkedLayerAliBlock
  | PatternAliBlock
  | UnknownAliBlock;
