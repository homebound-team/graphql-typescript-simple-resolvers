import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Interface support", () => {
  it("generates interfaces and implementing types", async () => {
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

      type Query {
        getByName(name: String!): HasName
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
     }

     export interface HasNameResolvers<T> {
       name: Resolver<T, {}, string>;
     }

     export type HasNameTypes = Author | Book;

     export type UnionResolvers = { HasName: { __resolveType(o: Author | Book): string } };

     export interface QueryResolvers {
       getByName: Resolver<{}, QueryGetByNameArgs, HasName | null | undefined>;
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

     export interface QueryGetByNameArgs {
       name: string;
     }
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
     "
    `);
  });

  it("generates interfaces with arguments", async () => {
    const schema = createTestSchema(`
      interface FieldWithArgs {
        field1(input: Boolean): Boolean
      }

      type Author implements FieldWithArgs {
        name: String!
        field1(input: Boolean): Boolean
      }

      type Query {
        author: Author
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

     export interface FieldWithArgsResolvers<T> {
       field1: Resolver<T, FieldWithArgsField1Args, boolean | null | undefined>;
     }

     export interface FieldWithArgsField1Args {
       input?: boolean | null | undefined;
     }
     export type FieldWithArgsTypes = Author;

     export type UnionResolvers = { FieldWithArgs: { __resolveType(o: Author): string } };

     export interface QueryResolvers {
       author: Resolver<{}, {}, Author | null | undefined>;
     }

     export interface AuthorResolvers extends FieldWithArgsResolvers<Author> {
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
       field1: boolean | null | undefined;
     }

     export interface FieldWithArgs {
       field1: boolean | null | undefined;
     }
     "
    `);
  });

  it("generates types using interfaces in fields", async () => {
    const schema = createTestSchema(`
      interface HasName {
        name: String!
      }

      type Author implements HasName {
        name: String!
      }

      type Container {
        item: HasName
        requiredItem: HasName!
        items: [HasName!]!
      }

      type Query {
        container: Container!
      }
    `);

    const code = await runPlugin(schema);

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       Author?: AuthorResolvers;
       Container?: ContainerResolvers;
     }

     export interface HasNameResolvers<T> {
       name: Resolver<T, {}, string>;
     }

     export type HasNameTypes = Author;

     export type UnionResolvers = { HasName: { __resolveType(o: Author): string } };

     export interface QueryResolvers {
       container: Resolver<{}, {}, Container>;
     }

     export interface AuthorResolvers extends HasNameResolvers<Author> {
     }

     export interface ContainerResolvers {
       item: Resolver<Container, {}, HasName | null | undefined>;
       requiredItem: Resolver<Container, {}, HasName>;
       items: Resolver<Container, {}, ReadonlyArray<HasName>>;
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

     export interface Container {
       item: HasName | null | undefined;
       requiredItem: HasName;
       items: Array<HasName>;
     }

     export interface HasName {
       name: string;
     }
     "
    `);
  });
});
