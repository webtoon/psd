// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

type AnyCallback = (...args: never[]) => void;
type NonCallbackKeys<T> = {
  [K in keyof T]: T[K] extends AnyCallback ? never : K;
}[keyof T];
type OmitCallbacks<
  T,
  AdditionalKeys extends keyof T = never,
  RemoveKeys extends keyof T = never
> = Pick<T, Exclude<NonCallbackKeys<T> | AdditionalKeys, RemoveKeys>>;

export type BenchmarkCallback = (
  psdFileData: ArrayBuffer
) => BenchmarkMeasurements | Promise<BenchmarkMeasurements>;

export type BenchmarkTaskSetup = Readonly<{
  libraryName: string;
  benchmarkCallback: BenchmarkCallback;
}>;

type AppStateProperties = OmitCallbacks<AppState>;

// TODO: There needs to be an extra type of task: LoadPsdFileTask
export class AppState {
  readonly tasks: readonly Task[];
  readonly benchmarkResults: readonly BenchmarkResult[];
  readonly currentTaskTrialMeasurements: readonly BenchmarkMeasurements[];
  readonly options: BenchmarkOptions;
  readonly psdFileName: string | null;
  readonly psdFileData: ArrayBuffer | null;
  readonly error: string | null;
  readonly defaultPsdFileUrl: URL;
  readonly defaultPsdFileData: ArrayBuffer | null;

  constructor({
    tasks,
    benchmarkResults,
    currentTaskTrialMeasurements,
    options,
    psdFileData,
    psdFileName,
    error,
    defaultPsdFileUrl,
    defaultPsdFileData,
  }: AppStateProperties) {
    this.tasks = Object.freeze([...tasks]);
    this.benchmarkResults = Object.freeze([...benchmarkResults]);
    this.currentTaskTrialMeasurements = Object.freeze([
      ...currentTaskTrialMeasurements,
    ]);
    this.options = options;
    this.psdFileName = psdFileName;
    this.psdFileData = psdFileData;
    this.error = error;
    this.defaultPsdFileUrl = defaultPsdFileUrl;
    this.defaultPsdFileData = defaultPsdFileData;

    Object.freeze(this);
  }

