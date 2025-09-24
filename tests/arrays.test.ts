import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Array handling", () => {
  it("generates readonly arrays for mapped resolver return types", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
        books: [Book!]!
      }

      type Book {
        name: String!
      }

      type Query {
        authors: [Author!]!
      }
    `);

    const code = await runPlugin(schema, {
      mappers: {
        Author: "./entities#AuthorEntity",
        Book: "./entities#BookEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";
     import { AuthorEntity, BookEntity } from "./entities";

     export interface Resolvers {
       Author: AuthorResolvers;
       Book: BookResolvers;
       Query: QueryResolvers;
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
     "
    `);
  });

  it("generates all array nullability patterns", async () => {
    const schema = createTestSchema(`
      type TestType {
        requiredArrayRequiredItems: [String!]!
        optionalArrayRequiredItems: [String!]
        requiredArrayOptionalItems: [String]!
        optionalArrayOptionalItems: [String]
      }

      type Query {
        test: TestType
      }
    `);

    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       TestType?: TestTypeResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       test: Resolver<{}, {}, TestType | null | undefined>;
     }

     export interface TestTypeResolvers {
       requiredArrayRequiredItems: Resolver<TestType, {}, readonly string[]>;
       optionalArrayRequiredItems: Resolver<TestType, {}, readonly string[] | null | undefined>;
       requiredArrayOptionalItems: Resolver<TestType, {}, ReadonlyArray<string | null | undefined>>;
       optionalArrayOptionalItems: Resolver<TestType, {}, ReadonlyArray<string | null | undefined> | null | undefined>;
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
     "
    `);
  });

  it("generates mutable arrays for DTO types", async () => {
    const schema = createTestSchema(`
      type AuthorSummary {
        numberOfBooks: Int!
        bookTitles: [String!]!
        optionalTags: [String!]
      }

      type Query {
        summaries: [AuthorSummary!]!
      }
    `);

    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       AuthorSummary?: AuthorSummaryResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       summaries: Resolver<{}, {}, readonly AuthorSummary[]>;
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

     export interface AuthorSummary {
       numberOfBooks: number;
       bookTitles: string[];
       optionalTags: string[] | null | undefined;
     }
     "
    `);
  });
});
