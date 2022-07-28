// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {EngineData, ImageData} from "../interfaces";
import {LayerFrame} from "../sections";
import {NodeParent} from "./Node";
import {NodeBase} from "./NodeBase";
import {Synthesizable} from "./Synthesizable";

/**
 * A layer in a PSD file.
 * @alpha
 */
export class Layer
  extends Synthesizable
  implements NodeBase<NodeParent, never>
{
  readonly type = "Layer";
  readonly children?: undefined;

  /** @internal */
  constructor(
    private layerFrame: LayerFrame,
    public readonly parent: NodeParent
  ) {
    super();
  }

  get name(): string {
    return this.layerFrame.layerProperties.name;
  }
  get width(): number {
    return this.layerFrame.width;
  }
  get height(): number {
    return this.layerFrame.height;
  }
  get top(): number {
    return this.layerFrame.layerProperties.top;
  }
  get left(): number {
    return this.layerFrame.layerProperties.left;
  }
  get opacity(): number {
    return this.layerFrame.layerProperties.opacity;
  }
  get composedOpacity(): number {
    return this.parent.composedOpacity * (this.opacity / 255);
  }

  get isHidden(): boolean {
    return this.layerFrame.layerProperties.hidden;
  }

  get isTransparencyLocked(): boolean {
    return this.layerFrame.layerProperties.transparencyLocked;
  }

  /**
   * If this layer is a text layer, this property retrieves its text content.
   * Otherwise, this property is `undefined`.
   */
  get text(): string | undefined {
    return this.layerFrame.layerProperties.text;
  }

  /**
   * If this layer is a text layer, this property retrieves its text properties.
   * Otherwise, this property is `undefined`.
   */
  get textProperties(): EngineData | undefined {
    return this.layerFrame.layerProperties.textProperties;
  }

  protected get imageData(): ImageData {
    const {red, green, blue, alpha} = this.layerFrame;

    return {red, green, blue, alpha};
  }
}
