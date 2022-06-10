// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

export const equals = (
  compare: number[] | Uint8Array,
  target: number[] | Uint8Array
): boolean => {
  const length = Math.max(compare.length, target.length);
  for (let i = 0; i < length; i++) {
    if (compare[i] !== target[i]) {
      return false;
    }
  }

  return true;
};
