import { RouteParameters } from "./types/router";

type RouteData<TRoute extends string = string> = {
  route: TRoute,
  params: RouteParameters<TRoute>
};


export const Router = () => {

  const createRoute = (routeDate: RouteData) => {
    return "bok";
  };

  return { createRoute };
}
