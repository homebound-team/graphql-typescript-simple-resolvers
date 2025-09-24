import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Union resolver helpers", () => {
  it("generates UnionResolvers type for union types", async () => {
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

  it("generates __resolveType resolvers for unions", async () => {
    const schema = createTestSchema(`
      type User {
        id: ID!
        name: String!
      }

      type Post {
        id: ID!
        title: String!
      }

      union Node = User | Post

      type Query {
        nodes: [Node!]!
      }
    `);

    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {
        User: "./entities#UserEntity",
        Post: "./entities#PostEntity",
      },
      enumValues: {},
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";
     import { PostEntity, UserEntity } from "./entities";

     export interface Resolvers {
       User: UserResolvers;
       Post: PostResolvers;
       Query: QueryResolvers;
     }

     export type UnionResolvers = { Node: { __resolveType(o: UserEntity | PostEntity): string } };

     export interface UserResolvers {
       id: Resolver<UserEntity, {}, string>;
       name: Resolver<UserEntity, {}, string>;
     }

     export interface PostResolvers {
       id: Resolver<PostEntity, {}, string>;
       title: Resolver<PostEntity, {}, string>;
     }

     export interface QueryResolvers {
       nodes: Resolver<{}, {}, readonly Node[]>;
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

     export type Node = UserEntity | PostEntity;
     "
    `);
  });

  it("generates union resolvers with interface types", async () => {
    const schema = createTestSchema(`
      interface HasName {
        name: String!
      }

      type Author implements HasName {
        name: String!
        bio: String
      }

      type Book implements HasName {
        name: String!
        isbn: String
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

     export interface HasNameResolvers<T> {
       name: Resolver<T, {}, string>;
     }

     export type HasNameTypes = Author | Book;

     export type UnionResolvers = {
       SearchResult: { __resolveType(o: Author | Book): string };
       HasName: { __resolveType(o: Author | Book): string };
     };

     export interface QueryResolvers {
       search: Resolver<{}, {}, readonly SearchResult[]>;
     }

     export interface AuthorResolvers extends HasNameResolvers<Author> {
       bio: Resolver<Author, {}, string | null | undefined>;
     }

     export interface BookResolvers extends HasNameResolvers<Book> {
       isbn: Resolver<Book, {}, string | null | undefined>;
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
     }

     export interface Book {
       name: string;
       isbn: string | null | undefined;
     }

     export interface HasName {
       name: string;
     }

     export type SearchResult = Author | Book;
     "
    `);
  });
});
