import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
} from "graphql";
import { code, imp } from "ts-poet";
import { Config } from "./index";

/** Turns a generic `type` into a TS type, note that we detect non-nulls which means types are initially assumed nullable. */
export function mapType(config: Config, type: GraphQLOutputType | GraphQLInputObjectType): any {
  if (type instanceof GraphQLNonNull) {
    // Recurse and assume our recursion will come back nullable, which we strip.
    return stripNullable(mapType(config, type.ofType));
  } else {
    // Mark whatever type we're on as assumed-nullable, which will be stripped
    // if we're wrapped by a GraphQLNonNull type.
    return nullableOf(
      (() => {
        if (type instanceof GraphQLList) {
          return code`${mapType(config, type.ofType)}[]`;
        } else if (type instanceof GraphQLObjectType) {
          return mapObjectType(config, type);
        } else if (type instanceof GraphQLScalarType) {
          return mapScalarType(type);
        } else if (type instanceof GraphQLEnumType) {
          return mapEnumType(config, type);
        } else if (type instanceof GraphQLInputObjectType) {
          return type.name;
        } else {
          throw new Error(`Unsupported type ${type}`);
        }
      })(),
    );
  }
}

export function mapObjectType(config: Config, type: GraphQLObjectType): any {
  if (type.name === "Query" || type.name === "Mutation") {
    return "{}";
  }
  return toImp(config.mappers[type.name]) || type.name;
}

function mapEnumType(config: Config, type: GraphQLEnumType): any {
  return toImp(config.enumValues[type.name]) || type.name;
}

function mapScalarType(type: GraphQLScalarType): string {
  if (type.name === "String" || type.name === "ID") {
    return "string";
  } else if (type.name === "Int" || type.name === "Float") {
    return "number";
  } else {
    return type.name.toString();
  }
}

/** Marks `type` as nullable in a way that both will be output correctly by ts-poet + can be undone. */
function nullableOf(type: unknown): unknown {
  return [type, "| null"];
}

/** Unmarks `type` as nullable, i.e. types are always nullable until unwrapped by a GraphQLNonNull parent. */
function stripNullable(type: unknown): unknown {
  if (type instanceof Array && type.length == 2 && type[1] === "| null") {
    return type[0];
  } else {
    return type;
  }
}

// Maps the graphql-code-generation convention of `@src/context#Context` to ts-poet's `Context@@src/context`.
export function toImp(spec: string | undefined): unknown {
  if (!spec) {
    return undefined;
  }
  const [path, symbol] = spec.split("#");
  return imp(`${symbol}@${path}`);
}

export function isObjectType(t: GraphQLNamedType): t is GraphQLObjectType {
  return t instanceof GraphQLObjectType;
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
