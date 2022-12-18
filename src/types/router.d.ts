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
  [Key in FilterOutOptional<FilteredParts<Path>> as RemoveOptionalTag<Key>]: DefaultType;
};

type OptionalParts<Path> = {
  [Key in FilterInOptional<FilteredParts<Path>> as RemoveOptionalTag<Key>]: DefaultType;
};


export type RouteParams<TPath extends string> = NonOptionalParts<TPath> & Partial<OptionalParts<TPath>>;

export type RouteOptions<Path extends string> = {
  routePattern: Path;
  renderComponent: (props: RouteParams<Path>) => JSXInternal.Element
};

export type Route<TRoute extends string> = RouteOptions<TRoute> & { routeTo: (routeParams: RouteParams<TRoute>) => void; };

