import { Context, AuthorId, Popularity } from "./entities";
import { GraphQLResolveInfo, GraphQLScalarType } from "graphql";

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
}

export interface QueryResolvers {
  authors: Resolver<{}, QueryAuthorsArgs, AuthorId[]>;
  authorSummaries: Resolver<{}, {}, AuthorSummary[]>;
  search: Resolver<{}, QuerySearchArgs, SearchResult[]>;
  testUnionOfUnions: Resolver<{}, {}, UnionOfUnions | null | undefined>;
}

export interface MutationResolvers {
  saveAuthor: Resolver<{}, MutationSaveAuthorArgs, SaveAuthorResult>;
}

export interface AuthorSummaryResolvers {
  numberOfBooks: Resolver<AuthorSummary, {}, number>;
  amountOfSales: Resolver<AuthorSummary, {}, number | null | undefined>;
}

export interface BookResolvers extends HasNameResolvers<Book>, FieldWithArgsResolvers<Book> {
  unionProp: Resolver<Book, {}, UnionProp | null | undefined>;
  reqUnionProp: Resolver<Book, {}, UnionProp>;
}

export interface ContainerResolvers {
  thingOptional: Resolver<Container, {}, null | undefined | AuthorId | HasName>;
  thingRequired: Resolver<Container, {}, AuthorId | HasName>;
  thingsOptional: Resolver<Container, {}, Array<AuthorId | HasName> | null | undefined>;
  thingsRequired: Resolver<Container, {}, Array<AuthorId | HasName>>;
}

export interface SubscriptionResolvers {
  authorSaved: SubscriptionResolver<Subscription, {}, AuthorId>;
  searchSub: SubscriptionResolver<Subscription, SubscriptionSearchSubArgs, SearchResult[]>;
}

export interface SaveAuthorResultResolvers {
  author: Resolver<SaveAuthorResult, {}, AuthorId>;
}

type MaybePromise<T> = T | Promise<T>;
export type Resolver<R, A, T> = (
  root: R,
  args: A,
  ctx: Context,
  info: GraphQLResolveInfo,
) => MaybePromise<T extends Array<infer U> ? readonly U[] : T>;

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

export interface Book {
  name: string;
  unionProp: UnionProp | null | undefined;
  reqUnionProp: UnionProp;
  field1: boolean | null | undefined;
}

export interface Container {
  thingOptional: null | undefined | AuthorId | HasName;
  thingRequired: AuthorId | HasName;
  thingsOptional: Array<AuthorId | HasName> | null | undefined;
  thingsRequired: Array<AuthorId | HasName>;
}

export interface Subscription {
  authorSaved: AuthorId;
  searchSub: SearchResult[];
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
