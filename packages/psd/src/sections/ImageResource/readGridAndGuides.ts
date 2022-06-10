// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  GridAndGuidesResourceBlock,
  Guide,
  matchGuideDirection,
} from "../../interfaces";
import {Cursor, InvalidGridAndGuidesVersion} from "../../utils";

export function readGridAndGuides(
  cursor: Cursor
): GridAndGuidesResourceBlock["resource"] {
  const version = cursor.read("u32");
  if (version !== 1) {
    throw new InvalidGridAndGuidesVersion();
  }

  const gridSizeX = cursor.read("u32");
  const gridSizeY = cursor.read("u32");

  const guideCount = cursor.read("u32");

  const guides: Guide[] = [];
  for (let i = 0; i < guideCount; ++i) {
    const position = cursor.read("i32");
    const direction = matchGuideDirection(cursor.read("u8"));

    guides.push({position, direction});
  }

  return {version, gridSizeX, gridSizeY, guides};
}
