// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {NodeChild, NodeParent} from "./Node";

export interface NodeBase<
  Parent extends NodeParent = NodeParent,
  Child extends NodeChild = NodeChild
> {
  type: "Psd" | "Group" | "Layer";
  name: string;
  parent?: Parent;
  children?: Child[];
  opacity: number;
  composedOpacity: number;
  addChild?: (node: Child) => void;
  hasChildren?: () => boolean;
  freeze?: () => void;
}
