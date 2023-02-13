import { signal } from "@preact/signals";
import {
  ComponentChildren,
  FunctionalComponent,
  FunctionComponent,
} from "preact";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import {
  objectInputType,
  objectOutputType,
  UnknownKeysParam,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
} from "zod";
import {
  AsyncRoute,
  AsyncRouteOptions,
  Route,
  RouteOptions,
  RouteParamsWithOptionalQueryParams,
} from "./types";
import {
  changePath,
  matches,
  parseWindowQueryParams,
  routeObjectToPath,
  routeTo,
} from "./util";

const Link = <
  TRoute extends string,
  TValidType extends ZodRawShape,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>
>({
  routePattern,
  routeParams,
  children,
}: {
  routePattern: TRoute;
  routeParams: RouteParamsWithOptionalQueryParams<
    TRoute,
    TValidType,
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
>): AsyncRoute<TRoute, TValidType, UnknownKeys, Catchall, Output, Input> => {
  return {
    isAsync: true,
    renderComponent,
    routePattern,
    searchParamsValidator,
    Link: (props) => (
      <Link
        children={props.children}
        routePattern={routePattern}
        routeParams={{ ...props, children: undefined }}
      />
    ),
    routeTo: (routeParams) =>
      changePath(routeTo({ routePattern, routeParams })),
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
}: RouteOptions<
  TRoute,
  TValidType,
  UnknownKeys,
  Catchall,
  Output,
  Input
>): Route<TRoute, TValidType, UnknownKeys, Catchall, Output, Input> => {
  return {
    isAsync: false,
    renderComponent,
    routePattern,
    searchParamsValidator,
    Link: (props) => (
      <Link
        children={props.children}
        routePattern={routePattern}
        routeParams={{ ...props, children: undefined }}
      />
    ),
    routeTo: (routeParams) =>
      changePath(routeTo({ routePattern, routeParams })),
  };
};

export const currentRoute = signal(window.location.pathname);
export const currentQueryParams = signal(parseWindowQueryParams());

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
    currentQueryParams.value = parseWindowQueryParams();
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
    const is = !!currentQueryParams.value && !!match.searchParamsValidator;

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
      props={{ ...match.match, queryParams: validatedSearchParams.params }}
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [props, Renderer]);

  if (!isAsync) {
    return (
      <>
        {/* @ts-ignore */}
        <Renderer {...props} />
      </>
    );
  }

  if (!AsyncComponent) {
    return <>Loading...</>;
  }

  return (
    <>
      <AsyncComponent {...props} />
    </>
  );
};
