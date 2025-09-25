import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Union types", () => {
  it("generates union types with objects, primitives, and nested unions", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      type Book {
        title: String!
      }

      type TestType {
        unionField: UnionProp
      }

      union SearchResult = Author | Book
      union UnionProp = String | Boolean
      union UnionOfUnions = UnionProp | SearchResult
      union UnionWithPrimitives = String | Boolean | Author

      type Query {
        search: [SearchResult!]!
        test: TestType
        testUnion: UnionOfUnions
        mixedUnion: UnionWithPrimitives
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       Author?: AuthorResolvers;
       Book?: BookResolvers;
       TestType?: TestTypeResolvers;
     }

     export type UnionResolvers = {
       SearchResult: { __resolveType(o: Author | Book): string };
       UnionProp: { __resolveType(o: String | Boolean): string };
       UnionOfUnions: { __resolveType(o: UnionProp | SearchResult): string };
       UnionWithPrimitives: { __resolveType(o: String | Boolean | Author): string };
     };

     export interface QueryResolvers {
       search: Resolver<{}, {}, readonly SearchResult[]>;
       test: Resolver<{}, {}, TestType | null | undefined>;
       testUnion: Resolver<{}, {}, UnionOfUnions | null | undefined>;
       mixedUnion: Resolver<{}, {}, UnionWithPrimitives | null | undefined>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
     }

     export interface BookResolvers {
       title: Resolver<Book, {}, string>;
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

     export interface Author {
       name: string;
     }

     export interface Book {
       title: string;
     }

     export interface TestType {
       unionField: UnionProp | null | undefined;
     }

     export type SearchResult = Author | Book;

     export type UnionProp = string | boolean;

     export type UnionOfUnions = UnionProp | SearchResult;

     export type UnionWithPrimitives = string | boolean | Author;
     "
    `);
  });
});
