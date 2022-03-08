# @webtoon/psd

A lightweight Adobe Photoshop .psd/.psb file parser in typescript with zero-dependency for WebBrowser and NodeJS

## Browser Support

| Chrome | Firefox | Safari | Edge | Node |
| :----: | :-----: | :----: | :--: | :--: |
|   38   |   20    |  10.1  |  79  |  12  |

\*Internet Explorer is not supported

## Installation

```bash
$ npm install @webtoon/psd
```

## Benchmarks

You can run [benchmarks for @webtoon/psd in your browser](https://webtoon.github.io/psd/benchmark/).

## Features

#### ✅ Supported

- Support large format (`.psb`)
- Image / Layer information (size, offset, etc.)
- Image / Layer pixel data
- Unicode layer names
- Image / Layer opacity
- Text layers string value
- Guides
- Slices

#### 🚧 Work in progress

- Layer effects (shadow, overlays, etc.)

#### ❌ Unsupported

- Photoshop metadata not directly related to the image

## Usage

`@webtoon/psd` is provided as a pure ECMAScript module.

### Web Browsers

Check out the [live demo](https://webtoon.github.io/psd) and the the [source](https://github.com/webtoon/psd/tree/master/examples/browser) for web browser.

`@webtoon/psd` must be bundled with a bundler such as Webpack or Rollup.

`@webtoon/psd` reads a PSD file as an `ArrayBuffer`. You can use `FileReader` or `File` to load a PSD file:

```ts
import Psd from "@webtoon/psd";

const inputEl: HTMLInputElement = document.querySelector("input[type='file']");
inputEl.addEventListener("change", async () => {
  const file = inputEl.files[0];

  const result = await file.arrayBuffer();
  const psdFile = Psd.parse(result);

  const canvasElement = document.createElement("canvas");
  const context = canvasElement.getContext("2d");
  const imageData = new ImageData(
    psdFile.composite(),
    psdFile.width,
    psdFile.height
  );

  canvasElement.width = psdFile.width;
  canvasElement.height = psdFile.height;

  context.putImageData(imageData, 0, 0);
  document.body.append(canvasElement);
});
```

For performance, we recommend parsing PSD files in a [Web Worker](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) rather than the main thread.

### NodeJS

`@webtoon/psd` does not support the Node.js `Buffer`. You must explicitly supply the underlying `ArrayBuffer`.

```ts
import * as fs from "fs";
import Psd from "@webtoon/psd";

const psdData = fs.readFileSync("./my-file.psd");
// Pass the ArrayBuffer instance inside the Buffer
const psdFile = Psd.parse(psdData.buffer);
```

Since `@webtoon/psd` is provided as an ES module, you must use dynamic `import()` or a bundler to run it in CommonJS code:

```ts
const Psd = await import("@webtoon/psd");
```

## API Docs

This library provides the `Psd` class as the default export.

### Opening a file

`Psd.parse(ArrayBuffer)` takes an `ArrayBuffer` containing a PSD or PSB file and returns a new `Psd` object.

```ts
const psdFile = Psd.parse(myBuffer);
```

### Traversing layers

A `Psd` object contains a tree of `Layer` and `Group` (i.e. layer group) objects.

- The `Psd` object provides a `children` property, which is an array of top-level `Layer`s and `Group`s.
- Each `Group` object provides a `children` property, which is an array of `Layers` and `Group`s that belong immediately under the current layer group .

```ts
import Psd, {Group, Layer, Node} from "@webtoon/psd";

// Recursively traverse layers and layer groups
function traverseNode(node: Node) {
  if (node instanceof Group) {
    for (const child of node.children) {
      traverseNode(child);
    }
  } else if (node instanceof Layer) {
    // Do something with layer
  } else {
    throw new Error("Invalid node type");
  }
}

for (const node of psdFile.children) {
  traverseNode(node);
}
```

The `Psd` object also provides the `layers` property, which is an array of all `Layer`s in the image (including nested).

```ts
for (const layer of psdFile.layers) {
  doSomething(layer);
}
```

### Retrieving image data

Use `Psd.prototype.composite()` and `Layer.prototype.composite()` to retrieve the pixel information for the entire image or an individual layer.

```ts
// Extract the pixel data of the entire image
pixelData = psd.composite();

// Extract the pixel data of a layer, with all layer and layer group effects applied
// (currently, only the opacity is supported)
layerPixelData = layer.composite();

// Extract the pixel data of a layer, with only the layer's own effects applied
layerPixelData = layer.composite(true, false);

// Extract the pixel data of a layer, without any effects
layerPixelData = layer.composite(false);
```

## License

`@webtoon/psd` is released under the [MIT license](https://github.com/webtoon/psd/blob/master/LICENSE).

```
Copyright 2021-present NAVER WEBTOON

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
