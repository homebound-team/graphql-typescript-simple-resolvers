import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Interface Mapped Types", () => {
  const schemaWithMappedInterfaces = `
    interface Publisher {
      name: String
      country: String
    }

    interface Identifiable {
      id: ID!
    }

    type SmallPublisher implements Publisher {
      name: String
      country: String
      employees: Int
    }

    type LargePublisher implements Publisher & Identifiable {
      id: ID!
      name: String
      country: String
      revenue: Float
      subsidiaries: [String!]!
    }

    type Book {
      title: String!
      publisher: Publisher
      isbn: String!
    }

    type Magazine {
      title: String!
      publisher: Publisher!
      issueNumber: Int!
    }

    type Query {
      publishers: [Publisher!]!
      identifiableItems: [Identifiable!]!
      getPublisher(id: ID!): Publisher
      books: [Book!]!
    }
  `;

  it("allows interfaces to be mapped to custom types", async () => {
    const schema = createTestSchema(schemaWithMappedInterfaces);
    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
        Identifiable: "./entities#IdentifiableEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain(`import { IdentifiableEntity, PublisherEntity } from "./entities";`);
  });

  it("generates mapped interface types", async () => {
    const schema = createTestSchema(schemaWithMappedInterfaces);
    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
      },
      scalars: {},
      enumValues: {},
    });

    // When interfaces are mapped, the plugin doesn't generate type aliases
    // but uses the mapped types directly in resolvers and references
  });

  it("generates types implementing mapped interfaces", async () => {
    const schema = createTestSchema(schemaWithMappedInterfaces);
    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface SmallPublisher {
  name: string | null | undefined;
  country: string | null | undefined;
  employees: number | null | undefined;
}`);

    expect(code).toContain(`export interface LargePublisher {
  id: string;
  name: string | null | undefined;
  country: string | null | undefined;
  revenue: number | null | undefined;
  subsidiaries: string[];
}`);
  });

  it("handles fields that reference mapped interfaces", async () => {
    const schema = createTestSchema(schemaWithMappedInterfaces);
    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface Book {
  title: string;
  publisher: PublisherEntity | null | undefined;
  isbn: string;
}`);

    expect(code).toContain(`export interface Magazine {
  title: string;
  publisher: PublisherEntity;
  issueNumber: number;
}`);
  });

  it("generates resolvers for types with mapped interface fields", async () => {
    const schema = createTestSchema(schemaWithMappedInterfaces);
    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain(`publisher: Resolver<Book, {}, PublisherEntity | null | undefined>;`);
  });

  it("generates interface resolvers for mapped interfaces", async () => {
    const schema = createTestSchema(schemaWithMappedInterfaces);
    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain(`Publisher: { __resolveType(o: SmallPublisher | LargePublisher): string };`);
  });

  it("generates query resolvers returning mapped interfaces", async () => {
    const schema = createTestSchema(schemaWithMappedInterfaces);
    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain(`publishers: Resolver<{}, {}, ReadonlyArray<PublisherEntity>>;`);
    expect(code).toContain(`getPublisher: Resolver<{}, QueryGetPublisherArgs, PublisherEntity | null | undefined>;`);
  });

  it("snapshots interface mapper generation", async () => {
    const schema = createTestSchema(schemaWithMappedInterfaces);
    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
        Identifiable: "./entities#IdentifiableEntity",
      },
      scalars: {},
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });
});
