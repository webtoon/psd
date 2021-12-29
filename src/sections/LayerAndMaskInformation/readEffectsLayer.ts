// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  Cursor,
  equals,
  InvalidEffectsLayerSignature,
  UnknownEffectsLayerVersion,
} from "../../utils";

const EXPECTED_EFFECTS_LAYER_VERSION = 0;
const EXPECTED_EFFECTS_SIGNATURE = [56, 66, 73, 77];

const EFFECT = {
  CommonState: "cmnS",
  DropShadow: "dsdw",
  InnerShadow: "isdw",
  OuterGlow: "oglw",
  InnerGlow: "iglw",
  Bevel: "bevl",
  SolidFill: "sofi",
};

// TODO: Finish this function
// See https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_41831
export function readEffectsLayer(cursor: Cursor): undefined {
  const version = cursor.read("u16");
  if (version !== EXPECTED_EFFECTS_LAYER_VERSION) {
    throw new UnknownEffectsLayerVersion();
  }

  // For 6 in Photoshop 5.0 and 6.0 OR 7 for Photoshop 7.0
  const effectsCount = cursor.read("u16");

  const effect: Record<string, unknown> = {};

  // Next three items are repeated for each of the effects
  for (let i = 0; i < effectsCount; i++) {
    const signature = cursor.take(4);
    if (!equals(signature, EXPECTED_EFFECTS_SIGNATURE)) {
      throw new InvalidEffectsLayerSignature();
    }

    const effectSignature = cursor.readString(4);
    switch (effectSignature) {
      case EFFECT.CommonState: {
        effect.commonState = readCommonStateInfo(cursor);
        break;
      }
      case EFFECT.DropShadow: {
        effect.dropShadow = readShadowInfo(cursor);
        break;
      }
      case EFFECT.InnerShadow: {
        effect.innerShadow = readShadowInfo(cursor);
        break;
      }
      case EFFECT.OuterGlow: {
        effect.outerGlow = readOuterGlowInfo(cursor);
        break;
      }
      case EFFECT.InnerGlow: {
        effect.innerGlow = readInnerGlowInfo(cursor);
        break;
      }
      case EFFECT.Bevel: {
        effect.devel = readBevelInfo(cursor);
        break;
      }
      case EFFECT.SolidFill: {
        effect.solidFill = readSolidFillInfo(cursor);
        break;
      }
    }
  }

  return undefined;
}

// | Length | Description                 |
// |--------------------------------------|
// | 4      | Size of next three items: 7 |
// | 4      | Version: 0                  |
// | 1      | Visible: always true        |
// | 2      | Unused: always 0            |
function readCommonStateInfo(cursor: Cursor) {
  cursor.pass(11);
}

// | Length | Description                                                            |
// |---------------------------------------------------------------------------------|
// | 4      | Size of the remaining items: 41 or 51 (depending on version)           |
// | 4      | Version: 0 ( Photoshop 5.0) or 2 ( Photoshop 5.5)                      |
// | 4      | Blur value in pixels                                                   |
// | 4      | Intensity as a percent                                                 |
// | 4      | Angle in degrees                                                       |
// | 4      | Distance in pixels                                                     |
// | 10     | Color: 2 bytes for space followed by 4 * 2 byte color component        |
// | 8      | Blend mode: 4 bytes for signature and 4 bytes for key                  |
// | 1      | Effect enabled                                                         |
// | 1      | Use this angle in all of the layer effects                             |
// | 1      | Opacity as a percent                                                   |
// | 10     | Native color: 2 bytes for space followed by 4 * 2 byte color component |
function readShadowInfo(cursor: Cursor) {
  cursor.pass(55);
}

// | Length | Description                                                                                   |
// |--------------------------------------------------------------------------------------------------------|
// | 4      | Size of the remaining items: 32 for Photoshop 5.0; 42 for 5.5                                 |
// | 4      | Version: 0 for Photoshop 5.0; 2 for 5.5                                                       |
// | 4      | Blur value in pixels.                                                                         |
// | 4      | Intensity as a percent                                                                        |
// | 10     | Color: 2 bytes for space followed by 4 * 2 byte color component                               |
// | 8      | Blend mode: 4 bytes for signature and 4 bytes for the key                                     |
// | 1      | Effect enabled                                                                                |
// | 1      | Opacity as a percent                                                                          |
// | 10     | (Version 2 only) Native color space. 2 bytes for space followed by 4 * 2 byte color component |
function readOuterGlowInfo(cursor: Cursor) {
  cursor.pass(46);
}

// | Length | Description                                                                                   |
// |--------------------------------------------------------------------------------------------------------|
// | 4      | Size of the remaining items: 33 for Photoshop 5.0; 43 for 5.5                                 |
// | 4      | Version: 0 for Photoshop 5.0; 2 for 5.5.                                                      |
// | 4      | Blur value in pixels.                                                                         |
// | 4      | Intensity as a percent                                                                        |
// | 10     | Color: 2 bytes for space followed by 4 * 2 byte color component                               |
// | 8      | Blend mode: 4 bytes for signature and 4 bytes for the key                                     |
// | 1      | Effect enabled                                                                                |
// | 1      | Opacity as a percent                                                                          |
//   ** Remaining fields present only in version 2 **
// | 1      | Invert                                                                                        |
// | 10     | (Version 2 only) Native color space. 2 bytes for space followed by 4 * 2 byte color component |
function readInnerGlowInfo(cursor: Cursor) {
  cursor.pass(47);
}

// | Length | Description                                                               |
// |------------------------------------------------------------------------------------|
// | 4      | Size of the remaining items (58 for version 0, 78 for version 20          |
// | 4      | Version: 0 for Photoshop 5.0; 2 for 5.5                                   |
// | 4      | Angle in degrees                                                          |
// | 4      | Strength. Depth in pixels                                                 |
// | 4      | Blur value in pixels.                                                     |
// | 8      | Highlight blend mode: 4 bytes for signature and 4 bytes for the key       |
// | 8      | Shadow blend mode: 4 bytes for signature and 4 bytes for the key          |
// | 10     | Highlight color: 2 bytes for space followed by 4 * 2 byte color component |
// | 10     | Shadow color: 2 bytes for space followed by 4 * 2 byte color component    |
// | 1      | Bevel style                                                               |
// | 1      | Hightlight opacity as a percent                                           |
// | 1      | Shadow opacity as a percent                                               |
// | 1      | Effect enabled                                                            |
// | 1      | Use this angle in all of the layer effects                                |
// | 1      | Up or down                                                                |
// ** The following are present in version 2 only **
// | 10     | Real highlight color: 2 bytes for space; 4 * 2 byte color component       |
// | 10     | Real shadow color: 2 bytes for space; 4 * 2 byte color component          |
function readBevelInfo(cursor: Cursor) {
  cursor.pass(82);
}

// | Length | Description         |
// |------------------------------|
// | 4      | Size: 34            |
// | 4      | Version: 2          |
// | 4      | Key for blend mode  |
// | 10     | Color space         |
// | 1      | Opacity             |
// | 1      | Enabled             |
// | 10     | Native color space  |
function readSolidFillInfo(cursor: Cursor) {
  cursor.pass(34);
}
