// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {benchmarkAgPsd, benchmarkPsdJs, benchmarkPsdTs} from "./bench";
import {BenchmarkTaskSetup, initialAppState} from "./model";
import "./style.css";
import {initialize, render} from "./views";

const benchmarkSetup: BenchmarkTaskSetup[] = [
  {
    libraryName: "@webtoon/psd",
    benchmarkCallback: (psdFileData) =>
      benchmarkPsdTs(psdFileData, {
        applyOpacity: appState.options.shouldApplyOpacity,
      }),
  },
  {
    libraryName: "PSD.js",
    benchmarkCallback: benchmarkPsdJs,
  },
  {
    libraryName: "ag-psd",
    benchmarkCallback: benchmarkAgPsd,
  },
];

let appState = initialAppState;

// Initial render
render(appState);
initialize({
  async onFileInputChange(file) {
    if (!file) return;

    try {
      appState = appState.start(benchmarkSetup, file);
      await raf(() => render(appState));

      while (appState.isRunning()) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await raf(() => {});
        appState = await appState.runNextSubtask();
        await raf(() => render(appState));
      }
    } catch (error) {
      appState = appState.setError(error);
      render(appState);
    }
  },

  onShouldApplyOpacityChange(shouldApplyOpacity) {
    appState = appState.updateOptions({shouldApplyOpacity});
    render(appState);
  },

  onTrialCountChange(trialCount) {
    appState = appState.updateOptions({trialCount});
    render(appState);
  },
});

/**
 * `window.requestAnimationFrame` promisified
 * @returns
 */
function raf<T>(task: () => T) {
  // eslint-disable-next-line compat/compat
  return new Promise<T>((resolve) =>
    window.requestAnimationFrame(() => resolve(task()))
  );
}
