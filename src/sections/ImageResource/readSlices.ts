// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {readVersionedDescriptor} from "../../methods";
import {
  matchSliceOrigin,
  SliceEntry,
  SlicesResourceBlock,
} from "../../interfaces";
import {Cursor, InvalidSlicesVersion} from "../../utils";

export function readSlices(
  cursor: Cursor,
  expectedEndPos: number
): SlicesResourceBlock["resource"] {
  const version = cursor.read("u32");

  if (version === 6) {
    const boundTop = cursor.read("i32");
    const boundLeft = cursor.read("i32");
    const boundBottom = cursor.read("i32");
    const boundRight = cursor.read("i32");
    const sliceGroupName = cursor.readUnicodeString(0);

    const sliceCount = cursor.read("u32");
    const slices: SliceEntry[] = [];
    while (slices.length < sliceCount) {
      const id = cursor.read("u32");
      const groupId = cursor.read("u32");
      const origin = matchSliceOrigin(cursor.read("u32"));
      const associatedLayerId = origin === 1 ? cursor.read("u32") : undefined;
      slices.push({
        id,
        groupId,
        origin,
        associatedLayerId,
        name: cursor.readUnicodeString(0),
        type: cursor.read("u32"),
        left: cursor.read("i32"),
        top: cursor.read("i32"),
        right: cursor.read("i32"),
        bottom: cursor.read("i32"),
        url: cursor.readUnicodeString(0),
        target: cursor.readUnicodeString(0),
        message: cursor.readUnicodeString(0),
        altTag: cursor.readUnicodeString(0),
        isCellTextHtml: Boolean(cursor.read("u8")),
        cellText: cursor.readUnicodeString(0),
        horizontalAlignment: cursor.read("i32"),
        verticalAlignment: cursor.read("i32"),
        alpha: cursor.read("u8"),
        red: cursor.read("u8"),
        green: cursor.read("u8"),
        blue: cursor.read("u8"),
      });
    }

    const descriptor =
      cursor.position < expectedEndPos
        ? readVersionedDescriptor(cursor)
        : undefined;

    return {
      version,
      boundTop,
      boundLeft,
      boundBottom,
      boundRight,
      sliceGroupName,
      slices,
      descriptor,
    };
  } else if (version === 7 || version === 8) {
    const descriptor = readVersionedDescriptor(cursor);
    return {version, descriptor};
  } else {
    throw new InvalidSlicesVersion(
      `Invalid Slices section version: ${version}`
    );
  }
}
