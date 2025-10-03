import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Query and mutation resolvers", () => {
  it("generates query and mutation resolvers with arguments and mapped entities", async () => {
    const schema = createTestSchema(`
      input AuthorInput {
        name: String
      }

      type Author {
        name: String!
        books: [Book!]!
      }

      type Book {
        name: String!
      }

      type SaveAuthorResult {
        author: Author!
      }

      type Query {
        authors(id: ID): [Author!]!
        search(query: String!): [Author!]!
        searchAuthors(name: String!, limit: Int, active: Boolean): [Author!]!
      }

      type Mutation {
        saveAuthor(input: AuthorInput!): SaveAuthorResult!
        updateAuthor(id: ID!, name: String!, bio: String): Author!
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
     import { Context } from "./context";
     import { AuthorEntity, BookEntity } from "./entities";

     export interface Resolvers {
       Author: AuthorResolvers;
       Book: BookResolvers;
       Query: QueryResolvers;
       Mutation: MutationResolvers;
       SaveAuthorResult?: SaveAuthorResultResolvers;
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
       authors: Resolver<{}, QueryAuthorsArgs, readonly AuthorEntity[]>;
       search: Resolver<{}, QuerySearchArgs, readonly AuthorEntity[]>;
       searchAuthors: Resolver<{}, QuerySearchAuthorsArgs, readonly AuthorEntity[]>;
     }

     export interface MutationResolvers {
       saveAuthor: Resolver<{}, MutationSaveAuthorArgs, SaveAuthorResult>;
       updateAuthor: Resolver<{}, MutationUpdateAuthorArgs, AuthorEntity>;
     }

     export interface SaveAuthorResultResolvers {
       author: Resolver<SaveAuthorResult, {}, AuthorEntity>;
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
       id?: string | null | undefined;
     }
     export interface QuerySearchArgs {
       query: string;
     }
     export interface QuerySearchAuthorsArgs {
       name: string;
       limit?: number | null | undefined;
       active?: boolean | null | undefined;
     }
     export interface MutationSaveAuthorArgs {
       input: AuthorInput;
     }
     export interface MutationUpdateAuthorArgs {
       id: string;
       name: string;
       bio?: string | null | undefined;
     }
     export interface SaveAuthorResult {
       author: AuthorEntity;
     }

     export interface AuthorInput {
       name?: string | null | undefined;
     }
     "
    `);
  });

  it("generates union resolvers with mapped types and interfaces", async () => {
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

        type User {
          id: ID!
          name: String!
        }

        type Post {
          id: ID!
          title: String!
        }

        union SearchResult = Author | Book
        union Node = User | Post

        type Query {
          search: [SearchResult!]!
          nodes: [Node!]!
        }
      `);

    const code = await runPlugin(schema, {
      mappers: {
        User: "./entities#UserEntity",
        Post: "./entities#PostEntity",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import type { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";
     import { PostEntity, UserEntity } from "./entities";

     export interface Resolvers {
       User: UserResolvers;
       Post: PostResolvers;
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
       Node: { __resolveType(o: UserEntity | PostEntity): string };
       HasName: { __resolveType(o: Author | Book): string };
     };

     export interface UserResolvers {
       id: Resolver<UserEntity, {}, string>;
       name: Resolver<UserEntity, {}, string>;
     }

     export interface PostResolvers {
       id: Resolver<PostEntity, {}, string>;
       title: Resolver<PostEntity, {}, string>;
     }

     export interface QueryResolvers {
       search: Resolver<{}, {}, readonly SearchResult[]>;
       nodes: Resolver<{}, {}, readonly Node[]>;
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

     export type Node = UserEntity | PostEntity;
     "
    `);
  });

  it("supports subpath imports for all configuration options", async () => {
    const schema = createTestSchema(`
      scalar DateTime
      scalar Money

      enum Status {
        ACTIVE
        INACTIVE
      }

      enum Priority {
        LOW
        HIGH
      }

      type User {
        id: ID!
        name: String!
        createdAt: DateTime
        balance: Money
        status: Status!
        priority: Priority
      }

      type Product {
        id: ID!
        name: String!
        owner: User!
      }

      type Query {
        users: [User!]!
        products: [Product!]!
      }
    `);

    const code = await runPlugin(schema, {
      contextType: "\\#src/context#AppContext",
      scalars: {
        DateTime: "\\#lib/scalars#default",
        Money: "\\#lib/types#MoneyType",
      },
      mappers: {
        User: "\\#src/entities#UserEntity",
        Product: "\\#src/entities#ProductEntity",
      },
      enumValues: {
        Status: "\\#lib/enums#StatusEnum",
        Priority: "\\#src/constants#default",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import { StatusEnum } from "#lib/enums";
     import DateTime from "#lib/scalars";
     import { MoneyType } from "#lib/types";
     import Priority from "#src/constants";
     import { AppContext } from "#src/context";
     import { ProductEntity, UserEntity } from "#src/entities";
     import { type GraphQLResolveInfo, GraphQLScalarType } from "graphql";

     export interface Resolvers {
       User: UserResolvers;
       Product: ProductResolvers;
       Query: QueryResolvers;

       DateTime: GraphQLScalarType;
       Money: GraphQLScalarType;
     }

     export type UnionResolvers = {};

     export interface UserResolvers {
       id: Resolver<UserEntity, {}, string>;
       name: Resolver<UserEntity, {}, string>;
       createdAt: Resolver<UserEntity, {}, DateTime | null | undefined>;
       balance: Resolver<UserEntity, {}, MoneyType | null | undefined>;
       status: Resolver<UserEntity, {}, StatusEnum>;
       priority: Resolver<UserEntity, {}, Priority | null | undefined>;
     }

     export interface ProductResolvers {
       id: Resolver<ProductEntity, {}, string>;
       name: Resolver<ProductEntity, {}, string>;
       owner: Resolver<ProductEntity, {}, UserEntity>;
     }

     export interface QueryResolvers {
       users: Resolver<{}, {}, readonly UserEntity[]>;
       products: Resolver<{}, {}, readonly ProductEntity[]>;
     }

     type MaybePromise<T> = T | Promise<T>;
     export type Resolver<R, A, T> = (root: R, args: A, ctx: AppContext, info: GraphQLResolveInfo) => MaybePromise<T>;

     export type SubscriptionResolverFilter<R, A, T> = (
       root: R | undefined,
       args: A,
       ctx: AppContext,
       info: GraphQLResolveInfo,
     ) => boolean | Promise<boolean>;
     export type SubscriptionResolver<R, A, T> = {
       subscribe: (root: R | undefined, args: A, ctx: AppContext, info: GraphQLResolveInfo) => AsyncIterator<T>;
     };

     export { StatusEnum } from "#lib/enums";

     export { default as Priority } from "#src/constants";
     "
    `);
  });

  it("supports emitting ESM-compatible code", async () => {
    const schema = createTestSchema(`
      scalar DateTime
      scalar Money

      enum Status {
        ACTIVE
        INACTIVE
      }

      enum Priority {
        LOW
        HIGH
      }

      type User {
        id: ID!
        name: String!
        createdAt: DateTime
        balance: Money
        status: Status!
        priority: Priority
      }

      type Product {
        id: ID!
        name: String!
        owner: User!
      }

      type Query {
        users: [User!]!
        products: [Product!]!
      }
    `);

    const code = await runPlugin(schema, {
      emitLegacyCommonJSImports: false, // This setting is to enable ESM-compatible code in graphql-codegen (https://the-guild.dev/graphql/codegen/docs/getting-started/esm-typescript-usage)
      contextType: "./src/context#AppContext",
      scalars: {
        DateTime: "./lib/scalars#default",
        Money: "./lib/types#MoneyType",
      },
      mappers: {
        User: "./src/entities/index#UserEntity",
        Product: "./src/entities/index#ProductEntity",
      },
      enumValues: {
        Status: "./lib/enums#StatusEnum",
        Priority: "./src/constants#default",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import { type GraphQLResolveInfo, GraphQLScalarType } from "graphql";
     import { StatusEnum } from "./lib/enums";
     import DateTime from "./lib/scalars";
     import { MoneyType } from "./lib/types";
     import Priority from "./src/constants";
     import { AppContext } from "./src/context";
     import { ProductEntity, UserEntity } from "./src/entities/index";

     export interface Resolvers {
       User: UserResolvers;
       Product: ProductResolvers;
       Query: QueryResolvers;

       DateTime: GraphQLScalarType;
       Money: GraphQLScalarType;
     }

     export type UnionResolvers = {};

     export interface UserResolvers {
       id: Resolver<UserEntity, {}, string>;
       name: Resolver<UserEntity, {}, string>;
       createdAt: Resolver<UserEntity, {}, DateTime | null | undefined>;
       balance: Resolver<UserEntity, {}, MoneyType | null | undefined>;
       status: Resolver<UserEntity, {}, StatusEnum>;
       priority: Resolver<UserEntity, {}, Priority | null | undefined>;
     }

     export interface ProductResolvers {
       id: Resolver<ProductEntity, {}, string>;
       name: Resolver<ProductEntity, {}, string>;
       owner: Resolver<ProductEntity, {}, UserEntity>;
     }

     export interface QueryResolvers {
       users: Resolver<{}, {}, readonly UserEntity[]>;
       products: Resolver<{}, {}, readonly ProductEntity[]>;
     }

     type MaybePromise<T> = T | Promise<T>;
     export type Resolver<R, A, T> = (root: R, args: A, ctx: AppContext, info: GraphQLResolveInfo) => MaybePromise<T>;

     export type SubscriptionResolverFilter<R, A, T> = (
       root: R | undefined,
       args: A,
       ctx: AppContext,
       info: GraphQLResolveInfo,
     ) => boolean | Promise<boolean>;
     export type SubscriptionResolver<R, A, T> = {
       subscribe: (root: R | undefined, args: A, ctx: AppContext, info: GraphQLResolveInfo) => AsyncIterator<T>;
     };

     export { StatusEnum } from "./lib/enums";

     export { default as Priority } from "./src/constants";
     "
    `);
  });
});
