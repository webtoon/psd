// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  AdditionalLayerInfo,
  AliKey,
  FileVersionSpec,
} from "../../../interfaces";
import {Cursor, InvalidAdditionalLayerInfoSignature} from "../../../utils";
import {readSectionDividerSettingAliBlock} from "./readSectionDividerSettingAliBlock";
import {readTypeToolObjectSettingAliBlock} from "./readTypeToolObjectSettingAliBlock";
import {readUnicodeLayerNameAliBlock} from "./readUnicodeLayerNameAliBlock";

/**
 * Reads a single Additional Layer Information block from the current
 * {@link cursor} position.
 * @param cursor
 */
export function readAdditionalLayerInfo(
  cursor: Cursor,
  fileVersionSpec: FileVersionSpec
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

  // AdditionalLayerInfo blocks are aligned to a multiple of 4 bytes
  // (Undocumented in Adobe's docs)
  cursor.padding(size, 4);

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
