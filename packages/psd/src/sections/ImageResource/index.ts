// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ImageResourceBlock, ResourceType} from "../../interfaces";
import {Cursor, equals, InvalidResourceSignature} from "../../utils";
import {readGridAndGuides} from "./readGridAndGuides";
import {readICCProfile} from "./readICCProfile";
import {readResolutionInfo} from "./readResolutionInfo";
import {readSlices} from "./readSlices";

const EXPECTED_RESOURCE_BLOCK_SIGNATURE = [56, 66, 73, 77];

export type ImageResourcesSection = {
  resources: ImageResourceBlock[];
};

export function parseImageResource(dataView: DataView): ImageResourcesSection {
  const cursor = new Cursor(dataView);
  const resources: ImageResourceBlock[] = [];

  const length = cursor.read("u32");
  while (cursor.position < length) {
    const block = readResourceBlock(cursor);

    resources.push(block);
  }

  return {resources};
}

function readResourceBlock(cursor: Cursor): ImageResourceBlock {
  const signature = cursor.take(4);
  if (!equals(signature, EXPECTED_RESOURCE_BLOCK_SIGNATURE)) {
    throw new InvalidResourceSignature();
  }

  const id = cursor.read("i16");
  const name = cursor.readPascalString(2);

  const dataLength = cursor.read("u32");
  const expectedDataEnd = cursor.position + dataLength;
  // Note: data length is padded to even.
  const paddedDataLength = dataLength + (dataLength % 2);

  const dataBegin = cursor.position;

  let resource: ImageResourceBlock["resource"] = null;

  switch (id) {
    case ResourceType.GridAndGuides:
      resource = readGridAndGuides(cursor);
      break;
    case ResourceType.Slices:
      resource = readSlices(cursor, expectedDataEnd);
      break;
    case ResourceType.ICCProfile:
      resource = readICCProfile(cursor, expectedDataEnd);
      break;
    case ResourceType.ResolutionInfo:
      resource = readResolutionInfo(cursor);
      break;
    case ResourceType.GlobalLightAltitude:
      resource = cursor.read("i32");
      break;
    case ResourceType.GlobalLightAngle:
      resource = cursor.read("i32");
      break;
    default:
    // For now, ignore resource types that we don't support;
    // there are too many, and we can't support all of them now.
  }

  const dataEnd = cursor.position;
  const remainingBytes = dataBegin + paddedDataLength - dataEnd;
  if (remainingBytes > 0) {
    cursor.pass(remainingBytes);
  }

  return {id, name, resource};
}
