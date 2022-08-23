// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

export * from "./GridAndGuidesResourceBlock";
export * from "./ResourceType";
export * from "./SlicesResourceBlock";
export * from "./UnknownResourceBlock";
export * from "./ICCProfileResourceBlock";

import {GridAndGuidesResourceBlock} from "./GridAndGuidesResourceBlock";
import {SlicesResourceBlock} from "./SlicesResourceBlock";
import {UnknownResourceBlock} from "./UnknownResourceBlock";
import {ICCProfileResourceBlock} from "./ICCProfileResourceBlock";

export type ImageResourceBlock =
  | GridAndGuidesResourceBlock
  | SlicesResourceBlock
  | ICCProfileResourceBlock
  | UnknownResourceBlock;
