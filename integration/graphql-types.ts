import { Context, AuthorId, Popularity } from "./entities";
import { GraphQLResolveInfo, GraphQLScalarType } from "graphql";

export interface Resolvers {
  Author: AuthorResolvers;
  Query: QueryResolvers;
  Mutation: MutationResolvers;
  AuthorSummary?: AuthorSummaryResolvers;
  Book?: BookResolvers;
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

export interface SaveAuthorResultResolvers {
  author: Resolver<SaveAuthorResult, {}, AuthorId>;
}

type Resolver<R, A, T> = (root: R, args: A, ctx: Context, info: GraphQLResolveInfo) => T | Promise<T>;

export interface QueryAuthorsArgs {
  id: string | null | undefined;
}
export interface QuerySearchArgs {
  query: string;
}
export interface MutationSaveAuthorArgs {
  input: AuthorInput;
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

export interface SaveAuthorResult {
  author: AuthorId;
}

export interface AuthorInput {
  name?: string | null | undefined;
}

export { Popularity } from "./entities";

export enum Working {
  Yes = "YES",
  No = "NO",
}
