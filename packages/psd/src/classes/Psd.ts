// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  ColorMode,
  Depth,
  ParsingResult,
  ImageData,
  Guide,
  ResourceType,
} from "../interfaces";
import {parse} from "../methods";
import {loadSlicesFromResourceBlock, Slice} from "./Slice";
import {Group} from "./Group";
import {Layer} from "./Layer";
import {Node} from "./Node";
import {Synthesizable} from "./Synthesizable";

/**
 * A parsed PSD file.
 * @alpha
 */
export class Psd extends Synthesizable implements Node {
  public readonly name = "ROOT";
  public readonly type = "Psd";
  public readonly opacity = 255;
  public readonly composedOpacity = 1;
  public readonly children: Node[] = [];
  public readonly layers: Layer[] = [];
  public readonly guides: Guide[] = [];
  public readonly slices: Slice[] = [];

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
          const group = new Group(layerFrame, parent);

          stack.push(group);
          parent.children?.push(group);
          groupIndex += 1;

          break;
        }
        case "L": {
          const layerFrame = layers[layerIndex];
          const layer = new Layer(layerFrame, parent);

          this.layers.push(layer);
          parent.children?.push(layer);
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
    this.children.forEach((node) => node.freeze && node.freeze());
    Object.freeze(this.children);
  }
}
