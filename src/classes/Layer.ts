// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ImageData} from "../interfaces";
import {LayerFrame} from "../sections";
import {Node} from "./Node";
import {Synthesizable} from "./Synthesizable";

/**
 * A layer in a PSD file.
 * @alpha
 */
export class Layer extends Synthesizable implements Node {
  readonly type = "Layer";

  /** @internal */
  constructor(private layerFrame: LayerFrame, public readonly parent: Node) {
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

  /**
   * If this layer is a text layer, this property retrieves its text content.
   * Otherwise, this property is `undefined`.
   */
  get text(): string | undefined {
    return this.layerFrame.layerProperties.text;
  }

  protected get imageData(): ImageData {
    const {red, green, blue, alpha} = this.layerFrame;

    return {red, green, blue, alpha};
  }
}
