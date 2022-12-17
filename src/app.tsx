import { Router } from "./router";
import { useMemo, useState } from 'preact/hooks';


const TestComponent = ({ lastname, id }: { lastname?: string, id: string }) => {
  return (
    <>
      <p>Prezime: {lastname}</p>
      <div>Id: {id}</div>
    </>
  );
}

export function App() {

  const [currentRoute] = useState('/marko/jerkic');

  const t = useMemo(() => Router({
    currentRoute: currentRoute,
    routerPatterns: [
      {
        routerPattern: '/marko/[lastname]/[id?]',
        renderComponent: (params) => <TestComponent lastname={params.lastname} id={params.id ?? 'nema id'} />
      }
    ]
  }), [currentRoute]);

  return (
    <>
      {t.Router}
    </>
  )
}
