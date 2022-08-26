import { AuthorId, Book, Context, Popularity } from "./entities";
import { GraphQLResolveInfo, GraphQLScalarType } from "graphql";

export interface Resolvers {
  Author: AuthorResolvers;
  Book: BookResolvers;
  Mutation: MutationResolvers;
  Query: QueryResolvers;
  AuthorSummary?: AuthorSummaryResolvers;
  Container?: ContainerResolvers;
  SaveAuthorResult?: SaveAuthorResultResolvers;
  Subscription?: SubscriptionResolvers;
  Date: GraphQLScalarType;
  DateTime: GraphQLScalarType;
}

export interface FieldWithArgsResolvers<T> {
  field1: Resolver<T, FieldWithArgsField1Args, boolean | null | undefined>;
}

export interface HasNameResolvers<T> {
  name: Resolver<T, {}, string>;
}

export interface FieldWithArgsField1Args {
  input?: boolean | null | undefined;
}
export type FieldWithArgsTypes = AuthorId | Book;

export type HasNameTypes = AuthorId | Book;

export type UnionResolvers = {
  SearchResult: { __resolveType(o: AuthorId | Book): string };
  UnionOfUnions: { __resolveType(o: SearchResult | UnionProp): string };
  UnionProp: { __resolveType(o: Boolean | String): string };
  UnionWithPrimitives: {
    __resolveType(o: AuthorId | Boolean | String): string;
  };
  FieldWithArgs: { __resolveType(o: AuthorId | Book): string };
  HasName: { __resolveType(o: AuthorId | Book): string };
};

export interface AuthorResolvers
  extends FieldWithArgsResolvers<AuthorId>, HasNameResolvers<AuthorId> {
  birthday: Resolver<AuthorId, {}, Date | null | undefined>;
  birthdayPartyScheduled: Resolver<AuthorId, {}, Date | null | undefined>;
  books: Resolver<AuthorId, {}, readonly Book[]>;
  popularity: Resolver<AuthorId, {}, Popularity>;
  populate: Resolver<AuthorId, {}, boolean | null | undefined>;
  summary: Resolver<AuthorId, {}, AuthorSummary>;
  working: Resolver<AuthorId, {}, Working | null | undefined>;
}

export interface BookResolvers
  extends FieldWithArgsResolvers<Book>, HasNameResolvers<Book> {
  reqUnionProp: Resolver<Book, {}, UnionProp>;
  unionProp: Resolver<Book, {}, UnionProp | null | undefined>;
}

export interface MutationResolvers {
  saveAuthor: Resolver<{}, MutationSaveAuthorArgs, SaveAuthorResult>;
}

export interface QueryResolvers {
  authorSummaries: Resolver<{}, {}, readonly AuthorSummary[]>;
  authors: Resolver<{}, QueryAuthorsArgs, readonly AuthorId[]>;
  search: Resolver<{}, QuerySearchArgs, readonly SearchResult[]>;
  testUnionOfUnions: Resolver<{}, {}, UnionOfUnions | null | undefined>;
}

export interface AuthorSummaryResolvers {
  amountOfSales: Resolver<AuthorSummary, {}, number | null | undefined>;
  numberOfBooks: Resolver<AuthorSummary, {}, number>;
}

export interface ContainerResolvers {
  thingOptional: Resolver<
    Container,
    {},
    AuthorId | Book | HasName | null | undefined
  >;
  thingRequired: Resolver<Container, {}, AuthorId | Book | HasName>;
  thingsOptional: Resolver<
    Container,
    {},
    ReadonlyArray<AuthorId | Book | HasName> | null | undefined
  >;
  thingsRequired: Resolver<
    Container,
    {},
    ReadonlyArray<AuthorId | Book | HasName>
  >;
}

export interface SaveAuthorResultResolvers {
  author: Resolver<SaveAuthorResult, {}, AuthorId>;
}

export interface SubscriptionResolvers {
  authorSaved: SubscriptionResolver<Subscription, {}, AuthorId>;
  searchSub: SubscriptionResolver<
    Subscription,
    SubscriptionSearchSubArgs,
    readonly SearchResult[]
  >;
}

type MaybePromise<T> = T | Promise<T>;
export type Resolver<R, A, T> = (
  root: R,
  args: A,
  ctx: Context,
  info: GraphQLResolveInfo,
) => MaybePromise<T>;

export type SubscriptionResolverFilter<R, A, T> = (
  root: R | undefined,
  args: A,
  ctx: Context,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;
export type SubscriptionResolver<R, A, T> = {
  subscribe: (
    root: R | undefined,
    args: A,
    ctx: Context,
    info: GraphQLResolveInfo,
  ) => AsyncIterator<T>;
};

export interface MutationSaveAuthorArgs {
  input: AuthorInput;
}
export interface QueryAuthorsArgs {
  id?: string | null | undefined;
}
export interface QuerySearchArgs {
  query: string;
}
export interface SubscriptionSearchSubArgs {
  query: string;
}
export interface AuthorSummary {
  amountOfSales: number | null | undefined;
  numberOfBooks: number;
}

export interface Container {
  thingOptional: AuthorId | Book | HasName | null | undefined;
  thingRequired: AuthorId | Book | HasName;
  thingsOptional: Array<AuthorId | Book | HasName> | null | undefined;
  thingsRequired: Array<AuthorId | Book | HasName>;
}

export interface SaveAuthorResult {
  author: AuthorId;
}

export interface Subscription {
  authorSaved: AuthorId;
  searchSub: SearchResult[];
}

export interface FieldWithArgs {
  field1: boolean | null | undefined;
}

export interface HasName {
  name: string;
}

export interface AuthorInput {
  bookIds?: string[] | null | undefined;
  bookIds2?: Array<string | null | undefined> | null | undefined;
  name?: string | null | undefined;
}

export { Popularity } from "./entities";

export enum Working {
  No = "NO",
  Yes = "YES",
}

export type SearchResult = AuthorId | Book;

export type UnionOfUnions = SearchResult | UnionProp;

export type UnionProp = boolean | string;

export type UnionWithPrimitives = AuthorId | boolean | string;
