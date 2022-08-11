// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ImageResourceBlock, ResourceType} from "../../interfaces";
import {Cursor, equals, InvalidResourceSignature} from "../../utils";
import {readGridAndGuides} from "./readGridAndGuides";
import {readICCProfile} from "./readICCProfile";
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
  const name = readPascalString(cursor, 2);

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

/**
 * Parses a "Pascal string", as described in Adobe's documentation.
 * A Pascal string is structured as:
 *
 * | Size (bytes) |         Content        |
 * |--------------|------------------------|
 * | 1            | Length                 |
 * | 0 ~ 255      | Characters             |
 * | 0 ~ ?        | Alignment (whitespace) |
 *
 * If {@link alignment} is provided, this function _may_ skip alignment bytes
 * until the total of (length field) + (characters) + (alignment) is a multiple
 * of the `alignment` value.
 * If `alignment` is unspecified or 0, no alignment bytes are skipped.
 */
function readPascalString(cursor: Cursor, alignment = 0): string {
  const length = cursor.read("u8");
  const value = cursor.readString(length);

  if (alignment) {
    const remainder = (length + 1) % alignment;
    if (remainder > 0) {
      cursor.pass(alignment - remainder);
    }
  }

  return value;
}
