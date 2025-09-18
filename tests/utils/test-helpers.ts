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
export async function runPlugin(
  schema: GraphQLSchema,
  config: Omit<Config, "contextType"> & { contextType?: string },
): Promise<string> {
  const fullConfig: Config = {
    contextType: "./context#Context",
    ...config,
  };
  const result = await plugin(schema, [], fullConfig);
  return typeof result === "string" ? result : (result as any).content;
}
