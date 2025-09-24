import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Interface as mapped type", () => {
  it("generates interfaces configured as mapped types", async () => {
    const schema = createTestSchema(`
      interface Publisher {
        name: String
      }

      type LargePublisher implements Publisher {
        name: String
      }

      type Book {
        publisher: Publisher
      }

      type Query {
        books: [Book!]!
      }
    `);

    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {
        Publisher: "./entities#PublisherEntity",
      },
      enumValues: {},
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";
     import { PublisherEntity } from "./entities";

     export interface Resolvers {
       Query: QueryResolvers;
       LargePublisher?: LargePublisherResolvers;
       Book?: BookResolvers;
     }

     export interface PublisherResolvers<T> {
       name: Resolver<T, {}, string | null | undefined>;
     }

     export type PublisherTypes = LargePublisher;

     export type UnionResolvers = { Publisher: { __resolveType(o: LargePublisher): string } };

     export interface QueryResolvers {
       books: Resolver<{}, {}, readonly Book[]>;
     }

     export interface LargePublisherResolvers extends PublisherResolvers<LargePublisher> {
     }

     export interface BookResolvers {
       publisher: Resolver<Book, {}, PublisherEntity | null | undefined>;
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

     export interface LargePublisher {
       name: string | null | undefined;
     }

     export interface Book {
       publisher: PublisherEntity | null | undefined;
     }
     "
    `);
  });

  it("generates interface implementations with mapped interface", async () => {
    const schema = createTestSchema(`
      interface Node {
        id: ID!
      }

      type User implements Node {
        id: ID!
        name: String!
      }

      type Post implements Node {
        id: ID!
        title: String!
      }

      type Query {
        node(id: ID!): Node
        users: [User!]!
      }
    `);

    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {
        Node: "./entities#NodeEntity",
        User: "./entities#UserEntity",
      },
      enumValues: {},
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo } from "graphql";
     import { Context } from "./context";
     import { NodeEntity, UserEntity } from "./entities";

     export interface Resolvers {
       User: UserResolvers;
       Query: QueryResolvers;
       Post?: PostResolvers;
     }

     export interface NodeResolvers<T> {
       id: Resolver<T, {}, string>;
     }

     export type NodeTypes = UserEntity | Post;

     export type UnionResolvers = { Node: { __resolveType(o: UserEntity | Post): string } };

     export interface UserResolvers extends NodeResolvers<UserEntity> {
       name: Resolver<UserEntity, {}, string>;
     }

     export interface QueryResolvers {
       node: Resolver<{}, QueryNodeArgs, NodeEntity | null | undefined>;
       users: Resolver<{}, {}, readonly UserEntity[]>;
     }

     export interface PostResolvers extends NodeResolvers<Post> {
       title: Resolver<Post, {}, string>;
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

     export interface QueryNodeArgs {
       id: string;
     }
     export interface Post {
       id: string;
       title: string;
     }
     "
    `);
  });
});
