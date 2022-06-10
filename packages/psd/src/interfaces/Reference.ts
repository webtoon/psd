// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

/**
 * References are used to store dictionary-like data inside Descriptors.
 * (Descriptors can be nested, but References cannot.)
 * @see Descriptor
 */
export type Reference =
  | ClassReference
  | EnumeratedReference
  | IdentifierReference
  | IndexReference
  | NameReference
  | OffsetReference
  | PropertyReference;

interface ReferenceBase<Type extends ReferenceType> {
  type: Type;
}

/** Valid values for the `type` field in `Reference` objects. */
export enum ReferenceType {
  Class = "Clss",
  Enumerated = "Enmr",
  Identifier = "Idnt",
  Index = "indx",
  Name = "name",
  Offset = "rele",
  Property = "prop",
}

export interface ClassReference extends ReferenceBase<ReferenceType.Class> {
  name: string;
  classId: string;
}

export interface EnumeratedReference
  extends ReferenceBase<ReferenceType.Enumerated> {
  name: string;
  classId: string;
  typeId: string;
  enumValue: string;
}

export interface IdentifierReference
  extends ReferenceBase<ReferenceType.Identifier> {
  identifier: string;
}

export interface IndexReference extends ReferenceBase<ReferenceType.Index> {
  index: number;
}

export interface NameReference extends ReferenceBase<ReferenceType.Name> {
  name: string;
}

export interface OffsetReference extends ReferenceBase<ReferenceType.Offset> {
  name: string;
  classId: string;
  /** 32-bit hexadecimal integer */
  offset: number;
}

export interface PropertyReference
  extends ReferenceBase<ReferenceType.Property> {
  name: string;
  classId: string;
  keyId: string;
}
