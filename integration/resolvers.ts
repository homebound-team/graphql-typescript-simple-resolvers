import { AuthorResolvers } from "./graphql-types";

const canReturnUndefined: Pick<AuthorResolvers, "birthday"> = {
  birthday() {
    return undefined;
  },
};
