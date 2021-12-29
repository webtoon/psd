// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ChannelKind, ChannelBytes} from "../../interfaces";
import {ChannelNotFound} from "../../utils";
import {
  LayerRecord,
  LayerChannels,
  LayerProperties,
  createLayerProperties,
} from "./interfaces";

export class LayerFrame {
  static create(
    layerRecord: LayerRecord,
    channels: LayerChannels,
    groupId?: number
  ): LayerFrame {
    const layerProperties = createLayerProperties(
      layerRecord.name,
      layerRecord,
      groupId
    );

    return new LayerFrame(channels, layerProperties);
  }

  constructor(
    public readonly channels: LayerChannels,
    public readonly layerProperties: LayerProperties
  ) {}

  get red(): ChannelBytes {
    const channelBytes = this.channels.get(ChannelKind.Red);
    if (channelBytes === undefined) {
      throw new ChannelNotFound();
    }

    return channelBytes;
  }
  get green(): ChannelBytes | undefined {
    return this.channels.get(ChannelKind.Green);
  }
  get blue(): ChannelBytes | undefined {
    return this.channels.get(ChannelKind.Blue);
  }
  get alpha(): ChannelBytes | undefined {
    return this.channels.get(ChannelKind.TransparencyMask);
  }

  get width(): number {
    const {right, left} = this.layerProperties;
    return right - left + 1;
  }
  get height(): number {
    const {bottom, top} = this.layerProperties;
    return bottom - top + 1;
  }
}

export class GroupFrame {
  static create(
    name: string,
    id: number,
    layerRecord: LayerRecord,
    groupId?: number
  ): GroupFrame {
    const layerProperties = createLayerProperties(name, layerRecord, groupId);

    return new GroupFrame(id, layerProperties);
  }

  constructor(
    public readonly id: number,
    public readonly layerProperties: LayerProperties
  ) {}
}
