import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Union Types", () => {
  const schemaWithUnions = `
    type Author {
      id: ID!
      name: String!
    }

    type Book {
      id: ID!
      title: String!
    }

    type Article {
      id: ID!
      headline: String!
    }

    # Basic union of object types
    union SearchResult = Author | Book

    # Union including primitives
    union StringOrNumber = String | Int

    # Union with primitives and object types
    union MixedUnion = String | Boolean | Author

    # Nested union (union of unions)
    union UnionOfUnions = SearchResult | StringOrNumber

    type Query {
      search(query: String!): [SearchResult!]!
      mixedSearch: MixedUnion
      testNestedUnion: UnionOfUnions
      getPrimitive: StringOrNumber
    }

    # Union in nullable field
    type Container {
      optionalResult: SearchResult
      requiredResult: SearchResult!
      optionalResults: [SearchResult!]
      requiredResults: [SearchResult!]!
    }
  `;

  it("generates basic union types", async () => {
    const schema = createTestSchema(schemaWithUnions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain("export type SearchResult = Author | Book;");
  });

  it("generates union with primitives", async () => {
    const schema = createTestSchema(schemaWithUnions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain("export type StringOrNumber = string | number;");
    expect(code).toContain("export type MixedUnion = string | boolean | Author;");
  });

  it("generates nested unions", async () => {
    const schema = createTestSchema(schemaWithUnions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain("export type UnionOfUnions = SearchResult | StringOrNumber;");
  });

  it("generates union resolvers for object types", async () => {
    const schema = createTestSchema(schemaWithUnions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`SearchResult: { __resolveType(o: Author | Book): string };`);
  });

  it("generates union resolvers for mixed unions", async () => {
    const schema = createTestSchema(schemaWithUnions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`MixedUnion: { __resolveType(o: String | Boolean | Author): string };`);
  });

  it("handles unions in field types with correct nullability", async () => {
    const schema = createTestSchema(schemaWithUnions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface Container {
  optionalResult: SearchResult | null | undefined;
  requiredResult: SearchResult;
  optionalResults: SearchResult[] | null | undefined;
  requiredResults: SearchResult[];
}`);
  });

  it("handles unions in query resolvers", async () => {
    const schema = createTestSchema(schemaWithUnions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`search: Resolver<{}, QuerySearchArgs, readonly SearchResult[]>;`);
    expect(code).toContain(`mixedSearch: Resolver<{}, {}, MixedUnion | null | undefined>;`);
  });

  it("snapshots union type generation", async () => {
    const schema = createTestSchema(schemaWithUnions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });

  it("handles union property nullability correctly", async () => {
    const schemaWithNullableUnion = `
      type Author {
        name: String!
      }

      type Book {
        title: String!
      }

      union Content = Author | Book

      type Post {
        content: Content
        requiredContent: Content!
      }

      type Query {
        posts: [Post!]!
      }
    `;

    const schema = createTestSchema(schemaWithNullableUnion);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface Post {
  content: Content | null | undefined;
  requiredContent: Content;
}`);
  });
});
