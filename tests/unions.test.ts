import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Union types", () => {
  it("generates object union types", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      type Book {
        title: String!
      }

      union SearchResult = Author | Book

      type Query {
        search: [SearchResult!]!
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
       Author?: AuthorResolvers;
       Book?: BookResolvers;
     }

     export type UnionResolvers = { SearchResult: { __resolveType(o: Author | Book): string } };

     export interface QueryResolvers {
       search: Resolver<{}, {}, readonly SearchResult[]>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
     }

     export interface BookResolvers {
       title: Resolver<Book, {}, string>;
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
     }

     export interface Book {
       title: string;
     }

     export type SearchResult = Author | Book;
     "
    `);
  });

  it("generates primitive union types", async () => {
    const schema = createTestSchema(`
      union UnionProp = String | Boolean

      type TestType {
        unionField: UnionProp
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

     export type UnionResolvers = { UnionProp: { __resolveType(o: String | Boolean): string } };

     export interface QueryResolvers {
       test: Resolver<{}, {}, TestType | null | undefined>;
     }

     export interface TestTypeResolvers {
       unionField: Resolver<TestType, {}, UnionProp | null | undefined>;
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
       unionField: UnionProp | null | undefined;
     }

     export type UnionProp = string | boolean;
     "
    `);
  });

  it("generates union of unions", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      union SearchResult = Author | String
      union UnionProp = String | Boolean
      union UnionOfUnions = UnionProp | SearchResult

      type Query {
        testUnion: UnionOfUnions
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
       Author?: AuthorResolvers;
     }

     export type UnionResolvers = {
       SearchResult: { __resolveType(o: Author | String): string };
       UnionProp: { __resolveType(o: String | Boolean): string };
       UnionOfUnions: { __resolveType(o: UnionProp | SearchResult): string };
     };

     export interface QueryResolvers {
       testUnion: Resolver<{}, {}, UnionOfUnions | null | undefined>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
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
     }

     export type SearchResult = Author | string;

     export type UnionProp = string | boolean;

     export type UnionOfUnions = UnionProp | SearchResult;
     "
    `);
  });

  it("generates unions with primitives and objects", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      union UnionWithPrimitives = String | Boolean | Author

      type Query {
        mixedUnion: UnionWithPrimitives
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
       Author?: AuthorResolvers;
     }

     export type UnionResolvers = { UnionWithPrimitives: { __resolveType(o: String | Boolean | Author): string } };

     export interface QueryResolvers {
       mixedUnion: Resolver<{}, {}, UnionWithPrimitives | null | undefined>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
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
     }

     export type UnionWithPrimitives = string | boolean | Author;
     "
    `);
  });
});
