// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {InvalidGroupDividerType} from "../utils";

/**
 * Enumeration used to mark "divider" layers that group ordinary (non-divider)
 * layers into groups and subgroups.
 */
export enum GroupDivider {
  /** 0: any other type of layer */
  Other,
  /** 1: open "folder" */
  OpenFolder,
  /** 2: closed "folder" */
  CloseFolder,
  /**  3: bounding section divider, hidden in the Photoshop UI */
  BoundingSection,
}

export function matchDividerType(divider: number): GroupDivider {
  if (divider in GroupDivider) {
    return divider as GroupDivider;
  }

  throw new InvalidGroupDividerType();
}
