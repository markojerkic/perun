import { signal } from "@preact/signals";
import {
  ComponentChildren,
  FunctionalComponent,
  FunctionComponent,
} from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import {
  objectInputType,
  objectOutputType,
  UnknownKeysParam,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
} from "zod";
import {
  AsyncRouteOptions,
  AsyncRouteParamsWithOptionalQueryParams,
  RouteOptions,
  RouteParamsWithOptionalQueryParams,
} from "./types";

const splitRoute = (route: string) =>
  route.split("/").filter((part) => !!part && part !== "");

const createPathParts = (route: string) => {
  const pathParts = splitRoute(route).map((pathPart) => ({
    name: pathPart.replace("[", "").replace("]", "").replace("?", ""),
    isVariable: pathPart.includes("[") && pathPart.includes("]"),
    isOptional: pathPart.includes("?"),
  }));
  return pathParts;
};

const matches = <
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
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
      UnknownKeys,
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
    UnknownKeys,
    Catchall,
    Output
  >;
};

const routeTo = <
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
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
    UnknownKeys,
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

const routeObjectToPath = ({
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

const changePath = ({
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

export const createAsyncRoute = <
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>,
  Input = objectInputType<TValidType, Catchall>
>({
  routePattern,
  renderComponent,
  searchParamsValidator,
}: AsyncRouteOptions<
  TRoute,
  TValidType,
  UnknownKeys,
  Catchall,
  Output,
  Input
>) => {
  return {
    isAsync: true,
    renderComponent,
    routePattern,
    searchParamsValidator,
    Link: ({
      routeParams,
      children,
    }: {
      routeParams: RouteParamsWithOptionalQueryParams<
        TRoute,
        TValidType,
        UnknownKeys,
        Catchall,
        Output
      >;
      children?: ComponentChildren;
    }) => {
      const routeObject = useMemo(
        () => routeTo({ routePattern, routeParams }),
        [routeParams]
      );

      const href = useMemo(() => routeObjectToPath(routeObject), [routeObject]);
      const handleClick = useCallback(
        (e: Event) => {
          e.preventDefault();
          changePath(routeObject);
        },
        [routeObject]
      );

      return (
        <a href={href} onClick={handleClick}>
          <div>{children}</div>
        </a>
      );
    },
    routeTo: (
      routeParams: AsyncRouteParamsWithOptionalQueryParams<
        TRoute,
        TValidType,
        UnknownKeys,
        Catchall,
        Output
      >
    ) => changePath(routeTo({ routePattern, routeParams })),
  };
};

export const createRoute = <
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>,
  Input = objectInputType<TValidType, Catchall>
>({
  searchParamsValidator,
  routePattern,
  renderComponent,
}: RouteOptions<TRoute, TValidType, UnknownKeys, Catchall, Output, Input>) => {
  return {
    isAsync: false,
    renderComponent,
    routePattern,
    Link: ({
      routeParams,
      children,
    }: {
      routeParams: RouteParamsWithOptionalQueryParams<
        TRoute,
        TValidType,
        UnknownKeys,
        Catchall,
        Output
      >;
      children?: ComponentChildren;
    }) => {
      const routeObject = useMemo(
        () => routeTo({ routePattern, routeParams }),
        [routeParams]
      );

      const href = useMemo(() => routeObjectToPath(routeObject), [routeObject]);
      const handleClick = useCallback(
        (e: Event) => {
          e.preventDefault();
          changePath(routeObject);
        },
        [routeObject]
      );

      return (
        <a href={href} onClick={handleClick}>
          <div>{children}</div>
        </a>
      );
    },
    searchParamsValidator,
    routeTo: (
      routeParams: RouteParamsWithOptionalQueryParams<
        TRoute,
        TValidType,
        UnknownKeys,
        Catchall,
        Output
      >
    ) => changePath(routeTo({ routePattern, routeParams })),
  };
};

const strOrNum = (s: string) => {
  let n = Number(s);
  if (isNaN(n)) {
    return s;
  }
  return n;
};

const parseWindowQueryParams = () => {
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

const currentRoute = signal(window.location.pathname);
const currentQueryParams = signal(parseWindowQueryParams());

type RouteCreator<TRoute extends string> = ReturnType<
  typeof createRoute<TRoute, any, any, any, any, any>
>;
type AsyncRouteCreator<TRoute extends string> = ReturnType<
  typeof createAsyncRoute<TRoute, any, any, any, any, any>
>;

export type TRouteCreator = RouteCreator<any> | AsyncRouteCreator<any>;

type Router = {
  routes: { [routeName: string]: TRouteCreator | any };
};

export const Router: FunctionComponent<Router> = ({ routes, children }) => {
  const sortedRoutes = useMemo(
    () =>
      Object.keys(routes)
        .map((route) => routes[route])
        .sort((a, b) => {
          const aPartsLength = a.routePattern
            .split("/")
            .filter((p: string) => typeof p === "string" && p !== "").length;
          const bPartsLength = b.routePattern
            .split("/")
            .filter((p: string) => typeof p === "string" && p !== "").length;
          if (aPartsLength === bPartsLength) {
            return 0;
          } else if (aPartsLength > bPartsLength) {
            return 1;
          }
          return -1;
        }),
    [currentRoute.value, currentQueryParams.value, routes]
  );

  const updateCurrentLocation = useCallback(() => {
    currentRoute.value = window.location.pathname;
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", updateCurrentLocation);
    return () => window.removeEventListener("popstate", updateCurrentLocation);
  }, [updateCurrentLocation, currentRoute.value]);

  const match = useMemo(
    () =>
      sortedRoutes
        .map((route) => ({
          route: route.routePattern,
          match: matches({
            currentRoute: currentRoute.value,
            routerPattern: route.routePattern,
          }),
          renderComponent: route.renderComponent,
          searchParamsValidator: route.searchParamsValidator,
          isAsync: route.isAsync,
        }))
        .find((match) => {
          return !!match && !!match.match;
        }),
    [sortedRoutes, matches, currentQueryParams.value, currentRoute.value]
  );

  if (!match || !match?.match) {
    return <>{children}</>;
  }

  const validatedSearchParams = useMemo(() => {
    const is =
      currentQueryParams.value &&
      !Object.is(currentQueryParams.value, {}) &&
      match.searchParamsValidator;
    if (!is) {
      return { params: undefined, success: false };
    }

    const params = (match.searchParamsValidator as ZodObject<any>).safeParse(
      currentQueryParams.value
    );

    return {
      success: params.success,
      // @ts-ignore
      params: params.data,
    };
  }, [currentQueryParams.value, match]);

  if (!validatedSearchParams.success) {
    return (
      <div>
        Query params are not valid: {JSON.stringify(currentQueryParams.value)}
      </div>
    );
  }

  return (
    <RouteRenderer
      props={{...match.match, queryParams: validatedSearchParams.params}}
      isAsync={match.isAsync}
      Renderer={match.renderComponent}
    />
  );
};

const RouteRenderer = <T,>({
  props,
  Renderer,
  isAsync,
}: {
  Renderer: (p: T) => Promise<FunctionComponent<T>> | FunctionalComponent<T>;
  props: T;
  isAsync: boolean;
}) => {
  const [AsyncComponent, setAsyncComponent] =
    useState<FunctionalComponent<any>>();
  useEffect(() => {
    const load = async () => {
      setAsyncComponent(await Renderer(props));
    };
    if (isAsync) {
      load();
    }
  }, [Renderer, isAsync, props]);

  if (!isAsync) {
    // @ts-ignore
    return <Renderer {...props} />;
  }

  if (!AsyncComponent) {
    return <>Loading...</>;
  }

  return <AsyncComponent {...props} />;
};
