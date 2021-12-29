// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  AdditionalLayerInfo,
  BlendMode,
  ChannelKind,
  Clipping,
  GroupDivider,
  ChannelBytes,
} from "../../interfaces";

export interface LayerRecord {
  name: string;
  channelInformation: [ChannelKind, number][];
  top: number;
  left: number;
  bottom: number;
  right: number;
  visible: boolean;
  opacity: number;
  clipping: Clipping;
  blendMode: BlendMode;
  additionalLayerInfos: AdditionalLayerInfo[];
  // The following properties are extracted from the additionalLayerInfos field
  // for easy access
  /** If defined, divider type for "group divider" layers. */
  dividerType?: GroupDivider;
  /** If defined, contains the text of a Text Layer. */
  layerText?: string;
}

export type LayerChannels = Map<ChannelKind, ChannelBytes>;

export interface Frame {
  startIndex: number;
  groupId: number;
  parentGroupId: number;
  layerRecord?: LayerRecord;
}

export interface LayerProperties {
  name: string;
  top: number;
  left: number;
  bottom: number;
  right: number;
  visible: boolean;
  opacity: number;
  clippingMask: Clipping;
  blendMode: BlendMode;
  groupId?: number;
  /** Text content of text layers */
  text?: string;
}

export const createLayerProperties = (
  name: string,
  layerRecord: LayerRecord,
  groupId?: number
): LayerProperties => {
  const {
    top,
    left,
    bottom,
    right,
    opacity,
    clipping: clippingMask,
    visible,
    blendMode,
    layerText,
  } = layerRecord;

  return {
    name,
    top,
    left,
    bottom,
    right,
    opacity,
    clippingMask,
    visible,
    blendMode,
    groupId,
    text: layerText,
  };
};
