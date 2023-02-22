// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ObjectBasedUndocumentedAliBlock} from "../../../interfaces";
import {readDescriptor} from "../../../methods";
import {Cursor} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readObjectBasedUndocumentedAliBlock(
  cursor: Cursor
): AliBlockBody<ObjectBasedUndocumentedAliBlock> {
  const version = cursor.read("u32");
  const descriptorVersion = cursor.read("u32");
  const descriptor = readDescriptor(cursor);
  return {version, descriptor, descriptorVersion};
}
