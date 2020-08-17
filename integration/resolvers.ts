import { AuthorResolvers, ContainerResolvers } from "./graphql-types";

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
