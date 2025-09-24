import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Input types", () => {
  it("generates input type interfaces", async () => {
    const schema = createTestSchema(`
      input AuthorInput {
        name: String
        bookIds: [ID!]
        bookIds2: [ID]
      }

      type Author {
        name: String!
      }

      type Mutation {
        saveAuthor(input: AuthorInput!): Author!
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
     }

     export type UnionResolvers = {};

     export interface MutationResolvers {
       saveAuthor: Resolver<{}, MutationSaveAuthorArgs, Author>;
     }

     export interface QueryResolvers {
       authors: Resolver<{}, {}, readonly Author[]>;
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

     export interface MutationSaveAuthorArgs {
       input: AuthorInput;
     }
     export interface Author {
       name: string;
     }

     export interface AuthorInput {
       name?: string | null | undefined;
       bookIds?: string[] | null | undefined;
       bookIds2?: Array<string | null | undefined> | null | undefined;
     }
     "
    `);
  });

  it("generates input types with arrays", async () => {
    const schema = createTestSchema(`
      input BookInput {
        title: String!
        authorIds: [ID!]!
        optionalAuthorIds: [ID!]
        tags: [String]!
        optionalTags: [String]
      }

      type Book {
        title: String!
      }

      type Mutation {
        createBook(input: BookInput!): Book!
      }

      type Query {
        books: [Book!]!
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
       Book?: BookResolvers;
     }

     export type UnionResolvers = {};

     export interface MutationResolvers {
       createBook: Resolver<{}, MutationCreateBookArgs, Book>;
     }

     export interface QueryResolvers {
       books: Resolver<{}, {}, readonly Book[]>;
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

     export interface MutationCreateBookArgs {
       input: BookInput;
     }
     export interface Book {
       title: string;
     }

     export interface BookInput {
       title: string;
       authorIds: string[];
       optionalAuthorIds?: string[] | null | undefined;
       tags: Array<string | null | undefined>;
       optionalTags?: Array<string | null | undefined> | null | undefined;
     }
     "
    `);
  });

  it("generates mutation argument types from inputs", async () => {
    const schema = createTestSchema(`
      input AuthorInput {
        name: String!
        bio: String
      }

      type Author {
        name: String!
      }

      type SaveAuthorResult {
        author: Author!
      }

      type Mutation {
        saveAuthor(input: AuthorInput!): SaveAuthorResult!
        updateAuthor(id: ID!, input: AuthorInput!): Author!
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
       updateAuthor: Resolver<{}, MutationUpdateAuthorArgs, Author>;
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
     export interface MutationUpdateAuthorArgs {
       id: string;
       input: AuthorInput;
     }
     export interface Author {
       name: string;
     }

     export interface SaveAuthorResult {
       author: Author;
     }

     export interface AuthorInput {
       name: string;
       bio?: string | null | undefined;
     }
     "
    `);
  });
});
