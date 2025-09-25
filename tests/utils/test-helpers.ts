import { buildSchema, GraphQLSchema } from "graphql";
import { plugin, Config } from "../../src/index";

/**
 * Test helper to create a GraphQL schema from SDL string
 */
export function createTestSchema(sdl: string): GraphQLSchema {
  return buildSchema(sdl);
}

/**
 * Test helper to run the plugin with a given schema and config
 */
export async function runPlugin(schema: GraphQLSchema, configOverrides: Partial<Config> = {}): Promise<string> {
  const defaultConfig = {
    contextType: "./context#Context",
    scalars: {},
    mappers: {},
    enumValues: {},
  };
  const config = {
    ...defaultConfig,
    ...configOverrides,
  };
  const result = await plugin(schema, [], config);
  return typeof result === "string" ? result : (result as any).content;
}
