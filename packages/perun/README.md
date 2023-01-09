# perun

[![NPM](https://img.shields.io/npm/v/perun.svg)](https://www.npmjs.com/package/perun)
[![Build status](https://github.com/markojerkic/perun/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/markojerkic/perun/actions/workflows/npm-publish.yml)

Simple 100% typesafe router for Preact using Preact signals and Zod.

# Table of contents

- [Install](#install)
- [Usage](#usage)
  - [Example with three routes](#example-with-three-routes)
- [Api](#api)
  - [createRoute](#createroute)
  - [createAsyncRoute](#createasyncroute)
  - [Link](#link)
  - [routeTo](#routeto)
  - [Router](#router)

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
      <TestComponent lastname={props.lastname} id={props.id ?? "name id"} />
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

const NoRoutesMatch = () => {
  return <div>404, requested route is not defined :(</div>;
};

export const App = () => {
  const toPersonWithId = useCallback(() => {
    routes.lastNameId.routeTo({ id: "marko", lastname: "jerkic" });
  }, []);

  const toPerson = useCallback(() => {
    routes.lastNameId.routeTo({ lastname: "jerkic" });
  }, []);

  const toPlayer = useCallback(() => {
    routes.plyersCountry.routeTo({
      playername: "stipe",
      country: "hrv",
      queryParams: {
        godine: 22,
        ime: "Stipe",
        prezime: "Stipić",
      },
    });
  }, []);

  const toAsyncRoute = useCallback(() => {
    routes.asyncRoute.routeTo({ route: "neka" });
  }, []);

  return (
    <>
      <p>Bok, ovo je moj router :)</p>
      <div class="flex space-x-4 my-4">
        <routes.plyersCountry.Link
          playername="Marko"
          country="Hrvatska"
          queryParams={{ ime: "Marko", prezime: "Jerkić", godine: 22 }}
        >
          Na igrač marko ajde
        </routes.plyersCountry.Link>
        <button className="bg-red-300" onClick={() => toPlayer()}>
          Idemo na igrač stipe iz hrv
        </button>
        <button className="bg-blue-300" onClick={() => toPerson()}>
          Idemo na osobu jerkic
        </button>
        <button className="bg-blue-300" onClick={() => toPersonWithId()}>
          Idemo na osobu jerkic s identifikatorom
        </button>
        <button className="bg-fuchsia-300" onClick={() => toAsyncRoute()}>
          Idemo na async rutu
        </button>
      </div>
      <Router routes={routes}>
        <NoRoutesMatch />
      </Router>
    </>
  );
};
```

## Api

### createRoute

`createRoute` function takes three parameters:

- `routePatter: string`
  - This is a string representation of the route. The route must start with `/`, and must not end with `/`
  - Dynamic route parts are indicated by: `[variableName]`
    - If this is an optional part of the route, you should put an `?` at the end of the variable name. This does not mean that the variable will be called e.g. `variableName`. Instead the type of the variable will just be `string | undefind`
- `searchParamsValidator: ZodObject`
  - This prop contains a [Zod](https://github.com/colinhacks/zod) validator. The validator object should only be one dimensional (nesting is not supported).
  - If query params are not required, you should pass an empty zod object, e.g. `z.object({})`
- `renderComponent: (props: RouteParamsWithOptionalQueryParams<TRoute, ...> ) => Component`
  - This is a callback function which should return a Preact component. The `props` contain dynamic parts of the route which will be of type `string` or `string | undefined` (if indicated that the route part is optional), and `queryParams` object which will contain the query params validated by the `zod` validator passed through `searchParamsValidator`.

```tsx
{
        routePattern: "/players/[country]/[playername]",
        renderComponent: (({ country, playername, queryParams })) => (
            <TestComponent2
                country={country}
                player={playername}
                queryParams={queryParams}
            />
        ),
        searchParamsValidator: z.object({
            ime: z.string(),
            prezime: z.string().optional(),
        }),
    }
```

### createAsyncRoute

`createAsyncRoute` function takes three parameters:

- `routePatter: string`
  - This is a string representation of the route. The route must start with `/`, and must not end with `/`
  - Dynamic route parts are indicated by: `[variableName]`
    - If this is an optional part of the route, you should put an `?` at the end of the variable name. This does not mean that the variable will be called, e.g. `variableName`. Instead, the type of the variable will just be `string | undefind`
- `searchParamsValidator: ZodObject`
  - This prop contains a [Zod](https://github.com/colinhacks/zod) validator. The validator object should only be one dimensional (nesting is not supported).
  - If query params are not required, you should pass an empty zod object, e.g. `z.object({})`
- `renderComponent: (props: RouteParamsWithOptionalQueryParams<TRoute, ...> ) => Promise<Component>`
  - This is a callback function which imports a component async. The imported component should be in a separate file, and should be imported as displayed in the example below.
  - The `props` contain dynamic parts of the route which will be of type `string` or `string | undefined` (if indicated that the route part is optional), and `queryParams` object which will contain the query params vlidated by the `zod` validator passed through `searchParamsValidator`.

```tsx
{
        routePattern: "/players/[country]/[playername]",
        renderComponent: (props) =>
          import("./async").then((module) => (
            <module.TestComponent2
                country={country}
                player={playername}
                queryParams={queryParams}
                route={props.route} />
        ),
        searchParamsValidator: z.object({
            ime: z.string(),
            prezime: z.string().optional(),
        }),
    }
```
### Link

The `Link` is a very handy typesafe wrapper around classic HTML `<a href="http://...">Link</a>` tag.
You use it as such:
``` tsx
<routes.plyersCountry.Link
  playername="Marko"
  country="Hrvatska"
  queryParams={{ ime: "Marko", prezime: "Jerkić", godine: 22 }}
>
  Na igrač marko ajde
</routes.plyersCountry.Link>
```

- The `routes` is the variable containing created routes as shown in  [this section](#example-with-three-routes). This handy `Link` component is why you should not inline the routes creation, rather create them as a static variable and export them.
- Dynamic route variables are referenced each individually (in the example above, those would be `playername` and `country`), and query parameters are bundled together, and they are always optional.
- Anything passed as children to this component will be rendered as the contents of the underlying `<a>` tag.

### routeTo
Similarly to the [`Link`](#link) component, this a typesafe way to change the route.

``` tsx
routes.plyersCountry.routeTo({
  playername: "stipe",
  country: "hrv",
  queryParams: {
    godine: 22,
    ime: "Stipe",
    prezime: "Stipić",
  },
});
```
- Unlike `Link`, this does not render anything, as this is meant to be used in a callback of some sorts.
- The `routes` is the variable containing created routes as shown in  [this section](#example-with-three-routes). This handy `Link` component is why you should not inline the routes' creation, rather create them as a static variable and export them.
- Dynamic route variables are referenced each individually (in the example above, those would be `playername` and `country`), and query parameters are bundled together, and they are always optional.

### Router

The `Router` component is set where you want to bootstrap your components selected by the current route.
``` tsx
<Router routes={routes}>
  <NoRoutesMatch />
</Router>
```
- `routes`
    - Object containing created routes. This could be inlined, but if you want to use the typesafe [`Link`](#link) component or the typesafe [`routeTo`](#routeto) function, you should save the route in a separate route, which you would ideally export.
- The `Router` component also takes children components, which will be displayed if no matching route is found. It is esentially used as the 404 section.
