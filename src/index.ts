import { Code, code } from "ts-poet";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import PluginOutput = Types.PluginOutput;

export const plugin: PluginFunction = async (schema, documents) => {
  const chunks: Code[] = [];
  const content = await code`${chunks}`.toStringWithImports();
  return { content } as PluginOutput;
};
