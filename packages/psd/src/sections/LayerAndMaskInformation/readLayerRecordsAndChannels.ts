// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  AdditionalLayerInfo,
  AliKey,
  BlendMode,
  ChannelBytes,
  ChannelCompression,
  ChannelKind,
  Clipping,
  DescriptorValueType,
  FileVersionSpec,
  matchBlendMode,
  matchChannelCompression,
  matchClipping,
} from "../../interfaces";
import {parseEngineData} from "../../methods";
import {
  Cursor,
  height,
  InvalidBlendingModeSignature,
  MissingRealMaskData,
} from "../../utils";
import {fromEntries} from "../../utils/object";
import {readAdditionalLayerInfo} from "./AdditionalLayerInfo";
import {
  MaskData,
  MaskFlags,
  MaskParameters,
  RealMaskData,
  AdditionalLayerProperties,
  LayerChannels,
  LayerRecord,
} from "./interfaces";

const EXPECTED_BLENDING_MODE_SIGNATURE = "8BIM";

export function readLayerRecordsAndChannels(
  cursor: Cursor,
  layerCount: number,
  fileVersionSpec: FileVersionSpec
): [LayerRecord, LayerChannels][] {
  const layerRecords: LayerRecord[] = [];

  // Read layer records
  while (layerRecords.length < layerCount) {
    layerRecords.push(readLayerRecord(cursor, fileVersionSpec));
  }

  // Read layer channels
  const result = layerRecords
    .map((layerRecord): [LayerRecord, LayerChannels] => {
      // The channels for each layer are stored in the same order as the layers
      const channels = readLayerChannels(
        cursor,
        layerRecord.channelInformation,
        layerRecord,
        fileVersionSpec
      );

      return [layerRecord, channels];
    })
    // Layers are stored in reverse order, so we must reverse it
    .reverse();

  return result;
}

function readLayerRecord(
  cursor: Cursor,
  fileVersionSpec: FileVersionSpec
): LayerRecord {
  const [top, left, bottom, right] = readLayerRectangle(cursor);
  const channelCount = cursor.read("u16");

  // ChannelInformation
  // 2 bytes = ChannelID
  // 4 or 8 bytes = ChannelData
  const channelInformation: [ChannelKind, number][] = [];
  while (channelInformation.length < channelCount) {
    const channelId = cursor.read("i16");
    if (!(channelId in ChannelKind)) {
      // Normally, we should throw an exception here.
      // However, a PSD file saved without "Compatibility Mode" checked contains
      // a channel with an ID of 3, which causes this code to fail.
      // Since parsing channel IDs -1, 0, 1, and 2 are sufficient to construct
      // the image, let's ignore channels that we don't know how to handle.
      // TODO: I suspect that channel #3 is the transparency mask. If so, we can
      // fix this code to properly parse channel #3 and throw the exception for
      // unhandleable channels.
      // throw new InvalidChannel();
    }

    const channelKind = channelId as ChannelKind;
    const channelLength = cursor.read(
      fileVersionSpec.layerRecordSectionChannelLengthFieldReadType
    );

    // The first two bytes in the channel data stores the compression type;
    // the remaining length is the length of the channel data.
    const channelDataLength = channelLength - 2;

    channelInformation.push([channelKind, channelDataLength]);
  }

  // BlendMode signature '8BIM'
  if (cursor.readString(4) !== EXPECTED_BLENDING_MODE_SIGNATURE) {
    throw new InvalidBlendingModeSignature();
  }
  const bmRead = cursor.readString(4);
  const blendMode: BlendMode = matchBlendMode(bmRead);
  const opacity = cursor.read("u8");
  const clipping: Clipping = matchClipping(cursor.read("u8"));
  const {hidden, transparencyLocked} = readLayerFlags(cursor);

  // Skip parsing filter information
  cursor.pass(1);

  // Length of the Layer Extra Data block, which contains:
  // Layer Mask / Blending Range / Layer Name
  const layerExtraDataSize = cursor.read("u32");
  const layerExtraDataBegin = cursor.position;

  const maskData = readMaskData(cursor);

  // Skip the Blending Range segment, which we don't need for now
  // Read the length of the segment and skip it
  cursor.pass(cursor.read("u32"));

  // Parse the Layer Name
  const nameLength = cursor.read("u8");
  let name = cursor.readString(nameLength);

  // Layer name is padded to the next multiple of 4 bytes.
  // So if the name length is 9, there will be three throwaway bytes
  // after it.
  //
  // The 1 is the 1 byte that we read for the name length
  cursor.padding(nameLength + 1, 4);

  const additionalLayerInfos: AdditionalLayerInfo[] = [];
  while (cursor.position - layerExtraDataBegin < layerExtraDataSize) {
    additionalLayerInfos.push(readAdditionalLayerInfo(cursor, fileVersionSpec));
  }

  // Extract useful information from additionalLayerInfos and expose them as
  // properties on the LayerRecord object
  let dividerType: LayerRecord["dividerType"];
  let layerText: LayerRecord["layerText"];
  let engineData: LayerRecord["engineData"];

  for (const ali of additionalLayerInfos) {
    if (ali._isUnknown) continue;

    switch (ali.key) {
      case AliKey.SectionDividerSetting:
      case AliKey.NestedSectionDividerSetting:
        ({dividerType} = ali);
        break;
      case AliKey.TypeToolObjectSetting: {
        const textValue = ali.textData.descriptor.items.get("Txt ");
        if (textValue && textValue.type === DescriptorValueType.String) {
          layerText = textValue.value;
        }
        const rawEngineData = ali.textData.descriptor.items.get("EngineData");
        if (
          rawEngineData &&
          rawEngineData.type === DescriptorValueType.RawData
        ) {
          engineData = parseEngineData(rawEngineData.data);
        }
        break;
      }
      case AliKey.UnicodeLayerName:
        // Use unicode name instead of ASCII name
        ({name} = ali);
        break;
    }
  }

  return {
    name,
    channelInformation,
    top,
    left,
    bottom,
    right,
    hidden,
    transparencyLocked,
    opacity,
    clipping,
    blendMode,
    additionalLayerInfos,
    dividerType,
    layerText,
    engineData,
    maskData,
  };
}

