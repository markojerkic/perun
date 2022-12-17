import { useMemo } from "preact/hooks";
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

const matches = <TRoute extends string>({ route, testRoute }: { route: string, testRoute: TRoute }): RouteParams<TRoute> | undefined => {
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
  path: Path;
  render: (props: RouteParams<Path>) => JSXInternal.Element
};

export const Router = <TRoute extends string>({ routes, currentRoute }: { routes: RouteOptions<TRoute>[], currentRoute: TRoute }) => {
  const match = useMemo(() => {
    return routes
      .map(route => ({ match: matches({ route: route.path, testRoute: currentRoute }), route }))
      .find(match => match.match);
  }, [currentRoute, routes]);

  if (!match?.match) {
    return <div>Nema odgovarajuće rute</div>
  }

  return (
    <>
      {match.route.render(match.match)}
    </>
  );
}
