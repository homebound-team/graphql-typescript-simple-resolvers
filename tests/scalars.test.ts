import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("Custom scalars", () => {
  it("generates custom scalar types", async () => {
    const schema = createTestSchema(`
      scalar Date
      scalar DateTime

      type Author {
        name: String!
        birthday: Date
        birthdayPartyScheduled: DateTime
      }

      type Query {
        authors: [Author!]!
      }
    `);

    const code = await runPlugin(schema, {
      scalars: {
        Date: "Date",
        DateTime: "Date",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import { GraphQLResolveInfo, GraphQLScalarType } from "graphql";
     import { Context } from "./context";

     export interface Resolvers {
       Query: QueryResolvers;
       Author?: AuthorResolvers;
       Date: GraphQLScalarType;
       DateTime: GraphQLScalarType;
     }

     export type UnionResolvers = {};

     export interface QueryResolvers {
       authors: Resolver<{}, {}, readonly Author[]>;
     }

     export interface AuthorResolvers {
       name: Resolver<Author, {}, string>;
       birthday: Resolver<Author, {}, Date | null | undefined>;
       birthdayPartyScheduled: Resolver<Author, {}, Date | null | undefined>;
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
     }
     "
    `);
  });

  it("generates mapped scalars", async () => {
    const schema = createTestSchema(`
      scalar Date

      type Author {
        name: String!
        birthday: Date
      }

      type Query {
        authors: [Author!]!
      }
    `);

    const code = await runPlugin(schema, {
      scalars: {
        Date: "./scalars#DateType",
      },
    });

    expect(code).toMatchInlineSnapshot(`
     "import { Context } from './context';
     import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';


         export interface Resolvers {
           Query: QueryResolvers; 
           Author?: AuthorResolvers; 
           Date: GraphQLScalarType;
         }
       
         export type UnionResolvers = {
           
         }
       
           export interface QueryResolvers extends  {
             authors: Resolver<{}, {}, readonly Author[]>;
           }
         
           export interface AuthorResolvers extends  {
             name: Resolver<Author, {}, string>;birthday: Resolver<Author, {}, ./scalars#DateType | null | undefined>;
           }
         
         type MaybePromise<T> = T | Promise<T>;
         export type Resolver<R, A, T> = (root: R, args: A, ctx: Context, info: GraphQLResolveInfo) => MaybePromise<T>;
       
         export type SubscriptionResolverFilter<R, A, T> = (root: R | undefined, args: A, ctx: Context, info: GraphQLResolveInfo) => boolean | Promise<boolean>;
         export type SubscriptionResolver<R, A, T> = {
           subscribe: (root: R | undefined, args: A, ctx: Context, info: GraphQLResolveInfo) => AsyncIterator<T>;
         }
       
           export interface Author {
             name: string;birthday: ./scalars#DateType | null | undefined;
           }
         "
    `);
  });
});
