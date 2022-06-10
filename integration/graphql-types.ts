import { Context, AuthorId, Book, Popularity } from "./entities";
import { GraphQLResolveInfo, GraphQLScalarType } from "graphql";

export interface Resolvers {
  Author: AuthorResolvers;
  Book: BookResolvers;
  Query: QueryResolvers;
  Mutation: MutationResolvers;
  AuthorSummary?: AuthorSummaryResolvers;
  Container?: ContainerResolvers;
  Subscription?: SubscriptionResolvers;
  SaveAuthorResult?: SaveAuthorResultResolvers;
  Date: GraphQLScalarType;
  DateTime: GraphQLScalarType;
}

export interface HasNameResolvers<T> {
  name: Resolver<T, {}, string>;
}

export interface FieldWithArgsResolvers<T> {
  field1: Resolver<T, FieldWithArgsField1Args, boolean | null | undefined>;
}

export interface FieldWithArgsField1Args {
  input?: boolean | null | undefined;
}
export type HasNameTypes = AuthorId | Book;

export type FieldWithArgsTypes = AuthorId | Book;

export type UnionResolvers = {
  UnionProp: { __resolveType(o: String | Boolean): string };
  SearchResult: { __resolveType(o: AuthorId | Book): string };
  UnionOfUnions: { __resolveType(o: UnionProp | SearchResult): string };
  UnionWithPrimitives: { __resolveType(o: String | Boolean | AuthorId): string };
  HasName: { __resolveType(o: AuthorId | Book): string };
  FieldWithArgs: { __resolveType(o: AuthorId | Book): string };
};

export interface AuthorResolvers extends HasNameResolvers<AuthorId>, FieldWithArgsResolvers<AuthorId> {
  summary: Resolver<AuthorId, {}, AuthorSummary>;
  popularity: Resolver<AuthorId, {}, Popularity>;
  working: Resolver<AuthorId, {}, Working | null | undefined>;
  birthday: Resolver<AuthorId, {}, Date | null | undefined>;
  birthdayPartyScheduled: Resolver<AuthorId, {}, Date | null | undefined>;
  populate: Resolver<AuthorId, {}, boolean | null | undefined>;
  books: Resolver<AuthorId, {}, readonly Book[]>;
}

export interface BookResolvers extends HasNameResolvers<Book>, FieldWithArgsResolvers<Book> {
  unionProp: Resolver<Book, {}, UnionProp | null | undefined>;
  reqUnionProp: Resolver<Book, {}, UnionProp>;
}

export interface QueryResolvers {
  authors: Resolver<{}, QueryAuthorsArgs, readonly AuthorId[]>;
  authorSummaries: Resolver<{}, {}, readonly AuthorSummary[]>;
  search: Resolver<{}, QuerySearchArgs, readonly SearchResult[]>;
  testUnionOfUnions: Resolver<{}, {}, UnionOfUnions | null | undefined>;
}

export interface MutationResolvers {
  saveAuthor: Resolver<{}, MutationSaveAuthorArgs, SaveAuthorResult>;
}

export interface AuthorSummaryResolvers {
  numberOfBooks: Resolver<AuthorSummary, {}, number>;
  amountOfSales: Resolver<AuthorSummary, {}, number | null | undefined>;
}

export interface ContainerResolvers {
  thingOptional: Resolver<Container, {}, AuthorId | Book | HasName | null | undefined>;
  thingRequired: Resolver<Container, {}, AuthorId | Book | HasName>;
  thingsOptional: Resolver<Container, {}, ReadonlyArray<AuthorId | Book | HasName> | null | undefined>;
  thingsRequired: Resolver<Container, {}, ReadonlyArray<AuthorId | Book | HasName>>;
}

export interface SubscriptionResolvers {
  authorSaved: SubscriptionResolver<Subscription, {}, AuthorId>;
  searchSub: SubscriptionResolver<Subscription, SubscriptionSearchSubArgs, readonly SearchResult[]>;
}

export interface SaveAuthorResultResolvers {
  author: Resolver<SaveAuthorResult, {}, AuthorId>;
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

export interface Container {
  thingOptional: AuthorId | Book | HasName | null | undefined;
  thingRequired: AuthorId | Book | HasName;
  thingsOptional: ReadonlyArray<AuthorId | Book | HasName> | null | undefined;
  thingsRequired: ReadonlyArray<AuthorId | Book | HasName>;
}

export interface Subscription {
  authorSaved: AuthorId;
  searchSub: readonly SearchResult[];
}

export interface SaveAuthorResult {
  author: AuthorId;
}

export interface HasName {
  name: string;
}

export interface FieldWithArgs {
  field1: boolean | null | undefined;
}

export interface AuthorInput {
  name?: string | null | undefined;
  bookIds?: string[] | null | undefined;
  bookIds2?: Array<string | null | undefined> | null | undefined;
}

export { Popularity } from "./entities";

export enum Working {
  Yes = "YES",
  No = "NO",
}

export type UnionProp = string | boolean;

export type SearchResult = AuthorId | Book;

export type UnionOfUnions = UnionProp | SearchResult;

export type UnionWithPrimitives = string | boolean | AuthorId;
