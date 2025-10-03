import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Array handling", () => {
  it("generates arrays with mapped types, nullability patterns, and DTO types", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
        books: [Book!]!
      }

      type Book {
        name: String!
      }

      type TestType {
        requiredArrayRequiredItems: [String!]!
        optionalArrayRequiredItems: [String!]
        requiredArrayOptionalItems: [String]!
        optionalArrayOptionalItems: [String]
      }

      type AuthorSummary {
        numberOfBooks: Int!
        bookTitles: [String!]!
        optionalTags: [String!]
      }

      type Query {
        authors: [Author!]!
        test: TestType
        summaries: [AuthorSummary!]!
      }
    `);

    const code = await runPlugin(schema, {
      mappers: {
        Author: "./entities#AuthorEntity",
        Book: "./entities#BookEntity",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import type { GraphQLResolveInfo } from "graphql";
     import type { Context } from "./context";
     import { AuthorEntity, BookEntity } from "./entities";

     export interface Resolvers {
       Author: AuthorResolvers;
       Book: BookResolvers;
       Query: QueryResolvers;
       TestType?: TestTypeResolvers;
       AuthorSummary?: AuthorSummaryResolvers;
     }

     export type UnionResolvers = {};

     export interface AuthorResolvers {
       name: Resolver<AuthorEntity, {}, string>;
       books: Resolver<AuthorEntity, {}, readonly BookEntity[]>;
     }

     export interface BookResolvers {
       name: Resolver<BookEntity, {}, string>;
     }

     export interface QueryResolvers {
       authors: Resolver<{}, {}, readonly AuthorEntity[]>;
       test: Resolver<{}, {}, TestType | null | undefined>;
       summaries: Resolver<{}, {}, readonly AuthorSummary[]>;
     }

     export interface TestTypeResolvers {
       requiredArrayRequiredItems: Resolver<TestType, {}, readonly string[]>;
       optionalArrayRequiredItems: Resolver<TestType, {}, readonly string[] | null | undefined>;
       requiredArrayOptionalItems: Resolver<TestType, {}, ReadonlyArray<string | null | undefined>>;
       optionalArrayOptionalItems: Resolver<TestType, {}, ReadonlyArray<string | null | undefined> | null | undefined>;
     }

     export interface AuthorSummaryResolvers {
       numberOfBooks: Resolver<AuthorSummary, {}, number>;
       bookTitles: Resolver<AuthorSummary, {}, readonly string[]>;
       optionalTags: Resolver<AuthorSummary, {}, readonly string[] | null | undefined>;
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

     export interface TestType {
       requiredArrayRequiredItems: string[];
       optionalArrayRequiredItems: string[] | null | undefined;
       requiredArrayOptionalItems: Array<string | null | undefined>;
       optionalArrayOptionalItems: Array<string | null | undefined> | null | undefined;
     }

     export interface AuthorSummary {
       numberOfBooks: number;
       bookTitles: string[];
       optionalTags: string[] | null | undefined;
     }
     "
    `);
  });
});
