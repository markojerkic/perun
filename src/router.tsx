import { useMemo, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";
import { RouteParams } from "./types/router";


type PathPart = {
  name: string,
  isVariable: boolean,
  isOptional: boolean
}

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

type RouteOptions<Path extends string> = {
  routerPattern: Path;
  renderComponent: (props: RouteParams<Path>) => JSXInternal.Element
};

export const Router = <TRoute extends string, TCurrentRoute extends string>({ routerPatterns, currentRoute }: { routerPatterns: RouteOptions<TRoute>[], currentRoute: TCurrentRoute }) => {
  const match = useMemo(() => {
    return routerPatterns
      .map(route => ({ match: matches({ currentRoute, routerPattern: route.routerPattern }), route }))
      .find(match => !!match && !!match.match);
  }, [currentRoute, routerPatterns]);

  if (!match?.match) {
    return ({ Router: () => <div>Nema odgovarajuće rute</div> })
  }

  return {
    Router: (
      <>
        {match.route.renderComponent(match.match)}
      </>
    )
  };
}

