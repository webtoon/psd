// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {PsdError} from "../utils";
import {Group} from "./Group";
import {Layer} from "./Layer";
import {Psd} from "./Psd";

export type Node = Psd | Group | Layer;
export type NodeParent = Psd | Group;
export type NodeChild = Group | Layer;

export function isNodeParent(node: Node): node is NodeParent {
  return node.type === "Psd" || node.type === "Group";
}

export function isNodeChild(node: Node): node is NodeChild {
  return node.type === "Group" || node.type === "Layer";
}

export function assertIsNodeParent(node: Node): asserts node is NodeParent {
  if (!isNodeParent(node)) {
    throw new PsdError(
      `Node (name = '${node.name}', type: '${node.type}') cannot be a parent node`
    );
  }
}

export function assertIsNodeChild(node: Node): asserts node is NodeChild {
  if (!isNodeChild(node)) {
    throw new PsdError(
      `Node (name = '${node.name}', type: '${node.type}') cannot be a child node`
    );
  }
}
