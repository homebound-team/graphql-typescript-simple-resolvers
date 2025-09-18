import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("GraphQL Subscriptions", () => {
  const schemaWithSubscriptions = `
    type User {
      id: ID!
      name: String!
      email: String!
    }

    type Post {
      id: ID!
      title: String!
      author: User!
      content: String!
    }

    type Comment {
      id: ID!
      post: Post!
      author: User!
      text: String!
    }

    union ActivityItem = Post | Comment

    type Query {
      users: [User!]!
      posts: [Post!]!
    }

    type Mutation {
      createUser(name: String!, email: String!): User!
      createPost(title: String!, content: String!, authorId: ID!): Post!
      createComment(postId: ID!, text: String!, authorId: ID!): Comment!
    }

    type Subscription {
      # Simple subscription without arguments
      userCreated: User!

      # Subscription with arguments
      postCreated(authorId: ID): Post!

      # Subscription returning arrays
      newActivity: [ActivityItem!]!

      # Subscription with multiple arguments
      commentsForPost(postId: ID!, authorId: ID): [Comment!]!

      # Subscription returning nullable types
      latestPost: Post
    }
  `;

  it("generates subscription types", async () => {
    const schema = createTestSchema(schemaWithSubscriptions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface Subscription {
  userCreated: User;
  postCreated: Post;
  newActivity: ActivityItem[];
  commentsForPost: Comment[];
  latestPost: Post | null | undefined;
}`);
  });

  it("generates subscription resolvers without arguments", async () => {
    const schema = createTestSchema(schemaWithSubscriptions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`userCreated: SubscriptionResolver<Subscription, {}, User>;`);
  });

  it("generates subscription resolvers with arguments", async () => {
    const schema = createTestSchema(schemaWithSubscriptions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`postCreated: SubscriptionResolver<Subscription, SubscriptionPostCreatedArgs, Post>;`);
  });

  it("generates subscription resolvers with multiple arguments", async () => {
    const schema = createTestSchema(schemaWithSubscriptions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(
      `commentsForPost: SubscriptionResolver<Subscription, SubscriptionCommentsForPostArgs, readonly Comment[]>;`,
    );
  });

  it("generates argument types for subscriptions with parameters", async () => {
    const schema = createTestSchema(schemaWithSubscriptions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });

    expect(code).toContain(`export interface SubscriptionPostCreatedArgs {
  authorId?: string | null | undefined;
}`);

    expect(code).toContain(`export interface SubscriptionCommentsForPostArgs {
  postId: string;
  authorId?: string | null | undefined;
}`);
  });

  it("snapshots subscription generation", async () => {
    const schema = createTestSchema(schemaWithSubscriptions);
    const code = await runPlugin(schema, {
      scalars: {},
      mappers: {},
      enumValues: {},
    });
    expect(code).toMatchSnapshot();
  });

  it("handles subscription with mapped types", async () => {
    const schema = createTestSchema(schemaWithSubscriptions);
    const code = await runPlugin(schema, {
      mappers: {
        User: "./entities#UserEntity",
        Post: "./entities#PostEntity",
      },
      scalars: {},
      enumValues: {},
    });

    expect(code).toContain(`import { PostEntity, UserEntity } from "./entities";`);
  });
});
