// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {InvalidClipping} from "../utils";

export enum Clipping {
  Base = 0,
  NonBase = 1,
}

export function matchClipping(mode: number): Clipping {
  if (mode === Clipping.Base) return Clipping.Base;
  if (mode === Clipping.NonBase) return Clipping.NonBase;

  throw new InvalidClipping();
}
