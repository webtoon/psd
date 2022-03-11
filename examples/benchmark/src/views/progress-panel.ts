// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import type {AppState} from "../model";
import {findElement} from "./common";

export function renderProgressPanel(appState: AppState) {
  const progressBar = findElement<HTMLProgressElement>(
    "progress#progressbar",
    "progressbar element"
  );

  if (appState.psdFileName === null) {
    // Show indeterminate status on initial load
    progressBar.removeAttribute("value");
  } else {
    progressBar.value = appState.getProgress();
  }

  if (appState.isRunning() || appState.error !== null) {
    const currentTask = appState.getCurrentTask();

    if (currentTask.taskType === "LoadFileTask") {
      setProgressMessage(
        `Loading file... (size: ${currentTask.file.size} bytes)`
      );
    } else {
      const trialCount = appState.options.trialCount;
      const nextTrialNumber = trialCount - currentTask.remainingTrialCount + 1;
      setProgressMessage(
        `Parsing with ${currentTask.libraryName}... (${nextTrialNumber} / ${trialCount})`
      );
    }
  } else if (appState.isComplete() && appState.benchmarkResults.length > 0) {
    setProgressMessage(`Finished parsing ${appState.psdFileName}`);
  } else {
    setProgressMessage("Select a file");
  }
}

function setProgressMessage(message: string) {
  const progressMessageEl = findElement<Element>(
    ".progress-panel__description",
    "progress message element"
  );

  progressMessageEl.textContent = message;
}
