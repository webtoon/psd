// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {ImageData} from "../interfaces";
import {generateRgba, applyOpacity} from "../methods";

export abstract class Synthesizable {
  public abstract get width(): number;
  public abstract get height(): number;
  public abstract get opacity(): number;
  public abstract get composedOpacity(): number;

  protected abstract get imageData(): ImageData;

  composite(effect = true, composed = true): Uint8ClampedArray {
    const {red, green, blue, alpha} = this.imageData;
    const {width, height} = this;

    const rgba = generateRgba(width, height, red, green, blue, alpha);

    if (effect === true) {
      if (composed === true) {
        const c = this.composedOpacity * 255;
        return applyOpacity(rgba, c);
      } else {
        return applyOpacity(rgba, this.opacity);
      }
    }

    return rgba;
  }
}