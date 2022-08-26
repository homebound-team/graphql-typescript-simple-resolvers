import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import { pascalCase } from "change-case";
import {
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  isInterfaceType,
  isNullableType,
  isUnionType,
} from "graphql";
import { code, Code, imp, joinCode } from "ts-poet";
import { upperCaseFirst } from "upper-case-first";
import {
  isEnumType,
  isInputObjectType,
  isMappedType,
  isNonNullType,
  isNotMetadataType,
  isObjectType,
  isQueryOrMutationType,
  isScalarType,
  isSubscriptionType,
  joinCodes,
  mapObjectType,
  mapType,
  toImp,
} from "./types";
import PluginOutput = Types.PluginOutput;
import { TypeMap } from "graphql/type/schema";

const builtInScalarsImps = ["Int", "Boolean", "String", "ID", "Float"];
const GraphQLScalarTypeSymbolImp = imp("GraphQLScalarType@graphql");
const GraphQLResolveInfoImp = imp("GraphQLResolveInfo@graphql");

/**
 * Generates Resolver/server-side type definitions for an Apollo-based GraphQL implementation.
 */
export const plugin: PluginFunction<Config> = async (schema, documents, configFromFile) => {
  // Load in a default config which ensures that `Record` fields are non-null
  const config = { ...defaultConfig, ...configFromFile };
  const chunks: Code[] = [];

  const interfaceTypes = Object.values(schema.getTypeMap()).filter(isInterfaceType);

  const typesThatNeedResolvers = Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .filter(t => needsResolver(config, t));

  const typesThatMayHaveResolvers = Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .filter(t => optionalResolver(config, t));

  const interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]> = new Map();
  Object.values(schema.getTypeMap())
    .filter(isObjectType)
    .forEach(t => {
      t.getInterfaces().forEach(it => {
        if (!interfaceToImpls.has(it)) {
          interfaceToImpls.set(it, []);
        }
        interfaceToImpls.get(it)!.push(t);
      });
    });

  const allTypesWithResolvers = [...typesThatNeedResolvers, ...typesThatMayHaveResolvers];

  const scalars = Object.values(schema.getTypeMap()).filter(isScalarType);

  // Make the top-level Resolvers interface
  generateTopLevelResolversType(chunks, typesThatMayHaveResolvers, typesThatNeedResolvers, scalars);

  // Make generic resolvers for interfaces
  generateEachInterfaceResolverType(chunks, config, interfaceToImpls, interfaceTypes);

  // Make union types of interfaces
  generateInterfaceUnionTypes(chunks, config, interfaceToImpls);

  // Make a UnionsResolver to ensure we have __resolveTypes
  generateUnionResolvers(chunks, config, schema.getTypeMap(), interfaceToImpls);

  // Make each resolver for any output type, whether its required or optional
  generateEachResolverType(chunks, config, interfaceToImpls, allTypesWithResolvers);

  // For the output types with optional resolvers, make DTOs for them. Mapped types don't need DTOs.
  generateDtosForNonMappedTypes(chunks, config, interfaceToImpls, [...typesThatMayHaveResolvers, ...interfaceTypes]);

  // Input types
  generateInputTypes(chunks, config, interfaceToImpls, schema);

  // Enums
  generateEnums(chunks, config, schema);

  // Union Types
  generateUnionTypes(chunks, config, interfaceToImpls, schema);

  const content = await code`${chunks}`.toStringWithImports();
  return { content } as PluginOutput;
};

