import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
} from "graphql";
import { arrayOf, code, Code, imp } from "ts-poet";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import PluginOutput = Types.PluginOutput;

export const plugin: PluginFunction<Config> = async (schema, documents, config) => {
  const chunks: Code[] = [];

  const typesThatNeedResolvers = Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .filter(t => needsResolver(config, t));

  const typesThatMayHaveResolvers = Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .filter(t => optionalResolver(config, t));

  // Make the top-level Resolvers interface
  const resolvers = code`
    export interface Resolvers {
      ${typesThatNeedResolvers.map(o => {
        return `${o.name}: ${o.name}Resolvers;`;
      })} 
      ${typesThatMayHaveResolvers.map(o => {
        return `${o.name}?: ${o.name}Resolvers;`;
      })} 
    }
  `;
  chunks.push(resolvers);

  // Make each resolver for any output type, whether its required or optional
  const ctx = toImp(config.contextType);
  [...typesThatNeedResolvers, ...typesThatMayHaveResolvers].forEach(type => {
    chunks.push(code`
      export interface ${type.name}Resolvers {
        ${Object.values(type.getFields()).map(f => {
          const root = mapObjectType(config, type);
          const args = code`{
            ${f.args.map(a => code`${a.name}: ${mapType(config, a.type)}; `)}
          }`;
          const result = mapType(config, f.type);
          return code`${f.name}(root: ${root}, args: ${args}, ctx: ${ctx}): MaybePromise<${result}>;`;
        })}
      }
    `);
  });

  // For the output types with optional resolvers, make DTOs for them
  typesThatMayHaveResolvers.forEach(type => {
    chunks.push(code`
      export interface ${type.name} {
        ${Object.values(type.getFields()).map(f => {
          return code`${f.name}: ${mapType(config, f.type)};`;
        })}
      }
    `);
  });

  Object.values(schema.getTypeMap())
    .filter(t => t instanceof GraphQLInputObjectType)
    .forEach(type => {
      chunks.push(code`
      export interface ${type.name} {
      }
    `);
    });

  chunks.push(maybePromise);

  const content = await code`${chunks}`.toStringWithImports();
  return { content } as PluginOutput;
};

/** Turns a generic `type` into a TS type, note that we detect non-nulls which means types are initially assumed nullable. */
function mapType(config: Config, type: GraphQLOutputType | GraphQLInputObjectType): any {
  if (type instanceof GraphQLNonNull) {
    const sub = mapType(config, type.ofType);
    return stripNullable(sub);
  } else if (type instanceof GraphQLList) {
    const sub = mapType(config, type.ofType);
    return nullableOf(code`${sub}[]`);
  } else if (type instanceof GraphQLObjectType) {
    return nullableOf(mapObjectType(config, type));
  } else if (type instanceof GraphQLScalarType) {
    return nullableOf(mapScalarType(type));
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

function mapScalarType(type: GraphQLScalarType): string {
  if (type.name === "String") {
    return "string";
  } else if (type.name === "Int") {
    return "number";
  } else if (type.name === "ID") {
    return "string";
  } else {
    return type.name.toString().toLowerCase();
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

function needsResolver(config: Config, t: GraphQLObjectType): boolean {
  return !t.name.startsWith("__") && (!!config.mappers[t.name] || t.name === "Query" || t.name === "Mutation");
}

function optionalResolver(config: Config, t: GraphQLObjectType): boolean {
  return !t.name.startsWith("__") && !config.mappers[t.name] && t.name !== "Query" && t.name !== "Mutation";
}

/** The config values we read from the graphql-codegen.yml file. */
type Config = {
  contextType: string;
  mappers: Record<string, string>;
  enumValues: Record<string, string>;
};

const maybePromise = code`
  type MaybePromise<T> = T | Promise<T>
`;
