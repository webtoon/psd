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

async function runBenchmark() {
  await raf(() => render(appState));

  while (appState.isRunning()) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await raf(() => {});
    appState = await appState.runNextSubtask();
    await raf(() => render(appState));
  }
}

// Initial render
render(appState);
initialize({
  onUseDefaultPsdCheckboxClick() {
    appState = appState.updateOptions({preferDefaultPsd: true});
    render(appState);
  },
  onUseUploadedPsdCheckboxClick() {
    appState = appState.updateOptions({preferDefaultPsd: false});
    render(appState);
  },

  async onFileInputChange(file) {
    if (!file) return;

    try {
      appState = appState.start(benchmarkSetup, file);
      runBenchmark();
    } catch (error) {
      appState = appState.setError(error);
      render(appState);
    }
  },

  async onUseDefaultPsdFileButtonClick() {
    if (!appState.defaultPsdFileData) {
      appState = appState.setError("Default PSD file not loaded yet");
      render(appState);
      return;
    }

    try {
      appState = appState.startWithDefaultPsdFile(benchmarkSetup);
      runBenchmark();
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

// Load default PSD file
(async () => {
  try {
    appState = await appState.loadDefaultPsdFile();
    render(appState);
  } catch (error) {
    appState = appState.setError(error);
    render(appState);
  }
})();

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
