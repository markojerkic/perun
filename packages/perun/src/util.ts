import {
  AsyncRouteParamsWithOptionalQueryParams,
  RouteParamsWithOptionalQueryParams,
} from "./types";
import {
  objectOutputType,
  ZodRawShape,
  ZodTypeAny,
} from "zod";
import { currentQueryParams, currentRoute } from "./router";

export const strOrNum = (s: string) => {
  let n = Number(s);
  if (isNaN(n)) {
    return s;
  }
  return n;
};

export const parseWindowQueryParams = () => {
  const params = new Map<string, string | (string | number)[] | number>();
  const entriesIterator = new URLSearchParams(window.location.search).entries();
  let entry = entriesIterator.next();
  while (!entry.done) {
    let values = params.get(entry.value[0]);
    const newEntry = strOrNum(entry.value[1]);

    if (!values) {
      values = newEntry;
    } else {
      if (Array.isArray(values)) {
        values = [...values, newEntry];
      } else {
        values = [values, newEntry];
      }
    }
    params.set(entry.value[0], values);
    entry = entriesIterator.next();
  }

  return Object.fromEntries(params.entries());
};

export const routeTo = <
  TRoute extends string,
  TValidType extends ZodRawShape,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>
>({
  routePattern,
  routeParams,
}: {
  routePattern: TRoute;
  routeParams: AsyncRouteParamsWithOptionalQueryParams<
    TRoute,
    TValidType,
    Catchall,
    Output
  >;
}) => {
  const pathWithoutLeadingSlash = routePattern
    .split("/")
    .filter((part) => part !== "")
    .map((part) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        part = part.replace("[", "").replace("]", "").replace("?", "");
        const partCast = part as TRoute;

        return (routeParams as any)[partCast];
      }
      return part;
    })
    .join("/");
  return {
    path: pathWithoutLeadingSlash.startsWith("/")
      ? pathWithoutLeadingSlash
      : `/${pathWithoutLeadingSlash}`,
    queryParams: routeParams.queryParams,
  };
};

export const routeObjectToPath = ({
  path,
  queryParams,
}: {
  path: string;
  queryParams: any;
}) => {
  let queryParamsString;
  if (queryParams) {
    queryParamsString = Object.keys(queryParams)
      .filter((key) => Object.hasOwn(queryParams, key))
      // @ts-ignore
      .map((key) => ({ key, value: queryParams[key] }))
      .map((entry) => {
        if (Array.isArray(entry.value)) {
          return entry.value.map((value) => `${entry.key}=${value}`).join("&");
        }
        return `${entry.key}=${entry.value}`;
      })
      .join("&");
  }
  return `${path}${
    queryParamsString && queryParamsString !== "" ? `?${queryParamsString}` : ""
  }`;
};

export const splitRoute = (route: string) =>
  route.split("/").filter((part) => !!part && part !== "");

const createPathParts = (route: string) => {
  const pathParts = splitRoute(route).map((pathPart) => ({
    name: pathPart.replace("[", "").replace("]", "").replace("?", ""),
    isVariable: pathPart.includes("[") && pathPart.includes("]"),
    isOptional: pathPart.includes("?"),
  }));
  return pathParts;
};

export const matches = <
  TRoute extends string,
  TValidType extends ZodRawShape,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>
>({
  currentRoute: route,
  routerPattern: testRoute,
}: {
  currentRoute: string;
  routerPattern: TRoute;
}):
  | RouteParamsWithOptionalQueryParams<
      TRoute,
      TValidType,
      Catchall,
      Output
    >
  | undefined => {
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
        if (
          routeParts.find((rp) => !rp.isVariable && !rp.isOptional)?.name ===
          currentRoutePart
        ) {
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
  return {
    ...pathParams,
    queryParams: currentQueryParams.value,
  } as RouteParamsWithOptionalQueryParams<
    TRoute,
    TValidType,
    Catchall,
    Output
  >;
};

export const changePath = ({
  path,
  queryParams,
}: {
  path: string;
  queryParams: any;
}) => {
  window.history.pushState(
    { manual: true },
    "",
    routeObjectToPath({ path, queryParams })
  );
  currentRoute.value = path;
  currentQueryParams.value = queryParams;
};
