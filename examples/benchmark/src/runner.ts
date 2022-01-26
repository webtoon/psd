// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {BenchmarkResult} from "./bench";
import {repeatAsync, sleepUntilNextAnimationFrame} from "./util";

/**
 * Calls a benchmark callback multiple times, collecting all return values into
 * an array.
 * @param benchmarkCallback Benchmark callback to execute
 * @param opts
 * @returns Promise that resolves to an array of values returned by each call to
 *    {@link benchmarkCallback()}
 */
export function runBenchmark<T>(
  benchmarkCallback: () => T,
  opts?: {
    /** Number of times to call the benchmark callback. Defaults to 1. */
    count?: number;
    /** Callback to run before each execution of {@link benchmarkCallback} */
    beforeEach?: (step: number) => void;
    /**
     * Callback to run when the benchmark callback throws an exception.
     * (If this callback returns normally, the error is rethrown)
     */
    onError?: (error: unknown) => void;
  }
) {
  return repeatAsync(opts?.count ?? 1, async (step) => {
    opts?.beforeEach?.(step);

    try {
      // Force the browser to flush DOM changes before and after executing the
      // long-running callback
      await sleepUntilNextAnimationFrame();
      const result = benchmarkCallback();
      await sleepUntilNextAnimationFrame();

      return result;
    } catch (error) {
      if (opts?.onError) {
        opts.onError(error);
      }
      throw error;
    }
  });
}

export function getAverageResult(
  results: readonly Readonly<BenchmarkResult>[]
): BenchmarkResult {
  const sums = results.reduce<BenchmarkResult>(
    (sums, current) => {
      sums.parseTime += current.parseTime;
      sums.imageRenderTime += current.imageRenderTime;
      sums.layerRenderTime += current.layerRenderTime;
      return sums;
    },
    {
      parseTime: 0,
      imageRenderTime: 0,
      layerRenderTime: 0,
    }
  );

  return {
    parseTime: sums.parseTime / results.length,
    imageRenderTime: sums.imageRenderTime / results.length,
    layerRenderTime: sums.layerRenderTime / results.length,
  };
}
