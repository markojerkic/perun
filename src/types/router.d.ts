
type Split<S extends string, D extends string> = S extends `${infer A}${D}${infer B}` ? [A, ...Split<B, D>] : [S]
type Without<T, U> = T extends [infer Head, ...infer Tail]
  ? [
    ...(Head extends (U extends unknown[] ? U[number] : U) ? [] : [Head]),
    ...Without<Tail, U>
  ]
  : [];

type FilterStartsWith<TList extends string[], TToken extends string, Arr extends string[] = []> =
  TList extends [infer TEntry, ...infer TRestEntries]
  ? TRestEntries extends string[]
  ? TEntry extends `${TToken}${infer TVariableName}`
  ? FilterStartsWith<TRestEntries, TToken, [...Arr, TVariableName]>
  : FilterStartsWith<TRestEntries, TToken, Arr>
  : Arr
  : Arr;

type StartsWith<T extends string, F extends string> = T extends `${F}${infer F}` ? F : never;


type Unionize<TTokens extends any[], TAcc extends any = ''> = TTokens extends [infer TToken, ...infer TRest]
  ? TRest extends any[]
  ? Unionize<TRest, TAcc | TToken>
  : TAcc | TToken
  : TAcc;

export type RouteParameters<TPath extends string> = Record<Exclude<Unionize<FilterStartsWith<Without<Split<TPath, '/'>, "">, ':'>>, ''>, string>;
