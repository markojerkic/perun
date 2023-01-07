import { UnknownKeysParam, ZodAny, ZodObject } from "zod";

type IsParameter<Part> = Part extends `[${infer ParamName}]`
  ? ParamName
  : never;

type FilterOutOptional<TPart extends string> = TPart extends `${infer TName}?`
  ? never
  : TPart;

type FilterInOptional<TPart extends string> = TPart extends `${infer TName}?`
  ? TPart
  : never;

type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
  ? IsParameter<PartA> | FilteredParts<PartB>
  : IsParameter<Path>;
type DefaultType = string;
type ParamValue<Key> = Key extends `${infer Anything}?`
  ? DefaultType | null
  : DefaultType;
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
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>
> = RouteParams<TRoute> & { queryParams?: Output };

export type Link<
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<TValidType, Catchall>
> = FunctionComponent<{
  props: RouteParamsWithOptionalQueryParams<
    TRoute,
    TValidType,
    UnknownKeys,
    Catchall,
    Output
  >;
}>;

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
      UnknownKeys,
      Catchall,
      Output
    >
  ) => JSXInternal.Element;
  searchParamsValidator?: ZodObject<
    TValidType,
    UnknownKeys,
    Catchall,
    Output,
    Input
  >;
};

type TAsyncUtil = { isAsync: boolean };
export type Route<TRoute extends string> = RouteOptions<TRoute> & {
  routeTo: (routeParams: RouteParams<TRoute>) => void;
} & TAsyncUtil;

export type AsyncRouteParams<TPath extends string> = NonOptionalParts<TPath> &
  Partial<OptionalParts<TPath>>;
export type AsyncRouteParamsWithOptionalQueryParams<
  TRoute extends string,
  TValidType extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = "strip",
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
      UnknownKeys,
      Catchall,
      Output
    >
  ) => Promise<JSXInternal.Element>;
  searchParamsValidator?: ZodObject<
    TValidType,
    UnknownKeys,
    Catchall,
    Output,
    Input
  >;
};

export type AsyncRoute<TAsyncRoute extends string> =
  AsyncRouteOptions<TAsyncRoute> & {
    routeTo: (routeParams: AsyncRouteParams<TAsyncRoute>) => void;
  } & TAsyncUtil;
