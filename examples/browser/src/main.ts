// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import "./style.css";
import {createMessage, validateMessage} from "./messaging";

const generateCanvas = (data: {
  pixelData: Uint8ClampedArray;
  width: number;
  height: number;
}) => {
  const canvasEl = document.createElement("canvas");
  const context = canvasEl.getContext("2d") as CanvasRenderingContext2D;

  const {width, height, pixelData: rgba} = data;
  const imageData = context.createImageData(width, height);

  canvasEl.width = width;
  canvasEl.height = height;

  imageData.data.set(rgba);
  context.putImageData(imageData, 0, 0);

  return canvasEl;
};

const readFileAsArrayBuffer = (file: File) => {
  if (file.arrayBuffer) {
    return file.arrayBuffer();
  } else {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    return new Promise<ArrayBuffer>((resolve) => {
      reader.addEventListener("load", (event) => {
        if (event.target) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          throw new Error("Loaded file but event.target is null");
        }
      });
    });
  }
};

const workerCallback = ({data}: MessageEvent<any>, element: HTMLDivElement) => {
  const {type, timestamp, value} = data;
  validateMessage(data);

  console.log(
    `It took %d ms to send this message (worker → main, type: %o)`,
    Date.now() - timestamp,
    type
  );

  if (type === "Layer") {
    const layer = value;

    // -- Layers --
    element.insertAdjacentHTML("beforeend", `<h3>${layer.name}</h3>`);
    element.insertAdjacentHTML(
      "beforeend",
      `<div><p class="layer-info">size : ${layer.width} x ${layer.height} | top: ${layer.top} | left: ${layer.left}</p></div>`
    );
    console.time("Create and append <canvas> for layer");
    element.appendChild(generateCanvas(layer));
    console.timeEnd("Create and append <canvas> for layer");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script loaded");

  const resultsEl = document.querySelector("#results") as HTMLDivElement;
  const inputEl = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  // eslint-disable-next-line compat/compat
  const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  worker.addEventListener("message", (e: MessageEvent<any>) =>
    workerCallback(e, resultsEl)
  );

  inputEl.addEventListener("change", () => {
    const file = (inputEl.files as FileList)[0];
    if (!file) return;

    readFileAsArrayBuffer(file).then((buffer) => {
      worker.postMessage(createMessage("ParseData", buffer), [buffer]);
    });

    // Reset the input so we can reload the same file over and over
    inputEl.value = "";
    resultsEl.innerHTML = "";
  });
});
