import { JSXInternal } from "preact/src/jsx";
import { RouteParams } from "./types/router";

type RouteOptions<Path extends string> = {
  path: Path;
  render: (props: RouteParams<Path>) => JSXInternal.Element
};

const createParams = <TPath extends string>(params: {path: TPath}): RouteParams<TPath> => {
  return {
    id: 'ovo je indetifikator',
    lang: 'en'
  } as RouteParams<TPath>
}

export const Route = <Path extends string>({ path, render }: RouteOptions<Path>) => {
  console.log(render);
  const params = createParams({path}) satisfies RouteParams<Path>;
  return (
    <>
      {render(params)}
    </>
  );
}
