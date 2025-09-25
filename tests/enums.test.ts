import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Enum types", () => {
  it("generates enum types with default and mapped values", async () => {
    const schema = createTestSchema(`
      enum Popularity {
        Low
        High
      }

      enum Working {
        YES
        NO
      }

      enum Status {
        ACTIVE
        INACTIVE
      }

      type Author {
        name: String!
        popularity: Popularity!
        working: Working
      }

      type User {
        name: String!
        status: Status!
      }

      type Query {
        authors: [Author!]!
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
       Author?: AuthorResolvers;
       User?: UserResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       authors: Resolver<{}, {}, readonly Author[]>;
       users: Resolver<{}, {}, readonly User[]>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
       popularity: Resolver<Author, {}, Popularity>;
       working: Resolver<Author, {}, Working | null | undefined>;
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

     export interface Author {
       name: string;
       popularity: Popularity;
       working: Working | null | undefined;
     }

     export interface User {
       name: string;
       status: StatusValues;
     }

     export enum Popularity {
       Low = "Low",
       High = "High",
     }

     export enum Working {
       Yes = "YES",
       No = "NO",
     }

     export { StatusValues } from "./enums";
     "
    `);
  });
});
