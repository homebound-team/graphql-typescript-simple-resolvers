import { GraphQLScalarType, GraphQLResolveInfo } from "graphql";
import { Context, AuthorId, Popularity } from "./entities";

export interface Resolvers {
  Query: QueryResolvers;
  Author: AuthorResolvers;
  Mutation: MutationResolvers;
  AuthorSummary?: AuthorSummaryResolvers;
  SaveAuthorResult?: SaveAuthorResultResolvers;
  Date: GraphQLScalarType;
}

export interface QueryResolvers {
  authors(root: {}, args: QueryAuthorsArgs, ctx: Context, info: GraphQLResolveInfo): MaybePromise<AuthorId[]>;
  authorSummaries(root: {}, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<AuthorSummary[]>;
}

export interface AuthorResolvers {
  name(root: AuthorId, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<string>;
  summary(root: AuthorId, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<AuthorSummary>;
  popularity(root: AuthorId, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<Popularity>;
  working(root: AuthorId, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<Working | null>;
  birthday(root: AuthorId, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<Date | null>;
}

export interface MutationResolvers {
  saveAuthor(
    root: {},
    args: MutationSaveAuthorArgs,
    ctx: Context,
    info: GraphQLResolveInfo,
  ): MaybePromise<SaveAuthorResult>;
}

export interface AuthorSummaryResolvers {
  numberOfBooks(root: AuthorSummary, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<number>;
  amountOfSales(root: AuthorSummary, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<number | null>;
}

export interface SaveAuthorResultResolvers {
  author(root: SaveAuthorResult, args: {}, ctx: Context, info: GraphQLResolveInfo): MaybePromise<AuthorId>;
}
export interface QueryAuthorsArgs {
  id: string | null;
}
export interface MutationSaveAuthorArgs {
  input: AuthorInput;
}
export interface AuthorSummary {
  numberOfBooks: number;
  amountOfSales: number | null;
}

export interface SaveAuthorResult {
  author: AuthorId;
}

export interface AuthorInput {
  name: string | null;
}
export { Popularity } from "./entities";
export enum Working {
  Yes = "YES",
  No = "NO",
}

type MaybePromise<T> = T | Promise<T>;
