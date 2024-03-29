import {
  AuthorInput,
  AuthorResolvers,
  ContainerResolvers,
  SubscriptionResolvers,
  SubscriptionSearchSubArgs,
} from "./graphql-types";
import { withFilter, PubSub } from "graphql-subscriptions";
import { Book } from "./entities";

// just as an example; IRL, you'd use a production ready PubSub impl
// See: https://www.apollographql.com/docs/apollo-server/data/subscriptions/#pubsub-implementations
const pubsub = new PubSub();

const canReturnUndefined: Pick<AuthorResolvers, "birthday"> = {
  birthday() {
    return undefined;
  },
};

const canReturnMappedTypesForInterfaces: Pick<ContainerResolvers, "thingOptional"> = {
  thingOptional() {
    return "a:1";
  },
};

const canInterfaceForInterfaces: Pick<ContainerResolvers, "thingOptional"> = {
  thingOptional() {
    return { name: "foo" };
  },
};

const subInterfaces: Pick<SubscriptionResolvers, "authorSaved" | "searchSub"> = {
  authorSaved: {
    subscribe: () => {
      return pubsub.asyncIterator("authorSavedEvent");
    },
  },
  searchSub: {
    subscribe: withFilter(
      () => new PubSub().asyncIterator("bookSearchEvent"),
      (payload, args: SubscriptionSearchSubArgs) => {
        return payload.book.title === args.query;
      },
    ),
  },
};

const canReturnReadonlyArrays: Pick<AuthorResolvers, "books"> = {
  books() {
    const books: readonly Book[] = [];
    return books;
  },
};

function canTreatInputArraysAsMutable() {
  const input: AuthorInput = null!;
  const mutateBooks = (ids: string[]): void => {};
  if (input.bookIds) {
    mutateBooks(input.bookIds);
  }
}
