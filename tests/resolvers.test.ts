import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Query and mutation resolvers", () => {
  it("generates query resolvers with arguments", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      type Query {
        authors(id: ID): [Author!]!
        search(query: String!): [Author!]!
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
       id?: string | null | undefined;
     }
     export interface QuerySearchArgs {
       query: string;
     }
     export interface Author {
       name: string;
     }
     "
    `);
  });

  it("generates mutation resolvers", async () => {
    const schema = createTestSchema(`
      input AuthorInput {
        name: String
      }

      type Author {
        name: String!
      }

      type SaveAuthorResult {
        author: Author!
      }

      type Mutation {
        saveAuthor(input: AuthorInput!): SaveAuthorResult!
      }

      type Query {
        authors: [Author!]!
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
       Mutation: MutationResolvers;
       Query: QueryResolvers;
       Author?: AuthorResolvers;
       SaveAuthorResult?: SaveAuthorResultResolvers;
     }

     export type UnionResolvers = {};

     export interface MutationResolvers {
       saveAuthor: Resolver<{}, MutationSaveAuthorArgs, SaveAuthorResult>;
     }

     export interface QueryResolvers {
       authors: Resolver<{}, {}, readonly Author[]>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
     }

     export interface SaveAuthorResultResolvers {
       author: Resolver<SaveAuthorResult, {}, Author>;
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

     export interface MutationSaveAuthorArgs {
       input: AuthorInput;
     }
     export interface Author {
       name: string;
     }

     export interface SaveAuthorResult {
       author: Author;
     }

     export interface AuthorInput {
       name?: string | null | undefined;
     }
     "
    `);
  });

  it("generates resolver argument types", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      type Query {
        searchAuthors(name: String!, limit: Int, active: Boolean): [Author!]!
      }

      type Mutation {
        updateAuthor(id: ID!, name: String!, bio: String): Author!
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
       Mutation: MutationResolvers;
       Author?: AuthorResolvers;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       searchAuthors: Resolver<{}, QuerySearchAuthorsArgs, readonly Author[]>;
     }

     export interface MutationResolvers {
       updateAuthor: Resolver<{}, MutationUpdateAuthorArgs, Author>;
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

     export interface QuerySearchAuthorsArgs {
       name: string;
       limit?: number | null | undefined;
       active?: boolean | null | undefined;
     }
     export interface MutationUpdateAuthorArgs {
       id: string;
       name: string;
       bio?: string | null | undefined;
     }
     export interface Author {
       name: string;
     }
     "
    `);
  });
});
