// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import Psd from "@webtoon/psd";
import {createMessage, validateMessage} from "./messaging";

self.addEventListener("message", ({data}) => {
  const {type, timestamp, value} = data;

  validateMessage(data);

  console.log(
    `It took %d ms to send this message (main → worker, type: %o)`,
    Date.now() - timestamp,
    type
  );

  if (type === "ParseData") {
    console.time("Parse PSD file");
    const psd = Psd.parse(value);
    console.timeEnd("Parse PSD file");

    console.log(psd);

    psd.layers.forEach((layer, index) => {
      console.time(`Compositing layer ${index}`);
      const pixelData = layer.composite(true, true);
      console.timeEnd(`Compositing layer ${index}`);

      (self as unknown as Worker).postMessage(
        createMessage("Layer", {
          pixelData,
          name: layer.name,
          left: layer.left,
          top: layer.top,
          width: layer.width,
          height: layer.height,
        }),
        [pixelData.buffer]
      );
    });
  } else {
    console.error(`Worker received a message that it cannot handle: %o`, data);
  }
});
