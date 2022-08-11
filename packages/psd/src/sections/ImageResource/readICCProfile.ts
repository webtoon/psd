// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ICCProfileResourceBlock} from "../../interfaces";
import {Cursor} from "../../utils";

export function readICCProfile(
  cursor: Cursor,
  expectedEndPos: number
): ICCProfileResourceBlock["resource"] {
  return cursor.take(expectedEndPos - cursor.position);
}
