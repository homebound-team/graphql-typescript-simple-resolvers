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
import { pascalCase } from "change-case";
import { upperCaseFirst } from "upper-case-first";
import { code, Code, imp } from "ts-poet";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import PluginOutput = Types.PluginOutput;

const builtInScalars = ["Int", "Boolean", "String", "ID", "Float"];
const GraphQLScalarTypeSymbol = imp("GraphQLScalarType@graphql");
const GraphQLResolveInfo = imp("GraphQLResolveInfo@graphql");

/**
 * Generates Resolver type definitions.
 *
 * In theory the output is generally the same as the `typescript-resolvers` plugin, except ours
 * is:
 *
 * a) generally much simpler (i.e. it is a dedicted-to-resolvers plugin and so doesn't have to
 * monkey-patch the out-of-the-box `tyepscript` plugin types with `Omit`s for every mpped type , and
 *
 * b) has better support for avoidOptionals, we only require resolvers for non-mapped types.
 */
export const plugin: PluginFunction<Config> = async (schema, documents, config) => {
  const chunks: Code[] = [];

  const typesThatNeedResolvers = Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .filter(t => needsResolver(config, t));

  const typesThatMayHaveResolvers = Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .filter(t => optionalResolver(config, t));

  const scalars = Object.values(schema.getTypeMap()).filter(isScalarType);

  // Make the top-level Resolvers interface
  const resolvers = code`
    export interface Resolvers {
      ${typesThatNeedResolvers.map(o => {
        return `${o.name}: ${o.name}Resolvers;`;
      })} 
      ${typesThatMayHaveResolvers.map(o => {
        return `${o.name}?: ${o.name}Resolvers;`;
      })} 
      ${scalars
        .filter(s => !builtInScalars.includes(s.name))
        .map(s => {
          return code`${s.name}: ${GraphQLScalarTypeSymbol};`;
        })}
    }
  `;
  chunks.push(resolvers);

  // Make each resolver for any output type, whether its required or optional
  const ctx = toImp(config.contextType);
  const argDefs: Code[] = [];
  [...typesThatNeedResolvers, ...typesThatMayHaveResolvers].forEach(type => {
    chunks.push(code`
      export interface ${type.name}Resolvers {
        ${Object.values(type.getFields()).map(f => {
          const argsName = `${type.name}${upperCaseFirst(f.name)}Args`;
          const args = f.args.length > 0 ? argsName : "{}";
          if (f.args.length > 0) {
            argDefs.push(code`
              export interface ${argsName} {
                ${f.args.map(a => code`${a.name}: ${mapType(config, a.type)}; `)}
              }`);
          }

          const root = mapObjectType(config, type);
          const result = mapType(config, f.type);
          return code`${f.name}: Resolver<${root}, ${args}, ${result}>;`;
        })}
      }
    `);
  });
  chunks.push(code`
    type Resolver<R, A, T> = (root: R, args: A, ctx: ${ctx}, info: ${GraphQLResolveInfo}) => T | Promise<T>;
  `);
  argDefs.forEach(a => chunks.push(a));

  // For the output types with optional resolvers, make DTOs for them. Mapped types don't need DTOs.
  typesThatMayHaveResolvers.forEach(type => {
    chunks.push(code`
      export interface ${type.name} {
        ${Object.values(type.getFields()).map(f => {
          return code`${f.name}: ${mapType(config, f.type)};`;
        })}
      }
    `);
  });

  // Input types
  Object.values(schema.getTypeMap())
    .filter(isInputObjectType)
    .forEach(type => {
      chunks.push(code`
        export interface ${type.name} {
          ${Object.values(type.getFields()).map(f => {
            return code`${f.name}: ${mapType(config, f.type)};`;
          })}
        }
    `);
    });

  // Enums
  Object.values(schema.getTypeMap())
    .filter(isEnumType)
    .filter(isNotMetadataType)
    .forEach(type => {
      const mappedEnum = config.enumValues[type.name];
      if (!mappedEnum) {
        chunks.push(code`
          export enum ${type.name} {
            ${type.getValues().map(v => `${pascalCase(v.value)} = "${v.value}",`)}
          }
       `);
      } else {
        const [path, symbol] = mappedEnum.split("#");
        chunks.push(code`
          export { ${symbol} } from "${path}";
        `);
      }
    });

  const content = await code`${chunks}`.toStringWithImports();
  return { content } as PluginOutput;
};

/** Turns a generic `type` into a TS type, note that we detect non-nulls which means types are initially assumed nullable. */
function mapType(config: Config, type: GraphQLOutputType | GraphQLInputObjectType): any {
  if (type instanceof GraphQLNonNull) {
    const sub = mapType(config, type.ofType);
    return stripNullable(sub);
  } else if (type instanceof GraphQLList) {
    return nullableOf(code`${mapType(config, type.ofType)}[]`);
  } else if (type instanceof GraphQLObjectType) {
    return nullableOf(mapObjectType(config, type));
  } else if (type instanceof GraphQLScalarType) {
    return nullableOf(mapScalarType(type));
  } else if (type instanceof GraphQLEnumType) {
    return nullableOf(mapEnumType(config, type));
  } else if (type instanceof GraphQLInputObjectType) {
    return nullableOf(type.name);
  } else {
    throw new Error(`Unsupported type ${type}`);
  }
}

function mapObjectType(config: Config, type: GraphQLObjectType): any {
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
function toImp(spec: string | undefined): unknown {
  if (!spec) {
    return undefined;
  }
  const [path, symbol] = spec.split("#");
  return imp(`${symbol}@${path}`);
}

function isObjectType(t: GraphQLNamedType): t is GraphQLObjectType {
  return t instanceof GraphQLObjectType;
}

function isInputObjectType(t: GraphQLNamedType): t is GraphQLInputObjectType {
  return t instanceof GraphQLInputObjectType;
}

function isEnumType(t: GraphQLNamedType): t is GraphQLEnumType {
  return t instanceof GraphQLEnumType;
}

function isScalarType(t: GraphQLNamedType): t is GraphQLScalarType {
  return t instanceof GraphQLScalarType;
}

function needsResolver(config: Config, t: GraphQLObjectType): boolean {
  return isNotMetadataType(t) && (!!config.mappers[t.name] || t.name === "Query" || t.name === "Mutation");
}

function optionalResolver(config: Config, t: GraphQLObjectType): boolean {
  return isNotMetadataType(t) && !config.mappers[t.name] && t.name !== "Query" && t.name !== "Mutation";
}

function isNotMetadataType(t: GraphQLNamedType): boolean {
  return !t.name.startsWith("__");
}

/** The config values we read from the graphql-codegen.yml file. */
type Config = {
  contextType: string;
  mappers: Record<string, string>;
  enumValues: Record<string, string>;
};
