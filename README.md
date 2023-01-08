# perun

[![NPM](https://img.shields.io/npm/v/perun.svg)](https://www.npmjs.com/package/perun)
[![Build status](https://github.com/markojerkic/perun/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/markojerkic/perun/actions/workflows/npm-publish.yml)

Simple 100% typesafe router for Preact using Preact signals and Zod.

# Table of contents

-   [Install](#install)
-   [Usage](#usage)
    -   [Example with three routes](#example-with-three-routes)
-   [Api](#api)
    - [createRoute](#createroute)

## Install

```
npm install perun
```

Or, if you are using yarn:

```
yarn add perun
```

## Usage

#### Example with three routes

```tsx
export const routes = {
    plyersCountry: createRoute({
        routePattern: "/players/[country]/[playername]",
        renderComponent: (props) => (
            <TestComponent2
                country={props.country}
                player={props.playername}
                queryParams={props.queryParams}
            />
        ),
        searchParamsValidator: z.object({
            ime: z.string(),
            prezime: z.string().optional(),
        }),
    }),

    lastNameId: createRoute({
        routePattern: "/[id?]/ime/[lastname]",
        renderComponent: (props) => (
            <TestComponent
                lastname={props.lastname}
                id={props.id ?? "name id"}
            />
        ),
        searchParamsValidator: z.object({}),
    }),

    asyncRoute: createAsyncRoute({
        routePattern: "/async/[route]",
        renderComponent: (props) =>
            import("./async").then((module) => (
                <module.AsyncComponent route={props.route} />
            )),
        searchParamsValidator: z.object({}),
    }),
};
```

## Api

### createRoute

`createRoute` function takes three parameters:

-   `routePatter: string`
    -   This is a string representation of the route. The route must start with `/`, and must not end with `/`
    -   Dynamic route parts are indicated by: `[variableName]`
        -   If this is an optional part of the route, you should put an `?` at the end of the variable name. This does not mean that the variable will be called e.g. `variableName`. Instead the type of the variable will just be `string | undefind`
- `searchParamsValidator: ZodObject`
    - This prop contains a [Zod](https://github.com/colinhacks/zod) validator. The validator object should only be one dimensional (nesting is not supported).
    - If query params are not required, you should pass an empty zod object, e.g. `z.object({})`
-   `renderComponent: (props: RouteParamsWithOptionalQueryParams<TRoute, ...> ) => Component`
    - This is a callback functio which should return a Preact component. The `props` contain dynamic parts of the route which will be of type `string` or `string | undefined` (if indicated that the route part is optional), and `queryParams` object which will contain the query params vlidated by the `zod` validator passed through `searchParamsValidator`.


```tsx
{
        routePattern: "/players/[country]/[playername]",
        renderComponent: (({ country, playername, queryParams })) => (
            <TestComponent2
                country={props.country}
                player={props.playername}
                queryParams={props.queryParams}
            />
        ),
        searchParamsValidator: z.object({
            ime: z.string(),
            prezime: z.string().optional(),
        }),
    }
````
