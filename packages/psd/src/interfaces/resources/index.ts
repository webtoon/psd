// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

export * from "./GridAndGuidesResourceBlock";
export * from "./ResourceType";
export * from "./SlicesResourceBlock";
export * from "./UnknownResourceBlock";
export * from "./ICCProfileResourceBlock";
export * from "./GlobalLight";
export * from "./ResolutionInfo";

import {GridAndGuidesResourceBlock} from "./GridAndGuidesResourceBlock";
import {SlicesResourceBlock} from "./SlicesResourceBlock";
import {UnknownResourceBlock} from "./UnknownResourceBlock";
import {ICCProfileResourceBlock} from "./ICCProfileResourceBlock";
import {GlobalLightResourceBlock} from "./GlobalLight";
import {ResolutionInfoResourceBlock} from "./ResolutionInfo";

export type ImageResourceBlock =
  | GridAndGuidesResourceBlock
  | SlicesResourceBlock
  | ICCProfileResourceBlock
  | GlobalLightResourceBlock
  | ResolutionInfoResourceBlock
  | UnknownResourceBlock;
