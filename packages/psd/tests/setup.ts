// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import fsPromises from "fs/promises";
import {mockFetch, mockGet} from "vi-fetch";
// eslint-disable-next-line import/no-unresolved
import "vi-fetch/setup";
import {beforeEach} from "vitest";

const WASM_MODULE_PROMISE = fsPromises
  .readFile("./rust-wasm/pkg/webtoon_psd_bg.wasm")
  .then(({buffer}) => buffer);

beforeEach(async () => {
  mockFetch.clearAll();

  const wasmModule = await WASM_MODULE_PROMISE;
  mockGet("/rust-wasm/pkg/webtoon_psd_bg.wasm").willResolve(wasmModule);
});
