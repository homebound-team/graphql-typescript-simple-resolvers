import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Primitive type handling", () => {
  it("generates lowercase primitive types", async () => {
    const schema = createTestSchema(`
      type User {
        id: ID!
        name: String!
        age: Int!
        rating: Float!
        active: Boolean!
      }

      type Query {
        users: [User!]!
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import type { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       User?: UserResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       users: Resolver<{}, {}, readonly User[]>;
     }

     export interface UserResolvers {
       id: Resolver<User, {}, string>;
       name: Resolver<User, {}, string>;
       age: Resolver<User, {}, number>;
       rating: Resolver<User, {}, number>;
       active: Resolver<User, {}, boolean>;
     }

     type MaybePromise<T> = T | Promise<T>;
     export type Resolver<R, A, T> = (root: R, args: A, ctx: Context, info: GraphQLResolveInfo) => MaybePromise<T>;

     export type SubscriptionResolverFilter<R, A, T> = (
       root: R | undefined,
       args: A,
       ctx: Context,
       info: GraphQLResolveInfo,
     ) => boolean | Promise<boolean>;
     export type SubscriptionResolver<R, A, T> = {
       subscribe: (root: R | undefined, args: A, ctx: Context, info: GraphQLResolveInfo) => AsyncIterator<T>;
     };

     export interface User {
       id: string;
       name: string;
       age: number;
       rating: number;
       active: boolean;
     }
     "
    `);
  });

  it("generates primitive types in arguments", async () => {
    const schema = createTestSchema(`
      type User {
        name: String!
      }

      type Query {
        user(
          id: ID!
          name: String!
          age: Int
          rating: Float
          active: Boolean!
        ): User
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import type { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       User?: UserResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       user: Resolver<{}, QueryUserArgs, User | null | undefined>;
     }

     export interface UserResolvers {
       name: Resolver<User, {}, string>;
     }

     type MaybePromise<T> = T | Promise<T>;
     export type Resolver<R, A, T> = (root: R, args: A, ctx: Context, info: GraphQLResolveInfo) => MaybePromise<T>;

     export type SubscriptionResolverFilter<R, A, T> = (
       root: R | undefined,
       args: A,
       ctx: Context,
       info: GraphQLResolveInfo,
     ) => boolean | Promise<boolean>;
     export type SubscriptionResolver<R, A, T> = {
       subscribe: (root: R | undefined, args: A, ctx: Context, info: GraphQLResolveInfo) => AsyncIterator<T>;
     };

     export interface QueryUserArgs {
       id: string;
       name: string;
       age?: number | null | undefined;
       rating?: number | null | undefined;
       active: boolean;
     }
     export interface User {
       name: string;
     }
     "
    `);
  });

  it("generates primitive types with correct nullability", async () => {
    const schema = createTestSchema(`
      type Statistics {
        requiredString: String!
        optionalString: String
        requiredInt: Int!
        optionalInt: Int
        requiredFloat: Float!
        optionalFloat: Float
        requiredBoolean: Boolean!
        optionalBoolean: Boolean
        requiredId: ID!
        optionalId: ID
      }

      type Query {
        stats: Statistics!
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import type { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       Statistics?: StatisticsResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       stats: Resolver<{}, {}, Statistics>;
     }

     export interface StatisticsResolvers {
       requiredString: Resolver<Statistics, {}, string>;
       optionalString: Resolver<Statistics, {}, string | null | undefined>;
       requiredInt: Resolver<Statistics, {}, number>;
       optionalInt: Resolver<Statistics, {}, number | null | undefined>;
       requiredFloat: Resolver<Statistics, {}, number>;
       optionalFloat: Resolver<Statistics, {}, number | null | undefined>;
       requiredBoolean: Resolver<Statistics, {}, boolean>;
       optionalBoolean: Resolver<Statistics, {}, boolean | null | undefined>;
       requiredId: Resolver<Statistics, {}, string>;
       optionalId: Resolver<Statistics, {}, string | null | undefined>;
     }

     type MaybePromise<T> = T | Promise<T>;
     export type Resolver<R, A, T> = (root: R, args: A, ctx: Context, info: GraphQLResolveInfo) => MaybePromise<T>;

     export type SubscriptionResolverFilter<R, A, T> = (
       root: R | undefined,
       args: A,
       ctx: Context,
       info: GraphQLResolveInfo,
     ) => boolean | Promise<boolean>;
     export type SubscriptionResolver<R, A, T> = {
       subscribe: (root: R | undefined, args: A, ctx: Context, info: GraphQLResolveInfo) => AsyncIterator<T>;
     };

     export interface Statistics {
       requiredString: string;
       optionalString: string | null | undefined;
       requiredInt: number;
       optionalInt: number | null | undefined;
       requiredFloat: number;
       optionalFloat: number | null | undefined;
       requiredBoolean: boolean;
       optionalBoolean: boolean | null | undefined;
       requiredId: string;
       optionalId: string | null | undefined;
     }
     "
    `);
  });
});
