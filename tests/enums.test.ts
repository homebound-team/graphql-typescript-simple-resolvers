import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Enum types", () => {
  it("generates enum types", async () => {
    const schema = createTestSchema(`
      enum Popularity {
        Low
        High
      }

      enum Working {
        YES
        NO
      }

      type Author {
        name: String!
        popularity: Popularity!
        working: Working
      }

      type Query {
        authors: [Author!]!
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       Author?: AuthorResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       authors: Resolver<{}, {}, readonly Author[]>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
       popularity: Resolver<Author, {}, Popularity>;
       working: Resolver<Author, {}, Working | null | undefined>;
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

     export interface Author {
       name: string;
       popularity: Popularity;
       working: Working | null | undefined;
     }

     export enum Popularity {
       Low = "Low",
       High = "High",
     }

     export enum Working {
       Yes = "YES",
       No = "NO",
     }
     "
    `);
  });

  it("generates enums with custom values", async () => {
    const schema = createTestSchema(`
      enum Status {
        ACTIVE
        INACTIVE
      }

      type User {
        name: String!
        status: Status!
      }

      type Query {
        users: [User!]!
      }
    `);

    const code = await runPlugin(schema, {
      enumValues: {
        Status: "./enums#StatusValues",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";
     import { StatusValues } from "./enums";

     export interface Resolvers {
       Query: QueryResolvers;
       User?: UserResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       users: Resolver<{}, {}, readonly User[]>;
     }

     export interface UserResolvers {
       name: Resolver<User, {}, string>;
       status: Resolver<User, {}, StatusValues>;
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
       name: string;
       status: StatusValues;
     }

     export { StatusValues } from "./enums";
     "
    `);
  });
});
