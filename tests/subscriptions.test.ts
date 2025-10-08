import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("GraphQL subscriptions", () => {
  it("generates subscription resolvers with and without arguments", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      union SearchResult = Author | String

      type Subscription {
        authorSaved: Author!
        searchSub(query: String!): [SearchResult!]!
      }

      type Query {
        authors: [Author!]!
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import type { GraphQLResolveInfo } from "graphql";
     import type { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       Author?: AuthorResolvers;
       Subscription?: SubscriptionResolvers;
     }

     export type UnionResolvers = { SearchResult: { __resolveType(o: Author | String): string } };

     export interface QueryResolvers {
       authors: Resolver<{}, {}, readonly Author[]>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
     }

     export interface SubscriptionResolvers {
       authorSaved: SubscriptionResolver<Subscription, {}, Author>;
       searchSub: SubscriptionResolver<Subscription, SubscriptionSearchSubArgs, readonly SearchResult[]>;
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

     export interface SubscriptionSearchSubArgs {
       query: string;
     }
     export interface Author {
       name: string;
     }

     export interface Subscription {
       authorSaved: Author;
       searchSub: SearchResult[];
     }

     export type SearchResult = Author | string;
     "
    `);
  });
});
