// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {UnicodeLayerNameAliBlock} from "../../../interfaces";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

/**
 * Parses a partial {@link UnicodeLayerNameAliBlock} from the current
 * {@link cursor} position.
 * @param cursor
 */
export function readUnicodeLayerNameAliBlock(
  cursor: Cursor
): AliBlockBody<UnicodeLayerNameAliBlock> {
  const name = cursor.readUnicodeString(0);
  return {name};
}
