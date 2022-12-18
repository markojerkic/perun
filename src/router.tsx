import { signal } from "@preact/signals";
import { useEffect, useMemo, useState } from "preact/hooks";
import { AsyncRoute, AsyncRouteOptions, Route, RouteOptions, RouteParams } from "./types/router";


const splitRoute = (route: string) => route.split('/').filter(part => !!part && part !== '');

const createPathParts = (route: string) => {
  const pathParts = splitRoute(route)
    .map(pathPart => ({
      name: pathPart.replace('[', '').replace(']', '').replace('?', ''),
      isVariable: pathPart.includes('[') && pathPart.includes(']'),
      isOptional: pathPart.includes('?')
    }))
  return pathParts;
}

const matches = <TRoute extends string>({ currentRoute: route, routerPattern: testRoute }: { currentRoute: string, routerPattern: TRoute }): RouteParams<TRoute> | undefined => {
  const routeParts = createPathParts(testRoute);

  const currentRouteParts = splitRoute(route);
  if (currentRouteParts.length > routeParts.length) {
    return undefined;
  }
  let pathParams: { [key: string]: string | undefined } = {};
  let routePart = routeParts.shift();
  while (routePart) {

    if (currentRouteParts.length <= 0 && !routePart.isOptional) {
      return undefined;
    }
    let currentRoutePart = currentRouteParts.shift();
    if (!currentRoutePart && !routePart.isOptional) {
      return undefined;
    }
    if (!routePart.isVariable) {
      if (currentRoutePart !== routePart.name) {
        return undefined;
      }
    } else if (routePart.isVariable) {
      if (routePart.isOptional) {
        if (routeParts.find(rp => !rp.isVariable && !rp.isOptional)?.name === currentRoutePart) {
          pathParams[routePart.name] = undefined;
          routePart = routeParts.shift();
        } else {
          pathParams[routePart.name] = currentRoutePart;
        }
      } else {
        pathParams[routePart.name] = currentRoutePart;
      }
    }
    routePart = routeParts.shift();
  }
  return pathParams as RouteParams<TRoute>;
}

const routeTo = <TRoute extends string>({ routePattern, routeParams }: { routePattern: TRoute, routeParams: RouteParams<string> }) => {
  const pathWithoutLeadingSlash = routePattern.split('/')
    .filter(part => part !== '')
    .map(part => {
      if (part.startsWith('[') && part.endsWith(']')) {
        part = part.replace('[', '').replace(']', '').replace('?', '');
        const partCast = part as TRoute;

        return (routeParams as any)[partCast];
      }
      return part;
    }).join('/');
  return pathWithoutLeadingSlash.startsWith('/') ? pathWithoutLeadingSlash : `/${pathWithoutLeadingSlash}`;
}

const changePath = (path: string) => {
  window.history.pushState({}, "", path);
  currentRoute.value = path;
}

export const createAsyncRoute = <TRoute extends string>({ routePattern, renderComponent }: AsyncRouteOptions<TRoute>) => {

  return ({
    isAsync: true,
    renderComponent,
    routePattern,
    routeTo: (routeParams: RouteParams<TRoute>) => changePath(routeTo({ routePattern, routeParams }))
  });
}

export const createRoute = <TRoute extends string>({ routePattern, renderComponent }: RouteOptions<TRoute>) => {

  return ({
    isAsync: false,
    renderComponent,
    routePattern,
    routeTo: (routeParams: RouteParams<TRoute>) => changePath(routeTo({ routePattern, routeParams }))
  });
}

const currentRoute = signal(window.location.pathname);

export const createRouter = <TRoutes extends { [routeName: string]: string }>(routes: { [TRoute in keyof TRoutes]: Route<TRoutes[TRoute]> | AsyncRoute<TRoutes[TRoute]> }) => {

  const sortedRoutes = useMemo(() => Object.keys(routes)
    .map(route => routes[route])
    .sort((a, b) => {
      const aPartsLength = a.routePattern.split('/').filter((p: string) => typeof p === 'string' && p !== '').length;
      const bPartsLength = b.routePattern.split('/').filter((p: string) => typeof p === 'string' && p !== '').length;
      if (aPartsLength === bPartsLength) {
        return 0;
      } else if (aPartsLength > bPartsLength) {
        return 1;
      }
      return -1;
    }),
    [currentRoute.value, routes]);

  const match = useMemo(() =>
    sortedRoutes
      .map(route => (
        {
          route: route.routePattern,
          match: matches({ currentRoute: currentRoute.value, routerPattern: route.routePattern }),
          renderComponent: route.renderComponent,
          isAsync: route.isAsync
        }
      ))
      .find(match => {
        return !!match && !!match.match
      }),
    [matches, currentRoute.value]);

  if (!match || !match?.match) {
    return { Router: () => <div>No matching routes</div>, routes };
  }

  // FIXME: Ts server goes crazy if directly passed
  const matchedProps = match.match; //useMemo(() => match.match, [match.match]);

  return {
    Router: () => {
      if (!match.isAsync) {
        return (
          <>
            {match.renderComponent(matchedProps)}
          </>
        )
      }
      const [asyncComponent, setAsyncComponent] = useState();
      useEffect(() => {
        const load = async () => {
          setAsyncComponent(await (match.renderComponent(matchedProps)));
        }
        load();
      }, []);
      if (!asyncComponent) {
        return <>Loading...</>
      }
      return (
        <>
          {asyncComponent}
        </>
      );
    },
    routes
  };
}

