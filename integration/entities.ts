export type Context = {
  userId?: string;
};

export type AuthorId = string;

export type Book = {};

export enum Popularity {
  Low = "LOW",
  High = "HIGH",
}

export abstract class Publisher {};
export class LargePublisher extends Publisher {};