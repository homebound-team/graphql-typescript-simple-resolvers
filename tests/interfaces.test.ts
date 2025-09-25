import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Interface support", () => {
  it("generates interfaces", async () => {
    const schema = createTestSchema(`
      interface HasName {
        name: String!
      }

      interface FieldWithArgs {
        field1(input: Boolean): Boolean
      }

      interface Publisher {
        name: String
      }

      interface Node {
        id: ID!
      }

      type Author implements HasName & FieldWithArgs {
        name: String!
        bio: String
        field1(input: Boolean): Boolean
      }

      type Book implements HasName {
        name: String!
        isbn: String
      }

      type LargePublisher implements Publisher {
        name: String
      }

      type User implements Node {
        id: ID!
        name: String!
      }

      type Post implements Node {
        id: ID!
        title: String!
      }

      type Container {
        item: HasName
        requiredItem: HasName!
        items: [HasName!]!
        publisher: Publisher
      }

      type Query {
        getByName(name: String!): HasName
        author: Author
        container: Container!
        books: [Book!]!
        node(id: ID!): Node
        users: [User!]!
      }
    `);

    const code = await runPlugin(schema, {
      mappers: {
        Publisher: "./entities#PublisherEntity",
        Node: "./entities#NodeEntity",
        User: "./entities#UserEntity",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";
     import { NodeEntity, PublisherEntity, UserEntity } from "./entities";

     export interface Resolvers {
       User: UserResolvers;
       Query: QueryResolvers;
       Author?: AuthorResolvers;
       Book?: BookResolvers;
       LargePublisher?: LargePublisherResolvers;
       Post?: PostResolvers;
       Container?: ContainerResolvers;
     }

     export interface HasNameResolvers<T> {
       name: Resolver<T, {}, string>;
     }

     export interface FieldWithArgsResolvers<T> {
       field1: Resolver<T, FieldWithArgsField1Args, boolean | null | undefined>;
     }

     export interface PublisherResolvers<T> {
       name: Resolver<T, {}, string | null | undefined>;
     }

     export interface NodeResolvers<T> {
       id: Resolver<T, {}, string>;
     }

     export interface FieldWithArgsField1Args {
       input?: boolean | null | undefined;
     }
     export type HasNameTypes = Author | Book;

     export type FieldWithArgsTypes = Author;

     export type PublisherTypes = LargePublisher;

     export type NodeTypes = UserEntity | Post;

     export type UnionResolvers = {
       HasName: { __resolveType(o: Author | Book): string };
       FieldWithArgs: { __resolveType(o: Author): string };
       Publisher: { __resolveType(o: LargePublisher): string };
       Node: { __resolveType(o: UserEntity | Post): string };
     };

     export interface UserResolvers extends NodeResolvers<UserEntity> {
       name: Resolver<UserEntity, {}, string>;
     }

     export interface QueryResolvers {
       getByName: Resolver<{}, QueryGetByNameArgs, HasName | null | undefined>;
       author: Resolver<{}, {}, Author | null | undefined>;
       container: Resolver<{}, {}, Container>;
       books: Resolver<{}, {}, readonly Book[]>;
       node: Resolver<{}, QueryNodeArgs, NodeEntity | null | undefined>;
       users: Resolver<{}, {}, readonly UserEntity[]>;
     }

     export interface AuthorResolvers extends HasNameResolvers<Author>, FieldWithArgsResolvers<Author> {
       bio: Resolver<Author, {}, string | null | undefined>;
     }

     export interface BookResolvers extends HasNameResolvers<Book> {
       isbn: Resolver<Book, {}, string | null | undefined>;
     }

     export interface LargePublisherResolvers extends PublisherResolvers<LargePublisher> {
     }

     export interface PostResolvers extends NodeResolvers<Post> {
       title: Resolver<Post, {}, string>;
     }

     export interface ContainerResolvers {
       item: Resolver<Container, {}, HasName | null | undefined>;
       requiredItem: Resolver<Container, {}, HasName>;
       items: Resolver<Container, {}, ReadonlyArray<HasName>>;
       publisher: Resolver<Container, {}, PublisherEntity | null | undefined>;
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
     export interface QueryNodeArgs {
       id: string;
     }
     export interface Author {
       name: string;
       bio: string | null | undefined;
       field1: boolean | null | undefined;
     }

     export interface Book {
       name: string;
       isbn: string | null | undefined;
     }

     export interface LargePublisher {
       name: string | null | undefined;
     }

     export interface Post {
       id: string;
       title: string;
     }

     export interface Container {
       item: HasName | null | undefined;
       requiredItem: HasName;
       items: Array<HasName>;
       publisher: PublisherEntity | null | undefined;
     }

     export interface HasName {
       name: string;
     }

     export interface FieldWithArgs {
       field1: boolean | null | undefined;
     }
     "
    `);
  });
});
