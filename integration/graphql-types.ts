import { Context, AuthorId, Popularity } from "./entities";
import {
  GraphQLResolveInfo,
  GraphQLSchema,
  DocumentNode,
  GraphQLFieldResolver,
  ExecutionResult,
  GraphQLScalarType,
} from "graphql";

export interface Resolvers {
  Author: AuthorResolvers;
  Query: QueryResolvers;
  Mutation: MutationResolvers;
  AuthorSummary?: AuthorSummaryResolvers;
  Book?: BookResolvers;
  Container?: ContainerResolvers;
  Subscription?: SubscriptionResolvers;
  SaveAuthorResult?: SaveAuthorResultResolvers;
  Date: GraphQLScalarType;
  DateTime: GraphQLScalarType;
}

export interface AuthorResolvers {
  name: Resolver<AuthorId, {}, string>;
  summary: Resolver<AuthorId, {}, AuthorSummary>;
  popularity: Resolver<AuthorId, {}, Popularity>;
  working: Resolver<AuthorId, {}, Working | null | undefined>;
  birthday: Resolver<AuthorId, {}, Date | null | undefined>;
  birthdayPartyScheduled: Resolver<AuthorId, {}, Date | null | undefined>;
  populate: Resolver<AuthorId, {}, boolean | null | undefined>;
}

export interface QueryResolvers {
  authors: Resolver<{}, QueryAuthorsArgs, AuthorId[]>;
  authorSummaries: Resolver<{}, {}, AuthorSummary[]>;
  search: Resolver<{}, QuerySearchArgs, Array<AuthorId | Book>>;
}

export interface MutationResolvers {
  saveAuthor: Resolver<{}, MutationSaveAuthorArgs, SaveAuthorResult>;
}

export interface AuthorSummaryResolvers {
  numberOfBooks: Resolver<AuthorSummary, {}, number>;
  amountOfSales: Resolver<AuthorSummary, {}, number | null | undefined>;
}

export interface BookResolvers {
  name: Resolver<Book, {}, string>;
  unionProp: Resolver<Book, {}, null | undefined | String | Boolean>;
  reqUnionProp: Resolver<Book, {}, String | Boolean>;
}

export interface ContainerResolvers {
  thingOptional: Resolver<Container, {}, null | undefined | AuthorId | HasName>;
  thingRequired: Resolver<Container, {}, AuthorId | HasName>;
  thingsOptional: Resolver<Container, {}, Array<AuthorId | HasName> | null | undefined>;
  thingsRequired: Resolver<Container, {}, Array<AuthorId | HasName>>;
}

export interface SubscriptionResolvers {
  authorSaved: SubscriptionResolver<Subscription, {}>;
  searchSub: SubscriptionResolver<Subscription, SubscriptionSearchSubArgs>;
}

export interface SaveAuthorResultResolvers {
  author: Resolver<SaveAuthorResult, {}, AuthorId>;
}

export type Resolver<R, A, T> = (root: R, args: A, ctx: Context, info: GraphQLResolveInfo) => T | Promise<T>;

export type SubscriptionResolver<R, A> = {
  subscribe: (
    schema: GraphQLSchema,
    document: DocumentNode,
    rootValue?: R,
    contextValue?: Context,
    variableValues?: A,
    operationName?: string,
    fieldResolver?: GraphQLFieldResolver<any, any>,
    subscribeFieldResolver?: GraphQLFieldResolver<any, any>,
  ) => Promise<AsyncIterableIterator<ExecutionResult> | ExecutionResult>;
};

export interface QueryAuthorsArgs {
  id?: string | null | undefined;
}
export interface QuerySearchArgs {
  query: string;
}
export interface MutationSaveAuthorArgs {
  input: AuthorInput;
}
export interface SubscriptionSearchSubArgs {
  query: string;
}
export interface AuthorSummary {
  numberOfBooks: number;
  amountOfSales: number | null | undefined;
}

export interface Book {
  name: string;
  unionProp: null | undefined | String | Boolean;
  reqUnionProp: String | Boolean;
}

export interface Container {
  thingOptional: null | undefined | AuthorId | HasName;
  thingRequired: AuthorId | HasName;
  thingsOptional: Array<AuthorId | HasName> | null | undefined;
  thingsRequired: Array<AuthorId | HasName>;
}

export interface Subscription {
  authorSaved: AuthorId;
  searchSub: Array<AuthorId | Book>;
}

export interface SaveAuthorResult {
  author: AuthorId;
}

export interface HasName {
  name: string;
}

export interface AuthorInput {
  name?: string | null | undefined;
}

export { Popularity } from "./entities";

export enum Working {
  Yes = "YES",
  No = "NO",
}
