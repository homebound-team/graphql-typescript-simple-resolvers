import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Nullable field handling", () => {
  it("generates nullable vs required field types", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
        bio: String
        age: Int
        active: Boolean!
      }

      type Query {
        author: Author
        requiredAuthor: Author!
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
       author: Resolver<{}, {}, Author | null | undefined>;
       requiredAuthor: Resolver<{}, {}, Author>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
       bio: Resolver<Author, {}, string | null | undefined>;
       age: Resolver<Author, {}, number | null | undefined>;
       active: Resolver<Author, {}, boolean>;
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
       bio: string | null | undefined;
       age: number | null | undefined;
       active: boolean;
     }
     "
    `);
  });

  it("generates nullable object references", async () => {
    const schema = createTestSchema(`
      interface Publisher {
        name: String
      }

      type Book {
        title: String!
        publisher: Publisher
        requiredPublisher: Publisher!
      }

      type Query {
        books: [Book!]!
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       Book?: BookResolvers;
     }

     export interface PublisherResolvers<T> {
       name: Resolver<T, {}, string | null | undefined>;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       books: Resolver<{}, {}, readonly Book[]>;
     }

     export interface BookResolvers {
       title: Resolver<Book, {}, string>;
       publisher: Resolver<Book, {}, Publisher | null | undefined>;
       requiredPublisher: Resolver<Book, {}, Publisher>;
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

     export interface Book {
       title: string;
       publisher: Publisher | null | undefined;
       requiredPublisher: Publisher;
     }

     export interface Publisher {
       name: string | null | undefined;
     }
     "
    `);
  });

  it("generates optional keys for nullable arguments", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      type Query {
        authors(name: String, limit: Int!, active: Boolean): [Author!]!
        search(query: String!, category: String): [Author!]!
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
       authors: Resolver<{}, QueryAuthorsArgs, readonly Author[]>;
       search: Resolver<{}, QuerySearchArgs, readonly Author[]>;
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

     export interface QueryAuthorsArgs {
       name?: string | null | undefined;
       limit: number;
       active?: boolean | null | undefined;
     }
     export interface QuerySearchArgs {
       query: string;
       category?: string | null | undefined;
     }
     export interface Author {
       name: string;
     }
     "
    `);
  });
});
