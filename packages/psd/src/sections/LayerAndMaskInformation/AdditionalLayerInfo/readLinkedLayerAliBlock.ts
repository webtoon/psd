// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {LinkedLayer, LinkedLayerAliBlock} from "../../../interfaces";
import {readVersionedDescriptor} from "../../../methods";
import {Cursor, InvalidLinkedLayerType} from "../../../utils";
import {AliBlockBody} from "./AliBlockBody";

export function readLinkedLayerAliBlock(
  cursor: Cursor,
  size: number
): AliBlockBody<LinkedLayerAliBlock> {
  const layers = [];
  let nextFileLength = 0;
  const endAt = cursor.position + size;
  while (cursor.position < endAt && (nextFileLength = cursor.read("u64"))) {
    const position = cursor.position;
    const layer = readLayer(cursor);
    layers.push(layer);
    const advancedSoFar = cursor.position - position;
    const undocumentedDataLength = nextFileLength - advancedSoFar;
    cursor.pass(undocumentedDataLength);
    cursor.padding(cursor.position, 4);
  }
  return {layers};
}

function readLayer(cursor: Cursor): LinkedLayer {
  const layerType = cursor.readString(4);
  if (layerType !== "liFD") {
    throw new InvalidLinkedLayerType(`unknown layer type: '${layerType}'`);
  }

  const version = cursor.read("i32");
  const uniqueId = readUniqueId(cursor);
  const filename = cursor.readUnicodeString(0);
  const filetype = cursor.readString(4);
  const creator = cursor.readString(4);
  const filelength = cursor.read("u64");
  const haveFileOpenDescriptor = cursor.read("u8");
  const data = haveFileOpenDescriptor
    ? readVersionedDescriptor(cursor)
    : undefined;
  const contents = cursor.take(filelength);
  const uuid = version > 5 ? cursor.readUnicodeString() : undefined;
  return {
    layerType,
    version,
    uniqueId,
    filename,
    filetype,
    creator,
    data,
    contents,
    uuid,
  };
}

function readUniqueId(cursor: Cursor): string {
  const uniqueIDLength = cursor.read("u8");
  return cursor.readString(uniqueIDLength);
}
