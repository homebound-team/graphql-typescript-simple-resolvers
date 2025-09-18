import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Scalar Types", () => {
  const schemaWithScalars = `
    scalar Date
    scalar DateTime
    scalar CustomId

    type User {
      id: CustomId!
      name: String!
      birthday: Date
      lastLogin: DateTime
    }

    type Query {
      user(id: CustomId!): User
      usersBornAfter(date: Date!): [User!]!
      usersLoggedInAfter(datetime: DateTime!): [User!]!
    }

    input UserInput {
      name: String!
      birthday: Date
      customId: CustomId
    }

    type Mutation {
      createUser(input: UserInput!): User!
    }
  `;

  it("generates scalar types in resolver interfaces", async () => {
    const schema = createTestSchema(schemaWithScalars);
    const code = await runPlugin(schema, {
      scalars: {
        Date: "Date",
        DateTime: "Date",
        CustomId: "string",
      },
      mappers: {},
      enumValues: {},
    });

    // Should include scalar types in resolver interface
    expect(code).toContain(`export interface Resolvers {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
  User?: UserResolvers;
  Date: GraphQLScalarType;
  DateTime: GraphQLScalarType;
  CustomId: GraphQLScalarType;
}`);
  });

  it("handles scalars in field types", async () => {
    const schema = createTestSchema(schemaWithScalars);
    const code = await runPlugin(schema, {
      scalars: {
        Date: "Date",
        DateTime: "Date",
        CustomId: "string",
      },
      mappers: {},
      enumValues: {},
    });

    // User interface should use scalar mappings
    expect(code).toContain(`export interface User {
  id: string;
  name: string;
  birthday: Date | null | undefined;
  lastLogin: Date | null | undefined;
}`);
  });

  it("handles scalars in query arguments", async () => {
    const schema = createTestSchema(schemaWithScalars);
    const code = await runPlugin(schema, {
      scalars: {
        Date: "Date",
        DateTime: "Date",
        CustomId: "string",
      },
      mappers: {},
      enumValues: {},
    });

    // Query args should use scalar types
    expect(code).toContain(`export interface QueryUserArgs {
  id: string;
}`);
    expect(code).toContain(`export interface QueryUsersBornAfterArgs {
  date: Date;
}`);
    expect(code).toContain(`export interface QueryUsersLoggedInAfterArgs {
  datetime: Date;
}`);
  });

  it("handles scalars in input types", async () => {
    const schema = createTestSchema(schemaWithScalars);
    const code = await runPlugin(schema, {
      scalars: {
        Date: "Date",
        DateTime: "Date",
        CustomId: "string",
      },
      mappers: {},
      enumValues: {},
    });

    // Input types should use scalar mappings
    expect(code).toContain(`export interface UserInput {
  name: string;
  birthday?: Date | null | undefined;
  customId?: string | null | undefined;
}`);
  });

  it("defaults to 'any' for unmapped scalars", async () => {
    const schema = createTestSchema(schemaWithScalars);
    const code = await runPlugin(schema, {
      scalars: {
        // Only map some scalars, leave others unmapped
        Date: "Date",
      },
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface User {
  id: CustomId;
  name: string;
  birthday: Date | null | undefined;
  lastLogin: DateTime | null | undefined;
}`);
  });

  it("snapshots scalar type generation", async () => {
    const schema = createTestSchema(schemaWithScalars);
    const code = await runPlugin(schema, {
      scalars: {
        Date: "Date",
        DateTime: "Date",
        CustomId: "string",
      },
      mappers: {},
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });
});
