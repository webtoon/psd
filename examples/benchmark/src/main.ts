// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {benchmarkAgPsd, benchmarkPsdJs, benchmarkPsdTs} from "./bench";
import {getAverageResult, runBenchmark} from "./runner";
import "./style.css";
import {sleepUntilNextAnimationFrame} from "./util";
import {
  getProgress,
  getRepeatCount,
  getShouldApplyOpacityWhenDecoding,
  observeFileInputChange,
  resetFileInput,
  setBenchmarkToCompleted,
  setBenchmarkToHalted,
  setBenchmarkToRunning,
  setControlPanelActive,
  setErrorMessage,
  setProgress,
  setProgressMessage,
} from "./view";

function incrementProgress(value: number) {
  const current = getProgress();
  if (typeof current === "number") {
    setProgress(current + value);
  }
}

observeFileInputChange(async (file) => {
  if (!file) return;

  try {
    setControlPanelActive(false);
    setBenchmarkToRunning();

    // Repeat benchmark for each library, plus one step to load the file
    const repeatCount = getRepeatCount();
    const totalStepCount = repeatCount * 3 + 1;

    const shouldApplyOpacityWhenDecoding = getShouldApplyOpacityWhenDecoding();

    await sleepUntilNextAnimationFrame();

    setBenchmarkToRunning();
    setProgress(0);
    setProgressMessage(`Loading file... (size: ${file.size} bytes)`);
    setErrorMessage(null);

    await sleepUntilNextAnimationFrame();
    const arrayBuffer = await file.arrayBuffer();
    await sleepUntilNextAnimationFrame();

    const psdTsResults = getAverageResult(
      await runBenchmark(
        () =>
          benchmarkPsdTs(arrayBuffer, {
            applyOpacity: shouldApplyOpacityWhenDecoding,
          }),
        {
          count: repeatCount,
          beforeEach: (step) => {
            incrementProgress(1 / totalStepCount);
            setProgressMessage(
              `Parsing with @webtoon/psd... (${step + 1} / ${repeatCount})`
            );
          },
          onError: () =>
            setErrorMessage("@webtoon/psd failed to parse the file"),
        }
      )
    );

    const psdJsResults = getAverageResult(
      await runBenchmark(() => benchmarkPsdJs(arrayBuffer), {
        count: repeatCount,
        beforeEach: (step) => {
          incrementProgress(1 / totalStepCount);
          setProgressMessage(
            `Parsing with PSD.js... (${step + 1} / ${repeatCount})`
          );
        },
        onError: () => setErrorMessage("PSD.js failed to parse the file"),
      })
    );

    const agPsdResults = getAverageResult(
      await runBenchmark(() => benchmarkAgPsd(arrayBuffer), {
        count: repeatCount,
        beforeEach: (step) => {
          incrementProgress(1 / totalStepCount);
          setProgressMessage(
            `Parsing with ag-psd... (${step + 1} / ${repeatCount})`
          );
        },
        onError: () => setErrorMessage("ag-psd failed to parse the file"),
      })
    );

    setProgress(1); // Just in case progress does not add up to a perfect 1
    setProgressMessage(`Finished parsing ${file.name}`);
    setBenchmarkToCompleted({
      categories: [
        "Metadata",
        "Decoding (merged image)",
        "Decoding (all layers)",
      ],
      measurements: [
        {
          parserName: "@webtoon/psd",
          values: [
            psdTsResults.parseTime,
            psdTsResults.imageRenderTime,
            psdTsResults.layerRenderTime,
          ],
        },
        {
          parserName: "PSD.js",
          values: [
            psdJsResults.parseTime,
            psdJsResults.imageRenderTime,
            psdJsResults.layerRenderTime,
          ],
        },
        {
          parserName: "ag-psd",
          values: [
            agPsdResults.parseTime,
            agPsdResults.imageRenderTime,
            agPsdResults.layerRenderTime,
          ],
        },
      ],
    });

    resetFileInput();
  } catch (e) {
    console.error(e);
    setBenchmarkToHalted();
  } finally {
    setControlPanelActive(true);
  }
});
