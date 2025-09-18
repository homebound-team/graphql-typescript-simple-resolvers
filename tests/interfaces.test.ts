import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Interface Support", () => {
  const schemaWithInterfaces = `
    interface HasName {
      name: String!
    }

    interface FieldWithArgs {
      field1(input: Boolean): Boolean
    }

    interface Node {
      id: ID!
    }

    type Author implements HasName & FieldWithArgs & Node {
      id: ID!
      name: String!
      bio: String
      field1(input: Boolean): Boolean
    }

    type Book implements HasName & Node {
      id: ID!
      name: String!
      isbn: String
    }

    type Article implements HasName {
      name: String!
      content: String!
    }

    # Type that uses interfaces in its fields
    type Container {
      item: HasName
      requiredItem: HasName!
      items: [HasName!]
      requiredItems: [HasName!]!
      nodeItem: Node
      nodeItems: [Node!]!
    }

    type Query {
      getByName(name: String!): HasName
      getAllNamed: [HasName!]!
      getNode(id: ID!): Node
      container: Container!
    }
  `;

  it("generates interface types", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface HasName {
  name: string;
}`);

    expect(code).toContain(`export interface FieldWithArgs {
  field1: boolean | null | undefined;
}`);

    expect(code).toContain(`export interface Node {
  id: string;
}`);
  });

  it("generates types implementing interfaces", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface Author {
  id: string;
  name: string;
  bio: string | null | undefined;
  field1: boolean | null | undefined;
}`);
  });

  it("generates union types for interfaces with implementations", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain("export type HasNameTypes = Author | Book | Article;");
    expect(code).toContain("export type NodeTypes = Author | Book;");
  });

  it("handles interfaces in field types with correct nullability", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface Container {
  item: HasName | null | undefined;
  requiredItem: HasName;
  items: Array<HasName> | null | undefined;
  requiredItems: Array<HasName>;
  nodeItem: Node | null | undefined;
  nodeItems: Array<Node>;
}`);
  });

  it("generates interface resolvers", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export type UnionResolvers = {
  HasName: { __resolveType(o: Author | Book | Article): string };
  FieldWithArgs: { __resolveType(o: Author): string };
  Node: { __resolveType(o: Author | Book): string };
};`);
  });

  it("generates resolvers for interfaces with args", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface FieldWithArgsResolvers<T> {
  field1: Resolver<T, FieldWithArgsField1Args, boolean | null | undefined>;
}`);
  });

  it("handles query resolvers returning interfaces", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`getByName: Resolver<{}, QueryGetByNameArgs, HasName | null | undefined>;`);
    expect(code).toContain(`getAllNamed: Resolver<{}, {}, ReadonlyArray<HasName>>;`);
  });

  it("generates shared argument types for interfaces", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface FieldWithArgsField1Args {
  input?: boolean | null | undefined;
}`);
  });

  it("snapshots interface type generation", async () => {
    const schema = createTestSchema(schemaWithInterfaces);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });

  it("handles multiple interface implementations correctly", async () => {
    const multiInterfaceSchema = `
      interface A {
        fieldA: String
      }

      interface B {
        fieldB: Int
      }

      interface C {
        fieldC: Boolean
      }

      type Implementation implements A & B & C {
        fieldA: String
        fieldB: Int
        fieldC: Boolean
        extraField: String
      }

      type Query {
        getA: A
        getB: B
        getC: C
      }
    `;

    const schema = createTestSchema(multiInterfaceSchema);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain("export type ATypes = Implementation;");
    expect(code).toContain("export type BTypes = Implementation;");
    expect(code).toContain("export type CTypes = Implementation;");
  });
});
