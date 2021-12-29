// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {UnknownBlendingMode} from "../utils";

export enum BlendMode {
  PassThrough = "pass",
  Normal = "norm",
  Dissolve = "diss",
  Darken = "dark",
  Multiply = "mul ",
  ColorBurn = "idiv",
  LinearBurn = "lbrn",
  DarkerColor = "dkCl",
  Lighten = "lite",
  Screen = "scrn",
  ColorDodge = "div ",
  LinearDodge = "lddg",
  LighterColor = "lgCl",
  Overlay = "over",
  SoftLight = "sLit",
  HardLight = "hLit",
  VividLight = "vLit",
  LinearLight = "lLit",
  PinLight = "pLit",
  HardMix = "hMix",
  Difference = "diff",
  Exclusion = "smud",
  Subtract = "fsub",
  Divide = "fdiv",
  Hue = "hue ",
  Saturation = "sat ",
  Color = "colr",
  Luminosity = "lum ",
}

export function matchBlendMode(mode: string): BlendMode {
  const keys = Object.keys(BlendMode);
  for (const key of keys) {
    if (BlendMode[key as keyof typeof BlendMode] === mode) {
      return mode as BlendMode;
    }
  }

  throw new UnknownBlendingMode();
}
