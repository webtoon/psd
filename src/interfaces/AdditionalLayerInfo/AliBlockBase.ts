// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {AliKey} from "./AliKey";

/**
 * Base interface for Additional Layer Info blocks.
 * Individual ALI block interfaces should *not* extend this interface, but
 * extend {@link KnownAliBlock} instead.
 */
export interface AliBlockBase {
  signature: "8BIM" | "8B64";
  /** 4-character code */
  key: string;
  /**
   * A placeholder property used to distinguish {@link KnownAliBlock} subtypes
   * from {@link UnknownAliBlock}.
   */
  _isUnknown?: boolean;
}

/**
 * Base interface for Additional Layer Info blocks that @webtoon/psd can parse.
 * Individual ALI block interfaces must extend this interface.
 */
export interface KnownAliBlock<Key extends AliKey> extends AliBlockBase {
  key: Key;
  _isUnknown?: false;
}

/**
 * Interface for Additional Layer Info blocks that @webtoon/psd cannot parse.
 */
export interface UnknownAliBlock extends AliBlockBase {
  _isUnknown: true;
  /** Raw data of the ALI block */
  data: Uint8Array;
}
