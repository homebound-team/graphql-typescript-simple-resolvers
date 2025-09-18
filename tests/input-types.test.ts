import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Input Types & Arguments", () => {
  const schemaWithInputs = `
    scalar Date
    scalar DateTime

    enum Status {
      ACTIVE
      INACTIVE
      PENDING
    }

    input AddressInput {
      street: String!
      city: String!
      state: String
      zipCode: String
      country: String!
    }

    input UserInput {
      name: String!
      email: String!
      age: Int
      birthday: Date
      status: Status
      isActive: Boolean
      address: AddressInput
      tags: [String!]
      optionalTags: [String]
      permissions: [String!]!
      metadata: [String]!
    }

    input UpdateUserInput {
      name: String
      email: String
      age: Int
      status: Status
    }

    input SearchFilters {
      minAge: Int
      maxAge: Int
      statuses: [Status!]
      isActive: Boolean
    }

    type User {
      id: ID!
      name: String!
      email: String!
      age: Int
      birthday: Date
      status: Status
    }

    type Query {
      # Scalar arguments
      user(id: ID!): User
      userByEmail(email: String!): User

      # Optional arguments
      users(limit: Int, offset: Int): [User!]!

      # Input type arguments
      searchUsers(filters: SearchFilters): [User!]!
      getUsersInRange(minAge: Int!, maxAge: Int!): [User!]!

      # Array arguments
      usersByIds(ids: [ID!]!): [User!]!
      usersByOptionalIds(ids: [ID]): [User!]!
    }

    type Mutation {
      createUser(input: UserInput!): User!
      updateUser(id: ID!, input: UpdateUserInput!): User!

      # Multiple arguments including inputs
      createUserWithAddress(
        userInput: UserInput!
        addressInput: AddressInput!
        sendWelcomeEmail: Boolean
      ): User!
    }
  `;

  it("generates input types with proper nullability", async () => {
    const schema = createTestSchema(schemaWithInputs);
    const code = await runPlugin(schema, {
      scalars: { Date: "Date", DateTime: "Date" },
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface UserInput {
  name: string;
  email: string;
  age?: number | null | undefined;
  birthday?: Date | null | undefined;
  status?: Status | null | undefined;
  isActive?: boolean | null | undefined;
  address?: AddressInput | null | undefined;
  tags?: string[] | null | undefined;
  optionalTags?: Array<string | null | undefined> | null | undefined;
  permissions: string[];
  metadata: Array<string | null | undefined>;
}`);
  });

  it("generates nested input types", async () => {
    const schema = createTestSchema(schemaWithInputs);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface AddressInput {
  street: string;
  city: string;
  state?: string | null | undefined;
  zipCode?: string | null | undefined;
  country: string;
}`);
  });

  it("generates query resolvers with scalar arguments", async () => {
    const schema = createTestSchema(schemaWithInputs);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`user: Resolver<{}, QueryUserArgs, User | null | undefined>;`);
    expect(code).toContain(`userByEmail: Resolver<{}, QueryUserByEmailArgs, User | null | undefined>;`);
  });

  it("generates query resolvers with optional arguments", async () => {
    const schema = createTestSchema(schemaWithInputs);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`users: Resolver<{}, QueryUsersArgs, readonly User[]>;`);
  });

  it("generates query resolvers with array arguments", async () => {
    const schema = createTestSchema(schemaWithInputs);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`usersByIds: Resolver<{}, QueryUsersByIdsArgs, readonly User[]>;`);
    expect(code).toContain(`usersByOptionalIds: Resolver<{}, QueryUsersByOptionalIdsArgs, readonly User[]>;`);
  });

  it("generates mutation resolvers with input arguments", async () => {
    const schema = createTestSchema(schemaWithInputs);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`createUser: Resolver<{}, MutationCreateUserArgs, User>;`);
    expect(code).toContain(`updateUser: Resolver<{}, MutationUpdateUserArgs, User>;`);
  });

  it("generates argument type definitions", async () => {
    const schema = createTestSchema(schemaWithInputs);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface QueryUserArgs {
  id: string;
}`);

    expect(code).toContain(`export interface QueryUsersArgs {
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}`);

    expect(code).toContain(`export interface MutationCreateUserArgs {
  input: UserInput;
}`);
  });

  it("snapshots input type generation", async () => {
    const schema = createTestSchema(schemaWithInputs);
    const code = await runPlugin(schema, {
      scalars: { Date: "Date", DateTime: "Date" },
      mappers: {},
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });
});
