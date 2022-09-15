// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ObjectBasedEffectsAliBlock} from "../../../interfaces";
import {readDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readObjectBasedEffectsAliBlock(
  cursor: Cursor
): AliBlockBody<ObjectBasedEffectsAliBlock> {
  const version = cursor.read("u32");
  const descriptorVersion = cursor.read("u32");
  const descriptor = readDescriptor(cursor);
  return {version, descriptor, descriptorVersion};
}
