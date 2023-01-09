// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  AdditionalLayerInfo,
  AliKey,
  FileVersionSpec,
} from "../../../interfaces";
import {Cursor, InvalidAdditionalLayerInfoSignature} from "../../../utils";
import {readArtboardDataAliBlock} from "./readArtboardDataAliBlock";
import {readBlendOptionsCapacityAliBlock} from "./readBlendOptionsCapacityAliBlock";
import {readGradientFillSettingAliBlock} from "./readGradientFillSettingAliBlock";
import {readHueSaturationAliBlock} from "./readHueSaturationAliBlock";
import {readLayerIdAliBlock} from "./readLayerIdAliBlock";
import {readLinkedLayerAliBlock} from "./readLinkedLayerAliBlock";
import {readObjectBasedEffectsAliBlock} from "./readObjectBasedEffectsAliBlock";
import {readPatternAliBlock} from "./readPatternAliBlock";
import {readPatternFillSettingAliBlock} from "./readPatternFillSettingAliBlock";
import {readSectionDividerSettingAliBlock} from "./readSectionDividerSettingAliBlock";
import {readSmartObjectPlacedLayerDataAliBlock} from "./readSmartObjectPlacedLayerDataAliBlock";
import {readSolidColorSheetSettingAliBlock} from "./readSolidColorSheetSettingAliBlock";
import {readTypeToolObjectSettingAliBlock} from "./readTypeToolObjectSettingAliBlock";
import {readUnicodeLayerNameAliBlock} from "./readUnicodeLayerNameAliBlock";
import {readVectorMaskSettingAliBlock} from "./readVectorMaskSettingAliBlock";
import {readVectorOriginationDataAliBLock} from "./readVectorOriginationDataAliBlock";
import {readVectorStrokeContentDataAliBlock} from "./readVectorStrokeContentDataAliBlock";
import {readVectorStrokeDataAliBlock} from "./readVectorStrokeDataAliBlock";

/**
 * Reads a single Additional Layer Information block from the current
 * {@link cursor} position.
 * @param cursor
 * @param fileVersionSpec
 * @param padding - dictates padding of the blocks. See f4fc9497d2826aeaed17910194dc9e8f7130ebe9
 */
export function readAdditionalLayerInfo(
  cursor: Cursor,
  fileVersionSpec: FileVersionSpec,
  padding = 0
): AdditionalLayerInfo {
  const signature = cursor.readString(4);

  if (signature !== "8BIM" && signature !== "8B64") {
    throw new InvalidAdditionalLayerInfoSignature(
      `Invalid signature: ${signature}`
    );
  }

  const key = cursor.readString(4);
  const size = cursor.read(getAliLengthFieldSizeType(key, fileVersionSpec));

  const prevPosition = cursor.position;

  const aliBlock = readAliBlockBody(cursor, signature, key, size);

  // Position the cursor at the end of the ALI block
  const remainingBytes = size - (cursor.position - prevPosition);
  cursor.pass(remainingBytes);
  cursor.padding(size, padding);

  return aliBlock;
}

/**
 * Reads an Additional Layer Info block, but does not align the cursor.
 * @param cursor
 * @param key
 * @param size Size of the ALI block body in bytes
 */
function readAliBlockBody(
  cursor: Cursor,
  signature: AdditionalLayerInfo["signature"],
  key: AdditionalLayerInfo["key"],
  size: number
): AdditionalLayerInfo {
  switch (key) {
    case AliKey.NestedSectionDividerSetting:
    case AliKey.SectionDividerSetting:
      return {
        signature,
        key,
        ...readSectionDividerSettingAliBlock(cursor, size),
      };
    case AliKey.TypeToolObjectSetting:
      return {signature, key, ...readTypeToolObjectSettingAliBlock(cursor)};
    case AliKey.UnicodeLayerName:
      return {signature, key, ...readUnicodeLayerNameAliBlock(cursor)};
    case AliKey.VectorStrokeData:
      return {signature, key, ...readVectorStrokeDataAliBlock(cursor)};
    case AliKey.ObjectBasedEffects:
      return {signature, key, ...readObjectBasedEffectsAliBlock(cursor)};
    case AliKey.GradientFillSetting:
      return {signature, key, ...readGradientFillSettingAliBlock(cursor)};
    case AliKey.SolidColorSheetSetting:
      return {signature, key, ...readSolidColorSheetSettingAliBlock(cursor)};
    case AliKey.PatternFillSetting:
      return {signature, key, ...readPatternFillSettingAliBlock(cursor)};
    case AliKey.VectorStrokeContentData:
      return {signature, key, ...readVectorStrokeContentDataAliBlock(cursor)};
    case AliKey.VectorOriginationData:
      return {signature, key, ...readVectorOriginationDataAliBLock(cursor)};
    case AliKey.BlendOptionsCapacity:
      return {signature, key, ...readBlendOptionsCapacityAliBlock(cursor)};
    case AliKey.VectorMaskSetting1:
    case AliKey.VectorMaskSetting2:
      return {signature, key, ...readVectorMaskSettingAliBlock(cursor, size)};
    case AliKey.Pattern1:
    case AliKey.Pattern2:
    case AliKey.Pattern3:
      return {signature, key, ...readPatternAliBlock(cursor, size)};
    case AliKey.HueSaturation:
      return {signature, key, ...readHueSaturationAliBlock(cursor)};
    case AliKey.LayerId:
      return {signature, key, ...readLayerIdAliBlock(cursor)};
    case AliKey.ArtboardData:
      return {signature, key, ...readArtboardDataAliBlock(cursor)};
    case AliKey.PlacedLayerData:
    case AliKey.SmartObjectPlacedLayerData:
      return {
        signature,
        key,
        ...readSmartObjectPlacedLayerDataAliBlock(cursor),
      };
    case AliKey.LinkedLayer:
    case AliKey.LinkedLayer2:
    case AliKey.LinkedLayer3:
      return {
        signature,
        key,
        ...readLinkedLayerAliBlock(cursor, size),
      };
    default: {
      const data = cursor.take(size);
      return {signature, key, _isUnknown: true, data};
    }
  }
}

function getAliLengthFieldSizeType(
  key: string,
  fileVersionSpec: FileVersionSpec
): "u32" | "u64" {
  if (fileVersionSpec.aliLengthFieldSizeIsVariable) {
    switch (key) {
      case "LMsk":
      case "Lr16":
      case "Lr32":
      case "Layr":
      case "Mt16":
      case "Mt32":
      case "Mtrn":
      case "Alph":
      case "FMsk":
      case "Ink2":
      case "FEid":
      case "FXid":
      case "PxSD":
      case "cinf": // Undocumented in Adobe's docs
        return "u64";
    }
  }

  return "u32";
}