  #update(properties: Partial<AppStateProperties>) {
    const {
      tasks = this.tasks,
      benchmarkResults = this.benchmarkResults,
      currentTaskTrialMeasurements = this.currentTaskTrialMeasurements,
      options = this.options,
      psdFileData = this.psdFileData,
      psdFileName = this.psdFileName,
      error = this.error,
      defaultPsdFileUrl = this.defaultPsdFileUrl,
      defaultPsdFileData = this.defaultPsdFileData,
    } = properties;
    return new AppState({
      tasks,
      benchmarkResults,
      currentTaskTrialMeasurements,
      options,
      psdFileData,
      psdFileName,
      error,
      defaultPsdFileUrl,
      defaultPsdFileData,
    });
  }

  isRunning() {
    return this.error === null && this.tasks.length > 0;
  }

  isComplete() {
    return this.error === null && this.tasks.length === 0;
  }

  getCompletedSubtaskCount() {
    return (
      (this.psdFileData !== null ? 1 : 0) +
      this.currentTaskTrialMeasurements.length +
      this.benchmarkResults.length * this.options.trialCount
    );
  }

  getRemainingSubtaskCount() {
    let subtaskCount = 0;
    for (const task of this.tasks) {
      subtaskCount +=
        task.taskType === "BenchmarkTask" ? task.remainingTrialCount : 1;
    }
    return subtaskCount;
  }

  getTotalSubtaskCount() {
    return this.getRemainingSubtaskCount() + this.getCompletedSubtaskCount();
  }

  getProgress() {
    return this.getCompletedSubtaskCount() / this.getTotalSubtaskCount();
  }

  getCurrentTask() {
    const currentTask = this.tasks[0];
    if (!currentTask) {
      throw new Error("Task queue is empty");
    }
    return currentTask;
  }

  /** Start a new run */
  start(setups: readonly BenchmarkTaskSetup[], psdFile: File) {
    const tasks = [
      new LoadFileTask(psdFile),
      ...setups.map(
        (setup) =>
          new BenchmarkTask({
            libraryName: setup.libraryName,
            benchmarkCallback: setup.benchmarkCallback,
            remainingTrialCount: this.options.trialCount,
          })
      ),
    ];
    return this.#update({
      tasks,
      currentTaskTrialMeasurements: [],
      benchmarkResults: [],
      psdFileName: psdFile.name,
      psdFileData: null,
      error: null,
    });
  }

  startWithDefaultPsdFile(setups: readonly BenchmarkTaskSetup[]) {
    if (!this.defaultPsdFileData) {
      throw new Error("Default PSD file has not been loaded yet");
    }

    return this.#update({
      tasks: setups.map(
        (setup) =>
          new BenchmarkTask({
            libraryName: setup.libraryName,
            benchmarkCallback: setup.benchmarkCallback,
            remainingTrialCount: this.options.trialCount,
          })
      ),
      currentTaskTrialMeasurements: [],
      benchmarkResults: [],
      psdFileName: this.defaultPsdFileUrl.pathname,
      psdFileData: this.defaultPsdFileData,
      error: null,
    });
  }

  async runNextSubtask() {
    if (!this.isRunning()) {
      throw new Error("Cannot run next trial because the app has halted");
    }

    const [currentTask, ...nextTasks] = this.tasks;

    if (currentTask.taskType === "LoadFileTask") {
      const psdFileData = await currentTask.file.arrayBuffer();
      return this.#update({tasks: nextTasks, psdFileData});
    }

    // Handle BenchmarkTask

    if (!this.psdFileData) {
      throw new Error("Cannot run benchmark, PSD file data is not ready");
    }

    const [trialMeasurement, updatedTask] = await currentTask.runTrial(
      this.psdFileData
    );

    const updatedTrialMeasurements = [
      ...this.currentTaskTrialMeasurements,
      trialMeasurement,
    ];
    if (updatedTask) {
      // There are remaining trials in the current (updated) task
      const updatedTasksToRun = [updatedTask, ...nextTasks];
      return this.#update({
        tasks: updatedTasksToRun,
        currentTaskTrialMeasurements: updatedTrialMeasurements,
      });
    } else {
      // Current task has finished. Evict it from the queue and combine results
      const updatedTaskResults = [
        ...this.benchmarkResults,
        combineTrialMeasurements(
          currentTask.libraryName,
          updatedTrialMeasurements
        ),
      ];
      return this.#update({
        tasks: nextTasks,
        currentTaskTrialMeasurements: [],
        benchmarkResults: updatedTaskResults,
      });
    }
  }

  updateOptions(newOptions: Partial<BenchmarkOptionsProperties>) {
    if (this.isRunning()) {
      throw new Error(`Cannot change options while running`);
    }

    const {
      trialCount = this.options.trialCount,
      shouldApplyOpacity = this.options.shouldApplyOpacity,
      preferDefaultPsd = this.options.preferDefaultPsd,
    } = newOptions;

    return this.#update({
      options: new BenchmarkOptions({
        trialCount,
        shouldApplyOpacity,
        preferDefaultPsd,
      }),
    });
  }

  setError(error: unknown) {
    return this.#update({
      error: error === null ? error : String(error),
    });
  }

  async loadDefaultPsdFile() {
    if (this.defaultPsdFileData) {
      throw new Error(`${this.defaultPsdFileUrl} has already been loaded`);
    }

    // eslint-disable-next-line compat/compat
    const response = await fetch(String(this.defaultPsdFileUrl));
    return this.#update({
      defaultPsdFileData: await response.arrayBuffer(),
    });
  }
}

export const initialAppState = new AppState({
  tasks: [],
  benchmarkResults: [],
  currentTaskTrialMeasurements: [],
  options: {trialCount: 3, shouldApplyOpacity: false, preferDefaultPsd: true},
  psdFileName: null,
  psdFileData: null,
  error: null,
  // Webpack will resolve this as a resource asset
  // eslint-disable-next-line compat/compat
  defaultPsdFileUrl: new URL("/example.psd", import.meta.url),
  defaultPsdFileData: null,
});

export type Task = LoadFileTask | BenchmarkTask;

class LoadFileTask {
  readonly taskType = "LoadFileTask";
  readonly file: File;

  constructor(file: File) {
    this.file = file;

    Object.freeze(this);
  }
}

type BenchmarkTaskProperties = OmitCallbacks<
  BenchmarkTask,
  "benchmarkCallback",
  "taskType"
>;

