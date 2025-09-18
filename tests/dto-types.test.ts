import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Data Transfer Objects (DTOs)", () => {
  const schemaWithDTOs = `
    scalar Date

    enum Status {
      ACTIVE
      INACTIVE
    }

    # This is a mapped entity type
    type User {
      id: ID!
      name: String!
      email: String!
      createdAt: Date!
    }

    # These are DTO types (not mapped)
    type UserSummary {
      totalUsers: Int!
      activeUsers: Int!
      inactiveUsers: Int!
      lastUpdated: Date
    }

    type UserProfile {
      name: String!
      email: String!
      status: Status!
      profilePicture: String
      bio: String
      joinDate: Date
      followers: Int
      following: Int
    }

    type UserStats {
      userId: ID!
      postsCount: Int!
      commentsCount: Int!
      likesReceived: Int!
      averageRating: Float
      isVerified: Boolean!
      badges: [String!]!
      achievements: [String]
    }

    # Nested DTO
    type Address {
      street: String!
      city: String!
      state: String
      zipCode: String!
      country: String!
    }

    type UserDetails {
      profile: UserProfile!
      address: Address
      emergencyContact: UserProfile
    }

    type Query {
      # Returns mapped entity
      user(id: ID!): User

      # Returns DTOs
      userSummary: UserSummary!
      userProfile(id: ID!): UserProfile
      userStats(id: ID!): UserStats
      userDetails(id: ID!): UserDetails
    }
  `;

  it("generates DTO types with proper structure", async () => {
    const schema = createTestSchema(schemaWithDTOs);
    const code = await runPlugin(schema, {
      mappers: {
        User: "./entities#UserEntity",
      },
      scalars: {
        Date: "Date",
      },
      enumValues: {},
    });

    // DTOs should be generated as full objects
    expect(code).toContain(`export interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lastUpdated: Date | null | undefined;
}`);
  });

  it("handles DTO fields with proper nullability", async () => {
    const schema = createTestSchema(schemaWithDTOs);
    const code = await runPlugin(schema, {
      scalars: { Date: "Date" },
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface UserProfile {
  name: string;
  email: string;
  status: Status;
  profilePicture: string | null | undefined;
  bio: string | null | undefined;
  joinDate: Date | null | undefined;
  followers: number | null | undefined;
  following: number | null | undefined;
}`);
  });

  it("handles DTO fields with various scalar types", async () => {
    const schema = createTestSchema(schemaWithDTOs);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface UserStats {
  userId: string;
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
  averageRating: number | null | undefined;
  isVerified: boolean;
  badges: string[];
  achievements: Array<string | null | undefined> | null | undefined;
}`);
  });

  it("handles nested DTO types", async () => {
    const schema = createTestSchema(schemaWithDTOs);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface UserDetails {
  profile: UserProfile;
  address: Address | null | undefined;
  emergencyContact: UserProfile | null | undefined;
}`);

    expect(code).toContain(`export interface Address {
  street: string;
  city: string;
  state: string | null | undefined;
  zipCode: string;
  country: string;
}`);
  });

  it("generates resolvers for all types including DTOs", async () => {
    const schema = createTestSchema(schemaWithDTOs);
    const code = await runPlugin(schema, {
      mappers: {
        User: "./entities#UserEntity",
      },
      scalars: {},
      enumValues: {},
    });

    // Should generate resolvers for mapped types
    expect(code).toContain("UserResolvers");

    // Should also generate resolver types for DTOs
    expect(code).toContain("UserSummaryResolvers");
    expect(code).toContain("UserProfileResolvers");
    expect(code).toContain("UserStatsResolvers");
    expect(code).toContain("AddressResolvers");
  });

  it("generates query resolvers that return DTOs", async () => {
    const schema = createTestSchema(schemaWithDTOs);
    const code = await runPlugin(schema, {
      mappers: {
        User: "./entities#UserEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain("userSummary: Resolver<{}, {}, UserSummary>;");
    expect(code).toContain("userProfile: Resolver<{}, QueryUserProfileArgs, UserProfile | null | undefined>;");
  });

  it("snapshots DTO generation", async () => {
    const schema = createTestSchema(schemaWithDTOs);
    const code = await runPlugin(schema, {
      mappers: {
        User: "./entities#UserEntity",
      },
      scalars: {
        Date: "Date",
      },
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });
});