export function readGlobalAdditionalLayerInformation(
  cursor: Cursor,
  fileVersionSpec: FileVersionSpec
): AdditionalLayerProperties {
  const additionalLayerInfos = [];
  while (cursor.position < cursor.length) {
    additionalLayerInfos.push(
      readAdditionalLayerInfo(cursor, fileVersionSpec, /* padding */ 4)
    );
  }

  return fromEntries(
    additionalLayerInfos.map((ali) => [ali.key, ali])
  ) as AdditionalLayerProperties;
}

function readLayerRectangle(cursor: Cursor): [number, number, number, number] {
  const top = cursor.read("i32");
  const left = cursor.read("i32");

  // Subtract 1 to make the offset start at 0.
  // However, when the layer is completely transparent, the `bottom` value is
  // already 0, so we don't need to subtract 1.
  let bottom = cursor.read("i32");
  if (bottom !== 0) {
    bottom -= 1;
  }

  // Subtract 1 to make the offset start at 0.
  // However, when the layer is completely transparent, the `right` value is
  // already 0, so we don't need to subtract 1.
  let right = cursor.read("i32");
  if (right !== 0) {
    right -= 1;
  }

  return [top, left, bottom, right];
}

function readLayerFlags(cursor: Cursor): {
  hidden: boolean;
  transparencyLocked: boolean;
} {
  const flags = cursor.read("u8");
  return {
    transparencyLocked: Boolean(flags & 0x1),
    // Adobe's docs say this means "visible", but this actually marks "hidden" layers
    hidden: Boolean(flags & 0x2),
  };
}

function realMask(layerRecord: LayerRecord): MaskData {
  const maskData = layerRecord.maskData.realData;
  if (!maskData) {
    throw new MissingRealMaskData();
  }
  return maskData;
}

function calcLayerHeight(
  layerRecord: LayerRecord,
  channelId: ChannelKind
): number {
  switch (channelId) {
    case ChannelKind.UserSuppliedLayerMask:
      return height(layerRecord.maskData);
    case ChannelKind.RealUserSuppliedLayerMask:
      return height(realMask(layerRecord));
    default:
      return height(layerRecord) + 1;
  }
}