class BenchmarkTask {
  readonly taskType = "BenchmarkTask";
  readonly libraryName: string;
  readonly benchmarkCallback: BenchmarkCallback;
  readonly remainingTrialCount: number;

  constructor({
    libraryName,
    benchmarkCallback,
    remainingTrialCount,
  }: BenchmarkTaskProperties) {
    if (
      !(Number.isSafeInteger(remainingTrialCount) && remainingTrialCount > 0)
    ) {
      throw new Error(
        `remainingTrialCount must be a positive safe integer (got ${remainingTrialCount})`
      );
    }

    this.libraryName = libraryName;
    this.benchmarkCallback = benchmarkCallback;
    this.remainingTrialCount = remainingTrialCount;

    Object.freeze(this);
  }

  /**
   * Run a trial and return a tuple of `[trialMeasurement, updatedTask]`.
   * `updatedTask` may be `null` if this is the last trial for this task.
   */
  async runTrial(psdFileData: ArrayBuffer) {
    const trialMeasurement = await this.benchmarkCallback(psdFileData);
    const updatedTask =
      this.remainingTrialCount === 1
        ? null
        : new BenchmarkTask({
            libraryName: this.libraryName,
            benchmarkCallback: this.benchmarkCallback,
            remainingTrialCount: this.remainingTrialCount - 1,
          });
    return [trialMeasurement, updatedTask] as const;
  }
}

export class BenchmarkResult {
  readonly libraryName: string;
  readonly measurements: BenchmarkMeasurements;

  constructor({libraryName, measurements}: OmitCallbacks<BenchmarkResult>) {
    this.libraryName = libraryName;
    this.measurements = measurements;
  }
}

export class BenchmarkMeasurements {
  readonly parseTime: number;
  readonly imageDecodeTime: number;
  readonly layerDecodeTime: number;

  constructor({
    parseTime,
    imageDecodeTime,
    layerDecodeTime,
  }: OmitCallbacks<BenchmarkMeasurements>) {
    if (!(parseTime >= 0)) {
      throw new Error(
        `parseTime must be a nonnegative number (got ${parseTime})`
      );
    }
    if (!(imageDecodeTime >= 0)) {
      throw new Error(
        `imageDecodeTime must be a nonnegative number (got ${imageDecodeTime})`
      );
    }
    if (!(layerDecodeTime >= 0)) {
      throw new Error(
        `layerDecodeTime must be a nonnegative number (got ${layerDecodeTime})`
      );
    }

    this.parseTime = parseTime;
    this.imageDecodeTime = imageDecodeTime;
    this.layerDecodeTime = layerDecodeTime;

    Object.freeze(this);
  }
}

function combineTrialMeasurements(
  libraryName: string,
  trialMeasurements: readonly BenchmarkMeasurements[]
) {
  if (!(trialMeasurements.length > 0)) {
    throw new Error(`trialMeasurements is empty`);
  }

  let totalParseTime = 0;
  let totalImageDecodeTime = 0;
  let totalLayerDecodeTime = 0;

  for (const result of trialMeasurements) {
    totalParseTime += result.parseTime;
    totalImageDecodeTime += result.imageDecodeTime;
    totalLayerDecodeTime += result.layerDecodeTime;
  }

  // Compute average of all measurements
  return new BenchmarkResult({
    libraryName,
    measurements: new BenchmarkMeasurements({
      parseTime: totalParseTime / trialMeasurements.length,
      imageDecodeTime: totalImageDecodeTime / trialMeasurements.length,
      layerDecodeTime: totalLayerDecodeTime / trialMeasurements.length,
    }),
  });
}

export class BenchmarkOptions {
  readonly trialCount: number;
  /** Whether to apply opacity when decoding image data */
  readonly shouldApplyOpacity: boolean;
  readonly preferDefaultPsd: boolean;

  constructor({
    trialCount,
    shouldApplyOpacity,
    preferDefaultPsd,
  }: BenchmarkOptionsProperties) {
    if (!(Number.isSafeInteger(trialCount) && trialCount > 0)) {
      throw new Error(
        `trialCount must be a positive safe integer (got ${trialCount})`
      );
    }

    this.trialCount = trialCount;
    this.shouldApplyOpacity = shouldApplyOpacity;
    this.preferDefaultPsd = preferDefaultPsd;

    Object.freeze(this);
  }
}

export type BenchmarkOptionsProperties = OmitCallbacks<BenchmarkOptions>;
