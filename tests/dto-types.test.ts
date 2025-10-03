import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("DTO types", () => {
  it("generates DTO interfaces with primitive fields, arrays, and nullability", async () => {
    const schema = createTestSchema(`
      type AuthorSummary {
        numberOfBooks: Int!
        amountOfSales: Float
      }

      type BookSummary {
        title: String!
        authorNames: [String!]!
        optionalAuthorNames: [String!]
        tagList: [String]!
        optionalTagList: [String]
      }

      type Statistics {
        totalUsers: Int!
        averageRating: Float!
        isActive: Boolean!
        lastUpdated: String
      }

      type Query {
        authorSummaries: [AuthorSummary!]!
        bookSummaries: [BookSummary!]!
        stats: Statistics!
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import type { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       AuthorSummary?: AuthorSummaryResolvers;
       BookSummary?: BookSummaryResolvers;
       Statistics?: StatisticsResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       authorSummaries: Resolver<{}, {}, readonly AuthorSummary[]>;
       bookSummaries: Resolver<{}, {}, readonly BookSummary[]>;
       stats: Resolver<{}, {}, Statistics>;
     }

     export interface AuthorSummaryResolvers {
       numberOfBooks: Resolver<AuthorSummary, {}, number>;
       amountOfSales: Resolver<AuthorSummary, {}, number | null | undefined>;
     }

     export interface BookSummaryResolvers {
       title: Resolver<BookSummary, {}, string>;
       authorNames: Resolver<BookSummary, {}, readonly string[]>;
       optionalAuthorNames: Resolver<BookSummary, {}, readonly string[] | null | undefined>;
       tagList: Resolver<BookSummary, {}, ReadonlyArray<string | null | undefined>>;
       optionalTagList: Resolver<BookSummary, {}, ReadonlyArray<string | null | undefined> | null | undefined>;
     }

     export interface StatisticsResolvers {
       totalUsers: Resolver<Statistics, {}, number>;
       averageRating: Resolver<Statistics, {}, number>;
       isActive: Resolver<Statistics, {}, boolean>;
       lastUpdated: Resolver<Statistics, {}, string | null | undefined>;
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

     export interface AuthorSummary {
       numberOfBooks: number;
       amountOfSales: number | null | undefined;
     }

     export interface BookSummary {
       title: string;
       authorNames: string[];
       optionalAuthorNames: string[] | null | undefined;
       tagList: Array<string | null | undefined>;
       optionalTagList: Array<string | null | undefined> | null | undefined;
     }

     export interface Statistics {
       totalUsers: number;
       averageRating: number;
       isActive: boolean;
       lastUpdated: string | null | undefined;
     }
     "
    `);
  });
});