function readLayerChannels(
  cursor: Cursor,
  channelInformation: [ChannelKind, number][],
  layerRecord: LayerRecord,
  fileVersionSpec: FileVersionSpec
): LayerChannels {
  const channels = new Map<ChannelKind, ChannelBytes>();

  const {length} = channelInformation;
  for (let i = 0; i < length; i++) {
    const [channelKind, channelDataLength] = channelInformation[i];

    // Each channel has its own compression method; a layer may contain multiple
    // channels with different compression methods.
    // This is different from the PSD Image Data section, which uses a single
    // compression method for all channels.
    const compression = matchChannelCompression(cursor.read("u16"));
    switch (compression) {
      case ChannelCompression.RawData: {
        const data = cursor.take(channelDataLength);
        channels.set(channelKind, {compression, data});
        break;
      }
      case ChannelCompression.RleCompressed: {
        const data = cursor.take(
          // Do not attempt to take more than the length of the channel data.
          // This is needed because some layers (e.g. gradient fill layers) may
          // have empty channel data (channelDataLength === 0).
          channelDataLength > 0
            ? cursor.rleCompressedSize(
                calcLayerHeight(layerRecord, channelKind),
                fileVersionSpec.rleScanlineLengthFieldReadType
              )
            : channelDataLength
        );
        channels.set(channelKind, {compression, data});
        break;
      }
    }
  }

  return channels;
}

function readMaskData(cursor: Cursor): MaskData {
  const length = cursor.read("u32");
  const startsAt = cursor.position;
  const [top, left, bottom, right] = readBounds(cursor);
  const backgroundColor = cursor.read("u8");
  const flags = readFlags(cursor);
  const realData = length >= 36 ? readRealData(cursor) : undefined;
  const parameters = flags.masksHaveParametersApplied
    ? readParameters(cursor)
    : undefined;

  const remainingBytes = length - (cursor.position - startsAt);
  cursor.pass(remainingBytes);

  return {
    top,
    left,
    bottom,
    right,
    backgroundColor,
    flags,
    parameters,
    realData,
  };
}

function readBounds(cursor: Cursor): [number, number, number, number] {
  return Array.from(Array(4), () => cursor.read("i32")) as [
    number,
    number,
    number,
    number
  ];
}

enum MaskFlagsBitmask {
  PositionRelativeToLayer = 1 << 0,
  LayerMaskDisabled = 1 << 1,
  InvertMaskWhenBlending = 1 << 2,
  UserMaskFromRenderingOtherData = 1 << 3,
  MasksHaveParametersApplied = 1 << 4,
}

function readFlags(cursor: Cursor): MaskFlags {
  const flags = cursor.read("u8");
  return {
    // bit 0 = position relative to layer
    positionRelativeToLayer: Boolean(
      flags & MaskFlagsBitmask.PositionRelativeToLayer
    ),
    // bit 1 = layer mask disabled
    layerMaskDisabled: Boolean(flags & MaskFlagsBitmask.LayerMaskDisabled),
    // bit 2 = invert layer mask when blending (Obsolete)
    invertMaskWhenBlending: Boolean(
      flags & MaskFlagsBitmask.InvertMaskWhenBlending
    ),
    // bit 3 = indicates that the user mask actually came from rendering other data
    userMaskFromRenderingOtherData: Boolean(
      flags & MaskFlagsBitmask.UserMaskFromRenderingOtherData
    ),
    // bit 4 = indicates that the user and/or vector masks have parameters applied to them
    masksHaveParametersApplied: Boolean(
      flags & MaskFlagsBitmask.MasksHaveParametersApplied
    ),
  };
}

enum MaskParameterBitmask {
  // bit 0 = user mask density
  UserMaskDensity = 1 << 0,
  // bit 1 = user mask feather
  UserMaskFeather = 1 << 1,
  // bit 2 = vector mask density
  VectorMaskDensity = 1 << 2,
  // bit 3 = vector mask feather
  VectorMaskFeather = 1 << 3,
}

function readParameters(cursor: Cursor): MaskParameters {
  const parameters = cursor.read("u8");
  return {
    // bit 0 = user mask density, 1 byte
    userMaskDensity:
      parameters & MaskParameterBitmask.UserMaskDensity
        ? cursor.read("u8")
        : undefined,
    // bit 1 = user mask feather, 8 byte, double
    userMaskFeather:
      parameters & MaskParameterBitmask.UserMaskFeather
        ? cursor.read("f64")
        : undefined,
    // bit 2 = vector mask density, 1 byte
    vectorMaskDensity:
      parameters & MaskParameterBitmask.VectorMaskDensity
        ? cursor.read("u8")
        : undefined,
    // bit 3 = vector mask feather, 8 bytes, double
    vectorMaskFeather:
      parameters & MaskParameterBitmask.VectorMaskFeather
        ? cursor.read("f64")
        : undefined,
  };
}

function readRealData(cursor: Cursor): RealMaskData {
  const flags = readFlags(cursor);
  const backgroundColor = cursor.read("u8");
  const [top, left, bottom, right] = readBounds(cursor);
  return {top, left, bottom, right, flags, backgroundColor};
}
