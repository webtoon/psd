// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

export interface Node {
  type: "Group" | "Layer" | "Psd";
  name: string;
  parent?: Node;
  children?: Node[];
  opacity: number;
  composedOpacity: number;
  addChild?: (node: Node) => void;
  hasChildren?: () => boolean;
  freeze?: () => void;
}
