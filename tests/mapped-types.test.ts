import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Mapped types", () => {
  it("generates resolver interfaces for mapped entity types", async () => {
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
});
