// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {
  Descriptor,
  DescriptorValue,
  DescriptorValueType,
  Reference,
  ReferenceType,
  UnitFloatType,
  VersionedDescriptor,
} from "../interfaces";
import {
  Cursor,
  DuplicateDescriptorKey,
  InvalidDescriptorType,
  InvalidDescriptorVersion,
  InvalidReferenceType,
  InvalidUnitFloatType,
} from "../utils";

/**
 * Reads a {@link Descriptor} from the current {@link cursor} position.
 * @param cursor
 */
export function readDescriptor(cursor: Cursor): Descriptor {
  const name = cursor.readUnicodeString(0);
  const classId = cursor.readIdString();
  const itemCount = cursor.read("u32");

  const items = new Map<string, DescriptorValue>();
  while (items.size < itemCount) {
    const key = cursor.readIdString();
    const value = readDescriptorValue(cursor);
    if (items.has(key)) {
      // If this ever happens, it means that descriptors can store duplicate
      // keys, and therefore cannot be represented safely as Maps.
      // Since other PSD parsers (psd.js, psd-tools, psd.rb) are already using
      // dictionary-like structures to store descriptors, we follow suit.
      throw new DuplicateDescriptorKey(`Duplicate descriptor key: ${key}`);
    }
    items.set(key, value);
  }

  return {name, classId, items};
}

/**
 * Reads a {@link VersionedDescriptor} from the current {@link cursor} position.
 */
export function readVersionedDescriptor(cursor: Cursor): VersionedDescriptor {
  const descriptorVersion = cursor.read("u32");
  if (descriptorVersion !== 16) {
    throw new InvalidDescriptorVersion(
      `Invalid descriptor version: ${descriptorVersion}`
    );
  }

  const descriptor = readDescriptor(cursor);

  return {descriptorVersion, descriptor};
}

/**
 * Reads a {@link DescriptorValue} from the current {@link cursor} position.
 * @param cursor
 */
function readDescriptorValue(cursor: Cursor): DescriptorValue {
  const type = cursor.readString(4) as DescriptorValueType;

  switch (type) {
    case DescriptorValueType.Alias: {
      const length = cursor.read("u32");
      const data = cursor.take(length);
      return {type, data};
    }
    case DescriptorValueType.Boolean: {
      const value = Boolean(cursor.read("u8"));
      return {type, value};
    }
    case DescriptorValueType.Class:
    case DescriptorValueType.GlobalClass: {
      const name = cursor.readUnicodeString(0);
      const classId = cursor.readIdString();
      return {type, name, classId};
    }
    case DescriptorValueType.Descriptor:
    case DescriptorValueType.GlobalObject: {
      const descriptor = readDescriptor(cursor);
      return {type, descriptor};
    }
    case DescriptorValueType.Double: {
      const value = cursor.read("f64");
      return {type, value};
    }
    case DescriptorValueType.Enumerated: {
      const enumType = cursor.readIdString();
      const enumValue = cursor.readIdString();
      return {type, enumType, enumValue};
    }
    case DescriptorValueType.Integer: {
      const value = cursor.read("i32");
      return {type, value};
    }
    case DescriptorValueType.LargeInteger: {
      const value = cursor.read("i64");
      return {type, value};
    }
    case DescriptorValueType.List: {
      const valueCount = cursor.read("u32");

      const values: DescriptorValue[] = [];
      while (values.length < valueCount) {
        values.push(readDescriptorValue(cursor));
      }

      return {type, values};
    }
    case DescriptorValueType.RawData: {
      // The Adobe spec document is unclear on how this section is structured;
      // We assume it's similar to text engine data
      const size = cursor.read("u32");
      const data = cursor.take(size);
      return {type, data};
    }
    case DescriptorValueType.Reference: {
      const itemCount = cursor.read("u32");

      const references: Reference[] = [];
      while (references.length < itemCount) {
        references.push(readReference(cursor));
      }

      return {type, references};
    }
    case DescriptorValueType.String: {
      const value = cursor.readUnicodeString(0);
      return {type, value};
    }
    case DescriptorValueType.UnitFloat: {
      const unitType = matchUnitFloatType(cursor.readString(4));
      const value = cursor.read("f64");
      return {type, unitType, value};
    }
    default:
      throw new InvalidDescriptorType(`Unexpected descriptor type: ${type}`);
  }
}

/**
 * Reads a {@link Reference} from the current {@link cursor} position.
 * @param cursor
 */
function readReference(cursor: Cursor): Reference {
  const type = cursor.readString(4) as ReferenceType;

  switch (type) {
    case ReferenceType.Class: {
      const name = cursor.readUnicodeString(0);
      const classId = cursor.readIdString();
      return {type, name, classId};
    }
    case ReferenceType.Enumerated: {
      const name = cursor.readUnicodeString(0);
      const classId = cursor.readIdString();
      const typeId = cursor.readIdString();
      const enumValue = cursor.readIdString();
      return {type, name, classId, typeId, enumValue};
    }
    case ReferenceType.Identifier: {
      // This is undocumented in Adobe's PSD file format docs
      const identifier = cursor.readString(4);
      return {type, identifier};
    }
    case ReferenceType.Index: {
      // This is undocumented in Adobe's PSD file format docs
      const index = cursor.read("u32");
      return {type, index};
    }
    case ReferenceType.Name: {
      // This is undocumented in Adobe's PSD file format docs
      const name = cursor.readUnicodeString(0);
      return {type, name};
    }
    case ReferenceType.Offset: {
      const name = cursor.readUnicodeString(0);
      const classId = cursor.readIdString();
      const offset = cursor.read("u32");
      return {type, name, classId, offset};
    }
    case ReferenceType.Property: {
      const name = cursor.readUnicodeString(0);
      const classId = cursor.readIdString();
      const keyId = cursor.readIdString();
      return {type, name, classId, keyId};
    }
    default:
      throw new InvalidReferenceType(`Invalid reference type: ${type}`);
  }
}

function matchUnitFloatType(unitFloatType: string): UnitFloatType {
  if (!Object.values(UnitFloatType).includes(unitFloatType as UnitFloatType)) {
    throw new InvalidUnitFloatType(`Invalid Unit Float type: ${unitFloatType}`);
  }

  return unitFloatType as UnitFloatType;
}