function generateTopLevelResolversType(
  chunks: Code[],
  typesThatMayHaveResolvers: GraphQLObjectType[],
  typesThatNeedResolvers: GraphQLNamedType[],
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
        .filter(s => !builtInScalarsImps.includes(s.name))
        .map(s => {
          return code`${s.name}: ${GraphQLScalarTypeSymbolImp};`;
        })}
    }
  `;
  chunks.push(resolvers);
}

function generateEachInterfaceResolverType(
  chunks: Code[],
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
  allTypesWithResolvers: GraphQLInterfaceType[],
): void {
  const argDefs: Code[] = [];
  allTypesWithResolvers.forEach(type => {
    chunks.push(code`
      export interface ${type.name}Resolvers<T> {
        ${generateFieldSignature(type, config, interfaceToImpls, argDefs)}
      }
    `);
  });
  argDefs.forEach(a => chunks.push(a));
}

// Also add type unions of the possible types for use in code if desired
function generateInterfaceUnionTypes(
  chunks: Code[],
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
): void {
  interfaceToImpls.forEach((impls, inter) =>
    chunks.push(code`
  export type ${inter.name}Types = ${joinCodes(
      impls.map(imp => code`${mapObjectType(config, imp)}`),
      " | ",
    )};
  `),
  );
}

// Create a `UnionResolvers` with all unions/interfaces we might be asked to disambiguate.
function generateUnionResolvers(
  chunks: Code[],
  config: Config,
  typeMap: TypeMap,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
): void {
  const unions = Object.values(typeMap)
    .filter(t => isUnionType(t))
    .map(ut => {
      const types = (ut as GraphQLUnionType).getTypes().map(t => code`${mapObjectType(config, t)}`);
      return code`${ut.name}: { __resolveType(o: ${joinCodes(types, "|")}): string; };`;
    });
  interfaceToImpls.forEach((objects, inter) => {
    const types = objects.map(t => code`${mapObjectType(config, t)}`);
    unions.push(code`${inter.name}: { __resolveType(o: ${joinCodes(types, "|")}): string; };`);
  });
  chunks.push(code`
    export type UnionResolvers = {
      ${unions}
    }
  `);
}

function generateEachResolverType(
  chunks: Code[],
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
  allTypesWithResolvers: GraphQLObjectType[],
): void {
  const ctx = toImp(config.contextType);
  const argDefs: Code[] = [];
  allTypesWithResolvers.forEach(type => {
    const root = mapObjectType(config, type);
    chunks.push(code`
      export interface ${type.name}Resolvers ${extendInterfaces(type, root)} {
        ${generateFieldSignature(type, config, interfaceToImpls, argDefs)}
      }
    `);
  });
  chunks.push(code`
    type MaybePromise<T> = T | Promise<T>;
    export type Resolver<R, A, T> = (root: R, args: A, ctx: ${ctx}, info: ${GraphQLResolveInfoImp}) => MaybePromise<T>;
  `);
  // SubscriptionResolver based on functions defined in the "graphql-subscriptions" package.
  // We've added some typing for the rootValue, variableValues, and context.
  // Note: AsyncIterableIterator requires "esnext.asynciterable" (or just "esnext") to be defined
  // in the "lib" property in tsconfig.json.
  chunks.push(code`
    export type SubscriptionResolverFilter<R, A, T> = (root: R | undefined, args: A, ctx: ${ctx}, info: ${GraphQLResolveInfoImp}) => boolean | Promise<boolean>;
    export type SubscriptionResolver<R, A, T> = {
      subscribe: (root: R | undefined, args: A, ctx: ${ctx}, info: ${GraphQLResolveInfoImp}) => AsyncIterator<T>;
    }
  `);
  argDefs.forEach(a => chunks.push(a));
}

function generateFieldSignature(
  type: GraphQLObjectType | GraphQLInterfaceType,
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
  argDefs: Code[],
) {
  // For GraphQLObjectType, don't include fields which are coming from an implemented interface
  const excludeFields =
    type instanceof GraphQLObjectType ? type.getInterfaces().flatMap(i => Object.keys(i.getFields())) : [];

  return Object.values(type.getFields())
    .filter(f => !excludeFields.includes(f.name))
    .map(f => {
      const argsName = `${type.name}${upperCaseFirst(f.name)}Args`;
      const args = f.args.length > 0 ? argsName : "{}";
      if (f.args.length > 0) {
        argDefs.push(code`
          export interface ${argsName} {
            ${f.args.map(a => {
              const maybeOptional = isNullableType(a.type) ? "?" : "";
              return code`${a.name}${maybeOptional}: ${mapType(config, interfaceToImpls, a.type)}; `;
            })}
          }`);
      }

      const root = type instanceof GraphQLObjectType ? mapObjectType(config, type) : "T";
      const result = mapType(config, interfaceToImpls, f.type);
      if (isSubscriptionType(type)) {
        return code`${f.name}: SubscriptionResolver<${root}, ${args}, ${result}>;`;
      } else {
        return code`${f.name}: Resolver<${root}, ${args}, ${result}>;`;
      }
    });
}

function extendInterfaces(type: GraphQLObjectType, root: string): Code {
  const interfaces = joinCode(
    type.getInterfaces().map(i => code`${i.name}Resolvers<${root}>`),
    { on: ", " },
  );
  return interfaces ? code`extends ${interfaces}` : code``;
}

function generateDtosForNonMappedTypes(
  chunks: Code[],
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
  types: (GraphQLObjectType | GraphQLInterfaceType)[],
) {
  types.forEach(type => {
    chunks.push(code`
      export interface ${type.name} {
        ${Object.values(type.getFields()).map(f => {
          return code`${f.name}: ${mapType(config, interfaceToImpls, f.type, true)};`;
        })}
      }
    `);
  });
}

function generateInputTypes(
  chunks: Code[],
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
  schema: GraphQLSchema,
): void {
  Object.values(schema.getTypeMap())
    .filter(isInputObjectType)
    .forEach(type => {
      chunks.push(code`
        export interface ${type.name} {
          ${Object.values(type.getFields()).map(f => {
            const isNonNull = isNonNullType(f.type);
            const maybeOptional = !isNonNull ? "?" : "";
            return code`${f.name}${maybeOptional}: ${mapType(config, interfaceToImpls, f.type, true)};`;
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

function generateUnionTypes(
  chunks: Code[],
  config: Config,
  interfaceToImpls: Map<GraphQLInterfaceType, GraphQLObjectType[]>,
  schema: GraphQLSchema,
): void {
  Object.values(schema.getTypeMap())
    .filter(isUnionType)
    .filter(isNotMetadataType)
    .forEach(type => {
      chunks.push(code`
        export type ${type.name} = ${joinCodes(
        type.getTypes().map(t => mapType(config, interfaceToImpls, t, false, false)),
        " | ",
      )}
      `);
    });
}

function needsResolver(config: Config, t: GraphQLObjectType | GraphQLInterfaceType): boolean {
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
