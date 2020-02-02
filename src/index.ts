import { GraphQLObjectType, GraphQLScalarType, GraphQLSchema } from "graphql";
import { pascalCase } from "change-case";
import { upperCaseFirst } from "upper-case-first";
import { code, Code, imp } from "ts-poet";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import {
  isEnumType,
  isInputObjectType,
  isMappedType,
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

  const allTypesWithResolvers = [...typesThatNeedResolvers, ...typesThatMayHaveResolvers];

  const scalars = Object.values(schema.getTypeMap()).filter(isScalarType);

  generateTopLevelResolversType(chunks, typesThatMayHaveResolvers, typesThatNeedResolvers, scalars);

  generateEachResolverType(chunks, config, allTypesWithResolvers);

  generateDtosForNonMappedTypes(chunks, config, typesThatMayHaveResolvers);

  generateInputTypes(chunks, config, schema);

  generateEnums(chunks, config, schema);

  const content = await code`${chunks}`.toStringWithImports();
  return { content } as PluginOutput;
};

// Make the top-level Resolvers interface
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
  // Make each resolver for any output type, whether its required or optional
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
}

function generateDtosForNonMappedTypes(chunks: Code[], config: Config, typesThatMayHaveResolvers: GraphQLObjectType[]) {
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
}

// Input types
function generateInputTypes(chunks: Code[], config: Config, schema: GraphQLSchema): void {
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
}

function generateEnums(chunks: Code[], config: Config, schema: GraphQLSchema): void {
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
  mappers: Record<string, string>;
  enumValues: Record<string, string>;
};
