// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

/**
 * Generates a random integer between 0 and {@link Number.MAX_SAFE_INTEGER}.
 */
export function randomSafeInt() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

/**
 * Sequentially calls an asynchronous callback {@link count} times, gathering
 * the return values into an array.
 * @param count
 * @param callback Asynchronous callback to execute.
 *    This will be called with the current step index (0...`count` - 1) as the
 *    only argument.
 * @returns Array with {@link count} return values
 */
export async function repeatAsync<T>(
  count: number,
  callback: (stepIndex: number) => Promise<T>
) {
  if (!(count >= 0)) {
    throw new Error(`count must be a nonnegative number (got ${count})`);
  }

  const result: T[] = [];
  for (let i = 0; i < count; ++i) {
    result.push(await callback(i));
  }
  return result;
}

export function sleepUntilNextAnimationFrame() {
  // eslint-disable-next-line compat/compat
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

/**
 * Throws an {@link Error} object with the given {@link message}.
 * This function is primarily used to throw an error inside an expression, since
 * JavaScript does not have "throw expressions".
 * @param message Error message to use.
 */
export function throwErr(message: string): never {
  throw new Error(message);
}
