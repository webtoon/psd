// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {MissingDescriptorKey, UnexpectedDescriptorValueType} from "../utils";
import {Reference} from "./Reference";

/**
 * Descriptors are dictionary-like data structures that Photoshop uses to store
 * arbitrary key-value data.
 */
export interface Descriptor {
  name: string;
  classId: string;
  items: Map<string, DescriptorValue>;
}

/**
 * Descriptor with an associated version.
 */
export interface VersionedDescriptor {
  descriptorVersion: 16;
  descriptor: Descriptor;
}

// DescriptorValue and its subtypes

export type DescriptorValue =
  | AliasDescriptorValue
  | BooleanDescriptorValue
  | ClassDescriptorValue
  | DescriptorDescriptorValue
  | DoubleDescriptorValue
  | EnumeratedDescriptorValue
  | IntegerDescriptorValue
  | LargeIntegerDescriptorValue
  | ListDescriptorValue
  | RawDataDescriptorValue
  | ReferenceDescriptorValue
  | StringDescriptorValue
  | UnitFloatDescriptorValue;

interface DescriptorValueBase<Type extends DescriptorValueType> {
  type: Type;
}

/** Possible values for the `type` field in `DescriptorValue` objects. */
export enum DescriptorValueType {
  Alias = "alis",
  Boolean = "bool",
  Class = "type",
  Descriptor = "Objc",
  Double = "doub",
  Enumerated = "enum",
  /** Effectively the same as `DescriptorValueType.Class` */
  GlobalClass = "GlbC",
  /** Effectively the same as `DescriptorValueType.Descriptor` */
  GlobalObject = "GlbO",
  Integer = "long",
  LargeInteger = "comp",
  List = "VlLs",
  RawData = "tdta",
  Reference = "obj ",
  String = "TEXT",
  UnitFloat = "UntF",
}

export interface AliasDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.Alias> {
  /**
   * Adobe's documentation says:
   * "FSSpec for Macintosh or a handle to a string to the full path on Windows".
   *
   * Since it's unclear what this means, we provide the raw data rather than
   * attempting to parse it.
   */
  // TODO: Research how this field should be decoded
  data: Uint8Array;
}

export interface BooleanDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.Boolean> {
  value: boolean;
}

export interface ClassDescriptorValue
  extends DescriptorValueBase<
    DescriptorValueType.Class | DescriptorValueType.GlobalClass
  > {
  name: string;
  classId: string;
}

export interface DescriptorDescriptorValue
  extends DescriptorValueBase<
    DescriptorValueType.Descriptor | DescriptorValueType.GlobalObject
  > {
  descriptor: Descriptor;
}

export interface DoubleDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.Double> {
  /** 64-bit floating-point number */
  value: number;
}

export interface EnumeratedDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.Enumerated> {
  enumType: string;
  enumValue: string;
}

export interface IntegerDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.Integer> {
  /** 32-bit integer */
  value: number;
}

export interface LargeIntegerDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.LargeInteger> {
  /** 64-bit integer */
  value: number;
}

export interface ListDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.List> {
  values: DescriptorValue[];
}

export interface RawDataDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.RawData> {
  data: Uint8Array;
}

export interface ReferenceDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.Reference> {
  references: Reference[];
}

export interface StringDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.String> {
  value: string;
}

export interface UnitFloatDescriptorValue
  extends DescriptorValueBase<DescriptorValueType.UnitFloat> {
  unitType: UnitFloatType;
  /** 64-bit floating-point number */
  value: number;
}

/** Valid measurement unit types used by `UnitFloatDescriptorValue` */
export enum UnitFloatType {
  // The following descriptions were taken directly from Adobe's docs
  /** Base degrees */
  Angle = "#Ang",
  /** Base per inch */
  Density = "#Rsl",
  /** Base 72ppi */
  Distance = "#Rlt",
  /** Tagged unit value */
  Millimeters = "#Mlm",
  /** None */
  None = "#Nne",
  /** Unit value */
  Percent = "#Prc",
  /** Tagged unit value */
  Pixels = "#Pxl",
  /** Tagged unit value */
  Points = "#Pnt",
}

/**
 * Helper type that maps a `DescriptorValueType` to a `DescriptorValue` subtype
 */
// Use conditional types twice to distribute the check over each type in the
// `DescriptorValue` union type
type DescriptorValueWithType<
  Type extends DescriptorValueType,
  D extends DescriptorValue = DescriptorValue
> = D extends unknown ? (Type extends D["type"] ? D : never) : never;

/**
 * Retrieves an item in `descriptor` with the `key` as the given `valueType`.
 * @param descriptor
 * @param key
 * @param valueType Desired value type
 * @throws {MissingDescriptorKey} If the key does not exist
 * @throws {UnexpectedDescriptorValueType} If the value type does not match
 *    `valueType`
 */
export function getDescriptorValueAsType<Type extends DescriptorValueType>(
  descriptor: Descriptor,
  key: string,
  valueType: Type
): DescriptorValueWithType<Type> {
  const value = descriptor.items.get(key);

  if (!value) {
    throw new MissingDescriptorKey(`Cannot find key "${key}" in descriptor`);
  }

  if (value.type !== valueType) {
    throw new UnexpectedDescriptorValueType(
      `Unexpected descriptor value type: expected "${valueType}" but got "${value.type}"`
    );
  }

  return value as DescriptorValueWithType<Type>;
}
