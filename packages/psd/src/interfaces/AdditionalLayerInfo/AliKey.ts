// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

/**
 * Keys for Additional Layer Info blocks that @webtoon/psd can parse.
 * Currently, only a subset of all possible keys are supported.
 */
export enum AliKey {
  SectionDividerSetting = "lsct",
  TypeToolObjectSetting = "TySh",
  UnicodeLayerName = "luni",

  VectorStrokeData = "vstk",
  ObjectBasedEffects = "lfx2",
  GradientFillSetting = "GdFl",
  SolidColorSheetSetting = "SoCo",
  PatternFillSetting = "PtFl",
  VectorStrokeContentData = "vscg",
  BlendOptionsCapacity = "iOpa",
  VectorMaskSetting1 = "vmsk",
  VectorMaskSetting2 = "vsms",
  HueSaturation = "hue2",
  NestedSectionDividerSetting = "lsdk",
  LayerID = "lyid",
  ArtboardData = "artb",
}
