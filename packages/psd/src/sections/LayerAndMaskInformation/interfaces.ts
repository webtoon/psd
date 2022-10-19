// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  AdditionalLayerInfo,
  BlendMode,
  ChannelBytes,
  ChannelKind,
  Clipping,
  EngineData,
  GroupDivider,
} from "../../interfaces";

export interface LayerRecord {
  name: string;
  channelInformation: [ChannelKind, number][];
  top: number;
  left: number;
  bottom: number;
  right: number;
  hidden: boolean;
  transparencyLocked: boolean;
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
  /** If defined, containts extra text properties */
  engineData?: EngineData;
  maskData: MaskData;
}

export type LayerChannels = Map<ChannelKind, ChannelBytes>;

export interface Frame {
  startIndex: number;
  groupId: number;
  parentGroupId: number;
  layerRecord?: LayerRecord;
}

export type AdditionalLayerProperties = AdditionalLayerInfo[];

export interface LayerProperties {
  name: string;
  top: number;
  left: number;
  bottom: number;
  right: number;
  hidden: boolean;
  transparencyLocked: boolean;
  opacity: number;
  clippingMask: Clipping;
  blendMode: BlendMode;
  groupId?: number;
  /** Text content of text layers */
  text?: string;
  /** Text properties */
  textProperties?: EngineData;
  maskData: MaskData;
  additionalLayerProperties: AdditionalLayerProperties;
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
    hidden,
    transparencyLocked,
    blendMode,
    layerText,
    engineData,
    maskData,
    additionalLayerInfos,
  } = layerRecord;

  return {
    name,
    top,
    left,
    bottom,
    right,
    opacity,
    clippingMask,
    hidden,
    transparencyLocked,
    blendMode,
    groupId,
    text: layerText,
    textProperties: engineData,
    maskData,
    additionalLayerProperties: additionalLayerInfos,
  };
};

export interface MaskFlags {
  // bit 0 = position relative to layer
  positionRelativeToLayer: boolean;
  // bit 1 = layer mask disabled
  layerMaskDisabled: boolean;
  // bit 2 = invert layer mask when blending (Obsolete)
  invertMaskWhenBlending: boolean;
  // bit 3 = indicates that the user mask actually came from rendering other data
  userMaskFromRenderingOtherData: boolean;
  // bit 4 = indicates that the user and/or vector masks have parameters applied to them
  masksHaveParametersApplied: boolean;
}

export interface MaskParameters {
  // bit 0 = user mask density, 1 byte
  userMaskDensity?: number;
  // bit 1 = user mask feather, 8 byte, double
  userMaskFeather?: number;
  // bit 2 = vector mask density, 1 byte
  vectorMaskDensity?: number;
  // bit 3 = vector mask feather, 8 bytes, double
  vectorMaskFeather?: number;
}

// The spec is confusing at best... what "real" means?
// https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_pgfId-1031423
export interface RealMaskData {
  flags: MaskFlags;
  backgroundColor: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface MaskData {
  top: number;
  left: number;
  bottom: number;
  right: number;
  backgroundColor: number;
  flags: MaskFlags;
  parameters?: MaskParameters;
  // only present if size != 20
  realData?: RealMaskData;
}
