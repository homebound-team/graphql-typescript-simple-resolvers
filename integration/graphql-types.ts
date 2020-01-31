import { Context, AuthorId } from "./entities";

export interface Resolvers {
  Query: QueryResolvers;
  Author: AuthorResolvers;
  AuthorSummary?: AuthorSummaryResolvers;
}

export interface QueryResolvers {
  authors(root: {}, args: [], ctx: Context): MaybePromise<AuthorId[]>;
  authorSummaries(root: {}, args: [], ctx: Context): MaybePromise<AuthorSummary[]>;
}

export interface AuthorResolvers {
  name(root: AuthorId, args: [], ctx: Context): MaybePromise<string>;
}

export interface AuthorSummaryResolvers {
  numberOfBooks(root: AuthorSummary, args: [], ctx: Context): MaybePromise<number>;
  amountOfSales(root: AuthorSummary, args: [], ctx: Context): MaybePromise<number | null>;
}

export interface AuthorSummary {
  numberOfBooks: number;
  amountOfSales: number | null;
}

type MaybePromise<T> = T | Promise<T>;
