import { JSXInternal } from "preact/src/jsx";
import {
  objectInputType,
  objectOutputType,
  UnknownKeysParam,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
} from "zod";
import { ComponentChildren } from "preact";

type IsParameter<Part> = Part extends `[${infer ParamName}]`
  ? ParamName
  : never;

type FilterOutOptional<TPart extends string> = TPart extends `${infer _TName}?`
  ? never
  : TPart;

type FilterInOptional<TPart extends string> = TPart extends `${infer _TName}?`
  ? TPart
  : never;

type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
  ? IsParameter<PartA> | FilteredParts<PartB>
  : IsParameter<Path>;
type DefaultType = string;

type RemoveOptionalTag<Key> = Key extends `${infer Name}?` ? Name : Key;

type NonOptionalParts<Path> = {
  [Key in FilterOutOptional<
    FilteredParts<Path>
  > as RemoveOptionalTag<Key>]: DefaultType;
};

type OptionalParts<Path> = {
  [Key in FilterInOptional<
    FilteredParts<Path>
  > as RemoveOptionalTag<Key>]: DefaultType;
};

export type RouteParams<TPath extends string> = NonOptionalParts<TPath> &
  Partial<OptionalParts<TPath>>;

export type RouteParamsWithOptionalQueryParams<
  TRoute extends string,
  TValidType extends ZodRawShape,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>
> = RouteParams<TRoute> & {
  queryParams?: Output;
};

export type RouteOptions<
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>,
  Input = objectInputType<TValidType, Catchall>
> = {
  routePattern: TRoute;
  renderComponent: (
    props: RouteParamsWithOptionalQueryParams<
      TRoute,
      TValidType,
      Catchall,
      Output
    >
  ) => JSXInternal.Element;
  searchParamsValidator: ZodObject<
    TValidType,
    UnknownKeys,
    Catchall,
    Output,
    Input
  >;
};

export type Link<
  TRoute extends string,
  TValidType extends ZodRawShape,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>
> = {
  Link: (
    routeParams: RouteParamsWithOptionalQueryParams<
      TRoute,
      TValidType,
      Catchall,
      Output
    > & {
      children?: ComponentChildren;
    }
  ) => JSXInternal.Element;
};

type TAsyncUtil = { isAsync: boolean };
export type Route<
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>,
  Input = objectInputType<TValidType, Catchall>
> = RouteOptions<TRoute, TValidType, UnknownKeys, Catchall, Output, Input> & {
  routeTo: (
    routeParams: RouteParamsWithOptionalQueryParams<
      TRoute,
      TValidType,
      Catchall,
      Output
    >
  ) => void;
} & TAsyncUtil &
  Link<TRoute, TValidType, Catchall, Output>;

export type AsyncRouteParams<TPath extends string> = NonOptionalParts<TPath> &
  Partial<OptionalParts<TPath>>;
export type AsyncRouteParamsWithOptionalQueryParams<
  TRoute extends string,
  TValidType extends ZodRawShape,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>
> = AsyncRouteParams<TRoute> & { queryParams?: Output };

export type AsyncRouteOptions<
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>,
  Input = objectInputType<TValidType, Catchall>
> = {
  routePattern: TRoute;
  renderComponent: (
    props: RouteParamsWithOptionalQueryParams<
      TRoute,
      TValidType,
      Catchall,
      Output
    >
  ) => Promise<JSXInternal.Element>;
  searchParamsValidator: ZodObject<
    TValidType,
    UnknownKeys,
    Catchall,
    Output,
    Input
  >;
};

export type AsyncRoute<
  TAsyncRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>,
  Input = objectInputType<TValidType, Catchall>
> = AsyncRouteOptions<
  TAsyncRoute,
  TValidType,
  UnknownKeys,
  Catchall,
  Output,
  Input
> & {
  routeTo: (routeParams: AsyncRouteParams<TAsyncRoute>) => void;
} & TAsyncUtil &
  Link<TAsyncRoute, TValidType, Catchall, Output>;
