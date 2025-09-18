import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Primitive Type Handling", () => {
  const schemaWithPrimitives = `
    type User {
      # String types
      name: String!
      nickname: String
      bio: String

      # ID types
      id: ID!
      externalId: ID

      # Int types
      age: Int!
      score: Int
      ranking: Int

      # Float types
      height: Float!
      weight: Float
      rating: Float

      # Boolean types
      isActive: Boolean!
      isVerified: Boolean
      hasProfile: Boolean
    }

    input UserInput {
      name: String!
      nickname: String
      age: Int
      height: Float!
      isActive: Boolean!
      isVerified: Boolean
    }

    type Query {
      # Primitive arguments
      userById(id: ID!): User
      userByName(name: String!): User
      usersByAge(minAge: Int!, maxAge: Int): [User!]!
      usersByHeight(minHeight: Float, maxHeight: Float): [User!]!
      activeUsers(isActive: Boolean!): [User!]!

      # Optional primitive arguments
      searchUsers(
        name: String
        minAge: Int
        isActive: Boolean
      ): [User!]!
    }

    type Mutation {
      updateUser(
        id: ID!
        name: String
        age: Int
        isActive: Boolean
      ): User!
    }
  `;

  it("uses lowercase primitive types instead of wrappers", async () => {
    const schema = createTestSchema(schemaWithPrimitives);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    // Should use lowercase primitive types directly, not capitalized wrapper types
    expect(code).toContain("id: string;");
    expect(code).toContain("age: number;");
    expect(code).toContain("isActive: boolean;");

    // Should not contain capitalized wrapper types
    expect(code).not.toContain("String: String;");
    expect(code).not.toContain("Boolean: Boolean;");
    expect(code).not.toContain("Number: Number;");
  });

  it("generates proper nullable primitive types", async () => {
    const schema = createTestSchema(schemaWithPrimitives);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface User {
  name: string;
  nickname: string | null | undefined;
  bio: string | null | undefined;
  id: string;
  externalId: string | null | undefined;
  age: number;
  score: number | null | undefined;
  ranking: number | null | undefined;
  height: number;
  weight: number | null | undefined;
  rating: number | null | undefined;
  isActive: boolean;
  isVerified: boolean | null | undefined;
  hasProfile: boolean | null | undefined;
}`);
  });

  it("handles primitive types in input types", async () => {
    const schema = createTestSchema(schemaWithPrimitives);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface UserInput {
  name: string;
  nickname?: string | null | undefined;
  age?: number | null | undefined;
  height: number;
  isActive: boolean;
  isVerified?: boolean | null | undefined;
}`);
  });

  it("handles primitive types in query arguments", async () => {
    const schema = createTestSchema(schemaWithPrimitives);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`userById: Resolver<{}, QueryUserByIdArgs, User | null | undefined>;`);
    expect(code).toContain(`userByName: Resolver<{}, QueryUserByNameArgs, User | null | undefined>;`);
    expect(code).toContain(`usersByAge: Resolver<{}, QueryUsersByAgeArgs, readonly User[]>;`);
    expect(code).toContain(`activeUsers: Resolver<{}, QueryActiveUsersArgs, readonly User[]>;`);
  });

  it("handles optional primitive arguments", async () => {
    const schema = createTestSchema(schemaWithPrimitives);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`searchUsers: Resolver<{}, QuerySearchUsersArgs, readonly User[]>;`);
  });

  it("generates argument types with primitives", async () => {
    const schema = createTestSchema(schemaWithPrimitives);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface QueryUserByIdArgs {
  id: string;
}`);

    expect(code).toContain(`export interface QueryUsersByAgeArgs {
  minAge: number;
  maxAge?: number | null | undefined;
}`);

    expect(code).toContain(`export interface QuerySearchUsersArgs {
  name?: string | null | undefined;
  minAge?: number | null | undefined;
  isActive?: boolean | null | undefined;
}`);
  });

  it("snapshots primitive type generation", async () => {
    const schema = createTestSchema(schemaWithPrimitives);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });
});
