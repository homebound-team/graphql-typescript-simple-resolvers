import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Scalars", () => {
  it("generates custom scalar types with built-in and mapped scalars", async () => {
    const schema = createTestSchema(`
      scalar Date
      scalar DateTime
      scalar CustomId

      type Author {
        name: String!
        birthday: Date
        birthdayPartyScheduled: DateTime
        customId: CustomId
      }

      type Query {
        authors: [Author!]!
      }
    `);

    const code = await runPlugin(schema, {
      scalars: {
        Date: "Date",
        DateTime: "Date",
        CustomId: "./scalars#CustomIdType",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import { type GraphQLResolveInfo, GraphQLScalarType } from "graphql";
     import type { Context } from "./context";
     import { CustomIdType } from "./scalars";

     export interface Resolvers {
       Query: QueryResolvers;
       Author?: AuthorResolvers;
       Date: GraphQLScalarType;
       DateTime: GraphQLScalarType;
       CustomId: GraphQLScalarType;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       authors: Resolver<{}, {}, readonly Author[]>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
       birthday: Resolver<Author, {}, Date | null | undefined>;
       birthdayPartyScheduled: Resolver<Author, {}, Date | null | undefined>;
       customId: Resolver<Author, {}, CustomIdType | null | undefined>;
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
       birthday: Date | null | undefined;
       birthdayPartyScheduled: Date | null | undefined;
       customId: CustomIdType | null | undefined;
     }
     "
    `);
  });
});
