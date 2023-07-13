// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

/**
 * Base class for all exceptions thrown by @webtoon/psd
 */
export class PsdError extends Error {
  // Workaround to properly set the prototype chain in Node.js
  // See:
  // - https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
  // - https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}

export class InvalidBufferLength extends PsdError {}
export class InvalidSignature extends PsdError {}
export class InvalidVersion extends PsdError {}
export class InvalidReservationCode extends PsdError {}
export class InvalidColorMode extends PsdError {}
export class InvalidDepth extends PsdError {}
export class InvalidChannelCount extends PsdError {}
export class InvalidPixelCount extends PsdError {}
export class InvalidChannel extends PsdError {}
export class InvalidBlendingModeSignature extends PsdError {}
export class InvalidGroupDividerType extends PsdError {}
export class UnknownBlendingMode extends PsdError {}
export class InvalidCompression extends PsdError {}
export class MissingColorChannel extends PsdError {}
export class MissingRealMaskData extends PsdError {}
export class UnknownPathRecordType extends PsdError {}

/**
 * Error thrown when the PSD file uses a compression format that is valid, but
 * currently unsupported by @webtoon/psd
 */
export class UnsupportedCompression extends PsdError {}
export class UnsupportedDepth extends PsdError {}
export class UnsupportedChannelKindOffset extends PsdError {}
export class ChannelNotFound extends PsdError {}
export class InvalidClipping extends PsdError {}
export class PanicFrameStackUnmatched extends PsdError {}
export class InvalidOpacityValue extends PsdError {}
export class UnknownEffectsLayerVersion extends PsdError {}
export class InvalidEffectsLayerSignature extends PsdError {}
export class InvalidResourceSignature extends PsdError {}
export class PanicOutOfBoundArray extends PsdError {}

// Grid and Guides-related errors
export class InvalidGridAndGuidesVersion extends PsdError {}
export class InvalidGuideDirection extends PsdError {}

// Slices-related errors
export class InvalidSlicesVersion extends PsdError {}
export class InvalidSliceOrigin extends PsdError {}
export class InvalidSlice extends PsdError {}

/**
 * Error thrown when a value exceeds the limit supported by @webtoon/psd.
 * (This includes negative values that are too small)
 */
export class NumberTooLarge extends PsdError {}

// Additional Layer Information section errors
export class InvalidAdditionalLayerInfoSignature extends PsdError {}
export class InvalidSectionDividerSetting extends PsdError {}
export class InvalidTypeToolObjectSetting extends PsdError {}
export class InvalidLinkedLayerType extends PsdError {}

// Descriptor and Reference errors
export class InvalidDescriptorType extends PsdError {}
export class InvalidDescriptorVersion extends PsdError {}
export class DuplicateDescriptorKey extends PsdError {}
/** Thrown when a descriptor does not contain the expected key */
export class MissingDescriptorKey extends PsdError {}
/** Thrown when a descriptor value is not of the expected type */
export class UnexpectedDescriptorValueType extends PsdError {}
export class InvalidReferenceType extends PsdError {}
export class InvalidUnitFloatType extends PsdError {}

// EngineData errors
/** Thrown when lexer fails to parse respective type */
export class InvalidEngineDataBoolean extends PsdError {}
export class InvalidEngineDataNumber extends PsdError {}
/** Thrown when top-level value is not a dict */
export class InvalidTopLevelEngineDataValue extends PsdError {}
export class UnexpectedEndOfEngineData extends PsdError {}
export class UnexpectedEngineDataToken extends PsdError {}
export class InvalidEngineDataDictKey extends PsdError {}
export class InvalidEngineDataTextBOM extends PsdError {}
export class MissingEngineDataProperties extends PsdError {}
