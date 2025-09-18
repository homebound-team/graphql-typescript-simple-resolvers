import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Array Handling", () => {
  const schemaWithArrays = `
    type Author {
      id: ID!
      name: String!
    }

    type Book {
      id: ID!
      title: String!
      authors: [Author!]!
      coAuthors: [Author!]
      tags: [String!]!
      optionalTags: [String!]
      categories: [String]!
      optionalCategories: [String]
    }

    # DTO type to test mutable arrays
    type BookSummary {
      title: String!
      authorNames: [String!]!
      optionalAuthorNames: [String!]
      tagList: [String]!
      optionalTagList: [String]
    }

    input BookInput {
      title: String!
      authorIds: [ID!]!
      optionalAuthorIds: [ID!]
      tags: [String]!
      optionalTags: [String]
    }

    type Query {
      books: [Book!]!
      optionalBooks: [Book!]
      booksOrNull: [Book]!
      optionalBooksOrNull: [Book]
      bookSummaries: [BookSummary!]!
    }

    type Mutation {
      createBook(input: BookInput!): Book!
      updateBookTags(id: ID!, tags: [String!]!): Book!
    }
  `;

  it("generates readonly arrays for resolver return types", async () => {
    const schema = createTestSchema(schemaWithArrays);
    const code = await runPlugin(schema, {
      mappers: {
        Author: "./entities#AuthorEntity",
        Book: "./entities#BookEntity",
      },
      scalars: {},
      enumValues: {},
    });

    // Mapped types should have readonly arrays in resolver return types
    expect(code).toContain("authors: Resolver<BookEntity, {}, readonly AuthorEntity[]>;");
    expect(code).toContain("coAuthors: Resolver<BookEntity, {}, readonly AuthorEntity[] | null | undefined>;");
    expect(code).toContain("tags: Resolver<BookEntity, {}, readonly string[]>;");
    expect(code).toContain("optionalTags: Resolver<BookEntity, {}, readonly string[] | null | undefined>;");
  });

  it("generates mutable arrays for DTO types", async () => {
    const schema = createTestSchema(schemaWithArrays);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    // DTOs should have mutable arrays
    expect(code).toContain(`export interface BookSummary {
  title: string;
  authorNames: string[];
  optionalAuthorNames: string[] | null | undefined;
  tagList: Array<string | null | undefined>;
  optionalTagList: Array<string | null | undefined> | null | undefined;
}`);
  });

  it("generates mutable arrays for input types", async () => {
    const schema = createTestSchema(schemaWithArrays);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface BookInput {
  title: string;
  authorIds: string[];
  optionalAuthorIds?: string[] | null | undefined;
  tags: Array<string | null | undefined>;
  optionalTags?: Array<string | null | undefined> | null | undefined;
}`);
  });

  it("handles array nullability patterns correctly", async () => {
    const arrayNullabilitySchema = `
      type TestType {
        # [Type!]! - required array of required items
        requiredArrayRequiredItems: [String!]!

        # [Type!] - optional array of required items
        optionalArrayRequiredItems: [String!]

        # [Type]! - required array of optional items
        requiredArrayOptionalItems: [String]!

        # [Type] - optional array of optional items
        optionalArrayOptionalItems: [String]
      }

      type Query {
        test: TestType
      }
    `;

    const schema = createTestSchema(arrayNullabilitySchema);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain("requiredArrayRequiredItems: string[];");
    expect(code).toContain("optionalArrayRequiredItems: string[] | null | undefined;");
    expect(code).toContain("requiredArrayOptionalItems: Array<string | null | undefined>;");
    expect(code).toContain("optionalArrayOptionalItems: Array<string | null | undefined> | null | undefined;");
  });

  it("generates correct resolver signatures for array fields", async () => {
    const schema = createTestSchema(schemaWithArrays);
    const code = await runPlugin(schema, {
      mappers: {
        Book: "./entities#BookEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain("export interface BookResolvers {");
    expect(code).toContain("authors: Resolver<BookEntity, {}, readonly Author[]>;");
    expect(code).toContain("coAuthors: Resolver<BookEntity, {}, readonly Author[] | null | undefined>;");
  });

  it("generates correct query resolver signatures for arrays", async () => {
    const schema = createTestSchema(schemaWithArrays);
    const code = await runPlugin(schema, {
      mappers: {
        Book: "./entities#BookEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain("books: Resolver<{}, {}, readonly BookEntity[]>;");
    expect(code).toContain("optionalBooks: Resolver<{}, {}, readonly BookEntity[] | null | undefined>;");
    expect(code).toContain("booksOrNull: Resolver<{}, {}, ReadonlyArray<BookEntity | null | undefined>>;");
    expect(code).toContain(
      "optionalBooksOrNull: Resolver<{}, {}, ReadonlyArray<BookEntity | null | undefined> | null | undefined>;",
    );
  });

  it("handles mutation arguments with arrays", async () => {
    const schema = createTestSchema(schemaWithArrays);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface MutationUpdateBookTagsArgs {
  id: string;
  tags: readonly string[];
}`);
  });

  it("snapshots array handling generation", async () => {
    const schema = createTestSchema(schemaWithArrays);
    const code = await runPlugin(schema, {
      mappers: {
        Author: "./entities#AuthorEntity",
        Book: "./entities#BookEntity",
      },
      scalars: {},
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });
});
