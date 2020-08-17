import {
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  isInterfaceType,
  isNullableType,
} from "graphql";
import { pascalCase } from "change-case";
import { upperCaseFirst } from "upper-case-first";
import { code, Code, imp } from "ts-poet";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import {
  isEnumType,
  isInputObjectType,
  isMappedType,
  isNonNullType,
  isNotMetadataType,
  isObjectType,
  isQueryOrMutationType,
  isScalarType,
  mapObjectType,
  mapType,
  toImp,
} from "./types";
import PluginOutput = Types.PluginOutput;

const builtInScalars = ["Int", "Boolean", "String", "ID", "Float"];
const GraphQLScalarTypeSymbol = imp("GraphQLScalarType@graphql");
const GraphQLResolveInfo = imp("GraphQLResolveInfo@graphql");

/**
 * Generates Resolver/server-side type definitions for an Apollo-based GraphQL implementation.
 */
export const plugin: PluginFunction<Config> = async (schema, documents, configFromFile) => {
  // Load in a default config which ensures that `Record` fields are non-null
  const config = { ...defaultConfig, ...configFromFile };
  const chunks: Code[] = [];

  const typesThatNeedResolvers = Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .filter(t => needsResolver(config, t));

  const typesThatMayHaveResolvers = Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .filter(t => optionalResolver(config, t));

  const allTypesWithResolvers = [...typesThatNeedResolvers, ...typesThatMayHaveResolvers];

  const scalars = Object.values(schema.getTypeMap()).filter(isScalarType);

  // Make the top-level Resolvers interface
  generateTopLevelResolversType(chunks, typesThatMayHaveResolvers, typesThatNeedResolvers, scalars);

  // Make each resolver for any output type, whether its required or optional
  generateEachResolverType(chunks, config, allTypesWithResolvers);

  // For the output types with optional resolvers, make DTOs for them. Mapped types don't need DTOs.
  const interfaceTypes = Object.values(schema.getTypeMap()).filter(isInterfaceType);
  generateDtosForNonMappedTypes(chunks, config, [...typesThatMayHaveResolvers, ...interfaceTypes]);

  // Input types
  generateInputTypes(chunks, config, schema);

  // Enums
  generateEnums(chunks, config, schema);

  const content = await code`${chunks}`.toStringWithImports();
  return { content } as PluginOutput;
};

function generateTopLevelResolversType(
  chunks: Code[],
  typesThatMayHaveResolvers: GraphQLObjectType[],
  typesThatNeedResolvers: GraphQLObjectType[],
  scalars: GraphQLScalarType[],
): void {
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
}

function generateEachResolverType(chunks: Code[], config: Config, allTypesWithResolvers: GraphQLObjectType[]) {
  const ctx = toImp(config.contextType);
  const argDefs: Code[] = [];
  allTypesWithResolvers.forEach(type => {
    chunks.push(code`
      export interface ${type.name}Resolvers {
        ${Object.values(type.getFields()).map(f => {
          const argsName = `${type.name}${upperCaseFirst(f.name)}Args`;
          const args = f.args.length > 0 ? argsName : "{}";
          if (f.args.length > 0) {
            argDefs.push(code`
              export interface ${argsName} {
                ${f.args.map(a => {
                  const maybeOptional = isNullableType(a.type) ? "?" : "";
                  return code`${a.name}${maybeOptional}: ${mapType(config, a.type)}; `;
                })}
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
    export type Resolver<R, A, T> = (root: R, args: A, ctx: ${ctx}, info: ${GraphQLResolveInfo}) => T | Promise<T>;
  `);
  argDefs.forEach(a => chunks.push(a));
}

function generateDtosForNonMappedTypes(
  chunks: Code[],
  config: Config,
  types: (GraphQLObjectType | GraphQLInterfaceType)[],
) {
  types.forEach(type => {
    chunks.push(code`
      export interface ${type.name} {
        ${Object.values(type.getFields()).map(f => {
          return code`${f.name}: ${mapType(config, f.type)};`;
        })}
      }
    `);
  });
}

function generateInputTypes(chunks: Code[], config: Config, schema: GraphQLSchema): void {
  Object.values(schema.getTypeMap())
    .filter(isInputObjectType)
    .forEach(type => {
      chunks.push(code`
        export interface ${type.name} {
          ${Object.values(type.getFields()).map(f => {
            const isNonNull = isNonNullType(f.type);
            const maybeOptional = !isNonNull ? "?" : "";
            return code`${f.name}${maybeOptional}: ${mapType(config, f.type)};`;
          })}
        }
    `);
    });
}

function generateEnums(chunks: Code[], config: Config, schema: GraphQLSchema): void {
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
}

function needsResolver(config: Config, t: GraphQLObjectType): boolean {
  return isNotMetadataType(t) && (isMappedType(t, config) || isQueryOrMutationType(t));
}

function optionalResolver(config: Config, t: GraphQLObjectType): boolean {
  return isNotMetadataType(t) && !isMappedType(t, config) && !isQueryOrMutationType(t);
}

/** The config values we read from the graphql-codegen.yml file. */
export type Config = {
  contextType: string;
  scalars: Record<string, string>;
  mappers: Record<string, string>;
  enumValues: Record<string, string>;
};

const defaultConfig: Omit<Config, "contextType"> = {
  scalars: {},
  mappers: {},
  enumValues: {},
};
