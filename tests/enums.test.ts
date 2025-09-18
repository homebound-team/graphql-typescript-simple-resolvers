import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Enum Types", () => {
  const schemaWithEnums = `
    enum Status {
      ACTIVE
      INACTIVE
      PENDING
      ARCHIVED
    }

    enum Priority {
      LOW
      MEDIUM
      HIGH
      URGENT
    }

    enum UserRole {
      GUEST
      USER
      MODERATOR
      ADMIN
    }

    type User {
      id: ID!
      name: String!
      status: Status!
      role: UserRole!
      priority: Priority
    }

    type Query {
      users(status: Status, role: UserRole): [User!]!
      usersByStatuses(statuses: [Status!]!): [User!]!
    }

    input UserInput {
      name: String!
      status: Status
      role: UserRole!
      priority: Priority
    }
  `;

  it("generates enum types", async () => {
    const schema = createTestSchema(schemaWithEnums);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING",
  Archived = "ARCHIVED",
}`);

    expect(code).toContain(`export enum Priority {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Urgent = "URGENT",
}`);

    expect(code).toContain(`export enum UserRole {
  Guest = "GUEST",
  User = "USER",
  Moderator = "MODERATOR",
  Admin = "ADMIN",
}`);
  });

  it("uses enums in type definitions", async () => {
    const schema = createTestSchema(schemaWithEnums);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface User {
  id: string;
  name: string;
  status: Status;
  role: UserRole;
  priority: Priority | null | undefined;
}`);
  });

  it("uses enums in input types", async () => {
    const schema = createTestSchema(schemaWithEnums);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface UserInput {
  name: string;
  status?: Status | null | undefined;
  role: UserRole;
  priority?: Priority | null | undefined;
}`);
  });

  it("uses enums in query arguments", async () => {
    const schema = createTestSchema(schemaWithEnums);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`users: Resolver<{}, QueryUsersArgs, readonly User[]>;`);
    expect(code).toContain(`usersByStatuses: Resolver<{}, QueryUsersByStatusesArgs, readonly User[]>;`);
  });

  it("handles enum value mapping to custom types", async () => {
    const schema = createTestSchema(schemaWithEnums);
    const code = await runPlugin(schema, {
      enumValues: {
        Status: "./enums#StatusEnum",
        Priority: "./enums#PriorityEnum",
      },
      scalars: {},
      mappers: {},
    });

    expect(code).toContain(`import { PriorityEnum, StatusEnum } from "./enums";`);
    // Export syntax may use separate export statements
    expect(code).toContain('export { StatusEnum } from "./enums";');
    expect(code).toContain('export { PriorityEnum } from "./enums";');
  });

  it("snapshots enum generation", async () => {
    const schema = createTestSchema(schemaWithEnums);
    const code = await runPlugin(schema, {
      enumValues: {
        Status: "./enums#StatusEnum",
        Priority: "./enums#PriorityEnum",
      },
      scalars: {},
      mappers: {},
    });
    expect(code).toMatchSnapshot();
  });
});
