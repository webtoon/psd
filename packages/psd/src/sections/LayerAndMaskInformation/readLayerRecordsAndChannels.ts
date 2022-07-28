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
  RawDataDescriptorValue,
} from "../../interfaces";
import {parseEngineData} from "../../methods";
import {Cursor, InvalidBlendingModeSignature} from "../../utils";
import {readAdditionalLayerInfo} from "./AdditionalLayerInfo";
import {LayerChannels, LayerRecord} from "./interfaces";

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
      const layerHeight = calcLayerHeight(layerRecord);
      // The channels for each layer are stored in the same order as the layers
      const channels = readLayerChannels(
        cursor,
        layerRecord.channelInformation,
        layerHeight,
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

  const blendMode: BlendMode = matchBlendMode(cursor.readString(4));
  const opacity = cursor.read("u8");
  const clipping: Clipping = matchClipping(cursor.read("u8"));
  const {hidden, transparencyLocked} = readLayerFlags(cursor);

  // Skip parsing filter information
  cursor.pass(1);

  // Length of the Layer Extra Data block, which contains:
  // Layer Mask / Blending Range / Layer Name
  const layerExtraDataSize = cursor.read("u32");
  const layerExtraDataBegin = cursor.position;

  // Skip the Layer Mask info segment, which we don't need for now
  // Read the length of the segment and skip it
  cursor.pass(cursor.read("u32"));

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
  };
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

function calcLayerHeight(layerRecord: LayerRecord): number {
  return layerRecord.bottom - layerRecord.top + 1;
}

function readLayerChannels(
  cursor: Cursor,
  channelInformation: [ChannelKind, number][],
  scanLines: number,
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
    const channelData = cursor.take(channelDataLength);

    switch (compression) {
      case ChannelCompression.RawData: {
        channels.set(channelKind, {compression, data: channelData});
        break;
      }
      case ChannelCompression.RleCompressed: {
        // We're skipping over the bytes that describe the length of each scanline since
        // we don't currently use them. We might re-think this in the future when we implement
        // serialization of a Psd back into bytes.. But not a concern at the moment.
        // Compressed bytes per scanline are encoded at the beginning as 2 bytes per scanline

        const bytesPerScanline = fileVersionSpec.rleScanlineLengthFieldSize;
        const skip = scanLines * bytesPerScanline;
        const data = new Uint8Array(
          channelData.buffer,
          channelData.byteOffset + skip,
          channelData.byteLength - skip
        );

        channels.set(channelKind, {compression, data});
        break;
      }
    }
  }

  return channels;
}
