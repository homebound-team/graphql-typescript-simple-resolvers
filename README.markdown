[![NPM](https://img.shields.io/npm/v/@homebound/graphql-typescript-simple-resolvers)](https://www.npmjs.com/package/@homebound/graphql-typescript-simple-resolvers)

This is a [graphql-code-generator](https://graphql-code-generator.com/) plugin that generates types for implementating an Apollo-/`graphql`-style implementation in TypeScript.

## Overview

graphql-code-generator has a built-in plugin for this, `typescript-resolvers`, however we have several opinionated/convention-based improvements over it's out-of-the-box behavior:

1. We generate purely server-side types, so the resulting output is generally much simpler and less error-prone (for engineers to read and reason about).

   Because the built-in `typescript-resolvers` plugin is based on the rest of the `graphql-code-generator` implementations, it originally generates "client-side" GraphQL types (i.e. `type Author { books: Book[] } type Book { author: Author }`, and then later re-jiggers these types to work well for the server-side, i.e. layers in the mapped types like `type Author { books: BookId[] } type Book { author: AuthorId }`.
   
   This leads to a fair amount of `Omit`/ `&` / `Omit` / `&` complexity that really we don't want/need, so this plugin generates the `Author`, `Book`, etc. types out-of-the-box with the appropriate mapped types baked into the types.

2. Better `avoidOptionals` behavior.

   By default the `typescript-resolvers` plugin makes all resolver fields optional, i.e. `type AuthorResolver { firstName?: string }`. This matches the standard JS/Apollo idiom of "well, if the resolver doesn't provide an impl, assume the programmer knew what they were doing, and just call the `firstName` key on the author root arg".
   
   This is fine for JS, but isn't idiomatic TS, where we want to use the compiler to check that for us.
   
   We can turn on `avoidOptionals` in `typescript-resolvers`, which then means all resolver fields are required, i.e. `type AuthorResolver { firstName: string }`. This is more pedantic, but generally in a good way.
   
   However, it's a little too blunt, because it also turns all of the `QueryResolvers` into being required, for all object types, even "just a DTO" output types like `type SomeMutationResult { count: Int }`.
   
   This plugin uses the nuance that only _mapped_ types (i.e. your entities like `Author`, `Book`, etc.) really need resolvers, so makes those required, but non-mapped types, like `SomeMutationResult`, which are just bags of built-in primitives, do not require resolvers.
   
   This gives the best of both worlds: the type-safety of `avoidOtionals` without the unnecessary boilerplate for just-a-DTO output types.

3. Is all around much simpler to reason about and maintain.

   The graphql-code-generator ecosystem is huge, and its breadth of functionality is impressive, but most of their plugins are: a) based on a visitor pattern, and b) reuse a lot of non-trivial visitor-based primitives across the various plugins.
   
   The visitor pattern is usually very appropriate for compiler-/AST-based systems, however at least for what this plugin is doing, it seems like overkill. The GraphQL type system is actually pretty "short" in depth, i.e. a type might be "a non-null list of non-null types", maybe with some union types thrown in, but generally not something that a little recursion can't handle (vs. expressions in programming language ASTs which can be very deep and is where the visitor pattern is great).

   Net/net, we ran into several minor bugs in the `typescript-resolvers` implementation, and having this "KISS" implementation so far has been easier to build and maintain than coming up-to-speed on the built-in `typescript-resolvers` plugin.

## Contributing

In order to develop changes for this package, follow these steps:

1. Make your desired changes in the [`src` directory](/src)

2. Adjust the example files under the [`integration` directory](/integration) to use your new feature.

3. Run `npm run build`, to create a build with your changes

4. Run `npm run graphql-codegen`, and verify the output in `graphql-types.ts` matches your expected output.

## Config

We support the same `contextType`, `mappers`, and `enumValues` config options as the stock `typescript-resolvers` plugin.

No other config options are currently supported b/c the output is tailored to our conventions.

