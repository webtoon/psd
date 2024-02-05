// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  Descriptor,
  DescriptorValueType,
  getDescriptorValueAsType,
  SliceOrigin,
  SlicesResourceBlock,
} from "../interfaces";
import {InvalidSlice as InvalidSlices} from "../utils";

/**
 * Represents a single slice in a PSD file.
 * @alpha
 */
export class Slice {
  constructor(
    public origin: SliceOrigin,
    public left: number,
    public top: number,
    public right: number,
    public bottom: number
  ) {}
}

export function loadSlicesFromResourceBlock(block: SlicesResourceBlock) {
  // We assume that most users use sufficiently modern versions of Photoshop
  // (>= 7.0), which store the slices in descriptors.
  // This saves us from having to write the same code twice.
  if (block.resource.descriptor) {
    const sliceList = block.resource.descriptor.descriptor.items.get("slices");
    if (!(sliceList && sliceList.type === DescriptorValueType.List)) {
      throw new InvalidSlices(`Missing key "slices" in slice descriptor`);
    }

    return sliceList.values.reduce<Slice[]>((slices, listEntry) => {
      if (listEntry.type !== DescriptorValueType.Descriptor) {
        throw new InvalidSlices(
          `Slice list contains a non-descriptor (type: ${listEntry.type})`
        );
      }

      // The list entry is a descriptor that represents a single slice
      slices.push(extractSliceFromDescriptor(listEntry.descriptor));
      return slices;
    }, []);
  } else {
    // No descriptor (i.e. Photoshop 6.0 format)
    // While we can technically parse this, we choose not to.
    // We can revisit this decision when we discover that some users want to use
    // old versions of Photoshop.
    throw new InvalidSlices(`No slice descriptor in slice resource block`);
  }
}

function extractSliceFromDescriptor(descriptor: Descriptor) {
  const origin = extractSliceOrigin(descriptor);

  const boundsDescriptor = getDescriptorValueAsType(
    descriptor,
    "bounds",
    DescriptorValueType.Descriptor
  ).descriptor;
  const top = getDescriptorValueAsType(
    boundsDescriptor,
    "Top ",
    DescriptorValueType.Integer
  ).value;
  const left = getDescriptorValueAsType(
    boundsDescriptor,
    "Left",
    DescriptorValueType.Integer
  ).value;
  const bottom = getDescriptorValueAsType(
    boundsDescriptor,
    "Btom",
    DescriptorValueType.Integer
  ).value;
  const right = getDescriptorValueAsType(
    boundsDescriptor,
    "Rght",
    DescriptorValueType.Integer
  ).value;

  return new Slice(origin, left, top, right, bottom);
}

function extractSliceOrigin(sliceDescriptor: Descriptor) {
  const originEnum = getDescriptorValueAsType(
    sliceDescriptor,
    "origin",
    DescriptorValueType.Enumerated
  );

  if (originEnum.enumType !== "ESliceOrigin") {
    throw new InvalidSlices(
      `Unexpected enum type for slice origin: got "${originEnum.enumType}"`
    );
  }

  switch (originEnum.enumValue) {
    case "layerGenerated":
      return SliceOrigin.LayerGenerated;
    case "userGenerated":
      return SliceOrigin.UserGenerated;
    case "autoGenerated":
      return SliceOrigin.AutoGenerated;
    default:
      throw new InvalidSlices(
        `Unexpected enum value for slice origin: got "${originEnum.enumValue}"`
      );
  }
}