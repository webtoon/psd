// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  FileHeaderSection,
  ImageDataSection,
  ImageResourcesSection,
  LayerAndMaskInformationSection,
} from "../sections";

export interface ParsingResult {
  fileHeader: FileHeaderSection;
  // Intentionally left undefined, as we don't support indexed color yet
  colorModeData: undefined;
  imageResources: ImageResourcesSection;
  layerAndMaskInfo: LayerAndMaskInformationSection;
  imageData: ImageDataSection;
}
