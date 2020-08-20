import {
  AuthorResolvers,
  ContainerResolvers,
  SubscriptionResolvers,
} from "./graphql-types";

const canReturnUndefined: Pick<AuthorResolvers, "birthday"> = {
  birthday() {
    return undefined;
  },
};

const canReturnMappedTypesForInterfaces: Pick<
  ContainerResolvers,
  "thingOptional"
> = {
  thingOptional() {
    return "a:1";
  },
};

const canInterfaceForInterfaces: Pick<ContainerResolvers, "thingOptional"> = {
  thingOptional() {
    return { name: "foo" };
  },
};

const subInterfaces: Pick<SubscriptionResolvers, "authorSaved"> = {
  authorSaved: {
    subscribe: (
      schema,
      document,
      root,
      ctx,
      vars,
      operationName,
      fieldResolver,
      subscribeFieldResolver,
    ) => {
      return Promise.resolve({});
    },
  },
};
