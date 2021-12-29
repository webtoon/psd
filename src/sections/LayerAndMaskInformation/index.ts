// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {FileVersionSpec, GroupDivider} from "../../interfaces";
import {Cursor, PanicFrameStackUnmatched} from "../../utils";
import {GroupFrame, LayerFrame} from "./classes";
import {Frame} from "./interfaces";
import {readLayerRecordsAndChannels} from "./readLayerRecordsAndChannels";

export * from "./classes";
export * from "./interfaces";

export type LayerAndMaskInformationSection = {
  layers: LayerFrame[];
  groups: GroupFrame[];
  orders: ("G" | "L" | "D")[];
};

export function parseLayerAndMaskInformation(
  dataView: DataView,
  fileVersionSpec: FileVersionSpec
): LayerAndMaskInformationSection {
  const cursor = new Cursor(dataView);

  // The first X bytes hold the length of the Layer and Mask Information section
  cursor.pass(fileVersionSpec.layerAndMaskSectionLengthFieldSize);

  // The Layer and Mask Information section consists of three segments:
  // LayerInfo, GlobalLayerMaskInfo, and AdditionalLayerInfo.
  // The next X bytes hold the length of the LayerInfo segment
  cursor.pass(fileVersionSpec.layerInfoSectionLengthFieldSize);

  /**
   * If positive, this is the layer count.
   * If negative, the absolute value is the layer count, and the first alpha
   * channel contains the transparency information (i.e. opacity) of the result
   * of merging all layers.
   */
  const layerCount = cursor.read("i16");

  /** Actual number of layers in the PSD file */
  const absLayerCount = Math.abs(layerCount);

  // Parse group (i.e. folder) count, layer information, and channel image data
  const layerRecordsAndChannels = readLayerRecordsAndChannels(
    cursor,
    absLayerCount,
    fileVersionSpec
  );

  // Construct a list of layers and folders based on the parsed layer records.
  // We defer construction of the layer grouping hierarchy (tree) to the
  // constructor of the Psd class.

  const layers: LayerFrame[] = [];
  const groups: GroupFrame[] = [];
  const orders: ("G" | "L" | "D")[] = [];

  /** Root node (the PSD file itself) */
  const root: Frame = {
    startIndex: 0,
    groupId: 0,
    parentGroupId: 0,
  };

  /** Stack used to access the parent of each node */
  const stack: Frame[] = [root];

  /** Variable that is incremented to generate unique layer group IDs */
  let alreadyViewed = 0;

  for (let i = 0; i < absLayerCount; i++) {
    const [layerRecord, channels] = layerRecordsAndChannels[i];
    const currentGroupId = stack[stack.length - 1].groupId;

    const {dividerType} = layerRecord;
    if (
      dividerType === GroupDivider.CloseFolder ||
      dividerType === GroupDivider.OpenFolder
    ) {
      // Both CloseFolder and OpenFolder indicate the _start_ of a layer group.
      // CloseFolder indicates the _beginning_ of a folder that is _visually_
      // closed; it does NOT indicate the end of a folder.

      alreadyViewed += 1;

      stack.push({
        startIndex: layers.length,
        groupId: alreadyViewed,
        parentGroupId: currentGroupId,
        layerRecord,
      });
      orders.push("G");
    } else if (dividerType === GroupDivider.BoundingSection) {
      // Indicates the end of a layer group

      const frame: Frame | undefined = stack.pop();
      if (frame === undefined) {
        throw new PanicFrameStackUnmatched();
      }

      const groupId = frame.groupId > 0 ? frame.groupId : undefined;
      const _layerRecord = frame.layerRecord || layerRecord;

      groups.push(
        GroupFrame.create(
          _layerRecord.name,
          frame.groupId,
          _layerRecord,
          groupId
        )
      );
      orders.push("D");
    } else {
      layers.push(LayerFrame.create(layerRecord, channels, currentGroupId));
      orders.push("L");
    }
  }

  // Group must be sorted by ID
  groups.sort((a, b) => a.id - b.id);

  return {layers, groups, orders};
}
