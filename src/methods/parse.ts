// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {getFileVersionSpec, ParsingResult} from "../interfaces";
import {
  getFileStructure,
  parseImageData,
  parseImageResource,
  parseLayerAndMaskInformation,
} from "../sections";

/** @internal */
export function parse(buffer: ArrayBuffer): ParsingResult {
  const fileStructure = getFileStructure(buffer);

  const {fileHeader} = fileStructure;
  const fileVersionSpec = getFileVersionSpec(fileHeader.version);

  const imageResources = parseImageResource(fileStructure.imageResources);
  const layerAndMaskInfo = parseLayerAndMaskInformation(
    fileStructure.layerAndMaskInformation,
    fileVersionSpec
  );
  const imageData = parseImageData(
    fileStructure.imageData,
    fileHeader.depth,
    fileHeader.height,
    fileHeader.channelCount,
    fileVersionSpec
  );

  return {
    fileHeader,
    colorModeData: undefined,
    imageResources,
    layerAndMaskInfo,
    imageData,
  };
}
