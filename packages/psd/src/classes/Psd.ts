// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  ColorMode,
  Depth,
  Guide,
  ImageData,
  ParsingResult,
  ResourceType,
} from "../interfaces";
import {parse} from "../methods";
import {Group} from "./Group";
import {Layer} from "./Layer";
import {assertIsNodeParent, Node, NodeChild} from "./Node";
import {NodeBase} from "./NodeBase";
import {loadSlicesFromResourceBlock, Slice} from "./Slice";
import {Synthesizable} from "./Synthesizable";

/**
 * A parsed PSD file.
 * @alpha
 */
export class Psd extends Synthesizable implements NodeBase<never, NodeChild> {
  public readonly name = "ROOT";
  public readonly type = "Psd";
  public readonly opacity = 255;
  public readonly composedOpacity = 1;
  public readonly parent?: undefined;
  public readonly children: NodeChild[] = [];
  public readonly layers: Layer[] = [];
  public readonly guides: Guide[] = [];
  public readonly slices: Slice[] = [];
  public readonly icc_profile?: Uint8Array = undefined;

  static parse(buffer: ArrayBuffer): Psd {
    const parsingResult = parse(buffer);
    return new Psd(parsingResult);
  }

  /** @internal */
  constructor(private parsingResult: ParsingResult) {
    super();

    this.buildTreeStructure();

    for (const resource of parsingResult.imageResources.resources) {
      if (resource.resource !== null) {
        switch (resource.id) {
          case ResourceType.GridAndGuides:
            this.guides = resource.resource.guides;
            break;
          case ResourceType.Slices:
            this.slices = loadSlicesFromResourceBlock(resource);
            break;
          case ResourceType.ICCProfile:
            // We don't want to do try parsing it ourselves since it'd cost us a lot
            // see https://github.com/webtoon/psd/issues/46#issuecomment-1210726858
            this.icc_profile = resource.resource;
            break;
        }
      }
    }
  }

  get width(): number {
    return this.parsingResult.fileHeader.width;
  }
  get height(): number {
    return this.parsingResult.fileHeader.height;
  }
  get channelCount(): number {
    return this.parsingResult.fileHeader.channelCount;
  }
  get depth(): Depth {
    return this.parsingResult.fileHeader.depth;
  }
  get colorMode(): ColorMode {
    return this.parsingResult.fileHeader.colorMode;
  }

  protected get imageData(): ImageData {
    const {compression, red, green, blue, alpha} = this.parsingResult.imageData;
    return {
      red: {compression, data: red},
      green: green ? {compression, data: green} : undefined,
      blue: blue ? {compression, data: blue} : undefined,
      alpha: alpha ? {compression, data: alpha} : undefined,
    };
  }

  protected buildTreeStructure(): void {
    const {groups, layers, orders} = this.parsingResult.layerAndMaskInfo;
    const stack: Node[] = [this];
    let groupIndex = 0,
      layerIndex = 0;

    // Build tree
    orders.forEach((e) => {
      const parent = stack[stack.length - 1];

      switch (e) {
        case "G": {
          const layerFrame = groups[groupIndex];
          assertIsNodeParent(parent);
          const group = new Group(layerFrame, parent);

          stack.push(group);
          parent.children.push(group);
          groupIndex += 1;

          break;
        }
        case "L": {
          const layerFrame = layers[layerIndex];
          assertIsNodeParent(parent);
          const layer = new Layer(layerFrame, parent);

          this.layers.push(layer);
          parent.children.push(layer);
          layerIndex += 1;

          break;
        }
        case "D": {
          stack.pop();
        }
      }
    });

    // Free stack
    stack.length = 0;

    // Freeze children
    this.children.forEach((node) => (node as NodeBase).freeze?.());
    Object.freeze(this.children);
  }
}
