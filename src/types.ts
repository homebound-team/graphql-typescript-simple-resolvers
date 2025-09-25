import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLUnionType,
} from "graphql";
import { parseMapper, isExternalMapperType } from "@graphql-codegen/visitor-plugin-common";
import { Code, code, imp } from "ts-poet";
import { Config } from "./index";

/** Turns a generic `type` into a TS type, note that we detect non-nulls which means types are initially assumed nullable. */
export function mapType(
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
  type: GraphQLOutputType | GraphQLInputType,
  isInputOrDto = false,
  isNullable = true,
): Code {
  // GraphQL types default to nullable, unless we have a parent GraphQLNonNull that told us not to be
  function maybeNull(type: Code) {
    return isNullable ? code`${type} | null | undefined` : type;
  }
  if (isNonNullType(type)) {
    return mapType(config, interfaceToImpls, type.ofType, isInputOrDto, false);
  } else if (type instanceof GraphQLList) {
    const elementType = mapType(config, interfaceToImpls, type.ofType, isInputOrDto);
    const isUnion =
      type.ofType instanceof GraphQLInterfaceType ||
      (type.ofType instanceof GraphQLNonNull && type.ofType.ofType instanceof GraphQLInterfaceType);
    const isNullable = !(type.ofType instanceof GraphQLNonNull);
    if (isUnion || isNullable) {
      const maybeReadonly = isInputOrDto ? "" : "Readonly";
      return maybeNull(code`${maybeReadonly}Array<${elementType}>`);
    } else {
      const maybeReadonly = isInputOrDto ? "" : "readonly ";
      return maybeNull(code`${maybeReadonly}${elementType}[]`);
    }
  } else if (type instanceof GraphQLObjectType) {
    return maybeNull(code`${mapObjectType(config, type)}`);
  } else if (type instanceof GraphQLInterfaceType) {
    return maybeNull(code`${mapInterfaceType(config, interfaceToImpls, type)}`);
  } else if (type instanceof GraphQLScalarType) {
    return maybeNull(code`${mapScalarType(config, type)}`);
  } else if (type instanceof GraphQLEnumType) {
    return maybeNull(code`${mapEnumType(config, type)}`);
  } else if (type instanceof GraphQLInputObjectType) {
    return maybeNull(code`${type.name}`);
  } else if (type instanceof GraphQLUnionType) {
    return maybeNull(code`${type.name}`);
  } else {
    throw new Error(`Unsupported type ${type}`);
  }
}

export function mapObjectType(config: Config, type: GraphQLNamedType): any {
  if (isQueryOrMutationType(type)) {
    return "{}";
  }
  return toImp(config.mappers[type.name], type.name) || type.name;
}

export function mapInterfaceType(
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
  type: GraphQLInterfaceType,
): any {
  if (isMappedType(type, config)) {
    return mapObjectType(config, type);
  }
  const impls = interfaceToImpls.get(type);
  if (!impls) {
    return type.name;
  }
  return joinCodes(
    [...impls.filter((i) => isMappedType(i, config)).map((i) => mapObjectType(config, i)), type.name],
    " | ",
  );
}

function mapEnumType(config: Config, type: GraphQLEnumType): any {
  return toImp(config.enumValues[type.name], type.name) || type.name;
}

function mapScalarType(config: Config, type: GraphQLScalarType): string | Code {
  if (type.name === "String" || type.name === "ID") {
    return "string";
  } else if (type.name === "Int" || type.name === "Float") {
    return "number";
  } else if (type.name === "Boolean") {
    return "boolean";
  } else {
    return (toImp(config.scalars[type.name], type.name) as string | Code) || type.name.toString();
  }
}

/**
 * Parses a mapper specification and returns structured information about external mappers.
 * Supports both traditional format (path#symbol) and subpath imports (#src/path#symbol).
 */
export function parseExternalMapper(spec: string): {
  isExternal: boolean;
  isDefault: boolean;
  import: string;
  source: string;
  type: string;
} {
  const parsed = parseMapper(spec);
  const isExternal = isExternalMapperType(parsed);

  return {
    isExternal,
    isDefault: isExternal ? parsed.default : false,
    import: isExternal ? parsed.import : spec,
    source: isExternal ? parsed.source : "",
    type: parsed.type,
  };
}

// Maps the graphql-code-generation convention of `@src/context#Context` to ts-poet's `Context@@src/context`.
export function toImp(spec: string | undefined, typeName?: string): unknown {
  if (!spec) {
    return undefined;
  }
  const mapper = parseExternalMapper(spec);
  if (mapper.isExternal) {
    // For default imports, use ts-poet = syntax with the type name as the import alias
    if (mapper.isDefault && typeName) {
      return imp(`${typeName}=${mapper.source}`);
    }
    // For named imports, use the import element (which may include 'as' aliasing)
    return imp(`${mapper.import}@${mapper.source}`);
  } else {
    // Internal mapper, just return the type as-is
    return mapper.type;
  }
}

export function isObjectType(t: GraphQLNamedType): t is GraphQLObjectType {
  return t instanceof GraphQLObjectType;
}

export function isNonNullType(t: GraphQLOutputType | GraphQLInputType): t is GraphQLNonNull<any> {
  return t instanceof GraphQLNonNull;
}

export function isInputObjectType(t: GraphQLNamedType): t is GraphQLInputObjectType {
  return t instanceof GraphQLInputObjectType;
}

export function isEnumType(t: GraphQLNamedType): t is GraphQLEnumType {
  return t instanceof GraphQLEnumType;
}

export function isScalarType(t: GraphQLNamedType): t is GraphQLScalarType {
  return t instanceof GraphQLScalarType;
}

export function isNotMetadataType(t: GraphQLNamedType): boolean {
  return !t.name.startsWith("__");
}

export function isQueryOrMutationType(type: GraphQLNamedType) {
  return type.name === "Query" || type.name === "Mutation";
}

export function isSubscriptionType(type: GraphQLNamedType) {
  return type.name === "Subscription";
}

export function isMappedType(type: GraphQLNamedType, config: Config) {
  return !!config.mappers[type.name];
}

/** A `.join(...)` that doesn't `toString()` elements so that they can stay codes. */
export function joinCodes(elements: unknown[], delimiter: string): unknown[] {
  const result: unknown[] = [delimiter];
  for (let i = 0; i < elements.length; i++) {
    result.push(elements[i]);
    if (i !== elements.length - 1) {
      result.push(delimiter);
    }
  }
  return result;
}
