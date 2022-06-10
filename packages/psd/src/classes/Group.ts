// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {GroupFrame} from "../sections";
import {Node} from "./Node";

/**
 * A layer group, which may contain layers and other layer groups.
 * @alpha
 */
export class Group implements Node {
  readonly type = "Group";
  readonly children: Node[] = [];

  /** @internal */
  constructor(private layerFrame: GroupFrame, public readonly parent: Node) {}

  get name(): string {
    return this.layerFrame.layerProperties.name;
  }
  get opacity(): number {
    return this.layerFrame.layerProperties.opacity;
  }
  get composedOpacity(): number {
    return this.parent.composedOpacity * (this.opacity / 255);
  }

  addChild(node: Node): void {
    this.children.push(node);
  }
  hasChildren(): boolean {
    return this.children.length !== 0;
  }

  freeze(): void {
    this.children.forEach((node) => node.freeze && node.freeze());
    Object.freeze(this.children);
  }
}
